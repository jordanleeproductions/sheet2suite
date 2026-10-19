'use client';

import React from 'react';
import { AlertTriangle, Clock, User, Calendar, Check } from 'lucide-react';

/* -------------------------------------------------------------------------
   1. DRAWER SECTION (Monarch Inset Grouped Card)
   ------------------------------------------------------------------------- */
export interface DrawerSectionProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function DrawerSection({
  title,
  description,
  icon,
  rightAction,
  children,
  style,
}: DrawerSectionProps) {
  return (
    <div
      className="monarch-drawer-section"
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: 'var(--border-radius-md, 10px)',
        padding: '1rem 1.15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        ...style,
      }}
    >
      {(title || description || rightAction) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--color-border, #F1F5F9)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {title && (
              <span
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.67rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted, #64748B)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {icon}
                {title}
              </span>
            )}
            {description && (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-muted, #94A3B8)',
                  lineHeight: 1.3,
                }}
              >
                {description}
              </span>
            )}
          </div>
          {rightAction && <div>{rightAction}</div>}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   2. DRAWER FIELD (Monarch Micro-Label Form Field Wrapper)
   ------------------------------------------------------------------------- */
export interface DrawerFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function DrawerField({
  label,
  required = false,
  hint,
  error,
  children,
  style,
}: DrawerFieldProps) {
  return (
    <div
      className="monarch-drawer-field"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label
          style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '0.66rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: error ? 'var(--color-red, #EF4444)' : 'var(--color-muted, #64748B)',
          }}
        >
          {label} {required && <span style={{ color: 'var(--color-red, #EF4444)' }}>*</span>}
        </label>
        {hint && (
          <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-technical-mono, monospace)', color: 'var(--color-muted, #94A3B8)' }}>
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <span style={{ fontSize: '0.68rem', color: 'var(--color-red, #EF4444)', fontFamily: 'var(--font-sans, sans-serif)' }}>
          {error}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   3. DRAWER ROW (Responsive 2-column or 3-column Grid)
   ------------------------------------------------------------------------- */
export interface DrawerRowProps {
  columns?: 2 | 3;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function DrawerRow({ columns = 2, children, style }: DrawerRowProps) {
  return (
    <div
      className={`monarch-drawer-row columns-${columns}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '0.85rem',
        ...style,
      }}
    >
      {children}
      <style>{`
        @media (max-width: 600px) {
          .monarch-drawer-row {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export interface PriorityOption {
  key?: string;
  value?: string;
  label: string;
  color: string;
  bg?: string;
  border?: string;
}

export interface PriorityPillsProps {
  value: string;
  onChange: (priority: any) => void;
  options?: PriorityOption[];
}

export function PriorityPills({ value, onChange, options: customOptions }: PriorityPillsProps) {
  const current = (value || 'Medium').toLowerCase();
  
  const defaultOptions: PriorityOption[] = [
    { key: 'High', value: 'High', label: 'HIGH', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444' },
    { key: 'Medium', value: 'Medium', label: 'MEDIUM', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B' },
    { key: 'Low', value: 'Low', label: 'LOW', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981' },
  ];

  const optionsToRender = (customOptions && customOptions.length > 0)
    ? customOptions.map(opt => ({
        key: opt.key || opt.value || opt.label,
        value: opt.value || opt.key || opt.label,
        label: opt.label,
        color: opt.color,
        bg: opt.bg || `${opt.color}15`,
        border: opt.border || opt.color,
      }))
    : defaultOptions;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${optionsToRender.length}, 1fr)`, gap: '0.45rem', width: '100%' }}>
      {optionsToRender.map((opt) => {
        const optVal = opt.value || opt.key || opt.label;
        const isSelected = current === String(optVal).toLowerCase() || current === opt.label.toLowerCase();
        return (
          <button
            key={optVal}
            type="button"
            onClick={() => onChange(optVal)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.5rem',
              borderRadius: 'var(--border-radius-sm, 6px)',
              border: `1.5px solid ${isSelected ? opt.border : 'var(--color-border, #CBD5E1)'}`,
              backgroundColor: isSelected ? opt.bg : 'var(--color-surface, #FFFFFF)',
              color: isSelected ? opt.color : 'var(--color-muted, #64748B)',
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.74rem',
              fontWeight: isSelected ? 800 : 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              touchAction: 'manipulation',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: opt.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span>{opt.label}</span>
            {isSelected && <Check size={13} style={{ strokeWidth: 2.5 }} />}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------
   5. QUICK DATE CHIPS (Fast Due Date Shortcuts)
   ------------------------------------------------------------------------- */
export interface QuickDateChipsProps {
  onSelectDate: (dateIsoString: string) => void;
  onClear?: () => void;
  currentDate?: string;
}

export function QuickDateChips({ onSelectDate, onClear, currentDate }: QuickDateChipsProps) {
  const getOffsetDateStr = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getOffsetDateStr(0);
  const tomorrowStr = getOffsetDateStr(1);
  const nextWeekStr = getOffsetDateStr(7);
  const nextMonthStr = getOffsetDateStr(30);

  const chips = [
    { label: 'Today', date: todayStr },
    { label: 'Tomorrow', date: tomorrowStr },
    { label: '+1 Week', date: nextWeekStr },
    { label: '+1 Month', date: nextMonthStr },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-technical-mono, monospace)', color: 'var(--color-muted, #94A3B8)', marginRight: '0.1rem' }}>
        Quick pick:
      </span>
      {chips.map((chip) => {
        const isMatch = currentDate === chip.date;
        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => onSelectDate(chip.date)}
            style={{
              padding: '0.2rem 0.45rem',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-technical-mono, monospace)',
              border: `1px solid ${isMatch ? 'var(--color-primary, #0F172A)' : 'var(--color-border, #CBD5E1)'}`,
              backgroundColor: isMatch ? 'var(--color-primary, #0F172A)' : 'transparent',
              color: isMatch ? '#FFFFFF' : 'var(--color-text, #0F172A)',
              cursor: 'pointer',
              fontWeight: isMatch ? 700 : 500,
            }}
          >
            {chip.label}
          </button>
        );
      })}
      {currentDate && onClear && (
        <button
          type="button"
          onClick={onClear}
          style={{
            padding: '0.2rem 0.45rem',
            borderRadius: '4px',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-technical-mono, monospace)',
            border: '1px dashed var(--color-border, #CBD5E1)',
            backgroundColor: 'transparent',
            color: 'var(--color-muted, #64748B)',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   6. QUICK ASSIGN CHIPS (Fast Partner / Shared Assignment)
   ------------------------------------------------------------------------- */
export interface QuickAssignChipsProps {
  p1: string;
  p2: string;
  currentAssignee?: string;
  onSelectAssignee: (assignee: string) => void;
}

export function QuickAssignChips({ p1, p2, currentAssignee, onSelectAssignee }: QuickAssignChipsProps) {
  const current = (currentAssignee || '').trim().toLowerCase();

  const options = [
    { label: p1, value: p1, isP1: true },
    { label: p2, value: p2, isP2: true },
    { label: `Shared (${p1} & ${p2})`, value: `${p1} & ${p2}`, isShared: true },
  ];

  return (
    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const isSelected = current === opt.value.toLowerCase();
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelectAssignee(isSelected ? '' : opt.value)}
            style={{
              padding: '0.28rem 0.6rem',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-technical-mono, monospace)',
              borderRadius: 'var(--border-radius-sm, 6px)',
              border: `1px solid ${isSelected ? 'var(--color-primary, #0F172A)' : 'var(--color-border, #CBD5E1)'}`,
              backgroundColor: isSelected ? 'var(--color-primary, #0F172A)' : 'var(--color-surface, #FFFFFF)',
              color: isSelected ? '#FFFFFF' : 'var(--color-text, #0F172A)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: isSelected ? 700 : 500,
              transition: 'all 0.15s ease',
            }}
          >
            <User size={11} />
            <span>{opt.label}</span>
            {isSelected && <Check size={12} />}
          </button>
        );
      })}
    </div>
  );
}
