'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  HardDrive,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  UserCheck,
  Layers,
  Copy,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { WorkspaceRecord } from '@/lib/db/licensingDb';
import { Sheet2SuiteLicense } from '@/lib/sheets/types';

interface MultiProductUserSummary {
  email: string;
  products: string[];
  productCount: number;
  workspaceCount: number;
  licenseCount: number;
  hasVow: boolean;
  hasVault: boolean;
  isMultiProduct: boolean;
}

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
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [userRosterFilter, setUserRosterFilter] = useState<'multi' | 'all'>('multi');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

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

  const handleCopyEmail = (email: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    }
  };

  // ---------------------------------------------------------------------------
  // Fallback / Instant Telemetry Computation
  // Ensures zero-delay rendering even before the network request returns.
  // ---------------------------------------------------------------------------
  const computedFallback = useMemo(() => {
    const normalizeProduct = (name?: string): string => {
      if (!name) return 'Sheet2Vow';
      const clean = name.trim().toLowerCase();
      if (clean.includes('vault')) return 'Sheet2Vault';
      if (clean.includes('vow')) return 'Sheet2Vow';
      if (clean.includes('finance')) return 'Sheet2Finance';
      if (clean.includes('home')) return 'Sheet2Home';
      return name.trim();
    };

    const uniqueUserEmails = new Set<string>();
    const uniquePrimaryOwners = new Set<string>();
    const uniqueCoUsers = new Set<string>();
    const uniqueLicenseHolders = new Set<string>();

    const userProductsMap = new Map<string, Set<string>>();
    const userWorkspacesMap = new Map<string, number>();
    const userLicensesMap = new Map<string, number>();

    const recordProduct = (email: string, product: string) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) return;
      uniqueUserEmails.add(cleanEmail);
      if (!userProductsMap.has(cleanEmail)) {
        userProductsMap.set(cleanEmail, new Set());
      }
      userProductsMap.get(cleanEmail)!.add(normalizeProduct(product));
    };

    let instancesWithCoUsers = 0;
    let soloInstances = 0;
    let twoUserInstances = 0;
    let multiCollaboratorInstances = 0;
    let totalAttachedCoUsers = 0;

    for (const ws of workspaces) {
      const prod = normalizeProduct(ws.productName);
      const owner = ws.userEmail?.trim().toLowerCase();

      if (owner) {
        uniquePrimaryOwners.add(owner);
        recordProduct(owner, prod);
        userWorkspacesMap.set(owner, (userWorkspacesMap.get(owner) || 0) + 1);
      }

      const instanceCoUsers = new Set<string>();
      if (ws.partnerEmail?.trim()) {
        const partner = ws.partnerEmail.trim().toLowerCase();
        if (partner !== owner) {
          instanceCoUsers.add(partner);
          uniqueCoUsers.add(partner);
          recordProduct(partner, prod);
        }
      }

      if (Array.isArray(ws.coPlanners)) {
        for (const cp of ws.coPlanners) {
          if (cp?.trim()) {
            const planner = cp.trim().toLowerCase();
            if (planner !== owner) {
              instanceCoUsers.add(planner);
              uniqueCoUsers.add(planner);
              recordProduct(planner, prod);
            }
          }
        }
      }

      if (instanceCoUsers.size > 0) {
        instancesWithCoUsers += 1;
        totalAttachedCoUsers += instanceCoUsers.size;
        if (instanceCoUsers.size === 1) {
          twoUserInstances += 1;
        } else {
          multiCollaboratorInstances += 1;
        }
      } else {
        soloInstances += 1;
      }
    }

    // Ingest licenses
    for (const lic of licenses) {
      const purchaser = lic.purchaserEmail?.trim().toLowerCase();
      if (purchaser) {
        uniqueLicenseHolders.add(purchaser);
        userLicensesMap.set(purchaser, (userLicensesMap.get(purchaser) || 0) + 1);
        if (Array.isArray(lic.entitledProducts) && lic.entitledProducts.length > 0) {
          lic.entitledProducts.forEach((ep) => recordProduct(purchaser, ep));
        } else if (lic.sku) {
          if (lic.sku.toLowerCase().includes('vault')) recordProduct(purchaser, 'Sheet2Vault');
          if (lic.sku.toLowerCase().includes('vow')) recordProduct(purchaser, 'Sheet2Vow');
          if (lic.sku.toLowerCase().includes('bundle') || lic.sku.toLowerCase().includes('master')) {
            recordProduct(purchaser, 'Sheet2Vow');
            recordProduct(purchaser, 'Sheet2Vault');
          }
        } else {
          recordProduct(purchaser, 'Sheet2Vow');
        }
      }

      const redeemer = (lic as any).usedBy?.trim().toLowerCase();
      if (redeemer) {
        uniqueUserEmails.add(redeemer);
        if (Array.isArray(lic.entitledProducts) && lic.entitledProducts.length > 0) {
          lic.entitledProducts.forEach((ep) => recordProduct(redeemer, ep));
        }
      }
    }

    const userSummaries: MultiProductUserSummary[] = [];
    const combinationsMap = new Map<string, { count: number; products: string[] }>();
    let multiProductUsersCount = 0;
    let singleProductUsersCount = 0;
    let vowUsersCount = 0;
    let vaultUsersCount = 0;

    userProductsMap.forEach((productSet, email) => {
      const prods = Array.from(productSet).sort();
      const count = prods.length;
      const isMulti = count >= 2;
      const hasVow = prods.includes('Sheet2Vow');
      const hasVault = prods.includes('Sheet2Vault');

      if (hasVow) vowUsersCount += 1;
      if (hasVault) vaultUsersCount += 1;

      if (isMulti) {
        multiProductUsersCount += 1;
        const comboKey = prods.join(' + ');
        const existing = combinationsMap.get(comboKey) || { count: 0, products: prods };
        existing.count += 1;
        combinationsMap.set(comboKey, existing);
      } else if (count === 1) {
        singleProductUsersCount += 1;
      }

      userSummaries.push({
        email,
        products: prods,
        productCount: count,
        workspaceCount: userWorkspacesMap.get(email) || 0,
        licenseCount: userLicensesMap.get(email) || 0,
        hasVow,
        hasVault,
        isMultiProduct: isMulti,
      });
    });

    userSummaries.sort((a, b) => {
      if (a.isMultiProduct && !b.isMultiProduct) return -1;
      if (!a.isMultiProduct && b.isMultiProduct) return 1;
      if (b.productCount !== a.productCount) return b.productCount - a.productCount;
      return a.email.localeCompare(b.email);
    });

    const combinations = Array.from(combinationsMap.entries())
      .map(([combination, meta]) => ({
        combination,
        count: meta.count,
        products: meta.products,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalWorkspaces: workspaces.length,
      verifiedWorkspaces: workspaces.filter((w) => w.orderVerified !== false).length,
      totalLicenses: licenses.length,
      activeLicenses: licenses.filter((l) => l.status === 'active').length,
      instancesWithCoUsers,
      soloInstances,
      twoUserInstances,
      multiCollaboratorInstances,
      totalAttachedCoUsers,
      coUserAttachmentRate: workspaces.length > 0 ? Math.round((instancesWithCoUsers / workspaces.length) * 100) : 0,
      totalUniqueUsers: uniqueUserEmails.size,
      uniquePrimaryOwners: uniquePrimaryOwners.size,
      uniqueCoUsers: uniqueCoUsers.size,
      uniqueLicenseHolders: uniqueLicenseHolders.size,
      multiProductUsersCount,
      singleProductUsersCount,
      multiProductRate: uniqueUserEmails.size > 0 ? Math.round((multiProductUsersCount / uniqueUserEmails.size) * 100) : 0,
      vowUsersCount,
      vaultUsersCount,
      combinations,
      userSummaries,
    };
  }, [workspaces, licenses]);

  // Unified Metric Values (API telemetry preferred, fallback to instant local)
  const totalWorkspaces = dashboardData?.kpis?.totalWorkspaces ?? computedFallback.totalWorkspaces;
  const verifiedWorkspaces = dashboardData?.kpis?.verifiedWorkspaces ?? computedFallback.verifiedWorkspaces;
  const verificationRate = dashboardData?.kpis?.verificationRate ?? (totalWorkspaces > 0 ? Math.round((verifiedWorkspaces / totalWorkspaces) * 100) : 100);

  const totalLicenses = dashboardData?.kpis?.totalLicenses ?? computedFallback.totalLicenses;
  const activeLicenses = dashboardData?.kpis?.activeLicenses ?? computedFallback.activeLicenses;

  // 1. Unique Users Metric
  const totalUniqueUsers = dashboardData?.uniqueUsers?.total ?? dashboardData?.kpis?.totalUniqueUsers ?? computedFallback.totalUniqueUsers;
  const uniquePrimaryOwners = dashboardData?.uniqueUsers?.primaryOwners ?? dashboardData?.kpis?.uniquePrimaryOwners ?? computedFallback.uniquePrimaryOwners;
  const uniqueCoUsers = dashboardData?.uniqueUsers?.coUsers ?? dashboardData?.kpis?.uniqueCoUsers ?? computedFallback.uniqueCoUsers;
  const uniqueLicenseHolders = dashboardData?.uniqueUsers?.licenseHolders ?? dashboardData?.kpis?.uniqueLicenseHolders ?? computedFallback.uniqueLicenseHolders;

  // 2. Co-User Instances Metric
  const instancesWithCoUsers = dashboardData?.coUserInstances?.totalWithCoUsers ?? dashboardData?.kpis?.instancesWithCoUsers ?? computedFallback.instancesWithCoUsers;
  const soloInstances = dashboardData?.coUserInstances?.soloInstances ?? dashboardData?.kpis?.soloInstances ?? computedFallback.soloInstances;
  const coUserAttachmentRate = dashboardData?.coUserInstances?.attachmentRate ?? dashboardData?.kpis?.coUserAttachmentRate ?? computedFallback.coUserAttachmentRate;
  const twoUserInstances = dashboardData?.coUserInstances?.twoUserInstances ?? computedFallback.twoUserInstances;
  const multiCollaboratorInstances = dashboardData?.coUserInstances?.multiCollaboratorInstances ?? computedFallback.multiCollaboratorInstances;
  const totalAttachedCoUsers = dashboardData?.coUserInstances?.totalAttachedCoUsers ?? computedFallback.totalAttachedCoUsers;
  const avgCoUsersPerInstance = dashboardData?.coUserInstances?.avgCoUsersPerInstance ?? (instancesWithCoUsers > 0 ? (totalAttachedCoUsers / instancesWithCoUsers).toFixed(1) : '0');

  // 3. Multi-Product Users Metric
  const multiProductUsersCount = dashboardData?.multiProductTelemetry?.multiProductUsersCount ?? dashboardData?.kpis?.multiProductUsersCount ?? computedFallback.multiProductUsersCount;
  const multiProductRate = dashboardData?.multiProductTelemetry?.multiProductRate ?? dashboardData?.kpis?.multiProductRate ?? computedFallback.multiProductRate;
  const vowUsersCount = dashboardData?.multiProductTelemetry?.productCounts?.vowUsers ?? computedFallback.vowUsersCount;
  const vaultUsersCount = dashboardData?.multiProductTelemetry?.productCounts?.vaultUsers ?? computedFallback.vaultUsersCount;
  const combinations = dashboardData?.multiProductTelemetry?.combinations ?? computedFallback.combinations;
  const userSummaries: MultiProductUserSummary[] = dashboardData?.multiProductTelemetry?.users ?? computedFallback.userSummaries;

  // Filtered User Roster
  const filteredUsers = useMemo(() => {
    return userSummaries.filter((u) => {
      if (userRosterFilter === 'multi' && !u.isMultiProduct) return false;
      if (userSearchTerm.trim()) {
        const query = userSearchTerm.trim().toLowerCase();
        const matchesEmail = u.email.toLowerCase().includes(query);
        const matchesProduct = u.products.some((p) => p.toLowerCase().includes(query));
        if (!matchesEmail && !matchesProduct) return false;
      }
      return true;
    });
  }, [userSummaries, userRosterFilter, userSearchTerm]);

  const recentActivations = dashboardData?.recentActivations || workspaces.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Controls & Sync Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Executive Operations Pulse
            </h2>
            <span style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              letterSpacing: '0.04em',
            }}>
              V1.24 TELEMETRY
            </span>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
            High-level platform audience, unique user footprints, co-user instance attachment, and multi-product adoption.
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

      {/* 4 PRIMARY METRIC CARDS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '0.85rem',
      }}>
        {/* Card 1: Active Workspaces */}
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
            {verifiedWorkspaces} Etsy orders • {soloInstances} solo • {instancesWithCoUsers} with co-users
          </span>
        </div>

        {/* Card 2: Number of Unique Users */}
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
              Unique Users
            </span>
            <Users size={16} style={{ color: '#059669' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#059669' }}>
              {totalUniqueUsers}
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              padding: '1px 6px',
              borderRadius: '4px',
            }}>
              All Accounts
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            {uniquePrimaryOwners} primary owners • {uniqueCoUsers} invited co-users • {uniqueLicenseHolders} purchasers
          </span>
        </div>

        {/* Card 3: Instances with Co-Users */}
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
              Instances with Co-Users
            </span>
            <UserCheck size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
              {instancesWithCoUsers}
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--color-primary)',
              fontWeight: 700,
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              padding: '1px 6px',
              borderRadius: '4px',
            }}>
              {coUserAttachmentRate}% attached
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            {twoUserInstances} partner pairs • {multiCollaboratorInstances} multi-teams • {soloInstances} solo
          </span>
        </div>

        {/* Card 4: Multi-Product Users */}
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
              Multi-Product Users
            </span>
            <Sparkles size={16} style={{ color: '#8B5CF6' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#8B5CF6' }}>
              {multiProductUsersCount}
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: '#8B5CF6',
              fontWeight: 700,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              padding: '1px 6px',
              borderRadius: '4px',
            }}>
              {multiProductRate}% cross-suite
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            Users with 2+ products (e.g. Sheet2Vow & Sheet2Vault)
          </span>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          DEEP DIVE ANALYTICS SECTION:
          Left: Co-User Instance Attachment Analytics
          Right: Multi-Product User Cross-Pollination & Roster
          ----------------------------------------------------------------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {/* Left Panel: Co-User Instance Attachment Deep Dive */}
        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-sm, 6px)',
          boxShadow: 'var(--box-shadow-subtle)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <UserCheck size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
                CO-USER INSTANCE ATTACHMENT
              </span>
            </div>
            <span style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--color-muted)',
            }}>
              {instancesWithCoUsers} / {totalWorkspaces} INSTANCES
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
            Tracks how many provisioned workspace instances are operated collaboratively with co-users (partner or wedding coordinator) versus solo single-user planners.
          </p>

          {/* Attachment Distribution Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              <span style={{ color: 'var(--color-primary)' }}>Co-User Synced: {coUserAttachmentRate}%</span>
              <span style={{ color: 'var(--color-muted)' }}>Solo Planners: {100 - coUserAttachmentRate}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: '4px',
              overflow: 'hidden',
              display: 'flex',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{
                width: `${coUserAttachmentRate}%`,
                backgroundColor: 'var(--color-primary)',
                transition: 'width 0.3s ease',
              }} />
              <div style={{
                width: `${100 - coUserAttachmentRate}%`,
                backgroundColor: 'var(--color-border)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* Breakdown Matrix Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {/* Solo Planners */}
            <div style={{
              padding: '0.65rem 0.75rem',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>SOLO INSTANCES</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', marginTop: '2px' }}>
                {soloInstances}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                Single user
              </div>
            </div>

            {/* 2-User Pairs */}
            <div style={{
              padding: '0.65rem 0.75rem',
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>2-USER PAIRS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginTop: '2px' }}>
                {twoUserInstances}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                Owner + Partner
              </div>
            </div>

            {/* Pro Teams (3+) */}
            <div style={{
              padding: '0.65rem 0.75rem',
              backgroundColor: 'rgba(5, 150, 105, 0.05)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#059669', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>PRO MULTI-TEAMS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#059669', marginTop: '2px' }}>
                {multiCollaboratorInstances}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                3+ collaborators
              </div>
            </div>
          </div>

          {/* Key Collaborative Indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            fontSize: '0.75rem',
          }}>
            <span style={{ color: 'var(--color-muted)' }}>Total Secondary Seats Attached:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-text)' }}>
              {totalAttachedCoUsers} co-users
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('tracker')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.85rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            <span>View Workspaces in Sheet Tracker</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Right Panel: Multi-Product User Cross-Pollination & Roster */}
        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-sm, 6px)',
          boxShadow: 'var(--box-shadow-subtle)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sparkles size={16} style={{ color: '#8B5CF6' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: '#8B5CF6', letterSpacing: '0.04em' }}>
                MULTI-PRODUCT CROSS-POLLINATION
              </span>
            </div>
            <span style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--color-muted)',
            }}>
              {multiProductUsersCount} / {totalUniqueUsers} USERS ({multiProductRate}%)
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
            Identifies customers holding or operating multiple Sheet2Suite products simultaneously (e.g. wedding planning with <strong>Sheet2Vow</strong> + document escrow with <strong>Sheet2Vault</strong>).
          </p>

          {/* Product Reach Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div style={{
              padding: '0.65rem 0.75rem',
              backgroundColor: 'rgba(5, 150, 105, 0.05)',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#059669', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>SHEET2VOW</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#059669', marginTop: '2px' }}>
                {vowUsersCount}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                active accounts
              </div>
            </div>

            <div style={{
              padding: '0.65rem 0.75rem',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#3B82F6', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>SHEET2VAULT</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#3B82F6', marginTop: '2px' }}>
                {vaultUsersCount}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                preview accounts
              </div>
            </div>

            <div style={{
              padding: '0.65rem 0.75rem',
              backgroundColor: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '4px',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#8B5CF6', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>BOTH VOW + VAULT</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#8B5CF6', marginTop: '2px' }}>
                {multiProductUsersCount}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                cross-suite users
              </div>
            </div>
          </div>

          {/* Active Product Combination Chips */}
          {combinations.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                COMBINATIONS:
              </span>
              {combinations.map((c: any) => (
                <span
                  key={c.combination}
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8B5CF6',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}
                >
                  {c.combination} ({c.count})
                </span>
              ))}
            </div>
          )}

          {/* Search & Toggle Bar for User Roster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 180px' }}>
              <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search user email..."
                style={{
                  width: '100%',
                  padding: '0.35rem 0.5rem 0.35rem 1.7rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-sans)',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-bg-subtle)', padding: '2px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={() => setUserRosterFilter('multi')}
                style={{
                  padding: '3px 8px',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: userRosterFilter === 'multi' ? '#8B5CF6' : 'transparent',
                  color: userRosterFilter === 'multi' ? '#ffffff' : 'var(--color-muted)',
                }}
              >
                Multi-Product ({multiProductUsersCount})
              </button>
              <button
                type="button"
                onClick={() => setUserRosterFilter('all')}
                style={{
                  padding: '3px 8px',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: userRosterFilter === 'all' ? 'var(--color-primary)' : 'transparent',
                  color: userRosterFilter === 'all' ? '#ffffff' : 'var(--color-muted)',
                }}
              >
                All Users ({totalUniqueUsers})
              </button>
            </div>
          </div>

          {/* User Footprint List */}
          <div style={{
            maxHeight: '180px',
            overflowY: 'auto',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            backgroundColor: 'var(--color-bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                {userRosterFilter === 'multi'
                  ? 'No users with 2+ products found yet. Users will appear here once they hold workspaces or licenses in both Sheet2Vow and Sheet2Vault.'
                  : 'No user accounts match your search.'}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.email}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(u.email)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-muted)' }}
                      title="Copy Email"
                    >
                      {copiedEmail === u.email ? <Check size={11} style={{ color: '#059669' }} /> : <Copy size={11} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    {u.products.map((p) => {
                      const isVow = p === 'Sheet2Vow';
                      const isVault = p === 'Sheet2Vault';
                      return (
                        <span
                          key={p}
                          style={{
                            fontSize: '0.625rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: isVow ? 'rgba(5, 150, 105, 0.1)' : isVault ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-surface)',
                            color: isVow ? '#059669' : isVault ? '#3B82F6' : 'var(--color-text)',
                            border: `1px solid ${isVow ? 'rgba(5, 150, 105, 0.3)' : isVault ? 'rgba(59, 130, 246, 0.3)' : 'var(--color-border)'}`,
                          }}
                        >
                          {p.replace('Sheet2', '')}
                        </span>
                      );
                    })}
                    {u.isMultiProduct && (
                      <span style={{
                        fontSize: '0.58rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        backgroundColor: '#8B5CF6',
                        color: '#ffffff',
                        padding: '1px 4px',
                        borderRadius: '2px',
                      }}>
                        MULTI
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          MAIN OPERATIONAL SPLIT: Recent Activations + Platform Infrastructure
          ----------------------------------------------------------------------- */}
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
              <button
                type="button"
                onClick={() => onNavigateToTab('releases')}
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
                <span>🚀 Browse Sheet2Vow Release Notes</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
