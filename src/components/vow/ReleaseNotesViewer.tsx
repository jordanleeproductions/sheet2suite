'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle2, Layers, ShieldCheck, Zap, Calendar, Tag } from 'lucide-react';
import { getReleaseNotesByProduct, ReleaseNoteItem } from '@/lib/releaseNotes';
import { SuiteProductId, getProductBuildInfo } from '@/lib/buildInfo';

export interface ReleaseNotesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion?: string;
  product?: SuiteProductId;
}

const STORAGE_KEY_PREFIX = 's2v_last_seen_version';

export function getStorageKeyForProduct(product: SuiteProductId = 'vow'): string {
  return product === 'vow' ? STORAGE_KEY_PREFIX : `${STORAGE_KEY_PREFIX}_${product}`;
}

export function useUnreadReleaseNotes(product: SuiteProductId = 'vow') {
  const [hasUnread, setHasUnread] = useState(false);
  const productInfo = getProductBuildInfo(product);
  const storageKey = getStorageKeyForProduct(product);

  useEffect(() => {
    try {
      const lastSeen = localStorage.getItem(storageKey);
      if (lastSeen !== productInfo.version) {
        setHasUnread(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, [productInfo.version, storageKey]);

  const markAsRead = () => {
    try {
      localStorage.setItem(storageKey, productInfo.version);
      setHasUnread(false);
    } catch {
      // Ignore storage errors
    }
  };

  return { hasUnread, markAsRead };
}

export default function ReleaseNotesViewer({
  isOpen,
  onClose,
  currentVersion,
  product = 'vow',
}: ReleaseNotesViewerProps) {
  const productInfo = getProductBuildInfo(product);
  const displayVersion = currentVersion || productInfo.version;
  const releaseNotes: ReleaseNoteItem[] = getReleaseNotesByProduct(product);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'major' | 'feature' | 'enhancement' | 'fix'>('all');

  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem(getStorageKeyForProduct(product), displayVersion);
      } catch {
        // Ignore storage errors
      }
    }
  }, [isOpen, product, displayVersion]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotes = releaseNotes.filter((item: ReleaseNoteItem) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const getCategoryIcon = (category?: ReleaseNoteItem['category']) => {
    switch (category) {
      case 'major':
        return <Sparkles size={14} />;
      case 'feature':
        return <Layers size={14} />;
      case 'enhancement':
        return <Zap size={14} />;
      case 'fix':
        return <ShieldCheck size={14} />;
      default:
        return <CheckCircle2 size={14} />;
    }
  };

  const getCategoryLabel = (category?: ReleaseNoteItem['category']) => {
    switch (category) {
      case 'major':
        return 'Major Release';
      case 'feature':
        return 'New Feature';
      case 'enhancement':
        return 'Enhancement';
      case 'fix':
        return 'Fix & Polish';
      default:
        return 'Update';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="release-notes-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(9, 13, 22, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.18s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '86vh',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-lg, 16px)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2
                  id="release-notes-modal-title"
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-text)',
                  }}
                >
                  What&apos;s New in {productInfo.name}
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Current: {displayVersion}
                </span>
              </div>
              <p
                style={{
                  margin: '0.2rem 0 0 0',
                  fontSize: '0.8rem',
                  color: 'var(--color-muted)',
                }}
              >
                Product changelog, new capabilities, and recent improvements for {productInfo.name}.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close release notes"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            overflowX: 'auto',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {(
            [
              { id: 'all', label: 'All Releases' },
              { id: 'major', label: 'Major' },
              { id: 'feature', label: 'Features' },
              { id: 'enhancement', label: 'Enhancements' },
              { id: 'fix', label: 'Fixes' },
            ] as const
          ).map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  fontWeight: active ? 700 : 500,
                  border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: active ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                  color: active ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Release Timeline */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {filteredNotes.map((note: ReleaseNoteItem, idx: number) => {
            const isLatest = idx === 0 && selectedCategory === 'all';
            return (
              <div
                key={note.version}
                style={{
                  padding: '1.15rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: isLatest ? 'var(--color-bg-subtle)' : 'var(--color-surface)',
                  border: isLatest
                    ? '1.5px solid var(--color-primary, #10B981)'
                    : '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  position: 'relative',
                }}
              >
                {/* Top Meta Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <Tag size={12} style={{ color: 'var(--color-primary)' }} />
                      {note.version}
                    </span>

                    {note.badge && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '0.18rem 0.5rem',
                          borderRadius: '999px',
                          backgroundColor: note.badgeColor ? `${note.badgeColor}20` : 'rgba(16, 185, 129, 0.15)',
                          color: note.badgeColor || '#10B981',
                          border: `1px solid ${note.badgeColor ? `${note.badgeColor}45` : 'rgba(16, 185, 129, 0.35)'}`,
                        }}
                      >
                        {note.badge}
                      </span>
                    )}

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        color: 'var(--color-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {getCategoryIcon(note.category)}
                      {getCategoryLabel(note.category)}
                    </span>
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.72rem',
                      color: 'var(--color-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <Calendar size={12} />
                    {note.date}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    lineHeight: 1.35,
                  }}
                >
                  {note.title}
                </h3>

                {/* Summary details */}
                {note.details && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      color: 'var(--color-muted)',
                      lineHeight: 1.5,
                    }}
                  >
                    {note.details}
                  </p>
                )}

                {/* Highlights List */}
                <ul
                  style={{
                    margin: '0.2rem 0 0 0',
                    paddingLeft: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  {note.highlights.map((bullet: string, bIdx: number) => (
                    <li
                      key={bIdx}
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-text)',
                        lineHeight: 1.45,
                      }}
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.9rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
            {productInfo.name} • Active Build {displayVersion} • Deployed {productInfo.buildTimestamp}
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary, #FFFFFF)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
