'use client';

import React, { useMemo } from 'react';
import { 
  Utensils, 
  FileText, 
  Sparkles, 
  Printer, 
  Layers
} from 'lucide-react';
import { Guest, TableConfig } from '@/types/wedding';

interface SeatingActionBarProps {
  tables: TableConfig[];
  guests: Guest[];
  onOpenCateringDossier: () => void;
  onOpenEscortChart: (tab?: 'alphabetical' | 'table_roster' | 'canva_studio') => void;
  onOpenPrintStudio?: () => void;
  className?: string;
}

export default function SeatingActionBar({
  tables,
  guests,
  onOpenCateringDossier,
  onOpenEscortChart,
  onOpenPrintStudio,
  className = '',
}: SeatingActionBarProps) {
  // Compute seated guests and allergy counts
  const seatedGuests = useMemo(() => {
    return guests.filter(g => 
      (g.rsvpStatus || '').toLowerCase() !== 'declined' && 
      g.tableAssignment && 
      g.tableAssignment !== 'Unassigned'
    );
  }, [guests]);

  const allergyCount = useMemo(() => {
    return seatedGuests.filter(g => {
      const diet = (g.dietaryRestrictions || '').trim().toLowerCase();
      return Boolean(diet && diet !== 'none' && diet !== 'n/a' && diet !== 'no');
    }).length;
  }, [seatedGuests]);

  const hasSeatedGuests = seatedGuests.length > 0;
  const eligibleCount = useMemo(
    () => guests.filter(g => (g.rsvpStatus || '').toLowerCase() !== 'declined').length,
    [guests]
  );

  return (
    <div 
      className={`seating-action-bar mb-5 p-3.5 sm:p-4 rounded-[3px] border-[0.5px] border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs transition-all ${className}`}
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Left: Section Header & Context */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[3px] bg-[var(--color-highlight)]/10 text-[var(--color-highlight)] flex items-center justify-center shrink-0 border-[0.5px] border-[var(--color-highlight)]/20">
            <Layers size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text)]">
                Event-Day Deliverables
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] font-medium bg-[var(--color-surface-hover)] text-[var(--color-muted)] border-[0.5px] border-[var(--color-border)] whitespace-nowrap">
                {seatedGuests.length} / {eligibleCount} seated
              </span>
            </div>
            <p className="hidden sm:block text-[12px] text-[var(--color-muted)] mt-0.5">
              Export floor plan assets for your caterer, lobby easel sign, and Canva stationery.
            </p>
          </div>
        </div>

        {/* Right: Responsive 2-col Mobile Grid -> Flex Row on Desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2">
          {/* 1. Chef's Catering Dossier */}
          <button
            type="button"
            onClick={onOpenCateringDossier}
            disabled={!hasSeatedGuests}
            title={hasSeatedGuests ? "Generate kitchen-ready catering dossier with entree counts & allergies" : "Assign guests to tables first"}
            className="inline-flex items-center justify-start sm:justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-[3px] text-[11px] sm:text-[12px] font-semibold tracking-tight sm:tracking-wide border-[0.5px] border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <Utensils size={15} className="text-[var(--color-highlight)] shrink-0" />
            <span className="truncate">Catering Dossier</span>
            {allergyCount > 0 && (
              <span className="ml-auto sm:ml-0.5 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border-[0.5px] border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 shrink-0">
                {allergyCount}
              </span>
            )}
          </button>

          {/* 2. Alphabetical Escort Chart (Easel Sign) */}
          <button
            type="button"
            onClick={() => onOpenEscortChart('alphabetical')}
            disabled={!hasSeatedGuests}
            title={hasSeatedGuests ? "Preview and print alphabetical escort entrance chart (A–Z)" : "Assign guests to tables first"}
            className="inline-flex items-center justify-start sm:justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-[3px] text-[11px] sm:text-[12px] font-semibold tracking-tight sm:tracking-wide border-[0.5px] border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <FileText size={15} className="text-[var(--color-text)] shrink-0" />
            <span className="truncate">Easel Sign (A–Z)</span>
          </button>

          {/* 3. Canva Place Cards & CSV */}
          <button
            type="button"
            onClick={() => onOpenEscortChart('canva_studio')}
            disabled={!hasSeatedGuests}
            title={hasSeatedGuests ? "Export Canva Bulk Create CSV and design matching place cards" : "Assign guests to tables first"}
            className={`inline-flex items-center justify-start sm:justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-[3px] text-[11px] sm:text-[12px] font-semibold tracking-tight sm:tracking-wide border-[0.5px] border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${!onOpenPrintStudio ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="truncate">Canva CSV</span>
          </button>

          {/* 4. Optional Table Tent Print Studio Trigger */}
          {onOpenPrintStudio && (
            <button
              type="button"
              onClick={onOpenPrintStudio}
              title="Open full print studio for folded table tent cards & rosters"
              className="inline-flex items-center justify-start sm:justify-center gap-1.5 px-2.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-[3px] text-[11px] sm:text-[12px] font-semibold border-[0.5px] border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] sm:text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <Printer size={15} className="shrink-0" />
              <span className="sm:hidden truncate">Table Tents</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
