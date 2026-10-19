'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, ChevronDown, ChevronUp, CheckCircle2, History, ExternalLink } from 'lucide-react';
import { APP_VERSION, BUILD_TIMESTAMP } from '@/lib/buildInfo';
import { RELEASE_NOTES, ReleaseNoteItem } from '@/lib/releaseNotes';

export interface ReleaseNotesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion?: string;
}

/**
 * Responsive Release Notes Viewer
 * Desktop (>= 769px): Floating glassmorphism toast notification docked at bottom-right corner.
 * Mobile (<= 768px): Tactile slide-up bottom sheet popup with drag handle and scannable release cards.
 */
export default function ReleaseNotesViewer({
  isOpen,
  onClose,
  currentVersion = APP_VERSION,
}: ReleaseNotesViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});
  const toastRef = useRef<HTMLDivElement>(null);

  // Client-side mount check for createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Viewport breakpoint detection
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to dismiss desktop toast
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (toastRef.current && !toastRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Defer slightly to avoid immediate trigger from the badge click itself
    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile, onClose]);

  if (!mounted || !isOpen) return null;

  const latestRelease = RELEASE_NOTES[0];
  // Match current active version or fallback to the latest
  const activeRelease =
    RELEASE_NOTES.find(
      (r) =>
        r.version.toLowerCase() === currentVersion.toLowerCase() ||
        r.version.toLowerCase() === `v${currentVersion}`.toLowerCase()
    ) || latestRelease;

  const pastReleases = RELEASE_NOTES.filter((r) => r.version !== activeRelease.version);

  const toggleVersion = (ver: string) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [ver]: !prev[ver],
    }));
  };

  // =========================================================================
  // MOBILE VIEW: Tactile Bottom Sheet Popup
  // =========================================================================
  if (isMobile) {
    const mobileContent = (
      <div
        className="release-notes-backdrop-mobile"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          backgroundColor: 'rgba(15, 23, 42, 0.60)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.16s ease-out',
        }}
        onClick={onClose}
      >
        <div
          className="release-notes-sheet-panel"
          style={{
            width: '100%',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            borderTop: '1px solid var(--color-border, #E2E8F0)',
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.16)',
            animation: 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            boxSizing: 'border-box',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tactile Drag Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.65rem 0 0.35rem' }}>
            <div
              style={{
                width: '40px',
                height: '4.5px',
                backgroundColor: 'var(--color-border, #CBD5E1)',
                borderRadius: '9999px',
              }}
            />
          </div>

          {/* Sheet Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 1.25rem 0.75rem',
              borderBottom: '1px solid var(--color-border, #E2E8F0)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(79, 70, 229, 0.10)',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-interface-sans, system-ui)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--color-text, #0F172A)',
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Release Notes
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.12rem 0.45rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#059669',
                    }}
                  >
                    {activeRelease.version}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-interface-sans, system-ui)',
                    fontSize: '0.72rem',
                    color: 'var(--color-muted, #64748B)',
                    marginTop: '0.1rem',
                  }}
                >
                  Deployed {activeRelease.date} • {BUILD_TIMESTAMP}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'var(--color-bg-hover, #F1F5F9)',
                color: 'var(--color-muted, #64748B)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close release notes"
            >
              <X size={17} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div
            style={{
              padding: '1rem 1.25rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Active Release Card */}
            <div
              style={{
                backgroundColor: 'var(--color-bg, #F8FAFC)',
                border: '1px solid var(--color-border, #E2E8F0)',
                borderRadius: '14px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-interface-sans, system-ui)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--color-text, #0F172A)',
                  }}
                >
                  {activeRelease.title}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-interface-sans, system-ui)',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(79, 70, 229, 0.12)',
                    color: '#4F46E5',
                  }}
                >
                  {activeRelease.badge || 'New'}
                </span>
              </div>

              {activeRelease.details && (
                <p
                  style={{
                    fontFamily: 'var(--font-interface-sans, system-ui)',
                    fontSize: '0.78rem',
                    color: 'var(--color-muted, #64748B)',
                    margin: '0 0 0.75rem 0',
                    lineHeight: 1.45,
                  }}
                >
                  {activeRelease.details}
                </p>
              )}

              {/* Highlights List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeRelease.highlights.map((highlight, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <CheckCircle2 size={11} strokeWidth={2.6} />
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-interface-sans, system-ui)',
                        fontSize: '0.78rem',
                        color: 'var(--color-text, #0F172A)',
                        lineHeight: 1.4,
                      }}
                    >
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Releases Accordion */}
            {pastReleases.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-surface, #FFFFFF)',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-interface-sans, system-ui)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-text, #0F172A)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <History size={15} style={{ color: 'var(--color-muted, #64748B)' }} />
                    <span>Previous Releases ({pastReleases.length})</span>
                  </div>
                  {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showHistory && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.65rem' }}>
                    {pastReleases.map((rel) => {
                      const isExpanded = expandedVersions[rel.version];
                      return (
                        <div
                          key={rel.version}
                          style={{
                            backgroundColor: 'var(--color-bg, #F8FAFC)',
                            border: '1px solid var(--color-border, #E2E8F0)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleVersion(rel.version)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              padding: '0.65rem 0.85rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-technical-mono, monospace)',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    color: 'var(--color-primary, #0F172A)',
                                  }}
                                >
                                  {rel.version}
                                </span>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-interface-sans, system-ui)',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text, #0F172A)',
                                  }}
                                >
                                  {rel.title}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontFamily: 'var(--font-interface-sans, system-ui)',
                                  fontSize: '0.68rem',
                                  color: 'var(--color-muted, #64748B)',
                                  marginTop: '0.1rem',
                                }}
                              >
                                {rel.date}
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>

                          {isExpanded && (
                            <div
                              style={{
                                padding: '0 0.85rem 0.75rem 0.85rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.4rem',
                                borderTop: '1px solid var(--color-border, #E2E8F0)',
                                paddingTop: '0.5rem',
                              }}
                            >
                              {rel.highlights.map((h, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                                  <span style={{ color: '#059669', fontSize: '0.8rem', lineHeight: 1.3 }}>•</span>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-interface-sans, system-ui)',
                                      fontSize: '0.74rem',
                                      color: 'var(--color-text, #334155)',
                                      lineHeight: 1.35,
                                    }}
                                  >
                                    {h}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Action Footer */}
          <div
            style={{
              padding: '0.75rem 1.25rem calc(0.75rem + env(safe-area-inset-bottom, 0px))',
              borderTop: '1px solid var(--color-border, #E2E8F0)',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary, #0F172A)',
                color: 'var(--color-on-primary, #FFFFFF)',
                border: 'none',
                fontFamily: 'var(--font-interface-sans, system-ui)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );

    return createPortal(mobileContent, document.body);
  }

  // =========================================================================
  // DESKTOP VIEW: Floating Glassmorphism Toast Notification
  // =========================================================================
  const desktopContent = (
    <aside
      ref={toastRef}
      role="region"
      aria-label="Release Notes Summary"
      className="release-notes-toast-desktop"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        width: '420px',
        maxWidth: 'calc(100vw - 3rem)',
        maxHeight: 'calc(100vh - 4rem)',
        zIndex: 10000,
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '18px',
        boxShadow: '0 20px 45px -8px rgba(15, 23, 42, 0.25), 0 6px 18px -2px rgba(15, 23, 42, 0.10)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        animation: 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Toast Top Bar Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem 0.75rem',
          borderBottom: '1px solid var(--color-border, #E2E8F0)',
          backgroundColor: 'var(--color-bg, #F8FAFC)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              backgroundColor: 'rgba(79, 70, 229, 0.10)',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-interface-sans, system-ui)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--color-text, #0F172A)',
                  lineHeight: 1.2,
                }}
              >
                Release Notes
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  padding: '0.12rem 0.4rem',
                  borderRadius: '5px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                }}
              >
                {activeRelease.version}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-interface-sans, system-ui)',
                fontSize: '0.68rem',
                color: 'var(--color-muted, #64748B)',
                marginTop: '0.05rem',
              }}
            >
              Deployed {activeRelease.date} • {BUILD_TIMESTAMP}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--color-bg-hover, #F1F5F9)',
            color: 'var(--color-muted, #64748B)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 0,
            transition: 'background-color 0.12s ease',
          }}
          title="Dismiss"
          aria-label="Dismiss release notes"
        >
          <X size={15} />
        </button>
      </div>

      {/* Toast Content Area */}
      <div
        style={{
          padding: '0.95rem 1rem',
          overflowY: 'auto',
          maxHeight: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-interface-sans, system-ui)',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: 'var(--color-text, #0F172A)',
              }}
            >
              {activeRelease.title}
            </span>
          </div>

          {activeRelease.details && (
            <p
              style={{
                fontFamily: 'var(--font-interface-sans, system-ui)',
                fontSize: '0.74rem',
                color: 'var(--color-muted, #64748B)',
                margin: '0 0 0.65rem 0',
                lineHeight: 1.4,
              }}
            >
              {activeRelease.details}
            </p>
          )}

          {/* Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {activeRelease.highlights.map((highlight, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <CheckCircle2 size={10} strokeWidth={2.6} />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-interface-sans, system-ui)',
                    fontSize: '0.74rem',
                    color: 'var(--color-text, #1E293B)',
                    lineHeight: 1.35,
                  }}
                >
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Releases Dropdown / Accordion */}
        {pastReleases.length > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border, #E2E8F0)', paddingTop: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '0.2rem 0',
                cursor: 'pointer',
                fontFamily: 'var(--font-interface-sans, system-ui)',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-muted, #64748B)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <History size={13} />
                <span>Past Updates ({pastReleases.length})</span>
              </div>
              {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showHistory && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                {pastReleases.map((rel) => {
                  const isExpanded = expandedVersions[rel.version];
                  return (
                    <div
                      key={rel.version}
                      style={{
                        backgroundColor: 'var(--color-bg, #F8FAFC)',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleVersion(rel.version)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '0.45rem 0.65rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-technical-mono, monospace)',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: 'var(--color-primary, #0F172A)',
                            }}
                          >
                            {rel.version}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-interface-sans, system-ui)',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--color-text, #0F172A)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {rel.title}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      {isExpanded && (
                        <div
                          style={{
                            padding: '0 0.65rem 0.5rem 0.65rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.3rem',
                            borderTop: '1px solid var(--color-border, #E2E8F0)',
                            paddingTop: '0.4rem',
                          }}
                        >
                          {rel.highlights.map((h, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                              <span style={{ color: '#059669', fontSize: '0.75rem', lineHeight: 1.2 }}>•</span>
                              <span
                                style={{
                                  fontFamily: 'var(--font-interface-sans, system-ui)',
                                  fontSize: '0.7rem',
                                  color: 'var(--color-text, #334155)',
                                  lineHeight: 1.3,
                                }}
                              >
                                {h}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Bottom Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          padding: '0.65rem 1rem',
          borderTop: '1px solid var(--color-border, #E2E8F0)',
          backgroundColor: 'var(--color-bg, #F8FAFC)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary, #0F172A)',
            color: 'var(--color-on-primary, #FFFFFF)',
            border: 'none',
            fontFamily: 'var(--font-interface-sans, system-ui)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.12s ease',
          }}
        >
          Got it
        </button>
      </div>
    </aside>
  );

  return createPortal(desktopContent, document.body);
}
