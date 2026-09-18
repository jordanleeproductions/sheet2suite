import { google } from 'googleapis';

export const DEFAULT_MASTER_SHEET_ID = '1h_RGirRXv_4zXjqvhJnRlSJ-OnqxPeK9f3M_Eep4RcI';

/**
 * Returns an authorized Google Auth client.
 * It will try to use the provided access token from the client request first.
 * If not provided or expired, it looks up the stored refresh_token in Firestore / Local storage.
 * If not found, falls back to GOOGLE_ACCESS_TOKEN or service account.
 */
export async function getGoogleAuthAsync(accessToken?: string, spreadsheetIdOrEmail?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  // If a refresh token is stored in Firestore for this spreadsheet or user, configure credentials
  if (spreadsheetIdOrEmail) {
    try {
      const { LocalFirestore } = await import('@/lib/db/firestoreDb');
      const tokenDoc = await LocalFirestore.findAuthTokenDocAsync(spreadsheetIdOrEmail);
      if (tokenDoc?.refreshToken) {
        oauth2Client.setCredentials({
          access_token: accessToken || tokenDoc.accessToken,
          refresh_token: tokenDoc.refreshToken,
          expiry_date: tokenDoc.expiryDate,
        });

        // Proactively refresh if accessToken is missing, expired, or expiring in < 5 minutes
        const now = Date.now();
        const isExpiring = !tokenDoc.accessToken || !tokenDoc.expiryDate || (tokenDoc.expiryDate - now < 5 * 60 * 1000);
        if (isExpiring) {
          try {
            const tokenRes = await oauth2Client.getAccessToken();
            const freshAccessToken = tokenRes?.token;
            if (freshAccessToken) {
              oauth2Client.setCredentials({
                access_token: freshAccessToken,
                refresh_token: tokenDoc.refreshToken,
                expiry_date: now + 3500 * 1000,
              });

              // Persist refreshed accessToken back to Firestore asynchronously
              const updatedDoc = {
                ...tokenDoc,
                accessToken: freshAccessToken,
                expiryDate: now + 3500 * 1000,
                updatedAt: new Date().toISOString(),
              };

              if (spreadsheetIdOrEmail) {
                await LocalFirestore.setDocAsync('auth_tokens', spreadsheetIdOrEmail, updatedDoc);
              }
              if (tokenDoc.userEmail && tokenDoc.userEmail !== spreadsheetIdOrEmail) {
                await LocalFirestore.setDocAsync('auth_tokens', tokenDoc.userEmail, updatedDoc);
              }
              if (tokenDoc.spreadsheetId && tokenDoc.spreadsheetId !== spreadsheetIdOrEmail) {
                await LocalFirestore.setDocAsync('auth_tokens', tokenDoc.spreadsheetId, updatedDoc);
              }
            }
          } catch (refreshErr) {
            console.warn('[Google Auth] Proactive refresh error:', refreshErr);
          }
        }

        return oauth2Client;
      }
      if (accessToken || tokenDoc?.accessToken) {
        oauth2Client.setCredentials({
          access_token: accessToken || tokenDoc?.accessToken,
          expiry_date: tokenDoc?.expiryDate,
        });
        return oauth2Client;
      }
    } catch (e) {
      console.warn('[Google Auth] Could not lookup refresh token:', e);
    }
  }

  const token = accessToken || process.env.GOOGLE_ACCESS_TOKEN;
  if (token) {
    oauth2Client.setCredentials({ access_token: token });
    return oauth2Client;
  }

  // Fallback to service account credentials if available
  if (
    process.env.GOOGLE_CLIENT_EMAIL && 
    (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY_BASE64)
  ) {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    if (process.env.GOOGLE_PRIVATE_KEY_BASE64) {
      privateKey = Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
    }
    
    // Replace literal newlines if they get escaped in env vars
    privateKey = privateKey.replace(/\\n/g, '\n');

    return new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ]
    });
  }

  throw new Error(
    'Unauthorized: Google OAuth Access Token is required. ' +
    'Provide it in the Authorization header or set the GOOGLE_ACCESS_TOKEN environment variable.'
  );
}

export function getGoogleAuth(accessToken?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  const token = accessToken || process.env.GOOGLE_ACCESS_TOKEN;
  if (token) {
    oauth2Client.setCredentials({ access_token: token });
    return oauth2Client;
  }

  // Fallback to service account credentials if available
  if (
    process.env.GOOGLE_CLIENT_EMAIL && 
    (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY_BASE64)
  ) {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    if (process.env.GOOGLE_PRIVATE_KEY_BASE64) {
      privateKey = Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
    }
    
    privateKey = privateKey.replace(/\\n/g, '\n');

    return new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ]
    });
  }

  throw new Error(
    'Unauthorized: Google OAuth Access Token is required. ' +
    'Provide it in the Authorization header or set the GOOGLE_ACCESS_TOKEN environment variable.'
  );
}

export function getSheetsClient(accessToken?: string) {
  const auth = getGoogleAuth(accessToken);
  return google.sheets({ version: 'v4', auth });
}

export function getDriveClient(accessToken?: string) {
  const auth = getGoogleAuth(accessToken);
  return google.drive({ version: 'v3', auth });
}
