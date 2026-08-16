import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/sheets/client';

/**
 * GET /api/drive/resolve-path?folderId=...&name=...
 * Traverses parent folder IDs to reconstruct the full folder hierarchy path e.g. "My Drive / DEVELOPMENT / Sheet2Vow"
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');
    const folderName = searchParams.get('name') || 'Selected Folder';

    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value;
    const token = bearerToken || cookieToken || process.env.GOOGLE_ACCESS_TOKEN;

    if (!folderId || folderId === 'root' || folderName.toLowerCase() === 'my drive') {
      return NextResponse.json({
        success: true,
        fullPath: 'My Drive',
        folderName: 'My Drive',
      });
    }

    if (!token) {
      return NextResponse.json({
        success: true,
        fullPath: `My Drive / ${folderName}`,
        folderName,
      });
    }

    const auth = getGoogleAuth(token);
    const drive = google.drive({ version: 'v3', auth });

    const pathParts: string[] = [folderName];
    let currentId = folderId;
    let depth = 0;

    while (currentId && depth < 6) {
      try {
        const res = await drive.files.get({
          fileId: currentId,
          fields: 'id, name, parents',
          supportsAllDrives: true,
        });

        const parents = res.data.parents;
        if (!parents || parents.length === 0) {
          break;
        }

        const parentId = parents[0];
        if (!parentId || parentId === 'root') {
          break;
        }

        // Fetch parent details
        try {
          const parentRes = await drive.files.get({
            fileId: parentId,
            fields: 'id, name, parents',
            supportsAllDrives: true,
          });

          if (parentRes.data.name && parentRes.data.name.toLowerCase() !== 'my drive') {
            pathParts.unshift(parentRes.data.name);
            currentId = parentId;
          } else {
            break;
          }
        } catch {
          // Parent folder not accessible under scope (e.g. root drive reached)
          break;
        }
      } catch {
        // Current folder not accessible
        break;
      }
      depth++;
    }

    const fullPath = `My Drive / ${pathParts.join(' / ')}`;

    return NextResponse.json({
      success: true,
      fullPath,
      folderName,
      pathParts,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      fullPath: `My Drive / ${req.nextUrl.searchParams.get('name') || 'Selected Folder'}`,
      error: error.message,
    });
  }
}
