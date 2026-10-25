'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = 'October 24, 2026';

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
          Sheet2Suite delivers a client-side digital software interface that runs on top of your own personal Google Drive and Google Sheets.
          You purchase a lifetime software license (zero monthly subscriptions) and own 100% of your wedding data, spreadsheets, and guest records.
        </p>
      </section>

      {/* Terms Body */}
      <div style={styles.contentBody}>
        {/* Section 1 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>1. Acceptance of Terms</h2>
          <p style={styles.paragraph}>
            By purchasing, activating, accessing, or using Sheet2Suite, Sheet2Vow, or any associated digital templates and software tools (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of these Terms, you may not use the Service.
          </p>
        </section>

        {/* Section 2 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>2. Nature of the Service & Architecture</h2>
          <p style={styles.paragraph}>
            Sheet2Suite is a hybrid web application and digital spreadsheet operating layer. The Service provisions structured Google Sheets templates directly into your Google Drive account and provides an interactive web interface to read, edit, and visualize that data.
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Data Sovereignty:</strong> Your data remains solely in your Google Drive. Sheet2Suite does not maintain a central database of your wedding guests, financial ledgers, or vendor contracts.
            </li>
            <li style={styles.listItem}>
              <strong>Google Account Dependency:</strong> You must maintain an active Google account capable of using Google Drive and Google Sheets to utilize the Service.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>3. License Grant & Permitted Use</h2>
          <p style={styles.paragraph}>
            Upon verified purchase of a license (via Etsy, marketplace partners, or direct checkout), Sheet2Suite grants you a non-exclusive, non-transferable, perpetual, worldwide license to use the software according to your purchased package tier:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Personal Single-Wedding License (Standard):</strong> Permitted for personal use in planning one wedding or event for you, your partner, and designated co-planners.
            </li>
            <li style={styles.listItem}>
              <strong>Professional / Coordinator Tier (Multi-Client):</strong> Permitted for wedding planners and event coordinators to manage client weddings under the allotted sheet capacity specified at checkout.
            </li>
            <li style={styles.listItem}>
              <strong>Restrictions:</strong> You may not redistribute, resell, sub-license, publicly share download links to, or commercially re-package Sheet2Suite software code, templates, or design assets as your own standalone product.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>4. User Responsibilities & Data Backups</h2>
          <p style={styles.paragraph}>
            Because Sheet2Suite operates directly on your personal Google Drive, you are solely responsible for:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              Maintaining the security and confidentiality of your Google account credentials and login sessions.
            </li>
            <li style={styles.listItem}>
              Managing who you invite as co-planners, view-only collaborators, or vendor link recipients.
            </li>
            <li style={styles.listItem}>
              Creating backups or revision history within Google Drive before performing large bulk deletions or changes.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>5. Google API Services & Third-Party Platforms</h2>
          <p style={styles.paragraph}>
            Our service integrates with Google APIs (Google Drive, Google Sheets, Google OAuth 2.0). Your use of Google services is governed by Google&apos;s Terms of Service and Privacy Policy. Sheet2Suite complies strictly with the Google API Services User Data Policy, specifically utilizing the least-privilege <code>drive.file</code> and <code>spreadsheets</code> scopes.
          </p>
        </section>

        {/* Section 6 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>6. Disclaimer of Warranties</h2>
          <div style={styles.warningBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#92400e', fontWeight: 800, fontSize: '0.85rem' }}>
              <AlertTriangle size={18} />
              <span>&quot;AS-IS&quot; WARRANTY DISCLAIMER</span>
            </div>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
              The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, either express or implied, including but not limited to fitness for a particular purpose, merchantability, or non-infringement. While we strive for 100% uptime and mathematical accuracy across seating algorithms and budget calculations, Sheet2Suite does not warrant that the Service will be error-free or uninterrupted.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>7. Limitation of Liability</h2>
          <p style={styles.paragraph}>
            To the maximum extent permitted by applicable law, in no event shall Sheet2Suite, its founders, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of goodwill, or vendor booking disputes arising out of or related to your use of the Service. In all cases, Sheet2Suite&apos;s total aggregate liability shall not exceed the actual amount paid by you for your license.
          </p>
        </section>

        {/* Section 8 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>8. Refund Policy</h2>
          <p style={styles.paragraph}>
            Due to the immediate digital delivery and non-returnable nature of software licenses and Google Sheet master templates, refunds are evaluated on a case-by-case basis according to marketplace rules (e.g. Etsy Buyer Protection or merchant guidelines). If you experience technical difficulties, our support team will actively assist you in resolving any configuration or provisioning issues.
          </p>
        </section>

        {/* Section 9 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>9. Changes to Terms</h2>
          <p style={styles.paragraph}>
            We may update these Terms from time to time. When changes occur, we will update the &quot;Last Updated&quot; timestamp at the top of this page. Continued use of the Service following notice of changes constitutes your acceptance of the revised Terms.
          </p>
        </section>

        {/* Section 10 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>10. Contact Information</h2>
          <p style={styles.paragraph}>
            For questions regarding these Terms of Service or license permissions, please contact:
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
