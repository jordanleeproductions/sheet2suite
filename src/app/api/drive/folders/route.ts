import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuthAsync } from '@/lib/sheets/client';

/**
 * GET /api/drive/folders?folderId=...&parentPath=...&spreadsheetId=...
 * Lists Google Drive subfolders inside the specified folder.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId') || 'root';
    const parentPath = searchParams.get('parentPath') || 'My Drive';
    const spreadsheetId = searchParams.get('spreadsheetId');

    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value;
    const token = bearerToken || cookieToken || process.env.GOOGLE_ACCESS_TOKEN;

    const sheetId = spreadsheetId || req.cookies.get('s2v_spreadsheet_id')?.value;

    let auth: any;
    try {
      auth = await getGoogleAuthAsync(token, sheetId);
    } catch (authErr: any) {
      console.warn('[Drive Folders] Auth error, returning empty list:', authErr);
      return NextResponse.json({ success: true, files: [] });
    }

    const drive = google.drive({ version: 'v3', auth });

    const effectiveParent = folderId === 'root' || folderId.startsWith('custom_') || folderId.startsWith('f_') 
      ? 'root' 
      : folderId;

    const q = `'${effectiveParent}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    const res = await drive.files.list({
      q,
      fields: 'files(id, name, parents, modifiedTime, folderColorRgb, shared)',
      pageSize: 100,
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'folder,name',
    });

    const files = (res.data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      parentId: folderId,
      path: `${parentPath} / ${f.name}`,
      updatedAt: f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : 'Recently',
      isShared: f.shared,
      folderColorRgb: f.folderColorRgb,
    }));

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error: any) {
    console.error('[Drive Folders] Error listing folders:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to list folders' }, { status: 500 });
  }
}
