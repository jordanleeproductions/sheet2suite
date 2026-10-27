'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  HardDrive,
  AlertCircle
} from 'lucide-react';
import OfficialGoogleButton from '@/components/OfficialGoogleButton';
import InfoDisclosure from '@/components/InfoDisclosure';
import StepOrderVerification from '@/components/activate/StepOrderVerification';
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
  const [driveFolder, setDriveFolder] = useState('My Drive / Sheet2Suite / Sheet2Vow');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionStage, setProvisionStage] = useState<number>(0);
  const [provisionError, setProvisionError] = useState<string>('');
  const [lastProductConfig, setLastProductConfig] = useState<any | null>(null);
  const [detectedWorkspace, setDetectedWorkspace] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const orderParam = params.get('orderId') || params.get('order') || params.get('license');
      const productParam = params.get('product');
      const sheetParam = params.get('spreadsheetId') || params.get('sheetId');

      if (sheetParam) {
        router.push(`/vow?spreadsheetId=${encodeURIComponent(sheetParam)}`);
        return;
      }

      if (emailParam) setEmail(emailParam);
      if (orderParam) setOrderId(orderParam);
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

      // Check if user already has an active or co-planned workspace
      const lookupEmail = emailParam || savedEmail;
      if (lookupEmail && savedToken) {
        fetch(`/api/workspaces?email=${encodeURIComponent(lookupEmail)}`, {
          headers: { 'Authorization': `Bearer ${savedToken}` },
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
              setDetectedWorkspace(data.workspaces[0]);
            }
          })
          .catch(() => {});
      }

      // Listen for popup postMessage completion
      const handleAuthMessage = (event: MessageEvent) => {
        // Security: Validate origin matches current domain, local development, or official sheet2suite domains [SEC-2]
        const origin = event.origin || '';
        const isAllowedOrigin = 
          origin === window.location.origin ||
          origin.endsWith('sheet2suite.com') ||
          origin.endsWith('.web.app') ||
          origin.endsWith('.firebaseapp.com') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1');
        if (!isAllowedOrigin) return;

        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          const { user, accessToken } = event.data;
          if (user?.email) {
            setGoogleEmail(user.email);
            setEmail(user.email);
            setIsGoogleConnected(true);
            localStorage.setItem('s2v_google_email', user.email);

            fetch(`/api/workspaces?email=${encodeURIComponent(user.email)}`, {
              headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : undefined,
            })
              .then(res => res.json())
              .then(data => {
                if (data.success && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
                  setDetectedWorkspace(data.workspaces[0]);
                }
              })
              .catch(() => {});
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
  }, [router]);

  const activeProduct = SUITE_PRODUCTS[targetProductCode] || SUITE_PRODUCTS.SHEET2VOW;

  // Keep target Drive folder locked to the standard automated product path
  useEffect(() => {
    const defaultFolder = activeProduct.defaultDriveFolder || `My Drive / Sheet2Suite / ${activeProduct.name}`;
    setDriveFolder(defaultFolder);
  }, [activeProduct.defaultDriveFolder, activeProduct.name]);

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

  // Step 2 -> Step 3: Handle Universal Product Setup Completion
  const handleSetupComplete = async (productConfig: any) => {
    setIsSubmitting(true);
    setProvisionError('');
    setLastProductConfig(productConfig);
    setStep(3);
    setProvisionStage(1);

    try {
      await new Promise(r => setTimeout(r, 400));
      setProvisionStage(2);

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
          weddingDate: productConfig.weddingDate,
          location: productConfig.location,
          currency: productConfig.currency,
          partner1: productConfig.partner1,
          partner2: productConfig.partner2,
        }),
      });

      const provData = await provRes.json();
      if (!provRes.ok || !provData.success || !provData.provisioned?.spreadsheetId) {
        throw new Error(provData.error || 'Failed to provision Google Drive spreadsheet.');
      }

      setProvisionStage(3);
      await new Promise(r => setTimeout(r, 400));

      const createdSpreadsheetId = provData.provisioned.spreadsheetId;
      const userEmailToSave = email || googleEmail || 'user@sheet2suite.com';

      const resolvedPartnerEmail = productConfig.admin2Email || productConfig.partner2?.email || undefined;
      const coPlannersToSave = resolvedPartnerEmail ? [resolvedPartnerEmail] : [];

      setProvisionStage(4);

      // Step 2: Register workspace in Sheet2Suite database
      await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleToken ? { 'Authorization': `Bearer ${googleToken}` } : {}),
        },
        body: JSON.stringify({
          userEmail: userEmailToSave,
          partnerEmail: resolvedPartnerEmail,
          coPlanners: coPlannersToSave,
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
        if (resolvedPartnerEmail) localStorage.setItem('s2v_spouse_email', resolvedPartnerEmail);
        if (productConfig.styleTheme) localStorage.setItem('s2v_style_theme', productConfig.styleTheme);
        if (productConfig.colorMode) localStorage.setItem('s2v_theme', productConfig.colorMode);
        if (productConfig.showTopNav !== undefined) localStorage.setItem('s2v_show_top_nav', String(productConfig.showTopNav));
        if (productConfig.taskMode) localStorage.setItem('s2v_task_preset', productConfig.taskMode === 'clean_slate' ? 'CLEAN_SLATE' : productConfig.selectedPresetKey);
        if (productConfig.selectedTaskIds) localStorage.setItem('s2v_selected_task_ids', JSON.stringify(productConfig.selectedTaskIds));
      }

      setProvisionStage(5);
      setIsSubmitting(false);

      setTimeout(() => {
        router.push(`/${activeProduct.id}#home`);
      }, 1400);
    } catch (err: any) {
      console.error('Universal activation submit error:', err);
      setIsSubmitting(false);
      setStep(2);
      setProvisionError(err?.message || 'Failed to create your spreadsheet in Google Drive. Please verify your Google account permissions and try again.');
    }
  };

  return (
    <div className="activation-page-container">
      {/* Background Glow Overlay */}
      <div style={styles.glowBg} />

      <div className="activation-content-card">
        {/* Top-Level Monarch 3-Step Stepper */}
        {step < 3 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--color-border)',
            position: 'relative',
          }}>
            {[
              { num: 1, label: 'Order License', active: step === 0, done: step > 0 },
              { num: 2, label: 'Google Drive', active: step === 1, done: step > 1 },
              { num: 3, label: 'Wedding Setup', active: step === 2, done: step > 2 },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: s.active || s.done ? 1 : 0.5,
                  transition: 'opacity 0.2s ease',
                }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: s.done ? '#16a34a' : s.active ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                    color: s.done || s.active ? '#ffffff' : 'var(--color-muted)',
                    border: s.active ? '2px solid var(--color-primary)' : s.done ? '2px solid #16a34a' : '1px solid var(--color-border)',
                    boxShadow: s.active ? '0 0 0 3px rgba(79, 70, 229, 0.2)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    {s.done ? <CheckCircle2 size={16} /> : s.num}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: s.active ? 800 : s.done ? 700 : 500,
                    color: s.active ? 'var(--color-text)' : s.done ? 'var(--color-text)' : 'var(--color-muted)',
                    display: 'inline-block',
                  }}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    margin: '0 0.75rem',
                    backgroundColor: step > idx ? '#16a34a' : 'var(--color-border)',
                    transition: 'background-color 0.3s ease',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Header Branding */}
        <div className="activation-brand-header">
          <div style={styles.logoBadge}>
            <Sparkles size={20} style={{ color: 'var(--color-highlight)' }} />
            <span style={styles.logoText}>{activeProduct.name.toUpperCase()}</span>
          </div>
          <h1 className="activation-main-title">{activeProduct.tagline}</h1>
          <p className="activation-sub-title">
            {step === 0 && 'Etsy Order & License Verification'}
            {step === 1 && 'Connect Google Drive & Verify Storage'}
            {step === 2 && `${activeProduct.name} Custom Setup`}
            {step === 3 && (provisionStage === 5 ? 'Setup Complete! Launching your canvas...' : 'Provisioning Your Wedding Canvas...')}
          </p>
        </div>

        {/* Workspace Access Detected Banner */}
        {detectedWorkspace && step === 0 && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={22} style={{ color: '#059669', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#065f46' }}>
                  💍 Workspace / Partner Access Detected!
                </div>
                <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                  You have collaborator access to <strong>{detectedWorkspace.spreadsheetName || 'Wedding Database'}</strong>. No Etsy order verification required!
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const target = detectedWorkspace.productName?.toLowerCase().includes('vow') ? 'vow' : 'vow';
                  router.push(`/${target}?spreadsheetId=${encodeURIComponent(detectedWorkspace.spreadsheetId)}`);
                }}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>ENTER WORKSPACE</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => setDetectedWorkspace(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#065f46',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  padding: '0.6rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>ACTIVATE ANOTHER / NEW ORDER</span>
              </button>
            </div>
          </div>
        )}

        {/* Provisioning Error Card */}
        {provisionError && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: 800, fontSize: '0.95rem' }}>
              <AlertCircle size={20} />
              <span>Google Drive Provisioning Encountered an Issue</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#7f1d1d', margin: '0.5rem 0 1rem 0', lineHeight: 1.5 }}>
              {provisionError}
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => lastProductConfig && handleSetupComplete(lastProductConfig)}
                style={{
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'RETRYING PROVISIONING...' : '🔄 RETRY PROVISIONING SPREADSHEET'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setProvisionError('');
                  setStep(1);
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#991b1b',
                  border: '1px solid #b91c1c',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                RE-CHECK GOOGLE DRIVE SETTINGS
              </button>
            </div>
          </div>
        )}

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
                <div style={{ fontSize: '0.72rem', color: isGoogleConnected ? '#166534' : 'var(--color-muted)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                  ℹ️ <strong>Account flexibility:</strong> Your Google account does not need to match your Etsy purchase email. Your lifetime license will be linked to this Google Drive.
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

            {/* Automated Google Drive Target Directory */}
            <div style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label style={{ ...styles.fieldLabel, margin: 0, fontSize: '0.825rem', fontWeight: 800 }}>
                    GOOGLE DRIVE STORAGE DESTINATION
                  </label>
                  <InfoDisclosure title="Automated Google Drive Organization">
                    To keep your Google Drive organized and secure, your spreadsheet is automatically provisioned into a dedicated Sheet2Suite folder. You have 100% private ownership and can open, edit, or move it anytime.
                  </InfoDisclosure>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#15803d',
                  backgroundColor: 'rgba(22, 163, 74, 0.1)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(22, 163, 74, 0.2)'
                }}>
                  🔒 AUTOMATED & SECURE
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--color-surface, #ffffff)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '0.75rem 1rem',
              }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📁</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    My Drive / Sheet2Suite / {activeProduct.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                    Dedicated application folder automatically created in your personal Google Drive
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', lineHeight: 1.45 }}>
                ✨ <strong>Zero Manual Setup:</strong> We will automatically create this folder and duplicate the master template directly into your Google Drive.
              </div>
            </div>

            {/* Next Step Action */}
            <button
              type="button"
              disabled={!isGoogleConnected}
              onClick={() => setStep(2)}
              style={{
                ...styles.primaryBtn,
                width: '100%',
                opacity: !isGoogleConnected ? 0.5 : 1,
                cursor: !isGoogleConnected ? 'not-allowed' : 'pointer',
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
            onBrowseGoogleDrive={() => {}}
            onChangeDriveFolder={setDriveFolder}
            onComplete={handleSetupComplete}
            onBack={() => setStep(1)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step 3: Sequential Provisioning Animation & Launch */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: provisionStage === 5 ? 'var(--color-green, #16a34a)' : 'rgba(79, 70, 229, 0.1)',
              color: provisionStage === 5 ? '#ffffff' : 'var(--color-primary)',
              marginBottom: '1.25rem',
              boxShadow: 'var(--box-shadow-subtle)',
              transition: 'all 0.3s ease',
            }}>
              {provisionStage === 5 ? (
                <CheckCircle2 size={36} />
              ) : (
                <div style={{
                  width: '28px',
                  height: '28px',
                  border: '3px solid var(--color-primary)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-mono)' }}>
              {provisionStage === 5 ? '🎉 Setup Complete!' : 'Provisioning Your Wedding Canvas...'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1.75rem' }}>
              {provisionStage === 5
                ? `Your ${activeProduct.name} spreadsheet is provisioned. Launching your digital canvas now...`
                : 'Setting up your private Google Drive spreadsheet and personal wedding workspace.'}
            </p>

            {/* 5-Stage Live Provisioning Checklist */}
            <div style={{
              maxWidth: '460px',
              margin: '0 auto 1.5rem auto',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.25rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              {[
                { stage: 1, label: 'Verifying Google Drive account & permissions' },
                { stage: 2, label: `Duplicating master template into ${activeProduct.name} folder` },
                { stage: 3, label: 'Initializing financial budget, guest lists & settings' },
                { stage: 4, label: 'Registering secure multi-device workspace session' },
                { stage: 5, label: 'Workspace ready! Launching your planning canvas' },
              ].map(item => {
                const isPassed = provisionStage > item.stage;
                const isCurrent = provisionStage === item.stage;
                const isPending = provisionStage < item.stage;

                return (
                  <div
                    key={item.stage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.825rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isPassed ? '#16a34a' : isCurrent ? 'var(--color-text)' : 'var(--color-muted)',
                      transition: 'all 0.2s ease',
                      opacity: isPending ? 0.45 : 1,
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor: isPassed ? '#dcfce7' : isCurrent ? 'rgba(79, 70, 229, 0.15)' : 'var(--color-border)',
                      color: isPassed ? '#16a34a' : isCurrent ? 'var(--color-primary)' : 'var(--color-muted)',
                    }}>
                      {isPassed ? (
                        <CheckCircle2 size={16} />
                      ) : isCurrent ? (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                        }} />
                      ) : (
                        <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{item.stage}</span>
                      )}
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legal & Compliance Footer */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-muted)', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-muted)', textDecoration: 'underline' }}>Privacy Policy</a>
          <span>•</span>
          <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-muted)', textDecoration: 'underline' }}>Terms of Service</a>
          <span>•</span>
          <span>Google drive.file scope enforced</span>
        </div>
      </div>
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
