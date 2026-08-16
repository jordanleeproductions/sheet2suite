import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { DEFAULT_MASTER_SHEET_ID, getGoogleAuth } from '@/lib/sheets/client';
import { LocalLicensingDb } from '@/lib/db/licensingDb';

function getOAuth2Client(redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth 2.0 redirect callback, exchanges authorization code for tokens,
 * provisions the user's Google Drive folder & Master Spreadsheet, and closes popup.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      return new NextResponse(
        `<html><body><script>window.opener?.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${error}' }, '*'); window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      return new NextResponse(
        `<html><body><script>window.opener?.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'No authorization code returned' }, '*'); window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const oauth2Client = getOAuth2Client(redirectUri);

    // Step 1: Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Step 2: Retrieve User Profile Info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email || 'user@sheet2suite.com';
    const userName = userInfo.data.name || 'Sheet2Suite User';

    // Step 3: Automatically Provision Google Drive Folder & Master Sheet
    let provisionData: any = null;
    try {
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      // Find or create "Sheet2Suite" root folder
      const rootFolderRes = await drive.files.list({
        q: "name = 'Sheet2Suite' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: 'files(id, name)',
      });

      let rootFolderId = rootFolderRes.data.files?.[0]?.id;
      if (!rootFolderId) {
        const createRoot = await drive.files.create({
          requestBody: { name: 'Sheet2Suite', mimeType: 'application/vnd.google-apps.folder' },
          fields: 'id',
        });
        rootFolderId = createRoot.data.id!;
      }

      // Find or create "Sheet2Vow" subfolder
      const vowFolderRes = await drive.files.list({
        q: `name = 'Sheet2Vow' and mimeType = 'application/vnd.google-apps.folder' and '${rootFolderId}' in parents and trashed = false`,
        fields: 'files(id, name)',
      });

      let vowFolderId = vowFolderRes.data.files?.[0]?.id;
      if (!vowFolderId) {
        const createVow = await drive.files.create({
          requestBody: { name: 'Sheet2Vow', mimeType: 'application/vnd.google-apps.folder', parents: [rootFolderId] },
          fields: 'id',
        });
        vowFolderId = createVow.data.id!;
      }

      // Check local database for existing registered workspaces for this user email
      const existingDbWorkspaces = LocalLicensingDb.getWorkspacesByEmail(userEmail);
      const spreadsheetId: string | undefined = existingDbWorkspaces[0]?.spreadsheetId;
      const webViewLink: string | undefined = existingDbWorkspaces[0]?.webViewLink;

      if (spreadsheetId) {
        provisionData = {
          hasExistingWorkspace: true,
          spreadsheetId,
          folderPath: 'My Drive / Sheet2Suite / Sheet2Vow',
          webViewLink: webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        };
      } else {
        provisionData = {
          hasExistingWorkspace: false,
          folderPath: 'My Drive / Sheet2Suite / Sheet2Vow',
        };
      }
    } catch (pErr) {
      console.error('Provisioning step error:', pErr);
    }

    const userPicture = userInfo.data.picture || undefined;

    const payload = JSON.stringify({
      type: 'GOOGLE_AUTH_SUCCESS',
      user: { email: userEmail, name: userName, picture: userPicture },
      accessToken: tokens.access_token,
      provision: provisionData,
    });

    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Connected to Google Drive &bull; Sheet2Suite</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
            
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: #f8fafd;
              color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 1.5rem;
            }
            .card {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 2.25rem 2rem;
              text-align: center;
              max-width: 380px;
              width: 100%;
              box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03);
              animation: fadeIn 0.3s ease-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .icon-ring {
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background: #e8f0fe;
              color: #0b57d0;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1.25rem;
            }
            h2 {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 1.35rem;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 0.5rem;
              letter-spacing: -0.01em;
            }
            p {
              font-size: 0.825rem;
              color: #64748b;
              line-height: 1.5;
            }
            .badge {
              display: inline-block;
              margin-top: 1rem;
              padding: 0.3rem 0.75rem;
              background: #f1f5f9;
              border-radius: 20px;
              font-family: monospace;
              font-size: 0.7rem;
              font-weight: 700;
              color: #0b57d0;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon-ring">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>Google Drive Connected</h2>
            <p>Authentication successful. Synchronizing your wedding database spreadsheet...</p>
            <div class="badge">${userEmail}</div>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage(${payload}, '*');
              }
            } catch (e) { console.error(e); }
            setTimeout(() => { window.close(); }, 900);
          </script>
        </body>
      </html>
    `;

    const response = new NextResponse(htmlResponse, {
      headers: { 'Content-Type': 'text/html' },
    });

    // Set HTTP-only session cookies
    if (tokens.access_token) {
      response.cookies.set('s2s_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    if (userEmail) {
      response.cookies.set('s2s_user_email', userEmail, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return response;
  } catch (err: any) {
    console.error('OAuth Callback Error:', err);
    return new NextResponse(
      `<html><body><h3>Authentication failed: ${err.message}</h3><script>setTimeout(() => window.close(), 3000);</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
