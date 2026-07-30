'use client';

import React from 'react';
import { DashboardSummary, Guest, Task, Song } from '@/lib/sheets/types';
import { Edit2 } from 'lucide-react';
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
}

export default function DashboardMetrics({ metrics, guests, tasks, music, enabledModules, currency = 'USD' }: DashboardMetricsProps) {
  const { totalBudget, estimatedCost, actualCost } = metrics;
  
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
  const playlistSongsCount = allMusic.filter(s => s.listType !== 'Do Not Play').length;
  const bannedSongsCount = allMusic.filter(s => s.listType === 'Do Not Play').length;
  const totalSongsCount = allMusic.length;

  return (
    <div className="metrics-container" style={styles.container}>
      {/* Financial KPI Cards Grid */}
      {modules.budget && (
        <div className="kpi-grid" style={styles.kpiGrid}>
          <div className="kpi-card" style={styles.kpiCard}>
            <div style={styles.kpiLabel}>TOTAL BUDGET</div>
            <div style={styles.kpiValue}>
              {formatCurrency(totalBudget, currency)}
            </div>
            <div style={styles.kpiSub}>Cell B2 Config Value</div>
          </div>

          <div className="kpi-card" style={styles.kpiCard}>
            <div style={styles.kpiLabel}>ESTIMATED COST</div>
            <div style={styles.kpiValue}>
              {formatCurrency(estimatedCost, currency)}
            </div>
            <div style={styles.kpiSub}>SUM('Budget Ledger'!D:D)</div>
          </div>

          <div className="kpi-card" style={styles.kpiCard}>
            <div style={styles.kpiLabel}>ACTUAL COST</div>
            <div style={{ ...styles.kpiValue, color: 'var(--color-primary)' }}>
              {formatCurrency(actualCost, currency)}
            </div>
            <div style={styles.kpiSub}>SUM('Budget Ledger'!E:E)</div>
          </div>

          <div className="kpi-card" style={styles.kpiCard}>
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
        <div className="budget-bar-panel" style={styles.barPanel}>
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
          <h3 style={styles.panelTitle}>Guest Registry & RSVP Summary</h3>
          <div className="kpi-grid" style={styles.kpiGrid}>
            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>TOTAL INVITED</div>
              <div style={styles.kpiValue}>
                {totalGuestsInvited}
              </div>
              <div style={styles.kpiSub}>Guest Invites Total</div>
            </div>

            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>ACCEPTED</div>
              <div style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>
                {attendingCount}
              </div>
              <div style={styles.kpiSub}>RSVP Attending</div>
            </div>

            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>PENDING</div>
              <div style={{ ...styles.kpiValue, color: pendingCount > 0 ? 'var(--color-gold)' : 'var(--color-muted)' }}>
                {pendingCount}
              </div>
              <div style={styles.kpiSub}>Awaiting Response</div>
            </div>

            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>DECLINED</div>
              <div style={{ ...styles.kpiValue, color: declinedCount > 0 ? 'var(--color-red)' : 'var(--color-muted)' }}>
                {declinedCount}
              </div>
              <div style={styles.kpiSub}>Unable to Attend</div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Checklist Progress Row */}
      {modules.tasks && (
        <div style={styles.sectionWrapper}>
          <h3 style={styles.panelTitle}>Kanban Checklist Progress</h3>
          <div className="kpi-grid" style={styles.kpiGrid}>
            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>TO DO</div>
              <div style={{ ...styles.kpiValue, color: toDoCount > 0 ? 'var(--color-red)' : 'var(--color-muted)' }}>
                {toDoCount}
              </div>
              <div style={styles.kpiSub}>Pending Tasks</div>
            </div>

            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>IN PROGRESS</div>
              <div style={{ ...styles.kpiValue, color: inProgressCount > 0 ? 'var(--color-gold)' : 'var(--color-muted)' }}>
                {inProgressCount}
              </div>
              <div style={styles.kpiSub}>Active Tasks</div>
            </div>

            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>COMPLETED</div>
              <div style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>
                {doneCount}
              </div>
              <div style={styles.kpiSub}>Done ({doneCount}/{totalTasksCount})</div>
            </div>

            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>% COMPLETE</div>
              <div style={{ ...styles.kpiValue, color: 'var(--color-primary)' }}>
                {taskPercentComplete}%
              </div>
              <div style={{ ...styles.progressTrack, height: '6px', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                <div style={{ ...styles.progressBarActual, width: `${taskPercentComplete}%` }} />
              </div>
              <div style={styles.kpiSub}>Task Completion Ratio</div>
            </div>
          </div>
        </div>
      )}

      {/* Music Playlist Summary Row */}
      {modules.music && (
        <div style={styles.sectionWrapper}>
          <h3 style={styles.panelTitle}>Wedding Playlist Summary</h3>
          <div className="kpi-grid" style={styles.kpiGrid}>
            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>PLAYLIST SONGS</div>
              <div style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>
                {playlistSongsCount}
              </div>
              <div style={styles.kpiSub}>Must Play / Ceremony / Reception</div>
            </div>

            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>BANNED SONGS</div>
              <div style={{ ...styles.kpiValue, color: bannedSongsCount > 0 ? 'var(--color-red)' : 'var(--color-muted)' }}>
                {bannedSongsCount}
              </div>
              <div style={styles.kpiSub}>Do Not Play Tracks</div>
            </div>

            <div className="kpi-card" style={styles.kpiCard}>
              <div style={styles.kpiLabel}>TOTAL TRACKS</div>
              <div style={styles.kpiValue}>
                {totalSongsCount}
              </div>
              <div style={styles.kpiSub}>Catalog Total</div>
            </div>
          </div>
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
