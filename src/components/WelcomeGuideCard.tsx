'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Palette, 
  Sun, 
  Moon, 
  Layout, 
  ExternalLink, 
  Sliders, 
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { StyleTheme, ColorTheme } from '@/lib/core/theme/ThemeProvider';

interface WelcomeGuideCardProps {
  weddingName: string;
  spreadsheetId?: string;
  styleTheme: StyleTheme;
  colorTheme: ColorTheme;
  showTopNav?: boolean;
  onDismiss: () => void;
  onSelectStyleTheme?: (style: StyleTheme) => void;
  onToggleColorTheme?: () => void;
  onToggleTopNav?: () => void;
  onOpenSettings?: () => void;
}

export default function WelcomeGuideCard({
  weddingName,
  spreadsheetId,
  styleTheme,
  colorTheme,
  showTopNav = false,
  onDismiss,
  onSelectStyleTheme,
  onToggleColorTheme,
  onToggleTopNav,
  onOpenSettings,
}: WelcomeGuideCardProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const googleSheetUrl = spreadsheetId 
    ? (spreadsheetId.startsWith('mock') ? 'https://docs.google.com' : `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`)
    : undefined;

  const handleDismiss = () => {
    if (dontShowAgain && typeof window !== 'undefined') {
      localStorage.setItem('s2v_welcome_dismissed', 'true');
    }
    onDismiss();
  };

  return (
    <div
      className="welcome-guide-card"
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        color: 'var(--color-text, #0F172A)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '3px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        boxShadow: 'none',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Row: Editorial Title & Direct Dismiss Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.85rem' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '2px',
            padding: '0.15rem 0.5rem',
            fontSize: '0.62rem',
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-muted, #64748B)',
            marginBottom: '0.35rem',
          }}>
            <Sparkles size={11} style={{ color: 'var(--color-primary, #0F172A)' }} />
            <span>GETTING STARTED GUIDE</span>
          </div>

          <h2 style={{
            margin: '0 0 0.25rem 0',
            fontSize: '1.25rem',
            fontWeight: 700,
            fontFamily: 'var(--font-editorial-serif, serif)',
            color: 'var(--color-primary, #0F172A)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Welcome to {weddingName || 'Your Wedding Planner'}
          </h2>

          <p style={{
            margin: 0,
            fontSize: '0.78rem',
            color: 'var(--color-muted, #64748B)',
            lineHeight: 1.45,
            maxWidth: '840px',
          }}>
            Your wedding workspace is synchronized live. All guest RSVPs, catering tallies, expenses, and timeline events update in real time with zero vendor lock-in.
          </p>
        </div>

        {/* Clean Hairline Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '2px',
            color: 'var(--color-text, #0F172A)',
            padding: '0.3rem 0.6rem',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background-color 0.1s ease',
          }}
          title="Dismiss getting started guide"
        >
          <X size={13} />
          <span>DISMISS GUIDE</span>
        </button>
      </div>

      {/* 3 Quick Configuration Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.75rem',
        marginBottom: '0.85rem',
      }}>
        {/* Panel 1: Design Aesthetics */}
        <div style={{
          backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '2px',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', color: 'var(--color-primary, #0F172A)' }}>
              <Palette size={13} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-technical-mono, monospace)', textTransform: 'uppercase' }}>
                1. Design Style
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted, #64748B)', lineHeight: 1.35 }}>
              Editorial serif, Muted Neo-Brutalism, Botanical, or Midnight Tuxedo.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {(['editorial', 'neo-brutalism'] as StyleTheme[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onSelectStyleTheme && onSelectStyleTheme(st)}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontWeight: styleTheme === st ? 700 : 500,
                  backgroundColor: styleTheme === st ? 'var(--color-primary, #0F172A)' : 'transparent',
                  color: styleTheme === st ? '#FFFFFF' : 'var(--color-text, #0F172A)',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {st === 'editorial' ? 'Editorial' : 'Brutalism'}
              </button>
            ))}
          </div>
        </div>

        {/* Panel 2: Color Mode */}
        <div style={{
          backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '2px',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', color: 'var(--color-primary, #0F172A)' }}>
              {colorTheme === 'light' ? <Sun size={13} /> : <Moon size={13} />}
              <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-technical-mono, monospace)', textTransform: 'uppercase' }}>
                2. Color Mode
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted, #64748B)', lineHeight: 1.35 }}>
              High-contrast light parchment or technical dark mode.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleColorTheme}
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontWeight: 700,
              backgroundColor: 'transparent',
              color: 'var(--color-text, #0F172A)',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              width: 'fit-content',
            }}
          >
            {colorTheme === 'light' ? <Moon size={12} /> : <Sun size={12} />}
            <span>SWITCH TO {colorTheme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}</span>
          </button>
        </div>

        {/* Panel 3: Layout Structure */}
        <div style={{
          backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '2px',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', color: 'var(--color-primary, #0F172A)' }}>
              <Layout size={13} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-technical-mono, monospace)', textTransform: 'uppercase' }}>
                3. Navigation Shell
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-muted, #64748B)', lineHeight: 1.35 }}>
              Compact left utility rail on desktop with persistent bottom bar on mobile.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleTopNav}
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontWeight: 700,
              backgroundColor: 'transparent',
              color: 'var(--color-text, #0F172A)',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '2px',
              cursor: 'pointer',
              width: 'fit-content',
            }}
          >
            NAV BAR: {showTopNav ? 'TOP HORIZONTAL' : 'LEFT UTILITY RAIL'}
          </button>
        </div>
      </div>

      {/* Footer Controls & Don't Show Again */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        paddingTop: '0.65rem',
        borderTop: '1px solid var(--color-border, #E2E8F0)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {googleSheetUrl && (
            <a
              href={googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--color-primary, #0F172A)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <FileSpreadsheet size={13} />
              <span>OPEN GOOGLE SPREADSHEET</span>
              <ExternalLink size={10} />
            </a>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-technical-mono, monospace)',
                color: 'var(--color-muted, #64748B)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'underline',
              }}
            >
              <Sliders size={11} />
              <span>Advanced Settings</span>
            </button>
          )}

          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-technical-mono, monospace)',
            color: 'var(--color-muted, #64748B)',
            cursor: 'pointer',
            userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ cursor: 'pointer', width: '12px', height: '12px' }}
            />
            <span>Don&apos;t show again</span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          style={{
            backgroundColor: 'var(--color-primary, #0F172A)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '2px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'opacity 0.1s ease',
          }}
        >
          <span>PROCEED TO PLANNING</span>
        </button>
      </div>
    </div>
  );
}
