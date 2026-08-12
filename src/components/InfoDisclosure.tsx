'use client';

import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InfoDisclosureProps {
  title?: string;
  children: React.ReactNode;
  inlineText?: string;
}

export const InfoDisclosure: React.FC<InfoDisclosureProps> = ({
  title = 'More Information',
  children,
  inlineText,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.15rem 0.35rem',
          borderRadius: '12px',
          color: 'var(--color-primary, #0b57d0)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.725rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          transition: 'all 0.15s ease',
        }}
        title="Click for details"
      >
        <Info size={14} style={{ flexShrink: 0 }} />
        {inlineText && <span>{inlineText}</span>}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 50,
            width: '280px',
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #cbd5e1)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontSize: '0.775rem',
            color: 'var(--color-text, #1e293b)',
            lineHeight: 1.45,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', borderBottom: '1px solid var(--color-border, #f1f5f9)', paddingBottom: '0.3rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--color-primary, #0b57d0)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {title}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
          <div>{children}</div>
        </div>
      )}
    </div>
  );
};

export default InfoDisclosure;
