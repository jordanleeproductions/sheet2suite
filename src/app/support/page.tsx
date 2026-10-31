'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Zap,
  Users,
  Table,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  ArrowLeft,
  FileSpreadsheet,
  AlertCircle,
  Info,
  Lightbulb,
  ExternalLink,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { PageSearchInput } from '@/components/PageSearchInput';
import {
  SUPPORT_ARTICLES,
  SUPPORT_CATEGORIES,
  SupportCategory
} from '@/data/supportArticles';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SupportCategory>('all');
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  // Contact form state
  const [contactCategory, setContactCategory] = useState('Activation & Order');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [copiedDiagnostics, setCopiedDiagnostics] = useState(false);

  // Diagnostic telemetry
  const [telemetry, setTelemetry] = useState({
    userAgent: '',
    platform: '',
    screenResolution: '',
    timestamp: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTelemetry({
        userAgent: navigator.userAgent,
        platform: navigator.platform || 'Unknown',
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // Handle URL hash deep-linking on initial mount and hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setExpandedSlugs(prev => new Set(prev).add(hash));
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const toggleArticle = (slug: string) => {
    setExpandedSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  // Filter articles based on active category and keyword search
  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SUPPORT_ARTICLES.filter(article => {
      const matchesCategory =
        activeCategory === 'all' || article.category === activeCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      const titleMatch = article.title.toLowerCase().includes(q);
      const summaryMatch = article.summary.toLowerCase().includes(q);
      const keywordMatch = article.keywords.some(k => k.toLowerCase().includes(q));
      const contentMatch = article.content.some(c => c.toLowerCase().includes(q));

      return titleMatch || summaryMatch || keywordMatch || contentMatch;
    });
  }, [searchQuery, activeCategory]);

  // Compute live counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: SUPPORT_ARTICLES.length };
    SUPPORT_CATEGORIES.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = SUPPORT_ARTICLES.filter(a => a.category === cat.id).length;
      }
    });
    return counts;
  }, []);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap size={14} />;
      case 'Users':
        return <Users size={14} />;
      case 'Table':
        return <Table size={14} />;
      case 'ShieldCheck':
        return <ShieldCheck size={14} />;
      case 'HelpCircle':
        return <HelpCircle size={14} />;
      default:
        return <BookOpen size={14} />;
    }
  };

  const getCalloutIcon = (type: 'tip' | 'info' | 'warning') => {
    switch (type) {
      case 'tip':
        return <Lightbulb size={16} style={{ color: '#d97706', flexShrink: 0 }} />;
      case 'warning':
        return <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />;
      case 'info':
      default:
        return <Info size={16} style={{ color: '#2563eb', flexShrink: 0 }} />;
    }
  };

  // Generate mailto link with formatted diagnostic telemetry
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Support Inquiry] ${contactCategory}`);
    const bodyText = [
      `Category: ${contactCategory}`,
      contactEmail ? `User Email: ${contactEmail}` : '',
      '',
      '--- Issue Description ---',
      contactMessage || '(Please describe your question or issue here)',
      '',
      '--- System Diagnostics ---',
      `Timestamp: ${telemetry.timestamp || new Date().toISOString()}`,
      `User Agent: ${telemetry.userAgent}`,
      `Platform: ${telemetry.platform}`,
      `Screen: ${telemetry.screenResolution}`
    ]
      .filter(Boolean)
      .join('\n');

    const mailtoUrl = `mailto:support@sheet2suite.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyDiagnostics = () => {
    const diagnosticText = [
      `Timestamp: ${telemetry.timestamp}`,
      `User Agent: ${telemetry.userAgent}`,
      `Platform: ${telemetry.platform}`,
      `Screen: ${telemetry.screenResolution}`
    ].join('\n');

    navigator.clipboard.writeText(diagnosticText);
    setCopiedDiagnostics(true);
    setTimeout(() => setCopiedDiagnostics(false), 2500);
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar matching Privacy / Terms subpage pattern */}
      <div style={styles.navBar}>
        <Link href="/" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Sheet2Suite Hub</span>
        </Link>
        <div style={styles.navBadge}>
          <BookOpen size={14} style={{ color: 'var(--color-primary)' }} />
          <span>HELP & KNOWLEDGE BASE</span>
        </div>
      </div>

      {/* Main Header / Hero Section */}
      <header style={styles.header}>
        <div style={styles.categoryPill}>OFFICIAL USER GUIDES & HELP CENTER</div>
        <h1 style={styles.mainTitle}>Help Center & Knowledge Base</h1>
        <p style={styles.subTitle}>
          Everything you need to know about activating your order, connecting Google Drive, collaborating with your partner, and managing two-way spreadsheet sync.
        </p>

        {/* Search Bar */}
        <div style={styles.searchWrapper}>
          <PageSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search guides, topics, order activation, formulas..."
            size="lg"
            resultCount={searchQuery ? filteredArticles.length : undefined}
          />
        </div>
      </header>

      {/* Category Filter Pills matching Sheet2Suite filterBtn pattern */}
      <div style={styles.filterBar}>
        {SUPPORT_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                ...styles.filterBtn,
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                color: isActive ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                boxShadow: isActive ? 'var(--box-shadow-subtle)' : 'none',
              }}
            >
              {getCategoryIcon(cat.icon)}
              <span>{cat.label}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.675rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.22)' : 'var(--color-surface, #ffffff)',
                  border: isActive ? 'none' : '1px solid var(--color-border)',
                  color: isActive ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Articles List / Empty State */}
      <div style={styles.articlesList}>
        {filteredArticles.length === 0 ? (
          <div style={styles.emptyState}>
            <HelpCircle size={40} style={{ color: 'var(--color-muted)', marginBottom: '0.75rem' }} />
            <h3 style={styles.emptyTitle}>
              No guides found matching &quot;{searchQuery}&quot;
            </h3>
            <p style={styles.emptyDesc}>
              Try searching for broader keywords like &quot;order&quot;, &quot;sync&quot;, &quot;drive&quot;, or &quot;invite&quot;.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setSearchQuery('')}
                style={styles.primaryActionButton}
              >
                Clear Search
              </button>
              <a
                href="#contact-support"
                style={styles.secondaryActionButton}
              >
                Contact Support
              </a>
            </div>
          </div>
        ) : (
          filteredArticles.map(article => {
            const isExpanded = expandedSlugs.has(article.slug);
            return (
              <div
                key={article.id}
                id={article.slug}
                style={{
                  ...styles.articleCard,
                  borderColor: isExpanded ? 'var(--color-primary)' : 'var(--color-border)',
                }}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleArticle(article.slug)}
                  aria-expanded={isExpanded}
                  style={styles.articleHeaderBtn}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={styles.articleCategoryBadge}>
                        {article.categoryLabel}
                      </span>
                    </div>
                    <h2 style={styles.articleTitle}>
                      {article.title}
                    </h2>
                    <p style={styles.articleSummary}>
                      {article.summary}
                    </p>
                  </div>

                  <div style={{ color: 'var(--color-muted)', display: 'flex', alignItems: 'center', paddingLeft: '0.5rem' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div style={styles.articleBody}>
                    {article.content.map((paragraph, idx) => (
                      <p key={idx} style={styles.articleParagraph}>
                        {paragraph}
                      </p>
                    ))}

                    {article.callout && (
                      <div
                        style={{
                          ...styles.calloutCard,
                          backgroundColor:
                            article.callout.type === 'tip'
                              ? '#fefce8'
                              : article.callout.type === 'warning'
                              ? '#fef2f2'
                              : '#eff6ff',
                          borderColor:
                            article.callout.type === 'tip'
                              ? '#fef08a'
                              : article.callout.type === 'warning'
                              ? '#fecaca'
                              : '#bfdbfe',
                        }}
                      >
                        {getCalloutIcon(article.callout.type)}
                        <div
                          style={{
                            fontSize: '0.825rem',
                            lineHeight: 1.55,
                            color:
                              article.callout.type === 'tip'
                                ? '#854d0e'
                                : article.callout.type === 'warning'
                                ? '#991b1b'
                                : '#1e40af',
                          }}
                        >
                          {article.callout.text}
                        </div>
                      </div>
                    )}

                    <div style={styles.articleFooter}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                        Anchor: #{article.slug}
                      </span>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/support#${article.slug}`;
                          navigator.clipboard.writeText(url);
                        }}
                        style={styles.copyLinkBtn}
                      >
                        <ExternalLink size={12} />
                        <span>Copy Article Link</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* In-Page Diagnostic Contact Card matching masterPassBanner / sovereigntyCard */}
      <section id="contact-support" style={styles.contactSection}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={styles.contactBadge}>
            <Mail size={14} style={{ color: 'var(--color-primary)' }} />
            <span>DIRECT ASSISTANCE</span>
          </div>
          <h2 style={styles.contactTitle}>
            Still Need Help? Contact Engineering Support
          </h2>
          <p style={styles.contactSubtitle}>
            Have a question about your order, license, or spreadsheet? Send a direct note to our team with pre-filled diagnostics.
          </p>
        </div>

        <form onSubmit={handleSendEmail} style={styles.contactForm}>
          <div>
            <label style={styles.formLabel}>
              ISSUE CATEGORY *
            </label>
            <select
              value={contactCategory}
              onChange={e => setContactCategory(e.target.value)}
              style={styles.formInput}
            >
              <option value="Activation & Order">Activation & Order Receipt</option>
              <option value="Google Drive & Sync">Google Drive & Sync Health</option>
              <option value="Sharing & Collaborators">Sharing & Partner Collaboration</option>
              <option value="Feature Request">Feature Request or Feedback</option>
              <option value="Other Question">Other General Inquiry</option>
            </select>
          </div>

          <div>
            <label style={styles.formLabel}>
              YOUR EMAIL ADDRESS (OPTIONAL)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              style={styles.formInput}
            >
            </input>
          </div>

          <div>
            <label style={styles.formLabel}>
              DESCRIBE YOUR QUESTION OR ISSUE *
            </label>
            <textarea
              rows={4}
              required
              value={contactMessage}
              onChange={e => setContactMessage(e.target.value)}
              placeholder="Include your 10-digit order number or describe what you are trying to accomplish..."
              style={{ ...styles.formInput, height: 'auto', minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          {/* Diagnostic Telemetry Box */}
          <div style={styles.telemetryBox}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-text)' }}>AUTO-ATTACHED DIAGNOSTICS</span>
              <button
                type="button"
                onClick={handleCopyDiagnostics}
                style={styles.copyTelemetryBtn}
              >
                {copiedDiagnostics ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedDiagnostics ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <div style={{ fontSize: '0.685rem', color: 'var(--color-muted)', wordBreak: 'break-all' }}>
              Browser: {telemetry.userAgent || 'Detecting...'}
            </div>
            <div style={{ fontSize: '0.685rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
              Platform: {telemetry.platform} • Screen: {telemetry.screenResolution}
            </div>
          </div>

          <button
            type="submit"
            style={styles.submitBtn}
          >
            <Send size={15} />
            <span>OPEN EMAIL CLIENT (SUPPORT@SHEET2SUITE.COM)</span>
          </button>
        </form>
      </section>

      {/* Footer matching standard Sheet2Suite subpages */}
      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Sheet2Suite Platform • Built for Google Sheets Purists</p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/activate" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Activation Portal</Link>
          <span>•</span>
          <Link href="/vow" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Sheet2Vow Application</Link>
          <span>•</span>
          <Link href="/privacy" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1.5rem 1.5rem 4rem 1.5rem',
  },
  navBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--color-border)',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontWeight: 700,
  },
  navBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    padding: '0.25rem 0.75rem',
    color: 'var(--color-text)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  categoryPill: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 800,
    color: 'var(--color-primary)',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  mainTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '2.4rem',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    color: 'var(--color-text)',
    margin: '0 0 0.75rem 0',
    lineHeight: 1.15,
  },
  subTitle: {
    fontSize: '1rem',
    color: 'var(--color-muted)',
    maxWidth: '720px',
    margin: '0 auto 2rem auto',
    lineHeight: 1.55,
  },
  searchWrapper: {
    maxWidth: '640px',
    margin: '0 auto',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.725rem',
    fontWeight: 700,
    border: '1px solid',
    borderRadius: '20px',
    padding: '0.4rem 0.95rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    transition: 'var(--transition-smooth, all 0.2s ease)',
  },
  articlesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '860px',
    margin: '0 auto',
  },
  articleCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md, 8px)',
    boxShadow: 'var(--box-shadow-subtle)',
    overflow: 'hidden',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  articleHeaderBtn: {
    width: '100%',
    textAlign: 'left',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
  },
  articleCategoryBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 800,
    color: 'var(--color-primary)',
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    padding: '0.15rem 0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  articleTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.15rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    letterSpacing: '-0.02em',
    margin: '0.35rem 0 0.25rem 0',
  },
  articleSummary: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    lineHeight: 1.45,
    margin: 0,
  },
  articleBody: {
    padding: '0.75rem 1.5rem 1.5rem 1.5rem',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
  },
  articleParagraph: {
    fontSize: '0.9rem',
    color: 'var(--color-text)',
    lineHeight: 1.6,
    margin: 0,
  },
  calloutCard: {
    border: '1px solid',
    borderRadius: 'var(--border-radius-sm, 6px)',
    padding: '0.85rem 1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginTop: '0.35rem',
  },
  articleFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '0.75rem',
    borderTop: '1px solid var(--color-border)',
    marginTop: '0.5rem',
  },
  copyLinkBtn: {
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '2px dashed var(--color-border)',
    borderRadius: 'var(--border-radius-md, 8px)',
  },
  emptyTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    margin: '0 0 0.5rem 0',
  },
  emptyDesc: {
    fontSize: '0.875rem',
    color: 'var(--color-muted)',
    maxWidth: '480px',
    margin: '0 auto 1.5rem auto',
    lineHeight: 1.5,
  },
  primaryActionButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.775rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm, 6px)',
    padding: '0.6rem 1.15rem',
    cursor: 'pointer',
  },
  secondaryActionButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.775rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm, 6px)',
    padding: '0.6rem 1.15rem',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  },
  contactSection: {
    backgroundColor: 'var(--color-bg-subtle)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md, 8px)',
    padding: '2.5rem 1.5rem',
    marginTop: '3.5rem',
    maxWidth: '860px',
    margin: '3.5rem auto 0 auto',
  },
  contactBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    padding: '0.25rem 0.75rem',
    color: 'var(--color-primary)',
    marginBottom: '0.6rem',
  },
  contactTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    letterSpacing: '-0.02em',
    margin: '0 0 0.5rem 0',
  },
  contactSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--color-muted)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.5,
  },
  contactForm: {
    maxWidth: '600px',
    margin: '1.75rem auto 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text)',
    marginBottom: '0.4rem',
    letterSpacing: '0.04em',
  },
  formInput: {
    width: '100%',
    padding: '0.75rem 0.85rem',
    minHeight: '48px',
    borderRadius: 'var(--border-radius-sm, 6px)',
    border: '1.5px solid var(--color-border)',
    fontSize: '0.925rem',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface, #ffffff)',
    outline: 'none',
  },
  telemetryBox: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm, 6px)',
    padding: '0.75rem 1rem',
    fontFamily: 'var(--font-mono)',
  },
  copyTelemetryBtn: {
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 800,
    color: 'var(--color-primary)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: 0,
  },
  submitBtn: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    padding: '0.875rem 1.5rem',
    minHeight: '48px',
    borderRadius: 'var(--border-radius-sm, 6px)',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'var(--transition-smooth, all 0.2s ease)',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  footer: {
    marginTop: '4rem',
    paddingTop: '2rem',
    borderTop: '1px solid var(--color-border)',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
};
