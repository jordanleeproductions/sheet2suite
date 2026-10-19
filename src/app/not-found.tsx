import React from 'react';
import Link from 'next/link';
import { FileQuestion, Heart, Sparkles, Home } from 'lucide-react';

export default function NotFound() {
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
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.02)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg-subtle, #f1f5f9)',
            color: 'var(--color-muted, #64748b)',
            marginBottom: '1.25rem',
          }}
        >
          <FileQuestion size={28} />
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#e11d48',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
          }}
        >
          ERROR 404 &bull; PAGE NOT FOUND
        </div>

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
          Looking for your wedding planner?
        </h1>

        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--color-muted, #64748b)',
            lineHeight: 1.6,
            margin: '0 0 1.75rem 0',
          }}
        >
          The page or link you requested does not exist or may have been moved.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <Link
            href="/vow#home"
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
              textDecoration: 'none',
            }}
          >
            <Heart size={16} style={{ color: '#e11d48' }} />
            <span>OPEN SHEET2VOW PLANNER</span>
          </Link>

          <Link
            href="/activate"
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
            <Sparkles size={16} style={{ color: 'var(--color-highlight, #f59e0b)' }} />
            <span>ACTIVATE NEW ORDER</span>
          </Link>

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
