'use client';

import React, { useState, useEffect } from 'react';
import { Task, KanbanStage } from '@/lib/sheets/types';
import { 
  Plus, 
  Edit2, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  Calendar, 
  User, 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Circle, 
  LayoutGrid, 
  BarChart2, 
  ChevronDown, 
  Check,
  Search,
  Tag,
  SlidersHorizontal,
  CheckSquare
} from 'lucide-react';
import { formatDateConsistent, formatDateToMMDDYYYY } from '@/lib/currency';
import MobileFAB from '@/components/MobileFAB';
import PageHeaderCard from '@/components/vow/PageHeaderCard';
import PageMetricStrip from '@/components/vow/PageMetricStrip';
import SlideOverDrawer from '@/components/vow/SlideOverDrawer';
import { DrawerSection, DrawerField, DrawerRow, PriorityPills, QuickDateChips, QuickAssignChips } from '@/components/vow/MonarchForm';
import { triggerConfetti } from '@/lib/confetti';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdate: (updatedTasks: Task[]) => Promise<void>;
  isSyncing: boolean;
  initialStage?: KanbanStage;
  partner1Name?: string;
  partner2Name?: string;
}

interface TaskComboboxProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  fieldId: string;
}

function TaskCombobox({ label, value, onChange, options, placeholder, fieldId }: TaskComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilterText(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const displayFilter = filterText !== null ? filterText : '';
  const filtered = displayFilter.trim()
    ? options.filter(opt => opt.toLowerCase().includes(displayFilter.toLowerCase().trim()))
    : options;

  const isCustom = Boolean(
    value &&
    value.trim() &&
    !options.some(opt => opt.toLowerCase() === value.trim().toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          id={fieldId}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setFilterText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setFilterText(null);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              setFilterText(null);
            }
          }}
          placeholder={placeholder}
          style={{
            padding: '0.5rem 2.25rem 0.5rem 0.5rem',
            border: '1px solid var(--color-muted, #cbd5e1)',
            borderRadius: 'var(--border-radius-sm, 4px)',
            fontSize: '0.85rem',
            width: '100%',
            backgroundColor: 'var(--color-surface, #ffffff)',
            color: 'var(--color-text)',
            boxSizing: 'border-box',
          }}
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFilterText(null);
            setIsOpen(prev => !prev);
          }}
          title={`Show ${label.toLowerCase()} dropdown`}
          style={{
            position: 'absolute',
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            padding: '6px',
            cursor: 'pointer',
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--border-radius-sm, 4px)',
          }}
        >
          <ChevronDown
            size={16}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
              color: isOpen ? 'var(--color-primary)' : 'var(--color-muted)',
            }}
          />
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1200,
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #cbd5e1)',
            borderRadius: 'var(--border-radius-sm, 6px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            maxHeight: '210px',
            overflowY: 'auto',
            padding: '4px 0',
          }}
        >
          <div
            style={{
              padding: '5px 10px 5px',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--color-muted)',
              borderBottom: '1px solid var(--color-border, #e2e8f0)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>SELECT OR TYPE TO OVERWRITE</span>
            {filterText !== null && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFilterText(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.65rem',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Show all ({options.length})
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            filtered.map((opt) => {
              const isSelected = value.trim().toLowerCase() === opt.toLowerCase();
              return (
                <div
                  key={opt}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(opt);
                    setIsOpen(false);
                    setFilterText(null);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isSelected ? 'var(--color-bg-hover, rgba(0,0,0,0.06))' : 'transparent',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover, rgba(0,0,0,0.04))';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{opt}</span>
                  {isSelected && <Check size={14} style={{ color: 'var(--color-primary)' }} />}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '0.6rem 0.75rem',
                fontSize: '0.78rem',
                color: 'var(--color-muted)',
                fontStyle: 'italic',
              }}
            >
              No matching preset found.
            </div>
          )}

          {value.trim() && isCustom && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsOpen(false);
                setFilterText(null);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderTop: '1px dashed var(--color-border, #e2e8f0)',
                fontSize: '0.78rem',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                backgroundColor: 'rgba(26, 127, 75, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Plus size={13} />
              <span>Use custom: <strong>&ldquo;{value.trim()}&rdquo;</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const getTaskCategory = (task: Task): string => {
  const cat = (task.category || '').trim();
  return cat ? cat : 'General';
};

export const isDueDatePast = (dueDateStr?: string, stage?: KanbanStage): boolean => {
  if (!dueDateStr || !dueDateStr.trim() || stage === 'Done') return false;

  const ymd = formatDateConsistent(dueDateStr);
  if (!ymd || ymd === '-') return false;

  const parts = ymd.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return false;

  const dueEndOfDay = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
  return dueEndOfDay.getTime() < Date.now();
};

/**
 * Jira-inspired priority left accent border colors
 */
export const getPriorityBorderColor = (priority?: string): string => {
  switch ((priority || '').trim().toLowerCase()) {
    case 'critical':
    case 'urgent':
    case 'high':
      return 'var(--color-red, #EF4444)';
    case 'medium':
      return 'var(--color-amber, #F59E0B)';
    case 'low':
    case 'lowest':
      return 'var(--color-green, #10B981)';
    default:
      return 'var(--color-border, #CBD5E1)';
  }
};

/**
 * Priority badge styling matching design system
 */
export const getPriorityBadgeStyles = (priority?: string) => {
  switch ((priority || '').trim().toLowerCase()) {
    case 'critical':
    case 'urgent':
    case 'high':
      return { 
        bg: 'rgba(239, 68, 68, 0.1)', 
        text: '#DC2626', 
        border: '1px solid rgba(239, 68, 68, 0.25)', 
        label: 'HIGH' 
      };
    case 'medium':
      return { 
        bg: 'rgba(245, 158, 11, 0.1)', 
        text: '#B45309', 
        border: '1px solid rgba(245, 158, 11, 0.25)', 
        label: 'MEDIUM' 
      };
    case 'low':
    case 'lowest':
      return { 
        bg: 'rgba(16, 185, 129, 0.1)', 
        text: '#059669', 
        border: '1px solid rgba(16, 185, 129, 0.25)', 
        label: 'LOW' 
      };
    default:
      return { 
        bg: 'var(--color-bg-pane, #F1F5F9)', 
        text: 'var(--color-muted, #64748B)', 
        border: '1px solid var(--color-border, #CBD5E1)', 
        label: (priority || 'NORMAL').toUpperCase() 
      };
  }
};

/**
 * Stage chip styles for interactive status switcher
 */
export const getStageStyle = (stage: KanbanStage) => {
  switch (stage) {
    case 'Done':
      return {
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#059669',
        border: 'rgba(16, 185, 129, 0.3)',
        dot: '#10B981',
      };
    case 'In Progress':
      return {
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#B45309',
        border: 'rgba(245, 158, 11, 0.3)',
        dot: '#F59E0B',
      };
    case 'To Do':
    default:
      return {
        bg: 'rgba(59, 130, 246, 0.1)',
        color: '#2563EB',
        border: 'rgba(59, 130, 246, 0.25)',
        dot: '#3B82F6',
      };
  }
};

/**
 * Jira Mobile Smart Relative Due Date badge calculation
 */
export const getSmartDateBadge = (dueDateStr?: string, stage?: KanbanStage) => {
  if (!dueDateStr || !dueDateStr.trim()) return null;
  const ymd = formatDateConsistent(dueDateStr);
  if (!ymd || ymd === '-') return null;

  const isDone = stage === 'Done';
  const isPast = isDueDatePast(dueDateStr, stage);
  const formatted = formatDateToMMDDYYYY(dueDateStr);

  try {
    const parts = ymd.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      const due = new Date(parts[0], parts[1] - 1, parts[2]);
      due.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (isDone) {
        return {
          text: formatted,
          isOverdue: false,
          color: 'var(--color-muted, #64748B)',
          bg: 'var(--color-bg-pane, #F1F5F9)',
          border: '1px solid var(--color-border, #E2E8F0)',
        };
      }

      if (diffDays < 0) {
        const absDays = Math.abs(diffDays);
        return {
          text: `Overdue ${absDays}d (${formatted})`,
          isOverdue: true,
          color: '#DC2626',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      }
      if (diffDays === 0) {
        return {
          text: 'Due Today',
          isOverdue: false,
          color: '#D97706',
          bg: 'rgba(245, 158, 11, 0.14)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
      }
      if (diffDays === 1) {
        return {
          text: 'Tomorrow',
          isOverdue: false,
          color: '#B45309',
          bg: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.22)',
        };
      }
      if (diffDays <= 7) {
        return {
          text: `In ${diffDays}d (${formatted})`,
          isOverdue: false,
          color: 'var(--color-text, #0F172A)',
          bg: 'var(--color-bg-pane, #F1F5F9)',
          border: '1px solid var(--color-border, #E2E8F0)',
        };
      }
    }
  } catch (_) {}

  return {
    text: formatted,
    isOverdue: isPast,
    color: isPast ? '#DC2626' : 'var(--color-muted, #64748B)',
    bg: isPast ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-bg-pane, #F1F5F9)',
    border: isPast ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--color-border, #E2E8F0)',
  };
};

/**
 * Assignee circular initials avatar helper
 */
export const getAssigneeAvatar = (assignee: string | undefined, p1: string, p2: string) => {
  const trimmed = (assignee || '').trim();
  if (!trimmed || trimmed.toLowerCase() === 'unassigned') {
    return {
      initials: '?',
      name: 'Unassigned',
      bg: 'var(--color-bg-pane, #F1F5F9)',
      color: 'var(--color-muted, #64748B)',
      border: '1px dashed var(--color-border, #CBD5E1)',
    };
  }

  const isShared = trimmed.includes('&') || trimmed.toLowerCase().includes('shared') || trimmed.toLowerCase().includes('both');
  if (isShared) {
    return {
      initials: '💍',
      name: trimmed,
      bg: 'rgba(16, 185, 129, 0.12)',
      color: '#059669',
      border: '1px solid rgba(16, 185, 129, 0.3)',
    };
  }

  const isP1 = trimmed.toLowerCase() === p1.toLowerCase();
  const isP2 = trimmed.toLowerCase() === p2.toLowerCase();

  const parts = trimmed.split(/\s+/);
  const initials = parts.length >= 2 
    ? (parts[0][0] + parts[1][0]).toUpperCase() 
    : parts[0].slice(0, 2).toUpperCase();

  if (isP1) {
    return {
      initials,
      name: trimmed,
      bg: 'rgba(15, 23, 42, 0.08)',
      color: 'var(--color-primary, #0F172A)',
      border: '1px solid rgba(15, 23, 42, 0.2)',
    };
  }

  if (isP2) {
    return {
      initials,
      name: trimmed,
      bg: 'rgba(99, 102, 241, 0.12)',
      color: '#4F46E5',
      border: '1px solid rgba(99, 102, 241, 0.3)',
    };
  }

  return {
    initials,
    name: trimmed,
    bg: 'var(--color-bg-pane, #F1F5F9)',
    color: 'var(--color-text, #0F172A)',
    border: '1px solid var(--color-border, #CBD5E1)',
  };
};

export default function KanbanBoard({ 
  tasks, 
  onUpdate, 
  isSyncing, 
  initialStage,
  partner1Name,
  partner2Name,
}: KanbanBoardProps) {
  const p1 = partner1Name?.trim() || 'Partner 1';
  const p2 = partner2Name?.trim() || 'Partner 2';

  // Mobile Column Selector
  const [activeMobileStage, setActiveMobileStage] = useState<KanbanStage>(initialStage || 'To Do');

  React.useEffect(() => {
    if (initialStage) {
      setActiveMobileStage(initialStage);
    }
  }, [initialStage]);
  
  // Adding & Editing & Delete states
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [formState, setFormState] = useState<Partial<Task>>({});

  // View mode for Progress Metrics ('cards' | 'bar')
  // Defaults to 'bar' on mobile viewports (< 768px), 'cards' on desktop
  const [progressViewMode, setProgressViewMode] = useState<'cards' | 'bar'>('cards');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setProgressViewMode('bar');
    }
  }, []);

  // Sorting state
  const [sortField, setSortField] = useState<'default' | 'priority' | 'dueDate'>('default');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Category Filter state ('ALL' or specific category name) [TASK-CATEGORY-FILTER]
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Assignee Filter state ('ALL', 'UNASSIGNED', or specific assignee name)
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');

  // Jira Mobile Quick Filters & Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [filterOnlyOverdue, setFilterOnlyOverdue] = useState<boolean>(false);

  // Jira Mobile Action Sheets state
  const [activeStatusTask, setActiveStatusTask] = useState<Task | null>(null);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState<boolean>(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState<boolean>(false);

  // Touch Swipe Gesture State for Mobile Columns
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Compute available categories from tasks, with empty/unspecified category mapping to 'General'
  const categoryOptions = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const task of tasks) {
      const cat = getTaskCategory(task);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .map(name => ({ name, count: counts[name] }));
  }, [tasks]);

  // Compute available assignees from tasks with counts
  const assigneeOptions = React.useMemo(() => {
    let unassignedCount = 0;
    const counts: Record<string, number> = {};

    for (const task of tasks) {
      const assigned = (task.assignedTo || '').trim();
      if (!assigned || assigned.toLowerCase() === 'unassigned') {
        unassignedCount++;
      } else {
        counts[assigned] = (counts[assigned] || 0) + 1;
      }
    }

    const list = Object.keys(counts)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .map(name => ({ name, count: counts[name] }));

    return {
      unassignedCount,
      list,
    };
  }, [tasks]);

  // Filter tasks based on category, assignee, search, priority, and overdue selections
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(t => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = (t.taskName || '').toLowerCase().includes(query);
        const matchNotes = (t.notes || '').toLowerCase().includes(query);
        const matchCat = (t.category || '').toLowerCase().includes(query);
        if (!matchName && !matchNotes && !matchCat) return false;
      }

      // Priority filter chip
      if (filterPriority !== 'ALL') {
        const p = (t.priority || '').trim().toLowerCase();
        if (filterPriority === 'HIGH' && p !== 'high' && p !== 'critical' && p !== 'urgent') return false;
        if (filterPriority === 'MEDIUM' && p !== 'medium') return false;
        if (filterPriority === 'LOW' && p !== 'low' && p !== 'lowest') return false;
      }

      // Overdue filter chip
      if (filterOnlyOverdue) {
        if (!isDueDatePast(t.dueDate, t.kanbanStage)) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        if (getTaskCategory(t).toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Assignee filter
      if (selectedAssignee !== 'ALL') {
        const assigned = (t.assignedTo || '').trim();
        const isUnassigned = !assigned || assigned.toLowerCase() === 'unassigned';
        if (selectedAssignee === 'UNASSIGNED') {
          if (!isUnassigned) return false;
        } else {
          if (assigned.toLowerCase() !== selectedAssignee.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [tasks, searchQuery, filterPriority, filterOnlyOverdue, selectedCategory, selectedAssignee]);

  // Compute dynamic suggestions for Categories & Assignees from existing tasks [TASK-AUTO-SUGGEST]
  const existingCategories = Array.from(new Set([
    'Venue', 'Attire', 'Catering', 'Florals', 'Photography', 'Music', 'Guests', 'Decor', 'Invitations', 'Legal', 'Personal',
    ...tasks.map(t => (t.category || '').trim()).filter(Boolean)
  ])).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const existingAssignees = Array.from(new Set([
    'Couple',
    p1,
    p2,
    `${p1} & ${p2}`,
    'Wedding Party',
    'Person of Honor',
    'Best Person',
    'Wedding Planner',
    'Maid of Honor',
    'Best Man',
    ...tasks.map(t => (t.assignedTo || '').trim()).filter(Boolean)
  ])).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const handleSortClick = (field: 'priority' | 'dueDate') => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField('default');
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedTasks = (taskList: Task[]) => {
    if (sortField === 'default') return taskList;

    return [...taskList].sort((a, b) => {
      if (sortField === 'priority') {
        const priorityMap: Record<string, number> = { high: 1, medium: 2, low: 3 };
        const priA = priorityMap[(a.priority || '').toLowerCase()] || 4;
        const priB = priorityMap[(b.priority || '').toLowerCase()] || 4;
        return sortDirection === 'asc' ? priA - priB : priB - priA;
      }

      if (sortField === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        const dateA = new Date(formatDateConsistent(a.dueDate)).getTime();
        const dateB = new Date(formatDateConsistent(b.dueDate)).getTime();
        const timeA = isNaN(dateA) ? 0 : dateA;
        const timeB = isNaN(dateB) ? 0 : dateB;
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      return 0;
    });
  };

  const stages: KanbanStage[] = ['To Do', 'In Progress', 'Done'];

  // Handle stage change
  const moveTask = async (task: Task, direction: 'forward' | 'backward') => {
    if (isSyncing) return;
    
    let newStage: KanbanStage = task.kanbanStage;
    if (task.kanbanStage === 'To Do' && direction === 'forward') {
      newStage = 'In Progress';
    } else if (task.kanbanStage === 'In Progress') {
      newStage = direction === 'forward' ? 'Done' : 'To Do';
    } else if (task.kanbanStage === 'Done' && direction === 'backward') {
      newStage = 'In Progress';
    }

    if (newStage !== task.kanbanStage) {
      const updated = tasks.map(t => 
        t.taskId === task.taskId ? { ...t, kanbanStage: newStage } : t
      );
      if (newStage === 'Done' && updated.length > 0 && updated.every(t => t.kanbanStage === 'Done')) {
        triggerConfetti({ particleCount: 90 });
      }
      await onUpdate(updated);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    const ymd = formatDateConsistent(task.dueDate);
    setFormState({
      ...task,
      dueDate: ymd === '-' ? '' : ymd,
    });
    setIsAdding(false);
  };

  const startAdd = (stage: KanbanStage) => {
    setFormState({
      taskId: `T${tasks.length + 1}`,
      taskName: '',
      kanbanStage: stage,
      category: selectedCategory !== 'ALL' && selectedCategory.toLowerCase() !== 'general' ? selectedCategory : '',
      priority: 'Medium',
      assignedTo: selectedAssignee !== 'ALL' && selectedAssignee !== 'UNASSIGNED' ? selectedAssignee : '',
      dueDate: '',
      notes: '',
    });
    setIsAdding(true);
    setEditingTask(null);
  };

  const currentTaskIndex = editingTask ? filteredTasks.findIndex(t => t.taskId === editingTask.taskId) : -1;
  const handleNavigateAdjacentTask = (offset: number) => {
    if (currentTaskIndex < 0) return;
    const targetIndex = currentTaskIndex + offset;
    if (targetIndex >= 0 && targetIndex < filteredTasks.length) {
      const nextTask = filteredTasks[targetIndex];
      startEdit(nextTask);
    }
  };

  const handleInputChange = (field: keyof Task, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const saveTask = async (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();
    if (isSyncing) return;

    if (!formState.taskName) {
      alert('Please enter a Task Name.');
      return;
    }

    let updated: Task[];
    if (isAdding) {
      updated = [...tasks, formState as Task];
    } else {
      updated = tasks.map(t => 
        t.taskId === editingTask?.taskId ? (formState as Task) : t
      );
    }

    await onUpdate(updated);

    if (formState.kanbanStage === 'Done' && updated.length > 0 && updated.every(t => t.kanbanStage === 'Done')) {
      triggerConfetti({ particleCount: 90 });
    }

    if (continueAdding) {
      setFormState({
        taskId: `T${updated.length + 1}`,
        taskName: '',
        kanbanStage: formState.kanbanStage || 'To Do',
        category: selectedCategory !== 'ALL' && selectedCategory.toLowerCase() !== 'general' ? selectedCategory : (formState.category || ''),
        priority: formState.priority || 'Medium',
        assignedTo: formState.assignedTo || '',
        dueDate: '',
        notes: '',
      });
      setIsAdding(true);
      setEditingTask(null);
    } else {
      setIsAdding(false);
      setEditingTask(null);
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete || isSyncing) return;
    const updated = tasks.filter(t => t.taskId !== taskToDelete.taskId);
    await onUpdate(updated);
    setIsAdding(false);
    setEditingTask(null);
    setTaskToDelete(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return { bg: 'var(--color-red-muted)', text: 'var(--color-red)' };
      case 'medium': return { bg: 'var(--color-gold)', text: 'var(--color-on-light)' };
      case 'low': return { bg: 'var(--color-green)', text: 'var(--color-on-light)' };
      default: return { bg: 'var(--color-gold)', text: 'var(--color-on-light)' };
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const swipeThreshold = 50;

    if (Math.abs(deltaX) > swipeThreshold) {
      const currentIndex = stages.indexOf(activeMobileStage);
      if (deltaX < 0) {
        // Swiped left -> advance to next stage
        if (currentIndex < stages.length - 1) {
          const nextStage = stages[currentIndex + 1];
          setActiveMobileStage(nextStage);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate(12); } catch (_) {}
          }
        }
      } else {
        // Swiped right -> go back to previous stage
        if (currentIndex > 0) {
          const prevStage = stages[currentIndex - 1];
          setActiveMobileStage(prevStage);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate(12); } catch (_) {}
          }
        }
      }
    }
    setTouchStartX(null);
  };

  return (
    <div style={styles.container}>
      {/* 0. Page Header Card [Consistent Monarch UX] */}
      <PageHeaderCard
        title="Tasks & Checklist"
        subtitle="Organize your wedding tasks using Kanban workflow columns (To Do, In Progress, Done) for visual task tracking."
        actions={
          <button
            type="button"
            className="s2v-header-btn s2v-header-btn-primary kanban-add-btn-desktop"
            onClick={() => startAdd('To Do')}
            disabled={isSyncing}
            title="Add New Wedding Task"
          >
            <Plus size={14} />
            <span>ADD TASK</span>
          </button>
        }
      />

      {/* Switchable Progress Metrics Header [TASK-2 & Monarch UX] */}
      {(() => {
        const total = filteredTasks.length;
        const toDoCount = filteredTasks.filter(t => t.kanbanStage === 'To Do').length;
        const inProgressCount = filteredTasks.filter(t => t.kanbanStage === 'In Progress').length;
        const doneCount = filteredTasks.filter(t => t.kanbanStage === 'Done').length;
        const overdueCount = filteredTasks.filter(t => isDueDatePast(t.dueDate, t.kanbanStage)).length;
        const percentDone = total > 0 ? Math.round((doneCount / total) * 100) : 0;
        const percentToDo = total > 0 ? Math.round((toDoCount / total) * 100) : 0;
        const percentInProgress = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', margin: '0.5rem 0' }}>
            <PageMetricStrip
              metrics={[
                {
                  id: 'done',
                  label: 'COMPLETED TASKS',
                  value: `${percentDone}%`,
                  subtext: `${doneCount} of ${total} tasks completed`,
                  statusBadge: percentDone === 100 ? 'ALL DONE 🎉' : `${doneCount}/${total}`,
                  statusColor: 'green',
                  progress: percentDone,
                  onClick: () => setActiveMobileStage('Done'),
                  isActive: activeMobileStage === 'Done',
                  tooltip: 'Click to view completed tasks',
                },
                {
                  id: 'inprogress',
                  label: 'IN PROGRESS',
                  value: inProgressCount,
                  subtext: `${percentInProgress}% actively underway`,
                  statusBadge: activeMobileStage === 'In Progress' ? 'ACTIVE' : undefined,
                  statusColor: 'amber',
                  progress: percentInProgress,
                  onClick: () => setActiveMobileStage('In Progress'),
                  isActive: activeMobileStage === 'In Progress',
                  tooltip: 'Click to view tasks in progress',
                },
                {
                  id: 'todo',
                  label: 'TO DO QUEUE',
                  value: toDoCount,
                  subtext: `${percentToDo}% remaining to start`,
                  statusBadge: activeMobileStage === 'To Do' ? 'ACTIVE' : undefined,
                  statusColor: 'blue',
                  progress: percentToDo,
                  onClick: () => setActiveMobileStage('To Do'),
                  isActive: activeMobileStage === 'To Do',
                  tooltip: 'Click to view open tasks to do',
                },
                {
                  id: 'overdue',
                  label: 'OVERDUE ITEMS',
                  value: overdueCount,
                  subtext: overdueCount > 0 ? 'Requires attention ⚠️' : 'All deadlines clear',
                  statusBadge: overdueCount > 0 ? 'PAST DUE' : 'CLEAR',
                  statusColor: overdueCount > 0 ? 'red' : 'neutral',
                  tooltip: overdueCount > 0 ? `${overdueCount} task${overdueCount === 1 ? '' : 's'} past deadline` : 'No overdue tasks',
                },
              ]}
            />
          </div>
        );
      })()}

      {/* Controls Bar: Category Filter, Assignee Filter & Sort Bar (Under Progress Metrics) */}
      {/* Jira Mobile Quick Filter Chips Bar (Visible on mobile viewports <= 767px) */}
      <div className="kanban-quick-chips-bar">
        {/* Search chip / expandable input */}
        <div className={`kanban-search-chip ${isSearchOpen || searchQuery ? 'open' : ''}`}>
          <Search size={13} className="kanban-search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="kanban-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="kanban-search-clear"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Priority Quick Filter */}
        <button
          type="button"
          onClick={() => {
            setFilterPriority(prev => prev === 'HIGH' ? 'ALL' : 'HIGH');
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(10); } catch (_) {}
            }
          }}
          className={`kanban-filter-chip ${filterPriority === 'HIGH' ? 'active' : ''}`}
        >
          <AlertTriangle size={12} style={{ color: filterPriority === 'HIGH' ? 'inherit' : '#EF4444' }} />
          <span>High Priority</span>
        </button>

        {/* Overdue Quick Filter */}
        <button
          type="button"
          onClick={() => {
            setFilterOnlyOverdue(prev => !prev);
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(10); } catch (_) {}
            }
          }}
          className={`kanban-filter-chip ${filterOnlyOverdue ? 'active' : ''}`}
        >
          <Clock size={12} style={{ color: filterOnlyOverdue ? 'inherit' : '#DC2626' }} />
          <span>Overdue</span>
        </button>

        {/* Partner 1 Filter */}
        <button
          type="button"
          onClick={() => {
            setSelectedAssignee(prev => prev.toLowerCase() === p1.toLowerCase() ? 'ALL' : p1);
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(10); } catch (_) {}
            }
          }}
          className={`kanban-filter-chip ${selectedAssignee.toLowerCase() === p1.toLowerCase() ? 'active' : ''}`}
        >
          <User size={12} />
          <span>{p1}</span>
        </button>

        {/* Partner 2 Filter (if partner2Name provided) */}
        {partner2Name && (
          <button
            type="button"
            onClick={() => {
              setSelectedAssignee(prev => prev.toLowerCase() === p2.toLowerCase() ? 'ALL' : p2);
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate(10); } catch (_) {}
              }
            }}
            className={`kanban-filter-chip ${selectedAssignee.toLowerCase() === p2.toLowerCase() ? 'active' : ''}`}
          >
            <User size={12} />
            <span>{p2}</span>
          </button>
        )}

        {/* Category Picker Sheet Trigger */}
        <button
          type="button"
          onClick={() => setIsCategorySheetOpen(true)}
          className={`kanban-filter-chip ${selectedCategory !== 'ALL' ? 'active' : ''}`}
        >
          <Tag size={12} />
          <span>{selectedCategory === 'ALL' ? 'Category' : selectedCategory}</span>
          <ChevronDown size={11} style={{ opacity: 0.7 }} />
        </button>

        {/* Sort Picker Sheet Trigger */}
        <button
          type="button"
          onClick={() => setIsSortSheetOpen(true)}
          className={`kanban-filter-chip ${sortField !== 'default' ? 'active' : ''}`}
        >
          <SlidersHorizontal size={12} />
          <span>{sortField === 'default' ? 'Sort' : (sortField === 'priority' ? 'Priority' : 'Due Date')}</span>
          <ChevronDown size={11} style={{ opacity: 0.7 }} />
        </button>

        {/* Reset All Filters chip */}
        {(searchQuery.trim() !== '' || filterPriority !== 'ALL' || filterOnlyOverdue || selectedCategory !== 'ALL' || selectedAssignee !== 'ALL' || sortField !== 'default') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
              setFilterPriority('ALL');
              setFilterOnlyOverdue(false);
              setSelectedCategory('ALL');
              setSelectedAssignee('ALL');
              setSortField('default');
              setSortDirection('asc');
            }}
            className="kanban-filter-chip reset"
            title="Clear all active filters"
          >
            <X size={12} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Controls Bar: Category Filter, Assignee Filter & Sort Bar (Desktop Viewports >= 768px) */}
      <div className="kanban-filter-sort-bar kanban-filter-sort-bar-desktop">
        <div className="kanban-filters-group">
          {/* Desktop Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
            <span style={styles.sortLabel}>SEARCH:</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={13} style={{ position: 'absolute', left: '8px', color: 'var(--color-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.4rem 1.6rem 0.4rem 1.7rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--color-input-bg, #ffffff)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-muted)',
                  borderRadius: 'var(--border-radius-sm)',
                  minHeight: '34px',
                  width: '150px',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-muted)',
                    padding: 0,
                  }}
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Dropdown [TASK-CATEGORY-FILTER] */}
          <div style={styles.sortGroup} className="kanban-category-filter-bar">
            <span style={styles.sortLabel}>CATEGORY:</span>
            <div className="kanban-category-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  backgroundColor: selectedCategory !== 'ALL' ? 'var(--color-primary)' : 'var(--color-input-bg, #ffffff)',
                  color: selectedCategory !== 'ALL' ? 'var(--color-on-primary)' : 'var(--color-text)',
                  border: `1px solid ${selectedCategory !== 'ALL' ? 'var(--color-primary)' : 'var(--color-muted)'}`,
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'var(--transition-smooth)',
                  minHeight: '34px',
                }}
                className="kanban-category-select"
                title="Filter tasks by category"
              >
                <option value="ALL" style={{ backgroundColor: 'var(--color-surface, #ffffff)', color: 'var(--color-text)' }}>
                  ALL CATEGORIES ({tasks.length})
                </option>
                {categoryOptions.map(cat => (
                  <option key={cat.name} value={cat.name} style={{ backgroundColor: 'var(--color-surface, #ffffff)', color: 'var(--color-text)' }}>
                    {cat.name.toUpperCase()} ({cat.count})
                  </option>
                ))}
              </select>

              {selectedCategory !== 'ALL' && (
                <button
                  type="button"
                  style={styles.clearSortBtn}
                  className="kanban-filter-reset"
                  onClick={() => setSelectedCategory('ALL')}
                  title="Remove category filter (Select all categories)"
                >
                  <X size={10} style={{ marginRight: '2px' }} /> RESET
                </button>
              )}
            </div>
          </div>

          {/* Assignee Filter Dropdown */}
          <div style={styles.sortGroup} className="kanban-assignee-filter-bar">
            <span style={styles.sortLabel}>ASSIGNEE:</span>
            <div className="kanban-assignee-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                style={{
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  backgroundColor: selectedAssignee !== 'ALL' ? 'var(--color-primary)' : 'var(--color-input-bg, #ffffff)',
                  color: selectedAssignee !== 'ALL' ? 'var(--color-on-primary)' : 'var(--color-text)',
                  border: `1px solid ${selectedAssignee !== 'ALL' ? 'var(--color-primary)' : 'var(--color-muted)'}`,
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'var(--transition-smooth)',
                  minHeight: '34px',
                }}
                className="kanban-assignee-select"
                title="Filter tasks by assigned person"
              >
                <option value="ALL" style={{ backgroundColor: 'var(--color-surface, #ffffff)', color: 'var(--color-text)' }}>
                  ALL ASSIGNEES ({tasks.length})
                </option>
                <option value="UNASSIGNED" style={{ backgroundColor: 'var(--color-surface, #ffffff)', color: 'var(--color-text)' }}>
                  UNASSIGNED ({assigneeOptions.unassignedCount})
                </option>
                {assigneeOptions.list.map(asg => (
                  <option key={asg.name} value={asg.name} style={{ backgroundColor: 'var(--color-surface, #ffffff)', color: 'var(--color-text)' }}>
                    {asg.name.toUpperCase()} ({asg.count})
                  </option>
                ))}
              </select>

              {selectedAssignee !== 'ALL' && (
                <button
                  type="button"
                  style={styles.clearSortBtn}
                  className="kanban-filter-reset"
                  onClick={() => setSelectedAssignee('ALL')}
                  title="Remove assignee filter"
                >
                  <X size={10} style={{ marginRight: '2px' }} /> RESET
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sort Bar */}
        <div style={styles.sortGroup} className="kanban-sort-bar">
          <span style={styles.sortLabel}>SORT:</span>
          <button
            style={{
              ...styles.sortBtn,
              backgroundColor: sortField === 'priority' ? 'var(--color-primary)' : 'transparent',
              color: sortField === 'priority' ? 'var(--color-on-primary)' : 'var(--color-text)',
              borderColor: sortField === 'priority' ? 'var(--color-primary)' : 'var(--color-muted)',
              minHeight: '34px',
            }}
            className="kanban-sort-btn"
            onClick={() => handleSortClick('priority')}
            title="Sort by Priority"
          >
            <AlertTriangle size={13} style={{ marginRight: '0.25rem' }} />
            PRIORITY {sortField === 'priority' ? (sortDirection === 'asc' ? '↓' : '↑') : ''}
          </button>
          <button
            style={{
              ...styles.sortBtn,
              backgroundColor: sortField === 'dueDate' ? 'var(--color-primary)' : 'transparent',
              color: sortField === 'dueDate' ? 'var(--color-on-primary)' : 'var(--color-text)',
              borderColor: sortField === 'dueDate' ? 'var(--color-primary)' : 'var(--color-muted)',
              minHeight: '34px',
            }}
            className="kanban-sort-btn"
            onClick={() => handleSortClick('dueDate')}
            title="Sort by Due Date"
          >
            <Clock size={13} style={{ marginRight: '0.25rem' }} />
            DUE DATE {sortField === 'dueDate' ? (sortDirection === 'asc' ? '↓' : '↑') : ''}
          </button>
          {(sortField !== 'default' || selectedCategory !== 'ALL' || selectedAssignee !== 'ALL' || filterPriority !== 'ALL' || filterOnlyOverdue || searchQuery) && (
            <button
              style={{ ...styles.clearSortBtn, minHeight: '34px' }}
              className="kanban-sort-reset"
              onClick={() => {
                setSortField('default');
                setSelectedCategory('ALL');
                setSelectedAssignee('ALL');
                setFilterPriority('ALL');
                setFilterOnlyOverdue(false);
                setSearchQuery('');
              }}
              title="Reset all filters and sorting"
            >
              <X size={10} style={{ marginRight: '2px' }} /> RESET ALL
            </button>
          )}
        </div>
      </div>

      {/* Slide-Over Task Inspector [Monarch UX] */}
      <SlideOverDrawer
        isOpen={Boolean(isAdding || editingTask)}
        onClose={() => { setIsAdding(false); setEditingTask(null); }}
        title={isAdding ? 'Add New Task' : (formState.taskName || 'Edit Task')}
        subtitle={editingTask ? `${formState.kanbanStage || 'To Do'} · ${formState.priority || 'Medium'} Priority` : 'New wedding checklist task'}
        badge="TASK INSPECTOR"
        badgeColor={getPriorityBorderColor(formState.priority || 'Medium')}
        hasPrevious={currentTaskIndex > 0}
        hasNext={currentTaskIndex >= 0 && currentTaskIndex < filteredTasks.length - 1}
        onPrevious={() => handleNavigateAdjacentTask(-1)}
        onNext={() => handleNavigateAdjacentTask(1)}
        width="520px"
        footer={
          (() => {
            const isTaskFormValid = Boolean((formState.taskName || '').trim());
            const isDisabled = !isTaskFormValid || Boolean(isSyncing);
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
                {!isAdding && editingTask ? (
                  <button
                    type="button"
                    style={styles.deleteBtn}
                    onClick={() => setTaskToDelete(editingTask)}
                    title="Delete task"
                  >
                    DELETE
                  </button>
                ) : (
                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={() => { setIsAdding(false); setEditingTask(null); }}
                  >
                    CANCEL
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!isAdding && (
                    <button
                      type="button"
                      style={styles.cancelBtn}
                      onClick={() => { setIsAdding(false); setEditingTask(null); }}
                    >
                      CANCEL
                    </button>
                  )}
                  {isAdding && (
                    <button
                      type="button"
                      style={{
                        ...styles.saveBtn,
                        backgroundColor: 'transparent',
                        color: isDisabled ? 'var(--color-muted, #94A3B8)' : 'var(--color-primary, #0F172A)',
                        border: `1px solid ${isDisabled ? 'var(--color-border, #CBD5E1)' : 'var(--color-primary, #0F172A)'}`,
                        opacity: isDisabled ? 0.45 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                      disabled={isDisabled}
                      title={!isTaskFormValid ? 'Enter Task Name to enable saving' : undefined}
                      onClick={(e) => saveTask(e, true)}
                    >
                      SAVE & ADD NEW
                    </button>
                  )}
                  <button
                    type="button"
                    style={{
                      ...styles.saveBtn,
                      backgroundColor: isDisabled ? 'var(--color-muted, #94A3B8)' : 'var(--color-primary)',
                      color: '#ffffff',
                      opacity: isDisabled ? 0.45 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isDisabled}
                    title={!isTaskFormValid ? 'Enter Task Name to enable saving' : undefined}
                    onClick={(e) => saveTask(e)}
                  >
                    {isSyncing ? 'SAVING...' : (isAdding ? 'SAVE TASK' : 'SAVE CHANGES')}
                  </button>
                </div>
              </div>
            );
          })()
        }
      >
        <form onSubmit={saveTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* SECTION 1: TASK DETAILS */}
          <DrawerSection title="TASK DETAILS" icon={<CheckSquare size={13} style={{ color: 'var(--color-primary)' }} />}>
            <DrawerField label="TASK NAME" required>
              <input
                type="text"
                required
                placeholder="e.g. Call Florist to confirm delivery"
                value={formState.taskName || ''}
                onChange={(e) => handleInputChange('taskName', e.target.value)}
                style={styles.input}
              />
            </DrawerField>

            <DrawerRow columns={2}>
              <DrawerField label="KANBAN STAGE">
                <select
                  value={formState.kanbanStage || 'To Do'}
                  onChange={(e) => handleInputChange('kanbanStage', e.target.value as KanbanStage)}
                  style={styles.select}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </DrawerField>

              <DrawerField label="CATEGORY">
                <TaskCombobox
                  label="Category"
                  fieldId="task-category-input"
                  placeholder="e.g. Florals, Attire, Venue"
                  value={formState.category || ''}
                  onChange={(val) => handleInputChange('category', val)}
                  options={existingCategories}
                />
              </DrawerField>
            </DrawerRow>
          </DrawerSection>

          {/* SECTION 2: PRIORITY & SCHEDULE */}
          <DrawerSection title="PRIORITY & SCHEDULE" icon={<Clock size={13} style={{ color: '#F59E0B' }} />}>
            <DrawerField label="PRIORITY LEVEL">
              <PriorityPills
                value={formState.priority || 'Medium'}
                onChange={(val) => handleInputChange('priority', val)}
              />
            </DrawerField>

            <DrawerField
              label={`DUE DATE ${formState.dueDate ? `(${formatDateToMMDDYYYY(formState.dueDate)})` : ''}`}
              hint={isDueDatePast(formState.dueDate, formState.kanbanStage) ? 'PAST DUE' : undefined}
              error={isDueDatePast(formState.dueDate, formState.kanbanStage) ? 'This task deadline is past due' : undefined}
            >
              <input
                type="date"
                value={formatDateConsistent(formState.dueDate) === '-' ? '' : formatDateConsistent(formState.dueDate)}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                style={{
                  ...styles.input,
                  color: isDueDatePast(formState.dueDate, formState.kanbanStage) ? 'var(--color-red, #ef4444)' : undefined,
                  borderColor: isDueDatePast(formState.dueDate, formState.kanbanStage) ? 'var(--color-red, #ef4444)' : undefined,
                  fontWeight: isDueDatePast(formState.dueDate, formState.kanbanStage) ? 600 : undefined,
                }}
              />
              <QuickDateChips
                currentDate={formatDateConsistent(formState.dueDate) === '-' ? '' : formatDateConsistent(formState.dueDate)}
                onSelectDate={(d) => handleInputChange('dueDate', d)}
                onClear={() => handleInputChange('dueDate', '')}
              />
            </DrawerField>
          </DrawerSection>

          {/* SECTION 3: ASSIGNMENT & NOTES */}
          <DrawerSection title="ASSIGNMENT & NOTES" icon={<User size={13} style={{ color: '#0284C7' }} />}>
            <DrawerField label="QUICK ASSIGN">
              <QuickAssignChips
                p1={p1}
                p2={p2}
                currentAssignee={formState.assignedTo}
                onSelectAssignee={(asg) => handleInputChange('assignedTo', asg)}
              />
            </DrawerField>

            <DrawerField label="ASSIGNED TO (OR CUSTOM COLLABORATOR)">
              <TaskCombobox
                label="Assigned To"
                fieldId="task-assignee-input"
                placeholder="e.g. John, Maid of Honor"
                value={formState.assignedTo || ''}
                onChange={(val) => handleInputChange('assignedTo', val)}
                options={existingAssignees}
              />
            </DrawerField>

            <DrawerField label="NOTES & CHECKLIST">
              <textarea
                placeholder="Task details, links, or sub-checklist..."
                value={formState.notes || ''}
                rows={3}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                style={styles.textarea}
              />
            </DrawerField>
          </DrawerSection>
        </form>
      </SlideOverDrawer>

      {/* IN-APP DELETE TASK CONFIRMATION MODAL */}
      {taskToDelete && (
        <div style={styles.modalOverlay} className="task-delete-overlay" onClick={() => setTaskToDelete(null)}>
          <div style={{ ...styles.modalContent, maxWidth: '440px' }} className="task-delete-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertTriangle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE TASK
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setTaskToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="task-delete-body">
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-red)' }}>"{taskToDelete.taskName}"</strong>?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
                This will permanently remove the task from your wedding planning board and checklist.
              </p>

              <div className="task-delete-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.75rem 1.25rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setTaskToDelete(null)}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-red)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.75rem 1.25rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                  onClick={confirmDeleteTask}
                  disabled={isSyncing}
                >
                  <Trash2 size={15} />
                  {isSyncing ? 'DELETING...' : 'DELETE TASK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JIRA MOBILE ACTION SHEET 1: Fast Status Switcher */}
      {activeStatusTask && (
        <div style={styles.actionSheetOverlay} onClick={() => setActiveStatusTask(null)}>
          <div style={styles.actionSheetContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.actionSheetHandle} />
            <div style={styles.actionSheetHeader}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>MOVE TASK STAGE</span>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
                  {activeStatusTask.taskName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveStatusTask(null)}
                style={styles.actionSheetCloseBtn}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.actionSheetOptions}>
              {(['To Do', 'In Progress', 'Done'] as KanbanStage[]).map((stage) => {
                const isCurrent = activeStatusTask.kanbanStage === stage;
                const stageStyle = getStageStyle(stage);
                return (
                  <button
                    key={stage}
                    type="button"
                    disabled={isSyncing}
                    onClick={async () => {
                      if (isCurrent) {
                        setActiveStatusTask(null);
                        return;
                      }
                      const target = activeStatusTask;
                      setActiveStatusTask(null);
                      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                        try { navigator.vibrate(15); } catch (_) {}
                      }
                      const updated = tasks.map(t => t.taskId === target.taskId ? { ...t, kanbanStage: stage } : t);
                      if (stage === 'Done' && updated.length > 0 && updated.every(t => t.kanbanStage === 'Done')) {
                        triggerConfetti({ particleCount: 90 });
                      }
                      await onUpdate(updated);
                    }}
                    style={{
                      ...styles.actionSheetOptionBtn,
                      backgroundColor: isCurrent ? 'var(--color-bg-hover, rgba(0,0,0,0.05))' : 'transparent',
                      borderColor: isCurrent ? stageStyle.dot : 'var(--color-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: stageStyle.dot,
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 500, color: 'var(--color-text)' }}>
                        {stage.toUpperCase()}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '0.1rem 0.35rem', borderRadius: '3px', backgroundColor: 'var(--color-bg-pane)', color: 'var(--color-muted)' }}>
                          CURRENT
                        </span>
                      )}
                    </div>
                    {isCurrent ? <Check size={16} style={{ color: stageStyle.dot }} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* JIRA MOBILE ACTION SHEET 2: Category Filter Selector */}
      {isCategorySheetOpen && (
        <div style={styles.actionSheetOverlay} onClick={() => setIsCategorySheetOpen(false)}>
          <div style={styles.actionSheetContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.actionSheetHandle} />
            <div style={styles.actionSheetHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={16} style={{ color: 'var(--color-primary)' }} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
                  FILTER BY CATEGORY
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCategorySheetOpen(false)}
                style={styles.actionSheetCloseBtn}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ ...styles.actionSheetOptions, maxHeight: '55vh', overflowY: 'auto' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setIsCategorySheetOpen(false);
                }}
                style={{
                  ...styles.actionSheetOptionBtn,
                  backgroundColor: selectedCategory === 'ALL' ? 'var(--color-bg-hover, rgba(0,0,0,0.05))' : 'transparent',
                  fontWeight: selectedCategory === 'ALL' ? 700 : 400,
                }}
              >
                <span>ALL CATEGORIES ({tasks.length})</span>
                {selectedCategory === 'ALL' && <Check size={16} style={{ color: 'var(--color-primary)' }} />}
              </button>
              {categoryOptions.map(cat => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setIsCategorySheetOpen(false);
                  }}
                  style={{
                    ...styles.actionSheetOptionBtn,
                    backgroundColor: selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'var(--color-bg-hover, rgba(0,0,0,0.05))' : 'transparent',
                    fontWeight: selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 700 : 400,
                  }}
                >
                  <span>{cat.name.toUpperCase()} ({cat.count})</span>
                  {selectedCategory.toLowerCase() === cat.name.toLowerCase() && <Check size={16} style={{ color: 'var(--color-primary)' }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* JIRA MOBILE ACTION SHEET 3: Sort Selector */}
      {isSortSheetOpen && (
        <div style={styles.actionSheetOverlay} onClick={() => setIsSortSheetOpen(false)}>
          <div style={styles.actionSheetContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.actionSheetHandle} />
            <div style={styles.actionSheetHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <SlidersHorizontal size={16} style={{ color: 'var(--color-primary)' }} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
                  SORT TASKS
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsSortSheetOpen(false)}
                style={styles.actionSheetCloseBtn}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.actionSheetOptions}>
              <button
                type="button"
                onClick={() => {
                  setSortField('default');
                  setIsSortSheetOpen(false);
                }}
                style={{
                  ...styles.actionSheetOptionBtn,
                  backgroundColor: sortField === 'default' ? 'var(--color-bg-hover, rgba(0,0,0,0.05))' : 'transparent',
                  fontWeight: sortField === 'default' ? 700 : 400,
                }}
              >
                <span>DEFAULT ORDER</span>
                {sortField === 'default' && <Check size={16} style={{ color: 'var(--color-primary)' }} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSortField('priority');
                  setSortDirection('asc');
                  setIsSortSheetOpen(false);
                }}
                style={{
                  ...styles.actionSheetOptionBtn,
                  backgroundColor: sortField === 'priority' ? 'var(--color-bg-hover, rgba(0,0,0,0.05))' : 'transparent',
                  fontWeight: sortField === 'priority' ? 700 : 400,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} style={{ color: '#EF4444' }} />
                  <span>PRIORITY (HIGH → LOW)</span>
                </div>
                {sortField === 'priority' && <Check size={16} style={{ color: 'var(--color-primary)' }} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSortField('dueDate');
                  setSortDirection('asc');
                  setIsSortSheetOpen(false);
                }}
                style={{
                  ...styles.actionSheetOptionBtn,
                  backgroundColor: sortField === 'dueDate' ? 'var(--color-bg-hover, rgba(0,0,0,0.05))' : 'transparent',
                  fontWeight: sortField === 'dueDate' ? 700 : 400,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} style={{ color: '#3B82F6' }} />
                  <span>DUE DATE (EARLIEST FIRST)</span>
                </div>
                {sortField === 'dueDate' && <Check size={16} style={{ color: 'var(--color-primary)' }} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jira Mobile Segmented Stage Capsule Carousel (Visible on mobile viewports <= 767px) */}
      <div className="kanban-mobile-stage-bar">
        {stages.map(stage => {
          const count = filteredTasks.filter(t => t.kanbanStage === stage).length;
          const isActive = activeMobileStage === stage;
          const stageStyle = getStageStyle(stage);
          return (
            <button
              key={stage}
              type="button"
              onClick={() => {
                setActiveMobileStage(stage);
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  try { navigator.vibrate(12); } catch (_) {}
                }
              }}
              className={`kanban-stage-capsule ${isActive ? 'active' : ''}`}
              style={{
                backgroundColor: isActive ? stageStyle.bg : 'var(--color-surface, #ffffff)',
                borderColor: isActive ? stageStyle.border : 'var(--color-border, #E2E8F0)',
                color: isActive ? stageStyle.color : 'var(--color-muted, #64748B)',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: stageStyle.dot,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span className="kanban-stage-name">{stage.toUpperCase()}</span>
              <span
                className="kanban-stage-count"
                style={{
                  backgroundColor: isActive ? stageStyle.color : 'var(--color-bg-pane, #F1F5F9)',
                  color: isActive ? '#FFFFFF' : 'var(--color-muted, #64748B)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop side-by-side Columns & Mobile Swipeable Container */}
      <div 
        style={styles.boardGrid} 
        className="kanban-grid"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {stages.map(stage => {
          const stageTasks = getSortedTasks(filteredTasks.filter(t => t.kanbanStage === stage));
          const isMobileVisible = activeMobileStage === stage;
          
          return (
            <div 
              key={stage} 
              style={{
                ...styles.column,
                // Hide inactive columns on mobile
                display: 'flex',
              }}
              className={`kanban-column ${isMobileVisible ? 'mobile-visible' : 'mobile-hidden'}`}
            >
              {/* Column Header */}
              <div style={styles.columnHeader}>
                <h3 style={styles.columnTitle}>
                  {stage.toUpperCase()} 
                  <span className="kanban-column-count" style={{ ...styles.columnCount, color: 'var(--color-on-light)' }}>{stageTasks.length}</span>
                </h3>
              </div>

              {/* Tasks List */}
              <div style={styles.taskList}>
                {stageTasks.length === 0 ? (
                  <div style={styles.emptyState}>
                    {selectedCategory !== 'ALL' || selectedAssignee !== 'ALL' || searchQuery || filterPriority !== 'ALL' || filterOnlyOverdue 
                      ? `No matching tasks in ${stage}.` 
                      : (stage === 'To Do' ? 'All caught up! No tasks in To Do.' : (stage === 'In Progress' ? 'No tasks actively in progress.' : 'No completed tasks yet.'))}
                  </div>
                ) : (
                  stageTasks.map(task => {
                    const priorityBorder = getPriorityBorderColor(task.priority);
                    const priStyles = getPriorityBadgeStyles(task.priority);
                    const dateBadge = getSmartDateBadge(task.dueDate, stage);
                    const avatar = getAssigneeAvatar(task.assignedTo, p1, p2);
                    const stageStyle = getStageStyle(task.kanbanStage);

                    return (
                      <div 
                        key={task.taskId} 
                        style={{ 
                          ...styles.taskCard, 
                          borderLeft: `4px solid ${priorityBorder}`,
                          cursor: 'pointer',
                        }}
                        onClick={() => startEdit(task)}
                        title="Click to view details or edit"
                        className="kanban-task-card"
                      >
                        {/* Card Top Row: Category Badge + Smart Relative Due Date & Priority Tag */}
                        <div style={styles.cardHeader}>
                          <span 
                            className="kanban-category-badge" 
                            style={{ 
                              ...styles.categoryBadge, 
                              backgroundColor: 'var(--color-bg-pane, #F1F5F9)', 
                              color: 'var(--color-text, #0F172A)',
                              border: '1px solid var(--color-border, #CBD5E1)',
                            }}
                          >
                            {task.category?.toUpperCase() || 'GENERAL'}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {dateBadge && (
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.62rem',
                                  fontWeight: dateBadge.isOverdue ? 700 : 500,
                                  color: dateBadge.color,
                                  backgroundColor: dateBadge.bg,
                                  border: dateBadge.border,
                                  padding: '0.12rem 0.45rem',
                                  borderRadius: '3px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                                title={`Due Date: ${formatDateToMMDDYYYY(task.dueDate)}`}
                              >
                                <Calendar size={11} style={{ flexShrink: 0 }} />
                                <span>{dateBadge.text}</span>
                              </span>
                            )}

                            {/* Priority Tag */}
                            <span
                              className="kanban-priority-badge-pill"
                              style={{
                                ...styles.priorityBadge,
                                backgroundColor: priStyles.bg,
                                color: priStyles.text,
                                border: priStyles.border,
                              }}
                            >
                              {priStyles.label}
                            </span>
                          </div>
                        </div>
                        
                        {/* Card Middle: 2-Line Clamped Title & Optional Notes Snippet */}
                        <div>
                          <h4 className="kanban-task-title" style={styles.taskName}>{task.taskName}</h4>
                          {task.notes && (
                            <p className="kanban-task-notes-preview" style={styles.taskNotes}>
                              {task.notes}
                            </p>
                          )}
                        </div>

                        {/* Card Footer: 1-Tap Status Switcher Chip & Assignee Avatar */}
                        <div style={styles.cardFooter}>
                          {/* 1-Tap Quick Status Switcher Chip */}
                          <button
                            type="button"
                            className="kanban-status-chip"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStatusTask(task);
                            }}
                            title="Tap to change stage"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.55rem',
                              borderRadius: '12px',
                              fontSize: '0.66rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                              backgroundColor: stageStyle.bg,
                              color: stageStyle.color,
                              border: `1px solid ${stageStyle.border}`,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: stageStyle.dot,
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span>{task.kanbanStage.toUpperCase()}</span>
                            <ChevronDown size={11} style={{ opacity: 0.7 }} />
                          </button>

                          {/* Right side: Assignee Avatar + Desktop Quick Controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <div 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                              title={`Assigned to ${avatar.name}`}
                            >
                              <span
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: avatar.bg,
                                  color: avatar.color,
                                  border: avatar.border,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  fontFamily: 'var(--font-mono)',
                                  flexShrink: 0,
                                }}
                              >
                                {avatar.initials}
                              </span>
                              <span 
                                className="kanban-assignee-text-desktop"
                                style={{
                                  fontSize: '0.68rem',
                                  color: 'var(--color-muted, #64748B)',
                                  maxWidth: '120px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {avatar.name}
                              </span>
                            </div>

                            {/* Desktop Quick Movement controls (Hidden on mobile) */}
                            <div 
                              className="kanban-desktop-quick-moves"
                              style={styles.quickMoves}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                type="button"
                                style={styles.cardActionBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(task);
                                }}
                                title="Edit task"
                              >
                                <Edit2 size={12} />
                              </button>
                              
                              {stage !== 'To Do' && (
                                <button 
                                  type="button"
                                  style={styles.cardActionBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTask(task, 'backward');
                                  }}
                                  disabled={isSyncing}
                                  title="Move back"
                                >
                                  <ArrowLeft size={12} />
                                </button>
                              )}
                              {stage !== 'Done' && (
                                <button 
                                  type="button"
                                  style={styles.cardActionBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTask(task, 'forward');
                                  }}
                                  disabled={isSyncing}
                                  title="Move forward"
                                >
                                  <ArrowRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Column Bottom Quick-Add Button */}
              <button
                type="button"
                onClick={() => startAdd(stage)}
                disabled={isSyncing}
                className="kanban-column-bottom-add-btn"
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  color: 'var(--color-primary)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 'var(--border-radius-sm, 6px)',
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: isSyncing ? 0.6 : 1,
                  boxShadow: 'var(--box-shadow-subtle)',
                }}
                title={`Add task to ${stage}`}
              >
                <Plus size={13} strokeWidth={2.5} /> ADD {stage.toUpperCase()} TASK
              </button>
            </div>
          );
        })}
      </div>

      {/* CSS details to ensure columns, header, Jira mobile elements, and modals switch properly across screen sizes */}
      <style>{`
        .kanban-filter-sort-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-muted);
          border-radius: var(--border-radius-md);
          padding: 0.75rem 1rem;
          box-shadow: var(--box-shadow-subtle);
        }
        .kanban-filters-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .kanban-column-bottom-add-btn:hover {
          background-color: var(--color-bg-hover, rgba(0, 0, 0, 0.04)) !important;
          border-color: var(--color-primary) !important;
          transform: translateY(-1px);
        }

        /* Scannable card text clamping */
        .kanban-task-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
          margin: 0;
          line-height: 1.35;
        }
        .kanban-task-notes-preview {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
          margin: 0.3rem 0 0 0;
        }

        /* Jira Mobile Quick Filter Chips */
        .kanban-quick-chips-bar {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 0.25rem 0.15rem 0.65rem 0.15rem;
          margin-bottom: 0.5rem;
          scrollbar-width: none;
        }
        .kanban-quick-chips-bar::-webkit-scrollbar {
          display: none;
        }
        .kanban-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.38rem 0.7rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-family: var(--font-mono);
          font-weight: 600;
          white-space: nowrap;
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #CBD5E1);
          color: var(--color-text, #1E293B);
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          -webkit-tap-highlight-color: transparent;
        }
        .kanban-filter-chip:hover {
          border-color: var(--color-primary);
        }
        .kanban-filter-chip.active {
          background-color: var(--color-primary) !important;
          color: var(--color-on-primary, #ffffff) !important;
          border-color: var(--color-primary) !important;
        }
        .kanban-filter-chip.reset {
          background-color: transparent;
          border: 1px dashed var(--color-muted);
          color: var(--color-muted);
        }
        .kanban-search-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.32rem 0.65rem;
          border-radius: 9999px;
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #CBD5E1);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .kanban-search-chip.open {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 1px var(--color-primary);
        }
        .kanban-search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.72rem;
          font-family: var(--font-sans);
          color: var(--color-text);
          width: 95px;
          transition: width 0.2s ease;
        }
        .kanban-search-input:focus {
          width: 130px;
        }
        .kanban-search-clear {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: var(--color-muted);
          display: flex;
          align-items: center;
        }

        /* Jira Mobile Segmented Stage Capsule Bar */
        .kanban-mobile-stage-bar {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.75rem;
          background-color: var(--color-bg-subtle, rgba(0,0,0,0.03));
          padding: 4px;
          border-radius: var(--border-radius-md, 8px);
          border: 1px solid var(--color-border, #E2E8F0);
        }
        .kanban-stage-capsule {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.5rem 0.35rem;
          border-radius: var(--border-radius-sm, 6px);
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 600;
          -webkit-tap-highlight-color: transparent;
        }
        .kanban-stage-name {
          letter-spacing: 0.02em;
        }
        .kanban-stage-count {
          font-size: 0.65rem;
          padding: 0.08rem 0.35rem;
          border-radius: 9999px;
          font-weight: 700;
        }

        .kanban-status-chip:hover {
          filter: brightness(0.96);
          transform: translateY(-1px);
        }
        .kanban-status-chip:active {
          transform: scale(0.97);
        }

        /* Action Sheet Animation Keyframes */
        @keyframes sheetSlideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes sheetFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Desktop vs Mobile Media Queries */
        @media (min-width: 768px) {
          .kanban-quick-chips-bar {
            display: none !important;
          }
          .kanban-mobile-stage-bar {
            display: none !important;
          }
          .mobile-hidden {
            display: flex !important;
          }
        }

        @media (max-width: 767px) {
          .kanban-filter-sort-bar-desktop {
            display: none !important;
          }
          .kanban-desktop-quick-moves {
            display: none !important;
          }
          .kanban-assignee-text-desktop {
            display: none !important;
          }
          .mobile-hidden {
            display: none !important;
          }
          .mobile-visible {
            display: flex !important;
          }
          .kanban-grid {
            grid-template-columns: 1fr !important;
            width: 100% !important;
            margin: 0 auto;
          }
          .kanban-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .kanban-header-text {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.25rem !important;
            width: 100% !important;
          }
          .kanban-add-btn-mobile {
            width: 100% !important;
            justify-content: center !important;
            padding: 0.65rem 1rem !important;
            font-size: 0.85rem !important;
          }
          .kanban-header-actions {
            width: 100% !important;
          }
          .kanban-filter-sort-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 0.75rem !important;
            gap: 0.65rem !important;
          }
          .kanban-filters-group {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
            width: 100% !important;
          }
          .kanban-category-filter-bar,
          .kanban-assignee-filter-bar {
            width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .kanban-category-select-wrapper,
          .kanban-assignee-select-wrapper {
            flex: 1 !important;
            display: flex !important;
          }
          .kanban-category-select,
          .kanban-assignee-select {
            flex: 1 !important;
            width: 100% !important;
          }
          .kanban-sort-bar {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            gap: 0.4rem !important;
            padding-top: 0.4rem !important;
            border-top: 1px dashed var(--color-muted) !important;
          }
          .kanban-sort-btn {
            flex: 1 !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 0.45rem 0.25rem !important;
          }
          .kanban-add-btn-desktop {
            display: none !important;
          }
          .task-delete-content {
            width: 100% !important;
            margin: 0.5rem !important;
          }
          .task-delete-actions {
            flex-direction: column !important;
          }
          .task-delete-actions button {
            width: 100% !important;
            justify-content: center !important;
          }
          .task-progress-toggle-group {
            width: 100% !important;
            align-self: stretch !important;
          }
          .task-progress-toggle-btn {
            flex: 1 !important;
            justify-content: center !important;
            padding: 0.35rem 0.5rem !important;
          }
        }

        .task-progress-card-header {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          width: 100%;
        }
        .task-progress-card-title {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-muted);
          letter-spacing: 0.05em;
          width: 100%;
          line-height: 1.3;
        }
        .task-progress-toggle-group {
          display: inline-flex;
          gap: 0.25rem;
          background-color: var(--color-bg, #f3f4f6);
          padding: 2px;
          border-radius: var(--border-radius-sm);
          align-self: flex-start;
        }
        .task-progress-toggle-btn {
          border: none;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          font-family: var(--font-mono);
          font-weight: 600;
          transition: all 0.15s ease;
        }
      `}</style>

      {/* Mobile Floating Action Button (FAB) */}
      <MobileFAB onClick={() => startAdd('To Do')} label="Add Task" disabled={isSyncing} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.85rem',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.85rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: 'var(--color-primary)',
  },
  headerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    width: '100%',
  },
  sortGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginRight: '0.25rem',
  },
  sortLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
    fontWeight: 600,
  },
  sortBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 600,
    padding: '0.35rem 0.6rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
  },
  clearSortBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    padding: '0.35rem 0.5rem',
    backgroundColor: 'transparent',
    color: 'var(--color-muted)',
    border: '1px dashed var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  addButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
  },
  mobileTabs: {
    display: 'flex',
    borderBottom: '1px solid var(--color-muted)',
    gap: '1rem',
    paddingBottom: '2px',
  },
  mobileTabButton: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 0',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    textAlign: 'center',
  },
  boardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
    marginTop: '0.5rem',
  },
  column: {
    flexDirection: 'column',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '1rem',
    border: '1px solid var(--color-muted)',
    minHeight: '400px',
  },
  columnHeader: {
    marginBottom: '1rem',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.5rem',
  },
  columnTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.15rem',
    color: 'var(--color-primary)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  columnCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    backgroundColor: 'var(--color-bg-hover)',
    color: 'var(--color-primary)',
    padding: '0.125rem 0.5rem',
    borderRadius: '10px',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    overflowY: 'auto',
    flex: 1,
  },
  taskCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.875rem',
    boxShadow: 'var(--box-shadow-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'var(--transition-smooth)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-bg-hover)',
    color: 'var(--color-primary)',
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  priorityBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  taskName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  taskNotes: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    lineHeight: '1.4',
  },
  cardFooter: {
    marginTop: '0.25rem',
    borderTop: '1px dotted #eeeeee',
    paddingTop: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.675rem',
    color: 'var(--color-muted)',
  },
  icon: {
    color: 'var(--color-muted)',
    flexShrink: 0,
  },
  quickMoves: {
    display: 'flex',
    gap: '0.25rem',
  },
  cardActionBtn: {
    background: 'none',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '1.5rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    border: '1px dashed var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 27, 42, 0.4)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-bg)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.15rem',
    color: 'var(--color-on-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-on-primary)',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.875rem',
    padding: '1.25rem 1.25rem 3.5rem 1.25rem',
    overflowY: 'auto',
    flex: 1,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    color: 'var(--color-text)',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    color: 'var(--color-text)',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '0.875rem 1.25rem',
    borderTop: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-bg)',
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
  },
  deleteBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--color-red)',
    color: 'var(--color-on-light)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    marginRight: 'auto',
  },
  cancelBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  saveBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  actionSheetOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 1100,
  },
  actionSheetContent: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    width: '100%',
    maxWidth: '520px',
    padding: '0.85rem 1.25rem 2rem 1.25rem',
    boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.18)',
    borderTop: '1px solid var(--color-border, #E2E8F0)',
  },
  actionSheetHandle: {
    width: '38px',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: 'var(--color-muted, #94A3B8)',
    margin: '0 auto 0.85rem auto',
    opacity: 0.6,
  },
  actionSheetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.85rem',
    paddingBottom: '0.65rem',
    borderBottom: '1px solid var(--color-border, #E2E8F0)',
  },
  actionSheetCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted, #64748B)',
    cursor: 'pointer',
    padding: '0.35rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSheetOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  actionSheetOptionBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm, 6px)',
    border: '1px solid var(--color-border, #CBD5E1)',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
  }
};
