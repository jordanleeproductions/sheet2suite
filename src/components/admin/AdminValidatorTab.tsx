'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Wrench,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  CheckCheck,
} from 'lucide-react';
import { WorkspaceRecord } from '@/lib/db/licensingDb';

interface AdminValidatorTabProps {
  workspaces: WorkspaceRecord[];
  initialSpreadsheetId?: string;
  initialProductCode?: string;
  getAdminHeaders: (additional?: Record<string, string>) => Record<string, string>;
  onAutoRepairSuccess?: (report: any) => void;
}

export default function AdminValidatorTab({
  workspaces,
  initialSpreadsheetId,
  initialProductCode,
  getAdminHeaders,
  onAutoRepairSuccess,
}: AdminValidatorTabProps) {
  const [spreadsheetId, setSpreadsheetId] = useState<string>(
    initialSpreadsheetId || '1h_RGirRXv_4zXjqvhJnRlSJ-OnqxPeK9f3M_Eep4RcI'
  );
  const [productCode, setProductCode] = useState<string>(initialProductCode || 'SHEET2VOW');
  const [schemaReport, setSchemaReport] = useState<any | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);
  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({});

  // Sync if initial props change
  useEffect(() => {
    if (initialSpreadsheetId) {
      setSpreadsheetId(initialSpreadsheetId);
    }
    if (initialProductCode) {
      setProductCode(initialProductCode);
    }
  }, [initialSpreadsheetId, initialProductCode]);

  const toggleTabExpand = (tabName: string) => {
    setExpandedTabs((prev) => ({ ...prev, [tabName]: !prev[tabName] }));
  };

  const handleRunAudit = async (targetId?: string, targetProduct?: string) => {
    const idToAudit = (targetId || spreadsheetId).trim();
    const productToAudit = targetProduct || productCode;

    if (!idToAudit) {
      setErrorMsg('Please specify a valid Google Spreadsheet ID to audit.');
      return;
    }

    setIsAuditing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const url = `/api/admin/validate-schema?spreadsheetId=${encodeURIComponent(idToAudit)}&productCode=${encodeURIComponent(productToAudit)}`;
      const res = await fetch(url, { headers: getAdminHeaders() });
      const data = await res.json();

      if (data.success) {
        setSchemaReport(data.report);
        // Expand any tab with issues by default
        const issueMap: Record<string, boolean> = {};
        (data.report.tabReports || []).forEach((tr: any) => {
          if (!tr.tabExists || tr.missingHeaders.length > 0 || tr.extraHeaders.length > 0 || !tr.orderMatches) {
            issueMap[tr.tabName] = true;
          }
        });
        setExpandedTabs(issueMap);
      } else {
        setErrorMsg(data.error || 'Failed to complete schema audit.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error running schema audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAutoRepair = async () => {
    const idToRepair = spreadsheetId.trim();
    if (!idToRepair) return;

    setIsRepairing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/validate-schema', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ spreadsheetId: idToRepair, productCode }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Successfully repaired ${data.repairedTabs?.length || 0} tabs on Google Sheet!`);
        setSchemaReport(data.report);
        if (onAutoRepairSuccess) {
          onAutoRepairSuccess(data.report);
        }
      } else {
        setErrorMsg(data.error || 'Failed to auto-repair Google Sheet schema.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing auto-repair.');
    } finally {
      setIsRepairing(false);
    }
  };

  const handleCopySupportDossier = () => {
    if (!schemaReport) return;

    const timestamp = new Date().toISOString();
    const isCompliant = schemaReport.isFullyCompliant;
    let dossier = `# 📋 Sheet2Suite Support Diagnostic Dossier\n\n`;
    dossier += `- **Timestamp:** ${timestamp}\n`;
    dossier += `- **Spreadsheet ID:** \`${schemaReport.spreadsheetId}\`\n`;
    dossier += `- **Product Target:** ${productCode}\n`;
    dossier += `- **Overall Status:** ${isCompliant ? '✅ 100% COMPLIANT' : '⚠️ DISCREPANCIES DETECTED'}\n`;
    dossier += `- **Missing Tabs:** ${schemaReport.missingTabs.length > 0 ? schemaReport.missingTabs.join(', ') : 'None'}\n`;
    dossier += `- **Total Missing Headers:** ${schemaReport.totalMissingHeadersCount}\n`;
    dossier += `- **Total Extra Headers:** ${schemaReport.totalExtraHeadersCount}\n\n`;

    dossier += `### Tab Breakdown\n`;
    (schemaReport.tabReports || []).forEach((t: any) => {
      const statusIcon = !t.tabExists ? '❌ Missing Tab' : t.missingHeaders.length > 0 ? '⚠️ Incomplete' : '✅ Compliant';
      dossier += `\n#### Tab: \`${t.tabName}\` [${statusIcon}]\n`;
      dossier += `- **Order Matches:** ${t.orderMatches ? 'Yes' : 'No (Column reordering detected)'}\n`;
      if (t.missingHeaders.length > 0) {
        dossier += `- **Missing Headers:** ${t.missingHeaders.map((h: string) => `\`${h}\``).join(', ')}\n`;
      }
      if (t.extraHeaders.length > 0) {
        dossier += `- **Extra / Custom Headers:** ${t.extraHeaders.map((h: string) => `\`${h}\``).join(', ')}\n`;
      }
      dossier += `- **Actual Header Count:** ${t.actualHeaders.length}\n`;
    });

    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(dossier);
      setCopiedDossier(true);
      setTimeout(() => setCopiedDossier(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
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
            Advanced Sheet Validator Tool
          </h2>
          <p style={{
            margin: '0.2rem 0 0 0',
            fontSize: '0.8rem',
            color: 'var(--color-muted)',
          }}>
            Diagnose customer spreadsheets against canonical schemas, detect column drifts, and apply 1-click auto-repairs.
          </p>
        </div>

        {/* Product Target Switcher */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          padding: '3px',
          gap: '3px',
        }}>
          <button
            type="button"
            onClick={() => setProductCode('SHEET2VOW')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: productCode === 'SHEET2VOW' ? 'var(--color-primary)' : 'transparent',
              color: productCode === 'SHEET2VOW' ? '#ffffff' : 'var(--color-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            SHEET2VOW SCHEMA
          </button>
          <button
            type="button"
            onClick={() => setProductCode('SHEET2VAULT')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: productCode === 'SHEET2VAULT' ? 'var(--color-primary)' : 'transparent',
              color: productCode === 'SHEET2VAULT' ? '#ffffff' : 'var(--color-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            SHEET2VAULT SCHEMA
          </button>
        </div>
      </div>

      {/* Target Sheet Picker & Input Controls */}
      <div style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-lg, 12px)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: 'var(--box-shadow-subtle, 0 1px 3px rgba(0,0,0,0.05))',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}>
          {/* Quick Workspace Picker Dropdown */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-muted)',
              marginBottom: '0.35rem',
              textTransform: 'uppercase',
            }}>
              Select Customer Workspace
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  setSpreadsheetId(e.target.value);
                  const matchedWs = workspaces.find((w) => w.spreadsheetId === e.target.value);
                  if (matchedWs?.productName === 'Sheet2Vault') {
                    setProductCode('SHEET2VAULT');
                  } else {
                    setProductCode('SHEET2VOW');
                  }
                }
              }}
              value={workspaces.some((w) => w.spreadsheetId === spreadsheetId) ? spreadsheetId : ''}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--border-radius-sm, 6px)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-subtle)',
                color: 'var(--color-text)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="">-- Choose from registered workspaces ({workspaces.length}) --</option>
              {workspaces.map((ws, i) => (
                <option key={ws.workspaceId || ws.spreadsheetId || i} value={ws.spreadsheetId}>
                  {ws.spreadsheetName || 'Untitled Sheet'} ({ws.userEmail || 'No Email'}) — {ws.productName || 'Sheet2Vow'}
                </option>
              ))}
            </select>
          </div>

          {/* Manual Spreadsheet ID Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-muted)',
              marginBottom: '0.35rem',
              textTransform: 'uppercase',
            }}>
              Or Manual Google Spreadsheet ID
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="e.g. 1h_RGirRXv_4zXjqvhJnRlSJ-OnqxPeK9f3M_Eep4RcI"
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--border-radius-sm, 6px)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => handleRunAudit()}
                disabled={isAuditing || !spreadsheetId.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem',
                  borderRadius: 'var(--border-radius-sm, 6px)',
                  backgroundColor: 'var(--color-primary)',
                  border: 'none',
                  color: 'var(--color-on-primary, #ffffff)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: isAuditing ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={14} className={isAuditing ? 'spin' : ''} />
                <span>{isAuditing ? 'AUDITING...' : 'RUN AUDIT'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div style={{
          padding: '0.85rem 1.15rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#B91C1C',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.8rem',
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '0.85rem 1.15rem',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          color: '#065F46',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.8rem',
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Report Dashboard */}
      {schemaReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* KPI Strip & Action Bar */}
          <div style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            {/* Status Pulse */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: schemaReport.isFullyCompliant ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: schemaReport.isFullyCompliant ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: schemaReport.isFullyCompliant ? '#10B981' : '#F59E0B',
              }}>
                {schemaReport.isFullyCompliant ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: schemaReport.isFullyCompliant ? '#047857' : '#B45309',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {schemaReport.isFullyCompliant ? '100% SCHEMA COMPLIANT' : 'SCHEMA DISCREPANCIES DETECTED'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.2rem', fontSize: '0.725rem', color: 'var(--color-muted)' }}>
                  <span>{schemaReport.tabReports.length} Checked Tabs</span>
                  <span>•</span>
                  <span>{schemaReport.missingTabs.length} Missing Tabs</span>
                  <span>•</span>
                  <span>{schemaReport.totalMissingHeadersCount} Missing Headers</span>
                </div>
              </div>
            </div>

            {/* Support Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopySupportDossier}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--border-radius-sm, 6px)',
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copiedDossier ? <CheckCheck size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
                <span>{copiedDossier ? 'COPIED TO CLIPBOARD' : 'COPY SUPPORT DOSSIER'}</span>
              </button>

              {!schemaReport.isFullyCompliant && (
                <button
                  type="button"
                  onClick={handleAutoRepair}
                  disabled={isRepairing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--border-radius-sm, 6px)',
                    backgroundColor: '#10B981',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    cursor: isRepairing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <Wrench size={14} className={isRepairing ? 'spin' : ''} />
                  <span>{isRepairing ? 'REPAIRING HEADERS...' : '1-CLICK AUTO-REPAIR'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Audit Detailed Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {schemaReport.tabReports.map((tab: any) => {
              const isExpanded = expandedTabs[tab.tabName];
              const isTabOk = tab.tabExists && tab.missingHeaders.length === 0;

              return (
                <div
                  key={tab.tabName}
                  style={{
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--border-radius-md, 8px)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Tab Summary Bar */}
                  <div
                    onClick={() => toggleTabExpand(tab.tabName)}
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: isTabOk ? 'transparent' : 'rgba(245, 158, 11, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {isExpanded ? <ChevronDown size={15} color="var(--color-muted)" /> : <ChevronRight size={15} color="var(--color-muted)" />}
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                        {tab.tabName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                        ({tab.actualHeaders.length} actual cols / {tab.expectedHeaders.length} canonical)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {!tab.tabExists ? (
                        <span style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#DC2626',
                          fontWeight: 700,
                        }}>
                          MISSING TAB
                        </span>
                      ) : tab.missingHeaders.length > 0 ? (
                        <span style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          color: '#D97706',
                          fontWeight: 700,
                        }}>
                          {tab.missingHeaders.length} MISSING HEADERS
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#059669',
                          fontWeight: 700,
                        }}>
                          COMPLIANT
                        </span>
                      )}

                      {!tab.orderMatches && tab.tabExists && tab.missingHeaders.length === 0 && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-bg-subtle)',
                          color: 'var(--color-muted)',
                        }}>
                          Column Drift
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Header Comparison */}
                  {isExpanded && (
                    <div style={{
                      padding: '1rem',
                      borderTop: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      fontSize: '0.75rem',
                    }}>
                      {/* Missing Headers Alert */}
                      {tab.missingHeaders.length > 0 && (
                        <div>
                          <span style={{ fontWeight: 700, color: '#DC2626', display: 'block', marginBottom: '0.35rem' }}>
                            Missing Required Headers ({tab.missingHeaders.length}):
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {tab.missingHeaders.map((h: string) => (
                              <span key={h} style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#B91C1C',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                              }}>
                                + {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extra Headers Alert */}
                      {tab.extraHeaders.length > 0 && (
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--color-muted)', display: 'block', marginBottom: '0.35rem' }}>
                            Extra / Custom User Columns ({tab.extraHeaders.length}):
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {tab.extraHeaders.map((h: string) => (
                              <span key={h} style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--color-surface, #ffffff)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-muted)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                              }}>
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actual Row 1 Headers Matrix */}
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--color-text)', display: 'block', marginBottom: '0.35rem' }}>
                          Actual Row 1 Layout on Customer Sheet:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {tab.actualHeaders.map((h: string, idx: number) => {
                            const isExpected = tab.expectedHeaders.includes(h);
                            return (
                              <span key={idx} style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                backgroundColor: isExpected ? 'var(--color-surface, #ffffff)' : 'rgba(245, 158, 11, 0.1)',
                                border: `1px solid ${isExpected ? 'var(--color-border)' : 'rgba(245, 158, 11, 0.3)'}`,
                                color: isExpected ? 'var(--color-text)' : '#B45309',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                              }}>
                                Col {idx + 1}: {h}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
