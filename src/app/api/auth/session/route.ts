import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuthAsync } from '@/lib/sheets/client';

/**
 * GET /api/auth/session
 * Verifies whether the current user session / Google OAuth token is still active and valid.
 * Used before opening Add/Edit/Delete modals to prevent data loss due to expired sessions.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const spreadsheetId = url.searchParams.get('spreadsheetId') || req.headers.get('x-spreadsheet-id') || undefined;
    const token = req.headers.get('x-google-token') || req.cookies.get('google_access_token')?.value || req.cookies.get('s2s_access_token')?.value || undefined;
    const userEmail = req.cookies.get('s2s_user_email')?.value || undefined;
    const refreshTokenCookie = req.cookies.get('s2s_refresh_token')?.value || undefined;

    // In mock or demo mode, sessions never expire
    const isMock = url.searchParams.get('isMock') === 'true' || 
      req.headers.get('x-is-mock') === 'true' || 
      spreadsheetId?.startsWith('mock-') || 
      spreadsheetId?.includes('mock');
    const isDemo = url.searchParams.get('isDemo') === 'true' || req.headers.get('x-is-demo') === 'true';
    if (isMock || isDemo) {
      return NextResponse.json({ valid: true, isMock: true });
    }

    // If completely offline or no spreadsheet connected, allow local edits
    if (!spreadsheetId && !token && !refreshTokenCookie) {
      return NextResponse.json({ valid: true, localOnly: true });
    }

    // Verify Google client credentials
    let auth = await getGoogleAuthAsync(token, spreadsheetId, userEmail, refreshTokenCookie);
    let sheetsClient = google.sheets({ version: 'v4', auth });
    let freshAccessToken: string | undefined;

    // If spreadsheetId is provided, perform a lightweight check to test real token permissions
    if (spreadsheetId) {
      try {
        await sheetsClient.spreadsheets.get({
          spreadsheetId,
          fields: 'properties.title',
        });
      } catch (checkErr: any) {
        const isAuthErr = checkErr?.code === 401 || checkErr?.status === 401 || String(checkErr?.message).toLowerCase().includes('invalid authentication credentials');
        if (isAuthErr && (auth as any).getAccessToken) {
          try {
            const tokenRes = await (auth as any).getAccessToken();
            if (tokenRes?.token) {
              freshAccessToken = tokenRes.token;
              auth = await getGoogleAuthAsync(freshAccessToken, spreadsheetId, userEmail, refreshTokenCookie);
              sheetsClient = google.sheets({ version: 'v4', auth });
              await sheetsClient.spreadsheets.get({
                spreadsheetId,
                fields: 'properties.title',
              });
            }
          } catch (refreshErr) {
            console.warn('[Session] Token refresh during check failed:', refreshErr);
            throw checkErr;
          }
        } else {
          throw checkErr;
        }
      }
    }

    const response = NextResponse.json({ 
      valid: true,
      refreshed: Boolean(freshAccessToken),
      accessToken: freshAccessToken || undefined,
    });

    if (freshAccessToken) {
      response.cookies.set('s2s_access_token', freshAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    const errorMsg = String(error?.message || '').toLowerCase();
    const isAuthError = error?.code === 401 || 
      error?.status === 401 || 
      errorMsg.includes('invalid authentication credentials') ||
      errorMsg.includes('token expired') ||
      errorMsg.includes('invalid_grant') ||
      errorMsg.includes('unauthorized');

    // Only fail session validation if it is an actual authentication/authorization failure
    return NextResponse.json(
      { 
        valid: !isAuthError, 
        isAuthError: Boolean(isAuthError), 
        error: isAuthError ? 'Google OAuth session expired. Please re-authenticate.' : error?.message || 'Session validation passed with warning' 
      },
      { status: isAuthError ? 401 : 200 }
    );
  }
}
