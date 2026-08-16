'use client';

import React from 'react';
import { Key, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface StepOrderVerificationProps {
  email: string;
  orderId: string;
  isVerifying: boolean;
  verifyError: string;
  setEmail: (val: string) => void;
  setOrderId: (val: string) => void;
  setVerifyError: (val: string) => void;
  onVerify: (e: React.FormEvent) => void;
}

export const StepOrderVerification: React.FC<StepOrderVerificationProps> = ({
  email,
  orderId,
  isVerifying,
  verifyError,
  setEmail,
  setOrderId,
  setVerifyError,
  onVerify,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <form onSubmit={onVerify} className="activation-form-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-bg-subtle, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
          <Key size={18} style={{ color: 'var(--color-highlight, #f59e0b)' }} />
          <span>Enter Etsy Order Details</span>
        </div>

        {verifyError && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{verifyError}</span>
            <button
              type="button"
              onClick={() => setVerifyError('')}
              style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', padding: '0.2rem' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text, #0f172a)', marginBottom: '0.4rem', letterSpacing: '0.25px' }}>
            ETSY PURCHASE EMAIL *
          </label>
          <input
            type="email"
            required
            placeholder="e.g. jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0.85rem', minHeight: '48px', borderRadius: '8px', border: '1.5px solid var(--color-border, #cbd5e1)', fontSize: '1rem', color: 'var(--color-text)', backgroundColor: 'var(--color-bg)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text, #0f172a)', marginBottom: '0.4rem', letterSpacing: '0.25px' }}>
            ETSY ORDER ID *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. ETSY-98765432"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0.85rem', minHeight: '48px', borderRadius: '8px', border: '1.5px solid var(--color-border, #cbd5e1)', fontSize: '1rem', color: 'var(--color-text)', backgroundColor: 'var(--color-bg)' }}
          />
          <span style={{ fontSize: '0.725rem', color: 'var(--color-muted, #64748b)', display: 'block', marginTop: '0.4rem' }}>
            Find your Order ID in your Etsy purchase confirmation email or receipt.
          </span>
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          style={{
            backgroundColor: 'var(--color-primary, #0b57d0)',
            color: 'var(--color-on-primary, #ffffff)',
            padding: '0.875rem 1.5rem',
            minHeight: '48px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            width: '100%',
          }}
        >
          {isVerifying ? (
            <span>Verifying with Etsy...</span>
          ) : (
            <>
              <span>VERIFY & ACTIVATE PLANNER</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.725rem', color: 'var(--color-muted, #64748b)', marginTop: '0.25rem', textAlign: 'center' }}>
          <ShieldCheck size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>Instant verification. Works out-of-the-box in Google Sheets & Web Mode.</span>
        </div>
      </form>
    </div>
  );
};

export default StepOrderVerification;
