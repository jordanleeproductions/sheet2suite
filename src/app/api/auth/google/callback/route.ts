import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { DEFAULT_MASTER_SHEET_ID, getGoogleAuth, getGoogleAuthAsync } from '@/lib/sheets/client';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
import { LocalFirestore } from '@/lib/db/firestoreDb';

function getOAuth2Client(redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Validates that a target origin belongs to an authorized Sheet2Suite domain or local development.
 */
function isValidAppOrigin(originStr?: string | null): boolean {
  if (!originStr) return false;
  try {
    const url = new URL(originStr);
    const host = url.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'sheet2suite.com' ||
      host.endsWith('.sheet2suite.com') ||
      host.endsWith('.web.app') ||
      host.endsWith('.firebaseapp.com') ||
      host.endsWith('.run.app') ||
      host.endsWith('.hosted.app')
    );
  } catch {
    return false;
  }
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

    // Extract state to securely identify caller targetOrigin [SEC-2]
    const stateParam = url.searchParams.get('state');
    let stateSpreadsheetId: string | undefined;
    let stateOrigin: string | undefined;
    if (stateParam) {
      try {
        const parsed = JSON.parse(stateParam);
        stateSpreadsheetId = parsed.spreadsheetId;
        if (isValidAppOrigin(parsed.origin)) {
          stateOrigin = parsed.origin;
        }
      } catch (_) {}
    }

    const targetOriginExpr = stateOrigin ? JSON.stringify(stateOrigin) : 'window.location.origin';

    if (error) {
      const safeError = String(error).replace(/[^a-zA-Z0-9_\-\s]/g, '');
      return new NextResponse(
        `<html><body><script>try { window.opener?.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${safeError}' }, ${targetOriginExpr}); } catch(e){} window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code) {
      return new NextResponse(
        `<html><body><script>try { window.opener?.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'No authorization code returned' }, ${targetOriginExpr}); } catch(e){} window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const forwardedHost = req.headers.get('x-forwarded-host');
    const host = forwardedHost || req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}/api/auth/google/callback`;

    const oauth2Client = getOAuth2Client(redirectUri);

    // Step 1: Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Step 2: Retrieve User Profile Info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email || 'user@sheet2suite.com';
    const userName = userInfo.data.name || 'Sheet2Suite User';
    const userPicture = userInfo.data.picture || undefined;

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

      // Check database for existing registered workspaces for this user email or co-planner status
      const existingDbWorkspaces = await LocalLicensingDb.getWorkspacesByEmailAsync(userEmail);
      let spreadsheetId: string | undefined = existingDbWorkspaces[0]?.spreadsheetId;
      let webViewLink: string | undefined = existingDbWorkspaces[0]?.webViewLink;

      // Google Drive Fallback: If not registered in database, directly inspect user's Google Drive folders
      if (!spreadsheetId) {
        try {
          let foundFile: any = null;

          // Priority 1: Check inside the Sheet2Vow folder
          if (vowFolderId) {
            const vowFilesRes = await drive.files.list({
              q: `'${vowFolderId}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
              fields: 'files(id, name, webViewLink, modifiedTime)',
              orderBy: 'modifiedTime desc',
              pageSize: 5,
            });
            foundFile = vowFilesRes.data.files?.[0];
          }

          // Priority 2: Check inside the parent Sheet2Suite folder
          if (!foundFile && rootFolderId) {
            const rootFilesRes = await drive.files.list({
              q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
              fields: 'files(id, name, webViewLink, modifiedTime)',
              orderBy: 'modifiedTime desc',
              pageSize: 5,
            });
            foundFile = rootFilesRes.data.files?.[0];
          }

          // Priority 3: Search user's Drive for any spreadsheets containing "Wedding" or "Sheet2Vow"
          if (!foundFile) {
            const broadFilesRes = await drive.files.list({
              q: "mimeType = 'application/vnd.google-apps.spreadsheet' and (name contains 'Sheet2Vow' or name contains 'Wedding') and trashed = false",
              fields: 'files(id, name, webViewLink, modifiedTime)',
              orderBy: 'modifiedTime desc',
              pageSize: 5,
            });
            foundFile = broadFilesRes.data.files?.[0];
          }

          if (foundFile?.id) {
            spreadsheetId = foundFile.id;
            webViewLink = foundFile.webViewLink || `https://docs.google.com/spreadsheets/d/${foundFile.id}/edit`;
            console.log(`[OAuth Callback] Auto-discovered existing Google Drive wedding spreadsheet: "${foundFile.name}" (${foundFile.id}) for ${userEmail}`);

            // Automatically backfill workspace registration into Cloud Firestore
            try {
              await LocalLicensingDb.saveWorkspaceAsync({
                userEmail,
                spreadsheetId: foundFile.id,
                spreadsheetName: foundFile.name || 'Wedding Database',
                driveFolderPath: 'My Drive / Sheet2Suite / Sheet2Vow',
                webViewLink: webViewLink || `https://docs.google.com/spreadsheets/d/${foundFile.id}/edit`,
                productName: 'Sheet2Vow',
                orderVerified: true,
              });
            } catch (backfillErr) {
              console.warn('[OAuth Callback] Could not backfill auto-discovered workspace to database:', backfillErr);
            }
          }
        } catch (driveErr) {
          console.warn('[OAuth Callback] Error inspecting Google Drive for existing spreadsheet:', driveErr);
        }
      }

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

    // If partner/co-planner arrived via invite link carrying spreadsheetId, link them to the workspace
    if (stateSpreadsheetId && userEmail) {
      try {
        await LocalLicensingDb.addCoPlannerAsync(stateSpreadsheetId, userEmail);
      } catch (cpErr) {
        console.warn('[OAuth] Could not automatically link co-planner in workspace:', cpErr);
      }

      // Automatically grant Google Drive edit permissions using workspace owner / server credentials
      try {
        const driveAuth = await getGoogleAuthAsync(undefined, stateSpreadsheetId, undefined, undefined, { allowStoredFallback: true });
        const driveClient = google.drive({ version: 'v3', auth: driveAuth });
        await driveClient.permissions.create({
          fileId: stateSpreadsheetId,
          sendNotificationEmail: false,
          requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: userEmail.trim().toLowerCase(),
          },
        });
        console.log(`[OAuth] Automatically granted Drive writer permission to co-planner ${userEmail} on ${stateSpreadsheetId}`);
      } catch (permErr: any) {
        console.warn('[OAuth] Note on auto-granting drive permission to co-planner:', permErr?.message);
      }
    }

    const effectiveSheetId = stateSpreadsheetId || provisionData?.spreadsheetId;
    const hasExistingWorkspace = Boolean(effectiveSheetId || provisionData?.hasExistingWorkspace);

    if (effectiveSheetId) {
      provisionData = {
        ...provisionData,
        hasExistingWorkspace: true,
        spreadsheetId: effectiveSheetId,
        folderPath: provisionData?.folderPath || 'My Drive / Sheet2Suite / Sheet2Vow',
        webViewLink: provisionData?.webViewLink || `https://docs.google.com/spreadsheets/d/${effectiveSheetId}/edit`,
      };
    }

    // Persist refresh token and token metadata in Firestore / Local storage for long-lived silent re-auth
    let effectiveRefreshToken = tokens.refresh_token;
    try {
      if (userEmail) {
        const existingUserDoc = await LocalFirestore.getDocAsync<any>('auth_tokens', userEmail);
        effectiveRefreshToken = effectiveRefreshToken || existingUserDoc?.refreshToken;

        await LocalFirestore.setDocAsync('auth_tokens', userEmail, {
          userEmail,
          spreadsheetId: effectiveSheetId || existingUserDoc?.spreadsheetId,
          refreshToken: effectiveRefreshToken,
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date,
          updatedAt: new Date().toISOString(),
        });
      }
      if (effectiveSheetId) {
        const existingSheetDoc = await LocalFirestore.getDocAsync<any>('auth_tokens', effectiveSheetId);
        effectiveRefreshToken = effectiveRefreshToken || existingSheetDoc?.refreshToken;

        await LocalFirestore.setDocAsync('auth_tokens', effectiveSheetId, {
          userEmail,
          spreadsheetId: effectiveSheetId,
          refreshToken: effectiveRefreshToken,
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (tokenSaveErr) {
      console.warn('[OAuth] Could not save refresh token to Firestore:', tokenSaveErr);
    }

    const payload = JSON.stringify({
      type: 'GOOGLE_AUTH_SUCCESS',
      user: { email: userEmail, name: userName, picture: userPicture },
      accessToken: tokens.access_token,
      provision: {
        ...provisionData,
        hasExistingWorkspace: hasExistingWorkspace,
        spreadsheetId: effectiveSheetId || provisionData?.spreadsheetId,
      },
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
                const targetOrigin = ${stateOrigin ? JSON.stringify(stateOrigin) : 'window.location.origin'};
                window.opener.postMessage(${payload}, targetOrigin);
                if (window.location.origin !== targetOrigin) {
                  try { window.opener.postMessage(${payload}, window.location.origin); } catch (_) {}
                }
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

    if (effectiveRefreshToken) {
      response.cookies.set('s2s_refresh_token', effectiveRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90, // 90 days for seamless long-lived session
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
