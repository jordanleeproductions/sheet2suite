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
  Clock
} from 'lucide-react';

import { CURRENCY_OPTIONS, CurrencyCode } from '@/lib/currency';
import { getColorPresets } from '@/lib/themePresets';

interface AdvancedSettingsModalProps {
  spreadsheetId: string;
  weddingName: string;
  weddingDate: string;
  driveFolder: string;
  enabledModules: ModuleConfig;
  isMockMode: boolean;
  styleTheme: 'editorial' | 'neo-brutalism';
  theme: 'light' | 'dark';
  primaryColor?: string;
  timeFormat: '12h' | '24h';
  currency?: string;
  onUpdateWeddingDetails: (name: string, date: string, location?: string) => Promise<void>;
  onToggleModule: (moduleKey: keyof ModuleConfig) => void;
  onUpdateStyleTheme: (style: 'editorial' | 'neo-brutalism') => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onUpdatePrimaryColor?: (color: string) => void;
  onUpdateTimeFormat: (format: '12h' | '24h') => void;
  onUpdateCurrency?: (currency: string) => void;
  onDisconnect: () => void;
  onOpenShareModal?: () => void;
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
  onUpdateWeddingDetails,
  onToggleModule,
  onUpdateStyleTheme,
  onUpdateTheme,
  onUpdatePrimaryColor,
  onUpdateTimeFormat,
  onUpdateCurrency,
  onDisconnect,
  onOpenShareModal,
  onClose,
}: AdvancedSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'visual' | 'drive' | 'modules' | 'security' | 'feedback'>('details');

  // Form states
  const [weddingName, setWeddingName] = useState(initialName || 'Our Wedding');
  const [weddingDate, setWeddingDate] = useState(initialDate || '');
  const [locationDetails, setLocationDetails] = useState('Los Angeles, CA');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Partner Co-Planning State
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerInviteSent, setPartnerInviteSent] = useState(false);

  // Feedback Form State
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature'>('feature');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

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
            <X size={20} />
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
                  <label style={styles.label}>DESIGN SYSTEM AESTHETIC</label>
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
                      value={primaryColor || '#11552D'}
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
                  <span style={styles.infoLabel}>DATA SOURCE STATUS</span>
                  <strong style={{ fontSize: '0.9rem', color: isMockMode ? '#f59e0b' : 'var(--color-green)' }}>
                    {isMockMode ? 'MOCK MODE (LOCAL DB)' : 'LIVE GOOGLE SHEETS SYNCED'}
                  </strong>
                </div>

                <div style={styles.infoCard}>
                  <span style={styles.infoLabel}>GOOGLE SPREADSHEET ID</span>
                  <code style={styles.codeText}>{spreadsheetId || 'Not Connected'}</code>
                </div>

                <div style={styles.infoCard}>
                  <span style={styles.infoLabel}>GOOGLE DRIVE FOLDER DIRECTORY</span>
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

                {/* Grant Partner / Spouse Admin Access Section */}
                <div style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-muted)', borderRadius: 'var(--border-radius-sm)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <UserPlus size={18} style={{ color: 'var(--color-primary)' }} />
                    <h5 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                      GRANT PARTNER / SPOUSE ADMIN ACCESS
                    </h5>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0 0 0.75rem 0' }}>
                    Grant your spouse or co-planner admin read/write permissions so both partners can co-plan on the same spreadsheet in real time.
                  </p>

                  {partnerInviteSent && (
                    <div style={{ backgroundColor: 'rgba(19, 170, 82, 0.1)', border: '1px solid #11552D', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', color: '#11552D', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={16} /> Invitation request registered for {partnerEmail || 'your partner'}.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="e.g. spouse@example.com"
                      style={{ ...styles.input, flex: 1, minWidth: '220px' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (partnerEmail.trim()) setPartnerInviteSent(true);
                      }}
                      style={{ ...styles.saveBtn, backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
                    >
                      <UserPlus size={14} /> GRANT ADMIN ACCESS
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', borderRadius: 'var(--border-radius-sm)' }}>
                    <Lock size={16} style={{ color: '#eab308', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text)' }}>
                      <strong>Phase 3 Germin8 Co-Planning Integration:</strong> Real-time Google Drive permission delegation plumbing will link with your Germin8 account in a future update.
                    </span>
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
