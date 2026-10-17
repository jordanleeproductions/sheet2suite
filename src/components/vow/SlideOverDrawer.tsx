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
  onNext,
  hasPrevious = false,
  hasNext = false,
  width = '480px',
  children,
  footer,
}: SlideOverDrawerProps) {
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
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
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
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
              {badge && (
                <span
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '3px',
                    backgroundColor: `${badgeColor}15`,
                    color: badgeColor,
                    border: `1px solid ${badgeColor}30`,
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
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-primary, #0F172A)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
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
                  fontSize: '0.66rem',
                  color: 'var(--color-muted, #64748B)',
                  display: 'block',
                  marginTop: '0.1rem',
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
            {(onPrevious || onNext) && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-background-subtle, #F8FAFC)',
                }}
              >
                <button
                  type="button"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  title="Previous record (↑)"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: '0.35rem',
                    cursor: hasPrevious ? 'pointer' : 'default',
                    color: hasPrevious ? 'var(--color-text, #0F172A)' : 'var(--color-border, #CBD5E1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronUp size={15} />
                </button>
                <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border, #E2E8F0)' }} />
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!hasNext}
                  title="Next record (↓)"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: '0.35rem',
                    cursor: hasNext ? 'pointer' : 'default',
                    color: hasNext ? 'var(--color-text, #0F172A)' : 'var(--color-border, #CBD5E1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                border: '1px solid var(--color-border, #E2E8F0)',
                borderRadius: '4px',
                padding: '0.35rem',
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

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @media (max-width: 640px) {
          .slide-over-panel {
            max-width: 100% !important;
            width: 100% !important;
          }
          .slide-over-footer {
            padding-bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px)) !important;
          }
          .slide-over-footer button {
            min-height: 44px !important;
          }
        }
      `}</style>
    </div>
  );
}
