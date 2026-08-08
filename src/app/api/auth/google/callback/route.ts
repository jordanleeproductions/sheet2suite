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
      let spreadsheetId: string | undefined = existingDbWorkspaces[0]?.spreadsheetId;
      let webViewLink: string | undefined = existingDbWorkspaces[0]?.webViewLink;

      if (!spreadsheetId) {
        // Check Drive folder if not found in DB
        const sheetSearch = await drive.files.list({
          q: `'${vowFolderId}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
          fields: 'files(id, name, webViewLink)',
        });

        spreadsheetId = sheetSearch.data.files?.[0]?.id || undefined;
        webViewLink = sheetSearch.data.files?.[0]?.webViewLink || undefined;
      }

      if (!spreadsheetId) {
        const masterId = process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID;
        const copyRes = await drive.files.copy({
          fileId: masterId,
          requestBody: {
            name: `${userName}'s Wedding Database`,
            parents: [vowFolderId],
          },
          fields: 'id, name, webViewLink',
        });
        spreadsheetId = copyRes.data.id!;
        webViewLink = copyRes.data.webViewLink || undefined;
      }

      // Register or update workspace in Sheet2Suite database
      LocalLicensingDb.saveWorkspace({
        userEmail,
        spreadsheetId,
        spreadsheetName: `${userName}'s Wedding Database`,
        driveFolderPath: 'My Drive / Sheet2Suite / Sheet2Vow',
        webViewLink: webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        productName: 'Sheet2Vow',
      });

      provisionData = {
        spreadsheetId,
        folderPath: 'My Drive / Sheet2Suite / Sheet2Vow',
        webViewLink: webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      };
    } catch (pErr) {
      console.error('Provisioning step error:', pErr);
    }

    const payload = JSON.stringify({
      type: 'GOOGLE_AUTH_SUCCESS',
      user: { email: userEmail, name: userName },
      accessToken: tokens.access_token,
      provision: provisionData,
    });

    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head><title>Sheet2Suite Google Auth</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #111827; color: #ffffff;">
          <div style="text-align: center;">
            <h2 style="color: #00ED64;">✔ Google Drive Connected!</h2>
            <p>Closing window and loading your workspace...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage(${payload}, '*');
              }
            } catch (e) { console.error(e); }
            setTimeout(() => { window.close(); }, 800);
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
