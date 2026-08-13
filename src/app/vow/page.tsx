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
import GoogleAuthModal from '@/components/GoogleAuthModal';
import SafetyShieldSyncBadge from '@/components/SafetyShieldSyncBadge';
import VowDisconnectModal from '@/components/vow/VowDisconnectModal';
import UnauthenticatedLanding from '@/components/vow/UnauthenticatedLanding';
import { RefreshCw, HardDrive, Heart, Sparkles, AlertCircle, FileSpreadsheet, Settings, Check, CheckCircle2, Key, X, Share2, Sliders, Printer, Zap, ArrowRight, PanelLeftClose, PanelLeftOpen, LayoutDashboard, Utensils, Grid, Camera, Users, DollarSign, Calendar, Briefcase, ListTodo, Music, Menu } from 'lucide-react';
import { ALL_DEFAULT_TASKS } from '@/lib/sheets/mockDb';
import { TASK_PRESETS } from '@/lib/presets/taskPresets';
import { getColorPresets } from '@/lib/themePresets';
import { useSheet2Theme } from '@/lib/core/theme/ThemeProvider';

export default function Sheet2VowDashboard() {
  // Authentication & Spreadsheet Settings
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [googleToken, setGoogleToken] = useState<string>('');
  const [googleUserEmail, setGoogleUserEmail] = useState<string>('');
  const [googleUserAvatar, setGoogleUserAvatar] = useState<string>('');
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
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
  const profileRef = useRef<HTMLDivElement>(null);

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
  const { fontSizeScale, setFontSizeScale } = useSheet2Theme();
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

  const handleScanDrive = () => {
    setIsScanningDrive(true);
    setTimeout(() => {
      setScannedSheets([
        { id: 'mock-sheet-id-vow-12345', name: "Alex & Sam's Wedding", folder: 'My Drive/Wedding Planning' },
        { id: 'mock-sheet-sarah-2026', name: "Sarah & Mark's Wedding 2026", folder: 'My Drive/Events/Wedding 2026' }
      ]);
      setIsScanningDrive(false);
    }, 600);
  };

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
    if (savedMock === 'true') setIsMockMode(true);
    if (savedDemo === 'true') setIsDemoMode(true);

    // Auto-prompt Google Auth Modal if no active session or token is present
    if (!savedOnboarded || (!savedToken && savedMock !== 'true')) {
      setShowGoogleAuthModal(true);
    }
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

  // Close settings and profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showSettings || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings, showProfileMenu]);

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
      if (response.status === 401 || res.isAuthError) {
        setShowGoogleAuthModal(true);
        addToast('Google OAuth session expired. Please sign in to reconnect your Drive sheet.', 'warning');
        return;
      }
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
      if (response.status === 401 || res.isAuthError) {
        setShowGoogleAuthModal(true);
        addToast('Google OAuth session expired. Please sign in to reconnect your Drive sheet.', 'warning');
        return;
      }
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
  const handleConfirmDisconnect = async () => {
    setSpreadsheetId('');
    setGoogleToken('');
    setGoogleUserEmail('');
    setIsOnboarded(false);
    setIsMockMode(false);
    setIsDemoMode(false);
    setShowDemoBanner(false);
    setWeddingData(null);
    setWeddingName('');
    setWeddingDate('');
    setShowSettings(false);
    setShowDisconnectModal(false);
    setIsLoading(false);
    setSyncError(null);

    // Clear all s2v_ items from localStorage
    if (typeof window !== 'undefined') {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('s2v_') || key.startsWith('s2s_'))) {
          localStorage.removeItem(key);
        }
      }
    }

    // Trigger Google Auth Modal for re-authentication
    setShowGoogleAuthModal(true);
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

  const isDesktopSidebarActive = !isMobile && isOnboarded && navLayout === 'sidebar';
  const sidebarWidthPx = isSidebarCollapsed ? 64 : 220;

  return (
    <div
      className="app-viewport-container"
      style={{
        ...styles.container,
        marginLeft: isDesktopSidebarActive ? `${sidebarWidthPx}px` : 'auto',
        marginRight: isDesktopSidebarActive ? '0' : 'auto',
        width: isDesktopSidebarActive ? `calc(100% - ${sidebarWidthPx}px)` : '100%',
        maxWidth: isDesktopSidebarActive ? '100%' : '1680px',
        transition: 'margin-left 0.2s ease, width 0.2s ease'
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
                  setShowAdvancedSettings(true);
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
                <span>SETTINGS</span>
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

          {/* Desktop Bottom Action Tools (Print, Share & Settings) */}
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => {
                setPrintModalInitialTemplate('place_cards');
                setShowPrintModal(true);
              }}
              title="Print Studio & Canva Exporter"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'transparent',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
              }}
            >
              <Printer size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              {!isSidebarCollapsed && <span>PRINT STUDIO</span>}
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              title="Share View-Only Vendor Link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'transparent',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
              }}
            >
              <Share2 size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              {!isSidebarCollapsed && <span>SHARE LINK</span>}
            </button>

            <button
              type="button"
              onClick={() => setShowAdvancedSettings(true)}
              title="Advanced Settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'transparent',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
              }}
            >
              <Settings size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              {!isSidebarCollapsed && <span>SETTINGS</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Brand Header */}
      <header
        style={{
          ...styles.appHeader,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...(isMobile
            ? {
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: 'var(--color-bg)',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                marginTop: '-0.5rem',
                boxShadow: 'var(--box-shadow-subtle)'
              }
            : {})
        }}
      >
        <div style={{ ...styles.brandGroup, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
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
            <FileSpreadsheet size={38} style={{ color: theme === 'dark' ? '#ffffff' : '#000000', flexShrink: 0, alignSelf: 'center' }} />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignSelf: 'center' }}>
            <h1 style={{ ...styles.brandName, fontSize: isMobile ? '1.35rem' : styles.brandName.fontSize, margin: 0, lineHeight: '1.1' }}>Sheet2Vow</h1>
            {!isMobile && <p style={{ ...styles.brandSubtitle, margin: 0, marginTop: '2px', lineHeight: '1.2' }}>Clean digital canvas for spreadsheet purists.</p>}
          </div>
        </div>

        {isOnboarded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

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

                  {/* Font Size Accessibility Scaler [NAV-2] */}
                  <div style={styles.settingsSection}>
                    <label style={styles.settingsLabel}>FONT ACCESSIBILITY SCALER</label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0.65rem',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <button
                        type="button"
                        onClick={() => setFontSizeScale(fontSizeScale - 5)}
                        disabled={fontSizeScale <= 80}
                        title="Decrease font size"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          backgroundColor: 'var(--color-bg-subtle)',
                          color: 'var(--color-text)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--border-radius-sm)',
                          width: '26px',
                          height: '26px',
                          cursor: fontSizeScale <= 80 ? 'not-allowed' : 'pointer',
                          opacity: fontSizeScale <= 80 ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        -
                      </button>

                      <span style={{ fontWeight: 800, color: 'var(--color-text)' }}>
                        {fontSizeScale}%
                      </span>

                      <button
                        type="button"
                        onClick={() => setFontSizeScale(fontSizeScale + 5)}
                        disabled={fontSizeScale >= 120}
                        title="Increase font size"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          backgroundColor: 'var(--color-bg-subtle)',
                          color: 'var(--color-text)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--border-radius-sm)',
                          width: '26px',
                          height: '26px',
                          cursor: fontSizeScale >= 120 ? 'not-allowed' : 'pointer',
                          opacity: fontSizeScale >= 120 ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        +
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
                      <Sliders size={16} style={{ color: theme === 'dark' ? '#000000' : '#ffffff' }} />
                      <span style={{ color: theme === 'dark' ? '#000000' : '#ffffff' }}>ADVANCED SETTINGS</span>
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

            {/* Google Profile Picture Avatar Button & Popover */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title={googleUserEmail ? `Authenticated as ${googleUserEmail}` : 'Account & Session'}
                style={{
                  background: 'none',
                  border: '2px solid var(--color-primary, #0b57d0)',
                  borderRadius: '50%',
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-bg-subtle, #f1f5f9)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.15s ease',
                }}
              >
                {googleUserAvatar ? (
                  <img
                    src={googleUserAvatar}
                    alt={googleUserEmail || 'Google User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: 'var(--color-primary, #0b57d0)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {googleUserEmail ? googleUserEmail[0] : 'G'}
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '1rem',
                    width: '300px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border, #f1f5f9)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {googleUserAvatar ? (
                        <img src={googleUserAvatar} alt="Google Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{googleUserEmail ? googleUserEmail[0].toUpperCase() : 'G'}</span>
                      )}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {googleUserEmail || 'Google User'}
                      </div>
                      <div style={{ fontSize: '0.675rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                        <span>AUTHENTICATED VIA GOOGLE</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.725rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>ACTIVE SPREADSHEET ID:</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-bg-subtle, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)', padding: '0.35rem 0.5rem', borderRadius: '6px', marginTop: '0.2rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', color: 'var(--color-text)', wordBreak: 'break-all', maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {spreadsheetId || 'Not connected'}
                        </span>
                        {spreadsheetId && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(spreadsheetId);
                              addToast('Spreadsheet ID copied to clipboard!', 'info');
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 800 }}
                          >
                            COPY
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>TARGET DRIVE FOLDER:</span>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)', marginTop: '0.1rem' }}>
                        📁 {driveFolder || 'My Drive / Sheet2Suite / Sheet2Vow'}
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-border, #f1f5f9)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowDisconnectModal(true);
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        borderRadius: '6px',
                        padding: '0.45rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span>🔴 DISCONNECT / LOGOUT</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* IN-APP DISCONNECT CONFIRMATION MODAL */}
      <VowDisconnectModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirmDisconnect={handleConfirmDisconnect}
      />

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

      {/* Google Auth Gate Modal */}
      <GoogleAuthModal
        isOpen={showGoogleAuthModal}
        onClose={() => setShowGoogleAuthModal(false)}
        onSelectDemoMode={() => {
          setIsMockMode(true);
          setIsOnboarded(true);
          setShowGoogleAuthModal(false);
          addToast('Entered Demo Workspace Mode', 'info');
        }}
        onAuthenticated={(user) => {
          setGoogleUserEmail(user.email);
          if (user.picture) {
            setGoogleUserAvatar(user.picture);
            if (typeof window !== 'undefined') {
              localStorage.setItem('s2v_google_avatar', user.picture);
            }
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('s2v_google_email', user.email);
          }
          if (user.accessToken) {
            setGoogleToken(user.accessToken);
            if (typeof window !== 'undefined') {
              localStorage.setItem('s2v_google_token', user.accessToken);
            }
          }
          if (user.hasExistingWorkspace && user.spreadsheetId) {
            setSpreadsheetId(user.spreadsheetId);
            setIsMockMode(false);
            setIsOnboarded(true);
            setShowGoogleAuthModal(false);
            addToast(`Welcome back ${user.email}! Reconnected active workspace.`, 'success');
          } else {
            // First time user with no registered spreadsheet -> Redirect directly to /activate setup wizard
            setSpreadsheetId('');
            setIsMockMode(false);
            setIsOnboarded(false);
            setShowGoogleAuthModal(false);
            addToast(`Authenticated as ${user.email}. Redirecting to Setup Wizard...`, 'info');
            if (typeof window !== 'undefined') {
              window.location.href = `/activate?email=${encodeURIComponent(user.email)}`;
            }
          }
        }}
      />

      {/* Main Core Area */}
      {!isOnboarded ? (
        /* Unauthenticated Landing Experience */
        <UnauthenticatedLanding
          onOpenGoogleAuth={() => setShowGoogleAuthModal(true)}
          onExploreDemo={handleExpressOnboard}
          onScanDrive={handleScanDrive}
          isScanningDrive={isScanningDrive}
          scannedSheets={scannedSheets}
          onSelectScannedSheet={(id, name) => {
            setSpreadsheetId(id);
            setWeddingName(name);
            setIsMockMode(false);
            setIsOnboarded(true);
            addToast(`Reconnected workspace: ${name}`, 'success');
          }}
          onVerifyOrder={(email, orderId) => {
            const sheetName = email ? `${email.split('@')[0]}'s Wedding` : "Alex & Sam's Wedding";
            const sheetId = 'mock-sheet-id-vow-12345';
            setSpreadsheetId(sheetId);
            setWeddingName(sheetName);
            setIsMockMode(true);
            setIsOnboarded(true);
            setShowPostActivationGuidance(true);
            addToast(`Reconnected order #${orderId || 'ETSY-VERIFIED'}`, 'success');
          }}
          onReconnectUrl={(url) => {
            let extractedId = url.trim();
            if (url.includes('/d/')) {
              extractedId = url.split('/d/')[1].split('/')[0];
            }
            setSpreadsheetId(extractedId);
            setWeddingName("Reconnected Wedding");
            setIsMockMode(false);
            setIsOnboarded(true);
            setShowPostActivationGuidance(true);
            addToast(`Reconnected sheet ID: ${extractedId}`, 'success');
          }}
        />
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
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', wordBreak: 'break-all' }}>🔑 {spreadsheetId || 'Active Google Sheet'}</div>
                </div>
              </div>
            </div>
          )}

          {syncError && (
            <div style={{ ...styles.errorBox, marginBottom: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <AlertCircle size={16} />
                <span>{syncError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSyncError(null)}
                style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', padding: '0.1rem 0.2rem' }}
                title="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Target Wedding Milestone Header */}
          <div style={styles.weddingTitleHeader}>
            <h2 className="wedding-title" style={styles.weddingNameText}>{weddingName.toUpperCase()}</h2>
            <div style={styles.weddingMilestoneDate}>{getCountdown()}</div>
          </div>

          {/* Google Auth Status & Workspace Header Banner */}
          <div style={{
            backgroundColor: isMockMode ? 'var(--color-bg-subtle)' : '#ecfdf5',
            border: `2px solid ${isMockMode ? 'var(--color-amber, #f59e0b)' : '#10b981'}`,
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
              {isMockMode ? (
                <Zap size={18} style={{ color: 'var(--color-amber, #f59e0b)', flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {isMockMode ? '⚡ DEMO WORKSPACE ACTIVE (OFFLINE MOCK MODE)' : `🟢 LIVE GOOGLE DRIVE CONNECTED: ${googleUserEmail || 'USER'}`}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                  {isMockMode
                    ? "Exploring sample wedding data (*Alex & Sam's Wedding*). Sign in with Google to sync directly to your personal Google Drive."
                    : `Direct Google Drive Sync active • Spreadsheet ID: ${spreadsheetId || '1h_RG...4RcI'}`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SafetyShieldSyncBadge
                status={isMockMode ? 'offline' : (syncError ? 'error' : (isLoading ? 'syncing' : 'synced'))}
                userEmail={googleUserEmail || undefined}
                spreadsheetId={spreadsheetId || undefined}
              />
              <button
                type="button"
                onClick={() => setShowGoogleAuthModal(true)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  border: '2px solid #111827',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <HardDrive size={14} style={{ color: '#4285F4' }} />
                <span>SIGN IN WITH GOOGLE</span>
              </button>

              <a
                href="/activate"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.45rem 0.75rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={14} />
                <span>ACTIVATE NEW PLAN</span>
              </a>
            </div>
          </div>

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
