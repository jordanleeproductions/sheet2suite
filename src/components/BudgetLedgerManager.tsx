'use client';

import React, { useState } from 'react';
import { BudgetItem, ExpenseItem } from '@/lib/sheets/types';
import { Plus, Edit2, Check, X, Trash2, HelpCircle, Grid, List, AlertTriangle, TrendingUp, PieChart, AlertCircle, DollarSign, Calendar, CreditCard, ShoppingBag, Tag } from 'lucide-react';

import { formatCurrency } from '@/lib/currency';

interface BudgetLedgerManagerProps {
  budget: BudgetItem[];
  expenses?: ExpenseItem[];
  budgetTarget?: number;
  onUpdateBudgetTarget?: (newTarget: number) => Promise<void>;
  onUpdate: (updatedBudget: BudgetItem[]) => Promise<void>;
  onUpdateExpenses?: (updatedExpenses: ExpenseItem[]) => Promise<void>;
  isSyncing: boolean;
  currency?: string;
}

export default function BudgetLedgerManager({
  budget,
  expenses = [],
  budgetTarget = 0,
  onUpdateBudgetTarget,
  onUpdate,
  onUpdateExpenses,
  isSyncing,
  currency = 'USD'
}: BudgetLedgerManagerProps) {
  // View mode state
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  // Inline Editable Budget Target State
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>(budgetTarget > 0 ? budgetTarget.toString() : '');
  const [isUnsetMode, setIsUnsetMode] = useState<boolean>(budgetTarget === 0);

  // Budget Item Modal state
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<BudgetItem>>({});

  // Expense Item Modal state
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseFormState, setExpenseFormState] = useState<Partial<ExpenseItem>>({});

  // Budget Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Expenses Search & Filter state
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('All');

  // Unique categories for summaries & dropdowns
  const budgetCategories = Array.from(new Set(budget.map(item => item.category).filter(Boolean)));
  const expenseCategories = Array.from(new Set(expenses.map(item => item.category).filter(Boolean)));
  const allCategories = Array.from(new Set([...budgetCategories, ...expenseCategories])).filter(Boolean);

  const toggleCategoryFilter = (cat: string) => {
    setSelectedCategories(prev => {
      const isAlreadySelected = prev.includes(cat);
      const updated = isAlreadySelected ? prev.filter(c => c !== cat) : [...prev, cat];
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

  // Dynamic Expenses calculations per category
  const getCategoryExpenseTotals = (category: string) => {
    const catExpenses = expenses.filter(e => (e.category || '').toLowerCase().trim() === (category || '').toLowerCase().trim());
    const actualCost = catExpenses.reduce((sum, e) => sum + (e.actualCost || 0), 0);
    const amountPaid = catExpenses.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
    return {
      count: catExpenses.length,
      actualCost,
      amountPaid,
    };
  };

  // Filtered Budget items
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

  // Filtered Expense items
  const filteredExpenses = expenses.filter(item => {
    const matchesSearch =
      (item.description || '').toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
      (item.notes || '').toLowerCase().includes(expenseSearchTerm.toLowerCase());

    const matchesCategory = expenseCategoryFilter === 'All' || (item.category || '').toLowerCase() === expenseCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Dynamic Budget Totals (integrating Expenses)
  const totalEstimate = budget.reduce((sum, item) => sum + item.estimatedCost, 0);

  // Categories with expenses logged
  const categoriesWithLoggedExpenses = new Set(expenses.map(e => (e.category || '').toLowerCase().trim()));
  const totalLoggedExpensesActual = expenses.reduce((sum, e) => sum + e.actualCost, 0);
  const budgetWithoutExpensesActual = budget
    .filter(b => !categoriesWithLoggedExpenses.has((b.category || '').toLowerCase().trim()))
    .reduce((sum, b) => sum + b.actualCost, 0);

  // If expenses exist, actual cost combines total expenses + un-logged budget items; else uses budget actual cost
  const totalActual = expenses.length > 0
    ? (totalLoggedExpensesActual + budgetWithoutExpensesActual)
    : budget.reduce((sum, item) => sum + item.actualCost, 0);

  const totalLoggedExpensesPaid = expenses.reduce((sum, e) => sum + e.amountPaid, 0);
  const budgetWithoutExpensesPaid = budget
    .filter(b => !categoriesWithLoggedExpenses.has((b.category || '').toLowerCase().trim()))
    .reduce((sum, b) => sum + b.amountPaid, 0);

  const totalPaid = expenses.length > 0
    ? (totalLoggedExpensesPaid + budgetWithoutExpensesPaid)
    : budget.reduce((sum, item) => sum + item.amountPaid, 0);

  const totalBalance = totalActual - totalPaid;

  // Effective Budget Target Baseline
  const effectiveTarget = isUnsetMode ? 0 : (Number(customTargetInput) > 0 ? Number(customTargetInput) : totalEstimate);

  // Utilization & Health Meters
  const percentUtilized = effectiveTarget > 0 ? Math.round((totalActual / effectiveTarget) * 100) : 0;
  const isOverallOverBudget = effectiveTarget > 0 && totalActual > effectiveTarget;
  const overallHeadroom = effectiveTarget - totalActual;

  const meterBarColor = isUnsetMode
    ? 'var(--color-primary)'
    : (percentUtilized > 100 ? 'var(--color-red)' : percentUtilized > 90 ? 'var(--color-gold-dark)' : 'var(--color-green)');

  // Category Health Breakdown
  const categoryStats = allCategories.map(cat => {
    const catBudgetItems = budget.filter(item => (item.category || '').toLowerCase() === cat.toLowerCase());
    const catEstimate = catBudgetItems.reduce((sum, i) => sum + i.estimatedCost, 0);

    const expStats = getCategoryExpenseTotals(cat);
    const catActual = expStats.count > 0 ? expStats.actualCost : catBudgetItems.reduce((sum, i) => sum + i.actualCost, 0);
    const catPercent = catEstimate > 0 ? Math.min(Math.round((catActual / catEstimate) * 100), 150) : (catActual > 0 ? 100 : 0);
    const isOver = catActual > catEstimate;
    const overAmount = catActual - catEstimate;

    return {
      category: cat,
      estimated: catEstimate,
      actual: catActual,
      percent: catPercent,
      isOver,
      overAmount,
      expenseCount: expStats.count,
    };
  });

  // Budget Item Actions
  const startAddBudget = () => {
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

  const startEditBudget = (item: BudgetItem) => {
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

  const saveBudget = async (e?: React.FormEvent, continueAdding = false) => {
    if (e) e.preventDefault();
    if (isSyncing) return;

    if (!formState.category || !formState.vendorName) {
      alert('Please provide Category and Line Item / Vendor Name');
      return;
    }

    let updatedBudget: BudgetItem[];

    if (editingItem) {
      updatedBudget = budget.map(i => i.itemId === editingItem.itemId ? { ...i, ...formState } as BudgetItem : i);
    } else {
      const newItem: BudgetItem = {
        itemId: `item-${Date.now()}`,
        category: formState.category || 'General',
        vendorName: formState.vendorName || 'New Budget Item',
        estimatedCost: Number(formState.estimatedCost) || 0,
        actualCost: Number(formState.actualCost) || 0,
        amountPaid: Number(formState.amountPaid) || 0,
        dueDate: formState.dueDate || '',
        paymentStatus: formState.paymentStatus || 'Pending',
      };
      updatedBudget = [newItem, ...budget];
    }

    await onUpdate(updatedBudget);

    if (continueAdding) {
      setFormState({
        category: formState.category || '',
        vendorName: '',
        estimatedCost: 0,
        actualCost: 0,
        amountPaid: 0,
        dueDate: '',
        paymentStatus: 'Pending',
      });
      setIsAdding(true);
      setEditingItem(null);
    } else {
      setEditingItem(null);
      setIsAdding(false);
    }
  };

  const deleteBudget = async (itemId: string) => {
    const updated = budget.filter(i => i.itemId !== itemId);
    await onUpdate(updated);
    setItemToDelete(null);
  };

  // Expense Item Actions
  const startAddExpense = () => {
    setExpenseFormState({
      description: '',
      category: allCategories[0] || 'General',
      amount: 0,
      actualCost: 0,
      amountPaid: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsAddingExpense(true);
    setEditingExpense(null);
  };

  const startEditExpense = (item: ExpenseItem) => {
    const amt = item.amount ?? item.actualCost ?? item.amountPaid ?? 0;
    setExpenseFormState({ ...item, amount: amt });
    setEditingExpense(item);
    setIsAddingExpense(false);
  };

  const closeExpenseModal = () => {
    setIsAddingExpense(false);
    setEditingExpense(null);
    setExpenseFormState({});
  };

  const handleExpenseFormChange = (field: keyof ExpenseItem, value: any) => {
    setExpenseFormState(prev => ({
      ...prev,
      [field]: field === 'amount' || field === 'actualCost' || field === 'amountPaid' ? Number(value) || 0 : value
    }));
  };

  const saveExpense = async (e?: React.FormEvent, continueAdding = false) => {
    if (e) e.preventDefault();
    if (isSyncing || !onUpdateExpenses) return;

    const targetCategory = (expenseFormState.category || '').trim();
    const numAmount = Number(expenseFormState.amount ?? expenseFormState.actualCost ?? expenseFormState.amountPaid) || 0;

    if (!expenseFormState.description || !targetCategory) {
      alert('Please provide Description and Category');
      return;
    }

    // Auto-create category in budget tracker if it doesn't exist yet
    const categoryExistsInBudget = budget.some(
      b => (b.category || '').toLowerCase().trim() === targetCategory.toLowerCase()
    );

    if (!categoryExistsInBudget) {
      const newBudgetItem: BudgetItem = {
        itemId: `item-${Date.now()}`,
        category: targetCategory,
        vendorName: `${targetCategory} Overview`,
        estimatedCost: 0,
        actualCost: numAmount,
        amountPaid: numAmount,
        dueDate: '',
        paymentStatus: 'Pending',
      };
      await onUpdate([newBudgetItem, ...budget]);
    }

    let updatedExpenses: ExpenseItem[];

    if (editingExpense) {
      updatedExpenses = expenses.map(i => i.itemId === editingExpense.itemId ? {
        ...i,
        ...expenseFormState,
        category: targetCategory,
        amount: numAmount,
        actualCost: numAmount,
        amountPaid: numAmount,
      } as ExpenseItem : i);
    } else {
      const newExpense: ExpenseItem = {
        itemId: `exp-${Date.now()}`,
        description: expenseFormState.description || 'New Expense Item',
        category: targetCategory,
        amount: numAmount,
        actualCost: numAmount,
        amountPaid: numAmount,
        purchaseDate: expenseFormState.purchaseDate || new Date().toISOString().split('T')[0],
        notes: expenseFormState.notes || '',
      };
      updatedExpenses = [newExpense, ...expenses];
    }

    await onUpdateExpenses(updatedExpenses);

    if (continueAdding) {
      setExpenseFormState({
        description: '',
        category: targetCategory,
        amount: 0,
        actualCost: 0,
        amountPaid: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setIsAddingExpense(true);
    } else {
      setEditingExpense(null);
      setIsAddingExpense(false);
    }
  };

  const deleteExpense = async (itemId: string) => {
    if (!onUpdateExpenses) return;
    const updated = expenses.filter(i => i.itemId !== itemId);
    await onUpdateExpenses(updated);
    setExpenseToDelete(null);
  };

  return (
    <div className="budget-manager-container" style={styles.container}>
      {/* Scoped CSS for Header and Responsive View Toggle */}
      <style>{`
        .budget-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--color-muted);
          padding-bottom: 0.75rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .budget-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .budget-view-toggle {
          display: flex;
          border: 1px solid var(--color-muted);
          border-radius: var(--border-radius-sm);
          overflow: hidden;
          background-color: var(--color-surface);
          flex-shrink: 0;
        }
        .budget-view-toggle button {
          border: none;
          padding: 0.375rem 0.625rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          min-height: 34px;
        }
        .section-header-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--color-border);
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        @media (max-width: 640px) {
          .budget-header-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .budget-header-actions {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 0.625rem !important;
            width: 100% !important;
          }
          .budget-view-toggle button {
            padding: 0.45rem 0.75rem !important;
            min-width: 42px !important;
            min-height: 38px !important;
          }
          .budget-add-btn {
            flex: 1 1 auto !important;
            justify-content: center !important;
            min-height: 38px !important;
            padding: 0.5rem 0.85rem !important;
            font-size: 0.78rem !important;
          }
        }
      `}</style>

      {/* Main Header */}
      <div className="budget-header-container">
        <div>
          <h2 style={styles.title}>Wedding Financials</h2>
          <p style={styles.subtitle}>Track estimated caps, log individual purchases & monitor real-time payments</p>
        </div>
        <div className="budget-header-actions">
          <div className="budget-view-toggle">
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
        </div>
      </div>

      {/* Budget Progress & Health Banner */}
      <div className={`budget-meter-card ${isOverallOverBudget ? 'is-over-budget' : ''}`} style={styles.meterCard}>
        <div style={styles.meterHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
              <span style={styles.meterSubtext}>BUDGET UTILIZED</span>

              {/* Unset Budget Mode Toggle */}
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
                  color: isUnsetMode ? 'var(--color-primary)' : 'var(--color-muted)',
                  backgroundColor: isUnsetMode ? 'rgba(26, 127, 75, 0.12)' : 'transparent',
                  border: `1px solid ${isUnsetMode ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: '12px',
                  padding: '0.15rem 0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={isUnsetMode ? "Click to set a target budget amount" : "Switch to Unset Budget Mode (log expenses without hard target limit)"}
              >
                {isUnsetMode ? "UNSET TARGET MODE ACTIVE" : "SET TARGET BUDGET"}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={styles.meterTitle}>
                {formatCurrency(totalActual, currency)}{' '}
                <span style={{ fontSize: '0.9rem', color: 'var(--color-muted)', fontWeight: 500 }}>
                  of{' '}
                  {isUnsetMode ? (
                    'No Hard Limit'
                  ) : (
                    <>
                      {isEditingTarget ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input
                            type="number"
                            value={customTargetInput}
                            onChange={(e) => setCustomTargetInput(e.target.value)}
                            style={{
                              width: '100px',
                              padding: '0.2rem 0.4rem',
                              fontSize: '0.85rem',
                              fontFamily: 'var(--font-mono)',
                              border: '1px solid var(--color-primary)',
                              borderRadius: '4px',
                            }}
                            placeholder="Amount"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              setIsEditingTarget(false);
                              const val = Number(customTargetInput);
                              if (!isNaN(val) && onUpdateBudgetTarget) {
                                await onUpdateBudgetTarget(val);
                              }
                            }}
                            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.4rem', cursor: 'pointer' }}
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
                          title="Click to edit target budget limit"
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
              <span style={{ ...styles.percentValue, color: 'var(--color-primary)', fontSize: '1rem' }}>No Budget Set</span>
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

        {/* Category Breakdown Progress Meters */}
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
                    color: 'var(--color-primary)',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  CLEAR FILTERS ({selectedCategories.length})
                </button>
              )}
            </div>

            <div style={styles.categoryChipsGrid}>
              {categoryStats.map(stat => {
                const isSelected = selectedCategories.some(c => c.toLowerCase() === stat.category.toLowerCase());
                return (
                  <div
                    key={stat.category}
                    onClick={() => toggleCategoryFilter(stat.category)}
                    style={{
                      ...styles.categoryChip,
                      borderColor: isSelected ? 'var(--color-primary)' : stat.isOver ? 'var(--color-red)' : 'var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(26, 127, 75, 0.08)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
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

      {/* ============================================================ */}
      {/* SECTION 1: 📊 BUDGET TRACKER TABLE & CARDS                   */}
      {/* ============================================================ */}
      <div className="section-header-banner">
        <div>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-text)', margin: 0 }}>
            📊 BUDGET TRACKER
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '0.15rem 0 0' }}>
            Target baseline allocations & category caps
          </p>
        </div>
        <button
          className="budget-add-btn"
          style={{ ...styles.addButton, color: 'var(--color-on-dark)' }}
          onClick={startAddBudget}
          disabled={isSyncing}
        >
          <Plus size={15} style={{ marginRight: '0.25rem' }} /> NEW BUDGET
        </button>
      </div>

      {/* Filter and Search Bar for Budget */}
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
            {allCategories.map(cat => (
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
                <th style={styles.th}>LINE ITEM / VENDOR</th>
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
                const expStats = getCategoryExpenseTotals(item.category);
                const displayActual = expStats.count > 0 ? expStats.actualCost : item.actualCost;
                const displayPaid = expStats.count > 0 ? expStats.amountPaid : item.amountPaid;
                const owing = displayActual - displayPaid;

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
                        <span style={styles.monoText}>${displayActual.toLocaleString()}</span>
                        {expStats.count > 0 && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                            ({expStats.count} logged expense{expStats.count > 1 ? 's' : ''})
                          </span>
                        )}
                        {displayActual > item.estimatedCost && (
                          <span style={styles.overBadgeTable}>
                            <AlertTriangle size={10} style={{ marginRight: '2px' }} /> +${(displayActual - item.estimatedCost).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <span style={styles.monoText}>${displayPaid.toLocaleString()}</span>
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
                        <button style={styles.actionBtn} onClick={() => startEditBudget(item)}>
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
                <td colSpan={2} style={{ ...styles.td, fontWeight: 700 }}>BUDGET TOTALS</td>
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
            <h3 style={{ ...styles.categoryCell, fontFamily: 'var(--font-header, var(--font-serif))', fontSize: '1.25rem', color: 'var(--color-on-dark)' }}>BUDGET SUMMARY</h3>
            <div style={styles.cardBody}>
              <div style={styles.cardRow}>
                <span style={{ ...styles.cardLabel, color: 'var(--color-on-dark)' }}>ESTIMATED TARGET</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalEstimate.toLocaleString()}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={{ ...styles.cardLabel, color: 'var(--color-on-dark)' }}>ACTUAL OUTLAY</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalActual.toLocaleString()}</span>
              </div>
              <div style={styles.cardRow}>
                <span style={{ ...styles.cardLabel, color: 'var(--color-on-dark)' }}>AMOUNT PAID</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalPaid.toLocaleString()}</span>
              </div>
              <div style={{ ...styles.cardRow, borderTop: '1px dotted var(--color-on-dark-subtle)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ ...styles.cardLabel, color: 'var(--color-on-dark)' }}>BALANCE DUE</span>
                <span style={{ ...styles.cardValue, color: 'var(--color-on-primary)' }}>${totalBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {filteredBudget.map(item => {
            const expStats = getCategoryExpenseTotals(item.category);
            const displayActual = expStats.count > 0 ? expStats.actualCost : item.actualCost;
            const displayPaid = expStats.count > 0 ? expStats.amountPaid : item.amountPaid;
            const owing = displayActual - displayPaid;
            const isOver = displayActual > item.estimatedCost;

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
                    <button style={styles.actionBtn} onClick={() => startEditBudget(item)}>
                      <Edit2 size={12} />
                    </button>
                    <button style={{ ...styles.actionBtn, color: 'var(--color-red)' }} onClick={() => setItemToDelete(item)} disabled={isSyncing}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {isOver && (
                  <div style={styles.overBadgeCard}>
                    <AlertTriangle size={11} style={{ marginRight: '0.25rem' }} /> OVER ESTIMATE (+${(displayActual - item.estimatedCost).toLocaleString()})
                  </div>
                )}
                <h3 style={{ ...styles.cardTitle, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-muted)' }}>{item.vendorName}</h3>

                <div style={styles.cardBody}>
                  <div style={styles.cardRow}>
                    <span style={styles.cardLabel}>ESTIMATED</span>
                    <span style={styles.cardValue}>${item.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div style={styles.cardRow}>
                    <span style={styles.cardLabel}>
                      ACTUAL
                      {expStats.count > 0 && <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', marginLeft: '4px' }}>({expStats.count} exp)</span>}
                    </span>
                    <span style={styles.cardValue}>${displayActual.toLocaleString()}</span>
                  </div>
                  <div style={styles.cardRow}>
                    <span style={styles.cardLabel}>PAID</span>
                    <span style={styles.cardValue}>${displayPaid.toLocaleString()}</span>
                  </div>
                  <div style={{ ...styles.cardRow, fontWeight: 600 }}>
                    <span style={styles.cardLabel}>BALANCE DUE</span>
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

      {/* ============================================================ */}
      {/* SECTION 2: 💳 EXPENSES TABLE & CARDS                          */}
      {/* ============================================================ */}
      <div className="section-header-banner">
        <div>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-text)', margin: 0 }}>
            💳 EXPENSES
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '0.15rem 0 0' }}>
            Individual logged purchases & outlays by category
          </p>
        </div>
        {onUpdateExpenses && (
          <button
            className="budget-add-btn"
            style={{ ...styles.addButton, color: 'var(--color-on-dark)' }}
            onClick={startAddExpense}
            disabled={isSyncing}
          >
            <Plus size={15} style={{ marginRight: '0.25rem' }} /> NEW EXPENSE
          </button>
        )}
      </div>

      {/* Expenses Filter and Search Bar */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="SEARCH EXPENSE DESCRIPTION OR NOTES..."
          value={expenseSearchTerm}
          onChange={(e) => setExpenseSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.filtersGroup}>
          <select
            value={expenseCategoryFilter}
            onChange={(e) => setExpenseCategoryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">ALL CATEGORIES ({expenses.length})</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table View */}
      {filteredExpenses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--color-muted)',
        }}>
          <ShoppingBag size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>No expenses logged yet</p>
          <p style={{ fontSize: '0.78rem', margin: '0.25rem 0 1rem' }}>Click "+ NEW EXPENSE" to record purchases for your wedding categories.</p>
          {onUpdateExpenses && (
            <button
              onClick={startAddExpense}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: 'var(--border-radius-sm)',
                cursor: 'pointer',
              }}
            >
              + NEW EXPENSE
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>DESCRIPTION</th>
                <th style={styles.th}>CATEGORY</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>AMOUNT</th>
                <th style={styles.th}>PURCHASE DATE</th>
                <th style={styles.th}>NOTES</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => {
                const amt = exp.amount ?? exp.actualCost ?? exp.amountPaid ?? 0;
                return (
                  <tr key={exp.itemId} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{exp.description}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryCell}>{exp.category}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <span style={{ ...styles.monoText, color: 'var(--color-primary)', fontWeight: 700 }}>${amt.toLocaleString()}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.monoText}>{exp.purchaseDate || '-'}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{exp.notes || '-'}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actionsCell}>
                        <button style={styles.actionBtn} onClick={() => startEditExpense(exp)}>
                          <Edit2 size={12} />
                        </button>
                        {onUpdateExpenses && (
                          <button
                            style={{ ...styles.actionBtn, color: 'var(--color-red)' }}
                            onClick={() => setExpenseToDelete(exp)}
                            disabled={isSyncing}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Expense Table Footer Totals */}
              <tr style={styles.footerTr}>
                <td colSpan={2} style={{ ...styles.td, fontWeight: 700 }}>TOTAL LOGGED EXPENSES</td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                  <span style={styles.monoText}>${filteredExpenses.reduce((s, e) => s + (e.amount ?? e.actualCost ?? e.amountPaid ?? 0), 0).toLocaleString()}</span>
                </td>
                <td colSpan={3} style={styles.td}></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* Condensed Expenses Card View Layout */
        <div style={styles.cardGrid}>
          {filteredExpenses.map((exp) => {
            const amt = exp.amount ?? exp.actualCost ?? exp.amountPaid ?? 0;
            return (
              <div
                key={exp.itemId}
                style={{ ...styles.card, padding: '0.85rem 1rem', gap: '0.4rem' }}
              >
                <div style={styles.cardHeader}>
                  <span style={{ ...styles.categoryCell, fontFamily: 'var(--font-serif)', fontSize: '1.05rem', textTransform: 'none' }}>
                    {exp.category}
                  </span>
                  <div style={styles.cardActions}>
                    <button style={styles.actionBtn} onClick={() => startEditExpense(exp)}>
                      <Edit2 size={12} />
                    </button>
                    {onUpdateExpenses && (
                      <button style={{ ...styles.actionBtn, color: 'var(--color-red)' }} onClick={() => setExpenseToDelete(exp)} disabled={isSyncing}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.1rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                    {exp.description}
                  </h4>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
                    ${amt.toLocaleString()}
                  </span>
                </div>

                {(exp.purchaseDate || exp.notes) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem', paddingTop: '0.35rem', borderTop: '1px dotted var(--color-border)' }}>
                    <span>{exp.purchaseDate || 'No Date'}</span>
                    {exp.notes && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>📝 {exp.notes}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* BUDGET ITEM ADD/EDIT MODAL                                    */}
      {/* ============================================================ */}
      {(isAdding || editingItem) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingItem ? 'EDIT BUDGET ITEM' : '+ NEW BUDGET'}
              </h3>
              <button style={styles.closeBtn} onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => saveBudget(e, false)} style={styles.form}>
              <div style={styles.formBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CATEGORY</label>
                  <input
                    type="text"
                    list="budget-categories-list"
                    value={formState.category || ''}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Venue, Catering, Florals"
                    required
                  />
                  <datalist id="budget-categories-list">
                    {allCategories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>LINE ITEM / VENDOR NAME</label>
                  <input
                    type="text"
                    value={formState.vendorName || ''}
                    onChange={(e) => handleFormChange('vendorName', e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Grand Plaza Hall"
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ESTIMATED COST ($)</label>
                    <input
                      type="number"
                      value={formState.estimatedCost ?? 0}
                      onChange={(e) => handleFormChange('estimatedCost', e.target.value)}
                      style={styles.input}
                      min="0"
                      step="any"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>ACTUAL COST ($)</label>
                    <input
                      type="number"
                      value={formState.actualCost ?? 0}
                      onChange={(e) => handleFormChange('actualCost', e.target.value)}
                      style={styles.input}
                      min="0"
                      step="any"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>AMOUNT PAID ($)</label>
                    <input
                      type="number"
                      value={formState.amountPaid ?? 0}
                      onChange={(e) => handleFormChange('amountPaid', e.target.value)}
                      style={styles.input}
                      min="0"
                      step="any"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>PAYMENT STATUS</label>
                    <select
                      value={formState.paymentStatus || 'Pending'}
                      onChange={(e) => handleFormChange('paymentStatus', e.target.value)}
                      style={styles.select}
                    >
                      <option value="Pending">PENDING</option>
                      <option value="Paid">PAID</option>
                      <option value="Overdue">OVERDUE</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>DUE DATE</label>
                  <input
                    type="date"
                    value={formState.dueDate || ''}
                    onChange={(e) => handleFormChange('dueDate', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>
                  CANCEL
                </button>

                {!editingItem && (
                  <button
                    type="button"
                    style={{ ...styles.saveBtn, backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
                    onClick={(e) => saveBudget(e, true)}
                    disabled={isSyncing}
                  >
                    SAVE & ADD ANOTHER
                  </button>
                )}

                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : 'SAVE BUDGET ITEM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EXPENSE ITEM ADD/EDIT MODAL                                   */}
      {/* ============================================================ */}
      {(isAddingExpense || editingExpense) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingExpense ? 'EDIT EXPENSE' : '+ NEW EXPENSE'}
              </h3>
              <button style={styles.closeBtn} onClick={closeExpenseModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => saveExpense(e, false)} style={styles.form}>
              <div style={styles.formBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>DESCRIPTION / ITEM NAME</label>
                  <input
                    type="text"
                    value={expenseFormState.description || ''}
                    onChange={(e) => handleExpenseFormChange('description', e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Deposit for Grand Plaza Hall, Cake Tasting Fee"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>CATEGORY</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <select
                      value={
                        budgetCategories.includes(expenseFormState.category || '')
                          ? expenseFormState.category
                          : (expenseFormState.category ? '__custom__' : (budgetCategories[0] || 'General'))
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__custom__') {
                          handleExpenseFormChange('category', '');
                        } else {
                          handleExpenseFormChange('category', val);
                        }
                      }}
                      style={styles.select}
                    >
                      {budgetCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__custom__">+ Add New / Custom Category...</option>
                    </select>

                    {(!budgetCategories.includes(expenseFormState.category || '') || expenseFormState.category === '') && (
                      <input
                        type="text"
                        value={expenseFormState.category || ''}
                        onChange={(e) => handleExpenseFormChange('category', e.target.value)}
                        style={styles.input}
                        placeholder="Type new category name (will auto-add to Budget Tracker)..."
                        required
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>AMOUNT ($)</label>
                  <input
                    type="number"
                    value={expenseFormState.amount ?? expenseFormState.actualCost ?? expenseFormState.amountPaid ?? 0}
                    onChange={(e) => handleExpenseFormChange('amount', e.target.value)}
                    style={styles.input}
                    min="0"
                    step="any"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>PURCHASE DATE</label>
                  <input
                    type="date"
                    value={expenseFormState.purchaseDate || ''}
                    onChange={(e) => handleExpenseFormChange('purchaseDate', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>NOTES / DETAILS</label>
                  <input
                    type="text"
                    value={expenseFormState.notes || ''}
                    onChange={(e) => handleExpenseFormChange('notes', e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Paid via credit card, 30% initial deposit"
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeExpenseModal}>
                  CANCEL
                </button>

                {!editingExpense && (
                  <button
                    type="button"
                    style={{ ...styles.saveBtn, backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
                    onClick={(e) => saveExpense(e, true)}
                    disabled={isSyncing}
                  >
                    SAVE & ADD ANOTHER
                  </button>
                )}

                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : 'SAVE EXPENSE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODALS                                    */}
      {/* ============================================================ */}
      {itemToDelete && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '400px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-red)' }}>DELETE BUDGET ITEM</h3>
              <button style={styles.closeBtn} onClick={() => setItemToDelete(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.25rem', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-text)' }}>
              Are you sure you want to delete budget item <strong>{itemToDelete.vendorName}</strong> ({itemToDelete.category})?
            </div>
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => setItemToDelete(null)}>
                CANCEL
              </button>
              <button
                style={{ ...styles.saveBtn, backgroundColor: 'var(--color-red)' }}
                onClick={() => deleteBudget(itemToDelete.itemId)}
                disabled={isSyncing}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {expenseToDelete && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '400px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-red)' }}>DELETE EXPENSE</h3>
              <button style={styles.closeBtn} onClick={() => setExpenseToDelete(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.25rem', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-text)' }}>
              Are you sure you want to delete expense <strong>{expenseToDelete.description}</strong> (${expenseToDelete.actualCost.toLocaleString()})?
            </div>
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => setExpenseToDelete(null)}>
                CANCEL
              </button>
              <button
                style={{ ...styles.saveBtn, backgroundColor: 'var(--color-red)' }}
                onClick={() => deleteExpense(expenseToDelete.itemId)}
                disabled={isSyncing}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: 'var(--color-primary)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    margin: '0.2rem 0 0 0',
  },
  toggleBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  addButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.45rem 0.85rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  meterCard: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg, 1rem)',
    padding: '1.25rem 1.5rem',
    boxShadow: 'var(--box-shadow-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  meterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  meterSubtext: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
    letterSpacing: '0.08em',
  },
  meterTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    margin: 0,
  },
  percentDisplay: {
    textAlign: 'right',
  },
  percentValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.5rem',
    fontWeight: 800,
  },
  overBadgeMain: {
    fontSize: '0.675rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 800,
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
  },
  headroomBadge: {
    fontSize: '0.675rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 800,
    backgroundColor: 'rgba(26, 127, 75, 0.12)',
    color: 'var(--color-primary)',
    border: '1px solid rgba(26, 127, 75, 0.3)',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
  },
  progressTrack: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.4s ease',
  },
  categoryChipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  categoryChip: {
    padding: '0.5rem 0.65rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-border)',
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
    fontSize: '0.675rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100px',
  },
  categoryChipPercent: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  overBadgeMini: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 800,
    color: '#b91c1c',
  },
  miniTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: 'var(--color-bg-subtle)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: '999px',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1 1 240px',
    padding: '0.5rem 0.75rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
  },
  filtersGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '0.5rem 0.75rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-surface)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 800,
    letterSpacing: '0.06em',
    color: 'var(--color-muted)',
    backgroundColor: 'var(--color-bg-subtle)',
    padding: '0.65rem 0.85rem',
    borderBottom: '1px solid var(--color-border)',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--color-border)',
  },
  footerTr: {
    backgroundColor: 'var(--color-bg-subtle)',
    borderTop: '2px solid var(--color-border)',
  },
  td: {
    padding: '0.65rem 0.85rem',
    verticalAlign: 'middle',
    color: 'var(--color-text)',
  },
  categoryCell: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  monoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
  },
  statusTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 800,
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    display: 'inline-block',
  },
  overBadgeTable: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    color: '#b91c1c',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '1px',
  },
  actionsCell: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.35rem',
  },
  actionBtn: {
    padding: '0.3rem 0.45rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-border)',
    borderRadius: 'var(--border-radius-lg, 1rem)',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--color-border)',
  },
  modalTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: 800,
    letterSpacing: '0.06em',
    margin: 0,
    color: 'var(--color-text)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  formBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  formRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    flex: 1,
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    color: 'var(--color-muted)',
  },
  input: {
    padding: '0.5rem 0.65rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  select: {
    padding: '0.5rem 0.65rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    padding: '0.85rem 1.25rem',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-subtle)',
  },
  cancelBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.5rem 0.85rem',
    backgroundColor: 'transparent',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  saveBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 800,
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
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
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
  cardTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
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
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  cardValue: {
    fontWeight: 700,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px dotted var(--color-border)',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
  },
  overBadgeCard: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 800,
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
  }
};
