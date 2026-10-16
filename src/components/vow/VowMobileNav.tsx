'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Menu,
  X,
  FileSpreadsheet,
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
} from 'lucide-react';

export interface VowMobileNavProps {
  activeTab: string;
  onSwitchTab: (tab: any) => void;
  isMobileDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
  enabledModules: Record<string, any>;
  onOpenPrintStudio?: () => void;
  onOpenShareModal: () => void;
  onOpenSettings: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  triggerHaptic?: (ms: number) => void;
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
  onTouchStart,
  onTouchEnd,
  triggerHaptic,
}: VowMobileNavProps) {
  const isSecondaryTabActive = !['home', 'guests', 'budget', 'schedule'].includes(activeTab);

  const PRIMARY_NAV = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'schedule', label: 'Timeline', icon: Calendar },
  ];

  return (
    <>
      {/* 5-Item Mobile Bottom Utility Tab Bar */}
      <nav
        className="mobile-bottom-nav-bar"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '52px',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderTop: '1px solid var(--color-border, #E2E8F0)',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 150,
          padding: '0 0.25rem',
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
                onSwitchTab(tab.id as any);
                onCloseDrawer();
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                color: isActive ? 'var(--color-primary, #0F172A)' : 'var(--color-muted, #64748B)',
                cursor: 'pointer',
                padding: '0.25rem 0.4rem',
                gap: '0.1rem',
                flex: 1,
                height: '100%',
                position: 'relative',
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    backgroundColor: 'var(--color-primary, #0F172A)',
                  }}
                />
              )}
              <IconComp size={18} style={{ strokeWidth: isActive ? 2.4 : 1.8 }} />
              <span
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.58rem',
                  fontWeight: isActive ? 700 : 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {tab.label}
              </span>
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: (isSecondaryTabActive || isMobileDrawerOpen)
              ? 'var(--color-primary, #0F172A)'
              : 'var(--color-muted, #64748B)',
            cursor: 'pointer',
            padding: '0.25rem 0.4rem',
            gap: '0.1rem',
            flex: 1,
            height: '100%',
            position: 'relative',
          }}
        >
          {(isSecondaryTabActive || isMobileDrawerOpen) && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                right: '20%',
                height: '2px',
                backgroundColor: 'var(--color-primary, #0F172A)',
              }}
            />
          )}
          <Menu size={18} style={{ strokeWidth: (isSecondaryTabActive || isMobileDrawerOpen) ? 2.4 : 1.8 }} />
          <span
            style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.58rem',
              fontWeight: (isSecondaryTabActive || isMobileDrawerOpen) ? 700 : 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            More
          </span>
        </button>
      </nav>

      {/* Categorized Bottom Sheet Drawer */}
      {isMobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
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
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              borderTop: '1px solid var(--color-border, #E2E8F0)',
              maxHeight: '82vh',
              padding: '0.65rem 1rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              boxShadow: 'none',
              animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.15rem 0' }}>
              <div
                style={{
                  width: '32px',
                  height: '3px',
                  backgroundColor: 'var(--color-border, #CBD5E1)',
                  borderRadius: '2px',
                }}
              />
            </div>

            {/* Bottom Sheet Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--color-border, #E2E8F0)',
                paddingBottom: '0.45rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileSpreadsheet size={18} style={{ color: 'var(--color-primary)' }} />
                <span
                  style={{
                    fontFamily: 'var(--font-editorial-serif, serif)',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: 'var(--color-primary)',
                  }}
                >
                  Sheet2Vow Modules
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseDrawer}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Categorized Module Groups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Group 1: Hospitality */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: 'var(--color-muted)',
                    letterSpacing: '0.06em',
                    marginBottom: '0.3rem',
                  }}
                >
                  GUESTS & HOSPITALITY
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
                  {[
                    { id: 'guests', label: 'Guest Registry', icon: Users },
                    { id: 'menu', label: 'Catering Menu', icon: Utensils },
                    { id: 'tables', label: 'Seating Chart', icon: Armchair },
                    { id: 'thanks', label: 'Thank You Gifts', icon: Heart },
                  ]
                    .filter((tab) => (enabledModules as any)[tab.id] ?? true)
                    .map((tab) => {
                      const IconComp = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            onSwitchTab(tab.id as any);
                            onCloseDrawer();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.5rem 0.6rem',
                            borderRadius: '3px',
                            backgroundColor: isActive
                              ? 'var(--color-primary, #0F172A)'
                              : 'var(--color-bg-pane, #F8FAFC)',
                            color: isActive
                              ? 'var(--color-on-primary, #FFFFFF)'
                              : 'var(--color-text, #0F172A)',
                            border: '1px solid var(--color-border, #E2E8F0)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-technical-mono, monospace)',
                            fontSize: '0.7rem',
                            fontWeight: isActive ? 700 : 500,
                            textAlign: 'left',
                          }}
                        >
                          <IconComp size={14} style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Group 2: Planning & Finances */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: 'var(--color-muted)',
                    letterSpacing: '0.06em',
                    marginBottom: '0.3rem',
                  }}
                >
                  PLANNING & FINANCES
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
                  {[
                    { id: 'budget', label: 'Budget & Expenses', icon: DollarSign },
                    { id: 'schedule', label: 'Day Timeline', icon: Calendar },
                    { id: 'vendors', label: 'Vendors', icon: Briefcase },
                    { id: 'tasks', label: 'Tasks & Checklist', icon: ListTodo },
                  ]
                    .filter((tab) => (enabledModules as any)[tab.id] ?? true)
                    .map((tab) => {
                      const IconComp = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            onSwitchTab(tab.id as any);
                            onCloseDrawer();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.5rem 0.6rem',
                            borderRadius: '3px',
                            backgroundColor: isActive
                              ? 'var(--color-primary, #0F172A)'
                              : 'var(--color-bg-pane, #F8FAFC)',
                            color: isActive
                              ? 'var(--color-on-primary, #FFFFFF)'
                              : 'var(--color-text, #0F172A)',
                            border: '1px solid var(--color-border, #E2E8F0)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-technical-mono, monospace)',
                            fontSize: '0.7rem',
                            fontWeight: isActive ? 700 : 500,
                            textAlign: 'left',
                          }}
                        >
                          <IconComp size={14} style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Group 3: Media & Experience */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: 'var(--color-muted)',
                    letterSpacing: '0.06em',
                    marginBottom: '0.3rem',
                  }}
                >
                  MEDIA & EXPERIENCE
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
                  {[
                    { id: 'music', label: 'Music & DJ', icon: Music },
                    { id: 'photos', label: 'Photography Shots', icon: Camera },
                  ]
                    .filter((tab) => (enabledModules as any)[tab.id] ?? true)
                    .map((tab) => {
                      const IconComp = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            onSwitchTab(tab.id as any);
                            onCloseDrawer();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.5rem 0.6rem',
                            borderRadius: '3px',
                            backgroundColor: isActive
                              ? 'var(--color-primary, #0F172A)'
                              : 'var(--color-bg-pane, #F8FAFC)',
                            color: isActive
                              ? 'var(--color-on-primary, #FFFFFF)'
                              : 'var(--color-text, #0F172A)',
                            border: '1px solid var(--color-border, #E2E8F0)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-technical-mono, monospace)',
                            fontSize: '0.7rem',
                            fontWeight: isActive ? 700 : 500,
                            textAlign: 'left',
                          }}
                        >
                          <IconComp size={14} style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: onOpenPrintStudio ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                gap: '0.4rem',
                paddingTop: '0.6rem',
                borderTop: '1px solid var(--color-border, #E2E8F0)',
                marginTop: '0.25rem',
              }}
            >
              {onOpenPrintStudio && (
                <button
                  type="button"
                  onClick={() => {
                    onCloseDrawer();
                    onOpenPrintStudio();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem',
                    borderRadius: '2px',
                    backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
                    color: 'var(--color-text, #0F172A)',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                  }}
                >
                  <Printer size={13} />
                  <span>PRINT</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onCloseDrawer();
                  onOpenShareModal();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem',
                  borderRadius: '2px',
                  backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
                  color: 'var(--color-text, #0F172A)',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                }}
              >
                <Share2 size={13} />
                <span>SHARE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onCloseDrawer();
                  onOpenSettings();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem',
                  borderRadius: '2px',
                  backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
                  color: 'var(--color-text, #0F172A)',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                }}
              >
                <Settings size={13} />
                <span>SETTINGS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
