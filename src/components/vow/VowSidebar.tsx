'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Users,
  Utensils,
  Armchair,
  DollarSign,
  Calendar,
  Briefcase,
  ListTodo,
  Music,
  Camera,
  Heart,
  Printer,
  Download,
  Settings,
  Share2,
  Search,
} from 'lucide-react';
import AppVersionBadge from '@/components/AppVersionBadge';
import { loadPlanningToolsOrder } from '@/lib/dashboardLayout';

export interface VowSidebarProps {
  isSidebarCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: string;
  onSwitchTab: (tab: any) => void;
  enabledModules: Record<string, any>;
  onOpenPrintStudio?: () => void;
  onOpenShareModal: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette?: () => void;
  onExportCSV: () => void;
  theme?: 'light' | 'dark';
  styleTheme?: 'editorial' | 'botanical-romance' | 'midnight-tuxedo';
  planningToolsOrder?: string[];
}

const NAV_ITEMS = [
  { id: 'home', label: 'Summary', icon: LayoutDashboard },
  { id: 'guests', label: 'Guest List', icon: Users },
  { id: 'menu', label: 'Catering', icon: Utensils },
  { id: 'tables', label: 'Seating', icon: Armchair },
  { id: 'budget', label: 'Financials', icon: DollarSign },
  { id: 'schedule', label: 'Timeline', icon: Calendar },
  { id: 'vendors', label: 'Vendors', icon: Briefcase },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'thanks', label: 'Thanks', icon: Heart },
];

export default function VowSidebar({
  isSidebarCollapsed,
  onToggleCollapse,
  activeTab,
  onSwitchTab,
  enabledModules,
  onOpenPrintStudio,
  onOpenShareModal,
  onOpenSettings,
  onOpenCommandPalette,
  onExportCSV,
  theme = 'light',
  styleTheme = 'editorial',
  planningToolsOrder,
}: VowSidebarProps) {
  const [toolsOrder, setToolsOrder] = useState<string[]>(() => planningToolsOrder || loadPlanningToolsOrder());

  useEffect(() => {
    if (planningToolsOrder) {
      setToolsOrder(planningToolsOrder);
    }
  }, [planningToolsOrder]);

  useEffect(() => {
    const handleOrderChange = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) {
        setToolsOrder(customEvent.detail);
      } else {
        setToolsOrder(loadPlanningToolsOrder());
      }
    };
    window.addEventListener('s2v:tools-order-updated', handleOrderChange);
    return () => window.removeEventListener('s2v:tools-order-updated', handleOrderChange);
  }, []);

  const isBotanical = styleTheme === 'botanical-romance';
  const isDarkTheme = styleTheme === 'editorial' || theme === 'dark';
  const isDarkSidebar = isBotanical || isDarkTheme;

  // Botanical & Dark Theme Palette
  const sidebarBg = isBotanical ? '#1B4332' : (isDarkTheme ? '#090D16' : 'var(--color-surface, #FFFFFF)');
  const sidebarBorder = isBotanical ? '#25583E' : (isDarkTheme ? '#1E293B' : 'var(--color-border, #E2E8F0)');
  const buttonBorder = isBotanical ? 'rgba(255, 255, 255, 0.16)' : (isDarkTheme ? '#334155' : 'var(--color-border, #E2E8F0)');
  const activeItemBg = isBotanical ? '#2D6A4F' : (isDarkTheme ? '#1E293B' : 'var(--color-primary, #0F172A)');
  const activeItemBorder = isBotanical
    ? '1px solid rgba(255, 255, 255, 0.22)'
    : (isDarkTheme ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent');
  const textPrimary = isDarkSidebar ? '#FFFFFF' : 'var(--color-primary, #0F172A)';
  const textMuted = isBotanical ? '#A3C9A8' : (isDarkTheme ? '#94A3B8' : 'var(--color-muted, #64748B)');
  const textSecondary = isBotanical ? '#D8E8DC' : (isDarkTheme ? '#CBD5E1' : 'var(--color-text, #0F172A)');
  const logoBg = isBotanical ? '#2D6A4F' : (isDarkTheme ? '#1E293B' : 'var(--color-primary, #0F172A)');
  const logoColor = isDarkSidebar ? '#FFFFFF' : 'var(--color-on-primary, #FFFFFF)';
  const logoBorder = isBotanical ? '1px solid rgba(255, 255, 255, 0.2)' : (isDarkTheme ? '1px solid #334155' : 'none');
  const searchBg = isBotanical ? 'rgba(255, 255, 255, 0.08)' : (isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'var(--color-background-subtle, #F1F5F9)');
  const searchBorder = isBotanical ? '1px solid rgba(255, 255, 255, 0.14)' : (isDarkTheme ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--color-border, #E2E8F0)');

  const orderedNavItems = useMemo(() => {
    const homeItem = NAV_ITEMS.find((item) => item.id === 'home');
    const toolItems = NAV_ITEMS.filter((item) => item.id !== 'home');

    // Sort tool items according to user toolsOrder
    toolItems.sort((a, b) => {
      const aKey = a.id === 'thanks' ? 'gifts' : a.id;
      const bKey = b.id === 'thanks' ? 'gifts' : b.id;
      const aIdx = toolsOrder.indexOf(aKey) !== -1 ? toolsOrder.indexOf(aKey) : (toolsOrder.indexOf(a.id) !== -1 ? toolsOrder.indexOf(a.id) : 999);
      const bIdx = toolsOrder.indexOf(bKey) !== -1 ? toolsOrder.indexOf(bKey) : (toolsOrder.indexOf(b.id) !== -1 ? toolsOrder.indexOf(b.id) : 999);
      return aIdx - bIdx;
    });

    return homeItem ? [homeItem, ...toolItems] : toolItems;
  }, [toolsOrder]);

  const visibleTabs = orderedNavItems.filter((tab) =>
    tab.id === 'home'
      ? (enabledModules.home ?? enabledModules.metrics ?? true)
      : (enabledModules[tab.id] ?? true)
  );

  return (
    <aside
      className="app-sidebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: isSidebarCollapsed ? '60px' : '210px',
        backgroundColor: sidebarBg,
        borderRight: `1px solid ${sidebarBorder}`,
        padding: isSidebarCollapsed ? '0.85rem 0.4rem' : '0.85rem 0.6rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.15s ease-out',
        zIndex: 90,
        boxShadow: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Group: Brand Lockup & Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Document Mark & Brand Lockup (Clean single centered logo when collapsed) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            padding: '0 0.25rem',
            paddingBottom: '0.75rem',
            borderBottom: `1px solid ${sidebarBorder}`,
          }}
        >
          {!isSidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              {/* Minimal Document Mark */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: logoBg,
                  color: logoColor,
                  border: logoBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '2px',
                  flexShrink: 0,
                }}
              >
                <FileSpreadsheet size={16} strokeWidth={2.2} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-editorial-serif, serif)',
                  fontWeight: 700,
                  fontSize: '1.28rem',
                  lineHeight: '1.05',
                  color: textPrimary,
                  letterSpacing: '-0.025em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Sheet2Vow
              </span>
            </div>
          ) : (
            <div
              title="Sheet2Vow"
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: logoBg,
                color: logoColor,
                border: logoBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '2px',
              }}
            >
              <FileSpreadsheet size={16} strokeWidth={2.2} />
            </div>
          )}
        </div>

        {/* Command Palette / Search Trigger */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            title="Search anything"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: '0.5rem',
              padding: isSidebarCollapsed ? '0.5rem 0' : '0.45rem 0.6rem',
              borderRadius: '4px',
              backgroundColor: searchBg,
              border: searchBorder,
              color: textMuted,
              cursor: 'pointer',
              fontSize: '0.75rem',
              width: '100%',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.14)' : (isDarkTheme ? 'rgba(255, 255, 255, 0.09)' : '#E2E8F0');
              e.currentTarget.style.color = isDarkSidebar ? '#FFFFFF' : '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = searchBg;
              e.currentTarget.style.color = textMuted;
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
              <Search size={14} style={{ flexShrink: 0 }} />
              {!isSidebarCollapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                  Search...
                </span>
              )}
            </div>
          </button>
        )}

        {/* Navigation Item Rail */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
          }}
        >
          {visibleTabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSwitchTab(tab.id as any)}
                title={tab.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: isSidebarCollapsed ? '0.5rem 0' : '0.45rem 0.55rem',
                  borderRadius: '3px',
                  backgroundColor: isActive
                    ? activeItemBg
                    : 'transparent',
                  color: isActive
                    ? '#FFFFFF'
                    : textSecondary,
                  border: isActive && isDarkSidebar ? activeItemBorder : '1px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-technical-mono, var(--font-mono))',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                  transition: 'background-color 0.12s ease, color 0.12s ease',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.08)' : (isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)');
                    e.currentTarget.style.color = isDarkSidebar ? '#FFFFFF' : 'var(--color-primary, #0F172A)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = textSecondary;
                  }
                }}
              >
                <IconComp
                  size={15}
                  style={{
                    flexShrink: 0,
                    strokeWidth: isActive ? 2.3 : 1.9,
                  }}
                />
                {!isSidebarCollapsed && (
                  <span
                    style={{
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {tab.label.toUpperCase()}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Group: Utility Actions (Export CSV, Sync Settings), Collapse Toggle & Version Badge */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '0.65rem',
          borderTop: `1px solid ${sidebarBorder}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {/* Print Studio */}
        {onOpenPrintStudio && (
          <button
            type="button"
            onClick={onOpenPrintStudio}
            title="Print Studio & Templates"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: isSidebarCollapsed ? '0.45rem 0' : '0.42rem 0.55rem',
              borderRadius: '2px',
              backgroundColor: isBotanical ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
              color: textSecondary,
              border: `1px solid ${buttonBorder}`,
              cursor: 'pointer',
              fontFamily: 'var(--font-technical-mono, var(--font-mono))',
              fontSize: '0.68rem',
              fontWeight: 600,
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              transition: 'background-color 0.1s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.12)' : (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9');
              e.currentTarget.style.color = isDarkSidebar ? '#FFFFFF' : 'var(--color-primary, #0F172A)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.04)' : 'transparent';
              e.currentTarget.style.color = textSecondary;
            }}
          >
            <Printer size={14} style={{ color: textMuted, flexShrink: 0 }} />
            {!isSidebarCollapsed && <span style={{ letterSpacing: '0.04em' }}>PRINT STUDIO</span>}
          </button>
        )}

        {/* Export CSV */}
        <button
          type="button"
          onClick={onExportCSV}
          title="Export CSV Data"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isSidebarCollapsed ? '0.45rem 0' : '0.42rem 0.55rem',
            borderRadius: '2px',
            backgroundColor: isBotanical ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
            color: textSecondary,
            border: `1px solid ${buttonBorder}`,
            cursor: 'pointer',
            fontFamily: 'var(--font-technical-mono, var(--font-mono))',
            fontSize: '0.68rem',
            fontWeight: 600,
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            transition: 'background-color 0.1s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.12)' : (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9');
            e.currentTarget.style.color = isDarkSidebar ? '#FFFFFF' : 'var(--color-primary, #0F172A)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.04)' : 'transparent';
            e.currentTarget.style.color = textSecondary;
          }}
        >
          <Download size={14} style={{ color: textMuted, flexShrink: 0 }} />
          {!isSidebarCollapsed && <span style={{ letterSpacing: '0.04em' }}>EXPORT CSV</span>}
        </button>

        {/* Settings */}
        {(() => {
          const isSettingsActive = activeTab === 'settings';
          return (
            <button
              type="button"
              onClick={() => (onSwitchTab ? onSwitchTab('settings') : onOpenSettings())}
              title="Settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: isSidebarCollapsed ? '0.45rem 0' : '0.42rem 0.55rem',
                borderRadius: '3px',
                backgroundColor: isSettingsActive
                  ? activeItemBg
                  : (isBotanical ? 'rgba(255, 255, 255, 0.04)' : 'transparent'),
                color: isSettingsActive
                  ? '#FFFFFF'
                  : textSecondary,
                border: isSettingsActive
                  ? (isBotanical
                      ? '1px solid rgba(255, 255, 255, 0.28)'
                      : (isDarkTheme ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid var(--color-primary, #0F172A)'))
                  : `1px solid ${buttonBorder}`,
                cursor: 'pointer',
                fontFamily: 'var(--font-technical-mono, var(--font-mono))',
                fontSize: '0.68rem',
                fontWeight: isSettingsActive ? 700 : 600,
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSettingsActive) {
                  e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.12)' : (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9');
                  e.currentTarget.style.color = isDarkSidebar ? '#FFFFFF' : 'var(--color-primary, #0F172A)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSettingsActive) {
                  e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.04)' : 'transparent';
                  e.currentTarget.style.color = textSecondary;
                }
              }}
            >
              <Settings
                size={14}
                style={{
                  color: isSettingsActive
                    ? '#FFFFFF'
                    : textMuted,
                  flexShrink: 0,
                  strokeWidth: isSettingsActive ? 2.3 : 1.9,
                }}
              />
              {!isSidebarCollapsed && <span style={{ letterSpacing: '0.04em' }}>SETTINGS</span>}
            </button>
          );
        })()}

        {/* Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isSidebarCollapsed ? '0.45rem 0' : '0.42rem 0.55rem',
            borderRadius: '2px',
            backgroundColor: isBotanical ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
            color: textSecondary,
            border: `1px solid ${buttonBorder}`,
            cursor: 'pointer',
            fontFamily: 'var(--font-technical-mono, var(--font-mono))',
            fontSize: '0.68rem',
            fontWeight: 600,
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            transition: 'background-color 0.1s ease, color 0.1s ease',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.12)' : (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9');
            e.currentTarget.style.color = isDarkSidebar ? '#FFFFFF' : 'var(--color-primary, #0F172A)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isBotanical ? 'rgba(255, 255, 255, 0.04)' : 'transparent';
            e.currentTarget.style.color = textSecondary;
          }}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen size={14} style={{ color: textMuted, flexShrink: 0 }} />
          ) : (
            <>
              <PanelLeftClose size={14} style={{ color: textMuted, flexShrink: 0 }} />
              <span style={{ letterSpacing: '0.04em' }}>COLLAPSE</span>
            </>
          )}
        </button>

        {/* App Version & Deployment Badge */}
        <div style={{ marginTop: '0.35rem' }}>
          <AppVersionBadge collapsed={isSidebarCollapsed} variant="sidebar" isDark={isDarkSidebar} />
        </div>
      </div>
    </aside>
  );
}
