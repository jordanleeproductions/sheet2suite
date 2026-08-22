'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Zap,
  Key,
  Heart,
  Home,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Printer,
  Lock,
  CreditCard,
  Unlock,
  Hammer,
  Building2,
  TrendingUp,
  Layers,
  Check,
  ExternalLink,
  Gift,
  Wrench,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { useSheet2Theme } from '@/lib/core/theme/ThemeProvider';

export default function Sheet2SuiteParentHub() {
  const { styleTheme, theme } = useSheet2Theme();
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'beta' | 'roadmap'>('all');

  const products = [
    {
      id: 'vow',
      name: 'Sheet2Vow',
      tagline: 'Digital Wedding Planning Suite',
      status: 'available',
      version: 'v1.0 Live',
      icon: Heart,
      iconColor: '#e11d48',
      desc: 'Complete wedding coordination engine: Guest list RSVP tracker, seating charts, budget ledger, day-of timeline, vendor directory, music playlist, and Canva place card exporter.',
      features: [
        'Relational Guest Registry & Catering Sync',
        'Trigonometric Visual Table Seating Canvas',
        'Itemized Budget Ledger & Payment Badges',
        'Tokenized Vendor & DJ Share Portals',
        'Canva Bulk Merge & Print PDF Studio',
      ],
      primaryCtaText: 'LAUNCH SHEET2VOW',
      primaryHref: '/vow',
      secondaryCtaText: 'Activate License',
      secondaryHref: '/activate?product=vow',
    },
    {
      id: 'build',
      name: 'Sheet2Build',
      tagline: 'Construction, Renovation & Contractor Ledger',
      status: 'beta',
      version: 'v0.8 Beta Access',
      icon: Building2,
      iconColor: '#f59e0b',
      desc: 'Professional construction and home renovation management canvas: Contractor bids, change order logs, payment milestone tracking, material expense ledger, and site timeline.',
      features: [
        'Trade Category & Subcontractor Directory',
        'Change Order Log & Budget Variance Alerts',
        'Payment Milestone Draw Schedule',
        'Material & Supply Chain Expense Tracker',
        'Gantt Project Timeline & Site Photos',
      ],
      primaryCtaText: 'LAUNCH SHEET2BUILD',
      primaryHref: '/activate?product=build',
      secondaryCtaText: 'Quick Setup',
      secondaryHref: '/activate?product=build&step=guided',
    },
    {
      id: 'finance',
      name: 'Sheet2Finance',
      tagline: 'Personal Finance & Cashflow Engine',
      status: 'beta',
      version: 'v0.8 Beta Access',
      icon: TrendingUp,
      iconColor: '#10b981',
      desc: 'Zero-based monthly budget ledger, cashflow forecasting, debt payoff snowball calculator, asset allocation, and personal net worth tracker.',
      features: [
        'Zero-Based Monthly Income & Expense Ledger',
        'Debt Snowball & Avalanche Payoff Calculator',
        '12-Month Rolling Cashflow Forecast',
        'Asset Allocation & Net Worth Meter',
        'Emergency Fund Savings Goal Ticker',
      ],
      primaryCtaText: 'LAUNCH SHEET2FINANCE',
      primaryHref: '/activate?product=finance',
      secondaryCtaText: 'Quick Setup',
      secondaryHref: '/activate?product=finance&step=guided',
    },
    {
      id: 'home',
      name: 'Sheet2Home',
      tagline: 'Property Inventory & Maintenance System',
      status: 'roadmap',
      version: 'Coming Q4 2026',
      icon: Home,
      iconColor: '#8b5cf6',
      desc: 'Personal property, valuables, and electronics inventory system for home management, warranty tracking, insurance claims, and recurring home maintenance schedules.',
      features: [
        'Itemized Valuables & Serial Number Vault',
        'Warranty Expiry & Receipt Photo Tracker',
        'Seasonal Home Maintenance Schedule',
        'Contractor & Trade Service Directory',
      ],
      primaryCtaText: 'COMING SOON',
      primaryHref: '',
      disabled: true,
    },
    {
      id: 'harvest',
      name: 'Sheet2Harvest',
      tagline: "Gardener's Seasonal Log Book",
      status: 'roadmap',
      version: 'Coming Q1 2027',
      icon: Sparkles,
      iconColor: '#06b6d4',
      desc: "A gardener's seasonal logbook for planting schedules, soil health tracking, crop rotation planning, pest management, and harvest yield analytics.",
      features: [
        'Planting Calendar & Seed Packet Database',
        'Soil Health & Crop Rotation Planner',
        'Pest & Fertilizer Application Journal',
        'Harvest Weight & Yield Analytics',
      ],
      primaryCtaText: 'COMING SOON',
      primaryHref: '',
      disabled: true,
    },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'available') return p.status === 'available';
    if (activeFilter === 'beta') return p.status === 'beta';
    if (activeFilter === 'roadmap') return p.status === 'roadmap';
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Top Suite Bar */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <FileSpreadsheet size={34} style={{ color: 'var(--color-primary)' }} />
          <div>
            <h1 style={styles.brandTitle}>Sheet2Suite</h1>
            <p style={styles.brandSubtitle}>The Digital Canvas Suite for Google Sheets Purists</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/activate" style={styles.activateLinkBtn}>
            <Key size={16} />
            <span>ACTIVATION PORTAL</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroBadge}>
          <Sparkles size={14} style={{ color: 'var(--color-gold, #f59e0b)' }} />
          <span>MULTI-PRODUCT DIGITAL CANVAS ECOSYSTEM</span>
        </div>
        <h2 style={styles.heroTitle}>
          Turn Plain Spreadsheets Into <span style={{ color: 'var(--color-primary)' }}>High-Performance Digital Apps</span>.
        </h2>
        <p style={styles.heroDesc}>
          Sheet2Suite converts Google Spreadsheets into ultra-fast, beautiful web applications for wedding planning, construction & renovation management, personal cashflow, and property logs. 100% private to your personal Google Drive with zero monthly subscription fees.
        </p>

        <div style={styles.heroCtaGroup}>
          <Link href="/vow" style={styles.primaryCta}>
            <Heart size={18} />
            <span>LAUNCH SHEET2VOW (WEDDING)</span>
            <ArrowRight size={18} />
          </Link>

          <Link href="/activate?product=build" style={styles.secondaryCta}>
            <Building2 size={18} style={{ color: '#f59e0b' }} />
            <span>TRY SHEET2BUILD (CONSTRUCTION)</span>
          </Link>

          <Link href="/activate?product=finance" style={styles.secondaryCta}>
            <TrendingUp size={18} style={{ color: '#10b981' }} />
            <span>TRY SHEET2FINANCE (BUDGET)</span>
          </Link>
        </div>
      </section>

      {/* Master Pass Bundle Banner */}
      <section style={styles.masterPassBanner}>
        <div style={styles.masterPassContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Layers size={22} style={{ color: 'var(--color-primary)' }} />
            <span style={styles.masterPassBadge}>SHEET2SUITE MASTER PASS</span>
          </div>
          <h3 style={styles.masterPassTitle}>One Master License. Every Current & Future Application.</h3>
          <p style={styles.masterPassDesc}>
            Purchasing a Sheet2Suite Master License gives you immediate access to all existing applications (*Sheet2Vow*, *Sheet2Build*, *Sheet2Finance*) plus all upcoming products (*Sheet2Home*, *Sheet2Harvest*) as they launch — backed by lifetime platform updates and zero recurring fees.
          </p>
        </div>
        <Link href="/activate" style={styles.masterPassBtn}>
          <Key size={18} />
          <span>ENTER ACTIVATION CODE</span>
        </Link>
      </section>

      {/* Product Category Filter Tabs */}
      <section style={styles.showcaseSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>SHEET2SUITE PRODUCT FAMILY</h3>
          <p style={styles.sectionDesc}>Explore our ecosystem of specialized spreadsheet applications.</p>
        </div>

        {/* Filter Bar */}
        <div style={styles.filterBar}>
          {[
            { id: 'all', label: 'ALL PRODUCTS', count: products.length },
            { id: 'available', label: 'LIVE V1.0', count: products.filter(p => p.status === 'available').length },
            { id: 'beta', label: 'BETA ACCESS', count: products.filter(p => p.status === 'beta').length },
            { id: 'roadmap', label: 'ROADMAP', count: products.filter(p => p.status === 'roadmap').length },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                style={{
                  ...styles.filterBtn,
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                  color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  fontWeight: isActive ? 800 : 600,
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'var(--color-border)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div style={styles.productGrid}>
          {filteredProducts.map((p) => {
            const IconComp = p.icon;
            const isLive = p.status === 'available';
            const isBeta = p.status === 'beta';

            return (
              <div
                key={p.id}
                style={{
                  ...styles.productCard,
                  borderColor: isLive ? 'var(--color-primary)' : isBeta ? 'var(--color-gold, #f59e0b)' : 'var(--color-border)',
                }}
              >
                {/* Header */}
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.iconCircle, border: `1px solid ${p.iconColor}` }}>
                    <IconComp size={24} style={{ color: p.iconColor }} />
                  </div>
                  <span
                    style={{
                      ...styles.badgeBase,
                      backgroundColor: isLive ? 'var(--color-primary)' : isBeta ? 'var(--color-gold, #f59e0b)' : 'var(--color-bg-subtle)',
                      color: isLive ? 'var(--color-on-primary)' : isBeta ? '#000000' : 'var(--color-muted)',
                      border: isLive || isBeta ? 'none' : '1px solid var(--color-border)',
                    }}
                  >
                    {p.version.toUpperCase()}
                  </span>
                </div>

                <h4 style={styles.cardTitle}>{p.name}</h4>
                <span style={styles.cardTagline}>{p.tagline}</span>
                <p style={styles.cardDesc}>{p.desc}</p>

                {/* Features List */}
                <div style={styles.featuresList}>
                  {p.features.map((feat, idx) => (
                    <div key={idx} style={styles.featureItem}>
                      <Check size={14} style={{ color: p.iconColor, flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {p.disabled ? (
                    <button disabled style={styles.cardBtnDisabled}>
                      <span>{p.primaryCtaText}</span>
                    </button>
                  ) : (
                    <>
                      <Link href={p.primaryHref} style={styles.cardBtnPrimary}>
                        <span>{p.primaryCtaText}</span>
                        <ArrowRight size={16} />
                      </Link>
                      {p.secondaryHref && (
                        <Link href={p.secondaryHref} style={styles.cardBtnSecondary}>
                          <span>{p.secondaryCtaText}</span>
                          <ChevronRight size={14} />
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Guarantees / Value Pillars */}
      <section style={styles.pillarsSection}>
        <div style={styles.pillarItem}>
          <ShieldCheck size={28} style={{ color: 'var(--color-primary)' }} />
          <h5 style={styles.pillarTitle}>100% Private to Drive</h5>
          <p style={styles.pillarDesc}>Your financial, wedding, and construction data lives strictly inside your personal Google Drive account. We never store your personal records on central servers.</p>
        </div>

        <div style={styles.pillarItem}>
          <HardDrive size={28} style={{ color: 'var(--color-primary)' }} />
          <h5 style={styles.pillarTitle}>Spreadsheet Purist Format</h5>
          <p style={styles.pillarDesc}>Every app is backed by standard Google Sheets (.xlsx format) that you can inspect, export, print, or edit manually in Google Sheets at any time.</p>
        </div>

        <div style={styles.pillarItem}>
          <Printer size={28} style={{ color: 'var(--color-primary)' }} />
          <h5 style={styles.pillarTitle}>Print Studio & Canva Ready</h5>
          <p style={styles.pillarDesc}>Built-in Canva bulk merge CSV exporter and print studio to create gorgeous place cards, schedules, rosters, and vendor directory contact sheets.</p>
        </div>
      </section>

      {/* Data Sovereignty, Privacy & Zero Subscriptions Section */}
      <section style={styles.sovereigntySection}>
        <div style={styles.sovereigntyHeader}>
          <div style={styles.sovereigntyBadge}>
            <Lock size={14} style={{ color: 'var(--color-primary)' }} />
            <span>DATA SOVEREIGNTY GUARANTEE</span>
          </div>
          <h3 style={styles.sovereigntyTitle}>Your Data Stays Yours. Forever.</h3>
          <p style={styles.sovereigntySubtitle}>
            Unlike typical SaaS tools that hold your personal records hostage behind monthly paywalls, Sheet2Suite is engineered around complete data ownership.
          </p>
        </div>

        <div style={styles.sovereigntyGrid}>
          <div style={styles.sovereigntyCard}>
            <div style={styles.sovereigntyIconWrapper}>
              <Lock size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h4 style={styles.sovereigntyCardTitle}>100% Data Sovereignty</h4>
            <p style={styles.sovereigntyCardDesc}>
              Your guest lists, budgets, inventory items, and logs live exclusively inside <strong>your personal Google Drive account</strong> using isolated <code>drive.file</code> scope permissions. We never store, process, or sell your personal records on third-party servers.
            </p>
          </div>

          <div style={styles.sovereigntyCard}>
            <div style={styles.sovereigntyIconWrapper}>
              <CreditCard size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h4 style={styles.sovereigntyCardTitle}>Zero Monthly Subscriptions</h4>
            <p style={styles.sovereigntyCardDesc}>
              Say goodbye to monthly subscription fatigue ($15–$50/month). You pay <strong>one time</strong> on Etsy or Lemon Squeezy and own your application license for life with free lifetime platform updates.
            </p>
          </div>

          <div style={styles.sovereigntyCard}>
            <div style={styles.sovereigntyIconWrapper}>
              <Unlock size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h4 style={styles.sovereigntyCardTitle}>Zero Vendor Lock-In</h4>
            <p style={styles.sovereigntyCardDesc}>
              Because your underlying database is standard Google Sheets (<code>.xlsx</code> format), you can inspect, export, or open your files in Microsoft Excel or Apple Numbers at any second — even if you stop using Sheet2Suite.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>© 2026 Sheet2Suite Platform • Built for Google Sheets Purists</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'center' }}>
          <Link href="/activate" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Activation Portal</Link>
          <span>•</span>
          <Link href="/vow" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Sheet2Vow Application</Link>
          <span>•</span>
          <Link href="/admin" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Admin DB</Link>
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
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '1.25rem',
    borderBottom: '2px solid var(--color-primary)',
    marginBottom: '2.5rem',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  brandTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.6rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'var(--color-primary)',
    margin: 0,
    lineHeight: 1.1,
  },
  brandSubtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    color: 'var(--color-muted)',
    margin: '2px 0 0 0',
  },
  activateLinkBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    textDecoration: 'none',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2.5rem 1.5rem 3.5rem 1.5rem',
    backgroundColor: 'var(--color-surface, #fff)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--box-shadow-subtle)',
    marginBottom: '2rem',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    padding: '0.35rem 0.85rem',
    marginBottom: '1.25rem',
  },
  heroTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '2.4rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.2,
    maxWidth: '820px',
    margin: '0 0 1rem 0',
  },
  heroDesc: {
    fontSize: '1rem',
    color: 'var(--color-muted)',
    maxWidth: '720px',
    lineHeight: 1.55,
    margin: '0 0 2rem 0',
  },
  heroCtaGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryCta: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.875rem 1.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.625rem',
    textDecoration: 'none',
    boxShadow: 'var(--box-shadow-hover)',
  },
  secondaryCta: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.875rem 1.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  masterPassBanner: {
    backgroundColor: 'var(--color-bg-subtle)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '2rem',
    marginBottom: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  masterPassContent: {
    flex: '1 1 500px',
  },
  masterPassBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 800,
    color: 'var(--color-primary)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  masterPassTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    margin: '0 0 0.5rem 0',
  },
  masterPassDesc: {
    fontSize: '0.875rem',
    color: 'var(--color-muted)',
    lineHeight: 1.5,
    margin: 0,
  },
  masterPassBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  showcaseSection: {
    marginBottom: '3.5rem',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 800,
    color: 'var(--color-muted)',
    letterSpacing: '1px',
    margin: '0 0 0.25rem 0',
  },
  sectionDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--color-text)',
    margin: 0,
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.725rem',
    border: '1px solid',
    borderRadius: '20px',
    padding: '0.4rem 0.85rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'var(--transition-smooth)',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  productCard: {
    backgroundColor: 'var(--color-surface, #fff)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: 'var(--box-shadow-subtle)',
    transition: 'var(--transition-smooth)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-bg-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBase: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 800,
    padding: '0.25rem 0.65rem',
    borderRadius: 'var(--border-radius-sm)',
    letterSpacing: '0.04em',
  },
  cardTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.45rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'var(--color-text)',
    margin: 0,
  },
  cardTagline: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.725rem',
    color: 'var(--color-muted)',
    fontWeight: 700,
    marginTop: '-0.4rem',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    lineHeight: 1.5,
    margin: '0.25rem 0 0.5rem 0',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    margin: '0.5rem 0 1rem 0',
    backgroundColor: 'var(--color-bg-subtle)',
    padding: '0.85rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-border)',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
  },
  cardBtnPrimary: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.775rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  cardBtnSecondary: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.725rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    textDecoration: 'none',
  },
  cardBtnDisabled: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.725rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1rem',
    cursor: 'not-allowed',
    textAlign: 'center',
    width: '100%',
  },
  pillarsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    padding: '2rem',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--color-border)',
    marginBottom: '3rem',
  },
  pillarItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  pillarTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    margin: 0,
  },
  pillarDesc: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    lineHeight: 1.45,
    margin: 0,
  },
  sovereigntySection: {
    backgroundColor: 'var(--color-surface, #fff)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '2.5rem 2rem',
    marginBottom: '3.5rem',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  sovereigntyHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sovereigntyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
    borderRadius: '20px',
    padding: '0.3rem 0.75rem',
    marginBottom: '0.75rem',
  },
  sovereigntyTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    margin: '0 0 0.5rem 0',
  },
  sovereigntySubtitle: {
    fontSize: '0.9rem',
    color: 'var(--color-muted)',
    maxWidth: '620px',
    lineHeight: 1.5,
    margin: 0,
  },
  sovereigntyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem',
  },
  sovereigntyCard: {
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sovereigntyIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-surface, #fff)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.25rem',
  },
  sovereigntyCardTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.15rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    margin: 0,
  },
  sovereigntyCardDesc: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    lineHeight: 1.45,
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    borderTop: '1px solid var(--color-border)',
    paddingTop: '1.5rem',
  }
};
