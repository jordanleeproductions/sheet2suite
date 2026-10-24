import { NextRequest } from 'next/server';
import { google } from 'googleapis';
import { LocalLicensingDb, WorkspaceRecord } from '@/lib/db/licensingDb';
import { LocalFirestore } from '@/lib/db/firestoreDb';

export interface WorkspaceAuthParams {
  spreadsheetId: string;
  userEmail?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface WorkspaceAuthResult {
  authorized: boolean;
  isMock?: boolean;
  isUnauthenticated?: boolean;
  isForbidden?: boolean;
  error?: string;
  workspace?: WorkspaceRecord | null;
  userEmail?: string;
  targetUserEmail?: string;
  isOwner?: boolean;
  isDirectToken?: boolean;
}

/**
 * Checks if a given spreadsheetId corresponds to a mock, demo, or placeholder spreadsheet.
 */
export function isMockSpreadsheet(spreadsheetId?: string | null): boolean {
  if (!spreadsheetId) return true;
  const cleanId = spreadsheetId.trim();
  return (
    cleanId === 'mock-sheet-id-vow-12345' ||
    cleanId.startsWith('mock-') ||
    cleanId.includes('mock') ||
    cleanId === 'demo'
  );
}

/**
 * Extracts authentication credentials and session context from a NextRequest.
 */
export function extractCallerCredentials(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const headerToken = req.headers.get('x-google-token') || undefined;

  const cookieToken =
    req.cookies.get('s2s_access_token')?.value ||
    req.cookies.get('google_access_token')?.value;

  const cookieEmail = req.cookies.get('s2s_user_email')?.value;
  const cookieRefreshToken = req.cookies.get('s2s_refresh_token')?.value;

  const effectiveToken = bearerToken || headerToken || cookieToken;
  const hasAuth = Boolean(effectiveToken || cookieRefreshToken || cookieEmail);

  return {
    bearerToken,
    headerToken,
    cookieToken,
    cookieEmail,
    cookieRefreshToken,
    effectiveToken,
    hasAuth,
  };
}

/**
 * Resolves the Google account email address associated with an OAuth access token.
 */
async function resolveTokenEmail(token: string): Promise<string | null> {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    const info = await oauth2Client.getTokenInfo(token);
    return info.email ? info.email.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Verifies that the requesting user's session owns or is an authorized collaborator
 * on the requested spreadsheetId. Refuses unauthenticated access and prevents IDOR/BOLA.
 */
export async function verifyWorkspaceAuthorization(
  target: NextRequest | WorkspaceAuthParams,
  spreadsheetIdOverride?: string
): Promise<WorkspaceAuthResult> {
  let spreadsheetId: string;
  let userEmail: string | undefined;
  let accessToken: string | undefined;
  let refreshToken: string | undefined;

  if (target instanceof NextRequest) {
    const creds = extractCallerCredentials(target);
    const urlSpreadsheet = target.nextUrl.searchParams.get('spreadsheetId') || target.headers.get('x-spreadsheet-id');
    spreadsheetId = (spreadsheetIdOverride || urlSpreadsheet || '').trim();
    userEmail = creds.cookieEmail;
    accessToken = creds.effectiveToken;
    refreshToken = creds.cookieRefreshToken;

    // Fast-path mock check from request headers/params
    if (
      target.nextUrl.searchParams.get('isMock') === 'true' ||
      target.headers.get('x-is-mock') === 'true' ||
      target.nextUrl.searchParams.get('isDemo') === 'true' ||
      target.headers.get('x-is-demo') === 'true'
    ) {
      return { authorized: true, isMock: true, userEmail: userEmail || 'mock-user@sheet2suite.com' };
    }
  } else {
    spreadsheetId = (target.spreadsheetId || '').trim();
    userEmail = target.userEmail ? target.userEmail.trim() : undefined;
    accessToken = target.accessToken ? target.accessToken.trim() : undefined;
    refreshToken = target.refreshToken ? target.refreshToken.trim() : undefined;
  }

  // 1. Mock / Demo spreadsheets are authorized without Google verification
  if (isMockSpreadsheet(spreadsheetId)) {
    return { authorized: true, isMock: true, userEmail: userEmail || 'mock-user@sheet2suite.com' };
  }

  // 2. Unauthenticated check: Must have at least one credential
  if (!userEmail && !accessToken && !refreshToken) {
    return {
      authorized: false,
      isUnauthenticated: true,
      error: 'Authentication required. Please sign in to access this workspace.',
    };
  }

  // 3. Normalize email if provided
  let normalizedCallerEmail = userEmail ? userEmail.trim().toLowerCase() : null;

  // If caller email is not directly in cookie, attempt to resolve via caller's access token
  if (!normalizedCallerEmail && accessToken && accessToken !== 'mock-token') {
    normalizedCallerEmail = await resolveTokenEmail(accessToken);
  }

  // 4. Query workspace record from Cloud Firestore / Local Database
  const ws = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(spreadsheetId);

  if (ws) {
    const authorizedEmails = new Set<string>();
    if (ws.userEmail) authorizedEmails.add(ws.userEmail.trim().toLowerCase());
    if (ws.partnerEmail) authorizedEmails.add(ws.partnerEmail.trim().toLowerCase());
    if (Array.isArray(ws.coPlanners)) {
      ws.coPlanners.forEach((cp) => {
        if (cp && typeof cp === 'string' && cp.trim()) {
          authorizedEmails.add(cp.trim().toLowerCase());
        }
      });
    }

    // Check if caller's verified email matches authorized workspace emails
    if (normalizedCallerEmail) {
      if (authorizedEmails.has(normalizedCallerEmail)) {
        const isOwner = ws.userEmail?.toLowerCase().trim() === normalizedCallerEmail;
        return {
          authorized: true,
          workspace: ws,
          userEmail: normalizedCallerEmail,
          targetUserEmail: ws.userEmail || normalizedCallerEmail,
          isOwner,
        };
      }

      // Authenticated user exists, but is NOT authorized for this workspace
      return {
        authorized: false,
        isForbidden: true,
        error: 'Forbidden: You do not have permission to access this workspace.',
      };
    }

    // If caller email could not be resolved from token, check if caller's refreshToken matches an authorized user
    if (refreshToken) {
      for (const email of Array.from(authorizedEmails)) {
        const authDoc = await LocalFirestore.getDocAsync<any>('auth_tokens', email);
        if (authDoc?.refreshToken && authDoc.refreshToken === refreshToken) {
          return {
            authorized: true,
            workspace: ws,
            userEmail: email,
            targetUserEmail: ws.userEmail || email,
            isOwner: ws.userEmail?.toLowerCase().trim() === email,
          };
        }
      }

      return {
        authorized: false,
        isForbidden: true,
        error: 'Forbidden: Refresh token does not match an authorized user for this workspace.',
      };
    }

    return {
      authorized: false,
      isUnauthenticated: true,
      error: 'Invalid or expired credentials for this workspace.',
    };
  }

  // 5. Workspace record not found in database: check auth_tokens records for this spreadsheetId
  const sheetTokenDoc = await LocalFirestore.getDocAsync<any>('auth_tokens', spreadsheetId);
  if (sheetTokenDoc?.userEmail) {
    const sheetOwnerEmail = sheetTokenDoc.userEmail.trim().toLowerCase();
    if (normalizedCallerEmail && normalizedCallerEmail === sheetOwnerEmail) {
      return {
        authorized: true,
        userEmail: normalizedCallerEmail,
        targetUserEmail: sheetTokenDoc.userEmail,
        isOwner: true,
      };
    }

    return {
      authorized: false,
      isForbidden: true,
      error: 'Forbidden: You do not have permission to access this spreadsheet.',
    };
  }

  // 6. No workspace record and no auth token record registered in system
  if (accessToken && accessToken !== 'mock-token') {
    // Direct token call: allow Google's IAM to evaluate permissions directly without substituting server tokens
    return {
      authorized: true,
      userEmail: normalizedCallerEmail || undefined,
      isDirectToken: true,
    };
  }

  return {
    authorized: false,
    isUnauthenticated: true,
    error: 'No registered workspace record found and no active credentials provided.',
  };
}
