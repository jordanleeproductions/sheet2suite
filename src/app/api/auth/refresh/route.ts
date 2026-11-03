import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { LocalFirestore } from '@/lib/db/firestoreDb';
import {
  getVerifiedCookieEmail,
  resolveGoogleTokenEmail,
  setSignedUserEmailCookies,
} from '@/lib/auth/userSession';
import { verifyWorkspaceAuthorization } from '@/lib/auth/workspaceAuth';

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  return new google.auth.OAuth2(clientId, clientSecret);
}

/**
 * POST /api/auth/refresh
 * Silently refreshes Google OAuth credentials using the HTTP-only refresh token cookie.
 * SECURITY [VULN-1]: Verifies token owner identity before persisting tokens or setting session cookies.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const spreadsheetId =
      body.spreadsheetId ||
      req.nextUrl.searchParams.get('spreadsheetId') ||
      req.headers.get('x-spreadsheet-id') ||
      undefined;
    const requestedEmail = (
      body.userEmail ||
      req.nextUrl.searchParams.get('userEmail') ||
      ''
    )
      .trim()
      .toLowerCase();

    const refreshToken = req.cookies.get('s2s_refresh_token')?.value || body.refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No refresh token available. User must re-authenticate.',
          requiresLogin: true,
        },
        { status: 401 }
      );
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const tokenRes = await oauth2Client.getAccessToken();
    const freshAccessToken = tokenRes?.token;

    if (!freshAccessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google rejected token refresh. User must re-authenticate.',
          requiresLogin: true,
        },
        { status: 401 }
      );
    }

    // Resolve actual Google account email from signed session cookie or Google tokeninfo
    let verifiedEmail =
      getVerifiedCookieEmail(req) || (await resolveGoogleTokenEmail(freshAccessToken)) || undefined;

    if (requestedEmail && verifiedEmail && requestedEmail !== verifiedEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Requested userEmail does not match authenticated token owner.',
        },
        { status: 403 }
      );
    }

    const expiryDate = Date.now() + 3500 * 1000;

    const updatedRecord: any = {
      accessToken: freshAccessToken,
      refreshToken,
      expiryDate,
      userEmail: verifiedEmail || undefined,
      spreadsheetId: spreadsheetId || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (verifiedEmail) {
      LocalFirestore.setDocAsync('auth_tokens', verifiedEmail, updatedRecord).catch(() => {});
    }

    if (spreadsheetId && verifiedEmail) {
      const wsAuth = await verifyWorkspaceAuthorization({
        spreadsheetId,
        userEmail: verifiedEmail,
        accessToken: freshAccessToken,
        refreshToken,
      });
      if (wsAuth.authorized) {
        LocalFirestore.setDocAsync('auth_tokens', spreadsheetId, updatedRecord).catch(() => {});
      }
    }

    const response = NextResponse.json({
      success: true,
      accessToken: freshAccessToken,
      expiryDate,
      userEmail: verifiedEmail,
    });

    response.cookies.set('s2s_access_token', freshAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('s2s_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90,
      path: '/',
    });

    if (verifiedEmail) {
      setSignedUserEmailCookies(response, verifiedEmail);
    }

    return response;
  } catch (err: any) {
    console.error('[Auth Refresh] Error:', err);
    const isRevoked =
      err?.message?.includes('invalid_grant') || err?.code === 400 || err?.status === 400;
    return NextResponse.json(
      {
        success: false,
        error: isRevoked
          ? 'Google refresh token has been revoked or expired.'
          : err?.message || 'Token refresh failed',
        requiresLogin: Boolean(isRevoked),
      },
      { status: 401 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
