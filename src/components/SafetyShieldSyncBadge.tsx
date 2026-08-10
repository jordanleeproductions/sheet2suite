'use client';

import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, X, Info, HardDrive } from 'lucide-react';
import { PermanentIdRegistry } from '@/lib/core/PermanentIdRegistry';

interface SafetyShieldSyncBadgeProps {
  status: 'synced' | 'syncing' | 'offline' | 'error';
  userEmail?: string;
  spreadsheetId?: string;
  lastSyncedAt?: string;
}

export const SafetyShieldSyncBadge: React.FC<SafetyShieldSyncBadgeProps> = ({
  status,
  userEmail,
  spreadsheetId,
  lastSyncedAt,
}) => {
  const [showModal, setShowModal] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'synced': return '#16a34a';
      case 'syncing': return '#f59e0b';
      case 'offline': return '#6b7280';
      case 'error': return '#dc2626';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'synced': return 'Synced with Google Drive';
      case 'syncing': return 'Syncing Changes...';
      case 'offline': return 'Offline Mode';
      case 'error': return 'Sync Attention Required';
    }
  };

  const directUrl = spreadsheetId ? PermanentIdRegistry.getDirectSpreadsheetUrl(spreadsheetId) : '#';

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: `1.5px solid ${getStatusColor()}`,
          borderRadius: '20px',
          padding: '0.35rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--color-text, #111827)',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono, monospace)',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
          transition: 'transform 0.15s ease'
        }}
      >
        <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: getStatusColor() }} />
        <span>{getStatusText()}</span>
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            color: '#111827',
            fontFamily: 'sans-serif'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={24} style={{ color: '#16a34a' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Google Drive Sync & Guardrails</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '0.85rem',
              fontSize: '0.8rem',
              marginBottom: '1rem'
            }}>
              <div style={{ marginBottom: '0.35rem' }}>
                Connected Account: <strong style={{ color: '#111827' }}>{userEmail || 'Authenticated Google User'}</strong>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.725rem', color: '#6b7280' }}>
                Permanent File ID: {spreadsheetId || 'Active'}
              </div>
            </div>

            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '0.85rem',
              fontSize: '0.775rem',
              color: '#1e40af',
              marginBottom: '1.25rem',
              lineHeight: 1.45
            }}>
              <strong>💡 File Relocation Freedom:</strong> You can rename or move your Google Sheet file anywhere in your Google Drive at any time! Sync uses a permanent Google Drive <code>fileId</code>. Just avoid altering tab names or key column header titles.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {spreadsheetId && (
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.775rem',
                    color: '#2563eb',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Open Sheet in Google Drive</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  padding: '0.45rem 0.9rem',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SafetyShieldSyncBadge;
