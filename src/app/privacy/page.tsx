'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, HardDrive, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} />
          <span>LEGAL COMPLIANCE</span>
        </div>
      </div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.categoryPill}>LEGAL & SECURITY ARCHITECTURE</div>
        <h1 style={styles.mainTitle}>Privacy Policy</h1>
        <p style={styles.subTitle}>
          Last Updated: <strong>{lastUpdated}</strong> • Effective Date: October 24, 2026
        </p>
      </header>

      {/* Core Privacy Promise Card */}
      <section style={styles.promiseCard}>
        <div style={styles.promiseHeader}>
          <Lock size={20} style={{ color: '#16a34a' }} />
          <h2 style={styles.promiseTitle}>Our Core Privacy Commitment: 100% Data Sovereignty</h2>
        </div>
        <p style={styles.promiseText}>
          Sheet2Suite and its applications (including Sheet2Vow) are engineered with a strict <strong>Google Drive First</strong> philosophy.
          Unlike traditional cloud SaaS applications that ingest, duplicate, and store your personal spreadsheets on third-party databases,
          <strong> Sheet2Suite never copies, processes, or stores your wedding, financial, or personal records on external database servers.</strong>
          Your Google Drive is your private database.
        </p>
      </section>

      {/* Main Content Body */}
      <div style={styles.contentBody}>
        {/* Section 1 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>1. Information We Access and Process</h2>
          <p style={styles.paragraph}>
            When you use Sheet2Suite or authorize our application via Google Sign-In, we request access strictly to the minimal resources necessary to deliver the spreadsheet management service:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Google Account Profile & Email:</strong> We read your primary email address and display name solely to identify your workspace session, authenticate your collaborator permissions, and verify your Etsy/license purchase.
            </li>
            <li style={styles.listItem}>
              <strong>Application-Created Spreadsheets (drive.file scope):</strong> We request the non-sensitive <code>https://www.googleapis.com/auth/drive.file</code> and <code>https://www.googleapis.com/auth/spreadsheets</code> permissions. This strictly limits our application&apos;s access to files created directly by Sheet2Suite or opened explicitly by you. <strong>We cannot view, search, read, or modify any other files, folders, photos, or documents in your Google Drive.</strong>
            </li>
            <li style={styles.listItem}>
              <strong>Order & Verification Metadata:</strong> If you activate via an Etsy or digital marketplace receipt, we store minimal cryptographic license tokens to validate your lifetime entitlement.
            </li>
          </ul>
        </section>

        {/* Section 2: Google API Limited Use Policy Disclosure */}
        <section style={styles.section}>
          <div style={styles.disclosureCard}>
            <h2 style={{ ...styles.sectionHeading, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              2. Google API Services User Data Policy Compliance
            </h2>
            <p style={{ ...styles.paragraph, color: '#334155', fontWeight: 600 }}>
              Sheet2Suite&apos;s use and transfer to any other app of information received from Google APIs adheres to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#2563eb', textDecoration: 'underline' }}
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {[
                'We do not transfer or disclose Google user data to third parties for advertising or marketing.',
                'We do not use Google user data to serve targeted advertisements.',
                'We do not use Google user data to train machine learning or artificial intelligence models.',
                'Human access to your spreadsheet data is strictly prohibited unless you explicitly request customer support assistance.'
              ].map((point, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1e293b' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>3. How Your Data Is Stored & Handled</h2>
          <p style={styles.paragraph}>
            <strong>Zero External Database Retention:</strong> Your guest lists, seating assignments, vendor contracts, budget expenses, and event itineraries reside directly in your own Google Drive spreadsheet (in standard Google Sheets / XLSX format).
          </p>
          <p style={styles.paragraph}>
            <strong>Local Browser Storage:</strong> For offline resilience, lightning-fast rendering, and active workspace preferences (such as selected color themes, time formats, or active tab), Sheet2Suite utilizes client-side <code>localStorage</code> within your personal web browser. This data never leaves your device.
          </p>
          <p style={styles.paragraph}>
            <strong>Temporary File Buffering:</strong> When uploading vendor PDF contracts or place card graphics, files are streamed directly into your designated Google Drive folder. No files are retained on Sheet2Suite temporary application servers.
          </p>
        </section>

        {/* Section 4 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>4. Sharing & Third Parties</h2>
          <p style={styles.paragraph}>
            We never sell, rent, monetize, or trade your personal information, wedding details, or contact registries to any third parties, advertisers, or data brokers under any circumstances.
          </p>
          <p style={styles.paragraph}>
            If you choose to use our tokenized Vendor Share Portals or RSVP collection links, you generate cryptographically signed, read-only or scoped tokens that grant limited access exclusively to the specific parameters you authorize (such as day-of timeline or DJ music playlist).
          </p>
        </section>

        {/* Section 5 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>5. User Rights, Data Deletion & Revocation</h2>
          <p style={styles.paragraph}>
            Because all primary data is stored inside your Google Drive, you retain unconditional control and ownership of your files at all times:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Revoking Application Access:</strong> You can disconnect Sheet2Suite&apos;s access at any moment via the in-app Settings dialog or by visiting your Google Security settings at{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
              >
                myaccount.google.com/permissions
              </a>.
            </li>
            <li style={styles.listItem}>
              <strong>Deleting Your Data:</strong> Deleting your Google Sheet or the <code>My Drive / Sheet2Suite / Sheet2Vow</code> folder in Google Drive permanently destroys your wedding records. Clearing your browser cache or clicking &quot;Disconnect Workspace&quot; purges all local session keys.
            </li>
            <li style={styles.listItem}>
              <strong>Data Portability:</strong> You can export, download, or copy your Google Sheet at any second into Microsoft Excel (.xlsx), Apple Numbers, or CSV format without relying on Sheet2Suite.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>6. Security Measures</h2>
          <p style={styles.paragraph}>
            We apply defense-in-depth security best practices to protect your session, including HTTPS transport encryption, Content Security Policies (CSP), sanitized spreadsheet inputs against formula injection, signed JWT session cookies with <code>HttpOnly</code> and <code>SameSite</code> flags, and strict origin validation on cross-window communication.
          </p>
        </section>

        {/* Section 7 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>7. Contact Us</h2>
          <p style={styles.paragraph}>
            If you have questions, privacy inquiries, or security vulnerability disclosures regarding this Privacy Policy or Sheet2Suite data practices, please contact us at:
          </p>
          <div style={styles.contactCard}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem' }}>Sheet2Suite Legal & Privacy Team</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
              Email:{' '}
              <a href="mailto:support@sheet2suite.com" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                support@sheet2suite.com
              </a>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
              Website: <a href="https://sheet2suite.com" style={{ color: 'var(--color-primary)' }}>https://sheet2suite.com</a>
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
          <Link href="/terms" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Terms of Service</Link>
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
  promiseCard: {
    backgroundColor: '#f0fdf4',
    border: '2px solid #bbf7d0',
    borderRadius: 'var(--border-radius-md, 8px)',
    padding: '1.5rem',
    marginBottom: '2.5rem',
  },
  promiseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  promiseTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#166534',
    margin: 0,
  },
  promiseText: {
    fontSize: '0.9rem',
    color: '#14532d',
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
  disclosureCard: {
    backgroundColor: '#eff6ff',
    border: '2px solid #bfdbfe',
    borderRadius: 'var(--border-radius-md, 8px)',
    padding: '1.5rem',
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
