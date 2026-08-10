'use client';

import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface PreAuthTrustCardProps {
  onConsent: () => void;
  onCancel?: () => void;
}

export const PreAuthTrustCard: React.FC<PreAuthTrustCardProps> = ({ onConsent, onCancel }) => {
  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      backgroundColor: 'var(--color-surface, #ffffff)',
      border: '2px solid var(--color-primary, #111827)',
      borderRadius: 'var(--border-radius-md, 12px)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-md, 0 10px 25px -5px rgba(0, 0, 0, 0.1))',
      color: 'var(--color-text, #111827)',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <ShieldCheck size={28} style={{ color: '#16a34a' }} />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Data Privacy & Trust Guard</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted, #6b7280)' }}>
            Your Google Drive is your private database.
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '0.85rem',
        fontSize: '0.8rem',
        color: '#166534',
        marginBottom: '1rem',
        lineHeight: 1.4
      }}>
        <strong>🔒 100% Data Sovereignty:</strong> We only request permission to create, view, and edit the specific wedding spreadsheet created by this application. We cannot access your emails, photos, or unassociated Drive files.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          'Enforces restricted scope: https://www.googleapis.com/auth/drive.file',
          'Zero external database risk — your data stays in your personal Google Drive',
          'Move or rename your Google Sheet file anytime without breaking sync'
        ].map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#374151' }}>
            <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.65rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            CANCEL
          </button>
        )}
        <button
          type="button"
          onClick={onConsent}
          style={{
            flex: 2,
            padding: '0.65rem 1rem',
            backgroundColor: '#111827',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <Lock size={14} />
          <span>PROCEED TO GOOGLE SIGN-IN</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PreAuthTrustCard;
