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
  Check 
} from 'lucide-react';
import { TASK_PRESETS, TaskPreset } from '@/lib/presets/taskPresets';

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

  // Setup Form State
  const [weddingName, setWeddingName] = useState('Our Wedding');
  const [budget, setBudget] = useState(30000);
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

    const payload = {
      weddingName,
      budget,
      selectedTasks: selectedPreset.tasks,
      enabledModules: modules,
      spouseEmail,
      spouseName,
      enableGuestReadOnly,
      enableVendorReadOnly,
      activationOrder: verifiedOrder,
    };

    try {
      // Post to Onboard API
      await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Save to localStorage for client-side persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('sheet2vow_activated', 'true');
        localStorage.setItem('sheet2vow_wedding_name', weddingName);
        localStorage.setItem('sheet2vow_budget', String(budget));
        localStorage.setItem('sheet2vow_enabled_modules', JSON.stringify(modules));
        localStorage.setItem('sheet2vow_spouse_email', spouseEmail);
        localStorage.setItem('sheet2vow_guest_readonly', String(enableGuestReadOnly));
        localStorage.setItem('sheet2vow_vendor_readonly', String(enableVendorReadOnly));
      }

      setIsSubmitting(false);
      setStep(3); // Completion step

      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch (err) {
      setIsSubmitting(false);
      setVerifyError('Error finalizing setup. Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
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
            {/* ⚡ Express Demo Jump In Card on /activate */}
            <div style={{
              backgroundColor: 'var(--color-bg-subtle, rgba(255,255,255,0.05))',
              border: '2px solid var(--color-highlight, #f59e0b)',
              borderRadius: 'var(--border-radius-md, 8px)',
              padding: '1.25rem',
              textAlign: 'center',
              boxShadow: 'var(--box-shadow-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Zap size={22} style={{ color: 'var(--color-highlight, #f59e0b)' }} />
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  EXPLORE DEMO WORKSPACE
                </h3>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-highlight, #f59e0b)',
                  color: '#000000',
                  padding: '0.15rem 0.4rem',
                  borderRadius: 'var(--border-radius-sm, 4px)'
                }}>
                  1-CLICK JUMP IN
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
                Want to test-drive Sheet2Vow before entering your Etsy order details? Launch our pre-populated sample wedding workspace (*Alex & Sam's Wedding*) instantly.
              </p>

              <button
                type="button"
                onClick={handleExpressDemoLaunch}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.825rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--color-highlight, #f59e0b)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm, 4px)',
                  padding: '0.75rem 1.25rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <Zap size={18} />
                <span>⚡ EXPLORE DEMO WORKSPACE (JUMP RIGHT IN)</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 700 }}>
                OR VERIFY ETSY ORDER TO ACTIVATE
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>

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
                <div style={{ fontWeight: 700 }}>Verified Order #{verifiedOrder?.orderId || 'ETSY-OK'} &bull; License Activated</div>
                <div style={{ fontSize: '0.725rem', opacity: 0.9 }}>{verifiedOrder?.packageTier || 'Sheet2Vow Master Wedding Planner Suite'}</div>
              </div>
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
