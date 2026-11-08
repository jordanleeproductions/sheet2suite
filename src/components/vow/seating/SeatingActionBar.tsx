'use client';

import React, { useMemo } from 'react';
import { 
  Utensils, 
  FileText, 
  Sparkles, 
  Printer, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  Layers,
  ArrowRight
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

  return (
    <div 
      className={`seating-action-bar mb-5 p-3.5 sm:p-4 rounded-[3px] border-[0.5px] border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs transition-all ${className}`}
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Left: Section Header & Context */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[3px] bg-[var(--color-highlight)]/10 text-[var(--color-highlight)] flex items-center justify-center shrink-0 border-[0.5px] border-[var(--color-highlight)]/20">
            <Layers size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text)]">
                Event-Day Deliverables & Exports
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] font-medium bg-[var(--color-surface-hover)] text-[var(--color-muted)] border-[0.5px] border-[var(--color-border)]">
                {seatedGuests.length} seated of {guests.filter(g => (g.rsvpStatus || '').toLowerCase() !== 'declined').length}
              </span>
            </div>
            <p className="text-[12px] text-[var(--color-muted)] mt-0.5 line-clamp-1">
              Export floor plan assets directly for your kitchen caterer, lobby easel sign, and Canva stationery designer.
            </p>
          </div>
        </div>

        {/* Right: Quick Action Deliverables */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* 1. Chef's Catering Dossier */}
          <button
            type="button"
            onClick={onOpenCateringDossier}
            disabled={!hasSeatedGuests}
            title={hasSeatedGuests ? "Generate kitchen-ready catering dossier with entree counts & allergies" : "Assign guests to tables first"}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[3px] text-[12px] font-semibold tracking-wide border-[0.5px] border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <Utensils size={13} className="text-[var(--color-highlight)]" />
            <span>Catering Dossier</span>
            {allergyCount > 0 && (
              <span className="ml-1 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border-[0.5px] border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700">
                {allergyCount} {allergyCount === 1 ? 'alert' : 'alerts'}
              </span>
            )}
          </button>

          {/* 2. Alphabetical Escort Chart (Easel Sign) */}
          <button
            type="button"
            onClick={() => onOpenEscortChart('alphabetical')}
            disabled={!hasSeatedGuests}
            title={hasSeatedGuests ? "Preview and print alphabetical escort entrance chart (A–Z)" : "Assign guests to tables first"}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[3px] text-[12px] font-semibold tracking-wide border-[0.5px] border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <FileText size={13} className="text-[var(--color-text)]" />
            <span>Alphabetical Easel Sign</span>
          </button>

          {/* 3. Canva Place Cards & CSV */}
          <button
            type="button"
            onClick={() => onOpenEscortChart('canva_studio')}
            disabled={!hasSeatedGuests}
            title={hasSeatedGuests ? "Export Canva Bulk Create CSV and design matching place cards" : "Assign guests to tables first"}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[3px] text-[12px] font-semibold tracking-wide border-[0.5px] border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>Canva Place Cards (CSV)</span>
          </button>

          {/* 4. Optional Table Tent Print Studio Trigger */}
          {onOpenPrintStudio && (
            <button
              type="button"
              onClick={onOpenPrintStudio}
              title="Open full print studio for folded table tent cards & rosters"
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-[3px] text-[12px] font-semibold border-[0.5px] border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <Printer size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
