'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = 'November 5, 2026';

  return (
    <div style={styles.container}>
      {/* Top Navigation */}
      <div style={styles.navBar}>
        <Link href="/" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Sheet2Suite Hub</span>
        </Link>
        <div style={styles.navBadge}>
          <FileText size={14} style={{ color: 'var(--color-primary)' }} />
          <span>LEGAL TERMS</span>
        </div>
      </div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.categoryPill}>TERMS OF SERVICE & LICENSE AGREEMENT</div>
        <h1 style={styles.mainTitle}>Terms of Service</h1>
        <p style={styles.subTitle}>
          Last Updated: <strong>{lastUpdated}</strong> • Effective Date: October 24, 2026
        </p>
      </header>

      {/* Summary Banner */}
      <section style={styles.summaryCard}>
        <div style={styles.summaryHeader}>
          <Shield size={20} style={{ color: '#2563eb' }} />
          <h2 style={styles.summaryTitle}>Quick Summary: Ownership, Freedom & Fair Use</h2>
        </div>
        <p style={styles.summaryText}>
          Sheet2Suite delivers a digital software interface that runs on top of your personal Google Drive and Google Sheets.
          You purchase a software license bound to your order and retain 100% ownership of your spreadsheets, event plans, and personal records.
        </p>
      </section>

      {/* Terms Body */}
      <div style={styles.contentBody}>
        {/* Section 1 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>1. Acceptance of Terms</h2>
          <p style={styles.paragraph}>
            By purchasing, activating, accessing, or using Sheet2Suite, Sheet2Vow, Sheet2Vault, or any associated digital templates and software tools (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of these Terms, you may not access or use the Service.
          </p>
        </section>

        {/* Section 2 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>2. Nature of the Service & Architecture</h2>
          <p style={styles.paragraph}>
            Sheet2Suite is a hybrid web application and spreadsheet operating layer. The Service provisions structured Google Sheets templates directly into your Google Drive account and provides an interactive web interface to read, edit, and visualize that data.
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Data Sovereignty:</strong> Your spreadsheet content remains in your Google Drive. Sheet2Suite maintains only minimal licensing, workspace routing, and encrypted session metadata required to authenticate and route your workspace.
            </li>
            <li style={styles.listItem}>
              <strong>Google Account Dependency:</strong> You must maintain an active Google account capable of using Google Drive and Google Sheets to utilize the Service.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>3. License Grant, Order Binding & Permitted Use</h2>
          <p style={styles.paragraph}>
            Upon verified purchase of a license (via Etsy, authorized marketplace partners, or direct checkout), Sheet2Suite grants you a revocable, non-exclusive, non-transferable, worldwide license to use the software according to your purchased package tier:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Personal Single-Household / Single-Event License (Standard):</strong> Bound to the original purchaser email address and permitted for personal use in managing one primary workspace for you and one designated co-planner/partner.
            </li>
            <li style={styles.listItem}>
              <strong>Professional / Coordinator Tier (Pro):</strong> Permitted for professional planners, coordinators, or multi-workspace households up to the workspace and collaborator capacity specified on your license.
            </li>
            <li style={styles.listItem}>
              <strong>Anti-Piracy & Restrictions:</strong> Order IDs and license keys are cryptographically bound to the activating email address. You may not share order receipts publicly, redistribute, resell, sub-license, scrape, clone via automated scripts, or commercially re-package Sheet2Suite software code, master spreadsheet templates, or design assets as a competing or standalone product.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>4. User Responsibilities, Guest Data & Shared Links</h2>
          <p style={styles.paragraph}>
            Because Sheet2Suite operates directly on your personal Google Drive and allows you to collaborate with third parties, you agree and warrant that:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Data Controller Responsibility for Guest & Third-Party PII:</strong> When you enter personal information of third parties (such as wedding guests&apos; names, email addresses, mailing addresses, dietary/medical notes, or children&apos;s names) or collect guest photo uploads and song requests, you act as the independent Data Controller of that information. You represent and warrant that you have obtained all necessary consents to collect and store such information in your Google Drive.
            </li>
            <li style={styles.listItem}>
              <strong>Tokenized Share Portals & Guest Uploads:</strong> You are solely responsible for managing whom you invite as co-planners or recipients of tokenized Vendor Share links, Song Request links, and Guest Photo Upload links, and for revoking links if a recipient should no longer have access. You agree not to use shared upload portals to collect or distribute unlawful, infringing, or malicious files.
            </li>
            <li style={styles.listItem}>
              <strong>Backups & Revision History:</strong> You are responsible for maintaining the security of your Google account and utilizing Google Drive&apos;s built-in version history or offline exports (<code>.xlsx</code>) before performing bulk edits or deletions.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>5. No Insurance, Financial, Legal, or Tax Advice</h2>
          <div style={styles.warningBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#92400e', fontWeight: 800, fontSize: '0.85rem' }}>
              <AlertTriangle size={18} />
              <span>IMPORTANT PROFESSIONAL & INSURANCE DISCLAIMER (SHEET2VAULT & FINANCIAL MODULES)</span>
            </div>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#78350f', lineHeight: 1.55 }}>
              Sheet2Suite, Sheet2Vow, Sheet2Vault, and future suite applications are strictly organizational spreadsheet interfaces. <strong>We are not an insurance company, licensed insurance adjuster, insurance broker, financial advisor, accountant, or law firm.</strong> Features such as Sheet2Vault&apos;s &quot;Claim Readiness Score,&quot; &quot;Policy Sub-Limit Alerts&quot; (e.g., illustrative caps for jewelry or electronics), &quot;Insurance Claim Dossiers,&quot; and Sheet2Vow&apos;s budget/contract calculators are provided for informational convenience only. They do not guarantee that any insurance carrier will accept your documentation, valuation, or claim, nor do they reflect the specific terms, exclusions, riders, or sub-limits of your actual insurance policy. Always consult your licensed insurance broker, carrier, or legal/financial professional regarding coverage adequacy and claim requirements.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>6. Google API Services & Third-Party Platforms</h2>
          <p style={styles.paragraph}>
            Our service integrates with Google APIs (Google Drive, Google Sheets, Google OAuth 2.0) and optional music catalog previews (Apple iTunes Search API). Your use of Google services is governed separately by Google LLC&apos;s Terms of Service and Privacy Policy. Sheet2Suite is an independent software platform and is not affiliated with, endorsed by, or sponsored by Google LLC or Etsy, Inc.
          </p>
        </section>

        {/* Section 7 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>7. Disclaimer of Warranties</h2>
          <p style={styles.paragraph}>
            THE SERVICE AND ALL MASTER SPREADSHEET TEMPLATES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF SPREADSHEET FORMULAS, OR NON-INFRINGEMENT. SHEET2SUITE DOES NOT WARRANT THAT THE SERVICE OR GOOGLE API CONNECTIVITY WILL BE UNINTERRUPTED OR ERROR-FREE.
          </p>
        </section>

        {/* Section 8 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>8. Limitation of Liability & Indemnification</h2>
          <p style={styles.paragraph}>
            To the maximum extent permitted by applicable law, in no event shall Sheet2Suite, its founder, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages—including loss of data, denied or reduced insurance claims, wedding vendor disputes, budget overruns, or service interruptions during an event—arising out of or related to your use of the Service. In all cases, Sheet2Suite&apos;s total aggregate liability for any claim shall not exceed the actual amount paid by you for your software license during the twelve (12) months preceding the claim.
          </p>
          <p style={styles.paragraph}>
            You agree to indemnify and hold harmless Sheet2Suite from any third-party claims, liabilities, or expenses arising from your breach of these Terms, your collection or sharing of guest data, or content uploaded to your Google Drive via shared portals.
          </p>
        </section>

        {/* Section 9 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>9. Refunds, Cancellations & Chargeback License Revocation</h2>
          <p style={styles.paragraph}>
            Due to the immediate digital provisioning of software licenses and master Google Sheet templates, refund requests are evaluated according to the applicable marketplace policy (e.g., Etsy digital download guidelines). <strong>If an order is refunded, cancelled, reversed, or disputed via a payment chargeback, your software license and all associated Sheet2Suite workspace entitlements will be automatically and permanently revoked.</strong>
          </p>
        </section>

        {/* Section 10 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>10. Governing Law, Venue & Dispute Resolution</h2>
          <p style={styles.paragraph}>
            These Terms and any dispute arising out of your relationship with Sheet2Suite shall be governed by and construed in accordance with the laws of the <strong>Province of Ontario and the federal laws of Canada applicable therein</strong>, without regard to conflict of law principles (while your underlying use of Google Drive and Google Sheets remains governed by your agreement with Google).
          </p>
          <p style={styles.paragraph}>
            Before initiating any formal legal proceeding, you agree to contact us at <a href="mailto:support@sheet2suite.com" style={{ color: 'var(--color-primary)' }}>support@sheet2suite.com</a> and allow thirty (30) days for good-faith informal resolution. To the extent permitted by applicable consumer protection law, any unresolved dispute shall be brought exclusively in the courts located in Ontario, Canada, and solely on an individual basis (not as a class, consolidated, or representative action).
          </p>
        </section>

        {/* Section 11 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>11. Changes to Terms & Contact Information</h2>
          <p style={styles.paragraph}>
            We may update these Terms from time to time by updating the &quot;Last Updated&quot; date at the top of this page. For questions regarding these Terms or licensing, please contact:
          </p>
          <div style={styles.contactCard}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem' }}>Sheet2Suite Legal Support</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
              Email:{' '}
              <a href="mailto:support@sheet2suite.com" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                support@sheet2suite.com
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>© 2026 Sheet2Suite Platform • All Rights Reserved</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'center' }}>
          <Link href="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Home</Link>
          <span>•</span>
          <Link href="/privacy" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
          <span>•</span>
          <Link href="/activate" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Activation Portal</Link>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '2rem 1.5rem 5rem 1.5rem',
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text)',
  },
  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--color-border)',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    textDecoration: 'none',
  },
  navBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
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
    fontSize: '2.4rem',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    margin: '0 0 0.5rem 0',
    color: 'var(--color-text)',
  },
  subTitle: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    fontFamily: 'var(--font-mono)',
    margin: 0,
  },
  summaryCard: {
    backgroundColor: '#eff6ff',
    border: '2px solid #bfdbfe',
    borderRadius: 'var(--border-radius-md, 8px)',
    padding: '1.5rem',
    marginBottom: '2.5rem',
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  summaryTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#1e40af',
    margin: 0,
  },
  summaryText: {
    fontSize: '0.9rem',
    color: '#1e3a8a',
    lineHeight: 1.6,
    margin: 0,
  },
  contentBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.25rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionHeading: {
    fontFamily: 'var(--font-sans)',
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  paragraph: {
    fontSize: '0.925rem',
    color: 'var(--color-text)',
    lineHeight: 1.65,
    margin: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    paddingLeft: '1.25rem',
    margin: 0,
  },
  listItem: {
    fontSize: '0.925rem',
    lineHeight: 1.6,
  },
  warningBox: {
    backgroundColor: '#fffbeb',
    border: '1.5px solid #fde68a',
    borderRadius: 'var(--border-radius-sm, 6px)',
    padding: '1.25rem',
  },
  contactCard: {
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm, 6px)',
    padding: '1rem 1.25rem',
    marginTop: '0.5rem',
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
