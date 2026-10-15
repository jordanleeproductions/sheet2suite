'use client';

import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw, HardDrive, ShieldCheck, Key, ArrowLeft, ExternalLink, Edit2, Save, X, Code, FileText, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { WorkspaceRecord } from '@/lib/db/licensingDb';
import { Sheet2SuiteLicense } from '@/lib/sheets/types';

export default function AdminDatabasePage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [licenses, setLicenses] = useState<Sheet2SuiteLicense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rawJsonRecord, setRawJsonRecord] = useState<any | null>(null);

  // Edit Database Record Modal State
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editType, setEditType] = useState<'workspace' | 'license' | null>(null);
  const [editMode, setEditMode] = useState<'form' | 'json'>('form');
  const [editForm, setEditForm] = useState<any>({});
  const [editJsonText, setEditJsonText] = useState<string>('');
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [isSavingRecord, setIsSavingRecord] = useState<boolean>(false);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editType,
          record: finalRecord,
        }),
      });
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
      const res = await fetch(`/api/admin/validate-schema?spreadsheetId=${encodeURIComponent(auditSpreadsheetId)}`);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId: auditSpreadsheetId }),
      });
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

  const fetchRecords = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/db');
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
      document.title = 'Sheet2Suite Admin Portal';
    }
    fetchRecords();
  }, []);

  const handleDeleteWorkspace = async (targetId: string) => {
    try {
      const res = await fetch(`/api/admin/db?workspaceId=${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        // Also clear local session storage to reset browser state
        if (typeof window !== 'undefined') {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('s2v_') || key.startsWith('s2s_'))) {
              localStorage.removeItem(key);
            }
          }
        }
        setSuccessMsg(`Deleted workspace: ${targetId} and cleared browser local session.`);
        fetchRecords();
      } else {
        setErrorMsg(data.error || 'Delete failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete workspace.');
    }
  };

  const handleDeleteLicense = async (licenseKey: string) => {
    try {
      const res = await fetch(`/api/admin/db?licenseKey=${encodeURIComponent(licenseKey)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Deleted license: ${licenseKey}`);
        fetchRecords();
      } else {
        setErrorMsg(data.error || 'Delete failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete license.');
    }
  };

  const handleResetAllTestSession = async () => {
    try {
      const res = await fetch('/api/admin/db?all=true', { method: 'DELETE' });
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
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: '#f9fafb', fontFamily: 'sans-serif', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={28} style={{ color: '#00ED64' }} />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>Sheet2Suite Admin Inspector</h1>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>Inspect & manage local database workspace records</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleResetAllTestSession}
              style={{
                backgroundColor: '#7f1d1d',
                color: '#fca5a5',
                border: '1px solid #991b1b',
                borderRadius: '6px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Trash2 size={14} />
              <span>PURGE ALL & RESET SESSION</span>
            </button>
            <button
              onClick={fetchRecords}
              style={{
                backgroundColor: '#1f2937',
                color: '#ffffff',
                border: '1px solid #374151',
                borderRadius: '6px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>REFRESH</span>
            </button>
            <a
              href="/vow"
              style={{
                backgroundColor: '#00ED64',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ArrowLeft size={14} />
              <span>RETURN TO APP</span>
            </a>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#064e3b', border: '1px solid #10b981', color: '#34d399', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>✔ {successMsg}</span>
            <button
              onClick={() => setSuccessMsg(null)}
              style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, padding: '0 0.25rem' }}
              title="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}
        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#7f1d1d', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>✖ {errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, padding: '0 0.25rem' }}
              title="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Workspaces Section */}
        <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={20} style={{ color: '#60a5fa' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Active Spreadsheet Workspaces ({workspaces.length})
              </h2>
            </div>
          </div>

          {workspaces.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
              No registered workspaces found. Log in via Google or run provisioning to populate records.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111827', color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    <th style={{ padding: '0.75rem' }}>User / Partner Email</th>
                    <th style={{ padding: '0.75rem' }}>Etsy Order ID / Code</th>
                    <th style={{ padding: '0.75rem' }}>Spreadsheet Name</th>
                    <th style={{ padding: '0.75rem' }}>Spreadsheet ID</th>
                    <th style={{ padding: '0.75rem' }}>Drive Folder Path</th>
                    <th style={{ padding: '0.75rem' }}>Activated At</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map((ws) => (
                    <tr key={ws.workspaceId} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{ws.userEmail}</div>
                        {ws.partnerEmail && (
                          <div style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>Partner: {ws.partnerEmail}</div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>
                          {ws.orderId || 'ETSY-DEMO-9876'}
                        </div>
                        <span style={{ backgroundColor: ws.orderVerified !== false ? '#064e3b' : '#7f1d1d', color: ws.orderVerified !== false ? '#34d399' : '#fca5a5', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                          {ws.orderVerified !== false ? 'VERIFIED (MOCKED)' : 'UNVERIFIED'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#e5e7eb' }}>
                        {ws.spreadsheetName}
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#9ca3af' }}>
                        {ws.spreadsheetId}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#d1d5db' }}>
                        📁 {ws.driveFolderPath}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#9ca3af', fontSize: '0.725rem' }}>
                        {new Date(ws.activatedAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => setRawJsonRecord(ws)}
                            style={{
                              backgroundColor: '#374151',
                              color: '#60a5fa',
                              border: '1px solid #4b5563',
                              borderRadius: '4px',
                              padding: '0.35rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            👁️ JSON
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ws, 'workspace')}
                            style={{
                              backgroundColor: '#1e3a8a',
                              color: '#93c5fd',
                              border: '1px solid #3b82f6',
                              borderRadius: '4px',
                              padding: '0.35rem 0.55rem',
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title="Edit workspace record on Firebase"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          {ws.webViewLink && (
                            <a
                              href={ws.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#34d399', textDecoration: 'none', padding: '0.35rem 0.5rem', backgroundColor: '#064e3b', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 700 }}
                            >
                              <ExternalLink size={12} />
                              <span>Sheet</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteWorkspace(ws.workspaceId || ws.spreadsheetId)}
                            style={{
                              backgroundColor: '#7f1d1d',
                              color: '#fca5a5',
                              border: '1px solid #991b1b',
                              borderRadius: '4px',
                              padding: '0.35rem 0.6rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
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

        {/* Licenses Section */}
        <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Key size={20} style={{ color: '#f59e0b' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Registered Entitlement Licenses ({licenses.length})
            </h2>
          </div>

          {licenses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
              No registered license keys found in local database.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111827', color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    <th style={{ padding: '0.75rem' }}>License Key</th>
                    <th style={{ padding: '0.75rem' }}>Order ID</th>
                    <th style={{ padding: '0.75rem' }}>Purchaser Email</th>
                    <th style={{ padding: '0.75rem' }}>SKU</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((lic) => (
                    <tr key={lic.licenseKey} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>
                        {lic.licenseKey}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#d1d5db' }}>{lic.orderId}</td>
                      <td style={{ padding: '0.75rem', color: '#ffffff' }}>{lic.purchaserEmail}</td>
                      <td style={{ padding: '0.75rem', color: '#60a5fa' }}>{lic.sku}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {lic.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => setRawJsonRecord(lic)}
                            style={{
                              backgroundColor: '#374151',
                              color: '#60a5fa',
                              border: '1px solid #4b5563',
                              borderRadius: '4px',
                              padding: '0.35rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            👁️ JSON
                          </button>
                          <button
                            onClick={() => handleOpenEdit(lic, 'license')}
                            style={{
                              backgroundColor: '#1e3a8a',
                              color: '#93c5fd',
                              border: '1px solid #3b82f6',
                              borderRadius: '4px',
                              padding: '0.35rem 0.55rem',
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title="Edit license record on Firebase"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteLicense(lic.licenseKey)}
                            style={{
                              backgroundColor: '#7f1d1d',
                              color: '#fca5a5',
                              border: '1px solid #991b1b',
                              borderRadius: '4px',
                              padding: '0.35rem 0.6rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
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

        {/* Schema Validator & Auto-Repair Tool Section */}
        <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} style={{ color: '#10b981' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Master Spreadsheet Schema Validator & Auto-Repair Engine
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={auditSpreadsheetId}
                onChange={(e) => setAuditSpreadsheetId(e.target.value)}
                placeholder="Google Spreadsheet ID"
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  padding: '0.4rem 0.75rem',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  width: '280px',
                }}
              />
              <button
                onClick={handleRunSchemaAudit}
                disabled={isAuditingSchema}
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.45rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <RefreshCw size={14} className={isAuditingSchema ? 'spin' : ''} />
                <span>{isAuditingSchema ? 'Auditing...' : 'Run Schema Audit'}</span>
              </button>
            </div>
          </div>

          {schemaReport && (
            <div style={{ marginTop: '1rem', backgroundColor: '#111827', borderRadius: '6px', padding: '1.25rem', border: '1px solid #374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: schemaReport.isFullyCompliant ? '#34d399' : '#f59e0b', fontFamily: 'monospace' }}>
                  STATUS: {schemaReport.isFullyCompliant ? '✅ 100% SCHEMA COMPLIANT' : '⚠️ DISCREPANCIES DETECTED'}
                </span>
                {!schemaReport.isFullyCompliant && (
                  <button
                    onClick={handleAutoRepairSchema}
                    disabled={isRepairingSchema}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.45rem 0.9rem',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {isRepairingSchema ? 'Repairing Sheet...' : '🛠️ Auto-Repair Google Sheet'}
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {schemaReport.tabReports?.map((tr: any) => (
                  <div key={tr.tabName} style={{ backgroundColor: '#1f2937', padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid #374151' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        📄 {tr.tabName}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: tr.missingHeaders.length === 0 ? '#34d399' : '#f87171' }}>
                        {tr.missingHeaders.length === 0 ? 'MATCH' : `-${tr.missingHeaders.length} MISSING`}
                      </span>
                    </div>
                    {tr.missingHeaders.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontFamily: 'monospace' }}>
                        Missing: {tr.missingHeaders.join(', ')}
                      </div>
                    )}
                    {tr.extraHeaders.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#fde68a', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                        Extra unmapped: {tr.extraHeaders.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw JSON Record Viewer Modal */}
      {rawJsonRecord && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setRawJsonRecord(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '85vh',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#f9fafb',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} style={{ color: '#00ED64' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Raw Database Document Record (JSON)</h3>
              </div>
              <button
                onClick={() => setRawJsonRecord(null)}
                style={{ backgroundColor: '#374151', color: '#9ca3af', border: 'none', borderRadius: '4px', padding: '0.35rem 0.65rem', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕ CLOSE
              </button>
            </div>

            <pre
              style={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '1.25rem',
                fontSize: '0.825rem',
                fontFamily: 'monospace',
                color: '#a7f3d0',
                overflow: 'auto',
                maxHeight: '55vh',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {JSON.stringify(rawJsonRecord, null, 2)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(rawJsonRecord, null, 2));
                  alert('Copied JSON record to clipboard!');
                }}
                style={{
                  backgroundColor: '#00ED64',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                📋 COPY JSON TO CLIPBOARD
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Record Modal (Firebase) */}
      {editingRecord && editType && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.25rem',
            backdropFilter: 'blur(5px)',
          }}
          onClick={handleCloseEdit}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#f9fafb',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {editType === 'workspace' ? (
                  <HardDrive size={22} style={{ color: '#60a5fa' }} />
                ) : (
                  <Key size={22} style={{ color: '#f59e0b' }} />
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    Edit {editType === 'workspace' ? 'Spreadsheet Workspace Record' : 'Entitlement License Record'}
                  </h3>
                  <div style={{ fontSize: '0.725rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                    <span>Target Firebase Document:</span>
                    <span style={{ fontFamily: 'monospace', color: '#00ED64', fontWeight: 700 }}>
                      {editType === 'workspace' ? editForm.workspaceId : editForm.licenseKey}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseEdit}
                style={{
                  backgroundColor: '#374151',
                  color: '#9ca3af',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.6rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <X size={14} />
                <span>ESC</span>
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>
              <button
                onClick={() => handleSwitchEditMode('form')}
                style={{
                  backgroundColor: editMode === 'form' ? '#111827' : 'transparent',
                  color: editMode === 'form' ? '#00ED64' : '#9ca3af',
                  border: editMode === 'form' ? '1px solid #00ED64' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <FileText size={14} />
                <span>Structured Form</span>
              </button>
              <button
                onClick={() => handleSwitchEditMode('json')}
                style={{
                  backgroundColor: editMode === 'json' ? '#111827' : 'transparent',
                  color: editMode === 'json' ? '#60a5fa' : '#9ca3af',
                  border: editMode === 'json' ? '1px solid #3b82f6' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Code size={14} />
                <span>Raw JSON Editor</span>
              </button>
            </div>

            {/* Error banner inside modal */}
            {jsonParseError && (
              <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#7f1d1d', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{jsonParseError}</span>
              </div>
            )}

            {/* Body: Form or Raw JSON */}
            <div style={{ overflowY: 'auto', maxHeight: '58vh', paddingRight: '0.25rem' }}>
              {editMode === 'form' ? (
                editType === 'workspace' ? (
                  /* Workspace Form View */
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Spreadsheet Name
                      </label>
                      <input
                        type="text"
                        value={editForm.spreadsheetName || ''}
                        onChange={(e) => setEditForm({ ...editForm, spreadsheetName: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Product Name
                      </label>
                      <select
                        value={editForm.productName || 'Sheet2Vow'}
                        onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      >
                        <option value="Sheet2Vow">Sheet2Vow</option>
                        <option value="Sheet2Home">Sheet2Home</option>
                        <option value="Sheet2Finance">Sheet2Finance</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Google Spreadsheet ID (Primary Cloud Document)
                      </label>
                      <input
                        type="text"
                        value={editForm.spreadsheetId || ''}
                        onChange={(e) => setEditForm({ ...editForm, spreadsheetId: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#00ED64', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'block', marginTop: '0.2rem' }}>
                        Changes the Google Sheet this workspace connects to. Changing this auto-updates data synchronization.
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Owner User Email
                      </label>
                      <input
                        type="email"
                        value={editForm.userEmail || ''}
                        onChange={(e) => setEditForm({ ...editForm, userEmail: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Partner Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={editForm.partnerEmail || ''}
                        onChange={(e) => setEditForm({ ...editForm, partnerEmail: e.target.value })}
                        placeholder="partner@example.com"
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Co-Planners (Comma-Separated Emails)
                      </label>
                      <input
                        type="text"
                        value={editForm.coPlanners || ''}
                        onChange={(e) => setEditForm({ ...editForm, coPlanners: e.target.value })}
                        placeholder="planner1@domain.com, friend@domain.com"
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'block', marginTop: '0.2rem' }}>
                        Users authorized to access and collaborate on this wedding workspace.
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Etsy Order ID / Activation Code
                      </label>
                      <input
                        type="text"
                        value={editForm.orderId || ''}
                        onChange={(e) => setEditForm({ ...editForm, orderId: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Order Verification Status
                      </label>
                      <select
                        value={String(editForm.orderVerified)}
                        onChange={(e) => setEditForm({ ...editForm, orderVerified: e.target.value === 'true' })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      >
                        <option value="true">VERIFIED (Full Feature Access)</option>
                        <option value="false">UNVERIFIED (Requires Validation)</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Drive Folder Path
                      </label>
                      <input
                        type="text"
                        value={editForm.driveFolderPath || ''}
                        onChange={(e) => setEditForm({ ...editForm, driveFolderPath: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Web View Link
                      </label>
                      <input
                        type="text"
                        value={editForm.webViewLink || ''}
                        onChange={(e) => setEditForm({ ...editForm, webViewLink: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1', padding: '0.75rem', backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #374151', fontSize: '0.725rem', color: '#9ca3af', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div><strong style={{ color: '#d1d5db' }}>Workspace ID:</strong> <span style={{ fontFamily: 'monospace' }}>{editForm.workspaceId}</span></div>
                      <div><strong style={{ color: '#d1d5db' }}>Activated At:</strong> {editForm.activatedAt ? new Date(editForm.activatedAt).toLocaleString() : 'N/A'}</div>
                      <div><strong style={{ color: '#d1d5db' }}>Last Active:</strong> {editForm.lastActiveAt ? new Date(editForm.lastActiveAt).toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>
                ) : (
                  /* License Form View */
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        License Key (Document ID)
                      </label>
                      <input
                        type="text"
                        value={editForm.licenseKey || ''}
                        onChange={(e) => setEditForm({ ...editForm, licenseKey: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        License Status
                      </label>
                      <select
                        value={editForm.status || 'active'}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      >
                        <option value="active">ACTIVE</option>
                        <option value="revoked">REVOKED</option>
                        <option value="expired">EXPIRED</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Purchaser Email
                      </label>
                      <input
                        type="email"
                        value={editForm.purchaserEmail || ''}
                        onChange={(e) => setEditForm({ ...editForm, purchaserEmail: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Etsy Order ID
                      </label>
                      <input
                        type="text"
                        value={editForm.orderId || ''}
                        onChange={(e) => setEditForm({ ...editForm, orderId: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        SKU Identifier
                      </label>
                      <input
                        type="text"
                        value={editForm.sku || ''}
                        onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                        placeholder="sheet2vow or sheet2suite_bundle"
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#60a5fa', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        License Tier
                      </label>
                      <select
                        value={editForm.licenseTier || 'standard'}
                        onChange={(e) => setEditForm({ ...editForm, licenseTier: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      >
                        <option value="standard">Standard Tier</option>
                        <option value="pro">Pro Suite Bundle</option>
                        <option value="unlimited">Unlimited Tier</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Max Workspaces Allowed
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={editForm.maxWorkspaces ?? 2}
                        onChange={(e) => setEditForm({ ...editForm, maxWorkspaces: Number(e.target.value) })}
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Entitled Products (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        value={editForm.entitledProducts || ''}
                        onChange={(e) => setEditForm({ ...editForm, entitledProducts: e.target.value })}
                        placeholder="SHEET2VOW, SHEET2FINANCE, SHEET2HOME"
                        style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#111827', border: '1px solid #4b5563', borderRadius: '6px', padding: '0.5rem 0.75rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1', padding: '0.75rem', backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #374151', fontSize: '0.725rem', color: '#9ca3af', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div><strong style={{ color: '#d1d5db' }}>Created At:</strong> {editForm.createdAt ? new Date(editForm.createdAt).toLocaleString() : 'N/A'}</div>
                      <div><strong style={{ color: '#d1d5db' }}>Updated At:</strong> {editForm.updatedAt ? new Date(editForm.updatedAt).toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>
                )
              ) : (
                /* Raw JSON Editor View */
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                    Directly modify this document's JSON structure. Changes will be persisted to Cloud Firestore & local storage.
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
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      minHeight: '320px',
                      backgroundColor: '#111827',
                      border: jsonParseError ? '1px solid #ef4444' : '1px solid #4b5563',
                      borderRadius: '8px',
                      padding: '1rem',
                      fontFamily: 'monospace',
                      fontSize: '0.825rem',
                      color: '#a7f3d0',
                      lineHeight: 1.5,
                      outline: 'none',
                    }}
                    spellCheck={false}
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #374151', paddingTop: '0.85rem' }}>
              <button
                onClick={handleCloseEdit}
                disabled={isSavingRecord}
                style={{
                  backgroundColor: '#374151',
                  color: '#d1d5db',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingRecord || Boolean(jsonParseError)}
                style={{
                  backgroundColor: isSavingRecord || Boolean(jsonParseError) ? '#374151' : '#00ED64',
                  color: isSavingRecord || Boolean(jsonParseError) ? '#9ca3af' : '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: isSavingRecord || Boolean(jsonParseError) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: isSavingRecord || Boolean(jsonParseError) ? 'none' : '0 4px 6px -1px rgba(0, 237, 100, 0.2)',
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
                    <span>Save Changes to Firebase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
