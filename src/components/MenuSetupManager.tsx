'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, DEFAULT_MENU_ITEMS } from '@/lib/menuData';
import { Guest } from '@/lib/sheets/types';
import { Utensils, Plus, Edit2, Trash2, Check, X, Leaf, ShieldAlert, Award, ChevronRight, RefreshCw } from 'lucide-react';

interface MenuSetupManagerProps {
  guests: Guest[];
  onOpenGuestRegistry?: () => void;
}

export default function MenuSetupManager({ guests, onOpenGuestRegistry }: MenuSetupManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'entree' | 'appetizer' | 'dessert'>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formState, setFormState] = useState<Partial<MenuItem>>({
    category: 'entree',
    name: '',
    description: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isNutFree: false,
  });

  // Load menu items from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('s2v_catering_menu');
    if (saved) {
      try {
        setMenuItems(JSON.parse(saved));
      } catch (e) {
        setMenuItems(DEFAULT_MENU_ITEMS);
      }
    } else {
      setMenuItems(DEFAULT_MENU_ITEMS);
    }
  }, []);

  // Save to localStorage when changed
  const saveMenuItemsToStorage = (items: MenuItem[]) => {
    setMenuItems(items);
    localStorage.setItem('s2v_catering_menu', JSON.stringify(items));
  };

  // Reset to default menu
  const handleResetDefault = () => {
    if (window.confirm('Reset menu items back to default sample menu?')) {
      saveMenuItemsToStorage(DEFAULT_MENU_ITEMS);
    }
  };

  // Calculate order counts from RSVPs & Guests
  const getItemGuestCount = (itemName: string) => {
    return guests.filter(g => g.rsvpStatus === 'Attending' && (g.mealChoice || '').toLowerCase() === itemName.toLowerCase()).length;
  };

  const startAdd = () => {
    setFormState({
      id: `menu-${Date.now()}`,
      category: 'entree',
      name: '',
      description: '',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isNutFree: false,
    });
    setIsAdding(true);
    setEditingItem(null);
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormState({ ...item });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      const updated = menuItems.filter(item => item.id !== id);
      saveMenuItemsToStorage(updated);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name?.trim()) return;

    const newItem: MenuItem = {
      id: formState.id || `menu-${Date.now()}`,
      category: formState.category || 'entree',
      name: formState.name.trim(),
      description: formState.description?.trim() || '',
      isVegetarian: !!formState.isVegetarian,
      isVegan: !!formState.isVegan,
      isGlutenFree: !!formState.isGlutenFree,
      isNutFree: !!formState.isNutFree,
    };

    if (editingItem) {
      const updated = menuItems.map(item => item.id === editingItem.id ? newItem : item);
      saveMenuItemsToStorage(updated);
    } else {
      saveMenuItemsToStorage([...menuItems, newItem]);
    }

    setIsAdding(false);
    setEditingItem(null);
  };

  const filteredItems = menuItems.filter(item => activeCategory === 'all' || item.category === activeCategory);

  const entrees = menuItems.filter(i => i.category === 'entree');
  const appetizers = menuItems.filter(i => i.category === 'appetizer');
  const desserts = menuItems.filter(i => i.category === 'dessert');

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ ...styles.title, color: 'var(--color-text)' }}>Catering & Menu Setup</h2>
          </div>
          <p style={styles.subtitle}>
            Configure your wedding menu offerings. Entrees defined here populate into guest RSVP meal selections.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleResetDefault}
            style={styles.secondaryBtn}
            title="Reset to default sample menu"
          >
            <RefreshCw size={14} style={{ marginRight: '4px' }} /> RESET SAMPLE MENU
          </button>
          <button type="button" onClick={startAdd} style={styles.primaryBtn}>
            <Plus size={16} style={{ marginRight: '4px' }} /> ADD MENU ITEM
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      <div style={styles.kpiBar}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>TOTAL ENTREES</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-primary)' }}>{entrees.length}</span>
          <span style={styles.kpiSub}>Custom Main Courses</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>APPETIZERS & HORS D'OEUVRES</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-purple)' }}>{appetizers.length}</span>
          <span style={styles.kpiSub}>Tray-Passed Options</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>DESSERT SELECTION</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-gold-dark)' }}>{desserts.length}</span>
          <span style={styles.kpiSub}>Cakes & Sweet Treats</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>ATTENDING RSVP ORDERS</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>
            {guests.filter(g => g.rsvpStatus === 'Attending').length}
          </span>
          <span style={styles.kpiSub}>Total Meals to Prepare</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterBar}>
        {[
          { id: 'all', label: 'ALL COURSES', count: menuItems.length },
          { id: 'entree', label: 'ENTREES (MAINS)', count: entrees.length },
          { id: 'appetizer', label: 'APPETIZERS', count: appetizers.length },
          { id: 'dessert', label: 'DESSERTS', count: desserts.length },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as any)}
            style={{
              ...styles.filterTab,
              backgroundColor: activeCategory === tab.id ? 'var(--color-primary)' : 'transparent',
              color: activeCategory === tab.id ? 'var(--color-on-primary)' : 'var(--color-text)',
              borderColor: activeCategory === tab.id ? 'var(--color-primary)' : 'var(--color-muted)'
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      <div style={styles.grid}>
        {filteredItems.map((item) => {
          const orderCount = getItemGuestCount(item.name);

          return (
            <div key={item.id} style={styles.menuCard}>
              <div style={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{
                    ...styles.categoryBadge,
                    backgroundColor: item.category === 'entree' ? 'var(--color-primary)' : item.category === 'appetizer' ? 'var(--color-purple)' : 'var(--color-amber)',
                    color: 'var(--color-on-dark)'
                  }}>
                    {item.category.toUpperCase()}
                  </span>

                  {item.isVegetarian && <span style={styles.dietBadge}>🌱 VEGETARIAN</span>}
                  {item.isVegan && <span style={styles.dietBadge}>🌿 VEGAN</span>}
                  {item.isGlutenFree && <span style={styles.dietBadge}>🌾 GLUTEN FREE</span>}
                  {item.isNutFree && <span style={styles.dietBadge}>🥜 NUT FREE</span>}
                </div>

                <div style={styles.actionGroup}>
                  <button style={styles.iconBtn} onClick={() => startEdit(item)} title="Edit Menu Item">
                    <Edit2 size={14} style={{ color: 'var(--color-text)' }} />
                  </button>
                  <button style={{ ...styles.iconBtn, color: 'var(--color-red)' }} onClick={() => handleDelete(item.id)} title="Delete Item">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 style={styles.itemTitle}>{item.name}</h3>
              {item.description && <p style={styles.itemDesc}>{item.description}</p>}

              {/* Bottom Order Counter */}
              <div style={styles.cardFooter}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Award size={14} style={{ color: orderCount > 0 ? 'var(--color-green)' : 'var(--color-muted)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: orderCount > 0 ? 'var(--color-green)' : 'var(--color-muted)' }}>
                    {orderCount} {orderCount === 1 ? 'Guest Order' : 'Guest Orders'}
                  </span>
                </div>

                {item.category === 'entree' && onOpenGuestRegistry && (
                  <button
                    type="button"
                    onClick={onOpenGuestRegistry}
                    style={styles.linkBtn}
                    title="View RSVPs in Guest Registry"
                  >
                    Guest List <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div style={styles.emptyState}>
            <Utensils size={36} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
            <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>No Menu Items Found</h4>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Add a new entree, appetizer, or dessert using the button above.
            </p>
          </div>
        )}
      </div>

      {/* ADD / EDIT MENU ITEM MODAL */}
      {(isAdding || editingItem) && (
        <div style={styles.modalOverlay} onClick={() => { setIsAdding(false); setEditingItem(null); }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-light)' }}>
                {isAdding ? 'ADD MENU ITEM' : `EDIT ITEM: ${editingItem?.name}`}
              </h3>
              <button
                style={{ ...styles.closeBtn, color: 'var(--color-on-light)' }}
                onClick={() => { setIsAdding(false); setEditingItem(null); }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>COURSE CATEGORY *</label>
                <select
                  value={formState.category || 'entree'}
                  onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value as any }))}
                  style={styles.select}
                >
                  <option value="entree">Entree (Main Course)</option>
                  <option value="appetizer">Appetizer / Hors d'oeuvre</option>
                  <option value="dessert">Dessert / Sweet Treat</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>DISH NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pan-Seared Salmon, Ribeye Steak"
                  value={formState.name || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>DESCRIPTION / INGREDIENTS</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Atlantic salmon served with lemon herb butter sauce and roasted asparagus..."
                  value={formState.description || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  style={styles.textarea}
                />
              </div>

              {/* Dietary Restriction Tags Checkboxes */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>DIETARY & ALLERGEN TAGS</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={!!formState.isVegetarian}
                      onChange={(e) => setFormState(prev => ({ ...prev, isVegetarian: e.target.checked }))}
                    />
                    🌱 Vegetarian
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={!!formState.isVegan}
                      onChange={(e) => setFormState(prev => ({ ...prev, isVegan: e.target.checked }))}
                    />
                    🌿 Vegan
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={!!formState.isGlutenFree}
                      onChange={(e) => setFormState(prev => ({ ...prev, isGlutenFree: e.target.checked }))}
                    />
                    🌾 Gluten Free
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={!!formState.isNutFree}
                      onChange={(e) => setFormState(prev => ({ ...prev, isNutFree: e.target.checked }))}
                    />
                    🥜 Nut Free
                  </label>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingItem(null); }}
                  style={styles.cancelBtn}
                >
                  CANCEL
                </button>
                <button type="submit" style={styles.submitBtn}>
                  <Check size={16} style={{ marginRight: '4px' }} /> SAVE MENU ITEM
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    marginTop: '0.25rem',
    margin: 0,
  },
  primaryBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  secondaryBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  kpiBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  kpiCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  kpiLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'var(--color-muted)',
  },
  kpiValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.75rem',
    fontWeight: 700,
    lineHeight: '1.2',
    marginTop: '0.25rem',
  },
  kpiSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
    marginTop: '0.5rem',
  },
  filterBar: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterTab: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  menuCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '2px solid var(--color-text)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  categoryBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 800,
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    letterSpacing: '0.05em',
  },
  dietBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'inline-flex',
    alignItems: 'center',
  },
  itemTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.15rem',
    fontWeight: 700,
    margin: '0 0 0.4rem 0',
    color: 'var(--color-text)',
  },
  itemDesc: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    margin: '0 0 1rem 0',
    lineHeight: '1.4',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.75rem',
    borderTop: '1px solid var(--color-border)',
    marginTop: 'auto',
  },
  linkBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: 0,
  },
  emptyState: {
    gridColumn: '1 / -1',
    backgroundColor: 'var(--color-surface)',
    border: '1px dashed var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '3rem 1rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '2px solid var(--color-text)',
    borderRadius: 'var(--border-radius-md)',
    width: '100%',
    maxWidth: '480px',
    boxShadow: 'var(--box-shadow-hover)',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: 'var(--color-bg-subtle)',
    borderBottom: '1px solid var(--color-border)',
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  form: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  input: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    padding: '0.55rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  select: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    padding: '0.55rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  textarea: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    padding: '0.55rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    resize: 'vertical',
  },
  checkboxLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer',
    color: 'var(--color-text)',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  cancelBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  submitBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
};
