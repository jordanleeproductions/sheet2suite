'use client';

import React, { useState } from 'react';
import { generateShareToken, ShareScope, ShareLinkRecord } from '@/lib/share/token';
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
  onLinkCreated?: (record: ShareLinkRecord) => void;
}

export default function ShareModal({
  spreadsheetId,
  weddingName,
  initialScope = 'vendor_hub',
  onClose,
  onLinkCreated
}: ShareModalProps) {
  const [scope, setScope] = useState<ShareScope>(initialScope);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [copied, setCopied] = useState(false);

  // Scope labels mapping
  const scopeLabels: Record<ShareScope, string> = {
    music: 'DJ / Band Playlist',
    photos: 'Photographer Shot List',
    timeline: 'Coordinator Itinerary',
    catering: 'Catering & Venue Manager',
    vendor_hub: 'Full Vendor Hub',
    guest_upload: 'Guest Photo & Video Upload Portal',
    guest_song_request: 'Guest Song Request Portal',
  };

  // Generate Token & Link
  const expTimestamp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const token = generateShareToken({
    spreadsheetId,
    scope,
    weddingName: weddingName || 'Our Wedding',
    expiresInDays,
  });

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${token}`
    : `/share/${token}`;

  const handleConfirm = () => {
    const newRecord: ShareLinkRecord = {
      id: `SL_${Date.now().toString().slice(-4)}`,
      scope,
      label: scopeLabels[scope],
      token,
      shareUrl,
      createdAt: new Date().toISOString(),
      exp: expTimestamp,
      shareVersion: 1,
    };

    try {
      const existing = localStorage.getItem('s2v_generated_share_links');
      let list: ShareLinkRecord[] = existing ? JSON.parse(existing) : [];
      if (!list.some(l => l.token === token)) {
        list = [newRecord, ...list];
        localStorage.setItem('s2v_generated_share_links', JSON.stringify(list));
        if (onLinkCreated) onLinkCreated(newRecord);
      }
    } catch (e) {
      console.error('Error confirming share link:', e);
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.header} className="modalHeader">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={styles.title}>Create Vendor Share Link</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Cancel and close">
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Unconfirmed Draft Warning Banner */}
          <div style={{
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid #eab308',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.625rem 0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <AlertCircle size={16} style={{ color: '#eab308', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text)' }}>
              <strong>Draft Link Mode:</strong> This link will only become active and valid after you click <strong>Activate Link</strong> below.
            </span>
          </div>

          {/* Scope Selector */}
          <div style={styles.section}>
            <label style={styles.label}>1. SELECT SHARE SCOPE</label>
            <div style={styles.scopeGrid}>
              {[
                { id: 'vendor_hub', title: 'Full Vendor Hub', desc: 'All-in-One: Timeline, Music, Photos & Catering', icon: Sparkles },
                { id: 'music', title: 'DJ / Band Playlist', desc: 'Must-play, special moments & banned songs', icon: Music },
                { id: 'photos', title: 'Photographer Shot List', desc: 'Shot requirements, locations & posing notes', icon: Camera },
                { id: 'timeline', title: 'Coordinator Itinerary', desc: 'Day-of schedule, moments & UP NEXT ticker', icon: Clock },
                { id: 'catering', title: 'Caterer & Venue Manager', desc: 'Dietary breakdown, meals & seating counts', icon: Utensils },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = scope === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    style={{
                      ...styles.scopeCard,
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-muted)',
                      backgroundColor: isSelected ? 'var(--color-bg)' : 'transparent',
                    }}
                    onClick={() => setScope(item.id as ShareScope)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={18} style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-muted)' }} />
                      <span style={{ fontWeight: isSelected ? 700 : 600, fontSize: '0.85rem' }}>{item.title}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expiration Selector */}
          <div style={styles.section}>
            <label style={styles.label}>2. SET EXPIRATION DURATION</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { days: 7, label: '7 Days' },
                { days: 30, label: '30 Days' },
                { days: 90, label: '90 Days' },
                { days: 365, label: '1 Year' },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  style={{
                    ...styles.expBtn,
                    fontWeight: expiresInDays === item.days ? 700 : 400,
                    backgroundColor: expiresInDays === item.days ? 'var(--color-primary)' : 'transparent',
                    color: expiresInDays === item.days ? 'var(--color-on-primary)' : 'var(--color-text)',
                  }}
                  onClick={() => setExpiresInDays(item.days)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generated URL Box */}
          <div style={styles.section}>
            <label style={styles.label}>3. PREVIEW SHARE LINK URL</label>
            <div style={styles.urlBox}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={styles.urlInput}
              />
              <button
                type="button"
                style={{
                  ...styles.copyBtn,
                  backgroundColor: copied ? 'var(--color-green)' : 'var(--color-primary)',
                }}
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div style={styles.securityBanner}>
            <ShieldCheck size={18} style={{ color: 'var(--color-green)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text)' }}>
              Protected with <strong>HMAC-SHA256 Token Encryption</strong>. Excludes all financial ledger data and private guest addresses.
            </span>
          </div>

          {/* Bottom Actions: Cancel vs Confirm */}
          <div style={styles.footerActions}>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.previewBtn}
            >
              <ExternalLink size={14} style={{ marginRight: '0.35rem' }} /> OPEN PORTAL
            </a>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={onClose}
              >
                CANCEL
              </button>
              <button
                type="button"
                style={styles.confirmBtn}
                onClick={handleConfirm}
              >
                <Check size={16} style={{ marginRight: '0.35rem' }} /> CONFIRM SHARE LINK
              </button>
            </div>
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
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
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
    flexShrink: 0,
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
    flex: 1,
    overflowY: 'auto',
  },
  desc: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    margin: 0,
    lineHeight: 1.4,
  },
  section: {
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.5rem',
  },
  scopeCard: {
    fontFamily: 'var(--font-mono)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 0.75rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    color: 'var(--color-text)',
    transition: 'var(--transition-smooth)',
  },
  expBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.4rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  urlBox: {
    display: 'flex',
    gap: '0.5rem',
  },
  urlInput: {
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
    color: '#ffffff',
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
  footerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    padding: '0.875rem 1.25rem',
    borderTop: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-surface)',
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
  },
  previewBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.875rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  cancelBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.55rem 1rem',
    cursor: 'pointer',
  },
  confirmBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.55rem 1.15rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
};
