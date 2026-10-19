'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, Heart } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime application error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--color-bg, #f8fafc)',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.02)',
          textAlign: 'center',
        }}
      >
        {/* Brand Accent */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={28} />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-newsreader-google, "Newsreader", Georgia, serif)',
            fontSize: '1.85rem',
            fontWeight: 600,
            color: 'var(--color-text, #0f172a)',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          Something didn&apos;t go as planned
        </h1>

        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--color-muted, #64748b)',
            lineHeight: 1.6,
            margin: '0 0 1.75rem 0',
          }}
        >
          We encountered a temporary interruption while loading your workspace. Your Google Sheet data remains completely safe and untouched.
        </p>

        {/* Diagnostic Digest */}
        {error?.digest && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--color-bg, #f8fafc)',
              borderRadius: '6px',
              border: '1px dashed var(--color-border, #cbd5e1)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.725rem',
              color: 'var(--color-muted, #64748b)',
              marginBottom: '1.75rem',
            }}
          >
            Reference Digest: {error.digest}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              minHeight: '44px',
              backgroundColor: 'var(--color-text, #0f172a)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
          >
            <RefreshCw size={16} />
            <span>TRY AGAIN</span>
          </button>

          <a
            href="/vow#home"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              minHeight: '44px',
              backgroundColor: 'var(--color-bg-subtle, #f1f5f9)',
              color: 'var(--color-text, #0f172a)',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            <Heart size={16} style={{ color: '#e11d48' }} />
            <span>RETURN TO WEDDING OVERVIEW</span>
          </a>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.775rem',
              color: 'var(--color-muted, #64748b)',
              textDecoration: 'none',
              marginTop: '0.5rem',
            }}
          >
            <Home size={13} />
            <span>Sheet2Suite Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
