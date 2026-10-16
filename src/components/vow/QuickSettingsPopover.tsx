'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Settings,
  ChevronRight,
  ArrowRight,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useSheet2Theme } from '@/lib/core/theme/ThemeProvider';

export interface QuickSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  theme: 'light' | 'dark';
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  styleTheme: 'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo';
  onNavigateSettings: (section?: string) => void;
}

export default function QuickSettingsPopover({
  isOpen,
  onClose,
  anchorRef,
  theme,
  onUpdateTheme,
  styleTheme,
  onNavigateSettings,
}: QuickSettingsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { fontSizeScale, setFontSizeScale } = useSheet2Theme();

  // Theme preference tracking (Light | Dark | System)
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('s2v_theme_preference');
      if (saved === 'system' || saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'system';
  });

  // System theme synchronization
  useEffect(() => {
    if (themePreference !== 'system') return;
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent | MediaQueryList) => {
      onUpdateTheme(e.matches ? 'dark' : 'light');
    };

    handleSystemChange(mediaQuery);
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themePreference, onUpdateTheme]);

  const handleSelectThemePref = (pref: 'light' | 'dark' | 'system') => {
    setThemePreference(pref);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_theme_preference', pref);
    }
    if (pref === 'light') {
      onUpdateTheme('light');
    } else if (pref === 'dark') {
      onUpdateTheme('dark');
    } else {
      if (typeof window !== 'undefined') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        onUpdateTheme(isDark ? 'dark' : 'light');
      }
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const styleNames: Record<string, string> = {
    editorial: 'Editorial',
    'neo-brutalism': 'Neo-Brutal',
    'botanical-romance': 'Botanical',
    'midnight-tuxedo': 'Midnight',
  };

  return (
    <div
      ref={popoverRef}
      className="quick-settings-popover"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '280px',
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        padding: '0.85rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        animation: 'quickSettingsFadeIn 0.15s ease-out',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-sans, system-ui)',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-muted, #64748B)',
          }}
        >
          Quick settings
        </span>
      </div>

      {/* 1. Theme toggle: [ Light ] [ Dark ] [ System ] */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-sans, system-ui)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-text, #0F172A)',
          }}
        >
          Theme
        </span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.25rem',
            backgroundColor: 'var(--color-bg, #F8FAFC)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #E2E8F0)',
          }}
        >
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = themePreference === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectThemePref(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.2rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                  color: isActive ? 'var(--color-primary, #0284C7)' : 'var(--color-muted, #64748B)',
                  boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans, system-ui)',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.12s ease',
                }}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Text size stepper: [ − ] Default [ + ] */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text, #0F172A)',
            }}
          >
            Text size
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--color-muted, #64748B)',
            }}
          >
            {fontSizeScale}%
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg, #F8FAFC)',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #E2E8F0)',
            padding: '3px',
          }}
        >
          <button
            type="button"
            onClick={() => setFontSizeScale(fontSizeScale - 5)}
            disabled={fontSizeScale <= 80}
            title="Decrease text size"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '28px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--color-text, #0F172A)',
              cursor: fontSizeScale <= 80 ? 'not-allowed' : 'pointer',
              opacity: fontSizeScale <= 80 ? 0.4 : 1,
              transition: 'background-color 0.1s ease',
            }}
          >
            <Minus size={14} />
          </button>

          <button
            type="button"
            onClick={() => setFontSizeScale(100)}
            title="Reset to default text size (100%)"
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: fontSizeScale === 100 ? 'var(--color-surface, #FFFFFF)' : 'transparent',
              color: fontSizeScale === 100 ? 'var(--color-primary, #0284C7)' : 'var(--color-muted, #64748B)',
              boxShadow: fontSizeScale === 100 ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none',
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <RotateCcw size={11} />
            <span>Default</span>
          </button>

          <button
            type="button"
            onClick={() => setFontSizeScale(fontSizeScale + 5)}
            disabled={fontSizeScale >= 120}
            title="Increase text size"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '28px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--color-text, #0F172A)',
              cursor: fontSizeScale >= 120 ? 'not-allowed' : 'pointer',
              opacity: fontSizeScale >= 120 ? 0.4 : 1,
              transition: 'background-color 0.1s ease',
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* 3. Display style link -> jumps to /settings?section=appearance */}
      <button
        type="button"
        onClick={() => onNavigateSettings('appearance')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 0.65rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border, #E2E8F0)',
          backgroundColor: 'transparent',
          color: 'var(--color-text, #0F172A)',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background-color 0.12s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Palette size={14} style={{ color: 'var(--color-primary, #0284C7)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.75rem', fontWeight: 600 }}>
            Display style
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: '0.7rem',
              color: 'var(--color-muted, #64748B)',
              fontWeight: 500,
            }}
          >
            {styleNames[styleTheme] || 'Editorial'}
          </span>
          <ChevronRight size={13} style={{ color: 'var(--color-muted, #64748B)' }} />
        </div>
      </button>

      {/* 4. Divider rule */}
      <div style={{ height: '1px', backgroundColor: 'var(--color-border, #E2E8F0)', margin: '0.1rem 0' }} />

      {/* 5. "All settings" link -> navigates directly to /settings */}
      <button
        type="button"
        onClick={() => onNavigateSettings()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 0.65rem',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'var(--color-bg, #F8FAFC)',
          color: 'var(--color-primary, #0284C7)',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans, system-ui)',
          fontSize: '0.75rem',
          fontWeight: 600,
          transition: 'all 0.12s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={15} />
          <span>All settings</span>
        </div>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
