'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
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
  Check,
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
  Zap,
  Info
} from 'lucide-react';
import { TASK_PRESETS } from '@/lib/presets/taskPresets';
import InfoDisclosure from '@/components/InfoDisclosure';
import { ProductSetupPluginProps } from '@/lib/core/activation/types';

export interface VowSetupConfig {
  weddingName: string;
  weddingDate: string;
  admin1Name: string;
  admin1Email: string;
  admin2Name?: string;
  admin2Email?: string;
  budget: number | string;
  currency: string;
  driveFolder: string;
  modules: {
    metrics: boolean;
    budget: boolean;
    guests: boolean;
    schedule: boolean;
    tasks: boolean;
    vendors: boolean;
    music: boolean;
  };
  styleTheme: 'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo';
  colorMode: 'light' | 'dark';
  navLayout: 'sidebar' | 'top';
  taskMode: 'preset' | 'clean_slate';
  selectedPresetKey: string;
  selectedTaskIds: string[];
}

export default function VowSetupWizard({
  productCode,
  productName,
  userEmail,
  orderId,
  driveFolder,
  isGoogleConnected,
  onBrowseGoogleDrive,
  onChangeDriveFolder,
  onComplete,
  onBack,
  isSubmitting = false,
}: ProductSetupPluginProps<VowSetupConfig>) {
  const [setupMode, setSetupMode] = useState<'quick' | 'guided'>('guided');
  const [guidedStep, setGuidedStep] = useState<number>(1);

  // Setup Form State: Wedding Details & Co-Admins
  const [weddingName, setWeddingName] = useState('');
  const [weddingDate, setWeddingDate] = useState('2026-09-20');
  const [admin1Name, setAdmin1Name] = useState('');
  const [admin1Email, setAdmin1Email] = useState('');
  const [admin2Name, setAdmin2Name] = useState('');
  const [admin2Email, setAdmin2Email] = useState('');
  const [showAdmin2, setShowAdmin2] = useState(false);

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

  const toggleModule = (key: keyof typeof modules) => {
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  const handleFinish = () => {
    onComplete({
      weddingName: weddingName.trim() || 'Our Wedding',
      weddingDate,
      admin1Name,
      admin1Email,
      admin2Name: showAdmin2 ? admin2Name : undefined,
      admin2Email: showAdmin2 ? admin2Email : undefined,
      budget,
      currency,
      driveFolder,
      modules,
      styleTheme,
      colorMode,
      navLayout,
      taskMode,
      selectedPresetKey,
      selectedTaskIds,
    });
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Mode Switcher Banner (Quick vs Guided) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--color-bg-subtle, #f3f4f6)', padding: '0.25rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setSetupMode('quick')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              backgroundColor: setupMode === 'quick' ? 'var(--color-primary)' : 'transparent',
              color: setupMode === 'quick' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.725rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Zap size={14} />
            <span>QUICK SETUP</span>
          </button>
          <button
            type="button"
            onClick={() => setSetupMode('guided')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              backgroundColor: setupMode === 'guided' ? 'var(--color-primary)' : 'transparent',
              color: setupMode === 'guided' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.725rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sliders size={14} />
            <span>GUIDED WIZARD ({guidedStep}/4)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--color-muted)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <ArrowLeft size={14} /> Back to Drive Settings
        </button>
      </div>

      {/* QUICK SETUP (Single Page Form) */}
      {setupMode === 'quick' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
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
          <div>
            <label style={styles.fieldLabel}>ENABLED PLANNING MODULES & FEATURES</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginTop: '0.25rem' }}>
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
                    style={{ margin: 0, cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Total Budget Input (if budget enabled) */}
          {modules.budget && (
            <div>
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
                onChange={(e) => setBudget(e.target.value)}
                style={styles.inputField}
              />
            </div>
          )}

          {/* Wedding Date Input */}
          <div>
            <label style={styles.fieldLabel}>WEDDING DATE *</label>
            <input
              type="date"
              required
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              style={styles.inputField}
            />
          </div>

          {/* Partner Co-Admin Email Input */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ ...styles.fieldLabel, margin: 0 }}>
                PARTNER / CO-PLANNER GOOGLE EMAIL (OPTIONAL)
              </label>
              <InfoDisclosure title="Spouse Co-Planning Admin Access">
                Your partner can edit the Google Sheet and access the dashboard from their phone or computer.
              </InfoDisclosure>
            </div>
            <input
              type="email"
              placeholder="e.g. partner@gmail.com"
              value={admin1Email}
              onChange={(e) => setAdmin1Email(e.target.value)}
              style={styles.inputField}
            />
          </div>

          {/* Submit Action */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinish}
            style={{
              ...styles.submitBtn,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            <Sparkles size={16} />
            <span>{isSubmitting ? 'CREATING SPREADSHEET & LAUNCHING...' : 'FINISH QUICK SETUP & LAUNCH PLANNER'}</span>
          </button>
        </div>
      )}

      {/* GUIDED 4-STEP WIZARD */}
      {setupMode === 'guided' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Step Progress Ticker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              STEP {guidedStep} OF 4 &bull; {
                guidedStep === 1 ? 'WEDDING DETAILS & CO-ADMINS' :
                guidedStep === 2 ? 'ENABLED PLANNING MODULES' :
                guidedStep === 3 ? 'FINANCIALS & TASK PRESETS' :
                'THEME & NAVIGATION LAYOUT'
              }
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  onClick={() => setGuidedStep(s)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: s === guidedStep ? 'var(--color-primary)' : s < guidedStep ? 'var(--color-green, #16a34a)' : 'var(--color-bg-subtle, #e5e7eb)',
                    color: s === guidedStep || s < guidedStep ? '#ffffff' : 'var(--color-text)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {s < guidedStep ? '✓' : s}
                </div>
              ))}
            </div>
          </div>

          {/* GUIDED STEP 1: Details & Admins */}
          {guidedStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
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

              <div>
                <label style={styles.fieldLabel}>WEDDING DATE *</label>
                <input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>PRIMARY ADMIN / SPOUSE GOOGLE EMAIL (OPTIONAL)</label>
                <input
                  type="email"
                  placeholder="e.g. partner@gmail.com"
                  value={admin1Email}
                  onChange={(e) => setAdmin1Email(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setGuidedStep(2)}
                  style={styles.nextBtn}
                >
                  <span>NEXT: ENABLE MODULES</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* GUIDED STEP 2: Feature Modules */}
          {guidedStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={styles.fieldLabel}>CHOOSE YOUR PLANNING TOOLS</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', marginTop: '0.35rem' }}>
                  {[
                    { key: 'budget' as const, label: 'Budget Ledger & Outlays', desc: 'Expenses, payments, and vendor balances' },
                    { key: 'guests' as const, label: 'Guest Registry & Seating', desc: 'RSVPs, meal choices, plus-ones & tables' },
                    { key: 'schedule' as const, label: 'Day-Of Timeline & Itinerary', desc: 'Schedule milestones & UP NEXT ticker' },
                    { key: 'tasks' as const, label: 'Kanban Tasks & Checklist', desc: 'To Do, In Progress, Done checklists' },
                    { key: 'vendors' as const, label: 'Vendor Directory & Contracts', desc: 'Contacts, contracts, deposits & meals' },
                    { key: 'music' as const, label: 'Wedding Playlist & Song Requests', desc: 'Must-play tracks & guest QR requests' },
                  ].map((mod) => (
                    <div
                      key={mod.key}
                      onClick={() => toggleModule(mod.key)}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: modules[mod.key] ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)',
                        border: modules[mod.key] ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        boxShadow: modules[mod.key] ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.825rem', fontWeight: modules[mod.key] ? 800 : 600, color: 'var(--color-text)' }}>
                          {mod.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={modules[mod.key]}
                          readOnly
                          style={{ margin: 0, cursor: 'pointer' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{mod.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setGuidedStep(1)} style={styles.backBtn}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" onClick={() => setGuidedStep(3)} style={styles.nextBtn}>
                  <span>NEXT: FINANCIALS & PRESETS</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* GUIDED STEP 3: Financials & Task Presets */}
          {guidedStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Budget Settings */}
              {modules.budget && (
                <div>
                  <label style={styles.fieldLabel}>ESTIMATED TOTAL BUDGET & CURRENCY</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={budget}
                      onFocus={(e) => {
                        if (budget === 0 || budget === '0' || budget === '') setBudget('');
                        else e.target.select();
                      }}
                      onChange={(e) => setBudget(e.target.value)}
                      style={{ ...styles.inputField, flex: 1 }}
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{ ...styles.inputField, width: '100px', cursor: 'pointer' }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Task Checklist Mode */}
              {modules.tasks && (
                <div>
                  <label style={styles.fieldLabel}>CHECKLIST INITIALIZATION</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {[
                      { key: 'preset' as const, label: 'Pre-Built Wedding Checklist', tag: 'RECOMMENDED' },
                      { key: 'clean_slate' as const, label: 'Clean Slate (Empty)', tag: null },
                    ].map(mode => (
                      <div
                        key={mode.key}
                        onClick={() => setTaskMode(mode.key)}
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRadius: 'var(--border-radius-sm)',
                          border: taskMode === mode.key ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: taskMode === mode.key ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '0.775rem', fontWeight: taskMode === mode.key ? 800 : 600 }}>{mode.label}</div>
                        {mode.tag && <span style={{ fontSize: '0.6rem', color: 'var(--color-gold)', fontWeight: 800 }}>{mode.tag}</span>}
                      </div>
                    ))}
                  </div>

                  {taskMode === 'preset' && (
                    <div>
                      <label style={{ ...styles.fieldLabel, fontSize: '0.75rem' }}>CHOOSE PRESET STYLE</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {Object.entries(TASK_PRESETS).map(([key, preset]) => {
                          const isSelected = selectedPresetKey === key;
                          return (
                            <div
                              key={key}
                              onClick={() => handlePresetSelect(key)}
                              style={{
                                padding: '0.5rem',
                                borderRadius: 'var(--border-radius-sm)',
                                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                backgroundColor: isSelected ? 'var(--color-surface)' : 'var(--color-bg)',
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{ fontSize: '0.75rem', fontWeight: isSelected ? 800 : 600 }}>{preset.name}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>{preset.tasks.length} tasks</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Granular Task Checklist */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700 }}>
                          SELECTED TASKS ({selectedTaskIds.length})
                        </span>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button type="button" onClick={selectAllTasks} style={styles.miniBtn}>Select All</button>
                          <button type="button" onClick={deselectAllTasks} style={styles.miniBtn}>Deselect All</button>
                        </div>
                      </div>

                      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'var(--color-bg)' }}>
                        {(TASK_PRESETS[selectedPresetKey]?.tasks || []).map(task => {
                          const isChecked = selectedTaskIds.includes(task.taskId);
                          return (
                            <div
                              key={task.taskId}
                              onClick={() => toggleTaskId(task.taskId)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '3px',
                                backgroundColor: isChecked ? 'var(--color-surface, #ffffff)' : 'transparent',
                                cursor: 'pointer',
                              }}
                            >
                              <input type="checkbox" checked={isChecked} readOnly style={{ cursor: 'pointer' }} />
                              <span style={{ fontSize: '0.75rem', color: isChecked ? 'var(--color-text)' : 'var(--color-muted)', textDecoration: isChecked ? 'none' : 'line-through' }}>
                                {task.taskName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setGuidedStep(2)} style={styles.backBtn}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" onClick={() => setGuidedStep(4)} style={styles.nextBtn}>
                  <span>NEXT: STYLING & FINISH</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* GUIDED STEP 4: Styling & Navigation */}
          {guidedStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Navigation Layout */}
              <div>
                <label style={styles.fieldLabel}>NAVIGATION LAYOUT</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
                  {[
                    { key: 'sidebar' as const, title: 'Left-Hand Nav', desc: 'Modern collapsible sidebar (Recommended)' },
                    { key: 'top' as const, title: 'Top Nav Header', desc: 'Classic horizontal tabs layout' },
                  ].map(layout => (
                    <div
                      key={layout.key}
                      onClick={() => setNavLayout(layout.key)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--border-radius-sm)',
                        border: navLayout === layout.key ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: navLayout === layout.key ? 'var(--color-surface, #ffffff)' : 'var(--color-bg)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '0.825rem', fontWeight: 800 }}>{layout.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{layout.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme & Color Mode */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ ...styles.fieldLabel, margin: 0 }}>THEME & COLOR MODE</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setColorMode('light')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '3px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: colorMode === 'light' ? 'var(--color-primary)' : 'transparent',
                        color: colorMode === 'light' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      ☀ LIGHT
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorMode('dark')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '3px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: colorMode === 'dark' ? 'var(--color-primary)' : 'transparent',
                        color: colorMode === 'dark' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      🌙 DARK
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { id: 'editorial' as const, name: 'Editorial Elegance', tag: 'Classic Serif' },
                    { id: 'neo-brutalism' as const, name: 'Neo-Brutalism', tag: 'Bold & Modern' },
                    { id: 'botanical-romance' as const, name: 'Botanical Romance', tag: 'Sage & Green' },
                    { id: 'midnight-tuxedo' as const, name: 'Midnight Tuxedo', tag: 'Obsidian & Gold' },
                  ].map(theme => (
                    <div
                      key={theme.id}
                      onClick={() => setStyleTheme(theme.id)}
                      style={{
                        padding: '0.5rem 0.65rem',
                        borderRadius: 'var(--border-radius-sm)',
                        border: styleTheme === theme.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: styleTheme === theme.id ? 'var(--color-surface)' : 'var(--color-bg)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '0.775rem', fontWeight: 800 }}>{theme.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>{theme.tag}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Submit & Launch Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setGuidedStep(3)} style={styles.backBtn}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinish}
                  style={{
                    ...styles.submitBtn,
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Sparkles size={16} />
                  <span>{isSubmitting ? 'CREATING SPREADSHEET & LAUNCHING...' : 'FINISH SETUP & LAUNCH PLANNER'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  submitBtn: {
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
  nextBtn: {
    padding: '0.65rem 1.15rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.775rem',
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  backBtn: {
    padding: '0.65rem 1rem',
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.775rem',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  miniBtn: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
    padding: '0.2rem 0.5rem',
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: '3px',
    cursor: 'pointer',
  },
};
