'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Zap,
  ShieldCheck,
  Search,
  Key,
  ArrowRight,
  Heart,
  Grid,
  Printer,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

interface UnauthenticatedLandingProps {
  onOpenGoogleAuth: () => void;
  onExploreDemo: () => void;
  onScanDrive: () => void;
  onVerifyOrder: (email: string, orderId: string) => void;
  onReconnectUrl: (url: string) => void;
  isScanningDrive?: boolean;
  scannedSheets?: { id: string; name: string; folder: string }[];
  onSelectScannedSheet?: (id: string, name: string) => void;
}

export const UnauthenticatedLanding: React.FC<UnauthenticatedLandingProps> = ({
  onOpenGoogleAuth,
  onExploreDemo,
  onScanDrive,
  onVerifyOrder,
  onReconnectUrl,
  isScanningDrive,
  scannedSheets = [],
  onSelectScannedSheet,
}) => {
  const [activeTab, setActiveTab] = useState<'landing' | 'reconnect'>('landing');
  const [reconnectMethod, setReconnectMethod] = useState<'scan' | 'order' | 'url'>('scan');
  const [emailInput, setEmailInput] = useState('');
  const [orderIdInput, setOrderIdInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '2rem auto',
        padding: '0 1.5rem',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Hero Container */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '20px',
          padding: '3rem 2.5rem',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.01)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Accent Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            backgroundColor: '#e8f0fe',
            color: '#0b57d0',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
            marginBottom: '1.25rem',
          }}
        >
          <Sparkles size={15} />
          <span>GOOGLE SHEETS NATIVE WEDDING PLATFORM</span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'var(--color-text, #0f172a)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '0.85rem',
          }}
        >
          Your Google Sheet is your Wedding Database.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--color-muted, #64748b)',
            maxWidth: '680px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6,
          }}
        >
          A clean digital canvas for spreadsheet purists. Zero proprietary tracking databases — 100% data sovereignty in your personal Google Drive.
        </p>

        {/* Primary Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '2.5rem',
          }}
        >
          <button
            type="button"
            onClick={onOpenGoogleAuth}
            style={{
              backgroundColor: '#0b57d0',
              color: '#ffffff',
              padding: '0.85rem 1.75rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 6px -1px rgba(11, 87, 208, 0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            <FileSpreadsheet size={20} />
            <span>CONNECT GOOGLE DRIVE & LAUNCH PLANNER</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={onExploreDemo}
            style={{
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Zap size={18} style={{ color: '#f59e0b' }} />
            <span>EXPLORE DEMO WORKSPACE</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'reconnect' ? 'landing' : 'reconnect')}
            style={{
              backgroundColor: 'transparent',
              color: '#0b57d0',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Key size={16} />
            <span>{activeTab === 'reconnect' ? 'HIDE RECONNECT' : 'RECONNECT EXISTING SHEET'}</span>
          </button>
        </div>

        {/* Reconnection Drawer */}
        {activeTab === 'reconnect' && (
          <div
            style={{
              backgroundColor: '#f8fafd',
              border: '1px solid #cbd5e1',
              borderRadius: '14px',
              padding: '1.5rem',
              maxWidth: '580px',
              margin: '0 auto 2.5rem auto',
              textAlign: 'left',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              🔑 RECONNECT YOUR EXISTING PLANNER
            </h3>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.4 }}>
              Select how to locate your active Google Sheet database:
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {[
                { id: 'scan', label: '🔍 1-CLICK DRIVE SCANNER' },
                { id: 'order', label: '📜 ETSY ORDER LOOKUP' },
                { id: 'url', label: '🔗 SPREADSHEET URL' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setReconnectMethod(m.id as any)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    backgroundColor: reconnectMethod === m.id ? '#0b57d0' : '#ffffff',
                    color: reconnectMethod === m.id ? '#ffffff' : '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.35rem 0.65rem',
                    cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {reconnectMethod === 'scan' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onScanDrive}
                  disabled={isScanningDrive}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    backgroundColor: '#0b57d0',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.625rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isScanningDrive ? (
                    <>
                      <RefreshCw size={16} className="spin" /> SCANNING GOOGLE DRIVE...
                    </>
                  ) : (
                    <>
                      <Search size={16} /> SCAN GOOGLE DRIVE FOR SHEET2VOW FILES
                    </>
                  )}
                </button>

                {scannedSheets.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {scannedSheets.map((sheet) => (
                      <div
                        key={sheet.id}
                        onClick={() => onSelectScannedSheet && onSelectScannedSheet(sheet.id, sheet.name)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0.625rem 0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{sheet.name}</strong>
                          <div style={{ fontSize: '0.675rem', color: '#64748b' }}>📁 {sheet.folder}</div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 800, color: '#0b57d0' }}>RECONNECT &rarr;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {reconnectMethod === 'order' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onVerifyOrder(emailInput, orderIdInput);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <input
                  type="email"
                  required
                  placeholder="Etsy Purchase Email Address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  required
                  placeholder="Etsy Order ID (e.g. ETSY-98765432)"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
                <button
                  type="submit"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    backgroundColor: '#0b57d0',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.625rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  VERIFY ORDER & RECONNECT
                </button>
              </form>
            )}

            {reconnectMethod === 'url' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onReconnectUrl(urlInput);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <input
                  type="text"
                  required
                  placeholder="Paste Google Sheet URL or ID"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
                <button
                  type="submit"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    backgroundColor: '#0b57d0',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.625rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  CONNECT BY SPREADSHEET URL
                </button>
              </form>
            )}
          </div>
        )}

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#f8fafd',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#0b57d0' }}>
              <HardDrive size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>100% Data Sovereignty</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Your spreadsheet clones directly into your personal Google Drive using Google's minimal <code>drive.file</code> scope. No vendor lock-in.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafd',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#0b57d0' }}>
              <Grid size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>11 Relational Modules</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Real-time synchronization across Guest List, Seating Chart, Budget Ledger, Timeline, Vendors, Music Playlist, & Gift Registry.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafd',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#0b57d0' }}>
              <Printer size={20} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Print & Canva Studio</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Export place cards, binder printouts, and Canva Bulk Create CSV files in 1 click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthenticatedLanding;
