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
  Download,
  X,
  HardDrive,
  PanelLeft,
  Layout,
  Sun,
  Moon,
  Plus,
  Trash2,
  Palette,
  CheckSquare,
  Square,
  Info
} from 'lucide-react';
import { TASK_PRESETS, TaskPreset } from '@/lib/presets/taskPresets';
import OfficialGoogleButton from '@/components/OfficialGoogleButton';
import GoogleDrivePickerModal from '@/components/GoogleDrivePickerModal';
import InfoDisclosure from '@/components/InfoDisclosure';
import StepOrderVerification from '@/components/activate/StepOrderVerification';
import { openGoogleDriveNativePicker } from '@/lib/google/googlePicker';

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

  // Setup Form State: Wedding Details & Co-Admins
  const [weddingName, setWeddingName] = useState('');
  const [weddingDate, setWeddingDate] = useState('2026-09-20');
  const [admin1Name, setAdmin1Name] = useState('');
  const [admin1Email, setAdmin1Email] = useState('');
  const [admin2Name, setAdmin2Name] = useState('');
  const [admin2Email, setAdmin2Email] = useState('');
  const [showAdmin2, setShowAdmin2] = useState(false);
  const [driveFolder, setDriveFolder] = useState('My Drive / Sheet2Suite / Sheet2Vow');

  // Setup Form State: Feature Details
  const [budget, setBudget] = useState<number | string>(0);
  const [currency, setCurrency] = useState('USD');
  const [taskMode, setTaskMode] = useState<'preset' | 'clean_slate'>('preset');
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('TRADITIONAL');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(() => {
    return (TASK_PRESETS.TRADITIONAL?.tasks || []).map(t => t.taskId);
  });

  // Setup Form State: Workspace Styling & Navigation Experience
  const [styleTheme, setStyleTheme] = useState<'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo'>('editorial');
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [navLayout, setNavLayout] = useState<'sidebar' | 'top'>('sidebar');

  // Backward-compatibility aliases
  const spouseEmail = admin1Email;
  const setSpouseEmail = setAdmin1Email;

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

  // Update selectedTaskIds whenever preset changes
  const handlePresetSelect = (presetKey: string) => {
    setSelectedPresetKey(presetKey);
    const preset = TASK_PRESETS[presetKey];
    if (preset?.tasks) {
      setSelectedTaskIds(preset.tasks.map(t => t.taskId));
    }
  };

  const toggleTaskId = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    const preset = TASK_PRESETS[selectedPresetKey];
    if (preset?.tasks) {
      setSelectedTaskIds(preset.tasks.map(t => t.taskId));
    }
  };

  const deselectAllTasks = () => {
    setSelectedTaskIds([]);
  };

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

      const finalWeddingName = weddingName.trim() || 'Our Wedding';
      const finalBudgetNumber = Number(budget) || 0;

      // Step 1: Provision Google Drive folder & master spreadsheet
      const provRes = await fetch('/api/provision', {
        method: 'POST',
        headers: provHeaders,
        body: JSON.stringify({
          accessToken: googleToken || undefined,
          coupleName: finalWeddingName,
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
          spreadsheetName: provData.provisioned?.title || `${finalWeddingName} Database`,
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
        localStorage.setItem('s2v_wedding_name', finalWeddingName);
        localStorage.setItem('s2v_wedding_date', weddingDate);
        localStorage.setItem('s2v_budget', String(finalBudgetNumber));
        localStorage.setItem('s2v_currency', currency);
        localStorage.setItem('s2v_drive_folder', driveFolder);
        localStorage.setItem('s2v_enabled_modules', JSON.stringify(modules));
        localStorage.setItem('s2v_spouse_email', admin1Email);
        localStorage.setItem('s2v_admin1_name', admin1Name);
        localStorage.setItem('s2v_admin1_email', admin1Email);
        if (showAdmin2 && admin2Email) {
          localStorage.setItem('s2v_admin2_name', admin2Name);
          localStorage.setItem('s2v_admin2_email', admin2Email);
        }
        localStorage.setItem('s2v_style_theme', styleTheme);
        localStorage.setItem('s2v_theme', colorMode);
        localStorage.setItem('s2v_nav_layout', navLayout);
        localStorage.setItem('s2v_task_preset', taskMode === 'clean_slate' ? 'CLEAN_SLATE' : selectedPresetKey);
        localStorage.setItem('s2v_selected_task_ids', JSON.stringify(selectedTaskIds));
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
    <div className="activation-page-container">
      {/* Background Glow Overlay */}
      <div style={styles.glowBg} />

      <div className="activation-content-card">
        {/* Header Branding */}
        <div className="activation-brand-header">
          <div style={styles.logoBadge}>
            <Sparkles size={20} style={{ color: 'var(--color-highlight)' }} />
            <span style={styles.logoText}>SHEET2VOW</span>
          </div>
          <h1 className="activation-main-title">Digital Wedding Planner</h1>
          <p className="activation-sub-title">
            {step === 0 && 'Product Activation & Order Verification'}
            {step === 1 && 'Choose Your Setup Experience'}
            {step === 2 && setupMode === 'quick' && 'Quick 1-Minute Setup'}
            {step === 2 && setupMode === 'guided' && `Guided Setup (Step ${guidedStep} of 4)`}
            {step === 3 && 'Setup Complete! Preparing your planner...'}
          </p>
        </div>

        {/* STEP 0: Etsy Order Activation Form */}
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

        {/* STEP 1: Choose Setup Experience (Google Drive Folder & Setup Mode) */}
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
              marginBottom: '0.5rem',
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
                    Sheet2Vow uses Google&apos;s minimal <code>drive.file</code> restricted scope. We can ONLY see and manage the spreadsheets created directly by this app inside your Drive. We never have access to any other files or personal data.
                  </InfoDisclosure>
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

            {/* Mandatory Google Drive Target Directory Selector */}
            <div style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.25rem',
              marginBottom: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              {/* Card Header & Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label style={{ ...styles.fieldLabel, margin: 0, fontSize: '0.825rem', fontWeight: 800 }}>
                    GOOGLE DRIVE TARGET DIRECTORY *
                  </label>
                  <InfoDisclosure title="Google Drive Storage Location">
                    Choose where in your Google Drive to save your new Sheet2Vow spreadsheet database. You can select one of the preselected shortcut locations below, browse your existing Drive folders, or type a custom folder path.
                  </InfoDisclosure>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  Required for Setup
                </span>
              </div>

              {/* 1. TOP: Prominent Active Target Folder Path & Browse Button */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    TARGET FOLDER PATH:
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', color: 'var(--color-muted)' }}>
                    Auto-created if new
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
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
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
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
                      backgroundColor: isGoogleConnected ? '#0f172a' : 'var(--color-bg-subtle, #f3f4f6)',
                      color: isGoogleConnected ? '#ffffff' : 'var(--color-muted)',
                      border: isGoogleConnected ? '2px solid var(--color-primary)' : '1.5px dashed var(--color-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.75rem 1rem',
                      minHeight: '46px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: isGoogleConnected ? 'pointer' : 'not-allowed',
                      opacity: isGoogleConnected ? 1 : 0.65,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: isGoogleConnected ? '0 2px 5px rgba(0,0,0,0.12)' : 'none',
                      transition: 'all 0.15s ease',
                      width: '100%',
                    }}
                  >
                    <span>
                      {isGoogleConnected ? '📁 BROWSE GOOGLE DRIVE FOLDERS...' : '📁 CONNECT GOOGLE DRIVE TO BROWSE'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. BOTTOM: Preselected Quick Shortcuts with clear explanation */}
              <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '0.85rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>⚡</span>
                    <span>PRESELECTED FOLDER SHORTCUTS</span>
                  </div>
                  <p style={{ fontSize: '0.725rem', color: 'var(--color-muted)', margin: '0.2rem 0 0 0' }}>
                    Tap any shortcut below to instantly set standard folder destinations:
                  </p>
                </div>

                <div className="preselected-shortcuts-grid">
                  {[
                    { path: 'My Drive / Sheet2Suite / Sheet2Vow', name: 'Sheet2Suite Default', tag: 'RECOMMENDED' },
                    { path: 'My Drive / Wedding Planning', name: 'Wedding Planning', tag: null },
                    { path: 'My Drive (Root)', name: 'My Drive Root', tag: null }
                  ].map((folder) => {
                    const isSelected = driveFolder === folder.path;
                    return (
                      <div
                        key={folder.path}
                        onClick={() => setDriveFolder(folder.path)}
                        style={{
                          border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '0.75rem 0.85rem',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.9rem' }}>📁</span>
                          {folder.tag && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 800, backgroundColor: 'var(--color-gold-muted)', color: 'var(--color-gold)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                              {folder.tag}
                            </span>
                          )}
                          {isSelected && !folder.tag && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                              ✓ SELECTED
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', fontWeight: isSelected ? 800 : 600, color: 'var(--color-text)' }}>
                          {folder.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {folder.path}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Setup Experience Cards */}
            <div style={styles.choiceGrid}>
              {/* Card 1: Quick Setup */}
              <div
                style={{
                  ...styles.choiceCard,
                  borderColor: setupMode === 'quick' ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: setupMode === 'quick' ? 'var(--color-bg-subtle)' : 'var(--color-surface, #ffffff)',
                  boxShadow: setupMode === 'quick' ? '0 0 0 1px var(--color-primary), var(--box-shadow-subtle)' : 'none',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => setSetupMode('quick')}
              >
                <div style={styles.choiceHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={22} style={{ color: setupMode === 'quick' ? 'var(--color-primary)' : 'var(--color-muted)' }} />
                    <span style={styles.choiceBadge}>1 MINUTE</span>
                  </div>
                  {setupMode === 'quick' && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--border-radius-sm)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}>
                      <Check size={12} /> SELECTED
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <h3 style={{ ...styles.choiceTitle, margin: 0 }}>Quick Setup</h3>
                  <div onClick={(e) => e.stopPropagation()}>
                    <InfoDisclosure title="Quick Setup Details">
                      Quick setup creates your Google Sheet workspace instantly using sensible defaults (budget, task list, and modules). You can customize everything later in Settings.
                    </InfoDisclosure>
                  </div>
                </div>

                <p style={styles.choiceDesc}>
                  One-screen questionnaire to launch your planner in seconds.
                </p>
              </div>

              {/* Card 2: Guided Setup */}
              <div
                style={{
                  ...styles.choiceCard,
                  borderColor: setupMode === 'guided' ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: setupMode === 'guided' ? 'var(--color-bg-subtle)' : 'var(--color-surface, #ffffff)',
                  boxShadow: setupMode === 'guided' ? '0 0 0 1px var(--color-primary), var(--box-shadow-subtle)' : 'none',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => setSetupMode('guided')}
              >
                <div style={styles.choiceHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sliders size={22} style={{ color: setupMode === 'guided' ? 'var(--color-primary)' : 'var(--color-muted)' }} />
                    <span style={styles.choiceBadge}>RECOMMENDED</span>
                  </div>
                  {setupMode === 'guided' && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--border-radius-sm)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}>
                      <Check size={12} /> SELECTED
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <h3 style={{ ...styles.choiceTitle, margin: 0 }}>Guided Setup</h3>
                  <div onClick={(e) => e.stopPropagation()}>
                    <InfoDisclosure title="Guided Setup Features">
                      Step-by-step 4-screen wizard to select enabled planning modules, invite your partner/co-planner, pick pre-built task checklists, and configure vendor permissions.
                    </InfoDisclosure>
                  </div>
                </div>

                <p style={styles.choiceDesc}>
                  Customize active features, spouse co-admin, and task presets.
                </p>
              </div>
            </div>

            {/* Single Unified "Start Setup" Button */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                disabled={!isGoogleConnected || !driveFolder.trim() || !setupMode}
                onClick={() => {
                  if (!isGoogleConnected || !driveFolder.trim() || !setupMode) return;
                  if (setupMode === 'quick') {
                    setStep(2);
                  } else {
                    setGuidedStep(1);
                    setStep(2);
                  }
                }}
                style={{
                  ...styles.primaryBtn,
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  opacity: (!isGoogleConnected || !driveFolder.trim() || !setupMode) ? 0.5 : 1,
                  cursor: (!isGoogleConnected || !driveFolder.trim() || !setupMode) ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>
                  {!isGoogleConnected
                    ? 'CONNECT GOOGLE DRIVE TO CONTINUE'
                    : `START ${setupMode === 'quick' ? 'QUICK SETUP' : 'GUIDED SETUP'}`}
                </span>
                <ArrowRight size={18} />
              </button>
              {(!isGoogleConnected || !driveFolder.trim() || !setupMode) && (
                <span style={{ fontSize: '0.725rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                  {!isGoogleConnected
                    ? '⚠ Please connect your Google Drive account above to continue'
                    : !driveFolder.trim()
                    ? '⚠ Please specify a Google Drive folder above'
                    : '⚠ Please select a Setup experience'}
                </span>
              )}
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
                placeholder="e.g. Sarah & Mark's Wedding"
                value={weddingName}
                onChange={(e) => setWeddingName(e.target.value)}
                style={styles.inputField}
              />
            </div>

            {/* Enabled Planning Features Checkboxes */}
            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>ENABLED PLANNING MODULES & FEATURES</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.5rem',
                marginTop: '0.25rem',
              }}>
                {[
                  { key: 'budget' as const, label: 'Financials & Budget', icon: <DollarSign size={16} style={{ color: 'var(--color-highlight)' }} /> },
                  { key: 'guests' as const, label: 'Guests & RSVPs', icon: <Users size={16} style={{ color: 'var(--color-highlight)' }} /> },
                  { key: 'schedule' as const, label: 'Day-Of Itinerary', icon: <Calendar size={16} style={{ color: 'var(--color-highlight)' }} /> },
                  { key: 'tasks' as const, label: 'Tasks & Checklist', icon: <ListTodo size={16} style={{ color: 'var(--color-highlight)' }} /> },
                  { key: 'vendors' as const, label: 'Vendors Directory', icon: <Briefcase size={16} style={{ color: 'var(--color-highlight)' }} /> },
                  { key: 'music' as const, label: 'Music & DJ Playlist', icon: <Music size={16} style={{ color: 'var(--color-highlight)' }} /> },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => toggleModule(item.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.75rem',
                      backgroundColor: modules[item.key] ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)',
                      border: modules[item.key] ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: modules[item.key] ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {item.icon}
                      <span style={{ fontSize: '0.775rem', fontWeight: modules[item.key] ? 800 : 500, color: 'var(--color-text)' }}>
                        {item.label}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={modules[item.key]}
                      readOnly
                      style={{ ...styles.checkbox, margin: 0, cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Total Budget Input (Only displayed if Financials & Budget is checked) */}
            {modules.budget && (
              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>TOTAL BUDGET *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  value={budget}
                  onFocus={(e) => {
                    if (budget === 0 || budget === '0' || budget === '') {
                      setBudget('');
                    } else {
                      e.target.select();
                    }
                  }}
                  onBlur={() => {
                    if (budget === '' || budget === undefined) {
                      setBudget(0);
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setBudget('');
                    } else {
                      setBudget(Number(val));
                    }
                  }}
                  style={styles.inputField}
                />
              </div>
            )}

            {/* Task List Preset Dropdown (Only displayed if Tasks & Checklist is checked) */}
            {modules.tasks && (
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
            )}

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
              <button onClick={() => setStep(1)} style={{ ...styles.secondaryBtn, minWidth: '90px' }}>
                <ArrowLeft size={16} style={{ marginRight: '6px' }} /> BACK
              </button>
              <button onClick={handleFinalSubmit} disabled={isSubmitting} style={{ ...styles.primaryBtn, flex: 1 }}>
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
                    backgroundColor: s <= guidedStep ? 'var(--color-primary)' : 'var(--color-muted)',
                    color: s <= guidedStep ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)'
                  }}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Guided Screen 1: Wedding Details & Co-Admins */}
            {guidedStep === 1 && (
              <div style={styles.formSection}>
                <div>
                  <h3 style={styles.stepHeading}>Step 1: Wedding Details & Co-Admins</h3>
                  <p style={styles.stepSubText}>Enter your couple name, event date, and optionally add co-planners.</p>
                </div>

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
                  <label style={styles.fieldLabel}>WEDDING DATE *</label>
                  <input
                    type="date"
                    required
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    style={styles.inputField}
                  />
                </div>

                {/* Co-Admin User Access */}
                <div style={{
                  marginTop: '0.25rem',
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <UserPlus size={16} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        ADDITIONAL CO-ADMIN USER ACCESS (UP TO 2)
                      </span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <InfoDisclosure title="Co-Admin Access Details">
                        Co-admins will be granted full collaborative edit access to the underlying wedding database Google Sheet in Google Drive.
                      </InfoDisclosure>
                    </div>
                  </div>

                  {/* Admin 1 (e.g. Partner / Spouse) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <label style={{ ...styles.fieldLabel, fontSize: '0.7rem' }}>CO-ADMIN 1 NAME</label>
                      <input
                        type="text"
                        placeholder="Partner Name (e.g. Alex)"
                        value={admin1Name}
                        onChange={(e) => setAdmin1Name(e.target.value)}
                        style={{ ...styles.inputField, minHeight: '42px', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ ...styles.fieldLabel, fontSize: '0.7rem' }}>CO-ADMIN 1 EMAIL</label>
                      <input
                        type="email"
                        placeholder="partner@example.com"
                        value={admin1Email}
                        onChange={(e) => setAdmin1Email(e.target.value)}
                        style={{ ...styles.inputField, minHeight: '42px', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>

                  {/* Admin 2 (Optional) */}
                  {showAdmin2 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border)' }}>
                      <div>
                        <label style={{ ...styles.fieldLabel, fontSize: '0.7rem' }}>CO-ADMIN 2 NAME</label>
                        <input
                          type="text"
                          placeholder="Planner Name (e.g. Sam)"
                          value={admin2Name}
                          onChange={(e) => setAdmin2Name(e.target.value)}
                          style={{ ...styles.inputField, minHeight: '42px', fontSize: '0.875rem' }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ ...styles.fieldLabel, fontSize: '0.7rem' }}>CO-ADMIN 2 EMAIL</label>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAdmin2(false);
                              setAdmin2Name('');
                              setAdmin2Email('');
                            }}
                            style={{ border: 'none', background: 'transparent', color: 'var(--color-red, #ef4444)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                          >
                            ✕ Remove
                          </button>
                        </div>
                        <input
                          type="email"
                          placeholder="planner@example.com"
                          value={admin2Email}
                          onChange={(e) => setAdmin2Email(e.target.value)}
                          style={{ ...styles.inputField, minHeight: '42px', fontSize: '0.875rem' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAdmin2(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        marginTop: '0.25rem',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-surface, #ffffff)',
                        color: 'var(--color-primary)',
                        border: '1px dashed var(--color-primary)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} /> + Add Second Co-Admin (Optional)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Guided Screen 2: Features & Modules */}
            {guidedStep === 2 && (
              <div style={styles.formSection}>
                <div>
                  <h3 style={styles.stepHeading}>Step 2: Choose Enabled Modules</h3>
                  <p style={styles.stepSubText}>Select which tabs and dashboard widgets to display in your planner.</p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle, #f3f4f6)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--color-muted)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span>You can always enable or disable any of these features later in Settings without losing data.</span>
                </div>

                <div style={styles.moduleGrid}>
                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.budget ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: modules.budget ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)' }}
                    onClick={() => toggleModule('budget')}
                  >
                    <DollarSign size={20} style={{ color: 'var(--color-primary)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Budget Ledger</strong>
                      <span style={styles.moduleDesc}>Expenses, payments & remaining budget</span>
                    </div>
                    <input type="checkbox" checked={modules.budget} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.guests ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: modules.guests ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)' }}
                    onClick={() => toggleModule('guests')}
                  >
                    <Users size={20} style={{ color: 'var(--color-primary)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Guest Registry & RSVPs</strong>
                      <span style={styles.moduleDesc}>Guest lists, seating & dietary needs</span>
                    </div>
                    <input type="checkbox" checked={modules.guests} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.schedule ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: modules.schedule ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)' }}
                    onClick={() => toggleModule('schedule')}
                  >
                    <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Day-Of Itinerary</strong>
                      <span style={styles.moduleDesc}>Chronological timeline & vendor duties</span>
                    </div>
                    <input type="checkbox" checked={modules.schedule} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.tasks ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: modules.tasks ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)' }}
                    onClick={() => toggleModule('tasks')}
                  >
                    <ListTodo size={20} style={{ color: 'var(--color-primary)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Kanban Checklist</strong>
                      <span style={styles.moduleDesc}>Task boards & priority milestone tracking</span>
                    </div>
                    <input type="checkbox" checked={modules.tasks} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.vendors ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: modules.vendors ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)' }}
                    onClick={() => toggleModule('vendors')}
                  >
                    <Briefcase size={20} style={{ color: 'var(--color-primary)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Vendor Manager</strong>
                      <span style={styles.moduleDesc}>Contracts, contacts & meal counts</span>
                    </div>
                    <input type="checkbox" checked={modules.vendors} readOnly style={styles.checkbox} />
                  </div>

                  <div
                    style={{ ...styles.moduleCard, borderColor: modules.music ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: modules.music ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)' }}
                    onClick={() => toggleModule('music')}
                  >
                    <Music size={20} style={{ color: 'var(--color-primary)' }} />
                    <div style={styles.moduleMeta}>
                      <strong style={styles.moduleName}>Music Playlist</strong>
                      <span style={styles.moduleDesc}>Must-play tracks & do-not-play list</span>
                    </div>
                    <input type="checkbox" checked={modules.music} readOnly style={styles.checkbox} />
                  </div>
                </div>
              </div>
            )}

            {/* Guided Screen 3: Feature Details (Budget & Tasks) */}
            {guidedStep === 3 && (
              <div style={styles.formSection}>
                <div>
                  <h3 style={styles.stepHeading}>Step 3: Feature Details & Configuration</h3>
                  <p style={styles.stepSubText}>Fine-tune your financial budget and initial milestone task checklist.</p>
                </div>

                {/* Section 1: Financials if enabled */}
                {modules.budget && (
                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    border: '2px solid var(--color-primary)',
                    borderRadius: 'var(--border-radius-md)',
                    boxShadow: 'var(--box-shadow-subtle)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
                      <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
                      <h4 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        FINANCIALS & BUDGET SETTINGS
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={styles.fieldLabel}>ESTIMATED TOTAL BUDGET *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="0"
                          value={budget}
                          onFocus={(e) => {
                            if (budget === 0 || budget === '0' || budget === '') {
                              setBudget('');
                            } else {
                              e.target.select();
                            }
                          }}
                          onBlur={() => {
                            if (budget === '' || budget === undefined) {
                              setBudget(0);
                            }
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              setBudget('');
                            } else {
                              setBudget(Number(val));
                            }
                          }}
                          style={styles.inputField}
                        />
                      </div>
                      <div>
                        <label style={styles.fieldLabel}>PREFERRED CURRENCY</label>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                          {[
                            { code: 'USD', symbol: '$' },
                            { code: 'CAD', symbol: '$' },
                            { code: 'GBP', symbol: '£' },
                            { code: 'EUR', symbol: '€' },
                            { code: 'AUD', symbol: '$' }
                          ].map(c => {
                            const isSel = currency === c.code;
                            return (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => setCurrency(c.code)}
                                style={{
                                  flex: '1 1 auto',
                                  minHeight: '44px',
                                  padding: '0.4rem 0.6rem',
                                  border: isSel ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                  backgroundColor: isSel ? 'var(--color-primary)' : 'var(--color-bg)',
                                  color: isSel ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                                  borderRadius: 'var(--border-radius-sm)',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.8rem',
                                  fontWeight: isSel ? 800 : 500,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {c.code} ({c.symbol})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: Tasks & Checklist if enabled */}
                {modules.tasks && (
                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    border: '2px solid var(--color-primary)',
                    borderRadius: 'var(--border-radius-md)',
                    boxShadow: 'var(--box-shadow-subtle)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ListTodo size={18} style={{ color: 'var(--color-primary)' }} />
                        <h4 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                          TASK LIST & KANBAN CHECKLIST SETUP
                        </h4>
                      </div>
                    </div>

                    {/* Task Mode Selector: Pre-populated vs Clean Slate */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div
                        onClick={() => setTaskMode('preset')}
                        style={{
                          padding: '0.75rem',
                          border: taskMode === 'preset' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: taskMode === 'preset' ? 'var(--color-bg-subtle, #f3f4f6)' : 'var(--color-bg)',
                          borderRadius: 'var(--border-radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>🌟 Pre-populated Preset</strong>
                          <input type="radio" checked={taskMode === 'preset'} readOnly style={{ cursor: 'pointer' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                          Start with structured milestone tasks you can customize.
                        </span>
                      </div>

                      <div
                        onClick={() => setTaskMode('clean_slate')}
                        style={{
                          padding: '0.75rem',
                          border: taskMode === 'clean_slate' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: taskMode === 'clean_slate' ? 'var(--color-bg-subtle, #f3f4f6)' : 'var(--color-bg)',
                          borderRadius: 'var(--border-radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>📄 Clean Slate</strong>
                          <input type="radio" checked={taskMode === 'clean_slate'} readOnly style={{ cursor: 'pointer' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                          Empty task board to build your checklist from scratch.
                        </span>
                      </div>
                    </div>

                    {/* If Preset mode, display Preset Packs and Granular Task Checklist */}
                    {taskMode === 'preset' && (
                      <div>
                        <label style={{ ...styles.fieldLabel, marginBottom: '0.4rem', display: 'block' }}>CHOOSE PRESET STYLE</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.85rem' }}>
                          {Object.values(TASK_PRESETS).map(preset => {
                            const isSelected = selectedPresetKey === preset.id;
                            return (
                              <div
                                key={preset.id}
                                onClick={() => handlePresetSelect(preset.id)}
                                style={{
                                  padding: '0.6rem',
                                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                  backgroundColor: isSelected ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)',
                                  borderRadius: 'var(--border-radius-sm)',
                                  cursor: 'pointer',
                                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                    {preset.name.split(' ')[0]}
                                  </span>
                                  <span style={{ fontSize: '0.6rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #ffffff)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontWeight: 700 }}>
                                    {preset.badge}
                                  </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.675rem', color: 'var(--color-muted)', lineHeight: 1.2 }}>
                                  {preset.tagline}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Granular Task Item Checklist */}
                        <div style={{
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', fontWeight: 800, color: 'var(--color-text)' }}>
                              PRE-POPULATED TASKS ({selectedTaskIds.length} of {(TASK_PRESETS[selectedPresetKey]?.tasks || []).length} SELECTED)
                            </span>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={selectAllTasks}
                                style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', padding: '0.2rem 0.5rem', backgroundColor: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border)', borderRadius: '3px', cursor: 'pointer' }}
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={deselectAllTasks}
                                style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', padding: '0.2rem 0.5rem', backgroundColor: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border)', borderRadius: '3px', cursor: 'pointer' }}
                              >
                                Deselect All
                              </button>
                            </div>
                          </div>

                          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '0.25rem' }}>
                            {(TASK_PRESETS[selectedPresetKey]?.tasks || []).map(task => {
                              const isChecked = selectedTaskIds.includes(task.taskId);
                              return (
                                <div
                                  key={task.taskId}
                                  onClick={() => toggleTaskId(task.taskId)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.4rem 0.6rem',
                                    backgroundColor: isChecked ? 'var(--color-surface, #ffffff)' : 'transparent',
                                    border: isChecked ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    borderRadius: 'var(--border-radius-sm)',
                                    cursor: 'pointer',
                                    gap: '0.5rem'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      readOnly
                                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                    <span style={{ fontSize: '0.775rem', color: isChecked ? 'var(--color-text)' : 'var(--color-muted)', fontWeight: isChecked ? 600 : 400 }}>
                                      {task.taskName}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                                    <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', padding: '0.1rem 0.35rem', backgroundColor: 'var(--color-bg-subtle, #e5e7eb)', borderRadius: '3px', color: 'var(--color-muted)' }}>
                                      {task.category}
                                    </span>
                                    <span style={{
                                      fontSize: '0.625rem',
                                      fontFamily: 'var(--font-mono)',
                                      padding: '0.1rem 0.35rem',
                                      borderRadius: '3px',
                                      fontWeight: 700,
                                      backgroundColor: task.priority === 'High' ? 'var(--color-red-muted, #fee2e2)' : 'var(--color-bg-subtle, #e5e7eb)',
                                      color: task.priority === 'High' ? 'var(--color-red, #dc2626)' : 'var(--color-text)'
                                    }}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* If neither Financials nor Tasks is active */}
                {!modules.budget && !modules.tasks && (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--border-radius-md)'
                  }}>
                    <CheckCircle2 size={36} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
                    <h4 style={{ margin: '0 0 0.25rem 0', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>
                      Optimal Setup Ready!
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                      Your selected planning modules are configured with optimal presets. Click continue to personalize your theme!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Guided Screen 4: Workspace Styling & Navigation Experience */}
            {guidedStep === 4 && (
              <div style={styles.formSection}>
                <div>
                  <h3 style={styles.stepHeading}>Step 4: Workspace Styling & Navigation</h3>
                  <p style={styles.stepSubText}>Customize your design theme, appearance mode, and navigation layout.</p>
                </div>

                {/* 1. Navigation Experience (Default: Left-Hand Nav) */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: '2px solid var(--color-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: 'var(--box-shadow-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    <PanelLeft size={18} style={{ color: 'var(--color-primary)' }} />
                    <h4 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                      NAVIGATION LAYOUT EXPERIENCE
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {/* Left-Hand Nav (Default) */}
                    <div
                      onClick={() => setNavLayout('sidebar')}
                      style={{
                        padding: '0.875rem',
                        border: navLayout === 'sidebar' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: navLayout === 'sidebar' ? 'var(--color-bg-subtle, #f3f4f6)' : 'var(--color-bg)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <PanelLeft size={16} style={{ color: 'var(--color-primary)' }} />
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>Left-Hand Nav</strong>
                        </div>
                        <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 800, backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary, #ffffff)', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                          DEFAULT
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.725rem', color: 'var(--color-muted)', lineHeight: 1.3 }}>
                        Modern desktop app layout with collapsible sidebar menu.
                      </p>
                    </div>

                    {/* Top Nav */}
                    <div
                      onClick={() => setNavLayout('top')}
                      style={{
                        padding: '0.875rem',
                        border: navLayout === 'top' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: navLayout === 'top' ? 'var(--color-bg-subtle, #f3f4f6)' : 'var(--color-bg)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Layout size={16} style={{ color: 'var(--color-primary)' }} />
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>Top Nav Header</strong>
                        </div>
                        <input type="radio" checked={navLayout === 'top'} readOnly style={{ cursor: 'pointer' }} />
                      </div>
                      <p style={{ margin: 0, fontSize: '0.725rem', color: 'var(--color-muted)', lineHeight: 1.3 }}>
                        Traditional website style with navigation links across the top header.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Style Theme & Color Mode */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: '2px solid var(--color-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: 'var(--box-shadow-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Palette size={18} style={{ color: 'var(--color-primary)' }} />
                      <h4 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        DESIGN STYLE THEME
                      </h4>
                    </div>

                    {/* Light / Dark Mode Toggle */}
                    <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--color-bg)', padding: '0.2rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)' }}>
                      <button
                        type="button"
                        onClick={() => setColorMode('light')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          border: 'none',
                          backgroundColor: colorMode === 'light' ? 'var(--color-primary)' : 'transparent',
                          color: colorMode === 'light' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                          borderRadius: '3px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Sun size={12} /> Light
                      </button>
                      <button
                        type="button"
                        onClick={() => setColorMode('dark')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          border: 'none',
                          backgroundColor: colorMode === 'dark' ? 'var(--color-primary)' : 'transparent',
                          color: colorMode === 'dark' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                          borderRadius: '3px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Moon size={12} /> Dark
                      </button>
                    </div>
                  </div>

                  {/* 4 Themes: Editorial, Neo-Brutalism, Botanical, Tuxedo */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {[
                      { id: 'editorial' as const, name: 'Editorial Elegance', tag: 'Classic Serif', desc: 'Warm ivory canvas, elegant typography.' },
                      { id: 'neo-brutalism' as const, name: 'Neo-Brutalism', tag: 'Bold & Modern', desc: 'High contrast borders, techno aesthetic.' },
                      { id: 'botanical-romance' as const, name: 'Botanical Romance', tag: 'Sage & Green', desc: 'Soft organic greens and delicate aesthetic.' },
                      { id: 'midnight-tuxedo' as const, name: 'Midnight Tuxedo', tag: 'Obsidian & Gold', desc: 'Deep obsidian tones with formal gold accents.' }
                    ].map(t => {
                      const isSel = styleTheme === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setStyleTheme(t.id)}
                          style={{
                            padding: '0.75rem',
                            border: isSel ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            backgroundColor: isSel ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)',
                            borderRadius: 'var(--border-radius-sm)',
                            cursor: 'pointer',
                            boxShadow: isSel ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.775rem', color: 'var(--color-text)', fontWeight: isSel ? 800 : 600 }}>
                              {t.name}
                            </strong>
                          </div>
                          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700 }}>
                            {t.tag}
                          </span>
                          <p style={{ margin: 0, fontSize: '0.675rem', color: 'var(--color-muted)', lineHeight: 1.25 }}>
                            {t.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.85rem',
                  backgroundColor: 'var(--color-bg-subtle, #f3f4f6)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--color-muted)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span>You can change your theme, color mode, and navigation layout anytime in Settings.</span>
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
                style={{ ...styles.secondaryBtn, minWidth: '90px' }}
              >
                <ArrowLeft size={16} style={{ marginRight: '6px' }} /> BACK
              </button>

              {guidedStep < 4 ? (
                <button onClick={() => setGuidedStep(prev => prev + 1)} style={{ ...styles.primaryBtn, flex: 1 }}>
                  <span>CONTINUE STEP {guidedStep + 1}</span>
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </button>
              ) : (
                <button onClick={handleFinalSubmit} disabled={isSubmitting} style={{ ...styles.primaryBtn, flex: 1 }}>
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
    fontSize: '0.8rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    letterSpacing: '0.3px',
  },
  inputField: {
    padding: '0.75rem 0.85rem',
    border: '1.5px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '1rem',
    minHeight: '48px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  selectField: {
    padding: '0.75rem 0.85rem',
    border: '1.5px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '1rem',
    minHeight: '48px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  hintText: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
  primaryBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    border: 'none',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.875rem 1.5rem',
    minHeight: '48px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
    boxSizing: 'border-box',
    boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
  },
  secondaryBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-surface, #ffffff)',
    color: 'var(--color-text, #111827)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.875rem 1.25rem',
    minHeight: '48px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'all 0.15s ease',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
    gap: '0.75rem',
    marginTop: '1.25rem',
    flexWrap: 'wrap',
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
