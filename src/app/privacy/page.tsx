'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <h2 style={styles.promiseTitle}>Our Core Privacy Commitment: Google Drive Data Sovereignty</h2>
        </div>
        <p style={styles.promiseText}>
          Sheet2Suite and its applications (including Sheet2Vow and Sheet2Vault) are engineered with a strict <strong>Google Drive First</strong> philosophy.
          <strong> Your personal spreadsheet content—including guest lists, budgets, vendor contracts, seating charts, and home inventory rows—resides directly inside your personal Google Drive spreadsheet and is never copied to or stored in a central Sheet2Suite content database.</strong>
          Our servers store only the minimal account licensing, workspace routing, and encrypted authentication metadata required to verify your purchase and connect your authorized devices.
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
              <strong>Google Account Profile & Email (<code>openid</code>, <code>userinfo.email</code>, <code>userinfo.profile</code>):</strong> We read your primary email address and display name solely to authenticate your session, enforce collaborator permissions, and bind your verified purchase license.
            </li>
            <li style={styles.listItem}>
              <strong>Application-Created Files Only (<code>https://www.googleapis.com/auth/drive.file</code>):</strong> We request the non-sensitive <code>drive.file</code> permission. This strictly limits our application&apos;s access to spreadsheets and folders created directly by Sheet2Suite or explicitly selected by you. <strong>We cannot view, list, search, read, or modify any other personal files, folders, photos, or documents in your Google Drive.</strong>
            </li>
            <li style={styles.listItem}>
              <strong>Licensing, Workspace Routing & Encrypted Session Metadata:</strong> To verify your lifetime entitlement and enable features such as co-planner access and tokenized vendor/guest share portals, we store minimal metadata in Google Cloud Firestore: your purchaser/owner email, invited co-planner emails, Etsy Order ID / license key, provisioned Google Spreadsheet ID, AES-256-GCM encrypted OAuth credentials, and anonymized security rate-limiting counters.
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
                'We do not transfer, sell, or disclose Google user data to third parties for advertising, marketing, or data brokering.',
                'We do not use Google user data to serve targeted advertisements.',
                'We do not use Google user data or your spreadsheet contents to train machine learning or artificial intelligence models.',
                'Human access to your spreadsheet data is strictly prohibited unless you explicitly grant temporary permission for customer support troubleshooting.'
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
          <h2 style={styles.sectionHeading}>3. How Your Data Is Stored & Segregated</h2>
          <p style={styles.paragraph}>
            <strong>1. Personal Event & Inventory Content (Stored in Your Google Drive):</strong> Your guest lists, RSVP responses, dietary notes, seating assignments, vendor contracts, budget expenses, and Sheet2Vault asset records live inside your personal Google Sheet in your Google Drive. Sheet2Suite reads and writes to your sheet in real time via the Google APIs on your behalf.
          </p>
          <p style={styles.paragraph}>
            <strong>2. Platform Entitlement & Routing Records (Stored in Google Cloud Firestore):</strong> We store only the account mapping record linking your email address and Etsy Order ID to your Google Spreadsheet ID, plus AES-256-GCM encrypted OAuth tokens if you enable background sync for shared vendor timelines, song requests, or guest photo upload portals.
          </p>
          <p style={styles.paragraph}>
            <strong>3. Local Browser Storage:</strong> For fast rendering and workspace preferences (such as color mode, editorial theme, and active tab), Sheet2Suite uses client-side <code>localStorage</code> and <code>HttpOnly</code> signed session cookies in your browser.
          </p>
          <p style={styles.paragraph}>
            <strong>4. Guest Photo & Document Uploads:</strong> When you or your guests upload photos or vendor PDFs via a shared upload portal, files are streamed directly into your designated Google Drive folder. We record only non-content file metadata (file name, Drive link, and uploader name) so you can review uploads inside your dashboard.
          </p>
        </section>

        {/* Section 4 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>4. Sharing, Co-Planners & Tokenized Portals</h2>
          <p style={styles.paragraph}>
            We never sell, rent, monetize, or trade your personal information to third parties, advertisers, or data brokers under any circumstances.
          </p>
          <p style={styles.paragraph}>
            If you choose to invite a co-planner or generate tokenized Vendor Share Portals, Guest Song Request links, or Guest Photo Upload links, Sheet2Suite issues cryptographically signed (HMAC-SHA256) tokens scoped strictly to the permissions you select. You may revoke individual links or all shared links instantaneously from your workspace settings.
          </p>
        </section>

        {/* Section 5 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>5. Your Privacy Rights, Self-Service Erasure & Revocation (GDPR / CCPA / PIPEDA)</h2>
          <p style={styles.paragraph}>
            Regardless of whether you reside in Canada (PIPEDA), the European Economic Area / UK (GDPR), California (CCPA/CPRA), or elsewhere, we provide full transparency and control over both your Google Drive files and your Sheet2Suite account metadata:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Revoking Google OAuth Access:</strong> You can disconnect Sheet2Suite&apos;s access at any moment via the in-app Settings dialog or directly through Google Security settings at{' '}
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
              <strong>Self-Service Deletion of Sheet2Suite Server Metadata:</strong> Workspace owners can permanently purge their workspace registration and stored encrypted OAuth tokens from our Cloud Firestore database at any time via <code>DELETE /api/workspaces</code> (or by requesting immediate deletion via Settings / Support), while leaving their personal Google Sheet intact in Google Drive.
            </li>
            <li style={styles.listItem}>
              <strong>Deleting Your Spreadsheet Content:</strong> Deleting your Google Sheet or the <code>My Drive / Sheet2Suite</code> folder in your Google Drive permanently destroys your event or inventory records.
            </li>
            <li style={styles.listItem}>
              <strong>Data Portability:</strong> Because your data lives in a standard Google Sheet in your own Drive, you can export or download it at any time as Microsoft Excel (<code>.xlsx</code>), CSV, or PDF without relying on Sheet2Suite.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>6. Security Measures</h2>
          <p style={styles.paragraph}>
            We apply defense-in-depth safeguards including HTTPS/TLS encryption in transit, AES-256-GCM encryption at rest for stored OAuth tokens, HMAC-SHA256 signed <code>HttpOnly</code> session cookies, Content Security Policy (CSP) headers, strict origin allowlisting on cross-window OAuth handshakes, and automated formula-injection sanitization (<code>CellGuard</code>) on all spreadsheet inputs.
          </p>
        </section>

        {/* Section 7 */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>7. Contact Us & Data Protection Inquiries</h2>
          <p style={styles.paragraph}>
            If you have privacy questions, Data Subject Access Requests (DSAR), erasure requests, or security disclosures, please contact us at:
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
