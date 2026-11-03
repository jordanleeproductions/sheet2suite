'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  HardDrive,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { WorkspaceRecord } from '@/lib/db/licensingDb';
import { Sheet2SuiteLicense } from '@/lib/sheets/types';

interface AdminDashboardTabProps {
  workspaces: WorkspaceRecord[];
  licenses: Sheet2SuiteLicense[];
  onNavigateToTab: (tab: string, sheetId?: string) => void;
  getAdminHeaders: () => Record<string, string>;
}

export default function AdminDashboardTab({
  workspaces,
  licenses,
  onNavigateToTab,
  getAdminHeaders,
}: AdminDashboardTabProps) {
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/dashboard', { headers: getAdminHeaders() });
      if (!res.ok) throw new Error('Failed to load dashboard telemetry.');
      const data = await res.json();
      if (data.success) {
        setDashboardData(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Fallback calculation from props if API response pending
  const totalWorkspaces = dashboardData?.kpis?.totalWorkspaces ?? workspaces.length;
  const verifiedWorkspaces = dashboardData?.kpis?.verifiedWorkspaces ?? workspaces.filter((w) => w.orderVerified !== false).length;
  const verificationRate = dashboardData?.kpis?.verificationRate ?? (totalWorkspaces > 0 ? Math.round((verifiedWorkspaces / totalWorkspaces) * 100) : 100);
  const totalLicenses = dashboardData?.kpis?.totalLicenses ?? licenses.length;
  const activeLicenses = dashboardData?.kpis?.activeLicenses ?? licenses.filter((l) => l.status === 'active').length;
  const soloCount = dashboardData?.kpis?.soloWorkspaces ?? workspaces.filter((w) => !w.partnerEmail).length;
  const coupleCount = dashboardData?.kpis?.coupleWorkspaces ?? workspaces.filter((w) => Boolean(w.partnerEmail)).length;
  const vowCount = dashboardData?.products?.vowWorkspaces ?? workspaces.filter((w) => !w.productName || w.productName === 'Sheet2Vow').length;
  const vaultCount = dashboardData?.products?.vaultWorkspaces ?? workspaces.filter((w) => w.productName === 'Sheet2Vault').length;

  const recentActivations = dashboardData?.recentActivations || workspaces.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Controls & Sync Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Executive Operations Pulse
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
            High-level platform activity, licensing distributions, and live customer workspace telemetry.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboard}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--border-radius-sm, 6px)',
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--box-shadow-subtle)',
          }}
        >
          <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          <span>{isLoading ? 'SYNCING...' : 'REFRESH PULSE'}</span>
        </button>
      </div>

      {errorMsg && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-red-muted, #FEF2F2)',
          border: '1px solid rgba(220, 38, 38, 0.35)',
          color: 'var(--color-red, #DC2626)',
          borderRadius: 'var(--border-radius-sm, 6px)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.85rem',
      }}>
        {/* Card 1: Workspaces */}
        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-sm, 6px)',
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--box-shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Workspaces
            </span>
            <HardDrive size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
              {totalWorkspaces}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-green, #059669)', fontWeight: 700 }}>
              {verificationRate}% verified
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            {verifiedWorkspaces} Etsy orders • {totalWorkspaces - verifiedWorkspaces} trial/dev
          </span>
        </div>

        {/* Card 2: Registered Licenses */}
        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-sm, 6px)',
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--box-shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Registered Licenses
            </span>
            <Key size={16} style={{ color: '#F59E0B' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>
              {totalLicenses}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-green, #059669)', fontWeight: 700 }}>
              {activeLicenses} active
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            Etsy order codes & verified entitlements
          </span>
        </div>

        {/* Card 3: Collaboration Metrics */}
        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-sm, 6px)',
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--box-shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Collaboration Index
            </span>
            <Users size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
              {coupleCount}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
              couples synced
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            {soloCount} single planners • {coupleCount} 2-user co-planners
          </span>
        </div>

        {/* Card 4: Product Portfolio Split */}
        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-sm, 6px)',
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--box-shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Product Ecosystem
            </span>
            <FileSpreadsheet size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
              {vowCount}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 700 }}>
              + {vaultCount} vault (dev)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            Sheet2Vow (Live V1.0) & Sheet2Vault (Preview)
          </span>
        </div>
      </div>

      {/* Main Operational Split: Recent Activations + Platform Infrastructure */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {/* Left: Recent Activations Stream */}
        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-sm, 6px)',
          boxShadow: 'var(--box-shadow-subtle)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '0.9rem 1.15rem',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <TrendingUp size={15} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
                RECENT ACTIVATION STREAM
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('tracker')}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.725rem', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer', padding: 0 }}
            >
              View Full Tracker →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentActivations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                No active workspaces recorded in this environment yet.
              </div>
            ) : (
              recentActivations.slice(0, 6).map((ws: any) => (
                <div
                  key={ws.workspaceId || ws.spreadsheetId}
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ws.spreadsheetName || 'Wedding Workspace'}
                      </span>
                      <span style={{
                        fontSize: '0.625rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: ws.productName === 'Sheet2Vault' ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-bg-subtle)',
                        color: ws.productName === 'Sheet2Vault' ? '#3B82F6' : 'var(--color-primary)',
                        border: '1px solid var(--color-border)',
                      }}>
                        {ws.productName || 'Sheet2Vow'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>{ws.userEmail}</span>
                      {ws.partnerEmail && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--color-green, #059669)', fontWeight: 600 }}>+ partner synced</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => onNavigateToTab('validator', ws.spreadsheetId)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                      }}
                      title="Run Schema Diagnostics on this sheet"
                    >
                      Audit
                    </button>
                    {ws.webViewLink && (
                      <a
                        href={ws.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--color-green-muted, #ECFDF5)',
                          border: '1px solid rgba(5, 150, 105, 0.3)',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-green, #059669)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <ExternalLink size={11} />
                        <span>Sheet</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Platform Infrastructure & Tools Launchpad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Storage & Security Status */}
          <div style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm, 6px)',
            padding: '1.25rem',
            boxShadow: 'var(--box-shadow-subtle)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PLATFORM INFRASTRUCTURE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--color-green, #059669)' }} />
              <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
                {dashboardData?.storage?.engine || 'Cloud Firestore'}
              </span>
            </div>
            <p style={{ margin: '0.4rem 0 1rem 0', fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Workspace documents and license records persist reliably in production with real-time replication.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>AUTH SCOPE</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>drive.file + email</div>
              </div>
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>OAUTH CLIENT</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>Connected</div>
              </div>
            </div>
          </div>

          {/* Quick Tools Launchpad */}
          <div style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-sm, 6px)',
            padding: '1.25rem',
            boxShadow: 'var(--box-shadow-subtle)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OPERATIONAL SHORTCUTS
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => onNavigateToTab('tracker')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm, 6px)',
                  color: 'var(--color-text)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>🔑 Open License & Sheet Tracker</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab('validator')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm, 6px)',
                  color: 'var(--color-text)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>🛠️ Run Sheet Health Diagnostics</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab('templates')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm, 6px)',
                  color: 'var(--color-text)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>📑 Inspect Golden Master Templates</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
