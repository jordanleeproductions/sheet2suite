'use client';

import React from 'react';
import { 
  Sparkles, 
  X, 
  Palette, 
  Sun, 
  Moon, 
  Layout, 
  ExternalLink, 
  CheckCircle2, 
  Sliders, 
  Compass, 
  FileSpreadsheet,
  Layers
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
  const googleSheetUrl = spreadsheetId 
    ? (spreadsheetId.startsWith('mock') ? 'https://docs.google.com' : `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`)
    : undefined;

  return (
    <div
      className="welcome-guide-card animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #4338ca 75%, #4f46e5 100%)',
        color: '#ffffff',
        border: '2px solid rgba(165, 180, 252, 0.45)',
        borderRadius: 'var(--border-radius-md, 12px)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 12px 28px -6px rgba(49, 46, 129, 0.45), 0 4px 12px -2px rgba(49, 46, 129, 0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle ambient decorative overlay */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, rgba(49, 46, 129, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '9999px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#e0e7ff',
            marginBottom: '0.5rem',
          }}>
            <Sparkles size={13} style={{ color: '#fde047' }} />
            <span>GETTING STARTED • YOUR WEDDING CANVAS</span>
          </div>

          <h2 style={{
            margin: '0 0 0.35rem 0',
            fontSize: '1.35rem',
            fontWeight: 800,
            fontFamily: 'var(--font-serif, inherit)',
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}>
            Welcome to {weddingName || 'Your Wedding Planner'}!
          </h2>

          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: '#e0e7ff',
            lineHeight: 1.45,
            maxWidth: '820px',
          }}>
            This dashboard is your real-time digital command center, dynamically connected to your private Google Spreadsheet. All guest RSVPs, budgets, timeline moments, and tasks synchronize bi-directionally with zero vendor lock-in.
          </p>
        </div>

        {/* Quick Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: 'var(--border-radius-sm, 6px)',
            color: '#ffffff',
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
          title="Dismiss getting started guide"
        >
          <X size={14} />
          <span>Dismiss</span>
        </button>
      </div>

      {/* UX Education 3-Pillar Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.15rem',
      }}>
        {/* Pillar 1: Theme & Aesthetic */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.22)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--border-radius-md, 8px)',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>
              <Palette size={15} style={{ color: '#a5b4fc' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
                1. Style Aesthetic
              </span>
            </div>
            <p style={{ margin: '0 0 0.65rem 0', fontSize: '0.75rem', color: '#c7d2fe', lineHeight: 1.35 }}>
              Choose between <strong>Editorial</strong>, <strong>Neo-Brutalism</strong>, <strong>Botanical</strong>, or <strong>Midnight Tuxedo</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {(['editorial', 'neo-brutalism', 'botanical-romance', 'midnight-tuxedo'] as StyleTheme[]).map((st) => {
              const isActive = styleTheme === st;
              const label = st === 'editorial' ? 'Editorial' : st === 'neo-brutalism' ? 'Brutalist' : st === 'botanical-romance' ? 'Botanical' : 'Tuxedo';
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onSelectStyleTheme && onSelectStyleTheme(st)}
                  style={{
                    backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                    color: isActive ? '#1e1b4b' : '#ffffff',
                    border: isActive ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isActive && <CheckCircle2 size={10} style={{ display: 'inline', marginRight: '3px' }} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pillar 2: Light & Dark Mode */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.22)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--border-radius-md, 8px)',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>
              {colorTheme === 'dark' ? <Moon size={15} style={{ color: '#93c5fd' }} /> : <Sun size={15} style={{ color: '#fde047' }} />}
              <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
                2. Color Mode
              </span>
            </div>
            <p style={{ margin: '0 0 0.65rem 0', fontSize: '0.75rem', color: '#c7d2fe', lineHeight: 1.35 }}>
              Toggle between crisp day planning and sleek low-light evening dark mode anytime.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={onToggleColorTheme}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e1b4b',
                border: 'none',
                borderRadius: '4px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.15s ease',
              }}
            >
              {colorTheme === 'dark' ? <Sun size={13} style={{ color: '#eab308' }} /> : <Moon size={13} style={{ color: '#4f46e5' }} />}
              <span>SWITCH TO {colorTheme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}</span>
            </button>
          </div>
        </div>

        {/* Pillar 3: Left Sidebar vs Top Nav */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.22)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--border-radius-md, 8px)',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', color: '#cbd5e1' }}>
              <Layout size={15} style={{ color: '#6ee7b7' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}>
                3. Optional Top Nav Bar
              </span>
            </div>
            <p style={{ margin: '0 0 0.65rem 0', fontSize: '0.75rem', color: '#c7d2fe', lineHeight: 1.35 }}>
              Desktop uses the <strong>Left Sidebar</strong> and mobile uses the <strong>Bottom Nav</strong>. Optionally toggle the top navigation bar.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={onToggleTopNav}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Compass size={13} />
              <span>TOP NAV BAR: {showTopNav ? 'ENABLED' : 'DISABLED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Row: Google Sheet Link + Primary Dismiss CTA */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.18)',
        paddingTop: '0.85rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {googleSheetUrl ? (
            <a
              href={googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem',
                color: '#c7d2fe',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#c7d2fe')}
            >
              <FileSpreadsheet size={13} style={{ color: '#34a853' }} />
              <span>Open Master Database in Google Drive</span>
              <ExternalLink size={11} />
            </a>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>
              💡 All edits in this web app sync directly to your private Google Drive sheet.
            </span>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              style={{
                fontSize: '0.75rem',
                color: '#e0e7ff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'underline',
              }}
            >
              <Sliders size={12} />
              <span>Full Appearance & Module Settings</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          style={{
            backgroundColor: '#ffffff',
            color: '#1e1b4b',
            border: 'none',
            borderRadius: 'var(--border-radius-sm, 6px)',
            padding: '0.5rem 1.15rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 800,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
          }}
        >
          <Sparkles size={14} style={{ color: '#6366f1' }} />
          <span>GOT IT, LET'S PLAN!</span>
        </button>
      </div>
    </div>
  );
}
