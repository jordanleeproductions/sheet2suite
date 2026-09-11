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
    const isMock = url.searchParams.get('isMock') === 'true' || req.headers.get('x-is-mock') === 'true';
    const isDemo = url.searchParams.get('isDemo') === 'true' || req.headers.get('x-is-demo') === 'true';
    if (isMock || isDemo) {
      return NextResponse.json({ valid: true, isMock: true });
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
    const isAuthError = error?.code === 401 || 
      error?.status === 401 || 
      String(error?.message).toLowerCase().includes('invalid authentication credentials') ||
      String(error?.message).toLowerCase().includes('token expired') ||
      String(error?.message).toLowerCase().includes('invalid_grant');

    return NextResponse.json(
      { 
        valid: false, 
        isAuthError: Boolean(isAuthError), 
        error: isAuthError ? 'Google OAuth session expired. Please re-authenticate.' : error?.message || 'Session validation failed' 
      },
      { status: isAuthError ? 401 : 200 }
    );
  }
}
