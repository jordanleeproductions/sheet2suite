'use client';

import React, { useState, useEffect } from 'react';
import { ShareLinkRecord, generateShareToken } from '@/lib/share/token';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  ShieldAlert, 
  Clock, 
  Music, 
  Camera, 
  Utensils, 
  Sparkles, 
  AlertCircle,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  ShieldOff,
  UploadCloud
} from 'lucide-react';

interface VendorShareLinkManagerProps {
  spreadsheetId: string;
  weddingName: string;
  onOpenShareModal: () => void;
  onRevokeAll?: () => Promise<void>;
  onOpenPrintStudio?: (template: 'place_cards' | 'table_cards' | 'timeline' | 'vendors') => void;
}

export default function VendorShareLinkManager({
  spreadsheetId,
  weddingName,
  onOpenShareModal,
  onRevokeAll,
  onOpenPrintStudio,
}: VendorShareLinkManagerProps) {
  const [links, setLinks] = useState<ShareLinkRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [showRevokedSection, setShowRevokedSection] = useState(false);

  const handleGenerateGuestUploadLink = () => {
    const token = generateShareToken({
      spreadsheetId,
      scope: 'guest_upload',
      weddingName: weddingName || 'Our Wedding',
      expiresInDays: 90,
    });

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/upload/${token}`;

    const newRecord: ShareLinkRecord = {
      id: `link-upload-${Date.now()}`,
      scope: 'guest_upload',
      label: 'Guest Photo & Video Upload Portal',
      token,
      shareUrl,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exp: Date.now() + 90 * 24 * 60 * 60 * 1000,
      shareVersion: 1,
    };

    const updated = [newRecord, ...links];
    setLinks(updated);
    localStorage.setItem('s2v_generated_share_links', JSON.stringify(updated));
  };

  const handleGenerateSongRequestLink = () => {
    const token = generateShareToken({
      spreadsheetId,
      scope: 'guest_song_request',
      weddingName: weddingName || 'Our Wedding',
      expiresInDays: 90,
    });

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/request-song/${token}`;

    const newRecord: ShareLinkRecord = {
      id: `link-song-${Date.now()}`,
      scope: 'guest_song_request',
      label: 'Guest Live Song Request Portal',
      token,
      shareUrl,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exp: Date.now() + 90 * 24 * 60 * 60 * 1000,
      shareVersion: 1,
    };

    const updated = [newRecord, ...links];
    setLinks(updated);
    localStorage.setItem('s2v_generated_share_links', JSON.stringify(updated));
  };

  // Load links from local storage
  const loadLinks = () => {
    try {
      const saved = localStorage.getItem('s2v_generated_share_links');
      if (saved) {
        setLinks(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading saved share links:', e);
    }
  };

  useEffect(() => {
    loadLinks();

    // Listen for storage events across tabs or local updates
    const handleStorageChange = () => loadLinks();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCopyLink = (record: ShareLinkRecord) => {
    navigator.clipboard.writeText(record.shareUrl);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRevokeSingle = async (linkId: string) => {
    const updated = links.map(l => 
      l.id === linkId ? { ...l, isRevoked: true } : l
    );
    setLinks(updated);
    localStorage.setItem('s2v_generated_share_links', JSON.stringify(updated));
    if (onRevokeAll) await onRevokeAll();
  };

  const handleConfirmRevokeAll = async () => {
    const updated = links.map(l => ({ ...l, isRevoked: true }));
    setLinks(updated);
    localStorage.setItem('s2v_generated_share_links', JSON.stringify(updated));
    setShowRevokeAllModal(false);
    if (onRevokeAll) await onRevokeAll();
  };

  const handleClearRevokedHistory = () => {
    const activeOnly = links.filter(l => !l.isRevoked && l.exp > Date.now());
    setLinks(activeOnly);
    localStorage.setItem('s2v_generated_share_links', JSON.stringify(activeOnly));
  };

  const activeLinks = links.filter(l => !l.isRevoked && l.exp > Date.now());
  const revokedLinks = links.filter(l => l.isRevoked || l.exp <= Date.now());

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'music': return <Music size={16} />;
      case 'photos': return <Camera size={16} />;
      case 'timeline': return <Clock size={16} />;
      case 'catering': return <Utensils size={16} />;
      case 'guest_upload': return <UploadCloud size={16} />;
      case 'guest_song_request': return <Music size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Bar */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={styles.title}>ACTIVE VENDOR SHARE LINKS & ACCESS CONTROL</h3>
          </div>
          <p style={styles.subtitle}>
            Manage mobile read-only share links generated for your DJ, photographer, coordinator, and caterer.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {activeLinks.length > 0 && (
            <button 
              type="button"
              style={styles.revokeAllBtn}
              onClick={() => setShowRevokeAllModal(true)}
              title="Revoke all active vendor links"
            >
              <ShieldAlert size={14} style={{ marginRight: '4px' }} /> REVOKE ALL LINKS
            </button>
          )}

          <button 
            type="button" 
            style={{ 
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
              alignItems: 'center'
            }} 
            onClick={handleGenerateSongRequestLink}
            title="Generate mobile song request link for guests"
          >
            <Music size={15} style={{ marginRight: '4px' }} /> SONG REQUEST LINK
          </button>

          <button 
            type="button" 
            style={{ 
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
              alignItems: 'center'
            }} 
            onClick={handleGenerateGuestUploadLink}
            title="Generate mobile upload portal link for guests"
          >
            <UploadCloud size={15} style={{ marginRight: '4px' }} /> GUEST UPLOAD LINK
          </button>

          <button style={styles.addBtn} onClick={onOpenShareModal}>
            <Plus size={16} style={{ marginRight: '4px' }} /> GENERATE VENDOR LINK
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={styles.kpiBar}>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>TOTAL CREATED LINKS</span>
          <span style={styles.kpiValue}>{links.length} Links</span>
        </div>

        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>ACTIVE SHARE LINKS</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>
            {activeLinks.length} Active
          </span>
        </div>

        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>REVOKED / EXPIRED LINKS</span>
          <span style={{ ...styles.kpiValue, color: revokedLinks.length > 0 ? '#ef4444' : 'var(--color-muted)' }}>
            {revokedLinks.length} Revoked
          </span>
        </div>
      </div>

      {/* Active Links Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {activeLinks.map(link => {
          const daysLeft = Math.max(0, Math.ceil((link.exp - Date.now()) / (1000 * 60 * 60 * 24)));

          return (
            <div 
              key={link.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-bg)',
                border: '1.5px solid var(--color-primary)',
                borderRadius: 'var(--border-radius-sm)',
                transition: 'var(--transition-smooth)',
              }}
            >
              {/* Left Column: Scope Icon, Title & Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 250px', minWidth: '200px' }}>
                <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
                  {getScopeIcon(link.scope)}
                </div>
                <div>
                  <h4 style={styles.cardTitle}>{link.label}</h4>
                  <span style={styles.dateText}>
                    Created {new Date(link.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Right Column: Active Badge + Action Buttons aligned right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: 'var(--color-green-muted)',
                  color: 'var(--color-green)',
                  borderColor: 'var(--color-green)',
                }}>
                  ACTIVE ({daysLeft}d left)
                </span>

                <button 
                  type="button" 
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    backgroundColor: copiedId === link.id ? 'var(--color-green)' : 'var(--color-surface)',
                    color: copiedId === link.id ? '#ffffff' : 'var(--color-text)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.35rem 0.65rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  onClick={() => handleCopyLink(link)}
                >
                  {copiedId === link.id ? <Check size={13} /> : <Copy size={13} />}
                  {copiedId === link.id ? 'COPIED' : 'COPY'}
                </button>

                <a
                  href={link.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.35rem 0.65rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <ExternalLink size={13} /> OPEN
                </a>

                <button
                  type="button"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--color-surface)',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.35rem 0.65rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  onClick={() => handleRevokeSingle(link.id)}
                  title="Revoke access for this link"
                >
                  <Trash2 size={13} /> REVOKE
                </button>
              </div>
            </div>
          );
        })}

        {links.length === 0 && (
          <div style={styles.emptyState}>
            <Share2 size={36} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
            <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}>
              No Active Vendor Share Links Created Yet
            </h4>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', margin: '0.35rem 0 1rem 0' }}>
              Click <strong>"GENERATE VENDOR LINK"</strong> to create mobile, read-only portals for your DJ, photographer, or coordinator.
            </p>
            <button style={styles.addBtn} onClick={onOpenShareModal}>
              <Plus size={16} style={{ marginRight: '4px' }} /> GENERATE FIRST VENDOR LINK
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Revoked & Expired Links Section */}
      {revokedLinks.length > 0 && (
        <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--color-muted)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowRevokedSection(!showRevokedSection)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#ef4444',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0',
              }}
            >
              <ShieldOff size={16} />
              {showRevokedSection ? 'HIDE REVOKED & EXPIRED LINKS' : 'SHOW REVOKED & EXPIRED LINKS'} ({revokedLinks.length})
              {showRevokedSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showRevokedSection && (
              <button
                type="button"
                onClick={handleClearRevokedHistory}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  color: 'var(--color-muted)',
                  border: '1px solid var(--color-muted)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.6rem',
                  cursor: 'pointer',
                }}
              >
                CLEAR REVOKED HISTORY
              </button>
            )}
          </div>

          {showRevokedSection && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
              {revokedLinks.map(link => {
                return (
                  <div 
                    key={link.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-muted)',
                      borderRadius: 'var(--border-radius-sm)',
                      opacity: 0.75,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 250px', minWidth: '200px' }}>
                      <div style={{ color: 'var(--color-muted)', display: 'flex', alignItems: 'center' }}>
                        {getScopeIcon(link.scope)}
                      </div>
                      <div>
                        <h4 style={{ ...styles.cardTitle, color: 'var(--color-muted)' }}>{link.label}</h4>
                        <span style={styles.dateText}>
                          Created {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: link.isRevoked ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-bg)',
                        color: link.isRevoked ? '#ef4444' : 'var(--color-muted)',
                        borderColor: link.isRevoked ? '#ef4444' : 'var(--color-muted)',
                      }}>
                        {link.isRevoked ? 'REVOKED' : 'EXPIRED'}
                      </span>

                      <a
                        href={link.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-muted)',
                          border: '1px solid var(--color-muted)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '0.35rem 0.65rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <ExternalLink size={13} /> OPEN REVOKED PAGE
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Revoke All Confirmation Modal */}
      {showRevokeAllModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRevokeAllModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }}>DEACTIVATE ALL SHARE LINKS</h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} onClick={() => setShowRevokeAllModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to revoke access to all active vendor share links?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0.5rem 0 0 0' }}>
                Vendors opening previously shared links will see an <strong>Access Denied / Expired</strong> screen. You can generate new vendor links anytime.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowRevokeAllModal(false)}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  style={styles.confirmRevokeBtn}
                  onClick={handleConfirmRevokeAll}
                >
                  REVOKE ALL ACCESS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginTop: '1.5rem',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.95rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--color-text)',
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    margin: '0.25rem 0 0 0',
  },
  addBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-btn-selected-bg)',
    color: 'var(--color-btn-selected-text)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.875rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  revokeAllBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.875rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  kpiBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  kpiItem: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 0.875rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  kpiLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  kpiValue: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: 'var(--color-bg)',
    border: '2px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.875rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'var(--transition-smooth)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  cardTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--color-text)',
  },
  dateText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
  },
  statusBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid transparent',
    whiteSpace: 'nowrap',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionBtn: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.4rem 0.5rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text)',
  },
  emptyState: {
    gridColumn: '1 / -1',
    backgroundColor: 'var(--color-bg)',
    border: '1px dashed var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '2.5rem 1rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid #ef4444',
    borderRadius: 'var(--border-radius-md)',
    width: '100%',
    maxWidth: '440px',
    boxShadow: 'var(--box-shadow-heavy)',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#ef4444',
    padding: '0.875rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  cancelBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  confirmRevokeBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
};
