import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const DEV_FALLBACK_ADMIN_KEY = 'sheet2suite-admin-dev-2026';

/**
 * Constant-time comparison between two strings to mitigate timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    // Perform dummy comparison to balance execution time
    crypto.timingSafeEqual(aBuffer, aBuffer);
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

/**
 * Retrieves the configured admin secret key(s).
 */
export function getConfiguredAdminKeys(): string[] {
  const envKeys = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY;
  if (envKeys) {
    return envKeys.split(',').map((k) => k.trim()).filter((k) => k.length > 0);
  }

  // In non-production environments, provide a fallback key so local development works smoothly
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
    console.error('[AdminAuth] No ADMIN_SECRET_KEY configured in production. Rejecting all admin requests.');
    return false;
  }

  return validKeys.some((validKey) => safeCompare(trimmed, validKey));
}

/**
 * Verifies whether an incoming NextRequest contains valid admin credentials.
 * Checks:
 * 1. `x-admin-key` header
 * 2. `Authorization: Bearer <key>` header
 * 3. `s2s_admin_key` cookie
 */
export function verifyAdminAuth(req: NextRequest): { authorized: boolean; reason?: string } {
  // 1. Check x-admin-key header
  const xAdminKey = req.headers.get('x-admin-key');
  if (xAdminKey && validateAdminKey(xAdminKey)) {
    return { authorized: true };
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const bearerKey = authHeader.substring(7).trim();
    if (validateAdminKey(bearerKey)) {
      return { authorized: true };
    }
  }

  // 3. Check s2s_admin_key cookie
  const cookieKey = req.cookies.get('s2s_admin_key')?.value;
  if (cookieKey && validateAdminKey(cookieKey)) {
    return { authorized: true };
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
