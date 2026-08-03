'use client';

import React, { useState } from 'react';
import { DashboardSummary, Guest, Task, Song } from '@/lib/sheets/types';
import { Edit2, LayoutGrid, PieChart, BarChart2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export interface ModuleConfig {
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
}

interface DashboardMetricsProps {
  metrics: DashboardSummary;
  guests?: Guest[];
  tasks?: Task[];
  music?: Song[];
  enabledModules?: ModuleConfig;
  currency?: string;
  onNavigateTab?: (tab: string, filter?: string) => void;
}

function DonutChart({ 
  slices, 
  centerLabel, 
  centerValue,
  onSliceClick 
}: { 
  slices: { label: string; count: number; color: string; filterKey?: string }[];
  centerLabel: string;
  centerValue: string | number;
  onSliceClick?: (filterKey?: string) => void;
}) {
  const total = slices.reduce((sum, s) => sum + s.count, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.327

  let accumulatedDash = 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: '1.5rem',
      backgroundColor: 'var(--color-surface, #ffffff)',
      border: '1px solid var(--color-muted)',
      borderRadius: 'var(--border-radius-sm)',
      padding: '1.25rem 1.5rem',
    }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {total === 0 ? (
            <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--color-muted)" strokeWidth="16" opacity="0.3" />
          ) : (
            slices.map((slice, index) => {
              const slicePercent = slice.count / total;
              const strokeDash = slicePercent * circumference;
              const gap = circumference - strokeDash;
              const strokeOffset = -accumulatedDash;
              accumulatedDash += strokeDash;

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="16"
                  strokeDasharray={`${strokeDash} ${gap}`}
                  strokeDashoffset={strokeOffset}
                  style={{
                    cursor: onSliceClick ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => onSliceClick && onSliceClick(slice.filterKey)}
                >
                  <title>{`${slice.label}: ${slice.count} (${Math.round(slicePercent * 100)}%)`}</title>
                </circle>
              );
            })
          )}
        </svg>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
            {centerValue}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-muted)', marginTop: '2px', textTransform: 'uppercase' }}>
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 200px' }}>
        {slices.map((slice, index) => {
          const percent = total > 0 ? Math.round((slice.count / total) * 100) : 0;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.4rem 0.65rem',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--color-muted)',
                cursor: onSliceClick ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
              }}
              onClick={() => onSliceClick && onSliceClick(slice.filterKey)}
              title={onSliceClick ? `Filter view by ${slice.label}` : ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: slice.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {slice.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {slice.count}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-muted)', minWidth: '35px', textAlign: 'right' }}>
                  ({percent}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LabeledProgressBar({
  items,
  total,
  onItemClick
}: {
  items: { label: string; count: number; color: string; filterKey?: string }[];
  total: number;
  onItemClick?: (filterKey?: string) => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      backgroundColor: 'var(--color-surface, #ffffff)',
      border: '1px solid var(--color-muted)',
      borderRadius: 'var(--border-radius-sm)',
      padding: '1.25rem 1.5rem',
    }}>
      {/* Multi-Segmented Stacked Bar */}
      <div style={{
        display: 'flex',
        height: '18px',
        borderRadius: 'var(--border-radius-sm)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-muted)',
      }}>
        {total === 0 ? (
          <div style={{ width: '100%', backgroundColor: 'var(--color-muted)', opacity: 0.3 }} />
        ) : (
          items.map((item, index) => {
            const pct = (item.count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={index}
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color,
                  transition: 'width 0.3s ease',
                  cursor: onItemClick ? 'pointer' : 'default',
                }}
                onClick={() => onItemClick && onItemClick(item.filterKey)}
                title={`${item.label}: ${item.count} (${Math.round(pct)}%)`}
              />
            );
          })
        )}
      </div>

      {/* Labeled Item Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
      }}>
        {items.map((item, index) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                padding: '0.625rem 0.875rem',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-muted)',
                borderRadius: 'var(--border-radius-sm)',
                cursor: onItemClick ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
              }}
              onClick={() => onItemClick && onItemClick(item.filterKey)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted)' }}>
                  {item.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.1rem' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {item.count}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: item.color }}>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardMetrics({ metrics, guests, tasks, music, enabledModules, currency = 'USD', onNavigateTab }: DashboardMetricsProps) {
  const { totalBudget, estimatedCost, actualCost } = metrics;
  
  // Section View Modes (Cards | Pie Chart | Labeled Progress Bar)
  const [guestViewMode, setGuestViewMode] = useState<'cards' | 'pie' | 'progress'>('cards');
  const [taskViewMode, setTaskViewMode] = useState<'cards' | 'pie' | 'progress'>('cards');
  const [musicViewMode, setMusicViewMode] = useState<'cards' | 'pie' | 'progress'>('cards');

  // Default all to true if enabledModules is not supplied
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
  const remainingBudget = totalBudget - actualCost;
  const actualPercent = Math.min(Math.round((actualCost / totalBudget) * 100), 100) || 0;
  const estimatedPercent = Math.min(Math.round((estimatedCost / totalBudget) * 100), 100) || 0;

  // Guest RSVP Calculations
  const allGuests = guests || [];
  const totalGuestsInvited = allGuests.length;
  const attendingCount = allGuests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'attending').length;
  const declinedCount = allGuests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'declined').length;
  const pendingCount = allGuests.filter(g => !(g.rsvpStatus) || (g.rsvpStatus || '').toLowerCase() === 'no response' || (g.rsvpStatus || '').toLowerCase() === 'pending').length;

  // Kanban Calculations
  const allTasks = tasks || [];
  const toDoCount = allTasks.filter(t => t.kanbanStage === 'To Do').length;
  const inProgressCount = allTasks.filter(t => t.kanbanStage === 'In Progress').length;
  const doneCount = allTasks.filter(t => t.kanbanStage === 'Done').length;
  const totalTasksCount = allTasks.length;
  const taskPercentComplete = totalTasksCount > 0 ? Math.round((doneCount / totalTasksCount) * 100) : 0;

  // Music Calculations
  const allMusic = music || [];
  const adminAddedCount = allMusic.filter(s => (!s.requestedBy || s.requestedBy === 'Admin') && !s.songId.startsWith('req-')).length;
  const guestRequestedCount = allMusic.filter(s => (s.requestedBy && s.requestedBy !== 'Admin') || s.songId.startsWith('req-') || s.approvalStatus === 'Pending Approval').length;
  const pendingRequestsCount = allMusic.filter(s => s.approvalStatus === 'Pending Approval').length;
  const totalSongsCount = allMusic.length;

  return (
    <div className="metrics-container" style={styles.container}>
      {/* Financial KPI Cards Grid */}
      {modules.budget && (
        <div className="kpi-grid" style={styles.kpiGrid}>
          <div 
            className="kpi-card" 
            style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
            onClick={() => onNavigateTab && onNavigateTab('budget')}
            title={onNavigateTab ? 'Click to open Budget Manager' : ''}
          >
            <div style={styles.kpiLabel}>TOTAL BUDGET</div>
            <div style={styles.kpiValue}>
              {formatCurrency(totalBudget, currency)}
            </div>
            <div style={styles.kpiSub}>Cell B2 Config Value</div>
          </div>

          <div 
            className="kpi-card" 
            style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
            onClick={() => onNavigateTab && onNavigateTab('budget')}
            title={onNavigateTab ? 'Click to open Budget Manager' : ''}
          >
            <div style={styles.kpiLabel}>ESTIMATED COST</div>
            <div style={styles.kpiValue}>
              {formatCurrency(estimatedCost, currency)}
            </div>
            <div style={styles.kpiSub}>SUM('Budget Ledger'!D:D)</div>
          </div>

          <div 
            className="kpi-card" 
            style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
            onClick={() => onNavigateTab && onNavigateTab('budget')}
            title={onNavigateTab ? 'Click to open Budget Manager' : ''}
          >
            <div style={styles.kpiLabel}>ACTUAL COST</div>
            <div style={{ ...styles.kpiValue, color: 'var(--color-sweetheart, #000000)' }}>
              {formatCurrency(actualCost, currency)}
            </div>
            <div style={styles.kpiSub}>SUM('Budget Ledger'!E:E)</div>
          </div>

          <div 
            className="kpi-card" 
            style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
            onClick={() => onNavigateTab && onNavigateTab('budget')}
            title={onNavigateTab ? 'Click to open Budget Manager' : ''}
          >
            <div style={styles.kpiLabel}>REMAINING BUDGET</div>
            <div style={{ ...styles.kpiValue, color: remainingBudget < 0 ? 'var(--color-red)' : 'var(--color-green)' }}>
              {formatCurrency(remainingBudget, currency)}
            </div>
            <div style={styles.kpiSub}>Budget Minus Actual Spent</div>
          </div>
        </div>
      )}

      {/* Progress Bar & Ledger Balance Panel */}
      {modules.budget && (
        <div 
          className="budget-bar-panel" 
          style={{ ...styles.barPanel, cursor: onNavigateTab ? 'pointer' : 'default' }}
          onClick={() => onNavigateTab && onNavigateTab('budget')}
          title={onNavigateTab ? 'Click to open Budget Manager' : ''}
        >
          <h3 style={styles.panelTitle}>Budget Allocation Progress</h3>
          
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>
              Actual Spent: <strong>{actualPercent}%</strong> ({formatCurrency(actualCost, currency)})
            </span>
            <span style={styles.progressLabel}>
              Estimated Total: <strong>{estimatedPercent}%</strong> ({formatCurrency(estimatedCost, currency)})
            </span>
          </div>

          {/* Double-layered progress bar: estimated vs actual */}
          <div style={styles.progressTrack}>
            {/* Estimated bar */}
            <div style={{ ...styles.progressBarEstimated, width: `${estimatedPercent}%` }} />
            {/* Actual spent bar (layered on top) */}
            <div style={{ ...styles.progressBarActual, width: `${actualPercent}%` }} />
          </div>

          <div style={styles.progressFooter}>
            <div style={styles.footerItem}>
              <div style={{ ...styles.colorDot, backgroundColor: 'var(--color-primary)' }} />
              <span>Actual Cost ({formatCurrency(actualCost, currency)})</span>
            </div>
            <div style={styles.footerItem}>
              <div style={{ ...styles.colorDot, backgroundColor: 'var(--color-gold)', border: '1px solid var(--color-muted)' }} />
              <span>Estimated Outlay ({formatCurrency(estimatedCost, currency)})</span>
            </div>
            <div style={styles.footerItem}>
              <span style={{ ...styles.monoText, fontWeight: 600 }}>
                Remaining: {formatCurrency(remainingBudget, currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Guest Registry & RSVP Summary Row */}
      {modules.guests && (
        <div style={styles.sectionWrapper}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ ...styles.panelTitle, margin: 0 }}>Guest Registry & RSVP Summary</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: 'var(--color-bg)', padding: '0.2rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-muted)' }}>
              <button
                type="button"
                onClick={() => setGuestViewMode('cards')}
                style={{
                  background: guestViewMode === 'cards' ? 'var(--color-primary)' : 'transparent',
                  color: guestViewMode === 'cards' ? '#ffffff' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="View as KPI Cards"
              >
                <LayoutGrid size={15} />
              </button>

              <button
                type="button"
                onClick={() => setGuestViewMode('pie')}
                style={{
                  background: guestViewMode === 'pie' ? 'var(--color-primary)' : 'transparent',
                  color: guestViewMode === 'pie' ? '#ffffff' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="View as Pie / Donut Chart"
              >
                <PieChart size={15} />
              </button>

              <button
                type="button"
                onClick={() => setGuestViewMode('progress')}
                style={{
                  background: guestViewMode === 'progress' ? 'var(--color-primary)' : 'transparent',
                  color: guestViewMode === 'progress' ? '#ffffff' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="View as Labeled Progress Bar"
              >
                <BarChart2 size={15} />
              </button>
            </div>
          </div>

          {guestViewMode === 'cards' && (
            <div className="kpi-grid" style={styles.kpiGrid}>
              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('guests', 'All')}
                title={onNavigateTab ? 'Click to open Guest Registry' : ''}
              >
                <div style={styles.kpiLabel}>TOTAL INVITED</div>
                <div style={styles.kpiValue}>{totalGuestsInvited}</div>
                <div style={styles.kpiSub}>Guest Invites Total</div>
              </div>

              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('guests', 'Attending')}
                title={onNavigateTab ? 'Click to view Attending guests' : ''}
              >
                <div style={styles.kpiLabel}>ACCEPTED</div>
                <div style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>{attendingCount}</div>
                <div style={styles.kpiSub}>RSVP Attending</div>
              </div>

              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('guests', 'Pending')}
                title={onNavigateTab ? 'Click to view Pending guests' : ''}
              >
                <div style={styles.kpiLabel}>PENDING</div>
                <div style={{ ...styles.kpiValue, color: pendingCount > 0 ? 'var(--color-gold)' : 'var(--color-muted)' }}>{pendingCount}</div>
                <div style={styles.kpiSub}>Awaiting Response</div>
              </div>

              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('guests', 'Declined')}
                title={onNavigateTab ? 'Click to view Declined guests' : ''}
              >
                <div style={styles.kpiLabel}>DECLINED</div>
                <div style={{ ...styles.kpiValue, color: declinedCount > 0 ? 'var(--color-red)' : 'var(--color-muted)' }}>{declinedCount}</div>
                <div style={styles.kpiSub}>Unable to Attend</div>
              </div>
            </div>
          )}

          {guestViewMode === 'pie' && (
            <DonutChart
              slices={[
                { label: 'Accepted (Attending)', count: attendingCount, color: '#10b981', filterKey: 'Attending' },
                { label: 'Pending (No Response)', count: pendingCount, color: '#f59e0b', filterKey: 'Pending' },
                { label: 'Declined (Unable to Attend)', count: declinedCount, color: '#ef4444', filterKey: 'Declined' },
              ]}
              centerLabel="Invited"
              centerValue={totalGuestsInvited}
              onSliceClick={(filterKey) => onNavigateTab && onNavigateTab('guests', filterKey || 'All')}
            />
          )}

          {guestViewMode === 'progress' && (
            <LabeledProgressBar
              items={[
                { label: 'Accepted', count: attendingCount, color: '#10b981', filterKey: 'Attending' },
                { label: 'Pending', count: pendingCount, color: '#f59e0b', filterKey: 'Pending' },
                { label: 'Declined', count: declinedCount, color: '#ef4444', filterKey: 'Declined' },
              ]}
              total={totalGuestsInvited}
              onItemClick={(filterKey) => onNavigateTab && onNavigateTab('guests', filterKey || 'All')}
            />
          )}
        </div>
      )}

      {/* Kanban Checklist Progress Row */}
      {modules.tasks && (
        <div style={styles.sectionWrapper}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ ...styles.panelTitle, margin: 0 }}>Kanban Checklist Progress</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: 'var(--color-bg)', padding: '0.2rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-muted)' }}>
              <button
                type="button"
                onClick={() => setTaskViewMode('cards')}
                style={{
                  background: taskViewMode === 'cards' ? 'var(--color-primary)' : 'transparent',
                  color: taskViewMode === 'cards' ? '#ffffff' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="View as KPI Cards"
              >
                <LayoutGrid size={15} />
              </button>

              <button
                type="button"
                onClick={() => setTaskViewMode('pie')}
                style={{
                  background: taskViewMode === 'pie' ? 'var(--color-primary)' : 'transparent',
                  color: taskViewMode === 'pie' ? '#ffffff' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="View as Pie / Donut Chart"
              >
                <PieChart size={15} />
              </button>

              <button
                type="button"
                onClick={() => setTaskViewMode('progress')}
                style={{
                  background: taskViewMode === 'progress' ? 'var(--color-primary)' : 'transparent',
                  color: taskViewMode === 'progress' ? '#ffffff' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="View as Labeled Progress Bar"
              >
                <BarChart2 size={15} />
              </button>
            </div>
          </div>

          {taskViewMode === 'cards' && (
            <div className="kpi-grid" style={styles.kpiGrid}>
              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('tasks', 'To Do')}
                title={onNavigateTab ? 'Click to view To Do tasks' : ''}
              >
                <div style={styles.kpiLabel}>TO DO</div>
                <div style={{ ...styles.kpiValue, color: toDoCount > 0 ? 'var(--color-red)' : 'var(--color-muted)' }}>{toDoCount}</div>
                <div style={styles.kpiSub}>Pending Tasks</div>
              </div>

              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('tasks', 'In Progress')}
                title={onNavigateTab ? 'Click to view In Progress tasks' : ''}
              >
                <div style={styles.kpiLabel}>IN PROGRESS</div>
                <div style={{ ...styles.kpiValue, color: inProgressCount > 0 ? 'var(--color-gold)' : 'var(--color-muted)' }}>{inProgressCount}</div>
                <div style={styles.kpiSub}>Active Tasks</div>
              </div>

              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('tasks', 'Done')}
                title={onNavigateTab ? 'Click to view Completed tasks' : ''}
              >
                <div style={styles.kpiLabel}>COMPLETED</div>
                <div style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>{doneCount}</div>
                <div style={styles.kpiSub}>Done ({doneCount}/{totalTasksCount})</div>
              </div>

              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('tasks')}
                title={onNavigateTab ? 'Click to open Kanban Checklist' : ''}
              >
                <div style={styles.kpiLabel}>% COMPLETE</div>
                <div style={{ ...styles.kpiValue, color: 'var(--color-primary)' }}>{taskPercentComplete}%</div>
                <div style={{ ...styles.progressTrack, height: '6px', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                  <div style={{ ...styles.progressBarActual, width: `${taskPercentComplete}%` }} />
                </div>
                <div style={styles.kpiSub}>Task Completion Ratio</div>
              </div>
            </div>
          )}

          {taskViewMode === 'pie' && (
            <DonutChart
              slices={[
                { label: 'Completed (Done)', count: doneCount, color: '#10b981', filterKey: 'Done' },
                { label: 'In Progress', count: inProgressCount, color: '#f59e0b', filterKey: 'In Progress' },
                { label: 'To Do (Pending)', count: toDoCount, color: '#ef4444', filterKey: 'To Do' },
              ]}
              centerLabel="Complete"
              centerValue={`${taskPercentComplete}%`}
              onSliceClick={(filterKey) => onNavigateTab && onNavigateTab('tasks', filterKey)}
            />
          )}

          {taskViewMode === 'progress' && (
            <LabeledProgressBar
              items={[
                { label: 'Completed', count: doneCount, color: '#10b981', filterKey: 'Done' },
                { label: 'In Progress', count: inProgressCount, color: '#f59e0b', filterKey: 'In Progress' },
                { label: 'To Do', count: toDoCount, color: '#ef4444', filterKey: 'To Do' },
              ]}
              total={totalTasksCount}
              onItemClick={(filterKey) => onNavigateTab && onNavigateTab('tasks', filterKey)}
            />
          )}
        </div>
      )}

      {/* Music Playlist Summary Row */}
      {modules.music && (
        <div style={styles.sectionWrapper}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ ...styles.panelTitle, margin: 0 }}>Music Playlist Summary</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: 'var(--color-bg)', padding: '0.2rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-muted)' }}>
              <button
                type="button"
                onClick={() => setMusicViewMode('cards')}
                style={{
                  background: musicViewMode === 'cards' ? 'var(--color-primary)' : 'transparent',
                  color: musicViewMode === 'cards' ? '#ffffff' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="View as KPI Cards"
              >
                <LayoutGrid size={15} />
              </button>

              <button
                type="button"
                onClick={() => setMusicViewMode('pie')}
                style={{
                  background: musicViewMode === 'pie' ? 'var(--color-primary)' : 'transparent',
                  color: musicViewMode === 'pie' ? '#ffffff' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="View as Pie / Donut Chart"
              >
                <PieChart size={15} />
              </button>

              <button
                type="button"
                onClick={() => setMusicViewMode('progress')}
                style={{
                  background: musicViewMode === 'progress' ? 'var(--color-primary)' : 'transparent',
                  color: musicViewMode === 'progress' ? '#ffffff' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.25rem 0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="View as Labeled Progress Bar"
              >
                <BarChart2 size={15} />
              </button>
            </div>
          </div>

          {musicViewMode === 'cards' && (
            <div className="kpi-grid" style={styles.kpiGrid}>
              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('music', 'ALL')}
                title={onNavigateTab ? 'Click to view Admin songs' : ''}
              >
                <div style={styles.kpiLabel}>ADDED BY ADMIN</div>
                <div style={{ ...styles.kpiValue, color: 'var(--color-primary)' }}>{adminAddedCount}</div>
                <div style={styles.kpiSub}>Curated Track List</div>
              </div>

              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('music', 'PENDING APPROVAL')}
                title={onNavigateTab ? 'Click to view Guest song requests' : ''}
              >
                <div style={styles.kpiLabel}>GUEST REQUESTS</div>
                <div style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>{guestRequestedCount}</div>
                <div style={styles.kpiSub}>Approved + Declined + Pending</div>
              </div>

              <div 
                className="kpi-card" 
                style={{
                  ...styles.kpiCard,
                  cursor: onNavigateTab ? 'pointer' : 'default',
                  borderColor: pendingRequestsCount > 0 ? '#f59e0b' : 'var(--color-muted)',
                  backgroundColor: pendingRequestsCount > 0 ? '#fffbeb' : 'var(--color-surface, #ffffff)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onNavigateTab && onNavigateTab('music', 'PENDING APPROVAL')}
                title={onNavigateTab ? 'Click to open Music Manager pending requests view' : ''}
              >
                <div style={{ ...styles.kpiLabel, color: pendingRequestsCount > 0 ? '#92400e' : 'var(--color-text)' }}>
                  PENDING REQUESTS
                </div>
                <div style={{ ...styles.kpiValue, color: pendingRequestsCount > 0 ? '#f59e0b' : 'var(--color-muted)' }}>
                  {pendingRequestsCount}
                </div>
                <div style={{ ...styles.kpiSub, color: pendingRequestsCount > 0 ? '#b45309' : 'var(--color-muted)', fontWeight: pendingRequestsCount > 0 ? 600 : 400 }}>
                  {pendingRequestsCount > 0 ? 'Click to Review & Approve ➔' : 'No Pending Requests'}
                </div>
              </div>

              <div 
                className="kpi-card" 
                style={{ ...styles.kpiCard, cursor: onNavigateTab ? 'pointer' : 'default' }}
                onClick={() => onNavigateTab && onNavigateTab('music', 'ALL')}
                title={onNavigateTab ? 'Click to open Music Manager' : ''}
              >
                <div style={styles.kpiLabel}>TOTAL TRACKS</div>
                <div style={styles.kpiValue}>{totalSongsCount}</div>
                <div style={styles.kpiSub}>Full Catalog Total</div>
              </div>
            </div>
          )}

          {musicViewMode === 'pie' && (
            <DonutChart
              slices={[
                { label: 'Admin Curated Tracks', count: adminAddedCount, color: 'var(--color-primary)', filterKey: 'ALL' },
                { label: 'Guest Requests (Approved)', count: Math.max(0, guestRequestedCount - pendingRequestsCount), color: '#10b981', filterKey: 'ALL' },
                { label: 'Pending Approval Requests', count: pendingRequestsCount, color: '#f59e0b', filterKey: 'PENDING APPROVAL' },
              ]}
              centerLabel="Tracks"
              centerValue={totalSongsCount}
              onSliceClick={(filterKey) => onNavigateTab && onNavigateTab('music', filterKey || 'ALL')}
            />
          )}

          {musicViewMode === 'progress' && (
            <LabeledProgressBar
              items={[
                { label: 'Admin Curated', count: adminAddedCount, color: 'var(--color-primary)', filterKey: 'ALL' },
                { label: 'Guest Requests', count: Math.max(0, guestRequestedCount - pendingRequestsCount), color: '#10b981', filterKey: 'ALL' },
                { label: 'Pending Requests', count: pendingRequestsCount, color: '#f59e0b', filterKey: 'PENDING APPROVAL' },
              ]}
              total={totalSongsCount}
              onItemClick={(filterKey) => onNavigateTab && onNavigateTab('music', filterKey || 'ALL')}
            />
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  sectionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  kpiCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'var(--transition-smooth)',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  kpiHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  infoBtn: {
    padding: '0.2rem 0.35rem',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--color-muted)',
    transition: 'all 0.2s ease',
  },
  kpiLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'var(--color-muted)',
  },
  kpiValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    lineHeight: '1.2',
  },
  kpiSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    color: 'var(--color-muted)',
    marginTop: '0.5rem',
    letterSpacing: '0.02em',
  },
  formulaBox: {
    marginTop: '0.5rem',
    padding: '0.4rem 0.6rem',
    backgroundColor: '#1e293b',
    color: '#00ED64',
    borderRadius: '4px',
    border: '1px solid var(--color-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  formulaTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.55rem',
    color: '#94a3b8',
    letterSpacing: '0.05em',
  },
  formulaCode: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 600,
    color: '#00ED64',
    wordBreak: 'break-all',
  },
  barPanel: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.5rem',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  panelTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: 'var(--color-primary)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text)',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  progressLabel: {
    fontSize: '0.75rem',
  },
  progressTrack: {
    position: 'relative',
    height: '14px',
    backgroundColor: '#f1f1f1',
    borderRadius: '7px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressBarEstimated: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'var(--color-highlight)',
    borderRadius: '7px 0 0 7px',
    transition: 'width 0.4s ease',
  },
  progressBarActual: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '7px 0 0 7px',
    transition: 'width 0.4s ease',
    zIndex: 2,
  },
  progressFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  colorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  monoText: {
    fontFamily: 'var(--font-mono)',
  }
};
