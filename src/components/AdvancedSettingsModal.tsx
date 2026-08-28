'use client';

import React, { useState } from 'react';
import { ModuleConfig } from '@/components/DashboardMetrics';
import { 
  Settings, 
  X, 
  Heart, 
  Calendar, 
  MapPin, 
  HardDrive, 
  ExternalLink, 
  ShieldAlert, 
  Key, 
  Check, 
  Bug, 
  Sparkles, 
  Send, 
  Sliders,
  AlertCircle,
  Share2,
  UserPlus,
  Lock,
  Palette,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff
} from 'lucide-react';

import { CURRENCY_OPTIONS, CurrencyCode } from '@/lib/currency';
import { getColorPresets } from '@/lib/themePresets';
import { DashboardSectionConfig, loadDashboardLayout, saveDashboardLayout } from '@/lib/dashboardLayout';
import { useSheet2Theme } from '@/lib/core/theme/ThemeProvider';

interface AdvancedSettingsModalProps {
  spreadsheetId: string;
  weddingName: string;
  weddingDate: string;
  driveFolder: string;
  enabledModules: ModuleConfig;
  isMockMode: boolean;
  styleTheme: 'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo';
  theme: 'light' | 'dark';
  primaryColor?: string;
  timeFormat: '12h' | '24h';
  currency?: string;
  showTopNav?: boolean;
  onUpdateWeddingDetails: (name: string, date: string, location?: string) => Promise<void>;
  onToggleModule: (moduleKey: keyof ModuleConfig) => void;
  onUpdateStyleTheme: (style: 'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo') => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onUpdatePrimaryColor?: (color: string) => void;
  onUpdateTimeFormat: (format: '12h' | '24h') => void;
  onUpdateCurrency?: (currency: string) => void;
  onToggleTopNav?: (show: boolean) => void;
  onDisconnect: () => void;
  onOpenShareModal?: () => void;
  coPlanners?: string[];
  onUpdateCoPlanners?: (coPlanners: string[]) => void;
  onClose: () => void;
}

export default function AdvancedSettingsModal({
  spreadsheetId,
  weddingName: initialName,
  weddingDate: initialDate,
  driveFolder,
  enabledModules,
  isMockMode,
  styleTheme,
  theme,
  primaryColor,
  timeFormat,
  currency = 'USD',
  showTopNav = false,
  onUpdateWeddingDetails,
  onToggleModule,
  onUpdateStyleTheme,
  onUpdateTheme,
  onUpdatePrimaryColor,
  onUpdateTimeFormat,
  onUpdateCurrency,
  onToggleTopNav,
  onDisconnect,
  onOpenShareModal,
  coPlanners: initialCoPlanners,
  onUpdateCoPlanners,
  onClose,
}: AdvancedSettingsModalProps) {
  const { fontSizeScale, setFontSizeScale } = useSheet2Theme();
  const [activeTab, setActiveTab] = useState<'details' | 'visual' | 'drive' | 'modules' | 'security' | 'feedback'>('details');

  // Form states
  const [weddingName, setWeddingName] = useState(initialName || 'Our Wedding');
  const [weddingDate, setWeddingDate] = useState(initialDate || '');
  const [locationDetails, setLocationDetails] = useState('Los Angeles, CA');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Partner Co-Planning State [SHARE-4]
  const [coPlannersList, setCoPlannersList] = useState<string[]>(initialCoPlanners || []);
  const [coPlannerEmailInput, setCoPlannerEmailInput] = useState('');
  const [coPlannerRole, setCoPlannerRole] = useState<'writer' | 'reader'>('writer');
  const [isGrantingCoPlanner, setIsGrantingCoPlanner] = useState(false);
  const [revokingEmail, setRevokingEmail] = useState<string | null>(null);
  const [coPlannerMsg, setCoPlannerMsg] = useState<{ text: string; isError: boolean } | null>(null);

  React.useEffect(() => {
    if (!spreadsheetId) return;
    fetch(`/api/share/partner?spreadsheetId=${spreadsheetId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.coPlanners)) {
          setCoPlannersList(data.coPlanners);
          if (onUpdateCoPlanners) onUpdateCoPlanners(data.coPlanners);
        }
      })
      .catch(() => {});
  }, [spreadsheetId]);

  const handleGrantCoPlanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coPlannerEmailInput || isGrantingCoPlanner) return;

    setIsGrantingCoPlanner(true);
    setCoPlannerMsg(null);

    try {
      const res = await fetch('/api/share/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId,
          partnerEmail: coPlannerEmailInput,
          role: coPlannerRole,
          weddingName: initialName,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to grant co-planner access.');
      }

      setCoPlannersList(data.coPlanners || []);
      if (onUpdateCoPlanners) onUpdateCoPlanners(data.coPlanners);
      setCoPlannerEmailInput('');
      setCoPlannerMsg({ text: data.message || 'Access granted & Google notification sent!', isError: false });
    } catch (err: any) {
      setCoPlannerMsg({ text: err?.message || 'Error granting co-planner access.', isError: true });
    } finally {
      setIsGrantingCoPlanner(false);
    }
  };

  const handleRevokeCoPlanner = async (emailToRevoke: string) => {
    if (revokingEmail) return;
    setRevokingEmail(emailToRevoke);
    setCoPlannerMsg(null);

    try {
      const res = await fetch(`/api/share/partner?spreadsheetId=${spreadsheetId}&partnerEmail=${encodeURIComponent(emailToRevoke)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke co-planner access.');
      }

      setCoPlannersList(data.coPlanners || []);
      if (onUpdateCoPlanners) onUpdateCoPlanners(data.coPlanners);
      setCoPlannerMsg({ text: `Revoked access for ${emailToRevoke}.`, isError: false });
    } catch (err: any) {
      setCoPlannerMsg({ text: err?.message || 'Error revoking access.', isError: true });
    } finally {
      setRevokingEmail(null);
    }
  };

  // Feedback Form State
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature'>('feature');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);

  // Dashboard Layout Reorder State (DASH-3)
  const [dashSections, setDashSections] = useState<DashboardSectionConfig[]>(() => loadDashboardLayout());

  const moveDashSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dashSections.length) return;
    const updated = [...dashSections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setDashSections(updated);
    saveDashboardLayout(updated);
  };

  const toggleDashSection = (key: string) => {
    const updated = dashSections.map(sec => sec.key === key ? { ...sec, enabled: !sec.enabled } : sec);
    setDashSections(updated);
    saveDashboardLayout(updated);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingDetails(true);
      await onUpdateWeddingDetails(weddingName, weddingDate, locationDetails);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error updating wedding details:', err);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    const subject = encodeURIComponent(`Sheet2Vow [${feedbackType.toUpperCase()}]: ${weddingName}`);
    const body = encodeURIComponent(
      `Feedback Type: ${feedbackType.toUpperCase()}\n` +
      `Spreadsheet ID: ${spreadsheetId || 'N/A'}\n` +
      `User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}\n\n` +
      `Message Details:\n${feedbackMessage}`
    );

    window.open(`mailto:support@germin8.io?subject=${subject}&body=${body}`, '_blank');
    setFeedbackSent(true);
    setFeedbackMessage('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h3 style={styles.title}>ADVANCED SETTINGS & CONFIGURATION</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                Sheet2Vow Master Configuration Portal
              </span>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Close Advanced Settings">
            <X size={20} style={{ color: 'var(--color-text)' }} />
          </button>
        </div>

        {/* Responsive Mobile Navigation Styles */}
        <style>{`
          @media (max-width: 640px) {
            .advanced-modal-body {
              flex-direction: column !important;
            }
            .advanced-modal-sidebar {
              width: 100% !important;
              flex-direction: row !important;
              overflow-x: auto !important;
              border-right: none !important;
              border-bottom: 1px solid var(--color-muted) !important;
              padding: 0.5rem !important;
              gap: 0.35rem !important;
            }
            .advanced-modal-tab-btn {
              flex-shrink: 0 !important;
              padding: 0.4rem 0.65rem !important;
              font-size: 0.7rem !important;
            }
            .advanced-modal-content {
              padding: 1rem !important;
            }
          }
        `}</style>

        {/* Modal Body with Sidebar Navigation */}
        <div className="advanced-modal-body" style={styles.body}>
          {/* Settings Sidebar */}
          <nav className="advanced-modal-sidebar" style={styles.sidebar}>
            {[
              { id: 'details', label: 'Wedding Details', icon: Heart },
              { id: 'visual', label: 'Visual & UX', icon: Palette },
              { id: 'drive', label: 'Drive & Data Source', icon: HardDrive },
              { id: 'modules', label: 'Module Controls', icon: Settings },
              { id: 'security', label: 'Security & Access', icon: ShieldAlert },
              { id: 'feedback', label: 'Report Bug / Idea', icon: Bug },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className="advanced-modal-tab-btn"
                  style={{
                    ...styles.tabBtn,
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <Icon size={16} style={{ marginRight: '6px' }} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Settings Tab Content Area */}
          <div className="advanced-modal-content" style={styles.content}>
            {/* TAB: VISUAL & UX */}
            {activeTab === 'visual' && (
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>🎨 Visual & UX Preferences</h4>
                <p style={styles.sectionDesc}>
                  Configure your aesthetic design theme, light/dark color mode, and time display format. These options are stored locally in your browser.
                </p>

                {/* Design System Aesthetic */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>THEME</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => onUpdateStyleTheme('editorial')}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        padding: '0.75rem',
                        border: styleTheme === 'editorial' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: styleTheme === 'editorial' ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>EDITORIAL MINIMALIST</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 400 }}>Refined serif headers & warm neutral tones</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateStyleTheme('neo-brutalism')}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        padding: '0.75rem',
                        border: styleTheme === 'neo-brutalism' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: styleTheme === 'neo-brutalism' ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>MUTED NEO-BRUTALISM</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 400 }}>Bold borders, vivid badges & sharp contrast</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateStyleTheme('botanical-romance')}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        padding: '0.75rem',
                        border: styleTheme === 'botanical-romance' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: styleTheme === 'botanical-romance' ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>BOTANICAL ROMANCE</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 400 }}>Soft, earthy tones and floral aesthetics</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateStyleTheme('midnight-tuxedo')}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        padding: '0.75rem',
                        border: styleTheme === 'midnight-tuxedo' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: styleTheme === 'midnight-tuxedo' ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>MIDNIGHT TUXEDO</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 400 }}>Sharp, sleek high-contrast formal elegance</span>
                    </button>
                  </div>
                </div>

                {/* Color Mode */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>COLOR MODE</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => onUpdateTheme('light')}
                      style={{
                        flex: '1 1 140px',
                        padding: '0.625rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: theme === 'light' ? 700 : 500,
                        border: theme === 'light' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: theme === 'light' ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>☀️ LIGHT MODE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateTheme('dark')}
                      style={{
                        flex: '1 1 140px',
                        padding: '0.625rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: theme === 'dark' ? 700 : 500,
                        border: theme === 'dark' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: theme === 'dark' ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>🌙 DARK MODE</span>
                    </button>
                  </div>
                </div>

                {/* Optional Top Navigation Bar Toggle [NAV-ENFORCE] */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>TOP NAVIGATION BAR</label>
                  <p style={{ fontSize: '0.725rem', color: 'var(--color-muted)', margin: '-0.2rem 0 0.5rem 0' }}>
                    Desktop uses the Left Sidebar and mobile uses the Bottom Nav + Hamburger menu. Toggle to show an optional top navigation bar as well.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => onToggleTopNav?.(false)}
                      style={{
                        flex: '1 1 140px',
                        padding: '0.625rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: !showTopNav ? 700 : 500,
                        border: !showTopNav ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: !showTopNav ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>OFF (DEFAULT)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleTopNav?.(true)}
                      style={{
                        flex: '1 1 140px',
                        padding: '0.625rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: showTopNav ? 700 : 500,
                        border: showTopNav ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: showTopNav ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>ON (SHOW TOP BAR)</span>
                    </button>
                  </div>
                </div>

                {/* Font Size Accessibility Scaler [NAV-2] */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>TEXT SIZE</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', padding: '0.625rem 0.85rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)' }}>
                    <button
                      type="button"
                      onClick={() => setFontSizeScale(fontSizeScale - 5)}
                      disabled={fontSizeScale <= 80}
                      title="Decrease font size"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--border-radius-sm)',
                        width: '32px',
                        height: '32px',
                        cursor: fontSizeScale <= 80 ? 'not-allowed' : 'pointer',
                        opacity: fontSizeScale <= 80 ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      -
                    </button>

                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                        {fontSizeScale}%
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>
                        {fontSizeScale === 100 ? 'Default standard font size' : fontSizeScale < 100 ? 'Compact text layout' : 'Enlarged accessibility text'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFontSizeScale(fontSizeScale + 5)}
                      disabled={fontSizeScale >= 120}
                      title="Increase font size"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--border-radius-sm)',
                        width: '32px',
                        height: '32px',
                        cursor: fontSizeScale >= 120 ? 'not-allowed' : 'pointer',
                        opacity: fontSizeScale >= 120 ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      +
                    </button>

                    {fontSizeScale !== 100 && (
                      <button
                        type="button"
                        onClick={() => setFontSizeScale(100)}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: 'transparent',
                          color: 'var(--color-primary)',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem 0.4rem'
                        }}
                      >
                        RESET
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Accent Color Presets & Custom Picker */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>PRIMARY ACCENT COLOR</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.625rem', marginBottom: '0.75rem' }}>
                    {getColorPresets(styleTheme, theme).map((preset) => {
                      const isSelected = (primaryColor || '').toLowerCase() === preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => onUpdatePrimaryColor && onUpdatePrimaryColor(preset.hex)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.65rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            border: isSelected ? '2px solid var(--color-text)' : '1px solid var(--color-muted)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            borderRadius: 'var(--border-radius-sm)',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: preset.hex,
                            border: '1px solid rgba(0,0,0,0.2)',
                            flexShrink: 0
                          }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap' }}>{preset.name}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)' }}>
                    <input
                      type="color"
                      value={primaryColor || '#0D1B2A'}
                      onChange={(e) => onUpdatePrimaryColor && onUpdatePrimaryColor(e.target.value)}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: 'transparent'
                      }}
                      title="Custom Primary Color Picker"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        CUSTOM HEX COLOR
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-muted)' }}>
                        {primaryColor ? primaryColor.toUpperCase() : 'Default Theme Color'}
                      </span>
                    </div>
                    {primaryColor && (
                      <button
                        type="button"
                        onClick={() => onUpdatePrimaryColor && onUpdatePrimaryColor('')}
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-muted)',
                          background: 'none',
                          border: 'none',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Time Display Format */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>TIME DISPLAY FORMAT</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => onUpdateTimeFormat('12h')}
                      style={{
                        flex: '1 1 180px',
                        padding: '0.625rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: timeFormat === '12h' ? 700 : 500,
                        border: timeFormat === '12h' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: timeFormat === '12h' ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>🕒 12-HOUR FORMAT (04:30 PM)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateTimeFormat('24h')}
                      style={{
                        flex: '1 1 180px',
                        padding: '0.625rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: timeFormat === '24h' ? 700 : 500,
                        border: timeFormat === '24h' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: timeFormat === '24h' ? 'var(--color-bg)' : 'transparent',
                        color: 'var(--color-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>🌐 24-HOUR FORMAT (16:30)</span>
                    </button>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.35rem' }}>
                    ⚙️ App-level preference stored locally. Formats time displays across Day-Of Timeline and Shot List without altering spreadsheet cells.
                  </span>
                </div>
              </div>
            )}
            {/* TAB 1: WEDDING DETAILS */}
            {activeTab === 'details' && (
              <form onSubmit={handleSaveDetails} style={styles.section}>
                <h4 style={styles.sectionTitle}>💒 Wedding Title & Event Metadata</h4>
                <p style={styles.sectionDesc}>
                  Configure your wedding name, event date, and location. Updates are synced to cell <code>Settings!B2</code> in your Google Sheet.
                </p>

                <div style={styles.formGroup}>
                  <label style={styles.label}>WEDDING TITLE / COUPLE NAME</label>
                  <input
                    type="text"
                    value={weddingName}
                    onChange={(e) => setWeddingName(e.target.value)}
                    placeholder="e.g. Sarah & John's Wedding"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>WEDDING DATE</label>
                  <input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>VENUE / LOCATION DETAILS</label>
                  <input
                    type="text"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    placeholder="e.g. Grand Plaza Hotel, Los Angeles, CA"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>CURRENCY FORMATTING & SYMBOL</label>
                  <select
                    value={currency}
                    onChange={(e) => onUpdateCurrency && onUpdateCurrency(e.target.value)}
                    style={styles.select}
                  >
                    {CURRENCY_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label} ({opt.example})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                    Formats currency values across Budget Ledger, Dashboard KPI summary, and Vendor contracts. Supports USD ($), CAD ($), French Canadian (35 000 $), GBP (£), and EUR (€).
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={isSavingDetails} style={styles.saveBtn}>
                    {saveSuccess ? <Check size={16} /> : <Heart size={16} />}
                    {isSavingDetails ? 'SAVING...' : saveSuccess ? 'UPDATED SUCCESSFULLY!' : 'SAVE WEDDING DETAILS'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: DRIVE & DATA SOURCE */}
            {activeTab === 'drive' && (
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>📁 Google Workspace & Drive Directory</h4>
                <p style={styles.sectionDesc}>
                  View connected Google Spreadsheet details and local Drive folder organization.
                </p>

                <div style={styles.infoCard}>
                  <span style={styles.infoLabel}>GOOGLE SHEETS CONNECTION</span>
                  <strong style={{ fontSize: '0.9rem', color: isMockMode ? '#f59e0b' : 'var(--color-green)' }}>
                    {isMockMode ? 'MOCK MODE (LOCAL DB)' : 'LIVE GOOGLE SHEETS SYNCED'}
                  </strong>
                </div>

                <div style={styles.infoCard}>
                  <span style={styles.infoLabel}>GOOGLE SPREADSHEET ID</span>
                  <code style={styles.codeText}>{spreadsheetId || 'Not Connected'}</code>
                </div>

                <div style={styles.infoCard}>
                  <span style={styles.infoLabel}>GOOGLE DRIVE FOLDER</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                    {driveFolder}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {!isMockMode && spreadsheetId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.actionLink}
                    >
                      <ExternalLink size={14} style={{ marginRight: '4px' }} /> OPEN GOOGLE SHEET IN NEW TAB
                    </a>
                  )}

                  <a href="/activate" style={{ ...styles.actionLink, borderColor: 'var(--color-highlight)', color: 'var(--color-highlight)' }}>
                    <Key size={14} style={{ marginRight: '4px' }} /> RE-RUN GUIDED SETUP WIZARD
                  </a>
                </div>
              </div>
            )}

            {/* TAB 3: MODULE CONTROLS */}
            {activeTab === 'modules' && (
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>⚙️ Active Feature Module Controls</h4>
                <p style={styles.sectionDesc}>
                  Enable or disable individual planning tabs. Disabled modules hide from the navigation navbar and summary dashboard.
                </p>

                <div style={styles.moduleGrid}>
                  {[
                    { key: 'guests', label: 'Guest Registry', desc: 'RSVPs, dietary restrictions, party groups' },
                    { key: 'tables', label: 'Seating Chart', desc: 'Visual floorplan table builder & seat IDs' },
                    { key: 'budget', label: 'Budget Ledger', desc: 'Itemized cost logger & payment statuses' },
                    { key: 'schedule', label: 'Day-Of Timeline', desc: 'Itinerary moments & vendor assignments' },
                    { key: 'vendors', label: 'Vendor Directory', desc: 'Hired vendor contacts & contract values' },
                    { key: 'tasks', label: 'Kanban Checklist', desc: 'Task presets & priority board' },
                    { key: 'music', label: 'Music Playlist', desc: 'Track requests, 30s audio previews & banned songs' },
                    { key: 'photos', label: 'Photo Shot List', desc: 'Required shot list & posing notes' },
                    { key: 'thanks', label: 'Thank You Tracker', desc: 'Gifts received & party attendance cards' },
                  ].map(mod => {
                    const isEnabled = enabledModules[mod.key as keyof ModuleConfig];
                    return (
                      <div
                        key={mod.key}
                        onClick={() => onToggleModule(mod.key as keyof ModuleConfig)}
                        style={{
                          ...styles.moduleCard,
                          borderColor: isEnabled ? 'var(--color-primary)' : 'var(--color-muted)',
                          backgroundColor: isEnabled ? 'var(--color-bg)' : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => {}}
                          style={{ cursor: 'pointer', marginTop: '2px' }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-text)', display: 'block' }}>{mod.label}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{mod.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                  <h5 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>
                    📊 DASHBOARD SUMMARY SECTION ORDER & VISIBILITY
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                    Reorder or hide summary sections rendered on the main Summary Dashboard.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dashSections.map((sec, idx) => (
                      <div
                        key={sec.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '0.5rem 0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => toggleDashSection(sec.key)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: sec.enabled ? 'var(--color-primary)' : 'var(--color-muted)', padding: 0 }}
                            title={sec.enabled ? 'Hide section' : 'Show section'}
                          >
                            {sec.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: sec.enabled ? 'var(--color-text)' : 'var(--color-muted)' }}>
                            {sec.label}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            type="button"
                            onClick={() => moveDashSection(idx, 'up')}
                            disabled={idx === 0}
                            style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, color: 'var(--color-text)', padding: '0.2rem' }}
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDashSection(idx, 'down')}
                            disabled={idx === dashSections.length - 1}
                            style={{ background: 'none', border: 'none', cursor: idx === dashSections.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === dashSections.length - 1 ? 0.3 : 1, color: 'var(--color-text)', padding: '0.2rem' }}
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY & ACCESS */}
            {activeTab === 'security' && (
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>🛡️ Security & Workspace Access Control</h4>
                <p style={styles.sectionDesc}>
                  Manage read-only vendor portals, invite your partner for co-planning admin access, or disconnect your workspace.
                </p>

                {/* Read-Only Vendor Share Summary */}
                <div style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-muted)', borderRadius: 'var(--border-radius-sm)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Share2 size={18} style={{ color: 'var(--color-primary)' }} />
                    <h5 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                      READ-ONLY VENDOR SHARE PORTALS
                    </h5>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0 0 0.75rem 0' }}>
                    Generate mobile read-only share links for your DJ, photographer, coordinator, or caterer. Confidential budget items and guest addresses remain strictly hidden.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {onOpenShareModal && (
                      <button
                        type="button"
                        style={styles.saveBtn}
                        onClick={() => {
                          onClose();
                          onOpenShareModal();
                        }}
                      >
                        <Share2 size={14} /> GENERATE VENDOR SHARE LINK
                      </button>
                    )}
                  </div>
                </div>

                {/* Grant Partner / Spouse Co-Planning Access Section [SHARE-4] */}
                <div style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-muted)', borderRadius: 'var(--border-radius-sm)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserPlus size={18} style={{ color: 'var(--color-primary)' }} />
                      <h5 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                        CO-PLANNING & PARTNER ACCESS
                      </h5>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: coPlannersList.length >= 2 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: coPlannersList.length >= 2 ? 'var(--color-red, #ef4444)' : 'var(--color-green, #10b981)',
                      border: coPlannersList.length >= 2 ? '1px solid var(--color-red, #ef4444)' : '1px solid var(--color-green, #10b981)',
                    }}>
                      {coPlannersList.length} / 2 CO-PLANNER SLOTS USED
                    </span>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0 0 0.75rem 0' }}>
                    Grant your spouse or partner access to co-plan on your wedding database in real time. Automatically sends a free native Google Drive email notification to their inbox. (Maximum 2 co-planners per workspace).
                  </p>

                  {coPlannerMsg && (
                    <div style={{
                      backgroundColor: coPlannerMsg.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      border: coPlannerMsg.isError ? '1px solid var(--color-red, #ef4444)' : '1px solid var(--color-green, #10b981)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.775rem',
                      color: coPlannerMsg.isError ? 'var(--color-red, #ef4444)' : 'var(--color-green, #10b981)',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                    }}>
                      {coPlannerMsg.isError ? <AlertCircle size={15} /> : <Check size={15} />}
                      <span>{coPlannerMsg.text}</span>
                    </div>
                  )}

                  {/* Add Co-Planner Form */}
                  <form onSubmit={handleGrantCoPlanner} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <input
                      type="email"
                      value={coPlannerEmailInput}
                      onChange={(e) => setCoPlannerEmailInput(e.target.value)}
                      placeholder="e.g. partner@example.com"
                      required
                      disabled={coPlannersList.length >= 2 || isGrantingCoPlanner}
                      style={{ ...styles.input, flex: '1 1 200px', minWidth: '180px' }}
                    />
                    <select
                      value={coPlannerRole}
                      onChange={(e) => setCoPlannerRole(e.target.value as 'writer' | 'reader')}
                      disabled={coPlannersList.length >= 2 || isGrantingCoPlanner}
                      style={{ ...styles.select, width: 'auto', minWidth: '110px' }}
                    >
                      <option value="writer">Editor (Co-Planner)</option>
                      <option value="reader">Viewer (Read Only)</option>
                    </select>
                    <button
                      type="submit"
                      disabled={coPlannersList.length >= 2 || isGrantingCoPlanner || !coPlannerEmailInput.trim()}
                      style={{
                        ...styles.saveBtn,
                        backgroundColor: coPlannersList.length >= 2 ? 'var(--color-muted)' : 'var(--color-primary)',
                        color: 'var(--color-on-primary, #ffffff)',
                        border: 'none',
                        opacity: (coPlannersList.length >= 2 || isGrantingCoPlanner) ? 0.6 : 1,
                        cursor: (coPlannersList.length >= 2 || isGrantingCoPlanner) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <UserPlus size={14} />
                      <span>{isGrantingCoPlanner ? 'GRANTING...' : 'GRANT ACCESS'}</span>
                    </button>
                  </form>

                  {/* Active Co-Planners List Roster */}
                  {coPlannersList.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.05em' }}>
                        ACTIVE CO-PLANNERS ({coPlannersList.length})
                      </span>
                      {coPlannersList.map((email) => (
                        <div
                          key={email}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.4rem 0.65rem',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-muted)',
                            borderRadius: 'var(--border-radius-sm)',
                            fontSize: '0.775rem',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Check size={13} style={{ color: 'var(--color-green, #10b981)' }} />
                            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{email}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRevokeCoPlanner(email)}
                            disabled={revokingEmail === email}
                            style={{
                              backgroundColor: 'transparent',
                              color: 'var(--color-red, #ef4444)',
                              border: 'none',
                              cursor: revokingEmail === email ? 'not-allowed' : 'pointer',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                              textDecoration: 'underline',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            {revokingEmail === email ? 'REVOKING...' : 'REVOKE ACCESS'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Zero-Cost Mailto & Link Helper */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(`${initialName} - Co-Planning Invite`)}&body=${encodeURIComponent(`Hi! Join me as a co-planner on Sheet2Vow for ${initialName}.\n\nSpreadsheet ID: ${spreadsheetId}\nAccess URL: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.35rem 0.6rem',
                        backgroundColor: 'transparent',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--color-muted)',
                        borderRadius: 'var(--border-radius-sm)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      ✉️ OPEN PERSONAL EMAIL APP
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.href);
                          setCoPlannerMsg({ text: 'Co-planner URL copied to clipboard!', isError: false });
                        }
                      }}
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.35rem 0.6rem',
                        backgroundColor: 'transparent',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-muted)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      📋 COPY CO-PLANNER LINK
                    </button>
                  </div>
                </div>

                {/* Disconnect Workspace */}
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', borderRadius: 'var(--border-radius-sm)', padding: '1rem' }}>
                  <h5 style={{ margin: 0, color: '#ef4444', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    DISCONNECT WORKSPACE
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0.35rem 0 0.75rem 0' }}>
                    Disconnect from your Google Sheet. Your sheet in Drive will remain completely untouched.
                  </p>
                  <button
                    type="button"
                    style={styles.disconnectBtn}
                    onClick={() => {
                      onClose();
                      onDisconnect();
                    }}
                  >
                    DISCONNECT WORKSPACE
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: REPORT A BUG / SUBMIT IDEA */}
            {activeTab === 'feedback' && (
              <form onSubmit={handleSendFeedback} style={styles.section}>
                <h4 style={styles.sectionTitle}>💡 Report a Bug or Submit Feature Idea</h4>
                <p style={styles.sectionDesc}>
                  Have a suggestion or encountered an issue? Send feedback directly to the Sheet2 Suite engineering team at Germin8.
                </p>

                {feedbackSent && (
                  <div style={{ backgroundColor: 'rgba(19, 170, 82, 0.1)', border: '1px solid #11552D', padding: '0.625rem 0.875rem', borderRadius: '4px', fontSize: '0.85rem', color: '#11552D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={16} /> Opening email client with prefilled diagnostic report...
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {[
                    { id: 'feature', label: '💡 Feature Idea', icon: Sparkles },
                    { id: 'bug', label: '🐛 Report Bug', icon: Bug },
                  ].map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id as any)}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: feedbackType === type.id ? 700 : 400,
                        padding: '0.4rem 0.75rem',
                        borderRadius: 'var(--border-radius-sm)',
                        border: `1px solid ${feedbackType === type.id ? 'var(--color-primary)' : 'var(--color-muted)'}`,
                        backgroundColor: feedbackType === type.id ? 'var(--color-primary)' : 'transparent',
                        color: feedbackType === type.id ? 'var(--color-on-primary)' : 'var(--color-text)',
                        cursor: 'pointer',
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>DESCRIPTION / DETAILS</label>
                  <textarea
                    rows={5}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder={feedbackType === 'bug' ? 'Describe the bug, steps to reproduce, and expected behavior...' : 'Describe your feature idea and how it would improve Sheet2Vow...'}
                    style={{ ...styles.input, fontFamily: 'inherit', resize: 'vertical' }}
                    required
                  />
                </div>

                <button type="submit" style={styles.saveBtn}>
                  <Send size={14} /> SUBMIT FEEDBACK TO GERMIN8
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    padding: '1rem',
  },
  modal: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    width: '100%',
    maxWidth: '820px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--box-shadow-heavy)',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-bg)',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.95rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--color-text)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '220px',
    backgroundColor: 'var(--color-bg)',
    borderRight: '1px solid var(--color-muted)',
    padding: '1rem 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    flexShrink: 0,
  },
  tabBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
  },
  content: {
    flex: 1,
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.95rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--color-text)',
  },
  sectionDesc: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    margin: 0,
    lineHeight: 1.4,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  input: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    padding: '0.625rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
  },
  saveBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  infoCard: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  infoLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  codeText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    wordBreak: 'break-all',
    color: 'var(--color-text)',
  },
  actionLink: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.875rem',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  },
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.625rem',
  },
  moduleCard: {
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.625rem',
    transition: 'var(--transition-smooth)',
  },
  disconnectBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
};
