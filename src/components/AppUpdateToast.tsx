'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { useAppVersionCheck } from '@/hooks/useAppVersionCheck';

export interface AppUpdateToastProps {
  styleTheme?: string;
  isMobile?: boolean;
}

/**
 * AppUpdateToast Component (Monarch-Style)
 * Displays a persistent, non-intrusive floating card when a newer production deployment is ready.
 * Prompts the user with a 1-click [ Refresh App ] action to reload the application with the latest bundle.
 */
export default function AppUpdateToast({ styleTheme, isMobile: isMobileProp }: AppUpdateToastProps) {
  const {
    isUpdateAvailable,
    latestVersion,
    latestBuildTimestamp,
    dismissUpdate,
    refreshApp,
  } = useAppVersionCheck();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewportMobile, setViewportMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setViewportMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isMobile = isMobileProp ?? viewportMobile;

  if (!isUpdateAvailable) {
    return null;
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshApp();
  };

  return (
    <aside
      role="alert"
      aria-live="polite"
      className="monarch-update-toast"
      style={{
        position: 'fixed',
        bottom: isMobile ? 'calc(4.75rem + env(safe-area-inset-bottom, 0px))' : '1.5rem',
        right: isMobile ? '1rem' : '1.5rem',
        left: isMobile ? '1rem' : 'auto',
        maxWidth: isMobile ? 'none' : '390px',
        width: isMobile ? 'auto' : '100%',
        zIndex: 9999,
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '18px',
        boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.22), 0 6px 16px -2px rgba(15, 23, 42, 0.08)',
        padding: '1rem',
        boxSizing: 'border-box',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Header Row: Icon Badge, Title, Version & Close */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: 'rgba(79, 70, 229, 0.10)',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={19} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: 'var(--font-interface-sans, system-ui)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: 'var(--color-text, #0F172A)',
                  lineHeight: 1.2,
                }}
              >
                Update Available
              </span>
              {latestVersion && (
                <span
                  style={{
                    fontFamily: 'var(--font-interface-sans, system-ui)',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    letterSpacing: '0.02em',
                  }}
                >
                  {latestVersion}
                </span>
              )}
            </div>
            {latestBuildTimestamp && (
              <div
                style={{
                  fontFamily: 'var(--font-interface-sans, system-ui)',
                  fontSize: '0.7rem',
                  color: 'var(--color-muted, #64748B)',
                  marginTop: '0.1rem',
                }}
              >
                {latestBuildTimestamp}
              </div>
            )}
          </div>
        </div>

        {/* Close / Dismiss (Snooze) Button */}
        <button
          type="button"
          onClick={dismissUpdate}
          title="Dismiss for this session"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--color-bg-hover, #F1F5F9)',
            color: 'var(--color-muted, #64748B)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 0,
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Body Description */}
      <p
        style={{
          fontFamily: 'var(--font-interface-sans, system-ui)',
          fontSize: '0.78rem',
          color: 'var(--color-muted, #64748B)',
          margin: '0.65rem 0 0.85rem 0',
          lineHeight: 1.4,
        }}
      >
        A newer version of Sheet2Vow is live. Refresh your workspace to get the latest features and performance updates.
      </p>

      {/* Action Buttons Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.55rem 0.85rem',
            backgroundColor: 'var(--color-primary, #0F172A)',
            color: 'var(--color-on-primary, #FFFFFF)',
            border: 'none',
            borderRadius: '10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.10)',
            fontFamily: 'var(--font-interface-sans, system-ui)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: isRefreshing ? 'wait' : 'pointer',
            opacity: isRefreshing ? 0.8 : 1,
          }}
        >
          <RefreshCw
            size={14}
            style={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh App'}</span>
        </button>

        <button
          type="button"
          onClick={dismissUpdate}
          style={{
            padding: '0.55rem 0.85rem',
            backgroundColor: 'transparent',
            color: 'var(--color-text, #0F172A)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '10px',
            fontFamily: 'var(--font-interface-sans, system-ui)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Later
        </button>
      </div>
    </aside>
  );
}
