import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const DEV_FALLBACK_ADMIN_KEY = 'sheet2suite-admin-dev-2026';
export const ADMIN_SESSION_COOKIE = 's2s_admin_session';

export interface AdminUserSession {
  email: string;
  name?: string;
  picture?: string;
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Constant-time comparison between two strings to mitigate timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    crypto.timingSafeEqual(aBuffer, aBuffer);
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

/**
 * Retrieves the configured authorized admin emails from environment variables.
 * Defaults to the designated owner email if unset.
 */
export function getConfiguredAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.ADMIN_AUTHORIZED_EMAILS;
  if (envEmails) {
    const list = envEmails
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);
    if (!list.includes('jordanleeproductions@gmail.com')) {
      list.push('jordanleeproductions@gmail.com');
    }
    return list;
  }
  return ['jordanleeproductions@gmail.com'];
}

/**
 * Validates whether a given email is on the authorized administrator allowlist.
 */
export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  const allowed = getConfiguredAdminEmails();
  return allowed.includes(normalized);
}

/**
 * Retrieves the secret used for signing admin session tokens.
 */
const globalAdminSecretStore = globalThis as unknown as {
  __s2s_runtime_admin_secret?: string;
};

function getSessionSecret(): string {
  const configured =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SECRET_KEY ||
    process.env.GOOGLE_CLIENT_SECRET;
  if (configured && configured.trim().length >= 12 && configured !== 'MOCK_CLIENT_SECRET') {
    return configured.trim();
  }
  if (!globalAdminSecretStore.__s2s_runtime_admin_secret) {
    globalAdminSecretStore.__s2s_runtime_admin_secret = crypto.randomBytes(32).toString('hex');
  }
  return globalAdminSecretStore.__s2s_runtime_admin_secret;
}

/**
 * Generates an HMAC-SHA256 signed session token for an authenticated administrator.
 */
export function createAdminSessionToken(user: { email: string; name?: string; picture?: string }): string {
  const payload: AdminUserSession = {
    email: user.email.trim().toLowerCase(),
    name: user.name,
    picture: user.picture,
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', getSessionSecret()).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-signed admin session token.
 */
export function verifyAdminSessionToken(token: string | null | undefined): {
  valid: boolean;
  admin?: AdminUserSession;
  error?: string;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing session token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed session token' };
  }

  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', getSessionSecret()).update(payloadB64).digest('base64url');

  if (!safeCompare(signature, expectedSig)) {
    return { valid: false, error: 'Invalid session signature' };
  }

  try {
    const payload: AdminUserSession = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return { valid: false, error: 'Admin session expired' };
    }
    if (!isAuthorizedAdminEmail(payload.email)) {
      return { valid: false, error: 'Email unauthorized' };
    }
    return { valid: true, admin: payload };
  } catch {
    return { valid: false, error: 'Invalid session payload' };
  }
}

/**
 * Retrieves the configured legacy admin secret key(s).
 */
export function getConfiguredAdminKeys(): string[] {
  const envKeys = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY;
  if (envKeys) {
    return envKeys.split(',').map((k) => k.trim()).filter((k) => k.length > 0);
  }

  if (process.env.NODE_ENV !== 'production') {
    return [DEV_FALLBACK_ADMIN_KEY];
  }

  return [];
}

/**
 * Validates a provided admin key against configured secrets using constant-time comparison.
 */
export function validateAdminKey(candidateKey: string | null | undefined): boolean {
  if (!candidateKey || typeof candidateKey !== 'string') return false;
  const trimmed = candidateKey.trim();
  if (!trimmed) return false;

  const validKeys = getConfiguredAdminKeys();
  if (validKeys.length === 0) {
    return false;
  }

  return validKeys.some((validKey) => safeCompare(trimmed, validKey));
}

/**
 * Verifies whether an incoming NextRequest contains valid admin credentials.
 * Priority:
 * 1. Google OAuth Admin Session Cookie (`s2s_admin_session`)
 * 2. Developer / CLI Fallback: `x-admin-key` header
 * 3. Developer / CLI Fallback: `Authorization: Bearer <key>` header
 * 4. Developer / CLI Fallback: `s2s_admin_key` cookie
 */
export function verifyAdminAuth(req: NextRequest): {
  authorized: boolean;
  adminUser?: AdminUserSession;
  adminEmail?: string;
  authMethod?: 'google' | 'key';
  reason?: string;
} {
  // 1. Google OAuth Admin Session Cookie (Highest Priority)
  const sessionCookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (sessionCookie) {
    const sessionCheck = verifyAdminSessionToken(sessionCookie);
    if (sessionCheck.valid && sessionCheck.admin) {
      return {
        authorized: true,
        adminUser: sessionCheck.admin,
        adminEmail: sessionCheck.admin.email,
        authMethod: 'google',
      };
    }
  }

  // 2. Fallback: Check x-admin-key header
  const xAdminKey = req.headers.get('x-admin-key');
  if (xAdminKey && validateAdminKey(xAdminKey)) {
    return {
      authorized: true,
      authMethod: 'key',
      adminEmail: 'developer@sheet2suite.com',
      adminUser: {
        email: 'developer@sheet2suite.com',
        name: 'Developer Key Admin',
        role: 'admin',
        iat: Date.now(),
        exp: Date.now() + 86400000,
      },
    };
  }

  // 3. Fallback: Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const bearerKey = authHeader.substring(7).trim();
    if (validateAdminKey(bearerKey)) {
      return {
        authorized: true,
        authMethod: 'key',
        adminEmail: 'developer@sheet2suite.com',
        adminUser: {
          email: 'developer@sheet2suite.com',
          name: 'Developer Key Admin',
          role: 'admin',
          iat: Date.now(),
          exp: Date.now() + 86400000,
        },
      };
    }
  }

  // 4. Fallback: Check legacy s2s_admin_key cookie
  const cookieKey = req.cookies.get('s2s_admin_key')?.value;
  if (cookieKey && validateAdminKey(cookieKey)) {
    return {
      authorized: true,
      authMethod: 'key',
      adminEmail: 'developer@sheet2suite.com',
      adminUser: {
        email: 'developer@sheet2suite.com',
        name: 'Developer Key Admin',
        role: 'admin',
        iat: Date.now(),
        exp: Date.now() + 86400000,
      },
    };
  }

  return {
    authorized: false,
    reason: 'Missing or invalid admin authorization credentials.',
  };
}

/**
 * Standard HTTP guard: returns a 401 Unauthorized NextResponse if the request is not admin-authorized,
 * or null if authorized.
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  const result = verifyAdminAuth(req);
  if (!result.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: result.reason || 'Unauthorized: Admin authentication required.',
      },
      { status: 401 }
    );
  }
  return null;
}
