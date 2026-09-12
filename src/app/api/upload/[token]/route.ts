import { NextRequest, NextResponse } from 'next/server';
import { verifyShareToken } from '@/lib/share/token';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { getGoogleAuthAsync } from '@/lib/sheets/client';

async function getOrCreateFolder(drive: any, folderName: string, parentId?: string): Promise<string> {
  const queryParts = [
    `name = '${folderName.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
  ];

  if (parentId && parentId !== 'root') {
    queryParts.push(`'${parentId}' in parents`);
  } else {
    queryParts.push("'root' in parents");
  }

  const searchRes = await drive.files.list({
    q: queryParts.join(' and '),
    fields: 'files(id, name)',
    spaces: 'drive',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  if (searchRes.data.files && searchRes.data.files.length > 0) {
    return searchRes.data.files[0].id;
  }

  const folderMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId && parentId !== 'root') {
    folderMetadata.parents = [parentId];
  }

  const createRes = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id, name',
    supportsAllDrives: true,
  });

  return createRes.data.id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const payload = verifyShareToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired share token' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      weddingName: payload.weddingName || 'Our Wedding',
      spreadsheetId: payload.spreadsheetId,
      folderId: payload.folderId,
      folderName: payload.folderName,
      folderPath: payload.folderPath || 'My Drive/Wedding Planning/Guest Uploads',
      userEmail: payload.userEmail,
      exp: payload.exp,
    });
  } catch (error) {
    console.error('Error fetching upload metadata:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const payload = verifyShareToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired upload token' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const uploaderName = (formData.get('uploaderName') as string) || 'Anonymous Guest';
    const caption = (formData.get('caption') as string) || '';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Strict Image & Video Validation
    const ALLOWED_MIME_PREFIXES = ['image/', 'video/'];
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.mp4', '.mov', '.avi', '.m4v', '.webm', '.3gp', '.mkv'];

    for (const file of files) {
      const isImageOrVideoMime = ALLOWED_MIME_PREFIXES.some(prefix => (file.type || '').toLowerCase().startsWith(prefix));
      const ext = (file.name.substring(file.name.lastIndexOf('.')) || '').toLowerCase();
      const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);

      if (!isImageOrVideoMime && !isAllowedExt) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a supported image or video format. Only photos and videos (JPG, PNG, HEIC, MP4, MOV, etc.) can be uploaded.` },
          { status: 400 }
        );
      }
    }

    console.log(`Received ${files.length} valid photo/video upload(s) from "${uploaderName}" for spreadsheet: ${payload.spreadsheetId}`);

    // Resolve Google Drive & Sheets Client for the couple's workspace
    let drive: any = null;
    let auth: any = null;
    try {
      if (payload.spreadsheetId) {
        try {
          auth = await getGoogleAuthAsync(undefined, payload.spreadsheetId);
        } catch (err) {
          console.warn(`[Upload Route] Could not get Google Auth client with spreadsheetId "${payload.spreadsheetId}":`, err);
        }
      }
      if (!auth && payload.userEmail) {
        try {
          auth = await getGoogleAuthAsync(undefined, payload.userEmail);
        } catch (err) {
          console.warn(`[Upload Route] Could not get Google Auth client with userEmail "${payload.userEmail}":`, err);
        }
      }
      if (!auth) {
        // Fallback to environment tokens or service account if available
        auth = await getGoogleAuthAsync(undefined);
      }
      drive = google.drive({ version: 'v3', auth });
    } catch (authErr) {
      console.warn('[Upload Route] Could not get Google Auth client:', authErr);
      if (payload.spreadsheetId === 'mock-sheet-id-vow-12345' || !process.env.GOOGLE_CLIENT_ID) {
        console.log('[Upload Route] Demo/Mock mode: simulated upload storage');
      } else {
        return NextResponse.json({
          error: 'Could not connect to Google Drive. Please ensure Google Drive is connected in Sheet2Vow Settings.'
        }, { status: 502 });
      }
    }

    let targetFolderId: string | undefined = undefined;

    if (drive) {
      // 1. Check if payload.folderId is a real Google Drive folder
      if (payload.folderId && !payload.folderId.startsWith('custom_') && !payload.folderId.startsWith('f_') && !payload.folderId.startsWith('mock-')) {
        try {
          const check = await drive.files.get({
            fileId: payload.folderId,
            fields: 'id, trashed, mimeType',
            supportsAllDrives: true,
          });
          if (!check.data.trashed && check.data.mimeType === 'application/vnd.google-apps.folder') {
            targetFolderId = payload.folderId;
          }
        } catch (err) {
          console.warn(`[Upload Route] Could not verify folderId "${payload.folderId}":`, err);
        }
      }

      // 2. If targetFolderId is not verified, resolve/create folder path hierarchy in Drive
      if (!targetFolderId) {
        const rawPath = payload.folderPath || (payload.folderName ? `Wedding Planning / ${payload.folderName}` : 'Wedding Planning / Guest Uploads');
        const segments = rawPath
          .split('/')
          .map(s => s.trim())
          .filter(s => s && s.toLowerCase() !== 'my drive' && s.toLowerCase() !== 'root');

        if (segments.length === 0) {
          segments.push(payload.folderName || 'Guest Uploads');
        }

        let currentParent: string | undefined = undefined;
        for (const segment of segments) {
          currentParent = await getOrCreateFolder(drive, segment, currentParent);
        }
        targetFolderId = currentParent;
      }

      // 3. Upload each file directly to Google Drive
      const uploadedFiles: { id?: string; name: string; webViewLink?: string }[] = [];
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const originalName = file.name || 'photo.jpg';
        const ext = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
        const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
        const guestSlug = uploaderName.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '_');
        const fileName = `${guestSlug ? `${guestSlug}_` : ''}${baseName || 'photo'}_${Date.now()}${ext}`;

        const uploadRes = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: targetFolderId ? [targetFolderId] : undefined,
            description: caption ? `Uploaded by ${uploaderName}. Note: ${caption}` : `Uploaded by ${uploaderName}`,
          },
          media: {
            mimeType: file.type || 'application/octet-stream',
            body: stream,
          },
          fields: 'id, name, webViewLink',
          supportsAllDrives: true,
        });

        uploadedFiles.push({
          id: uploadRes.data.id,
          name: fileName,
          webViewLink: uploadRes.data.webViewLink,
        });
      }

      // 4. Record guest submission in Cloud Firestore guest_uploads collection
      const uploadRecord = {
        id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        spreadsheetId: payload.spreadsheetId,
        userEmail: payload.userEmail || '',
        uploaderName: uploaderName.trim() || 'Anonymous Guest',
        caption: caption.trim(),
        fileCount: files.length,
        files: uploadedFiles,
        folderId: targetFolderId || payload.folderId || '',
        folderName: payload.folderName || 'Guest Uploads',
        folderPath: payload.folderPath || 'My Drive / Wedding Planning / Guest Uploads',
        uploadedAt: new Date().toISOString(),
      };

      try {
        const { LocalFirestore } = await import('@/lib/db/firestoreDb');
        await LocalFirestore.setDocAsync('guest_uploads', uploadRecord.id, uploadRecord);
      } catch (saveErr) {
        console.warn('[Upload Route] Could not save guest upload record:', saveErr);
      }

      // 5. Append to Guest_Messages_&_Notes.txt in the Google Drive folder
      if (targetFolderId && (caption.trim() || uploaderName.trim())) {
        try {
          const timeFormatted = new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
          const noteEntry = [
            '------------------------------------------------------------',
            `FROM: ${uploaderName.trim() || 'Anonymous Guest'}`,
            `DATE: ${timeFormatted}`,
            `UPLOADED: ${files.length} photo/video file(s)`,
            caption.trim() ? `MESSAGE: "${caption.trim()}"` : 'MESSAGE: (No written comment)',
            '------------------------------------------------------------\n',
          ].join('\n');

          const txtSearch = await drive.files.list({
            q: `name = 'Guest_Messages_&_Notes.txt' and '${targetFolderId}' in parents and trashed = false`,
            fields: 'files(id, name)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
          });

          if (txtSearch.data.files && txtSearch.data.files.length > 0) {
            const fileId = txtSearch.data.files[0].id;
            let existingText = '';
            try {
              const getRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'text' });
              existingText = getRes.data || '';
            } catch (e) {}

            const newText = existingText ? `${existingText}\n${noteEntry}` : noteEntry;
            const textStream = new Readable();
            textStream.push(Buffer.from(newText, 'utf-8'));
            textStream.push(null);

            await drive.files.update({
              fileId,
              media: { mimeType: 'text/plain', body: textStream },
              supportsAllDrives: true,
            });
          } else {
            const headerText = `============================================================\n${payload.weddingName || 'OUR WEDDING'} - GUEST PHOTO NOTES & WISHES\nAlbum Folder: ${payload.folderName || 'Guest Uploads'}\n============================================================\n\n${noteEntry}`;
            const textStream = new Readable();
            textStream.push(Buffer.from(headerText, 'utf-8'));
            textStream.push(null);

            await drive.files.create({
              requestBody: {
                name: 'Guest_Messages_&_Notes.txt',
                parents: [targetFolderId],
                description: 'Consolidated guest wishes, comments, and photo upload log from Sheet2Vow.',
              },
              media: { mimeType: 'text/plain', body: textStream },
              supportsAllDrives: true,
            });
          }
        } catch (driveTxtErr) {
          console.warn('[Upload Route] Note file sync warning:', driveTxtErr);
        }
      }

      // 6. Record submission directly into Google Sheet 'GUESTBOOK' tab (Single Source of Truth)
      if (payload.spreadsheetId && auth) {
        try {
          const sheets = google.sheets({ version: 'v4', auth });
          const spreadsheetId = payload.spreadsheetId;

          const entryId = `GB${Date.now().toString().slice(-6)}`;
          const timeFormatted = new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          const photoLinks = (uploadedFiles || [])
            .map(f => f.webViewLink || '')
            .filter(Boolean)
            .join('\n');

          const rowValues = [
            entryId,
            timeFormatted,
            uploaderName.trim() || 'Anonymous Guest',
            caption.trim() || '',
            files.length,
            photoLinks,
            payload.folderName || 'Guest Uploads',
          ];

          // Check if GUESTBOOK tab exists; if not, auto-create it with headers
          const metaRes = await sheets.spreadsheets.get({ spreadsheetId });
          const availableTitles = (metaRes.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);
          const hasGuestbookTab = availableTitles.some(t => t.toLowerCase() === 'guestbook' || t.toLowerCase() === 'guest book');

          if (!hasGuestbookTab) {
            try {
              await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                  requests: [
                    {
                      addSheet: {
                        properties: {
                          title: 'GUESTBOOK',
                        },
                      },
                    },
                  ],
                },
              });

              // Add header row
              await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "'GUESTBOOK'!A1:G1",
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                  values: [['Entry ID', 'Date & Time', 'Guest Name', 'Message / Wishes', 'Photo Count', 'Photo Links', 'Drive Folder']],
                },
              });
            } catch (createTabErr) {
              console.warn('[Upload Route] Could not auto-create GUESTBOOK tab:', createTabErr);
            }
          }

          // Append new entry row to GUESTBOOK tab
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "'GUESTBOOK'!A:G",
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
              values: [rowValues],
            },
          });
          console.log(`[Upload Route] Appended guestbook entry "${entryId}" for "${uploaderName}" to GUESTBOOK tab`);
        } catch (sheetSyncErr) {
          console.warn('[Upload Route] Could not record entry in GUESTBOOK sheet tab:', sheetSyncErr);
        }
      }
    }

    // Mock Mode Guestbook Support
    if (payload.spreadsheetId === 'mock-sheet-id-vow-12345') {
      try {
        const { mockDatabase } = await import('@/lib/sheets/mockDb');
        if (!mockDatabase.guestbook) mockDatabase.guestbook = [];
        mockDatabase.guestbook.unshift({
          entryId: `GB${Date.now().toString().slice(-4)}`,
          submittedAt: new Date().toISOString(),
          guestName: uploaderName.trim() || 'Anonymous Guest',
          message: caption.trim(),
          photoCount: files.length,
          photoLinks: '',
          driveFolder: payload.folderName || 'Guest Uploads',
        });
      } catch (mErr) {
        console.warn('[Upload Route] Mock guestbook sync error:', mErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${files.length} file(s) directly to Google Drive!`,
      uploadedCount: files.length,
      uploaderName,
      folderId: targetFolderId || payload.folderId,
      folderName: payload.folderName || 'Guest Uploads',
      folderPath: payload.folderPath || 'My Drive / Wedding Planning / Guest Uploads',
    });
  } catch (error) {
    console.error('Error in photo upload proxy:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
