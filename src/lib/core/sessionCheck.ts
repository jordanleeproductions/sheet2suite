/**
 * Sheet2 Engine Core: Session Check Helper
 * Verifies active session before displaying Add/Edit/Delete modal dialogs.
 * Prevents users from filling out long forms only to lose their progress on submit due to expired tokens.
 */

let lastVerifiedTimestamp = 0;
const SESSION_CACHE_TTL_MS = 45 * 1000; // 45 seconds cache to avoid duplicate network checks on rapid clicks

export async function verifyActiveSession(): Promise<boolean> {
  if (typeof window === 'undefined') return true;

  // In mock or demo mode, sessions never expire
  const isMock = localStorage.getItem('s2v_is_mock') === 'true';
  const isDemo = localStorage.getItem('s2v_is_demo') === 'true';
  if (isMock || isDemo) return true;

  const spreadsheetId = localStorage.getItem('s2v_spreadsheet_id') || '';
  const token = localStorage.getItem('s2v_google_token') || '';

  // If running completely local without sheet/token, allow user to proceed
  if (!spreadsheetId && !token) return true;

  // Use cached validation if validated within TTL window
  const now = Date.now();
  if (now - lastVerifiedTimestamp < SESSION_CACHE_TTL_MS) {
    return true;
  }

  try {
    const res = await fetch(`/api/auth/session?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
      method: 'GET',
      headers: token ? { 'x-google-token': token } : {},
    });

    const data = await res.json();
    if (res.status === 401 || data.isAuthError || data.valid === false) {
      // Invalidate cache
      lastVerifiedTimestamp = 0;
      // Dispatch global event so page.tsx reveals the re-authentication modal
      window.dispatchEvent(new CustomEvent('s2v:session-expired'));
      return false;
    }

    lastVerifiedTimestamp = now;
    return true;
  } catch (err) {
    console.warn('[SessionCheck] Could not verify session, allowing offline edit:', err);
    // In case of transient network error, don't unnecessarily block the user
    return true;
  }
}

/**
 * Manually invalidates the session cache (e.g. on logout or known auth error)
 */
export function invalidateSessionCheckCache(): void {
  lastVerifiedTimestamp = 0;
}
