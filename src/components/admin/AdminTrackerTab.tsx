'use client';

import React, { useState, useMemo } from 'react';
import {
  Key,
  HardDrive,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Users,
  UserCheck,
  ShieldAlert,
  Edit,
  Code,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { WorkspaceRecord } from '@/lib/db/licensingDb';
import { Sheet2SuiteLicense } from '@/lib/sheets/types';

export interface RelationalRecord {
  licenseKey: string;
  orderId: string;
  purchaserEmail: string;
  licenseStatus: string;
  licenseTier: string;
  entitledProducts: string[];
  maxWorkspaces: number;
  singleUse?: boolean;
  usedAt?: string;
  usedBy?: string;
  notes?: string;
  workspace?: WorkspaceRecord;
  hasBoundSheet: boolean;
  spreadsheetId?: string;
  spreadsheetName?: string;
  webViewLink?: string;
  driveFolderPath?: string;
  partnerEmail?: string;
  coPlanners?: string[];
  productName: string;
  isVerified: boolean;
  activatedAt?: string;
  lastActiveAt?: string;
}

interface AdminTrackerTabProps {
  workspaces: WorkspaceRecord[];
  onOpenGenerateModal?: () => void;
  licenses: Sheet2SuiteLicense[];
  onNavigateToValidator: (sheetId: string, productCode?: string) => void;
  onOpenEditRecord: (record: any, type: 'workspace' | 'license') => void;
  onOpenJsonRecord: (record: any) => void;
}

export default function AdminTrackerTab({
  workspaces,
  licenses,
  onNavigateToValidator,
  onOpenEditRecord,
  onOpenJsonRecord,
  onOpenGenerateModal,
}: AdminTrackerTabProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [productFilter, setProductFilter] = useState<'ALL' | 'SHEET2VOW' | 'SHEET2VAULT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'USED' | 'REVOKED' | 'UNBOUND'>('ALL');
  const [collabFilter, setCollabFilter] = useState<'ALL' | 'WITH_COUSERS' | 'SOLO'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, identifier: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(identifier);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Build unified relational dataset by binding licenses to workspaces
  const relationalData = useMemo<RelationalRecord[]>(() => {
    const records: RelationalRecord[] = [];
    const usedWorkspaceIds = new Set<string>();

    // 1. Process known licenses
    licenses.forEach((lic) => {
      // Find matching workspace by orderId or licenseKey or purchaserEmail
      const matchingWs = workspaces.find((ws) => {
        if (ws.orderId && lic.orderId && ws.orderId === lic.orderId) return true;
        if (ws.userEmail && lic.purchaserEmail && ws.userEmail.toLowerCase() === lic.purchaserEmail.toLowerCase()) return true;
        return false;
      });

      if (matchingWs) {
        usedWorkspaceIds.add(matchingWs.workspaceId || (matchingWs as any).id);
      }

      const isVault = (lic.entitledProducts || []).includes('SHEET2VAULT') || (lic.sku || '').toLowerCase().includes('vault');
      const inferredProduct = matchingWs?.productName || (isVault ? 'Sheet2Vault' : 'Sheet2Vow');

      records.push({
        licenseKey: lic.licenseKey,
        orderId: lic.orderId || matchingWs?.orderId || 'UNKNOWN',
        purchaserEmail: lic.purchaserEmail || matchingWs?.userEmail || 'Unassigned',
        licenseStatus: lic.status || 'active',
        licenseTier: lic.licenseTier || 'standard',
        entitledProducts: lic.entitledProducts || ['SHEET2VOW'],
        maxWorkspaces: lic.maxWorkspaces ?? 2,
        singleUse: (lic as any).singleUse,
        usedAt: (lic as any).usedAt,
        usedBy: (lic as any).usedBy,
        notes: (lic as any).notes,
        workspace: matchingWs,
        hasBoundSheet: Boolean(matchingWs?.spreadsheetId),
        spreadsheetId: matchingWs?.spreadsheetId,
        spreadsheetName: matchingWs?.spreadsheetName || (matchingWs ? 'Customer Spreadsheet' : undefined),
        webViewLink: matchingWs?.webViewLink || (matchingWs?.spreadsheetId ? `https://docs.google.com/spreadsheets/d/${matchingWs.spreadsheetId}` : undefined),
        driveFolderPath: matchingWs?.driveFolderPath,
        partnerEmail: matchingWs?.partnerEmail,
        coPlanners: Array.isArray(matchingWs?.coPlanners) ? matchingWs.coPlanners : (matchingWs?.coPlanners ? [matchingWs.coPlanners] : []),
        productName: inferredProduct,
        isVerified: matchingWs?.orderVerified !== false,
        activatedAt: matchingWs?.activatedAt || lic.createdAt,
        lastActiveAt: matchingWs?.lastActiveAt || lic.lastActiveAt,
      });
    });

    // 2. Process orphaned or direct workspaces that had no license object in DB
    workspaces.forEach((ws) => {
      const wsId = ws.workspaceId || (ws as any).id;
      if (!usedWorkspaceIds.has(wsId)) {
        records.push({
          licenseKey: `DIRECT-WS-${wsId ? wsId.substring(0, 8) : 'RECORD'}`,
          orderId: ws.orderId || 'DIRECT-PROVISION',
          purchaserEmail: ws.userEmail || 'Direct Provision',
          licenseStatus: 'active',
          licenseTier: 'direct',
          entitledProducts: [ws.productName === 'Sheet2Vault' ? 'SHEET2VAULT' : 'SHEET2VOW'],
          maxWorkspaces: 1,
          workspace: ws,
          hasBoundSheet: Boolean(ws.spreadsheetId),
          spreadsheetId: ws.spreadsheetId,
          spreadsheetName: ws.spreadsheetName || 'Direct Workspace Sheet',
          webViewLink: ws.webViewLink || (ws.spreadsheetId ? `https://docs.google.com/spreadsheets/d/${ws.spreadsheetId}` : undefined),
          driveFolderPath: ws.driveFolderPath,
          partnerEmail: ws.partnerEmail,
          coPlanners: Array.isArray(ws.coPlanners) ? ws.coPlanners : (ws.coPlanners ? [ws.coPlanners] : []),
          productName: ws.productName || 'Sheet2Vow',
          isVerified: ws.orderVerified !== false,
          activatedAt: ws.activatedAt,
          lastActiveAt: ws.lastActiveAt,
        });
      }
    });

    return records;
  }, [workspaces, licenses]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return relationalData.filter((r) => {
      // 1. Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        const matchesKey = r.licenseKey.toLowerCase().includes(query);
        const matchesOrder = r.orderId.toLowerCase().includes(query);
        const matchesEmail = r.purchaserEmail.toLowerCase().includes(query);
        const matchesSheetName = (r.spreadsheetName || '').toLowerCase().includes(query);
        const matchesSheetId = (r.spreadsheetId || '').toLowerCase().includes(query);
        const matchesPartner = (r.partnerEmail || '').toLowerCase().includes(query);
        if (!matchesKey && !matchesOrder && !matchesEmail && !matchesSheetName && !matchesSheetId && !matchesPartner) {
          return false;
        }
      }

      // 2. Product filter
      if (productFilter === 'SHEET2VOW' && r.productName !== 'Sheet2Vow') return false;
      if (productFilter === 'SHEET2VAULT' && r.productName !== 'Sheet2Vault') return false;

      // 3. Status filter
      if (statusFilter === 'ACTIVE' && r.licenseStatus !== 'active') return false;
      if (statusFilter === 'REVOKED' && r.licenseStatus === 'active') return false;
      if (statusFilter === 'UNBOUND' && r.hasBoundSheet) return false;

      // 4. Collaboration filter
      if (collabFilter === 'WITH_COUSERS') {
        const hasPartner = Boolean(r.partnerEmail?.trim());
        const hasCoPlanners = Array.isArray(r.coPlanners) && r.coPlanners.some((cp) => cp?.trim());
        if (!hasPartner && !hasCoPlanners) return false;
      }
      if (collabFilter === 'SOLO') {
        const hasPartner = Boolean(r.partnerEmail?.trim());
        const hasCoPlanners = Array.isArray(r.coPlanners) && r.coPlanners.some((cp) => cp?.trim());
        if (hasPartner || hasCoPlanners) return false;
      }

      return true;
    });
  }, [relationalData, searchTerm, productFilter, statusFilter, collabFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header and Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
      }}>
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            margin: 0,
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
          }}>
            License Key Details & Sheet Tracker
          </h2>
          <p style={{
            margin: '0.2rem 0 0 0',
            fontSize: '0.8rem',
            color: 'var(--color-muted)',
          }}>
            Relational mapping connecting Etsy orders, purchaser identity, provisioned Google Sheets, and Drive folder structures.
          </p>
        </div>

        {onOpenGenerateModal && (
          <button
            type="button"
            onClick={onOpenGenerateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(99, 102, 241, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={13} />
            <span>GENERATE KEY</span>
          </button>
        )}

        {/* Aggregate Stats Summary Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.4rem 0.85rem',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ color: 'var(--color-muted)' }}>TRACKING:</span>
          <strong style={{ color: 'var(--color-text)' }}>{filteredRecords.length} / {relationalData.length} BINDINGS</strong>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span style={{ color: '#10B981', fontWeight: 700 }}>
            {relationalData.filter((r) => r.hasBoundSheet).length} BOUND SHEETS
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap',
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-md, 8px)',
        padding: '0.75rem 1rem',
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={15} style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-muted)',
          }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by license key, order ID, email, sheet name or ID..."
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.1rem',
              borderRadius: 'var(--border-radius-sm, 6px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-subtle)',
              color: 'var(--color-text)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Product Filter */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: '20px',
            padding: '2px',
            border: '1px solid var(--color-border)',
          }}>
            <button
              type="button"
              onClick={() => setProductFilter('ALL')}
              style={{
                padding: '3px 10px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: productFilter === 'ALL' ? 'var(--color-primary)' : 'transparent',
                color: productFilter === 'ALL' ? '#ffffff' : 'var(--color-muted)',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setProductFilter('SHEET2VOW')}
              style={{
                padding: '3px 10px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: productFilter === 'SHEET2VOW' ? 'var(--color-primary)' : 'transparent',
                color: productFilter === 'SHEET2VOW' ? '#ffffff' : 'var(--color-muted)',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              VOW
            </button>
            <button
              type="button"
              onClick={() => setProductFilter('SHEET2VAULT')}
              style={{
                padding: '3px 10px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: productFilter === 'SHEET2VAULT' ? 'var(--color-primary)' : 'transparent',
                color: productFilter === 'SHEET2VAULT' ? '#ffffff' : 'var(--color-muted)',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              VAULT
            </button>
          </div>

          {/* Status Filter */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: '20px',
            padding: '2px',
            border: '1px solid var(--color-border)',
          }}>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '3px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: statusFilter === 'ALL' ? 'var(--color-surface, #ffffff)' : 'transparent',
                color: statusFilter === 'ALL' ? 'var(--color-text)' : 'var(--color-muted)',
                boxShadow: statusFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              style={{
                padding: '3px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: statusFilter === 'ACTIVE' ? 'var(--color-surface, #ffffff)' : 'transparent',
                color: statusFilter === 'ACTIVE' ? '#10B981' : 'var(--color-muted)',
                boxShadow: statusFilter === 'ACTIVE' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('USED')}
              style={{
                padding: '3px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: statusFilter === 'USED' ? 'var(--color-surface, #ffffff)' : 'transparent',
                color: statusFilter === 'USED' ? '#D97706' : 'var(--color-muted)',
                boxShadow: statusFilter === 'USED' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Used (1-Time)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('UNBOUND')}
              style={{
                padding: '3px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: statusFilter === 'UNBOUND' ? 'var(--color-surface, #ffffff)' : 'transparent',
                color: statusFilter === 'UNBOUND' ? '#B45309' : 'var(--color-muted)',
                boxShadow: statusFilter === 'UNBOUND' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Unbound
            </button>
          </div>
          {/* Collaboration Filter */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: '20px',
            padding: '2px',
            border: '1px solid var(--color-border)',
          }}>
            <button
              type="button"
              onClick={() => setCollabFilter('ALL')}
              style={{
                padding: '3px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: collabFilter === 'ALL' ? 'var(--color-surface, #ffffff)' : 'transparent',
                color: collabFilter === 'ALL' ? 'var(--color-text)' : 'var(--color-muted)',
                boxShadow: collabFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All Collab
            </button>
            <button
              type="button"
              onClick={() => setCollabFilter('WITH_COUSERS')}
              style={{
                padding: '3px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: collabFilter === 'WITH_COUSERS' ? 'var(--color-surface, #ffffff)' : 'transparent',
                color: collabFilter === 'WITH_COUSERS' ? 'var(--color-primary)' : 'var(--color-muted)',
                boxShadow: collabFilter === 'WITH_COUSERS' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Co-Users Synced
            </button>
            <button
              type="button"
              onClick={() => setCollabFilter('SOLO')}
              style={{
                padding: '3px 8px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: collabFilter === 'SOLO' ? 'var(--color-surface, #ffffff)' : 'transparent',
                color: collabFilter === 'SOLO' ? 'var(--color-muted)' : 'var(--color-muted)',
                boxShadow: collabFilter === 'SOLO' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Solo
            </button>
          </div>
        </div>
      </div>

      {/* Relational Table (Desktop) */}
      <div style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-lg, 12px)',
        overflow: 'hidden',
        boxShadow: 'var(--box-shadow-subtle, 0 1px 3px rgba(0,0,0,0.05))',
      }}>
        {filteredRecords.length === 0 ? (
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'var(--color-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <Filter size={32} style={{ opacity: 0.4 }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No matching relational tracker records found.</div>
            <p style={{ fontSize: '0.75rem', margin: 0, maxWidth: '400px' }}>
              Try loosening your search query or reset the product and status filters above.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.78rem',
            }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order & License Key</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Purchaser & Tier</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Bound Google Spreadsheet</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Drive Folder & Collaboration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Product & Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item, idx) => (
                  <tr
                    key={`${item.licenseKey}-${item.spreadsheetId || idx}`}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* Order & License Key */}
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            fontSize: '0.75rem',
                          }}>
                            {item.orderId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.orderId, `order-${idx}`)}
                            title="Copy Order ID"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedId === `order-${idx}` ? '#10B981' : 'var(--color-muted)',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            {copiedId === `order-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            color: 'var(--color-muted)',
                            backgroundColor: 'var(--color-bg-subtle)',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {item.licenseKey}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.licenseKey, `key-${idx}`)}
                            title="Copy License Key"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedId === `key-${idx}` ? '#10B981' : 'var(--color-muted)',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            {copiedId === `key-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Purchaser & Tier */}
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                          {item.purchaserEmail}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontFamily: 'var(--font-mono)',
                            padding: '1px 6px',
                            borderRadius: '20px',
                            backgroundColor: 'var(--color-bg-subtle)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-primary)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}>
                            {item.licenseTier}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                            (Max: {item.maxWorkspaces} ws)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Bound Google Spreadsheet */}
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                      {item.hasBoundSheet && item.spreadsheetId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <FileSpreadsheet size={15} style={{ color: '#0F9D58', flexShrink: 0 }} />
                            <span style={{
                              fontWeight: 700,
                              color: 'var(--color-text)',
                              maxWidth: '190px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {item.spreadsheetName || 'Google Sheet'}
                            </span>
                            {item.webViewLink && (
                              <a
                                href={item.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Open Google Sheet in new tab"
                                style={{
                                  color: 'var(--color-primary)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              color: 'var(--color-muted)',
                              maxWidth: '170px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {item.spreadsheetId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.spreadsheetId || '', `sheet-${idx}`)}
                              title="Copy Spreadsheet ID"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: copiedId === `sheet-${idx}` ? '#10B981' : 'var(--color-muted)',
                                cursor: 'pointer',
                                padding: '2px',
                              }}
                            >
                              {copiedId === `sheet-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#B45309', fontSize: '0.75rem', fontWeight: 600 }}>
                          <AlertTriangle size={14} />
                          <span>No Sheet Bound</span>
                        </div>
                      )}
                    </td>

                    {/* Drive Folder & Collaboration */}
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {item.driveFolderPath ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                            <FolderOpen size={13} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
                            <span style={{
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontFamily: 'var(--font-mono)',
                            }}>
                              {item.driveFolderPath}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                            Drive folder default
                          </span>
                        )}

                        {item.partnerEmail ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#6366F1' }}>
                            <Users size={12} />
                            <span>Partner: {item.partnerEmail}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                            <UserCheck size={12} />
                            <span>Solo workspace</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Product & Status */}
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          backgroundColor: item.productName === 'Sheet2Vault' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                          border: item.productName === 'Sheet2Vault' ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(79, 70, 229, 0.3)',
                          color: item.productName === 'Sheet2Vault' ? '#7C3AED' : '#4F46E5',
                          width: 'fit-content',
                        }}>
                          {item.productName}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: item.licenseStatus === 'active' ? '#10B981' : '#EF4444',
                            display: 'inline-block',
                          }} />
                          <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: item.licenseStatus === 'active' ? '#047857' : '#B91C1C',
                            textTransform: 'uppercase',
                          }}>
                            {item.licenseStatus}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {item.spreadsheetId && (
                          <button
                            type="button"
                            onClick={() => onNavigateToValidator(item.spreadsheetId!, item.productName === 'Sheet2Vault' ? 'SHEET2VAULT' : 'SHEET2VOW')}
                            title="Audit this Google Sheet in Validator"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.55rem',
                              borderRadius: 'var(--border-radius-sm, 6px)',
                              border: '1px solid var(--color-border)',
                              backgroundColor: 'var(--color-surface, #ffffff)',
                              color: 'var(--color-primary)',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            <ShieldCheck size={13} />
                            <span>AUDIT</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenEditRecord(item.workspace || { orderId: item.orderId, licenseKey: item.licenseKey, purchaserEmail: item.purchaserEmail }, item.workspace ? 'workspace' : 'license')}
                          title="Edit database record"
                          style={{
                            padding: '0.35rem',
                            borderRadius: 'var(--border-radius-sm, 6px)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface, #ffffff)',
                            color: 'var(--color-text)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Edit size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenJsonRecord(item)}
                          title="Inspect raw JSON"
                          style={{
                            padding: '0.35rem',
                            borderRadius: 'var(--border-radius-sm, 6px)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface, #ffffff)',
                            color: 'var(--color-muted)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Code size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
