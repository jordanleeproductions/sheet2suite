import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { getGoogleAuth } from '@/lib/sheets/client';

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
 * POST /api/upload/contract
 * Uploads a vendor contract file (PDF, image, doc) directly to a dedicated "Contracts" folder inside Google Drive.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const vendorName = (formData.get('vendorName') as string) || 'Vendor';
    const driveFolderName = (formData.get('driveFolder') as string) || 'Sheet2Vow';
    const accessToken = formData.get('accessToken') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No contract file uploaded.' }, { status: 400 });
    }

    // Determine auth token
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value;
    const token = accessToken || bearerToken || cookieToken || process.env.GOOGLE_ACCESS_TOKEN;

    if (!token && !process.env.GOOGLE_CLIENT_EMAIL) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Google connection required to upload contract files to Drive.' },
        { status: 401 }
      );
    }

    const auth = getGoogleAuth(token);
    const drive = google.drive({ version: 'v3', auth });

    // Step 1: Ensure Root "Sheet2Suite" folder exists
    const rootFolderId = await getOrCreateFolder(drive, 'Sheet2Suite');

    // Step 2: Ensure Product folder exists (e.g. "Sheet2Vow")
    const cleanFolderName = driveFolderName.includes('/') ? driveFolderName.split('/').pop()?.trim() || 'Sheet2Vow' : driveFolderName;
    const productFolderId = await getOrCreateFolder(drive, cleanFolderName, rootFolderId);

    // Step 3: Ensure dedicated "Contracts" subfolder exists
    const contractsFolderId = await getOrCreateFolder(drive, 'Contracts', productFolderId);

    // Step 4: Upload File to Contracts subfolder
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const sanitizedVendorSlug = vendorName.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '_');
    const originalExt = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '.pdf';
    const fileName = `${sanitizedVendorSlug}_Contract_${Date.now()}${originalExt}`;

    const uploadRes = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [contractsFolderId],
      },
      media: {
        mimeType: file.type || 'application/pdf',
        body: stream,
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    const fileId = uploadRes.data.id;
    const webViewLink = uploadRes.data.webViewLink || (fileId ? `https://drive.google.com/file/d/${fileId}/view` : undefined);

    // Grant link-sharing reader permissions if authorized
    if (fileId) {
      try {
        await drive.permissions.create({
          fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } catch (permErr) {
        console.warn('[Contract Upload] Could not set public reader permission on file:', permErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor contract successfully uploaded to Google Drive Contracts folder.',
      fileId,
      fileName,
      webViewLink,
      contractLink: webViewLink,
    });
  } catch (err: any) {
    console.error('[Contract Upload API Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to upload contract file to Google Drive.' },
      { status: 500 }
    );
  }
}
