import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { DEFAULT_MASTER_SHEET_ID, getGoogleAuth } from '@/lib/sheets/client';
import { CellGuard } from '@/lib/core/CellGuard';
import { generateMasterXlsxBuffer } from '@/lib/core/templates/xlsxGenerator';
import { getMasterSpreadsheetXlsxBuffer } from '@/lib/sheets/masterTemplateExporter';
import { applyDropdownValidations } from '@/lib/sheets/dropdownValidator';

/**
 * Helper to find or create a folder in Google Drive using drive.file scope.
 */
async function getOrCreateFolder(drive: any, folderName: string, parentId?: string): Promise<string> {
  const queryParts = [
    `name = '${folderName.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
  ];

  if (parentId) {
    queryParts.push(`'${parentId}' in parents`);
  }

  const searchRes = await drive.files.list({
    q: queryParts.join(' and '),
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (searchRes.data.files && searchRes.data.files.length > 0) {
    return searchRes.data.files[0].id;
  }

  // Create folder if it doesn't exist
  const folderMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId) {
    folderMetadata.parents = [parentId];
  }

  const createRes = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id, name',
  });

  return createRes.data.id;
}

/**
 * POST /api/provision
 * Provisions a personal Google Drive folder structure ("My Drive/Sheet2Suite/Sheet2Vow")
 * and duplicates the Master Spreadsheet template into the user's Drive.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken, coupleName, productName = 'Sheet2Vow', budget, partner1, partner2 } = body;
    const initialBudget = Number(budget) || 35000;

    // Use passed token or cookie fallback
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value;

    const token = accessToken || bearerToken || cookieToken || process.env.GOOGLE_ACCESS_TOKEN;

    if (!token && !process.env.GOOGLE_CLIENT_EMAIL) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Google access token is required to provision Google Drive files.',
        },
        { status: 401 }
      );
    }

    const auth = getGoogleAuth(token);
    const drive = google.drive({ version: 'v3', auth });

    // Step 1: Create or locate root folder "Sheet2Suite"
    const rootFolderId = await getOrCreateFolder(drive, 'Sheet2Suite');

    // Step 2: Create product subfolder e.g. "Sheet2Suite / Sheet2Vow"
    const productFolderId = await getOrCreateFolder(drive, productName, rootFolderId);

    // Step 3: Copy Master Template Spreadsheet or Create Fresh Template
    const masterSheetId = process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID;
    const sanitizedCoupleName = CellGuard.sanitizeCellValue(coupleName || 'Alex & Sam');
    const documentTitle = coupleName
      ? (coupleName.toLowerCase().includes('wedding') ? `${coupleName} Database` : `${coupleName} Wedding Database`)
      : 'Sheet2Vow Wedding Planner Database';

    let newSpreadsheetId: string | undefined;
    let webViewLink: string | undefined;

    try {
      const copyRes = await drive.files.copy({
        fileId: masterSheetId,
        requestBody: {
          name: documentTitle,
          parents: [productFolderId],
        },
        fields: 'id, name, webViewLink, webContentLink',
      });

      newSpreadsheetId = copyRes.data.id || undefined;
      webViewLink = copyRes.data.webViewLink || undefined;
    } catch (copyErr: any) {
      console.warn('Direct master template copy blocked (drive.file scope / 404/403). Executing Tier 2 Master Template Export & Conversion:', copyErr?.message);

      try {
        // Tier 2: Fetch live Master Google Sheet binary export buffer & convert to native Google Sheet in User's Drive
        const { buffer: xlsxBuffer, source } = await getMasterSpreadsheetXlsxBuffer(sanitizedCoupleName, masterSheetId);
        console.log(`[Provisioning] Cloned master template via source: ${source}, bufferSize: ${xlsxBuffer.byteLength} bytes`);
        const stream = Readable.from(xlsxBuffer);

        const uploadRes = await drive.files.create({
          requestBody: {
            name: documentTitle,
            parents: [productFolderId],
            mimeType: 'application/vnd.google-apps.spreadsheet', // Auto-convert .xlsx to Google Sheet
          },
          media: {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            body: stream,
          },
          fields: 'id, name, webViewLink',
        });

        newSpreadsheetId = uploadRes.data.id || undefined;
        webViewLink = uploadRes.data.webViewLink || undefined;
      } catch (xlsxErr: any) {
        console.warn('Tier 2 Master Export upload failed. Executing Tier 3 fresh Sheets API fallback:', xlsxErr?.message);

        // Tier 3: Create fresh spreadsheet via Sheets API
        const sheets = google.sheets({ version: 'v4', auth });
        const createRes = await sheets.spreadsheets.create({
          requestBody: {
            properties: { title: documentTitle },
            sheets: [
              { properties: { title: 'Dashboard' } },
              { properties: { title: 'Guest List' } },
              { properties: { title: 'Budget Ledger' } },
              { properties: { title: 'Day-Of-Schedule' } },
              { properties: { title: 'Vendors' } },
              { properties: { title: 'To-Do List' } },
              { properties: { title: 'MUSIC' } },
              { properties: { title: 'PHOTOS' } },
              { properties: { title: 'GIFT REGISTRY' } },
              { properties: { title: 'Settings' } },
            ],
          },
        });

        newSpreadsheetId = createRes.data.spreadsheetId || undefined;
        webViewLink = createRes.data.spreadsheetUrl || (newSpreadsheetId ? `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit` : undefined);
      }
    }

    if (newSpreadsheetId) {
      try {
        const file = await drive.files.get({ fileId: newSpreadsheetId, fields: 'parents' });
        const parents = file.data.parents || [];
        if (!parents.includes(productFolderId)) {
          await drive.files.update({
            fileId: newSpreadsheetId,
            addParents: productFolderId,
            removeParents: parents.join(','),
            fields: 'id, parents',
          });
        }
      } catch (mErr) {
        console.warn('Could not update parent folder for provisioned file:', mErr);
      }
    }

    // Step 4: Inject couple title and configuration into Dashboard & Settings, and apply dropdown validations
    if (newSpreadsheetId && token) {
      try {
        const sheets = google.sheets({ version: 'v4', auth });
        const metaRes = await sheets.spreadsheets.get({ spreadsheetId: newSpreadsheetId });
        const availableTitles = (metaRes.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);
        const hasDash = availableTitles.some(t => t.toLowerCase() === 'dashboard');

        const settingsTitle = availableTitles.find(t => t.toLowerCase() === 'settings') || 'SETTINGS';
        const updateRanges: any[] = [
          {
            range: `'${settingsTitle}'!A1:B3`,
            values: [
              ['Name', 'Value'],
              ['Wedding Name', sanitizedCoupleName],
              ['Wedding Budget', initialBudget]
            ],
          }
        ];
        if (hasDash) {
          updateRanges.unshift({
            range: 'DASHBOARD!B2',
            values: [[sanitizedCoupleName]],
          });
        }

        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: newSpreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updateRanges,
          }
        });

        // Inject Bride & Groom partner profiles into Guest List [ONBOARD-7]
        if (partner1 || partner2) {
          const guestTitle = availableTitles.find(t => t.toLowerCase() === 'guests' || t.toLowerCase() === 'guest list') || 'GUESTS';
          const partnerRows: any[][] = [];
          if (partner1?.firstName || partner1?.lastName) {
            partnerRows.push([
              'G1',
              partner1.firstName || 'Partner',
              partner1.lastName || '1',
              'Sweetheart Table',
              'Attending',
              'Adult',
              'Sweetheart',
              '',
              partner1.email || '',
              partner1.phone || '',
              'Table 1'
            ]);
          }
          if (partner2?.firstName || partner2?.lastName) {
            partnerRows.push([
              `G${partnerRows.length + 1}`,
              partner2.firstName || 'Partner',
              partner2.lastName || '2',
              'Sweetheart Table',
              'Attending',
              'Adult',
              'Sweetheart',
              '',
              partner2.email || '',
              partner2.phone || '',
              'Table 1'
            ]);
          }

          if (partnerRows.length > 0) {
            await sheets.spreadsheets.values.update({
              spreadsheetId: newSpreadsheetId,
              range: `'${guestTitle}'!A2:K${1 + partnerRows.length}`,
              valueInputOption: 'USER_ENTERED',
              requestBody: { values: partnerRows },
            });
            console.log(`[Provisioning] Injected ${partnerRows.length} Bride & Groom profile entries into ${guestTitle} tab.`);
          }
        }

        // Reconnect and preserve interactive in-cell dropdowns linked to 'Settings' tab
        const dropdownRes = await applyDropdownValidations(sheets, newSpreadsheetId);
        console.log(`[Provisioning] Applied ${dropdownRes.appliedCount} dropdown validation rules from Settings tab.`);
      } catch (sheetsErr) {
        console.warn('Could not inject couple name, partner profiles, or apply dropdowns into sheets:', sheetsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully provisioned Google Drive folder and duplicated Master Spreadsheet.',
      provisioned: {
        spreadsheetId: newSpreadsheetId,
        title: documentTitle,
        folderId: productFolderId,
        folderPath: `My Drive / Sheet2Suite / ${productName}`,
        webViewLink: webViewLink || `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`,
      },
    });
  } catch (error: any) {
    console.error('Provisioning failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to provision Google Drive folder and duplicate spreadsheet.',
      },
      { status: 500 }
    );
  }
}
