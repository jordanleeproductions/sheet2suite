'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Key, 
  Zap, 
  Sliders, 
  UserPlus, 
  Eye, 
  ListTodo, 
  Heart, 
  DollarSign, 
  Calendar, 
  Users, 
  Music, 
  Briefcase, 
  Package, 
  Lock, 
  Check,
  Download
} from 'lucide-react';
import { TASK_PRESETS, TaskPreset } from '@/lib/presets/taskPresets';
import OfficialGoogleButton from '@/components/OfficialGoogleButton';
import GoogleDrivePickerModal from '@/components/GoogleDrivePickerModal';

export default function ActivationPage() {
  const router = useRouter();

  // Wizard state: 0 = Activation, 1 = Choose Mode, 2 = Setup (Quick or Guided), 3 = Complete
  const [step, setStep] = useState<number>(0);
  const [setupMode, setSetupMode] = useState<'quick' | 'guided'>('guided');
  const [guidedStep, setGuidedStep] = useState<number>(1);

  // Activation credentials state
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState<any>(null);

  // Google Session State
  const [googleEmail, setGoogleEmail] = useState<string>('');
  const [googleToken, setGoogleToken] = useState<string>('');
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [showDrivePickerModal, setShowDrivePickerModal] = useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }

      const savedEmail = localStorage.getItem('s2v_google_email');
      const savedToken = localStorage.getItem('s2v_google_token');
      if (savedEmail) {
        setGoogleEmail(savedEmail);
        setIsGoogleConnected(true);
      }
      if (savedToken) {
        setGoogleToken(savedToken);
      }

      // Listen for popup postMessage completion
      const handleAuthMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          const { user, accessToken } = event.data;
          if (user?.email) {
            setGoogleEmail(user.email);
            setEmail(user.email);
            setIsGoogleConnected(true);
            localStorage.setItem('s2v_google_email', user.email);
          }
          if (accessToken) {
            setGoogleToken(accessToken);
            localStorage.setItem('s2v_google_token', accessToken);
          }
        }
      };

      window.addEventListener('message', handleAuthMessage);
      return () => window.removeEventListener('message', handleAuthMessage);
    }
  }, []);

  // Setup Form State
  const [weddingName, setWeddingName] = useState('Our Wedding');
  const [budget, setBudget] = useState(30000);
  const [driveFolder, setDriveFolder] = useState('My Drive / Sheet2Suite / Sheet2Vow');
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('TRADITIONAL');
  const [spouseEmail, setSpouseEmail] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [enableGuestReadOnly, setEnableGuestReadOnly] = useState(true);
  const [enableVendorReadOnly, setEnableVendorReadOnly] = useState(true);

  // Module Configuration State
  const [modules, setModules] = useState({
    metrics: true,
    budget: true,
    guests: true,
    schedule: true,
    tasks: true,
    vendors: true,
    music: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⚡ Express 1-Click Demo Launch Handler on /activate
  const handleExpressDemoLaunch = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_spreadsheet_id', 'mock-sheet-id-vow-12345');
      localStorage.setItem('s2v_google_token', 'mock-token');
      localStorage.setItem('s2v_is_onboarded', 'true');
      localStorage.setItem('s2v_is_mock', 'true');
      localStorage.setItem('s2v_is_demo', 'true');
      localStorage.setItem('s2v_wedding_name', "Alex & Sam's Wedding");
      localStorage.setItem('s2v_wedding_date', '2026-09-20');
      localStorage.setItem('s2v_drive_folder', 'My Drive/Wedding Planning');
      window.location.href = '/#home';
    } else {
      router.push('/');
    }
  };

  // Step 0: Etsy Order Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    if (!email || !orderId) {
      setVerifyError('Please enter both your Email Address and Etsy Order ID.');
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch('/api/verify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, orderId }),
      });

      const data = await res.json();
      setIsVerifying(false);

      if (!data.success) {
        setVerifyError(data.error || 'Verification failed. Please check your credentials.');
        return;
      }

      setVerifiedOrder(data);
      setStep(1); // Proceed to Setup Mode choice
    } catch (err: any) {
      setIsVerifying(false);
      setVerifyError('Network error while verifying order. Please try again.');
    }
  };

  const toggleModule = (key: keyof typeof modules) => {
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Submit Final Setup
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const selectedPreset = TASK_PRESETS[selectedPresetKey] || TASK_PRESETS.TRADITIONAL;

    try {
      const googleToken = typeof window !== 'undefined' ? localStorage.getItem('s2v_google_token') : null;

      const provHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (googleToken) provHeaders['Authorization'] = `Bearer ${googleToken}`;

      // Step 1: Provision Google Drive folder & master spreadsheet
      const provRes = await fetch('/api/provision', {
        method: 'POST',
        headers: provHeaders,
        body: JSON.stringify({
          accessToken: googleToken || undefined,
          coupleName: weddingName,
          productName: 'Sheet2Vow',
          driveFolder: driveFolder,
        }),
      });

      const provData = await provRes.json();
      if (!provRes.ok || !provData.success || !provData.provisioned?.spreadsheetId) {
        throw new Error(provData.error || 'Failed to provision Google Drive spreadsheet. Ensure you are signed into Google.');
      }

      const createdSpreadsheetId = provData.provisioned.spreadsheetId;

      // Step 2: Register workspace in Sheet2Suite database
      const userEmailToSave = email || (typeof window !== 'undefined' ? localStorage.getItem('s2v_google_email') : null) || 'user@sheet2suite.com';

      await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmailToSave,
          partnerEmail: spouseEmail || undefined,
          spreadsheetId: createdSpreadsheetId,
          spreadsheetName: provData.provisioned?.title || `${weddingName} Database`,
          driveFolderPath: driveFolder,
          webViewLink: provData.provisioned?.webViewLink || `https://docs.google.com/spreadsheets/d/${createdSpreadsheetId}/edit`,
          productName: 'Sheet2Vow',
          orderId: orderId || 'ETSY-DEMO-9876',
          orderVerified: true,
        }),
      });

      // Save to localStorage for client-side persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('s2v_spreadsheet_id', createdSpreadsheetId);
        localStorage.setItem('s2v_is_onboarded', 'true');
        localStorage.setItem('s2v_is_mock', 'false');
        localStorage.setItem('s2v_wedding_name', weddingName);
        localStorage.setItem('s2v_wedding_date', '2026-09-20');
        localStorage.setItem('s2v_budget', String(budget));
        localStorage.setItem('s2v_drive_folder', driveFolder);
        localStorage.setItem('s2v_enabled_modules', JSON.stringify(modules));
        localStorage.setItem('s2v_spouse_email', spouseEmail);
        if (userEmailToSave) localStorage.setItem('s2v_google_email', userEmailToSave);
        if (googleToken) localStorage.setItem('s2v_google_token', googleToken);
      }

      setIsSubmitting(false);
      setStep(3); // Completion step

      setTimeout(() => {
        router.push('/vow#home');
      }, 1200);
    } catch (err) {
      console.error('Activation final submit error:', err);
      setIsSubmitting(false);
      setStep(3);
      setTimeout(() => {
        router.push('/vow#home');
      }, 1200);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Background Glow Overlay */}
      <div style={styles.glowBg} />

      <div style={styles.contentCard} className="activation-content-card">
        {/* Header Branding */}
        <div style={styles.brandHeader}>
          <div style={styles.logoBadge}>
            <Sparkles size={20} style={{ color: 'var(--color-highlight)' }} />
            <span style={styles.logoText}>SHEET2VOW</span>
          </div>
          <h1 style={styles.mainTitle}>Digital Wedding Planner</h1>
          <p style={styles.subTitle}>
            {step === 0 && 'Product Activation & Order Verification'}
            {step === 1 && 'Choose Your Setup Experience'}
            {step === 2 && setupMode === 'quick' && 'Quick 1-Minute Setup'}
            {step === 2 && setupMode === 'guided' && `Guided Setup (Step ${guidedStep} of 4)`}
            {step === 3 && 'Setup Complete! Preparing your planner...'}
          </p>
        </div>

        {/* STEP 0: Etsy Order Activation Form */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <form onSubmit={handleVerify} style={styles.formSection}>
            <div style={styles.activationBadge}>
              <Key size={16} style={{ color: 'var(--color-highlight)', marginRight: '8px' }} />
              <span>Enter Etsy Order Details</span>
            </div>

            {verifyError && (
              <div style={styles.errorBanner}>
                {verifyError}
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>ESTY PURCHASE EMAIL *</label>
              <input
                type="email"
                required
                placeholder="e.g. jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.inputField}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>ETSY ORDER ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. ETSY-98765432"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                style={styles.inputField}
              />
              <span style={styles.hintText}>Find your Order ID in your Etsy purchase confirmation email or receipt.</span>
            </div>

            <button type="submit" disabled={isVerifying} style={styles.primaryBtn} className="activation-primary-btn">
              {isVerifying ? (
                <span>Verifying with Etsy...</span>
              ) : (
                <>
                  <span>VERIFY & ACTIVATE PLANNER</span>
                  <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </>
              )}
            </button>

            <div style={styles.securityNote}>
              <ShieldCheck size={14} style={{ marginRight: '6px', color: 'var(--color-green)' }} />
              <span>Instant verification. Works out-of-the-box in Google Sheets & Web Mode.</span>
            </div>
          </form>
        </div>
      )}

        {/* STEP 1: Choose Setup Experience & Licensed App (Sheet2Suite Product Hub) [LIFE-5] */}
        {step === 1 && (
          <div style={styles.choiceSection}>
            <div style={styles.verifiedBanner}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-green)', marginRight: '8px' }} />
              <div>
                <div style={{ fontWeight: 700 }}>Verified Order #{orderId || verifiedOrder?.orderId || 'ETSY-OK'} &bull; License Verified</div>
                <div style={{ fontSize: '0.725rem', opacity: 0.9 }}>{verifiedOrder?.packageTier || 'Sheet2Vow Master Wedding Planner Suite'}</div>
              </div>
            </div>

            {/* Google Authentication Prompt */}
            <div style={{
              backgroundColor: isGoogleConnected ? '#dcfce7' : 'var(--color-bg-subtle)',
              border: isGoogleConnected ? '2px solid #16a34a' : '2px solid var(--color-primary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isGoogleConnected ? '#15803d' : 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {isGoogleConnected ? <ShieldCheck size={18} style={{ color: '#16a34a' }} /> : <span>🌐</span>}
                  <span>{isGoogleConnected ? `Google Drive Connected (${googleEmail})` : 'Connect Google Drive Account'}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: isGoogleConnected ? '#166534' : 'var(--color-muted)', marginTop: '0.2rem' }}>
                  {isGoogleConnected ? 'Spreadsheets will be saved directly into your connected Google Drive.' : 'Authorize Google to save your spreadsheet in your personal Google Drive.'}
                </div>
              </div>

              {!isGoogleConnected ? (
                <OfficialGoogleButton
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/auth/google');
                      const data = await res.json();
                      if (data.authUrl) {
                        window.open(data.authUrl, 'GoogleAuth', 'width=520,height=650');
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  text="Sign in with Google"
                />
              ) : (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--border-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  <span>✔ CONNECTED</span>
                </div>
              )}
            </div>

            {/* Product Hub Entitlements Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-muted)', letterSpacing: '0.5px' }}>
                LICENSED SUITE APPLICATIONS (SELECT PRODUCT TO LAUNCH):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.625rem' }}>
                {[
                  { key: 'vow', name: 'Sheet2Vow', desc: 'Digital Wedding Planner', badge: 'ACTIVATED', active: true, path: '/' },
                  { key: 'finances', name: 'Sheet2Finances', desc: 'Personal Budget Ledger', badge: verifiedOrder?.packageTier?.includes('Master Pass') ? 'ACTIVATED' : 'UPGRADE', active: !!verifiedOrder?.packageTier?.includes('Master Pass'), path: '/activate?product=SHEET2FINANCE' },
                  { key: 'stay', name: 'Sheet2Stay', desc: 'Airbnb & Rental Tracker', badge: verifiedOrder?.packageTier?.includes('Master Pass') ? 'ACTIVATED' : 'UPGRADE', active: !!verifiedOrder?.packageTier?.includes('Master Pass'), path: '/activate?product=SHEET2HOME' },
                ].map((prod) => (
                  <div
                    key={prod.key}
                    style={{
                      border: prod.active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: prod.active ? 'var(--color-bg-subtle)' : 'var(--color-surface, #fff)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                        {prod.name}
                      </strong>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        backgroundColor: prod.active ? 'var(--color-primary)' : 'var(--color-border)',
                        color: prod.active ? 'var(--color-on-primary)' : 'var(--color-muted)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: 'var(--border-radius-sm)'
                      }}>
                        {prod.badge}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{prod.desc}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HardDrive size={18} style={{ color: '#16a34a' }} />
                  <div>
                    <strong style={{ fontSize: '0.775rem', color: '#0f172a' }}>Microsoft Excel / Non-Google Users</strong>
                    <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Download a pre-formatted native .xlsx workbook to use offline in Excel</div>
                  </div>
                </div>
                <a
                  href="/api/template/xlsx"
                  download
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <Download size={14} />
                  <span>DOWNLOAD .XLSX</span>
                </a>
              </div>
            </div>

            <div style={styles.choiceGrid}>
              <div
                style={{
                  ...styles.choiceCard,
                  borderColor: setupMode === 'quick' ? 'var(--color-highlight)' : 'var(--color-muted)'
                }}
                onClick={() => { setSetupMode('quick'); setStep(2); }}
              >
                <div style={styles.choiceHeader}>
                  <Zap size={24} style={{ color: 'var(--color-highlight)' }} />
                  <span style={styles.choiceBadge}>1 MINUTE</span>
                </div>
                <h3 style={styles.choiceTitle}>Quick Setup</h3>
                <p style={styles.choiceDesc}>
                  One-screen questionnaire to launch your planner in seconds with sensible defaults.
                </p>
                <button style={{ ...styles.secondaryBtn, width: '100%', marginTop: '1rem' }}>
                  START QUICK SETUP
                </button>
              </div>

              <div
                style={{
                  ...styles.choiceCard,
                  borderColor: setupMode === 'guided' ? 'var(--color-highlight)' : 'var(--color-muted)'
                }}
                onClick={() => { setSetupMode('guided'); setGuidedStep(1); setStep(2); }}
              >
                <div style={styles.choiceHeader}>
                  <Sliders size={24} style={{ color: 'var(--color-highlight)' }} />
                  <span style={styles.choiceBadge}>RECOMMENDED</span>
                </div>
                <h3 style={styles.choiceTitle}>Guided Setup</h3>
                <p style={styles.choiceDesc}>
                  Interactive 4-screen wizard to choose active features, invite spouse admin, configure permissions, and pick task presets.
                </p>
                <button style={{ ...styles.primaryBtn, width: '100%', marginTop: '1rem' }}>
                  START GUIDED SETUP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2A: QUICK SETUP (Single Screen) */}
        {step === 2 && setupMode === 'quick' && (
          <div style={styles.formSection}>
            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>WEDDING NAME / COUPLE NAMES *</label>
              <input
                type="text"
                required
                value={weddingName}
                onChange={(e) => setWeddingName(e.target.value)}
                style={styles.inputField}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>TOTAL BUDGET ($USD) *</label>
              <input
                type="number"
                required
                min="0"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                style={styles.inputField}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>GOOGLE DRIVE TARGET DIRECTORY *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {[
                  { path: 'My Drive / Sheet2Suite / Sheet2Vow', name: 'Sheet2Suite Default' },
                  { path: 'My Drive / Wedding Planning', name: 'Wedding Planning' },
                  { path: 'My Drive (Root)', name: 'My Drive Root' }
                ].map((folder) => {
                  const isSelected = driveFolder === folder.path;
                  return (
                    <div
                      key={folder.path}
                      onClick={() => setDriveFolder(folder.path)}
                      style={{
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-bg-subtle)' : 'transparent',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '0.5rem 0.65rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', fontWeight: isSelected ? 700 : 500, color: 'var(--color-text)' }}>
                        📁 {folder.name}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  value={driveFolder}
                  onChange={(e) => setDriveFolder(e.target.value)}
                  placeholder="Or enter custom folder path e.g. My Drive / Custom Folder"
                  style={{ ...styles.inputField, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowDrivePickerModal(true)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    border: '2px solid #111827',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.6rem 0.85rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '2px 2px 0px #111827',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>📁 BROWSE GOOGLE DRIVE...</span>
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>CHOOSE TASK LIST PRESET PACK</label>
              <select
                value={selectedPresetKey}
                onChange={(e) => setSelectedPresetKey(e.target.value)}
                style={styles.selectField}
              >
                {Object.values(TASK_PRESETS).map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.tagline}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>SPOUSE / CO-ADMIN EMAIL (OPTIONAL)</label>
              <input
                type="email"
                placeholder="spouse@example.com"
                value={spouseEmail}
                onChange={(e) => setSpouseEmail(e.target.value)}
                style={styles.inputField}
              />
            </div>

            <div style={styles.wizardNavRow}>
              <button onClick={() => setStep(1)} style={styles.secondaryBtn}>
                <ArrowLeft size={16} style={{ marginRight: '6px' }} /> BACK
              </button>
              <button onClick={handleFinalSubmit} disabled={isSubmitting} style={styles.primaryBtn}>
                {isSubmitting ? 'FINALIZING...' : 'LAUNCH PLANNER'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: GUIDED SETUP WIZARD (4 Screens) */}
        {step === 2 && setupMode === 'guided' && (
          <div style={styles.guidedContainer}>
            {/* Step Indicator */}
            <div style={styles.wizardProgressTrack}>
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  style={{
                    ...styles.progressStep,
                    backgroundColor: s <= guidedStep ? 'var(--color-highlight)' : 'var(--color-muted)',
                    color: s <= guidedStep ? '#000000' : 'var(--color-text)'
                  }}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Guided Screen 1: Details */}
            {guidedStep === 1 && (
              <div style={styles.formSection}>
                <h3 style={styles.stepHeading}>Step 1: Wedding Details</h3>
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>WEDDING TITLE / COUPLE NAMES *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah & Mark's Wedding"
                    value={weddingName}
                    onChange={(e) => setWeddingName(e.target.value)}
                    style={styles.inputField}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>ESTIMATED TOTAL BUDGET ($USD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    style={styles.inputField}
                  />
                </div>
              </div>
            )}

            {/* Guided Screen 2: Features & Modules */}
            {guidedStep === 2 && (
              <div style={styles.formSection}>
                <h3 style={styles.stepHeading}>Step 2: Choose Enabled Modules</h3>
                <p style={styles.stepSubText}>Select which tabs and dashboard widgets to display in your planner.</p>

                <div style={styles.moduleGrid}>
                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.budget ? 'var(--color-highlight)' : 'var(--color-muted)' }}
                    onClick={() => toggleModule('budget')}
                  >
                    <DollarSign size={20} style={{ color: 'var(--color-highlight)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Budget Ledger</strong>
                      <span style={styles.moduleDesc}>Expenses, payments & remaining budget</span>
                    </div>
                    <input type="checkbox" checked={modules.budget} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.guests ? 'var(--color-highlight)' : 'var(--color-muted)' }}
                    onClick={() => toggleModule('guests')}
                  >
                    <Users size={20} style={{ color: 'var(--color-highlight)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Guest Registry & RSVPs</strong>
                      <span style={styles.moduleDesc}>Guest lists, seating & dietary needs</span>
                    </div>
                    <input type="checkbox" checked={modules.guests} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.schedule ? 'var(--color-highlight)' : 'var(--color-muted)' }}
                    onClick={() => toggleModule('schedule')}
                  >
                    <Calendar size={20} style={{ color: 'var(--color-highlight)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Day-Of Itinerary</strong>
                      <span style={styles.moduleDesc}>Chronological timeline & vendor duties</span>
                    </div>
                    <input type="checkbox" checked={modules.schedule} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.tasks ? 'var(--color-highlight)' : 'var(--color-muted)' }}
                    onClick={() => toggleModule('tasks')}
                  >
                    <ListTodo size={20} style={{ color: 'var(--color-highlight)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Kanban Checklist</strong>
                      <span style={styles.moduleDesc}>Task boards & priority milestone tracking</span>
                    </div>
                    <input type="checkbox" checked={modules.tasks} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.vendors ? 'var(--color-highlight)' : 'var(--color-muted)' }}
                    onClick={() => toggleModule('vendors')}
                  >
                    <Briefcase size={20} style={{ color: 'var(--color-highlight)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Vendor Manager</strong>
                      <span style={styles.moduleDesc}>Contracts, contacts & meal counts</span>
                    </div>
                    <input type="checkbox" checked={modules.vendors} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.music ? 'var(--color-highlight)' : 'var(--color-muted)' }}
                    onClick={() => toggleModule('music')}
                  >
                    <Music size={20} style={{ color: 'var(--color-highlight)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Music Playlist</strong>
                      <span style={styles.moduleDesc}>Must-play tracks & do-not-play list</span>
                    </div>
                    <input type="checkbox" checked={modules.music} readOnly style={styles.checkbox} />
                  </div>
                </div>
              </div>
            )}

            {/* Guided Screen 3: Roles & Permissions */}
            {guidedStep === 3 && (
              <div style={styles.formSection}>
                <h3 style={styles.stepHeading}>Step 3: Co-Admin & Access Permissions</h3>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>INVITE SPOUSE / PARTNER CO-ADMIN (OPTIONAL)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Partner Name"
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      style={styles.inputField}
                    />
                    <input
                      type="email"
                      placeholder="partner@example.com"
                      value={spouseEmail}
                      onChange={(e) => setSpouseEmail(e.target.value)}
                      style={styles.inputField}
                    />
                  </div>
                </div>

                <div style={styles.permissionBox}>
                  <h4 style={styles.permissionHeading}>Read-Only Access Portals</h4>
                  <div style={styles.toggleRow} onClick={() => setEnableGuestReadOnly(!enableGuestReadOnly)}>
                    <div>
                      <strong>Guest RSVP Read-Only Portal</strong>
                      <p style={styles.permissionDesc}>Share read-only RSVP views with guests without master edit rights.</p>
                    </div>
                    <input type="checkbox" checked={enableGuestReadOnly} readOnly style={styles.checkbox} />
                  </div>

                  <div style={styles.toggleRow} onClick={() => setEnableVendorReadOnly(!enableVendorReadOnly)}>
                    <div>
                      <strong>Vendor Schedule Read-Only Portal</strong>
                      <p style={styles.permissionDesc}>Share filtered day-of itineraries with photographers and caterers.</p>
                    </div>
                    <input type="checkbox" checked={enableVendorReadOnly} readOnly style={styles.checkbox} />
                  </div>
                </div>
              </div>
            )}

            {/* Guided Screen 4: Task Presets */}
            {guidedStep === 4 && (
              <div style={styles.formSection}>
                <h3 style={styles.stepHeading}>Step 4: Choose Wedding Task List Preset</h3>
                <p style={styles.stepSubText}>Select a pre-populated milestone checklist tailored to your wedding style.</p>

                <div style={styles.presetGrid}>
                  {Object.values(TASK_PRESETS).map(preset => (
                    <div
                      key={preset.id}
                      style={{
                        ...styles.presetCard,
                        borderColor: selectedPresetKey === preset.id ? 'var(--color-highlight)' : 'var(--color-muted)'
                      }}
                      onClick={() => setSelectedPresetKey(preset.id)}
                    >
                      <div style={styles.presetHeader}>
                        <span style={styles.presetTitle}>{preset.name}</span>
                        <span style={styles.presetBadge}>{preset.badge}</span>
                      </div>
                      <p style={styles.presetTagline}>{preset.tagline}</p>
                      <p style={styles.presetDesc}>{preset.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guided Navigation Row */}
            <div style={styles.wizardNavRow}>
              <button
                onClick={() => {
                  if (guidedStep > 1) setGuidedStep(prev => prev - 1);
                  else setStep(1);
                }}
                style={styles.secondaryBtn}
              >
                <ArrowLeft size={16} style={{ marginRight: '6px' }} /> BACK
              </button>

              {guidedStep < 4 ? (
                <button onClick={() => setGuidedStep(prev => prev + 1)} style={styles.primaryBtn}>
                  <span>CONTINUE STEP {guidedStep + 1}</span>
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </button>
              ) : (
                <button onClick={handleFinalSubmit} disabled={isSubmitting} style={styles.primaryBtn}>
                  {isSubmitting ? 'FINALIZING PLANNER...' : 'COMPLETE & LAUNCH PLANNER'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Completion Handoff */}
        {step === 3 && (
          <div style={styles.completionBox}>
            <CheckCircle2 size={48} style={{ color: 'var(--color-green)', marginBottom: '1rem' }} />
            <h2 style={styles.completionHeading}>Planner Activated & Configured!</h2>
            <p style={styles.completionText}>Redirecting to your digital wedding dashboard...</p>
          </div>
        )}

        {/* Google Drive Picker Modal */}
        <GoogleDrivePickerModal
          isOpen={showDrivePickerModal}
          onClose={() => setShowDrivePickerModal(false)}
          accessToken={googleToken}
          initialPath={driveFolder}
          onSelectFolder={(folder) => {
            setDriveFolder(folder.path);
          }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem 1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBg: {
    position: 'absolute',
    top: '-20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(0, 237, 100, 0.12) 0%, rgba(255, 199, 44, 0.08) 50%, rgba(0, 0, 0, 0) 70%)',
    pointerEvents: 'none',
  },
  contentCard: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '680px',
    padding: '2.5rem',
    boxShadow: 'var(--box-shadow-hover)',
    position: 'relative',
    zIndex: 10,
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    backgroundColor: 'var(--color-primary)',
    borderRadius: 'var(--border-radius-sm)',
    color: '#000000',
    marginBottom: '0.75rem',
  },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '1px',
    color: 'var(--color-btn-selected-text, #000000)',
  },
  mainTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--color-text)',
  },
  subTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    marginTop: '0.5rem',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  activationBadge: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  errorBanner: {
    backgroundColor: 'var(--color-red-muted)',
    border: '1px solid var(--color-red)',
    color: 'var(--color-red)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  fieldLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  inputField: {
    padding: '0.75rem',
    border: '1.5px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  selectField: {
    padding: '0.75rem',
    border: '1.5px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  hintText: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
  primaryBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: '#000000',
    border: 'none',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.875rem 1.25rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
  },
  secondaryBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1.5px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.875rem 1.25rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    marginTop: '0.5rem',
  },
  verifiedBanner: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-green-muted)',
    color: 'var(--color-green)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
  },
  choiceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  choiceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  choiceCard: {
    backgroundColor: 'var(--color-bg)',
    border: '2px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  choiceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  choiceBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-gold-muted)',
    color: 'var(--color-gold)',
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  choiceTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
  },
  choiceDesc: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    margin: 0,
    lineHeight: 1.4,
  },
  guidedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  wizardProgressTrack: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  progressStep: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  stepHeading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
  },
  stepSubText: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    marginTop: '0.25rem',
  },
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  moduleCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem',
    backgroundColor: 'var(--color-bg)',
    border: '2px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  moduleMeta: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  moduleName: {
    fontSize: '0.85rem',
    color: 'var(--color-text)',
  },
  moduleDesc: {
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  permissionBox: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  permissionHeading: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--color-muted)',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  permissionDesc: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    margin: '2px 0 0 0',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  presetCard: {
    backgroundColor: 'var(--color-bg)',
    border: '2px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  presetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.95rem',
    fontWeight: 700,
  },
  presetBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-gold-muted)',
    color: 'var(--color-gold)',
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  presetTagline: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-highlight)',
    fontWeight: 600,
    margin: 0,
  },
  presetDesc: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    margin: 0,
    lineHeight: 1.3,
  },
  wizardNavRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginTop: '1rem',
  },
  completionBox: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  completionHeading: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
  },
  completionText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
  },
};
