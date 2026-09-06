'use client';

import React, { useState } from 'react';
import { Plus, LucideIcon } from 'lucide-react';

export interface MobileFABSubAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  color?: string;
}

export interface MobileFABProps {
  onClick?: () => void;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  bottomOffset?: string;
  subActions?: MobileFABSubAction[];
  className?: string;
}

export default function MobileFAB({
  onClick,
  label,
  icon: Icon = Plus,
  disabled = false,
  bottomOffset = '5.125rem', // Sits cleanly above the 62px mobile bottom nav bar
  subActions,
  className = '',
}: MobileFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubActions = subActions && subActions.length > 0;

  const handleMainClick = () => {
    if (disabled) return;
    if (hasSubActions) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className={`mobile-fab-container ${className}`}>
      {/* Sub-actions Speed-Dial Menu (if provided, e.g. for Budget Ledger) */}
      {hasSubActions && isOpen && (
        <>
          {/* Backdrop for closing speed dial */}
          <div
            className="mobile-fab-backdrop"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 98,
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(2px)',
            }}
          />

          <div
            className="mobile-fab-speed-dial"
            style={{
              position: 'fixed',
              bottom: `calc(${bottomOffset} + 68px)`,
              right: '1.25rem',
              zIndex: 99,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'flex-end',
            }}
          >
            {subActions.map((sub, index) => {
              const SubIcon = sub.icon || Plus;
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                  }}
                  onClick={() => {
                    setIsOpen(false);
                    sub.onClick();
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      color: 'var(--color-text, #1e293b)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--border-radius-sm, 6px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: '1px solid var(--color-border, #e2e8f0)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sub.label}
                  </span>
                  <button
                    type="button"
                    aria-label={sub.label}
                    title={sub.label}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: sub.color || 'var(--color-surface, #ffffff)',
                      color: sub.color ? '#ffffff' : 'var(--color-primary, #1e293b)',
                      border: '1px solid var(--color-border, #cbd5e1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <SubIcon size={18} strokeWidth={2.5} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Main Floating Action Button */}
      <button
        type="button"
        onClick={handleMainClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className="mobile-fab-btn"
        style={{
          position: 'fixed',
          bottom: bottomOffset,
          right: '1.25rem',
          zIndex: 100,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary, #0f172a)',
          color: 'var(--color-on-primary, #ffffff)',
          border: 'none',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.32), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
          transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Icon
          size={26}
          strokeWidth={2.5}
          style={{
            transform: isOpen ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Scoped CSS ensuring FAB is strictly visible on mobile viewports */}
      <style jsx>{`
        .mobile-fab-btn:active {
          transform: scale(0.92) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
        }
        @media (min-width: 769px) {
          .mobile-fab-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
