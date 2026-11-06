'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  Lock,
  ExternalLink,
  Users,
  Layers,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface AdminGenerateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  getAdminHeaders: (extra?: Record<string, string>) => Record<string, string>;
}

const AVAILABLE_PRODUCTS = [
  {
    code: 'SHEET2VOW',
    name: 'Sheet2Vow',
    tagline: 'Bespoke Wedding Planning Suite',
    status: 'Live V1.0',
    statusColor: '#059669',
  },
  {
    code: 'SHEET2VAULT',
    name: 'Sheet2Vault',
    tagline: 'Personal Valuables & Insurance Vault',
    status: 'Dev Preview',
    statusColor: '#7C3AED',
  },
  {
    code: 'SHEET2FINANCE',
    name: 'Sheet2Finance',
    tagline: 'Financial Planning & Cashflow Engine',
    status: 'Planned',
    statusColor: '#4F46E5',
  },
  {
    code: 'SHEET2HOME',
    name: 'Sheet2Home',
    tagline: 'Home Renovation & Property Canvas',
    status: 'Planned',
    statusColor: '#0284C7',
  },
];

export default function AdminGenerateKeyModal({
  isOpen,
  onClose,
  onSuccess,
  getAdminHeaders,
}: AdminGenerateKeyModalProps) {
  const [prefixMode, setPrefixMode] = useState<'DEV' | 'VIP' | 'BETA' | 'QA' | 'CUSTOM'>('DEV');
  const [customPrefix, setCustomPrefix] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['SHEET2VOW', 'SHEET2VAULT']);
  const [singleUse, setSingleUse] = useState<boolean>(true);
  const [purchaserEmail, setPurchaserEmail] = useState<string>('');
  const [licenseTier, setLicenseTier] = useState<string>('developer');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleProduct = (code: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((p) => p !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleCopy = (text: string, identifier: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(identifier);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyDossier = () => {
    if (!createdKey) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sheet2suite.com';
    const actUrl = `${origin}/activate?orderId=${encodeURIComponent(createdKey.licenseKey)}`;
    const text = `🎉 **Your Sheet2Suite Special Access Key is Ready!**

- **License Key / Order ID:** \`${createdKey.licenseKey}\`
- **Entitled Products:** ${createdKey.entitledProducts?.join(', ')}
- **Access Tier:** ${createdKey.licenseTier?.toUpperCase()}
- **Single-Use Constraint:** ${createdKey.singleUse ? '✅ YES (Permanently consumed after first workspace activation)' : 'No (Multi-use)'}
- **Assigned Recipient:** ${createdKey.purchaserEmail || 'Open / Transferable to first redeemer'}
${createdKey.notes ? `- **Notes:** ${createdKey.notes}\n` : ''}
👉 **Activate Your Workspace Here:**
${actUrl}
`;
    handleCopy(text, 'dossier');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedProducts.length === 0) {
      setErrorMsg('Please select at least one product entitlement.');
      return;
    }

    const finalPrefix = prefixMode === 'CUSTOM' ? (customPrefix.trim() || 'DEV') : prefixMode;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/generate-license', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          prefix: finalPrefix,
          entitledProducts: selectedProducts,
          purchaserEmail: purchaserEmail.trim() || undefined,
          licenseTier,
          singleUse,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate license key.');
      }

      setCreatedKey(data.license);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with license generator service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNew = () => {
    setCreatedKey(null);
    setErrorMsg(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-lg, 12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.01em',
                }}
              >
                Generate Special Access License Key
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                Create single-use or multi-product license keys for the dev team, QA, and VIP users.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#B91C1C',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {createdKey ? (
            /* Success State: Key Reveal */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  <CheckCircle2 size={16} />
                  <span>LICENSE KEY READY FOR DEPLOYMENT</span>
                </div>

                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    border: '1.5px dashed #059669',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    color: 'var(--color-text)',
                    userSelect: 'all',
                  }}
                >
                  {createdKey.licenseKey}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdKey.licenseKey, 'key')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-primary)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedId === 'key' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedId === 'key' ? 'COPIED KEY' : 'COPY KEY'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyDossier}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedId === 'dossier' ? <Check size={13} style={{ color: '#059669' }} /> : <ExternalLink size={13} />}
                    <span>{copiedId === 'dossier' ? 'COPIED DOSSIER' : 'COPY HANDOVER DOSSIER'}</span>
                  </button>
                </div>
              </div>

              {/* Key Metadata Summary Table */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Entitled Products:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {createdKey.entitledProducts?.join(', ')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Redemption Constraint:</span>
                  <span style={{ fontWeight: 700, color: createdKey.singleUse ? '#D97706' : '#059669' }}>
                    {createdKey.singleUse ? '🔒 Single-Use (Locks permanently on first activation)' : 'Multi-use'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Assigned Purchaser:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {createdKey.purchaserEmail || 'Open / Transferable'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-muted)' }}>License Tier:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase' }}>
                    {createdKey.licenseTier}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleResetForNew}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    color: 'var(--color-text)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Generate Another Key
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Field 1: Key Prefix / Purpose */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '0.45rem',
                  }}
                >
                  1. License Key Identifier Prefix
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {(['DEV', 'VIP', 'BETA', 'QA', 'CUSTOM'] as const).map((p) => {
                    const isSelected = prefixMode === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrefixMode(p)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '6px',
                          border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-bg-subtle)',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 800 : 500,
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                        }}
                      >
                        {p === 'DEV' ? '🛠️ DEV' : p === 'VIP' ? '👑 VIP' : p === 'BETA' ? '🧪 BETA' : p === 'QA' ? '🔍 QA' : '⚙️ CUSTOM'}
                      </button>
                    );
                  })}
                </div>

                {prefixMode === 'CUSTOM' && (
                  <input
                    type="text"
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value)}
                    placeholder="Enter custom prefix (e.g. SPECIAL, PARTNER)..."
                    maxLength={8}
                    style={{
                      marginTop: '0.5rem',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      color: 'var(--color-text)',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>

              {/* Field 2: Entitled Products (Multi-Select) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    2. Product Entitlements (Choose One or More)
                  </label>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                    {selectedProducts.length} selected
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {AVAILABLE_PRODUCTS.map((prod) => {
                    const isChecked = selectedProducts.includes(prod.code);
                    return (
                      <div
                        key={prod.code}
                        onClick={() => handleToggleProduct(prod.code)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: isChecked ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.04)' : 'var(--color-surface, #ffffff)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by container
                          style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text)' }}>
                              {prod.name}
                            </span>
                            <span
                              style={{
                                fontSize: '0.6rem',
                                fontFamily: 'var(--font-mono)',
                                padding: '1px 5px',
                                borderRadius: '10px',
                                backgroundColor: isChecked ? 'var(--color-bg-subtle)' : 'transparent',
                                color: prod.statusColor,
                                fontWeight: 700,
                              }}
                            >
                              {prod.status}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted)', lineHeight: 1.3 }}>
                            {prod.tagline}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Strict Single-Use Constraint */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: singleUse ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-bg-subtle)',
                  border: singleUse ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                }}
              >
                <input
                  type="checkbox"
                  id="singleUseToggle"
                  checked={singleUse}
                  onChange={(e) => setSingleUse(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: '#D97706', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="singleUseToggle" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: singleUse ? '#B45309' : 'var(--color-text)' }}>
                    Single-Use License Key (Permanently locks once redeemed)
                  </span>
                  <span style={{ fontSize: '0.725rem', color: 'var(--color-muted)', lineHeight: 1.4 }}>
                    Once any workspace is provisioned with this key, it is permanently consumed and marked as used. It cannot be used again by any user or email address.
                  </span>
                </label>
              </div>

              {/* Field 4: Purchaser Email & License Tier */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Assignee Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={purchaserEmail}
                    onChange={(e) => setPurchaserEmail(e.target.value)}
                    placeholder="Leave blank for any user..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      color: 'var(--color-text)',
                      fontSize: '0.8rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Access Tier
                  </label>
                  <select
                    value={licenseTier}
                    onChange={(e) => setLicenseTier(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      color: 'var(--color-text)',
                      fontSize: '0.8rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="developer">Developer Access (developer)</option>
                    <option value="vip">VIP / Special User (vip)</option>
                    <option value="pro">Pro Suite Bundle (pro)</option>
                    <option value="standard">Standard License (standard)</option>
                  </select>
                </div>
              </div>

              {/* Field 5: Internal Notes */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem',
                  }}
                >
                  Internal Purpose / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Granted to dev team for Sheet2Vault beta schema testing..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    color: 'var(--color-text)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.65rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    color: 'var(--color-text)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-primary)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Generating Key...</span>
                    </>
                  ) : (
                    <>
                      <Key size={14} />
                      <span>Generate License Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
