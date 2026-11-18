'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Users, 
  X, 
  RotateCcw, 
  AlertTriangle,
  MapPin,
  Clock
} from 'lucide-react';
import { Guest, TableConfig } from '@/types/wedding';
import { categorizeMeal } from './CateringDossierModal';

interface DayOfUsherViewProps {
  guests: Guest[];
  tables: TableConfig[];
  storageKey?: string;
}

interface CheckInRecord {
  checkedInAt: string; // Formatted time string e.g. "5:14 PM"
  timestamp: number;
}

export default function DayOfUsherView({
  guests,
  tables,
  storageKey = 's2v_usher_checkins_default',
}: DayOfUsherViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'arrived'>('all');
  const [confirmReset, setConfirmReset] = useState(false);

  // Offline-resilient check-in state persisted in localStorage
  const [checkIns, setCheckIns] = useState<Record<string, CheckInRecord>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to read usher check-ins from localStorage:', e);
      }
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(checkIns));
      } catch (e) {
        console.error('Failed to persist usher check-ins:', e);
      }
    }
  }, [checkIns, storageKey]);

  // Eligible guests (exclude declined)
  const eligibleGuests = useMemo(() => {
    return guests
      .filter(g => (g.rsvpStatus || '').toLowerCase() !== 'declined')
      .sort((a, b) => {
        const lastCompare = (a.lastName || '').localeCompare(b.lastName || '');
        if (lastCompare !== 0) return lastCompare;
        return (a.firstName || '').localeCompare(b.firstName || '');
      });
  }, [guests]);

  // Helper to resolve table display name
  const resolveTableName = (assignment?: string): string => {
    if (!assignment || assignment === 'Unassigned') return 'Unassigned';
    const match = tables.find(
      t =>
        t.tableId.toLowerCase() === assignment.toLowerCase() ||
        t.tableName.toLowerCase() === assignment.toLowerCase()
    );
    return match ? match.tableName : assignment;
  };

  // Toggle guest check-in
  const toggleCheckIn = (guestId: string) => {
    setCheckIns(prev => {
      const next = { ...prev };
      if (next[guestId]) {
        delete next[guestId];
      } else {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        next[guestId] = {
          checkedInAt: timeStr,
          timestamp: now.getTime(),
        };
      }
      return next;
    });
  };

  const handleResetAll = () => {
    setCheckIns({});
    setConfirmReset(false);
  };

  // Live Arrival Counts
  const totalCount = eligibleGuests.length;
  const arrivedCount = useMemo(
    () => eligibleGuests.filter(g => Boolean(checkIns[g.guestId])).length,
    [eligibleGuests, checkIns]
  );
  const pendingCount = totalCount - arrivedCount;
  const progressPct = totalCount > 0 ? Math.round((arrivedCount / totalCount) * 100) : 0;

  // Filtered guests list
  const filteredGuests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return eligibleGuests.filter(g => {
      const isArrived = Boolean(checkIns[g.guestId]);
      if (filterMode === 'arrived' && !isArrived) return false;
      if (filterMode === 'pending' && isArrived) return false;

      if (!q) return true;
      const fullName = `${g.firstName || ''} ${g.lastName || ''}`.toLowerCase();
      const reverseName = `${g.lastName || ''}, ${g.firstName || ''}`.toLowerCase();
      const party = (g.partyGroup || '').toLowerCase();
      const tableName = resolveTableName(g.tableAssignment).toLowerCase();
      return (
        fullName.includes(q) ||
        reverseName.includes(q) ||
        party.includes(q) ||
        tableName.includes(q)
      );
    });
  }, [eligibleGuests, checkIns, filterMode, searchQuery, tables]);

  return (
    <div className="space-y-4">
      {/* Live Arrival Counter Card */}
      <div className="p-4 sm:p-5 rounded-[3px] border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[3px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--color-muted)]">
                  Live Reception Check-In
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 font-mono font-bold">
                  OFFLINE-READY
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-text)] font-mono mt-0.5">
                {arrivedCount} <span className="text-sm font-semibold text-[var(--color-muted)]">/ {totalCount} Guests Arrived ({progressPct}%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                disabled={arrivedCount === 0}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[3px] text-xs font-mono font-semibold border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-40 transition-colors"
                title="Clear check-in records for rehearsal/reset"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-[3px] border border-red-200 dark:border-red-800">
                <span className="text-[11px] font-mono font-bold text-red-700 dark:text-red-300">Clear all?</span>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-mono font-bold"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[var(--color-text)] text-[11px] font-mono border border-[var(--color-border)]"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[var(--color-bg,#f1f5f9)] rounded-full overflow-hidden border border-[var(--color-border,#e2e8f0)]">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest name, party, or table..."
            className="w-full pl-10 pr-9 py-2.5 min-h-[46px] rounded-[3px] border border-[var(--color-border,#cbd5e1)] bg-[var(--color-surface,#ffffff)] text-[16px] sm:text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight,#4f46e5)]/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--color-muted)] hover:text-[var(--color-text)]"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 bg-[var(--color-surface)] p-1 rounded-[3px] border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-2 sm:py-1.5 rounded-[2px] text-xs font-mono font-bold transition-colors ${
              filterMode === 'all'
                ? 'bg-[var(--color-primary,#0f172a)] text-[var(--color-on-primary,#ffffff)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            ALL ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-2 sm:py-1.5 rounded-[2px] text-xs font-mono font-bold transition-colors ${
              filterMode === 'pending'
                ? 'bg-amber-600 text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            PENDING ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('arrived')}
            className={`px-3 py-2 sm:py-1.5 rounded-[2px] text-xs font-mono font-bold transition-colors ${
              filterMode === 'arrived'
                ? 'bg-emerald-600 text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            ARRIVED ({arrivedCount})
          </button>
        </div>
      </div>

      {/* Guest Check-In List */}
      <div className="space-y-2">
        {filteredGuests.length === 0 ? (
          <div className="p-8 text-center rounded-[3px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]">
            <Users size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No matching guests found</p>
            <p className="text-xs mt-1">Try clearing your search or switching filter tabs.</p>
          </div>
        ) : (
          filteredGuests.map((guest) => {
            const record = checkIns[guest.guestId];
            const isArrived = Boolean(record);
            const tableName = resolveTableName(guest.tableAssignment);
            const isUnassigned = tableName === 'Unassigned';
            const mealInfo = guest.mealChoice ? categorizeMeal(guest.mealChoice) : null;
            const hasAllergy = Boolean(
              guest.dietaryRestrictions &&
              guest.dietaryRestrictions.trim() !== '' &&
              guest.dietaryRestrictions.toLowerCase() !== 'none' &&
              guest.dietaryRestrictions.toLowerCase() !== 'n/a'
            );

            return (
              <div
                key={guest.guestId}
                className={`p-3.5 sm:p-4 rounded-[3px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isArrived
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-[var(--color-surface,#ffffff)] border-[var(--color-border,#e2e8f0)]'
                }`}
              >
                {/* Guest Details */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-[var(--color-text)]">
                      {guest.firstName} {guest.lastName}
                    </span>
                    {guest.partyGroup && guest.partyGroup.toLowerCase() !== 'general' && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-muted)] font-medium">
                        {guest.partyGroup}
                      </span>
                    )}
                  </div>

                  {/* Table + Seat + Meal + Allergy Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] font-mono font-bold ${
                        isUnassigned
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      }`}
                    >
                      <MapPin size={12} />
                      {tableName}
                      {!isUnassigned && guest.seatNumber ? ` • Seat #${guest.seatNumber}` : ''}
                    </span>

                    {guest.ceremonySeating && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 font-mono text-[11px]">
                        Ceremony: {guest.ceremonySeating}
                      </span>
                    )}

                    {mealInfo && mealInfo.category !== 'Not Selected' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] font-medium">
                        <span>{mealInfo.emoji}</span>
                        <span>{guest.mealChoice}</span>
                      </span>
                    )}

                    {hasAllergy && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800 text-[11px] font-bold">
                        <AlertTriangle size={11} />
                        <span>{guest.dietaryRestrictions}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Large 1-Tap Check-In Button */}
                <button
                  type="button"
                  onClick={() => toggleCheckIn(guest.guestId)}
                  className={`w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-[3px] font-mono text-xs font-bold tracking-wider inline-flex items-center justify-center gap-2 transition-all shrink-0 ${
                    isArrived
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-[var(--color-primary,#0f172a)] hover:opacity-90 text-[var(--color-on-primary,#ffffff)] shadow-xs'
                  }`}
                >
                  {isArrived ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>ARRIVED • {record.checkedInAt}</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={16} />
                      <span>CHECK IN</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
