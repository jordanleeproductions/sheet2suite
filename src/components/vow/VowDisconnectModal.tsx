'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface VowDisconnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDisconnect: () => void;
}

export const VowDisconnectModal: React.FC<VowDisconnectModalProps> = ({
  isOpen,
  onClose,
  onConfirmDisconnect,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '2px solid var(--color-red, #ef4444)',
          borderRadius: 'var(--border-radius-md, 12px)',
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--box-shadow-heavy, 0 20px 25px -5px rgba(0,0,0,0.2))',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            backgroundColor: 'var(--color-red, #ef4444)',
            color: '#ffffff',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            <h3
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.9rem',
                fontWeight: 700,
                margin: 0,
                color: '#ffffff',
              }}
            >
              DISCONNECT CONFIRMATION
            </h3>
          </div>
          <button
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text, #0f172a)' }}>
            Are you sure you want to disconnect from your Google Sheet workspace?
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted, #64748b)', margin: '0.5rem 0 0 0' }}>
            Your local session cache will be cleared. You can reconnect anytime using your Google credentials or spreadsheet URL.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: 'transparent',
                color: 'var(--color-text, #0f172a)',
                border: '1px solid var(--color-muted, #cbd5e1)',
                borderRadius: 'var(--border-radius-sm, 6px)',
                padding: '0.625rem 1.25rem',
                cursor: 'pointer',
              }}
              onClick={onClose}
            >
              CANCEL
            </button>
            <button
              type="button"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: 'var(--color-red, #ef4444)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--border-radius-sm, 6px)',
                padding: '0.625rem 1.25rem',
                cursor: 'pointer',
              }}
              onClick={onConfirmDisconnect}
            >
              DISCONNECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VowDisconnectModal;
