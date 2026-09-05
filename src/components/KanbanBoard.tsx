'use client';

import React, { useState } from 'react';
import { Task, KanbanStage } from '@/lib/sheets/types';
import { Plus, Edit2, ArrowRight, ArrowLeft, Trash2, Calendar, User, X, Clock, AlertTriangle, CheckCircle2, Circle, LayoutGrid, BarChart2, ChevronDown, Check } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdate: (updatedTasks: Task[]) => Promise<void>;
  isSyncing: boolean;
  initialStage?: KanbanStage;
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

export default function KanbanBoard({ tasks, onUpdate, isSyncing, initialStage }: KanbanBoardProps) {
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
  const [progressViewMode, setProgressViewMode] = useState<'cards' | 'bar'>('cards');

  // Sorting state
  const [sortField, setSortField] = useState<'default' | 'priority' | 'dueDate'>('default');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Compute dynamic suggestions for Categories & Assignees from existing tasks [TASK-AUTO-SUGGEST]
  const existingCategories = Array.from(new Set([
    'Venue', 'Attire', 'Catering', 'Florals', 'Photography', 'Music', 'Guests', 'Decor', 'Invitations', 'Legal', 'Personal',
    ...tasks.map(t => (t.category || '').trim()).filter(Boolean)
  ])).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const existingAssignees = Array.from(new Set([
    'Bride', 'Groom', 'Bride & Groom', 'Maid of Honor', 'Best Man', 'Wedding Planner',
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

        const timeA = new Date(a.dueDate).getTime();
        const timeB = new Date(b.dueDate).getTime();
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
      await onUpdate(updated);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setFormState(task);
    setIsAdding(false);
  };

  const startAdd = (stage: KanbanStage) => {
    setFormState({
      taskId: `T${tasks.length + 1}`,
      taskName: '',
      kanbanStage: stage,
      category: '',
      priority: 'Medium',
      assignedTo: '',
      dueDate: '',
      notes: '',
    });
    setIsAdding(true);
    setEditingTask(null);
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

    if (continueAdding) {
      setFormState({
        taskId: `T${updated.length + 1}`,
        taskName: '',
        kanbanStage: formState.kanbanStage || 'To Do',
        category: formState.category || '',
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} className="kanban-header">
        <div className="kanban-header-top">
          <div className="kanban-header-text">
            <h2 style={styles.title}>Kanban Checklist</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-sans)' }}>
              Organize your wedding tasks using Kanban workflow columns (To Do, In Progress, Done) for visual task tracking.
            </p>
          </div>
          <button style={{ ...styles.addButton, color: 'var(--color-on-light)' }} className="kanban-add-btn-mobile" onClick={() => startAdd('To Do')} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD TASK
          </button>
        </div>

        <div style={styles.headerActions} className="kanban-header-actions">
          <div style={styles.sortGroup} className="kanban-sort-bar">
            <span style={styles.sortLabel}>SORT:</span>
            <button
              style={{
                ...styles.sortBtn,
                backgroundColor: sortField === 'priority' ? 'var(--color-primary)' : 'transparent',
                color: sortField === 'priority' ? 'var(--color-on-primary)' : 'var(--color-text)',
                borderColor: sortField === 'priority' ? 'var(--color-primary)' : 'var(--color-muted)'
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
                borderColor: sortField === 'dueDate' ? 'var(--color-primary)' : 'var(--color-muted)'
              }}
              className="kanban-sort-btn"
              onClick={() => handleSortClick('dueDate')}
              title="Sort by Due Date"
            >
              <Clock size={13} style={{ marginRight: '0.25rem' }} />
              DUE DATE {sortField === 'dueDate' ? (sortDirection === 'asc' ? '↓' : '↑') : ''}
            </button>
            {sortField !== 'default' && (
              <button
                style={styles.clearSortBtn}
                className="kanban-sort-reset"
                onClick={() => setSortField('default')}
                title="Reset Sorting"
              >
                RESET
              </button>
            )}
          </div>

          <button style={{ ...styles.addButton, color: 'var(--color-on-light)' }} className="kanban-add-btn-desktop" onClick={() => startAdd('To Do')} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD TASK
          </button>
        </div>
      </div>

      {/* Switchable Progress Cards / Progress Bar Header [TASK-2] */}
      {(() => {
        const total = tasks.length;
        const toDoCount = tasks.filter(t => t.kanbanStage === 'To Do').length;
        const inProgressCount = tasks.filter(t => t.kanbanStage === 'In Progress').length;
        const doneCount = tasks.filter(t => t.kanbanStage === 'Done').length;
        const percentDone = total > 0 ? Math.round((doneCount / total) * 100) : 0;

        return (
          <div style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-muted)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1rem 1.25rem',
            margin: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.05em' }}>
                TASK PROGRESS & COMPLETION METRICS
              </span>
              <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--color-bg, #f3f4f6)', padding: '2px', borderRadius: 'var(--border-radius-sm)' }}>
                <button
                  type="button"
                  onClick={() => setProgressViewMode('cards')}
                  style={{
                    backgroundColor: progressViewMode === 'cards' ? 'var(--color-primary)' : 'transparent',
                    color: progressViewMode === 'cards' ? '#ffffff' : 'var(--color-muted)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                  }}
                  title="Switch to Progress Cards view"
                >
                  <LayoutGrid size={13} /> CARDS
                </button>
                <button
                  type="button"
                  onClick={() => setProgressViewMode('bar')}
                  style={{
                    backgroundColor: progressViewMode === 'bar' ? 'var(--color-primary)' : 'transparent',
                    color: progressViewMode === 'bar' ? '#ffffff' : 'var(--color-muted)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                  }}
                  title="Switch to Progress Bar view"
                >
                  <BarChart2 size={13} /> PROGRESS BAR
                </button>
              </div>
            </div>

            {progressViewMode === 'cards' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
              }}>
                <div 
                  onClick={() => setActiveMobileStage('To Do')}
                  style={{
                    backgroundColor: 'var(--color-bg, #f9fafb)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '0.2rem',
                    cursor: 'pointer',
                  }}
                  title="Click to view To Do stage"
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted)' }}>TO DO</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>{toDoCount} / {total}</span>
                </div>

                <div 
                  onClick={() => setActiveMobileStage('In Progress')}
                  style={{
                    backgroundColor: 'var(--color-bg, #f9fafb)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '0.2rem',
                    cursor: 'pointer',
                  }}
                  title="Click to view In Progress stage"
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted)' }}>IN PROGRESS</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-gold, #f59e0b)' }}>{inProgressCount}</span>
                </div>

                <div 
                  onClick={() => setActiveMobileStage('Done')}
                  style={{
                    backgroundColor: 'var(--color-bg, #f9fafb)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '0.2rem',
                    cursor: 'pointer',
                  }}
                  title="Click to view Completed stage"
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted)' }}>COMPLETED</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-green, #10b981)' }}>{doneCount} ({percentDone}%)</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>Planning Progress</span>
                  <span style={{ color: 'var(--color-green, #10b981)', fontWeight: 800 }}>{percentDone}% ({doneCount} / {total} Tasks Completed)</span>
                </div>
                <div style={{ height: '14px', width: '100%', backgroundColor: 'var(--color-bg, #e5e7eb)', borderRadius: '7px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${percentDone}%`, backgroundColor: 'var(--color-green, #10b981)', height: '100%', transition: 'width 0.4s ease' }} />
                  <div style={{ width: `${total > 0 ? (inProgressCount / total) * 100 : 0}%`, backgroundColor: 'var(--color-gold, #f59e0b)', height: '100%', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                  <span>🟢 Completed: <strong>{doneCount}</strong></span>
                  <span>🟡 In Progress: <strong>{inProgressCount}</strong></span>
                  <span>⚪ To Do: <strong>{toDoCount}</strong></span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Editor Modal */}
      {(isAdding || editingTask) && (
        <div className="task-modal-overlay" style={styles.modalOverlay}>
          <style>{`
            @media (max-width: 640px) {
              .task-modal-overlay {
                padding: 0.5rem !important;
              }
              .task-modal-content {
                width: 100% !important;
                max-height: 92vh !important;
              }
              .task-form-grid {
                grid-template-columns: 1fr !important;
                gap: 0.75rem !important;
              }
              .task-field-span-2 {
                grid-column: span 1 !important;
              }
            }
          `}</style>
          <div className="task-modal-content" style={styles.modalContent}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-primary, #ffffff)' }} className="modalTitle">
                {isAdding ? 'ADD TASK' : 'EDIT TASK'}
              </h3>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-primary, #ffffff)' }} className="closeBtn" onClick={() => { setIsAdding(false); setEditingTask(null); }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={saveTask} style={styles.form}>
              <div className="task-form-grid" style={styles.formGrid}>
                <div className="task-field-span-2" style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>TASK NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call Florist to confirm delivery"
                    value={formState.taskName || ''}
                    onChange={(e) => handleInputChange('taskName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>KANBAN STAGE</label>
                  <select
                    value={formState.kanbanStage || 'To Do'}
                    onChange={(e) => handleInputChange('kanbanStage', e.target.value as KanbanStage)}
                    style={styles.select}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>PRIORITY</label>
                  <select
                    value={formState.priority || 'Medium'}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    style={styles.select}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>CATEGORY</label>
                  <TaskCombobox
                    label="Category"
                    fieldId="task-category-input"
                    placeholder="e.g. Florals, Attire, Venue"
                    value={formState.category || ''}
                    onChange={(val) => handleInputChange('category', val)}
                    options={existingCategories}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>ASSIGNED TO</label>
                  <TaskCombobox
                    label="Assigned To"
                    fieldId="task-assignee-input"
                    placeholder="e.g. John, Maid of Honor"
                    value={formState.assignedTo || ''}
                    onChange={(val) => handleInputChange('assignedTo', val)}
                    options={existingAssignees}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>DUE DATE</label>
                  <input
                    type="date"
                    value={formState.dueDate || ''}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div className="task-field-span-2" style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>NOTES / LINKS</label>
                  <textarea
                    placeholder="Task details, links, or sub-checklist..."
                    value={formState.notes || ''}
                    rows={3}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    style={styles.textarea}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                {!isAdding && editingTask && (
                  <button 
                    type="button" 
                    style={styles.deleteBtn}
                    onClick={() => setTaskToDelete(editingTask)}
                  >
                    DELETE
                  </button>
                )}
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => { setIsAdding(false); setEditingTask(null); }}
                >
                  CANCEL
                </button>
                {isAdding && (
                  <button
                    type="button"
                    style={{
                      ...styles.saveBtn,
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      color: 'var(--color-primary)',
                      border: '2px solid var(--color-primary)',
                    }}
                    disabled={isSyncing}
                    onClick={(e) => saveTask(e, true)}
                  >
                    {isSyncing ? 'SAVING...' : 'SAVE & ADD NEW'}
                  </button>
                )}
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : (isAdding ? 'SAVE TASK' : 'SAVE CHANGES')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                This will permanently remove the task from your wedding planning board and Google Sheet checklist.
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

      {/* Mobile Tab Swapper */}
      <div style={styles.mobileTabs}>
        {stages.map(stage => {
          const count = tasks.filter(t => t.kanbanStage === stage).length;
          const isActive = activeMobileStage === stage;
          return (
            <button
              key={stage}
              onClick={() => setActiveMobileStage(stage)}
              style={{
                ...styles.mobileTabButton,
                borderBottomColor: isActive ? 'var(--color-primary)' : 'transparent',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted)'
              }}
            >
              {stage.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Desktop side-by-side Columns */}
      <div style={styles.boardGrid} className="kanban-grid">
        {stages.map(stage => {
          const stageTasks = getSortedTasks(tasks.filter(t => t.kanbanStage === stage));
          const isMobileVisible = activeMobileStage === stage;
          
          return (
            <div 
              key={stage} 
              style={{
                ...styles.column,
                // Hide inactive columns on mobile
                display: 'flex',
                // Keep showing all on desktop through media queries (handled by setting style class or inline conditionals)
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
                  <div style={styles.emptyState}>No tasks here.</div>
                ) : (
                  stageTasks.map(task => {
                    const priColors = getPriorityColor(task.priority);
                    return (
                      <div 
                        key={task.taskId} 
                        style={{ ...styles.taskCard, cursor: 'pointer' }}
                        onClick={() => startEdit(task)}
                        title="Click to edit task"
                      >
                        <div style={styles.cardHeader}>
                          <span className="kanban-category-badge" style={{ ...styles.categoryBadge, backgroundColor: 'var(--color-muted)', color: 'var(--color-on-dark)' }}>{task.category.toUpperCase() || 'GENERAL'}</span>
                          <span style={{ 
                            ...styles.priorityBadge, 
                            backgroundColor: priColors.bg, 
                            color: priColors.text 
                          }}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                        
                        <h4 style={styles.taskName}>{task.taskName}</h4>

                        {task.notes && <p style={styles.taskNotes}>{task.notes}</p>}

                        <div style={styles.cardFooter}>
                          <div style={styles.metaRow}>
                            {task.assignedTo && (
                              <div style={styles.metaItem}>
                                <User size={12} style={styles.icon} />
                                <span>{task.assignedTo}</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div style={styles.metaItem}>
                                <Calendar size={12} style={styles.icon} />
                                <span>{task.dueDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick movement controls */}
                          <div 
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
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS details to ensure columns, header, and delete modal switch properly on mobile */}
      <style jsx global>{`
        @media (max-width: 767px) {
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
          .kanban-header-top {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
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
          .kanban-sort-bar {
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            gap: 0.35rem !important;
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
        }

        @media (min-width: 768px) {
          .kanban-header-top {
            display: contents !important;
          }
          .kanban-add-btn-mobile {
            display: none !important;
          }
        }
      `}</style>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.75rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: 'var(--color-primary)',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  },
  select: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
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
  }
};
