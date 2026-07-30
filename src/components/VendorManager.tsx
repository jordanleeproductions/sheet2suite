'use client';

import React, { useState } from 'react';
import { Vendor } from '@/lib/sheets/types';
import { Plus, Edit2, X, Trash2, Grid, List, Mail, Phone, Link2, AlertCircle } from 'lucide-react';

interface VendorManagerProps {
  vendors: Vendor[];
  onUpdate: (updatedVendors: Vendor[]) => Promise<void>;
  isSyncing: boolean;
}

export default function VendorManager({ vendors, onUpdate, isSyncing }: VendorManagerProps) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [editingItem, setEditingItem] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<Vendor>>({});

  // Search & Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Balance Due'>('All');

  const categories = Array.from(new Set(vendors.map(v => v.category).filter(Boolean)));

  const filteredVendors = vendors.filter(v => {
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
    setIsAdding(true);
    setEditingItem(null);
  };

  const startEdit = (item: Vendor) => {
    setFormState(item);
    setEditingItem(item);
    setIsAdding(false);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormState({});
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
      
      if (field === 'totalContractValue' || field === 'depositPaid' || field === 'balanceOwing') {
        newState[field] = Number(value) || 0;
      }
      return newState;
    });
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;

    let updatedVendors: Vendor[];
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
      updatedVendors = [...vendors, newItem];
    } else {
      updatedVendors = vendors.map(item => 
        item.vendorId === editingItem?.vendorId ? { ...item, ...formState } as Vendor : item
      );
    }

    await onUpdate(updatedVendors);
    closeModal();
  };

  const confirmDeleteVendor = async () => {
    if (!vendorToDelete || isSyncing) return;
    const updated = vendors.filter(item => item.vendorId !== vendorToDelete.vendorId);
    await onUpdate(updated);
    setVendorToDelete(null);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Vendor Management</h2>
        <div style={styles.headerActions}>
          <div style={styles.viewToggle}>
            <button
              style={{ ...styles.toggleBtn, backgroundColor: viewMode === 'table' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'table' ? '#000000' : 'var(--color-muted)' }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              style={{ ...styles.toggleBtn, backgroundColor: viewMode === 'card' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'card' ? '#000000' : 'var(--color-muted)' }}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <Grid size={16} />
            </button>
          </div>
          <button style={{ ...styles.addButton, color: '#000000' }} onClick={startAdd} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD VENDOR
          </button>
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
              {filteredVendors.map((item) => (
                <tr key={item.vendorId} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.vendorName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px' }}>{item.category}</div>
                  </td>
                  <td style={styles.td}>
                    <div>{item.contactName}</div>
                    {item.emailAddress && <a href={`mailto:${item.emailAddress}`} style={styles.link}>{item.emailAddress}</a>}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>${item.totalContractValue.toLocaleString()}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>${item.depositPaid.toLocaleString()}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>${item.balanceOwing.toLocaleString()}</td>
                  <td style={styles.td}>{item.paymentDueDate || '-'}</td>
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
              ))}
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
          {filteredVendors.map((item) => (
            <div key={item.vendorId} style={styles.card}>
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
                  <div>
                    <div style={styles.cardLabel}>CONTRACT</div>
                    <div style={styles.cardValue}>${item.totalContractValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={styles.cardLabel}>DEPOSIT</div>
                    <div style={styles.cardValue}>${item.depositPaid.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={styles.cardLabel}>OWING</div>
                    <div style={{ ...styles.cardValue, fontWeight: 700 }}>${item.balanceOwing.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={styles.cardLabel}>DUE DATE</div>
                    <div style={styles.cardValue}>{item.paymentDueDate || '-'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-muted)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {item.contractLink && (
                      <a href={item.contractLink} target="_blank" rel="noopener noreferrer" style={styles.pillLink}>
                        <Link2 size={12} style={{ marginRight: '4px' }} /> Contract
                      </a>
                    )}
                    {item.staffMealsRequired === 'Yes' && <span style={styles.pill}>Needs Meal</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {vendors.length === 0 && (
            <div style={styles.emptyState}>No vendors added yet.</div>
          )}
        </div>
      )}

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
              <h3 style={{ ...styles.modalTitle, color: '#000000' }} className="modalTitle">{isAdding ? 'ADD VENDOR' : 'EDIT VENDOR'}</h3>
              <button style={{ ...styles.closeBtn, color: '#000000' }} className="closeBtn" onClick={closeModal}><X size={20} /></button>
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
                    value={formState.totalContractValue || 0}
                    onChange={(e) => handleFormChange('totalContractValue', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Deposit Paid ($)</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={formState.depositPaid || 0}
                    onChange={(e) => handleFormChange('depositPaid', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Balance Owing ($)</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={formState.balanceOwing || 0}
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
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contract Link (URL)</label>
                  <input
                    style={styles.input}
                    type="url"
                    value={formState.contractLink || ''}
                    onChange={(e) => handleFormChange('contractLink', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Staff Meals Required</label>
                  <select
                    style={styles.select}
                    value={formState.staffMealsRequired || 'No'}
                    onChange={(e) => handleFormChange('staffMealsRequired', e.target.value)}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>CANCEL</button>
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : 'SAVE VENDOR'}
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
