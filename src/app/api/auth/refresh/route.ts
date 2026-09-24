import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { LocalFirestore } from '@/lib/db/firestoreDb';

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  return new google.auth.OAuth2(clientId, clientSecret);
}

/**
 * POST /api/auth/refresh
 * Silently refreshes Google OAuth credentials using the HTTP-only refresh token cookie
 * or token document stored in Firestore. Returns fresh accessToken and updates cookies.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const spreadsheetId = body.spreadsheetId || req.nextUrl.searchParams.get('spreadsheetId') || req.headers.get('x-spreadsheet-id') || undefined;
    const userEmail = body.userEmail || req.nextUrl.searchParams.get('userEmail') || req.cookies.get('s2s_user_email')?.value || undefined;
    let refreshToken = req.cookies.get('s2s_refresh_token')?.value || body.refreshToken;

    // If not directly in cookie, look up in Firestore via spreadsheetId or userEmail
    if (!refreshToken) {
      if (userEmail) {
        const userDoc = await LocalFirestore.findAuthTokenDocAsync(userEmail);
        refreshToken = userDoc?.refreshToken;
      }
      if (!refreshToken && spreadsheetId) {
        const sheetDoc = await LocalFirestore.findAuthTokenDocAsync(spreadsheetId);
        refreshToken = sheetDoc?.refreshToken;
      }
      if (!refreshToken) {
        const fallbackDoc = await LocalFirestore.findAuthTokenDocAsync('global_fallback');
        refreshToken = fallbackDoc?.refreshToken;
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token available. User must re-authenticate.', requiresLogin: true },
        { status: 401 }
      );
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const tokenRes = await oauth2Client.getAccessToken();
    const freshAccessToken = tokenRes?.token;

    if (!freshAccessToken) {
      return NextResponse.json(
        { success: false, error: 'Google rejected token refresh. User must re-authenticate.', requiresLogin: true },
        { status: 401 }
      );
    }

    const expiryDate = Date.now() + 3500 * 1000;

    // Persist refreshed credentials to Firestore asynchronously
    const updatedRecord: any = {
      accessToken: freshAccessToken,
      refreshToken,
      expiryDate,
      userEmail: userEmail || undefined,
      spreadsheetId: spreadsheetId || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (userEmail) {
      LocalFirestore.setDocAsync('auth_tokens', userEmail, updatedRecord).catch(() => {});
    }
    if (spreadsheetId) {
      LocalFirestore.setDocAsync('auth_tokens', spreadsheetId, updatedRecord).catch(() => {});
    }

    const response = NextResponse.json({
      success: true,
      accessToken: freshAccessToken,
      expiryDate,
      userEmail,
    });

    // Update session cookies
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
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: '/',
    });

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
    console.error('[Auth Refresh] Error:', err);
    const isRevoked = err?.message?.includes('invalid_grant') || err?.code === 400 || err?.status === 400;
    return NextResponse.json(
      {
        success: false,
        error: isRevoked ? 'Google refresh token has been revoked or expired.' : err?.message || 'Token refresh failed',
        requiresLogin: Boolean(isRevoked),
      },
      { status: 401 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
