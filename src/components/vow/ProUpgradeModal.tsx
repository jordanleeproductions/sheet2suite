'use client';

import React, { useState } from 'react';
import { X, Sparkles, Users, Bell, ShieldCheck, Check, ArrowRight, Star } from 'lucide-react';

export interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  weddingName?: string;
  styleTheme?: string;
}

/**
 * ProUpgradeModal Component (Sheet2Vow Pro Preview & Early Access)
 * Displays tier benefits for adding unlimited co-planners & coordinators,
 * with an interactive early access / upgrade waitlist registration.
 */
export default function ProUpgradeModal({
  isOpen,
  onClose,
  userEmail = '',
  weddingName = 'Our Wedding',
  styleTheme,
}: ProUpgradeModalProps) {
  const [emailInput, setEmailInput] = useState(userEmail);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 11000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderRadius: '20px',
          border: '1px solid var(--color-border, #E2E8F0)',
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25), 0 8px 16px -4px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'proModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes proModalPop {
            from { transform: scale(0.95) translateY(10px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Header Ribbon / Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0369A1 100%)',
            color: '#FFFFFF',
            padding: '1.25rem 1.5rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.55rem', borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              <Sparkles size={12} color="#FBBF24" />
              <span>Sheet2Vow Pro Tier</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          </div>

          <h3
            id="pro-modal-title"
            style={{
              fontFamily: 'var(--font-editorial-serif, serif)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Upgrade for Unlimited Collaborators
          </h3>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)', opacity: 0.95, lineHeight: 1.4 }}>
            Standard workspaces include 2 users (Primary + 1 Secondary). Upgrade to Pro to add wedding coordinators, wedding parties, and family planners.
          </p>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Feature Comparison List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <Users size={14} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-text, #0F172A)', display: 'block' }}>Unlimited Co-Planners & Coordinator Seats</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #64748B)' }}>Invite professional wedding planners, Maid of Honor, Best Man, and parents with dedicated edit access.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <ShieldCheck size={14} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-text, #0F172A)', display: 'block' }}>Granular Role & Tab Permissions</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #64748B)' }}>Grant coordinators access strictly to Timeline and Seating, while keeping Financials private.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <Bell size={14} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-text, #0F172A)', display: 'block' }}>Real-Time RSVP & Vendor Change Notifications</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-muted, #64748B)' }}>Automated instant alerts when guests update dietary choices or when vendor payments are due.</span>
              </div>
            </div>
          </div>

          {/* Interactive Form / Confirmation */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg-subtle, #F8FAFC)',
              border: '1px solid var(--color-border, #E2E8F0)',
              marginTop: '0.25rem',
            }}
          >
            {isSubmitted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#059669' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>You're on the Pro Early Access List!</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--color-muted, #64748B)' }}>We will notify you at {emailInput} with priority access and special couple pricing.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                  Request Pro Access for {weddingName}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-interface-sans, system-ui)',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.95rem',
                      backgroundColor: 'var(--color-primary, #0F172A)',
                      color: 'var(--color-on-primary, #FFFFFF)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{isLoading ? 'Saving...' : 'Get Pro Access'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-muted, #64748B)' }}>
                  Free standard tier remains 100% active with 2 users (Primary + 1 Secondary).
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
