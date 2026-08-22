'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  HardDrive
} from 'lucide-react';
import OfficialGoogleButton from '@/components/OfficialGoogleButton';
import GoogleDrivePickerModal from '@/components/GoogleDrivePickerModal';
import InfoDisclosure from '@/components/InfoDisclosure';
import StepOrderVerification from '@/components/activate/StepOrderVerification';
import { openGoogleDriveNativePicker } from '@/lib/google/googlePicker';
import { ProductSetupPluginRenderer } from '@/lib/core/activation/pluginRegistry';
import { SUITE_PRODUCTS, VerifiedOrder } from '@/lib/core/activation/types';

export default function ActivationPage() {
  const router = useRouter();

  // Wizard state: 0 = Order Verification, 1 = Google OAuth & Drive Folder, 2 = Product Setup Plugin, 3 = Complete
  const [step, setStep] = useState<number>(0);
  const [targetProductCode, setTargetProductCode] = useState<string>('SHEET2VOW');

  // Activation credentials state
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState<VerifiedOrder | null>(null);

  // Google Session State
  const [googleEmail, setGoogleEmail] = useState<string>('');
  const [googleToken, setGoogleToken] = useState<string>('');
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [showDrivePickerModal, setShowDrivePickerModal] = useState<boolean>(false);
  const [driveFolder, setDriveFolder] = useState('My Drive / Sheet2Suite / Sheet2Vow');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const productParam = params.get('product');

      if (emailParam) setEmail(emailParam);
      if (productParam) setTargetProductCode(productParam.toUpperCase());

      const savedEmail = localStorage.getItem('s2v_google_email');
      const savedToken = localStorage.getItem('s2v_google_token');
      const savedFolder = localStorage.getItem('s2v_drive_folder');

      if (savedEmail) {
        setGoogleEmail(savedEmail);
        setIsGoogleConnected(true);
      }
      if (savedToken) setGoogleToken(savedToken);
      if (savedFolder) setDriveFolder(savedFolder);

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
          if (user?.name) {
            localStorage.setItem('s2v_google_name', user.name);
          }
          if (user?.picture) {
            localStorage.setItem('s2v_google_avatar', user.picture);
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

  const activeProduct = SUITE_PRODUCTS[targetProductCode] || SUITE_PRODUCTS.SHEET2VOW;

  // Step 0: License & Order Verification
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
      if (data.entitledProducts && data.entitledProducts.length > 0) {
        setTargetProductCode(data.entitledProducts[0]);
      }
      setStep(1); // Proceed to Google Connection & Drive Selector
    } catch (err: any) {
      setIsVerifying(false);
      setVerifyError('Network error while verifying order. Please try again.');
    }
  };

  // Launch Official Google Drive Native Picker (with graceful fallback to in-app modal)
  const handleBrowseGoogleDrive = async () => {
    const token = googleToken || (typeof window !== 'undefined' ? localStorage.getItem('s2v_google_token') : null);
    if (token) {
      const opened = await openGoogleDriveNativePicker({
        accessToken: token,
        onSelect: (folder) => {
          setDriveFolder(folder.path);
          if (typeof window !== 'undefined') {
            localStorage.setItem('s2v_drive_folder', folder.path);
          }
        },
        onError: (err) => {
          console.warn('Native Google Picker failed, opening in-app modal fallback:', err);
          setShowDrivePickerModal(true);
        },
      });
      if (!opened) {
        setShowDrivePickerModal(true);
      }
    } else {
      setShowDrivePickerModal(true);
    }
  };

  // Step 2 -> Step 3: Handle Universal Product Setup Completion
  const handleSetupComplete = async (productConfig: any) => {
    setIsSubmitting(true);

    try {
      const currentGoogleToken = googleToken || (typeof window !== 'undefined' ? localStorage.getItem('s2v_google_token') : null);
      const provHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentGoogleToken) provHeaders['Authorization'] = `Bearer ${currentGoogleToken}`;

      const finalProductName = activeProduct.name;
      const workspaceTitle = productConfig.weddingName || `${finalProductName} Workspace`;

      // Step 1: Call universal provisioning endpoint
      const provRes = await fetch('/api/provision', {
        method: 'POST',
        headers: provHeaders,
        body: JSON.stringify({
          accessToken: currentGoogleToken || undefined,
          coupleName: workspaceTitle,
          productName: finalProductName,
          driveFolder: driveFolder,
          budget: productConfig.budget,
        }),
      });

      const provData = await provRes.json();
      if (!provRes.ok || !provData.success || !provData.provisioned?.spreadsheetId) {
        throw new Error(provData.error || 'Failed to provision Google Drive spreadsheet.');
      }

      const createdSpreadsheetId = provData.provisioned.spreadsheetId;
      const userEmailToSave = email || googleEmail || 'user@sheet2suite.com';

      // Step 2: Register workspace in Sheet2Suite database
      await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmailToSave,
          partnerEmail: productConfig.admin1Email || undefined,
          spreadsheetId: createdSpreadsheetId,
          spreadsheetName: provData.provisioned?.title || `${workspaceTitle} Database`,
          driveFolderPath: driveFolder,
          webViewLink: provData.provisioned?.webViewLink || `https://docs.google.com/spreadsheets/d/${createdSpreadsheetId}/edit`,
          productName: finalProductName,
          orderId: orderId || 'VERIFIED-ORDER',
          orderVerified: true,
        }),
      });

      // Client-side state persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('s2v_spreadsheet_id', createdSpreadsheetId);
        localStorage.setItem('s2v_is_onboarded', 'true');
        localStorage.setItem('s2v_is_mock', 'false');
        localStorage.setItem('s2v_drive_folder', driveFolder);
        if (productConfig.weddingName) localStorage.setItem('s2v_wedding_name', productConfig.weddingName);
        if (productConfig.weddingDate) localStorage.setItem('s2v_wedding_date', productConfig.weddingDate);
        if (productConfig.budget !== undefined) localStorage.setItem('s2v_budget', String(productConfig.budget));
        if (productConfig.currency) localStorage.setItem('s2v_currency', productConfig.currency);
        if (productConfig.modules) localStorage.setItem('s2v_enabled_modules', JSON.stringify(productConfig.modules));
        if (productConfig.admin1Email) localStorage.setItem('s2v_spouse_email', productConfig.admin1Email);
        if (productConfig.styleTheme) localStorage.setItem('s2v_style_theme', productConfig.styleTheme);
        if (productConfig.colorMode) localStorage.setItem('s2v_theme', productConfig.colorMode);
        if (productConfig.navLayout) localStorage.setItem('s2v_nav_layout', productConfig.navLayout);
        if (productConfig.taskMode) localStorage.setItem('s2v_task_preset', productConfig.taskMode === 'clean_slate' ? 'CLEAN_SLATE' : productConfig.selectedPresetKey);
        if (productConfig.selectedTaskIds) localStorage.setItem('s2v_selected_task_ids', JSON.stringify(productConfig.selectedTaskIds));
      }

      setIsSubmitting(false);
      setStep(3); // Success step

      setTimeout(() => {
        router.push(`/${activeProduct.id}#home`);
      }, 1200);
    } catch (err) {
      console.error('Universal activation submit error:', err);
      setIsSubmitting(false);
      setStep(3);
      setTimeout(() => {
        router.push(`/${activeProduct.id}#home`);
      }, 1200);
    }
  };

  return (
    <div className="activation-page-container">
      {/* Background Glow Overlay */}
      <div style={styles.glowBg} />

      <div className="activation-content-card">
        {/* Header Branding */}
        <div className="activation-brand-header">
          <div style={styles.logoBadge}>
            <Sparkles size={20} style={{ color: 'var(--color-highlight)' }} />
            <span style={styles.logoText}>{activeProduct.name.toUpperCase()}</span>
          </div>
          <h1 className="activation-main-title">{activeProduct.tagline}</h1>
          <p className="activation-sub-title">
            {step === 0 && 'Product Activation & Order Verification'}
            {step === 1 && 'Connect Google Drive & Target Directory'}
            {step === 2 && `${activeProduct.name} Custom Setup`}
            {step === 3 && 'Setup Complete! Launching your canvas...'}
          </p>
        </div>

        {/* STEP 0: License & Order Verification */}
        {step === 0 && (
          <StepOrderVerification
            email={email}
            orderId={orderId}
            isVerifying={isVerifying}
            verifyError={verifyError}
            setEmail={setEmail}
            setOrderId={setOrderId}
            setVerifyError={setVerifyError}
            onVerify={handleVerify}
          />
        )}

        {/* STEP 1: Google Connection & Target Directory Selection */}
        {step === 1 && (
          <div style={styles.choiceSection}>
            <div style={styles.verifiedBanner}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-green)', marginRight: '8px' }} />
              <div>
                <div style={{ fontWeight: 700 }}>Verified Order #{orderId || verifiedOrder?.orderId || 'ETSY-OK'} &bull; License Active</div>
                <div style={{ fontSize: '0.725rem', opacity: 0.9 }}>{verifiedOrder?.packageTier || `${activeProduct.name} License`}</div>
              </div>
            </div>

            {/* Google Authentication Prompt */}
            <div style={{
              backgroundColor: isGoogleConnected ? '#dcfce7' : 'var(--color-bg-subtle)',
              border: isGoogleConnected ? '2px solid #16a34a' : '2px solid var(--color-primary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.25rem',
              marginBottom: '1rem',
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
                  <InfoDisclosure title="Google Drive Security & Scope">
                    Sheet2Suite uses Google&apos;s minimal <code>drive.file</code> restricted scope. We can ONLY see and manage the spreadsheets created directly by this app inside your Drive. We never have access to your personal files.
                  </InfoDisclosure>
                </div>
                <div style={{ fontSize: '0.75rem', color: isGoogleConnected ? '#166534' : 'var(--color-muted)', marginTop: '0.2rem' }}>
                  {isGoogleConnected ? 'Spreadsheets will be saved directly into your personal Google Drive.' : 'Authorize Google to save your spreadsheet in your personal Google Drive.'}
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

            {/* Google Drive Target Directory Selector */}
            <div style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label style={{ ...styles.fieldLabel, margin: 0, fontSize: '0.825rem', fontWeight: 800 }}>
                    GOOGLE DRIVE TARGET DIRECTORY *
                  </label>
                  <InfoDisclosure title="Google Drive Storage Location">
                    Choose where in your Google Drive to save your new {activeProduct.name} spreadsheet. You can select a preset location or browse existing Drive folders.
                  </InfoDisclosure>
                </div>
              </div>

              <div>
                <div style={{ position: 'relative', width: '100%', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={driveFolder}
                    onChange={(e) => setDriveFolder(e.target.value)}
                    placeholder="e.g. My Drive / Sheet2Suite / Sheet2Vow"
                    style={{
                      ...styles.inputField,
                      width: '100%',
                      margin: 0,
                      paddingLeft: '2.5rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      border: '2px solid var(--color-primary)',
                      backgroundColor: 'var(--color-surface, #ffffff)',
                    }}
                    required
                  />
                  <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', pointerEvents: 'none' }}>
                    📁
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!isGoogleConnected}
                  onClick={handleBrowseGoogleDrive}
                  style={{
                    backgroundColor: isGoogleConnected ? '#0f172a' : 'var(--color-bg-subtle)',
                    color: isGoogleConnected ? '#ffffff' : 'var(--color-muted)',
                    border: isGoogleConnected ? '2px solid var(--color-primary)' : '1.5px dashed var(--color-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.75rem 1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: isGoogleConnected ? 'pointer' : 'not-allowed',
                    opacity: isGoogleConnected ? 1 : 0.65,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                  }}
                >
                  <span>
                    {isGoogleConnected ? '📁 BROWSE GOOGLE DRIVE FOLDERS...' : '📁 CONNECT GOOGLE DRIVE TO BROWSE'}
                  </span>
                </button>
              </div>

              {/* Preselected Folder Shortcuts */}
              <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '0.85rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
                  ⚡ PRESELECTED SHORTCUTS:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { path: `My Drive / Sheet2Suite / ${activeProduct.name}`, name: 'Default App Folder' },
                    { path: 'My Drive / Workspace', name: 'General Workspace' },
                    { path: 'My Drive (Root)', name: 'My Drive Root' }
                  ].map((folder) => {
                    const isSelected = driveFolder === folder.path;
                    return (
                      <div
                        key={folder.path}
                        onClick={() => setDriveFolder(folder.path)}
                        style={{
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '0.65rem 0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', fontWeight: isSelected ? 800 : 600 }}>
                          {folder.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {folder.path}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Next Step Action */}
            <button
              type="button"
              disabled={!isGoogleConnected || !driveFolder.trim()}
              onClick={() => setStep(2)}
              style={{
                ...styles.primaryBtn,
                width: '100%',
                opacity: (!isGoogleConnected || !driveFolder.trim()) ? 0.5 : 1,
                cursor: (!isGoogleConnected || !driveFolder.trim()) ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{isGoogleConnected ? `PROCEED TO ${activeProduct.name.toUpperCase()} SETUP` : 'CONNECT GOOGLE DRIVE TO CONTINUE'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Pluggable Product Setup Plugin (Injected) */}
        {step === 2 && (
          <ProductSetupPluginRenderer
            productCode={targetProductCode}
            productName={activeProduct.name}
            userEmail={email || googleEmail}
            orderId={orderId}
            driveFolder={driveFolder}
            isGoogleConnected={isGoogleConnected}
            onBrowseGoogleDrive={handleBrowseGoogleDrive}
            onChangeDriveFolder={setDriveFolder}
            onComplete={handleSetupComplete}
            onBack={() => setStep(1)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* STEP 3: Provisioning & Launch Complete */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-green, #16a34a)', color: '#ffffff', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-mono)' }}>
              Setup Complete!
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
              Your {activeProduct.name} spreadsheet has been provisioned directly into your Google Drive. Launching your digital canvas now...
            </p>
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        )}
      </div>

      {/* In-App Google Drive Picker Modal Fallback */}
      <GoogleDrivePickerModal
        isOpen={showDrivePickerModal}
        accessToken={googleToken}
        onClose={() => setShowDrivePickerModal(false)}
        onSelectFolder={(folder) => {
          setDriveFolder(folder.path);
          if (typeof window !== 'undefined') {
            localStorage.setItem('s2v_drive_folder', folder.path);
          }
          setShowDrivePickerModal(false);
        }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  glowBg: {
    position: 'fixed',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle at 50% 50%, var(--color-primary-subtle, rgba(79, 70, 229, 0.05)) 0%, transparent 60%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: '20px',
    padding: '0.3rem 0.85rem',
    marginBottom: '0.75rem',
  },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    color: 'var(--color-text)',
  },
  fieldLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.725rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: 'var(--color-text)',
    display: 'block',
    marginBottom: '0.35rem',
  },
  inputField: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    backgroundColor: 'var(--color-surface, #ffffff)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  choiceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  verifiedBanner: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-bg-subtle, #f3f4f6)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.65rem 0.85rem',
    fontSize: '0.8rem',
    marginBottom: '0.75rem',
  },
  primaryBtn: {
    padding: '0.875rem 1.5rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: 'var(--box-shadow-subtle)',
    transition: 'all 0.15s ease',
  },
};
