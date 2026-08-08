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
import MenuSetupManager from '@/components/MenuSetupManager';
import ShareModal from '@/components/ShareModal';
import VendorShareLinkManager from '@/components/VendorShareLinkManager';
import AdvancedSettingsModal from '@/components/AdvancedSettingsModal';
import PrintTemplatesModal, { PrintTemplateType } from '@/components/PrintTemplatesModal';
import ToastNotification, { ToastMessage } from '@/components/ToastNotification';
import { RefreshCw, HardDrive, Heart, Sparkles, AlertCircle, FileSpreadsheet, Settings, Check, CheckCircle2, Key, X, Share2, Sliders, Printer, Zap, ArrowRight, PanelLeftClose, PanelLeftOpen, LayoutDashboard, Utensils, Grid, Camera, Users, DollarSign, Calendar, Briefcase, ListTodo, Music, Menu } from 'lucide-react';
import { ALL_DEFAULT_TASKS } from '@/lib/sheets/mockDb';
import { TASK_PRESETS } from '@/lib/presets/taskPresets';
import { getColorPresets } from '@/lib/themePresets';

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

  // Toast Notification System [GEN-3]
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'success', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const settingsRef = useRef<HTMLDivElement>(null);

  // Active Feature Modules Configuration
  const [enabledModules, setEnabledModules] = useState<ModuleConfig>({
    metrics: true,
    guests: true,
    tables: true,
    menu: true,
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
  const [styleTheme, setStyleTheme] = useState<'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo'>('editorial');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColor] = useState<string>('');

  const handleStyleThemeChange = (newStyle: 'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo') => {
    setStyleTheme(newStyle);
    const presets = getColorPresets(newStyle, theme);
    if (presets.length > 0) setPrimaryColor(presets[0].hex);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    const presets = getColorPresets(styleTheme, newTheme);
    if (presets.length > 0) setPrimaryColor(presets[0].hex);
  };

  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [currency, setCurrency] = useState<string>('USD');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printModalInitialTemplate, setPrintModalInitialTemplate] = useState<PrintTemplateType>('place_cards');

  // Onboarding Demo Mode & Preset States [ONBOARD-1, ONBOARD-3, ONBOARD-4, ONBOARD-6]
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(true);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('TRADITIONAL');
  const [showCustomTaskChecklist, setShowCustomTaskChecklist] = useState<boolean>(false);

  // Workspace Switcher & Re-entry Lifecycle States [LIFE-1, LIFE-2, LIFE-3, LIFE-4]
  const [workspaces, setWorkspaces] = useState<{ id: string; name: string; date?: string; folder?: string; isMock?: boolean; isDemo?: boolean }[]>([
    { id: 'mock-sheet-id-vow-12345', name: "Alex & Sam's Wedding", date: '2026-09-20', folder: 'My Drive/Wedding Planning', isMock: true, isDemo: true }
  ]);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState<boolean>(false);
  const [onboardTab, setOnboardTab] = useState<'new' | 'reconnect' | 'demo'>('new');
  const [reconnectMethod, setReconnectMethod] = useState<'scan' | 'order' | 'url'>('scan');
  const [reconnectOrderId, setReconnectOrderId] = useState<string>('');
  const [reconnectEmail, setReconnectEmail] = useState<string>('');
  const [reconnectUrl, setReconnectUrl] = useState<string>('');
  const [isScanningDrive, setIsScanningDrive] = useState<boolean>(false);
  const [scannedSheets, setScannedSheets] = useState<{ id: string; name: string; folder: string }[]>([]);
  const [showPostActivationGuidance, setShowPostActivationGuidance] = useState<boolean>(false);

  // Navigation Layout & Mobile Responsive States [NAV-1]
  const [navLayout, setNavLayout] = useState<'top' | 'sidebar'>('top');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  const [activeTab, setActiveTab] = useState<'home' | 'metrics' | 'guests' | 'menu' | 'tables' | 'budget' | 'schedule' | 'tasks' | 'vendors' | 'music' | 'photos' | 'thanks'>('home');
  const [guestInitialFilter, setGuestInitialFilter] = useState<RSVPStatus | 'All'>('All');
  const [taskInitialFilter, setTaskInitialFilter] = useState<KanbanStage | undefined>(undefined);
  const [musicInitialFilter, setMusicInitialFilter] = useState<string | undefined>(undefined);

  // Tab switching with browser History API push & URL hash sync
  const switchTab = (tab: 'home' | 'metrics' | 'guests' | 'menu' | 'tables' | 'budget' | 'schedule' | 'tasks' | 'vendors' | 'music' | 'photos' | 'thanks', filter?: string, pushToHistory = true) => {
    const targetTab = tab === 'metrics' ? 'home' : tab;
    setActiveTab(targetTab as any);
    if (filter) {
      if (tab === 'guests') setGuestInitialFilter(filter as any);
      if (tab === 'tasks') setTaskInitialFilter(filter as any);
      if (tab === 'music') setMusicInitialFilter(filter);
    }

    if (pushToHistory && typeof window !== 'undefined') {
      const hash = `#${tab}${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`;
      if (window.location.hash !== hash) {
        window.history.pushState({ tab, filter }, '', hash);
      }
    }
  };

  // Listen for browser Back & Forward popstate events
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [tabName, queryStr] = hash.split('?');
        const params = new URLSearchParams(queryStr || '');
        const filter = params.get('filter') || undefined;

        const validTabs = ['home', 'metrics', 'guests', 'tables', 'budget', 'schedule', 'tasks', 'vendors', 'music', 'photos', 'thanks'];
        if (validTabs.includes(tabName)) {
          switchTab(tabName as any, filter, false);
          return;
        }
      }
      if (event.state?.tab) {
        switchTab(event.state.tab, event.state.filter, false);
      } else {
        switchTab('home', undefined, false);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial load URL hash check
    if (typeof window !== 'undefined' && window.location.hash) {
      const initialHash = window.location.hash.replace('#', '');
      const [tabName, queryStr] = initialHash.split('?');
      const params = new URLSearchParams(queryStr || '');
      const filter = params.get('filter') || undefined;

      const validTabs = ['home', 'metrics', 'guests', 'tables', 'budget', 'schedule', 'tasks', 'vendors', 'music', 'photos', 'thanks'];
      if (validTabs.includes(tabName)) {
        switchTab(tabName as any, filter, false);
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Load configuration from local storage on mount
  useEffect(() => {
    const savedSheetId = localStorage.getItem('s2v_spreadsheet_id');
    const savedToken = localStorage.getItem('s2v_google_token');
    const savedOnboarded = localStorage.getItem('s2v_is_onboarded');
    const savedMock = localStorage.getItem('s2v_is_mock');
    const savedDemo = localStorage.getItem('s2v_is_demo');
    const savedName = localStorage.getItem('s2v_wedding_name');
    const savedDate = localStorage.getItem('s2v_wedding_date');
    const savedStyleTheme = localStorage.getItem('s2v_style_theme');
    const savedTheme = localStorage.getItem('s2v_theme');
    const savedColor = localStorage.getItem('s2v_primary_color');
    const savedTimeFormat = localStorage.getItem('s2v_time_format');
    const savedCurrency = localStorage.getItem('s2v_currency');
    const savedFolder = localStorage.getItem('s2v_drive_folder');
    const savedModules = localStorage.getItem('s2v_enabled_modules');
    const savedWorkspacesStr = localStorage.getItem('s2v_workspaces');
    const savedNavLayout = localStorage.getItem('s2v_nav_layout');

    if (savedNavLayout === 'top' || savedNavLayout === 'sidebar') {
      setNavLayout(savedNavLayout);
    }

    if (savedWorkspacesStr) {
      try {
        const parsed = JSON.parse(savedWorkspacesStr);
        if (Array.isArray(parsed) && parsed.length > 0) setWorkspaces(parsed);
      } catch (e) {
        console.error(e);
      }
    }

    if (savedSheetId) setSpreadsheetId(savedSheetId);
    if (savedToken) setGoogleToken(savedToken);
    if (savedOnboarded === 'true') setIsOnboarded(true);
    if (savedMock === 'false') setIsMockMode(false);
    if (savedDemo === 'true') setIsDemoMode(true);
    if (savedName) setWeddingName(savedName);
    if (savedDate) setWeddingDate(savedDate);
    if (savedStyleTheme === 'editorial' || savedStyleTheme === 'neo-brutalism' || savedStyleTheme === 'botanical-romance' || savedStyleTheme === 'midnight-tuxedo') setStyleTheme(savedStyleTheme);
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
          menu: parsed.menu ?? true,
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
    const isTabActive = activeTab === 'home' ? (enabledModules.home ?? enabledModules.metrics) : enabledModules[activeTab];
    if (!isTabActive) {
      const tabsOrder: (keyof ModuleConfig)[] = ['metrics', 'guests', 'budget', 'schedule', 'tasks', 'vendors', 'music'];
      const firstAvailable = tabsOrder.find(m => enabledModules[m]);
      setActiveTab((firstAvailable as any) === 'metrics' ? 'home' : (firstAvailable as any) || 'home');
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

  // Express 1-Click Onboard Demo Launch [ONBOARD-1]
  const handleExpressOnboard = () => {
    try {
      const demoWeddingName = "Alex & Sam's Wedding";
      const demoWeddingDate = "2026-09-20";
      const demoBudget = 35000;
      const demoFolder = "My Drive/Wedding Planning";

      if (typeof window !== 'undefined') {
        localStorage.setItem('s2v_spreadsheet_id', 'mock-sheet-id-vow-12345');
        localStorage.setItem('s2v_google_token', 'mock-token');
        localStorage.setItem('s2v_is_onboarded', 'true');
        localStorage.setItem('s2v_is_mock', 'true');
        localStorage.setItem('s2v_is_demo', 'true');
        localStorage.setItem('s2v_wedding_name', demoWeddingName);
        localStorage.setItem('s2v_wedding_date', demoWeddingDate);
        localStorage.setItem('s2v_drive_folder', demoFolder);
        window.location.href = '/#home';
      }

      setWeddingName(demoWeddingName);
      setWeddingDate(demoWeddingDate);
      setBudgetThreshold(demoBudget);
      setSpreadsheetId('mock-sheet-id-vow-12345');
      setIsMockMode(true);
      setIsDemoMode(true);
      setIsOnboarded(true);
    } catch (err: any) {
      console.error(err);
      setSyncError('Failed to launch demo workspace.');
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
      addToast(`Saved! ${sheetType.toUpperCase()} updated.`, 'success');
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
    setIsDemoMode(false);
    setShowDemoBanner(true);
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
    <div
      className="app-viewport-container"
      style={{
        ...styles.container,
        marginLeft: (!isMobile && isOnboarded && navLayout === 'sidebar') ? (isSidebarCollapsed ? '64px' : '220px') : 0,
        transition: 'margin-left 0.2s ease'
      }}
    >
      {/* Mobile Navigation Overlay Drawer */}
      {isMobile && isMobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            display: 'flex'
          }}
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            style={{
              width: '260px',
              backgroundColor: 'var(--color-surface, #fff)',
              height: '100%',
              padding: '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: 'var(--box-shadow-hover)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileSpreadsheet size={22} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>Sheet2Vow</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem', flex: 1, overflowY: 'auto' }}>
              {[
                { id: 'home', label: 'Summary', icon: LayoutDashboard },
                { id: 'guests', label: 'Guest List', icon: Users },
                { id: 'menu', label: 'Catering', icon: Utensils },
                { id: 'tables', label: 'Seating', icon: Grid },
                { id: 'budget', label: 'Ledger', icon: DollarSign },
                { id: 'schedule', label: 'Timeline', icon: Calendar },
                { id: 'vendors', label: 'Vendors', icon: Briefcase },
                { id: 'tasks', label: 'Tasks', icon: ListTodo },
                { id: 'music', label: 'Music', icon: Music },
                { id: 'photos', label: 'Photos', icon: Camera },
                { id: 'thanks', label: 'Thanks', icon: Heart },
              ]
                .filter(tab => (enabledModules as any)[tab.id] ?? (tab.id === 'home' ? enabledModules.metrics : true))
                .map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        switchTab(tab.id as any);
                        setIsMobileDrawerOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--border-radius-sm)',
                        backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                        color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 700 : 500
                      }}
                    >
                      <IconComp size={18} />
                      <span>{tab.label.toUpperCase()}</span>
                    </button>
                  );
                })}
            </div>

            {/* Bottom Quick Tools (Print Studio, Share Link & Settings) */}
            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setShowPrintModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <Printer size={16} style={{ color: 'var(--color-primary)' }} />
                <span>PRINT STUDIO & CANVA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setShowShareModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <Share2 size={16} style={{ color: 'var(--color-primary)' }} />
                <span>SHARE VIEW-ONLY LINK</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setShowSettings(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <Settings size={16} style={{ color: 'var(--color-primary)' }} />
                <span>QUICK SETTINGS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Collapsible Left Sidebar [NAV-1] */}
      {!isMobile && isOnboarded && navLayout === 'sidebar' && (
        <aside
          className="app-sidebar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: isSidebarCollapsed ? '64px' : '220px',
            backgroundColor: 'var(--color-surface, #fff)',
            borderRight: '2px solid var(--color-border)',
            padding: '1rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'width 0.2s ease',
            zIndex: 90,
            boxShadow: 'var(--box-shadow-hover)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', padding: '0 0.25rem' }}>
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileSpreadsheet size={20} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>Sheet2Vow</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  padding: '0.3rem',
                  color: 'var(--color-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              {[
                { id: 'home', label: 'Summary', icon: LayoutDashboard },
                { id: 'guests', label: 'Guest List', icon: Users },
                { id: 'menu', label: 'Catering', icon: Utensils },
                { id: 'tables', label: 'Seating', icon: Grid },
                { id: 'budget', label: 'Ledger', icon: DollarSign },
                { id: 'schedule', label: 'Timeline', icon: Calendar },
                { id: 'vendors', label: 'Vendors', icon: Briefcase },
                { id: 'tasks', label: 'Tasks', icon: ListTodo },
                { id: 'music', label: 'Music', icon: Music },
                { id: 'photos', label: 'Photos', icon: Camera },
                { id: 'thanks', label: 'Thanks', icon: Heart },
              ]
                .filter(tab => (enabledModules as any)[tab.id] ?? (tab.id === 'home' ? enabledModules.metrics : true))
                .map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => switchTab(tab.id as any)}
                      title={tab.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--border-radius-sm)',
                        backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                        color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.725rem',
                        fontWeight: isActive ? 700 : 500,
                        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <IconComp size={16} style={{ flexShrink: 0 }} />
                      {!isSidebarCollapsed && <span>{tab.label.toUpperCase()}</span>}
                    </button>
                  );
                })}
            </div>
          </div>
        </aside>
      )}

      {/* Brand Header */}
      <header style={{ ...styles.appHeader, display: 'flex', alignItems: 'center' }}>
        <div style={{ ...styles.brandGroup, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isMobile ? (
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              title="Open Navigation Menu"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '0.4rem',
                cursor: 'pointer',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.35rem'
              }}
            >
              <Menu size={22} style={{ color: 'var(--color-primary)' }} />
            </button>
          ) : (
            <FileSpreadsheet size={38} style={{ color: theme === 'dark' ? '#ffffff' : '#000000', flexShrink: 0 }} />
          )}

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{ ...styles.brandName, fontSize: isMobile ? '1.35rem' : styles.brandName.fontSize, margin: 0, lineHeight: 1 }}>Sheet2Vow</h1>
            {!isMobile && <p style={styles.brandSubtitle}>Clean digital canvas for spreadsheet purists.</p>}
          </div>
        </div>

        {isOnboarded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Multi-Workspace Switcher Dropdown [LIFE-3] */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.4rem 0.65rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                title="Switch Wedding Workspace or Client Sheet"
              >
                <HardDrive size={14} style={{ color: 'var(--color-primary)' }} />
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {weddingName || 'MY WORKSPACE'}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-muted)' }}>▼</span>
              </button>

              {showWorkspaceMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  backgroundColor: 'var(--color-surface, #fff)',
                  border: '2px solid var(--color-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '0.75rem',
                  width: '260px',
                  zIndex: 100,
                  boxShadow: 'var(--box-shadow-hover)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-muted)', letterSpacing: '0.5px' }}>
                    SWITCH WEDDING WORKSPACE
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {workspaces.map((ws) => {
                      const isActive = ws.id === spreadsheetId;
                      return (
                        <div
                          key={ws.id}
                          onClick={() => {
                            setSpreadsheetId(ws.id);
                            setWeddingName(ws.name);
                            if (ws.date) setWeddingDate(ws.date);
                            if (ws.folder) setDriveFolder(ws.folder);
                            setIsMockMode(ws.isMock ?? false);
                            setIsDemoMode(ws.isDemo ?? false);
                            setIsOnboarded(true);
                            if (typeof window !== 'undefined') {
                              localStorage.setItem('s2v_spreadsheet_id', ws.id);
                              localStorage.setItem('s2v_wedding_name', ws.name);
                              if (ws.date) localStorage.setItem('s2v_wedding_date', ws.date);
                              if (ws.folder) localStorage.setItem('s2v_drive_folder', ws.folder);
                              localStorage.setItem('s2v_is_mock', (ws.isMock ?? false).toString());
                              localStorage.setItem('s2v_is_demo', (ws.isDemo ?? false).toString());
                              localStorage.setItem('s2v_is_onboarded', 'true');
                            }
                            setShowWorkspaceMenu(false);
                            addToast(`Switched workspace to ${ws.name}`, 'success');
                          }}
                          style={{
                            padding: '0.4rem 0.5rem',
                            borderRadius: 'var(--border-radius-sm)',
                            backgroundColor: isActive ? 'var(--color-bg-subtle)' : 'transparent',
                            border: isActive ? '1px solid var(--color-primary)' : '1px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'var(--transition-smooth)'
                          }}
                        >
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: 'var(--color-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {ws.name}
                            </div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--color-muted)' }}>
                              {ws.isDemo ? '⚡ Demo Mode' : ws.folder || 'Google Drive'}
                            </div>
                          </div>
                          {isActive && <Check size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWorkspaceMenu(false);
                        setIsOnboarded(false);
                        setOnboardTab('reconnect');
                      }}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        backgroundColor: 'transparent',
                        color: 'var(--color-primary)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <span>➕ CONNECT ANOTHER SPREADSHEET</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isMobile && (
              <>
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
              </>
            )}

            <div ref={settingsRef} style={{ position: 'relative' }}>
              <button style={styles.iconBtn} onClick={() => setShowSettings(!showSettings)} title="Settings">
                <Settings size={20} />
              </button>
              {showSettings && (
                <div className="settingsDropdown" style={styles.settingsDropdown}>
                  <div style={styles.settingsSection}>
                    <label style={styles.settingsLabel}>DESIGN STYLE</label>
                    <div style={{ ...styles.themeToggle, flexWrap: 'wrap' }}>
                      <button
                        style={{
                          ...styles.themeBtn,
                          flex: '1 1 45%',
                          fontWeight: styleTheme === 'editorial' ? 'bold' : 'normal',
                          backgroundColor: styleTheme === 'editorial' ? 'var(--color-primary)' : 'transparent',
                          color: styleTheme === 'editorial' ? 'var(--color-on-primary)' : 'var(--color-text)'
                        }}
                        onClick={() => handleStyleThemeChange('editorial')}
                        title="Editorial Minimalist: Classic Serif & Soft Shadows"
                      >
                        EDITORIAL
                      </button>
                      <button
                        style={{
                          ...styles.themeBtn,
                          flex: '1 1 45%',
                          fontWeight: styleTheme === 'neo-brutalism' ? 'bold' : 'normal',
                          backgroundColor: styleTheme === 'neo-brutalism' ? 'var(--color-primary)' : 'transparent',
                          color: styleTheme === 'neo-brutalism' ? 'var(--color-on-primary)' : 'var(--color-text)'
                        }}
                        onClick={() => handleStyleThemeChange('neo-brutalism')}
                        title="Muted Neo-Brutalism: Geist Mono & Bold Borders"
                      >
                        BRUTALISM
                      </button>
                      <button
                        style={{
                          ...styles.themeBtn,
                          flex: '1 1 45%',
                          fontWeight: styleTheme === 'botanical-romance' ? 'bold' : 'normal',
                          backgroundColor: styleTheme === 'botanical-romance' ? 'var(--color-primary)' : 'transparent',
                          color: styleTheme === 'botanical-romance' ? 'var(--color-on-primary)' : 'var(--color-text)'
                        }}
                        onClick={() => handleStyleThemeChange('botanical-romance')}
                        title="Botanical Romance: Cormorant & Organic Sage Tones"
                      >
                        BOTANICAL
                      </button>
                      <button
                        style={{
                          ...styles.themeBtn,
                          flex: '1 1 45%',
                          fontWeight: styleTheme === 'midnight-tuxedo' ? 'bold' : 'normal',
                          backgroundColor: styleTheme === 'midnight-tuxedo' ? 'var(--color-primary)' : 'transparent',
                          color: styleTheme === 'midnight-tuxedo' ? 'var(--color-on-primary)' : 'var(--color-text)'
                        }}
                        onClick={() => handleStyleThemeChange('midnight-tuxedo')}
                        title="Midnight Tuxedo: Bodoni & Sharp Monochrome"
                      >
                        TUXEDO
                      </button>
                    </div>
                  </div>

                  <div style={styles.settingsSection}>
                    <label style={styles.settingsLabel}>NAVIGATION LAYOUT</label>
                    <div style={styles.themeToggle}>
                      <button
                        style={{
                          ...styles.themeBtn,
                          fontWeight: navLayout === 'top' ? 'bold' : 'normal',
                          backgroundColor: navLayout === 'top' ? 'var(--color-primary)' : 'transparent',
                          color: navLayout === 'top' ? 'var(--color-on-primary)' : 'var(--color-text)'
                        }}
                        onClick={() => {
                          setNavLayout('top');
                          localStorage.setItem('s2v_nav_layout', 'top');
                        }}
                        title="Top Horizontal Navbar"
                      >
                        TOP NAVBAR
                      </button>
                      <button
                        style={{
                          ...styles.themeBtn,
                          fontWeight: navLayout === 'sidebar' ? 'bold' : 'normal',
                          backgroundColor: navLayout === 'sidebar' ? 'var(--color-primary)' : 'transparent',
                          color: navLayout === 'sidebar' ? 'var(--color-on-primary)' : 'var(--color-text)'
                        }}
                        onClick={() => {
                          setNavLayout('sidebar');
                          localStorage.setItem('s2v_nav_layout', 'sidebar');
                        }}
                        title="Sticky Collapsible Left Sidebar Layout"
                      >
                        LEFT SIDEBAR
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
                        onClick={() => handleThemeChange('light')}
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
                        onClick={() => handleThemeChange('dark')}
                      >
                        DARK
                      </button>
                    </div>
                  </div>

                  <div style={styles.settingsSection}>
                    <label style={styles.settingsLabel}>
                      {styleTheme === 'neo-brutalism' ? 'ACCENT COLOR' : 'PRIMARY COLOR'}
                    </label>

                    {/* Suggestive Color Presets (Adapted by Style & Theme Mode) [UX-11] */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      {getColorPresets(styleTheme, theme).map((preset) => {
                        const isSelected = (primaryColor || '').toLowerCase() === preset.hex.toLowerCase();
                        return (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setPrimaryColor(preset.hex)}
                            title={`${preset.name} (${preset.hex})`}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: preset.hex,
                              border: isSelected ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
                              boxShadow: isSelected ? '0 0 0 2px var(--color-bg), 0 0 0 3px var(--color-primary)' : 'none',
                              cursor: 'pointer',
                              padding: 0,
                              flexShrink: 0
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Custom Hex Input & Reset [UX-13] */}
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
                        title="Custom Color Picker"
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-muted)' }}>
                        {primaryColor ? primaryColor.toUpperCase() : 'DEFAULT'}
                      </span>
                      <button
                        onClick={() => setPrimaryColor('')}
                        title="Reset primary color to theme default preset"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.2rem 0.4rem', background: 'transparent', border: '1px solid var(--color-muted)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-text)', marginLeft: 'auto' }}
                      >
                        RESET TO DEFAULT
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

                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                        color: theme === 'dark' ? '#000000' : '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '0.625rem',
                        width: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <Sliders size={16} />
                      <span>ADVANCED SETTINGS</span>
                    </button>

                    {/* Temporary Testing Button: Re-Enter Onboarding Setup Mode */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSettings(false);
                        setIsOnboarded(false);
                        setIsDemoMode(false);
                        addToast('Re-entered Setup Mode (Testing)', 'info');
                      }}
                      title="Temporary testing button: Re-opens the Onboarding & Registration Setup Screen"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: 'var(--color-amber-dark, #b45309)',
                        border: '1px dashed #f59e0b',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '0.5rem',
                        width: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Zap size={14} />
                      <span>🚀 TEST SETUP MODE (ONBOARDING)</span>
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
          onUpdateStyleTheme={handleStyleThemeChange}
          onUpdateTheme={handleThemeChange}
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

            {/* Segmented Onboarding Mode Selector Hub [LIFE-1] */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { id: 'new', label: '➕ CONFIGURE NEW PLANNER' },
                { id: 'reconnect', label: '🔑 RECONNECT EXISTING SHEET' },
                { id: 'demo', label: '⚡ EXPLORE DEMO' },
              ].map((tab) => {
                const isSelected = onboardTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOnboardTab(tab.id as any)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                      color: isSelected ? 'var(--color-on-primary)' : 'var(--color-text)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.5rem 0.85rem',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 🔑 Reconnect Existing Sheet Hub [LIFE-1, LIFE-2] */}
            {onboardTab === 'reconnect' && (
              <div style={{
                backgroundColor: 'var(--color-bg-subtle)',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1.25rem',
                textAlign: 'left',
                boxShadow: 'var(--box-shadow-subtle)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>
                  🔑 RECONNECT YOUR EXISTING WEDDING PLANNER
                </h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--color-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  Already created a Sheet2Vow planner on another device or cleared browser cache? Choose how to reconnect:
                </p>

                {/* Sub-method Selector */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setReconnectMethod('scan')}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.675rem',
                      fontWeight: 700,
                      backgroundColor: reconnectMethod === 'scan' ? 'var(--color-primary)' : 'transparent',
                      color: reconnectMethod === 'scan' ? 'var(--color-on-primary)' : 'var(--color-text)',
                      border: '1px solid var(--color-primary)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.35rem 0.65rem',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 1-CLICK DRIVE SCANNER
                  </button>
                  <button
                    type="button"
                    onClick={() => setReconnectMethod('order')}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.675rem',
                      fontWeight: 700,
                      backgroundColor: reconnectMethod === 'order' ? 'var(--color-primary)' : 'transparent',
                      color: reconnectMethod === 'order' ? 'var(--color-on-primary)' : 'var(--color-text)',
                      border: '1px solid var(--color-primary)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.35rem 0.65rem',
                      cursor: 'pointer'
                    }}
                  >
                    📜 ETSY ORDER LOOKUP
                  </button>
                  <button
                    type="button"
                    onClick={() => setReconnectMethod('url')}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.675rem',
                      fontWeight: 700,
                      backgroundColor: reconnectMethod === 'url' ? 'var(--color-primary)' : 'transparent',
                      color: reconnectMethod === 'url' ? 'var(--color-on-primary)' : 'var(--color-text)',
                      border: '1px solid var(--color-primary)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.35rem 0.65rem',
                      cursor: 'pointer'
                    }}
                  >
                    🔗 SPREADSHEET URL / ID
                  </button>
                </div>

                {/* Option 1: Drive Scanner [LIFE-2] */}
                {reconnectMethod === 'scan' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsScanningDrive(true);
                        setTimeout(() => {
                          setScannedSheets([
                            { id: 'mock-sheet-id-vow-12345', name: "Alex & Sam's Wedding", folder: 'My Drive/Wedding Planning' },
                            { id: 'mock-sheet-sarah-2026', name: "Sarah & Mark's Wedding 2026", folder: 'My Drive/Events/Wedding 2026' }
                          ]);
                          setIsScanningDrive(false);
                        }, 600);
                      }}
                      disabled={isScanningDrive}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        border: 'none',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '0.625rem 1rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {isScanningDrive ? <RefreshCw className="spin" size={16} /> : <HardDrive size={16} />}
                      <span>{isScanningDrive ? 'SCANNING GOOGLE DRIVE...' : '🔍 SCAN GOOGLE DRIVE FOR SHEET2VOW FILES'}</span>
                    </button>

                    {scannedSheets.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 700 }}>
                          DETECTED GOOGLE DRIVE SPREADSHEETS:
                        </span>
                        {scannedSheets.map((sheet) => (
                          <div
                            key={sheet.id}
                            style={{
                              backgroundColor: 'var(--color-surface, #fff)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--border-radius-sm)',
                              padding: '0.625rem 0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)' }}>
                                {sheet.name}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--color-muted)' }}>
                                📁 {sheet.folder} &bull; ID: {sheet.id}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newWs = { id: sheet.id, name: sheet.name, folder: sheet.folder, isMock: true, isDemo: sheet.id === 'mock-sheet-id-vow-12345' };
                                setWorkspaces(prev => [...prev.filter(w => w.id !== sheet.id), newWs]);
                                setSpreadsheetId(sheet.id);
                                setWeddingName(sheet.name);
                                setDriveFolder(sheet.folder);
                                setIsMockMode(true);
                                setIsOnboarded(true);
                                setShowPostActivationGuidance(true);
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('s2v_spreadsheet_id', sheet.id);
                                  localStorage.setItem('s2v_wedding_name', sheet.name);
                                  localStorage.setItem('s2v_drive_folder', sheet.folder);
                                  localStorage.setItem('s2v_is_onboarded', 'true');
                                }
                                addToast(`Reconnected workspace: ${sheet.name}`, 'success');
                              }}
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-on-primary)',
                                border: 'none',
                                borderRadius: 'var(--border-radius-sm)',
                                padding: '0.35rem 0.65rem',
                                cursor: 'pointer'
                              }}
                            >
                              RECONNECT
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Option 2: Order ID Lookup */}
                {reconnectMethod === 'order' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const sheetName = reconnectEmail ? `${reconnectEmail.split('@')[0]}'s Wedding` : "Alex & Sam's Wedding";
                      const sheetId = 'mock-sheet-id-vow-12345';
                      setSpreadsheetId(sheetId);
                      setWeddingName(sheetName);
                      setIsMockMode(true);
                      setIsOnboarded(true);
                      setShowPostActivationGuidance(true);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('s2v_spreadsheet_id', sheetId);
                        localStorage.setItem('s2v_wedding_name', sheetName);
                        localStorage.setItem('s2v_is_onboarded', 'true');
                      }
                      addToast(`Reconnected order #${reconnectOrderId || 'ETSY-VERIFIED'}`, 'success');
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                  >
                    <input
                      type="email"
                      required
                      placeholder="Etsy Purchase Email Address"
                      value={reconnectEmail}
                      onChange={(e) => setReconnectEmail(e.target.value)}
                      style={styles.input}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Etsy Order ID (e.g. ETSY-98765432)"
                      value={reconnectOrderId}
                      onChange={(e) => setReconnectOrderId(e.target.value)}
                      style={styles.input}
                    />
                    <button
                      type="submit"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        border: 'none',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '0.625rem 1rem',
                        cursor: 'pointer'
                      }}
                    >
                      VERIFY ORDER & RECONNECT PLANNER
                    </button>
                  </form>
                )}

                {/* Option 3: Sheet URL / ID */}
                {reconnectMethod === 'url' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      let extractedId = reconnectUrl.trim();
                      const match = reconnectUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
                      if (match) extractedId = match[1];

                      if (!extractedId) return;

                      setSpreadsheetId(extractedId);
                      setWeddingName("Reconnected Wedding Planner");
                      setIsMockMode(true);
                      setIsOnboarded(true);
                      setShowPostActivationGuidance(true);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('s2v_spreadsheet_id', extractedId);
                        localStorage.setItem('s2v_wedding_name', "Reconnected Wedding Planner");
                        localStorage.setItem('s2v_is_onboarded', 'true');
                      }
                      addToast('Reconnected to Google Sheet ID', 'success');
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                  >
                    <input
                      type="text"
                      required
                      placeholder="Paste Google Sheet URL or ID (e.g. https://docs.google.com/spreadsheets/d/1A2B3C...)"
                      value={reconnectUrl}
                      onChange={(e) => setReconnectUrl(e.target.value)}
                      style={styles.input}
                    />
                    <button
                      type="submit"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        border: 'none',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '0.625rem 1rem',
                        cursor: 'pointer'
                      }}
                    >
                      RECONNECT BY SPREADSHEET ID
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ⚡ Express Demo Card [LIFE-1] */}
            {onboardTab === 'demo' && (
              <div style={{
                backgroundColor: 'var(--color-bg-subtle)',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1.25rem',
                textAlign: 'center',
                boxShadow: 'var(--box-shadow-subtle)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Zap size={22} style={{ color: 'var(--color-gold, #f59e0b)' }} />
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                    EXPLORE DEMO WORKSPACE
                  </h3>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  Want to test-drive Sheet2Vow right now? Instantly launch our pre-populated sample wedding workspace (*Alex & Sam's Wedding*) with sample guests, budget, timeline & vendors — zero setup required.
                </p>

                <button
                  type="button"
                  onClick={handleExpressOnboard}
                  disabled={isLoading}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.825rem',
                    fontWeight: 800,
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.75rem 1.25rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    justifyContent: 'center',
                    boxShadow: 'var(--box-shadow-subtle)'
                  }}
                >
                  <Zap size={18} />
                  <span>⚡ EXPLORE DEMO WORKSPACE (JUMP RIGHT IN)</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0 0.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 700 }}>
                OR CONFIGURE YOUR PERSONAL SPREADSHEET
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>
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

            {/* Folder Destination Selector Cards [ONBOARD-4] */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>GOOGLE DRIVE TARGET DIRECTORY *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
                {[
                  { path: 'My Drive/Wedding Planning', name: 'Wedding Planning', badge: 'RECOMMENDED', desc: 'My Drive/Wedding Planning' },
                  { path: 'My Drive (Root)', name: 'My Drive Root', badge: 'ROOT', desc: 'My Drive/' },
                  { path: 'My Drive/Sheet2Vow', name: 'Sheet2Vow App', badge: 'DEDICATED', desc: 'My Drive/Sheet2Vow' },
                ].map((folder) => {
                  const isSelected = driveFolder === folder.path;
                  return (
                    <div
                      key={folder.path}
                      onClick={() => setDriveFolder(folder.path)}
                      style={{
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: isSelected ? 'var(--color-bg-subtle)' : 'var(--color-surface, #fff)',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '0.625rem 0.75rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <HardDrive size={16} style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-muted)' }} />
                        {isSelected && <Check size={14} style={{ color: 'var(--color-primary)' }} />}
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: isSelected ? 700 : 600, color: 'var(--color-text)' }}>
                        {folder.name}
                      </span>
                      <span style={{ fontSize: '0.625rem', color: 'var(--color-muted)', wordBreak: 'break-all' }}>
                        {folder.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
              <span style={styles.fieldInfo}>
                The master wedding Google Sheet will be copied directly into this Drive folder.
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

            {/* Task Prepopulation Selector Cards [ONBOARD-3] */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>CHOOSE TASK CHECKLIST PRESET PACK</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.625rem' }}>
                {Object.values(TASK_PRESETS).map((preset) => {
                  const isSelected = selectedPresetKey === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetKey(preset.id);
                        if (preset.tasks.length > 0) {
                          setSelectedTasks(preset.tasks.map(t => t.taskName));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                      style={{
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                        backgroundColor: isSelected ? 'var(--color-bg-subtle)' : 'var(--color-surface, #fff)',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                          color: isSelected ? 'var(--color-on-primary)' : 'var(--color-muted)',
                          padding: '0.1rem 0.35rem',
                          borderRadius: 'var(--border-radius-sm)'
                        }}>
                          {preset.badge.toUpperCase()}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                          {preset.tasks.length} TASKS
                        </span>
                      </div>

                      <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                        {preset.name}
                      </strong>

                      <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', lineHeight: 1.3 }}>
                        {preset.tagline}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Collapsible Individual Task Tweaker */}
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomTaskChecklist(!showCustomTaskChecklist)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.675rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Sliders size={14} />
                  <span>{showCustomTaskChecklist ? '▲ HIDE INDIVIDUAL TASK CHECKBOXES' : `▼ FINE-TUNE INDIVIDUAL CHECKLIST ITEMS (${selectedTasks.length} SELECTED)`}</span>
                </button>

                {showCustomTaskChecklist && (
                  <div style={{ ...styles.tasksChecklist, marginTop: '0.5rem' }}>
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
                )}
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
          {/* Post-Activation & Reconnection Guidance Banner [LIFE-4] */}
          {showPostActivationGuidance && (
            <div style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: 'var(--box-shadow-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--color-primary)' }} />
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                    WEDDING PLANNER ACTIVATED & RECONNECTED
                  </h4>
                </div>
                <button onClick={() => setShowPostActivationGuidance(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text)', marginTop: '0.25rem' }}>
                <div>
                  <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>GOOGLE DRIVE TARGET:</span>
                  <div style={{ fontWeight: 600 }}>📁 {driveFolder || 'My Drive/Wedding Planning'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>RE-ENTRY BOOKMARK LINK:</span>
                  <div style={{ fontWeight: 600 }}>🔗 sheet2vow.com/#home</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>SPREADSHEET ID:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', wordBreak: 'break-all' }}>🔑 {spreadsheetId || 'mock-sheet-id-vow-12345'}</div>
                </div>
              </div>
            </div>
          )}

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

          {/* Demo Workspace Banner [ONBOARD-6] */}
          {isDemoMode && showDemoBanner && (
            <div style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '2px solid var(--color-amber, #f59e0b)',
              borderRadius: 'var(--border-radius-md)',
              padding: '0.625rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              boxShadow: 'var(--box-shadow-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Zap size={18} style={{ color: 'var(--color-amber, #f59e0b)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    DEMO WORKSPACE ACTIVE
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                    You are viewing pre-populated sample wedding data (*Alex & Sam's Wedding*). All changes are saved locally in mock mode.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsOnboarded(false);
                    setIsDemoMode(false);
                  }}
                  title="Start setting up your personal wedding planner"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.675rem',
                    fontWeight: 800,
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.4rem 0.75rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Sparkles size={14} />
                  <span>GET STARTED WITH YOURS!</span>
                </button>

                <button
                  type="button"
                  onClick={handleExpressOnboard}
                  title="Reset to fresh demo sample data"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.35rem 0.65rem',
                    cursor: 'pointer'
                  }}
                >
                  RESET DEMO DATA
                </button>

                <button
                  type="button"
                  onClick={() => setShowDemoBanner(false)}
                  title="Hide demo banner"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Navigation tabs (Only rendered when navLayout is 'top') */}
          {navLayout === 'top' && (
            <nav style={styles.navbar}>
              {[
                { id: 'home', label: '[ SUMMARY ]' },
                { id: 'guests', label: '[ GUEST LIST ]' },
                { id: 'menu', label: '[ CATERING ]' },
                { id: 'tables', label: '[ SEATING ]' },
                { id: 'budget', label: '[ LEDGER ]' },
                { id: 'schedule', label: '[ TIMELINE ]' },
                { id: 'vendors', label: '[ VENDORS ]' },
                { id: 'tasks', label: '[ TASKS ]' },
                { id: 'music', label: '[ MUSIC ]' },
                { id: 'photos', label: '[ PHOTOS ]' },
                { id: 'thanks', label: '[ THANKS ]' },
              ]
                .filter(tab => (enabledModules as any)[tab.id] ?? (tab.id === 'home' ? enabledModules.metrics : true))
                .map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id as any)}
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
          )}

          {/* View Router */}
          {isLoading ? (
            <div style={styles.mainLoader}>
              <RefreshCw className="spin" size={32} style={styles.spinIcon} />
              <p style={styles.loadingText}>Fetching spreadsheet structures...</p>
            </div>
          ) : (
            <div style={styles.tabContent}>
              {(activeTab === 'home' || activeTab === 'metrics') && weddingData && (
                <DashboardMetrics
                  metrics={weddingData.dashboard}
                  guests={weddingData.guests}
                  tasks={weddingData.tasks}
                  music={weddingData.music}
                  photos={weddingData.photos}
                  enabledModules={enabledModules}
                  currency={currency}
                  onNavigateTab={(tab, filter) => switchTab(tab as any, filter)}
                  onOpenModuleSettings={() => setShowSettings(true)}
                />
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

              {activeTab === 'menu' && weddingData && (
                <MenuSetupManager
                  guests={weddingData.guests}
                  onUpdateGuests={(data) => syncUpdate('guests', data)}
                  onOpenGuestRegistry={() => switchTab('guests')}
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
                  spreadsheetId={spreadsheetId}
                  weddingName={weddingName}
                  onOpenShareModal={() => setShowShareModal(true)}
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
                  vendors={weddingData.vendors || []}
                  onUpdate={(data) => syncUpdate('music', data)}
                  isSyncing={isSyncing}
                  initialFilterPill={musicInitialFilter}
                  onNavigateTab={(tab) => switchTab(tab as any)}
                />
              )}

              {activeTab === 'photos' && weddingData && (
                <PhotoShotListManager
                  photos={weddingData.photos || []}
                  vendors={weddingData.vendors || []}
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

      {/* Toast Notification Container [GEN-3] */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

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
    backgroundColor: 'var(--color-bg-subtle, #eef2f7)',
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
    backgroundColor: 'var(--color-bg-subtle, #f8f9fa)',
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
    backgroundColor: 'var(--color-red-muted, #fee2e2)',
    border: '1px solid var(--color-red, #ef4444)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem',
    color: 'var(--color-red, #ef4444)',
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
