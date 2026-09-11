'use client';

import React, { useState, useEffect } from 'react';
import { BudgetItem, ExpenseItem } from '@/lib/sheets/types';
import { Plus, Edit2, Check, X, Trash2, HelpCircle, AlertTriangle, TrendingUp, PieChart, AlertCircle, DollarSign, Calendar, CreditCard, ShoppingBag, Tag, ChevronRight, Search, RefreshCw } from 'lucide-react';
import MobileFAB from '@/components/MobileFAB';
import { formatCurrency, formatDateConsistent, getCurrencySymbol } from '@/lib/currency';

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

// Standard Wedding Budget Categories from Master Schema / SETTINGS
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

  // Budget Utilization Visualization Mode: 'bar' | 'donut'
  const [meterMode, setMeterMode] = useState<'bar' | 'donut'>('bar');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('s2v_budget_meter_mode');
      if (savedMode === 'bar' || savedMode === 'donut') {
        setMeterMode(savedMode);
      }
    }
  }, []);

  const handleMeterModeChange = (mode: 'bar' | 'donut') => {
    setMeterMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_budget_meter_mode', mode);
    }
  };

  // Hybrid Target Mode: 'dynamic' (auto-sum of categories) | 'fixed_cap' (explicit master cap ceiling) | 'unset' (no hard limit)
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

  // Inline Editable Budget Target State
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
      if (savedMode === 'dynamic') {
        setTargetMode('dynamic');
      } else if (savedMode === 'unset') {
        setTargetMode('unset');
      } else {
        setTargetMode('fixed_cap');
      }
    } else {
      setCustomTargetInput('');
      const savedMode = typeof window !== 'undefined' ? (localStorage.getItem('s2v_budget_target_mode') as BudgetTargetMode) : null;
      if (savedMode === 'unset') {
        setTargetMode('unset');
      } else {
        setTargetMode('dynamic');
      }
    }
  }, [budgetTarget]);

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

  // Desktop Master-Detail State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [masterCategorySearch, setMasterCategorySearch] = useState<string>('');
  const [detailExpenseSearch, setDetailExpenseSearch] = useState<string>('');

  // Mobile Bottom Sheet Drill-Down State (< lg)
  const [activeBottomSheetCategory, setActiveBottomSheetCategory] = useState<string | null>(null);
  const [isSheetAnimating, setIsSheetAnimating] = useState<boolean>(false);
  const [mobileCategorySearch, setMobileCategorySearch] = useState<string>('');
  const [mobileFilterTab, setMobileFilterTab] = useState<'all' | 'active' | 'alerts'>('all');
  const [mobileExpenseSearch, setMobileExpenseSearch] = useState<string>('');

  const openBottomSheet = (categoryName: string) => {
    setActiveBottomSheetCategory(categoryName);
    setMobileExpenseSearch('');
    requestAnimationFrame(() => {
      setIsSheetAnimating(true);
    });
  };

  const closeBottomSheet = () => {
    setIsSheetAnimating(false);
    setTimeout(() => {
      setActiveBottomSheetCategory(null);
    }, 280);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeBottomSheetCategory) {
        closeBottomSheet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBottomSheetCategory]);

  React.useEffect(() => {
    if (activeBottomSheetCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeBottomSheetCategory]);

  // Unique categories for summaries & dropdowns
  const budgetCategories = Array.from(new Set(budget.map(item => item.category).filter(Boolean)));
  const expenseCategories = Array.from(new Set(expenses.map(item => item.category).filter(Boolean)));
  const allCategories = Array.from(new Set([...STANDARD_BUDGET_CATEGORIES, ...budgetCategories, ...expenseCategories])).filter(Boolean);

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

  // Dynamic Expenses calculations per Line Item / Vendor (matching description or category)
  const getLineItemExpenseTotals = (item: BudgetItem) => {
    const itemVendor = (item.vendorName || '').toLowerCase().trim();
    const itemCat = (item.category || '').toLowerCase().trim();

    // 1. Direct match: Expense description matches Budget Line Item / Vendor Name
    const directMatches = expenses.filter(e => {
      const expDesc = (e.description || '').toLowerCase().trim();
      const expCat = (e.category || '').toLowerCase().trim();
      return expDesc === itemVendor || (itemVendor.length > 2 && expDesc.includes(itemVendor)) || (expDesc.length > 2 && itemVendor.includes(expDesc));
    });

    if (directMatches.length > 0) {
      const actualCost = directMatches.reduce((sum, e) => sum + (e.actualCost || 0), 0);
      const amountPaid = directMatches.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
      return {
        count: directMatches.length,
        actualCost,
        amountPaid,
        hasMatched: true,
      };
    }

    // 2. Fallback: If only 1 budget item exists for this category, or if vendorName is generic overview
    const sameCatBudgetItems = budget.filter(b => (b.category || '').toLowerCase().trim() === itemCat);
    if (sameCatBudgetItems.length === 1 || itemVendor.includes('overview') || itemVendor === itemCat) {
      const catExpenses = expenses.filter(e => (e.category || '').toLowerCase().trim() === itemCat);
      if (catExpenses.length > 0) {
        const actualCost = catExpenses.reduce((sum, e) => sum + (e.actualCost || 0), 0);
        const amountPaid = catExpenses.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
        return {
          count: catExpenses.length,
          actualCost,
          amountPaid,
          hasMatched: true,
        };
      }
    }

    return {
      count: 0,
      actualCost: item.actualCost,
      amountPaid: item.amountPaid,
      hasMatched: false,
    };
  };

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

  // Compute total actual outlay across all budget items (using line item expense matches or logged expenses)
  const totalLoggedExpensesActual = expenses.reduce((sum, e) => sum + e.actualCost, 0);
  const totalLoggedExpensesPaid = expenses.reduce((sum, e) => sum + e.amountPaid, 0);

  const budgetActualSum = budget.reduce((sum, item) => {
    const stats = getLineItemExpenseTotals(item);
    return sum + (stats.hasMatched ? stats.actualCost : item.actualCost);
  }, 0);

  const budgetPaidSum = budget.reduce((sum, item) => {
    const stats = getLineItemExpenseTotals(item);
    return sum + (stats.hasMatched ? stats.amountPaid : item.amountPaid);
  }, 0);

  const totalActual = expenses.length > 0
    ? Math.max(budgetActualSum, totalLoggedExpensesActual)
    : budget.reduce((sum, item) => sum + item.actualCost, 0);

  const totalPaid = expenses.length > 0
    ? Math.max(budgetPaidSum, totalLoggedExpensesPaid)
    : budget.reduce((sum, item) => sum + item.amountPaid, 0);

  const totalBalance = totalActual - totalPaid;

  // Effective Budget Target Baseline (Hybrid Model: Dynamic Category Sum + Optional Master Cap)
  const isUnsetMode = targetMode === 'unset';
  const isDynamicMode = targetMode === 'dynamic';
  const isFixedCapMode = targetMode === 'fixed_cap';

  const effectiveTarget = isUnsetMode
    ? 0
    : isDynamicMode
      ? totalEstimate
      : (Number(customTargetInput) > 0 ? Number(customTargetInput) : totalEstimate);

  // Allocation Cushion (Master Cap vs Sum of Categories)
  const allocationDifference = effectiveTarget - totalEstimate;
  const isOverAllocated = isFixedCapMode && allocationDifference < 0;
  const unallocatedCushion = isFixedCapMode && allocationDifference > 0 ? allocationDifference : 0;

  // Actions for Target Mode Transitions
  const handleSaveCustomTarget = async (val: number) => {
    setIsEditingTarget(false);
    if (!isNaN(val) && val > 0) {
      setCustomTargetInput(val.toString());
      handleSetTargetMode('fixed_cap');
      if (onUpdateBudgetTarget) {
        await onUpdateBudgetTarget(val);
      }
    } else if (val === 0) {
      handleSetTargetMode('unset');
      if (onUpdateBudgetTarget) {
        await onUpdateBudgetTarget(0);
      }
    }
  };

  const handleSyncToCategories = async () => {
    setIsEditingTarget(false);
    handleSetTargetMode('dynamic');
    setCustomTargetInput(totalEstimate.toString());
    if (onUpdateBudgetTarget) {
      await onUpdateBudgetTarget(totalEstimate);
    }
  };

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
    const catPaid = expStats.count > 0 ? expStats.amountPaid : catBudgetItems.reduce((sum, i) => sum + i.amountPaid, 0);
    const catPercent = catEstimate > 0 ? Math.min(Math.round((catActual / catEstimate) * 100), 150) : (catActual > 0 ? 100 : 0);
    const isOver = catActual > catEstimate;
    const overAmount = catActual - catEstimate;

    return {
      category: cat,
      estimated: catEstimate,
      actual: catActual,
      paid: catPaid,
      percent: catPercent,
      isOver,
      overAmount,
      expenseCount: expStats.count,
      budgetItemCount: catBudgetItems.length,
      budgetItems: catBudgetItems,
    };
  });

  // Active Categories with an allocated budget (> $0) or active expenses (Hides zero-dollar budgets from UI)
  const activeOrAlertStats = categoryStats.filter(
    stat => stat.estimated > 0 || stat.actual > 0 || stat.expenseCount > 0
  );

  // Resolved active category selection for Desktop Master-Detail split-view
  const effectiveSelectedCategoryId = selectedCategoryId && activeOrAlertStats.some(s => s.category.toLowerCase() === selectedCategoryId.toLowerCase())
    ? selectedCategoryId
    : (activeOrAlertStats[0]?.category || '');

  const selectedCatStat = categoryStats.find(c => c.category.toLowerCase() === effectiveSelectedCategoryId.toLowerCase()) || {
    category: effectiveSelectedCategoryId,
    estimated: 0,
    actual: 0,
    paid: 0,
    percent: 0,
    isOver: false,
    overAmount: 0,
    expenseCount: 0,
    budgetItemCount: 0,
    budgetItems: [],
  };

  const selectedCatBudgetItems = budget.filter(i => (i.category || '').toLowerCase() === effectiveSelectedCategoryId.toLowerCase());
  const selectedCatExpenses = expenses.filter(e => (e.category || '').toLowerCase().trim() === effectiveSelectedCategoryId.toLowerCase().trim());
  const selectedCatExpensesTotal = selectedCatExpenses.reduce((sum, e) => sum + (e.amount ?? e.actualCost ?? e.amountPaid ?? 0), 0);
  const remainingCushion = selectedCatStat.estimated - selectedCatExpensesTotal;

  // Master Category List: Filtered strictly to budgeted or active categories (hides zero dollar budgets from UI)
  const displayedMasterStats = (() => {
    let list = categoryStats.filter(c => c.estimated > 0 || c.actual > 0 || c.expenseCount > 0);
    if (masterCategorySearch.trim()) {
      list = list.filter(c => c.category.toLowerCase().includes(masterCategorySearch.toLowerCase().trim()));
    }
    return [...list].sort((a, b) => {
      if (a.isOver && !b.isOver) return -1;
      if (!a.isOver && b.isOver) return 1;
      const aHasOutlay = a.actual > 0;
      const bHasOutlay = b.actual > 0;
      if (aHasOutlay && !bHasOutlay) return -1;
      if (!aHasOutlay && bHasOutlay) return 1;
      return a.category.localeCompare(b.category);
    });
  })();

  // Detail Expenses filtered by search within selected category
  const displayedDetailExpenses = selectedCatExpenses.filter(exp => {
    if (!detailExpenseSearch.trim()) return true;
    const term = detailExpenseSearch.toLowerCase().trim();
    return (
      (exp.description || '').toLowerCase().includes(term) ||
      (exp.notes || '').toLowerCase().includes(term)
    );
  });

  // Mobile (< lg) Category List: Filtered strictly to budgeted or active categories (hides zero dollar budgets from UI)
  const displayedMobileStats = (() => {
    let list = categoryStats.filter(stat => stat.estimated > 0 || stat.actual > 0 || stat.expenseCount > 0);

    if (mobileFilterTab === 'active') {
      list = list.filter(stat => stat.actual > 0 || stat.expenseCount > 0);
    } else if (mobileFilterTab === 'alerts') {
      list = list.filter(stat => stat.isOver);
    }

    if (mobileCategorySearch.trim()) {
      const q = mobileCategorySearch.toLowerCase().trim();
      list = list.filter(stat => stat.category.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      if (a.isOver && !b.isOver) return -1;
      if (!a.isOver && b.isOver) return 1;
      const aHasOutlay = a.actual > 0;
      const bHasOutlay = b.actual > 0;
      if (aHasOutlay && !bHasOutlay) return -1;
      if (!aHasOutlay && bHasOutlay) return 1;
      return a.category.localeCompare(b.category);
    });
  })();

  // Mobile Bottom Sheet Active Category Data
  const bottomSheetStat = activeBottomSheetCategory
    ? (categoryStats.find(c => c.category.toLowerCase() === activeBottomSheetCategory.toLowerCase()) || {
      category: activeBottomSheetCategory,
      estimated: 0,
      actual: 0,
      paid: 0,
      percent: 0,
      isOver: false,
      overAmount: 0,
      expenseCount: 0,
      budgetItemCount: 0,
      budgetItems: [],
    })
    : null;

  const bottomSheetExpenses = activeBottomSheetCategory
    ? expenses.filter(e => (e.category || '').toLowerCase().trim() === activeBottomSheetCategory.toLowerCase().trim())
    : [];

  const bottomSheetExpensesTotal = bottomSheetExpenses.reduce((sum, e) => sum + (e.amount ?? e.actualCost ?? e.amountPaid ?? 0), 0);
  const bottomSheetCushion = bottomSheetStat ? bottomSheetStat.estimated - bottomSheetExpensesTotal : 0;

  const filteredBottomSheetExpenses = bottomSheetExpenses.filter(e => {
    if (!mobileExpenseSearch.trim()) return true;
    const q = mobileExpenseSearch.toLowerCase().trim();
    return (e.description || '').toLowerCase().includes(q) || (e.notes || '').toLowerCase().includes(q);
  });

  // Budget Item Actions (Simple Category Addition)
  const startAddBudget = (presetCategory?: string) => {
    setFormState({
      category: presetCategory || '',
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

  const startEditBudget = (item: BudgetItem) => {
    setFormState({
      ...item,
      estimatedCost: item.estimatedCost,
    });
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
        ? (value === '' ? '' : (isNaN(Number(value)) ? value : Number(value)))
        : value
    }));
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
        vendorName: i.vendorName || `${categoryName} Budget`,
        estimatedCost: budgetAmount,
      } as BudgetItem : i);
    } else {
      // If a budget item for this category already exists, update its budget allocation
      const existingItem = budget.find(i => (i.category || '').toLowerCase().trim() === categoryName.toLowerCase());
      if (existingItem) {
        updatedBudget = budget.map(i => i.itemId === existingItem.itemId ? {
          ...i,
          estimatedCost: budgetAmount,
        } : i);
      } else {
        const newItem: BudgetItem = {
          itemId: `item-${Date.now()}`,
          category: categoryName,
          vendorName: `${categoryName} Budget`,
          estimatedCost: budgetAmount,
          actualCost: 0,
          amountPaid: 0,
          dueDate: '',
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
  const startAddExpense = (presetCategory?: string) => {
    setExpenseFormState({
      description: '',
      category: presetCategory || effectiveSelectedCategoryId || activeOrAlertStats[0]?.category || allCategories[0] || 'General',
      amount: '' as any,
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
    <div className={`budget-manager-container ${activeBottomSheetCategory ? 'has-bottom-sheet-open' : ''}`} style={styles.container}>
      {/* Scoped CSS for Header, Responsive View Toggle & Mobile Bottom Sheet */}
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
            gap: 0.5rem !important;
          }
        }
        @media (max-width: 768px) {
          .budget-add-btn {
            display: none !important;
          }
        }

        /* Responsive Master-Detail Split-View for Desktop (>= lg / 1024px) */
        @media (min-width: 1024px) {
          .budget-mobile-stacked-view {
            display: none !important;
          }
          .budget-desktop-split-view {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            gap: 1.5rem !important;
            align-items: start !important;
          }
          .budget-master-rail {
            grid-column: span 5 / span 5 !important;
            max-height: calc(100vh - 220px) !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            padding-right: 0 !important;
          }
          .budget-master-rail-fixed-header {
            flex-shrink: 0 !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 10 !important;
            background-color: var(--color-bg) !important;
            padding-bottom: 0.75rem !important;
            padding-right: 0.5rem !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          .budget-master-rail-list {
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            padding-right: 0.5rem !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0.625rem !important;
          }
          .budget-detail-ledger {
            grid-column: span 7 / span 7 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 1.25rem !important;
          }
          .budget-desktop-pills-bar {
            display: flex !important;
          }
          .budget-mobile-chips-container {
            display: none !important;
          }
        }

        /* Interactive Drill-Down Mobile View (< lg / 1023px) */
        @media (max-width: 1023px) {
          .budget-desktop-split-view {
            display: none !important;
          }
          .budget-mobile-stacked-view {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }
          .budget-desktop-pills-bar {
            display: none !important;
          }
          .budget-mobile-chips-container {
            display: none !important;
          }
          .budget-meter-card {
            position: sticky !important;
            top: 0.5rem !important;
            z-index: 30 !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            background-color: var(--color-surface) !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
            padding: 0.85rem 1rem !important;
          }
        }

        /* Custom Scrollbar for Master Rail */
        .budget-master-rail::-webkit-scrollbar {
          width: 5px;
        }
        .budget-master-rail::-webkit-scrollbar-track {
          background: var(--color-bg-subtle, #f8fafc);
          border-radius: 4px;
        }
        .budget-master-rail::-webkit-scrollbar-thumb {
          background: var(--color-border, #cbd5e1);
          border-radius: 4px;
        }
        .budget-master-rail::-webkit-scrollbar-thumb:hover {
          background: var(--color-muted, #94a3b8);
        }

        /* Mobile Bottom Sheet & Category Cards */
        .mobile-bottom-sheet-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 110;
          transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mobile-bottom-sheet-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 120;
          background-color: var(--color-surface);
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.25);
          border-top: 1px solid var(--color-border);
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }
        .mobile-bottom-sheet-handle {
          width: 44px;
          height: 5px;
          background-color: var(--color-border);
          border-radius: 999px;
          margin: 0.65rem auto 0.35rem;
          flex-shrink: 0;
          cursor: pointer;
        }
        .mobile-category-card {
          transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .mobile-category-card:active {
          transform: scale(0.985);
          background-color: rgba(13, 27, 42, 0.04);
        }
        .has-bottom-sheet-open .mobile-fab-container {
          display: none !important;
        }
      `}</style>

      {/* Main Header */}
      <div className="budget-header-container">
        <div>
          <h2 style={styles.title}>Wedding Financials</h2>
          <p style={styles.subtitle}>Track category budgets, log individual purchases & monitor real-time payments</p>
        </div>
      </div>

      {/* Budget Progress & Health Banner */}
      <div className={`budget-meter-card ${isOverallOverBudget || isOverAllocated ? 'is-over-budget' : ''}`} style={styles.meterCard}>
        <div style={styles.meterHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span style={styles.meterSubtext}>BUDGET UTILIZED</span>

              {/* Mode Badge & Switching Controls */}
              {isDynamicMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    backgroundColor: 'rgba(26, 127, 75, 0.1)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: '12px',
                    padding: '0.15rem 0.55rem',
                    letterSpacing: '0.04em'
                  }}>
                    DYNAMIC SUM (FROM CATEGORIES)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTarget(true);
                      if (!customTargetInput) setCustomTargetInput(totalEstimate.toString());
                    }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--color-muted)',
                      backgroundColor: 'transparent',
                      border: '1px dashed var(--color-border)',
                      borderRadius: '12px',
                      padding: '0.15rem 0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Define a fixed Master Target Cap ceiling"
                  >
                    + SET MASTER CAP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSetTargetMode('unset');
                      if (onUpdateBudgetTarget) onUpdateBudgetTarget(0);
                    }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--color-muted)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    title="Track expenses without any target limit"
                  >
                    Unset Limit
                  </button>
                </div>
              )}

              {isFixedCapMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '12px',
                    padding: '0.15rem 0.55rem',
                    letterSpacing: '0.04em'
                  }}>
                    MASTER CAP ACTIVE
                  </span>
                  <button
                    type="button"
                    onClick={handleSyncToCategories}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      backgroundColor: 'rgba(26, 127, 75, 0.08)',
                      border: '1px solid var(--color-primary)',
                      borderRadius: '12px',
                      padding: '0.15rem 0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Snap Master Cap to current category sum (${formatCurrency(totalEstimate, currency)}) and switch to Dynamic Auto-Sum`}
                  >
                    <RefreshCw size={10} />
                    <span>SYNC TO CATEGORIES ({formatCurrency(totalEstimate, currency)})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSetTargetMode('unset');
                      if (onUpdateBudgetTarget) onUpdateBudgetTarget(0);
                    }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--color-muted)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    title="Track expenses without any target limit"
                  >
                    Unset Limit
                  </button>
                </div>
              )}

              {isUnsetMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: 'var(--color-muted)',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '0.15rem 0.55rem',
                  }}>
                    NO HARD LIMIT (UNSET MODE)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleSetTargetMode('dynamic');
                      if (onUpdateBudgetTarget) onUpdateBudgetTarget(totalEstimate);
                    }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-primary)',
                      borderRadius: '12px',
                      padding: '0.15rem 0.5rem',
                      cursor: 'pointer',
                    }}
                    title="Auto-calculate budget dynamically from category targets"
                  >
                    USE DYNAMIC SUM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTarget(true);
                      if (!customTargetInput) setCustomTargetInput(totalEstimate > 0 ? totalEstimate.toString() : '35000');
                    }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--color-muted)',
                      backgroundColor: 'transparent',
                      border: '1px dashed var(--color-border)',
                      borderRadius: '12px',
                      padding: '0.15rem 0.5rem',
                      cursor: 'pointer',
                    }}
                    title="Enter an explicit master ceiling cap"
                  >
                    SET MASTER CAP
                  </button>
                </div>
              )}
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
                          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                            <span style={{
                              position: 'absolute',
                              left: '0.45rem',
                              color: 'var(--color-primary)',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              pointerEvents: 'none',
                              userSelect: 'none',
                            }}>
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              value={customTargetInput}
                              onChange={(e) => setCustomTargetInput(e.target.value)}
                              style={{
                                width: '115px',
                                padding: '0.2rem 0.4rem 0.2rem 1.4rem',
                                fontSize: '0.85rem',
                                fontFamily: 'var(--font-mono)',
                                border: '1px solid var(--color-primary)',
                                borderRadius: '4px',
                              }}
                              placeholder="Amount"
                              autoFocus
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSaveCustomTarget(Number(customTargetInput))}
                            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.4rem', cursor: 'pointer' }}
                            title="Save Master Cap"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingTarget(false)}
                            style={{ background: 'transparent', color: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.2rem 0.4rem', cursor: 'pointer' }}
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ) : (
                        <span
                          onClick={() => setIsEditingTarget(true)}
                          style={{
                            fontWeight: 700,
                            color: isFixedCapMode ? '#7c3aed' : 'var(--color-primary)',
                            cursor: 'pointer',
                            borderBottom: '1px dashed currentColor'
                          }}
                          title={isFixedCapMode ? "Click to edit Master Target Cap" : "Click to set a fixed Master Target Cap"}
                        >
                          {formatCurrency(effectiveTarget, currency)} {isFixedCapMode ? 'Master Cap' : 'Dynamic Target'} <Edit2 size={12} style={{ display: 'inline', marginLeft: '2px' }} />
                        </span>
                      )}
                    </>
                  )}
                </span>
              </h3>

              {/* Allocation Cushion Pill (Shown in Fixed Cap Mode) */}
              {isFixedCapMode && !isEditingTarget && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '16px',
                  backgroundColor: isOverAllocated ? 'rgba(220, 38, 38, 0.1)' : unallocatedCushion > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 0, 0, 0.05)',
                  color: isOverAllocated ? 'var(--color-red, #dc2626)' : unallocatedCushion > 0 ? 'var(--color-green, #10b981)' : 'var(--color-muted)',
                  border: `1px solid ${isOverAllocated ? 'rgba(220, 38, 38, 0.3)' : unallocatedCushion > 0 ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-border)'}`,
                }}>
                  {isOverAllocated ? (
                    <>
                      <AlertTriangle size={12} />
                      <span>Over-Allocated by {formatCurrency(Math.abs(allocationDifference), currency)}</span>
                    </>
                  ) : unallocatedCushion > 0 ? (
                    <>
                      <span style={{ fontSize: '0.8rem' }}>✨</span>
                      <span>+{formatCurrency(unallocatedCushion, currency)} Unallocated Cushion</span>
                    </>
                  ) : (
                    <span>✓ 100% of Cap Allocated</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* View Mode Switcher: Bar vs Donut */}
            <div style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-bg-subtle, rgba(0,0,0,0.04))',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-sm, 6px)',
              padding: '2px',
              gap: '2px',
            }}>
              <button
                type="button"
                onClick={() => handleMeterModeChange('bar')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.675rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: meterMode === 'bar' ? 'var(--color-primary)' : 'transparent',
                  color: meterMode === 'bar' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Linear Bar Progress View"
              >
                <TrendingUp size={12} />
                <span>BAR</span>
              </button>
              <button
                type="button"
                onClick={() => handleMeterModeChange('donut')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.675rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: meterMode === 'donut' ? 'var(--color-primary)' : 'transparent',
                  color: meterMode === 'donut' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Donut Chart Utilization View"
              >
                <PieChart size={12} />
                <span>DONUT</span>
              </button>
            </div>

            {meterMode === 'bar' && (
              <div style={styles.percentDisplay}>
                {isUnsetMode ? (
                  <span style={{ ...styles.percentValue, color: 'var(--color-primary)', fontSize: '0.9rem' }}>Unset</span>
                ) : (
                  <span style={{ ...styles.percentValue, color: meterBarColor }}>{percentUtilized}%</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Track / Donut Chart View */}
        {meterMode === 'donut' ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '1.25rem',
            padding: '0.75rem 0.5rem',
          }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--color-bg-subtle, #e2e8f0)"
                  strokeWidth="10"
                />
                {/* Progress Ring Arc */}
                {!isUnsetMode && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={meterBarColor}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(2 * Math.PI * 40) * (1 - Math.min(percentUtilized, 100) / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                )}
              </svg>
              {/* Donut Center Label */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: isUnsetMode ? '0.85rem' : '1.3rem',
                  fontWeight: 800,
                  color: meterBarColor,
                  lineHeight: 1.1,
                }}>
                  {isUnsetMode ? 'N/A' : `${percentUtilized}%`}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: 'var(--color-muted)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  {isOverallOverBudget ? 'OVER BUDGET' : (isUnsetMode ? 'UNSET' : 'UTILIZED')}
                </span>
              </div>
            </div>

            {/* Donut Side Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              flex: '1 1 300px',
            }}>
              <div style={styles.snapshotTile}>
                <span style={styles.snapshotTileLabel}>TOTAL BUDGET</span>
                <span style={styles.snapshotTileValue}>
                  {isUnsetMode ? 'No Limit' : formatCurrency(effectiveTarget, currency)}
                </span>
                <span style={styles.snapshotTileSub}>
                  {isUnsetMode ? 'No Hard Limit' : isFixedCapMode ? 'Fixed Master Cap' : 'Dynamic Category Sum'}
                </span>
              </div>
              <div style={styles.snapshotTile}>
                <span style={styles.snapshotTileLabel}>TOTAL SPENT</span>
                <span style={{ ...styles.snapshotTileValue, color: 'var(--color-primary)' }}>
                  {formatCurrency(totalActual, currency)}
                </span>
                <span style={styles.snapshotTileSub}>{expenses.length} purchase{expenses.length === 1 ? '' : 's'}</span>
              </div>
              <div style={styles.snapshotTile}>
                <span style={styles.snapshotTileLabel}>REMAINING</span>
                <span style={{
                  ...styles.snapshotTileValue,
                  color: isOverallOverBudget ? 'var(--color-red)' : 'var(--color-green, #10b981)'
                }}>
                  {isUnsetMode ? 'Open' : formatCurrency(Math.abs(overallHeadroom), currency)}
                </span>
                <span style={{
                  ...styles.snapshotTileSub,
                  color: isOverallOverBudget ? '#b91c1c' : '#15803d',
                  fontWeight: 700
                }}>
                  {isUnsetMode ? 'Tracking expenses' : isOverallOverBudget ? 'Over Budget' : 'Remaining Available'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Linear Progress Track */
          <div style={styles.progressTrack}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(percentUtilized, 100)}%`,
              backgroundColor: meterBarColor
            }} />
          </div>
        )}

        {/* Descriptive Text Status Row Directly Under the Progress Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: meterMode === 'donut' ? '0.35rem' : '0.5rem',
          paddingTop: '0.35rem',
          borderTop: '1px dotted var(--color-border)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ color: 'var(--color-muted)' }}>
            {isUnsetMode ? (
              <span><strong>{formatCurrency(totalActual, currency)}</strong> total spent across all categories (Unset Target Mode)</span>
            ) : (
              <span>
                <strong>{formatCurrency(totalActual, currency)}</strong> spent of <strong>{formatCurrency(effectiveTarget, currency)}</strong> {isFixedCapMode ? 'master cap' : 'target budget'}
                {isFixedCapMode && (
                  <span style={{ color: isOverAllocated ? 'var(--color-red)' : 'var(--color-muted)', marginLeft: '0.4rem' }}>
                    ({formatCurrency(totalEstimate, currency)} planned across categories)
                  </span>
                )}
              </span>
            )}
          </span>

          {!isUnsetMode && (
            isOverallOverBudget ? (
              <span style={{ color: 'var(--color-red, #dc2626)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={13} /> {formatCurrency(totalActual - effectiveTarget, currency)} OVER BUDGET
              </span>
            ) : (
              <span style={{ color: 'var(--color-green, #10b981)', fontWeight: 800 }}>
                {formatCurrency(overallHeadroom, currency)} REMAINING AVAILABLE
              </span>
            )
          )}
        </div>

        {/* Category Breakdown: Responsive Desktop Pills vs Mobile Chips */}
        {activeOrAlertStats.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {/* Desktop View: Compact Horizontal Pill/Chip List of Active or Alert Categories */}
            <div className="budget-desktop-pills-bar" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', fontWeight: 800, color: 'var(--color-muted)', letterSpacing: '0.06em' }}>
                  ACTIVE & ALERT CATEGORIES (SELECT TO VIEW DETAIL LEDGER)
                </span>
                {selectedCategoryId && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId('')}
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
                    RESET SELECTION
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                {activeOrAlertStats.length === 0 ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>
                    No active category budgets or expenses recorded yet. Select any category below to begin logging.
                  </span>
                ) : (
                  activeOrAlertStats.map(stat => {
                    const isSelected = effectiveSelectedCategoryId.toLowerCase() === stat.category.toLowerCase();
                    return (
                      <button
                        key={stat.category}
                        type="button"
                        onClick={() => setSelectedCategoryId(stat.category)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: isSelected
                            ? 'var(--color-primary)'
                            : (stat.isOver ? '#fee2e2' : 'var(--color-bg-subtle)'),
                          color: isSelected
                            ? 'var(--color-on-primary, #ffffff)'
                            : (stat.isOver ? '#b91c1c' : 'var(--color-text)'),
                          border: `1px solid ${isSelected
                            ? 'var(--color-primary)'
                            : (stat.isOver ? '#fca5a5' : 'var(--color-border)')
                            }`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                        }}
                      >
                        <span>{stat.category}</span>
                        {stat.isOver ? (
                          <span style={{
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            color: isSelected ? '#fecaca' : '#b91c1c',
                            backgroundColor: isSelected ? 'rgba(0,0,0,0.25)' : 'transparent',
                            padding: isSelected ? '1px 4px' : '0',
                            borderRadius: '3px',
                          }}>
                            +{formatCurrency(stat.overAmount, currency)}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.625rem',
                            opacity: isSelected ? 0.9 : 0.7,
                            fontVariantNumeric: 'tabular-nums',
                          }}>
                            {stat.percent}%
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Mobile View: Category Filter Chip Cloud */}
            <div className="budget-mobile-chips-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                {activeOrAlertStats.map(stat => {
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
                          <span style={styles.overBadgeMini}>+{formatCurrency(stat.overAmount, currency)}</span>
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
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* DESKTOP SPLIT VIEW: MASTER RAIL (LEFT ~5 COLS) & DETAIL (RIGHT ~7 COLS) */}
      {/* ============================================================ */}
      <div className="budget-desktop-split-view lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
        {/* Left Column: Master Rail */}
        <div className="budget-master-rail lg:col-span-5">
          {/* Fixed Rail Header & Filter Search Container */}
          <div className="budget-master-rail-fixed-header">
            {/* Rail Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-text)', margin: 0 }}>
                  📊 CATEGORY BUDGETS
                </h3>
                <span style={{ fontSize: '0.725rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                  {displayedMasterStats.length} budget categor{displayedMasterStats.length === 1 ? 'y' : 'ies'}
                </span>
              </div>
              <button
                type="button"
                style={{ ...styles.addButton, fontSize: '0.7rem', padding: '0.35rem 0.65rem' }}
                onClick={() => startAddBudget()}
                disabled={isSyncing}
                title="Add New Budget Category"
              >
                <Plus size={13} style={{ marginRight: '0.2rem' }} /> NEW CATEGORY
              </button>
            </div>

            {/* Master Category Search */}
            <div>
              <input
                type="text"
                placeholder="FILTER CATEGORIES..."
                value={masterCategorySearch}
                onChange={(e) => setMasterCategorySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>

          {/* Scrollable Master Category List */}
          <div className="budget-master-rail-list">
              {displayedMasterStats.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2.5rem 1rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--color-muted)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <ShoppingBag size={28} style={{ opacity: 0.4, color: 'var(--color-primary)' }} />
                  <span>{masterCategorySearch.trim() ? `No categories found matching "${masterCategorySearch}"` : 'No budget categories created yet.'}</span>
                  {!masterCategorySearch.trim() && (
                    <button
                      type="button"
                      onClick={() => startAddBudget()}
                      style={{ ...styles.addButton, fontSize: '0.725rem', padding: '0.35rem 0.65rem' }}
                    >
                      <Plus size={13} style={{ marginRight: '0.2rem' }} /> CREATE FIRST BUDGET
                    </button>
                  )}
                </div>
              ) : (
                displayedMasterStats.map(stat => {
                  const isSelected = effectiveSelectedCategoryId.toLowerCase() === stat.category.toLowerCase();
                  const cushion = stat.estimated - stat.actual;

                  return (
                    <div
                      key={stat.category}
                      onClick={() => setSelectedCategoryId(stat.category)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(13, 27, 42, 0.04)' : 'var(--color-surface)',
                        border: isSelected
                          ? '2px solid var(--color-primary)'
                          : (stat.isOver ? '1px solid var(--color-red)' : '1px solid var(--color-border)'),
                        boxShadow: isSelected ? '0 0 0 2px rgba(13, 27, 42, 0.12), var(--box-shadow-subtle)' : 'var(--box-shadow-subtle)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '0.85rem 1rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                        }}>
                          {stat.category}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {stat.isOver && (
                            <span style={styles.overBadgeCard}>
                              <AlertTriangle size={11} style={{ marginRight: '2px' }} /> +{formatCurrency(stat.overAmount, currency)}
                            </span>
                          )}
                          {/* Inline Edit and Delete Budget Category Controls */}
                          {stat.budgetItems.length > 0 ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => startEditBudget(stat.budgetItems[0])}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-muted)',
                                  cursor: 'pointer',
                                  padding: '2px 4px',
                                  borderRadius: '3px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                                title={`Edit ${stat.category} Budget`}
                                aria-label={`Edit ${stat.category} Budget`}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setItemToDelete(stat.budgetItems[0])}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-red, #ef4444)',
                                  cursor: 'pointer',
                                  padding: '2px 4px',
                                  borderRadius: '3px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                                title={`Delete ${stat.category} Budget`}
                                aria-label={`Delete ${stat.category} Budget`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startAddBudget(stat.category);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                fontSize: '0.625rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                textDecoration: 'underline',
                                padding: '2px 4px',
                              }}
                              title={`Set Budget for ${stat.category}`}
                            >
                              + Set Budget
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mini Track */}
                      <div style={{
                        height: '4px',
                        width: '100%',
                        backgroundColor: 'var(--color-bg-subtle)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(stat.percent, 100)}%`,
                          backgroundColor: stat.isOver ? 'var(--color-red)' : stat.percent > 90 ? 'var(--color-gold-dark)' : 'var(--color-green)'
                        }} />
                      </div>

                      {/* Numbers Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.35rem',
                        marginTop: '0.2rem',
                        fontSize: '0.725rem',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        <div>
                          <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.625rem', fontWeight: 700 }}>BUDGET</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(stat.estimated, currency)}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.625rem', fontWeight: 700 }}>SPENT</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(stat.actual, currency)}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.625rem', fontWeight: 700 }}>REMAINING</span>
                          <span style={{
                            fontWeight: 700,
                            color: cushion < 0 ? 'var(--color-red)' : 'var(--color-green, #10b981)',
                            fontVariantNumeric: 'tabular-nums'
                          }}>
                            {formatCurrency(cushion, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Card Sub-details */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.675rem',
                        color: 'var(--color-muted)',
                        fontFamily: 'var(--font-mono)',
                        borderTop: '1px dotted var(--color-border)',
                        paddingTop: '0.35rem',
                        marginTop: '0.15rem',
                      }}>
                        <span>{stat.expenseCount} logged expense{stat.expenseCount === 1 ? '' : 's'}</span>
                        <span>{stat.percent}% utilized</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        {/* Right Column: Detail Ledger */}
        <div className="budget-detail-ledger lg:col-span-7">
          {!effectiveSelectedCategoryId ? (
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-lg, 1rem)',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--box-shadow-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--color-muted)',
            }}>
              <DollarSign size={40} style={{ opacity: 0.35, color: 'var(--color-primary)' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: 0, color: 'var(--color-text)' }}>
                No Budget Categories Yet
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: 0 }}>
                Create your first budget category (e.g. Venue, Catering, Photography) to establish target allocations. Itemized receipts and expenses will line up under each category.
              </p>
              <button
                type="button"
                onClick={() => startAddBudget()}
                style={styles.addButton}
              >
                <Plus size={14} style={{ marginRight: '0.25rem' }} /> NEW BUDGET CATEGORY
              </button>
            </div>
          ) : (
            <>
              {/* 1. Dynamic Category Snapshot Header */}
              <div style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-lg, 1rem)',
                padding: '1.25rem 1.5rem',
                boxShadow: 'var(--box-shadow-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}>
                {/* Snapshot Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-muted)', letterSpacing: '0.08em' }}>
                        CATEGORY SNAPSHOT
                      </span>
                      {selectedCatStat.isOver && (
                        <span style={styles.overBadgeMini}>
                          OVER BUDGET (+{formatCurrency(selectedCatStat.overAmount, currency)})
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0.1rem 0 0' }}>
                      {effectiveSelectedCategoryId}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => startAddExpense(effectiveSelectedCategoryId)}
                      style={{ ...styles.addButton, color: 'var(--color-on-dark)' }}
                      disabled={isSyncing}
                    >
                      <Plus size={14} style={{ marginRight: '0.25rem' }} />ADD EXPENSE
                    </button>
                  </div>
                </div>

                {/* Snapshot 3-Metric Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div style={styles.snapshotTile}>
                    <span style={styles.snapshotTileLabel}>CATEGORY BUDGET</span>
                    <span style={styles.snapshotTileValue}>{formatCurrency(selectedCatStat.estimated, currency)}</span>
                    <span style={styles.snapshotTileSub}>
                      {selectedCatBudgetItems.length > 0 ? 'Allocated Target' : 'No Budget Set'}
                    </span>
                  </div>

                  <div style={styles.snapshotTile}>
                    <span style={styles.snapshotTileLabel}>TOTAL SPENT</span>
                    <span style={{ ...styles.snapshotTileValue, color: 'var(--color-primary)' }}>{formatCurrency(selectedCatExpensesTotal, currency)}</span>
                    <span style={styles.snapshotTileSub}>{selectedCatExpenses.length} purchase{selectedCatExpenses.length === 1 ? '' : 's'} recorded</span>
                  </div>

                  <div style={styles.snapshotTile}>
                    <span style={styles.snapshotTileLabel}>REMAINING</span>
                    <span style={{
                      ...styles.snapshotTileValue,
                      color: remainingCushion < 0 ? 'var(--color-red)' : 'var(--color-green, #10b981)'
                    }}>
                      {formatCurrency(remainingCushion, currency)}
                    </span>
                    <span style={{
                      ...styles.snapshotTileSub,
                      color: remainingCushion < 0 ? '#b91c1c' : '#15803d',
                      fontWeight: 700
                    }}>
                      {remainingCushion < 0 ? `Over Budget by ${formatCurrency(Math.abs(remainingCushion), currency)}` : 'Remaining Available'}
                    </span>
                  </div>
                </div>

                {/* Target Budget Breakdown Line Items if present */}
                {selectedCatBudgetItems.length > 0 ? (
                  <div style={{
                    borderTop: '1px dashed var(--color-border)',
                    paddingTop: '0.65rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', fontWeight: 800, color: 'var(--color-muted)' }}>
                        CATEGORY BUDGET ALLOCATION
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditBudget(selectedCatBudgetItems[0])}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        EDIT BUDGET
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                      {selectedCatBudgetItems.map(item => (
                        <div
                          key={item.itemId}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'var(--color-bg-subtle)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--border-radius-sm)',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.725rem',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>Budget:</span>
                          <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{formatCurrency(item.estimatedCost, currency)}</span>
                          <button
                            type="button"
                            onClick={() => startEditBudget(item)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              background: 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              color: 'var(--color-primary)',
                              padding: '2px 5px',
                              fontSize: '0.675rem',
                              fontWeight: 700,
                            }}
                            title="Edit Category Budget"
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              color: 'var(--color-red, #ef4444)',
                              padding: '2px 5px',
                              fontSize: '0.675rem',
                              fontWeight: 700,
                            }}
                            title="Delete Budget Category"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    borderTop: '1px dashed var(--color-border)',
                    paddingTop: '0.65rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                      No budget allocated to this category yet.
                    </span>
                    <button
                      type="button"
                      onClick={() => startAddBudget(effectiveSelectedCategoryId)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      <Plus size={12} /> SET BUDGET
                    </button>
                  </div>
                )}
              </div>

          {/* 2. Itemized Expenses Detail Table */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-lg, 1rem)',
            padding: '1.25rem',
            boxShadow: 'var(--box-shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-text)', margin: 0 }}>
                  ITEMIZED EXPENSES FOR {effectiveSelectedCategoryId.toUpperCase()}
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                  {displayedDetailExpenses.length} of {selectedCatExpenses.length} purchase{selectedCatExpenses.length === 1 ? '' : 's'}
                </span>
              </div>

              {selectedCatExpenses.length > 0 && (
                <input
                  type="text"
                  placeholder="SEARCH THIS CATEGORY..."
                  value={detailExpenseSearch}
                  onChange={(e) => setDetailExpenseSearch(e.target.value)}
                  style={{
                    padding: '0.35rem 0.6rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.725rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    width: '200px',
                  }}
                />
              )}
            </div>

            {/* Table or Empty State */}
            {displayedDetailExpenses.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px dashed var(--color-border)',
                borderRadius: 'var(--border-radius-md)',
                color: 'var(--color-muted)',
              }}>
                <ShoppingBag size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4, color: 'var(--color-primary)' }} />
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', margin: '0 0 0.35rem', color: 'var(--color-text)' }}>
                  No itemized expenses logged for {effectiveSelectedCategoryId}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0 0 1.25rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Record receipts, deposits, vendor retainers, and day-of purchases to monitor your actual costs against this category budget.
                </p>
                <button
                  type="button"
                  onClick={() => startAddExpense(effectiveSelectedCategoryId)}
                  style={{ ...styles.addButton, margin: '0 auto', color: 'var(--color-on-dark)' }}
                >
                  <Plus size={14} style={{ marginRight: '0.25rem' }} /> LOG FIRST EXPENSE
                </button>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>DESCRIPTION</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>AMOUNT</th>
                      <th style={styles.th}>PURCHASE DATE</th>
                      <th style={styles.th}>NOTES</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedDetailExpenses.map(exp => {
                      const amt = exp.amount ?? exp.actualCost ?? exp.amountPaid ?? 0;
                      return (
                        <tr key={exp.itemId} style={styles.tr}>
                          <td style={styles.td}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{exp.description}</span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <span style={{ ...styles.monoText, color: 'var(--color-primary)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                              {formatCurrency(amt, currency)}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ ...styles.monoText, fontVariantNumeric: 'tabular-nums' }}>{formatDateConsistent(exp.purchaseDate)}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{exp.notes || '-'}</span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <div style={styles.actionsCell}>
                              <button style={styles.actionBtn} onClick={() => startEditExpense(exp)} title="Edit Expense">
                                <Edit2 size={12} />
                              </button>
                              {onUpdateExpenses && (
                                <button
                                  style={{ ...styles.actionBtn, color: 'var(--color-red)' }}
                                  onClick={() => setExpenseToDelete(exp)}
                                  disabled={isSyncing}
                                  title="Delete Expense"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Footer Row */}
                    <tr style={styles.footerTr}>
                      <td style={{ ...styles.td, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        TOTAL FOR {effectiveSelectedCategoryId.toUpperCase()}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                        <span style={{ ...styles.monoText, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(displayedDetailExpenses.reduce((s, e) => s + (e.amount ?? e.actualCost ?? e.amountPaid ?? 0), 0), currency)}
                        </span>
                      </td>
                      <td colSpan={3} style={styles.td}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE INTERACTIVE CATEGORY LIST (< lg)                      */}
      {/* ============================================================ */}
      <div className="budget-mobile-stacked-view">
        {/* Mobile Category Explorer Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--color-text)', margin: 0 }}>
                📂 CATEGORY EXPENSES
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0.1rem 0 0' }}>
                Tap any category to view receipts, budgets & log expenses
              </p>
            </div>            <button
              type="button"
              onClick={() => startAddBudget(effectiveSelectedCategoryId)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.675rem',
                fontWeight: 700,
                padding: '0.35rem 0.65rem',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer'
              }}
              title="Add New Budget Category"
            >
              <Plus size={12} /> ADD BUDGET
            </button>
          </div>

          {/* Search and Quick Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="text"
                placeholder="SEARCH CATEGORIES..."
                value={mobileCategorySearch}
                onChange={(e) => setMobileCategorySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem 0.45rem 2rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
              <button
                type="button"
                onClick={() => setMobileFilterTab('all')}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.55rem',
                  borderRadius: '12px',
                  border: mobileFilterTab === 'all' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: mobileFilterTab === 'all' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: mobileFilterTab === 'all' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ALL ({categoryStats.filter(s => s.estimated > 0 || s.actual > 0 || s.expenseCount > 0).length})
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterTab('active')}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.55rem',
                  borderRadius: '12px',
                  border: mobileFilterTab === 'active' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: mobileFilterTab === 'active' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: mobileFilterTab === 'active' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ACTIVE ({categoryStats.filter(s => s.actual > 0 || s.expenseCount > 0).length})
              </button>
              {categoryStats.some(s => s.isOver) && (
                <button
                  type="button"
                  onClick={() => setMobileFilterTab('alerts')}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.55rem',
                    borderRadius: '12px',
                    border: '1px solid var(--color-red)',
                    backgroundColor: mobileFilterTab === 'alerts' ? 'var(--color-red)' : 'rgba(239, 68, 68, 0.1)',
                    color: mobileFilterTab === 'alerts' ? '#ffffff' : 'var(--color-red)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⚠️ OVER BUDGET ({categoryStats.filter(s => s.isOver).length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vertical 1-Column List of Category Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.15rem' }}>
          {displayedMobileStats.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              color: 'var(--color-muted)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)'
            }}>
              {mobileCategorySearch.trim()
                ? `No categories found matching "${mobileCategorySearch}"`
                : 'No budget categories created yet. Tap "ADD BUDGET" above to create your first budget category.'}
            </div>
          ) : (
            displayedMobileStats.map(stat => {
              const cushion = stat.estimated - stat.actual;
              return (
                <div
                  key={stat.category}
                  onClick={() => openBottomSheet(stat.category)}
                  className="mobile-category-card"
                  role="button"
                  tabIndex={0}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: stat.isOver ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--border-radius-lg, 1rem)',
                    padding: '0.85rem 1rem',
                    boxShadow: 'var(--box-shadow-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                  }}
                >
                  {/* Card Top Row: Category Title & Over/Percent Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: stat.isOver ? 'var(--color-red)' : 'var(--color-text)',
                    }}>
                      {stat.category}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {stat.isOver ? (
                        <span style={styles.overBadgeMini}>
                          <AlertTriangle size={11} style={{ marginRight: '2px' }} /> +{formatCurrency(stat.overAmount, currency)}
                        </span>
                      ) : stat.estimated > 0 ? (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--color-bg-subtle)',
                          color: stat.percent > 90 ? 'var(--color-gold-dark)' : 'var(--color-muted)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                        }}>
                          {stat.percent}%
                        </span>
                      ) : (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          color: 'var(--color-muted)',
                        }}>
                          No budget
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini Progress Bar */}
                  <div style={{
                    height: '4px',
                    width: '100%',
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(stat.percent, 100)}%`,
                      backgroundColor: stat.isOver ? 'var(--color-red)' : stat.percent > 90 ? 'var(--color-gold-dark)' : 'var(--color-green)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>

                  {/* Tabular 3-Metric Numbers Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.35rem',
                    fontSize: '0.725rem',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <div>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.6rem', fontWeight: 700 }}>BUDGET</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(stat.estimated, currency)}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.6rem', fontWeight: 700 }}>SPENT</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(stat.actual, currency)}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.6rem', fontWeight: 700 }}>REMAINING</span>
                      <span style={{
                        fontWeight: 700,
                        color: cushion < 0 ? 'var(--color-red)' : 'var(--color-green, #10b981)',
                        fontVariantNumeric: 'tabular-nums'
                      }}>
                        {formatCurrency(cushion, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Count of logged expenses & Chevron indicator */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px dotted var(--color-border)',
                    paddingTop: '0.35rem',
                    marginTop: '0.1rem',
                    fontSize: '0.7rem',
                    color: 'var(--color-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <ShoppingBag size={12} style={{ opacity: 0.6 }} />
                      {stat.expenseCount} logged expense{stat.expenseCount === 1 ? '' : 's'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                      View Details <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE CATEGORY DETAIL BOTTOM SHEET                           */}
      {/* ============================================================ */}
      {activeBottomSheetCategory && bottomSheetStat && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="mobile-bottom-sheet-backdrop"
            onClick={closeBottomSheet}
            style={{
              opacity: isSheetAnimating ? 1 : 0,
            }}
          />

          {/* Drawer Sheet Content */}
          <div
            className="mobile-bottom-sheet-container"
            style={{
              transform: isSheetAnimating ? 'translateY(0)' : 'translateY(100%)',
            }}
          >
            {/* Grab Handle */}
            <div className="mobile-bottom-sheet-handle" onClick={closeBottomSheet} />

            {/* Sheet Category Header */}
            <div style={{
              padding: '0.85rem 1.25rem 0.75rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              backgroundColor: 'var(--color-surface)',
            }}>
              {/* Top Bar: Category Name, Badges & Close Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
                    {bottomSheetStat.category}
                  </h3>
                  {bottomSheetStat.isOver && (
                    <span style={styles.overBadgeMini}>
                      OVER BUDGET (+{formatCurrency(bottomSheetStat.overAmount, currency)})
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeBottomSheet}
                  style={{
                    background: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 3-Metric Tiles Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div style={styles.snapshotTile}>
                  <span style={styles.snapshotTileLabel}>BUDGET</span>
                  <span style={styles.snapshotTileValue}>{formatCurrency(bottomSheetStat.estimated, currency)}</span>
                  <span style={styles.snapshotTileSub}>{bottomSheetStat.budgetItemCount} allocation{bottomSheetStat.budgetItemCount === 1 ? '' : 's'}</span>
                </div>

                <div style={styles.snapshotTile}>
                  <span style={styles.snapshotTileLabel}>TOTAL SPENT</span>
                  <span style={{ ...styles.snapshotTileValue, color: 'var(--color-primary)' }}>
                    {formatCurrency(bottomSheetExpensesTotal, currency)}
                  </span>
                  <span style={styles.snapshotTileSub}>{bottomSheetExpenses.length} purchase{bottomSheetExpenses.length === 1 ? '' : 's'}</span>
                </div>

                <div style={styles.snapshotTile}>
                  <span style={styles.snapshotTileLabel}>REMAINING</span>
                  <span style={{
                    ...styles.snapshotTileValue,
                    color: bottomSheetCushion < 0 ? 'var(--color-red)' : 'var(--color-green, #10b981)'
                  }}>
                    {formatCurrency(bottomSheetCushion, currency)}
                  </span>
                  <span style={{
                    ...styles.snapshotTileSub,
                    color: bottomSheetCushion < 0 ? '#b91c1c' : '#15803d',
                    fontWeight: 700
                  }}>
                    {bottomSheetCushion < 0 ? 'Over Budget' : 'Remaining Available'}
                  </span>
                </div>
              </div>

              {/* Category Budget Allocation (with mobile Edit and Delete actions) */}
              <div style={{
                borderTop: '1px dashed var(--color-border)',
                paddingTop: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.675rem', fontWeight: 800, color: 'var(--color-muted)' }}>
                    CATEGORY BUDGET ALLOCATION
                  </span>
                  {bottomSheetStat.budgetItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => startEditBudget(bottomSheetStat.budgetItems[0])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: '2px 4px',
                      }}
                    >
                      EDIT BUDGET
                    </button>
                  )}
                </div>

                {bottomSheetStat.budgetItems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {bottomSheetStat.budgetItems.map(item => (
                      <div
                        key={item.itemId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'var(--color-bg-subtle)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '0.4rem 0.65rem',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ color: 'var(--color-muted)' }}>Target:</span>
                          <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                            {formatCurrency(item.estimatedCost, currency)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => startEditBudget(item)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.675rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: 'var(--color-text)',
                            }}
                            title="Edit Target Budget"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.675rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: 'var(--color-red, #ef4444)',
                            }}
                            title="Delete Budget Category"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.5rem 0.65rem',
                  }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                      No budget allocated to {bottomSheetStat.category} yet.
                    </span>
                    <button
                      type="button"
                      onClick={() => startAddBudget(bottomSheetStat.category)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary, #ffffff)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.675rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={12} /> SET BUDGET
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Itemized Expense List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
            }}>
              {/* Optional Search if > 3 expenses */}
              {bottomSheetExpenses.length > 3 && (
                <div style={{ position: 'relative', width: '100%', marginBottom: '0.25rem' }}>
                  <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                  <input
                    type="text"
                    placeholder={`SEARCH ${bottomSheetStat.category.toUpperCase()} EXPENSES...`}
                    value={mobileExpenseSearch}
                    onChange={(e) => setMobileExpenseSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.6rem 0.35rem 1.8rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.725rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              )}

              {/* Expense Items or Empty State */}
              {filteredBottomSheetExpenses.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2.5rem 1rem',
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 'var(--border-radius-md)',
                  color: 'var(--color-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  margin: 'auto 0',
                }}>
                  <ShoppingBag size={32} style={{ opacity: 0.35, color: 'var(--color-primary)' }} />
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', margin: 0, color: 'var(--color-text)' }}>
                    No expenses logged for {bottomSheetStat.category}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0, maxWidth: '280px' }}>
                    Record vendor deposits, retainers, and receipts to monitor actual costs against this budget.
                  </p>
                </div>
              ) : (
                filteredBottomSheetExpenses.map(exp => {
                  const amt = exp.amount ?? exp.actualCost ?? exp.amountPaid ?? 0;
                  const isPaid = exp.amountPaid >= (amt > 0 ? amt : 1);
                  const isPartial = exp.amountPaid > 0 && exp.amountPaid < amt;
                  const status = (exp as any).paymentStatus || (isPaid ? 'Paid' : isPartial ? 'Partial' : 'Pending');

                  return (
                    <div
                      key={exp.itemId}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        boxShadow: 'var(--box-shadow-subtle)',
                      }}
                    >
                      {/* Line 1: Expense title/vendor (left, bold) and Amount (right, tabular bold) */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {exp.description}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(amt, currency)}
                        </span>
                      </div>

                      {/* Line 2: Date (left) and Status badge (right) */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: 'var(--color-muted)' }}>
                          {formatDateConsistent(exp.purchaseDate)}
                        </span>
                        <span className={
                          status === 'Paid' ? 'badge-green' :
                            status === 'Overdue' ? 'badge-red' :
                              'badge-gold'
                        } style={{ ...styles.statusTag, fontSize: '0.625rem', padding: '0.15rem 0.45rem' }}>
                          {status.toUpperCase()}
                        </span>
                      </div>

                      {/* Line 3: Notes & Action Buttons */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px dotted var(--color-border)',
                        paddingTop: '0.3rem',
                        marginTop: '0.1rem',
                        fontSize: '0.7rem',
                      }}>
                        <span style={{ color: 'var(--color-muted)', fontStyle: exp.notes ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          {exp.notes ? `📝 ${exp.notes}` : `Logged to ${bottomSheetStat.category}`}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => startEditExpense(exp)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              padding: '0.2rem',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Edit Expense"
                          >
                            <Edit2 size={13} />
                          </button>
                          {onUpdateExpenses && (
                            <button
                              type="button"
                              onClick={() => setExpenseToDelete(exp)}
                              disabled={isSyncing}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-red)',
                                cursor: 'pointer',
                                padding: '0.2rem',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Delete Expense"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Persistent Bottom Action Footer */}
            <div style={{
              padding: '0.75rem 1.25rem',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              flexShrink: 0,
            }}>
              <button
                type="button"
                onClick={() => startAddExpense(bottomSheetStat.category)}
                disabled={isSyncing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--border-radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary, #ffffff)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Plus size={16} strokeWidth={2.5} /> + Log Expense to {bottomSheetStat.category}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* BUDGET ITEM ADD/EDIT MODAL                                    */}
      {/* ============================================================ */}
      {(isAdding || editingItem) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-primary, #ffffff)' }} className="modalTitle">
                {editingItem ? 'EDIT BUDGET CATEGORY' : '+ NEW BUDGET CATEGORY'}
              </h3>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-primary, #ffffff)' }} className="closeBtn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => saveBudget(e, false)} style={styles.form}>
              <div style={styles.formBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>BUDGET CATEGORY</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <select
                      value={allCategories.includes(formState.category || '') ? formState.category : '__custom__'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__custom__') {
                          handleFormChange('category', '');
                        } else {
                          handleFormChange('category', val);
                        }
                      }}
                      style={styles.select}
                      required
                    >
                      <option value="" disabled>-- Select Wedding Category --</option>
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__custom__">+ Custom Category / Type New...</option>
                    </select>

                    {(!allCategories.includes(formState.category || '') || formState.category === '') && (
                      <input
                        type="text"
                        value={formState.category || ''}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        style={styles.input}
                        placeholder="Type custom category name..."
                        required
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>TARGET BUDGET ALLOCATION</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      position: 'absolute',
                      left: '0.85rem',
                      color: 'var(--color-primary)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}>
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={formState.estimatedCost !== undefined && formState.estimatedCost !== null ? formState.estimatedCost : ''}
                      onChange={(e) => handleFormChange('estimatedCost', e.target.value)}
                      onFocus={(e) => {
                        if (e.target.value === '0') handleFormChange('estimatedCost', '');
                        e.target.select();
                      }}
                      style={{ ...styles.input, paddingLeft: '2.2rem', fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}
                      min="1"
                      step="any"
                      placeholder="5000"
                      required
                      autoFocus={!!formState.category}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    Set the target budget for this category. Expense receipts will line up under this category.
                  </span>
                </div>
              </div>

              <div style={styles.formActions}>
                {editingItem && (
                  <button
                    type="button"
                    style={{
                      ...styles.cancelBtn,
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      marginRight: 'auto',
                    }}
                    onClick={() => {
                      const toDelete = editingItem;
                      closeModal();
                      setItemToDelete(toDelete);
                    }}
                  >
                    DELETE CATEGORY
                  </button>
                )}

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
                  {isSyncing ? 'SAVING...' : (editingItem ? 'UPDATE BUDGET' : 'SAVE BUDGET CATEGORY')}
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
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-primary, #ffffff)' }} className="modalTitle">
                {editingExpense ? 'EDIT EXPENSE' : '+ NEW EXPENSE'}
              </h3>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-primary, #ffffff)' }} className="closeBtn" onClick={closeExpenseModal}>
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
                        allCategories.includes(expenseFormState.category || '')
                          ? expenseFormState.category
                          : (expenseFormState.category ? '__custom__' : (activeOrAlertStats[0]?.category || allCategories[0] || 'General'))
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
                      {activeOrAlertStats.length > 0 && (
                        <optgroup label="Active Budget Categories">
                          {activeOrAlertStats.map(s => (
                            <option key={s.category} value={s.category}>
                              {s.category} (${s.estimated.toLocaleString('en-US')} budgeted)
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {allCategories.filter(cat => !activeOrAlertStats.some(s => s.category.toLowerCase() === cat.toLowerCase())).length > 0 && (
                        <optgroup label="Other Categories (No Active Budget)">
                          {allCategories
                            .filter(cat => !activeOrAlertStats.some(s => s.category.toLowerCase() === cat.toLowerCase()))
                            .map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </optgroup>
                      )}
                      <option value="__custom__">+ Add New / Custom Category...</option>
                    </select>

                    {(!allCategories.includes(expenseFormState.category || '') || expenseFormState.category === '') && (
                      <input
                        type="text"
                        value={expenseFormState.category || ''}
                        onChange={(e) => handleExpenseFormChange('category', e.target.value)}
                        style={styles.input}
                        placeholder="Type new category name..."
                        required
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>AMOUNT</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      position: 'absolute',
                      left: '0.75rem',
                      color: 'var(--color-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}>
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={expenseFormState.amount !== undefined && expenseFormState.amount !== null ? expenseFormState.amount : ''}
                      onChange={(e) => handleExpenseFormChange('amount', e.target.value)}
                      onFocus={(e) => {
                        if (e.target.value === '0') handleExpenseFormChange('amount', '');
                        e.target.select();
                      }}
                      style={{ ...styles.input, paddingLeft: '1.75rem' }}
                      min="0"
                      step="any"
                      placeholder="0.00"
                      required
                    />
                  </div>
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

      {/* Mobile Floating Action Button (FAB) with Speed-Dial */}
      <MobileFAB
        label="Add Financial Record"
        onClick={startAddExpense}
        subActions={[
          {
            label: '+ New Expense',
            onClick: startAddExpense,
            icon: ShoppingBag,
            color: 'var(--color-primary, #0f172a)',
          },
          {
            label: '+ New Budget Category',
            onClick: startAddBudget,
            icon: Plus,
            color: 'var(--color-surface, #ffffff)',
          },
        ]}
        disabled={isSyncing}
      />
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
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
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
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
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
    padding: '1.25rem 1.5rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    flexShrink: 0,
  },
  modalTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.95rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    margin: 0,
    color: 'var(--color-on-primary, #ffffff)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-on-primary, #ffffff)',
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
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    color: 'var(--color-text)',
  },
  select: {
    padding: '0.5rem 0.65rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
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
  },
  snapshotTile: {
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  snapshotTileLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 800,
    color: 'var(--color-muted)',
    letterSpacing: '0.06em',
  },
  snapshotTileValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--color-text)',
    fontVariantNumeric: 'tabular-nums',
  },
  snapshotTileSub: {
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    fontFamily: 'var(--font-mono)',
  },
};
