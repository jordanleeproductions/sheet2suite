'use client';

import React from 'react';
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
} from 'lucide-react';
import AppVersionBadge from '@/components/AppVersionBadge';

export interface VowSidebarProps {
  isSidebarCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: string;
  onSwitchTab: (tab: any) => void;
  enabledModules: Record<string, any>;
  onOpenPrintStudio?: () => void;
  onOpenShareModal: () => void;
  onOpenSettings: () => void;
  onExportCSV: () => void;
  theme?: 'light' | 'dark';
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
  onExportCSV,
  theme = 'light',
}: VowSidebarProps) {
  const visibleTabs = NAV_ITEMS.filter((tab) =>
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
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        borderRight: '1px solid var(--color-border, #E2E8F0)',
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
        {/* Document Mark & Brand Lockup */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            padding: '0 0.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--color-border, #E2E8F0)',
          }}
        >
          {!isSidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              {/* Minimal Document Mark */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: 'var(--color-primary, #0F172A)',
                  color: 'var(--color-on-primary, #FFFFFF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '2px',
                  flexShrink: 0,
                }}
              >
                <FileSpreadsheet size={16} strokeWidth={2.2} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-editorial-serif, serif)',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    lineHeight: '1.1',
                    color: 'var(--color-primary, #0F172A)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Sheet2Vow
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.54rem',
                    fontWeight: 600,
                    color: 'var(--color-muted, #64748B)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Utility Rail
                </span>
              </div>
            </div>
          ) : (
            <div
              title="Sheet2Vow"
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: 'var(--color-primary, #0F172A)',
                color: 'var(--color-on-primary, #FFFFFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '2px',
              }}
            >
              <FileSpreadsheet size={16} strokeWidth={2.2} />
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '2px',
              cursor: 'pointer',
              padding: '0.25rem',
              color: 'var(--color-text, #0F172A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.1s ease',
            }}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

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
                    ? 'var(--color-primary, #0F172A)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--color-on-primary, #FFFFFF)'
                    : 'var(--color-text, #0F172A)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-technical-mono, var(--font-mono))',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                  transition: 'background-color 0.12s ease, color 0.12s ease',
                  width: '100%',
                  textAlign: 'left',
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

      {/* Bottom Group: Utility Actions (Print, Export CSV, Sync Settings) & Version Badge */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--color-border, #E2E8F0)',
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
              backgroundColor: 'transparent',
              color: 'var(--color-text, #0F172A)',
              border: '1px solid var(--color-border, #E2E8F0)',
              cursor: 'pointer',
              fontFamily: 'var(--font-technical-mono, var(--font-mono))',
              fontSize: '0.68rem',
              fontWeight: 600,
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              transition: 'background-color 0.1s ease',
            }}
          >
            <Printer size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
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
            backgroundColor: 'transparent',
            color: 'var(--color-text, #0F172A)',
            border: '1px solid var(--color-border, #E2E8F0)',
            cursor: 'pointer',
            fontFamily: 'var(--font-technical-mono, var(--font-mono))',
            fontSize: '0.68rem',
            fontWeight: 600,
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            transition: 'background-color 0.1s ease',
          }}
        >
          <Download size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          {!isSidebarCollapsed && <span style={{ letterSpacing: '0.04em' }}>EXPORT CSV</span>}
        </button>

        {/* Sync Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Settings & Sync Configuration"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isSidebarCollapsed ? '0.45rem 0' : '0.42rem 0.55rem',
            borderRadius: '2px',
            backgroundColor: 'transparent',
            color: 'var(--color-text, #0F172A)',
            border: '1px solid var(--color-border, #E2E8F0)',
            cursor: 'pointer',
            fontFamily: 'var(--font-technical-mono, var(--font-mono))',
            fontSize: '0.68rem',
            fontWeight: 600,
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            transition: 'background-color 0.1s ease',
          }}
        >
          <Settings size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          {!isSidebarCollapsed && <span style={{ letterSpacing: '0.04em' }}>SYNC SETTINGS</span>}
        </button>

        {/* App Version & Deployment Badge */}
        <div style={{ marginTop: '0.35rem' }}>
          <AppVersionBadge collapsed={isSidebarCollapsed} variant="sidebar" />
        </div>
      </div>
    </aside>
  );
}
