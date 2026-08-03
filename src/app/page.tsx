'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WeddingData, Guest, BudgetItem, ScheduleEvent, Task, PhotoShot, GiftItem, RSVPStatus, KanbanStage } from '@/lib/sheets/types';
import DashboardMetrics, { ModuleConfig } from '@/components/DashboardMetrics';
import GuestListManager from '@/components/GuestListManager';
import BudgetLedgerManager from '@/components/BudgetLedgerManager';
import TimelineManager from '@/components/TimelineManager';
import KanbanBoard from '@/components/KanbanBoard';
import VendorManager from '@/components/VendorManager';
import MusicManager from '@/components/MusicManager';
import SeatingChartManager from '@/components/SeatingChartManager';
import PhotoShotListManager from '@/components/PhotoShotListManager';
import ThankYouManager from '@/components/ThankYouManager';
import ShareModal from '@/components/ShareModal';
import VendorShareLinkManager from '@/components/VendorShareLinkManager';
import AdvancedSettingsModal from '@/components/AdvancedSettingsModal';
import PrintTemplatesModal, { PrintTemplateType } from '@/components/PrintTemplatesModal';
import { RefreshCw, HardDrive, Heart, Sparkles, AlertCircle, FileSpreadsheet, Settings, Check, Key, X, Share2, Sliders, Printer } from 'lucide-react';
import { ALL_DEFAULT_TASKS } from '@/lib/sheets/mockDb';

export default function Sheet2VowDashboard() {
  // Authentication & Spreadsheet Settings
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [googleToken, setGoogleToken] = useState<string>('');
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isMockMode, setIsMockMode] = useState<boolean>(true);
  const [weddingName, setWeddingName] = useState<string>('');
  const [weddingDate, setWeddingDate] = useState<string>('');
  const [budgetThreshold, setBudgetThreshold] = useState<number>(35000);
  const [driveFolder, setDriveFolder] = useState<string>('My Drive/Wedding Planning');
  const [selectedTasks, setSelectedTasks] = useState<string[]>(ALL_DEFAULT_TASKS.map(t => t.taskName));

  const settingsRef = useRef<HTMLDivElement>(null);

  // Active Feature Modules Configuration
  const [enabledModules, setEnabledModules] = useState<ModuleConfig>({
    metrics: true,
    guests: true,
    tables: true,
    budget: true,
    schedule: true,
    tasks: true,
    vendors: true,
    music: true,
    photos: true,
    gifts: true,
    thanks: true,
  });

  const toggleTaskSelection = (taskName: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskName)
        ? prev.filter(t => t !== taskName)
        : [...prev, taskName]
    );
  };

  // Theme and Settings
  const [styleTheme, setStyleTheme] = useState<'editorial' | 'neo-brutalism'>('editorial');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColor] = useState<string>('');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [currency, setCurrency] = useState<string>('USD');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printModalInitialTemplate, setPrintModalInitialTemplate] = useState<PrintTemplateType>('place_cards');

  const handleUpdateWeddingDetails = async (name: string, date: string) => {
    setWeddingName(name);
    setWeddingDate(date);
    if (weddingData) {
      await syncUpdate('dashboard', {
        budget: weddingData.dashboard.totalBudget,
        weddingName: name,
      });
    }
  };

  // App Data & Loading states
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Navigation
  const [activeTab, setActiveTab] = useState<'metrics' | 'guests' | 'tables' | 'budget' | 'schedule' | 'tasks' | 'vendors' | 'music' | 'photos' | 'thanks'>('metrics');
  const [guestInitialFilter, setGuestInitialFilter] = useState<RSVPStatus | 'All'>('All');
  const [taskInitialFilter, setTaskInitialFilter] = useState<KanbanStage | undefined>(undefined);
  const [musicInitialFilter, setMusicInitialFilter] = useState<string | undefined>(undefined);

  // Load configuration from local storage on mount
  useEffect(() => {
    const savedSheetId = localStorage.getItem('s2v_spreadsheet_id');
    const savedToken = localStorage.getItem('s2v_google_token');
    const savedOnboarded = localStorage.getItem('s2v_is_onboarded');
    const savedMock = localStorage.getItem('s2v_is_mock');
    const savedName = localStorage.getItem('s2v_wedding_name');
    const savedDate = localStorage.getItem('s2v_wedding_date');
    const savedStyleTheme = localStorage.getItem('s2v_style_theme');
    const savedTheme = localStorage.getItem('s2v_theme');
    const savedColor = localStorage.getItem('s2v_primary_color');
    const savedTimeFormat = localStorage.getItem('s2v_time_format');
    const savedCurrency = localStorage.getItem('s2v_currency');
    const savedFolder = localStorage.getItem('s2v_drive_folder');
    const savedModules = localStorage.getItem('s2v_enabled_modules');

    if (savedSheetId) setSpreadsheetId(savedSheetId);
    if (savedToken) setGoogleToken(savedToken);
    if (savedOnboarded === 'true') setIsOnboarded(true);
    if (savedMock === 'false') setIsMockMode(false);
    if (savedName) setWeddingName(savedName);
    if (savedDate) setWeddingDate(savedDate);
    if (savedStyleTheme === 'editorial' || savedStyleTheme === 'neo-brutalism') setStyleTheme(savedStyleTheme);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    if (savedColor) setPrimaryColor(savedColor);
    if (savedTimeFormat === '12h' || savedTimeFormat === '24h') setTimeFormat(savedTimeFormat);
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedFolder) setDriveFolder(savedFolder);
    if (savedModules) {
      try {
        const parsed = JSON.parse(savedModules);
        setEnabledModules(prev => ({
          ...prev,
          ...parsed,
          tables: parsed.tables ?? true,
          photos: parsed.photos ?? true,
          thanks: parsed.thanks ?? true,
          gifts: parsed.gifts ?? true,
        }));
      } catch (e) {
        console.error('Error parsing saved modules', e);
      }
    }
  }, []);

  const toggleModule = (moduleKey: keyof ModuleConfig) => {
    setEnabledModules(prev => {
      const updated = { ...prev, [moduleKey]: !prev[moduleKey] };
      localStorage.setItem('s2v_enabled_modules', JSON.stringify(updated));
      return updated;
    });
  };

  // Ensure activeTab fallback if current activeTab is disabled
  useEffect(() => {
    if (!enabledModules[activeTab]) {
      const tabsOrder: (keyof ModuleConfig)[] = ['metrics', 'guests', 'budget', 'schedule', 'tasks', 'vendors', 'music'];
      const firstAvailable = tabsOrder.find(m => enabledModules[m]);
      setActiveTab((firstAvailable as any) || 'metrics');
    }
  }, [enabledModules, activeTab]);

  // Close settings dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  // Apply style theme and color mode when they change
  useEffect(() => {
    document.documentElement.setAttribute('data-style', styleTheme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('s2v_style_theme', styleTheme);
    localStorage.setItem('s2v_theme', theme);

    // Reset inline custom property overrides before applying
    document.documentElement.style.removeProperty('--color-primary');
    document.documentElement.style.removeProperty('--color-highlight');
    document.documentElement.style.removeProperty('--color-gold-dark');
    document.documentElement.style.removeProperty('--color-on-primary');

    if (primaryColor) {
      if (styleTheme === 'neo-brutalism') {
        // Customize Green accent colors in Neo-Brutalism without changing structural black/slate
        document.documentElement.style.setProperty('--color-highlight', primaryColor);
        document.documentElement.style.setProperty('--color-gold-dark', primaryColor);
        document.documentElement.style.setProperty('--color-on-primary', primaryColor);
        if (theme === 'dark') {
          document.documentElement.style.setProperty('--color-primary', primaryColor);
        }
      } else {
        document.documentElement.style.setProperty('--color-primary', primaryColor);
      }
      localStorage.setItem('s2v_primary_color', primaryColor);
    } else {
      localStorage.removeItem('s2v_primary_color');
    }
  }, [styleTheme, theme, primaryColor]);

  // Fetch data whenever spreadsheetId changes or on refresh
  useEffect(() => {
    if (isOnboarded && spreadsheetId) {
      fetchWeddingData();
    }
  }, [isOnboarded, spreadsheetId, activeTab]);

  const fetchWeddingData = async () => {
    setIsLoading(true);
    setSyncError(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const token = isMockMode ? 'mock-token' : googleToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/sync?spreadsheetId=${spreadsheetId}`, {
        method: 'GET',
        headers
      });

      const res = await response.json();
      if (res.success) {
        setWeddingData(res.data);
        if (res.weddingName) {
          setWeddingName(res.weddingName);
        }
      } else {
        throw new Error(res.error || 'Failed to fetch spreadsheet data');
      }
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'Error connecting to Google Sheet. Check authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  // Onboard flow (Atomic copy + config initialization)
  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSyncError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const token = isMockMode ? 'mock-token' : googleToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          weddingName,
          budget: budgetThreshold,
          driveFolder,
          selectedTasks
        })
      });

      const res = await response.json();
      if (res.success) {
        setSpreadsheetId(res.spreadsheetId);
        setIsOnboarded(true);
        localStorage.setItem('s2v_spreadsheet_id', res.spreadsheetId);
        localStorage.setItem('s2v_google_token', token);
        localStorage.setItem('s2v_is_onboarded', 'true');
        localStorage.setItem('s2v_is_mock', isMockMode ? 'true' : 'false');
        localStorage.setItem('s2v_wedding_name', res.weddingName);
        localStorage.setItem('s2v_wedding_date', weddingDate);
        localStorage.setItem('s2v_drive_folder', driveFolder);
      } else {
        throw new Error(res.error || 'Onboarding failed');
      }
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'Onboarding failed. Ensure Google Token is valid.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync / Update specific sheet category back to Google Sheets
  const syncUpdate = async (sheetType: 'dashboard' | 'guests' | 'budget' | 'schedule' | 'tasks' | 'music' | 'vendors' | 'photos' | 'gifts', updatedData: any) => {
    if (isSyncing || !spreadsheetId) return;
    setIsSyncing(true);
    setSyncError(null);

    // Optimistically update UI local state first
    if (weddingData) {
      setWeddingData({
        ...weddingData,
        [sheetType]: updatedData
      });
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const token = isMockMode ? 'mock-token' : googleToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          spreadsheetId,
          sheetType,
          data: updatedData
        })
      });

      const res = await response.json();
      if (!res.success) {
        throw new Error(res.error || `Failed to sync ${sheetType}`);
      }

      // If backend returns updated data (in mock mode), update our state
      if (res.data) {
        setWeddingData(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setSyncError(`Sync error: ${err.message || 'Could not push updates.'}`);
      // Re-fetch database to rollback client optimistic updates
      fetchWeddingData();
    } finally {
      setIsSyncing(false);
    }
  };

  // Disconnect sheet and reset local storage
  const handleConfirmDisconnect = () => {
    setSpreadsheetId('');
    setGoogleToken('');
    setIsOnboarded(false);
    setWeddingData(null);
    setWeddingName('');
    setWeddingDate('');
    setShowSettings(false);
    setShowDisconnectModal(false);
    setIsLoading(false);
    setSyncError(null);

    // Clear all s2v_ items from localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('s2v_')) {
        localStorage.removeItem(key);
      }
    }
  };

  const getCountdown = () => {
    if (!weddingDate) return "DATE NOT SET";
    const today = new Date();
    const target = new Date(weddingDate);
    const diffTime = target.getTime() - today.getTime();
    if (diffTime < 0) return "JUST MARRIED!";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} DAYS UNTIL THE WEDDING!`;
  };

  return (
    <div className="container" style={styles.container}>
      {/* Brand Header */}
      <header style={styles.appHeader}>
        <div style={styles.brandGroup}>
          <img src="/logo.png" alt="Sheet2Vow Logo" style={{ height: '50px', objectFit: 'contain' }} />
          <div>
            <h1 style={styles.brandName}>Sheet2Vow</h1>
            <p style={styles.brandSubtitle}>Clean digital canvas for spreadsheet purists.</p>
          </div>
        </div>

        {isOnboarded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              style={{ ...styles.iconBtn, color: 'var(--color-primary)' }} 
              onClick={() => {
                setPrintModalInitialTemplate('place_cards');
                setShowPrintModal(true);
              }}
              title="Open Print & Export Studio"
            >
              <Printer size={20} />
            </button>

            <button 
              style={{ ...styles.iconBtn, color: 'var(--color-primary)' }} 
              onClick={() => setShowShareModal(true)}
              title="Share Read-Only Vendor Link"
            >
              <Share2 size={20} />
            </button>

            <div ref={settingsRef} style={{ position: 'relative' }}>
              <button style={styles.iconBtn} onClick={() => setShowSettings(!showSettings)} title="Settings">
                <Settings size={20} />
              </button>
            {showSettings && (
              <div className="settingsDropdown" style={styles.settingsDropdown}>
                <div style={styles.settingsSection}>
                  <label style={styles.settingsLabel}>DESIGN STYLE</label>
                  <div style={styles.themeToggle}>
                    <button
                      style={{
                        ...styles.themeBtn,
                        fontWeight: styleTheme === 'editorial' ? 'bold' : 'normal',
                        backgroundColor: styleTheme === 'editorial' ? 'var(--color-primary)' : 'transparent',
                        color: styleTheme === 'editorial' ? 'var(--color-on-primary)' : 'var(--color-text)'
                      }}
                      onClick={() => setStyleTheme('editorial')}
                    >
                      EDITORIAL
                    </button>
                    <button
                      style={{
                        ...styles.themeBtn,
                        fontWeight: styleTheme === 'neo-brutalism' ? 'bold' : 'normal',
                        backgroundColor: styleTheme === 'neo-brutalism' ? 'var(--color-primary)' : 'transparent',
                        color: styleTheme === 'neo-brutalism' ? 'var(--color-on-primary)' : 'var(--color-text)'
                      }}
                      onClick={() => setStyleTheme('neo-brutalism')}
                    >
                      BRUTALISM
                    </button>
                  </div>
                </div>

                <div style={styles.settingsSection}>
                  <label style={styles.settingsLabel}>COLOR MODE</label>
                  <div style={styles.themeToggle}>
                    <button
                      style={{
                        ...styles.themeBtn,
                        fontWeight: theme === 'light' ? 'bold' : 'normal',
                        backgroundColor: theme === 'light' ? 'var(--color-primary)' : 'transparent',
                        color: theme === 'light' ? 'var(--color-on-primary)' : 'var(--color-text)'
                      }}
                      onClick={() => setTheme('light')}
                    >
                      LIGHT
                    </button>
                    <button
                      style={{
                        ...styles.themeBtn,
                        fontWeight: theme === 'dark' ? 'bold' : 'normal',
                        backgroundColor: theme === 'dark' ? 'var(--color-primary)' : 'transparent',
                        color: theme === 'dark' ? 'var(--color-on-primary)' : 'var(--color-text)'
                      }}
                      onClick={() => setTheme('dark')}
                    >
                      DARK
                    </button>
                  </div>
                </div>

                <div style={styles.settingsSection}>
                  <label style={styles.settingsLabel}>
                    {styleTheme === 'neo-brutalism' ? 'ACCENT COLOR' : 'PRIMARY COLOR'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={
                        primaryColor ||
                        (styleTheme === 'neo-brutalism'
                          ? '#00ED64'
                          : theme === 'dark'
                            ? '#f5f5f5'
                            : '#0d1b2a')
                      }
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ padding: 0, border: 'none', width: '24px', height: '24px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <button
                      onClick={() => setPrimaryColor('')}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.25rem 0.5rem', background: 'transparent', border: '1px solid var(--color-muted)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-text)' }}
                    >
                      RESET
                    </button>
                  </div>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <div style={styles.settingsSection}>
                    <label style={styles.settingsLabel}>DEV ENVIRONMENT MODE</label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.65rem',
                      backgroundColor: isMockMode ? 'rgba(205, 162, 80, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: `1px solid ${isMockMode ? '#cda250' : '#10b981'}`,
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '0.675rem',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isMockMode ? '#cda250' : '#10b981', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                          {isMockMode ? 'MOCK MODE ACTIVE' : 'LIVE DRIVE CONNECTED'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextMock = !isMockMode;
                          setIsMockMode(nextMock);
                          localStorage.setItem('s2v_is_mock', nextMock.toString());
                        }}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          backgroundColor: 'transparent',
                          color: 'var(--color-primary)',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {isMockMode ? 'TOGGLE LIVE' : 'TOGGLE MOCK'}
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-muted)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettings(false);
                      setShowAdvancedSettings(true);
                    }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.625rem',
                      width: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Sliders size={14} /> ADVANCED SETTINGS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>

      {/* IN-APP DISCONNECT CONFIRMATION MODAL */}
      {showDisconnectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '1rem'
        }} onClick={() => setShowDisconnectModal(false)}>
          <div style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '2px solid var(--color-red)',
            borderRadius: 'var(--border-radius-md)',
            width: '100%',
            maxWidth: '440px',
            boxShadow: 'var(--box-shadow-heavy)',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              backgroundColor: 'var(--color-red)',
              color: '#ffffff',
              padding: '0.875rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} />
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  DISCONNECT CONFIRMATION
                </h3>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }} onClick={() => setShowDisconnectModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to disconnect from your Google Sheet workspace?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0.5rem 0 0 0' }}>
                Your local session cache will be cleared. You can reconnect anytime using your Google credentials or spreadsheet URL.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.625rem 1.25rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowDisconnectModal(false)}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-red)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.625rem 1.25rem',
                    cursor: 'pointer'
                  }}
                  onClick={handleConfirmDisconnect}
                >
                  DISCONNECT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Share Link Modal */}
      {showShareModal && (
        <ShareModal
          spreadsheetId={spreadsheetId}
          weddingName={weddingName}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Print & Export Studio Modal */}
      {showPrintModal && (
        <PrintTemplatesModal
          initialTemplate={printModalInitialTemplate}
          guests={weddingData?.guests || []}
          schedule={weddingData?.schedule || []}
          vendors={weddingData?.vendors || []}
          weddingName={weddingName}
          weddingDate={weddingDate}
          timeFormat={timeFormat}
          currency={currency}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Advanced Settings Modal */}
      {showAdvancedSettings && (
        <AdvancedSettingsModal
          spreadsheetId={spreadsheetId}
          weddingName={weddingName}
          weddingDate={weddingDate}
          driveFolder={driveFolder}
          enabledModules={enabledModules}
          isMockMode={isMockMode}
          styleTheme={styleTheme}
          theme={theme}
          primaryColor={primaryColor}
          timeFormat={timeFormat}
          currency={currency}
          onUpdateWeddingDetails={handleUpdateWeddingDetails}
          onToggleModule={toggleModule}
          onUpdateStyleTheme={(st) => setStyleTheme(st)}
          onUpdateTheme={(th) => setTheme(th)}
          onUpdatePrimaryColor={(clr) => setPrimaryColor(clr)}
          onUpdateTimeFormat={(tf) => {
            setTimeFormat(tf);
            localStorage.setItem('s2v_time_format', tf);
          }}
          onUpdateCurrency={(cur) => {
            setCurrency(cur);
            localStorage.setItem('s2v_currency', cur);
          }}
          onDisconnect={() => setShowDisconnectModal(true)}
          onOpenShareModal={() => setShowShareModal(true)}
          onClose={() => setShowAdvancedSettings(false)}
        />
      )}

      {/* Main Core Area */}
      {!isOnboarded ? (
        /* Onboarding Workspace */
        <div style={styles.onboardWrapper}>
          <div style={styles.onboardHero}>
            <Heart size={36} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
            <h2 style={styles.onboardTitle}>Welcome to Sheet2Vow</h2>
            <p style={styles.onboardDesc}>
              A high-end wedding planning interface that maps directly onto a single Google Sheet in your personal Google Drive.
              No databases, no proprietary tracking. Your sheet is your data.
            </p>
          </div>

          <form onSubmit={handleOnboard} style={styles.onboardForm}>
            {/* Authenticated User Status */}
            <div style={styles.authStatusBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={styles.checkCircle}>
                  <Check size={14} style={{ color: '#fff' }} />
                </div>
                <div>
                  <span style={styles.authStatusLabel}>GOOGLE WORKSPACE CONNECTED</span>
                  <div style={styles.authEmail}>jordan.lee@gmail.com</div>
                </div>
              </div>
            </div>

            {/* Folder Destination Dropdown */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>GOOGLE DRIVE TARGET DIRECTORY *</label>
              <select
                value={driveFolder}
                onChange={(e) => setDriveFolder(e.target.value)}
                style={styles.select}
              >
                <option value="My Drive (Root)">My Drive (Root)</option>
                <option value="My Drive/Wedding Planning">My Drive/Wedding Planning</option>
                <option value="My Drive/Events/Wedding 2026">My Drive/Events/Wedding 2026</option>
                <option value="My Drive/Sheet2Vow">My Drive/Sheet2Vow</option>
              </select>
              <span style={styles.fieldInfo}>
                The master wedding sheet will be copied here.
              </span>
            </div>

            {/* Wedding Initial Settings */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>WEDDING COUPLE / TITLE *</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex & Sam's Wedding"
                value={weddingName}
                onChange={(e) => setWeddingName(e.target.value)}
                style={styles.input}
              />
            </div>

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

            {/* Active Modules Onboarding Selector */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>ENABLE FEATURE MODULES</label>
              <div style={styles.tasksChecklist}>
                {[
                  { key: 'guests', label: 'Guest Registry & Seating Charts' },
                  { key: 'budget', label: 'Budget Ledger & Outlays' },
                  { key: 'schedule', label: 'Day-Of Timeline & Up Next' },
                  { key: 'vendors', label: 'Vendor Directory' },
                  { key: 'tasks', label: 'Kanban Checklist' },
                  { key: 'music', label: 'Wedding Playlist & Music' },
                  { key: 'photos', label: 'Photo Shot List' },
                  { key: 'thanks', label: 'Thank You Tracker' },
                ].map((mod) => {
                  const isChecked = enabledModules[mod.key as keyof ModuleConfig];
                  return (
                    <label key={mod.key} style={styles.taskChecklabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleModule(mod.key as keyof ModuleConfig)}
                        style={styles.checkboxInput}
                      />
                      <span style={{ fontSize: '0.8rem', color: isChecked ? 'var(--color-text)' : 'var(--color-muted)' }}>
                        {mod.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              <span style={styles.fieldInfo}>
                You can toggle any of these modules on or off anytime in Settings.
              </span>
            </div>

            {/* Task Prepopulation Section */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>PREPOPULATE CHECKLIST (IMPORT DEFAULT TASKS)</label>
              <div style={styles.tasksChecklist}>
                {ALL_DEFAULT_TASKS.map((task) => {
                  const isChecked = selectedTasks.includes(task.taskName);
                  return (
                    <label key={task.taskId} style={styles.taskChecklabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTaskSelection(task.taskName)}
                        style={styles.checkboxInput}
                      />
                      <span style={{ fontSize: '0.8rem', color: isChecked ? 'var(--color-text)' : 'var(--color-muted)' }}>
                        {task.taskName} ({task.category})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {syncError && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} />
                <span>{syncError}</span>
              </div>
            )}

            <button type="submit" style={styles.submitBtn} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw style={styles.spin} size={16} /> INITIALIZING SPREADSHEET...
                </>
              ) : (
                <>
                  <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
                  GENERATE PERSONAL WEDDING DRIVE FILE
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Logged In Dashboard View */
        <div>

          {syncError && (
            <div style={{ ...styles.errorBox, marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{syncError}</span>
            </div>
          )}

          {/* Target Wedding Milestone Header */}
          <div style={styles.weddingTitleHeader}>
            <h2 className="wedding-title" style={styles.weddingNameText}>{weddingName.toUpperCase()}</h2>
            <div style={styles.weddingMilestoneDate}>{getCountdown()}</div>
          </div>

          {/* Navigation tabs */}
          <nav style={styles.navbar}>
            {[
              { id: 'metrics', label: '[ SUMMARY ]' },
              { id: 'guests', label: '[ GUEST LIST ]' },
              { id: 'tables', label: '[ SEATING CHART ]' },
              { id: 'budget', label: '[ LEDGER ]' },
              { id: 'schedule', label: '[ TIMELINE ]' },
              { id: 'vendors', label: '[ VENDORS ]' },
              { id: 'tasks', label: '[ TASK LIST ]' },
              { id: 'music', label: '[ MUSIC ]' },
              { id: 'photos', label: '[ PHOTOS ]' },
              { id: 'thanks', label: '[ THANKS ]' },
            ]
              .filter(tab => enabledModules[tab.id as keyof ModuleConfig])
              .map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    ...styles.navTabBtn,
                    color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted)',
                    fontWeight: activeTab === tab.id ? 700 : 400,
                    borderBottomColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent'
                  }}
                >
                  {tab.label}
                </button>
              ))}
          </nav>

          {/* View Router */}
          {isLoading ? (
            <div style={styles.mainLoader}>
              <RefreshCw className="spin" size={32} style={styles.spinIcon} />
              <p style={styles.loadingText}>Fetching spreadsheet structures...</p>
            </div>
          ) : (
            <div style={styles.tabContent}>
              {activeTab === 'metrics' && weddingData && (
                <>
                  <DashboardMetrics
                    metrics={weddingData.dashboard}
                    guests={weddingData.guests}
                    tasks={weddingData.tasks}
                    music={weddingData.music}
                    enabledModules={enabledModules}
                    currency={currency}
                    onNavigateTab={(tab, filter) => {
                      setActiveTab(tab as any);
                      if (filter) {
                        if (tab === 'guests') setGuestInitialFilter(filter as any);
                        if (tab === 'tasks') setTaskInitialFilter(filter as any);
                        if (tab === 'music') setMusicInitialFilter(filter);
                      }
                    }}
                  />
                  <VendorShareLinkManager
                    spreadsheetId={spreadsheetId}
                    weddingName={weddingName}
                    onOpenShareModal={() => setShowShareModal(true)}
                  />
                </>
              )}

              {activeTab === 'guests' && weddingData && (
                <GuestListManager
                  guests={weddingData.guests}
                  onUpdate={(data) => syncUpdate('guests', data)}
                  isSyncing={isSyncing}
                  initialRsvpFilter={guestInitialFilter}
                  onOpenPrintStudio={(tmpl) => {
                    setPrintModalInitialTemplate(tmpl);
                    setShowPrintModal(true);
                  }}
                />
              )}

              {activeTab === 'tables' && weddingData && (
                <SeatingChartManager
                  guests={weddingData.guests}
                  onUpdateGuests={(data) => syncUpdate('guests', data)}
                  isSyncing={isSyncing}
                  onOpenPrintStudio={(tmpl) => {
                    setPrintModalInitialTemplate(tmpl);
                    setShowPrintModal(true);
                  }}
                />
              )}

              {activeTab === 'budget' && weddingData && (
                <BudgetLedgerManager
                  budget={weddingData.budget}
                  onUpdate={(data) => syncUpdate('budget', data)}
                  isSyncing={isSyncing}
                  currency={currency}
                />
              )}

              {activeTab === 'schedule' && weddingData && (
                <TimelineManager
                  schedule={weddingData.schedule}
                  onUpdate={(data) => syncUpdate('schedule', data)}
                  isSyncing={isSyncing}
                  timeFormat={timeFormat}
                  onOpenPrintStudio={(tmpl) => {
                    setPrintModalInitialTemplate(tmpl);
                    setShowPrintModal(true);
                  }}
                />
              )}

              {activeTab === 'vendors' && weddingData && (
                <VendorManager
                  vendors={weddingData.vendors}
                  onUpdate={(data) => syncUpdate('vendors', data)}
                  isSyncing={isSyncing}
                  onOpenPrintStudio={(tmpl) => {
                    setPrintModalInitialTemplate(tmpl);
                    setShowPrintModal(true);
                  }}
                />
              )}

              {activeTab === 'tasks' && weddingData && (
                <KanbanBoard
                  tasks={weddingData.tasks}
                  onUpdate={(data) => syncUpdate('tasks', data)}
                  isSyncing={isSyncing}
                  initialStage={taskInitialFilter}
                />
              )}

              {activeTab === 'music' && weddingData && (
                <MusicManager
                  music={weddingData.music || []}
                  onUpdate={(data) => syncUpdate('music', data)}
                  isSyncing={isSyncing}
                  initialFilterPill={musicInitialFilter}
                />
              )}

              {activeTab === 'photos' && weddingData && (
                <PhotoShotListManager
                  photos={weddingData.photos || []}
                  onUpdatePhotos={(data: PhotoShot[]) => syncUpdate('photos', data)}
                  isSyncing={isSyncing}
                />
              )}

              {activeTab === 'thanks' && weddingData && (
                <ThankYouManager
                  gifts={weddingData.gifts || []}
                  guests={weddingData.guests || []}
                  onUpdateGifts={(data: GiftItem[]) => syncUpdate('gifts', data)}
                  onUpdateGuests={(data: Guest[]) => syncUpdate('guests', data)}
                  isSyncing={isSyncing}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Global Spinner Styling helper */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    paddingBottom: '4rem',
  },
  appHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid var(--color-primary)',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  brandIcon: {
    color: 'var(--color-primary)',
  },
  brandName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.75rem',
    color: 'var(--color-primary)',
    lineHeight: '1.1',
  },
  brandSubtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    color: 'var(--color-muted)',
    letterSpacing: '0.02em',
  },
  disconnectBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.375rem 0.625rem',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  onboardWrapper: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '2rem',
    boxShadow: 'var(--box-shadow-subtle)',
    maxWidth: '500px',
    margin: '2rem auto',
  },
  onboardHero: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  onboardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
    color: 'var(--color-primary)',
  },
  onboardDesc: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    lineHeight: '1.5',
  },
  onboardForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  authStatusBox: {
    backgroundColor: '#eef2f7',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem',
    marginBottom: '0.5rem',
  },
  checkCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authStatusLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    color: 'var(--color-muted)',
    fontWeight: 600,
    display: 'block',
  },
  authEmail: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  tasksChecklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '180px',
    overflowY: 'auto',
    backgroundColor: 'var(--color-surface, #fff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem',
  },
  taskChecklabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkboxInput: {
    width: '14px',
    height: '14px',
    cursor: 'pointer',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
  },
  input: {
    padding: '0.625rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.875rem',
  },
  select: {
    padding: '0.625rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.875rem',
    backgroundColor: 'var(--color-bg, #fff)',
    color: 'var(--color-text)',
  },
  fieldInfo: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    color: 'var(--color-muted)',
    marginTop: '0.25rem',
  },
  submitBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.825rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
    marginTop: '0.5rem',
  },
  spin: {
    animation: 'spin 1.5s linear infinite',
    marginRight: '0.5rem',
  },
  syncBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.5rem 0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  syncStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  syncText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-text)',
  },
  syncActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  syncLoader: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-primary)',
    fontWeight: 600,
  },
  refreshBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  weddingTitleHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  weddingNameText: {
    fontFamily: 'var(--font-header, var(--font-serif))',
    fontSize: '2rem',
    color: 'var(--color-primary)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    marginBottom: '0.25rem',
  },
  weddingMilestoneDate: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    letterSpacing: '0.1em',
  },
  navbar: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderBottom: '1px solid var(--color-primary)',
    gap: '0.5rem 1rem',
    marginBottom: '2rem',
    paddingBottom: '20px',
  },
  navTabBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.725rem',
    padding: '0.5rem 0',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  mainLoader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 0',
    gap: '1rem',
  },
  spinIcon: {
    color: 'var(--color-primary)',
    animation: 'spin 1.5s linear infinite',
  },
  loadingText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
  },
  tabContent: {
    animation: 'fadeIn 0.3s ease-in-out',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem',
    color: '#ef4444',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-sans)',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-primary)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  settingsDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    border: '2px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--box-shadow-hover)',
    padding: '1rem',
    minWidth: '240px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  settingsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  settingsLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
    fontWeight: 600,
  },
  themeToggle: {
    display: 'flex',
    gap: '0.25rem',
  },
  themeBtn: {
    flex: 1,
    padding: '0.35rem 0',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  sheetLink: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontWeight: 600,
  }
};
