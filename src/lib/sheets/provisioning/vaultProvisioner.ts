import { google } from 'googleapis';
import { CellGuard } from '@/lib/core/CellGuard';

export interface VaultProvisionParams {
  drive: any;
  auth: any;
  token?: string;
  userEmail?: string;
  vaultConfig?: any;
  driveFolder?: string;
}

export interface VaultProvisionResult {
  spreadsheetId: string;
  title: string;
  webViewLink: string;
}

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

  const createRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: 'id, name',
  });

  return createRes.data.id;
}

/**
 * Modular Provisioner for Sheet2Vault
 * Creates a personal Google Drive hierarchy (My Drive/Sheet2Suite/Sheet2Vault)
 * and provisions the official Sheet2Vault template with VAULT_ITEMS, VAULT_SETTINGS, and VAULT_CLAIMS.
 */
export async function provisionVaultWorkspace(params: VaultProvisionParams): Promise<VaultProvisionResult> {
  const { drive, auth, vaultConfig = {} } = params;

  // 1. Root & Product Folder Resolution
  const rootFolderId = await getOrCreateFolder(drive, 'Sheet2Suite');
  const vaultFolderId = await getOrCreateFolder(drive, 'Sheet2Vault', rootFolderId);

  // 2. Resolve document title
  const residenceName = CellGuard.sanitizeCellValue(vaultConfig.residenceName || 'My Residence');
  const documentTitle = `${residenceName} — Sheet2Vault Personal Inventory`;

  // 3. Create fresh Google Spreadsheet via Sheets API v4
  const sheets = google.sheets({ version: 'v4', auth });
  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: documentTitle },
      sheets: [
        { properties: { title: 'VAULT_ITEMS', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'VAULT_SETTINGS', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'VAULT_CLAIMS', gridProperties: { frozenRowCount: 1 } } },
      ],
    },
  });

  const spreadsheetId = createRes.data.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error('Failed to create Sheet2Vault Google Spreadsheet.');
  }

  // 4. Move spreadsheet into the Sheet2Vault Drive folder
  try {
    const fileMeta = await drive.files.get({ fileId: spreadsheetId, fields: 'parents' });
    const currentParents = fileMeta.data.parents || [];
    if (!currentParents.includes(vaultFolderId)) {
      await drive.files.update({
        fileId: spreadsheetId,
        addParents: vaultFolderId,
        removeParents: currentParents.join(','),
        fields: 'id, parents, webViewLink',
      });
    }
  } catch (err) {
    console.warn('[Sheet2Vault] Folder move warning:', err);
  }

  const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 5. Populate Tabs & Starter Data
  const defaultRooms = (vaultConfig.selectedRooms && vaultConfig.selectedRooms.length > 0)
    ? vaultConfig.selectedRooms
    : ['Living Room', 'Home Office', 'Master Bedroom', 'Kitchen', 'Garage', 'Basement'];

  const coverageLimit = Number(vaultConfig.coverageLimit) || 100000;
  const deductible = Number(vaultConfig.deductible) || 1000;
  const jewelrySublimit = Number(vaultConfig.jewelrySublimit) || 1500;
  const electronicsSublimit = Number(vaultConfig.electronicsSublimit) || 5000;
  const toolsSublimit = Number(vaultConfig.toolsSublimit) || 2500;

  // TAB 1: VAULT_ITEMS
  const itemsHeaders = [
    'Item ID',
    'Item Name',
    'Category',
    'Room',
    'Brand / Make',
    'Model Number',
    'Serial Number',
    'Purchase Date',
    'Purchase Price',
    'Est Replacement Cost',
    'Condition',
    'Photo URL',
    'Serial Tag URL',
    'Receipt URL',
    'Claim Readiness',
    'Status',
    'Distinguishing Marks / Notes',
  ];

  const sampleRow1 = [
    'VLT-0001',
    'MacBook Pro 16" (M3 Max, 36GB, 1TB)',
    'Electronics',
    'Home Office',
    'Apple',
    'MUW63LL/A',
    'C02G9012MD6T',
    '2025-11-15',
    3499.00,
    3499.00,
    'Mint',
    '',
    '',
    '',
    '=IF(AND(LEN(G2)>0,LEN(L2)>0,LEN(N2)>0),1,IF(LEN(L2)>0,0.6,0.2))',
    'Active',
    'Space Black, small dbrand skin on top cover',
  ];

  const sampleRow2 = [
    'VLT-0002',
    'Rolex Submariner Date (Oystersteel)',
    'Jewelry',
    'Master Bedroom',
    'Rolex',
    '126610LN',
    '87X91234',
    '2024-06-20',
    10250.00,
    14500.00,
    'Mint',
    '',
    '',
    '',
    '=IF(AND(LEN(G3)>0,LEN(L3)>0,LEN(N3)>0),1,IF(LEN(L3)>0,0.6,0.2))',
    'Active',
    'Original box, papers, and warranty card cataloged',
  ];

  // TAB 2: VAULT_SETTINGS
  const settingsData = [
    ['Setting Key', 'Setting Value', 'Description'],
    ['Property Nickname', residenceName, 'Display nickname for this property'],
    ['Total Contents Coverage Limit', coverageLimit, 'Insurance policy Coverage C limit'],
    ['Policy Deductible', deductible, 'Standard deductible amount'],
    ['Jewelry Sub-Limit', jewelrySublimit, 'Standard un-scheduled jewelry limit'],
    ['Electronics Sub-Limit', electronicsSublimit, 'Electronics policy sub-limit'],
    ['Tools Sub-Limit', toolsSublimit, 'Power tools policy sub-limit'],
    ['Configured Rooms', defaultRooms.join(', '), 'Active rooms available in selector'],
    ['Created Date', new Date().toISOString().split('T')[0], 'Workspace provisioning date'],
  ];

  // TAB 3: VAULT_CLAIMS
  const claimsHeaders = [
    'Claim ID',
    'Incident Date',
    'Incident Type',
    'Police Report Number',
    'Insurance Claim Number',
    'Claimed Items Count',
    'Total Claimed Value',
    'Dossier URL',
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: 'VAULT_ITEMS!A1:Q3',
          values: [itemsHeaders, sampleRow1, sampleRow2],
        },
        {
          range: 'VAULT_SETTINGS!A1:C9',
          values: settingsData,
        },
        {
          range: 'VAULT_CLAIMS!A1:H1',
          values: [claimsHeaders],
        },
      ],
    },
  });

  return {
    spreadsheetId,
    title: documentTitle,
    webViewLink,
  };
}
