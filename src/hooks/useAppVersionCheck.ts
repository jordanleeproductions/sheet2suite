'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { APP_VERSION, BUILD_ISO } from '@/lib/buildInfo';

export interface AppVersionState {
  isUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion: string | null;
  latestBuildTimestamp: string | null;
  dismissed: boolean;
  dismissUpdate: () => void;
  refreshApp: () => void;
  checkForUpdate: () => Promise<void>;
}

/**
 * useAppVersionCheck Hook
 * Polls /api/version in the background and on window focus (visibilitychange) to detect
 * when a newer production build has been deployed compared to the client's currently loaded build.
 */
export function useAppVersionCheck(intervalMs = 10 * 60 * 1000): AppVersionState {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [latestBuildTimestamp, setLatestBuildTimestamp] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const lastCheckRef = useRef<number>(0);

  const checkForUpdate = useCallback(async () => {
    // Throttle checks to at most once every 30 seconds
    const now = Date.now();
    if (now - lastCheckRef.current < 30000) return;
    lastCheckRef.current = now;

    // Verify if snooze is active in this session
    try {
      if (typeof window !== 'undefined') {
        const snoozeUntil = sessionStorage.getItem('s2v_update_snooze');
        if (snoozeUntil && Number(snoozeUntil) > now) {
          return;
        }
      }
    } catch {}

    try {
      const res = await fetch(`/api/version?_t=${now}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) return;
      const data = await res.json();

      const serverVersion = data.version;
      const serverIso = data.buildIso;

      // Check if server version or build ISO is newer / different from client bundle
      const isVersionDifferent = serverVersion && serverVersion !== APP_VERSION;
      const isIsoDifferent = serverIso && BUILD_ISO && serverIso !== BUILD_ISO;

      if (isVersionDifferent || isIsoDifferent) {
        setLatestVersion(serverVersion || null);
        setLatestBuildTimestamp(data.buildTimestamp || null);
        setIsUpdateAvailable(true);
      }
    } catch {
      // Ignore background network errors
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setDismissed(true);
    setIsUpdateAvailable(false);
    try {
      if (typeof window !== 'undefined') {
        // Snooze for 1 hour
        sessionStorage.setItem('s2v_update_snooze', String(Date.now() + 60 * 60 * 1000));
      }
    } catch {}
  }, []);

  const refreshApp = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    // Check after an initial 15-second grace period on load
    const initialTimer = setTimeout(() => {
      checkForUpdate();
    }, 15000);

    // Periodic check interval (default: 10 minutes)
    const interval = setInterval(() => {
      checkForUpdate();
    }, intervalMs);

    // Check when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check when network connection is restored
    const handleOnline = () => {
      checkForUpdate();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkForUpdate, intervalMs]);

  return {
    isUpdateAvailable: isUpdateAvailable && !dismissed,
    currentVersion: APP_VERSION,
    latestVersion,
    latestBuildTimestamp,
    dismissed,
    dismissUpdate,
    refreshApp,
    checkForUpdate,
  };
}
