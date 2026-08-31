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
import SafetyShieldSyncBadge from '@/components/SafetyShieldSyncBadge';
import VowDisconnectModal from '@/components/vow/VowDisconnectModal';
import UnauthenticatedLanding from '@/components/vow/UnauthenticatedLanding';
import Link from 'next/link';
import { RefreshCw, HardDrive, Heart, Home, Sparkles, AlertCircle, FileSpreadsheet, Settings, Check, CheckCircle2, Key, X, Share2, Sliders, Printer, Zap, ArrowRight, ArrowLeft, PanelLeftClose, PanelLeftOpen, LayoutDashboard, Utensils, Grid, Camera, Users, DollarSign, Calendar, Briefcase, ListTodo, Music, Menu, ExternalLink } from 'lucide-react';
import { ALL_DEFAULT_TASKS } from '@/lib/sheets/mockDb';
import { TASK_PRESETS } from '@/lib/presets/taskPresets';
import { getColorPresets } from '@/lib/themePresets';
import { useSheet2Theme } from '@/lib/core/theme/ThemeProvider';

export default function Sheet2VowDashboard() {
  // Authentication & Spreadsheet Settings
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [googleToken, setGoogleToken] = useState<string>('');
  const [googleUserName, setGoogleUserName] = useState<string>('');
  const [googleUserEmail, setGoogleUserEmail] = useState<string>('');
  const [googleUserAvatar, setGoogleUserAvatar] = useState<string>('');
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
  const [weddingName, setWeddingName] = useState<string>('');
  const [weddingDate, setWeddingDate] = useState<string>('');
  const [locationDetails, setLocationDetails] = useState<string>('');
  const [budgetThreshold, setBudgetThreshold] = useState<number>(35000);
  const [driveFolder, setDriveFolder] = useState<string>('My Drive/Wedding Planning');
  const [selectedTasks, setSelectedTasks] = useState<string[]>(ALL_DEFAULT_TASKS.map(t => t.taskName));

  // Direct 1-Click Google OAuth Kickoff [AUTH-FAST]
  const handleDirectGoogleAuth = async () => {
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/auth/google');
      const data = await res.json();

      if (data.authUrl && typeof window !== 'undefined') {
        const width = 520;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const handleAuthMessage = (event: MessageEvent) => {
          if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
            const { user, accessToken, provision } = event.data;
            window.removeEventListener('message', handleAuthMessage);
            setIsAuthenticating(false);

            if (user?.name) {
              setGoogleUserName(user.name);
              if (typeof window !== 'undefined') {
                localStorage.setItem('s2v_google_name', user.name);
              }
            }
            if (user?.email) {
              setGoogleUserEmail(user.email);
              if (typeof window !== 'undefined') {
                localStorage.setItem('s2v_google_email', user.email);
              }
            }
            if (user?.picture) {
              setGoogleUserAvatar(user.picture);
              if (typeof window !== 'undefined') {
                localStorage.setItem('s2v_google_avatar', user.picture);
              }
            }
            if (accessToken) {
              setGoogleToken(accessToken);
              if (typeof window !== 'undefined') {
                localStorage.setItem('s2v_google_token', accessToken);
              }
            }

            const hasExistingWorkspace = provision?.hasExistingWorkspace ?? Boolean(provision?.spreadsheetId);
            if (hasExistingWorkspace && provision?.spreadsheetId) {
              setSpreadsheetId(provision.spreadsheetId);
              if (typeof window !== 'undefined') {
                localStorage.setItem('s2v_spreadsheet_id', provision.spreadsheetId);
                localStorage.setItem('s2v_is_onboarded', 'true');
              }
              setIsMockMode(false);
              setIsOnboarded(true);
              addToast(`Welcome back ${user.email}! Reconnected active workspace.`, 'success');
            } else {
              setSpreadsheetId('');
              setIsMockMode(false);
              setIsOnboarded(false);
              addToast(`Authenticated as ${user.email}. Redirecting to Setup Wizard...`, 'info');
              if (typeof window !== 'undefined') {
                window.location.href = `/activate?email=${encodeURIComponent(user.email)}`;
              }
            }
          } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', handleAuthMessage);
            setIsAuthenticating(false);
            addToast(event.data.error || 'Google authentication failed', 'warning');
          }
        };

        window.addEventListener('message', handleAuthMessage);

        const authWindow = window.open(
          data.authUrl,
          'Sheet2SuiteGoogleLogin',
          `width=${width},height=${height},top=${top},left=${left}`
        );

        // Fallback timeout checker if user closes popup without authenticating
        const checkClosedInterval = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosedInterval);
            setIsAuthenticating(false);
          }
        }, 1000);
      } else {
        setIsAuthenticating(false);
        addToast(data.error || 'Failed to initialize Google authentication.', 'warning');
      }
    } catch (err: any) {
      console.error('Direct Google Auth Error:', err);
      setIsAuthenticating(false);
      addToast(err.message || 'Failed to connect with Google.', 'warning');
    }
  };

  // Session Token Refresh Handler — refreshes OAuth token without clearing workspace state
  const handleReauth = async () => {
    setIsReauthenticating(true);
    try {
      const res = await fetch('/api/auth/google?prompt=select_account');
      const data = await res.json();

      if (data.authUrl && typeof window !== 'undefined') {
        const width = 520;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const handleReauthMessage = (event: MessageEvent) => {
          if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
            const { user, accessToken } = event.data;
            window.removeEventListener('message', handleReauthMessage);
            setIsReauthenticating(false);

            if (accessToken) {
              setGoogleToken(accessToken);
              if (typeof window !== 'undefined') {
                localStorage.setItem('s2v_google_token', accessToken);
              }
            }
            if (user?.name) setGoogleUserName(user.name);
            if (user?.email) setGoogleUserEmail(user.email);
            if (user?.picture) setGoogleUserAvatar(user.picture);

            setShowSessionExpiredModal(false);
            addToast('Session refreshed — reconnecting to your workspace...', 'success');
            // Re-fetch data with the fresh token directly
            fetchWeddingData(accessToken);

          } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', handleReauthMessage);
            setIsReauthenticating(false);
            addToast(event.data.error || 'Google re-authentication failed', 'warning');
          }
        };

        window.addEventListener('message', handleReauthMessage);

        const authWindow = window.open(
          data.authUrl,
          'Sheet2SuiteGoogleLogin',
          `width=${width},height=${height},top=${top},left=${left}`
        );

        const checkClosedInterval = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosedInterval);
            setIsReauthenticating(false);
          }
        }, 1000);
      } else {
        setIsReauthenticating(false);
        addToast(data.error || 'Failed to initialize Google authentication.', 'warning');
      }
    } catch (err: any) {
      console.error('Reauth Error:', err);
      setIsReauthenticating(false);
      addToast(err.message || 'Failed to reconnect with Google.', 'warning');
    }
  };

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
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState<boolean>(false);
  const [isReauthenticating, setIsReauthenticating] = useState<boolean>(false);

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

  // Navigation Layout & Mobile Responsive States [NAV-ENFORCE, NAV-SWIPE, NAV-HAPTIC]
  const [showTopNav, setShowTopNav] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Haptic Feedback Helper [NAV-HAPTIC]
  const triggerHaptic = (duration = 12) => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (_) { }
    }
  };

  // Mobile Swipe Gesture Handlers [NAV-SWIPE]
  const bottomNavTouchStartY = useRef<number | null>(null);
  const drawerTouchStartY = useRef<number | null>(null);

  const handleBottomNavTouchStart = (e: React.TouchEvent) => {
    bottomNavTouchStartY.current = e.touches[0].clientY;
  };

  const handleBottomNavTouchEnd = (e: React.TouchEvent) => {
    if (bottomNavTouchStartY.current !== null) {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = bottomNavTouchStartY.current - touchEndY;
      // Swipe UP by >= 35px reveals the categorized module drawer
      if (deltaY > 35) {
        triggerHaptic(15);
        setIsMobileDrawerOpen(true);
      }
      bottomNavTouchStartY.current = null;
    }
  };

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    drawerTouchStartY.current = e.touches[0].clientY;
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    if (drawerTouchStartY.current !== null) {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchEndY - drawerTouchStartY.current;
      // Swipe DOWN by >= 35px closes the categorized module drawer
      if (deltaY > 35) {
        triggerHaptic(10);
        setIsMobileDrawerOpen(false);
      }
      drawerTouchStartY.current = null;
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUpdateWeddingDetails = async (name: string, date: string, location?: string) => {
    setWeddingName(name);
    setWeddingDate(date);
    if (location !== undefined) setLocationDetails(location);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_wedding_name', name);
      localStorage.setItem('s2v_wedding_date', date);
      if (location !== undefined) localStorage.setItem('s2v_location', location);
    }
    if (weddingData) {
      await syncUpdate('dashboard', {
        totalBudget: weddingData.dashboard.totalBudget,
        budget: weddingData.dashboard.totalBudget,
        weddingName: name,
        weddingDate: date,
        location: location !== undefined ? location : locationDetails,
        currency: currency,
      });
    }
  };

  // Welcome Guide Dismissal State
  const [hasDismissedWelcomeCard, setHasDismissedWelcomeCard] = useState<boolean>(true);

  const handleDismissWelcomeGuide = () => {
    setHasDismissedWelcomeCard(true);
    if (spreadsheetId && typeof window !== 'undefined') {
      localStorage.setItem(`s2v_welcome_dismissed_${spreadsheetId}`, 'true');
    }
  };

  const handleToggleTheme = () => {
    triggerHaptic(10);
    handleThemeChange(theme === 'dark' ? 'light' : 'dark');
  };

  const handleToggleTopNav = (val?: boolean) => {
    triggerHaptic(10);
    const next = val !== undefined ? val : !showTopNav;
    setShowTopNav(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_show_top_nav', String(next));
    }
  };

  // App Data & Loading states
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [coPlanners, setCoPlanners] = useState<string[]>([]);

  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'metrics' | 'guests' | 'menu' | 'tables' | 'budget' | 'schedule' | 'tasks' | 'vendors' | 'music' | 'photos' | 'thanks'>('home');
  const [guestInitialFilter, setGuestInitialFilter] = useState<RSVPStatus | 'All'>('All');
  const [taskInitialFilter, setTaskInitialFilter] = useState<KanbanStage | undefined>(undefined);
  const [musicInitialFilter, setMusicInitialFilter] = useState<string | undefined>(undefined);

  // Tab switching with browser History API push & URL hash sync
  const switchTab = (tab: 'home' | 'metrics' | 'guests' | 'menu' | 'tables' | 'budget' | 'schedule' | 'tasks' | 'vendors' | 'music' | 'photos' | 'thanks', filter?: string, pushToHistory = true) => {
    triggerHaptic(10);
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
    const savedShowTopNav = localStorage.getItem('s2v_show_top_nav');

    if (savedShowTopNav !== null) {
      setShowTopNav(savedShowTopNav === 'true');
    }

    if (savedWorkspacesStr) {
      try {
        const parsed = JSON.parse(savedWorkspacesStr);
        if (Array.isArray(parsed) && parsed.length > 0) setWorkspaces(parsed);
      } catch (e) {
        console.error(e);
      }
    }

    if (savedSheetId) {
      setSpreadsheetId(savedSheetId);
      const localDismissed = localStorage.getItem(`s2v_welcome_dismissed_${savedSheetId}`);
      if (localDismissed === 'true') {
        setHasDismissedWelcomeCard(true);
      } else {
        setHasDismissedWelcomeCard(false);
      }
    }
    if (savedToken) setGoogleToken(savedToken);
    const savedEmail = localStorage.getItem('s2v_google_email');
    const savedAvatar = localStorage.getItem('s2v_google_avatar');
    const savedUserName = localStorage.getItem('s2v_google_name');
    if (savedEmail) setGoogleUserEmail(savedEmail);
    if (savedAvatar) setGoogleUserAvatar(savedAvatar);
    if (savedUserName) setGoogleUserName(savedUserName);
    if (savedOnboarded === 'true') setIsOnboarded(true);
    if (savedMock === 'true') setIsMockMode(true);
    if (savedDemo === 'true') setIsDemoMode(true);

    const savedLocation = localStorage.getItem('s2v_location');
    if (savedName) setWeddingName(savedName);
    if (savedDate) setWeddingDate(savedDate);
    if (savedLocation) setLocationDetails(savedLocation);
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

  const fetchWeddingData = async (overrideToken?: string) => {
    setIsLoading(true);
    setSyncError(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const activeToken = overrideToken || googleToken;
      const token = isMockMode ? 'mock-token' : activeToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/sync?spreadsheetId=${spreadsheetId}`, {
        method: 'GET',
        headers
      });

      const res = await response.json();
      if (response.status === 401 || res.isAuthError) {
        setShowSessionExpiredModal(true);
        return;
      }
      if (res.success) {
        setWeddingData(res.data);
        if (res.weddingName) {
          setWeddingName(res.weddingName);
          if (typeof window !== 'undefined') localStorage.setItem('s2v_wedding_name', res.weddingName);
        }
        if (res.data?.dashboard?.weddingDate) {
          setWeddingDate(res.data.dashboard.weddingDate);
          if (typeof window !== 'undefined') localStorage.setItem('s2v_wedding_date', res.data.dashboard.weddingDate);
        }
        if (res.data?.dashboard?.location) {
          setLocationDetails(res.data.dashboard.location);
          if (typeof window !== 'undefined') localStorage.setItem('s2v_location', res.data.dashboard.location);
        }
        if (res.data?.dashboard?.currency) {
          setCurrency(res.data.dashboard.currency);
          if (typeof window !== 'undefined') localStorage.setItem('s2v_currency', res.data.dashboard.currency);
        }
        // Sync welcome card dismissal state
        const localDismissed = typeof window !== 'undefined' ? localStorage.getItem(`s2v_welcome_dismissed_${spreadsheetId}`) : null;
        if (localDismissed === 'true' || res.hasDismissedWelcomeCard === true) {
          setHasDismissedWelcomeCard(true);
        } else {
          setHasDismissedWelcomeCard(false);
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
  const syncUpdate = async (sheetType: 'dashboard' | 'guests' | 'tables' | 'budget' | 'expenses' | 'schedule' | 'tasks' | 'music' | 'vendors' | 'photos' | 'gifts' | 'catering', updatedData: any) => {
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
        setShowSessionExpiredModal(true);
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

  const isDesktopSidebarActive = !isMobile && isOnboarded;
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
      {/* Mobile Ergonomic Bottom Sheet Drawer [NAV-MOBILE-THUMB] */}
      {isMobile && isMobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            className="mobile-bottom-sheet-content"
            style={{
              width: '100%',
              backgroundColor: 'var(--color-surface, #fff)',
              borderTopLeftRadius: '1.25rem',
              borderTopRightRadius: '1.25rem',
              maxHeight: '85vh',
              padding: '0.75rem 1rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag Handle Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.25rem 0' }}>
              <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--color-muted)', borderRadius: '999px', opacity: 0.5 }} />
            </div>

            {/* Bottom Sheet Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileSpreadsheet size={20} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>Sheet2Vow Modules</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: '0.25rem' }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Categorized Module Groups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '0.25rem' }}>
              {/* Group 1: Guests & Reception */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  👥 GUESTS & HOSPITALITY
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                  {[
                    { id: 'guests', label: 'Guest Registry', icon: Users },
                    { id: 'menu', label: 'Catering Menu', icon: Utensils },
                    { id: 'tables', label: 'Seating Chart', icon: Grid },
                    { id: 'thanks', label: 'Thank You Gifts', icon: Heart },
                  ]
                    .filter(tab => (enabledModules as any)[tab.id] ?? true)
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
                            gap: '0.5rem',
                            padding: '0.55rem 0.65rem',
                            borderRadius: 'var(--border-radius-sm)',
                            backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-subtle, #f8f9fa)',
                            color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                            border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            fontWeight: isActive ? 800 : 600,
                            textAlign: 'left'
                          }}
                        >
                          <IconComp size={15} style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Group 2: Logistics & Budget */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  💼 LOGISTICS & BUDGET
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                  {[
                    { id: 'home', label: 'Wedding Plan Summary', icon: LayoutDashboard },
                    { id: 'budget', label: 'Budget Ledger', icon: DollarSign },
                    { id: 'schedule', label: 'Day-Of Timeline', icon: Calendar },
                    { id: 'vendors', label: 'Vendor Directory', icon: Briefcase },
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
                            gap: '0.5rem',
                            padding: '0.55rem 0.65rem',
                            borderRadius: 'var(--border-radius-sm)',
                            backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-subtle, #f8f9fa)',
                            color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                            border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            fontWeight: isActive ? 800 : 600,
                            textAlign: 'left'
                          }}
                        >
                          <IconComp size={15} style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Group 3: Day-Of Media & Tasks */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  🎨 DAY-OF MEDIA & TASKS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  {[
                    { id: 'tasks', label: 'Tasks', icon: ListTodo },
                    { id: 'music', label: 'Music & DJ', icon: Music },
                    { id: 'photos', label: 'Photos', icon: Camera },
                  ]
                    .filter(tab => (enabledModules as any)[tab.id] ?? true)
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
                            gap: '0.4rem',
                            padding: '0.55rem 0.5rem',
                            borderRadius: 'var(--border-radius-sm)',
                            backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-subtle, #f8f9fa)',
                            color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                            border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            fontWeight: isActive ? 800 : 600,
                            textAlign: 'left'
                          }}
                        >
                          <IconComp size={14} style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Bottom Quick Tools (Print Studio, Share Link & Settings) */}
            <div style={{ marginTop: '0.35rem', paddingTop: '0.65rem', borderTop: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setShowPrintModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.4rem',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700
                }}
              >
                <Printer size={14} style={{ color: 'var(--color-primary)' }} />
                <span>PRINT</span>
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
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.4rem',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700
                }}
              >
                <Share2 size={14} style={{ color: 'var(--color-primary)' }} />
                <span>SHARE</span>
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
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.4rem',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700
                }}
              >
                <Settings size={14} style={{ color: 'var(--color-primary)' }} />
                <span>SETTINGS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Collapsible Left Sidebar [NAV-ENFORCE] */}
      {!isMobile && isOnboarded && (
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
              {!isSidebarCollapsed && <span>PRINT & EXPORT</span>}
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
              {!isSidebarCollapsed && <span>SHARE</span>}
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
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'var(--color-bg)',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          marginTop: isMobile ? '-0.5rem' : 0,
          border: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: '2px solid var(--color-primary)',
          boxShadow: 'none',
          outline: 'none',
        }}
      >
        <div style={{ ...styles.brandGroup, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {isMobile && isOnboarded ? (
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

        {!isOnboarded ? (
          <Link
            href="/"
            title="Return to Sheet2Suite Hub"
            className="s2s-home-nav-btn"
            style={{
              padding: isMobile ? '0.35rem 0.65rem' : '0.35rem 0.85rem 0.35rem 0.45rem',
            }}
          >
            <div
              className="s2s-home-nav-icon"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(11, 87, 208, 0.08)',
                color: 'var(--color-primary, #0b57d0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              <Home size={13} strokeWidth={2.5} />
            </div>
            <span>{!isMobile ? 'Sheet2Suite Hub' : 'Suite Hub'}</span>
            {!isMobile && (
              <ArrowRight
                size={13}
                className="s2s-home-nav-arrow"
                style={{
                  color: 'var(--color-muted, #64748b)',
                  marginLeft: '-0.1rem',
                  transition: 'all 0.2s ease',
                }}
              />
            )}
          </Link>
        ) : (
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
                    <label style={styles.settingsLabel}>TOP NAVIGATION BAR</label>
                    <div style={styles.themeToggle}>
                      <button
                        style={{
                          ...styles.themeBtn,
                          fontWeight: !showTopNav ? 'bold' : 'normal',
                          backgroundColor: !showTopNav ? 'var(--color-primary)' : 'transparent',
                          color: !showTopNav ? 'var(--color-on-primary)' : 'var(--color-text)'
                        }}
                        onClick={() => handleToggleTopNav(false)}
                        title="Clean Layout (Left Sidebar on Desktop, Bottom Nav on Mobile)"
                      >
                        OFF (DEFAULT)
                      </button>
                      <button
                        style={{
                          ...styles.themeBtn,
                          fontWeight: showTopNav ? 'bold' : 'normal',
                          backgroundColor: showTopNav ? 'var(--color-primary)' : 'transparent',
                          color: showTopNav ? 'var(--color-on-primary)' : 'var(--color-text)'
                        }}
                        onClick={() => handleToggleTopNav(true)}
                        title="Show Dual Top Horizontal Navigation Bar"
                      >
                        ON (SHOW TOP BAR)
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
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {googleUserName || googleUserEmail?.split('@')[0] || 'Google User'}
                      </div>
                      {googleUserEmail && (
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.2rem' }}>
                          {googleUserEmail}
                        </div>
                      )}
                      <div style={{ fontSize: '0.675rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                        <span>Connected to Google</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.725rem' }}>
                    {spreadsheetId && (
                      <a
                        href={spreadsheetId.startsWith('mock') ? 'https://docs.google.com' : `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
                          border: '1px solid var(--color-border, #e2e8f0)',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem',
                          color: 'var(--color-primary, #0b57d0)',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          marginBottom: '0.35rem',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-border, #e2e8f0)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle, #f8fafc)')}
                      >
                        <FileSpreadsheet size={15} style={{ color: '#16a34a' }} />
                        <span>OPEN GOOGLE SPREADSHEET</span>
                        <ExternalLink size={12} />
                      </a>
                    )}

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
                      <span>Sign Out</span>
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

      {/* SESSION EXPIRED RE-AUTHENTICATION MODAL */}
      {showSessionExpiredModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg, 1rem)',
              padding: '2rem 2rem 1.75rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(234, 179, 8, 0.15)',
                border: '1.5px solid rgba(234, 179, 8, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.2rem',
              }}>
                🔒
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text)',
                  textTransform: 'uppercase',
                }}>
                  Session Expired
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-muted)',
                  marginTop: '0.15rem',
                }}>
                  Your Google session has timed out
                </div>
              </div>
            </div>

            {/* Body */}
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-text)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              Your Google OAuth token has expired. Sign back in to refresh your session — your workspace data and settings will remain untouched.
            </p>

            {/* User identity pill */}
            {googleUserEmail && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--color-muted)',
              }}>
                {googleUserAvatar && (
                  <img
                    src={googleUserAvatar}
                    alt=""
                    style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0 }}
                  />
                )}
                <span style={{ fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {googleUserEmail}
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={handleReauth}
                disabled={isReauthenticating}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary, #fff)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  cursor: isReauthenticating ? 'not-allowed' : 'pointer',
                  opacity: isReauthenticating ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'opacity 0.15s ease',
                }}
              >
                {isReauthenticating ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '0.9rem' }}>⟳</span>
                    SIGNING IN...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    SIGN IN WITH GOOGLE
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowSessionExpiredModal(false)}
                disabled={isReauthenticating}
                style={{
                  padding: '0.65rem 1rem',
                  background: 'transparent',
                  color: 'var(--color-muted)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                DISMISS
              </button>
            </div>

            {/* Disconnect fallback */}
            <div style={{ textAlign: 'center', paddingTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowSessionExpiredModal(false);
                  setShowDisconnectModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Disconnect workspace instead
              </button>
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
          locationDetails={locationDetails || weddingData?.dashboard?.location || ''}
          driveFolder={driveFolder}
          enabledModules={enabledModules}
          isMockMode={isMockMode}
          styleTheme={styleTheme}
          theme={theme}
          primaryColor={primaryColor}
          timeFormat={timeFormat}
          currency={currency}
          showTopNav={showTopNav}
          onUpdateWeddingDetails={handleUpdateWeddingDetails}
          onToggleModule={toggleModule}
          onUpdateStyleTheme={handleStyleThemeChange}
          onUpdateTheme={handleThemeChange}
          onToggleTopNav={handleToggleTopNav}
          onUpdatePrimaryColor={(clr) => setPrimaryColor(clr)}
          onUpdateTimeFormat={(tf) => {
            setTimeFormat(tf);
            localStorage.setItem('s2v_time_format', tf);
          }}
          onUpdateCurrency={(cur) => {
            setCurrency(cur);
            localStorage.setItem('s2v_currency', cur);
          }}
          coPlanners={coPlanners}
          onUpdateCoPlanners={(c) => setCoPlanners(c)}
          onDisconnect={() => setShowDisconnectModal(true)}
          onOpenShareModal={() => setShowShareModal(true)}
          onClose={() => setShowAdvancedSettings(false)}
        />
      )}

      {/* Main Core Area */}
      {!isOnboarded ? (
        /* Unauthenticated Landing Experience */
        <UnauthenticatedLanding
          onOpenGoogleAuth={handleDirectGoogleAuth}
          onExploreDemo={handleExpressOnboard}
          isAuthenticating={isAuthenticating}
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

          {/* Demo Workspace Header Banner (Only shown in offline Mock/Demo Mode) */}
          {isMockMode && (
            <div
              className="demo-workspace-banner"
              style={{
                backgroundColor: 'var(--color-bg-subtle)',
                border: '2px solid var(--color-amber, #f59e0b)',
                borderRadius: 'var(--border-radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                boxShadow: 'var(--box-shadow-subtle)'
              }}
            >
              <style>{`
                .demo-workspace-banner {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  flex-wrap: wrap;
                  gap: 0.75rem;
                }
                .demo-workspace-actions {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  flex-wrap: wrap;
                }
                @media (max-width: 640px) {
                  .demo-workspace-banner {
                    flex-direction: column !important;
                    align-items: stretch !important;
                    gap: 0.65rem !important;
                  }
                  .demo-workspace-actions {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    width: 100% !important;
                    gap: 0.5rem !important;
                  }
                  .demo-workspace-actions > *:first-child {
                    grid-column: 1 / -1 !important;
                  }
                  .demo-workspace-actions button,
                  .demo-workspace-actions a {
                    width: 100% !important;
                    justify-content: center !important;
                    padding: 0.5rem 0.4rem !important;
                    font-size: 0.68rem !important;
                  }
                }
              `}</style>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Zap size={18} style={{ color: 'var(--color-amber, #f59e0b)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    ⚡ DEMO WORKSPACE ACTIVE (OFFLINE MOCK MODE)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                    Exploring sample wedding data (*Alex & Sam's Wedding*). Sign in with Google to sync directly to your personal Google Drive.
                  </div>
                </div>
              </div>

              <div className="demo-workspace-actions">
                <SafetyShieldSyncBadge
                  status="offline"
                  userEmail={googleUserEmail || undefined}
                  spreadsheetId={spreadsheetId || undefined}
                />
                <button
                  type="button"
                  onClick={handleDirectGoogleAuth}
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
                  <span>Sign In with Google</span>
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
                  <span>Upgrade to Full Access</span>
                </a>
              </div>
            </div>
          )}

          {/* Navigation tabs (Only rendered when showTopNav is true) */}
          {showTopNav && (
            <nav style={styles.navbar}>
              {[
                { id: 'home', label: '[ SUMMARY ]' },
                { id: 'guests', label: '[ GUEST LIST ]' },
                { id: 'menu', label: '[ CATERING ]' },
                { id: 'tables', label: '[ SEATING ]' },
                { id: 'budget', label: '[ FINANCIALS ]' },
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
                  showWelcomeGuide={!hasDismissedWelcomeCard}
                  onDismissWelcomeGuide={handleDismissWelcomeGuide}
                  weddingName={weddingName}
                  spreadsheetId={spreadsheetId}
                  styleTheme={styleTheme}
                  colorTheme={theme}
                  showTopNav={showTopNav}
                  onSelectStyleTheme={handleStyleThemeChange}
                  onToggleColorTheme={handleToggleTheme}
                  onToggleTopNav={handleToggleTopNav}
                />
              )}

              {activeTab === 'guests' && weddingData && (
                <GuestListManager
                  guests={weddingData.guests}
                  catering={weddingData.catering}
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
                  catering={weddingData.catering}
                  onUpdateCatering={(data) => syncUpdate('catering', data)}
                  onUpdateGuests={(data) => syncUpdate('guests', data)}
                  onOpenGuestRegistry={() => switchTab('guests')}
                  isSyncing={isSyncing}
                />
              )}

              {activeTab === 'tables' && weddingData && (
                <SeatingChartManager
                  guests={weddingData.guests}
                  tables={weddingData.tables}
                  onUpdateGuests={(data) => syncUpdate('guests', data)}
                  onUpdateTables={(data) => syncUpdate('tables', data)}
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
                  expenses={weddingData.expenses || []}
                  budgetTarget={weddingData.dashboard?.totalBudget ?? budgetThreshold ?? 0}
                  weddingDate={weddingDate || weddingData.dashboard?.weddingDate || ''}
                  onUpdateBudgetTarget={async (newTarget) => {
                    setBudgetThreshold(newTarget);
                    if (weddingData) {
                      const updatedDash = { ...weddingData.dashboard, totalBudget: newTarget };
                      setWeddingData({ ...weddingData, dashboard: updatedDash });
                      await syncUpdate('dashboard', updatedDash);
                    }
                  }}
                  onUpdate={(data) => syncUpdate('budget', data)}
                  onUpdateExpenses={(data) => syncUpdate('expenses', data)}
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
                  budget={weddingData.budget}
                  onUpdate={(data) => syncUpdate('vendors', data)}
                  onUpdateBudget={(data) => syncUpdate('budget', data)}
                  isSyncing={isSyncing}
                  currency={currency}
                  spreadsheetId={spreadsheetId}
                  weddingName={weddingName}
                  driveFolder={driveFolder}
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
                  currency={currency}
                  onUpdateGifts={(data: GiftItem[]) => syncUpdate('gifts', data)}
                  onUpdateGuests={(data: Guest[]) => syncUpdate('guests', data)}
                  isSyncing={isSyncing}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Ergonomic Bottom Tab Navigation Bar [NAV-MOBILE-THUMB, NAV-SWIPE] */}
      {isMobile && isOnboarded && (
        <nav
          className="mobile-bottom-nav-bar"
          onTouchStart={handleBottomNavTouchStart}
          onTouchEnd={handleBottomNavTouchEnd}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '62px',
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderTop: '1px solid var(--color-border)',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 150,
            padding: '0 0.5rem',
            backdropFilter: 'blur(12px)',
          }}
        >
          {[
            { id: 'home', label: 'Home', icon: LayoutDashboard },
            { id: 'guests', label: 'Guests', icon: Users },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  switchTab(tab.id as any);
                  setIsMobileDrawerOpen(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: '0.35rem 0.5rem',
                  gap: '0.15rem',
                  flex: 1,
                  transition: 'var(--transition-smooth)',
                }}
              >
                <div
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--border-radius-sm, 12px)',
                    backgroundColor: isActive ? 'var(--color-bg-subtle, rgba(0,0,0,0.05))' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComp size={20} style={{ strokeWidth: isActive ? 2.5 : 1.8 }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: isActive ? 800 : 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* "More" Trigger Button */}
          {(() => {
            const isSecondaryTabActive = !['home', 'guests', 'budget', 'schedule'].includes(activeTab);
            return (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  setIsMobileDrawerOpen(!isMobileDrawerOpen);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  color: (isSecondaryTabActive || isMobileDrawerOpen) ? 'var(--color-primary)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: '0.35rem 0.5rem',
                  gap: '0.15rem',
                  flex: 1,
                  position: 'relative',
                  transition: 'var(--transition-smooth)',
                }}
              >
                <div
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--border-radius-sm, 12px)',
                    backgroundColor: (isSecondaryTabActive || isMobileDrawerOpen) ? 'var(--color-bg-subtle, rgba(0,0,0,0.05))' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Menu size={20} style={{ strokeWidth: (isSecondaryTabActive || isMobileDrawerOpen) ? 2.5 : 1.8 }} />
                  {isSecondaryTabActive && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '1px',
                        right: '4px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                      }}
                    />
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: (isSecondaryTabActive || isMobileDrawerOpen) ? 800 : 500 }}>
                  MORE
                </span>
              </button>
            );
          })()}
        </nav>
      )}

      {/* Categorized Mobile Module & Tools Drawer [NAV-MOBILE-DRAWER, NAV-SWIPE] */}
      {isMobile && isOnboarded && isMobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              triggerHaptic(8);
              setIsMobileDrawerOpen(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              borderTop: '2px solid var(--color-border)',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.2)',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
            }}
            onTouchStart={handleDrawerTouchStart}
            onTouchEnd={handleDrawerTouchEnd}
          >
            {/* Drawer Drag Handle Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '0.75rem',
                paddingBottom: '0.25rem',
                cursor: 'grab',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--color-muted)',
                  opacity: 0.5,
                }}
              />
            </div>

            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 1.25rem 0.75rem 1.25rem',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--color-primary)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  All Planning Modules & Tools
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                  Swipe down or tap a module to navigate
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setIsMobileDrawerOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body — Categorized Grid */}
            <div
              style={{
                padding: '1rem 1.25rem 2rem 1.25rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Category: Core Event Planning */}
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--color-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}
                >
                  Core Planning
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'home', label: 'Summary', sub: 'KPI Dashboard', icon: LayoutDashboard, color: '#3b82f6' },
                    { id: 'guests', label: 'Guests & RSVP', sub: 'Registry & Invites', icon: Users, color: '#10b981' },
                    { id: 'budget', label: 'Financials', sub: 'Ledger & Deposits', icon: DollarSign, color: '#f59e0b' },
                    { id: 'schedule', label: 'Day Timeline', sub: 'Run of Show', icon: Calendar, color: '#8b5cf6' },
                    { id: 'menu', label: 'Catering', sub: 'Dishes & Allergens', icon: Utensils, color: '#ec4899' },
                    { id: 'tables', label: 'Seating Chart', sub: 'Floor & Head Table', icon: Grid, color: '#06b6d4' },
                    { id: 'tasks', label: 'Checklist', sub: 'Kanban Stages', icon: ListTodo, color: '#f97316' },
                    { id: 'vendors', label: 'Vendors', sub: 'Contracts & Contacts', icon: Briefcase, color: '#6366f1' },
                  ]
                    .filter(m => (enabledModules as any)[m.id] ?? (m.id === 'home' ? enabledModules.metrics : true))
                    .map(m => {
                      const IconC = m.icon;
                      const isActive = activeTab === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic(12);
                            switchTab(m.id as any);
                            setIsMobileDrawerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.65rem 0.75rem',
                            backgroundColor: isActive ? 'var(--color-bg-hover, #f1f5f9)' : 'var(--color-bg-subtle, #f8fafc)',
                            border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            borderRadius: 'var(--border-radius-md, 8px)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'var(--transition-smooth)',
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                              color: isActive ? 'var(--color-on-primary)' : m.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            }}
                          >
                            <IconC size={16} />
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.725rem',
                                fontWeight: isActive ? 800 : 700,
                                color: 'var(--color-text)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {m.label}
                            </div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {m.sub}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Category: Media & Experience */}
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--color-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}
                >
                  Media & Experience
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'music', label: 'Music & DJ', sub: 'Cue Sheet & Do-Not-Play', icon: Music, color: '#a855f7' },
                    { id: 'photos', label: 'Photo Shot List', sub: 'Must-Have Groupings', icon: Camera, color: '#14b8a6' },
                    { id: 'thanks', label: 'Thank-You Tracker', sub: 'Gifts & Notes', icon: Heart, color: '#ef4444' },
                  ]
                    .filter(m => (enabledModules as any)[m.id] ?? true)
                    .map(m => {
                      const IconC = m.icon;
                      const isActive = activeTab === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic(12);
                            switchTab(m.id as any);
                            setIsMobileDrawerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.65rem 0.75rem',
                            backgroundColor: isActive ? 'var(--color-bg-hover, #f1f5f9)' : 'var(--color-bg-subtle, #f8fafc)',
                            border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            borderRadius: 'var(--border-radius-md, 8px)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'var(--transition-smooth)',
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                              color: isActive ? 'var(--color-on-primary)' : m.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            }}
                          >
                            <IconC size={16} />
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.725rem',
                                fontWeight: isActive ? 800 : 700,
                                color: 'var(--color-text)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {m.label}
                            </div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {m.sub}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Category: Collaboration & Quick Tools */}
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--color-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}
                >
                  Export & Quick Tools
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      setIsMobileDrawerOpen(false);
                      setShowPrintModal(true);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.65rem 0.5rem',
                      backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-md, 8px)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <Printer size={18} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      Print Studio
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      setIsMobileDrawerOpen(false);
                      setShowShareModal(true);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.65rem 0.5rem',
                      backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-md, 8px)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <Share2 size={18} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      Vendor Links
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      setIsMobileDrawerOpen(false);
                      setShowAdvancedSettings(true);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.65rem 0.5rem',
                      backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-md, 8px)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <Sliders size={18} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      Settings
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container [GEN-3] */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Global Spinner & Animation Styling helpers */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1.5s linear infinite;
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0.8;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @media (max-width: 768px) {
          .app-viewport-container {
            padding-bottom: 5.5rem !important;
          }
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
    border: 'none',
    borderBottom: '2px solid var(--color-primary)',
    boxShadow: 'none',
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
    fontFamily: 'var(--font-sans)',
    fontSize: '1.75rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
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
    fontFamily: 'var(--font-sans)',
    fontSize: '1.75rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
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
    fontFamily: 'var(--font-header, var(--font-sans))',
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
