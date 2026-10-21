'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Users,
  Briefcase,
  DollarSign,
  ListTodo,
  Calendar,
  Utensils,
  Armchair,
  Music,
  Settings,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Plus,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Guest, Vendor, BudgetItem, ExpenseItem, Task, Song } from '@/types/wedding';
import { formatCurrency } from '@/lib/currency';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  guests?: Guest[];
  vendors?: Vendor[];
  budget?: BudgetItem[];
  expenses?: ExpenseItem[];
  tasks?: Task[];
  music?: Song[];
  currency?: string;
  onNavigateTab: (tab: string, filter?: string, itemId?: string) => void;
  onOpenSettings?: (section?: string) => void;
  onToggleTheme?: () => void;
  onOpenAddGuest?: () => void;
  onOpenAddExpense?: () => void;
  onOpenAddVendor?: () => void;
  onExportCSV?: () => void;
}

interface PaletteItem {
  id: string;
  type: 'action' | 'guest' | 'vendor' | 'budget' | 'task';
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  onSelect: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  guests = [],
  vendors = [],
  budget = [],
  expenses = [],
  tasks = [],
  music = [],
  currency = 'USD',
  onNavigateTab,
  onOpenSettings,
  onToggleTheme,
  onOpenAddGuest,
  onOpenAddExpense,
  onOpenAddVendor,
  onExportCSV,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K listener handled in parent, but also handle Escape and arrow keys here
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // System Navigation & Quick Actions
  const actionItems: PaletteItem[] = useMemo(() => [
    {
      id: 'nav-home',
      type: 'action',
      title: 'Planning Overview',
      subtitle: 'Dashboard briefing and action items',
      icon: Sparkles,
      onSelect: () => { onNavigateTab('home'); onClose(); },
    },
    {
      id: 'nav-guests',
      type: 'action',
      title: 'Guest List & RSVPs',
      subtitle: `${guests.length} guests recorded`,
      icon: Users,
      onSelect: () => { onNavigateTab('guests'); onClose(); },
    },
    {
      id: 'nav-budget',
      type: 'action',
      title: 'Financials & Expenses',
      subtitle: 'Category budgets and itemized expenses',
      icon: DollarSign,
      onSelect: () => { onNavigateTab('budget'); onClose(); },
    },
    {
      id: 'nav-timeline',
      type: 'action',
      title: 'Timeline & Schedule',
      subtitle: 'Day-of itinerary and run of show',
      icon: Calendar,
      onSelect: () => { onNavigateTab('schedule'); onClose(); },
    },
    {
      id: 'nav-vendors',
      type: 'action',
      title: 'Vendors & Directory',
      subtitle: `${vendors.length} vendors linked`,
      icon: Briefcase,
      onSelect: () => { onNavigateTab('vendors'); onClose(); },
    },
    {
      id: 'nav-tables',
      type: 'action',
      title: 'Seating Chart',
      subtitle: 'Table floorplans and aisle seating',
      icon: Armchair,
      onSelect: () => { onNavigateTab('tables'); onClose(); },
    },
    {
      id: 'nav-tasks',
      type: 'action',
      title: 'Kanban Tasks',
      subtitle: `${tasks.filter(t => t.kanbanStage !== 'Done').length} pending tasks`,
      icon: ListTodo,
      onSelect: () => { onNavigateTab('tasks'); onClose(); },
    },
    {
      id: 'nav-menu',
      type: 'action',
      title: 'Menu & Catering',
      subtitle: 'Entrees, appetizers, and wine pairings',
      icon: Utensils,
      onSelect: () => { onNavigateTab('menu'); onClose(); },
    },
    {
      id: 'nav-music',
      type: 'action',
      title: 'Music & Playlists',
      subtitle: 'Ceremony, reception, and must-play songs',
      icon: Music,
      onSelect: () => { onNavigateTab('music'); onClose(); },
    },
    {
      id: 'action-settings',
      type: 'action',
      title: 'Open Settings',
      subtitle: 'Preferences, wedding details, and data backup',
      icon: Settings,
      onSelect: () => {
        if (onOpenSettings) onOpenSettings('wedding');
        else onNavigateTab('settings');
        onClose();
      },
    },
    ...(onToggleTheme ? [{
      id: 'action-theme',
      type: 'action' as const,
      title: 'Toggle Color Theme',
      subtitle: 'Switch between light and dark mode',
      icon: Moon,
      onSelect: () => { onToggleTheme(); onClose(); },
    }] : []),
    ...(onOpenAddGuest ? [{
      id: 'action-add-guest',
      type: 'action' as const,
      title: 'Add New Guest',
      subtitle: 'Quick add attendee to registry',
      icon: Plus,
      onSelect: () => { onOpenAddGuest(); onClose(); },
    }] : []),
    ...(onOpenAddExpense ? [{
      id: 'action-add-expense',
      type: 'action' as const,
      title: 'Log New Expense',
      subtitle: 'Record a purchase receipt or invoice',
      icon: Plus,
      onSelect: () => { onOpenAddExpense(); onClose(); },
    }] : []),
    ...(onOpenAddVendor ? [{
      id: 'action-add-vendor',
      type: 'action' as const,
      title: 'Add New Vendor',
      subtitle: 'Link a coordinator, photographer, or florist',
      icon: Plus,
      onSelect: () => { onOpenAddVendor(); onClose(); },
    }] : []),
    ...(onExportCSV ? [{
      id: 'action-export-csv',
      type: 'action' as const,
      title: 'Export Backup CSV',
      subtitle: 'Download spreadsheet data snapshot',
      icon: FileSpreadsheet,
      onSelect: () => { onExportCSV(); onClose(); },
    }] : []),
  ], [guests.length, vendors.length, tasks, onNavigateTab, onOpenSettings, onToggleTheme, onOpenAddGuest, onOpenAddExpense, onOpenAddVendor, onExportCSV, onClose]);

  // Filtered and Grouped Results
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Filtered Actions
    const matchedActions = actionItems.filter(item =>
      !q || item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q))
    ).slice(0, q ? 4 : 6);

    // 2. Filtered Guests
    const matchedGuests: PaletteItem[] = [];
    if (q) {
      for (const g of guests) {
        const fullName = `${g.firstName || ''} ${g.lastName || ''}`.trim();
        const party = g.partyGroup || '';
        const diet = g.dietaryRestrictions || '';
        const table = g.tableAssignment || '';
        if (
          fullName.toLowerCase().includes(q) ||
          party.toLowerCase().includes(q) ||
          diet.toLowerCase().includes(q) ||
          table.toLowerCase().includes(q)
        ) {
          const rsvp = (g.rsvpStatus || 'Pending').toLowerCase();
          const badgeColor = rsvp === 'attending' ? '#059669' : rsvp === 'declined' ? '#DC2626' : '#D97706';
          matchedGuests.push({
            id: `guest-${g.guestId}`,
            type: 'guest',
            title: fullName || 'Unnamed Guest',
            subtitle: `${g.rsvpStatus || 'Pending'} · ${party ? `Party: ${party}` : (table && table !== 'Unassigned' ? `Table: ${table}` : 'Unassigned table')}`,
            badge: g.rsvpStatus || 'Pending',
            badgeColor,
            icon: Users,
            onSelect: () => {
              onNavigateTab('guests', undefined, g.guestId);
              onClose();
            },
          });
          if (matchedGuests.length >= 5) break;
        }
      }
    }

    // 3. Filtered Vendors
    const matchedVendors: PaletteItem[] = [];
    if (q) {
      for (const v of vendors) {
        const name = v.vendorName || '';
        const cat = v.category || '';
        const contact = v.contactName || '';
        if (
          name.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q) ||
          contact.toLowerCase().includes(q)
        ) {
          const balance = v.balanceOwing || 0;
          const badgeColor = balance > 0 ? '#D97706' : '#059669';
          matchedVendors.push({
            id: `vendor-${v.vendorId}`,
            type: 'vendor',
            title: name,
            subtitle: `${cat}${contact ? ` · Rep: ${contact}` : ''} · ${balance > 0 ? `${formatCurrency(balance, currency)} balance` : 'Paid in full'}`,
            badge: cat,
            badgeColor,
            icon: Briefcase,
            onSelect: () => {
              onNavigateTab('vendors');
              onClose();
            },
          });
          if (matchedVendors.length >= 4) break;
        }
      }
    }

    // 4. Filtered Budget & Expenses
    const matchedBudget: PaletteItem[] = [];
    if (q) {
      // Check budget categories
      for (const b of budget) {
        const cat = b.category || '';
        const vendor = b.vendorName || '';
        if (cat.toLowerCase().includes(q) || vendor.toLowerCase().includes(q)) {
          matchedBudget.push({
            id: `budget-${b.itemId}`,
            type: 'budget',
            title: cat,
            subtitle: `Budgeted: ${formatCurrency(b.estimatedCost || 0, currency)} · Spent: ${formatCurrency(b.actualCost || 0, currency)}`,
            badge: 'Category',
            badgeColor: '#0284C7',
            icon: DollarSign,
            onSelect: () => {
              onNavigateTab('budget');
              onClose();
            },
          });
          if (matchedBudget.length >= 3) break;
        }
      }
      // Check itemized expenses
      for (const e of expenses) {
        const desc = e.description || '';
        const cat = e.category || '';
        const payer = e.paidBy || '';
        if (desc.toLowerCase().includes(q) || cat.toLowerCase().includes(q) || payer.toLowerCase().includes(q)) {
          matchedBudget.push({
            id: `exp-${e.itemId || e.description}`,
            type: 'budget',
            title: desc || 'Expense',
            subtitle: `${cat}${payer ? ` · Paid by ${payer}` : ''} · ${formatCurrency(e.actualCost ?? e.amountPaid ?? 0, currency)}`,
            badge: 'Expense',
            badgeColor: '#059669',
            icon: DollarSign,
            onSelect: () => {
              onNavigateTab('budget');
              onClose();
            },
          });
          if (matchedBudget.length >= 5) break;
        }
      }
    }

    // 5. Filtered Tasks
    const matchedTasks: PaletteItem[] = [];
    if (q) {
      for (const t of tasks) {
        const title = t.taskName || '';
        const stage = t.kanbanStage || 'To Do';
        const assigned = t.assignedTo || '';
        if (title.toLowerCase().includes(q) || assigned.toLowerCase().includes(q)) {
          const badgeColor = stage === 'Done' ? '#059669' : stage === 'In Progress' ? '#0284C7' : '#D97706';
          matchedTasks.push({
            id: `task-${t.taskId}`,
            type: 'task',
            title,
            subtitle: `${stage}${assigned ? ` · ${assigned}` : ''}${t.dueDate ? ` · Due ${t.dueDate}` : ''}`,
            badge: stage,
            badgeColor,
            icon: ListTodo,
            onSelect: () => {
              onNavigateTab('tasks', stage);
              onClose();
            },
          });
          if (matchedTasks.length >= 4) break;
        }
      }
    }

    const groups: Array<{ name: string; items: PaletteItem[] }> = [];
    if (matchedActions.length > 0) groups.push({ name: q ? 'COMMANDS & NAVIGATION' : 'SUGGESTED ACTIONS', items: matchedActions });
    if (matchedGuests.length > 0) groups.push({ name: 'GUESTS', items: matchedGuests });
    if (matchedVendors.length > 0) groups.push({ name: 'VENDORS', items: matchedVendors });
    if (matchedBudget.length > 0) groups.push({ name: 'FINANCIALS & EXPENSES', items: matchedBudget });
    if (matchedTasks.length > 0) groups.push({ name: 'TASKS & MILESTONES', items: matchedTasks });

    return groups;
  }, [query, actionItems, guests, vendors, budget, expenses, tasks, currency, onNavigateTab, onClose]);

  // Flattened array of visible items for index-based arrow navigation
  const flatItems = useMemo(() => {
    return filteredGroups.flatMap(g => g.items);
  }, [filteredGroups]);

  // Keep selected index in bounds
  useEffect(() => {
    if (selectedIndex >= flatItems.length) {
      setSelectedIndex(Math.max(0, flatItems.length - 1));
    }
  }, [flatItems.length, selectedIndex]);

  // Keyboard navigation for up / down / enter
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, flatItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = flatItems[selectedIndex];
      if (current) current.onSelect();
    }
  };

  if (!isOpen) return null;

  let runningIndex = 0;

  return (
    <div
      className="command-palette-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12vh 1rem 2rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="command-palette-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          border: '1px solid var(--color-border, #CBD5E1)',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.15rem',
            borderBottom: '1px solid var(--color-border, #E2E8F0)',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
          }}
        >
          <Search size={18} style={{ color: 'var(--color-muted, #64748B)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search guests, vendors, expenses, tasks, or jump to..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: '0.95rem',
              color: 'var(--color-text, #0F172A)',
            }}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted, #94A3B8)',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          ) : (
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.68rem',
                color: 'var(--color-muted, #94A3B8)',
                border: '1px solid var(--color-border, #E2E8F0)',
                borderRadius: '4px',
                padding: '0.15rem 0.4rem',
                backgroundColor: 'var(--color-bg, #F8FAFC)',
              }}
            >
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            padding: '0.5rem 0',
            flex: 1,
          }}
        >
          {filteredGroups.length === 0 ? (
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--color-muted, #64748B)' }}>
              <p style={{ fontFamily: 'var(--font-sans, system-ui)', fontSize: '0.88rem', margin: '0 0 0.35rem 0', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p style={{ fontSize: '0.75rem', margin: 0 }}>
                Try searching for a guest name, vendor category, or action like &ldquo;Settings&rdquo;.
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.name} style={{ marginBottom: '0.5rem' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted, #64748B)',
                    padding: '0.4rem 1.15rem 0.25rem',
                  }}
                >
                  {group.name}
                </div>

                {group.items.map((item) => {
                  const itemIndex = runningIndex++;
                  const isSelected = itemIndex === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 1.15rem',
                        backgroundColor: isSelected
                          ? 'var(--color-primary-light, rgba(2, 132, 199, 0.08))'
                          : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.08s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? 'var(--color-surface, #FFFFFF)' : 'var(--color-bg, #F8FAFC)',
                            border: '1px solid var(--color-border, #E2E8F0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isSelected ? 'var(--color-primary, #0284C7)' : 'var(--color-muted, #64748B)',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={14} />
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-sans, system-ui)',
                                fontSize: '0.84rem',
                                fontWeight: 600,
                                color: isSelected ? 'var(--color-primary, #0284C7)' : 'var(--color-text, #0F172A)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.title}
                            </span>
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: '0.62rem',
                                  fontFamily: 'var(--font-technical-mono, monospace)',
                                  fontWeight: 600,
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '4px',
                                  backgroundColor: item.badgeColor ? `${item.badgeColor}15` : 'rgba(0,0,0,0.05)',
                                  color: item.badgeColor || 'var(--color-muted, #64748B)',
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.72rem',
                                color: 'var(--color-muted, #64748B)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginTop: '0.1rem',
                              }}
                            >
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                        {isSelected && (
                          <span
                            style={{
                              fontFamily: 'var(--font-technical-mono, monospace)',
                              fontSize: '0.65rem',
                              color: 'var(--color-primary, #0284C7)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <span>Jump</span>
                            <ArrowRight size={12} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Keyboard Shortcut Hints Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 1.15rem',
            borderTop: '1px solid var(--color-border, #E2E8F0)',
            backgroundColor: 'var(--color-bg, #F8FAFC)',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-technical-mono, monospace)',
            color: 'var(--color-muted, #64748B)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span><strong style={{ color: 'var(--color-text, #0F172A)' }}>↑ ↓</strong> to navigate</span>
            <span><strong style={{ color: 'var(--color-text, #0F172A)' }}>↵</strong> to select</span>
          </div>
          <span><strong style={{ color: 'var(--color-text, #0F172A)' }}>ESC</strong> to close</span>
        </div>
      </div>
    </div>
  );
}
