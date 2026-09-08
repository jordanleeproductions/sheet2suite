import { NextRequest, NextResponse } from 'next/server';
import { LocalFirestore } from '@/lib/db/firestoreDb';

/**
 * POST /api/auth/register-token
 * Links the current spreadsheet ID to the user's Google auth tokens in Cloud Firestore.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spreadsheetId, userEmail, accessToken } = body;

    if (!spreadsheetId && !userEmail) {
      return NextResponse.json({ success: false, error: 'Missing spreadsheetId or userEmail' }, { status: 400 });
    }

    // Lookup existing refreshToken from userEmail or spreadsheetId
    let existingRefreshToken: string | undefined;
    if (userEmail) {
      const userDoc = await LocalFirestore.findAuthTokenDocAsync(userEmail);
      existingRefreshToken = userDoc?.refreshToken;
    }
    if (!existingRefreshToken && spreadsheetId) {
      const sheetDoc = await LocalFirestore.findAuthTokenDocAsync(spreadsheetId);
      existingRefreshToken = sheetDoc?.refreshToken;
    }

    const tokenData: any = {
      userEmail: userEmail || undefined,
      spreadsheetId: spreadsheetId || undefined,
      accessToken: accessToken || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (existingRefreshToken) {
      tokenData.refreshToken = existingRefreshToken;
    }

    // Persist to Cloud Firestore & Local storage
    if (spreadsheetId) {
      await LocalFirestore.setDocAsync('auth_tokens', spreadsheetId, tokenData);
    }
    if (userEmail) {
      await LocalFirestore.setDocAsync('auth_tokens', userEmail, tokenData);
    }

    return NextResponse.json({
      success: true,
      registeredSheet: spreadsheetId,
      registeredEmail: userEmail,
      hasRefreshToken: Boolean(existingRefreshToken),
    });
  } catch (error: any) {
    console.error('[Register Token] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
