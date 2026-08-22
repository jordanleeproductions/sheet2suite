'use client';

import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw, HardDrive, ShieldCheck, Key, ArrowLeft, ExternalLink } from 'lucide-react';
import { WorkspaceRecord } from '@/lib/db/licensingDb';
import { Sheet2SuiteLicense } from '@/lib/sheets/types';

export default function AdminDatabasePage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [licenses, setLicenses] = useState<Sheet2SuiteLicense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rawJsonRecord, setRawJsonRecord] = useState<any | null>(null);

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
    </div>
  );
}
