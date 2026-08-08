import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { DEFAULT_MASTER_SHEET_ID, getGoogleAuth } from '@/lib/sheets/client';

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
    const { accessToken, coupleName, productName = 'Sheet2Vow' } = body;

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

    // Step 3: Copy Master Template Spreadsheet into user's folder
    const masterSheetId = process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID;
    const documentTitle = coupleName ? `${coupleName} Wedding Database` : 'Sheet2Vow Wedding Planner Database';

    const copyRes = await drive.files.copy({
      fileId: masterSheetId,
      requestBody: {
        name: documentTitle,
        parents: [productFolderId],
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    const newSpreadsheetId = copyRes.data.id;
    const webViewLink = copyRes.data.webViewLink;

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
