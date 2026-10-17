'use client';

import React from 'react';
import { APP_VERSION, BUILD_TIMESTAMP } from '@/lib/buildInfo';

interface AppVersionBadgeProps {
  collapsed?: boolean;
  variant?: 'sidebar' | 'mobile-drawer';
  isDark?: boolean;
}

export default function AppVersionBadge({ collapsed = false, variant = 'sidebar', isDark = false }: AppVersionBadgeProps) {
  if (variant === 'mobile-drawer') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          marginTop: '0.5rem',
          borderTop: '1px solid var(--color-border)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--color-muted)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--color-text)' }}>
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-green, #10b981)',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
              flexShrink: 0,
            }}
          />
          <span style={{ whiteSpace: 'nowrap' }}>{APP_VERSION}</span>
        </div>
        <div style={{ fontSize: '0.625rem', color: 'var(--color-muted)', opacity: 0.85, whiteSpace: 'nowrap' }}>
          Deployed {BUILD_TIMESTAMP}
        </div>
      </div>
    );
  }

  // Desktop sidebar variant
  const sidebarBorderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'var(--color-border)';
  const sidebarTextColor = isDark ? '#FFFFFF' : 'var(--color-text)';
  const sidebarMutedColor = isDark ? 'rgba(255, 255, 255, 0.65)' : 'var(--color-muted)';

  if (collapsed) {
    return (
      <div
        title={`Sheet2Vow ${APP_VERSION} (Deployed: ${BUILD_TIMESTAMP})`}
        style={{
          padding: '0.6rem 0',
          borderTop: `1px solid ${sidebarBorderColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          fontWeight: 700,
          color: sidebarMutedColor,
          cursor: 'help',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-green, #10b981)',
            boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
          }}
        />
        <span>{APP_VERSION}</span>
      </div>
    );
  }

  return (
    <div
      title={`Sheet2Vow ${APP_VERSION} (Deployed: ${BUILD_TIMESTAMP})`}
      style={{
        padding: '0.6rem 0.25rem',
        borderTop: `1px solid ${sidebarBorderColor}`,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        color: sidebarMutedColor,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.15rem',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: sidebarTextColor }}>
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-green, #10b981)',
            boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
            flexShrink: 0,
          }}
        />
        <span style={{ whiteSpace: 'nowrap' }}>Sheet2Vow {APP_VERSION}</span>
      </div>
      <div
        style={{
          fontSize: '0.54rem',
          color: sidebarMutedColor,
          opacity: 0.85,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.02em',
        }}
      >
        Deployed {BUILD_TIMESTAMP}
      </div>
    </div>
  );
}
