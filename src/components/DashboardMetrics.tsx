'use client';

import React from 'react';
import { DashboardSummary, Guest, Task, Song, PhotoShot } from '@/lib/sheets/types';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
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
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import WelcomeGuideCard from '@/components/WelcomeGuideCard';
import { StyleTheme, ColorTheme } from '@/lib/core/theme/ThemeProvider';

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
  enabledModules?: ModuleConfig;
  currency?: string;
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
}

export default function DashboardMetrics({ 
  metrics, 
  guests = [], 
  tasks = [], 
  music = [], 
  photos = [], 
  enabledModules, 
  currency = 'USD', 
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
}: DashboardMetricsProps) {
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
  const approvedSongsCount = allMusic.filter(s => s.approvalStatus === 'Approved' || (!s.approvalStatus && (!s.requestedBy || s.requestedBy === 'Admin'))).length;

  // Photography Calculations
  const allPhotos = photos || [];
  const capturedPhotosCount = allPhotos.filter(p => p.status === 'Captured').length;
  const pendingPhotosCount = allPhotos.filter(p => p.status === 'Pending' || !p.status).length;

  // Planning Status Health Indicator
  const hasExceptions = isOverBudget || pendingCount > 0 || toDoCount > 5 || unassignedAttending > 0 || pendingRequestsCount > 0;

  return (
    <div className="editorial-overview-briefing" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

      {/* Top Single-Line "Planning Status" Summary Strip */}
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
              PLANNING STATUS:
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
              {isOverBudget ? 'OVER TARGET CAP' : 'BUDGET CUSHION'}
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
            LIVE SYNC: 100% SPREADSHEET FIDELITY
          </span>
        </div>
      </div>

      {/* Primary Wide Attention Panel: Actionable Deltas & Exceptions */}
      <div
        className="primary-attention-panel"
        style={{
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '3px',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-primary, #0F172A)',
              }}
            >
              EXECUTIVE BRIEFING // ACTIONABLE DELTAS & EXCEPTIONS
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.6rem',
              color: 'var(--color-muted, #64748B)',
              textTransform: 'uppercase',
            }}
          >
            SELECT ANY DELTA TO OPEN DRILL-DOWN LEDGER
          </span>
        </div>

        {/* Actionable Deltas Horizontal Row / Grid (Condenses to 2-column on mobile) */}
        <div
          className="attention-deltas-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.65rem',
          }}
        >
          {/* Delta 1: Pending RSVPs */}
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('guests', 'Pending')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.35rem',
              padding: '0.6rem 0.75rem',
              backgroundColor: pendingCount > 0 ? 'var(--color-bg-pane, #F8FAFC)' : 'transparent',
              border: `1px solid ${pendingCount > 0 ? 'var(--color-border, #E2E8F0)' : 'var(--color-border, #E2E8F0)'}`,
              borderRadius: '2px',
              cursor: onNavigateTab ? 'pointer' : 'default',
              textAlign: 'left',
              transition: 'all 0.1s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
                PENDING RSVPS
              </span>
              <ArrowUpRight size={12} style={{ color: 'var(--color-muted, #64748B)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.25rem', fontWeight: 800, color: pendingCount > 0 ? 'var(--color-amber, #D97706)' : 'var(--color-primary, #0F172A)' }}>
                {pendingCount}
              </span>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', color: 'var(--color-muted, #64748B)' }}>
                awaiting reply
              </span>
            </div>
          </button>

          {/* Delta 2: Declined RSVPs */}
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('guests', 'Declined')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.35rem',
              padding: '0.6rem 0.75rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '2px',
              cursor: onNavigateTab ? 'pointer' : 'default',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
                DECLINED RSVPS
              </span>
              <ArrowUpRight size={12} style={{ color: 'var(--color-muted, #64748B)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.25rem', fontWeight: 800, color: declinedCount > 0 ? 'var(--color-muted, #64748B)' : 'var(--color-primary, #0F172A)' }}>
                {declinedCount}
              </span>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', color: 'var(--color-muted, #64748B)' }}>
                invitations declined
              </span>
            </div>
          </button>

          {/* Delta 3: Pending Tasks */}
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('tasks', 'To Do')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.35rem',
              padding: '0.6rem 0.75rem',
              backgroundColor: toDoCount > 0 ? 'var(--color-bg-pane, #F8FAFC)' : 'transparent',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '2px',
              cursor: onNavigateTab ? 'pointer' : 'default',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
                OPEN TASKS
              </span>
              <ArrowUpRight size={12} style={{ color: 'var(--color-muted, #64748B)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.25rem', fontWeight: 800, color: toDoCount > 0 ? 'var(--color-red, #EF4444)' : 'var(--color-primary, #0F172A)' }}>
                {toDoCount}
              </span>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', color: 'var(--color-muted, #64748B)' }}>
                to do ({inProgressCount} active)
              </span>
            </div>
          </button>

          {/* Delta 4: Budget Variance / Remaining Balance */}
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('budget')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.35rem',
              padding: '0.6rem 0.75rem',
              backgroundColor: isOverBudget ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
              border: `1px solid ${isOverBudget ? '#FCA5A5' : 'var(--color-border, #E2E8F0)'}`,
              borderRadius: '2px',
              cursor: onNavigateTab ? 'pointer' : 'default',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
                BUDGET VARIANCE
              </span>
              <ArrowUpRight size={12} style={{ color: 'var(--color-muted, #64748B)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.25rem', fontWeight: 800, color: isOverBudget ? 'var(--color-red, #EF4444)' : 'var(--color-green, #10B981)' }}>
                {isOverBudget ? '-' : '+'}{formatCurrency(Math.abs(remainingBudget), currency)}
              </span>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', color: isOverBudget ? 'var(--color-red, #EF4444)' : 'var(--color-muted, #64748B)' }}>
                {isOverBudget ? 'over cap' : 'cushion'}
              </span>
            </div>
          </button>

          {/* Delta 5: Unseated Attending Guests */}
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('tables')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.35rem',
              padding: '0.6rem 0.75rem',
              backgroundColor: unassignedAttending > 0 ? 'var(--color-bg-pane, #F8FAFC)' : 'transparent',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '2px',
              cursor: onNavigateTab ? 'pointer' : 'default',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
                UNSEATED GUESTS
              </span>
              <ArrowUpRight size={12} style={{ color: 'var(--color-muted, #64748B)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.25rem', fontWeight: 800, color: unassignedAttending > 0 ? 'var(--color-amber, #D97706)' : 'var(--color-primary, #0F172A)' }}>
                {unassignedAttending}
              </span>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', color: 'var(--color-muted, #64748B)' }}>
                need tables
              </span>
            </div>
          </button>

          {/* Delta 6: Pending Song Requests */}
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('music', 'Pending')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.35rem',
              padding: '0.6rem 0.75rem',
              backgroundColor: pendingRequestsCount > 0 ? 'var(--color-bg-pane, #F8FAFC)' : 'transparent',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '2px',
              cursor: onNavigateTab ? 'pointer' : 'default',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
                SONG REQUESTS
              </span>
              <ArrowUpRight size={12} style={{ color: 'var(--color-muted, #64748B)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.25rem', fontWeight: 800, color: pendingRequestsCount > 0 ? 'var(--color-amber, #D97706)' : 'var(--color-primary, #0F172A)' }}>
                {pendingRequestsCount}
              </span>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', color: 'var(--color-muted, #64748B)' }}>
                to review
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Horizontal Financial Allocation Strip (No Ring/Pie Charts) */}
      {modules.budget && (
        <div
          className="financial-allocation-strip"
          style={{
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '3px',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
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
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary, #0F172A)',
                }}
              >
                FINANCIAL ALLOCATION STRIP // CELL SETTINGS!B2:B3
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
              <span>OPEN FULL FINANCIAL LEDGER</span>
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
                TARGET CAP:
              </span>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text, #0F172A)' }}>
                {formatCurrency(effectiveTotalBudget, currency)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', color: 'var(--color-muted, #64748B)' }}>
                ACTUAL OUTLAY:
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
                REMAINING CUSHION:
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
                height: '10px',
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
      )}

      {/* Structured Operational Briefings: Guests & Tasks (Side-by-side or stacked) */}
      <div
        className="operational-briefings-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Guest Registry Briefing Strip */}
        {modules.guests && (
          <div
            style={{
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '3px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={13} style={{ color: 'var(--color-primary, #0F172A)' }} />
                <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary, #0F172A)', letterSpacing: '0.06em' }}>
                  GUEST REGISTRY & RSVP BREAKDOWN
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

            {/* Structured Metric Row */}
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

            {/* Ratio rule */}
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
        )}

        {/* Tasks Checklist Briefing Strip */}
        {modules.tasks && (
          <div
            style={{
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '3px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ListTodo size={13} style={{ color: 'var(--color-primary, #0F172A)' }} />
                <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary, #0F172A)', letterSpacing: '0.06em' }}>
                  PLANNING MILESTONES & KANBAN
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

            {/* Structured Metric Row */}
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

            {/* Progress rule */}
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
        )}
      </div>

      {/* Scoped CSS for Mobile Responsive Adaptations */}
      <style>{`
        @media (max-width: 640px) {
          .planning-status-strip {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.4rem !important;
          }
          .attention-deltas-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.5rem !important;
          }
          .attention-deltas-grid button {
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
