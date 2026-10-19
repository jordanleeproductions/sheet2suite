'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { APP_VERSION, BUILD_TIMESTAMP } from '@/lib/buildInfo';
import ReleaseNotesViewer from '@/components/vow/ReleaseNotesViewer';

interface AppVersionBadgeProps {
  collapsed?: boolean;
  variant?: 'sidebar' | 'mobile-drawer';
  isDark?: boolean;
}

export default function AppVersionBadge({ collapsed = false, variant = 'sidebar', isDark = false }: AppVersionBadgeProps) {
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mobile Drawer Variant
  if (variant === 'mobile-drawer') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsReleaseNotesOpen(true)}
          title={`Sheet2Vow ${APP_VERSION} - Tap to view release notes`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0.65rem 0.5rem',
            marginTop: '0.5rem',
            borderTop: '1px solid var(--color-border)',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            background: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            textAlign: 'left',
            borderRadius: '8px',
            transition: 'background-color 0.15s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover, rgba(0,0,0,0.03))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: 'var(--color-text)' }}>
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
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.58rem',
                fontFamily: 'var(--font-interface-sans, system-ui)',
                fontWeight: 600,
                color: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                marginLeft: '0.2rem',
              }}
            >
              <Sparkles size={9} />
              <span>Notes</span>
            </span>
          </div>

          <div style={{ fontSize: '0.625rem', color: 'var(--color-muted)', opacity: 0.85, whiteSpace: 'nowrap' }}>
            Deployed {BUILD_TIMESTAMP}
          </div>
        </button>

        <ReleaseNotesViewer
          isOpen={isReleaseNotesOpen}
          onClose={() => setIsReleaseNotesOpen(false)}
          currentVersion={APP_VERSION}
        />
      </>
    );
  }

  // Desktop sidebar variant
  const sidebarBorderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'var(--color-border)';
  const sidebarTextColor = isDark ? '#FFFFFF' : 'var(--color-text)';
  const sidebarMutedColor = isDark ? 'rgba(255, 255, 255, 0.65)' : 'var(--color-muted)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';

  if (collapsed) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsReleaseNotesOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title={`Sheet2Vow ${APP_VERSION} (Deployed: ${BUILD_TIMESTAMP}) - Click for release notes`}
          style={{
            width: '100%',
            padding: '0.6rem 0',
            borderTop: `1px solid ${sidebarBorderColor}`,
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            backgroundColor: isHovered ? hoverBg : 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            fontWeight: 700,
            color: isHovered ? sidebarTextColor : sidebarMutedColor,
            cursor: 'pointer',
            borderRadius: '6px',
            userSelect: 'none',
            transition: 'background-color 0.15s ease, color 0.15s ease',
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
        </button>

        <ReleaseNotesViewer
          isOpen={isReleaseNotesOpen}
          onClose={() => setIsReleaseNotesOpen(false)}
          currentVersion={APP_VERSION}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsReleaseNotesOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={`Sheet2Vow ${APP_VERSION} (Deployed: ${BUILD_TIMESTAMP}) - Click for release notes`}
        style={{
          width: '100%',
          padding: '0.55rem 0.45rem',
          borderTop: `1px solid ${sidebarBorderColor}`,
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          backgroundColor: isHovered ? hoverBg : 'transparent',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: sidebarMutedColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.15rem',
          cursor: 'pointer',
          borderRadius: '8px',
          textAlign: 'left',
          userSelect: 'none',
          transition: 'background-color 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.55rem',
              fontFamily: 'var(--font-interface-sans, system-ui)',
              fontWeight: 600,
              color: isHovered ? (isDark ? '#A5B4FC' : '#4F46E5') : (isDark ? 'rgba(255,255,255,0.45)' : 'var(--color-muted)'),
              opacity: isHovered ? 1 : 0.7,
              transition: 'opacity 0.15s ease, color 0.15s ease',
            }}
          >
            <Sparkles size={9} />
            <span>Notes</span>
          </span>
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
            width: '100%',
          }}
        >
          Deployed {BUILD_TIMESTAMP}
        </div>
      </button>

      <ReleaseNotesViewer
        isOpen={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
        currentVersion={APP_VERSION}
      />
    </>
  );
}
