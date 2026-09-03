'use client';

import React, { useState } from 'react';
import { Vendor, BudgetItem } from '@/lib/sheets/types';
import { Plus, Edit2, X, Trash2, Grid, List, Mail, Phone, Link2, AlertCircle, Printer, Upload, CheckCircle2, FileText } from 'lucide-react';
import VendorShareLinkManager from '@/components/VendorShareLinkManager';
import { formatCurrency } from '@/lib/currency';

interface VendorManagerProps {
  vendors: Vendor[];
  budget?: BudgetItem[];
  onUpdate: (updatedVendors: Vendor[]) => Promise<void>;
  onUpdateBudget?: (updatedBudget: BudgetItem[]) => Promise<void>;
  isSyncing: boolean;
  currency?: string;
  onOpenPrintStudio?: (template: 'place_cards' | 'table_cards' | 'timeline' | 'vendors') => void;
  spreadsheetId?: string;
  weddingName?: string;
  driveFolder?: string;
  onOpenShareModal?: () => void;
}

export default function VendorManager({ vendors, budget = [], onUpdate, onUpdateBudget, isSyncing, currency = 'USD', onOpenPrintStudio, spreadsheetId, weddingName, driveFolder, onOpenShareModal }: VendorManagerProps) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [editingItem, setEditingItem] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<Vendor>>({});
  const [isUploadingContract, setIsUploadingContract] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Search & Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Balance Due'>('All');

  const categories = Array.from(new Set(vendors.map(v => v.category).filter(Boolean)));

  // Financial summary KPI metrics
  const financialSummary = React.useMemo(() => {
    return vendors.reduce(
      (acc, v) => {
        acc.totalContracts += v.totalContractValue || 0;
        acc.totalDeposits += v.depositPaid || 0;
        acc.totalOwing += v.balanceOwing || 0;
        return acc;
      },
      { totalContracts: 0, totalDeposits: 0, totalOwing: 0 }
    );
  }, [vendors]);

  // Due Date Reminder status calculation helper [VND-2]
  const getDueDateReminder = (dueDateStr?: string, balanceOwing: number = 0) => {
    if (!dueDateStr || balanceOwing <= 0) return null;
    const dueDate = new Date(dueDateStr);
    if (isNaN(dueDate.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `OVERDUE (${Math.abs(diffDays)}d)`, isUrgent: true, days: diffDays };
    } else if (diffDays <= 30) {
      return { label: `DUE IN ${diffDays}d`, isUrgent: diffDays <= 7, days: diffDays };
    }
    return null;
  };

  const filteredVendors = vendors.filter(v => {
    const hasContent = Boolean(
      (v.vendorName && v.vendorName.trim() !== '') ||
      (v.contactName && v.contactName.trim() !== '') ||
      (v.category && v.category.trim() !== '') ||
      (v.emailAddress && v.emailAddress.trim() !== '') ||
      (v.phoneNumber && v.phoneNumber.trim() !== '') ||
      (v.totalContractValue && v.totalContractValue > 0)
    );
    if (!hasContent) return false;

    const matchesSearch = 
      (v.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.emailAddress || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || (v.category || '').toLowerCase() === categoryFilter.toLowerCase();

    const matchesPayment = 
      paymentFilter === 'All' ? true :
      paymentFilter === 'Paid' ? v.balanceOwing <= 0 :
      v.balanceOwing > 0;

    return matchesSearch && matchesCategory && matchesPayment;
  });

  const startAdd = () => {
    setFormState({
      category: '',
      vendorName: '',
      contactName: '',
      emailAddress: '',
      phoneNumber: '',
      totalContractValue: 0,
      depositPaid: 0,
      balanceOwing: 0,
      paymentDueDate: '',
      contractLink: '',
      staffMealsRequired: 'No',
    });
    setUploadError(null);
    setIsAdding(true);
    setEditingItem(null);
  };

  const startEdit = (item: Vendor) => {
    setFormState(item);
    setEditingItem(item);
    setUploadError(null);
    setIsAdding(false);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingItem(null);
    setUploadError(null);
    setFormState({});
  };

  const handleContractFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingContract(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendorName', formState.vendorName || 'Vendor');
      formData.append('driveFolder', driveFolder || 'Sheet2Vow');
      if (spreadsheetId) formData.append('spreadsheetId', spreadsheetId);

      const token = typeof window !== 'undefined' ? localStorage.getItem('s2v_google_token') : null;
      if (token) formData.append('accessToken', token);

      const res = await fetch('/api/upload/contract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.contractLink) {
        throw new Error(data.error || 'Failed to upload contract file to Google Drive.');
      }

      handleFormChange('contractLink', data.contractLink);
    } catch (err: any) {
      console.error('[Contract Upload Error]:', err);
      setUploadError(err?.message || 'Error uploading contract file to Google Drive.');
    } finally {
      setIsUploadingContract(false);
    }
  };

  const handleFormChange = (field: keyof Vendor, value: any) => {
    setFormState(prev => {
      const newState = { ...prev, [field]: value };
      
      // Auto-calculate balance owing if contract value or deposit changes
      if (field === 'totalContractValue' || field === 'depositPaid') {
        const total = field === 'totalContractValue' ? (Number(value) || 0) : (Number(prev.totalContractValue) || 0);
        const deposit = field === 'depositPaid' ? (Number(value) || 0) : (Number(prev.depositPaid) || 0);
        newState.balanceOwing = total - deposit;
      }
      
      return newState;
    });
  };

  const saveItem = async (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();
    if (isSyncing) return;

    let updatedVendors: Vendor[];
    let savedVendor: Vendor;

    if (isAdding) {
      const newItem: Vendor = {
        vendorId: `V${vendors.length + 1}`,
        vendorName: formState.vendorName || 'New Vendor',
        category: formState.category || 'General',
        contactName: formState.contactName || '',
        emailAddress: formState.emailAddress || '',
        phoneNumber: formState.phoneNumber || '',
        totalContractValue: formState.totalContractValue || 0,
        depositPaid: formState.depositPaid || 0,
        balanceOwing: formState.balanceOwing || 0,
        paymentDueDate: formState.paymentDueDate || '',
        contractLink: formState.contractLink || '',
        staffMealsRequired: formState.staffMealsRequired || 'No',
      };
      savedVendor = newItem;
      updatedVendors = [...vendors, newItem];
    } else {
      savedVendor = {
        ...(editingItem || {}),
        ...formState,
      } as Vendor;
      updatedVendors = vendors.map(item => 
        item.vendorId === editingItem?.vendorId ? savedVendor : item
      );
    }

    await onUpdate(updatedVendors);

    // Auto-sync financials with Budget Tracker tab [VND-BUDGET-SYNC]
    if (onUpdateBudget && savedVendor.vendorName) {
      const vendorNameClean = savedVendor.vendorName.trim().toLowerCase();
      const existingBudgetIdx = budget.findIndex(b => 
        (b.vendorName && b.vendorName.trim().toLowerCase() === vendorNameClean) ||
        (editingItem && b.vendorName && b.vendorName.trim().toLowerCase() === editingItem.vendorName.trim().toLowerCase())
      );

      const estimatedCost = Number(savedVendor.totalContractValue) || 0;
      const amountPaid = Number(savedVendor.depositPaid) || 0;
      const actualCost = Number(savedVendor.totalContractValue) || 0;
      const dueDate = savedVendor.paymentDueDate || '';
      const paymentStatus = (estimatedCost > 0 && amountPaid >= estimatedCost) ? 'Paid' : (amountPaid > 0 ? 'Partial' : 'Pending');

      let updatedBudgetList: BudgetItem[];
      if (existingBudgetIdx >= 0) {
        const existing = budget[existingBudgetIdx];
        const updatedBudgetItem: BudgetItem = {
          ...existing,
          category: savedVendor.category || existing.category || 'General',
          vendorName: savedVendor.vendorName,
          estimatedCost: estimatedCost > 0 ? estimatedCost : existing.estimatedCost,
          actualCost: actualCost > 0 ? actualCost : existing.actualCost,
          amountPaid: amountPaid,
          dueDate: dueDate || existing.dueDate,
          paymentStatus: paymentStatus,
        };
        updatedBudgetList = budget.map((b, i) => i === existingBudgetIdx ? updatedBudgetItem : b);
      } else if (estimatedCost > 0 || amountPaid > 0) {
        // Create new budget item for this vendor
        const newBudgetItem: BudgetItem = {
          itemId: `item-v-${savedVendor.vendorId || Date.now()}`,
          category: savedVendor.category || 'General',
          vendorName: savedVendor.vendorName,
          estimatedCost,
          actualCost,
          amountPaid,
          dueDate,
          paymentStatus,
        };
        updatedBudgetList = [newBudgetItem, ...budget];
      } else {
        updatedBudgetList = budget;
      }

      if (updatedBudgetList !== budget) {
        await onUpdateBudget(updatedBudgetList);
      }
    }
    
    if (continueAdding) {
      setFormState({
        vendorName: '',
        category: formState.category || 'General',
        contactName: '',
        emailAddress: '',
        phoneNumber: '',
        totalContractValue: 0,
        depositPaid: 0,
        balanceOwing: 0,
        paymentDueDate: '',
        contractLink: '',
        staffMealsRequired: 'No',
      });
      setIsAdding(true);
      setEditingItem(null);
    } else {
      closeModal();
    }
  };

  const confirmDeleteVendor = async () => {
    if (!vendorToDelete || isSyncing) return;
    const updated = vendors.filter(item => item.vendorId !== vendorToDelete.vendorId);
    await onUpdate(updated);

    if (onUpdateBudget && vendorToDelete.vendorName) {
      const vendorNameClean = vendorToDelete.vendorName.trim().toLowerCase();
      const updatedBudget = budget.filter(b => (b.vendorName || '').trim().toLowerCase() !== vendorNameClean);
      if (updatedBudget.length !== budget.length) {
        await onUpdateBudget(updatedBudget);
      }
    }

    setVendorToDelete(null);
  };

  return (
    <div style={styles.container}>
      {/* Scoped CSS for Mobile Header and View Toggle */}
      <style>{`
        .vendor-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .vendor-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .vendor-view-toggle {
          display: flex;
          border: 1px solid var(--color-muted);
          border-radius: var(--border-radius-sm);
          overflow: hidden;
          background-color: var(--color-surface);
          flex-shrink: 0;
        }
        .vendor-view-toggle button {
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
        @media (max-width: 640px) {
          .vendor-header-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .vendor-header-actions {
            display: flex !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
            width: 100% !important;
          }
          .vendor-view-toggle {
            flex-shrink: 0 !important;
          }
          .vendor-view-toggle button {
            padding: 0.45rem 0.75rem !important;
            min-width: 42px !important;
            min-height: 38px !important;
          }
          .vendor-action-btn {
            flex: 1 1 calc(50% - 0.25rem) !important;
            justify-content: center !important;
            min-height: 38px !important;
            padding: 0.5rem 0.75rem !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="vendor-header-container">
        <div>
          <h2 style={styles.title}>Vendors</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-sans)' }}>
            Track vendor contracts, contacts, payment schedules, balance owing, and staff meal requirements.
          </p>
        </div>
        <div className="vendor-header-actions">
          <div className="vendor-view-toggle">
            <button
              style={{ ...styles.toggleBtn, backgroundColor: viewMode === 'table' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'table' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)' }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              style={{ ...styles.toggleBtn, backgroundColor: viewMode === 'card' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'card' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)' }}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <Grid size={16} />
            </button>
          </div>
          {onOpenPrintStudio && (
            <button 
              className="vendor-action-btn"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'transparent',
                color: 'var(--color-text)',
                border: '1px solid var(--color-muted)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '0.5rem 0.875rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              onClick={() => onOpenPrintStudio('vendors')}
              title="Print Emergency Vendor Contact Directory"
            >
              <Printer size={15} style={{ marginRight: '0.35rem' }} /> PRINT ROSTER
            </button>
          )}
          <button className="vendor-action-btn" style={{ ...styles.addButton, color: 'var(--color-on-primary, #ffffff)' }} onClick={startAdd} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD VENDOR
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '0.75rem 0' }}>
        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-muted)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: 'var(--box-shadow-subtle)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            TOTAL CONTRACTS
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            {formatCurrency(financialSummary.totalContracts, currency)}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-muted)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: 'var(--box-shadow-subtle)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            TOTAL DEPOSITS PAID
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-green, #10b981)', marginTop: '0.25rem' }}>
            {formatCurrency(financialSummary.totalDeposits, currency)}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-muted)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: 'var(--box-shadow-subtle)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            TOTAL AMOUNT OWING
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-red, #ef4444)', marginTop: '0.25rem' }}>
            {formatCurrency(financialSummary.totalOwing, currency)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="SEARCH VENDORS, CATEGORY, OR CONTACT..."
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
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            style={styles.filterSelect}
          >
            <option value="All">ALL STATUSES</option>
            <option value="Paid">PAID IN FULL</option>
            <option value="Balance Due">BALANCE OWING</option>
          </select>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>VENDOR / CATEGORY</th>
                <th style={styles.th}>CONTACT</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>CONTRACT</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>DEPOSIT</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>OWING</th>
                <th style={styles.th}>DUE DATE</th>
                <th style={styles.th}>DETAILS</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((item, idx) => {
                const itemKey = (item.vendorId && item.vendorId.trim() !== '')
                  ? item.vendorId
                  : `vendor-${item.vendorName ? item.vendorName.replace(/\s+/g, '_') : 'item'}-${idx}`;
                return (
                  <tr key={itemKey} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.vendorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px' }}>{item.category}</div>
                    </td>
                    <td style={styles.td}>
                      <div>{item.contactName}</div>
                      {item.emailAddress && <a href={`mailto:${item.emailAddress}`} style={styles.link}>{item.emailAddress}</a>}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(item.totalContractValue, currency)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(item.depositPaid, currency)}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: item.balanceOwing > 0 ? 'var(--color-red, #ef4444)' : 'var(--color-text)' }}>
                      {formatCurrency(item.balanceOwing, currency)}
                    </td>
                    <td style={styles.td}>
                      {(() => {
                        const reminder = getDueDateReminder(item.paymentDueDate, item.balanceOwing);
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span>{item.paymentDueDate || '-'}</span>
                            {reminder && (
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                backgroundColor: reminder.isUrgent ? 'var(--color-red, #ef4444)' : 'var(--color-gold, #eab308)',
                                color: '#ffffff',
                                padding: '0.1rem 0.4rem',
                                borderRadius: 'var(--border-radius-sm)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                width: 'fit-content',
                              }}>
                                <AlertCircle size={10} style={{ marginRight: '0.2rem' }} /> {reminder.label}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td style={styles.td}>
                      {item.contractLink && <a href={item.contractLink} target="_blank" rel="noopener noreferrer" style={styles.iconLink}><Link2 size={14} /></a>}
                      {item.staffMealsRequired === 'Yes' && <span style={styles.pill}>Meals</span>}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button style={styles.actionBtn} onClick={() => startEdit(item)} title="Edit Vendor">
                        <Edit2 size={16} />
                      </button>
                      <button style={styles.actionBtn} onClick={() => setVendorToDelete(item)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={8} style={styles.emptyState}>No vendors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {filteredVendors.map((item, idx) => {
            const itemKey = (item.vendorId && item.vendorId.trim() !== '')
              ? item.vendorId
              : `vendor-${item.vendorName ? item.vendorName.replace(/\s+/g, '_') : 'item'}-${idx}`;
            return (
              <div key={itemKey} style={styles.card}>
              <div className="vendor-card-header" style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>{item.vendorName}</h3>
                  <span style={styles.cardCategory}>{item.category}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={styles.actionBtn} onClick={() => startEdit(item)}>
                    <Edit2 size={14} />
                  </button>
                  <button style={styles.actionBtn} onClick={() => setVendorToDelete(item)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardRow}>
                  <div style={styles.cardLabel}>CONTACT</div>
                  <div style={styles.cardValue}>
                    {item.contactName}
                    <div style={styles.contactLinks}>
                      {item.phoneNumber && (
                        <a href={`tel:${item.phoneNumber}`} style={styles.iconLink}><Phone size={12} /> {item.phoneNumber}</a>
                      )}
                      {item.emailAddress && (
                        <a href={`mailto:${item.emailAddress}`} style={styles.iconLink}><Mail size={12} /> Email</a>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-muted)' }}>
                  <div style={styles.cardCol}>
                    <div style={styles.cardLabel}>CONTRACT</div>
                    <div style={styles.cardValue}>{formatCurrency(item.totalContractValue, currency)}</div>
                  </div>
                  <div style={styles.cardCol}>
                    <div style={styles.cardLabel}>PAID</div>
                    <div style={styles.cardValue}>{formatCurrency(item.depositPaid, currency)}</div>
                  </div>
                  <div style={styles.cardCol}>
                    <div style={styles.cardLabel}>OWING</div>
                    <div style={{ ...styles.cardValue, fontWeight: 700, color: item.balanceOwing > 0 ? 'var(--color-red, #ef4444)' : 'var(--color-text)' }}>
                      {formatCurrency(item.balanceOwing, currency)}
                    </div>
                  </div>
                  <div>
                    <div style={styles.cardLabel}>DUE DATE</div>
                    <div style={styles.cardValue}>
                      {(() => {
                        const reminder = getDueDateReminder(item.paymentDueDate, item.balanceOwing);
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span>{item.paymentDueDate || '-'}</span>
                            {reminder && (
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                backgroundColor: reminder.isUrgent ? 'var(--color-red, #ef4444)' : 'var(--color-gold, #eab308)',
                                color: '#ffffff',
                                padding: '0.1rem 0.4rem',
                                borderRadius: 'var(--border-radius-sm)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                width: 'fit-content',
                              }}>
                                <AlertCircle size={10} style={{ marginRight: '0.2rem' }} /> {reminder.label}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-muted)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {item.contractLink && (
                      <a href={item.contractLink} target="_blank" rel="noopener noreferrer" style={styles.pillLink}>
                        <Link2 size={12} style={{ marginRight: '4px' }} /> Contract
                      </a>
                    )}
                    {item.staffMealsRequired === 'Yes' && <span style={styles.pill}>Meal Required</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
          {vendors.length === 0 && (
            <div style={styles.emptyState}>No vendors added yet.</div>
          )}
        </div>
      )}

      {/* Embedded Vendor Share Link Manager Section [VND-4] */}
      <div style={{ marginTop: '2rem' }}>
        <VendorShareLinkManager
          spreadsheetId={spreadsheetId || 'default-wedding'}
          weddingName={weddingName || 'Our Wedding'}
          onOpenShareModal={onOpenShareModal || (() => {})}
        />
      </div>

      {/* Modal Overlay for Add/Edit */}
      {(isAdding || editingItem) && (
        <div className="vendor-modal-overlay" style={styles.modalOverlay}>
          <style>{`
            @media (max-width: 640px) {
              .vendor-modal-overlay {
                padding: 0.5rem !important;
              }
              .vendor-modal-content {
                width: 100% !important;
                max-height: 92vh !important;
              }
              .vendor-form-grid {
                grid-template-columns: 1fr !important;
                gap: 0.75rem !important;
              }
            }
          `}</style>
          <div className="vendor-modal-content" style={styles.modalContent}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">{isAdding ? 'ADD VENDOR' : 'EDIT VENDOR'}</h3>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={saveItem} style={styles.form}>
              <div className="vendor-form-grid" style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Vendor Name</label>
                  <input
                    style={styles.input}
                    value={formState.vendorName || ''}
                    onChange={(e) => handleFormChange('vendorName', e.target.value)}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category</label>
                  <input
                    style={styles.input}
                    value={formState.category || ''}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    placeholder="e.g. Venue, Photography"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contact Name</label>
                  <input
                    style={styles.input}
                    value={formState.contactName || ''}
                    onChange={(e) => handleFormChange('contactName', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    style={styles.input}
                    type="email"
                    value={formState.emailAddress || ''}
                    onChange={(e) => handleFormChange('emailAddress', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    style={styles.input}
                    value={formState.phoneNumber || ''}
                    onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contract Value ($)</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={formState.totalContractValue !== undefined ? formState.totalContractValue : ''}
                    onChange={(e) => handleFormChange('totalContractValue', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Deposit Paid ($)</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={formState.depositPaid !== undefined ? formState.depositPaid : ''}
                    onChange={(e) => handleFormChange('depositPaid', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Balance Owing ($)</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={formState.balanceOwing !== undefined ? formState.balanceOwing : ''}
                    onChange={(e) => handleFormChange('balanceOwing', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Payment Due Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={formState.paymentDueDate || ''}
                    onChange={(e) => handleFormChange('paymentDueDate', e.target.value)}
                  />
                </div>
                <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ ...styles.label, margin: 0 }}>
                      📄 VENDOR CONTRACT DOCUMENT (PDF / IMAGE / DOC)
                    </label>
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                      Uploads to Google Drive &quot;Contracts&quot; Folder
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        style={{ ...styles.input, flex: 1 }}
                        type="url"
                        value={formState.contractLink || ''}
                        onChange={(e) => handleFormChange('contractLink', e.target.value)}
                        placeholder="Paste URL or upload file (e.g. https://drive.google.com/...)"
                      />
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.55rem 0.85rem',
                          backgroundColor: isUploadingContract ? 'var(--color-muted)' : 'var(--color-primary)',
                          color: 'var(--color-on-primary, #ffffff)',
                          borderRadius: 'var(--border-radius-sm)',
                          fontSize: '0.725rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          cursor: isUploadingContract ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                          border: 'none',
                        }}
                      >
                        <Upload size={14} />
                        <span>{isUploadingContract ? 'UPLOADING TO DRIVE...' : '📤 UPLOAD CONTRACT'}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                          style={{ display: 'none' }}
                          disabled={isUploadingContract}
                          onChange={handleContractFileUpload}
                        />
                      </label>
                    </div>

                    {formState.contractLink && (
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-green, #10b981)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <CheckCircle2 size={14} />
                        <span>Google Drive Contract Linked: </span>
                        <a href={formState.contractLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                          View Contract File ↗
                        </a>
                      </div>
                    )}

                    {uploadError && (
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-red, #ef4444)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <AlertCircle size={14} /> {uploadError}
                      </div>
                    )}
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                    <input
                      type="checkbox"
                      checked={formState.staffMealsRequired === 'Yes'}
                      onChange={(e) => handleFormChange('staffMealsRequired', e.target.checked ? 'Yes' : 'No')}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                    />
                    <span>Staff Meal Needed</span>
                  </label>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
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
                    onClick={(e) => saveItem(e, true)}
                  >
                    {isSyncing ? 'SAVING...' : 'SAVE & ADD NEW'}
                  </button>
                )}
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : (isAdding ? 'SAVE VENDOR' : 'SAVE CHANGES')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE VENDOR CONFIRMATION MODAL */}
      {vendorToDelete && (
        <div style={styles.modalOverlay} onClick={() => setVendorToDelete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE VENDOR CONFIRMATION
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setVendorToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to delete vendor <strong style={{ color: 'var(--color-red)' }}>"{vendorToDelete.vendorName}"</strong> ({vendorToDelete.category})?
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
                  onClick={() => setVendorToDelete(null)}
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
                  onClick={confirmDeleteVendor}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'DELETING...' : 'DELETE VENDOR'}
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
  container: {
    fontFamily: 'var(--font-sans)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-serif)',
    fontWeight: 600,
    color: 'var(--color-primary)',
    margin: 0,
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
    padding: '0.4rem 0.6rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  tableWrapper: {
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--box-shadow-subtle)',
    overflowX: 'auto',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px',
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    borderBottom: '2px solid var(--color-muted)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid var(--color-muted)',
  },
  td: {
    padding: '1rem',
    fontSize: '0.875rem',
    color: 'var(--color-text)',
    verticalAlign: 'top',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--color-muted)',
    fontStyle: 'italic',
  },
  link: {
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontSize: '0.75rem',
  },
  iconLink: {
    color: 'var(--color-primary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    textDecoration: 'none',
    fontSize: '0.75rem',
    marginRight: '0.5rem',
  },
  pill: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    backgroundColor: 'var(--color-highlight)',
    color: 'var(--color-text)',
    borderRadius: '12px',
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
  },
  pillLink: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.15rem 0.5rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    borderRadius: '12px',
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
    textDecoration: 'none',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--box-shadow-subtle)',
    border: '2px solid #000',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1rem',
    borderBottom: '1px solid var(--color-muted)',
    backgroundColor: '#0d1b2a14',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  cardCategory: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cardRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardLabel: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: '0.85rem',
    color: 'var(--color-text)',
  },
  contactLinks: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.25rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--border-radius-md)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    borderTopLeftRadius: 'var(--border-radius-md)',
    borderTopRightRadius: 'var(--border-radius-md)',
    flexShrink: 0,
  },
  modalTitle: {
    margin: 0,
    fontSize: '1rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    color: 'var(--color-on-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-on-primary)',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
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
    gap: '1rem',
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
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
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    padding: '0.875rem 1.5rem',
    borderTop: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-bg)',
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid var(--color-muted)',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
  },
  saveBtn: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    padding: '0.5rem 1.5rem',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
  }
};
