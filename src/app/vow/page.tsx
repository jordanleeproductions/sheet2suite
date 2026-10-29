'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WeddingData, Guest, BudgetItem, ScheduleEvent, Task, PhotoShot, GiftItem, RSVPStatus, KanbanStage, GuestbookEntry } from '@/lib/sheets/types';
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
import SettingsManager from '@/components/settings/SettingsManager';
import QuickSettingsPopover from '@/components/vow/QuickSettingsPopover';
import PrintTemplatesModal, { PrintTemplateType } from '@/components/PrintTemplatesModal';
import ToastNotification, { ToastMessage } from '@/components/ToastNotification';
import AmbientSyncIndicator, { SyncStatus } from '@/components/vow/AmbientSyncIndicator';
import SafetyShieldSyncBadge from '@/components/SafetyShieldSyncBadge';
import AppVersionBadge from '@/components/AppVersionBadge';
import AppUpdateToast from '@/components/AppUpdateToast';
import VowDisconnectModal from '@/components/vow/VowDisconnectModal';
import UnauthenticatedLanding from '@/components/vow/UnauthenticatedLanding';
import VowSidebar from '@/components/vow/VowSidebar';
import VowMasthead from '@/components/vow/VowMasthead';
import VowMobileNav from '@/components/vow/VowMobileNav';
import CommandPalette from '@/components/vow/CommandPalette';
import { invalidateSessionCheckCache } from '@/lib/core/sessionCheck';
import Link from 'next/link';
import { RefreshCw, HardDrive, Heart, Home, Sparkles, AlertCircle, FileSpreadsheet, Settings, Check, CheckCircle2, Key, X, Lock, Share2, Sliders, Printer, Zap, ArrowRight, ArrowLeft, PanelLeftClose, PanelLeftOpen, LayoutDashboard, Utensils, Grid, Armchair, Camera, Users, DollarSign, Calendar, Briefcase, ListTodo, Music, ExternalLink, Search, ChevronRight } from 'lucide-react';
import { ALL_DEFAULT_TASKS } from '@/lib/sheets/mockDb';
import { TASK_PRESETS } from '@/lib/presets/taskPresets';
import { getColorPresets } from '@/lib/themePresets';
import { useSheet2Theme } from '@/lib/core/theme/ThemeProvider';
import { DashboardSectionConfig, loadDashboardLayout, loadPlanningToolsOrder } from '@/lib/dashboardLayout';

export default function Sheet2VowDashboard({ initialTab }: { initialTab?: string } = {}) {
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
  const [partner1Name, setPartner1Name] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('s2v_partner1_name') || '';
    }
    return '';
  });
  const [partner2Name, setPartner2Name] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('s2v_partner2_name') || '';
    }
    return '';
  });

  // Dynamic Dashboard and Navigation Layout Order (reactive across settings & tabs)
  const [dashboardLayout, setDashboardLayout] = useState<DashboardSectionConfig[]>(() => loadDashboardLayout());
  const [planningToolsOrder, setPlanningToolsOrder] = useState<string[]>(() => loadPlanningToolsOrder());

  useEffect(() => {
    const handleToolsOrderChange = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) {
        setPlanningToolsOrder(customEvent.detail);
      } else {
        setPlanningToolsOrder(loadPlanningToolsOrder());
      }
    };
    const handleLayoutChange = (e: Event) => {
      const customEvent = e as CustomEvent<DashboardSectionConfig[]>;
      if (customEvent.detail) {
        setDashboardLayout(customEvent.detail);
      } else {
        setDashboardLayout(loadDashboardLayout());
      }
    };
    window.addEventListener('s2v:tools-order-updated', handleToolsOrderChange);
    window.addEventListener('s2v:dashboard-layout-updated', handleLayoutChange);
    return () => {
      window.removeEventListener('s2v:tools-order-updated', handleToolsOrderChange);
      window.removeEventListener('s2v:dashboard-layout-updated', handleLayoutChange);
    };
  }, []);

  // Auto-derive Partner 1 Name default from connected Google account
  useEffect(() => {
    if (!partner1Name && googleUserName) {
      setPartner1Name(googleUserName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('s2v_partner1_name', googleUserName);
      }
    }
  }, [googleUserName, partner1Name]);

  // Direct 1-Click Google OAuth Kickoff [AUTH-FAST]
  const handleDirectGoogleAuth = async () => {
    setIsAuthenticating(true);
    try {
      const urlSheet = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('spreadsheetId') ||
          new URLSearchParams(window.location.search).get('sheetId') ||
          new URLSearchParams(window.location.search).get('id') ||
          new URLSearchParams(window.location.search).get('sheet')
        : '';
      const storedSheet = typeof window !== 'undefined' ? localStorage.getItem('s2v_spreadsheet_id') : '';
      const targetSheet = spreadsheetId || urlSheet || storedSheet || '';
      const sheetParam = targetSheet ? `?spreadsheetId=${encodeURIComponent(targetSheet)}` : '';
      const res = await fetch(`/api/auth/google${sheetParam}`);
      const data = await res.json();

      if (data.authUrl && typeof window !== 'undefined') {
        const width = 520;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const handleAuthMessage = (event: MessageEvent) => {
          // Security: Validate origin matches current domain, local development, or official sheet2suite domains [SEC-2]
          const origin = event.origin || '';
          const isAllowedOrigin = 
            origin === window.location.origin ||
            origin.endsWith('sheet2suite.com') ||
            origin.endsWith('.web.app') ||
            origin.endsWith('.firebaseapp.com') ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1');
          if (!isAllowedOrigin) return;

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

            const querySheetId = typeof window !== 'undefined'
              ? new URLSearchParams(window.location.search).get('spreadsheetId') ||
                new URLSearchParams(window.location.search).get('sheetId') ||
                new URLSearchParams(window.location.search).get('id') ||
                new URLSearchParams(window.location.search).get('sheet')
              : null;
            const storedSheetId = typeof window !== 'undefined' ? localStorage.getItem('s2v_spreadsheet_id') : null;

            const targetSpreadsheetId = provision?.spreadsheetId || querySheetId || targetSheet || storedSheetId;
            const hasExistingWorkspace = Boolean(targetSpreadsheetId) || Boolean(provision?.hasExistingWorkspace);

            if (hasExistingWorkspace && targetSpreadsheetId) {
              setSpreadsheetId(targetSpreadsheetId);
              if (typeof window !== 'undefined') {
                localStorage.setItem('s2v_spreadsheet_id', targetSpreadsheetId);
                localStorage.setItem('s2v_is_onboarded', 'true');
                try {
                  const currentUrl = new URL(window.location.href);
                  if (currentUrl.searchParams.get('spreadsheetId') !== targetSpreadsheetId) {
                    currentUrl.searchParams.set('spreadsheetId', targetSpreadsheetId);
                    window.history.replaceState(window.history.state, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
                  }
                } catch (_) {}
              }
              setIsMockMode(false);
              setIsOnboarded(true);
              invalidateSessionCheckCache();

              // Synchronize token registration with Cloud Firestore
              if (accessToken) {
                fetch('/api/auth/register-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    spreadsheetId: targetSpreadsheetId,
                    userEmail: user?.email,
                    accessToken,
                  }),
                }).catch((e) => console.warn('[OAuth] Could not register token:', e));
              }
              addToast(`Welcome ${user?.name ? user.name : 'back'}! Connecting to workspace...`, 'success');
              // Fetch latest metadata (wedding date, location, budget) directly from Google Sheet SETTINGS
              fetchWeddingData(accessToken, targetSpreadsheetId);
            } else {
              // Double Safety Net: Query /api/workspaces with the user's fresh token before redirecting to /activate
              fetch(`/api/workspaces?email=${encodeURIComponent(user?.email || '')}`, {
                headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : undefined,
              })
                .then((r) => r.json())
                .then((wsData) => {
                  if (wsData.success && Array.isArray(wsData.workspaces) && wsData.workspaces.length > 0 && wsData.workspaces[0]?.spreadsheetId) {
                    const fallbackSheetId = wsData.workspaces[0].spreadsheetId;
                    setSpreadsheetId(fallbackSheetId);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('s2v_spreadsheet_id', fallbackSheetId);
                      localStorage.setItem('s2v_is_onboarded', 'true');
                      try {
                        const currentUrl = new URL(window.location.href);
                        if (!currentUrl.searchParams.get('spreadsheetId')) {
                          currentUrl.searchParams.set('spreadsheetId', fallbackSheetId);
                          window.history.replaceState(window.history.state, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
                        }
                      } catch (_) {}
                    }
                    setIsMockMode(false);
                    setIsOnboarded(true);
                    invalidateSessionCheckCache();
                    addToast(`Welcome ${user?.name ? user.name : 'back'}! Connecting to workspace...`, 'success');
                    fetchWeddingData(accessToken, fallbackSheetId);
                  } else {
                    setSpreadsheetId('');
                    setIsMockMode(false);
                    setIsOnboarded(false);
                    addToast(`Authenticated as ${user?.email}.`, 'info');
                    if (typeof window !== 'undefined') {
                      window.location.href = `/activate?email=${encodeURIComponent(user?.email || '')}`;
                    }
                  }
                })
                .catch(() => {
                  setSpreadsheetId('');
                  setIsMockMode(false);
                  setIsOnboarded(false);
                  if (typeof window !== 'undefined') {
                    window.location.href = `/activate?email=${encodeURIComponent(user?.email || '')}`;
                  }
                });
            }
          } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', handleAuthMessage);
            setIsAuthenticating(false);
            addToast(event.data.error || 'Google Authentication Failed', 'warning');
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
        addToast(data.error || 'Failed to Initialize Google Authentication.', 'warning');
      }
    } catch (err: any) {
      console.error('Direct Google Auth Error:', err);
      setIsAuthenticating(false);
      addToast(err.message || 'Failed to Connect with Google.', 'warning');
    }
  };

  // Session Token Refresh Handler — refreshes OAuth token without clearing workspace state
  const handleReauth = async () => {
    setIsReauthenticating(true);
    try {
      const targetSheet = spreadsheetId || (typeof window !== 'undefined' ? localStorage.getItem('s2v_spreadsheet_id') || '' : '');

      // Step 1: Attempt silent token refresh first without opening popup
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spreadsheetId: targetSheet }),
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.accessToken) {
          setGoogleToken(refreshData.accessToken);
          if (typeof window !== 'undefined') {
            localStorage.setItem('s2v_google_token', refreshData.accessToken);
          }
          invalidateSessionCheckCache();
          setIsReauthenticating(false);
          setShowSessionExpiredModal(false);
          addToast('Session Restored Silently!', 'success');
          fetchWeddingData(refreshData.accessToken);
          return;
        }
      } catch (silentErr) {
        console.warn('[Reauth] Silent refresh failed, falling back to popup:', silentErr);
      }

      // Step 2: Fall back to OAuth popup if silent refresh was not possible
      const sheetParam = targetSheet ? `&spreadsheetId=${encodeURIComponent(targetSheet)}` : '';
      const res = await fetch(`/api/auth/google?prompt=consent${sheetParam}`);
      const data = await res.json();

      if (data.authUrl && typeof window !== 'undefined') {
        const width = 520;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const handleReauthMessage = (event: MessageEvent) => {
          // Security: Validate origin matches current domain, local development, or official sheet2suite domains [SEC-2]
          const origin = event.origin || '';
          const isAllowedOrigin = 
            origin === window.location.origin ||
            origin.endsWith('sheet2suite.com') ||
            origin.endsWith('.web.app') ||
            origin.endsWith('.firebaseapp.com') ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1');
          if (!isAllowedOrigin) return;

          if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
            const { user, accessToken } = event.data;
            window.removeEventListener('message', handleReauthMessage);
            setIsReauthenticating(false);

            if (accessToken) {
              setGoogleToken(accessToken);
              if (typeof window !== 'undefined') {
                localStorage.setItem('s2v_google_token', accessToken);
              }
              // Synchronize token registration with Cloud Firestore
              fetch('/api/auth/register-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  spreadsheetId: targetSheet,
                  userEmail: user?.email,
                  accessToken,
                }),
              }).catch((e) => console.warn('[OAuth] Could not register token:', e));
            }
            if (user?.name) setGoogleUserName(user.name);
            if (user?.email) setGoogleUserEmail(user.email);
            if (user?.picture) setGoogleUserAvatar(user.picture);

            invalidateSessionCheckCache();
            setShowSessionExpiredModal(false);
            addToast('Session Reconnected!', 'success');
            // Re-fetch data with the fresh token directly
            fetchWeddingData(accessToken);

          } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', handleReauthMessage);
            setIsReauthenticating(false);
            addToast(event.data.error || 'Google Re-Authentication Failed', 'warning');
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
        addToast(data.error || 'Failed to Initialize Google Authentication.', 'warning');
      }
    } catch (err: any) {
      console.error('Reauth Error:', err);
      setIsReauthenticating(false);
      addToast(err.message || 'Failed to Reconnect with Google.', 'warning');
    }
  };

  // Toast Notification System [GEN-3]
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ambient Sync Status Indicator (Monarch-Style Quiet Auto-Save)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const syncStatusTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (syncStatusTimerRef.current) {
        clearTimeout(syncStatusTimerRef.current);
      }
    };
  }, []);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'success', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => {
      // Deduplicate identical active messages and keep at most 1 previous toast to avoid stacking
      const filtered = prev.filter(t => t.message !== message);
      const capped = filtered.slice(-1);
      return [...capped, { id, message, type, duration }];
    });
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const settingsRef = useRef<HTMLDivElement>(null);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Global Cmd+K / Ctrl+K listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  const {
    fontSizeScale,
    setFontSizeScale,
    setStyleTheme: setContextStyleTheme,
    setTheme: setContextTheme,
    setPrimaryColor: setContextPrimaryColor,
  } = useSheet2Theme();
  const [styleTheme, setStyleTheme] = useState<'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo'>('editorial');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColor] = useState<string>('');

  const handleStyleThemeChange = (newStyle: 'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo') => {
    setStyleTheme(newStyle);
    setContextStyleTheme(newStyle);
    const presets = getColorPresets(newStyle, theme);
    if (presets.length > 0) {
      setPrimaryColor(presets[0].hex);
      setContextPrimaryColor(presets[0].hex);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    setContextTheme(newTheme);
    const presets = getColorPresets(styleTheme, newTheme);
    if (presets.length > 0) {
      setPrimaryColor(presets[0].hex);
      setContextPrimaryColor(presets[0].hex);
    }
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

  // Global listener for session expired events dispatched before modal actions
  useEffect(() => {
    const handleSessionExpiredEvent = () => {
      setShowSessionExpiredModal(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('s2v:session-expired', handleSessionExpiredEvent);
      return () => window.removeEventListener('s2v:session-expired', handleSessionExpiredEvent);
    }
  }, []);

  // Proactive background silent refresh & window visibility handler
  useEffect(() => {
    if (isMockMode || !spreadsheetId) return;

    const performSilentRefresh = async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spreadsheetId }),
        });
        const data = await res.json();
        if (data.success && data.accessToken) {
          setGoogleToken(data.accessToken);
          if (typeof window !== 'undefined') {
            localStorage.setItem('s2v_google_token', data.accessToken);
          }
        }
      } catch (_) {}
    };

    // Silently refresh when user tabs back into the app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performSilentRefresh();
      }
    };

    // Every 25 minutes, proactively refresh to ensure token never expires
    const refreshInterval = setInterval(performSilentRefresh, 25 * 60 * 1000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMockMode, spreadsheetId]);

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

  const handleUpdateWeddingDetails = async (name: string, date: string, location?: string, budget?: number) => {
    setWeddingName(name);
    setWeddingDate(date);
    if (location !== undefined) setLocationDetails(location);
    if (budget !== undefined && !isNaN(budget) && budget > 0) {
      setBudgetThreshold(budget);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_wedding_name', name);
      localStorage.setItem('s2v_wedding_date', date);
      if (location !== undefined) localStorage.setItem('s2v_location', location);
      if (budget !== undefined && !isNaN(budget) && budget > 0) {
        localStorage.setItem('s2v_budget_threshold', String(budget));
      }
    }
    if (weddingData) {
      const newTotalBudget = (budget !== undefined && !isNaN(budget) && budget > 0) ? budget : weddingData.dashboard.totalBudget;
      const updatedDash = {
        ...weddingData.dashboard,
        totalBudget: newTotalBudget,
        budget: newTotalBudget,
        weddingName: name,
        weddingDate: date,
        location: location !== undefined ? location : locationDetails,
        currency: currency,
      };
      setWeddingData(prev => prev ? ({
        ...prev,
        dashboard: updatedDash,
      }) : prev);
      await syncUpdate('dashboard', updatedDash);
    }
  };

  const handleUpdatePartnerNames = (p1: string, p2: string) => {
    setPartner1Name(p1);
    setPartner2Name(p2);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_partner1_name', p1);
      localStorage.setItem('s2v_partner2_name', p2);
    }
    if (weddingData) {
      const updatedDash = {
        ...weddingData.dashboard,
        partner1Name: p1,
        partner2Name: p2,
      };
      setWeddingData(prev => prev ? ({
        ...prev,
        dashboard: updatedDash,
      }) : prev);
      syncUpdate('dashboard', updatedDash);
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

  // Automatically fetch active co-planners from Cloud Firestore
  useEffect(() => {
    if (!spreadsheetId || isMockMode) return;
    fetch(`/api/share/partner?spreadsheetId=${encodeURIComponent(spreadsheetId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.coPlanners)) {
          setCoPlanners(data.coPlanners);
        }
      })
      .catch((e) => console.warn('[CoPlanners] Load error:', e));
  }, [spreadsheetId, isMockMode]);

  // Tab Title Mapping for Desktop Breadcrumb
  const TAB_TITLES: Record<string, string> = {
    home: 'Summary',
    metrics: 'Executive Briefing',
    guests: 'Guest List',
    menu: 'Catering',
    tables: 'Seating',
    budget: 'Financials',
    schedule: 'Timeline',
    tasks: 'Tasks',
    vendors: 'Vendors',
    music: 'Music',
    photos: 'Photos',
    thanks: 'Thanks',
    settings: 'Settings',
  };

  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'metrics' | 'guests' | 'menu' | 'tables' | 'budget' | 'schedule' | 'tasks' | 'vendors' | 'music' | 'photos' | 'thanks' | 'settings'>(() => {
    if (initialTab === 'settings') return 'settings';
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/settings' || path === '/vow/settings' || path.endsWith('/settings')) {
        return 'settings';
      }
      const hash = window.location.hash.replace('#', '').split('?')[0];
      const valid = ['home', 'metrics', 'guests', 'menu', 'tables', 'budget', 'schedule', 'tasks', 'vendors', 'music', 'photos', 'thanks', 'settings'];
      if (valid.includes(hash)) return hash as any;
    }
    return 'home';
  });
  const [settingsInitialSection, setSettingsInitialSection] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('section') || undefined;
    }
    return undefined;
  });
  const [guestInitialFilter, setGuestInitialFilter] = useState<RSVPStatus | 'All'>('All');
  const [guestInitialMealFilter, setGuestInitialMealFilter] = useState<string>('All');
  const [guestInitialDietFilter, setGuestInitialDietFilter] = useState<string>('All');
  const [taskInitialFilter, setTaskInitialFilter] = useState<KanbanStage | undefined>(undefined);
  const [musicInitialFilter, setMusicInitialFilter] = useState<string | undefined>(undefined);

  // Tab switching with browser History API push & URL hash sync
  const switchTab = (
    tab: 'home' | 'metrics' | 'guests' | 'menu' | 'tables' | 'budget' | 'schedule' | 'tasks' | 'vendors' | 'music' | 'photos' | 'thanks' | 'settings',
    filter?: string,
    pushToHistory = true,
    extra?: { mealFilter?: string; dietFilter?: string }
  ) => {
    triggerHaptic(10);
    const targetTab = tab === 'metrics' ? 'home' : tab;
    setActiveTab(targetTab as any);
    if (filter) {
      if (tab === 'guests') setGuestInitialFilter(filter as any);
      if (tab === 'tasks') setTaskInitialFilter(filter as any);
      if (tab === 'music') setMusicInitialFilter(filter);
      if (tab === 'settings') setSettingsInitialSection(filter);
    }
    if (tab === 'guests' && extra?.mealFilter) {
      setGuestInitialMealFilter(extra.mealFilter);
    }
    if (tab === 'guests' && extra?.dietFilter) {
      setGuestInitialDietFilter(extra.dietFilter);
    }

    if (pushToHistory && typeof window !== 'undefined') {
      const queryParts: string[] = [];
      if (filter) {
        if (tab === 'settings') {
          queryParts.push(`section=${encodeURIComponent(filter)}`);
        } else {
          queryParts.push(`filter=${encodeURIComponent(filter)}`);
        }
      }
      if (extra?.mealFilter) queryParts.push(`meal=${encodeURIComponent(extra.mealFilter)}`);
      if (extra?.dietFilter) queryParts.push(`diet=${encodeURIComponent(extra.dietFilter)}`);
      const hash = `#${tab}${queryParts.length > 0 && tab !== 'settings' ? `?${queryParts.join('&')}` : ''}`;
      const activeSheet = spreadsheetId || localStorage.getItem('s2v_spreadsheet_id') || '';
      const searchParams = new URLSearchParams(window.location.search);
      if (activeSheet && !searchParams.get('spreadsheetId') && !searchParams.get('sheetId')) {
        searchParams.set('spreadsheetId', activeSheet);
      }
      if (tab === 'settings' && filter) {
        searchParams.set('section', filter);
      }
      const searchStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const targetUrl = `${window.location.pathname}${searchStr}${hash}`;
      if (window.location.hash !== hash || (activeSheet && !window.location.search.includes('spreadsheetId'))) {
        window.history.pushState({ tab, filter, mealFilter: extra?.mealFilter, dietFilter: extra?.dietFilter }, '', targetUrl);
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
        const meal = params.get('meal') || undefined;
        const diet = params.get('diet') || undefined;

        const validTabs = ['home', 'metrics', 'guests', 'menu', 'tables', 'budget', 'schedule', 'tasks', 'vendors', 'music', 'photos', 'thanks', 'settings'];
        if (validTabs.includes(tabName)) {
          if (tabName === 'settings') {
            const sec = params.get('section') || filter;
            if (sec) setSettingsInitialSection(sec);
            switchTab('settings', sec, false);
            return;
          }
          switchTab(tabName as any, filter, false, (meal || diet) ? { mealFilter: meal, dietFilter: diet } : undefined);
          return;
        }
      }
      if (event.state?.tab) {
        switchTab(event.state.tab, event.state.filter, false, (event.state.mealFilter || event.state.dietFilter) ? { mealFilter: event.state.mealFilter, dietFilter: event.state.dietFilter } : undefined);
      } else {
        switchTab('home', undefined, false);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial load URL hash & query check
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const sectionQuery = searchParams.get('section');
      if (sectionQuery) {
        setSettingsInitialSection(sectionQuery);
      }

      if (path === '/settings' || path === '/vow/settings' || path.endsWith('/settings')) {
        switchTab('settings', sectionQuery || undefined, false);
      } else if (window.location.hash) {
        const initialHash = window.location.hash.replace('#', '');
        const [tabName, queryStr] = initialHash.split('?');
        const params = new URLSearchParams(queryStr || '');
        const filter = params.get('filter') || undefined;
        const meal = params.get('meal') || undefined;

        const validTabs = ['home', 'metrics', 'guests', 'menu', 'tables', 'budget', 'schedule', 'tasks', 'vendors', 'music', 'photos', 'thanks', 'settings'];
        if (validTabs.includes(tabName)) {
          if (tabName === 'settings') {
            const sec = params.get('section') || filter || sectionQuery;
            if (sec) setSettingsInitialSection(sec);
            switchTab('settings', sec || undefined, false);
          } else {
            switchTab(tabName as any, filter, false, meal ? { mealFilter: meal } : undefined);
          }
        }
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Load configuration from local storage or URL query parameters on mount
  useEffect(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlSheetId = urlParams?.get('spreadsheetId') || urlParams?.get('sheetId') || urlParams?.get('id') || urlParams?.get('sheet');
    const savedSheetId = urlSheetId || localStorage.getItem('s2v_spreadsheet_id');
    if (urlSheetId && typeof window !== 'undefined') {
      localStorage.setItem('s2v_spreadsheet_id', urlSheetId);
    }

    const savedToken = localStorage.getItem('s2v_google_token');
    const savedMock = localStorage.getItem('s2v_is_mock');
    const savedDemo = localStorage.getItem('s2v_is_demo');
    const isOfflineMode = savedMock === 'true' || savedDemo === 'true';
    const savedOnboarded = (savedToken && (urlSheetId || localStorage.getItem('s2v_is_onboarded') === 'true')) || (isOfflineMode && localStorage.getItem('s2v_is_onboarded') === 'true') ? 'true' : 'false';
    const savedName = localStorage.getItem('s2v_wedding_name');
    const savedDate = localStorage.getItem('s2v_wedding_date');

    // Multi-Device Auto-Discovery: If no spreadsheetId is in localStorage or URL, attempt to discover workspaces via server session
    if (!savedSheetId && !isOfflineMode) {
      fetch('/api/workspaces')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
            const primaryWorkspace = data.workspaces[0];
            const discoveredSheetId = primaryWorkspace.spreadsheetId;
            if (discoveredSheetId) {
              setSpreadsheetId(discoveredSheetId);
              setIsOnboarded(true);
              if (data.userEmail) {
                setGoogleUserEmail(data.userEmail);
                if (typeof window !== 'undefined') localStorage.setItem('s2v_google_email', data.userEmail);
              }
              if (primaryWorkspace.spreadsheetName) {
                const cleanName = primaryWorkspace.spreadsheetName.replace(/ Database$/i, '').replace(/ Workspace$/i, '');
                setWeddingName(cleanName);
                if (typeof window !== 'undefined') localStorage.setItem('s2v_wedding_name', cleanName);
              }
              if (typeof window !== 'undefined') {
                localStorage.setItem('s2v_spreadsheet_id', discoveredSheetId);
                localStorage.setItem('s2v_is_onboarded', 'true');
                try {
                  const currentUrl = new URL(window.location.href);
                  if (!currentUrl.searchParams.get('spreadsheetId')) {
                    currentUrl.searchParams.set('spreadsheetId', discoveredSheetId);
                    window.history.replaceState(window.history.state, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
                  }
                } catch (_) {}
              }
              // Immediately hydrate wedding data from discovered workspace
              fetchWeddingData(undefined, discoveredSheetId);
            }
          }
        })
        .catch((err) => {
          console.warn('[Auto-Discovery] Could not auto-detect workspace:', err);
        });
    }
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
      if (typeof window !== 'undefined') {
        try {
          const currentUrl = new URL(window.location.href);
          if (!currentUrl.searchParams.get('spreadsheetId') && !currentUrl.searchParams.get('sheetId')) {
            currentUrl.searchParams.set('spreadsheetId', savedSheetId);
            window.history.replaceState(window.history.state, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
          }
        } catch (_) {}
      }
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
    const savedBudget = localStorage.getItem('s2v_budget_threshold');
    if (savedName) setWeddingName(savedName);
    if (savedDate) setWeddingDate(savedDate);
    if (savedLocation) setLocationDetails(savedLocation);
    if (savedBudget && !isNaN(Number(savedBudget))) setBudgetThreshold(Number(savedBudget));
    const activeStyle = (savedStyleTheme === 'editorial' || savedStyleTheme === 'neo-brutalism' || savedStyleTheme === 'botanical-romance' || savedStyleTheme === 'midnight-tuxedo') ? savedStyleTheme : 'editorial';
    const activeTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
    if (savedStyleTheme) setStyleTheme(activeStyle);
    if (savedTheme) setTheme(activeTheme);
    const defaultAccent = getColorPresets(activeStyle, activeTheme)[0]?.hex || '';
    setPrimaryColor(defaultAccent);
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
    if (activeTab === 'settings') return;
    const isTabActive = activeTab === 'home' ? (enabledModules.home ?? enabledModules.metrics) : enabledModules[activeTab];
    if (!isTabActive) {
      const tabsOrder: (keyof ModuleConfig)[] = ['metrics', 'guests', 'budget', 'schedule', 'tasks', 'vendors', 'music'];
      const firstAvailable = tabsOrder.find(m => enabledModules[m]);
      setActiveTab((firstAvailable as any) === 'metrics' ? 'home' : (firstAvailable as any) || 'home');
    }
  }, [enabledModules, activeTab]);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

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
        // Customize accent colors in Neo-Brutalism without changing structural black/slate
        document.documentElement.style.setProperty('--color-highlight', primaryColor);
        document.documentElement.style.setProperty('--color-gold-dark', primaryColor);
        if (theme === 'dark') {
          document.documentElement.style.setProperty('--color-primary', primaryColor);
          document.documentElement.style.setProperty('--color-on-primary', '#000000');
        } else {
          document.documentElement.style.removeProperty('--color-primary');
          document.documentElement.style.setProperty('--color-on-primary', '#ffffff');
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

  const fetchWeddingData = async (overrideToken?: string, overrideSpreadsheetId?: string) => {
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

      const targetSheetId = overrideSpreadsheetId || spreadsheetId;
      if (!targetSheetId) {
        setIsLoading(false);
        return;
      }

      let response = await fetch(`/api/sync?spreadsheetId=${targetSheetId}`, {
        method: 'GET',
        headers
      });

      let res = await response.json();

      // If 401, attempt silent background refresh before giving up
      if (response.status === 401 || res.isAuthError) {
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spreadsheetId: targetSheetId }),
          });
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.accessToken) {
            setGoogleToken(refreshData.accessToken);
            if (typeof window !== 'undefined') {
              localStorage.setItem('s2v_google_token', refreshData.accessToken);
            }
            headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
            response = await fetch(`/api/sync?spreadsheetId=${targetSheetId}`, {
              method: 'GET',
              headers
            });
            res = await response.json();
          }
        } catch (rErr) {
          console.warn('[Session] Silent refresh error in fetchWeddingData:', rErr);
        }
      }

      if (response.status === 401 || res.isAuthError) {
        setShowSessionExpiredModal(true);
        return;
      }

      // Self-Healing Fallback: If 404 / "Requested entity was not found", stored spreadsheet ID is stale, moved, or deleted.
      // Automatically query /api/workspaces (Cloud Firestore & Google Drive) to recover the active workspace.
      const errorMsg = String(res?.error || '').toLowerCase();
      const isNotFound = response.status === 404 || res?.isNotFoundError || errorMsg.includes('requested entity was not found');

      if (!res.success && isNotFound && !isMockMode) {
        console.warn(`[Sync Self-Healing] Stale or missing spreadsheet ID detected: "${targetSheetId}". Recovering active workspace...`);
        try {
          let replacementId = res?.replacementSpreadsheetId;

          if (!replacementId) {
            const userEmail = googleUserEmail || (typeof window !== 'undefined' ? localStorage.getItem('s2v_google_email') || '' : '');
            const emailQuery = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
            const wsRes = await fetch(`/api/workspaces${emailQuery}`, {
              headers: activeToken ? { 'Authorization': `Bearer ${activeToken}` } : undefined,
            });
            const wsData = await wsRes.json();
            if (wsData.success && Array.isArray(wsData.workspaces) && wsData.workspaces.length > 0) {
              const activeWs = wsData.workspaces.find((w: any) => w.spreadsheetId && w.spreadsheetId !== targetSheetId) || wsData.workspaces[0];
              if (activeWs?.spreadsheetId && activeWs.spreadsheetId !== targetSheetId) {
                replacementId = activeWs.spreadsheetId;
              }
            }
          }

          if (replacementId && replacementId !== targetSheetId) {
            console.log(`[Sync Self-Healing] Recovered active workspace ID: ${replacementId}`);
            setSpreadsheetId(replacementId);
            if (typeof window !== 'undefined') {
              localStorage.setItem('s2v_spreadsheet_id', replacementId);
              try {
                const currentUrl = new URL(window.location.href);
                if (currentUrl.searchParams.get('spreadsheetId') !== replacementId) {
                  currentUrl.searchParams.set('spreadsheetId', replacementId);
                  window.history.replaceState(window.history.state, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
                }
              } catch (_) {}
            }
            addToast('Stale spreadsheet link detected — automatically reconnected to your active workspace!', 'info');
            return fetchWeddingData(activeToken, replacementId);
          }
        } catch (healErr) {
          console.warn('[Sync Self-Healing] Error recovering active workspace:', healErr);
        }
      }

      // If backend returned a refreshed access token, update client state
      if (res.freshAccessToken) {
        setGoogleToken(res.freshAccessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('s2v_google_token', res.freshAccessToken);
        }
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
        if (res.data?.dashboard?.totalBudget !== undefined && !isNaN(Number(res.data.dashboard.totalBudget)) && Number(res.data.dashboard.totalBudget) > 0) {
          setBudgetThreshold(Number(res.data.dashboard.totalBudget));
          if (typeof window !== 'undefined') localStorage.setItem('s2v_budget_threshold', String(res.data.dashboard.totalBudget));
        }
        if (res.data?.dashboard?.currency) {
          setCurrency(res.data.dashboard.currency);
          if (typeof window !== 'undefined') localStorage.setItem('s2v_currency', res.data.dashboard.currency);
        }
        // Sync welcome card dismissal state
        const localDismissed = typeof window !== 'undefined' ? localStorage.getItem(`s2v_welcome_dismissed_${targetSheetId}`) : null;
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
      setSyncError(err.message || 'Error connecting to workspace. Check authentication.');
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
  const syncUpdate = async (sheetType: 'dashboard' | 'guests' | 'tables' | 'budget' | 'expenses' | 'schedule' | 'tasks' | 'music' | 'vendors' | 'photos' | 'gifts' | 'catering' | 'guestbook', updatedData: any) => {
    if (isSyncing || !spreadsheetId) return;
    setIsSyncing(true);
    setSyncError(null);
    if (syncStatusTimerRef.current) {
      clearTimeout(syncStatusTimerRef.current);
      syncStatusTimerRef.current = null;
    }
    setSyncStatus('saving');

    // Optimistically update UI local state first
    setWeddingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [sheetType]: updatedData
      };
    });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const token = isMockMode ? 'mock-token' : googleToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response = await fetch('/api/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          spreadsheetId,
          sheetType,
          data: updatedData
        })
      });

      let res = await response.json();

      // If 401, attempt silent background refresh before showing modal
      if (response.status === 401 || res.isAuthError) {
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spreadsheetId }),
          });
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.accessToken) {
            setGoogleToken(refreshData.accessToken);
            if (typeof window !== 'undefined') {
              localStorage.setItem('s2v_google_token', refreshData.accessToken);
            }
            headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
            response = await fetch('/api/sync', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                spreadsheetId,
                sheetType,
                data: updatedData
              })
            });
            res = await response.json();
          }
        } catch (rErr) {
          console.warn('[Sync] Silent refresh error in pushToDatabase:', rErr);
        }
      }

      if (response.status === 401 || res.isAuthError) {
        setShowSessionExpiredModal(true);
        return;
      }

      if (res.freshAccessToken) {
        setGoogleToken(res.freshAccessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('s2v_google_token', res.freshAccessToken);
        }
      }
      const postErrorMsg = String(res?.error || '').toLowerCase();
      const isPostNotFound = response.status === 404 || res?.isNotFoundError || postErrorMsg.includes('requested entity was not found');
      if (!res.success && isPostNotFound && !isMockMode) {
        addToast('Active spreadsheet not found. Refreshing workspace connection...', 'warning');
        await fetchWeddingData();
        return;
      }

      if (!res.success) {
        throw new Error(res.error || `Failed to sync ${sheetType}`);
      }

      // If backend returns updated data (in mock mode), update our state
      if (res.data) {
        setWeddingData(res.data);
      }
      setSyncStatus('saved');
      setLastSavedAt(new Date());

      if (syncStatusTimerRef.current) {
        clearTimeout(syncStatusTimerRef.current);
      }
      syncStatusTimerRef.current = setTimeout(() => {
        setSyncStatus('idle');
      }, 3200);
    } catch (err: any) {
      console.error(err);
      setSyncError(`Sync error: ${err.message || 'Could not push updates.'}`);
      setSyncStatus('error');
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
    today.setHours(0, 0, 0, 0);

    let target: Date;
    if (/^\d{4}-\d{2}-\d{2}/.test(weddingDate)) {
      const [y, m, d] = weddingDate.split(/[T ]/)[0].split('-').map(Number);
      target = new Date(y, m - 1, d);
    } else {
      target = new Date(weddingDate);
    }

    if (isNaN(target.getTime())) return "DATE NOT SET";
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return daysAgo === 1 ? "MARRIED 1 DAY AGO!" : `MARRIED ${daysAgo} DAYS AGO!`;
    }
    if (diffDays === 0) {
      return "JUST MARRIED!";
    }
    return diffDays === 1 ? "1 DAY UNTIL THE WEDDING!" : `${diffDays} DAYS UNTIL THE WEDDING!`;
  };

  // Editorial Utility: 1-Click CSV Exporter for Active View
  const handleExportActiveCSV = () => {
    if (!weddingData) {
      addToast('No data available to export', 'warning');
      return;
    }

    let csvContent = '';
    let filename = `sheet2vow_${activeTab}_export.csv`;

    if (activeTab === 'guests' || activeTab === 'home' || activeTab === 'metrics') {
      const headers = ['First Name', 'Last Name', 'Party Group', 'RSVP Status', 'Meal Choice', 'Dietary Restrictions', 'Table ID', 'Email', 'Phone'];
      const rows = (weddingData.guests || []).map(g => [
        `"${g.firstName || ''}"`,
        `"${g.lastName || ''}"`,
        `"${g.partyGroup || ''}"`,
        `"${g.rsvpStatus || ''}"`,
        `"${g.mealChoice || ''}"`,
        `"${g.dietaryRestrictions || ''}"`,
        `"${g.tableAssignment || ''}"`,
        `"${g.emailAddress || ''}"`,
        `"${g.phoneNumber || ''}"`
      ]);
      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `sheet2vow_guests_${(weddingName || 'wedding').toLowerCase().replace(/\s+/g, '_')}.csv`;
    } else if (activeTab === 'budget') {
      const headers = ['Category', 'Description', 'Actual Cost', 'Paid', 'Purchase Date', 'Paid By', 'Notes'];
      const rows = (weddingData.expenses || []).map(e => [
        `"${e.category || ''}"`,
        `"${e.description || ''}"`,
        `"${e.actualCost || 0}"`,
        `"${e.amountPaid || 0}"`,
        `"${e.purchaseDate || ''}"`,
        `"${e.paidBy || 'Couple'}"`,
        `"${e.notes || ''}"`
      ]);
      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `sheet2vow_budget_${(weddingName || 'wedding').toLowerCase().replace(/\s+/g, '_')}.csv`;
    } else if (activeTab === 'schedule') {
      const headers = ['Start Time', 'End Time', 'Moment', 'Location', 'Responsibility', 'Notes'];
      const rows = (weddingData.schedule || []).map(s => [
        `"${s.startTime || ''}"`,
        `"${s.endTime || ''}"`,
        `"${s.eventMoment || ''}"`,
        `"${s.location || ''}"`,
        `"${s.responsibility || ''}"`,
        `"${s.notes || ''}"`
      ]);
      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `sheet2vow_timeline_${(weddingName || 'wedding').toLowerCase().replace(/\s+/g, '_')}.csv`;
    } else if (activeTab === 'vendors') {
      const headers = ['Vendor Name', 'Category', 'Contact', 'Email', 'Phone', 'Contract Value', 'Paid', 'Balance'];
      const rows = (weddingData.vendors || []).map(v => [
        `"${v.vendorName || ''}"`,
        `"${v.category || ''}"`,
        `"${v.contactName || ''}"`,
        `"${v.emailAddress || ''}"`,
        `"${v.phoneNumber || ''}"`,
        `"${v.totalContractValue || 0}"`,
        `"${v.depositPaid || 0}"`,
        `"${v.balanceOwing || 0}"`
      ]);
      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `sheet2vow_vendors_${(weddingName || 'wedding').toLowerCase().replace(/\s+/g, '_')}.csv`;
    } else if (activeTab === 'tasks') {
      const headers = ['Task Name', 'Stage', 'Priority', 'Assigned To', 'Due Date'];
      const rows = (weddingData.tasks || []).map(t => [
        `"${t.taskName || ''}"`,
        `"${t.kanbanStage || ''}"`,
        `"${t.priority || ''}"`,
        `"${t.assignedTo || ''}"`,
        `"${t.dueDate || ''}"`
      ]);
      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `sheet2vow_tasks_${(weddingName || 'wedding').toLowerCase().replace(/\s+/g, '_')}.csv`;
    } else {
      const headers = ['First Name', 'Last Name', 'Party Group', 'RSVP Status', 'Meal Choice', 'Table ID'];
      const rows = (weddingData.guests || []).map(g => [
        `"${g.firstName || ''}"`,
        `"${g.lastName || ''}"`,
        `"${g.partyGroup || ''}"`,
        `"${g.rsvpStatus || ''}"`,
        `"${g.mealChoice || ''}"`,
        `"${g.tableAssignment || ''}"`
      ]);
      csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `sheet2vow_data_${(weddingName || 'wedding').toLowerCase().replace(/\s+/g, '_')}.csv`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${filename}`, 'info');
  };

  const isDesktopSidebarActive = !isMobile && isOnboarded;
  const sidebarWidthPx = isSidebarCollapsed ? 60 : 210;

  return (
    <div
      className="app-viewport-container"
      style={{
        ...styles.container,
        marginLeft: isDesktopSidebarActive ? `${sidebarWidthPx}px` : 'auto',
        marginRight: isDesktopSidebarActive ? '0' : 'auto',
        width: isDesktopSidebarActive ? `calc(100% - ${sidebarWidthPx}px)` : '100%',
        maxWidth: isDesktopSidebarActive ? '100%' : '1680px',
        transition: 'margin-left 0.15s ease-out, width 0.15s ease-out'
      }}
    >


      {/* Desktop Sticky Compact Left Sidebar [Editorial Utility Rail] */}
      {!isMobile && isOnboarded && (
        <VowSidebar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeTab={activeTab}
          onSwitchTab={switchTab}
          enabledModules={enabledModules}
          onOpenShareModal={() => setShowShareModal(true)}
          onOpenSettings={() => switchTab('settings')}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onExportCSV={handleExportActiveCSV}
          theme={theme}
          styleTheme={styleTheme}
          planningToolsOrder={planningToolsOrder}
        />
      )}

      {/* Brand Header */}
      <header
        className="app-brand-header"
        style={{
          ...styles.appHeader,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          paddingTop: isMobile ? '0.35rem' : '0.5rem',
          paddingBottom: isMobile ? '0.35rem' : '0.5rem',
          marginTop: 0,
          marginLeft: 0,
          marginRight: 0,
          paddingLeft: isMobile ? '0.75rem' : '1.25rem',
          paddingRight: isMobile ? '0.75rem' : '1.25rem',
          width: '100%',
          boxSizing: 'border-box',
          border: 'none',
          borderBottom: '1px solid var(--color-border, #E2E8F0)',
          boxShadow: 'none',
          outline: 'none',
          marginBottom: isMobile ? '0.5rem' : '1rem',
        }}
      >
        <div style={{ ...styles.brandGroup, display: 'flex', alignItems: 'center', gap: isMobile ? '0' : '0.5rem' }}>
          {!isMobile && isDesktopSidebarActive ? (
            /* Desktop Hybrid Breadcrumb Navigation (replaces duplicate Sheet2Vow brand) */
            <nav
              aria-label="Breadcrumb"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                title="Go to Overview"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '3px 8px',
                  margin: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--color-muted, #64748B)',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease, background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary, #0F172A)';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover, rgba(0,0,0,0.04))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-muted, #64748B)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Heart size={14} style={{ color: 'var(--color-accent, #6366F1)' }} />
                <span>{weddingName || 'Our Wedding'}</span>
              </button>

              <ChevronRight size={14} style={{ color: 'var(--color-border-subtle, #94A3B8)', flexShrink: 0 }} />

              <span
                style={{
                  fontWeight: 600,
                  color: 'var(--color-primary, #0F172A)',
                  letterSpacing: '-0.01em',
                  padding: '3px 6px',
                  fontSize: '0.92rem',
                }}
              >
                {TAB_TITLES[activeTab] || 'Summary'}
              </span>
            </nav>
          ) : (
            <>
              {!isMobile && !isDesktopSidebarActive && (
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    backgroundColor: 'var(--color-primary, #0F172A)',
                    color: 'var(--color-on-primary, #FFFFFF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '2px',
                    flexShrink: 0,
                  }}
                >
                  <FileSpreadsheet size={15} strokeWidth={2.2} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-editorial-serif, serif)',
                    fontSize: isMobile ? '1.35rem' : '1.45rem',
                    margin: 0,
                    lineHeight: '1.1',
                    fontWeight: 700,
                    color: 'var(--color-primary, #0F172A)',
                    letterSpacing: isMobile ? '-0.025em' : '-0.02em',
                  }}
                >
                  Sheet2Vow
                </h1>
                {!isMobile && !isDesktopSidebarActive && (
                  <p
                    style={{
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontSize: '0.62rem',
                      color: 'var(--color-muted, #64748B)',
                      margin: 0,
                      marginTop: '1px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Clean digital canvas for spreadsheet purists.
                  </p>
                )}
              </div>
            </>
          )}
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

            {/* Ambient Sync Status Indicator (Monarch-Style Quiet Auto-Save) */}
            <AmbientSyncIndicator
              status={syncStatus}
              lastSavedAt={lastSavedAt}
              isMockMode={isMockMode}
              isMobile={isMobile}
              styleTheme={styleTheme}
              onRetry={() => {
                setSyncStatus('saving');
                fetchWeddingData();
              }}
            />

            {!isMobile && (
              <>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.28rem 0.55rem',
                    borderRadius: '4px',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    backgroundColor: 'var(--color-background-subtle, #F8FAFC)',
                    color: 'var(--color-muted, #64748B)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setIsCommandPaletteOpen(true)}
                  title="Search"
                >
                  <Search size={13} />
                  <span style={{ fontWeight: 500 }}>Search</span>
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
              <button
                style={{
                  ...styles.iconBtn,
                  backgroundColor: isQuickSettingsOpen || activeTab === 'settings' ? 'var(--color-primary-light, rgba(2, 132, 199, 0.15))' : 'transparent',
                  color: isQuickSettingsOpen || activeTab === 'settings' ? 'var(--color-primary)' : 'var(--color-text)',
                }}
                onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}
                title="Quick settings"
                aria-label="Quick settings"
              >
                <Settings size={20} />
              </button>

              <QuickSettingsPopover
                isOpen={isQuickSettingsOpen}
                onClose={() => setIsQuickSettingsOpen(false)}
                anchorRef={settingsRef}
                theme={theme}
                onUpdateTheme={handleThemeChange}
                styleTheme={styleTheme}
                onNavigateSettings={(section) => {
                  setIsQuickSettingsOpen(false);
                  switchTab('settings', section);
                }}
              />
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
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isReauthenticating) {
              setShowSessionExpiredModal(false);
            }
          }}
        >
          <div
            style={{
              position: 'relative',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg, 1rem)',
              padding: '1.75rem',
              maxWidth: '430px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.15rem',
            }}
          >
            {/* Top Right Close 'X' Button */}
            <button
              type="button"
              onClick={() => setShowSessionExpiredModal(false)}
              disabled={isReauthenticating}
              aria-label="Close modal"
              title="Close"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-subtle, rgba(0,0,0,0.03))',
                color: 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isReauthenticating ? 'not-allowed' : 'pointer',
                opacity: isReauthenticating ? 0.5 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              <X size={16} />
            </button>

            {/* Header: Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingRight: '2rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1.5px solid rgba(234, 179, 8, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#d97706',
              }}>
                <Lock size={20} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  letterSpacing: '0.06em',
                  color: 'var(--color-text)',
                  textTransform: 'uppercase',
                }}>
                  Session Expired
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-muted)',
                  marginTop: '0.15rem',
                }}>
                  Google authorization timed out
                </div>
              </div>
            </div>

            {/* Explanatory Body */}
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-text)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              Your Google OAuth session has timed out. Sign back in with your Google account to restore full cloud synchronization — your workspace changes and data remain safe.
            </p>

            {/* User identity card */}
            {googleUserEmail && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm, 8px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                  {googleUserAvatar ? (
                    <img
                      src={googleUserAvatar}
                      alt=""
                      style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {googleUserName ? googleUserName.charAt(0).toUpperCase() : 'G'}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {googleUserEmail}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.625rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}>
                  CONNECTED
                </span>
              </div>
            )}

            {/* Dedicated Primary Sign In Button (Full Width) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={handleReauth}
                disabled={isReauthenticating}
                style={{
                  width: '100%',
                  padding: '0.8rem 1.25rem',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary, #ffffff)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm, 8px)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '0.825rem',
                  letterSpacing: '0.06em',
                  cursor: isReauthenticating ? 'not-allowed' : 'pointer',
                  opacity: isReauthenticating ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.15s ease',
                }}
              >
                {isReauthenticating ? (
                  <>
                    <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    SIGNING IN...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    SIGN IN WITH GOOGLE
                  </>
                )}
              </button>

              {/* Secondary Disconnect workspace option */}
              <div style={{ textAlign: 'center', paddingTop: '0.1rem' }}>
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
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.02em',
                  }}
                >
                  Disconnect workspace instead
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

      {/* Print & Export Studio Modal (Disabled for Initial Launch) */}
      {/* {showPrintModal && (
        <PrintTemplatesModal
          initialTemplate={printModalInitialTemplate}
          guests={weddingData?.guests || []}
          schedule={weddingData?.schedule || []}
          vendors={weddingData?.vendors || []}
          tables={weddingData?.tables || []}
          weddingName={weddingName}
          weddingDate={weddingDate}
          timeFormat={timeFormat}
          currency={currency}
          onClose={() => setShowPrintModal(false)}
        />
      )} */}

      

      {/* Main Core Area */}
      {!isOnboarded ? (
        /* Unauthenticated Landing Experience */
        <UnauthenticatedLanding
          onOpenGoogleAuth={handleDirectGoogleAuth}
          onExploreDemo={handleExpressOnboard}
          isAuthenticating={isAuthenticating}
          spreadsheetId={spreadsheetId}
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
                  <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>WORKSPACE ID:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', wordBreak: 'break-all' }}>🔑 {spreadsheetId || 'Connected Workspace'}</div>
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

          {/* Persistent Wedding Masthead (Editorial Serif with compressed mode on data-dense views) */}
          <VowMasthead
            weddingName={weddingName}
            weddingDate={weddingDate}
            locationDetails={locationDetails || weddingData?.dashboard?.location || ''}
            countdown={getCountdown()}
            activeTab={activeTab}
            isMobile={isMobile}
          />

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
                  vendors={weddingData.vendors}
                  enabledModules={enabledModules}
                  currency={currency}
                  partner1Name={partner1Name || googleUserName}
                  partner2Name={partner2Name}
                  onNavigateTab={(tab, filter) => switchTab(tab as any, filter)}
                  onOpenModuleSettings={() => switchTab('settings', 'tools')}
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
                  dashboardLayout={dashboardLayout}
                />
              )}

              {activeTab === 'guests' && weddingData && (
                <GuestListManager
                  guests={weddingData.guests}
                  catering={weddingData.catering}
                  tables={weddingData.tables}
                  onUpdate={(data) => syncUpdate('guests', data)}
                  isSyncing={isSyncing}
                  initialRsvpFilter={guestInitialFilter}
                  initialMealFilter={guestInitialMealFilter}
                  initialDietFilter={guestInitialDietFilter}
                  partner1Name={partner1Name || googleUserName}
                  partner2Name={partner2Name}
                />
              )}

              {activeTab === 'menu' && weddingData && (
                <MenuSetupManager
                  guests={weddingData.guests}
                  catering={weddingData.catering}
                  onUpdateCatering={(data) => syncUpdate('catering', data)}
                  onUpdateGuests={(data) => syncUpdate('guests', data)}
                  onOpenGuestRegistry={(mealFilter, dietFilter) => switchTab('guests', undefined, true, (mealFilter || dietFilter) ? { mealFilter, dietFilter } : undefined)}
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
                  partner1Name={partner1Name || googleUserName}
                  partner2Name={partner2Name}
                />
              )}

              {activeTab === 'budget' && weddingData && (
                <BudgetLedgerManager
                  budget={weddingData.budget}
                  expenses={weddingData.expenses || []}
                  budgetTarget={(weddingData.dashboard?.totalBudget && weddingData.dashboard.totalBudget > 0) ? weddingData.dashboard.totalBudget : (budgetThreshold > 0 ? budgetThreshold : 0)}
                  weddingDate={weddingDate || weddingData.dashboard?.weddingDate || ''}
                  onUpdateBudgetTarget={async (newTarget) => {
                    setBudgetThreshold(newTarget);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('s2v_budget_threshold', newTarget.toString());
                    }
                    if (weddingData) {
                      const updatedDash = {
                        weddingName: weddingName || weddingData.dashboard?.weddingName || '',
                        weddingDate: weddingDate || weddingData.dashboard?.weddingDate || '',
                        location: locationDetails || weddingData.dashboard?.location || '',
                        currency: currency || weddingData.dashboard?.currency || 'USD',
                        ...weddingData.dashboard,
                        totalBudget: newTarget
                      };
                      setWeddingData(prev => prev ? ({ ...prev, dashboard: updatedDash }) : prev);
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
                  vendors={weddingData.vendors}
                  onUpdate={(data) => syncUpdate('schedule', data)}
                  isSyncing={isSyncing}
                  timeFormat={timeFormat}
                  partner1Name={partner1Name || googleUserName}
                  partner2Name={partner2Name}
                />
              )}

              {activeTab === 'vendors' && weddingData && (
                <VendorManager
                  vendors={weddingData.vendors}
                  budget={weddingData.budget}
                  expenses={weddingData.expenses || []}
                  onUpdate={(data) => syncUpdate('vendors', data)}
                  onUpdateBudget={(data) => syncUpdate('budget', data)}
                  onUpdateExpenses={(data) => syncUpdate('expenses', data)}
                  isSyncing={isSyncing}
                  currency={currency}
                  spreadsheetId={spreadsheetId}
                  weddingName={weddingName}
                  driveFolder={driveFolder}
                  onOpenShareModal={() => setShowShareModal(true)}
                />
              )}

              {activeTab === 'tasks' && weddingData && (
                <KanbanBoard
                  tasks={weddingData.tasks}
                  onUpdate={(data) => syncUpdate('tasks', data)}
                  isSyncing={isSyncing}
                  initialStage={taskInitialFilter}
                  partner1Name={partner1Name || googleUserName}
                  partner2Name={partner2Name}
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
                  guestbook={weddingData.guestbook || []}
                  onUpdatePhotos={(data: PhotoShot[]) => syncUpdate('photos', data)}
                  onUpdateGuestbook={(data: GuestbookEntry[]) => syncUpdate('guestbook', data)}
                  isSyncing={isSyncing}
                  spreadsheetId={spreadsheetId}
                  weddingName={weddingName}
                  googleToken={googleToken}
                  googleUserEmail={googleUserEmail}
                  driveFolder={driveFolder}
                  onOpenGoogleAuth={handleDirectGoogleAuth}
                />
              )}

              {activeTab === 'thanks' && weddingData && (
                <ThankYouManager
                  gifts={weddingData.gifts || []}
                  guests={weddingData.guests || []}
                  currency={currency}
                  weddingName={weddingName}
                  onUpdateGifts={(data: GiftItem[]) => syncUpdate('gifts', data)}
                  onUpdateGuests={(data: Guest[]) => syncUpdate('guests', data)}
                  isSyncing={isSyncing}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsManager
                  spreadsheetId={spreadsheetId}
                  weddingName={weddingName}
                  weddingDate={weddingDate}
                  locationDetails={locationDetails || weddingData?.dashboard?.location || ''}
                  totalBudget={budgetThreshold || weddingData?.dashboard?.totalBudget}
                  driveFolder={driveFolder}
                  enabledModules={enabledModules}
                  isMockMode={isMockMode}
                  styleTheme={styleTheme}
                  theme={theme}
                  primaryColor={primaryColor}
                  timeFormat={timeFormat}
                  currency={currency}
                  showTopNav={showTopNav}
                  initialSection={settingsInitialSection}
                  isMobile={isMobile}
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
                  onToggleTopNav={handleToggleTopNav}
                  onDisconnect={() => setShowDisconnectModal(true)}
                  onOpenShareModal={() => setShowShareModal(true)}
                  coPlanners={coPlanners}
                  onUpdateCoPlanners={(c) => setCoPlanners(c)}
                  onBack={() => switchTab('home')}
                  onRestartSetup={() => {
                    setIsOnboarded(false);
                    setIsDemoMode(false);
                    addToast('Restarted setup guide', 'info');
                  }}
                  googleUserEmail={googleUserEmail}
                  googleUserName={googleUserName}
                  googleUserAvatar={googleUserAvatar}
                  onOpenGoogleAuth={handleDirectGoogleAuth}
                  partner1Name={partner1Name || googleUserName}
                  partner2Name={partner2Name}
                  onUpdatePartnerNames={handleUpdatePartnerNames}
                  onUpdatePlanningToolsOrder={setPlanningToolsOrder}
                  onUpdateDashboardLayout={setDashboardLayout}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Ergonomic Bottom Tab Navigation Bar & Categorized Drawer */}
      {isMobile && isOnboarded && activeTab !== 'settings' && (
        <VowMobileNav
          activeTab={activeTab}
          onSwitchTab={switchTab}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onToggleDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          onCloseDrawer={() => setIsMobileDrawerOpen(false)}
          enabledModules={enabledModules}
          onOpenShareModal={() => setShowShareModal(true)}
          onOpenSettings={() => switchTab('settings')}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onTouchStart={handleBottomNavTouchStart}
          onTouchEnd={handleBottomNavTouchEnd}
          triggerHaptic={triggerHaptic}
          weddingName={weddingName || weddingData?.dashboard?.weddingName}
          weddingDate={weddingDate || weddingData?.dashboard?.weddingDate}
          guestCount={weddingData?.guests?.length}
          rsvpAttendingCount={
            weddingData?.guests?.filter((g) => g.rsvpStatus === 'Attending').length
          }
          tablesCount={weddingData?.tables?.length}
          menuCoursesCount={weddingData?.catering?.length}
          budgetTotal={budgetThreshold || Number(weddingData?.dashboard?.totalBudget) || undefined}
          budgetSpent={weddingData?.expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)}
          currency={currency}
          scheduleEventsCount={weddingData?.schedule?.length}
          vendorsCount={weddingData?.vendors?.length}
          tasksPendingCount={weddingData?.tasks?.filter((t) => t.kanbanStage !== 'Done').length}
          musicTracksCount={weddingData?.music?.length}
          photosCount={weddingData?.photos?.length}
          giftsCount={weddingData?.gifts?.length}
          styleTheme={styleTheme}
          planningToolsOrder={planningToolsOrder}
        />
      )}


      {/* Universal Command Palette [Monarch UX] */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        guests={weddingData?.guests}
        vendors={weddingData?.vendors}
        budget={weddingData?.budget}
        expenses={weddingData?.expenses}
        tasks={weddingData?.tasks}
        music={weddingData?.music}
        currency={currency}
        onNavigateTab={(tab, filter) => {
          switchTab(tab as any, filter);
        }}
        onOpenSettings={(section) => {
          switchTab('settings', section);
        }}
        onToggleTheme={handleToggleTheme}
        onExportCSV={handleExportActiveCSV}
      />

      {/* Toast Notification Container [GEN-3] */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} styleTheme={styleTheme} isMobile={isMobile} />

      {/* Persistent New Version Available Update Toast [SYS-UPDATE-TOAST] */}
      <AppUpdateToast styleTheme={styleTheme} isMobile={isMobile} />

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
          .app-brand-header {
            margin-left: -1.5rem !important;
            margin-right: -1.5rem !important;
            padding-left: 1.25rem !important;
            padding-right: 1.25rem !important;
            width: calc(100% + 3rem) !important;
            box-sizing: border-box !important;
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
