import { ShareTokenPayload } from '@/lib/share/token';
import { LocalLicensingDb } from '@/lib/db/licensingDb';

/**
 * Server-side check verifying whether a share token has been revoked in Firestore
 * via shareVersion bump ("Revoke All") or individual token signature revocation.
 */
export async function isShareTokenRevokedAsync(
  payload: ShareTokenPayload,
  rawToken?: string
): Promise<boolean> {
  try {
    if (!payload?.spreadsheetId) return false;
    const ws = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(payload.spreadsheetId);
    if (!ws) return false;

    const currentVersion = ws.shareVersion || 1;
    const tokenVersion = payload.shareVersion || 1;
    if (tokenVersion < currentVersion) {
      return true;
    }

    if (rawToken && Array.isArray(ws.revokedShareTokens) && ws.revokedShareTokens.length > 0) {
      const sig = rawToken.split('.')[2] || rawToken;
      if (ws.revokedShareTokens.includes(sig) || ws.revokedShareTokens.includes(rawToken)) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.warn('[ShareToken] Could not check server revocation status:', err);
    return false;
  }
}
