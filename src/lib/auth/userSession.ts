import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { google } from 'googleapis';

export const USER_SESSION_COOKIE = 's2s_user_session';

export interface UserSessionPayload {
  email: string;
  iat: number;
  exp: number;
}

const globalSecretStore = globalThis as unknown as {
  __s2s_runtime_user_session_secret?: string;
};

function getUserSessionSecret(): string {
  const configured =
    process.env.USER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SECRET_KEY ||
    process.env.GOOGLE_CLIENT_SECRET;

  if (configured && configured.trim().length >= 12 && configured !== 'MOCK_CLIENT_SECRET') {
    return configured.trim();
  }

  if (!globalSecretStore.__s2s_runtime_user_session_secret) {
    globalSecretStore.__s2s_runtime_user_session_secret = crypto.randomBytes(32).toString('hex');
  }
  return globalSecretStore.__s2s_runtime_user_session_secret;
}

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Creates an HMAC-SHA256 signed session token binding the user's verified Google email.
 */
export function createUserSessionToken(email: string, maxAgeDays = 30): string {
  const payload: UserSessionPayload = {
    email: email.trim().toLowerCase(),
    iat: Date.now(),
    exp: Date.now() + maxAgeDays * 24 * 60 * 60 * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getUserSessionSecret())
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed user session token.
 */
export function verifyUserSessionToken(token: string | null | undefined): {
  valid: boolean;
  email?: string;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }
  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getUserSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  if (!safeCompare(signature, expectedSig)) {
    return { valid: false };
  }

  try {
    const payload: UserSessionPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );
    if (!payload.email || !payload.exp || Date.now() > payload.exp) {
      return { valid: false };
    }
    return { valid: true, email: payload.email.trim().toLowerCase() };
  } catch {
    return { valid: false };
  }
}

/**
 * Extracts the caller's verified email from the signed HTTP-only session cookie.
 * Never trusts an unsigned s2s_user_email cookie by itself.
 */
export function getVerifiedCookieEmail(req: NextRequest): string | undefined {
  const sessionToken = req.cookies.get(USER_SESSION_COOKIE)?.value;
  if (!sessionToken) return undefined;
  const check = verifyUserSessionToken(sessionToken);
  if (!check.valid || !check.email) return undefined;

  // If s2s_user_email cookie is also present, ensure it matches the signed session
  const rawCookieEmail = req.cookies.get('s2s_user_email')?.value?.trim().toLowerCase();
  if (rawCookieEmail && rawCookieEmail !== check.email) {
    return undefined;
  }
  return check.email;
}

/**
 * Sets both the signed s2s_user_session cookie and s2s_user_email cookie on a NextResponse.
 */
export function setSignedUserEmailCookies(response: NextResponse, email: string): void {
  const cleanEmail = email.trim().toLowerCase();
  const sessionToken = createUserSessionToken(cleanEmail, 30);

  response.cookies.set(USER_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  response.cookies.set('s2s_user_email', cleanEmail, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

/**
 * Resolves the Google account email address associated with an OAuth access token.
 */
export async function resolveGoogleTokenEmail(token: string): Promise<string | null> {
  if (!token || token === 'mock-token') return null;
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
