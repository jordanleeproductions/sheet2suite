'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Menu,
  X,
  Utensils,
  Armchair,
  Heart,
  Briefcase,
  ListTodo,
  Music,
  Camera,
  Printer,
  Share2,
  Settings,
  Search,
  ChevronRight,
} from 'lucide-react';
import AppVersionBadge from '@/components/AppVersionBadge';
import { ModuleConfig } from '@/components/DashboardMetrics';

export type VowTabKey =
  | 'budget'
  | 'vendors'
  | 'settings'
  | 'guests'
  | 'music'
  | 'photos'
  | 'schedule'
  | 'tasks'
  | 'tables'
  | 'home'
  | 'menu'
  | 'metrics'
  | 'thanks';

export interface VowMobileNavProps {
  activeTab: string;
  onSwitchTab: (tab: VowTabKey) => void;
  isMobileDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
  enabledModules: ModuleConfig;
  onOpenPrintStudio?: () => void;
  onOpenShareModal: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette?: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  triggerHaptic?: (ms: number) => void;
  // Dynamic live preview stats
  weddingName?: string;
  weddingDate?: string;
  guestCount?: number;
  rsvpAttendingCount?: number;
  tablesCount?: number;
  menuCoursesCount?: number;
  budgetTotal?: number;
  budgetSpent?: number;
  currency?: string;
  scheduleEventsCount?: number;
  vendorsCount?: number;
  tasksPendingCount?: number;
  musicTracksCount?: number;
  photosCount?: number;
  giftsCount?: number;
  styleTheme?: string;
}

export default function VowMobileNav({
  activeTab,
  onSwitchTab,
  isMobileDrawerOpen,
  onToggleDrawer,
  onCloseDrawer,
  enabledModules,
  onOpenPrintStudio,
  onOpenShareModal,
  onOpenSettings,
  onOpenCommandPalette,
  onTouchStart,
  onTouchEnd,
  triggerHaptic,
  weddingName,
  weddingDate,
  guestCount,
  rsvpAttendingCount,
  tablesCount,
  menuCoursesCount,
  budgetTotal,
  budgetSpent,
  currency = 'USD',
  scheduleEventsCount,
  vendorsCount,
  tasksPendingCount,
  musicTracksCount,
  photosCount,
  giftsCount,
  styleTheme,
}: VowMobileNavProps) {
  const isSecondaryTabActive = !['home', 'guests', 'budget', 'schedule'].includes(activeTab);
  const isBrutalist = styleTheme === 'neo-brutalism';

  // Currency formatter for live budget previews
  const formatCurrency = (val: number | undefined, curr = 'USD'): string => {
    if (val === undefined || isNaN(val)) return '$0';
    const prefix = curr === 'USD' ? '$' : `${curr} `;
    if (val >= 1000000) {
      return `${prefix}${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${prefix}${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
    }
    return `${prefix}${val.toLocaleString()}`;
  };

  // Date formatter for drawer header
  const formattedDate = weddingDate
    ? (() => {
        try {
          const d = new Date(weddingDate);
          if (isNaN(d.getTime())) return '';
          return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
          return '';
        }
      })()
    : '';

  // Avatar monogram generator
  const getInitials = (name?: string): string => {
    if (!name || !name.trim()) return 'W';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Helper to verify if a given module is enabled
  const isModuleEnabled = (id: string, altKey?: string) => {
    const modules = enabledModules as unknown as Record<string, boolean | undefined>;
    if (modules[id] !== undefined) return Boolean(modules[id]);
    if (altKey && modules[altKey] !== undefined) return Boolean(modules[altKey]);
    return true;
  };

  // Primary 4 items in Bottom Navigation Bar
  const PRIMARY_NAV: Array<{
    id: VowTabKey;
    label: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    color: string;
    bg: string;
  }> = [
    { id: 'home', label: 'Home', icon: LayoutDashboard, color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.10)' },
    { id: 'guests', label: 'Guests', icon: Users, color: '#059669', bg: 'rgba(16, 185, 129, 0.10)' },
    { id: 'budget', label: 'Budget', icon: DollarSign, color: '#16A34A', bg: 'rgba(22, 163, 74, 0.10)' },
    { id: 'schedule', label: 'Timeline', icon: Calendar, color: '#D97706', bg: 'rgba(217, 119, 6, 0.10)' },
  ];

  const isMoreActive = isSecondaryTabActive || isMobileDrawerOpen;
  const moreColor = '#7C3AED';
  const moreBg = 'rgba(124, 58, 237, 0.10)';

  interface ModuleDrawerItem {
    id: VowTabKey;
    altKey?: string;
    label: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    badgeColor: string;
    badgeBg: string;
    getDynamicSubtitle: () => string | null;
    staticSubtitle: string;
  }

  interface ModuleDrawerGroup {
    id: string;
    title: string;
    items: ModuleDrawerItem[];
  }

  // Categorized Module Groups for the "More" Drawer (Option A - Grouped Card Lists)
  const MODULE_GROUPS: ModuleDrawerGroup[] = [
    {
      id: 'hospitality',
      title: 'GUESTS & HOSPITALITY',
      items: [
        {
          id: 'guests',
          label: 'Guest Registry',
          icon: Users,
          badgeColor: '#059669',
          badgeBg: 'rgba(16, 185, 129, 0.10)',
          getDynamicSubtitle: () =>
            guestCount !== undefined && guestCount > 0
              ? `${guestCount} guest${guestCount === 1 ? '' : 's'}${
                  rsvpAttendingCount !== undefined ? ` · ${rsvpAttendingCount} attending` : ''
                }`
              : null,
          staticSubtitle: 'Directory, RSVPs & meal choices',
        },
        {
          id: 'tables',
          label: 'Seating Chart',
          icon: Armchair,
          badgeColor: '#7C3AED',
          badgeBg: 'rgba(124, 58, 237, 0.10)',
          getDynamicSubtitle: () =>
            tablesCount !== undefined && tablesCount > 0
              ? `${tablesCount} table${tablesCount === 1 ? '' : 's'} assigned`
              : null,
          staticSubtitle: 'Floor plan, table seating & ceremony',
        },
        {
          id: 'menu',
          label: 'Catering Menu',
          icon: Utensils,
          badgeColor: '#EA580C',
          badgeBg: 'rgba(234, 88, 12, 0.10)',
          getDynamicSubtitle: () =>
            menuCoursesCount !== undefined && menuCoursesCount > 0
              ? `${menuCoursesCount} course${menuCoursesCount === 1 ? '' : 's'} planned`
              : null,
          staticSubtitle: 'Catering courses & dietary tags',
        },
        {
          id: 'thanks',
          altKey: 'gifts',
          label: 'Thank You Gifts',
          icon: Heart,
          badgeColor: '#E11D48',
          badgeBg: 'rgba(225, 29, 72, 0.10)',
          getDynamicSubtitle: () =>
            giftsCount !== undefined && giftsCount > 0
              ? `${giftsCount} gift${giftsCount === 1 ? '' : 's'} logged`
              : null,
          staticSubtitle: 'Wedding gifts & thank-you notes',
        },
      ],
    },
    {
      id: 'finances',
      title: 'PLANNING & FINANCES',
      items: [
        {
          id: 'budget',
          label: 'Budget & Expenses',
          icon: DollarSign,
          badgeColor: '#16A34A',
          badgeBg: 'rgba(22, 163, 74, 0.10)',
          getDynamicSubtitle: () => {
            if (budgetTotal !== undefined && budgetTotal > 0) {
              return `${formatCurrency(budgetSpent, currency)} spent of ${formatCurrency(budgetTotal, currency)}`;
            }
            if (budgetSpent !== undefined && budgetSpent > 0) {
              return `${formatCurrency(budgetSpent, currency)} total spent`;
            }
            return null;
          },
          staticSubtitle: 'Categorized ledger & payments',
        },
        {
          id: 'schedule',
          label: 'Day Timeline',
          icon: Calendar,
          badgeColor: '#D97706',
          badgeBg: 'rgba(217, 119, 6, 0.10)',
          getDynamicSubtitle: () =>
            scheduleEventsCount !== undefined && scheduleEventsCount > 0
              ? `${scheduleEventsCount} event${scheduleEventsCount === 1 ? '' : 's'} scheduled`
              : null,
          staticSubtitle: 'Day-of run of show & itinerary',
        },
        {
          id: 'vendors',
          label: 'Vendors',
          icon: Briefcase,
          badgeColor: '#2563EB',
          badgeBg: 'rgba(37, 99, 235, 0.10)',
          getDynamicSubtitle: () =>
            vendorsCount !== undefined && vendorsCount > 0
              ? `${vendorsCount} vendor${vendorsCount === 1 ? '' : 's'} booked`
              : null,
          staticSubtitle: 'Contracts, contacts & balances',
        },
        {
          id: 'tasks',
          label: 'Tasks & Checklist',
          icon: ListTodo,
          badgeColor: '#4F46E5',
          badgeBg: 'rgba(79, 70, 229, 0.10)',
          getDynamicSubtitle: () =>
            tasksPendingCount !== undefined && tasksPendingCount > 0
              ? `${tasksPendingCount} task${tasksPendingCount === 1 ? '' : 's'} to complete`
              : null,
          staticSubtitle: 'Milestone checklists & kanban',
        },
      ],
    },
    {
      id: 'media',
      title: 'MEDIA & EXPERIENCE',
      items: [
        {
          id: 'music',
          label: 'Music & DJ',
          icon: Music,
          badgeColor: '#DB2777',
          badgeBg: 'rgba(219, 39, 119, 0.10)',
          getDynamicSubtitle: () =>
            musicTracksCount !== undefined && musicTracksCount > 0
              ? `${musicTracksCount} track${musicTracksCount === 1 ? '' : 's'} in playlist`
              : null,
          staticSubtitle: 'Playlist & guest song requests',
        },
        {
          id: 'photos',
          label: 'Photography Shots',
          icon: Camera,
          badgeColor: '#0284C7',
          badgeBg: 'rgba(2, 132, 199, 0.10)',
          getDynamicSubtitle: () =>
            photosCount !== undefined && photosCount > 0
              ? `${photosCount} photo shot${photosCount === 1 ? '' : 's'} listed`
              : null,
          staticSubtitle: 'Must-have photo shots & coordinator guide',
        },
      ],
    },
  ];

  return (
    <>
      {/* Monarch-Style Mobile Bottom Utility Tab Bar */}
      <nav
        className="mobile-bottom-nav-bar"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '58px',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderTop: '1px solid var(--color-border, #E2E8F0)',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 150,
          padding: '0 0.35rem',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxSizing: 'border-box',
        }}
      >
        {PRIMARY_NAV.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (triggerHaptic) triggerHaptic(10);
                onSwitchTab(tab.id);
                onCloseDrawer();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.2rem 0.2rem',
                flex: 1,
                height: '100%',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '16px',
                  backgroundColor: isActive ? tab.bg : 'transparent',
                  transition: 'background-color 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.12s ease',
                  gap: '2px',
                  maxWidth: '72px',
                  width: '100%',
                }}
              >
                <IconComp
                  size={18}
                  style={{
                    strokeWidth: isActive ? 2.3 : 1.8,
                    color: isActive ? tab.color : 'var(--color-muted, #64748B)',
                    transition: 'color 0.15s ease',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-interface-sans, system-ui)',
                    fontSize: '0.64rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? tab.color : 'var(--color-muted, #64748B)',
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}

        {/* 5th Action: "More" Drawer Trigger */}
        <button
          type="button"
          onClick={() => {
            if (triggerHaptic) triggerHaptic(12);
            onToggleDrawer();
          }}
          title="All Sheet2Vow Modules"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.2rem 0.2rem',
            flex: 1,
            height: '100%',
            position: 'relative',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem 0.6rem',
              borderRadius: '16px',
              backgroundColor: isMoreActive ? moreBg : 'transparent',
              transition: 'background-color 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.12s ease',
              gap: '2px',
              maxWidth: '72px',
              width: '100%',
              position: 'relative',
            }}
          >
            {isSecondaryTabActive && !isMobileDrawerOpen && (
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  right: '18px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: moreColor,
                  boxShadow: '0 0 0 2px var(--color-surface, #FFFFFF)',
                }}
              />
            )}
            <Menu
              size={18}
              style={{
                strokeWidth: isMoreActive ? 2.3 : 1.8,
                color: isMoreActive ? moreColor : 'var(--color-muted, #64748B)',
                transition: 'color 0.15s ease',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-interface-sans, system-ui)',
                fontSize: '0.64rem',
                fontWeight: isMoreActive ? 700 : 500,
                color: isMoreActive ? moreColor : 'var(--color-muted, #64748B)',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
              }}
            >
              More
            </span>
          </div>
        </button>
      </nav>

      {/* Categorized Bottom Sheet Drawer (Settings & Monarch UX Aligned) */}
      {isMobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={onCloseDrawer}
        >
          <div
            className="mobile-bottom-sheet-content"
            style={{
              width: '100%',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              borderTop: '1px solid var(--color-border, #E2E8F0)',
              maxHeight: '86vh',
              padding: '0.65rem 1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.14)',
              animation: 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tactile Drag Handle Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.15rem 0 0.35rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '4.5px',
                  backgroundColor: 'var(--color-border, #CBD5E1)',
                  borderRadius: '9999px',
                }}
              />
            </div>

            {/* Bottom Sheet Masthead Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--color-border, #E2E8F0)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(2, 132, 199, 0.10)',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(weddingName)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-editorial-serif, serif)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--color-text, #0F172A)',
                      margin: 0,
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {weddingName || 'Our Wedding'}
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-interface-sans, system-ui)',
                      fontSize: '0.72rem',
                      color: 'var(--color-muted, #64748B)',
                    }}
                  >
                    {formattedDate || 'Planning Suite Modules'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseDrawer}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'var(--color-bg-hover, #F1F5F9)',
                  color: 'var(--color-text, #0F172A)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Search Entry */}
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={() => {
                  onCloseDrawer();
                  onOpenCommandPalette();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-bg, #F8FAFC)',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  color: 'var(--color-muted, #64748B)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                }}
              >
                <Search size={15} style={{ flexShrink: 0, color: 'var(--color-muted)' }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Search guests, vendors, budget, tasks...
                </span>
              </button>
            )}

            {/* Categorized Module Groups (Option A - Monarch / Settings Grouped Card Rows) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {MODULE_GROUPS.map((group) => {
                const visibleItems = group.items.filter((item) =>
                  isModuleEnabled(item.id, item.altKey)
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.id}>
                    <div
                      style={{
                        fontFamily: 'var(--font-interface-sans, system-ui)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--color-muted, #64748B)',
                        padding: '0 0.25rem 0.35rem 0.25rem',
                      }}
                    >
                      {group.title}
                    </div>

                    <div
                      style={{
                        backgroundColor: 'var(--color-surface, #FFFFFF)',
                        borderRadius: isBrutalist ? '6px' : '14px',
                        border: isBrutalist ? '2px solid var(--color-primary, #0F172A)' : '1px solid var(--color-border, #E2E8F0)',
                        overflow: 'hidden',
                        boxShadow: isBrutalist ? '3px 3px 0px var(--color-primary, #0F172A)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      {visibleItems.map((tab, idx) => {
                        const IconComp = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isLast = idx === visibleItems.length - 1;
                        const dynamicSubtitle = tab.getDynamicSubtitle();
                        const subtitle = dynamicSubtitle || tab.staticSubtitle;

                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              if (triggerHaptic) triggerHaptic(10);
                              onSwitchTab(tab.id);
                              onCloseDrawer();
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.68rem 0.85rem',
                              width: '100%',
                              background: isActive ? 'var(--color-bg-hover, rgba(0, 0, 0, 0.025))' : 'transparent',
                              border: 'none',
                              borderBottom: isLast ? 'none' : '1px solid var(--color-border, #E2E8F0)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              boxSizing: 'border-box',
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  backgroundColor: tab.badgeBg,
                                  color: tab.badgeColor,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <IconComp size={18} />
                              </div>
                              <div style={{ textAlign: 'left', minWidth: 0 }}>
                                <div
                                  style={{
                                    fontFamily: 'var(--font-interface-sans, system-ui)',
                                    fontSize: '0.86rem',
                                    fontWeight: isActive ? 700 : 600,
                                    color: 'var(--color-text, #0F172A)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {tab.label}
                                </div>
                                <div
                                  style={{
                                    fontFamily: 'var(--font-interface-sans, system-ui)',
                                    fontSize: '0.72rem',
                                    color: 'var(--color-muted, #64748B)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {subtitle}
                                </div>
                              </div>
                            </div>

                            {isActive ? (
                              <span
                                style={{
                                  fontFamily: 'var(--font-interface-sans, system-ui)',
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  color: tab.badgeColor,
                                  backgroundColor: tab.badgeBg,
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '6px',
                                  flexShrink: 0,
                                  marginLeft: '0.5rem',
                                  letterSpacing: '0.04em',
                                }}
                              >
                                ACTIVE
                              </span>
                            ) : (
                              <ChevronRight size={18} style={{ color: 'var(--color-muted, #94A3B8)', flexShrink: 0, marginLeft: '0.5rem' }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Footer Dock */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: onOpenPrintStudio ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                gap: '0.5rem',
                paddingTop: '0.65rem',
                borderTop: '1px solid var(--color-border, #E2E8F0)',
                marginTop: '0.25rem',
              }}
            >
              {onOpenPrintStudio && (
                <button
                  type="button"
                  onClick={() => {
                    if (triggerHaptic) triggerHaptic(10);
                    onCloseDrawer();
                    onOpenPrintStudio();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 0.5rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-bg, #F8FAFC)',
                    color: 'var(--color-text, #0F172A)',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-interface-sans, system-ui)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                  }}
                >
                  <Printer size={15} style={{ color: 'var(--color-muted, #64748B)' }} />
                  <span>Print</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (triggerHaptic) triggerHaptic(10);
                  onCloseDrawer();
                  onOpenShareModal();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 0.5rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-bg, #F8FAFC)',
                  color: 'var(--color-text, #0F172A)',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-interface-sans, system-ui)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                }}
              >
                <Share2 size={15} style={{ color: '#059669' }} />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (triggerHaptic) triggerHaptic(10);
                  onCloseDrawer();
                  if (onOpenSettings) {
                    onOpenSettings();
                  } else {
                    onSwitchTab('settings');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 0.5rem',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'settings' ? 'var(--color-primary, #0F172A)' : 'var(--color-bg, #F8FAFC)',
                  color: activeTab === 'settings' ? 'var(--color-on-primary, #FFFFFF)' : 'var(--color-text, #0F172A)',
                  border: activeTab === 'settings' ? '1px solid var(--color-primary, #0F172A)' : '1px solid var(--color-border, #E2E8F0)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-interface-sans, system-ui)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                }}
              >
                <Settings size={15} style={{ color: activeTab === 'settings' ? '#FFFFFF' : '#0284C7' }} />
                <span>Settings</span>
              </button>
            </div>

            {/* Version & Deployment Timestamp Indicator */}
            <div style={{ marginTop: '0.25rem', paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}>
              <AppVersionBadge variant="mobile-drawer" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
