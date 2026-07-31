import crypto from 'crypto';

export type ShareScope = 'music' | 'photos' | 'timeline' | 'catering' | 'vendor_hub' | 'guest_upload' | 'guest_song_request';

export interface ShareTokenPayload {
  spreadsheetId: string;
  scope: ShareScope;
  weddingName: string;
  shareVersion?: number;
  exp: number; // Expiration timestamp in ms
}

export interface ShareLinkRecord {
  id: string;
  scope: ShareScope;
  label: string;
  token: string;
  shareUrl: string;
  createdAt: string;
  exp: number;
  shareVersion: number;
  isRevoked?: boolean;
}

const JWT_SECRET = process.env.SHARE_JWT_SECRET || 'sheet2vow-secure-vendor-secret-key-2026';

/**
 * Base64URL encode string
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decode string
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Generate a signed HMAC-SHA256 token for vendor share links
 */
export function generateShareToken(payload: Omit<ShareTokenPayload, 'exp'> & { expiresInDays?: number }): string {
  const expiresInDays = payload.expiresInDays || 60;
  const exp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;

  const tokenPayload: ShareTokenPayload = {
    spreadsheetId: payload.spreadsheetId,
    scope: payload.scope,
    weddingName: payload.weddingName,
    shareVersion: payload.shareVersion || 1,
    exp,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify & decode a vendor share token
 */
export function verifyShareToken(token: string): ShareTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) {
      console.warn('Share token signature mismatch');
      return null;
    }

    const payload: ShareTokenPayload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration
    if (payload.exp && Date.now() > payload.exp) {
      console.warn('Share token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying share token:', error);
    return null;
  }
}
