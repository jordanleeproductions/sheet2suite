'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardSummary, Guest, Task, Song, PhotoShot, Vendor } from '@/lib/sheets/types';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Users, 
  DollarSign, 
  Calendar, 
  ListTodo, 
  Music, 
  Camera, 
  Armchair,
  Sliders,
  ExternalLink,
  Sparkles,
  Heart,
  User,
  Receipt,
  Store,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import WelcomeGuideCard from '@/components/WelcomeGuideCard';
import { StyleTheme, ColorTheme } from '@/lib/core/theme/ThemeProvider';
import { DashboardSectionConfig, loadDashboardLayout } from '@/lib/dashboardLayout';

export interface ModuleConfig {
  home?: boolean;
  metrics: boolean;
  guests: boolean;
  budget: boolean;
  schedule: boolean;
  tasks: boolean;
  vendors: boolean;
  music: boolean;
  tables?: boolean;
  photos?: boolean;
  gifts?: boolean;
  thanks?: boolean;
  menu?: boolean;
}

interface DashboardMetricsProps {
  metrics: DashboardSummary;
  guests?: Guest[];
  tasks?: Task[];
  music?: Song[];
  photos?: PhotoShot[];
  vendors?: Vendor[];
  enabledModules?: ModuleConfig;
  currency?: string;
  partner1Name?: string;
  partner2Name?: string;
  onNavigateTab?: (tab: string, filter?: string) => void;
  onOpenModuleSettings?: () => void;
  showWelcomeGuide?: boolean;
  onDismissWelcomeGuide?: () => void;
  weddingName?: string;
  spreadsheetId?: string;
  styleTheme?: StyleTheme;
  colorTheme?: ColorTheme;
  showTopNav?: boolean;
  onSelectStyleTheme?: (style: StyleTheme) => void;
  onToggleColorTheme?: () => void;
  onToggleTopNav?: () => void;
  dashboardLayout?: DashboardSectionConfig[];
}

export default function DashboardMetrics({ 
  metrics, 
  guests = [], 
  tasks = [], 
  music = [], 
  photos = [], 
  vendors = [],
  enabledModules, 
  currency = 'USD', 
  partner1Name = '',
  partner2Name = '',
  onNavigateTab, 
  onOpenModuleSettings,
  showWelcomeGuide = false,
  onDismissWelcomeGuide,
  weddingName = 'Our Wedding',
  spreadsheetId,
  styleTheme = 'editorial',
  colorTheme = 'light',
  showTopNav = false,
  onSelectStyleTheme,
  onToggleColorTheme,
  onToggleTopNav,
  dashboardLayout,
}: DashboardMetricsProps) {
  const [sections, setSections] = useState<DashboardSectionConfig[]>(() => dashboardLayout || loadDashboardLayout());

  useEffect(() => {
    if (dashboardLayout) {
      setSections(dashboardLayout);
    }
  }, [dashboardLayout]);

  useEffect(() => {
    const handleLayoutChange = (e: Event) => {
      const customEvent = e as CustomEvent<DashboardSectionConfig[]>;
      if (customEvent.detail) {
        setSections(customEvent.detail);
      } else {
        setSections(loadDashboardLayout());
      }
    };
    window.addEventListener('s2v:dashboard-layout-updated', handleLayoutChange);
    return () => window.removeEventListener('s2v:dashboard-layout-updated', handleLayoutChange);
  }, []);

  const { totalBudget, estimatedCost, actualCost } = metrics;

  const modules = enabledModules || {
    metrics: true,
    guests: true,
    budget: true,
    schedule: true,
    tasks: true,
    vendors: true,
    music: true,
    tables: true,
  };

  // Financial Calculations
  const effectiveTotalBudget = totalBudget > 0 ? totalBudget : (estimatedCost > 0 ? estimatedCost : 0);
  const remainingBudget = effectiveTotalBudget - actualCost;
  const actualPercent = effectiveTotalBudget > 0 ? Math.min(Math.round((actualCost / effectiveTotalBudget) * 100), 100) : 0;
  const isOverBudget = remainingBudget < 0;

  // Guest Calculations
  const allGuests = guests || [];
  const totalGuestsInvited = allGuests.length;
  const attendingCount = allGuests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'attending').length;
  const declinedCount = allGuests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'declined').length;
  const pendingCount = allGuests.filter(g => !(g.rsvpStatus) || (g.rsvpStatus || '').toLowerCase() === 'no response' || (g.rsvpStatus || '').toLowerCase() === 'pending').length;
  const confirmedPercent = totalGuestsInvited > 0 ? Math.round((attendingCount / totalGuestsInvited) * 100) : 0;

  // Seating Calculations
  const assignedAttending = allGuests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'attending' && g.tableAssignment && g.tableAssignment !== 'Unassigned');
  const unassignedAttending = allGuests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'attending' && (!g.tableAssignment || g.tableAssignment === 'Unassigned')).length;
  const seatedPercent = attendingCount > 0 ? Math.round((assignedAttending.length / attendingCount) * 100) : 0;
  const totalTables = Array.from(new Set(allGuests.map(g => (g.tableAssignment || '').trim()).filter(t => t && t !== 'Unassigned'))).length;

  // Kanban Tasks Calculations
  const allTasks = tasks || [];
  const toDoCount = allTasks.filter(t => t.kanbanStage === 'To Do').length;
  const inProgressCount = allTasks.filter(t => t.kanbanStage === 'In Progress').length;
  const doneCount = allTasks.filter(t => t.kanbanStage === 'Done').length;
  const totalTasksCount = allTasks.length;
  const taskPercentComplete = totalTasksCount > 0 ? Math.round((doneCount / totalTasksCount) * 100) : 0;

  // Music Calculations
  const allMusic = music || [];
  const pendingRequestsCount = allMusic.filter(s => s.approvalStatus === 'Pending Approval').length;
  const approvedMusicCount = allMusic.filter(s => (s.approvalStatus || '').toLowerCase() === 'approved').length;
  const musicPercentApproved = allMusic.length > 0 ? Math.round((approvedMusicCount / allMusic.length) * 100) : 0;

  // Photo Calculations
  const allPhotos = photos || [];
  const capturedPhotosCount = allPhotos.filter(p => (p.status || '').toLowerCase() === 'captured').length;
  const pendingPhotosCount = allPhotos.length - capturedPhotosCount;
  const photoPercentComplete = allPhotos.length > 0 ? Math.round((capturedPhotosCount / allPhotos.length) * 100) : 0;

  // Planning Status Health Indicator
  const hasExceptions = isOverBudget || pendingCount > 0 || toDoCount > 5 || unassignedAttending > 0;

  // Action Center Filter Tab State
  const [actionFilter, setActionFilter] = useState<'all' | 'vendors' | 'tasks' | 'overdue'>('all');

  // Event Horizon & Ceremony Countdown
  const ceremonyDateStr = metrics.weddingDate || '';
  const ceremonyLocation = metrics.location || '';
  let daysRemaining: number | null = null;
  let formattedCeremonyDate = '';

  if (ceremonyDateStr) {
    try {
      const parts = ceremonyDateStr.split('-');
      if (parts.length === 3) {
        const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        const diffMs = target.getTime() - today.getTime();
        daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
        formattedCeremonyDate = target.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch (_) {}
  }

  // 1. Upcoming Vendor Installments within 30 days & overdue
  const upcomingVendorInstallments = useMemo(() => {
    if (!vendors || vendors.length === 0) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return vendors
      .map(v => {
        const nextDateStr = v.paymentDueDate || '';
        const dueAmt = v.balanceOwing && v.balanceOwing > 0 
          ? v.balanceOwing 
          : (v.totalContractValue && v.totalContractValue > 0 ? (v.totalContractValue - (v.depositPaid || 0)) : 0);
        
        if (!nextDateStr || dueAmt <= 0) return null;
        
        const parsed = new Date(nextDateStr);
        if (isNaN(parsed.getTime())) return null;
        parsed.setHours(0, 0, 0, 0);

        const diffDays = Math.round((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          return {
            id: `vendor-${v.vendorId}`,
            type: 'vendor' as const,
            title: v.vendorName,
            subtitle: `${v.category || 'Vendor'} · ${formatCurrency(dueAmt, currency)} installment`,
            amount: dueAmt,
            dueDate: nextDateStr,
            diffDays,
            isOverdue: diffDays < 0,
            isDueToday: diffDays === 0,
            targetTab: 'vendors',
          };
        }
        return null;
      })
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [vendors, currency]);

  // 2. Upcoming Tasks within 30 days & overdue
  const upcomingTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks
      .filter(t => t.kanbanStage !== 'Done' && t.dueDate)
      .map(t => {
        const parsed = new Date(t.dueDate!);
        if (isNaN(parsed.getTime())) return null;
        parsed.setHours(0, 0, 0, 0);

        const diffDays = Math.round((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          return {
            id: `task-${t.taskId}`,
            type: 'task' as const,
            title: t.taskName,
            subtitle: `${t.category || 'General'} · Assigned to ${t.assignedTo || 'Unassigned'}`,
            priority: t.priority,
            assignedTo: t.assignedTo,
            dueDate: t.dueDate!,
            diffDays,
            isOverdue: diffDays < 0,
            isDueToday: diffDays === 0,
            targetTab: 'tasks',
          };
        }
        return null;
      })
      .filter((t): t is NonNullable<typeof t> => t !== null)
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [tasks]);

  const allActionItems = useMemo(() => {
    return [...upcomingVendorInstallments, ...upcomingTasks].sort((a, b) => a.diffDays - b.diffDays);
  }, [upcomingVendorInstallments, upcomingTasks]);

  const overdueCount = allActionItems.filter(item => item.isOverdue).length;

  const filteredActionItems = useMemo(() => {
    if (actionFilter === 'vendors') return upcomingVendorInstallments;
    if (actionFilter === 'tasks') return upcomingTasks;
    if (actionFilter === 'overdue') return allActionItems.filter(i => i.isOverdue);
    return allActionItems;
  }, [actionFilter, allActionItems, upcomingVendorInstallments, upcomingTasks]);

  const renderActionCenter = () => (
    <div
      key="sec-action_center"
      className="action-center-panel"
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '4px',
        padding: '0.85rem 1.15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: overdueCount > 0
                ? '#EF4444'
                : (allActionItems.length > 0 ? '#F59E0B' : '#10B981'),
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-primary, #0F172A)',
            }}
          >
            ACTION CENTER · 30-DAY HORIZON
          </span>
          <span
            style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.1rem 0.45rem',
              borderRadius: '10px',
              backgroundColor: overdueCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-bg-pane, #F1F5F9)',
              color: overdueCount > 0 ? '#DC2626' : 'var(--color-muted, #64748B)',
            }}
          >
            {allActionItems.length} {allActionItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${allActionItems.length})` },
            { id: 'vendors', label: `Payments (${upcomingVendorInstallments.length})` },
            { id: 'tasks', label: `Tasks (${upcomingTasks.length})` },
            { id: 'overdue', label: `Overdue (${overdueCount})` },
          ].map(pill => {
            const isActive = actionFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActionFilter(pill.id as any)}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  borderRadius: '2px',
                  border: `1px solid ${isActive ? 'var(--color-primary, #0F172A)' : 'var(--color-border, #CBD5E1)'}`,
                  backgroundColor: isActive ? 'var(--color-primary, #0F172A)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-muted, #64748B)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Center Items Content */}
      {allActionItems.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '3px',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#10B981', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065F46' }}>
              All caught up for the next 30 days
            </div>
            <div style={{ fontSize: '0.72rem', color: '#047857' }}>
              No vendor installment payments or tasks are overdue or due within the upcoming 30-day window.
            </div>
          </div>
        </div>
      ) : filteredActionItems.length === 0 ? (
        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-muted, #64748B)' }}>
          No items in the &ldquo;{actionFilter}&rdquo; filter.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '0.65rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {filteredActionItems.slice(0, 6).map(item => {
            const isPayment = item.type === 'vendor';
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
                  border: `1px solid ${item.isOverdue ? '#FCA5A5' : 'var(--color-border, #E2E8F0)'}`,
                  borderRadius: '3px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isPayment ? (
                      <Receipt size={12} style={{ color: 'var(--color-primary, #0F172A)' }} />
                    ) : (
                      <ListTodo size={12} style={{ color: 'var(--color-primary, #0F172A)' }} />
                    )}
                    <span
                      style={{
                        fontFamily: 'var(--font-technical-mono, monospace)',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        color: 'var(--color-muted, #64748B)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {isPayment ? 'INSTALLMENT' : 'TASK'}
                    </span>
                  </div>

                  {/* Urgency Badge */}
                  <span
                    style={{
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      padding: '0.12rem 0.45rem',
                      borderRadius: '2px',
                      backgroundColor: item.isOverdue
                        ? '#FEE2E2'
                        : (item.isDueToday ? '#FEF3C7' : 'rgba(15, 23, 42, 0.06)'),
                      color: item.isOverdue
                        ? '#991B1B'
                        : (item.isDueToday ? '#92400E' : 'var(--color-primary, #0F172A)'),
                    }}
                  >
                    {item.isOverdue
                      ? `OVERDUE (${Math.abs(item.diffDays)}D)`
                      : (item.isDueToday ? 'DUE TODAY' : `IN ${item.diffDays}D`)}
                  </span>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--color-text, #0F172A)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.title}
                  >
                    {item.title}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.subtitle}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.35rem', borderTop: '1px solid var(--color-border-light, #F1F5F9)' }}>
                  <button
                    type="button"
                    onClick={() => onNavigateTab && onNavigateTab(item.targetTab)}
                    style={{
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--color-primary, #0F172A)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    <span>{isPayment ? 'OPEN VENDOR' : 'OPEN KANBAN'}</span>
                    <ArrowUpRight size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderBudget = () => (
    <div
      key="sec-budget"
      className="financial-allocation-strip"
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '3px',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={14} style={{ color: 'var(--color-primary, #0F172A)' }} />
          <span
            style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-primary, #0F172A)',
            }}
          >
            FINANCIALS &amp; EXPENSES
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('budget')}
          style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '0.62rem',
            fontWeight: 700,
            color: 'var(--color-primary, #0F172A)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            textDecoration: 'underline',
          }}
        >
          <span>OPEN FINANCIALS</span>
          <ArrowUpRight size={11} />
        </button>
      </div>

      {/* Metric Summary Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem 1.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '2px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', color: 'var(--color-muted, #64748B)' }}>
            WEDDING BUDGET:
          </span>
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text, #0F172A)' }}>
            {formatCurrency(effectiveTotalBudget, currency)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', color: 'var(--color-muted, #64748B)' }}>
            PAID SO FAR:
          </span>
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-primary, #0F172A)' }}>
            {formatCurrency(actualCost, currency)}
          </span>
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', color: 'var(--color-muted, #64748B)' }}>
            ({actualPercent}%)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', color: 'var(--color-muted, #64748B)' }}>
            LEFT TO SPEND:
          </span>
          <span style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '0.88rem',
            fontWeight: 800,
            color: isOverBudget ? 'var(--color-red, #EF4444)' : 'var(--color-green, #10B981)'
          }}>
            {isOverBudget ? '-' : '+'}{formatCurrency(Math.abs(remainingBudget), currency)}
          </span>
        </div>
      </div>

      {/* Structured Hairline Allocation Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div
          style={{
            position: 'relative',
            height: '8px',
            backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${actualPercent}%`,
              backgroundColor: isOverBudget ? 'var(--color-red, #EF4444)' : 'var(--color-primary, #0F172A)',
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.6rem', color: 'var(--color-muted, #64748B)' }}>
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100% TARGET</span>
        </div>
      </div>
    </div>
  );

  const renderGuests = () => (
    <div
      key="sec-guests"
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '3px',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={13} style={{ color: 'var(--color-primary, #0F172A)' }} />
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary, #0F172A)', letterSpacing: '0.06em' }}>
            GUESTS &amp; RSVPS
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('guests')}
          style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '0.62rem',
            color: 'var(--color-muted, #64748B)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          VIEW LIST
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '0.35rem',
        backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
        border: '1px solid var(--color-border, #E2E8F0)',
        padding: '0.5rem 0.4rem',
        borderRadius: '2px',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>INVITED</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text, #0F172A)' }}>{totalGuestsInvited}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-green, #10B981)', textTransform: 'uppercase' }}>ACCEPTED</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-green, #10B981)' }}>{attendingCount}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-amber, #D97706)', textTransform: 'uppercase' }}>PENDING</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-amber, #D97706)' }}>{pendingCount}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>DECLINED</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-muted, #64748B)' }}>{declinedCount}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div style={{ height: '4px', display: 'flex', borderRadius: '1px', overflow: 'hidden', backgroundColor: 'var(--color-border, #E2E8F0)' }}>
          <div style={{ width: `${totalGuestsInvited > 0 ? (attendingCount / totalGuestsInvited) * 100 : 0}%`, backgroundColor: 'var(--color-green, #10B981)' }} />
          <div style={{ width: `${totalGuestsInvited > 0 ? (pendingCount / totalGuestsInvited) * 100 : 0}%`, backgroundColor: 'var(--color-amber, #F59E0B)' }} />
          <div style={{ width: `${totalGuestsInvited > 0 ? (declinedCount / totalGuestsInvited) * 100 : 0}%`, backgroundColor: 'var(--color-muted, #94A3B8)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)' }}>
          <span>CONFIRMED: {confirmedPercent}%</span>
          <span>TABLES: {totalTables} ACTIVE</span>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div
      key="sec-tasks"
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '3px',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ListTodo size={13} style={{ color: 'var(--color-primary, #0F172A)' }} />
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary, #0F172A)', letterSpacing: '0.06em' }}>
            TASKS &amp; CHECKLIST
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('tasks')}
          style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '0.62rem',
            color: 'var(--color-muted, #64748B)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          VIEW KANBAN
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '0.35rem',
        backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
        border: '1px solid var(--color-border, #E2E8F0)',
        padding: '0.5rem 0.4rem',
        borderRadius: '2px',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-red, #EF4444)', textTransform: 'uppercase' }}>TO DO</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-red, #EF4444)' }}>{toDoCount}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-amber, #D97706)', textTransform: 'uppercase' }}>IN PROGRESS</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-amber, #D97706)' }}>{inProgressCount}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-green, #10B981)', textTransform: 'uppercase' }}>COMPLETED</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-green, #10B981)' }}>{doneCount}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div style={{ height: '4px', borderRadius: '1px', overflow: 'hidden', backgroundColor: 'var(--color-border, #E2E8F0)' }}>
          <div style={{ height: '100%', width: `${taskPercentComplete}%`, backgroundColor: 'var(--color-primary, #0F172A)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)' }}>
          <span>PROGRESS: {taskPercentComplete}%</span>
          <span>{doneCount} OF {totalTasksCount} COMPLETE</span>
        </div>
      </div>
    </div>
  );

  const renderTables = () => (
    <div
      key="sec-tables"
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '3px',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Armchair size={13} style={{ color: 'var(--color-primary, #0F172A)' }} />
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary, #0F172A)', letterSpacing: '0.06em' }}>
            RECEPTION SEATING &amp; TABLES
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('tables')}
          style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '0.62rem',
            color: 'var(--color-muted, #64748B)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          VIEW TABLES
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '0.35rem',
        backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
        border: '1px solid var(--color-border, #E2E8F0)',
        padding: '0.5rem 0.4rem',
        borderRadius: '2px',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-green, #10B981)', textTransform: 'uppercase' }}>SEATED</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-green, #10B981)' }}>{assignedAttending.length}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: unassignedAttending > 0 ? 'var(--color-red, #EF4444)' : 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>UNASSIGNED</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: unassignedAttending > 0 ? 'var(--color-red, #EF4444)' : 'var(--color-text, #0F172A)' }}>{unassignedAttending}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>ACTIVE TABLES</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text, #0F172A)' }}>{totalTables}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div style={{ height: '4px', borderRadius: '1px', overflow: 'hidden', backgroundColor: 'var(--color-border, #E2E8F0)' }}>
          <div style={{ height: '100%', width: `${seatedPercent}%`, backgroundColor: 'var(--color-primary, #0F172A)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)' }}>
          <span>PROGRESS: {seatedPercent}% SEATED</span>
          <span>{assignedAttending.length} OF {attendingCount || 1} ATTENDING GUESTS</span>
        </div>
      </div>
    </div>
  );

  const renderMusic = () => (
    <div
      key="sec-music"
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '3px',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Music size={13} style={{ color: 'var(--color-primary, #0F172A)' }} />
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary, #0F172A)', letterSpacing: '0.06em' }}>
            MUSIC &amp; PLAYLISTS
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('music')}
          style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '0.62rem',
            color: 'var(--color-muted, #64748B)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          VIEW PLAYLISTS
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '0.35rem',
        backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
        border: '1px solid var(--color-border, #E2E8F0)',
        padding: '0.5rem 0.4rem',
        borderRadius: '2px',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>TOTAL TRACKS</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text, #0F172A)' }}>{allMusic.length}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-green, #10B981)', textTransform: 'uppercase' }}>APPROVED</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-green, #10B981)' }}>{approvedMusicCount}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: pendingRequestsCount > 0 ? 'var(--color-amber, #D97706)' : 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>PENDING</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: pendingRequestsCount > 0 ? 'var(--color-amber, #D97706)' : 'var(--color-text, #0F172A)' }}>{pendingRequestsCount}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div style={{ height: '4px', borderRadius: '1px', overflow: 'hidden', backgroundColor: 'var(--color-border, #E2E8F0)' }}>
          <div style={{ height: '100%', width: `${musicPercentApproved}%`, backgroundColor: 'var(--color-primary, #0F172A)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)' }}>
          <span>APPROVED: {musicPercentApproved}%</span>
          <span>{approvedMusicCount} OF {allMusic.length} SONGS READY</span>
        </div>
      </div>
    </div>
  );

  const renderPhotos = () => (
    <div
      key="sec-photos"
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '3px',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Camera size={13} style={{ color: 'var(--color-primary, #0F172A)' }} />
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary, #0F172A)', letterSpacing: '0.06em' }}>
            PHOTOGRAPHY SHOT LIST
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('photos')}
          style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '0.62rem',
            color: 'var(--color-muted, #64748B)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          VIEW SHOT LIST
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '0.35rem',
        backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
        border: '1px solid var(--color-border, #E2E8F0)',
        padding: '0.5rem 0.4rem',
        borderRadius: '2px',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>TOTAL SHOTS</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text, #0F172A)' }}>{allPhotos.length}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-green, #10B981)', textTransform: 'uppercase' }}>CAPTURED</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-green, #10B981)' }}>{capturedPhotosCount}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: pendingPhotosCount > 0 ? 'var(--color-amber, #D97706)' : 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>PENDING</div>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.05rem', fontWeight: 800, color: pendingPhotosCount > 0 ? 'var(--color-amber, #D97706)' : 'var(--color-text, #0F172A)' }}>{pendingPhotosCount}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div style={{ height: '4px', borderRadius: '1px', overflow: 'hidden', backgroundColor: 'var(--color-border, #E2E8F0)' }}>
          <div style={{ height: '100%', width: `${photoPercentComplete}%`, backgroundColor: 'var(--color-primary, #0F172A)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.58rem', color: 'var(--color-muted, #64748B)' }}>
          <span>PROGRESS: {photoPercentComplete}% CAPTURED</span>
          <span>{capturedPhotosCount} OF {allPhotos.length} SHOTS TAKEN</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="editorial-overview-briefing" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Onboarding Guide Banner (Cleanly Dismissible) */}
      {showWelcomeGuide && onDismissWelcomeGuide && (
        <WelcomeGuideCard
          weddingName={weddingName}
          spreadsheetId={spreadsheetId}
          styleTheme={styleTheme}
          colorTheme={colorTheme}
          showTopNav={showTopNav}
          onDismiss={onDismissWelcomeGuide}
          onSelectStyleTheme={onSelectStyleTheme}
          onToggleColorTheme={onToggleColorTheme}
          onToggleTopNav={onToggleTopNav}
          onOpenSettings={onOpenModuleSettings}
        />
      )}

      {/* Top Single-Line "Planning Progress" Summary Strip */}
      <div
        className="planning-status-strip"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.6rem 1.25rem',
          padding: '0.55rem 0.85rem',
          backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '2px',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: hasExceptions ? 'var(--color-amber, #F59E0B)' : 'var(--color-green, #10B981)',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--color-primary, #0F172A)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              PLANNING PROGRESS:
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.72rem',
              color: 'var(--color-text, #0F172A)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap',
            }}
          >
            <span>
              <strong>{attendingCount}</strong> OF <strong>{totalGuestsInvited}</strong> GUESTS CONFIRMED ({confirmedPercent}%)
            </span>
            <span style={{ color: 'var(--color-border, #CBD5E1)' }}>•</span>
            <span>
              <strong>{taskPercentComplete}%</strong> OF TASKS COMPLETED ({doneCount}/{totalTasksCount})
            </span>
            <span style={{ color: 'var(--color-border, #CBD5E1)' }}>•</span>
            <span>
              <strong style={{ color: isOverBudget ? 'var(--color-red, #EF4444)' : 'var(--color-green, #10B981)' }}>
                {isOverBudget ? '-' : '+'}{formatCurrency(Math.abs(remainingBudget), currency)}
              </strong>{' '}
              {isOverBudget ? 'OVER TARGET' : 'REMAINING BUDGET'}
            </span>
            {attendingCount > 0 && (
              <>
                <span style={{ color: 'var(--color-border, #CBD5E1)' }}>•</span>
                <span>
                  <strong>{seatedPercent}%</strong> SEATED ({assignedAttending.length}/{attendingCount})
                </span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.62rem',
              color: 'var(--color-muted, #64748B)',
              letterSpacing: '0.04em',
            }}
          >
            ALL CHANGES SAVED
          </span>
        </div>
      </div>

      {/* 3 Modern Hero Cards: Event Horizon, Monarch Left to Spend, Confirmed Guests */}
      <div
        className="monarch-hero-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '1rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Hero Card 1: Event Horizon & Countdown */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '4px',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-muted, #64748B)',
              }}
            >
              EVENT HORIZON
            </span>

            {/* Countdown Badge */}
            <span
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '0.2rem 0.55rem',
                borderRadius: '12px',
                backgroundColor: daysRemaining !== null && daysRemaining <= 30
                  ? (daysRemaining <= 7 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.12)')
                  : 'rgba(15, 23, 42, 0.06)',
                color: daysRemaining !== null && daysRemaining <= 30
                  ? (daysRemaining <= 7 ? '#DC2626' : '#B45309')
                  : 'var(--color-primary, #0F172A)',
              }}
            >
              {daysRemaining !== null
                ? (daysRemaining > 0
                    ? `${daysRemaining} DAYS TO GO`
                    : (daysRemaining === 0 ? 'TODAY IS THE DAY! 🎉' : `CELEBRATED ${Math.abs(daysRemaining)}D AGO`))
                : 'DATE NOT SET'}
            </span>
          </div>

          <div>
            <h2
              style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--color-primary, #0F172A)',
                margin: 0,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={weddingName}
            >
              {weddingName}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <Calendar size={12} style={{ color: 'var(--color-muted, #64748B)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text, #334155)', fontWeight: 500 }}>
                {formattedCeremonyDate || 'Set date in Settings'}
              </span>
              {ceremonyLocation && (
                <>
                  <span style={{ color: 'var(--color-border, #CBD5E1)' }}>•</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #64748B)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ceremonyLocation}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Couple / Co-Planner Attribution Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.45rem', borderTop: '1px solid var(--color-border-light, #F1F5F9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Heart size={11} style={{ color: 'var(--color-primary, #0F172A)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)' }}>
                {partner1Name ? partner1Name : 'Partner 1'}
                {partner2Name ? ` & ${partner2Name}` : ''}
              </span>
            </div>

            {onOpenModuleSettings && (
              <button
                type="button"
                onClick={onOpenModuleSettings}
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'var(--color-muted, #64748B)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                EDIT
              </button>
            )}
          </div>
        </div>

        {/* Hero Card 2: Monarch Left to Spend */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '4px',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isOverBudget ? 'var(--color-red, #EF4444)' : 'var(--color-muted, #64748B)',
              }}
            >
              {isOverBudget ? 'OVER TARGET BUDGET' : 'LEFT TO SPEND'}
            </span>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('budget')}
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'var(--color-muted, #64748B)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                <span>FINANCIALS</span>
                <ArrowUpRight size={10} />
              </button>
            )}
          </div>

          <div>
            <div
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '1.65rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: isOverBudget ? 'var(--color-red, #EF4444)' : 'var(--color-green, #10B981)',
              }}
            >
              {isOverBudget ? '-' : '+'}{formatCurrency(Math.abs(remainingBudget), currency)}
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)', marginTop: '0.25rem' }}>
              {isOverBudget ? 'Exceeded wedding spending cap' : 'Available headroom remaining'}
            </div>
          </div>

          {/* Monarch 6px color-graded progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div
              style={{
                position: 'relative',
                height: '6px',
                backgroundColor: 'var(--color-bg-pane, #F1F5F9)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(actualPercent, 100)}%`,
                  backgroundColor: isOverBudget
                    ? '#EF4444'
                    : (actualPercent >= 85 ? '#D97706' : 'var(--color-primary, #0F172A)'),
                  transition: 'width 0.3s ease-out',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'var(--font-technical-mono, monospace)', color: 'var(--color-muted, #64748B)' }}>
              <span>Spent {formatCurrency(actualCost, currency)} ({actualPercent}%)</span>
              <span>Target {formatCurrency(effectiveTotalBudget, currency)}</span>
            </div>
          </div>
        </div>

        {/* Hero Card 3: Confirmed Guests & Attendance */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '4px',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-muted, #64748B)',
              }}
            >
              CONFIRMED GUESTS
            </span>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('guests')}
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'var(--color-muted, #64748B)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                <span>GUESTS</span>
                <ArrowUpRight size={10} />
              </button>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  color: 'var(--color-primary, #0F172A)',
                }}
              >
                {attendingCount}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748B)', fontFamily: 'var(--font-technical-mono, monospace)' }}>
                of {totalGuestsInvited} invited ({confirmedPercent}%)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '2px',
                  backgroundColor: pendingCount > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--color-bg-pane, #F1F5F9)',
                  color: pendingCount > 0 ? '#B45309' : 'var(--color-muted, #64748B)',
                  fontWeight: 600,
                }}
              >
                {pendingCount} Pending
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '2px',
                  backgroundColor: 'var(--color-bg-pane, #F1F5F9)',
                  color: 'var(--color-muted, #64748B)',
                }}
              >
                {declinedCount} Declined
              </span>
            </div>
          </div>

          {/* Seating Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.45rem', borderTop: '1px solid var(--color-border-light, #F1F5F9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Armchair size={11} style={{ color: 'var(--color-muted, #64748B)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted, #64748B)' }}>
                {seatedPercent}% seated ({assignedAttending.length}/{attendingCount || 1})
              </span>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('tables')}
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'var(--color-muted, #64748B)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                TABLES
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Reorderable Dashboard Overview Sections */}
      {sections.map((sec) => {
        if (!sec.enabled) return null;
        switch (sec.key) {
          case 'action_center':
            return renderActionCenter();
          case 'budget':
            if (modules.budget === false) return null;
            return renderBudget();
          case 'guests':
            if (modules.guests === false) return null;
            return renderGuests();
          case 'tasks':
            if (modules.tasks === false) return null;
            return renderTasks();
          case 'tables':
            if (modules.tables === false) return null;
            return renderTables();
          case 'music':
            if (modules.music === false) return null;
            return renderMusic();
          case 'photos':
            if (modules.photos === false) return null;
            return renderPhotos();
          default:
            return null;
        }
      })}

      {/* Scoped CSS for Mobile Responsive Adaptations */}
      <style>{`
        @media (max-width: 960px) {
          .monarch-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .planning-status-strip {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.4rem !important;
          }
          .action-center-panel {
            padding: 0.75rem 0.75rem !important;
          }
          .operational-briefings-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
