import crypto from 'crypto';

export const OAUTH_NONCE_COOKIE = 's2s_oauth_nonce';
export const OAUTH_NONCE_MAX_AGE_SECONDS = 15 * 60; // 15 minutes

export interface OAuthStatePayload {
  nonce: string;
  ts: number;
  spreadsheetId?: string;
  origin?: string;
  [key: string]: any;
}

export interface VerifyOAuthStateResult {
  valid: boolean;
  payload?: OAuthStatePayload;
  error?: string;
}

/**
 * Generates an unpredictable cryptographic nonce and packages it into an OAuth state string.
 */
export function generateOAuthStatePayload(extra?: {
  spreadsheetId?: string;
  origin?: string;
  [key: string]: any;
}): { state: string; nonce: string } {
  const nonce = crypto.randomBytes(32).toString('hex');
  const payload: OAuthStatePayload = {
    nonce,
    ts: Date.now(),
    ...(extra || {}),
  };

  return {
    state: JSON.stringify(payload),
    nonce,
  };
}

/**
 * Validates the incoming OAuth state string against the user's stored HTTP-only nonce cookie.
 * Uses timing-safe string comparison and enforces a strict expiration window.
 */
export function verifyOAuthStateNonce(
  stateParam: string | null | undefined,
  cookieNonce: string | null | undefined,
  maxAgeMs: number = OAUTH_NONCE_MAX_AGE_SECONDS * 1000
): VerifyOAuthStateResult {
  if (!stateParam) {
    return { valid: false, error: 'Missing OAuth state parameter.' };
  }

  let payload: OAuthStatePayload;
  try {
    payload = JSON.parse(stateParam);
  } catch (_) {
    return { valid: false, error: 'Malformed OAuth state JSON payload.' };
  }

  if (!payload || typeof payload !== 'object' || typeof payload.nonce !== 'string' || !payload.nonce) {
    return { valid: false, error: 'OAuth state is missing cryptographic nonce.' };
  }

  if (!cookieNonce || typeof cookieNonce !== 'string') {
    return { valid: false, error: 'Missing OAuth session nonce cookie. Please restart login.' };
  }

  // Check state timestamp expiration
  const stateTimestamp = typeof payload.ts === 'number' ? payload.ts : 0;
  if (!stateTimestamp || Date.now() - stateTimestamp > maxAgeMs) {
    return { valid: false, error: 'OAuth state has expired. Please restart login.' };
  }

  // Timing-safe nonce equality comparison
  const nonceBuffer = Buffer.from(payload.nonce, 'utf8');
  const cookieBuffer = Buffer.from(cookieNonce, 'utf8');

  if (nonceBuffer.length !== cookieBuffer.length || !crypto.timingSafeEqual(nonceBuffer, cookieBuffer)) {
    return { valid: false, error: 'OAuth state nonce mismatch (CSRF protection failed).' };
  }

  return { valid: true, payload };
}
