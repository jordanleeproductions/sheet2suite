'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Plus,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  Download,
  Share2,
  ExternalLink,
  Camera,
  CheckCircle2,
  Home,
  Layers,
  ArrowRight,
  Eye,
  Trash2,
  Sparkles,
} from 'lucide-react';
import AmbientSyncIndicator from '@/components/vow/AmbientSyncIndicator';
import { useSheet2Theme } from '@/lib/core/theme/ThemeProvider';

interface VaultItem {
  id: string;
  name: string;
  category: string;
  room: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  replacementCost: number;
  condition: string;
  photoUrl?: string;
  receiptUrl?: string;
  readinessScore: number;
  status: 'Active' | 'Claimed' | 'Stolen' | 'Destroyed' | 'Sold';
  notes?: string;
}

const INITIAL_MOCK_ITEMS: VaultItem[] = [
  {
    id: 'VLT-0001',
    name: 'MacBook Pro 16" (M3 Max, 36GB, 1TB)',
    category: 'Electronics',
    room: 'Home Office',
    brand: 'Apple',
    model: 'MUW63LL/A',
    serialNumber: 'C02G9012MD6T',
    purchaseDate: '2025-11-15',
    purchasePrice: 3499,
    replacementCost: 3499,
    condition: 'Mint',
    readinessScore: 1.0,
    status: 'Active',
    notes: 'Space Black, small dbrand skin on top cover',
  },
  {
    id: 'VLT-0002',
    name: 'Rolex Submariner Date (Oystersteel)',
    category: 'Jewelry',
    room: 'Master Bedroom',
    brand: 'Rolex',
    model: '126610LN',
    serialNumber: '87X91234',
    purchaseDate: '2024-06-20',
    purchasePrice: 10250,
    replacementCost: 14500,
    condition: 'Mint',
    readinessScore: 1.0,
    status: 'Active',
    notes: 'Original box, papers, and warranty card cataloged',
  },
  {
    id: 'VLT-0003',
    name: 'Sony A7 IV Full-Frame Camera + 24-70mm GM II',
    category: 'Electronics',
    room: 'Home Office',
    brand: 'Sony',
    model: 'ILCE-7M4',
    serialNumber: '3049281',
    purchaseDate: '2025-02-10',
    purchasePrice: 4200,
    replacementCost: 4400,
    condition: 'Good',
    readinessScore: 0.6,
    status: 'Active',
    notes: 'UV filter attached, minor cosmetic rub mark on grip',
  },
  {
    id: 'VLT-0004',
    name: 'DeWalt 20V MAX Brushless 5-Tool Combo Kit',
    category: 'Power Tools',
    room: 'Garage & Workshop',
    brand: 'DeWalt',
    model: 'DCK594P2',
    serialNumber: 'DW-883910',
    purchaseDate: '2024-09-05',
    purchasePrice: 649,
    replacementCost: 699,
    condition: 'Good',
    readinessScore: 0.6,
    status: 'Active',
    notes: 'Stored in tough system rolling box with 2x 5Ah batteries',
  },
];

function VaultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, styleTheme } = useSheet2Theme();

  const spreadsheetId = searchParams?.get('spreadsheetId') || (typeof window !== 'undefined' ? localStorage.getItem('s2vault_spreadsheet_id') : null);

  // Private Preview Gate States
  const [testKeyInput, setTestKeyInput] = useState('');
  const [testEmailInput, setTestEmailInput] = useState('');

  // Vault Canvas States
  const [items, setItems] = useState<VaultItem[]>(INITIAL_MOCK_ITEMS);
  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved'>('saved');

  // Sub-limit configurations
  const JEWELRY_SUBLIMIT = 1500;
  const ELECTRONICS_SUBLIMIT = 5000;

  // Metrics
  const totalReplacementValue = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.replacementCost, 0);
  }, [items]);

  const jewelryTotal = useMemo(() => {
    return items.filter((i) => i.category === 'Jewelry').reduce((acc, curr) => acc + curr.replacementCost, 0);
  }, [items]);

  const electronicsTotal = useMemo(() => {
    return items.filter((i) => i.category === 'Electronics').reduce((acc, curr) => acc + curr.replacementCost, 0);
  }, [items]);

  const readinessAverage = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, curr) => acc + curr.readinessScore, 0);
    return Math.round((sum / items.length) * 100);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesRoom = selectedRoom === 'All' || item.room === selectedRoom;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.serialNumber.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesRoom && matchesSearch;
    });
  }, [items, selectedRoom, searchQuery]);

  const roomsList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.room));
    return ['All', ...Array.from(set)];
  }, [items]);

  // If no spreadsheetId is connected, render the Private Preview Access Shield
  if (!spreadsheetId) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '3rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '520px', width: '100%', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.6rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '3px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            <Lock size={12} /> Private Developer Preview
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            Sheet2Vault
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
            Personal asset inventory, serial number ledger, and 1-click insurance claim dossier engine. Sheet2Vault is currently in private pre-release testing.
          </p>

          <div style={{ padding: '1rem', backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '3px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Developer Authorization Gateway
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Test License Key / Order ID
              </label>
              <input
                type="text"
                value={testKeyInput}
                onChange={(e) => setTestKeyInput(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', fontSize: '1rem', minHeight: '48px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '3px', color: '#f8fafc', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Authorized Developer Email
              </label>
              <input
                type="email"
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', fontSize: '1rem', minHeight: '48px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '3px', color: '#f8fafc' }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                router.push(`/activate?product=vault&orderId=${encodeURIComponent(testKeyInput)}&email=${encodeURIComponent(testEmailInput)}`);
              }}
              style={{ width: '100%', padding: '0.75rem 1rem', minHeight: '48px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '3px', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'monospace' }}
            >
              PROVISION TEST VAULT IN DRIVE <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
            Production isolation active · Informational organizational tool only (Not insurance or legal advice)
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg, #f8fafc)', color: 'var(--color-text, #0f172a)', paddingBottom: '5rem' }}>
      {/* Top App Header */}
      <header style={{ borderBottom: '1px solid var(--color-border, #e2e8f0)', backgroundColor: 'var(--color-bg-card, #ffffff)', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#0f172a', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Sheet2Vault
              <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', backgroundColor: 'var(--color-bg-subtle, #f1f5f9)', border: '1px solid var(--color-border, #cbd5e1)', borderRadius: '3px', color: 'var(--color-muted, #64748b)', fontFamily: 'monospace' }}>
                DEV PREVIEW
              </span>
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>Primary Residence Vault</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AmbientSyncIndicator status={syncStatus} />
          <button
            type="button"
            onClick={() => setShowDossierModal(true)}
            style={{ padding: '0.5rem 0.85rem', minHeight: '38px', borderRadius: '3px', border: '1px solid var(--color-border, #cbd5e1)', backgroundColor: 'transparent', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'monospace' }}
          >
            <FileText size={14} /> CLAIM DOSSIER
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{ padding: '0.5rem 1rem', minHeight: '38px', borderRadius: '3px', border: 'none', backgroundColor: 'var(--color-primary, #0f172a)', color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'monospace' }}
          >
            <Plus size={14} /> ADD VALUABLE
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Monarch Hero Metric Strip */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--color-bg-card, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '3px', padding: '1.15rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
              Total Insured Value
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-0.02em' }}>
              ${totalReplacementValue.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>{items.length} items cataloged in Drive</span>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-card, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '3px', padding: '1.15rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
              Claim Readiness Health
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: readinessAverage >= 80 ? '#10b981' : '#f59e0b' }}>
              {readinessAverage}%
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--color-bg-subtle, #e2e8f0)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: `${readinessAverage}%`, height: '100%', backgroundColor: readinessAverage >= 80 ? '#10b981' : '#f59e0b' }} />
            </div>
          </div>

          {/* Sub-limit Alert Tile */}
          <div style={{ backgroundColor: jewelryTotal > JEWELRY_SUBLIMIT ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-bg-card, #ffffff)', border: jewelryTotal > JEWELRY_SUBLIMIT ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--color-border, #e2e8f0)', borderRadius: '3px', padding: '1.15rem' }}>
            <span style={{ fontSize: '0.75rem', color: jewelryTotal > JEWELRY_SUBLIMIT ? '#dc2626' : 'var(--color-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
              {jewelryTotal > JEWELRY_SUBLIMIT && <AlertTriangle size={14} />} Policy Sub-Limit Alert
            </span>
            {jewelryTotal > JEWELRY_SUBLIMIT ? (
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                  Jewelry: +${(jewelryTotal - JEWELRY_SUBLIMIT).toLocaleString()} Over Cap
                </div>
                <span style={{ fontSize: '0.75rem', color: '#991b1b', lineHeight: 1.3, display: 'block', marginTop: '0.25rem' }}>
                  Standard cap is ${JEWELRY_SUBLIMIT.toLocaleString()}. Schedule a rider with your broker.
                </span>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>
                  Within Standard Limits
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>
                  All categories within typical insurance caps
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Filters & Search Strip */}
        <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
          {/* Room Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {roomsList.map((room) => {
              const active = selectedRoom === room;
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    minHeight: '36px',
                    borderRadius: '3px',
                    border: active ? '1.5px solid var(--color-primary, #0f172a)' : '1px solid var(--color-border, #cbd5e1)',
                    backgroundColor: active ? 'var(--color-primary, #0f172a)' : 'var(--color-bg-card, #ffffff)',
                    color: active ? '#ffffff' : 'inherit',
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {room}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted, #94a3b8)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, serials, brands..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                fontSize: '0.85rem',
                minHeight: '40px',
                borderRadius: '3px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: 'var(--color-bg-card, #ffffff)',
                color: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        </section>

        {/* Item Ledger Table */}
        <section style={{ backgroundColor: 'var(--color-bg-card, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e2e8f0)', backgroundColor: 'var(--color-bg-subtle, #f8fafc)', color: 'var(--color-muted, #64748b)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Valuable / Make</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category & Room</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Serial Number</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Replacement ($)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Readiness</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>
                        {item.brand} {item.model && `· ${item.model}`}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.15rem 0.45rem', backgroundColor: 'var(--color-bg-subtle, #f1f5f9)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {item.category}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)', marginTop: '0.2rem' }}>
                        {item.room}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}>
                      {item.serialNumber ? (
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.2rem 0.4rem', borderRadius: '2px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          {item.serialNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444' }}>Missing Serial</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>
                      ${item.replacementCost.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '3px', backgroundColor: item.readinessScore === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: item.readinessScore === 1 ? '#059669' : '#d97706', border: item.readinessScore === 1 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)' }}>
                        {item.readinessScore === 1 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {Math.round(item.readinessScore * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setItems((prev) => prev.filter((i) => i.id !== item.id));
                        }}
                        style={{ border: 'none', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '0.3rem' }}
                        title="Delete Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Dossier Modal Preview */}
      {showDossierModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ maxWidth: '580px', width: '100%', backgroundColor: 'var(--color-bg-card, #ffffff)', border: '1px solid var(--color-border, #cbd5e1)', borderRadius: '4px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} /> Insurance Claim Dossier Studio
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--color-muted, #64748b)', lineHeight: 1.4 }}>
              Export a legally formatted evidence package with verified serial numbers, replacement values, and Google Drive photo proofs.
            </p>

            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '3px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--color-muted, #64748b)' }}>Cataloged Items:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{items.length} items</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--color-muted, #64748b)' }}>Total Claimable Replacement Cost:</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>${totalReplacementValue.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted, #64748b)' }}>Readiness Verification Rate:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{readinessAverage}% Claim-Ready</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  alert('Generating PDF Insurance Dossier: Compiling replacement valuations, serial badges, and receipt records...');
                }}
                style={{ padding: '0.75rem 1rem', minHeight: '44px', borderRadius: '3px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'monospace' }}
              >
                <Download size={16} /> DOWNLOAD ADJUSTER PACKET (PDF)
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Police Recovery Ledger Exported: Serial numbers and identifying marks compiled for law enforcement.');
                }}
                style={{ padding: '0.75rem 1rem', minHeight: '44px', borderRadius: '3px', border: '1px solid var(--color-border, #cbd5e1)', backgroundColor: 'transparent', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'monospace' }}
              >
                <ShieldCheck size={16} /> EXPORT POLICE STOLEN GOODS SHEET
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                style={{ padding: '0.5rem 1rem', minHeight: '38px', borderRadius: '3px', border: '1px solid var(--color-border, #cbd5e1)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ maxWidth: '500px', width: '100%', backgroundColor: 'var(--color-bg-card, #ffffff)', border: '1px solid var(--color-border, #cbd5e1)', borderRadius: '4px', padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>Quick-Add Asset</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const newItem: VaultItem = {
                  id: `VLT-000${items.length + 1}`,
                  name: form.itemName.value,
                  brand: form.itemBrand.value,
                  model: form.itemModel.value,
                  category: form.itemCategory.value,
                  room: form.itemRoom.value,
                  serialNumber: form.itemSerial.value,
                  purchaseDate: new Date().toISOString().split('T')[0],
                  purchasePrice: Number(form.itemPrice.value) || 0,
                  replacementCost: Number(form.itemPrice.value) || 0,
                  condition: 'Good',
                  readinessScore: form.itemSerial.value ? 0.8 : 0.4,
                  status: 'Active',
                };
                setItems((prev) => [newItem, ...prev]);
                setShowAddModal(false);
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Item Title</label>
                <input required name="itemName" placeholder="e.g. Gibson Les Paul Standard" style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', minHeight: '48px', borderRadius: '3px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Make / Brand</label>
                  <input required name="itemBrand" placeholder="e.g. Gibson" style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', minHeight: '48px', borderRadius: '3px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Model</label>
                  <input name="itemModel" placeholder="e.g. 50s Heritage" style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', minHeight: '48px', borderRadius: '3px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category</label>
                  <select name="itemCategory" style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', minHeight: '48px', borderRadius: '3px', border: '1px solid #cbd5e1' }}>
                    <option value="Electronics">Electronics</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Musical Instruments">Musical Instruments</option>
                    <option value="Power Tools">Power Tools</option>
                    <option value="Sporting Goods">Sporting Goods</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Room</label>
                  <select name="itemRoom" style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', minHeight: '48px', borderRadius: '3px', border: '1px solid #cbd5e1' }}>
                    <option value="Living Room">Living Room</option>
                    <option value="Home Office">Home Office</option>
                    <option value="Master Bedroom">Master Bedroom</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Garage & Workshop">Garage & Workshop</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Serial Number</label>
                  <input name="itemSerial" placeholder="e.g. 21980312" style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', minHeight: '48px', borderRadius: '3px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Replacement Cost ($)</label>
                  <input required name="itemPrice" type="number" placeholder="2500" style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', minHeight: '48px', borderRadius: '3px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.6rem 1rem', minHeight: '44px', borderRadius: '3px', border: '1px solid #cbd5e1', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.25rem', minHeight: '44px', borderRadius: '3px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace' }}>SAVE VALUABLE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Sheet2VaultPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'monospace' }}>Loading Sheet2Vault...</div>}>
      <VaultContent />
    </Suspense>
  );
}
