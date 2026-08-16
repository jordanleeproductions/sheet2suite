'use client';

import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InfoDisclosureProps {
  title?: string;
  children: React.ReactNode;
  inlineText?: string;
}

export const InfoDisclosure: React.FC<InfoDisclosureProps> = ({
  title = 'Information',
  children,
  inlineText,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem 0.35rem',
          borderRadius: '50%',
          color: 'var(--color-primary, #0b57d0)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          transition: 'all 0.15s ease',
          verticalAlign: 'middle',
          touchAction: 'manipulation',
        }}
        aria-label={title}
        title="Tap for details"
      >
        <Info size={16} style={{ flexShrink: 0 }} />
        {inlineText && <span>{inlineText}</span>}
      </button>

      {isOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '2px solid var(--color-primary, #0b57d0)',
              borderRadius: '12px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.25rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
              fontSize: '0.875rem',
              color: 'var(--color-text, #1e293b)',
              lineHeight: 1.5,
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
                borderBottom: '1.5px solid var(--color-border, #e2e8f0)',
                paddingBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={18} style={{ color: 'var(--color-primary, #0b57d0)' }} />
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: 'var(--color-primary, #0b57d0)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {title}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text, #64748b)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--color-text, #334155)', margin: '0.5rem 0 1rem 0' }}>
              {children}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                backgroundColor: 'var(--color-primary, #0b57d0)',
                color: 'var(--color-on-primary, #ffffff)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono, monospace)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoDisclosure;

