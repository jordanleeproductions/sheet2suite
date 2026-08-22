'use client';

import React, { useState } from 'react';
import {
  Heart,
  Zap,
  Sliders,
  Check,
  ArrowRight,
  ArrowLeft,
  HardDrive,
  UserPlus,
  Sparkles,
  ShieldCheck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { TASK_PRESETS } from '@/lib/presets/taskPresets';
import { ALL_DEFAULT_TASKS } from '@/lib/sheets/mockDb';
import GoogleDrivePickerModal from '@/components/GoogleDrivePickerModal';
import InfoDisclosure from '@/components/InfoDisclosure';

export interface OnboardingResult {
  weddingName: string;
  weddingDate: string;
  budgetThreshold: number;
  driveFolder: string;
  enabledModules: Record<string, boolean>;
  selectedTasks: string[];
  spouseName?: string;
  spouseEmail?: string;
  isDemo?: boolean;
  isMock?: boolean;
}

export interface OnboardingWizardProps {
  initialMode?: 'express' | 'quick' | 'guided';
  onComplete: (data: OnboardingResult) => void;
  onCancel?: () => void;
}

export default function OnboardingWizard({
  initialMode = 'quick',
  onComplete,
  onCancel
}: OnboardingWizardProps) {
  const [mode, setMode] = useState<'express' | 'quick' | 'guided'>(initialMode);
  const [step, setStep] = useState<number>(1);

  // Form States
  const [weddingName, setWeddingName] = useState<string>("Alex & Sam's Wedding");
  const [weddingDate, setWeddingDate] = useState<string>('2026-09-20');
  const [budgetThreshold, setBudgetThreshold] = useState<number>(35000);
  const [driveFolder, setDriveFolder] = useState<string>('My Drive/Wedding Planning');
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('TRADITIONAL');
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    ALL_DEFAULT_TASKS.map((t) => t.taskName)
  );
  const [showCustomTaskChecklist, setShowCustomTaskChecklist] = useState<boolean>(false);
  const [spouseName, setSpouseName] = useState<string>('');
  const [spouseEmail, setSpouseEmail] = useState<string>('');
  const [showDrivePickerModal, setShowDrivePickerModal] = useState<boolean>(false);

  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    guests: true,
    budget: true,
    schedule: true,
    vendors: true,
    tasks: true,
    music: true,
    tables: true,
    photos: true,
    thanks: true,
  });

  // Google OAuth & Provisioning States
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [provisionInfo, setProvisionInfo] = useState<{ spreadsheetId: string; folderPath: string; webViewLink: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleConnect = async () => {
    setIsConnectingGoogle(true);
    setAuthError(null);
    try {
      // Step 1: Request Google OAuth Auth URL from /api/auth/google
      const res = await fetch('/api/auth/google');
      const data = await res.json();

      if (data.authUrl && typeof window !== 'undefined') {
        // Open OAuth popup window
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.authUrl,
          'GoogleOAuthPopup',
          `width=${width},height=${height},top=${top},left=${left}`
        );

        // Fallback: Trigger automated provision via backend route
        const provRes = await fetch('/api/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coupleName: weddingName,
            productName: 'Sheet2Vow',
          }),
        });

        const provData = await provRes.json();
        if (provData.success && provData.provisioned) {
          setProvisionInfo(provData.provisioned);
          setDriveFolder(provData.provisioned.folderPath);
        }
      }
    } catch (err: any) {
      console.error('Google Connect Error:', err);
      // Fallback dev provision
      const devRes = await fetch('/api/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupleName: weddingName, productName: 'Sheet2Vow' }),
      });
      const devData = await devRes.json();
      if (devData.provisioned) {
        setProvisionInfo(devData.provisioned);
      }
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const toggleModule = (key: string) => {
    setEnabledModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTaskSelection = (taskName: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskName) ? prev.filter((t) => t !== taskName) : [...prev, taskName]
    );
  };

  const handleFinish = async (isDemo = false) => {
    if (!isDemo) {
      setIsConnectingGoogle(true);
      try {
        // Step 1: Provision Drive folder & duplicate template at target driveFolder
        const provRes = await fetch('/api/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coupleName: weddingName,
            productName: 'Sheet2Vow',
            driveFolder: driveFolder,
            budget: budgetThreshold,
          }),
        });

        const provData = await provRes.json();
        if (provData.provisioned) {
          // Step 2: Register workspace mapping in Sheet2Suite database
          await fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: googleUserEmail || 'user@sheet2suite.com',
              partnerEmail: spouseEmail || undefined,
              spreadsheetId: provData.provisioned.spreadsheetId,
              spreadsheetName: provData.provisioned.title || `${weddingName} Database`,
              driveFolderPath: driveFolder,
              webViewLink: provData.provisioned.webViewLink,
              productName: 'Sheet2Vow',
            }),
          });
        }
      } catch (err) {
        console.error('Provisioning Error during onboarding:', err);
      } finally {
        setIsConnectingGoogle(false);
      }
    }

    onComplete({
      weddingName,
      weddingDate,
      budgetThreshold,
      driveFolder,
      enabledModules,
      selectedTasks,
      spouseName,
      spouseEmail,
      isDemo,
      isMock: isDemo,
    });
  };

  return (
    <div style={styles.wizardContainer}>
      {/* Mode Selector Header */}
      <div style={styles.modeBar}>
        <button
          type="button"
          onClick={() => { setMode('quick'); setStep(1); }}
          style={{
            ...styles.modeTab,
            backgroundColor: mode === 'quick' ? 'var(--color-primary)' : 'transparent',
            color: mode === 'quick' ? 'var(--color-on-primary)' : 'var(--color-text)',
            fontWeight: mode === 'quick' ? 700 : 500
          }}
        >
          ⚡ QUICK (1 MIN)
        </button>
        <button
          type="button"
          onClick={() => { setMode('guided'); setStep(1); }}
          style={{
            ...styles.modeTab,
            backgroundColor: mode === 'guided' ? 'var(--color-primary)' : 'transparent',
            color: mode === 'guided' ? 'var(--color-on-primary)' : 'var(--color-text)',
            fontWeight: mode === 'guided' ? 700 : 500
          }}
        >
          🧙 GUIDED (4 STEPS)
        </button>
        <button
          type="button"
          onClick={() => handleFinish(true)}
          style={{
            ...styles.modeTab,
            backgroundColor: 'var(--color-gold, #f59e0b)',
            color: '#000000',
            fontWeight: 800
          }}
        >
          ⚡ DEMO JUMP IN
        </button>
      </div>

      {/* QUICK MODE (Single Screen Form) */}
      {mode === 'quick' && (
        <div style={styles.formBody}>
          <div style={styles.stepHeader}>
            <Zap size={24} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h3 style={styles.stepTitle}>Quick 1-Minute Setup</h3>
              <p style={styles.stepDesc}>Configure your wedding title, date, budget limit, and target Google Drive directory in one fast screen.</p>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>WEDDING COUPLE / TITLE *</label>
            <input
              type="text"
              required
              value={weddingName}
              onChange={(e) => setWeddingName(e.target.value)}
              style={styles.input}
              placeholder="e.g. Alex & Sam's Wedding"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>WEDDING DATE *</label>
              <input
                type="date"
                required
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>TOTAL BUDGET LIMIT ($) *</label>
              <input
                type="number"
                required
                min="1"
                value={budgetThreshold}
                onChange={(e) => setBudgetThreshold(Number(e.target.value))}
                style={styles.input}
              />
            </div>
          </div>

          {/* Google Drive Directory Selector & Custom Path */}
          <div style={styles.fieldGroup}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={styles.label}>GOOGLE DRIVE TARGET DIRECTORY *</label>
              <InfoDisclosure title="Target Directory">
                Your master wedding spreadsheet file is stored directly in this Google Drive folder. You can change folders anytime or open it natively in Google Drive.
              </InfoDisclosure>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
                placeholder="Or enter custom folder path e.g. My Drive/Custom Folder"
                style={{ ...styles.input, flex: 1, fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
              />
              <button
                type="button"
                onClick={() => setShowDrivePickerModal(true)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  border: '2px solid #111827',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.5rem 0.85rem',
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

          {/* Google Auth & Provision Status Banner */}
          {provisionInfo && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#dcfce7', border: '1px solid #16a34a', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} />
                <span>GOOGLE DRIVE CONNECTED & MASTER SHEET DUPLICATED</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: '0.25rem' }}>
                Target: <strong>{provisionInfo.folderPath}</strong>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={handleGoogleConnect}
              disabled={isConnectingGoogle}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.75rem',
                backgroundColor: '#ffffff',
                color: '#111827',
                border: '2px solid #111827',
                borderRadius: 'var(--border-radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <HardDrive size={16} style={{ color: 'var(--color-primary)' }} />
              <span>{isConnectingGoogle ? 'CONNECTING...' : '🌐 CONNECT GOOGLE DRIVE'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleFinish(false)}
              style={styles.submitBtn}
            >
              <Sparkles size={16} />
              <span>LAUNCH WORKSPACE</span>
            </button>
          </div>
        </div>
      )}

      {/* GUIDED MODE (4-Step Wizard) */}
      {mode === 'guided' && (
        <div style={styles.formBody}>
          <div style={styles.stepProgress}>
            <span>STEP {step} OF 4</span>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${(step / 4) * 100}%` }} />
            </div>
          </div>

          {/* Guided Step 1: Identity & Date */}
          {step === 1 && (
            <div style={styles.stepSection}>
              <h3 style={styles.stepTitle}>Step 1: Wedding Identity & Budget</h3>
              <p style={styles.stepDesc}>Enter your couple details and financial limit.</p>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>WEDDING COUPLE / TITLE *</label>
                <input
                  type="text"
                  required
                  value={weddingName}
                  onChange={(e) => setWeddingName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>WEDDING DATE *</label>
                  <input
                    type="date"
                    required
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>TOTAL BUDGET LIMIT ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={budgetThreshold}
                    onChange={(e) => setBudgetThreshold(Number(e.target.value))}
                    style={styles.input}
                  />
                </div>
              </div>

              <button type="button" onClick={() => setStep(2)} style={styles.submitBtn}>
                <span>NEXT: DRIVE TARGET & MODULES</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Guided Step 2: Drive Directory & Modules */}
          {step === 2 && (
            <div style={styles.stepSection}>
              <h3 style={styles.stepTitle}>Step 2: Drive Target & Enabled Feature Modules</h3>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>CHOOSE YOUR PLANNING TOOLS</label>
                <div style={styles.modulesGrid}>
                  {[
                    { key: 'guests', label: 'Guest Registry & Seating Charts' },
                    { key: 'budget', label: 'Budget Ledger & Outlays' },
                    { key: 'schedule', label: 'Day-Of Timeline & Up Next' },
                    { key: 'vendors', label: 'Vendor Directory' },
                    { key: 'tasks', label: 'Kanban Checklist' },
                    { key: 'music', label: 'Wedding Playlist & Music' },
                  ].map((mod) => {
                    const isChecked = enabledModules[mod.key];
                    return (
                      <label key={mod.key} style={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleModule(mod.key)}
                        />
                        <span style={{ fontSize: '0.8rem', color: isChecked ? 'var(--color-text)' : 'var(--color-muted)' }}>
                          {mod.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} style={styles.secondaryBtn}>
                  <ArrowLeft size={16} /> BACK
                </button>
                <button type="button" onClick={() => setStep(3)} style={{ ...styles.submitBtn, flex: 1 }}>
                  <span>NEXT: TASK CHECKLIST PRESETS</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Guided Step 3: Task Presets */}
          {step === 3 && (
            <div style={styles.stepSection}>
              <h3 style={styles.stepTitle}>Step 3: Task Preset Pack Selector</h3>
              <p style={styles.stepDesc}>Choose a pre-populated milestone checklist pack tailored to your wedding style.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                {Object.values(TASK_PRESETS).map((preset) => {
                  const isSelected = selectedPresetKey === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetKey(preset.id);
                        if (preset.tasks.length > 0) {
                          setSelectedTasks(preset.tasks.map((t) => t.taskName));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                      style={{
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-bg-subtle)' : 'transparent',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '0.625rem',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                        {preset.name}
                      </strong>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                        {preset.tasks.length} Tasks
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStep(2)} style={styles.secondaryBtn}>
                  <ArrowLeft size={16} /> BACK
                </button>
                <button type="button" onClick={() => setStep(4)} style={{ ...styles.submitBtn, flex: 1 }}>
                  <span>NEXT: SPOUSE & CO-PLANNER</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Guided Step 4: Spouse Invite [ONBOARD-5] */}
          {step === 4 && (
            <div style={styles.stepSection}>
              <h3 style={styles.stepTitle}>Step 4: Invite Spouse / Co-Planner (Optional)</h3>
              <p style={styles.stepDesc}>Add your partner's name & email to pre-configure co-admin access rights.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>SPOUSE / PARTNER NAME</label>
                  <input
                    type="text"
                    placeholder="Partner Name"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>SPOUSE / PARTNER EMAIL</label>
                  <input
                    type="email"
                    placeholder="partner@example.com"
                    value={spouseEmail}
                    onChange={(e) => setSpouseEmail(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setStep(3)} style={styles.secondaryBtn}>
                  <ArrowLeft size={16} /> BACK
                </button>
                <button type="button" onClick={() => handleFinish(false)} style={{ ...styles.submitBtn, flex: 1 }}>
                  <Sparkles size={16} />
                  <span>COMPLETE SETUP & LAUNCH PLANNER</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Google Drive Picker Modal */}
      <GoogleDrivePickerModal
        isOpen={showDrivePickerModal}
        onClose={() => setShowDrivePickerModal(false)}
        initialPath={driveFolder}
        onSelectFolder={(folder) => {
          setDriveFolder(folder.path);
        }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wizardContainer: {
    backgroundColor: 'var(--color-surface, #fff)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: 'var(--box-shadow-subtle)',
    maxWidth: '620px',
    margin: '0 auto',
  },
  modeBar: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  },
  modeTab: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.4rem',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'var(--transition-smooth)'
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  stepTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    margin: 0,
  },
  stepDesc: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    margin: '0.2rem 0 0 0',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  input: {
    padding: '0.625rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.85rem',
    outline: 'none',
  },
  submitBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1.25rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  secondaryBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
  },
  stepProgress: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  progressBar: {
    height: '4px',
    width: '120px',
    backgroundColor: 'var(--color-border)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    transition: 'var(--transition-smooth)',
  },
  stepSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  modulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.5rem',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  }
};
