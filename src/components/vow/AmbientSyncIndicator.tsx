'use client';

import React from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AmbientSyncIndicatorProps {
  status: SyncStatus;
  lastSavedAt?: Date | null;
  isMockMode?: boolean;
  isMobile?: boolean;
  styleTheme?: string;
  onRetry?: () => void;
}

/**
 * AmbientSyncIndicator Component (Monarch-Style Quiet Sync)
 * Replaces intrusive pop-up toasts for routine auto-saves with a calm,
 * elegant ambient indicator in the header bar.
 */
export default function AmbientSyncIndicator({
  status,
  lastSavedAt,
  isMockMode = false,
  isMobile = false,
  styleTheme,
  onRetry,
}: AmbientSyncIndicatorProps) {
  const isVisible = status !== 'idle';

  // Format tooltip timestamp
  const tooltipText = React.useMemo(() => {
    if (status === 'saving') return 'Saving changes to Google Sheets...';
    if (status === 'error') return 'Error saving changes. Click to retry or check connection.';
    if (status === 'saved') {
      if (lastSavedAt) {
        const timeStr = lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
        return isMockMode ? `Saved to local workspace at ${timeStr}` : `All changes saved to Google Sheets at ${timeStr}`;
      }
      return isMockMode ? 'All changes saved locally' : 'All changes saved to Google Sheets';
    }
    return '';
  }, [status, lastSavedAt, isMockMode]);

  // Color & Badge Tokens
  let bg = 'transparent';
  let border = '1px solid transparent';
  let text = 'var(--color-muted, #64748B)';
  let icon = null;
  let label = '';

  if (status === 'saving') {
    bg = 'rgba(2, 132, 199, 0.08)';
    border = '1px solid rgba(2, 132, 199, 0.22)';
    text = 'var(--color-primary, #0284C7)';
    icon = <RefreshCw size={isMobile ? 11 : 12} style={{ animation: 's2vSpin 0.9s linear infinite', flexShrink: 0 }} />;
    label = isMobile ? 'Saving...' : 'Saving changes...';
  } else if (status === 'saved') {
    bg = 'rgba(16, 185, 129, 0.1)';
    border = '1px solid rgba(16, 185, 129, 0.25)';
    text = '#059669';
    icon = <Check size={isMobile ? 12 : 13} strokeWidth={2.5} style={{ flexShrink: 0 }} />;
    label = isMobile ? 'Saved' : (isMockMode ? 'Saved (Demo)' : 'Saved to Sheets');
  } else if (status === 'error') {
    bg = 'rgba(239, 68, 68, 0.1)';
    border = '1px solid rgba(239, 68, 68, 0.28)';
    text = '#DC2626';
    icon = <AlertCircle size={isMobile ? 12 : 13} strokeWidth={2.2} style={{ flexShrink: 0 }} />;
    label = isMobile ? 'Sync error' : 'Sync error · Retry';
  }

  return (
    <div
      role="status"
      aria-live="polite"
      title={tooltipText}
      onClick={status === 'error' && onRetry ? onRetry : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isMobile ? '0.35rem' : '0.45rem',
        padding: isMobile ? '0.22rem 0.55rem' : '0.28rem 0.65rem',
        borderRadius: '9999px',
        backgroundColor: bg,
        border,
        color: text,
        fontFamily: 'var(--font-interface-sans, system-ui, -apple-system, sans-serif)',
        fontSize: isMobile ? '0.7rem' : '0.74rem',
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: '0.01em',
        cursor: status === 'error' && onRetry ? 'pointer' : 'default',
        userSelect: 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-3px) scale(0.96)',
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease',
        boxShadow: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <style>{`
        @keyframes s2vSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {icon}
      <span>{label}</span>
    </div>
  );
}
