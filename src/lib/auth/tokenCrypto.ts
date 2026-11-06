import crypto from 'crypto';

/**
 * AES-256-GCM Authenticated Encryption at Rest for OAuth Tokens stored in Firestore ([VULN-15]).
 * Transparently supports legacy plaintext tokens during read migration.
 */

const ENCRYPTED_PREFIX = 'enc:v1:';
const FALLBACK_PROCESS_KEY = crypto.randomBytes(32);

function getEncryptionKey(): Buffer {
  const secretMaterial =
    process.env.TOKEN_ENCRYPTION_SECRET ||
    process.env.WORKSPACE_SESSION_SECRET ||
    process.env.ADMIN_SECRET_KEY ||
    process.env.GOOGLE_CLIENT_SECRET;

  if (secretMaterial && secretMaterial.trim().length > 0) {
    return crypto.createHash('sha256').update(secretMaterial.trim()).digest();
  }
  return FALLBACK_PROCESS_KEY;
}

export function encryptTokenAtRest(plaintext?: string | null): string | undefined {
  if (!plaintext || typeof plaintext !== 'string') return undefined;
  if (plaintext.startsWith(ENCRYPTED_PREFIX)) {
    return plaintext; // Already encrypted
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${ENCRYPTED_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  } catch {
    return plaintext;
  }
}

export function decryptTokenAtRest(storedValue?: string | null): string | undefined {
  if (!storedValue || typeof storedValue !== 'string') return undefined;
  if (!storedValue.startsWith(ENCRYPTED_PREFIX)) {
    return storedValue; // Legacy plaintext compatibility
  }

  try {
    const parts = storedValue.slice(ENCRYPTED_PREFIX.length).split(':');
    if (parts.length !== 3) return undefined;

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return undefined;
  }
}

export function encryptAuthTokenDocFields<T extends Record<string, any>>(doc: T): T {
  if (!doc || typeof doc !== 'object') return doc;
  const clone: any = { ...doc };
  if (typeof clone.refreshToken === 'string' && clone.refreshToken) {
    clone.refreshToken = encryptTokenAtRest(clone.refreshToken);
  }
  if (typeof clone.accessToken === 'string' && clone.accessToken) {
    clone.accessToken = encryptTokenAtRest(clone.accessToken);
  }
  return clone;
}

export function decryptAuthTokenDocFields<T extends Record<string, any> | null>(doc: T): T {
  if (!doc || typeof doc !== 'object') return doc;
  const clone: any = { ...doc };
  if (typeof clone.refreshToken === 'string' && clone.refreshToken) {
    clone.refreshToken = decryptTokenAtRest(clone.refreshToken) || clone.refreshToken;
  }
  if (typeof clone.accessToken === 'string' && clone.accessToken) {
    clone.accessToken = decryptTokenAtRest(clone.accessToken) || clone.accessToken;
  }
  return clone;
}
