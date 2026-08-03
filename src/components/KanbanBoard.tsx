'use client';

import React, { useState } from 'react';
import { Task, KanbanStage } from '@/lib/sheets/types';
import { Plus, Edit2, ArrowRight, ArrowLeft, Trash2, Calendar, User, X, Clock, AlertTriangle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdate: (updatedTasks: Task[]) => Promise<void>;
  isSyncing: boolean;
  initialStage?: KanbanStage;
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

  // Sorting state
  const [sortField, setSortField] = useState<'default' | 'priority' | 'dueDate'>('default');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;

    let updated: Task[];
    if (isAdding) {
      updated = [...tasks, formState as Task];
    } else {
      updated = tasks.map(t => 
        t.taskId === editingTask?.taskId ? (formState as Task) : t
      );
    }

    await onUpdate(updated);
    setIsAdding(false);
    setEditingTask(null);
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
      case 'medium': return { bg: 'var(--color-gold)', text: '#000000' };
      case 'low': return { bg: 'var(--color-green-muted)', text: 'var(--color-green)' };
      default: return { bg: 'var(--color-gold)', text: '#000000' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} className="kanban-header">
        <div className="kanban-header-top">
          <h2 style={styles.title}>Kanban Checklist</h2>
          <button style={styles.addButton} className="kanban-add-btn-mobile" onClick={() => startAdd('To Do')} disabled={isSyncing}>
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

          <button style={{ ...styles.addButton, color: '#000000' }} className="kanban-add-btn-desktop" onClick={() => startAdd('To Do')} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD TASK
          </button>
        </div>
      </div>

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
              <h3 style={{ ...styles.modalTitle, color: '#000000' }} className="modalTitle">
                {isAdding ? 'ADD TASK' : 'EDIT TASK'}
              </h3>
              <button style={{ ...styles.closeBtn, color: '#000000' }} className="closeBtn" onClick={() => { setIsAdding(false); setEditingTask(null); }}>
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
                  <input
                    type="text"
                    placeholder="e.g. Florals, Attire"
                    value={formState.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>ASSIGNED TO</label>
                  <input
                    type="text"
                    placeholder="e.g. John"
                    value={formState.assignedTo || ''}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    style={styles.input}
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
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : 'SAVE TASK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE TASK CONFIRMATION MODAL */}
      {taskToDelete && (
        <div style={styles.modalOverlay} onClick={() => setTaskToDelete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertTriangle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE TASK CONFIRMATION
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setTaskToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to delete task <strong style={{ color: 'var(--color-red)' }}>"{taskToDelete.taskName}"</strong>?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
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
                    padding: '0.625rem 1.25rem',
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
                    padding: '0.625rem 1.25rem',
                    cursor: 'pointer'
                  }}
                  onClick={confirmDeleteTask}
                  disabled={isSyncing}
                >
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
                  <span className="kanban-column-count" style={{ ...styles.columnCount, color: '#000000' }}>{stageTasks.length}</span>
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
                      <div key={task.taskId} style={styles.taskCard}>
                        <div style={styles.cardHeader}>
                          <span className="kanban-category-badge" style={{ ...styles.categoryBadge, backgroundColor: 'var(--color-muted)', color: '#ffffff' }}>{task.category.toUpperCase() || 'GENERAL'}</span>
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
                          <div style={styles.quickMoves}>
                            <button 
                              style={styles.cardActionBtn}
                              onClick={() => startEdit(task)}
                            >
                              <Edit2 size={12} />
                            </button>
                            
                            {stage !== 'To Do' && (
                              <button 
                                style={styles.cardActionBtn}
                                onClick={() => moveTask(task, 'backward')}
                                title="Move back"
                              >
                                <ArrowLeft size={12} />
                              </button>
                            )}
                            {stage !== 'Done' && (
                              <button 
                                style={styles.cardActionBtn}
                                onClick={() => moveTask(task, 'forward')}
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

      {/* CSS details to ensure columns and header switch properly on mobile */}
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
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
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
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#eef2f7',
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
    backgroundColor: '#eef2f7',
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
    padding: '1.25rem',
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
    backgroundColor: '#ef4444',
    color: '#000000',
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
