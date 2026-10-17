'use client';

import React, { useState, useEffect } from 'react';
import { BudgetItem, ExpenseItem } from '@/lib/sheets/types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown,
  Filter,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import MobileFAB from '@/components/MobileFAB';
import SlideOverDrawer from '@/components/vow/SlideOverDrawer';
import PageSearchInput from '@/components/PageSearchInput';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import { verifyActiveSession } from '@/lib/core/sessionCheck';

interface BudgetLedgerManagerProps {
  budget: BudgetItem[];
  expenses?: ExpenseItem[];
  budgetTarget?: number;
  weddingDate?: string;
  onUpdateBudgetTarget?: (newTarget: number) => Promise<void>;
  onUpdate: (updatedBudget: BudgetItem[]) => Promise<void>;
  onUpdateExpenses?: (updatedExpenses: ExpenseItem[]) => Promise<void>;
  isSyncing: boolean;
  currency?: string;
}

const STANDARD_BUDGET_CATEGORIES = [
  'Venue & Catering',
  'Venue',
  'Catering',
  'Photography',
  'Videography',
  'Florals & Decor',
  'Attire & Beauty',
  'Music & Entertainment',
  'Stationery & Invitations',
  'Cake & Desserts',
  'Transportation',
  'Favors & Gifts',
  'Planner & Coordination',
  'Rings & Jewelry',
  'Rehearsal & Events',
  'Miscellaneous & Contingency',
];

export default function BudgetLedgerManager({
  budget,
  expenses = [],
  budgetTarget = 0,
  weddingDate = '',
  onUpdateBudgetTarget,
  onUpdate,
  onUpdateExpenses,
  isSyncing,
  currency = 'USD'
}: BudgetLedgerManagerProps) {
  const currencySymbol = getCurrencySymbol(currency);

  // Hybrid Target Mode: 'dynamic' (sum of categories) | 'fixed_cap' (explicit ceiling) | 'unset' (no hard limit)
  type BudgetTargetMode = 'dynamic' | 'fixed_cap' | 'unset';

  const [targetMode, setTargetMode] = useState<BudgetTargetMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('s2v_budget_target_mode') as BudgetTargetMode;
      if (saved === 'dynamic' || saved === 'fixed_cap' || saved === 'unset') {
        return saved;
      }
    }
    return budgetTarget > 0 ? 'fixed_cap' : 'dynamic';
  });

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>(budgetTarget > 0 ? budgetTarget.toString() : '');

  const handleSetTargetMode = (mode: BudgetTargetMode) => {
    setTargetMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_budget_target_mode', mode);
    }
  };

  useEffect(() => {
    if (budgetTarget > 0) {
      setCustomTargetInput(budgetTarget.toString());
      const savedMode = typeof window !== 'undefined' ? (localStorage.getItem('s2v_budget_target_mode') as BudgetTargetMode) : null;
      if (savedMode === 'dynamic') setTargetMode('dynamic');
      else if (savedMode === 'unset') setTargetMode('unset');
      else setTargetMode('fixed_cap');
    } else {
      setCustomTargetInput('');
      const savedMode = typeof window !== 'undefined' ? (localStorage.getItem('s2v_budget_target_mode') as BudgetTargetMode) : null;
      if (savedMode === 'unset') setTargetMode('unset');
      else setTargetMode('dynamic');
    }
  }, [budgetTarget]);

  // Modals state
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<BudgetItem>>({});

  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseFormState, setExpenseFormState] = useState<Partial<ExpenseItem>>({});

  // Ledger Filter & Selection State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Overdue' | 'Pending' | 'Paid' | 'OverBudget'>('All');
  const [sortField, setSortField] = useState<'category' | 'projected' | 'actual' | 'variance' | 'dueDate'>('category');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddingExpense || editingExpense) closeExpenseModal();
        else if (isAdding || editingItem) closeModal();
        else if (itemToDelete) setItemToDelete(null);
        else if (expenseToDelete) setExpenseToDelete(null);
        else if (selectedCategoryId) setSelectedCategoryId('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdding, editingItem, isAddingExpense, editingExpense, itemToDelete, expenseToDelete, selectedCategoryId]);

  // Prevent background scroll when modal open
  const isAnyModalOpen = Boolean(isAdding || editingItem || isAddingExpense || editingExpense || itemToDelete || expenseToDelete);
  useEffect(() => {
    if (isAnyModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isAnyModalOpen]);

  // Unique categories
  const budgetCategories = Array.from(new Set(budget.map(item => item.category).filter(Boolean)));
  const expenseCategories = Array.from(new Set(expenses.map(item => item.category).filter(Boolean)));
  const allCategories = Array.from(new Set([...STANDARD_BUDGET_CATEGORIES, ...budgetCategories, ...expenseCategories])).filter(Boolean);

  // Category expense calculations
  const getCategoryExpenseTotals = (category: string) => {
    const catExpenses = expenses.filter(e => (e.category || '').toLowerCase().trim() === (category || '').toLowerCase().trim());
    const actualCost = catExpenses.reduce((sum, e) => sum + (e.actualCost ?? e.amount ?? 0), 0);
    const amountPaid = catExpenses.reduce((sum, e) => sum + (e.amountPaid ?? e.amount ?? 0), 0);
    return { count: catExpenses.length, actualCost, amountPaid, items: catExpenses };
  };

  // Grand Totals
  const totalEstimate = budget.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  const totalLoggedExpensesActual = expenses.reduce((sum, e) => sum + (e.actualCost ?? e.amount ?? 0), 0);
  const totalLoggedExpensesPaid = expenses.reduce((sum, e) => sum + (e.amountPaid ?? e.amount ?? 0), 0);

  const budgetActualSum = budget.reduce((sum, item) => {
    const expStats = getCategoryExpenseTotals(item.category);
    return sum + (expStats.count > 0 ? expStats.actualCost : (item.actualCost || 0));
  }, 0);

  const budgetPaidSum = budget.reduce((sum, item) => {
    const expStats = getCategoryExpenseTotals(item.category);
    return sum + (expStats.count > 0 ? expStats.amountPaid : (item.amountPaid || 0));
  }, 0);

  const totalActual = expenses.length > 0 ? Math.max(budgetActualSum, totalLoggedExpensesActual) : budget.reduce((sum, i) => sum + (i.actualCost || 0), 0);
  const totalPaid = expenses.length > 0 ? Math.max(budgetPaidSum, totalLoggedExpensesPaid) : budget.reduce((sum, i) => sum + (i.amountPaid || 0), 0);

  // Target Mode Resolution
  const isUnsetMode = targetMode === 'unset';
  const isDynamicMode = targetMode === 'dynamic';
  const isFixedCapMode = targetMode === 'fixed_cap';
  const effectiveTarget = isUnsetMode ? 0 : isDynamicMode ? totalEstimate : (Number(customTargetInput) > 0 ? Number(customTargetInput) : totalEstimate);
  const percentUtilized = effectiveTarget > 0 ? Math.round((totalActual / effectiveTarget) * 100) : 0;
  const isOverallOverBudget = effectiveTarget > 0 && totalActual > effectiveTarget;
  const overallHeadroom = effectiveTarget - totalActual;

  const handleSaveCustomTarget = async (val: number) => {
    setIsEditingTarget(false);
    if (!isNaN(val) && val > 0) {
      setCustomTargetInput(val.toString());
      handleSetTargetMode('fixed_cap');
      if (onUpdateBudgetTarget) await onUpdateBudgetTarget(val);
    } else if (val === 0) {
      handleSetTargetMode('unset');
      if (onUpdateBudgetTarget) await onUpdateBudgetTarget(0);
    }
  };

  const handleSyncToCategories = async () => {
    setIsEditingTarget(false);
    handleSetTargetMode('dynamic');
    setCustomTargetInput(totalEstimate.toString());
    if (onUpdateBudgetTarget) await onUpdateBudgetTarget(totalEstimate);
  };

  // Date helpers for overdue exceptions
  const todayStr = new Date().toISOString().split('T')[0];

  // Category Ledger Rows Calculation
  const categoryLedgerRows = allCategories.map((cat, idx) => {
    const catBudgetItems = budget.filter(item => (item.category || '').toLowerCase() === cat.toLowerCase());
    const catEstimate = catBudgetItems.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
    const expStats = getCategoryExpenseTotals(cat);
    const catActual = expStats.count > 0 ? expStats.actualCost : catBudgetItems.reduce((sum, i) => sum + (i.actualCost || 0), 0);
    const catPaid = expStats.count > 0 ? expStats.amountPaid : catBudgetItems.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
    const variance = catEstimate - catActual;
    const isOver = catActual > catEstimate && catEstimate > 0;
    const isPending = catEstimate > 0 && catActual < catEstimate;
    
    // Earliest due date across budget items in this category
    const dueDates = catBudgetItems.map(i => i.dueDate).filter(Boolean).sort() as string[];
    const primaryDueDate = dueDates[0] || '';
    const isOverdue = Boolean(primaryDueDate && primaryDueDate < todayStr && catPaid < catActual);

    // Status label
    let statusLabel = 'On Track';
    if (isOver) statusLabel = 'Over Budget';
    else if (isOverdue) statusLabel = 'Overdue';
    else if (catActual > 0 && catPaid >= catActual) statusLabel = 'Paid in Full';
    else if (catActual > 0) statusLabel = 'Partial Paid';
    else if (catEstimate > 0) statusLabel = 'Budgeted';

    return {
      category: cat,
      projected: catEstimate,
      actual: catActual,
      paid: catPaid,
      variance,
      dueDate: primaryDueDate,
      status: statusLabel,
      isOver,
      isOverdue,
      expenseCount: expStats.count,
      budgetItemCount: catBudgetItems.length,
      rawBudgetItems: catBudgetItems,
    };
  });

  // Filtered rows (Hiding $0 rows unless searched)
  const activeCategoryRows = categoryLedgerRows.filter(row => {
    if (searchTerm.trim()) {
      return row.category.toLowerCase().includes(searchTerm.toLowerCase().trim());
    }
    return row.projected > 0 || row.actual > 0 || row.expenseCount > 0;
  });

  const filteredCategoryRows = activeCategoryRows.filter(row => {
    if (statusFilter === 'Overdue') return row.isOverdue;
    if (statusFilter === 'Pending') return row.status === 'Partial Paid' || row.status === 'Budgeted';
    if (statusFilter === 'Paid') return row.status === 'Paid in Full';
    if (statusFilter === 'OverBudget') return row.isOver;
    return true;
  }).sort((a, b) => {
    if (sortField === 'projected') return sortAsc ? a.projected - b.projected : b.projected - a.projected;
    if (sortField === 'actual') return sortAsc ? a.actual - b.actual : b.actual - a.actual;
    if (sortField === 'variance') return sortAsc ? a.variance - b.variance : b.variance - a.variance;
    if (sortField === 'dueDate') return sortAsc ? (a.dueDate || '9999').localeCompare(b.dueDate || '9999') : (b.dueDate || '').localeCompare(a.dueDate || '');
    return sortAsc ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
  });

  // Exception Strip Metrics (Overdue, Pending, Over-budget categories)
  const overdueRows = categoryLedgerRows.filter(r => r.isOverdue);
  const overdueTotal = overdueRows.reduce((sum, r) => sum + (r.actual - r.paid), 0);
  const pendingRows = categoryLedgerRows.filter(r => r.actual > r.paid);
  const pendingTotal = pendingRows.reduce((sum, r) => sum + (r.actual - r.paid), 0);
  const overBudgetRows = categoryLedgerRows.filter(r => r.isOver);

  const upcomingDueRows = categoryLedgerRows
    .filter(r => r.dueDate && r.dueDate >= todayStr && r.paid < r.actual)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const nextUpcomingDue = upcomingDueRows[0];

  // 30-Day Financial Horizon Window [Monarch Financials]
  const in30DaysDate = new Date();
  in30DaysDate.setDate(new Date().getDate() + 30);
  const in30DaysStr = in30DaysDate.toISOString().split('T')[0];

  const horizonMilestones = budget
    .filter(item => {
      if (!item.dueDate) return false;
      const isPaid = item.paymentStatus === 'Paid' || ((item.amountPaid || 0) > 0 && (item.amountPaid || 0) >= ((item.actualCost && item.actualCost > 0) ? item.actualCost : (item.estimatedCost || 0)));
      if (isPaid) return false;
      return item.dueDate <= in30DaysStr;
    })
    .map(item => {
      const due = new Date(item.dueDate + 'T00:00:00');
      const todayRef = new Date(todayStr + 'T00:00:00');
      const diffMs = due.getTime() - todayRef.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const targetAmount = (item.actualCost && item.actualCost > 0) ? item.actualCost : (item.estimatedCost || 0);
      const amountDue = Math.max(0, targetAmount - (item.amountPaid || 0));

      let urgency: 'overdue' | 'critical' | 'upcoming' = 'upcoming';
      let label = `Due in ${diffDays}d`;
      if (diffDays < 0) {
        urgency = 'overdue';
        label = `${Math.abs(diffDays)}d Overdue`;
      } else if (diffDays === 0) {
        urgency = 'critical';
        label = 'Due Today';
      } else if (diffDays === 1) {
        urgency = 'critical';
        label = 'Due Tomorrow';
      }

      return {
        item,
        diffDays,
        amountDue,
        urgency,
        label,
      };
    })
    .sort((a, b) => a.diffDays - b.diffDays);

  const horizonTotalDue = horizonMilestones.reduce((sum, m) => sum + m.amountDue, 0);

  // 1-Click Milestone Reconciliation [Monarch 1-Click Paid]
  const handleQuickMarkPaid = async (item: BudgetItem) => {
    if (isSyncing) return;
    const dueAmount = (item.actualCost && item.actualCost > 0) ? item.actualCost : (item.estimatedCost || 0);
    const updated = budget.map(b => b.itemId === item.itemId ? {
      ...b,
      paymentStatus: 'Paid',
      amountPaid: dueAmount,
      actualCost: dueAmount,
    } as BudgetItem : b);
    await onUpdate(updated);

    if (onUpdateExpenses) {
      const newExp: ExpenseItem = {
        itemId: `exp-${Date.now()}`,
        description: item.vendorName || `${item.category} Milestone`,
        category: item.category,
        amount: dueAmount,
        actualCost: dueAmount,
        amountPaid: dueAmount,
        purchaseDate: todayStr,
        notes: `Reconciled from 30-day milestone`,
      };
      await onUpdateExpenses([newExp, ...expenses]);
    }
  };

  // Selected Category Detail Expenses
  const selectedCatData = selectedCategoryId 
    ? categoryLedgerRows.find(r => r.category.toLowerCase() === selectedCategoryId.toLowerCase())
    : null;

  const itemizedExpensesForSelected = selectedCategoryId
    ? expenses.filter(e => (e.category || '').toLowerCase().trim() === selectedCategoryId.toLowerCase().trim())
    : expenses;

  // Modal Handlers
  const startAddBudget = async (presetCategory?: string) => {
    if (!(await verifyActiveSession())) return;
    setFormState({
      category: presetCategory || selectedCategoryId || allCategories[0] || 'Venue',
      vendorName: '',
      estimatedCost: '' as any,
      actualCost: 0,
      amountPaid: 0,
      dueDate: '',
      paymentStatus: 'Pending',
    });
    setIsAdding(true);
    setEditingItem(null);
  };

  const startEditBudget = async (item: BudgetItem) => {
    if (!(await verifyActiveSession())) return;
    setFormState({
      ...item,
      estimatedCost: (item.estimatedCost && item.estimatedCost > 0) ? item.estimatedCost : ('' as any),
    });
    setEditingItem(item);
    setIsAdding(false);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormState({});
  };

  const saveBudget = async (e?: React.FormEvent, continueAdding = false) => {
    if (e) e.preventDefault();
    if (isSyncing) return;

    const categoryName = (formState.category || '').trim();
    const budgetAmount = Number(formState.estimatedCost);

    if (!categoryName) {
      alert('Please select or enter a Budget Category');
      return;
    }

    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      alert('Please enter a budget allocation amount greater than $0');
      return;
    }

    let updatedBudget: BudgetItem[];
    if (editingItem) {
      updatedBudget = budget.map(i => i.itemId === editingItem.itemId ? {
        ...i,
        category: categoryName,
        vendorName: formState.vendorName || `${categoryName} Budget`,
        estimatedCost: budgetAmount,
        dueDate: formState.dueDate || '',
        paymentStatus: formState.paymentStatus || 'Pending',
      } as BudgetItem : i);
    } else {
      const existingItem = budget.find(i => (i.category || '').toLowerCase().trim() === categoryName.toLowerCase());
      if (existingItem) {
        updatedBudget = budget.map(i => i.itemId === existingItem.itemId ? {
          ...i,
          estimatedCost: budgetAmount,
          dueDate: formState.dueDate || i.dueDate || '',
        } : i);
      } else {
        const newItem: BudgetItem = {
          itemId: `item-${Date.now()}`,
          category: categoryName,
          vendorName: formState.vendorName || `${categoryName} Budget`,
          estimatedCost: budgetAmount,
          actualCost: 0,
          amountPaid: 0,
          dueDate: formState.dueDate || '',
          paymentStatus: 'Pending',
        };
        updatedBudget = [newItem, ...budget];
      }
    }

    setSelectedCategoryId(categoryName);
    await onUpdate(updatedBudget);

    if (continueAdding) {
      setFormState({
        category: '',
        vendorName: '',
        estimatedCost: '' as any,
        actualCost: 0,
        amountPaid: 0,
        dueDate: '',
        paymentStatus: 'Pending',
      });
      setIsAdding(true);
      setEditingItem(null);
    } else {
      closeModal();
    }
  };

  const deleteBudget = async (itemId: string) => {
    const updated = budget.filter(i => i.itemId !== itemId);
    await onUpdate(updated);
    setItemToDelete(null);
  };

  const startAddExpense = async (presetCategory?: string) => {
    if (!(await verifyActiveSession())) return;
    setExpenseFormState({
      description: '',
      category: presetCategory || selectedCategoryId || allCategories[0] || 'Venue',
      amount: '' as any,
      actualCost: 0,
      amountPaid: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsAddingExpense(true);
    setEditingExpense(null);
  };

  const startEditExpense = async (item: ExpenseItem) => {
    if (!(await verifyActiveSession())) return;
    const amt = item.amount ?? item.actualCost ?? item.amountPaid ?? 0;
    setExpenseFormState({ ...item, amount: amt > 0 ? amt : ('' as any) });
    setEditingExpense(item);
    setIsAddingExpense(false);
  };

  const closeExpenseModal = () => {
    setIsAddingExpense(false);
    setEditingExpense(null);
    setExpenseFormState({});
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
        amount: '' as any,
        actualCost: 0,
        amountPaid: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setIsAddingExpense(true);
    } else {
      closeExpenseModal();
    }
  };

  const deleteExpense = async (itemId: string) => {
    if (!onUpdateExpenses) return;
    const updated = expenses.filter(i => i.itemId !== itemId);
    await onUpdateExpenses(updated);
    setExpenseToDelete(null);
  };

  return (
    <div className="budget-ledger-editorial-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* 1. 30-Day Financial Horizon Strip [Monarch Cash Flow Horizon] */}
      <div
        className="budget-horizon-strip"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          padding: '0.75rem 1rem',
          backgroundColor: horizonMilestones.some(m => m.urgency === 'overdue') ? 'rgba(239, 68, 68, 0.04)' : 'var(--color-surface, #FFFFFF)',
          border: `1px solid ${horizonMilestones.some(m => m.urgency === 'overdue') ? '#FCA5A5' : 'var(--color-border, #E2E8F0)'}`,
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: horizonMilestones.length > 0 ? 'rgba(2, 132, 199, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: horizonMilestones.length > 0 ? 'var(--color-primary, #0284C7)' : 'var(--color-green, #10B981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={13} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-text, #0F172A)' }}>
                  30-Day Cash Flow Horizon
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '0.05rem 0.35rem',
                    borderRadius: '10px',
                    backgroundColor: horizonMilestones.some(m => m.urgency === 'overdue')
                      ? '#FEE2E2'
                      : (horizonMilestones.length > 0 ? '#E0F2FE' : '#D1FAE5'),
                    color: horizonMilestones.some(m => m.urgency === 'overdue')
                      ? '#B91C1C'
                      : (horizonMilestones.length > 0 ? '#0369A1' : '#047857'),
                  }}
                >
                  {horizonMilestones.length > 0
                    ? `${horizonMilestones.length} milestone${horizonMilestones.length === 1 ? '' : 's'} (${formatCurrency(horizonTotalDue, currency)})`
                    : 'All Clear'}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', color: 'var(--color-muted, #64748B)' }}>
                Upcoming vendor installments due through {in30DaysStr}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.62rem',
              color: 'var(--color-muted, #64748B)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}>
              <CheckCircle2 size={12} style={{ color: 'var(--color-green, #10B981)' }} />
              <span>UPDATED LIVE</span>
            </span>
          </div>
        </div>

        {/* Milestone Cards Horizontal Grid */}
        {horizonMilestones.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '0.55rem',
              marginTop: '0.25rem',
            }}
          >
            {horizonMilestones.map((m) => (
              <div
                key={m.item.itemId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: m.urgency === 'overdue'
                    ? 'rgba(239, 68, 68, 0.05)'
                    : 'var(--color-background-subtle, #F8FAFC)',
                  border: `1px solid ${m.urgency === 'overdue' ? '#FCA5A5' : 'var(--color-border, #E2E8F0)'}`,
                  borderRadius: '4px',
                  gap: '0.6rem',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-technical-mono, monospace)',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.3rem',
                        borderRadius: '3px',
                        backgroundColor: m.urgency === 'overdue' ? '#EF4444' : (m.urgency === 'critical' ? '#F59E0B' : '#0284C7'),
                        color: '#FFFFFF',
                      }}
                    >
                      {m.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-sans, system-ui)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--color-text, #0F172A)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {m.item.vendorName || m.item.category}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.64rem', color: 'var(--color-muted, #64748B)', marginTop: '0.15rem' }}>
                    {m.item.category} · Due {m.item.dueDate}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text, #0F172A)' }}>
                    {formatCurrency(m.amountDue, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickMarkPaid(m.item)}
                    disabled={isSyncing}
                    title="1-Click Reconcile: Mark this installment as paid in full"
                    style={{
                      fontFamily: 'var(--font-technical-mono, monospace)',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.45rem',
                      borderRadius: '3px',
                      backgroundColor: 'var(--color-surface, #FFFFFF)',
                      border: '1px solid var(--color-border, #CBD5E1)',
                      color: 'var(--color-primary, #0284C7)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary, #0284C7)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface, #FFFFFF)';
                      e.currentTarget.style.color = 'var(--color-primary, #0284C7)';
                    }}
                  >
                    <Check size={11} />
                    <span>Mark Paid</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '0.4rem 0.5rem',
              backgroundColor: 'var(--color-background-subtle, #F8FAFC)',
              borderRadius: '3px',
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.68rem',
              color: 'var(--color-muted, #64748B)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <CheckCircle2 size={13} style={{ color: 'var(--color-green, #10B981)' }} />
            <span>All upcoming vendor installments and milestone payments are clear for the next 30 days.</span>
          </div>
        )}
      </div>

      {/* 2. Primary Financial Metrics: Left to Spend, Paid So Far, Due in 30 Days, Budget */}
      <div
        className="budget-metric-strip"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '0.65rem',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '4px',
          padding: '0.85rem 1rem',
        }}
      >
        {/* Metric 1: Left to Spend (Monarch-Money Hero Card) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>
              LEFT TO SPEND
            </span>
            <span
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.58rem',
                fontWeight: 700,
                color: isOverallOverBudget ? '#B91C1C' : (percentUtilized >= 85 ? '#B45309' : '#047857'),
              }}
            >
              {percentUtilized}% spent
            </span>
          </div>
          <div style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '1.35rem',
            fontWeight: 800,
            color: isOverallOverBudget ? 'var(--color-red, #EF4444)' : 'var(--color-green, #10B981)',
            lineHeight: 1.1,
          }}>
            {isUnsetMode ? 'Open' : `${isOverallOverBudget ? '-' : '+'}${formatCurrency(Math.abs(overallHeadroom), currency)}`}
          </div>

          {/* Monarch Color-Graded Progress Bar */}
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--color-border, #E2E8F0)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.1rem' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, percentUtilized)}%`,
                backgroundColor: isOverallOverBudget ? '#EF4444' : (percentUtilized >= 85 ? '#F59E0B' : '#10B981'),
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.6rem', color: 'var(--color-muted, #64748B)' }}>
            {isOverallOverBudget ? 'Over budget ceiling' : `${formatCurrency(totalActual, currency)} allocated of ${formatCurrency(effectiveTarget, currency)}`}
          </span>
        </div>

        {/* Metric 2: Paid So Far */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>
            PAID SO FAR
          </span>
          <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary, #0F172A)', lineHeight: 1.1 }}>
            {formatCurrency(totalPaid, currency)}
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'transparent', marginTop: '0.1rem' }} />
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.6rem', color: 'var(--color-muted, #64748B)' }}>
            {expenses.length} payments recorded
          </span>
        </div>

        {/* Metric 3: Due in 30 Days (Cash Flow Window) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: horizonTotalDue > 0 ? 'var(--color-primary, #0F172A)' : 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>
            DUE IN 30 DAYS
          </span>
          <div style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '1.35rem',
            fontWeight: 800,
            color: horizonMilestones.some(m => m.urgency === 'overdue') ? 'var(--color-red, #EF4444)' : 'var(--color-primary, #0F172A)',
            lineHeight: 1.1,
          }}>
            {formatCurrency(horizonTotalDue, currency)}
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'transparent', marginTop: '0.1rem' }} />
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.6rem', color: horizonMilestones.some(m => m.urgency === 'overdue') ? 'var(--color-red, #EF4444)' : 'var(--color-muted, #64748B)' }}>
            {horizonMilestones.length > 0 ? `${horizonMilestones.length} milestone${horizonMilestones.length === 1 ? '' : 's'} scheduled` : 'No upcoming outlays'}
          </span>
        </div>

        {/* Metric 4: Total Wedding Budget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)', textTransform: 'uppercase' }}>
              WEDDING BUDGET
            </span>
            <button
              type="button"
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              title="Edit master budget cap"
              style={{ background: 'none', border: 'none', color: 'var(--color-muted, #64748B)', cursor: 'pointer', padding: 0 }}
            >
              <Edit2 size={11} />
            </button>
          </div>
          {isEditingTarget ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <input
                type="number"
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                style={{
                  width: '95px',
                  padding: '0.2rem 0.35rem',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.85rem',
                  border: '1px solid var(--color-primary, #0F172A)',
                  borderRadius: '2px',
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSaveCustomTarget(Number(customTargetInput))}
                style={{
                  backgroundColor: 'var(--color-primary, #0F172A)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '2px',
                  padding: '0.2rem 0.45rem',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  cursor: 'pointer',
                }}
              >
                SAVE
              </button>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #0F172A)' }}>
              {isUnsetMode ? 'No Limit' : formatCurrency(effectiveTarget, currency)}
            </div>
          )}
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.6rem', color: 'var(--color-muted, #64748B)' }}>
            {isFixedCapMode ? 'Master Ceiling Cap' : 'Dynamic Category Sum'} • {percentUtilized}% spent
          </span>
        </div>
      </div>

      {/* 3. DESKTOP SPLIT VIEW: CATEGORIES MASTER RAIL (LEFT 5 COLS) & ITEM DETAIL LEDGER (RIGHT 7 COLS) */}
      <div
        className="budget-desktop-split-view lg:grid lg:grid-cols-12 lg:gap-5 lg:items-start"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Master Category Rail (col-span-12 lg:col-span-5) */}
        <div
          className="budget-master-rail col-span-12 lg:col-span-5"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            backgroundColor: 'var(--color-surface, #FFFFFF)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '3px',
            padding: '0.85rem 1rem',
            boxSizing: 'border-box',
            minWidth: 0,
          }}
        >
          {/* Rail Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.45rem', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-primary, #0F172A)' }}>
                BUDGET BY CATEGORY
              </div>
              <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', color: 'var(--color-muted, #64748B)' }}>
                {activeCategoryRows.length} active categor{activeCategoryRows.length === 1 ? 'y' : 'ies'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => startAddBudget()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.3rem 0.6rem',
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: 'transparent',
                color: 'var(--color-primary, #0F172A)',
                border: '1px solid var(--color-border, #E2E8F0)',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
              title="Add New Budget Category"
            >
              <Plus size={12} />
              <span>+ ADD CATEGORY</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <PageSearchInput
              size="sm"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={setSearchTerm}
              resultCount={filteredCategoryRows.length}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
              {(['All', 'Overdue', 'Pending', 'Paid', 'OverBudget'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.58rem',
                    fontWeight: statusFilter === st ? 700 : 500,
                    padding: '0.2rem 0.45rem',
                    backgroundColor: statusFilter === st ? 'var(--color-primary, #0F172A)' : 'transparent',
                    color: statusFilter === st ? '#FFFFFF' : 'var(--color-muted, #64748B)',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {st === 'OverBudget' ? 'Over Budget' : st}
                </button>
              ))}

              {selectedCategoryId && (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId('')}
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.58rem',
                    color: 'var(--color-primary, #0F172A)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginLeft: 'auto',
                  }}
                >
                  CLEAR FILTER
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Category List */}
          <div
            className="budget-master-rail-list"
            style={{
              maxHeight: 'calc(100vh - 290px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              paddingRight: '0.2rem',
            }}
          >
            {filteredCategoryRows.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.72rem', color: 'var(--color-muted, #64748B)' }}>
                No categories match your search.
              </div>
            ) : (
              filteredCategoryRows.map((row) => {
                const isSelected = selectedCategoryId.toLowerCase() === row.category.toLowerCase();
                return (
                  <div
                    key={row.category}
                    onClick={() => setSelectedCategoryId(isSelected ? '' : row.category)}
                    style={{
                      border: isSelected ? '1px solid var(--color-primary, #0F172A)' : '1px solid var(--color-border, #E2E8F0)',
                      borderLeft: isSelected ? '3px solid var(--color-primary, #0F172A)' : '1px solid var(--color-border, #E2E8F0)',
                      backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.04)' : 'transparent',
                      borderRadius: '2px',
                      padding: '0.5rem 0.65rem',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    {/* Row 1: Title + Action Icons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                        <span style={{
                          fontFamily: 'var(--font-editorial-serif, serif)',
                          fontSize: '0.88rem',
                          fontWeight: isSelected ? 800 : 700,
                          color: 'var(--color-primary, #0F172A)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {row.category}
                        </span>
                        {row.expenseCount > 0 && (
                          <span style={{
                            fontFamily: 'var(--font-technical-mono, monospace)',
                            fontSize: '0.55rem',
                            color: 'var(--color-muted, #64748B)',
                            backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
                            padding: '0.05rem 0.3rem',
                            borderRadius: '2px',
                            border: '1px solid var(--color-border, #E2E8F0)',
                            flexShrink: 0,
                          }}>
                            {row.expenseCount} {row.expenseCount === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            const targetItem = row.rawBudgetItems[0];
                            if (targetItem) startEditBudget(targetItem);
                            else startAddBudget(row.category);
                          }}
                          title="Edit Category Target"
                          style={{
                            background: 'none',
                            border: '1px solid var(--color-border, #E2E8F0)',
                            borderRadius: '2px',
                            padding: '0.15rem 0.25rem',
                            cursor: 'pointer',
                            color: 'var(--color-text, #0F172A)',
                          }}
                        >
                          <Edit2 size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => startAddExpense(row.category)}
                          title="Add Purchase to Category"
                          style={{
                            background: 'none',
                            border: '1px solid var(--color-border, #E2E8F0)',
                            borderRadius: '2px',
                            padding: '0.15rem 0.25rem',
                            cursor: 'pointer',
                            color: 'var(--color-primary, #0F172A)',
                          }}
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Projected vs Outlay vs Variance */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ color: 'var(--color-muted, #64748B)' }}>Est:</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                          {formatCurrency(row.projected, currency)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ color: 'var(--color-muted, #64748B)' }}>Spent:</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary, #0F172A)' }}>
                          {formatCurrency(row.actual, currency)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span style={{ fontWeight: 700, color: row.isOver ? 'var(--color-red, #EF4444)' : 'var(--color-green, #10B981)' }}>
                          {row.isOver ? '-' : '+'}{formatCurrency(Math.abs(row.variance), currency)}
                        </span>
                      </div>
                    </div>

                    {/* Monarch-Style Category Budget Progress Bar */}
                    {row.projected > 0 && (
                      <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--color-border, #E2E8F0)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, Math.round((row.actual / row.projected) * 100))}%`,
                            backgroundColor: row.isOver ? '#EF4444' : ((row.actual / row.projected) >= 0.85 ? '#F59E0B' : '#10B981'),
                            borderRadius: '2px',
                            transition: 'width 0.2s ease',
                          }}
                        />
                      </div>
                    )}

                    {/* Row 3: Status Badge + Due Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-technical-mono, monospace)',
                          fontSize: '0.55rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '2px',
                          display: 'inline-block',
                          backgroundColor: row.isOver ? '#FEE2E2' : (row.isOverdue ? '#FEF3C7' : 'var(--color-bg-pane, #F8FAFC)'),
                          color: row.isOver ? '#991B1B' : (row.isOverdue ? '#92400E' : 'var(--color-text, #0F172A)'),
                          border: `1px solid ${row.isOver ? '#FCA5A5' : 'var(--color-border, #E2E8F0)'}`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {row.status}
                      </span>
                      {row.dueDate && (
                        <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.6rem', color: row.isOverdue ? '#B91C1C' : 'var(--color-muted, #64748B)', fontWeight: row.isOverdue ? 700 : 400 }}>
                          Due: {row.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rail Footer Totals */}
          <div
            style={{
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--color-border, #E2E8F0)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.68rem',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>TOTAL OUTLAY:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-primary, #0F172A)' }}>
                {formatCurrency(totalActual, currency)}
              </span>
              <span style={{ color: isOverallOverBudget ? 'var(--color-red, #EF4444)' : 'var(--color-green, #10B981)', fontWeight: 700 }}>
                ({isOverallOverBudget ? '-' : '+'}{formatCurrency(Math.abs(overallHeadroom), currency)})
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Itemized Purchases Ledger (col-span-12 lg:col-span-7) */}
        <div
          className="budget-detail-ledger col-span-12 lg:col-span-7"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            position: 'sticky',
            top: '0.75rem',
            minWidth: 0,
          }}
        >
          {/* Detail Header & Category Snapshot Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '3px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary, #0F172A)', letterSpacing: '0.06em' }}>
                  EXPENSES &amp; PURCHASES {selectedCategoryId ? `// ${selectedCategoryId.toUpperCase()}` : '// ALL EXPENSES'}
                </span>
                <div style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', color: 'var(--color-muted, #64748B)' }}>
                  {itemizedExpensesForSelected.length} logged expense items
                </div>
              </div>

              <button
                type="button"
                onClick={() => startAddExpense(selectedCategoryId)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-primary, #0F172A)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={13} />
                <span>+ ADD EXPENSE</span>
              </button>
            </div>

            {/* If a category is selected, render a compact snapshot strip */}
            {selectedCatData && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.45rem 1rem',
                  padding: '0.45rem 0.65rem',
                  backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.68rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ color: 'var(--color-muted, #64748B)' }}>BUDGET:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text, #0F172A)' }}>
                    {formatCurrency(selectedCatData.projected, currency)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ color: 'var(--color-muted, #64748B)' }}>SPENT:</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary, #0F172A)' }}>
                    {formatCurrency(selectedCatData.actual, currency)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ color: 'var(--color-muted, #64748B)' }}>REMAINING:</span>
                  <span style={{ fontWeight: 800, color: selectedCatData.isOver ? 'var(--color-red, #EF4444)' : 'var(--color-green, #10B981)' }}>
                    {selectedCatData.isOver ? '-' : '+'}{formatCurrency(Math.abs(selectedCatData.variance), currency)}
                  </span>
                </div>
                {selectedCatData.dueDate && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                    <span style={{ color: 'var(--color-muted, #64748B)' }}>DUE:</span>
                    <span style={{ fontWeight: 600, color: selectedCatData.isOverdue ? '#B91C1C' : 'var(--color-text, #0F172A)' }}>
                      {selectedCatData.dueDate}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId('')}
                  style={{
                    color: 'var(--color-primary, #0F172A)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.62rem',
                    marginLeft: 'auto',
                  }}
                >
                  SHOW ALL
                </button>
              </div>
            )}
          </div>

          {/* Desktop Tabular Purchases Table */}
          <div
            className="budget-desktop-table"
            style={{
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-pane, #F8FAFC)', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>
                    <th style={{ padding: '0.5rem 0.65rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)', width: '85px' }}>DATE</th>
                    <th style={{ padding: '0.5rem 0.65rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)' }}>DESCRIPTION</th>
                    {!selectedCategoryId && (
                      <th style={{ padding: '0.5rem 0.65rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)', width: '110px' }}>CATEGORY</th>
                    )}
                    <th style={{ padding: '0.5rem 0.65rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)', textAlign: 'right', width: '100px' }}>AMOUNT PAID</th>
                    <th style={{ padding: '0.5rem 0.65rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)', textAlign: 'right', width: '100px' }}>TOTAL COST</th>
                    <th style={{ padding: '0.5rem 0.65rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-muted, #64748B)', textAlign: 'center', width: '65px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {itemizedExpensesForSelected.length === 0 ? (
                    <tr>
                      <td colSpan={selectedCategoryId ? 5 : 6} style={{ padding: '2rem 1rem', textAlign: 'center', fontFamily: 'var(--font-technical-mono, monospace)', color: 'var(--color-muted, #64748B)' }}>
                        No purchase items logged yet for this selection. Click &quot;+ ADD EXPENSE&quot; to log vendor receipts.
                      </td>
                    </tr>
                  ) : (
                    itemizedExpensesForSelected.map((exp, idx) => {
                      const amt = exp.actualCost ?? exp.amount ?? exp.amountPaid ?? 0;
                      const paid = exp.amountPaid ?? amt;
                      return (
                        <tr key={exp.itemId || idx} style={{ borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>
                          <td style={{ padding: '0.5rem 0.65rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', color: 'var(--color-muted, #64748B)' }}>
                            {exp.purchaseDate || '—'}
                          </td>
                          <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                            {exp.description}
                            {exp.notes && (
                              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-muted, #64748B)', fontWeight: 400 }}>
                                {exp.notes}
                              </span>
                            )}
                          </td>
                          {!selectedCategoryId && (
                            <td style={{ padding: '0.5rem 0.65rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', color: 'var(--color-muted, #64748B)' }}>
                              {exp.category}
                            </td>
                          )}
                          <td style={{ padding: '0.5rem 0.65rem', textAlign: 'right', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text, #0F172A)' }}>
                            {formatCurrency(paid, currency)}
                          </td>
                          <td style={{ padding: '0.5rem 0.65rem', textAlign: 'right', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)' }}>
                            {formatCurrency(amt, currency)}
                          </td>
                          <td style={{ padding: '0.5rem 0.65rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <button
                                type="button"
                                onClick={() => startEditExpense(exp)}
                                title="Edit purchase"
                                style={{ background: 'none', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', padding: '0.2rem', cursor: 'pointer', color: 'var(--color-text, #0F172A)' }}
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setExpenseToDelete(exp)}
                                title="Delete purchase"
                                style={{ background: 'none', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', padding: '0.2rem', cursor: 'pointer', color: '#B91C1C' }}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compact Mobile Payment Rows (Monarch-Money Inspired) */}
          <div
            className="budget-mobile-payment-list"
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: '0.45rem',
              width: '100%',
            }}
          >
            {itemizedExpensesForSelected.length === 0 ? (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.75rem',
                  color: 'var(--color-muted, #64748B)',
                  backgroundColor: 'var(--color-surface, #FFFFFF)',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  borderRadius: '3px',
                }}
              >
                No expense items recorded yet. Tap below to log a payment.
              </div>
            ) : (
              itemizedExpensesForSelected.map((exp, idx) => {
                const amt = exp.actualCost ?? exp.amount ?? exp.amountPaid ?? 0;
                const paid = exp.amountPaid ?? amt;
                const isPaidFull = amt > 0 && paid >= amt;
                return (
                  <div
                    key={exp.itemId || idx}
                    onClick={() => startEditExpense(exp)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      padding: '0.75rem 0.85rem',
                      backgroundColor: 'var(--color-surface, #FFFFFF)',
                      border: '1px solid var(--color-border, #E2E8F0)',
                      borderRadius: '3px',
                      minHeight: '52px',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.description}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', color: 'var(--color-muted, #64748B)' }}>
                        <span>{exp.category}</span>
                        {exp.purchaseDate && (
                          <>
                            <span>•</span>
                            <span>{exp.purchaseDate}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text, #0F172A)' }}>
                        {formatCurrency(amt, currency)}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-technical-mono, monospace)',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '2px',
                          backgroundColor: isPaidFull ? 'rgba(16, 185, 129, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                          color: isPaidFull ? 'var(--color-green, #10B981)' : 'var(--color-amber, #D97706)',
                        }}
                      >
                        {isPaidFull ? 'PAID' : `PAID ${formatCurrency(paid, currency)}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <MobileFAB
        label="Add Financial Item"
        icon={Plus}
        subActions={[
          {
            label: 'Record Purchase',
            icon: Plus,
            onClick: () => startAddExpense(selectedCategoryId),
          },
          {
            label: 'Budget Category',
            icon: FileSpreadsheet,
            onClick: () => startAddBudget(),
          },
        ]}
      />

      {/* Slide-Over Budget Category Inspector [Monarch UX] */}
      <SlideOverDrawer
        isOpen={Boolean(isAdding || editingItem)}
        onClose={closeModal}
        title={editingItem ? 'Edit Budget Category' : 'Add Budget Category'}
        subtitle={formState.category ? `Category allocation · ${currencySymbol}${formState.estimatedCost || 0}` : 'New budget category allocation'}
        badge="BUDGET CATEGORY"
        badgeColor="#0284C7"
        width="460px"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
            <button type="button" onClick={closeModal} style={{ padding: '0.35rem 0.75rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.7rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', background: 'transparent', cursor: 'pointer' }}>
              CANCEL
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button type="button" onClick={(e) => saveBudget(e, true)} style={{ padding: '0.35rem 0.75rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.7rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', background: 'transparent', cursor: 'pointer' }}>
                SAVE & ADD ANOTHER
              </button>
              <button type="submit" form="budget-category-form" style={{ padding: '0.35rem 0.85rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--color-primary, #0F172A)', color: '#FFFFFF', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>
                SAVE CATEGORY
              </button>
            </div>
          </div>
        }
      >
        <form id="budget-category-form" onSubmit={(e) => saveBudget(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
              CATEGORY NAME
            </label>
            <input
              type="text"
              list="standard-categories"
              value={formState.category || ''}
              onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g. Venue & Catering"
              style={{ padding: '0.45rem 0.55rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem' }}
              required
            />
            <datalist id="standard-categories">
              {allCategories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
              PLANNED BUDGET ({currencySymbol})
            </label>
            <input
              type="number"
              step="0.01"
              value={formState.estimatedCost ?? ''}
              onChange={(e) => setFormState(prev => ({ ...prev, estimatedCost: e.target.value as any }))}
              placeholder="e.g. 15000"
              style={{ padding: '0.45rem 0.55rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
              DUE DATE (OPTIONAL)
            </label>
            <input
              type="date"
              value={formState.dueDate || ''}
              onChange={(e) => setFormState(prev => ({ ...prev, dueDate: e.target.value }))}
              style={{ padding: '0.45rem 0.55rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem' }}
            />
          </div>
        </form>
      </SlideOverDrawer>

      {/* Slide-Over Expense Inspector [Monarch UX] */}
      <SlideOverDrawer
        isOpen={Boolean(isAddingExpense || editingExpense)}
        onClose={closeExpenseModal}
        title={editingExpense ? 'Edit Purchase Entry' : 'Record Purchase'}
        subtitle={expenseFormState.description ? `${expenseFormState.category || 'Expense'} · ${formatCurrency(Number(expenseFormState.amount) || 0, currency)}` : 'Itemized expense receipt'}
        badge="EXPENSE RECORD"
        badgeColor="#059669"
        width="460px"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
            <button type="button" onClick={closeExpenseModal} style={{ padding: '0.35rem 0.75rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.7rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', background: 'transparent', cursor: 'pointer' }}>
              CANCEL
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button type="button" onClick={(e) => saveExpense(e, true)} style={{ padding: '0.35rem 0.75rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.7rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', background: 'transparent', cursor: 'pointer' }}>
                SAVE & ADD ANOTHER
              </button>
              <button type="submit" form="expense-item-form" style={{ padding: '0.35rem 0.85rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--color-primary, #0F172A)', color: '#FFFFFF', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>
                RECORD PURCHASE
              </button>
            </div>
          </div>
        }
      >
        <form id="expense-item-form" onSubmit={(e) => saveExpense(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
              DESCRIPTION / VENDOR
            </label>
            <input
              type="text"
              value={expenseFormState.description || ''}
              onChange={(e) => setExpenseFormState(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Caterer Deposit"
              style={{ padding: '0.45rem 0.55rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
              CATEGORY
            </label>
            <select
              value={expenseFormState.category || selectedCategoryId || allCategories[0] || ''}
              onChange={(e) => setExpenseFormState(prev => ({ ...prev, category: e.target.value }))}
              style={{ padding: '0.45rem 0.55rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem' }}
              required
            >
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
                AMOUNT ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={expenseFormState.amount ?? ''}
                onChange={(e) => setExpenseFormState(prev => ({ ...prev, amount: e.target.value as any, actualCost: Number(e.target.value), amountPaid: Number(e.target.value) }))}
                placeholder="e.g. 3500"
                style={{ padding: '0.45rem 0.55rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
                PURCHASE DATE
              </label>
              <input
                type="date"
                value={expenseFormState.purchaseDate || ''}
                onChange={(e) => setExpenseFormState(prev => ({ ...prev, purchaseDate: e.target.value }))}
                style={{ padding: '0.45rem 0.55rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted, #64748B)' }}>
              NOTES (OPTIONAL)
            </label>
            <input
              type="text"
              value={expenseFormState.notes || ''}
              onChange={(e) => setExpenseFormState(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Receipt #1049, paid via Visa"
              style={{ padding: '0.45rem 0.55rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.75rem' }}
            />
          </div>
        </form>
      </SlideOverDrawer>

      {/* Delete Confirmation Dialog */}
      {(itemToDelete || expenseToDelete) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '3px',
              maxWidth: '380px',
              width: '100%',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.8rem', fontWeight: 800, color: '#B91C1C' }}>
              CONFIRM DELETION
            </span>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted, #64748B)', lineHeight: 1.4 }}>
              Are you sure you want to delete {itemToDelete ? `the budget category "${itemToDelete.category}"` : `the purchase record "${expenseToDelete?.description}"`}? This action will permanently remove it from your records.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => { setItemToDelete(null); setExpenseToDelete(null); }}
                style={{ padding: '0.35rem 0.75rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.7rem', border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '2px', background: 'transparent', cursor: 'pointer' }}
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  if (itemToDelete) deleteBudget(itemToDelete.itemId);
                  if (expenseToDelete) deleteExpense(expenseToDelete.itemId);
                }}
                style={{ padding: '0.35rem 0.85rem', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#B91C1C', color: '#FFFFFF', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped Responsive CSS */}
      <style>{`
        @media (min-width: 1024px) {
          .budget-desktop-split-view {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            gap: 1.25rem !important;
            align-items: start !important;
          }
          .budget-master-rail {
            grid-column: span 5 / span 5 !important;
          }
          .budget-detail-ledger {
            grid-column: span 7 / span 7 !important;
          }
        }
        @media (max-width: 1023px) {
          .budget-desktop-split-view {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }
          .budget-master-rail,
          .budget-detail-ledger {
            width: 100% !important;
            position: static !important;
          }
          .budget-master-rail-list {
            max-height: 400px !important;
          }
        }
        @media (max-width: 768px) {
          .budget-metric-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.5rem !important;
          }
          .budget-add-btn {
            display: none !important;
          }
          .budget-desktop-table {
            display: none !important;
          }
          .budget-mobile-payment-list {
            display: flex !important;
          }
        }
        .budget-master-rail-list::-webkit-scrollbar {
          width: 4px;
        }
        .budget-master-rail-list::-webkit-scrollbar-track {
          background: var(--color-bg-pane, #f8fafc);
        }
        .budget-master-rail-list::-webkit-scrollbar-thumb {
          background: var(--color-border, #cbd5e1);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
