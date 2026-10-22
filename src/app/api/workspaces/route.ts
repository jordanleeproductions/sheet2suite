import { NextRequest, NextResponse } from 'next/server';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
import { verifyAdminAuth } from '@/lib/auth/adminAuth';

/**
 * Helper to extract and verify the caller's authenticated identity.
 * Validates either:
 * 1. Admin authorization (x-admin-key / Bearer admin key / s2s_admin_key cookie)
 * 2. Authenticated user session via HTTP-only cookies (s2s_user_email + tokens) or Google Bearer token.
 */
async function resolveCallerIdentity(req: NextRequest): Promise<{
  isAdmin: boolean;
  authenticatedEmail?: string;
  token?: string;
  refreshToken?: string;
}> {
  const adminAuth = verifyAdminAuth(req);
  if (adminAuth.authorized) {
    return { isAdmin: true };
  }

  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
  const cookieToken = req.cookies.get('s2s_access_token')?.value || req.cookies.get('google_access_token')?.value;
  const token = bearerToken || cookieToken;
  const refreshToken = req.cookies.get('s2s_refresh_token')?.value;
  const cookieEmail = req.cookies.get('s2s_user_email')?.value?.trim().toLowerCase();

  let authenticatedEmail = cookieEmail;

  // If cookie email not present but access token provided, verify with Google to obtain caller email
  if (!authenticatedEmail && token) {
    try {
      const { google } = await import('googleapis');
      const oauth2 = google.oauth2({ version: 'v2' });
      const tokenInfo = await oauth2.tokeninfo({ access_token: token });
      if (tokenInfo.data?.email) {
        authenticatedEmail = tokenInfo.data.email.trim().toLowerCase();
      }
    } catch (tokenErr) {
      console.warn('[Workspaces Auth] Could not resolve token with Google:', tokenErr);
    }
  }

  return {
    isAdmin: false,
    authenticatedEmail,
    token,
    refreshToken,
  };
}

/**
 * GET /api/workspaces?email=user@gmail.com
 * Fetches all active Sheet2Suite spreadsheets registered to the user or their partner.
 * SEC-6: Enforces caller session authentication and prevents email/workspace enumeration.
 */
export async function GET(req: NextRequest) {
  try {
    const caller = await resolveCallerIdentity(req);
    const url = req.nextUrl;
    const requestedEmail = url.searchParams.get('email')?.trim().toLowerCase();

    // 1. Admin authorization bypass
    if (caller.isAdmin) {
      const targetEmail = requestedEmail || req.cookies.get('s2s_user_email')?.value;
      if (!targetEmail) {
        return NextResponse.json(
          { success: false, error: 'Admin query requires an email query parameter.' },
          { status: 400 }
        );
      }
      const records = await LocalLicensingDb.getWorkspacesByEmailAsync(targetEmail);
      return NextResponse.json({
        success: true,
        userEmail: targetEmail,
        count: records.length,
        workspaces: records,
        isAdmin: true,
      });
    }

    // 2. Caller must have an active authenticated session
    if (!caller.authenticatedEmail || (!caller.token && !caller.refreshToken && !req.cookies.get('s2s_user_email')?.value)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active user authentication session required.' },
        { status: 401 }
      );
    }

    // 3. SEC-6 Guard: Prevent email enumeration and cross-account data leakage
    if (requestedEmail && requestedEmail !== caller.authenticatedEmail) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access workspaces for another user account.' },
        { status: 403 }
      );
    }

    const effectiveEmail = caller.authenticatedEmail;
    let records = await LocalLicensingDb.getWorkspacesByEmailAsync(effectiveEmail);

    // Auto-Discovery Fallback: If no records found in database, check Google Drive if session token exists
    if (records.length === 0) {
      try {
        if (caller.token || caller.refreshToken) {
          const { getGoogleAuthAsync } = await import('@/lib/sheets/client');
          const { google } = await import('googleapis');
          const auth = await getGoogleAuthAsync(caller.token, undefined, effectiveEmail, caller.refreshToken);
          const drive = google.drive({ version: 'v3', auth });

          const driveSearch = await drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.spreadsheet' and (name contains 'Sheet2Vow' or name contains 'Wedding') and trashed = false",
            fields: 'files(id, name, webViewLink, modifiedTime)',
            orderBy: 'modifiedTime desc',
            pageSize: 5,
          });

          if (driveSearch.data.files && driveSearch.data.files.length > 0) {
            for (const file of driveSearch.data.files) {
              if (file.id) {
                const autoRegistered = await LocalLicensingDb.saveWorkspaceAsync({
                  userEmail: effectiveEmail,
                  spreadsheetId: file.id,
                  spreadsheetName: file.name || 'Wedding Database',
                  driveFolderPath: 'My Drive / Sheet2Suite / Sheet2Vow',
                  webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
                  productName: 'Sheet2Vow',
                  orderVerified: true,
                });
                records.push(autoRegistered);
              }
            }
          }
        }
      } catch (driveErr) {
        console.warn('[Workspaces GET] Could not perform Drive auto-discovery fallback:', driveErr);
      }
    }

    return NextResponse.json({
      success: true,
      userEmail: effectiveEmail,
      count: records.length,
      workspaces: records,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user workspaces.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * Registers or updates a spreadsheet workspace mapping in the Sheet2Suite database.
 * SEC-6: Requires authenticated caller session or admin key, preventing arbitrary workspace injection.
 */
export async function POST(req: NextRequest) {
  try {
    const caller = await resolveCallerIdentity(req);

    const body = await req.json();
    const {
      userEmail,
      partnerEmail,
      coPlanners,
      spreadsheetId,
      spreadsheetName,
      driveFolderPath,
      webViewLink,
      productName = 'Sheet2Vow',
      orderId,
      orderVerified = true,
    } = body;

    if (!userEmail || !spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'userEmail and spreadsheetId are required.' },
        { status: 400 }
      );
    }

    // 1. If not admin, require authenticated session
    if (!caller.isAdmin) {
      if (!caller.authenticatedEmail) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Authentication required to register workspace.' },
          { status: 401 }
        );
      }

      // SEC-6 Guard: Prevent registering or claiming workspaces on behalf of another user
      const normalizedUserEmail = String(userEmail).trim().toLowerCase();
      if (normalizedUserEmail !== caller.authenticatedEmail) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Cannot register workspace for another user account.' },
          { status: 403 }
        );
      }
    }

    const resolvedUserEmail = caller.isAdmin ? String(userEmail).trim().toLowerCase() : caller.authenticatedEmail!;

    const resolvedCoPlanners = Array.isArray(coPlanners)
      ? coPlanners.map((cp) => String(cp).trim().toLowerCase()).filter(Boolean)
      : partnerEmail
      ? [String(partnerEmail).trim().toLowerCase()]
      : [];

    const saved = await LocalLicensingDb.saveWorkspaceAsync({
      userEmail: resolvedUserEmail,
      partnerEmail: partnerEmail ? String(partnerEmail).trim().toLowerCase() : undefined,
      coPlanners: resolvedCoPlanners,
      spreadsheetId: String(spreadsheetId).trim(),
      spreadsheetName: spreadsheetName || 'Wedding Database',
      driveFolderPath: driveFolderPath || 'My Drive / Sheet2Suite / Sheet2Vow',
      webViewLink: webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      productName,
      orderId: orderId || undefined,
      orderVerified: Boolean(orderVerified),
    });

    return NextResponse.json({
      success: true,
      message: 'Workspace registered successfully in Sheet2Suite database.',
      workspace: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save workspace.' },
      { status: 500 }
    );
  }
}
