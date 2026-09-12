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
  const [partnerCopied, setPartnerCopied] = useState(false);
  const [showPartnerSharePicker, setShowPartnerSharePicker] = useState(false);

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

  const basePath = scope === 'guest_upload'
    ? '/upload/'
    : scope === 'guest_song_request'
    ? '/request-song/'
    : '/share/';

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${basePath}${token}`
    : `${basePath}${token}`;

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
            <h3 style={styles.title}>Share & Collaborate</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Cancel and close">
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Partner & Co-Planner Workspace Sharing Banner */}
          {(() => {
            const activeSheetId = spreadsheetId || (typeof window !== 'undefined' ? localStorage.getItem('s2v_spreadsheet_id') || '' : '');
            const partnerUrl = typeof window !== 'undefined'
              ? `${window.location.origin}/vow?spreadsheetId=${encodeURIComponent(activeSheetId)}`
              : `/vow?spreadsheetId=${activeSheetId}`;
            const weddingTitle = weddingName || 'Our Wedding';
            const shareTitle = `${weddingTitle} - Co-Planner Workspace Invitation`;
            const shareText = `Hi! Join me as an authorized co-planner on Sheet2Vow for ${weddingTitle}.\nAccess our live wedding database workspace: ${partnerUrl}`;
            const emailSubject = `${weddingTitle} - Co-Planning Invite`;
            const emailBody = `Hi! Join me as an authorized co-planner on Sheet2Vow for ${weddingTitle}.\n\nAccess your shared wedding workspace instantly here:\n${partnerUrl}\n\nSpreadsheet ID: ${activeSheetId}\n\nOnce you open this link and connect with Google, you'll have full co-planner access!`;

            return (
              <div style={{
                backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
                border: '1px solid var(--color-primary, #0b57d0)',
                borderRadius: 'var(--border-radius-sm, 8px)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '220px' }}>
                    <span style={{ fontSize: '1.25rem' }}>💍</span>
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
                        Sharing with your Partner or Co-Planner?
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748b)' }}>
                        Give them full collaborator access to your live wedding database workspace.
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowPartnerSharePicker(prev => !prev)}
                      style={{
                        backgroundColor: showPartnerSharePicker ? 'var(--color-primary, #0b57d0)' : 'transparent',
                        color: showPartnerSharePicker ? '#ffffff' : 'var(--color-primary, #0b57d0)',
                        border: '1px solid var(--color-primary, #0b57d0)',
                        borderRadius: '6px',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Share2 size={13} />
                      <span>{showPartnerSharePicker ? 'CLOSE' : 'SHARE'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(partnerUrl);
                        setPartnerCopied(true);
                        setTimeout(() => setPartnerCopied(false), 2500);
                      }}
                      style={{
                        backgroundColor: partnerCopied ? '#059669' : 'var(--color-primary, #0b57d0)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {partnerCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{partnerCopied ? 'COPIED!' : 'COPY LINK'}</span>
                    </button>
                  </div>
                </div>

                {/* Multi-Channel Options Picker */}
                {showPartnerSharePicker && (
                  <div style={{
                    paddingTop: '0.65rem',
                    borderTop: '1px solid var(--color-border, #e2e8f0)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
                        CHOOSE HOW TO SHARE INVITE:
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>
                        Includes Spreadsheet ID
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem' }}>
                      <a
                        href={`sms:?&body=${encodeURIComponent(shareText)}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--color-text)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--color-border, #cbd5e1)',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          justifyContent: 'center',
                        }}
                      >
                        <span>💬</span>
                        <span>Text (SMS)</span>
                      </a>

                      <a
                        href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--color-text)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--color-border, #cbd5e1)',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          justifyContent: 'center',
                        }}
                      >
                        <span>✉️</span>
                        <span>Email</span>
                      </a>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#15803d',
                          backgroundColor: '#ffffff',
                          border: '1px solid #86efac',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          justifyContent: 'center',
                        }}
                      >
                        <span>📱</span>
                        <span>WhatsApp</span>
                      </a>

                      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.share({
                                title: shareTitle,
                                text: shareText,
                                url: partnerUrl,
                              });
                            } catch (_) {}
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.5rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            backgroundColor: '#ffffff',
                            border: '1px solid var(--color-primary)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            justifyContent: 'center',
                          }}
                        >
                          <span>📲</span>
                          <span>Device Share</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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
              <strong>Vendor Portal Mode:</strong> Vendor share links below will only activate after clicking <strong>Activate Link</strong>.
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
