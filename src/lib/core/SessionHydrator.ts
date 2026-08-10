/**
 * Sheet2 Engine Core: SessionHydrator [LIFE-1, LIFE-2]
 * Fast <500ms startup hydration engine reading local session tokens & Google Drive file IDs.
 */

export interface HydratedSession {
  isValid: boolean;
  userEmail: string | null;
  googleToken: string | null;
  spreadsheetId: string | null;
  isOnboarded: boolean;
  isMockMode: boolean;
  isDemoMode: boolean;
  weddingName: string | null;
  driveFolder: string | null;
  hydrationTimeMs: number;
}

export const SessionHydrator = {
  /**
   * Hydrates session state from client-side storage (<500ms performance target)
   */
  hydrate(): HydratedSession {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (typeof window === 'undefined') {
      return {
        isValid: false,
        userEmail: null,
        googleToken: null,
        spreadsheetId: null,
        isOnboarded: false,
        isMockMode: false,
        isDemoMode: false,
        weddingName: null,
        driveFolder: null,
        hydrationTimeMs: 0,
      };
    }

    try {
      const savedToken = localStorage.getItem('s2v_google_token') || localStorage.getItem('s2s_access_token');
      const savedEmail = localStorage.getItem('s2v_google_email') || localStorage.getItem('s2s_user_email');
      const savedSheetId = localStorage.getItem('s2v_spreadsheet_id');
      const savedOnboarded = localStorage.getItem('s2v_is_onboarded') === 'true';
      const savedMock = localStorage.getItem('s2v_is_mock') === 'true';
      const savedDemo = localStorage.getItem('s2v_is_demo') === 'true';
      const savedName = localStorage.getItem('s2v_wedding_name');
      const savedFolder = localStorage.getItem('s2v_drive_folder');

      const isValid = Boolean(savedOnboarded && (savedSheetId || savedMock || savedDemo));
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

      return {
        isValid,
        userEmail: savedEmail,
        googleToken: savedToken,
        spreadsheetId: savedSheetId,
        isOnboarded: savedOnboarded,
        isMockMode: savedMock,
        isDemoMode: savedDemo,
        weddingName: savedName,
        driveFolder: savedFolder,
        hydrationTimeMs: Math.round(endTime - startTime),
      };
    } catch (e) {
      console.error('SessionHydrator Error:', e);
      return {
        isValid: false,
        userEmail: null,
        googleToken: null,
        spreadsheetId: null,
        isOnboarded: false,
        isMockMode: false,
        isDemoMode: false,
        weddingName: null,
        driveFolder: null,
        hydrationTimeMs: 0,
      };
    }
  },

  /**
   * Persists updated session state to client storage
   */
  persist(session: Partial<HydratedSession>): void {
    if (typeof window === 'undefined') return;

    if (session.googleToken) localStorage.setItem('s2v_google_token', session.googleToken);
    if (session.userEmail) localStorage.setItem('s2v_google_email', session.userEmail);
    if (session.spreadsheetId) localStorage.setItem('s2v_spreadsheet_id', session.spreadsheetId);
    if (typeof session.isOnboarded === 'boolean') localStorage.setItem('s2v_is_onboarded', String(session.isOnboarded));
    if (typeof session.isMockMode === 'boolean') localStorage.setItem('s2v_is_mock', String(session.isMockMode));
    if (typeof session.isDemoMode === 'boolean') localStorage.setItem('s2v_is_demo', String(session.isDemoMode));
    if (session.weddingName) localStorage.setItem('s2v_wedding_name', session.weddingName);
    if (session.driveFolder) localStorage.setItem('s2v_drive_folder', session.driveFolder);
  },

  /**
   * Clears local session cache completely
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('s2v_') || key.startsWith('s2s_'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
  },
};
