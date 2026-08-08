'use client';

import React from 'react';
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
  Printer
} from 'lucide-react';
import { useSheet2Theme } from '@/lib/core/theme/ThemeProvider';

export default function Sheet2SuiteParentHub() {
  const { styleTheme, theme } = useSheet2Theme();

  return (
    <div style={styles.container}>
      {/* Top Suite Bar */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <FileSpreadsheet size={32} style={{ color: 'var(--color-primary)' }} />
          <div>
            <h1 style={styles.brandTitle}>Sheet2Suite</h1>
            <p style={styles.brandSubtitle}>The Digital Canvas Suite for Google Sheets Purists</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/activate"
            style={styles.activateLinkBtn}
          >
            <Key size={16} />
            <span>ACTIVATION PORTAL</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroBadge}>
          <Sparkles size={14} style={{ color: 'var(--color-gold, #f59e0b)' }} />
          <span>PRODUCTIVITY APPLICATIONS FOR GOOGLE DRIVE</span>
        </div>
        <h2 style={styles.heroTitle}>
          Turn Plain Spreadsheets Into <span style={{ color: 'var(--color-primary)' }}>High-Performance Apps</span>.
        </h2>
        <p style={styles.heroDesc}>
          Sheet2Suite turns Google Sheets into beautiful, real-time web applications for wedding planning, vacation rentals, personal budgets, and milestone events. Zero subscription fees, 100% private to your Google Drive.
        </p>

        <div style={styles.heroCtaGroup}>
          <Link href="/vow" style={styles.primaryCta}>
            <Heart size={18} />
            <span>LAUNCH SHEET2VOW (WEDDING PLANNER)</span>
            <ArrowRight size={18} />
          </Link>

          <Link href="/activate" style={styles.secondaryCta}>
            <Key size={18} />
            <span>ACTIVATION & LICENSE PORTAL</span>
          </Link>
        </div>
      </section>

      {/* Suite Product Showcase Grid */}
      <section style={styles.showcaseSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>SHEET2SUITE PRODUCT FAMILY</h3>
          <p style={styles.sectionDesc}>Explore our suite of specialized spreadsheet applications.</p>
        </div>

        <div style={styles.productGrid}>
          {/* Card 1: Sheet2Vow */}
          <div style={{ ...styles.productCard, borderColor: 'var(--color-primary)' }}>
            <div style={styles.cardHeader}>
              <div style={styles.iconCircle}>
                <Heart size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <span style={styles.badgeActive}>AVAILABLE NOW (v1.0)</span>
            </div>

            <h4 style={styles.cardTitle}>Sheet2Vow</h4>
            <span style={styles.cardTagline}>Digital Wedding Planning Suite</span>
            <p style={styles.cardDesc}>
              Complete wedding coordination engine: Guest list RSVP tracker, seating charts, budget ledger, day-of timeline, vendor directory, music playlist, and Canva place card exporter.
            </p>

            <Link href="/vow" style={styles.cardBtnPrimary}>
              <span>LAUNCH SHEET2VOW</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2: Sheet2Home */}
          <div style={styles.productCard}>
            <div style={styles.cardHeader}>
              <div style={styles.iconCircle}>
                <Home size={24} style={{ color: 'var(--color-muted)' }} />
              </div>
              <span style={styles.badgeUpcoming}>COMING NEXT — Q4 2026</span>
            </div>

            <h4 style={styles.cardTitle}>Sheet2Home</h4>
            <span style={styles.cardTagline}>Personal Property & Inventory System</span>
            <p style={styles.cardDesc}>
              Personal property, valuables, and electronics inventory system for home management, warranty tracking, and insurance claims.
            </p>

            <button disabled style={styles.cardBtnDisabled}>
              <span>COMING NEXT</span>
            </button>
          </div>

          {/* Card 3: Sheet2Harvest */}
          <div style={styles.productCard}>
            <div style={styles.cardHeader}>
              <div style={styles.iconCircle}>
                <Sparkles size={24} style={{ color: 'var(--color-muted)' }} />
              </div>
              <span style={styles.badgeUpcoming}>COMING Q1 2027</span>
            </div>

            <h4 style={styles.cardTitle}>Sheet2Harvest</h4>
            <span style={styles.cardTagline}>Gardener's Seasonal Log Book</span>
            <p style={styles.cardDesc}>
              A gardener's seasonal logbook for planting schedules, soil health tracking, crop rotation, pest management, and harvest yields.
            </p>

            <button disabled style={styles.cardBtnDisabled}>
              <span>COMING SOON</span>
            </button>
          </div>

          {/* Card 4: Sheet2Finances */}
          <div style={styles.productCard}>
            <div style={styles.cardHeader}>
              <div style={styles.iconCircle}>
                <DollarSign size={24} style={{ color: 'var(--color-muted)' }} />
              </div>
              <span style={styles.badgeUpcoming}>COMING Q2 2027</span>
            </div>

            <h4 style={styles.cardTitle}>Sheet2Finances</h4>
            <span style={styles.cardTagline}>Personal Net Worth & Budget Ledger</span>
            <p style={styles.cardDesc}>
              Zero-based budget ledger, cashflow forecasting, debt payoff snowball calculator, asset allocation, and personal net worth tracker.
            </p>

            <button disabled style={styles.cardBtnDisabled}>
              <span>COMING SOON</span>
            </button>
          </div>
        </div>
      </section>

      {/* Platform Guarantees / Value Pillars */}
      <section style={styles.pillarsSection}>
        <div style={styles.pillarItem}>
          <ShieldCheck size={28} style={{ color: 'var(--color-primary)' }} />
          <h5 style={styles.pillarTitle}>100% Private to Drive</h5>
          <p style={styles.pillarDesc}>Your financial and guest data lives strictly inside your personal Google Drive account. We never store your personal records on central servers.</p>
        </div>

        <div style={styles.pillarItem}>
          <HardDrive size={28} style={{ color: 'var(--color-primary)' }} />
          <h5 style={styles.pillarTitle}>Spreadsheet Purist Format</h5>
          <p style={styles.pillarDesc}>Every app is backed by clean standard Google Sheets (.xlsx format) that you can inspect, export, print, or edit manually at any time.</p>
        </div>

        <div style={styles.pillarItem}>
          <Printer size={28} style={{ color: 'var(--color-primary)' }} />
          <h5 style={styles.pillarTitle}>Print Studio & Canva Ready</h5>
          <p style={styles.pillarDesc}>Built-in Canva bulk merge CSV exporter and print studio to create gorgeous place cards, menus, agendas, and seating charts.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>© 2026 Sheet2Suite Platform • Built for Google Sheets Purists</p>
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
    fontFamily: 'var(--font-serif)',
    fontSize: '1.6rem',
    fontWeight: 800,
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
    padding: '2.5rem 1rem 3.5rem 1rem',
    backgroundColor: 'var(--color-surface, #fff)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--box-shadow-subtle)',
    marginBottom: '3rem',
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
    fontFamily: 'var(--font-serif)',
    fontSize: '2.4rem',
    fontWeight: 800,
    lineHeight: 1.2,
    maxWidth: '800px',
    margin: '0 0 1rem 0',
  },
  heroDesc: {
    fontSize: '1rem',
    color: 'var(--color-muted)',
    maxWidth: '680px',
    lineHeight: 1.5,
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
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.875rem 1.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  showcaseSection: {
    marginBottom: '3.5rem',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
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
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    margin: 0,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
  productCard: {
    backgroundColor: 'var(--color-surface, #fff)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.5rem',
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
    width: '44px',
    height: '44px',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  badgeUpcoming: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-border)',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    margin: 0,
  },
  cardTagline: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    fontWeight: 700,
    marginTop: '-0.35rem',
  },
  cardDesc: {
    fontSize: '0.825rem',
    color: 'var(--color-muted)',
    lineHeight: 1.45,
    margin: '0.25rem 0 0.5rem 0',
    flex: 1,
  },
  cardBtnPrimary: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.65rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
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
    padding: '0.65rem 1rem',
    cursor: 'not-allowed',
    textAlign: 'center',
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
    fontFamily: 'var(--font-serif)',
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
  footer: {
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    borderTop: '1px solid var(--color-border)',
    paddingTop: '1.5rem',
  }
};
