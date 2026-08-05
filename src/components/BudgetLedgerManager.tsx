'use client';

import React, { useState } from 'react';
import { BudgetItem } from '@/lib/sheets/types';
import { Plus, Edit2, Check, X, Trash2, HelpCircle, Grid, List, AlertTriangle, TrendingUp, PieChart, AlertCircle } from 'lucide-react';

import { formatCurrency } from '@/lib/currency';

interface BudgetLedgerManagerProps {
  budget: BudgetItem[];
  budgetTarget?: number;
  onUpdateBudgetTarget?: (newTarget: number) => Promise<void>;
  onUpdate: (updatedBudget: BudgetItem[]) => Promise<void>;
  isSyncing: boolean;
  currency?: string;
}

export default function BudgetLedgerManager({ budget, budgetTarget = 0, onUpdateBudgetTarget, onUpdate, isSyncing, currency = 'USD' }: BudgetLedgerManagerProps) {
  // View mode state
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  // Inline Editable Budget Target State [BUDGET-2 & BUDGET-3]
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>(budgetTarget > 0 ? budgetTarget.toString() : '');
  const [isUnsetMode, setIsUnsetMode] = useState<boolean>(budgetTarget === 0);

  // Form & Delete Modal state
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<BudgetItem>>({});

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Unique categories for summaries & dropdowns
  const categories = Array.from(new Set(budget.map(item => item.category).filter(Boolean)));

  const toggleCategoryFilter = (cat: string) => {
    setSelectedCategories(prev => {
      const isAlreadySelected = prev.includes(cat);
      const updated = isAlreadySelected ? prev.filter(c => c !== cat) : [...prev, cat];
      
      // Keep dropdown in sync
      if (updated.length === 1) {
        setCategoryFilter(updated[0]);
      } else {
        setCategoryFilter('All');
      }
      return updated;
    });
  };

  const clearCategoryFilters = () => {
    setSelectedCategories([]);
    setCategoryFilter('All');
  };

  const filteredBudget = budget.filter(item => {
    const matchesSearch =
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategories.length > 0
      ? selectedCategories.some(c => c.toLowerCase() === (item.category || '').toLowerCase())
      : (categoryFilter === 'All' || (item.category || '').toLowerCase() === categoryFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true :
        statusFilter === 'Paid' ? (item.paymentStatus || '').toLowerCase() === 'paid' :
          (item.paymentStatus || '').toLowerCase() !== 'paid';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Totals & Active Target Baseline
  const totalEstimate = budget.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = budget.reduce((sum, item) => sum + item.actualCost, 0);
  const totalPaid = budget.reduce((sum, item) => sum + item.amountPaid, 0);
  const totalBalance = budget.reduce((sum, item) => sum + (item.actualCost - item.amountPaid), 0);

  // Effective Budget Target Baseline (Custom Budget Target vs Sum of Estimates vs Unset Mode)
  const effectiveTarget = isUnsetMode ? 0 : (Number(customTargetInput) > 0 ? Number(customTargetInput) : totalEstimate);

  // Utilization & Health Meters
  const percentUtilized = effectiveTarget > 0 ? Math.round((totalActual / effectiveTarget) * 100) : 0;
  const isOverallOverBudget = effectiveTarget > 0 && totalActual > effectiveTarget;
  const overallHeadroom = effectiveTarget - totalActual;

  const meterBarColor = isUnsetMode 
    ? 'var(--color-primary)' 
    : (percentUtilized > 100 ? 'var(--color-red)' : percentUtilized > 90 ? 'var(--color-gold-dark)' : 'var(--color-green)');

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

  const saveItem = async () => {
    if (!formState.category || !formState.vendorName) {
      alert('Please provide Category and Vendor Name');
      return;
    }

    let updatedBudget: BudgetItem[];

    if (editingItem) {
      updatedBudget = budget.map(i => i.itemId === editingItem.itemId ? { ...i, ...formState } as BudgetItem : i);
    } else {
      const newItem: BudgetItem = {
        itemId: `item-${Date.now()}`,
        category: formState.category || 'General',
        vendorName: formState.vendorName || 'New Expense',
        estimatedCost: Number(formState.estimatedCost) || 0,
        actualCost: Number(formState.actualCost) || 0,
        amountPaid: Number(formState.amountPaid) || 0,
        dueDate: formState.dueDate || '',
        paymentStatus: formState.paymentStatus || 'Pending',
      };
      updatedBudget = [newItem, ...budget];
    }

    await onUpdate(updatedBudget);
    setEditingItem(null);
    setIsAdding(false);
  };

  const deleteItem = async (itemId: string) => {
    const updated = budget.filter(i => i.itemId !== itemId);
    await onUpdate(updated);
    setItemToDelete(null);
  };

  return (
    <div className="budget-manager-container" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>EXPENSE & BUDGET LEDGER</h2>
          <p style={styles.subtitle}>Track estimated vs actual costs and log payments</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.viewToggle}>
            <button
              style={{ ...styles.toggleBtn, backgroundColor: viewMode === 'table' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'table' ? 'var(--color-on-dark)' : 'var(--color-text)' }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              style={{ ...styles.toggleBtn, backgroundColor: viewMode === 'card' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'card' ? 'var(--color-on-dark)' : 'var(--color-text)' }}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <Grid size={16} />
            </button>
          </div>
          <button style={{ ...styles.addButton, color: 'var(--color-on-dark)' }} onClick={startAdd} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> LOG NEW EXPENSE
          </button>
        </div>
      </div>

      {/* Budget Progress & Health Banner */}
      <div className={`budget-meter-card ${isOverallOverBudget ? 'is-over-budget' : ''}`} style={styles.meterCard}>
        <div style={styles.meterHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
              <span style={styles.meterSubtext}>BUDGET UTILIZATION</span>
              
              {/* Unset Budget Mode Toggle [BUDGET-3] */}
              <button
                type="button"
                onClick={() => {
                  const nextUnset = !isUnsetMode;
                  setIsUnsetMode(nextUnset);
                  if (nextUnset && onUpdateBudgetTarget) {
                    onUpdateBudgetTarget(0);
                  }
                }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: isUnsetMode ? 'var(--color-primary)' : 'transparent',
                  color: isUnsetMode ? '#ffffff' : 'var(--color-muted)',
                  border: isUnsetMode ? '1px solid var(--color-primary)' : '1px solid var(--color-muted)',
                  borderRadius: 'var(--border-radius-sm, 4px)',
                  padding: '0.1rem 0.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title={isUnsetMode ? "Click to set a target budget amount" : "Switch to Unset Budget Mode (log expenses without hard target limit)"}
              >
                {isUnsetMode ? '✓ UNSET BUDGET MODE ACTIVE' : 'UNSET BUDGET TRACKING'}
              </button>
            </div>

            <div style={styles.meterTitleRow}>
              <h3 style={styles.meterTitle}>
                {formatCurrency(totalActual, currency)}{' '}
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 400 }}>
                  {isUnsetMode ? (
                    'Total Actual Logged Expenses'
                  ) : (
                    <>
                      of{' '}
                      {isEditingTarget ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input
                            type="number"
                            value={customTargetInput}
                            onChange={(e) => setCustomTargetInput(e.target.value)}
                            placeholder={totalEstimate.toString()}
                            style={{
                              width: '110px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.35rem',
                              border: '2px solid var(--color-primary)',
                              borderRadius: '4px',
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              setIsEditingTarget(false);
                              const newTarget = Number(customTargetInput) || 0;
                              if (onUpdateBudgetTarget) await onUpdateBudgetTarget(newTarget);
                            }}
                            style={{
                              backgroundColor: 'var(--color-primary)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.2rem 0.4rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            <Check size={12} />
                          </button>
                        </span>
                      ) : (
                        <span 
                          onClick={() => setIsEditingTarget(true)}
                          style={{ 
                            fontWeight: 700, 
                            color: 'var(--color-primary)', 
                            cursor: 'pointer', 
                            borderBottom: '1px dashed var(--color-primary)' 
                          }}
                          title="Click to edit target budget limit [BUDGET-2]"
                        >
                          {formatCurrency(effectiveTarget, currency)} Target <Edit2 size={12} style={{ display: 'inline', marginLeft: '2px' }} />
                        </span>
                      )}
                    </>
                  )}
                </span>
              </h3>

              {!isUnsetMode && (
                isOverallOverBudget ? (
                  <span style={styles.overBadgeMain}>
                    <AlertTriangle size={12} style={{ marginRight: '0.25rem' }} /> OVER BUDGET (+{formatCurrency(totalActual - effectiveTarget, currency)})
                  </span>
                ) : (
                  <span style={styles.headroomBadge}>
                    {formatCurrency(overallHeadroom, currency)} REMAINING
                  </span>
                )
              )}
            </div>
          </div>

          <div style={styles.percentDisplay}>
            {isUnsetMode ? (
              <span style={{ ...styles.percentValue, color: 'var(--color-primary)', fontSize: '1rem' }}>NO TARGET LIMIT</span>
            ) : (
              <span style={{ ...styles.percentValue, color: meterBarColor }}>{percentUtilized}%</span>
            )}
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

        {/* Category Breakdown Progress Meters (Clickable Quick Filters) */}
        {categoryStats.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-muted)' }}>
                CATEGORY QUICK FILTERS (CLICK TO TOGGLE MULTIPLE)
              </span>
              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  onClick={clearCategoryFilters}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: 'transparent',
                    color: 'var(--color-red)',
                    border: '1px solid #ef4444',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.15rem 0.5rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <X size={11} /> CLEAR FILTERS ({selectedCategories.length})
                </button>
              )}
            </div>

            <div style={styles.categoryMeterGrid}>
              {categoryStats.map(stat => {
                const isSelected = selectedCategories.includes(stat.category);
                return (
                  <div 
                    key={stat.category} 
                    className={`category-chip ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleCategoryFilter(stat.category)}
                    style={{
                      ...styles.categoryChip,
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--color-primary)' : (stat.isOver ? 'var(--color-red)' : 'var(--color-muted)'),
                      backgroundColor: isSelected 
                        ? (stat.isOver ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-surface, #ffffff)') 
                        : 'var(--color-bg)',
                      boxShadow: isSelected ? '0 0 0 2px var(--color-primary)' : 'none',
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                      transition: 'all 0.15s ease',
                      padding: '0.5rem 0.75rem',
                    }}
                    title={isSelected ? `Click to remove ${stat.category} filter` : `Click to filter by ${stat.category}`}
                  >
                    <div style={styles.categoryChipHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {isSelected && <Check size={12} style={{ color: 'var(--color-primary)' }} />}
                        <span style={{ 
                          ...styles.categoryChipName, 
                          fontWeight: isSelected ? 800 : 700,
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' 
                        }}>
                          {stat.category}
                        </span>
                      </div>
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
                        backgroundColor: stat.isOver ? 'var(--color-red)' : stat.percent > 90 ? 'var(--color-gold-dark)' : 'var(--color-green)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
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
            value={selectedCategories.length === 1 ? selectedCategories[0] : categoryFilter}
            onChange={(e) => {
              const val = e.target.value;
              setCategoryFilter(val);
              setSelectedCategories(val === 'All' ? [] : [val]);
            }}
            style={styles.filterSelect}
          >
            <option value="All">{selectedCategories.length > 1 ? `FILTERED (${selectedCategories.length} SELECTED)` : 'ALL CATEGORIES'}</option>
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
                      <span className={
                        item.paymentStatus === 'Paid' ? 'badge-green' :
                          item.paymentStatus === 'Overdue' ? 'badge-red' :
                            'badge-gold'
                      } style={styles.statusTag}>
                        {item.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actionsCell}>
                        <button style={styles.actionBtn} onClick={() => startEdit(item)}>
                          <Edit2 size={12} />
                        </button>
                        <button
                          style={{ ...styles.actionBtn, color: 'var(--color-red)' }}
                          onClick={() => setItemToDelete(item)}
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
            <h3 style={{ ...styles.categoryCell, fontFamily: 'var(--font-header, var(--font-serif))', fontSize: '1.25rem', color: 'var(--color-on-dark)' }}>LEDGER TOTALS</h3>
            <div style={styles.cardBody}>
              <div style={styles.cardRow}>
                <span style={{ ...styles.cardLabel, color: 'var(--color-on-dark)' }}>ESTIMATED</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalEstimate.toLocaleString()}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={{ ...styles.cardLabel, color: 'var(--color-on-dark)' }}>ACTUAL</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalActual.toLocaleString()}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={{ ...styles.cardLabel, color: 'var(--color-on-dark)' }}>PAID</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalPaid.toLocaleString()}</span>
              </div>
              <div style={{ ...styles.cardRow, borderTop: '1px dotted var(--color-on-dark-subtle)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ ...styles.cardLabel, color: 'var(--color-on-dark)' }}>OWING</span>
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
                  borderColor: isOver ? 'var(--color-red)' : 'var(--color-muted)'
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
                    <button style={{ ...styles.actionBtn, color: 'var(--color-red)' }} onClick={() => setItemToDelete(item)} disabled={isSyncing}>
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
                  <span className={
                    item.paymentStatus === 'Paid' ? 'badge-green' :
                      item.paymentStatus === 'Overdue' ? 'badge-red' :
                        'badge-gold'
                  } style={styles.statusTag}>
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
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-light)' }} className="modalTitle">{isAdding ? 'ADD BUDGET ITEM' : 'EDIT BUDGET ITEM'}</h3>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-light)' }} className="closeBtn" onClick={closeModal}>
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

      {/* IN-APP DELETE BUDGET ITEM CONFIRMATION MODAL */}
      {itemToDelete && (
        <div style={styles.modalOverlay} onClick={() => setItemToDelete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-on-dark)' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-dark)' }} className="modalTitle">
                  DELETE BUDGET ITEM CONFIRMATION
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-dark)' }} className="closeBtn" onClick={() => setItemToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-red)' }}>"{itemToDelete.vendorName || itemToDelete.category}"</strong> from your budget ledger?
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                Category: {itemToDelete.category} &bull; Estimated: ${itemToDelete.estimatedCost.toLocaleString()}
              </span>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
                  onClick={() => setItemToDelete(null)}
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
                    color: 'var(--color-on-dark)',
                    border: 'none',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.625rem 1.25rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => itemToDelete && deleteItem(itemToDelete.itemId)}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'DELETING...' : 'DELETE ITEM'}
                </button>
              </div>
            </div>
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
    backgroundColor: 'var(--color-red-muted)',
    color: 'var(--color-red)',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
  },
  headroomBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-green-muted)',
    color: 'var(--color-green)',
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
    backgroundColor: 'var(--color-bg-hover)',
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
    backgroundColor: 'var(--color-bg-subtle)',
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
    color: 'var(--color-red)',
  },
  miniTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: 'var(--color-bg-hover)',
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
    color: 'var(--color-red)',
    backgroundColor: 'var(--color-red-muted)',
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
    color: 'var(--color-red)',
    backgroundColor: 'var(--color-red-muted)',
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
    backgroundColor: 'var(--color-bg-subtle)',
    borderBottom: '1px solid var(--color-muted)',
    padding: '0.75rem',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #f1f1f1',
    transition: 'var(--transition-smooth)',
  },
  footerTr: {
    backgroundColor: 'var(--color-bg-subtle)',
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
    padding: '0.875rem 1.25rem',
    borderTop: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-bg)',
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
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
