import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuthAsync } from '@/lib/sheets/client';

/**
 * POST /api/drive/create-folder
 * Creates a new folder in Google Drive within the specified parent folder.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { folderName, parentId, parentPath, spreadsheetId, accessToken } = body;

    if (!folderName || !folderName.trim()) {
      return NextResponse.json({ success: false, error: 'Folder name is required' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value;
    const token = accessToken || bearerToken || cookieToken || process.env.GOOGLE_ACCESS_TOKEN;

    const sheetId = spreadsheetId || req.cookies.get('s2v_spreadsheet_id')?.value;

    let auth: any;
    try {
      auth = await getGoogleAuthAsync(token, sheetId);
    } catch (authErr: any) {
      console.error('[Drive Create Folder] Auth error:', authErr);
      return NextResponse.json({ 
        success: false, 
        error: 'Google Drive connection required. Please reconnect your Google account in Sheet2Vow Settings.' 
      }, { status: 401 });
    }

    const drive = google.drive({ version: 'v3', auth });

    const folderMetadata: any = {
      name: folderName.trim(),
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId && parentId !== 'root' && !parentId.startsWith('custom_') && !parentId.startsWith('f_')) {
      folderMetadata.parents = [parentId];
    }

    const res = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name, parents, modifiedTime, webViewLink',
      supportsAllDrives: true,
    });

    const createdFolder = res.data;
    const resolvedPath = parentPath 
      ? `${parentPath} / ${createdFolder.name}`
      : `My Drive / ${createdFolder.name}`;

    return NextResponse.json({
      success: true,
      folder: {
        id: createdFolder.id,
        name: createdFolder.name,
        parentId: parentId || 'root',
        path: resolvedPath,
        updatedAt: 'Just now',
        webViewLink: createdFolder.webViewLink,
      },
    });
  } catch (error: any) {
    console.error('[Drive Create Folder] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create folder in Google Drive' 
    }, { status: 500 });
  }
}
