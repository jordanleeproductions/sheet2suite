'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Tag,
  Calendar,
  Search,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  FileCode2,
  Box,
} from 'lucide-react';
import {
  getReleaseNotesByProduct,
  ReleaseNoteItem,
  SUITE_RELEASE_NOTES,
  VOW_RELEASE_NOTES,
  VAULT_RELEASE_NOTES,
} from '@/lib/releaseNotes';
import {
  PRODUCT_VERSIONS,
  SuiteProductId,
  getProductBuildInfo,
} from '@/lib/buildInfo';

interface AdminReleaseNotesTabProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function AdminReleaseNotesTab({}: AdminReleaseNotesTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<SuiteProductId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'major' | 'feature' | 'enhancement' | 'fix'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedVersion, setCopiedVersion] = useState<string | null>(null);

  const rawNotes = useMemo(() => {
    return getReleaseNotesByProduct(selectedProduct);
  }, [selectedProduct]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rawNotes.filter((note: ReleaseNoteItem) => {
      if (selectedCategory !== 'all' && note.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      const inVersion = note.version.toLowerCase().includes(q);
      const inTitle = note.title.toLowerCase().includes(q);
      const inDetails = (note.details || '').toLowerCase().includes(q);
      const inHighlights = note.highlights.some((h: string) => h.toLowerCase().includes(q));
      return inVersion || inTitle || inDetails || inHighlights;
    });
  }, [rawNotes, selectedCategory, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: rawNotes.length,
      major: rawNotes.filter((n: ReleaseNoteItem) => n.category === 'major').length,
      feature: rawNotes.filter((n: ReleaseNoteItem) => n.category === 'feature').length,
      enhancement: rawNotes.filter((n: ReleaseNoteItem) => n.category === 'enhancement').length,
      fix: rawNotes.filter((n: ReleaseNoteItem) => n.category === 'fix').length,
    };
  }, [rawNotes]);

  const handleCopyNoteMarkdown = (note: ReleaseNoteItem) => {
    const pInfo = getProductBuildInfo(note.product || 'vow');
    const lines = [
      `## [${pInfo.name}] ${note.version} — ${note.title} (${note.date})`,
      note.details ? `\n${note.details}\n` : '',
      ...note.highlights.map((h: string) => `- ${h}`),
    ].filter(Boolean);

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopiedVersion(`${note.product || 'vow'}-${note.version}`);
      setTimeout(() => setCopiedVersion(null), 2000);
    }
  };

  const getCategoryMeta = (category?: ReleaseNoteItem['category']) => {
    switch (category) {
      case 'major':
        return {
          label: 'Major Release',
          icon: <Sparkles size={13} />,
          color: '#7C3AED',
          bg: 'rgba(124, 58, 237, 0.1)',
          border: 'rgba(124, 58, 237, 0.28)',
        };
      case 'feature':
        return {
          label: 'New Feature',
          icon: <Layers size={13} />,
          color: '#059669',
          bg: 'rgba(5, 150, 105, 0.1)',
          border: 'rgba(5, 150, 105, 0.28)',
        };
      case 'enhancement':
        return {
          label: 'Enhancement',
          icon: <Zap size={13} />,
          color: '#2563EB',
          bg: 'rgba(37, 99, 235, 0.1)',
          border: 'rgba(37, 99, 235, 0.28)',
        };
      case 'fix':
        return {
          label: 'Fix & Security',
          icon: <ShieldCheck size={13} />,
          color: '#D97706',
          bg: 'rgba(217, 119, 6, 0.1)',
          border: 'rgba(217, 119, 6, 0.28)',
        };
      default:
        return {
          label: 'Update',
          icon: <CheckCircle2 size={13} />,
          color: '#475569',
          bg: 'rgba(71, 85, 105, 0.1)',
          border: 'rgba(71, 85, 105, 0.25)',
        };
    }
  };

  const allProductsList = Object.values(PRODUCT_VERSIONS);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner: Multi-Product Build Version Matrix */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '11px',
                backgroundColor: 'rgba(79, 70, 229, 0.12)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Sheet2Suite Ecosystem Release Notes & Version Registry
                </h2>
                <span
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(79, 70, 229, 0.14)',
                    color: '#4F46E5',
                    border: '1px solid rgba(79, 70, 229, 0.35)',
                  }}
                >
                  ISOLATED PRODUCT VERSIONS
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: 'var(--color-muted)' }}>
                Platform & Admin updates bump <strong>Sheet2Suite</strong> independently without altering <strong>Sheet2Vow</strong> or other suite product versions.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-technical-mono, monospace)',
              color: 'var(--color-muted)',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.7rem',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
              }}
            >
              <FileCode2 size={14} style={{ color: '#4F46E5' }} />
              <span>npm run bump:suite:patch | bump:vow:patch</span>
            </span>
          </div>
        </div>

        {/* Product Version Cards Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
            gap: '0.65rem',
          }}
        >
          {allProductsList.map((prod) => {
            const isSelected = selectedProduct === prod.id;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => setSelectedProduct(isSelected ? 'all' : prod.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'var(--color-bg-subtle)' : 'var(--color-surface, #ffffff)',
                  border: isSelected
                    ? `2px solid ${prod.accentColor}`
                    : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: 'var(--color-text)',
                    }}
                  >
                    {prod.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '999px',
                      backgroundColor: `${prod.accentColor}18`,
                      color: prod.accentColor,
                      border: `1px solid ${prod.accentColor}40`,
                    }}
                  >
                    {prod.version}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--color-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {prod.tagline}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Filter & Category Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Row 1: Product Scope Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(
              [
                { id: 'all', label: 'All Products', count: SUITE_RELEASE_NOTES.length + VOW_RELEASE_NOTES.length + VAULT_RELEASE_NOTES.length, color: '#475569' },
                { id: 'suite', label: `Sheet2Suite (${PRODUCT_VERSIONS.suite.version})`, count: SUITE_RELEASE_NOTES.length, color: '#4F46E5' },
                { id: 'vow', label: `Sheet2Vow (${PRODUCT_VERSIONS.vow.version})`, count: VOW_RELEASE_NOTES.length, color: '#059669' },
                { id: 'vault', label: `Sheet2Vault (${PRODUCT_VERSIONS.vault.version})`, count: VAULT_RELEASE_NOTES.length, color: '#D97706' },
              ] as const
            ).map((tab) => {
              const active = selectedProduct === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedProduct(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.42rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: active ? 700 : 600,
                    border: active ? `1.5px solid ${tab.color}` : '1px solid var(--color-border)',
                    backgroundColor: active ? tab.color : 'var(--color-bg-subtle)',
                    color: active ? '#ffffff' : 'var(--color-text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box size={13} />
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontSize: '0.68rem',
                      padding: '0px 5px',
                      borderRadius: '999px',
                      backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'var(--color-surface)',
                      color: active ? '#ffffff' : 'var(--color-muted)',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '340px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter release notes by keyword or version..."
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-subtle)',
                color: 'var(--color-text)',
                fontSize: '0.8125rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px solid var(--color-border)' }}>
          {(
            [
              { id: 'all', label: 'All Categories', count: counts.all },
              { id: 'feature', label: 'Features', count: counts.feature },
              { id: 'enhancement', label: 'Enhancements', count: counts.enhancement },
              { id: 'fix', label: 'Fixes & Security', count: counts.fix },
              { id: 'major', label: 'Major', count: counts.major },
            ] as const
          ).map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.32rem 0.7rem',
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  fontWeight: active ? 700 : 500,
                  border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: active ? 'var(--color-primary)' : 'transparent',
                  color: active ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.66rem',
                    padding: '0px 5px',
                    borderRadius: '999px',
                    backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'var(--color-bg-subtle)',
                    color: active ? '#ffffff' : 'var(--color-muted)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Release Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {filteredNotes.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '2.5rem',
              textAlign: 'center',
              color: 'var(--color-muted)',
              fontSize: '0.875rem',
            }}
          >
            No release notes match your current product or filter criteria.
          </div>
        ) : (
          filteredNotes.map((note: ReleaseNoteItem) => {
            const cat = getCategoryMeta(note.category);
            const prodInfo = getProductBuildInfo(note.product || 'vow');
            const isCurrentProductVersion = note.version === prodInfo.version;
            const copyKey = `${note.product || 'vow'}-${note.version}`;
            const isCopied = copiedVersion === copyKey;

            return (
              <div
                key={copyKey}
                style={{
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: isCurrentProductVersion
                    ? `1.5px solid ${prodInfo.accentColor}`
                    : '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.7rem',
                  boxShadow: isCurrentProductVersion ? `0 4px 16px ${prodInfo.accentColor}14` : 'none',
                }}
              >
                {/* Header Meta Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Product Badge */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '0.22rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: `${prodInfo.accentColor}15`,
                        color: prodInfo.accentColor,
                        border: `1px solid ${prodInfo.accentColor}40`,
                      }}
                    >
                      <Box size={11} />
                      {prodInfo.name}
                    </span>

                    {/* Version Tag */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontFamily: 'var(--font-technical-mono, monospace)',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <Tag size={12} style={{ color: prodInfo.accentColor }} />
                      {note.version}
                    </span>

                    {isCurrentProductVersion && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '0.18rem 0.55rem',
                          borderRadius: '999px',
                          backgroundColor: `${prodInfo.accentColor}18`,
                          color: prodInfo.accentColor,
                          border: `1px solid ${prodInfo.accentColor}45`,
                        }}
                      >
                        Active {prodInfo.shortName} Build
                      </span>
                    )}

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.18rem 0.55rem',
                        borderRadius: '999px',
                        backgroundColor: cat.bg,
                        color: cat.color,
                        border: `1px solid ${cat.border}`,
                      }}
                    >
                      {cat.icon}
                      {cat.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.74rem',
                        color: 'var(--color-muted)',
                        fontFamily: 'var(--font-technical-mono, monospace)',
                      }}
                    >
                      <Calendar size={12} />
                      {note.date}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyNoteMarkdown(note)}
                      title="Copy release note as Markdown"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.28rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        color: isCopied ? '#059669' : 'var(--color-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? 'Copied' : 'Copy MD'}</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.025rem',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    lineHeight: 1.35,
                  }}
                >
                  {note.title}
                </h3>

                {/* Details */}
                {note.details && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.84rem',
                      color: 'var(--color-muted)',
                      lineHeight: 1.5,
                    }}
                  >
                    {note.details}
                  </p>
                )}

                {/* Highlights */}
                <ul
                  style={{
                    margin: '0.15rem 0 0 0',
                    paddingLeft: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  {note.highlights.map((bullet: string, bIdx: number) => (
                    <li
                      key={bIdx}
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-text)',
                        lineHeight: 1.48,
                      }}
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
