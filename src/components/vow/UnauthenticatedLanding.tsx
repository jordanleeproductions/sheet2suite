'use client';

import React from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Grid,
  Printer,
  HardDrive,
  Loader2,
} from 'lucide-react';

interface UnauthenticatedLandingProps {
  onOpenGoogleAuth: () => void;
  onExploreDemo: () => void;
  isAuthenticating?: boolean;
}

export const UnauthenticatedLanding: React.FC<UnauthenticatedLandingProps> = ({
  onOpenGoogleAuth,
  onExploreDemo,
  isAuthenticating = false,
}) => {
  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '2rem auto',
        padding: '0 1.5rem',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Hero Container */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '20px',
          padding: '3.5rem 2.5rem',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.01)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Accent Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            backgroundColor: '#e8f0fe',
            color: '#0b57d0',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            marginBottom: '1.25rem',
          }}
        >
          <Sparkles size={15} />
          <span>GOOGLE SHEETS NATIVE WEDDING PLATFORM</span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontFamily: 'var(--font-header, var(--font-sans, "Inter", sans-serif))',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--color-text, #0f172a)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '0.85rem',
          }}
        >
          Your Google Sheet is your Wedding Database.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--color-muted, #64748b)',
            maxWidth: '680px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6,
          }}
        >
          A clean digital canvas for spreadsheet purists. Zero proprietary tracking databases — 100% data sovereignty in your personal Google Drive.
        </p>

        {/* Primary Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          {/* Official Google Sign In CTA */}
          <button
            type="button"
            onClick={onOpenGoogleAuth}
            disabled={isAuthenticating}
            style={{
              backgroundColor: '#ffffff',
              color: '#1f1f1f',
              padding: '0.85rem 1.75rem',
              borderRadius: '12px',
              border: '1px solid #747775',
              fontSize: '0.9rem',
              fontWeight: 700,
              fontFamily: 'Roboto, "Google Sans", sans-serif',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
              transition: 'background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
              opacity: isAuthenticating ? 0.8 : 1,
            }}
          >
            {isAuthenticating ? (
              <>
                <Loader2 size={20} style={{ color: '#4285F4', animation: 'spin 1s linear infinite' }} />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                {/* Official Google G Logo SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Login to Google to Get Started</span>
                <ArrowRight size={18} style={{ color: '#5f6368' }} />
              </>
            )}
          </button>

          {/* Instant Demo Exploration */}
          <button
            type="button"
            onClick={onExploreDemo}
            style={{
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Zap size={18} style={{ color: '#f59e0b' }} />
            <span>EXPLORE DEMO WORKSPACE</span>
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left',
            marginTop: '2.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#f8fafd',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#0b57d0' }}>
              <HardDrive size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>100% Data Sovereignty</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Your spreadsheet clones directly into your personal Google Drive using Google's minimal <code>drive.file</code> scope. No vendor lock-in.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafd',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#0b57d0' }}>
              <Grid size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>11 Relational Modules</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Real-time synchronization across Guest List, Seating Chart, Budget Ledger, Timeline, Vendors, Music Playlist, & Gift Registry.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafd',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#0b57d0' }}>
              <Printer size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Print & Canva Studio</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Export place cards, binder printouts, and Canva Bulk Create CSV files in 1 click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthenticatedLanding;
