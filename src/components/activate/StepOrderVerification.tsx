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
      <form onSubmit={onVerify} className="activation-form-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-bg-subtle, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)', padding: '0.625rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
          <Key size={16} style={{ color: 'var(--color-highlight, #f59e0b)' }} />
          <span>Enter Etsy Order Details</span>
        </div>

        {verifyError && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{verifyError}</span>
            <button
              type="button"
              onClick={() => setVerifyError('')}
              style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', padding: '0.1rem' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-muted, #64748b)', marginBottom: '0.35rem' }}>
            ETSY PURCHASE EMAIL *
          </label>
          <input
            type="email"
            required
            placeholder="e.g. jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-muted, #64748b)', marginBottom: '0.35rem' }}>
            ETSY ORDER ID *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. ETSY-98765432"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--color-border, #cbd5e1)', fontSize: '0.85rem' }}
          />
          <span style={{ fontSize: '0.675rem', color: 'var(--color-muted, #64748b)', display: 'block', marginTop: '0.35rem' }}>
            Find your Order ID in your Etsy purchase confirmation email or receipt.
          </span>
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          style={{
            backgroundColor: 'var(--color-primary, #0b57d0)',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--color-muted, #64748b)', marginTop: '0.25rem' }}>
          <ShieldCheck size={14} style={{ color: '#16a34a' }} />
          <span>Instant verification. Works out-of-the-box in Google Sheets & Web Mode.</span>
        </div>
      </form>
    </div>
  );
};

export default StepOrderVerification;
