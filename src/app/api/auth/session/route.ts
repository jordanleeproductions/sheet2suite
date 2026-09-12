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
    const token = req.headers.get('x-google-token') || req.cookies.get('google_access_token')?.value || undefined;

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
    if (!spreadsheetId && !token) {
      return NextResponse.json({ valid: true, localOnly: true });
    }

    // Verify Google client credentials
    const auth = await getGoogleAuthAsync(token, spreadsheetId);
    const sheetsClient = google.sheets({ version: 'v4', auth });

    // If spreadsheetId is provided, perform a lightweight check to test real token permissions
    if (spreadsheetId) {
      await sheetsClient.spreadsheets.get({
        spreadsheetId,
        fields: 'properties.title',
      });
    }

    return NextResponse.json({ valid: true });
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
