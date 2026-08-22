import { google } from 'googleapis';
import readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Define expected schema contract for all Sheet2Vow tabs
export const EXPECTED_SCHEMA: Record<string, string[]> = {
  GUESTS: [
    'Guest ID', 'First Name', 'Last Name', 'Party Group', 'Age Category', 
    'RSVP Status', 'Dietary Restrictions', 'Meal Choice', 'Reception Table', 'Ceremony Seating', 
    'Email Address', 'Phone Number', 'Mailing Address', 'Thanked'
  ],
  BUDGET: [
    'Item ID', 'Category', 'Vendor Name', 'Estimated Cost', 
    'Actual Cost', 'Amount Paid', 'Due Date', 'Payment Status'
  ],
  EXPENSES: [
    'Item ID', 'Description', 'Category', 'Actual Cost', 
    'Amount Paid', 'Purchase Date', 'Notes'
  ],
  SCHEDULE: [
    'Start Time', 'End Time', 'Event Moment', 'Location', 
    'Responsibility / Vendors', 'Notes / Details'
  ],
  VENDORS: [
    'Vendor ID', 'Vendor Name', 'Category', 'Contact Name', 
    'Email Address', 'Phone Number', 'Total Contract Value', 
    'Deposit Paid', 'Balance Owing', 'Payment Due Date', 'Contract Link', 'Staff Meals Required'
  ],
  'TO DO': [
    'Task ID', 'Task Name', 'Status', 'Category', 
    'Priority', 'Assigned To', 'Due Date', 'Notes / Links'
  ],
  MUSIC: [
    'Song ID', 'Song Title', 'Artist', 'Occasion', 
    'Play Status', 'Requested By', 'Notes', 'Approval Status', 'Link'
  ],
  PHOTOS: [
    'Shot ID', 'Description', 'Location', 'Shot Time', 
    'Included People', 'Status', 'Priority', 'Notes'
  ],
  'GIFT REGISTRY': [
    'Item ID', 'Giver / From', 'Gift Description / Name', 'Category / Store', 
    'Estimated Value / Cash Amount', 'Received Date', 'Thank You Sent', 'Sent Date', 'Notes'
  ],
  TABLES: [
    'Table ID', 'Table Name', 'Shape', 'Capacity'
  ]
};

export const DEFAULT_MASTER_SHEET_ID = '1h_RGirRXv_4zXjqvhJnRlSJ-OnqxPeK9f3M_Eep4RcI';

export interface AuditTabReport {
  tabName: string;
  tabExists: boolean;
  actualHeaders: string[];
  expectedHeaders: string[];
  missingHeaders: string[];
  extraHeaders: string[];
  matchedHeaders: string[];
  orderMatches: boolean;
}

export interface AuditReport {
  spreadsheetId: string;
  timestamp: string;
  missingTabs: string[];
  tabReports: AuditTabReport[];
  totalMissingHeadersCount: number;
  totalExtraHeadersCount: number;
  isFullyCompliant: boolean;
}

/**
 * Loads environment variables from .env.local if available
 */
function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

/**
 * Connects to Google Sheets API using token or Service Account
 */
function getGoogleAuthClient(accessToken?: string) {
  loadLocalEnv();
  const oauth2Client = new google.auth.OAuth2();
  const token = accessToken || process.env.GOOGLE_ACCESS_TOKEN;

  if (token) {
    oauth2Client.setCredentials({ access_token: token });
    return oauth2Client;
  }

  if (
    process.env.GOOGLE_CLIENT_EMAIL &&
    (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY_BASE64)
  ) {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    if (process.env.GOOGLE_PRIVATE_KEY_BASE64) {
      privateKey = Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    return new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ]
    });
  }

  return null;
}

/**
 * Fetches actual headers using public export fetch or Google Sheets API
 */
export async function auditMasterSpreadsheet(
  customSheetId?: string,
  accessToken?: string
): Promise<AuditReport> {
  loadLocalEnv();
  const spreadsheetId = customSheetId || process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID;
  const auth = getGoogleAuthClient(accessToken);
  const actualSheetData: Record<string, string[]> = {};

  if (auth) {
    // 1. Authenticated Google Sheets API Inspection
    const sheets = google.sheets({ version: 'v4', auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitles = (meta.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);

    const ranges = sheetTitles.map(title => `'${title}'!1:1`);
    const valRes = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    (valRes.data.valueRanges || []).forEach((rangeObj, idx) => {
      const title = sheetTitles[idx];
      const row1 = (rangeObj.values && rangeObj.values[0]) ? rangeObj.values[0].map(v => String(v).trim()) : [];
      actualSheetData[title] = row1;
    });
  } else {
    // 2. Unauthenticated Public CSV Export Inspection
    for (const tabName of Object.keys(EXPECTED_SCHEMA)) {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
        const res = await fetch(csvUrl, { headers: { 'User-Agent': 'Sheet2Suite-Validator/1.0' } });
        if (res.ok) {
          const text = await res.text();
          const firstLine = text.split('\n')[0] || '';
          // Parse CSV header line
          const headers = firstLine
            .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
            .map(h => h.replace(/^"|"$/g, '').trim())
            .filter(Boolean);
          actualSheetData[tabName] = headers;
        }
      } catch (e) {
        console.warn(`[Validator] Could not fetch public CSV for tab: ${tabName}`);
      }
    }
  }

  const missingTabs: string[] = [];
  const tabReports: AuditTabReport[] = [];
  let totalMissingCount = 0;
  let totalExtraCount = 0;

  for (const [tabName, expectedHeaders] of Object.entries(EXPECTED_SCHEMA)) {
    const actualHeaders = actualSheetData[tabName] || [];
    const tabExists = Boolean(actualSheetData[tabName]);

    if (!tabExists) {
      missingTabs.push(tabName);
    }

    const missingHeaders = expectedHeaders.filter(h => !actualHeaders.includes(h));
    const extraHeaders = actualHeaders.filter(h => !expectedHeaders.includes(h));
    const matchedHeaders = expectedHeaders.filter(h => actualHeaders.includes(h));
    const orderMatches = JSON.stringify(expectedHeaders) === JSON.stringify(actualHeaders);

    totalMissingCount += missingHeaders.length;
    totalExtraCount += extraHeaders.length;

    tabReports.push({
      tabName,
      tabExists,
      actualHeaders,
      expectedHeaders,
      missingHeaders,
      extraHeaders,
      matchedHeaders,
      orderMatches
    });
  }

  return {
    spreadsheetId,
    timestamp: new Date().toISOString(),
    missingTabs,
    tabReports,
    totalMissingHeadersCount: totalMissingCount,
    totalExtraHeadersCount: totalExtraCount,
    isFullyCompliant: missingTabs.length === 0 && totalMissingCount === 0
  };
}

/**
 * Auto-repairs missing headers in Google Sheet by appending them to Row 1
 */
export async function repairGoogleSheetHeaders(
  report: AuditReport,
  accessToken?: string
): Promise<{ success: boolean; repairedTabs: string[]; error?: string }> {
  const auth = getGoogleAuthClient(accessToken);
  if (!auth) {
    return {
      success: false,
      repairedTabs: [],
      error: 'Google Authentication required to repair Google Sheet. Set GOOGLE_ACCESS_TOKEN or service account credentials in .env.local.'
    };
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const repairedTabs: string[] = [];

  for (const tabReport of report.tabReports) {
    if (tabReport.missingHeaders.length > 0) {
      const updatedRow1 = [...tabReport.actualHeaders, ...tabReport.missingHeaders];
      const range = `'${tabReport.tabName}'!A1:${getColumnLetter(updatedRow1.length)}1`;

      await sheets.spreadsheets.values.update({
        spreadsheetId: report.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRow1]
        }
      });
      repairedTabs.push(tabReport.tabName);
    }
  }

  return { success: true, repairedTabs };
}

function getColumnLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter || 'A';
}

/**
 * CLI Entry point with interactive prompts
 */
async function runCli() {
  console.log('\n🔍 ========================================================');
  console.log('   SHEET2VOW MASTER SPREADSHEET SCHEMA VALIDATOR');
  console.log('========================================================\n');

  const args = process.argv.slice(2);
  const targetSheetId = args.find(a => !a.startsWith('--')) || process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID;
  const isFixSheet = args.includes('--fix-sheet');
  const isDryRun = args.includes('--dry-run');

  console.log(`Checking Spreadsheet ID: ${targetSheetId}...\n`);

  try {
    const report = await auditMasterSpreadsheet(targetSheetId);

    console.log('--------------------------------------------------------');
    console.log(`AUDIT RESULTS FOR SPREADSHEET [${report.spreadsheetId}]`);
    console.log('--------------------------------------------------------');

    for (const tr of report.tabReports) {
      console.log(`\n📄 TAB: [${tr.tabName}] (${tr.actualHeaders.length} columns)`);
      if (!tr.tabExists) {
        console.log(`   ❌ TAB MISSING FROM SPREADSHEET`);
        continue;
      }

      if (tr.missingHeaders.length === 0 && tr.extraHeaders.length === 0) {
        console.log(`   ✅ 100% Schema Compliant (${tr.matchedHeaders.length}/${tr.expectedHeaders.length} headers match)`);
      } else {
        if (tr.missingHeaders.length > 0) {
          console.log(`   🔴 MISSING HEADERS (${tr.missingHeaders.length}):`);
          tr.missingHeaders.forEach(h => console.log(`      - ${h}`));
        }
        if (tr.extraHeaders.length > 0) {
          console.log(`   🟡 EXTRA UNMAPPED HEADERS (${tr.extraHeaders.length}):`);
          tr.extraHeaders.forEach(h => console.log(`      + ${h}`));
        }
      }
    }

    console.log('\n========================================================');
    console.log(`SUMMARY: ${report.isFullyCompliant ? '✅ MASTER SHEET IS FULLY COMPLIANT' : '⚠️ DISCREPANCIES FOUND'}`);
    console.log(`- Missing Tabs: ${report.missingTabs.length}`);
    console.log(`- Total Missing Headers: ${report.totalMissingHeadersCount}`);
    console.log(`- Total Extra Headers: ${report.totalExtraHeadersCount}`);
    console.log('========================================================\n');

    if (report.isFullyCompliant || isDryRun) {
      console.log('Audit complete. No changes needed.\n');
      process.exit(0);
    }

    if (isFixSheet) {
      console.log('Executing automated sheet repair (--fix-sheet flag passed)...');
      const res = await repairGoogleSheetHeaders(report);
      if (res.success) {
        console.log(`✅ Repaired ${res.repairedTabs.length} tabs on Google Sheet! (${res.repairedTabs.join(', ')})\n`);
      } else {
        console.log(`❌ Auto-repair failed: ${res.error}\n`);
      }
      process.exit(0);
    }

    // Interactive Prompt
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log('What would you like to do?');
    console.log('1) 🛠️ Auto-repair Google Sheet (Append missing headers to Row 1 on Google Drive)');
    console.log('2) 📄 Export JSON discrepancy report to disk');
    console.log('3) 🚪 Exit without making changes\n');

    rl.question('Select option (1-3): ', async (answer) => {
      const choice = answer.trim();
      if (choice === '1') {
        console.log('\nRepairing Google Sheet...');
        const res = await repairGoogleSheetHeaders(report);
        if (res.success) {
          console.log(`✅ Successfully updated ${res.repairedTabs.length} tabs in Google Sheet! (${res.repairedTabs.join(', ')})`);
        } else {
          console.log(`❌ Repair failed: ${res.error}`);
        }
      } else if (choice === '2') {
        const outPath = path.join(process.cwd(), 'schema_audit_report.json');
        fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Saved audit report to: ${outPath}`);
      } else {
        console.log('\nExiting without changes.');
      }
      rl.close();
      process.exit(0);
    });

  } catch (err: any) {
    console.error('❌ Validation script error:', err?.message || err);
    process.exit(1);
  }
}

// Execute if run directly from command line
if (require.main === module || process.argv[1]?.includes('validateMasterSheet')) {
  runCli();
}
