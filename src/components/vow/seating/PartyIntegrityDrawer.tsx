'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import { Guest, TableConfig } from '@/types/wedding';

interface PartyIntegrityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  tables: TableConfig[];
  onReuniteParty: (partyName: string, targetTableId: string) => Promise<void>;
  isSyncing?: boolean;
}

export interface SplitPartyInfo {
  partyName: string;
  members: Guest[];
  tableIds: string[];
  tableNames: string[];
  isSplit: boolean;
}

// Helper to compute all split parties across attending guests
export function computeSplitParties(guests: Guest[], tables: TableConfig[]): SplitPartyInfo[] {
  const tableMap = new Map<string, string>();
  tables.forEach(t => {
    tableMap.set(t.tableId.toLowerCase(), t.tableName);
    tableMap.set(t.tableName.toLowerCase(), t.tableName);
  });

  const partyMap = new Map<string, Guest[]>();

  guests.forEach(g => {
    if ((g.rsvpStatus || '').toLowerCase() === 'declined') return;
    const rawGroup = (g.partyGroup || '').trim();
    if (!rawGroup || rawGroup.toLowerCase() === 'general' || rawGroup.toLowerCase() === 'none') return;

    if (!partyMap.has(rawGroup)) {
      partyMap.set(rawGroup, []);
    }
    partyMap.get(rawGroup)!.push(g);
  });

  const splitParties: SplitPartyInfo[] = [];

  partyMap.forEach((members, partyName) => {
    if (members.length < 2) return;

    const assignmentSet = new Set<string>();
    const namesSet = new Set<string>();

    members.forEach(m => {
      const assign = (m.tableAssignment || 'Unassigned').trim();
      assignmentSet.add(assign.toLowerCase());

      if (assign.toLowerCase() === 'unassigned') {
        namesSet.add('Unassigned Pool');
      } else {
        const resolvedName = tableMap.get(assign.toLowerCase()) || assign;
        namesSet.add(resolvedName);
      }
    });

    if (assignmentSet.size > 1) {
      splitParties.push({
        partyName,
        members,
        tableIds: Array.from(assignmentSet),
        tableNames: Array.from(namesSet),
        isSplit: true,
      });
    }
  });

  // Sort parties with highest member count first
  return splitParties.sort((a, b) => b.members.length - a.members.length);
}

export default function PartyIntegrityDrawer({
  isOpen,
  onClose,
  guests,
  tables,
  onReuniteParty,
  isSyncing,
}: PartyIntegrityDrawerProps) {
  const [selectedTables, setSelectedTables] = useState<Record<string, string>>({});
  const [successParty, setSuccessParty] = useState<string | null>(null);

  const splitParties = useMemo(() => computeSplitParties(guests, tables), [guests, tables]);

  if (!isOpen) return null;

  const handleReunite = async (partyName: string, defaultTableId?: string) => {
    const target = selectedTables[partyName] || defaultTableId;
    if (!target) return;
    await onReuniteParty(partyName, target);
    setSuccessParty(partyName);
    setTimeout(() => setSuccessParty(null), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[var(--color-surface,white)] text-[var(--color-text,#0f172a)] h-full shadow-2xl flex flex-col border-l border-[var(--color-border,#e2e8f0)] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border,#e2e8f0)] flex items-center justify-between bg-[var(--color-surface)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[3px] bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase flex items-center gap-2">
                Party Integrity Guard
                {splitParties.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    {splitParties.length} {splitParties.length === 1 ? 'Party Split' : 'Parties Split'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-[var(--color-muted,#64748b)] mt-0.5">
                Ensure couples and families sit together without accidental table separation.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-[3px] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {splitParties.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-[var(--color-border,#e2e8f0)] rounded-[3px] bg-[var(--color-bg,#f8fafc)]">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                100% Party Integrity Verified
              </h4>
              <p className="text-xs text-[var(--color-muted,#64748b)] mt-1 max-w-xs mx-auto">
                All multi-guest parties, couples, and family units are currently seated together at the same tables.
              </p>
            </div>
          ) : (
            splitParties.map((party) => {
              // Calculate available table options with remaining capacity
              const currentTarget = selectedTables[party.partyName] || party.tableIds.find(id => id.toLowerCase() !== 'unassigned') || tables[0]?.tableId;

              return (
                <div 
                  key={party.partyName}
                  className="p-4 rounded-[3px] border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface)] shadow-xs transition-all hover:border-[var(--color-highlight,#4f46e5)]/40"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-[2px] border border-amber-200 dark:border-amber-800">
                        SPLIT ACROSS {party.tableNames.length} LOCATIONS
                      </span>
                      <h4 className="text-sm font-bold mt-1 text-[var(--color-text)]">
                        {party.partyName}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-muted)]">
                      {party.members.length} members
                    </span>
                  </div>

                  {/* Current Member Locations */}
                  <div className="space-y-1.5 mb-3.5 pt-2 border-t border-[var(--color-border,#e2e8f0)]/60">
                    {party.members.map((member) => {
                      const assign = member.tableAssignment || 'Unassigned';
                      const isUnassigned = assign.toLowerCase() === 'unassigned';
                      const tableObj = tables.find(t => t.tableId.toLowerCase() === assign.toLowerCase() || t.tableName.toLowerCase() === assign.toLowerCase());
                      const displayLoc = isUnassigned ? 'Unassigned Pool' : (tableObj?.tableName || assign);

                      return (
                        <div key={member.guestId} className="flex items-center justify-between text-xs py-0.5">
                          <span className="font-medium text-[var(--color-text)]">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className={`inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded ${isUnassigned ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                            <MapPin size={10} />
                            {displayLoc}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 1-Click Reunite Action Bar */}
                  <div className="pt-2 border-t border-[var(--color-border,#e2e8f0)]/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={currentTarget}
                      onChange={(e) => setSelectedTables(prev => ({ ...prev, [party.partyName]: e.target.value }))}
                      disabled={isSyncing}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-[3px] border border-[var(--color-border,#cbd5e1)] bg-[var(--color-bg,#ffffff)] text-[var(--color-text)] font-mono"
                    >
                      {tables.map(t => {
                        const seatedCount = guests.filter(g => 
                          (g.rsvpStatus || '').toLowerCase() !== 'declined' &&
                          ((g.tableAssignment || '').toLowerCase() === t.tableId.toLowerCase() ||
                           (g.tableAssignment || '').toLowerCase() === t.tableName.toLowerCase())
                        ).length;
                        const openSeats = Math.max(0, t.capacity - seatedCount);

                        return (
                          <option key={t.tableId} value={t.tableId}>
                            Seat at {t.tableName} ({openSeats} open seats)
                          </option>
                        );
                      })}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleReunite(party.partyName, currentTarget)}
                      disabled={isSyncing || !currentTarget}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-bold font-mono tracking-wider bg-[var(--color-primary,#0f172a)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                    >
                      <HeartHandshake size={13} />
                      <span>REUNITE ALL</span>
                    </button>
                  </div>

                  {successParty === party.partyName && (
                    <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 size={13} />
                      <span>Reunited all members successfully!</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--color-border,#e2e8f0)] bg-[var(--color-bg,#f8fafc)] flex items-center justify-between text-xs text-[var(--color-muted,#64748b)]">
          <span>{splitParties.length} split family or group alerts</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold rounded-[3px] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
