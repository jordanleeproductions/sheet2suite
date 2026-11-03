import { NextRequest, NextResponse } from 'next/server';
import { LocalFirestore } from '@/lib/db/firestoreDb';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
import {
  getVerifiedCookieEmail,
  resolveGoogleTokenEmail,
  setSignedUserEmailCookies,
} from '@/lib/auth/userSession';
import { verifyWorkspaceAuthorization, isMockSpreadsheet } from '@/lib/auth/workspaceAuth';

/**
 * POST /api/auth/register-token
 * Links the current spreadsheet ID to the user's verified Google auth tokens in Cloud Firestore.
 * SECURITY [VULN-1]: Enforces caller authentication and workspace ownership before writing auth_tokens.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spreadsheetId, userEmail, accessToken } = body;

    if (!spreadsheetId && !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing spreadsheetId or userEmail' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value;
    const effectiveAccessToken = accessToken || bearerToken || cookieToken;
    const existingRefreshToken = req.cookies.get('s2s_refresh_token')?.value || body.refreshToken;

    // 1. Verify caller identity via signed session cookie or Google accessToken verification
    let verifiedEmail = getVerifiedCookieEmail(req);
    if (!verifiedEmail && effectiveAccessToken && effectiveAccessToken !== 'mock-token') {
      verifiedEmail = (await resolveGoogleTokenEmail(effectiveAccessToken)) || undefined;
    }

    if (!verifiedEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Valid authenticated Google session is required to register tokens.',
        },
        { status: 401 }
      );
    }

    // 2. Reject cross-account spoofing attempts
    if (userEmail && String(userEmail).trim().toLowerCase() !== verifiedEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Cannot register auth tokens for another user email.',
        },
        { status: 403 }
      );
    }

    // 3. If binding a spreadsheetId, ensure it is not owned by another user
    if (spreadsheetId && !isMockSpreadsheet(spreadsheetId)) {
      const existingWs = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(spreadsheetId);
      const existingSheetToken = await LocalFirestore.getDocAsync<any>('auth_tokens', spreadsheetId);

      if (existingWs || existingSheetToken?.userEmail) {
        const wsAuth = await verifyWorkspaceAuthorization({
          spreadsheetId,
          userEmail: verifiedEmail,
          accessToken: effectiveAccessToken,
          refreshToken: existingRefreshToken,
        });
        if (!wsAuth.authorized) {
          return NextResponse.json(
            {
              success: false,
              error: wsAuth.error || 'Forbidden: Not authorized for this spreadsheet.',
            },
            { status: 403 }
          );
        }
      }
    }

    const tokenData: any = {
      userEmail: verifiedEmail,
      spreadsheetId: spreadsheetId || undefined,
      accessToken: effectiveAccessToken || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existingRefreshToken) {
      tokenData.refreshToken = existingRefreshToken;
    }

    if (spreadsheetId && !isMockSpreadsheet(spreadsheetId)) {
      await LocalFirestore.setDocAsync('auth_tokens', spreadsheetId, tokenData);
    }
    await LocalFirestore.setDocAsync('auth_tokens', verifiedEmail, tokenData);

    const response = NextResponse.json({
      success: true,
      registeredSheet: spreadsheetId,
      registeredEmail: verifiedEmail,
      hasRefreshToken: Boolean(existingRefreshToken),
    });

    setSignedUserEmailCookies(response, verifiedEmail);

    if (existingRefreshToken) {
      response.cookies.set('s2s_refresh_token', existingRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90,
        path: '/',
      });
    }

    if (effectiveAccessToken) {
      response.cookies.set('s2s_access_token', effectiveAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    console.error('[Register Token] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
