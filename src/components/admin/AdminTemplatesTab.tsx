'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  ShieldCheck,
  Table,
  HelpCircle,
  Eye,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { MasterTemplateDossier, TabTemplateDefinition } from '@/app/api/admin/templates/route';

interface AdminTemplatesTabProps {
  getAdminHeaders: () => Record<string, string>;
  onNavigateToValidator: (sheetId: string, productCode: string) => void;
}

export default function AdminTemplatesTab({
  getAdminHeaders,
  onNavigateToValidator,
}: AdminTemplatesTabProps) {
  const [templates, setTemplates] = useState<MasterTemplateDossier[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<'SHEET2VOW' | 'SHEET2VAULT'>('SHEET2VOW');
  const [selectedTabName, setSelectedTabName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/templates', { headers: getAdminHeaders() });
      if (!res.ok) throw new Error('Failed to load template schemas.');
      const data = await res.json();
      if (data.success && data.templates) {
        setTemplates(data.templates);
        // Default to first tab of selected product
        const currentDossier = data.templates.find((t: MasterTemplateDossier) => t.productCode === selectedProduct);
        if (currentDossier && currentDossier.tabs.length > 0) {
          setSelectedTabName(currentDossier.tabs[0].tabName);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching master templates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const activeDossier = templates.find((t) => t.productCode === selectedProduct) || templates[0];

  useEffect(() => {
    if (activeDossier && activeDossier.tabs.length > 0) {
      if (!activeDossier.tabs.some((t) => t.tabName === selectedTabName)) {
        setSelectedTabName(activeDossier.tabs[0].tabName);
      }
    }
  }, [selectedProduct, activeDossier]);

  const handleCopy = (text: string, identifier: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(identifier);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const activeTabDefinition = activeDossier?.tabs.find((t) => t.tabName === selectedTabName) || activeDossier?.tabs[0];

  // Filter columns within the selected tab if user searches
  const filteredColumns = activeTabDefinition?.columns.filter((c) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(query) || c.letter.toLowerCase().includes(query);
  }) || [];

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
            Golden Master Template Inspector
          </h2>
          <p style={{
            margin: '0.2rem 0 0 0',
            fontSize: '0.8rem',
            color: 'var(--color-muted)',
          }}>
            Direct inspection and schema audits for official master templates across production and pre-release apps.
          </p>
        </div>

        {/* Product Switcher Pills */}
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
            onClick={() => setSelectedProduct('SHEET2VOW')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedProduct === 'SHEET2VOW' ? 'var(--color-primary)' : 'transparent',
              color: selectedProduct === 'SHEET2VOW' ? '#ffffff' : 'var(--color-muted)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <CheckCircle2 size={14} style={{ color: selectedProduct === 'SHEET2VOW' ? '#6EE7B7' : '#10B981' }} />
            <span>Sheet2Vow</span>
            <span style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '4px',
              backgroundColor: selectedProduct === 'SHEET2VOW' ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-subtle)',
              color: selectedProduct === 'SHEET2VOW' ? '#ffffff' : 'var(--color-muted)',
            }}>
              10 TABS
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProduct('SHEET2VAULT')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedProduct === 'SHEET2VAULT' ? 'var(--color-primary)' : 'transparent',
              color: selectedProduct === 'SHEET2VAULT' ? '#ffffff' : 'var(--color-muted)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Sparkles size={14} style={{ color: selectedProduct === 'SHEET2VAULT' ? '#FDE047' : '#A855F7' }} />
            <span>Sheet2Vault</span>
            <span style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '4px',
              backgroundColor: selectedProduct === 'SHEET2VAULT' ? 'rgba(255,255,255,0.2)' : 'rgba(168, 85, 247, 0.1)',
              color: selectedProduct === 'SHEET2VAULT' ? '#ffffff' : '#A855F7',
              fontWeight: 700,
            }}>
              IN DEV
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-lg, 12px)',
          color: 'var(--color-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading Golden Master specifications...</span>
        </div>
      ) : errorMsg ? (
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          color: '#B91C1C',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      ) : activeDossier ? (
        <>
          {/* Master Sheet Banner & Actions */}
          <div style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg, 12px)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--box-shadow-subtle, 0 1px 3px rgba(0,0,0,0.05))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: activeDossier.status === 'production' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                border: activeDossier.status === 'production' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeDossier.status === 'production' ? '#10B981' : '#A855F7',
              }}>
                <FileSpreadsheet size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    {activeDossier.productName} Golden Master
                  </h3>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: activeDossier.status === 'production' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    color: activeDossier.status === 'production' ? '#047857' : '#7C3AED',
                    border: activeDossier.status === 'production' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)',
                  }}>
                    {activeDossier.status === 'production' ? '● PRODUCTION READY' : '✦ IN ACTIVE DEVELOPMENT'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  <span>{activeDossier.totalTabs} Canonical Tabs</span>
                  <span>•</span>
                  <span>{activeDossier.totalColumns} Total Columns</span>
                  <span>•</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                      ID: {activeDossier.goldenMasterSheetId.substring(0, 16)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeDossier.goldenMasterSheetId, 'master-id')}
                      title="Copy Master Sheet ID"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedId === 'master-id' ? '#10B981' : 'var(--color-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      {copiedId === 'master-id' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Master Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href={activeDossier.webViewLink}
                target="_blank"
                rel="noreferrer"
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
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <ExternalLink size={14} style={{ color: '#0F9D58' }} />
                <span>Open in Google Sheets</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigateToValidator(activeDossier.goldenMasterSheetId, activeDossier.productCode)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--border-radius-sm, 6px)',
                  backgroundColor: 'var(--color-primary)',
                  border: 'none',
                  color: 'var(--color-on-primary, #ffffff)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(99, 102, 241, 0.25)',
                }}
              >
                <ShieldCheck size={14} />
                <span>AUDIT GOLDEN MASTER</span>
              </button>
            </div>
          </div>

          {/* Tab Selector & Column Explorer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: '1rem',
            alignItems: 'start',
          }}>
            {/* Left Tab List */}
            <div style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg, 12px)',
              padding: '0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}>
              <div style={{
                padding: '0.4rem 0.65rem 0.65rem 0.65rem',
                borderBottom: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'var(--color-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span>CANONICAL TABS ({activeDossier.tabs.length})</span>
                <Layers size={13} />
              </div>

              {activeDossier.tabs.map((tab) => {
                const isSelected = tab.tabName === selectedTabName;
                return (
                  <button
                    key={tab.tabName}
                    type="button"
                    onClick={() => setSelectedTabName(tab.tabName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--border-radius-sm, 6px)',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--color-text)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{tab.tabName}</span>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-subtle)',
                      color: isSelected ? '#ffffff' : 'var(--color-muted)',
                    }}>
                      {tab.columns.length} cols
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Column Matrix */}
            <div style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg, 12px)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {activeTabDefinition ? (
                <>
                  {/* Selected Tab Meta */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    paddingBottom: '0.85rem',
                    borderBottom: '1px solid var(--color-border)',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                          {activeTabDefinition.tabName}
                        </h4>
                        <span style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-bg-subtle)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-muted)',
                        }}>
                          Frozen: Row 1
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                        {activeTabDefinition.description}
                      </p>
                    </div>

                    {/* Column Search */}
                    <div style={{ position: 'relative', width: '220px' }}>
                      <Search size={14} style={{
                        position: 'absolute',
                        left: '9px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-muted)',
                      }} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search headers..."
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.65rem 0.35rem 1.85rem',
                          borderRadius: 'var(--border-radius-sm, 6px)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg-subtle)',
                          color: 'var(--color-text)',
                          fontSize: '0.75rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Columns Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '0.65rem',
                  }}>
                    {filteredColumns.map((col, idx) => (
                      <div
                        key={col.name}
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-bg-subtle)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                          transition: 'border-color 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: 'var(--color-muted)',
                          }}>
                            {col.letter}
                          </span>
                          <span style={{
                            fontSize: '0.6rem',
                            fontFamily: 'var(--font-mono)',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#059669',
                            fontWeight: 700,
                          }}>
                            REQUIRED
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--color-text)',
                          wordBreak: 'break-word',
                        }}>
                          {col.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
                  Select a tab from the left navigation to inspect its column matrix.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
