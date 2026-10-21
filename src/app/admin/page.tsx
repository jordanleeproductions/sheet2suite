'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  ShieldCheck, 
  Key, 
  ArrowLeft, 
  ExternalLink, 
  Edit2, 
  Save, 
  X, 
  Code, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Search, 
  Check, 
  Layers, 
  ChevronRight, 
  AlertTriangle, 
  Users, 
  FolderOpen, 
  Sparkles,
  Link as LinkIcon,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { WorkspaceRecord } from '@/lib/db/licensingDb';
import { Sheet2SuiteLicense } from '@/lib/sheets/types';
import SlideOverDrawer from '@/components/vow/SlideOverDrawer';
import { DrawerSection, DrawerField, DrawerRow } from '@/components/vow/MonarchForm';

export default function AdminDatabasePage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [licenses, setLicenses] = useState<Sheet2SuiteLicense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rawJsonRecord, setRawJsonRecord] = useState<any | null>(null);

  // Authentication & Security State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminKeyInput, setAdminKeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showKeyText, setShowKeyText] = useState<boolean>(false);

  const getAdminKey = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('s2s_admin_key') || '';
    }
    return '';
  };

  const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
    const key = getAdminKey();
    const headers: Record<string, string> = { ...extraHeaders };
    if (key) {
      headers['x-admin-key'] = key;
    }
    return headers;
  };

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = adminKeyInput.trim();
    if (!trimmed) {
      setAuthError('Please enter an admin secret key.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: trimmed }),
      });
      const data = await res.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('s2s_admin_key', trimmed);
        }
        setIsAuthenticated(true);
        setAdminKeyInput('');
        fetchRecords(trimmed);
      } else {
        setAuthError(data.error || 'Invalid admin secret key.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify server connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // Ignore network errors during logout
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('s2s_admin_key');
    }
    setIsAuthenticated(false);
    setWorkspaces([]);
    setLicenses([]);
    setSchemaReport(null);
  };

  // Active Sub-Tab: 'workspaces' | 'licenses' | 'schema'
  const [activeTab, setActiveTab] = useState<'workspaces' | 'licenses' | 'schema'>('workspaces');

  // Search Filter
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Edit Database Record State
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editType, setEditType] = useState<'workspace' | 'license' | null>(null);
  const [editMode, setEditMode] = useState<'form' | 'json'>('form');
  const [editForm, setEditForm] = useState<any>({});
  const [editJsonText, setEditJsonText] = useState<string>('');
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [isSavingRecord, setIsSavingRecord] = useState<boolean>(false);

  // Deletion Confirmation Modal State
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; type: 'workspace' | 'license'; name?: string } | null>(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState<boolean>(false);

  // Copied feedback helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleOpenEdit = (record: any, type: 'workspace' | 'license') => {
    setEditType(type);
    setEditingRecord(record);
    setEditMode('form');
    setJsonParseError(null);
    setEditJsonText(JSON.stringify(record, null, 2));

    if (type === 'workspace') {
      setEditForm({
        workspaceId: record.workspaceId || record.id || '',
        spreadsheetName: record.spreadsheetName || '',
        spreadsheetId: record.spreadsheetId || '',
        userEmail: record.userEmail || '',
        partnerEmail: record.partnerEmail || '',
        coPlanners: Array.isArray(record.coPlanners) ? record.coPlanners.join(', ') : (record.coPlanners || ''),
        orderId: record.orderId || '',
        orderVerified: record.orderVerified !== false,
        driveFolderPath: record.driveFolderPath || '',
        webViewLink: record.webViewLink || '',
        productName: record.productName || 'Sheet2Vow',
        activatedAt: record.activatedAt || '',
        lastActiveAt: record.lastActiveAt || '',
      });
    } else {
      setEditForm({
        licenseKey: record.licenseKey || record.id || '',
        orderId: record.orderId || '',
        purchaserEmail: record.purchaserEmail || '',
        sku: record.sku || 'sheet2vow',
        status: record.status || 'active',
        licenseTier: record.licenseTier || 'standard',
        maxWorkspaces: record.maxWorkspaces ?? 2,
        entitledProducts: Array.isArray(record.entitledProducts) ? record.entitledProducts.join(', ') : (record.entitledProducts || 'SHEET2VOW'),
        createdAt: record.createdAt || '',
        updatedAt: record.updatedAt || '',
      });
    }
  };

  const handleCloseEdit = () => {
    setEditingRecord(null);
    setEditType(null);
    setJsonParseError(null);
  };

  const buildPayloadFromForm = () => {
    if (editType === 'workspace') {
      const coPlannersArray = String(editForm.coPlanners || '')
        .split(',')
        .map((s: string) => s.trim().toLowerCase())
        .filter((s: string) => s.length > 0);

      return {
        ...editingRecord,
        workspaceId: editForm.workspaceId,
        spreadsheetName: editForm.spreadsheetName.trim(),
        spreadsheetId: editForm.spreadsheetId.trim(),
        userEmail: editForm.userEmail.trim(),
        partnerEmail: editForm.partnerEmail ? editForm.partnerEmail.trim() : '',
        coPlanners: coPlannersArray,
        orderId: editForm.orderId ? editForm.orderId.trim() : undefined,
        orderVerified: Boolean(editForm.orderVerified),
        driveFolderPath: editForm.driveFolderPath.trim(),
        webViewLink: editForm.webViewLink.trim() || (editForm.spreadsheetId ? `https://docs.google.com/spreadsheets/d/${editForm.spreadsheetId.trim()}/edit` : ''),
        productName: editForm.productName || 'Sheet2Vow',
      };
    } else {
      const productsArray = String(editForm.entitledProducts || '')
        .split(',')
        .map((s: string) => s.trim().toUpperCase())
        .filter((s: string) => s.length > 0);

      return {
        ...editingRecord,
        licenseKey: editForm.licenseKey.trim(),
        orderId: editForm.orderId.trim(),
        purchaserEmail: editForm.purchaserEmail.trim(),
        sku: editForm.sku.trim(),
        status: editForm.status,
        licenseTier: editForm.licenseTier,
        maxWorkspaces: Number(editForm.maxWorkspaces) || 2,
        entitledProducts: productsArray.length > 0 ? productsArray : ['SHEET2VOW'],
      };
    }
  };

  const handleSwitchEditMode = (mode: 'form' | 'json') => {
    if (mode === 'json') {
      const payload = buildPayloadFromForm();
      setEditJsonText(JSON.stringify(payload, null, 2));
      setJsonParseError(null);
    } else {
      try {
        const parsed = JSON.parse(editJsonText);
        setJsonParseError(null);
        if (editType === 'workspace') {
          setEditForm({
            workspaceId: parsed.workspaceId || parsed.id || '',
            spreadsheetName: parsed.spreadsheetName || '',
            spreadsheetId: parsed.spreadsheetId || '',
            userEmail: parsed.userEmail || '',
            partnerEmail: parsed.partnerEmail || '',
            coPlanners: Array.isArray(parsed.coPlanners) ? parsed.coPlanners.join(', ') : (parsed.coPlanners || ''),
            orderId: parsed.orderId || '',
            orderVerified: parsed.orderVerified !== false,
            driveFolderPath: parsed.driveFolderPath || '',
            webViewLink: parsed.webViewLink || '',
            productName: parsed.productName || 'Sheet2Vow',
            activatedAt: parsed.activatedAt || '',
            lastActiveAt: parsed.lastActiveAt || '',
          });
        } else {
          setEditForm({
            licenseKey: parsed.licenseKey || parsed.id || '',
            orderId: parsed.orderId || '',
            purchaserEmail: parsed.purchaserEmail || '',
            sku: parsed.sku || 'sheet2vow',
            status: parsed.status || 'active',
            licenseTier: parsed.licenseTier || 'standard',
            maxWorkspaces: parsed.maxWorkspaces ?? 2,
            entitledProducts: Array.isArray(parsed.entitledProducts) ? parsed.entitledProducts.join(', ') : (parsed.entitledProducts || 'SHEET2VOW'),
            createdAt: parsed.createdAt || '',
            updatedAt: parsed.updatedAt || '',
          });
        }
      } catch (err: any) {
        setJsonParseError(`Cannot switch to Form view: ${err.message}`);
        return;
      }
    }
    setEditMode(mode);
  };

  const handleSaveEdit = async () => {
    setIsSavingRecord(true);
    setErrorMsg(null);
    try {
      let finalRecord: any = null;
      if (editMode === 'json') {
        try {
          finalRecord = JSON.parse(editJsonText);
        } catch (err: any) {
          setJsonParseError(`Invalid JSON syntax: ${err.message}`);
          setIsSavingRecord(false);
          return;
        }
      } else {
        finalRecord = buildPayloadFromForm();
      }

      const res = await fetch('/api/admin/db', {
        method: 'PUT',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          type: editType,
          record: finalRecord,
        }),
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Admin session expired. Please re-enter your admin secret key.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || `Record successfully updated on Firebase!`);
        handleCloseEdit();
        fetchRecords();
      } else {
        setErrorMsg(data.error || `Failed to update record on Firebase.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating record on Firebase.');
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Schema Validator State
  const [schemaReport, setSchemaReport] = useState<any | null>(null);
  const [isAuditingSchema, setIsAuditingSchema] = useState<boolean>(false);
  const [isRepairingSchema, setIsRepairingSchema] = useState<boolean>(false);
  const [auditSpreadsheetId, setAuditSpreadsheetId] = useState<string>('1h_RGirRXv_4zXjqvhJnRlSJ-OnqxPeK9f3M_Eep4RcI');

  const handleRunSchemaAudit = async () => {
    setIsAuditingSchema(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/validate-schema?spreadsheetId=${encodeURIComponent(auditSpreadsheetId)}`, {
        headers: getAdminHeaders(),
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Admin session expired. Please re-enter your admin secret key.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSchemaReport(data.report);
      } else {
        setErrorMsg(data.error || 'Failed to run schema audit.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running schema audit.');
    } finally {
      setIsAuditingSchema(false);
    }
  };

  const handleAutoRepairSchema = async () => {
    setIsRepairingSchema(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/validate-schema', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ spreadsheetId: auditSpreadsheetId }),
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Admin session expired. Please re-enter your admin secret key.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Successfully repaired ${data.repairedTabs?.length || 0} tabs on Google Sheet!`);
        setSchemaReport(data.report);
      } else {
        setErrorMsg(data.error || 'Failed to auto-repair Google Sheet schema.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing auto-repair.');
    } finally {
      setIsRepairingSchema(false);
    }
  };

  const fetchRecords = async (overrideKey?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const key = overrideKey || getAdminKey();
      const headers: Record<string, string> = {};
      if (key) headers['x-admin-key'] = key;

      const res = await fetch('/api/admin/db', { headers });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Admin session expired or invalid credentials.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setWorkspaces(data.workspaces || []);
        setLicenses(data.licenses || []);
      } else {
        setErrorMsg(data.error || 'Failed to load records.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Sheet2Suite Admin Inspector';
    }

    const checkInitialAuth = async () => {
      const storedKey = typeof window !== 'undefined' ? sessionStorage.getItem('s2s_admin_key') : null;
      try {
        const headers: Record<string, string> = {};
        if (storedKey) headers['x-admin-key'] = storedKey;

        const res = await fetch('/api/admin/auth', { headers });
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchRecords(storedKey || undefined);
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkInitialAuth();
  }, []);

  const confirmDeleteWorkspace = async (targetId: string) => {
    try {
      const res = await fetch(`/api/admin/db?workspaceId=${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Admin session expired. Please re-enter your admin secret key.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        if (typeof window !== 'undefined') {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('s2v_') || key.startsWith('s2s_'))) {
              localStorage.removeItem(key);
            }
          }
        }
        setSuccessMsg(`Deleted workspace ${targetId} and cleared local session.`);
        fetchRecords();
      } else {
        setErrorMsg(data.error || 'Delete failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete workspace.');
    } finally {
      setRecordToDelete(null);
    }
  };

  const confirmDeleteLicense = async (licenseKey: string) => {
    try {
      const res = await fetch(`/api/admin/db?licenseKey=${encodeURIComponent(licenseKey)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Admin session expired. Please re-enter your admin secret key.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Deleted license: ${licenseKey}`);
        fetchRecords();
      } else {
        setErrorMsg(data.error || 'Delete failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete license.');
    } finally {
      setRecordToDelete(null);
    }
  };

  const handleResetAllTestSession = async () => {
    try {
      const res = await fetch('/api/admin/db?all=true', {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Admin session expired. Please re-enter your admin secret key.');
        return;
      }
      const data = await res.json();

      if (typeof window !== 'undefined') {
        localStorage.clear();
      }

      if (data.success) {
        setSuccessMsg('Successfully purged all database records and reset browser local storage session!');
      } else {
        setErrorMsg(data.error || 'Failed to purge database records.');
      }
      fetchRecords();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to purge session.');
    } finally {
      setShowPurgeConfirm(false);
    }
  };

  // Filtered Workspaces
  const filteredWorkspaces = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return workspaces;
    return workspaces.filter(ws => 
      (ws.spreadsheetName || '').toLowerCase().includes(q) ||
      (ws.spreadsheetId || '').toLowerCase().includes(q) ||
      (ws.userEmail || '').toLowerCase().includes(q) ||
      (ws.partnerEmail || '').toLowerCase().includes(q) ||
      (ws.orderId || '').toLowerCase().includes(q) ||
      (ws.driveFolderPath || '').toLowerCase().includes(q)
    );
  }, [workspaces, searchTerm]);

  // Filtered Licenses
  const filteredLicenses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return licenses;
    return licenses.filter(lic =>
      (lic.licenseKey || '').toLowerCase().includes(q) ||
      (lic.orderId || '').toLowerCase().includes(q) ||
      (lic.purchaserEmail || '').toLowerCase().includes(q) ||
      (lic.sku || '').toLowerCase().includes(q) ||
      (lic.status || '').toLowerCase().includes(q)
    );
  }, [licenses, searchTerm]);

  // KPIs
  const verifiedWorkspacesCount = workspaces.filter(w => w.orderVerified !== false).length;
  const activeLicensesCount = licenses.filter(l => l.status === 'active').length;

  if (isAuthenticated === null) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#090D16',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(30, 41, 59, 0.5) 0%, rgba(9, 13, 22, 1) 75%)',
        color: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-interface-sans, system-ui, -apple-system, sans-serif)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <RefreshCw size={28} style={{ color: '#818CF8', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontFamily: 'var(--font-technical-mono, monospace)' }}>
            Verifying administrative access...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#090D16',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, rgba(9, 13, 22, 1) 75%)',
        color: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-interface-sans, system-ui, -apple-system, sans-serif)',
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#111827',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}>
          {/* Lock Icon Emblem */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#818CF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)',
          }}>
            <Lock size={26} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#A5B4FC', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            RESTRICTED ADMIN ZONE
          </div>

          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
            color: '#FFFFFF',
            fontFamily: 'var(--font-editorial-serif, Georgia, serif)',
            letterSpacing: '-0.02em',
          }}>
            Sheet2Suite Admin Inspector
          </h1>

          <p style={{
            fontSize: '0.8125rem',
            color: '#94A3B8',
            lineHeight: 1.5,
            margin: '0 0 1.5rem 0',
          }}>
            Internal database inspection and mutation controls require master administrative key authentication.
          </p>

          {authError && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#FCA5A5',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'left',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative', textAlign: 'left' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Key size={16} />
              </div>

              <input
                type={showKeyText ? 'text' : 'password'}
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Enter Admin Secret Key..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 38px',
                  borderRadius: '10px',
                  border: '1px solid #1E293B',
                  backgroundColor: '#090D16',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  transition: 'border-color 0.15s ease',
                }}
              />

              <button
                type="button"
                onClick={() => setShowKeyText(!showKeyText)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showKeyText ? 'Hide key' : 'Show key'}
              >
                {showKeyText ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#6366F1',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isAuthenticating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                transition: 'opacity 0.15s ease',
                opacity: isAuthenticating ? 0.7 : 1,
              }}
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Verifying Key...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Unlock Admin Console</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <Link
              href="/vow"
              style={{
                color: '#94A3B8',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'color 0.15s ease',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to App</span>
            </Link>

            <span style={{ color: '#475569', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.6875rem' }}>
              SEC-1 ZERO-TRUST
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090D16',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(30, 41, 59, 0.5) 0%, rgba(9, 13, 22, 1) 75%)',
      color: '#F8FAFC',
      fontFamily: 'var(--font-interface-sans, system-ui, -apple-system, sans-serif)',
      padding: '1.25rem 1rem 4rem 1rem',
      boxSizing: 'border-box',
    }}>
      <style>{`
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .admin-table-desktop {
          display: table;
          width: 100%;
        }
        .admin-cards-mobile {
          display: none;
        }
        @media (max-width: 900px) {
          .admin-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .admin-table-desktop {
            display: none !important;
          }
          .admin-cards-mobile {
            display: flex !important;
            flex-direction: column;
            gap: 0.75rem;
          }
          .admin-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .admin-header-actions {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
          }
          .admin-header-actions .full-width-btn {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 540px) {
          .admin-kpi-grid {
            grid-template-columns: 1fr;
          }
        }
        .spin {
          animation: adminSpin 1s linear infinite;
        }
        @keyframes adminSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Monarch Top Masthead / Header Bar */}
        <div className="admin-header-row" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818CF8',
              flexShrink: 0,
            }}>
              <Database size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                <span style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: '#A5B4FC',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                }}>
                  MONARCH ADMIN
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.6875rem',
                  color: '#10B981',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontWeight: 600,
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                  FIRESTORE LIVE
                </span>
              </div>
              <h1 style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                margin: 0,
                fontFamily: 'var(--font-editorial-serif, Georgia, serif)',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                Database & Entitlements Inspector
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleAdminLogout}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.55rem 0.85rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                minHeight: '40px',
                transition: 'all 0.15s ease',
              }}
              title="Lock admin console and terminate session"
            >
              <Lock size={14} />
              <span>LOCK</span>
            </button>

            <button
              onClick={() => setShowPurgeConfirm(true)}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                padding: '0.55rem 0.85rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                minHeight: '40px',
                transition: 'all 0.15s ease',
              }}
              title="Purge test records and reset local session"
            >
              <Trash2 size={14} />
              <span>PURGE SESSION</span>
            </button>

            <button
              onClick={() => fetchRecords()}
              disabled={isLoading}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.55rem 0.85rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                minHeight: '40px',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>{isLoading ? 'SYNCING...' : 'REFRESH'}</span>
            </button>

            <Link
              href="/vow"
              className="full-width-btn"
              style={{
                backgroundColor: '#6366F1',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 1rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
                minHeight: '40px',
              }}
            >
              <ArrowLeft size={15} />
              <span>Return to App</span>
            </Link>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div style={{
            padding: '0.85rem 1.15rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34D399',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              style={{ background: 'none', border: 'none', color: '#34D399', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: '0.85rem 1.15rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#FCA5A5',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Monarch Hero Metric Strip */}
        <div className="admin-kpi-grid">
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}>
            <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Workspaces
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-technical-mono, monospace)', color: '#FFFFFF' }}>
                {workspaces.length}
              </span>
              <span style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: 600 }}>
                {verifiedWorkspacesCount} verified
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
              Registered wedding drives
            </span>
          </div>

          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}>
            <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Registered Licenses
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-technical-mono, monospace)', color: '#F59E0B' }}>
                {licenses.length}
              </span>
              <span style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: 600 }}>
                {activeLicensesCount} active
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
              Etsy & LemonSqueezy codes
            </span>
          </div>

          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}>
            <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Master Template Schema
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: schemaReport ? (schemaReport.isFullyCompliant ? '#10B981' : '#F59E0B') : '#94A3B8',
              }}>
                {schemaReport ? (schemaReport.isFullyCompliant ? '100% COMPLIANT' : 'DISCREPANCIES') : 'NOT AUDITED'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('schema')}
              style={{
                background: 'none',
                border: 'none',
                color: '#818CF8',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0,
                marginTop: 'auto',
              }}
            >
              Open Schema Engine →
            </button>
          </div>

          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}>
            <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Database Mode
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-technical-mono, monospace)' }}>
                Cloud Firestore
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
              Auto-persists across container restarts
            </span>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}>
          {/* Segmented Pill Switcher */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            borderRadius: '10px',
            padding: '3px',
            gap: '3px',
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('workspaces')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'workspaces' ? '#6366F1' : 'transparent',
                color: activeTab === 'workspaces' ? '#FFFFFF' : '#94A3B8',
                fontSize: '0.8125rem',
                fontWeight: activeTab === 'workspaces' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <HardDrive size={15} />
              <span>Workspaces</span>
              <span style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.6875rem',
                backgroundColor: activeTab === 'workspaces' ? 'rgba(255, 255, 255, 0.25)' : '#1E293B',
                color: activeTab === 'workspaces' ? '#FFFFFF' : '#94A3B8',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 700,
              }}>
                {workspaces.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('licenses')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'licenses' ? '#6366F1' : 'transparent',
                color: activeTab === 'licenses' ? '#FFFFFF' : '#94A3B8',
                fontSize: '0.8125rem',
                fontWeight: activeTab === 'licenses' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Key size={15} />
              <span>Licenses</span>
              <span style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.6875rem',
                backgroundColor: activeTab === 'licenses' ? 'rgba(255, 255, 255, 0.25)' : '#1E293B',
                color: activeTab === 'licenses' ? '#FFFFFF' : '#94A3B8',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 700,
              }}>
                {licenses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schema')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'schema' ? '#6366F1' : 'transparent',
                color: activeTab === 'schema' ? '#FFFFFF' : '#94A3B8',
                fontSize: '0.8125rem',
                fontWeight: activeTab === 'schema' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={15} />
              <span>Schema Engine</span>
            </button>
          </div>

          {/* Quick Search Bar */}
          {activeTab !== 'schema' && (
            <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '380px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'workspaces' ? 'Search by name, email, or ID...' : 'Search by license key, email, SKU...'}
                style={{
                  width: '100%',
                  padding: '9px 32px 9px 32px',
                  borderRadius: '8px',
                  border: '1px solid #1E293B',
                  backgroundColor: '#111827',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------
            TAB 1: WORKSPACES VIEW
            ------------------------------------------------------------- */}
        {activeTab === 'workspaces' && (
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {/* Desktop Table View */}
            <div className="admin-table-desktop">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#090D16',
                    color: '#94A3B8',
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.67rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid #1E293B',
                  }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Spreadsheet Workspace</th>
                    <th style={{ padding: '0.85rem 1rem' }}>User & Partner</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Order ID</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Spreadsheet ID</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Activated</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkspaces.map((ws) => (
                    <tr key={ws.workspaceId || ws.spreadsheetId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.875rem' }}>
                          {ws.spreadsheetName || 'Untitled Wedding'}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <FolderOpen size={12} />
                          <span>{ws.driveFolderPath || 'My Drive / Sheet2Vow'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ color: '#E2E8F0', fontWeight: 500 }}>{ws.userEmail}</div>
                        {ws.partnerEmail && (
                          <div style={{ fontSize: '0.725rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Users size={11} />
                            <span>Partner: {ws.partnerEmail}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontWeight: 700, color: '#F59E0B', fontSize: '0.775rem' }}>
                          {ws.orderId || 'ETSY-DEMO'}
                        </div>
                        <span style={{
                          display: 'inline-block',
                          marginTop: '2px',
                          backgroundColor: ws.orderVerified !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: ws.orderVerified !== false ? '#34D399' : '#FCA5A5',
                          border: `1px solid ${ws.orderVerified !== false ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-technical-mono, monospace)',
                          fontWeight: 700,
                        }}>
                          {ws.orderVerified !== false ? 'VERIFIED' : 'UNVERIFIED'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', color: '#94A3B8', fontSize: '0.75rem' }}>
                            {(ws.spreadsheetId || '').slice(0, 14)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(ws.spreadsheetId || '', ws.workspaceId || ws.spreadsheetId)}
                            style={{ background: 'none', border: 'none', color: copiedKey === (ws.workspaceId || ws.spreadsheetId) ? '#10B981' : '#64748B', cursor: 'pointer', padding: '2px' }}
                            title="Copy Spreadsheet ID"
                          >
                            {copiedKey === (ws.workspaceId || ws.spreadsheetId) ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.75rem', fontFamily: 'var(--font-technical-mono, monospace)' }}>
                        {ws.activatedAt ? new Date(ws.activatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          {ws.webViewLink && (
                            <a
                              href={ws.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: '#34D399',
                                textDecoration: 'none',
                                padding: '5px 8px',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.725rem',
                                fontWeight: 600,
                              }}
                              title="Open in Google Sheets"
                            >
                              <ExternalLink size={12} />
                              <span>Sheet</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setRawJsonRecord(ws)}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: '#94A3B8',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                            }}
                            title="View Raw JSON"
                          >
                            JSON
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ws, 'workspace')}
                            style={{
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              color: '#A5B4FC',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Edit workspace record"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete({ id: ws.workspaceId || ws.spreadsheetId, type: 'workspace', name: ws.spreadsheetName || ws.userEmail })}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#F87171',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                            }}
                            title="Delete workspace record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="admin-cards-mobile" style={{ padding: '0.75rem' }}>
              {filteredWorkspaces.map((ws) => (
                <div
                  key={ws.workspaceId || ws.spreadsheetId}
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
                        {ws.spreadsheetName || 'Untitled Wedding'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                        {ws.userEmail}
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: ws.orderVerified !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: ws.orderVerified !== false ? '#34D399' : '#FCA5A5',
                      border: `1px solid ${ws.orderVerified !== false ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontWeight: 700,
                    }}>
                      {ws.orderVerified !== false ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </div>

                  {ws.partnerEmail && (
                    <div style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} />
                      <span>Partner: {ws.partnerEmail}</span>
                    </div>
                  )}

                  <div style={{
                    backgroundColor: '#0F172A',
                    borderRadius: '6px',
                    padding: '0.5rem 0.65rem',
                    fontSize: '0.725rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    color: '#94A3B8',
                  }}>
                    <span>ID: {(ws.spreadsheetId || '').slice(0, 16)}...</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(ws.spreadsheetId || '', ws.workspaceId || ws.spreadsheetId)}
                      style={{ background: 'none', border: 'none', color: copiedKey === (ws.workspaceId || ws.spreadsheetId) ? '#10B981' : '#64748B', cursor: 'pointer', padding: '2px' }}
                    >
                      {copiedKey === (ws.workspaceId || ws.spreadsheetId) ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* Mobile Actions Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: ws.webViewLink ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '0.45rem', marginTop: '0.25rem' }}>
                    {ws.webViewLink && (
                      <a
                        href={ws.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          color: '#34D399',
                          borderRadius: '6px',
                          padding: '7px 4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                        }}
                      >
                        <ExternalLink size={12} />
                        <span>Sheet</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(ws, 'workspace')}
                      style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: '#A5B4FC',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                      }}
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRawJsonRecord(ws)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#94A3B8',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecordToDelete({ id: ws.workspaceId || ws.spreadsheetId, type: 'workspace', name: ws.spreadsheetName || ws.userEmail })}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#F87171',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredWorkspaces.length === 0 && (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                No registered workspaces found. Log in via Google or run provisioning to populate records.
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: LICENSES VIEW
            ------------------------------------------------------------- */}
        {activeTab === 'licenses' && (
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {/* Desktop Table View */}
            <div className="admin-table-desktop">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#090D16',
                    color: '#94A3B8',
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.67rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid #1E293B',
                  }}>
                    <th style={{ padding: '0.85rem 1rem' }}>License Key</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Order ID</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Purchaser Email</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Tier & SKU</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map((lic) => (
                    <tr key={lic.licenseKey} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontWeight: 700, color: '#F59E0B', fontSize: '0.8125rem' }}>
                            {lic.licenseKey}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(lic.licenseKey, lic.licenseKey)}
                            style={{ background: 'none', border: 'none', color: copiedKey === lic.licenseKey ? '#10B981' : '#64748B', cursor: 'pointer', padding: '2px' }}
                            title="Copy License Key"
                          >
                            {copiedKey === lic.licenseKey ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#E2E8F0', fontFamily: 'var(--font-technical-mono, monospace)' }}>
                        {lic.orderId || 'N/A'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#FFFFFF', fontWeight: 500 }}>
                        {lic.purchaserEmail}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-technical-mono, monospace)',
                          fontSize: '0.6875rem',
                          color: '#818CF8',
                          fontWeight: 700,
                          backgroundColor: 'rgba(99, 102, 241, 0.12)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                        }}>
                          {(lic.sku || 'SHEET2VOW').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          backgroundColor: lic.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: lic.status === 'active' ? '#34D399' : '#FCA5A5',
                          border: `1px solid ${lic.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-technical-mono, monospace)',
                          fontWeight: 700,
                        }}>
                          {lic.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => setRawJsonRecord(lic)}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              color: '#94A3B8',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                            }}
                          >
                            JSON
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(lic, 'license')}
                            style={{
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              color: '#A5B4FC',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete({ id: lic.licenseKey, type: 'license', name: lic.licenseKey })}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#F87171',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="admin-cards-mobile" style={{ padding: '0.75rem' }}>
              {filteredLicenses.map((lic) => (
                <div
                  key={lic.licenseKey}
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontWeight: 700, color: '#F59E0B', fontSize: '0.875rem' }}>
                        {lic.licenseKey}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                        {lic.purchaserEmail}
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: lic.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: lic.status === 'active' ? '#34D399' : '#FCA5A5',
                      border: `1px solid ${lic.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontWeight: 700,
                    }}>
                      {lic.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: '#94A3B8' }}>
                    <span>Order: <strong style={{ color: '#E2E8F0' }}>{lic.orderId || 'N/A'}</strong></span>
                    <span>SKU: <strong style={{ color: '#818CF8' }}>{lic.sku || 'sheet2vow'}</strong></span>
                  </div>

                  {/* Mobile Actions Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(lic, 'license')}
                      style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: '#A5B4FC',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                      }}
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRawJsonRecord(lic)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#94A3B8',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecordToDelete({ id: lic.licenseKey, type: 'license', name: lic.licenseKey })}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#F87171',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredLicenses.length === 0 && (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                No registered licenses found.
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: SCHEMA AUDITOR & AUTO-REPAIR ENGINE
            ------------------------------------------------------------- */}
        {activeTab === 'schema' && (
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-editorial-serif, Georgia, serif)' }}>
                  Master Spreadsheet Schema Validator & Auto-Repair Engine
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
                  Audits Google Sheets columns against strict TypeScript codebase contracts and auto-heals missing headers.
                </p>
              </div>

              {workspaces.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'var(--font-technical-mono, monospace)' }}>
                    QUICK SELECT:
                  </span>
                  {workspaces.slice(0, 3).map(w => (
                    <button
                      key={w.spreadsheetId}
                      type="button"
                      onClick={() => setAuditSpreadsheetId(w.spreadsheetId)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: auditSpreadsheetId === w.spreadsheetId ? '1px solid #6366F1' : '1px solid #1E293B',
                        backgroundColor: auditSpreadsheetId === w.spreadsheetId ? 'rgba(99, 102, 241, 0.2)' : '#0F172A',
                        color: auditSpreadsheetId === w.spreadsheetId ? '#A5B4FC' : '#94A3B8',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-technical-mono, monospace)',
                        cursor: 'pointer',
                      }}
                    >
                      {w.spreadsheetName || (w.spreadsheetId || '').slice(0, 8)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Input Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              backgroundColor: '#0F172A',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #1E293B',
              flexWrap: 'wrap',
            }}>
              <input
                type="text"
                value={auditSpreadsheetId}
                onChange={(e) => setAuditSpreadsheetId(e.target.value)}
                placeholder="Google Spreadsheet ID to Audit"
                style={{
                  flex: 1,
                  minWidth: '240px',
                  backgroundColor: '#111827',
                  border: '1px solid #1E293B',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleRunSchemaAudit}
                disabled={isAuditingSchema}
                style={{
                  padding: '9px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#6366F1',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: isAuditingSchema ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  minHeight: '40px',
                }}
              >
                <RefreshCw size={14} className={isAuditingSchema ? 'spin' : ''} />
                <span>{isAuditingSchema ? 'Auditing Sheet...' : 'Run Schema Audit'}</span>
              </button>
            </div>

            {/* Schema Audit Results */}
            {schemaReport && (
              <div style={{
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      backgroundColor: schemaReport.isFullyCompliant ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: schemaReport.isFullyCompliant ? '#34D399' : '#FBBF24',
                      border: `1px solid ${schemaReport.isFullyCompliant ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontWeight: 700,
                    }}>
                      {schemaReport.isFullyCompliant ? '✅ 100% SCHEMA COMPLIANT' : '⚠️ DISCREPANCIES DETECTED'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      Audited {schemaReport.tabReports?.length || 0} sheets
                    </span>
                  </div>

                  {!schemaReport.isFullyCompliant && (
                    <button
                      type="button"
                      onClick={handleAutoRepairSchema}
                      disabled={isRepairingSchema}
                      style={{
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: isRepairingSchema ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{isRepairingSchema ? 'Repairing Tabs...' : '🛠️ Auto-Repair Google Sheet'}</span>
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '0.625rem',
                }}>
                  {schemaReport.tabReports?.map((tr: any) => {
                    const isOk = tr.missingHeaders.length === 0;
                    return (
                      <div
                        key={tr.tabName}
                        style={{
                          backgroundColor: '#111827',
                          border: `1px solid ${isOk ? '#1E293B' : 'rgba(239, 68, 68, 0.3)'}`,
                          borderRadius: '6px',
                          padding: '0.75rem 0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.8125rem', fontFamily: 'var(--font-technical-mono, monospace)' }}>
                            📄 {tr.tabName}
                          </span>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-technical-mono, monospace)',
                            color: isOk ? '#34D399' : '#F87171',
                          }}>
                            {isOk ? 'MATCH' : `-${tr.missingHeaders.length} MISSING`}
                          </span>
                        </div>

                        {tr.missingHeaders.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#FCA5A5', fontFamily: 'var(--font-technical-mono, monospace)', lineHeight: 1.3 }}>
                            Missing: {tr.missingHeaders.join(', ')}
                          </div>
                        )}
                        {tr.extraHeaders.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#FBBF24', fontFamily: 'var(--font-technical-mono, monospace)', lineHeight: 1.3 }}>
                            Extra: {tr.extraHeaders.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* -------------------------------------------------------------
          MONARCH SLIDE-OVER DRAWER (ADD / EDIT RECORD)
          ------------------------------------------------------------- */}
      <SlideOverDrawer
        isOpen={Boolean(editingRecord && editType)}
        onClose={handleCloseEdit}
        title={editType === 'workspace' ? 'Edit Workspace Record' : 'Edit Entitlement License'}
        subtitle={
          editType === 'workspace'
            ? `Firebase Document • ${editForm.spreadsheetName || editForm.workspaceId}`
            : `License Document • ${editForm.licenseKey}`
        }
        badge={editType === 'workspace' ? 'WORKSPACE' : 'LICENSE'}
        width="600px"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCloseEdit}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #E2E8F0)',
                backgroundColor: 'var(--color-surface, #FFFFFF)',
                color: 'var(--color-text, #0F172A)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isSavingRecord || Boolean(jsonParseError)}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isSavingRecord || Boolean(jsonParseError) ? '#94A3B8' : '#6366F1',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSavingRecord || Boolean(jsonParseError) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                minHeight: '44px',
              }}
            >
              {isSavingRecord ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Saving to Firebase...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save to Firebase</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--color-background-subtle, #F8FAFC)',
            borderRadius: '8px',
            padding: '3px',
            gap: '3px',
            border: '1px solid var(--color-border, #E2E8F0)',
          }}>
            <button
              type="button"
              onClick={() => handleSwitchEditMode('form')}
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: editMode === 'form' ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                color: editMode === 'form' ? 'var(--color-primary, #6366F1)' : 'var(--color-muted, #64748B)',
                fontSize: '0.8125rem',
                fontWeight: editMode === 'form' ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: editMode === 'form' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <FileText size={14} />
              <span>Structured Form</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchEditMode('json')}
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: editMode === 'json' ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                color: editMode === 'json' ? 'var(--color-primary, #6366F1)' : 'var(--color-muted, #64748B)',
                fontSize: '0.8125rem',
                fontWeight: editMode === 'json' ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: editMode === 'json' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Code size={14} />
              <span>Raw JSON Editor</span>
            </button>
          </div>

          {jsonParseError && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{jsonParseError}</span>
            </div>
          )}

          {editMode === 'form' ? (
            editType === 'workspace' ? (
              /* Workspace Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <DrawerSection title="Spreadsheet Identity" description="Cloud document name and Google Sheets binding">
                  <DrawerField label="Spreadsheet Name" required>
                    <input
                      type="text"
                      value={editForm.spreadsheetName || ''}
                      onChange={(e) => setEditForm({ ...editForm, spreadsheetName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        backgroundColor: 'var(--color-surface, #FFFFFF)',
                        color: 'var(--color-text, #0F172A)',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </DrawerField>

                  <DrawerField label="Google Spreadsheet ID" required hint="Bound Google Drive document">
                    <input
                      type="text"
                      value={editForm.spreadsheetId || ''}
                      onChange={(e) => setEditForm({ ...editForm, spreadsheetId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        backgroundColor: 'var(--color-surface, #FFFFFF)',
                        color: 'var(--color-text, #0F172A)',
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-technical-mono, monospace)',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </DrawerField>

                  <DrawerRow columns={2}>
                    <DrawerField label="Product Name">
                      <select
                        value={editForm.productName || 'Sheet2Vow'}
                        onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="Sheet2Vow">Sheet2Vow</option>
                        <option value="Sheet2Home">Sheet2Home</option>
                        <option value="Sheet2Finance">Sheet2Finance</option>
                      </select>
                    </DrawerField>

                    <DrawerField label="Order Verification">
                      <select
                        value={String(editForm.orderVerified)}
                        onChange={(e) => setEditForm({ ...editForm, orderVerified: e.target.value === 'true' })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="true">Verified (Full Access)</option>
                        <option value="false">Unverified</option>
                      </select>
                    </DrawerField>
                  </DrawerRow>
                </DrawerSection>

                <DrawerSection title="User & Collaborator Access" description="Primary owner and co-planner credentials">
                  <DrawerRow columns={2}>
                    <DrawerField label="Owner User Email" required>
                      <input
                        type="email"
                        value={editForm.userEmail || ''}
                        onChange={(e) => setEditForm({ ...editForm, userEmail: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </DrawerField>

                    <DrawerField label="Partner Email" hint="Co-planner">
                      <input
                        type="email"
                        value={editForm.partnerEmail || ''}
                        onChange={(e) => setEditForm({ ...editForm, partnerEmail: e.target.value })}
                        placeholder="partner@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </DrawerField>
                  </DrawerRow>

                  <DrawerField label="Additional Co-Planners" hint="Comma-separated emails">
                    <input
                      type="text"
                      value={editForm.coPlanners || ''}
                      onChange={(e) => setEditForm({ ...editForm, coPlanners: e.target.value })}
                      placeholder="planner1@domain.com, coordinator@domain.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        backgroundColor: 'var(--color-surface, #FFFFFF)',
                        color: 'var(--color-text, #0F172A)',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </DrawerField>

                  <DrawerField label="Etsy Order ID / Code">
                    <input
                      type="text"
                      value={editForm.orderId || ''}
                      onChange={(e) => setEditForm({ ...editForm, orderId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        backgroundColor: 'var(--color-surface, #FFFFFF)',
                        color: 'var(--color-text, #0F172A)',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-technical-mono, monospace)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </DrawerField>
                </DrawerSection>

                <DrawerSection title="Google Drive Location" description="Folder paths and external links">
                  <DrawerField label="Drive Folder Path">
                    <input
                      type="text"
                      value={editForm.driveFolderPath || ''}
                      onChange={(e) => setEditForm({ ...editForm, driveFolderPath: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        backgroundColor: 'var(--color-surface, #FFFFFF)',
                        color: 'var(--color-text, #0F172A)',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </DrawerField>

                  <DrawerField label="Web View Link">
                    <input
                      type="text"
                      value={editForm.webViewLink || ''}
                      onChange={(e) => setEditForm({ ...editForm, webViewLink: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        backgroundColor: 'var(--color-surface, #FFFFFF)',
                        color: 'var(--color-text, #0F172A)',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </DrawerField>
                </DrawerSection>
              </div>
            ) : (
              /* License Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <DrawerSection title="Entitlement Details" description="License key identifier and platform status">
                  <DrawerField label="License Key (Document ID)" required>
                    <input
                      type="text"
                      value={editForm.licenseKey || ''}
                      onChange={(e) => setEditForm({ ...editForm, licenseKey: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        backgroundColor: 'var(--color-surface, #FFFFFF)',
                        color: 'var(--color-text, #0F172A)',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-technical-mono, monospace)',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </DrawerField>

                  <DrawerRow columns={2}>
                    <DrawerField label="License Status">
                      <select
                        value={editForm.status || 'active'}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="active">ACTIVE</option>
                        <option value="revoked">REVOKED</option>
                        <option value="expired">EXPIRED</option>
                      </select>
                    </DrawerField>

                    <DrawerField label="License Tier">
                      <select
                        value={editForm.licenseTier || 'standard'}
                        onChange={(e) => setEditForm({ ...editForm, licenseTier: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="standard">Standard Tier</option>
                        <option value="pro">Pro Suite Bundle</option>
                        <option value="unlimited">Unlimited Tier</option>
                      </select>
                    </DrawerField>
                  </DrawerRow>
                </DrawerSection>

                <DrawerSection title="Purchaser & Entitlements" description="Order details and product rights">
                  <DrawerRow columns={2}>
                    <DrawerField label="Purchaser Email" required>
                      <input
                        type="email"
                        value={editForm.purchaserEmail || ''}
                        onChange={(e) => setEditForm({ ...editForm, purchaserEmail: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </DrawerField>

                    <DrawerField label="Etsy Order ID">
                      <input
                        type="text"
                        value={editForm.orderId || ''}
                        onChange={(e) => setEditForm({ ...editForm, orderId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </DrawerField>
                  </DrawerRow>

                  <DrawerRow columns={2}>
                    <DrawerField label="SKU Identifier">
                      <input
                        type="text"
                        value={editForm.sku || ''}
                        onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </DrawerField>

                    <DrawerField label="Max Workspaces">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={editForm.maxWorkspaces ?? 2}
                        onChange={(e) => setEditForm({ ...editForm, maxWorkspaces: Number(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          backgroundColor: 'var(--color-surface, #FFFFFF)',
                          color: 'var(--color-text, #0F172A)',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </DrawerField>
                  </DrawerRow>

                  <DrawerField label="Entitled Products" hint="Comma-separated product keys">
                    <input
                      type="text"
                      value={editForm.entitledProducts || ''}
                      onChange={(e) => setEditForm({ ...editForm, entitledProducts: e.target.value })}
                      placeholder="SHEET2VOW, SHEET2FINANCE, SHEET2HOME"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        backgroundColor: 'var(--color-surface, #FFFFFF)',
                        color: 'var(--color-text, #0F172A)',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </DrawerField>
                </DrawerSection>
              </div>
            )
          ) : (
            /* Raw JSON Editor */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748B)' }}>
                Directly edit this document in JSON format. Validates syntax in real time before persisting to Cloud Firestore.
              </div>
              <textarea
                value={editJsonText}
                onChange={(e) => {
                  setEditJsonText(e.target.value);
                  try {
                    JSON.parse(e.target.value);
                    setJsonParseError(null);
                  } catch (err: any) {
                    setJsonParseError(`Invalid JSON: ${err.message}`);
                  }
                }}
                rows={16}
                spellCheck={false}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: jsonParseError ? '1.5px solid #EF4444' : '1px solid #1E293B',
                  backgroundColor: '#0F172A',
                  color: '#A7F3D0',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
          )}
        </div>
      </SlideOverDrawer>

      {/* -------------------------------------------------------------
          RAW JSON VIEWER MODAL
          ------------------------------------------------------------- */}
      {rawJsonRecord && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setRawJsonRecord(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '85vh',
              backgroundColor: '#111827',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '1.25rem',
              color: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code size={20} style={{ color: '#818CF8' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-editorial-serif, Georgia, serif)' }}>
                  Raw Document Record (JSON)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRawJsonRecord(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <pre style={{
              backgroundColor: '#090D16',
              border: '1px solid #1E293B',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-technical-mono, monospace)',
              color: '#34D399',
              overflow: 'auto',
              maxHeight: '52vh',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {JSON.stringify(rawJsonRecord, null, 2)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(rawJsonRecord, null, 2));
                  setSuccessMsg('Copied JSON record to clipboard!');
                  setRawJsonRecord(null);
                }}
                style={{
                  backgroundColor: '#6366F1',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Copy size={14} />
                <span>Copy JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          DELETION CONFIRMATION MODAL
          ------------------------------------------------------------- */}
      {recordToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setRecordToDelete(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#111827',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '1.25rem',
              color: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                flexShrink: 0,
              }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                  Delete {recordToDelete.type === 'workspace' ? 'Workspace' : 'License'}?
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  This removes the record from Cloud Firestore.
                </span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.4 }}>
              Are you sure you want to permanently delete <strong style={{ color: '#F87171' }}>"{recordToDelete.name || recordToDelete.id}"</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #1E293B',
                  backgroundColor: '#0F172A',
                  color: '#94A3B8',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (recordToDelete.type === 'workspace') {
                    confirmDeleteWorkspace(recordToDelete.id);
                  } else {
                    confirmDeleteLicense(recordToDelete.id);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          PURGE SESSION CONFIRMATION MODAL
          ------------------------------------------------------------- */}
      {showPurgeConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setShowPurgeConfirm(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#111827',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '1.25rem',
              color: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444',
                flexShrink: 0,
              }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                  Purge All Records & Reset Session?
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Destructive admin action
                </span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.4 }}>
              This will delete all test workspaces and licenses from the local database cache and clear all browser local storage sessions.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowPurgeConfirm(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #1E293B',
                  backgroundColor: '#0F172A',
                  color: '#94A3B8',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllTestSession}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Purge All & Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
