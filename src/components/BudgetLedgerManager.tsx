'use client';

import React, { useState } from 'react';
import { BudgetItem } from '@/lib/sheets/types';
import { Plus, Edit2, Check, X, Trash2, HelpCircle, Grid, List, AlertTriangle, TrendingUp, PieChart } from 'lucide-react';

interface BudgetLedgerManagerProps {
  budget: BudgetItem[];
  onUpdate: (updatedBudget: BudgetItem[]) => Promise<void>;
  isSyncing: boolean;
}

export default function BudgetLedgerManager({ budget, onUpdate, isSyncing }: BudgetLedgerManagerProps) {
  // View mode state
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  // Form Modal state
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<BudgetItem>>({});

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Unique categories for summaries & dropdowns
  const categories = Array.from(new Set(budget.map(item => item.category).filter(Boolean)));

  const filteredBudget = budget.filter(item => {
    const matchesSearch =
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || (item.category || '').toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'All' ? true :
        statusFilter === 'Paid' ? (item.paymentStatus || '').toLowerCase() === 'paid' :
          (item.paymentStatus || '').toLowerCase() !== 'paid';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Totals
  const totalEstimate = budget.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = budget.reduce((sum, item) => sum + item.actualCost, 0);
  const totalPaid = budget.reduce((sum, item) => sum + item.amountPaid, 0);
  const totalBalance = budget.reduce((sum, item) => sum + (item.actualCost - item.amountPaid), 0);

  // Utilization & Health Meters
  const percentUtilized = totalEstimate > 0 ? Math.round((totalActual / totalEstimate) * 100) : 0;
  const isOverallOverBudget = totalActual > totalEstimate;
  const overallHeadroom = totalEstimate - totalActual;

  const meterBarColor =
    percentUtilized > 100 ? '#ef4444' :
      percentUtilized > 90 ? '#cda250' :
        '#10b981';

  // Category Health Breakdown
  const categoryStats = categories.map(cat => {
    const catItems = budget.filter(item => item.category === cat);
    const catEstimate = catItems.reduce((sum, i) => sum + i.estimatedCost, 0);
    const catActual = catItems.reduce((sum, i) => sum + i.actualCost, 0);
    const catPercent = catEstimate > 0 ? Math.min(Math.round((catActual / catEstimate) * 100), 150) : (catActual > 0 ? 100 : 0);
    const isOver = catActual > catEstimate;
    const overAmount = catActual - catEstimate;

    return {
      category: cat,
      estimated: catEstimate,
      actual: catActual,
      percent: catPercent,
      isOver,
      overAmount
    };
  });

  // Form actions
  const startAdd = () => {
    setFormState({
      category: '',
      vendorName: '',
      estimatedCost: 0,
      actualCost: 0,
      amountPaid: 0,
      dueDate: '',
      paymentStatus: 'Pending',
    });
    setIsAdding(true);
    setEditingItem(null);
  };

  const startEdit = (item: BudgetItem) => {
    setFormState(item);
    setEditingItem(item);
    setIsAdding(false);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormState({});
  };

  const handleFormChange = (field: keyof BudgetItem, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: field === 'estimatedCost' || field === 'actualCost' || field === 'amountPaid'
        ? Number(value) || 0
        : value
    }));
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;

    let updatedBudget: BudgetItem[];
    if (isAdding) {
      const newItem: BudgetItem = {
        itemId: `B${budget.length + 1}`,
        category: formState.category || 'General',
        vendorName: formState.vendorName || 'TBD',
        estimatedCost: formState.estimatedCost || 0,
        actualCost: formState.actualCost || 0,
        amountPaid: formState.amountPaid || 0,
        dueDate: formState.dueDate || '',
        paymentStatus: formState.paymentStatus || 'Pending',
      };
      updatedBudget = [...budget, newItem];
    } else {
      updatedBudget = budget.map(item =>
        item.itemId === editingItem?.itemId ? { ...item, ...formState } as BudgetItem : item
      );
    }

    await onUpdate(updatedBudget);
    closeModal();
  };

  const deleteItem = async (itemId: string) => {
    if (isSyncing || !confirm('Are you sure you want to delete this budget item?')) return;
    const updated = budget.filter(item => item.itemId !== itemId);
    await onUpdate(updated);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Budget Ledger</h2>
        <div style={styles.headerActions}>
          <div style={styles.viewToggle}>
            <button
              style={{ ...styles.toggleBtn, backgroundColor: viewMode === 'table' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'table' ? '#fff' : 'var(--color-muted)' }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              style={{ ...styles.toggleBtn, backgroundColor: viewMode === 'card' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'card' ? '#fff' : 'var(--color-muted)' }}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <Grid size={16} />
            </button>
          </div>
          <button style={styles.addButton} onClick={startAdd} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD ITEM
          </button>
        </div>
      </div>

      {/* Budget Progress & Health Banner */}
      <div className={`budget-meter-card ${isOverallOverBudget ? 'is-over-budget' : ''}`} style={styles.meterCard}>
        <div style={styles.meterHeader}>
          <div>
            <span style={styles.meterSubtext}>BUDGET UTILIZATION</span>
            <div style={styles.meterTitleRow}>
              <h3 style={styles.meterTitle}>${totalActual.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 400 }}>of ${totalEstimate.toLocaleString()} Estimated</span></h3>
              {isOverallOverBudget ? (
                <span style={styles.overBadgeMain}>
                  <AlertTriangle size={12} style={{ marginRight: '0.25rem' }} /> OVER BUDGET (+${(totalActual - totalEstimate).toLocaleString()})
                </span>
              ) : (
                <span style={styles.headroomBadge}>
                  ${overallHeadroom.toLocaleString()} REMAINING
                </span>
              )}
            </div>
          </div>
          <div style={styles.percentDisplay}>
            <span style={{ ...styles.percentValue, color: meterBarColor }}>{percentUtilized}%</span>
          </div>
        </div>

        {/* Progress Track */}
        <div style={styles.progressTrack}>
          <div style={{
            ...styles.progressFill,
            width: `${Math.min(percentUtilized, 100)}%`,
            backgroundColor: meterBarColor
          }} />
        </div>

        {/* Category Breakdown Progress Meters */}
        {categoryStats.length > 0 && (
          <div style={styles.categoryMeterGrid}>
            {categoryStats.map(stat => (
              <div key={stat.category} style={{
                ...styles.categoryChip,
                borderColor: stat.isOver ? '#ef4444' : 'var(--color-muted)'
              }}>
                <div style={styles.categoryChipHeader}>
                  <span style={styles.categoryChipName}>{stat.category}</span>
                  {stat.isOver ? (
                    <span style={styles.overBadgeMini}>+${stat.overAmount.toLocaleString()}</span>
                  ) : (
                    <span style={styles.categoryChipPercent}>{stat.percent}%</span>
                  )}
                </div>
                <div style={styles.miniTrack}>
                  <div style={{
                    ...styles.miniFill,
                    width: `${Math.min(stat.percent, 100)}%`,
                    backgroundColor: stat.isOver ? '#ef4444' : stat.percent > 90 ? '#cda250' : '#10b981'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="SEARCH CATEGORY OR VENDOR..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.filtersGroup}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">ALL CATEGORIES</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={styles.filterSelect}
          >
            <option value="All">ALL STATUSES</option>
            <option value="Paid">PAID</option>
            <option value="Pending">PENDING</option>
          </select>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Ledger Table View */
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>CATEGORY</th>
                <th style={styles.th}>VENDOR</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>ESTIMATED</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>ACTUAL</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>PAID</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>OWING</th>
                <th style={styles.th}>DUE DATE</th>
                <th style={styles.th}>STATUS</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudget.map((item) => {
                const owing = item.actualCost - item.amountPaid;
                return (
                  <tr key={item.itemId} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.categoryCell}>{item.category}</span>
                    </td>
                    <td style={styles.td}>
                      <span>{item.vendorName}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <span style={styles.monoText}>${item.estimatedCost.toLocaleString()}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={styles.monoText}>${item.actualCost.toLocaleString()}</span>
                        {item.actualCost > item.estimatedCost && (
                          <span style={styles.overBadgeTable}>
                            <AlertTriangle size={10} style={{ marginRight: '2px' }} /> +${(item.actualCost - item.estimatedCost).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <span style={styles.monoText}>${item.amountPaid.toLocaleString()}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>
                      <span style={{ ...styles.monoText, color: owing > 0 ? 'var(--color-primary)' : 'var(--color-muted)' }}>
                        ${owing.toLocaleString()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.monoText}>{item.dueDate || '-'}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusTag,
                        backgroundColor:
                          item.paymentStatus === 'Paid' ? '#eef2f7' :
                            item.paymentStatus === 'Overdue' ? '#fee2e2' :
                              'var(--color-highlight)',
                        color:
                          item.paymentStatus === 'Paid' ? 'var(--color-primary)' :
                            item.paymentStatus === 'Overdue' ? '#ef4444' :
                              '#cda250'
                      }}>
                        {item.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actionsCell}>
                        <button style={styles.actionBtn} onClick={() => startEdit(item)}>
                          <Edit2 size={12} />
                        </button>
                        <button
                          style={{ ...styles.actionBtn, color: '#ef4444' }}
                          onClick={() => deleteItem(item.itemId)}
                          disabled={isSyncing}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Table Footer Totals */}
              <tr style={styles.footerTr}>
                <td colSpan={2} style={{ ...styles.td, fontWeight: 700 }}>LEDGER TOTALS</td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                  <span style={styles.monoText}>${totalEstimate.toLocaleString()}</span>
                </td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                  <span style={styles.monoText}>${totalActual.toLocaleString()}</span>
                </td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                  <span style={styles.monoText}>${totalPaid.toLocaleString()}</span>
                </td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                  <span style={styles.monoText}>${totalBalance.toLocaleString()}</span>
                </td>
                <td colSpan={3} style={styles.td}></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View Layout */
        <div style={styles.cardGrid}>
          {/* Ledger Total Card */}
          <div style={{ ...styles.card, ...styles.totalCard }} className="totalCard">
            <h3 style={{ ...styles.categoryCell, fontFamily: 'var(--font-header, var(--font-serif))', fontSize: '1.25rem', color: '#ffffff' }}>LEDGER TOTALS</h3>
            <div style={styles.cardBody}>
              <div style={styles.cardRow}>
                <span style={{ ...styles.cardLabel, color: '#ffffff' }}>ESTIMATED</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalEstimate.toLocaleString()}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={{ ...styles.cardLabel, color: '#ffffff' }}>ACTUAL</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalActual.toLocaleString()}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={{ ...styles.cardLabel, color: '#ffffff' }}>PAID</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalPaid.toLocaleString()}</span>
              </div>
              <div style={{ ...styles.cardRow, borderTop: '1px dotted rgba(255,255,255,0.5)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ ...styles.cardLabel, color: '#ffffff' }}>OWING</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {filteredBudget.map(item => {
            const owing = item.actualCost - item.amountPaid;
            const isOver = item.actualCost > item.estimatedCost;
            return (
              <div 
                key={item.itemId} 
                className={`budget-item-card ${isOver ? 'is-over-budget' : ''}`}
                style={{
                  ...styles.card,
                  borderColor: isOver ? '#ef4444' : 'var(--color-muted)'
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.cardMeta}>
                    <span style={{ ...styles.categoryCell, fontFamily: 'var(--font-serif)', fontSize: '1.25rem', textTransform: 'none' }}>{item.category}</span>
                  </div>
                  <div style={styles.cardActions}>
                    <button style={styles.actionBtn} onClick={() => startEdit(item)}>
                      <Edit2 size={12} />
                    </button>
                    <button style={{ ...styles.actionBtn, color: '#ef4444' }} onClick={() => deleteItem(item.itemId)} disabled={isSyncing}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {item.actualCost > item.estimatedCost && (
                  <div style={styles.overBadgeCard}>
                    <AlertTriangle size={11} style={{ marginRight: '0.25rem' }} /> OVER ESTIMATE (+${(item.actualCost - item.estimatedCost).toLocaleString()})
                  </div>
                )}
                <h3 style={{ ...styles.cardTitle, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-muted)' }}>{item.vendorName}</h3>

                <div style={styles.cardBody}>
                  <div style={styles.cardRow}>
                    <span style={styles.cardLabel}>ESTIMATED</span>
                    <span style={styles.cardValue}>${item.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div style={styles.cardRow}>
                    <span style={styles.cardLabel}>ACTUAL</span>
                    <span style={styles.cardValue}>${item.actualCost.toLocaleString()}</span>
                  </div>
                  <div style={styles.cardRow}>
                    <span style={styles.cardLabel}>PAID</span>
                    <span style={styles.cardValue}>${item.amountPaid.toLocaleString()}</span>
                  </div>
                  <div style={{ ...styles.cardRow, fontWeight: 600 }}>
                    <span style={styles.cardLabel}>OWING</span>
                    <span style={{ ...styles.cardValue, color: owing > 0 ? 'var(--color-primary)' : 'var(--color-text)' }}>${owing.toLocaleString()}</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.monoText}>{item.dueDate || 'No Date'}</span>
                  <span style={{
                    ...styles.statusTag,
                    backgroundColor:
                      item.paymentStatus === 'Paid' ? '#eef2f7' :
                        item.paymentStatus === 'Overdue' ? '#fee2e2' :
                          'var(--color-highlight)',
                    color:
                      item.paymentStatus === 'Paid' ? 'var(--color-primary)' :
                        item.paymentStatus === 'Overdue' ? '#ef4444' :
                          '#cda250'
                  }}>
                    {item.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Mini Box */}
      <div style={styles.summaryBox}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>TOTAL OUTSTANDING DEBT</span>
          <span style={styles.summaryValue}>${totalBalance.toLocaleString()}</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>PERCENT PAID</span>
          <span style={styles.summaryValue}>
            {totalActual > 0 ? Math.round((totalPaid / totalActual) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Editor Modal */}
      {(isAdding || editingItem) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{isAdding ? 'ADD BUDGET ITEM' : 'EDIT BUDGET ITEM'}</h3>
              <button style={styles.closeBtn} onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveItem} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>CATEGORY</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Catering, Venue"
                    value={formState.category || ''}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>VENDOR NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Plaza"
                    value={formState.vendorName || ''}
                    onChange={(e) => handleFormChange('vendorName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>ESTIMATED COST ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.estimatedCost || ''}
                    onChange={(e) => handleFormChange('estimatedCost', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>ACTUAL COST ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.actualCost || ''}
                    onChange={(e) => handleFormChange('actualCost', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>AMOUNT PAID ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.amountPaid || ''}
                    onChange={(e) => handleFormChange('amountPaid', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>DUE DATE</label>
                  <input
                    type="date"
                    value={formState.dueDate || ''}
                    onChange={(e) => handleFormChange('dueDate', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>PAYMENT STATUS</label>
                  <select
                    value={formState.paymentStatus || 'Pending'}
                    onChange={(e) => handleFormChange('paymentStatus', e.target.value)}
                    style={styles.select}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>
                  CANCEL
                </button>
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : 'SAVE ITEM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  meterCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: 'var(--box-shadow-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    marginBottom: '0.5rem',
    marginTop: '.5rem'
  },
  meterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  meterSubtext: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
    letterSpacing: '0.05em',
  },
  meterTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.125rem',
    flexWrap: 'wrap',
  },
  meterTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.35rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    margin: 0,
  },
  overBadgeMain: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 700,
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
  },
  headroomBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 600,
    backgroundColor: '#ecfdf5',
    color: '#10b981',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  percentDisplay: {
    display: 'flex',
    alignItems: 'center',
  },
  percentValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  progressTrack: {
    width: '100%',
    height: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.4s ease, background-color 0.4s ease',
  },
  categoryMeterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  categoryChip: {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.4rem 0.6rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  categoryChipHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChipName: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  categoryChipPercent: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    color: 'var(--color-muted)',
  },
  overBadgeMini: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    color: '#ef4444',
  },
  miniTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: '2px',
  },
  overBadgeTable: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: '1px 4px',
    borderRadius: '2px',
    marginTop: '2px',
    display: 'inline-flex',
    alignItems: 'center',
  },
  overBadgeCard: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
  },
  filterBar: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchInput: {
    flex: '1 1 240px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  filtersGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterSelect: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.75rem',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  viewToggle: {
    display: 'flex',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    overflow: 'hidden',
  },
  toggleBtn: {
    border: 'none',
    padding: '0.375rem 0.5rem',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: 'var(--color-primary)',
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
  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-surface, #ffffff)',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.825rem',
    textAlign: 'left',
  },
  th: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid var(--color-muted)',
    padding: '0.75rem',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #f1f1f1',
    transition: 'var(--transition-smooth)',
  },
  footerTr: {
    backgroundColor: '#f8f9fa',
    borderTop: '2px solid var(--color-muted)',
  },
  td: {
    padding: '0.75rem',
    verticalAlign: 'middle',
  },
  categoryCell: {
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  monoText: {
    fontFamily: 'var(--font-mono)',
  },
  statusTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-block',
  },
  actionsCell: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.375rem',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBox: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  summaryItem: {
    flex: 1,
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    backgroundColor: 'var(--color-surface, #ffffff)',
    boxShadow: 'var(--box-shadow-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  summaryLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    color: 'var(--color-muted)',
    letterSpacing: '0.05em',
  },
  summaryValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
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
    maxWidth: '500px',
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
    padding: '1.25rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.875rem',
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
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.25rem',
    borderTop: '1px solid var(--color-muted)',
    paddingTop: '1rem',
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
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    boxShadow: 'var(--box-shadow-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  totalCard: {
    backgroundColor: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    display: 'flex',
  },
  cardActions: {
    display: 'flex',
    gap: '0.25rem',
  },
  cardCategory: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
    letterSpacing: '0.05em',
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--color-text)',
  },
  cardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: 'var(--color-muted)',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  cardValue: {
    fontWeight: 600,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px dotted var(--color-muted)',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
  }
};
