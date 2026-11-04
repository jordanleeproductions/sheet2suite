'use client';

import { useState, useEffect, useCallback } from 'react';
import { SuiteProductId, getProductBuildInfo } from '@/lib/buildInfo';

export interface VersionCheckResult {
  updateAvailable: boolean;
  isUpdateAvailable: boolean;
  latestVersion: string;
  currentVersion: string;
  latestBuildTimestamp: string | null;
  dismissed: boolean;
  checkNow: () => Promise<void>;
  checkForUpdate: () => Promise<void>;
  reloadApp: () => void;
  refreshApp: () => void;
  dismissUpdate: () => void;
}

export function useAppVersionCheck(
  pollIntervalMs: number = 5 * 60 * 1000,
  product: SuiteProductId = 'vow'
): VersionCheckResult {
  const localInfo = getProductBuildInfo(product);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState(localInfo.version);
  const [latestBuildTimestamp, setLatestBuildTimestamp] = useState<string | null>(localInfo.buildTimestamp);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);

  const checkNow = useCallback(async () => {
    try {
      const res = await fetch(`/api/version?product=${encodeURIComponent(product)}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
        },
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data && data.version) {
        const isDifferentVersion = data.version !== localInfo.version;
        const isDifferentIso = Boolean(data.buildIso && localInfo.buildIso && data.buildIso !== localInfo.buildIso);

        if (isDifferentVersion || isDifferentIso) {
          setLatestVersion(data.version);
          if (data.buildTimestamp) {
            setLatestBuildTimestamp(String(data.buildTimestamp));
          }
          if (dismissedVersion !== data.version) {
            setUpdateAvailable(true);
          }
        }
      }
    } catch {
      // Silently ignore network errors when offline
    }
  }, [dismissedVersion, localInfo.buildIso, localInfo.version, product]);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      checkNow();
    }, 10000);

    const interval = setInterval(() => {
      checkNow();
    }, pollIntervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkNow();
      }
    };

    const handleFocus = () => {
      checkNow();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkNow, pollIntervalMs]);

  const reloadApp = useCallback(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('v', Date.now().toString());
      window.location.reload();
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setDismissedVersion(latestVersion);
    setUpdateAvailable(false);
  }, [latestVersion]);

  const dismissed = dismissedVersion === latestVersion;
  const activeUpdate = updateAvailable && !dismissed;

  return {
    updateAvailable: activeUpdate,
    isUpdateAvailable: activeUpdate,
    latestVersion,
    currentVersion: localInfo.version,
    latestBuildTimestamp,
    dismissed,
    checkNow,
    checkForUpdate: checkNow,
    reloadApp,
    refreshApp: reloadApp,
    dismissUpdate,
  };
}
