'use client';

import React, { useState } from 'react';
import { generateShareToken, ShareScope } from '@/lib/share/token';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Music, 
  Camera, 
  Clock, 
  Utensils, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ShareModalProps {
  spreadsheetId: string;
  weddingName: string;
  initialScope?: ShareScope;
  onClose: () => void;
}

export default function ShareModal({
  spreadsheetId,
  weddingName,
  initialScope = 'vendor_hub',
  onClose,
}: ShareModalProps) {
  const [scope, setScope] = useState<ShareScope>(initialScope);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [copied, setCopied] = useState(false);

  // Generate Token & Link
  const token = generateShareToken({
    spreadsheetId,
    scope,
    weddingName: weddingName || 'Our Wedding',
    expiresInDays,
  });

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${token}`
    : `/share/${token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={styles.title}>GENERATE VENDOR SHARE LINK</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          <p style={styles.desc}>
            Create a secure, read-only mobile link for your vendors (DJ, Photographer, Coordinator, Catering). 
            No Google login required. Budget and private guest data are strictly hidden.
          </p>

          {/* Scope Selector */}
          <div style={styles.formGroup}>
            <label style={styles.label}>SELECT VENDOR PORTAL TYPE</label>
            <div style={styles.scopeGrid}>
              {[
                { id: 'music', label: 'DJ / Band Playlist', icon: Music, desc: 'Must-play & Banned tracks' },
                { id: 'photos', label: 'Photographer Shot List', icon: Camera, desc: 'Priority photo moments' },
                { id: 'timeline', label: 'Coordinator Itinerary', icon: Clock, desc: 'Day-of timeline' },
                { id: 'catering', label: 'Catering & Venue', icon: Utensils, desc: 'Dietary & seating headcount' },
                { id: 'vendor_hub', label: 'Full Vendor Hub', icon: Sparkles, desc: 'All vendor tabs combined' },
              ].map(item => {
                const IconComponent = item.icon;
                const isSelected = scope === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    style={{
                      ...styles.scopeOptionBtn,
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: isSelected ? 'var(--color-on-primary)' : 'var(--color-text)',
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-muted)',
                    }}
                    onClick={() => setScope(item.id as ShareScope)}
                  >
                    <IconComponent size={18} style={{ marginBottom: '0.2rem' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>{item.label}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expiration Selector */}
          <div style={styles.formGroup}>
            <label style={styles.label}>LINK EXPIRATION DURATION</label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              style={styles.select}
            >
              <option value={7}>7 Days (Active Wedding Week)</option>
              <option value={30}>30 Days (Recommended)</option>
              <option value={90}>90 Days</option>
              <option value={365}>1 Year</option>
            </select>
          </div>

          {/* Shareable Link Box */}
          <div style={styles.linkBox}>
            <label style={styles.label}>YOUR SHARED VENDOR URL</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={styles.linkInput}
              />
              <button 
                type="button" 
                style={{
                  ...styles.copyBtn,
                  backgroundColor: copied ? 'var(--color-green)' : 'var(--color-btn-selected-bg)',
                  color: copied ? '#ffffff' : 'var(--color-btn-selected-text)',
                }}
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
          </div>

          {/* Security Badge & Preview */}
          <div style={styles.securityBanner}>
            <ShieldCheck size={18} style={{ color: 'var(--color-green)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text)' }}>
              Protected with <strong>HMAC-SHA256 Token Encryption</strong>. Excludes all financial ledger data and private guest addresses.
            </span>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.previewBtn}
            >
              <ExternalLink size={16} style={{ marginRight: '0.35rem' }} /> PREVIEW VENDOR PORTAL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modal: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    width: '100%',
    maxWidth: '560px',
    boxShadow: 'var(--box-shadow-heavy)',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-bg)',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--color-text)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
  },
  body: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  desc: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    margin: 0,
    lineHeight: 1.4,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  scopeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.5rem',
  },
  scopeOptionBtn: {
    fontFamily: 'var(--font-mono)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 0.5rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.2rem',
    transition: 'var(--transition-smooth)',
  },
  select: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.625rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  linkBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  inputWrapper: {
    display: 'flex',
    gap: '0.5rem',
  },
  linkInput: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.625rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
  },
  copyBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0 1rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  securityBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.875rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '0.25rem',
  },
  previewBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
};
