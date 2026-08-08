'use client';

import React, { useState } from 'react';
import { LogIn, Sparkles, HardDrive, ShieldCheck, ArrowRight, X, UserCheck } from 'lucide-react';

export interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDemoMode: () => void;
  onAuthenticated: (user: { email: string; name?: string; accessToken?: string; spreadsheetId?: string }) => void;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectDemoMode,
  onAuthenticated,
}: GoogleAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Step 1: Fetch Google OAuth login URL from backend API
      const res = await fetch('/api/auth/google');
      const data = await res.json();

      if (data.authUrl && typeof window !== 'undefined') {
        const width = 520;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const handleAuthMessage = (event: MessageEvent) => {
          if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
            const { user, accessToken, provision } = event.data;
            window.removeEventListener('message', handleAuthMessage);
            setIsLoading(false);
            onAuthenticated({
              email: user.email,
              name: user.name,
              accessToken: accessToken,
              spreadsheetId: provision?.spreadsheetId,
            });
            onClose();
          } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', handleAuthMessage);
            setIsLoading(false);
            setErrorMsg(event.data.error || 'Authentication failed');
          }
        };

        window.addEventListener('message', handleAuthMessage);

        window.open(
          data.authUrl,
          'Sheet2SuiteGoogleLogin',
          `width=${width},height=${height},top=${top},left=${left}`
        );
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '3px solid var(--color-primary, #111827)',
          borderRadius: 'var(--border-radius-md, 8px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-subtle, #f3f4f6)',
            borderBottom: '2px solid var(--color-border, #e5e7eb)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <LogIn size={22} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                Sign In to Sheet2Suite
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
                Access your Google Drive wedding database
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text)',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', borderRadius: '6px', fontSize: '0.8rem' }}>
              {errorMsg}
            </div>
          )}

          {/* Primary Action 1: Sign in with Google */}
          <div style={{ border: '2px solid var(--color-primary)', borderRadius: '8px', padding: '1.25rem', backgroundColor: 'var(--color-bg-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>
                RETURNING USER / PLANNER
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Sign in with your Google Account to automatically load your wedding planner spreadsheet directly from your personal Google Drive.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                color: '#111827',
                border: '2px solid #111827',
                borderRadius: '6px',
                padding: '0.875rem 1rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem',
                boxShadow: '3px 3px 0px #111827',
              }}
            >
              <HardDrive size={18} style={{ color: '#4285F4' }} />
              <span>{isLoading ? 'AUTHENTICATING...' : 'SIGN IN WITH GOOGLE'}</span>
            </button>
          </div>

          {/* Action 2 & 3 Secondary Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            {/* Option 2: Activate New Plan */}
            <a
              href="/activate"
              style={{
                textDecoration: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '1rem',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Sparkles size={16} style={{ color: 'var(--color-gold, #f59e0b)' }} />
                <ArrowRight size={14} style={{ color: 'var(--color-muted)' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Activate New Plan
                </div>
                <div style={{ fontSize: '0.675rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                  Create new Drive folder & master sheet
                </div>
              </div>
            </a>

            {/* Option 3: Explore Demo */}
            <div
              onClick={() => {
                onSelectDemoMode();
                onClose();
              }}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '1rem',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <UserCheck size={16} style={{ color: 'var(--color-primary)' }} />
                <ArrowRight size={14} style={{ color: 'var(--color-muted)' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  Explore Demo Mode
                </div>
                <div style={{ fontSize: '0.675rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                  Try offline with pre-seeded sample data
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
