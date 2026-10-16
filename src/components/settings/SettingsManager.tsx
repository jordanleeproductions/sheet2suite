'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ModuleConfig } from '@/components/DashboardMetrics';
import {
  Heart,
  Palette,
  Sliders,
  HardDrive,
  Lock,
  Bell,
  User,
  Check,
  CheckCircle2,
  ExternalLink,
  Copy,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  Sparkles,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Minus,
  Plus,
  UserPlus,
  LifeBuoy,
} from 'lucide-react';
import { CURRENCY_OPTIONS, CurrencyCode } from '@/lib/currency';
import { getColorPresets } from '@/lib/themePresets';
import { DashboardSectionConfig, loadDashboardLayout, saveDashboardLayout } from '@/lib/dashboardLayout';
import { useSheet2Theme } from '@/lib/core/theme/ThemeProvider';

export interface SettingsManagerProps {
  spreadsheetId: string;
  weddingName: string;
  weddingDate: string;
  locationDetails?: string;
  totalBudget?: number;
  driveFolder: string;
  enabledModules: ModuleConfig;
  isMockMode: boolean;
  styleTheme: 'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo';
  theme: 'light' | 'dark';
  primaryColor?: string;
  timeFormat: '12h' | '24h';
  currency?: string;
  showTopNav?: boolean;
  initialSection?: string;
  isMobile?: boolean;
  onUpdateWeddingDetails: (name: string, date: string, location?: string, budget?: number) => Promise<void>;
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
  onBack?: () => void;
  onRestartSetup?: () => void;
  googleUserEmail?: string;
  googleUserName?: string;
  googleUserAvatar?: string;
  onOpenGoogleAuth?: () => void;
}

export type SettingsSection =
  | 'wedding'
  | 'appearance'
  | 'tools'
  | 'sharing'
  | 'data'
  | 'notifications'
  | 'help'
  | 'account';

interface NavSectionMeta {
  id: SettingsSection;
  title: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

const SECTIONS: NavSectionMeta[] = [
  { id: 'wedding', title: 'Wedding', icon: Heart },
  { id: 'appearance', title: 'Appearance', icon: Palette },
  { id: 'tools', title: 'Planning tools', icon: Sliders },
  { id: 'sharing', title: 'Sharing & privacy', icon: Lock },
  { id: 'data', title: 'Data & backup', icon: HardDrive },
  { id: 'notifications', title: 'Notifications', icon: Bell },
  { id: 'help', title: 'Help', icon: LifeBuoy },
  { id: 'account', title: 'Account', icon: User },
];

export default function SettingsManager({
  spreadsheetId,
  weddingName: initialName,
  weddingDate: initialDate,
  locationDetails: initialLocation = '',
  totalBudget: initialBudget,
  driveFolder,
  enabledModules,
  isMockMode,
  styleTheme,
  theme,
  primaryColor,
  timeFormat,
  currency = 'USD',
  showTopNav = false,
  initialSection = 'wedding',
  isMobile = false,
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
  onBack,
  onRestartSetup,
  googleUserEmail,
  googleUserName,
  googleUserAvatar,
  onOpenGoogleAuth,
}: SettingsManagerProps) {
  const { fontSizeScale, setFontSizeScale } = useSheet2Theme();

  // Responsive mobile viewport detection
  const [isViewportMobile, setIsViewportMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return isMobile || window.innerWidth <= 768;
    }
    return isMobile;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsViewportMobile(isMobile || window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Section normalizer
  const normalizeSection = (sec?: string): SettingsSection => {
    if (!sec) return 'wedding';
    const s = sec.toLowerCase();
    if (s === 'wedding' || s === 'details') return 'wedding';
    if (s === 'appearance' || s === 'visual') return 'appearance';
    if (s === 'tools' || s === 'modules') return 'tools';
    if (s === 'sharing' || s === 'security') return 'sharing';
    if (s === 'data' || s === 'drive') return 'data';
    if (s === 'notifications') return 'notifications';
    if (s === 'help' || s === 'feedback') return 'help';
    if (s === 'account') return 'account';
    return 'wedding';
  };

  // Desktop active section state
  const [activeSection, setActiveSection] = useState<SettingsSection>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('section');
      if (param) return normalizeSection(param);
    }
    return normalizeSection(initialSection);
  });

  // Mobile drill-down subview state (null = index page, string = detail view)
  const [mobileSubView, setMobileSubView] = useState<SettingsSection | null>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('section');
      if (param) return normalizeSection(param);
    }
    return initialSection && initialSection !== 'wedding' ? normalizeSection(initialSection) : null;
  });

  // Form state for Wedding details
  const initialRef = useRef({
    name: initialName || 'Our Wedding',
    date: initialDate || '',
    location: initialLocation || '',
    budget: initialBudget ?? '',
  });

  useEffect(() => {
    initialRef.current = {
      name: initialName || 'Our Wedding',
      date: initialDate || '',
      location: initialLocation || '',
      budget: initialBudget ?? '',
    };
  }, [initialName, initialDate, initialLocation, initialBudget]);

  const [weddingName, setWeddingName] = useState(initialName || 'Our Wedding');
  const [weddingDate, setWeddingDate] = useState(initialDate || '');
  const [locationDetails, setLocationDetails] = useState(initialLocation || '');
  const [totalBudget, setTotalBudget] = useState<number | string>(initialBudget ?? '');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // Dirty state calculation
  const isWeddingDirty =
    weddingName.trim() !== initialRef.current.name.trim() ||
    weddingDate !== initialRef.current.date ||
    locationDetails.trim() !== initialRef.current.location.trim() ||
    String(totalBudget) !== String(initialRef.current.budget);

  // Unsaved changes confirmation dialog state
  const [pendingNavigationSection, setPendingNavigationSection] = useState<SettingsSection | 'back' | null>(null);
  const [showUnsavedGuardModal, setShowUnsavedGuardModal] = useState(false);

  // Quiet "Saved" flash indicators for low-risk settings
  const [quietSavedSection, setQuietSavedSection] = useState<string | null>(null);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return 'Just now';
  });

  const updateLastSaved = () => {
    if (typeof window !== 'undefined') {
      setLastSavedTimestamp(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    }
  };

  const triggerQuietSaved = (secName: string) => {
    setQuietSavedSection(secName);
    updateLastSaved();
    setTimeout(() => {
      setQuietSavedSection((curr) => (curr === secName ? null : curr));
    }, 2000);
  };

  // Browser beforeunload unsaved changes guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isWeddingDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isWeddingDirty]);

  // Section switcher with unsaved changes guard
  const handleSelectSection = (nextSection: SettingsSection) => {
    if (nextSection === activeSection) return;

    if (activeSection === 'wedding' && isWeddingDirty) {
      setPendingNavigationSection(nextSection);
      setShowUnsavedGuardModal(true);
      return;
    }

    commitSectionChange(nextSection);
  };

  const commitSectionChange = (nextSection: SettingsSection) => {
    setActiveSection(nextSection);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('section', nextSection);
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
      } catch (_) {}
    }
  };

  // Mobile Drill-down handlers
  const handleMobileDrillDown = (secId: SettingsSection) => {
    setMobileSubView(secId);
    setActiveSection(secId);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('section', secId);
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
      } catch (_) {}
    }
  };

  const handleMobileBackToIndex = () => {
    if (mobileSubView === 'wedding' && isWeddingDirty) {
      setPendingNavigationSection('back');
      setShowUnsavedGuardModal(true);
      return;
    }

    setMobileSubView(null);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('section');
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
      } catch (_) {}
    }
  };

  const handleDiscardDetails = () => {
    setWeddingName(initialRef.current.name);
    setWeddingDate(initialRef.current.date);
    setLocationDetails(initialRef.current.location);
    setTotalBudget(initialRef.current.budget);
  };

  const handleSaveDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingDetails(true);
    try {
      const budgetNum = totalBudget !== '' && !isNaN(Number(totalBudget)) ? Number(totalBudget) : undefined;
      await onUpdateWeddingDetails(weddingName, weddingDate, locationDetails, budgetNum);
      initialRef.current = {
        name: weddingName,
        date: weddingDate,
        location: locationDetails,
        budget: totalBudget,
      };
      triggerQuietSaved('wedding');
    } catch (err) {
      console.error('Error saving wedding details:', err);
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Partner Co-Planner state
  const [coPlannersList, setCoPlannersList] = useState<string[]>(initialCoPlanners || []);
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [isInvitingPartner, setIsInvitingPartner] = useState(false);
  const [partnerMsg, setPartnerMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (initialCoPlanners) setCoPlannersList(initialCoPlanners);
  }, [initialCoPlanners]);

  const handleInvitePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newPartnerEmail.trim();
    if (!email) return;

    setIsInvitingPartner(true);
    setPartnerMsg(null);
    try {
      const res = await fetch('/api/share/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId, partnerEmail: email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send partner invite');
      }
      const updated = [...coPlannersList, email];
      setCoPlannersList(updated);
      if (onUpdateCoPlanners) onUpdateCoPlanners(updated);
      setPartnerMsg({ text: `Invitation sent to ${email}`, isError: false });
      setNewPartnerEmail('');
      triggerQuietSaved('sharing');
    } catch (err: any) {
      setPartnerMsg({ text: err.message || 'Error inviting partner', isError: true });
    } finally {
      setIsInvitingPartner(false);
    }
  };

  const handleRevokePartner = async (emailToRevoke: string) => {
    try {
      const res = await fetch(
        `/api/share/partner?spreadsheetId=${spreadsheetId}&partnerEmail=${encodeURIComponent(emailToRevoke)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to revoke partner access');
      }
      const updated = coPlannersList.filter((e) => e.toLowerCase() !== emailToRevoke.toLowerCase());
      setCoPlannersList(updated);
      if (onUpdateCoPlanners) onUpdateCoPlanners(updated);
      setPartnerMsg({ text: `Revoked access for ${emailToRevoke}`, isError: false });
      triggerQuietSaved('sharing');
    } catch (err: any) {
      setPartnerMsg({ text: err.message || 'Error revoking partner', isError: true });
    }
  };

  // Dashboard section ordering state
  const [dashSections, setDashSections] = useState<DashboardSectionConfig[]>(() => loadDashboardLayout());
  const moveDashSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dashSections.length) return;
    const updated = [...dashSections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setDashSections(updated);
    saveDashboardLayout(updated);
    triggerQuietSaved('tools');
  };

  // Reorderable Planning Tools state
  const DEFAULT_PLANNING_TOOLS: Array<{ key: keyof ModuleConfig; label: string; desc: string }> = [
    { key: 'guests', label: 'Guest list & RSVPs', desc: 'Guest directory, plus-ones, dietary tags, and RSVP statuses.' },
    { key: 'menu', label: 'Menu & catering', desc: 'Hors d\'oeuvres, dinner courses, wine pairings, and dietary requirements.' },
    { key: 'tables', label: 'Seating chart', desc: 'Interactive floorplan table seating, guest assignment, and ceremony rows.' },
    { key: 'budget', label: 'Budget & expenses', desc: 'Categorized financial ledger, payment due dates, and expense logging.' },
    { key: 'schedule', label: 'Timeline & run of show', desc: 'Sequential day-of itinerary, rehearsal details, and run of show.' },
    { key: 'vendors', label: 'Vendors & contracts', desc: 'Vendor directory, coordinator contacts, and balance tracker.' },
    { key: 'tasks', label: 'Kanban tasks', desc: 'Visual task planning board organized by milestone timeline.' },
    { key: 'music', label: 'Music & playlists', desc: 'Ceremony, cocktail hour, and dance floor music playlists.' },
    { key: 'photos', label: 'Photography shot list', desc: 'Must-have photo shot list with VIP badges and coordinator export.' },
    { key: 'gifts', label: 'Gifts & thank you tracker', desc: 'Log wedding gifts received and track personalized thank you card notes.' },
  ];

  const [planningToolsList, setPlanningToolsList] = useState<Array<{ key: keyof ModuleConfig; label: string; desc: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('s2v_planning_tools_order');
        if (saved) {
          const parsedKeys: string[] = JSON.parse(saved);
          const sorted: Array<{ key: keyof ModuleConfig; label: string; desc: string }> = [];
          parsedKeys.forEach((k) => {
            const found = DEFAULT_PLANNING_TOOLS.find((t) => t.key === k);
            if (found) sorted.push(found);
          });
          DEFAULT_PLANNING_TOOLS.forEach((t) => {
            if (!sorted.some((s) => s.key === t.key)) sorted.push(t);
          });
          return sorted;
        }
      } catch (_) {}
    }
    return DEFAULT_PLANNING_TOOLS;
  });

  const movePlanningTool = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= planningToolsList.length) return;
    const updated = [...planningToolsList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setPlanningToolsList(updated);
    try {
      localStorage.setItem('s2v_planning_tools_order', JSON.stringify(updated.map((t) => t.key)));
    } catch (_) {}
    triggerQuietSaved('tools');
  };

  // Notification toggles state (persisted to localStorage)
  const [notifyToasts, setNotifyToasts] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('s2v_notify_toasts');
      return val !== 'false';
    }
    return true;
  });

  const [notifyRsvp, setNotifyRsvp] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('s2v_notify_rsvp');
      return val !== 'false';
    }
    return true;
  });

  const [notifyBudget, setNotifyBudget] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('s2v_notify_budget');
      return val !== 'false';
    }
    return true;
  });

  const [notifyMilestones, setNotifyMilestones] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('s2v_notify_milestones');
      return val !== 'false';
    }
    return true;
  });

  const handleToggleNotification = (key: 'toasts' | 'rsvp' | 'budget' | 'milestones', curr: boolean) => {
    const next = !curr;
    if (key === 'toasts') {
      setNotifyToasts(next);
      localStorage.setItem('s2v_notify_toasts', String(next));
    } else if (key === 'rsvp') {
      setNotifyRsvp(next);
      localStorage.setItem('s2v_notify_rsvp', String(next));
    } else if (key === 'budget') {
      setNotifyBudget(next);
      localStorage.setItem('s2v_notify_budget', String(next));
    } else if (key === 'milestones') {
      setNotifyMilestones(next);
      localStorage.setItem('s2v_notify_milestones', String(next));
    }
    triggerQuietSaved('notifications');
  };

  // Help & feedback state
  const [feedbackType, setFeedbackType] = useState<'feature' | 'bug'>('feature');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    const subject = encodeURIComponent(`Sheet2Vow [${feedbackType.toUpperCase()}]: ${weddingName}`);
    const body = encodeURIComponent(
      `Type: ${feedbackType.toUpperCase()}\n` +
        `Wedding: ${weddingName}\n` +
        `Spreadsheet ID: ${spreadsheetId || 'N/A'}\n` +
        `Theme: ${styleTheme} (${theme})\n` +
        `URL: ${typeof window !== 'undefined' ? window.location.href : ''}\n\n` +
        `Details:\n${feedbackMessage}`
    );

    window.open(`mailto:support@germin8.io?subject=${subject}&body=${body}`, '_blank');
    setFeedbackSent(true);
    setFeedbackMessage('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  // Clipboard copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // User initials avatar generator
  const getInitials = (name?: string, email?: string): string => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim().slice(0, 2).toUpperCase();
    }
    return 'OW';
  };

  const userInitials = getInitials(googleUserName || weddingName, googleUserEmail);

  // Computed metrics for secondary previews
  const activeToolsCount = Object.values(enabledModules).filter(Boolean).length;
  const activeRemindersCount = [notifyToasts, notifyRsvp, notifyBudget, notifyMilestones].filter(Boolean).length;
  const activeLinkCount = (coPlannersList.length || 0) + (spreadsheetId ? 3 : 1);
  const styleLabels: Record<string, string> = {
    editorial: 'Editorial',
    'neo-brutalism': 'Modern',
    'botanical-romance': 'Botanical',
    'midnight-tuxedo': 'Formal',
  };

  const formattedDate = weddingDate
    ? new Date(weddingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date pending';

  /* -------------------------------------------------------------------------- */
  /*  RENDER HELPER: FORM CONTENT FOR A GIVEN SECTION                           */
  /* -------------------------------------------------------------------------- */
  const renderSectionForm = (secId: SettingsSection, isMobileView: boolean) => {
    switch (secId) {
      case 'wedding':
        return (
          <div style={isMobileView ? styles.mobileCardSurface : styles.cardSurface}>
            {!isMobileView && (
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionHeaderTitle}>Wedding details</h2>
                  <p style={styles.sectionHeaderDesc}>
                    Core event metadata, wedding title, ceremony date, venue location, and overall target budget.
                  </p>
                </div>
                {quietSavedSection === 'wedding' && (
                  <div style={styles.quietSavedBadge}>
                    <CheckCircle2 size={14} />
                    <span>Saved</span>
                  </div>
                )}
              </div>
            )}

            <div style={styles.fieldStack}>
              {/* Wedding Name */}
              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Wedding name</label>
                <input
                  type="text"
                  value={weddingName}
                  onChange={(e) => setWeddingName(e.target.value)}
                  placeholder="e.g. Sophia & Liam's Wedding"
                  style={styles.textInput}
                />
                <span style={styles.fieldHint}>
                  Used for guest invitations, printable place cards, vendor links, and your wedding dashboard.
                </span>
              </div>

              <div style={styles.dividerLine} />

              {/* Date & Budget */}
              <div style={isMobileView ? styles.fieldStack : styles.twoColRow}>
                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>Wedding date</label>
                  <input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    style={styles.textInput}
                  />
                  <span style={styles.fieldHint}>
                    Drives the milestone countdown clock on your dashboard overview.
                  </span>
                </div>

                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>Total budget</label>
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="e.g. 35000"
                    style={styles.textInput}
                    min="0"
                    step="any"
                  />
                  <span style={styles.fieldHint}>
                    Sets the overall budget cap in Financials and expense ledger progress bars.
                  </span>
                </div>
              </div>

              <div style={styles.dividerLine} />

              {/* Venue & Location */}
              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Venue & location</label>
                <input
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g. The Glasshouse, New York, NY"
                  style={styles.textInput}
                />
                <span style={styles.fieldHint}>
                  Displayed in day-of itineraries and vendor contact sheets.
                </span>
              </div>
            </div>

            {/* Sticky Save Changes Bar for Wedding Details */}
            {isWeddingDirty && (
              <div style={isMobileView ? styles.mobileStickySaveBar : styles.stickySaveBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: isMobileView ? '0.45rem' : 0 }}>
                  <span style={styles.dirtyDot} />
                  <span style={styles.stickyBarLabel}>You have unsaved changes in wedding details</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: isMobileView ? '100%' : 'auto' }}>
                  <button
                    type="button"
                    onClick={handleDiscardDetails}
                    style={{ ...styles.discardBtn, flex: isMobileView ? 1 : 'none' }}
                    disabled={isSavingDetails}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveDetails()}
                    style={{ ...styles.saveChangesBtn, flex: isMobileView ? 2 : 'none', justifyContent: 'center' }}
                    disabled={isSavingDetails}
                  >
                    {isSavingDetails ? <RefreshCw className="spin" size={13} /> : <Check size={14} />}
                    <span>{isSavingDetails ? 'Saving...' : 'Save changes'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'appearance':
        return (
          <div style={isMobileView ? styles.mobileCardSurface : styles.cardSurface}>
            {!isMobileView && (
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionHeaderTitle}>Appearance</h2>
                  <p style={styles.sectionHeaderDesc}>
                    Personalize color modes, curated typography styles, accent tones, and layout scaling.
                  </p>
                </div>
                {quietSavedSection === 'appearance' && (
                  <div style={styles.quietSavedBadge}>
                    <CheckCircle2 size={14} />
                    <span>Saved</span>
                  </div>
                )}
              </div>
            )}

            <div style={styles.fieldStack}>
              {/* Theme Mode */}
              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Color mode</label>
                <div style={styles.segmentedControl}>
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isCurrentTheme =
                      item.id === 'system'
                        ? typeof window !== 'undefined' && localStorage.getItem('s2v_theme_preference') === 'system'
                        : theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === 'system') {
                            localStorage.setItem('s2v_theme_preference', 'system');
                            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                            onUpdateTheme(isDark ? 'dark' : 'light');
                          } else {
                            localStorage.setItem('s2v_theme_preference', item.id);
                            onUpdateTheme(item.id as any);
                          }
                          triggerQuietSaved('appearance');
                        }}
                        style={{
                          ...styles.segmentedOption,
                          backgroundColor: isCurrentTheme ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                          color: isCurrentTheme ? 'var(--color-primary, #0284C7)' : 'var(--color-muted, #64748B)',
                          boxShadow: isCurrentTheme ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                          fontWeight: isCurrentTheme ? 700 : 500,
                        }}
                      >
                        <Icon size={14} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.dividerLine} />

              {/* Display Style: Visual Cards with Live Preview Swatches */}
              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Display style</label>
                <div style={styles.styleCardGrid}>
                  {[
                    {
                      id: 'editorial',
                      name: 'Editorial',
                      desc: 'Classic serif typography with soft neutral tones.',
                      swatchBg: '#FAF9F6',
                      swatchAccent: '#1E293B',
                      sampleFont: 'serif',
                      sampleText: 'Aa',
                    },
                    {
                      id: 'neo-brutalism',
                      name: 'Modern',
                      desc: 'Geist mono typography with sharp dark borders.',
                      swatchBg: '#FFFFFF',
                      swatchAccent: '#00ED64',
                      sampleFont: 'monospace',
                      sampleText: '01',
                    },
                    {
                      id: 'botanical-romance',
                      name: 'Botanical',
                      desc: 'Cormorant Garamond serif with sage natural warmth.',
                      swatchBg: '#F2F7F4',
                      swatchAccent: '#2D6A4F',
                      sampleFont: 'serif',
                      sampleText: 'Aa',
                    },
                    {
                      id: 'midnight-tuxedo',
                      name: 'Formal',
                      desc: 'Deep monochrome slate with high-contrast sharp accents.',
                      swatchBg: '#0F172A',
                      swatchAccent: '#E2E8F0',
                      sampleFont: 'serif',
                      sampleText: 'Aa',
                    },
                  ].map((item) => {
                    const isSelected = styleTheme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onUpdateStyleTheme(item.id as any);
                          triggerQuietSaved('appearance');
                        }}
                        style={{
                          ...styles.styleOptionCard,
                          borderColor: isSelected ? 'var(--color-primary, #0284C7)' : 'var(--color-border, #E2E8F0)',
                          backgroundColor: isSelected ? 'var(--color-primary-light, rgba(2, 132, 199, 0.04))' : 'var(--color-surface, #FFFFFF)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {/* Live preview swatch box */}
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              backgroundColor: item.swatchBg,
                              border: `1.5px solid ${item.id === 'neo-brutalism' ? '#0F172A' : '#E2E8F0'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: item.sampleFont,
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                color: item.id === 'midnight-tuxedo' ? '#F8FAFC' : item.swatchAccent,
                              }}
                            >
                              {item.sampleText}
                            </span>
                          </div>

                          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text, #0F172A)' }}>
                                {item.name}
                              </span>
                              {isSelected && (
                                <div style={styles.checkCirclePill}>
                                  <Check size={12} />
                                </div>
                              )}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', marginTop: '0.15rem', display: 'block', lineHeight: 1.35 }}>
                              {item.desc}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.dividerLine} />

              {/* Accent Color */}
              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Accent color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {getColorPresets(styleTheme, theme).map((preset) => {
                    const isSelected = (primaryColor || '').toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => {
                          if (onUpdatePrimaryColor) onUpdatePrimaryColor(preset.hex);
                          triggerQuietSaved('appearance');
                        }}
                        title={`${preset.name} (${preset.hex})`}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: preset.hex,
                          border: isSelected ? '2px solid var(--color-text, #0F172A)' : '2px solid transparent',
                          boxShadow: isSelected ? '0 0 0 2px var(--color-surface, #FFFFFF), 0 2px 4px rgba(0,0,0,0.15)' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                        }}
                      >
                        {isSelected && <Check size={14} style={{ color: '#FFFFFF', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.dividerLine} />

              {/* Text Size Stepper */}
              <div style={styles.formField}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={styles.fieldLabel}>Text size</label>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', color: 'var(--color-muted, #64748B)' }}>
                    {fontSizeScale}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={styles.stepperBox}>
                    <button
                      type="button"
                      onClick={() => {
                        setFontSizeScale(fontSizeScale - 5);
                        triggerQuietSaved('appearance');
                      }}
                      disabled={fontSizeScale <= 80}
                      style={styles.stepperBtn}
                      title="Decrease size"
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.78rem', fontWeight: 600, minWidth: '45px', textAlign: 'center' }}>
                      {fontSizeScale}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFontSizeScale(fontSizeScale + 5);
                        triggerQuietSaved('appearance');
                      }}
                      disabled={fontSizeScale >= 120}
                      style={styles.stepperBtn}
                      title="Increase size"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFontSizeScale(100);
                      triggerQuietSaved('appearance');
                    }}
                    style={styles.textResetBtn}
                  >
                    Reset to default (100%)
                  </button>
                </div>
              </div>

              <div style={styles.dividerLine} />

              {/* Show Wedding Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                    Show wedding header
                  </span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.2rem 0 0 0' }}>
                    Displays the centered editorial header bar with event date and countdown.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleTopNav) onToggleTopNav(!showTopNav);
                    triggerQuietSaved('appearance');
                  }}
                  style={{
                    ...styles.toggleSwitchBtn,
                    backgroundColor: showTopNav ? 'var(--color-primary, #0284C7)' : 'var(--color-border, #CBD5E1)',
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleSwitchKnob,
                      transform: showTopNav ? 'translateX(18px)' : 'translateX(0)',
                    }}
                  />
                </button>
              </div>

              <div style={styles.dividerLine} />

              {/* Currency & Time Format */}
              <div style={isMobileView ? styles.fieldStack : styles.twoColRow}>
                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      if (onUpdateCurrency) onUpdateCurrency(e.target.value);
                      triggerQuietSaved('appearance');
                    }}
                    style={styles.selectInput}
                  >
                    {CURRENCY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label} ({opt.example})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>Time format</label>
                  <div style={styles.segmentedControl}>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateTimeFormat('12h');
                        triggerQuietSaved('appearance');
                      }}
                      style={{
                        ...styles.segmentedOption,
                        backgroundColor: timeFormat === '12h' ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                        color: timeFormat === '12h' ? 'var(--color-primary, #0284C7)' : 'var(--color-muted, #64748B)',
                        boxShadow: timeFormat === '12h' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        fontWeight: timeFormat === '12h' ? 700 : 500,
                      }}
                    >
                      12-Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateTimeFormat('24h');
                        triggerQuietSaved('appearance');
                      }}
                      style={{
                        ...styles.segmentedOption,
                        backgroundColor: timeFormat === '24h' ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                        color: timeFormat === '24h' ? 'var(--color-primary, #0284C7)' : 'var(--color-muted, #64748B)',
                        boxShadow: timeFormat === '24h' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        fontWeight: timeFormat === '24h' ? 700 : 500,
                      }}
                    >
                      24-Hour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tools':
        return (
          <div style={isMobileView ? styles.mobileCardSurface : styles.cardSurface}>
            {!isMobileView && (
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionHeaderTitle}>Planning tools</h2>
                  <p style={styles.sectionHeaderDesc}>
                    Enable or disable planning modules to tailor the workspace to your wedding workflow.
                  </p>
                </div>
                {quietSavedSection === 'tools' && (
                  <div style={styles.quietSavedBadge}>
                    <CheckCircle2 size={14} />
                    <span>Saved</span>
                  </div>
                )}
              </div>
            )}

            {/* Clear Reassurance Copy Specification */}
            <div style={styles.reassuranceNoticeBox}>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text, #0F172A)', lineHeight: 1.45 }}>
                Choose which tools appear in your navigation. Turning a tool off does not delete its information.
              </span>
            </div>

            <div style={styles.fieldStack}>
              {planningToolsList.map((tool, toolIdx) => {
                const isChecked = Boolean(enabledModules[tool.key as keyof ModuleConfig]);
                return (
                  <div
                    key={tool.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.65rem',
                      minHeight: '52px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-bg, #F8FAFC)',
                      border: '1px solid var(--color-border, #E2E8F0)',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => movePlanningTool(toolIdx, 'up')}
                          disabled={toolIdx === 0}
                          style={{
                            ...styles.toolReorderBtn,
                            opacity: toolIdx === 0 ? 0.3 : 1,
                            cursor: toolIdx === 0 ? 'not-allowed' : 'pointer',
                          }}
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => movePlanningTool(toolIdx, 'down')}
                          disabled={toolIdx === planningToolsList.length - 1}
                          style={{
                            ...styles.toolReorderBtn,
                            opacity: toolIdx === planningToolsList.length - 1 ? 0.3 : 1,
                            cursor: toolIdx === planningToolsList.length - 1 ? 'not-allowed' : 'pointer',
                          }}
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                          {tool.label}
                        </span>
                        <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0 0', lineHeight: 1.35 }}>
                          {tool.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleModule(tool.key as keyof ModuleConfig);
                        triggerQuietSaved('tools');
                      }}
                      style={{
                        ...styles.toggleSwitchBtn,
                        backgroundColor: isChecked ? 'var(--color-primary, #0284C7)' : 'var(--color-border, #CBD5E1)',
                      }}
                    >
                      <div
                        style={{
                          ...styles.toggleSwitchKnob,
                          transform: isChecked ? 'translateX(18px)' : 'translateX(0)',
                        }}
                      />
                    </button>
                  </div>
                );
              })}

              <div style={styles.dividerLine} />

              {/* Reorderable Vertical Section List */}
              <div>
                <label style={styles.fieldLabel}>Dashboard overview section ordering</label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0.75rem 0' }}>
                  Reorder the summary cards on your main overview dashboard.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {dashSections.map((sec, idx) => (
                    <div
                      key={sec.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-bg, #F8FAFC)',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        minHeight: '44px',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                        {sec.label}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => moveDashSection(idx, 'up')}
                          disabled={idx === 0}
                          style={styles.reorderBtn}
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDashSection(idx, 'down')}
                          disabled={idx === dashSections.length - 1}
                          style={styles.reorderBtn}
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'sharing':
        return (
          <div style={isMobileView ? styles.mobileCardSurface : styles.cardSurface}>
            {!isMobileView && (
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionHeaderTitle}>Sharing & privacy</h2>
                  <p style={styles.sectionHeaderDesc}>
                    Invite your partner as a co-planner and share dedicated read-only links with coordinators and vendors.
                  </p>
                </div>
                {quietSavedSection === 'sharing' && (
                  <div style={styles.quietSavedBadge}>
                    <CheckCircle2 size={14} />
                    <span>Saved</span>
                  </div>
                )}
              </div>
            )}

            <div style={styles.fieldStack}>
              {/* Partner Co-Planners */}
              <div>
                <label style={styles.fieldLabel}>Partner co-planners</label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0.65rem 0' }}>
                  Grant full 2-way spreadsheet editing access to your spouse or wedding coordinator.
                </p>

                <form onSubmit={handleInvitePartner} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <input
                    type="email"
                    value={newPartnerEmail}
                    onChange={(e) => setNewPartnerEmail(e.target.value)}
                    placeholder="partner@gmail.com"
                    style={{ ...styles.textInput, flex: 1 }}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isInvitingPartner}
                    style={styles.primaryActionButton}
                  >
                    {isInvitingPartner ? <RefreshCw className="spin" size={13} /> : <UserPlus size={14} />}
                    <span>Invite</span>
                  </button>
                </form>

                {partnerMsg && (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      marginBottom: '0.75rem',
                      backgroundColor: partnerMsg.isError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      color: partnerMsg.isError ? '#DC2626' : '#059669',
                      border: `1px solid ${partnerMsg.isError ? '#FCA5A5' : '#6EE7B7'}`,
                    }}
                  >
                    {partnerMsg.text}
                  </div>
                )}

                {coPlannersList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {coPlannersList.map((email) => (
                      <div
                        key={email}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-bg, #F8FAFC)',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          minHeight: '48px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={styles.avatarCircle}>
                            {email[0].toUpperCase()}
                          </div>
                          <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.78rem', color: 'var(--color-text, #0F172A)', fontWeight: 500 }}>
                            {email}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRevokePartner(email)}
                          style={styles.destructiveTextBtn}
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyNoticeBox}>
                    No partner co-planners linked yet. Add their Google account email above.
                  </div>
                )}
              </div>

              <div style={styles.dividerLine} />

              {/* Vendor Share Portal */}
              <div>
                <label style={styles.fieldLabel}>Vendor read-only share portal</label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0.65rem 0' }}>
                  Share read-only links for day-of timeline, music playlists, or catering details without granting sheet edit access.
                </p>
                {onOpenShareModal && (
                  <button
                    type="button"
                    onClick={onOpenShareModal}
                    style={styles.secondaryActionButton}
                  >
                    <Lock size={14} />
                    <span>Open vendor share portal</span>
                  </button>
                )}
              </div>

              <div style={styles.dividerLine} />

              {/* Data Privacy Note */}
              <div style={styles.privacyNoteBox}>
                <ShieldCheck size={16} style={{ color: '#059669', flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', lineHeight: 1.4 }}>
                  <strong>Zero private database lock-in:</strong> Your wedding data lives directly in your own Google Drive spreadsheet. Sheet2Vow does not sell, mine, or store your guest lists on separate commercial servers.
                </span>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div style={isMobileView ? styles.mobileCardSurface : styles.cardSurface}>
            {!isMobileView && (
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionHeaderTitle}>Data & backup</h2>
                  <p style={styles.sectionHeaderDesc}>
                    Google Sheets master spreadsheet connection, Drive storage directory, and local CSV backups.
                  </p>
                </div>
                {quietSavedSection === 'data' && (
                  <div style={styles.quietSavedBadge}>
                    <CheckCircle2 size={14} />
                    <span>Saved</span>
                  </div>
                )}
              </div>
            )}

            <div style={styles.fieldStack}>
              {/* Google Spreadsheet Link */}
              <div>
                <label style={styles.fieldLabel}>Connected Google Spreadsheet</label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-bg, #F8FAFC)',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    marginTop: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                    <FileSpreadsheet size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                        {spreadsheetId ? (spreadsheetId.length > 24 ? `${spreadsheetId.slice(0, 22)}...` : spreadsheetId) : 'Demo Spreadsheet'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {spreadsheetId && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopy(spreadsheetId, 'sheet-id')}
                          style={styles.iconActionBtn}
                          title="Copy Spreadsheet ID"
                        >
                          {copiedKey === 'sheet-id' ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
                        </button>
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.secondaryActionButton}
                        >
                          <span>Open</span>
                          <ExternalLink size={12} />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.dividerLine} />

              {/* Google Drive Directory */}
              <div>
                <label style={styles.fieldLabel}>Google Drive storage folder</label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0.35rem 0' }}>
                  Designated Google Drive album folder where guest photos and vendor contracts are stored.
                </p>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.78rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-bg, #F8FAFC)', borderRadius: '6px', border: '1px solid var(--color-border, #E2E8F0)' }}>
                  {driveFolder || 'My Drive / Sheet2Vow'}
                </div>
              </div>

              <div style={styles.dividerLine} />

              {/* Disconnect Spreadsheet */}
              <div style={{ paddingTop: '0.5rem' }}>
                <label style={{ ...styles.fieldLabel, color: '#DC2626' }}>Disconnect spreadsheet</label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0.65rem 0' }}>
                  Disconnects your Google Drive spreadsheet session from this browser. Your master spreadsheet in Google Drive remains completely intact.
                </p>
                <button
                  type="button"
                  onClick={onDisconnect}
                  style={styles.destructiveButton}
                >
                  <Trash2 size={14} />
                  <span>Disconnect spreadsheet</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div style={isMobileView ? styles.mobileCardSurface : styles.cardSurface}>
            {!isMobileView && (
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionHeaderTitle}>Notifications</h2>
                  <p style={styles.sectionHeaderDesc}>
                    Configure in-app alert banners, toast notifications, and milestone reminders.
                  </p>
                </div>
                {quietSavedSection === 'notifications' && (
                  <div style={styles.quietSavedBadge}>
                    <CheckCircle2 size={14} />
                    <span>Saved</span>
                  </div>
                )}
              </div>
            )}

            <div style={styles.fieldStack}>
              {/* Toast Alerts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0', minHeight: '48px' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                    In-app save & sync toasts
                  </span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0 0' }}>
                    Display brief confirmation popups when edits are successfully saved to your Google Sheet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('toasts', notifyToasts)}
                  style={{
                    ...styles.toggleSwitchBtn,
                    backgroundColor: notifyToasts ? 'var(--color-primary, #0284C7)' : 'var(--color-border, #CBD5E1)',
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleSwitchKnob,
                      transform: notifyToasts ? 'translateX(18px)' : 'translateX(0)',
                    }}
                  />
                </button>
              </div>

              <div style={styles.dividerLine} />

              {/* RSVP Alerts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0', minHeight: '48px' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                    Guest RSVP alerts
                  </span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0 0' }}>
                    Highlight new guestbook messages and dietary notes on the overview dashboard.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('rsvp', notifyRsvp)}
                  style={{
                    ...styles.toggleSwitchBtn,
                    backgroundColor: notifyRsvp ? 'var(--color-primary, #0284C7)' : 'var(--color-border, #CBD5E1)',
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleSwitchKnob,
                      transform: notifyRsvp ? 'translateX(18px)' : 'translateX(0)',
                    }}
                  />
                </button>
              </div>

              <div style={styles.dividerLine} />

              {/* Budget Alerts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0', minHeight: '48px' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                    Budget cap warnings
                  </span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0 0' }}>
                    Display a warning badge when total expenses approach or exceed your target budget.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('budget', notifyBudget)}
                  style={{
                    ...styles.toggleSwitchBtn,
                    backgroundColor: notifyBudget ? 'var(--color-primary, #0284C7)' : 'var(--color-border, #CBD5E1)',
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleSwitchKnob,
                      transform: notifyBudget ? 'translateX(18px)' : 'translateX(0)',
                    }}
                  />
                </button>
              </div>

              <div style={styles.dividerLine} />

              {/* Milestone Reminders */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0', minHeight: '48px' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                    Milestone countdown cards
                  </span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0 0' }}>
                    Show remaining days countdown and 30-day preparation alerts on the summary page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification('milestones', notifyMilestones)}
                  style={{
                    ...styles.toggleSwitchBtn,
                    backgroundColor: notifyMilestones ? 'var(--color-primary, #0284C7)' : 'var(--color-border, #CBD5E1)',
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleSwitchKnob,
                      transform: notifyMilestones ? 'translateX(18px)' : 'translateX(0)',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div style={isMobileView ? styles.mobileCardSurface : styles.cardSurface}>
            {!isMobileView && (
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionHeaderTitle}>Help & support</h2>
                  <p style={styles.sectionHeaderDesc}>
                    Setup assistance, troubleshooting guides, and direct support from the Sheet2Vow team.
                  </p>
                </div>
                {quietSavedSection === 'help' && (
                  <div style={styles.quietSavedBadge}>
                    <CheckCircle2 size={14} />
                    <span>Saved</span>
                  </div>
                )}
              </div>
            )}

            <div style={styles.fieldStack}>
              {/* Restart Setup Guide */}
              {onRestartSetup && (
                <div>
                  <label style={styles.fieldLabel}>Setup guide</label>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0.5rem 0' }}>
                    Re-open the initial setup wizard to reconfigure wedding templates or explore sample demo mode.
                  </p>
                  <button
                    type="button"
                    onClick={onRestartSetup}
                    style={styles.secondaryActionButton}
                  >
                    <Sparkles size={14} style={{ color: '#F59E0B' }} />
                    <span>Restart setup guide</span>
                  </button>
                </div>
              )}

              <div style={styles.dividerLine} />

              {/* Feedback Form */}
              <div>
                <label style={styles.fieldLabel}>Direct support & feedback</label>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', margin: '0.15rem 0 0.65rem 0' }}>
                  Found a bug or have a feature idea? Send a direct note to the development team.
                </p>

                <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={styles.segmentedControl}>
                    <button
                      type="button"
                      onClick={() => setFeedbackType('feature')}
                      style={{
                        ...styles.segmentedOption,
                        backgroundColor: feedbackType === 'feature' ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                        color: feedbackType === 'feature' ? 'var(--color-primary, #0284C7)' : 'var(--color-muted, #64748B)',
                        boxShadow: feedbackType === 'feature' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        fontWeight: feedbackType === 'feature' ? 700 : 500,
                      }}
                    >
                      Feature request
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackType('bug')}
                      style={{
                        ...styles.segmentedOption,
                        backgroundColor: feedbackType === 'bug' ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                        color: feedbackType === 'bug' ? '#DC2626' : 'var(--color-muted, #64748B)',
                        boxShadow: feedbackType === 'bug' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        fontWeight: feedbackType === 'bug' ? 700 : 500,
                      }}
                    >
                      Bug report
                    </button>
                  </div>

                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Describe your suggestion or what happened..."
                    rows={3}
                    style={styles.textAreaInput}
                    required
                  />

                  <button
                    type="submit"
                    style={{ ...styles.primaryActionButton, alignSelf: 'flex-start' }}
                  >
                    <Send size={13} />
                    <span>{feedbackSent ? 'Thank you!' : 'Send feedback'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div style={isMobileView ? styles.mobileCardSurface : styles.cardSurface}>
            {!isMobileView && (
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionHeaderTitle}>Account</h2>
                  <p style={styles.sectionHeaderDesc}>
                    Active Google account authentication, session tokens, and workspace identifier.
                  </p>
                </div>
                {quietSavedSection === 'account' && (
                  <div style={styles.quietSavedBadge}>
                    <CheckCircle2 size={14} />
                    <span>Saved</span>
                  </div>
                )}
              </div>
            )}

            <div style={styles.fieldStack}>
              {/* Account Profile Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', backgroundColor: 'var(--color-bg, #F8FAFC)', borderRadius: '10px', border: '1px solid var(--color-border, #E2E8F0)' }}>
                {googleUserAvatar ? (
                  <img
                    src={googleUserAvatar}
                    alt="Profile avatar"
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ ...styles.avatarCircle, width: '42px', height: '42px', fontSize: '1.1rem' }}>
                    {(googleUserName || googleUserEmail || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text, #0F172A)' }}>
                    {googleUserName || 'Google Account'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.75rem', color: 'var(--color-muted, #64748B)' }}>
                    {googleUserEmail || 'Authenticated Session'}
                  </div>
                </div>
              </div>

              <div style={styles.dividerLine} />

              {/* Session Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={styles.fieldLabel}>Authentication & session</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={styles.authBadgePill}>
                    <ShieldCheck size={13} style={{ color: '#10B981' }} />
                    <span>Google OAuth 2.0 (Drive & Sheets)</span>
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', marginTop: '0.25rem' }}>
                  Long-lived offline refresh token configured with automatic silent token renewal.
                </span>

                {onOpenGoogleAuth && (
                  <button
                    type="button"
                    onClick={onOpenGoogleAuth}
                    style={{ ...styles.secondaryActionButton, alignSelf: 'flex-start', marginTop: '0.5rem' }}
                  >
                    <RefreshCw size={13} />
                    <span>Re-authenticate or switch account</span>
                  </button>
                )}
              </div>

              <div style={styles.dividerLine} />

              {/* Diagnostics */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-muted, #64748B)' }}>
                <span>Sheet2Vow Application Version</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>v1.2.1 (Production)</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* -------------------------------------------------------------------------- */
  /*  VIEWPORT DISPATCH: MOBILE DRILL-DOWN PATTERN VS DESKTOP 2-PANE            */
  /* -------------------------------------------------------------------------- */
  if (isViewportMobile) {
    // 1. MOBILE SETTINGS INDEX PAGE
    if (mobileSubView === null) {
      return (
        <div className="mobile-settings-index" style={styles.mobileContainer}>
          {/* Top App Bar */}
          <div style={styles.mobileAppBar}>
            <button
              type="button"
              onClick={() => {
                if (onBack) {
                  onBack();
                } else if (typeof window !== 'undefined') {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = '/vow';
                  }
                }
              }}
              title="Return to previous view"
              style={styles.mobileBackBtn}
            >
              <ArrowLeft size={18} />
            </button>
            <h1 style={styles.mobileAppBarTitle}>Settings</h1>
            <div style={{ width: '32px' }} />
          </div>

          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* User Summary Header Card */}
            <div style={styles.mobileUserCard}>
              {googleUserAvatar ? (
                <img
                  src={googleUserAvatar}
                  alt="Profile"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ ...styles.avatarCircle, width: '48px', height: '48px', fontSize: '1.15rem' }}>
                  {userInitials}
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text, #0F172A)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {googleUserName || weddingName || 'Our Wedding'}
                </div>
                <div style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.75rem', color: 'var(--color-muted, #64748B)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {googleUserEmail || 'Connected via Google Drive'}
                </div>
              </div>
            </div>

            {/* GROUP 1: YOUR WEDDING */}
            <div>
              <div style={styles.mobileGroupLabel}>YOUR WEDDING</div>
              <div style={styles.mobileGroupCard}>
                <button
                  type="button"
                  onClick={() => handleMobileDrillDown('wedding')}
                  style={styles.mobileRowItem}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ ...styles.mobileIconBadge, backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#DC2626' }}>
                      <Heart size={16} />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={styles.mobileRowTitle}>Wedding details</div>
                      <div style={styles.mobileRowSecondary}>{weddingName} · {formattedDate}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-muted, #94A3B8)', flexShrink: 0 }} />
                </button>
              </div>
            </div>

            {/* GROUP 2: PREFERENCES */}
            <div>
              <div style={styles.mobileGroupLabel}>PREFERENCES</div>
              <div style={styles.mobileGroupCard}>
                <button
                  type="button"
                  onClick={() => handleMobileDrillDown('appearance')}
                  style={{ ...styles.mobileRowItem, borderBottom: '1px solid var(--color-border, #E2E8F0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ ...styles.mobileIconBadge, backgroundColor: 'rgba(2, 132, 199, 0.08)', color: '#0284C7' }}>
                      <Palette size={16} />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={styles.mobileRowTitle}>Appearance</div>
                      <div style={styles.mobileRowSecondary}>{styleLabels[styleTheme] || 'Editorial'} · {theme === 'dark' ? 'Dark' : 'Light'}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-muted, #94A3B8)', flexShrink: 0 }} />
                </button>

                <button
                  type="button"
                  onClick={() => handleMobileDrillDown('notifications')}
                  style={styles.mobileRowItem}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ ...styles.mobileIconBadge, backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#D97706' }}>
                      <Bell size={16} />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={styles.mobileRowTitle}>Notifications</div>
                      <div style={styles.mobileRowSecondary}>{activeRemindersCount} active reminders</div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-muted, #94A3B8)', flexShrink: 0 }} />
                </button>
              </div>
            </div>

            {/* GROUP 3: PLANNING */}
            <div>
              <div style={styles.mobileGroupLabel}>PLANNING</div>
              <div style={styles.mobileGroupCard}>
                <button
                  type="button"
                  onClick={() => handleMobileDrillDown('tools')}
                  style={{ ...styles.mobileRowItem, borderBottom: '1px solid var(--color-border, #E2E8F0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ ...styles.mobileIconBadge, backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#7C3AED' }}>
                      <Sliders size={16} />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={styles.mobileRowTitle}>Planning tools</div>
                      <div style={styles.mobileRowSecondary}>{activeToolsCount} active tools</div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-muted, #94A3B8)', flexShrink: 0 }} />
                </button>

                <button
                  type="button"
                  onClick={() => handleMobileDrillDown('sharing')}
                  style={styles.mobileRowItem}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ ...styles.mobileIconBadge, backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#059669' }}>
                      <Lock size={16} />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={styles.mobileRowTitle}>Sharing & privacy</div>
                      <div style={styles.mobileRowSecondary}>{activeLinkCount} active links</div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-muted, #94A3B8)', flexShrink: 0 }} />
                </button>
              </div>
            </div>

            {/* GROUP 4: DATA */}
            <div>
              <div style={styles.mobileGroupLabel}>DATA</div>
              <div style={styles.mobileGroupCard}>
                <button
                  type="button"
                  onClick={() => handleMobileDrillDown('data')}
                  style={styles.mobileRowItem}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ ...styles.mobileIconBadge, backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#2563EB' }}>
                      <HardDrive size={16} />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={styles.mobileRowTitle}>Data & backup</div>
                      <div style={styles.mobileRowSecondary}>Synced · {lastSavedTimestamp}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-muted, #94A3B8)', flexShrink: 0 }} />
                </button>
              </div>
            </div>

            {/* GROUP 5: SUPPORT */}
            <div>
              <div style={styles.mobileGroupLabel}>SUPPORT</div>
              <div style={styles.mobileGroupCard}>
                <button
                  type="button"
                  onClick={() => handleMobileDrillDown('help')}
                  style={{ ...styles.mobileRowItem, borderBottom: '1px solid var(--color-border, #E2E8F0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ ...styles.mobileIconBadge, backgroundColor: 'rgba(234, 88, 12, 0.08)', color: '#EA580C' }}>
                      <LifeBuoy size={16} />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={styles.mobileRowTitle}>Help</div>
                      <div style={styles.mobileRowSecondary}>Setup guide, troubleshooting & support</div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-muted, #94A3B8)', flexShrink: 0 }} />
                </button>

                <button
                  type="button"
                  onClick={() => handleMobileDrillDown('account')}
                  style={styles.mobileRowItem}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ ...styles.mobileIconBadge, backgroundColor: 'rgba(71, 85, 105, 0.08)', color: '#475569' }}>
                      <User size={16} />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={styles.mobileRowTitle}>Account</div>
                      <div style={styles.mobileRowSecondary}>{googleUserEmail || 'Google OAuth 2.0 session'}</div>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--color-muted, #94A3B8)', flexShrink: 0 }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. MOBILE DETAIL VIEW
    const activeMeta = SECTIONS.find((s) => s.id === mobileSubView);
    return (
      <div className="mobile-settings-detail" style={styles.mobileContainer}>
        {/* Top App Bar with < Settings Back Button */}
        <div style={styles.mobileAppBar}>
          <button
            type="button"
            onClick={handleMobileBackToIndex}
            style={styles.mobileDetailBackBtn}
          >
            <ChevronLeft size={20} />
            <span>Settings</span>
          </button>
          <h2 style={styles.mobileAppBarDetailTitle}>
            {activeMeta?.title || 'Settings'}
          </h2>
          <div style={{ width: '48px' }} />
        </div>

        {/* Full-Screen Detail Form Container */}
        <div style={{ padding: '1rem', paddingBottom: '6rem' }}>
          {renderSectionForm(mobileSubView, true)}
        </div>

        {/* Lightweight Unsaved Changes Guard Modal on Mobile */}
        {showUnsavedGuardModal && pendingNavigationSection && (
          <div style={styles.guardModalBackdrop}>
            <div style={styles.guardModalCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={styles.guardAlertIcon}>
                  <AlertCircle size={20} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <h3 style={styles.guardModalTitle}>Unsaved changes</h3>
                  <p style={styles.guardModalText}>
                    You have unsaved changes in wedding details. If you leave now, your edits will be lost.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedGuardModal(false);
                    setPendingNavigationSection(null);
                  }}
                  style={styles.guardCancelBtn}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDiscardDetails();
                    setShowUnsavedGuardModal(false);
                    if (pendingNavigationSection === 'back') {
                      setMobileSubView(null);
                    } else {
                      commitSectionChange(pendingNavigationSection);
                    }
                    setPendingNavigationSection(null);
                  }}
                  style={styles.guardDiscardBtn}
                >
                  Discard & leave
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveDetails();
                    setShowUnsavedGuardModal(false);
                    if (pendingNavigationSection === 'back') {
                      setMobileSubView(null);
                    } else {
                      commitSectionChange(pendingNavigationSection);
                    }
                    setPendingNavigationSection(null);
                  }}
                  style={styles.guardSaveBtn}
                >
                  Save & leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*  DESKTOP VIEW: 2-PANE SPLIT LAYOUT (960px–1040px)                          */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="settings-desktop-workspace" style={styles.workspaceWrapper}>
      <div style={styles.contentContainer}>
        {/* Workspace Top Header */}
        <div style={styles.workspaceHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                title="Return to dashboard"
                style={styles.backButton}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}
            <div>
              <h1 style={styles.pageTitle}>Settings</h1>
              <p style={styles.pageSubtitle}>
                Manage your wedding details, appearance, planning tools, and connected Google Drive sheets.
              </p>
            </div>
          </div>

          {/* Quiet Status Pill */}
          <div style={styles.statusPill}>
            {quietSavedSection ? (
              <>
                <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                <span style={{ color: '#10B981' }}>Saved</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} style={{ color: '#64748B' }} />
                <span>All changes saved</span>
              </>
            )}
          </div>
        </div>

        {/* Two-Pane Split Layout */}
        <div style={styles.twoPaneGrid}>
          {/* Left Sidebar Navigation (~220px) */}
          <aside style={styles.navSidebar}>
            <div style={styles.navCard}>
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                const preview =
                  sec.id === 'wedding'
                    ? formattedDate
                    : sec.id === 'appearance'
                    ? `${styleLabels[styleTheme] || 'Editorial'} · ${theme === 'dark' ? 'Dark' : 'Light'}`
                    : sec.id === 'tools'
                    ? `${activeToolsCount} tools active`
                    : sec.id === 'sharing'
                    ? coPlannersList.length > 0 ? `${coPlannersList.length} co-planners` : 'Private link'
                    : sec.id === 'data'
                    ? isMockMode ? 'Demo workspace' : spreadsheetId ? 'Sheet connected' : 'Not connected'
                    : sec.id === 'notifications'
                    ? `${activeRemindersCount} alerts active`
                    : sec.id === 'help'
                    ? 'Guides & support'
                    : sec.id === 'account'
                    ? googleUserEmail ? (googleUserEmail.length > 18 ? googleUserEmail.slice(0, 16) + '...' : googleUserEmail) : 'Google session'
                    : '';

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleSelectSection(sec.id)}
                    style={{
                      ...styles.navItemBtn,
                      backgroundColor: isActive
                        ? 'var(--color-primary-light, rgba(2, 132, 199, 0.08))'
                        : 'transparent',
                      borderLeft: isActive
                        ? '3px solid var(--color-primary, #0284C7)'
                        : '3px solid transparent',
                      color: isActive
                        ? 'var(--color-primary, #0284C7)'
                        : 'var(--color-text, #0F172A)',
                    }}
                  >
                    <Icon
                      size={16}
                      style={{
                        color: isActive
                          ? 'var(--color-primary, #0284C7)'
                          : 'var(--color-muted, #64748B)',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' }}>
                      <span style={{ ...styles.navItemTitle, fontWeight: isActive ? 700 : 500 }}>
                        {sec.title}
                      </span>
                      {preview && (
                        <span style={styles.navItemPreview}>
                          {preview}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Content Area (~680px) */}
          <main style={styles.formContentArea}>
            {renderSectionForm(activeSection, false)}
          </main>
        </div>
      </div>

      {/* Lightweight Unsaved Changes Guard Modal on Desktop */}
      {showUnsavedGuardModal && pendingNavigationSection && (
        <div style={styles.guardModalBackdrop}>
          <div style={styles.guardModalCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={styles.guardAlertIcon}>
                <AlertCircle size={20} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <h3 style={styles.guardModalTitle}>Unsaved changes</h3>
                <p style={styles.guardModalText}>
                  You have unsaved changes in wedding details. If you leave now, your edits will be lost.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedGuardModal(false);
                  setPendingNavigationSection(null);
                }}
                style={styles.guardCancelBtn}
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDiscardDetails();
                  setShowUnsavedGuardModal(false);
                  if (pendingNavigationSection !== 'back') {
                    commitSectionChange(pendingNavigationSection);
                  }
                  setPendingNavigationSection(null);
                }}
                style={styles.guardDiscardBtn}
              >
                Discard & leave
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleSaveDetails();
                  setShowUnsavedGuardModal(false);
                  if (pendingNavigationSection !== 'back') {
                    commitSectionChange(pendingNavigationSection);
                  }
                  setPendingNavigationSection(null);
                }}
                style={styles.guardSaveBtn}
              >
                Save & leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Crisp, restrained styling system
const styles: Record<string, React.CSSProperties> = {
  // Mobile Drill-Down Styles
  mobileContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg, #F8FAFC)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  mobileAppBar: {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 1rem',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    borderBottom: '1px solid var(--color-border, #E2E8F0)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  mobileBackBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text, #0F172A)',
    cursor: 'pointer',
  },
  mobileAppBarTitle: {
    fontFamily: 'var(--font-editorial-serif, serif)',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--color-primary, #0F172A)',
    margin: 0,
    letterSpacing: '-0.015em',
  },
  mobileDetailBackBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    background: 'none',
    border: 'none',
    color: 'var(--color-primary, #0284C7)',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '0.2rem 0',
  },
  mobileAppBarDetailTitle: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.92rem',
    fontWeight: 700,
    color: 'var(--color-text, #0F172A)',
    margin: 0,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  mobileUserCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '1rem',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    borderRadius: '12px',
    border: '1px solid var(--color-border, #E2E8F0)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  mobileGroupLabel: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-muted, #64748B)',
    padding: '0 0.25rem 0.4rem 0.25rem',
  },
  mobileGroupCard: {
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    borderRadius: '12px',
    border: '1px solid var(--color-border, #E2E8F0)',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  mobileRowItem: {
    width: '100%',
    minHeight: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    transition: 'background-color 0.1s ease',
  },
  mobileIconBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mobileRowTitle: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text, #0F172A)',
  },
  mobileRowSecondary: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.72rem',
    color: 'var(--color-muted, #64748B)',
    marginTop: '0.1rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '220px',
  },
  mobileCardSurface: {
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    padding: '1.25rem 1rem',
    position: 'relative',
  },
  mobileStickySaveBar: {
    position: 'sticky',
    bottom: 0,
    marginTop: '1.5rem',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    borderTop: '1px solid var(--color-border, #E2E8F0)',
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
    padding: '0.75rem 1rem max(calc(env(safe-area-inset-bottom, 12px) + 0.5rem), 16px)',
    margin: '1.5rem -1rem -1rem -1rem',
    zIndex: 50,
    boxSizing: 'border-box',
  },
  reassuranceNoticeBox: {
    padding: '0.75rem 0.95rem',
    backgroundColor: 'var(--color-bg, #F8FAFC)',
    borderRadius: '8px',
    border: '1px solid var(--color-border, #E2E8F0)',
    marginBottom: '1rem',
  },

  // Desktop Layout Styles
  workspaceWrapper: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg, #F8FAFC)',
    display: 'flex',
    justifyContent: 'center',
    padding: '1.5rem 1rem 5rem',
    boxSizing: 'border-box',
  },
  contentContainer: {
    maxWidth: '1020px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  workspaceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--color-border, #E2E8F0)',
  },
  pageTitle: {
    fontFamily: 'var(--font-editorial-serif, serif)',
    fontSize: '1.85rem',
    fontWeight: 700,
    color: 'var(--color-primary, #0F172A)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.78rem',
    color: 'var(--color-muted, #64748B)',
    margin: '0.2rem 0 0 0',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.75rem',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: '8px',
    color: 'var(--color-text, #0F172A)',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.12s ease',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.35rem 0.75rem',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-sans, system-ui)',
    fontWeight: 600,
    color: 'var(--color-muted, #64748B)',
  },
  twoPaneGrid: {
    display: 'grid',
    gridTemplateColumns: '220px minmax(0, 1fr)',
    gap: '1.75rem',
    alignItems: 'start',
  },
  navSidebar: {
    position: 'sticky',
    top: '1.5rem',
  },
  navCard: {
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: '13px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
    padding: '0.4rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  navItemBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    padding: '0.55rem 0.65rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.12s ease',
    width: '100%',
  },
  navItemTitle: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.8rem',
    lineHeight: 1.25,
  },
  navItemPreview: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.68rem',
    color: 'var(--color-muted, #64748B)',
    marginTop: '0.15rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '150px',
  },
  formContentArea: {
    minWidth: 0,
  },
  cardSurface: {
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: '13px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
    padding: '1.5rem',
    position: 'relative',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: '1.15rem',
    borderBottom: '1px solid var(--color-border, #E2E8F0)',
    marginBottom: '1.25rem',
  },
  sectionHeaderTitle: {
    fontFamily: 'var(--font-editorial-serif, serif)',
    fontSize: '1.45rem',
    fontWeight: 700,
    color: 'var(--color-primary, #0F172A)',
    margin: 0,
    letterSpacing: '-0.015em',
  },
  sectionHeaderDesc: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.78rem',
    color: 'var(--color-muted, #64748B)',
    margin: '0.25rem 0 0 0',
    lineHeight: 1.45,
  },
  quietSavedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#059669',
    fontSize: '0.72rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans, system-ui)',
  },
  fieldStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  fieldLabel: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--color-text, #0F172A)',
  },
  fieldHint: {
    fontSize: '0.7rem',
    color: 'var(--color-muted, #64748B)',
    lineHeight: 1.35,
  },
  textInput: {
    padding: '0.625rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border, #CBD5E1)',
    backgroundColor: 'var(--color-bg, #F8FAFC)',
    color: 'var(--color-text, #0F172A)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans, system-ui)',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  selectInput: {
    padding: '0.625rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border, #CBD5E1)',
    backgroundColor: 'var(--color-bg, #F8FAFC)',
    color: 'var(--color-text, #0F172A)',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-sans, system-ui)',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  textAreaInput: {
    padding: '0.625rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border, #CBD5E1)',
    backgroundColor: 'var(--color-bg, #F8FAFC)',
    color: 'var(--color-text, #0F172A)',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-sans, system-ui)',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    resize: 'vertical',
  },
  twoColRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  dividerLine: {
    height: '1px',
    backgroundColor: 'var(--color-border, #E2E8F0)',
    margin: '0.25rem 0',
  },
  segmentedControl: {
    display: 'flex',
    backgroundColor: 'var(--color-bg, #F8FAFC)',
    padding: '3px',
    borderRadius: '8px',
    border: '1px solid var(--color-border, #E2E8F0)',
    gap: '0.25rem',
  },
  segmentedOption: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.5rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    transition: 'all 0.12s ease',
  },
  styleCardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.25rem',
  },
  styleOptionCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.85rem',
    borderRadius: '10px',
    border: '1.5px solid var(--color-border, #E2E8F0)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  checkCirclePill: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary, #0284C7)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBox: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-bg, #F8FAFC)',
    borderRadius: '8px',
    border: '1px solid var(--color-border, #E2E8F0)',
    padding: '2px',
  },
  stepperBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '30px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text, #0F172A)',
    cursor: 'pointer',
  },
  textResetBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary, #0284C7)',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-sans, system-ui)',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  toggleSwitchBtn: {
    width: '42px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    padding: '2px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  toggleSwitchKnob: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transition: 'transform 0.15s ease',
  },
  stickySaveBar: {
    position: 'sticky',
    bottom: '1rem',
    marginTop: '1.5rem',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: '10px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50,
  },
  dirtyDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#F59E0B',
    flexShrink: 0,
  },
  stickyBarLabel: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--color-text, #0F172A)',
  },
  discardBtn: {
    padding: '0.45rem 0.85rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border, #CBD5E1)',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text, #0F172A)',
    cursor: 'pointer',
  },
  saveChangesBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.95rem',
    backgroundColor: 'var(--color-primary, #0284C7)',
    border: 'none',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'opacity 0.12s ease',
  },
  primaryActionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 0.95rem',
    backgroundColor: 'var(--color-primary, #0284C7)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryActionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.85rem',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    border: '1px solid var(--color-border, #CBD5E1)',
    borderRadius: '8px',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text, #0F172A)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  destructiveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 0.95rem',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#DC2626',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  destructiveTextBtn: {
    background: 'none',
    border: 'none',
    color: '#DC2626',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-sans, system-ui)',
    fontWeight: 600,
    cursor: 'pointer',
  },
  iconActionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    border: '1px solid var(--color-border, #CBD5E1)',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    cursor: 'pointer',
    color: 'var(--color-text, #0F172A)',
  },
  avatarCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-light, rgba(2, 132, 199, 0.15))',
    color: 'var(--color-primary, #0284C7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.75rem',
    fontFamily: 'var(--font-sans, system-ui)',
    flexShrink: 0,
  },
  emptyNoticeBox: {
    padding: '0.85rem',
    borderRadius: '8px',
    backgroundColor: 'var(--color-bg, #F8FAFC)',
    border: '1px dashed var(--color-border, #CBD5E1)',
    fontSize: '0.72rem',
    color: 'var(--color-muted, #64748B)',
    textAlign: 'center',
  },
  privacyNoteBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    padding: '0.75rem 0.95rem',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(16, 185, 129, 0.18)',
  },
  reorderBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '4px',
    border: '1px solid var(--color-border, #CBD5E1)',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    cursor: 'pointer',
    fontSize: '0.65rem',
    color: 'var(--color-text, #0F172A)',
  },
  toolReorderBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '18px',
    borderRadius: '4px',
    border: '1px solid var(--color-border, #CBD5E1)',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    fontSize: '0.55rem',
    color: 'var(--color-text, #0F172A)',
    lineHeight: 1,
    padding: 0,
  },
  authBadgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '16px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-sans, system-ui)',
    fontWeight: 600,
    color: '#059669',
  },
  guardModalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  guardModalCard: {
    maxWidth: '440px',
    width: '100%',
    backgroundColor: 'var(--color-surface, #FFFFFF)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: '14px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    padding: '1.35rem',
  },
  guardAlertIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  guardModalTitle: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--color-text, #0F172A)',
    margin: 0,
  },
  guardModalText: {
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.78rem',
    color: 'var(--color-muted, #64748B)',
    margin: '0.25rem 0 0 0',
    lineHeight: 1.4,
  },
  guardCancelBtn: {
    padding: '0.5rem 0.85rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border, #CBD5E1)',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text, #0F172A)',
    cursor: 'pointer',
  },
  guardDiscardBtn: {
    padding: '0.5rem 0.85rem',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#DC2626',
    cursor: 'pointer',
  },
  guardSaveBtn: {
    padding: '0.5rem 0.95rem',
    backgroundColor: 'var(--color-primary, #0284C7)',
    border: 'none',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans, system-ui)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};
