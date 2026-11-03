import crypto from 'crypto';

export type ShareScope =
  | 'music'
  | 'photos'
  | 'timeline'
  | 'catering'
  | 'vendor_hub'
  | 'guest_upload'
  | 'guest_song_request'
  | 'partner_invite';

export interface ShareTokenPayload {
  spreadsheetId: string;
  scope: ShareScope;
  weddingName: string;
  shareVersion?: number;
  userEmail?: string;
  folderId?: string;
  folderName?: string;
  folderPath?: string;
  exp: number; // Expiration timestamp in ms (0 for no expiration)
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
  userEmail?: string;
  folderId?: string;
  folderName?: string;
  folderPath?: string;
}

const globalShareSecretStore = globalThis as unknown as {
  __s2s_runtime_share_secret?: string;
};

/**
 * Security [VULN-3]: Server-only HMAC signing secret resolution.
 * Never falls back to a public static string that an attacker can read from source or client bundles.
 */
function resolveJwtSecret(): string {
  if (process.env.SHARE_JWT_SECRET && process.env.SHARE_JWT_SECRET.trim().length >= 16) {
    return process.env.SHARE_JWT_SECRET.trim();
  }
  const envFallback =
    process.env.ADMIN_SECRET_KEY ||
    process.env.NEXTAUTH_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET;
  if (envFallback && envFallback.trim().length >= 12 && envFallback !== 'MOCK_CLIENT_SECRET') {
    return envFallback.trim();
  }
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[Security Warning]: SHARE_JWT_SECRET is unset. Using cryptographically random process secret.'
    );
  }
  if (!globalShareSecretStore.__s2s_runtime_share_secret) {
    globalShareSecretStore.__s2s_runtime_share_secret = crypto.randomBytes(32).toString('hex');
  }
  return globalShareSecretStore.__s2s_runtime_share_secret;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Generate a signed HMAC-SHA256 token for vendor/guest/partner share links.
 */
export function generateShareToken(
  payload: Omit<ShareTokenPayload, 'exp'> & { expiresInDays?: number }
): string {
  const secret = resolveJwtSecret();
  const expiresInDays = payload.expiresInDays !== undefined ? payload.expiresInDays : 60;
  const exp = expiresInDays > 0 ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000 : 0;

  const tokenPayload: ShareTokenPayload = {
    spreadsheetId: payload.spreadsheetId,
    scope: payload.scope,
    weddingName: payload.weddingName,
    shareVersion: payload.shareVersion || 1,
    userEmail: payload.userEmail,
    folderId: payload.folderId,
    folderName: payload.folderName,
    folderPath: payload.folderPath,
    exp,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify & decode a vendor/guest/partner share token.
 */
export function verifyShareToken(token: string): ShareTokenPayload | null {
  try {
    const secret = resolveJwtSecret();
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn('Share token signature mismatch');
      return null;
    }

    const payload: ShareTokenPayload = JSON.parse(base64UrlDecode(encodedPayload));

    if (payload.exp && payload.exp > 0 && Date.now() > payload.exp) {
      console.warn('Share token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying share token:', error);
    return null;
  }
}
