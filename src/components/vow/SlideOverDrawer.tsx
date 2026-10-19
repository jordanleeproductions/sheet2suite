'use client';

import React, { useEffect } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

export interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  onPrevious?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  badgeColor = '#0284C7',
  onPrevious,
  onPrev,
  onNext,
  hasPrevious,
  hasNext,
  width = '520px',
  children,
  footer,
}: SlideOverDrawerProps) {
  const handlePrev = onPrevious || onPrev;
  const canGoPrevious = hasPrevious !== undefined ? hasPrevious : Boolean(handlePrev);
  const canGoNext = hasNext !== undefined ? hasNext : Boolean(onNext);
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

  if (!isOpen) return null;

  return (
    <div
      className="slide-over-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="slide-over-panel"
        style={{
          width: '100%',
          maxWidth: width,
          height: '100vh',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderLeft: '1px solid var(--color-border, #E2E8F0)',
          boxShadow: '-6px 0 28px rgba(0, 0, 0, 0.14)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle (Visible only on mobile <= 640px) */}
        <div className="slide-over-drag-handle-bar">
          <div className="slide-over-drag-handle" />
        </div>

        {/* Header */}
        <div
          className="slide-over-header"
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              {badge && (
                <span
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '0.12rem 0.4rem',
                    borderRadius: '3px',
                    backgroundColor: `${badgeColor}18`,
                    color: badgeColor,
                    border: `1px solid ${badgeColor}35`,
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--font-editorial-serif, serif)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--color-primary, #0F172A)',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <span
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.68rem',
                  color: 'var(--color-muted, #64748B)',
                  display: 'block',
                  marginTop: '0.15rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {subtitle}
              </span>
            )}
          </div>

          {/* Header Controls: Prev/Next & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            {(handlePrev || onNext) && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid var(--color-border, #CBD5E1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-background-subtle, #F8FAFC)',
                }}
              >
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!canGoPrevious}
                  title="Previous record (↑)"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: '0.4rem',
                    cursor: canGoPrevious ? 'pointer' : 'default',
                    color: canGoPrevious ? 'var(--color-text, #0F172A)' : 'var(--color-muted, #CBD5E1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: canGoPrevious ? 1 : 0.35,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronUp size={15} />
                </button>
                <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border, #CBD5E1)' }} />
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext}
                  title="Next record (↓)"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: '0.4rem',
                    cursor: canGoNext ? 'pointer' : 'default',
                    color: canGoNext ? 'var(--color-text, #0F172A)' : 'var(--color-muted, #CBD5E1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: canGoNext ? 1 : 0.35,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              title="Close inspector (ESC)"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border, #CBD5E1)',
                borderRadius: '4px',
                padding: '0.4rem',
                cursor: 'pointer',
                color: 'var(--color-muted, #64748B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background-subtle, #F1F5F9)';
                e.currentTarget.style.color = 'var(--color-text, #0F172A)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-muted, #64748B)';
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div
          className="slide-over-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div
            className="slide-over-footer"
            style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid var(--color-border, #E2E8F0)',
              backgroundColor: 'var(--color-background-subtle, #F8FAFC)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        /* Desktop Animation */
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideUpMobile {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .slide-over-drag-handle-bar {
          display: none;
        }

        @media (min-width: 641px) {
          .slide-over-panel {
            animation: slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        }

        /* Mobile Bottom Sheet (<= 640px) */
        @media (max-width: 640px) {
          .slide-over-backdrop {
            align-items: flex-end !important;
            justify-content: center !important;
          }
          .slide-over-panel {
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            max-height: 94vh !important;
            border-top-left-radius: 20px !important;
            border-top-right-radius: 20px !important;
            border-left: none !important;
            border-top: 1px solid var(--color-border, #E2E8F0) !important;
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2) !important;
            animation: slideUpMobile 0.24s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .slide-over-drag-handle-bar {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            padding-top: 0.65rem !important;
            padding-bottom: 0.25rem !important;
            background-color: var(--color-surface, #FFFFFF) !important;
            border-top-left-radius: 20px !important;
            border-top-right-radius: 20px !important;
          }
          .slide-over-drag-handle {
            width: 38px !important;
            height: 4px !important;
            border-radius: 2px !important;
            background-color: var(--color-muted, #94A3B8) !important;
            opacity: 0.55 !important;
          }
          .slide-over-header {
            padding: 0.75rem 1.15rem 0.85rem 1.15rem !important;
          }
          .slide-over-body {
            padding: 1rem 1.15rem !important;
          }
          .slide-over-footer {
            padding: 0.85rem 1.15rem !important;
            padding-bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px)) !important;
          }
          .slide-over-footer button {
            min-height: 46px !important;
            font-size: 0.8rem !important;
            font-weight: 700 !important;
          }
          .slide-over-body input,
          .slide-over-body select,
          .slide-over-body textarea {
            min-height: 44px !important;
            font-size: 16px !important; /* Prevents auto-zoom on iOS */
            padding: 0.6rem 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
