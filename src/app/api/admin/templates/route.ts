import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/adminAuth';
import { EXPECTED_SCHEMA, DEFAULT_MASTER_SHEET_ID } from '../../../../../scripts/validateMasterSheet';

export interface ColumnDefinition {
  letter: string;
  name: string;
  type?: string;
  required: boolean;
  description?: string;
}

export interface TabTemplateDefinition {
  tabName: string;
  description: string;
  columns: ColumnDefinition[];
  sampleRecord?: Record<string, any>;
  frozenRowCount: number;
}

export interface MasterTemplateDossier {
  productCode: 'SHEET2VOW' | 'SHEET2VAULT';
  productName: string;
  status: 'production' | 'development';
  tagline: string;
  goldenMasterSheetId: string;
  webViewLink: string;
  totalTabs: number;
  totalColumns: number;
  tabs: TabTemplateDefinition[];
}

function toColumnLetter(idx: number): string {
  let letter = '';
  let temp = idx;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Tab definitions and column specifications for Sheet2Vow (Production Golden Master)
 */
const VOW_TAB_DESCRIPTIONS: Record<string, string> = {
  GUESTS: 'Relational guest registry, RSVP tracking, table assignments, and dietary requirements.',
  BUDGET: 'High-level financial categories, target allocations, and total expenditure rollups.',
  EXPENSES: 'Itemized transaction ledger with vendor linkage, payment dates, and contributor tracking.',
  SCHEDULE: 'Day-of wedding timeline with start/end blocks, vendor responsibilities, and locations.',
  VENDORS: 'Vendor contract directory, contact details, payment milestone schedules, and balance owing.',
  'TO DO': 'Kanban planning task list with priority badges, assignment routing, and target milestones.',
  MUSIC: 'Curated ceremony and reception playlist with request tracking and DJ approval flags.',
  PHOTOS: 'Shot list and VIP photo grouping checklist for the wedding photographer.',
  'GIFT REGISTRY': 'Presents and envelope cash tracker with thank-you card completion tracking.',
  TABLES: 'Reception floorplan tables, geometric shape rules, and seated capacity caps.',
};

/**
 * Tab definitions and column specifications for Sheet2Vault (In Development Golden Master)
 */
const VAULT_SCHEMA: Record<string, string[]> = {
  VAULT_ITEMS: [
    'Item ID', 'Item Name', 'Category', 'Room', 'Brand / Make',
    'Model Number', 'Serial Number', 'Purchase Date', 'Purchase Price',
    'Est Replacement Cost', 'Condition', 'Readiness Score', 'Receipt URL',
    'Photo URL', 'Warranty Expiry', 'Notes', 'Status'
  ],
  VAULT_SETTINGS: [
    'Setting Key', 'Setting Value', 'Description', 'Last Updated'
  ],
  VAULT_CLAIMS: [
    'Claim ID', 'Incident Date', 'Incident Type', 'Carrier Name',
    'Policy Number', 'Deductible', 'Claim Status', 'Total Claimed',
    'Total Approved', 'Adjuster Name', 'Adjuster Email', 'Notes'
  ],
};

const VAULT_TAB_DESCRIPTIONS: Record<string, string> = {
  VAULT_ITEMS: 'Itemized personal valuables inventory, serial numbers, appraisals, and warranty tracking.',
  VAULT_SETTINGS: 'Residence configuration, insurance policy limits, category sublimits, and deductibles.',
  VAULT_CLAIMS: 'Insurance claim incident log, adjuster communications, and payout reconciliation.',
};

export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    // 1. Build Sheet2Vow Master Dossier
    const vowTabs: TabTemplateDefinition[] = Object.entries(EXPECTED_SCHEMA).map(([tabName, headers]) => ({
      tabName,
      description: VOW_TAB_DESCRIPTIONS[tabName] || `${tabName} coordination canvas`,
      frozenRowCount: 1,
      columns: headers.map((header, idx) => ({
        letter: `Col ${toColumnLetter(idx)}`,
        name: header,
        required: true,
      })),
    }));

    const vowTotalCols = vowTabs.reduce((acc, t) => acc + t.columns.length, 0);

    const vowMaster: MasterTemplateDossier = {
      productCode: 'SHEET2VOW',
      productName: 'Sheet2Vow',
      status: 'production',
      tagline: 'Digital Wedding Planning Canvas & Coordinator Suite',
      goldenMasterSheetId: process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID,
      webViewLink: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID}/edit`,
      totalTabs: vowTabs.length,
      totalColumns: vowTotalCols,
      tabs: vowTabs,
    };

    // 2. Build Sheet2Vault Master Dossier (In Development)
    const vaultTabs: TabTemplateDefinition[] = Object.entries(VAULT_SCHEMA).map(([tabName, headers]) => ({
      tabName,
      description: VAULT_TAB_DESCRIPTIONS[tabName] || `${tabName} ledger canvas`,
      frozenRowCount: 1,
      columns: headers.map((header, idx) => ({
        letter: `Col ${toColumnLetter(idx)}`,
        name: header,
        required: true,
      })),
    }));

    const vaultTotalCols = vaultTabs.reduce((acc, t) => acc + t.columns.length, 0);

    const vaultMaster: MasterTemplateDossier = {
      productCode: 'SHEET2VAULT',
      productName: 'Sheet2Vault',
      status: 'development',
      tagline: 'Home Valuables, Inventory & Insurance Claim Dossier',
      goldenMasterSheetId: 'DEV_TEMPLATE_GENERATED',
      webViewLink: 'https://docs.google.com/spreadsheets/u/0/',
      totalTabs: vaultTabs.length,
      totalColumns: vaultTotalCols,
      tabs: vaultTabs,
    };

    return NextResponse.json({
      success: true,
      templates: [vowMaster, vaultMaster],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to load master template schemas.' },
      { status: 500 }
    );
  }
}
