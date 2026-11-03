'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Tag,
  Calendar,
  Layers,
  ArrowUpDown,
  History,
  ExternalLink,
  Code2,
  FileText,
} from 'lucide-react';
import { RELEASE_NOTES, ReleaseNoteItem } from '@/lib/releaseNotes';
import { APP_VERSION } from '@/lib/buildInfo';

interface AdminReleaseNotesTabProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function AdminReleaseNotesTab({
  onNavigateToTab,
}: AdminReleaseNotesTabProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [copiedVersion, setCopiedVersion] = useState<string | null>(null);

  const handleCopy = (text: string, identifier: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedVersion(identifier);
      setTimeout(() => setCopiedVersion(null), 2000);
    }
  };

  const handleCopyMarkdown = (note: ReleaseNoteItem) => {
    let md = `## ${note.version} — ${note.title} (${note.date})\n\n`;
    if (note.details) {
      md += `${note.details}\n\n`;
    }
    md += `### Highlights\n`;
    note.highlights.forEach((h) => {
      md += `- ${h}\n`;
    });
    handleCopy(md, `md-${note.version}`);
  };

  // Filter and sort releases
  const filteredNotes = useMemo(() => {
    let notes = [...RELEASE_NOTES];

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      notes = notes.filter((r) => {
        const matchesVersion = r.version.toLowerCase().includes(q);
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDate = r.date.toLowerCase().includes(q);
        const matchesHighlights = r.highlights.some((h) => h.toLowerCase().includes(q));
        const matchesDetails = (r.details || '').toLowerCase().includes(q);
        return matchesVersion || matchesTitle || matchesDate || matchesHighlights || matchesDetails;
      });
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      notes = notes.filter((r) => (r.category || 'enhancement').toUpperCase() === selectedCategory);
    }

    // Sort order
    if (sortOrder === 'asc') {
      notes.reverse();
    }

    return notes;
  }, [searchTerm, selectedCategory, sortOrder]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: RELEASE_NOTES.length,
      FEATURE: 0,
      ENHANCEMENT: 0,
      FIX: 0,
      MAJOR: 0,
    };
    RELEASE_NOTES.forEach((r) => {
      const cat = (r.category || 'enhancement').toUpperCase();
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Pulse Strip */}
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
            Sheet2Vow Release Notes & Platform Changelog
          </h2>
          <p style={{
            margin: '0.2rem 0 0 0',
            fontSize: '0.8rem',
            color: 'var(--color-muted)',
          }}>
            Official chronological log of production deployments, feature additions, security upgrades, and architectural enhancements.
          </p>
        </div>

        {/* Current Active Release Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.4rem 0.85rem',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          boxShadow: 'var(--box-shadow-subtle, 0 1px 3px rgba(0,0,0,0.05))',
        }}>
          <span style={{ color: 'var(--color-muted)' }}>CURRENT BUILD:</span>
          <strong style={{ color: 'var(--color-text)' }}>v{APP_VERSION}</strong>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>
            {RELEASE_NOTES.length} TOTAL RELEASES
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
        boxShadow: 'var(--box-shadow-subtle, 0 1px 3px rgba(0,0,0,0.05))',
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '400px' }}>
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
            placeholder="Search version (v1.23.0), features, notes..."
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

        {/* Category Filter Pills & Sort Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Category Pills */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: '20px',
            padding: '2px',
            border: '1px solid var(--color-border)',
          }}>
            {(['ALL', 'FEATURE', 'ENHANCEMENT', 'FIX'] as const).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--color-muted)',
                    fontSize: '0.7rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat} ({categoryCounts[cat] || 0})
                </button>
              );
            })}
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            title={`Sorting: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--border-radius-sm, 6px)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface, #ffffff)',
              color: 'var(--color-text)',
              fontSize: '0.725rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            <ArrowUpDown size={13} style={{ color: 'var(--color-primary)' }} />
            <span>{sortOrder === 'desc' ? 'NEWEST FIRST' : 'OLDEST FIRST'}</span>
          </button>
        </div>
      </div>

      {/* Release Notes Chronological List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredNotes.length === 0 ? (
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
            <History size={32} style={{ opacity: 0.35 }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No matching release notes found.</div>
            <p style={{ fontSize: '0.75rem', margin: 0, maxWidth: '380px' }}>
              Try adjusting your search query or reset the category filter above to see all product versions.
            </p>
          </div>
        ) : (
          filteredNotes.map((note, index) => {
            const isLatest = note.version === RELEASE_NOTES[0].version;
            const category = (note.category || 'enhancement').toUpperCase();

            // Category color tokens
            let catBg = 'rgba(79, 70, 229, 0.1)';
            let catBorder = 'rgba(79, 70, 229, 0.25)';
            let catColor = '#4F46E5';

            if (category === 'FEATURE') {
              catBg = 'rgba(16, 185, 129, 0.1)';
              catBorder = 'rgba(16, 185, 129, 0.25)';
              catColor = '#059669';
            } else if (category === 'FIX') {
              catBg = 'rgba(245, 158, 11, 0.1)';
              catBorder = 'rgba(245, 158, 11, 0.25)';
              catColor = '#D97706';
            } else if (category === 'MAJOR') {
              catBg = 'rgba(168, 85, 247, 0.1)';
              catBorder = 'rgba(168, 85, 247, 0.25)';
              catColor = '#7C3AED';
            }

            return (
              <div
                key={note.version}
                style={{
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: isLatest ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-lg, 12px)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: isLatest
                    ? '0 4px 14px rgba(79, 70, 229, 0.08)'
                    : 'var(--box-shadow-subtle, 0 1px 3px rgba(0,0,0,0.04))',
                  position: 'relative',
                }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Version Pill */}
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        fontWeight: 900,
                        color: 'var(--color-text)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}>
                        {note.version}
                      </span>

                      {/* Latest Tag */}
                      {isLatest && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                        }}>
                          LATEST PRODUCTION
                        </span>
                      )}

                      {/* Category Pill */}
                      <span style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        backgroundColor: catBg,
                        border: `1px solid ${catBorder}`,
                        color: catColor,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        {category}
                      </span>

                      {/* Date */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-muted)',
                      }}>
                        <Calendar size={12} />
                        <span>{note.date}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: 'var(--color-text)',
                      letterSpacing: '-0.01em',
                    }}>
                      {note.title}
                    </h3>
                  </div>

                  {/* Quick Copy Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(note.version, `ver-${note.version}`)}
                      title="Copy version tag"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--border-radius-sm, 6px)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        color: 'var(--color-text)',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedVersion === `ver-${note.version}` ? <Check size={12} style={{ color: '#059669' }} /> : <Copy size={12} />}
                      <span>{copiedVersion === `ver-${note.version}` ? 'COPIED' : 'TAG'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyMarkdown(note)}
                      title="Copy release entry in markdown"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--border-radius-sm, 6px)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        color: 'var(--color-text)',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedVersion === `md-${note.version}` ? <Check size={12} style={{ color: '#059669' }} /> : <FileText size={12} />}
                      <span>{copiedVersion === `md-${note.version}` ? 'COPIED MD' : 'MARKDOWN'}</span>
                    </button>
                  </div>
                </div>

                {/* Details paragraph (if provided) */}
                {note.details && (
                  <p style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: 'var(--color-muted)',
                    lineHeight: 1.5,
                  }}>
                    {note.details}
                  </p>
                )}

                {/* Highlights List */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                }}>
                  <div style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: 'var(--color-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '0.1rem',
                  }}>
                    RELEASE HIGHLIGHTS
                  </div>

                  {note.highlights.map((highlight, hIdx) => (
                    <div
                      key={hIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        lineHeight: 1.45,
                        color: 'var(--color-text)',
                      }}
                    >
                      <CheckCircle2
                        size={14}
                        style={{
                          color: '#059669',
                          flexShrink: 0,
                          marginTop: '3px',
                        }}
                      />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
