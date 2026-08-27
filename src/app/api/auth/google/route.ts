import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

function getOAuth2Client(redirectUri?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'MOCK_CLIENT_ID';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'MOCK_CLIENT_SECRET';
  const redirect = redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
  return new google.auth.OAuth2(clientId, clientSecret, redirect);
}

/**
 * GET /api/auth/google
 * Generates and returns the Google OAuth 2.0 authorization URL for client consent.
 */
export async function GET(req: NextRequest) {
  try {
    const forwardedHost = req.headers.get('x-forwarded-host');
    const host = forwardedHost || req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    
    // Use configured environment redirect URI if available, or compute dynamically with correct forwarded headers
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}/api/auth/google/callback`;

    const oauth2Client = getOAuth2Client(redirectUri);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });

    return NextResponse.json({
      success: true,
      authUrl,
      scopes: SCOPES,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate OAuth URL' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/google
 * Exchanges authorization code or access token from Google Identity Services popup for session credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, accessToken, redirectUri } = body;

    const oauth2Client = getOAuth2Client(redirectUri);

    let tokenData: any = {};

    if (code) {
      // Exchange authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      tokenData = tokens;
    } else if (accessToken) {
      oauth2Client.setCredentials({ access_token: accessToken });
      tokenData = { access_token: accessToken };
    } else {
      return NextResponse.json(
        { success: false, error: 'Authorization code or accessToken is required.' },
        { status: 400 }
      );
    }

    // Fetch user profile info to store email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const response = NextResponse.json({
      success: true,
      user: {
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
      },
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expiry_date,
    });

    // Set secure HTTP-only cookies for access token & user email
    if (tokenData.access_token) {
      response.cookies.set('s2s_access_token', tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    if (userInfo.data.email) {
      response.cookies.set('s2s_user_email', userInfo.data.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'OAuth token exchange failed' },
      { status: 500 }
    );
  }
}
