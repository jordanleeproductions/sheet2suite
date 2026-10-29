'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, DEFAULT_MENU_ITEMS, generateNextMenuItemId } from '@/lib/menuData';
import { Guest } from '@/lib/sheets/types';
import { Utensils, Plus, Edit2, Trash2, Check, X, Leaf, ShieldAlert, Award, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';
import MobileFAB from '@/components/MobileFAB';
import { calculateRelationalCateringSummary } from '@/lib/sheets/relationalSync';
import PageHeaderCard from '@/components/vow/PageHeaderCard';
import PageMetricStrip from '@/components/vow/PageMetricStrip';
import SlideOverDrawer from '@/components/vow/SlideOverDrawer';
import { DrawerSection, DrawerField, DrawerRow } from '@/components/vow/MonarchForm';

interface MenuSetupManagerProps {
  guests: Guest[];
  catering?: MenuItem[];
  onUpdateCatering?: (updatedItems: MenuItem[]) => Promise<void>;
  onUpdateGuests?: (updatedGuests: Guest[]) => Promise<void>;
  onOpenGuestRegistry?: (mealFilter?: string, dietFilter?: string) => void;
  isSyncing?: boolean;
}

export default function MenuSetupManager({ guests, catering, onUpdateCatering, onUpdateGuests, onOpenGuestRegistry, isSyncing }: MenuSetupManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(catering && catering.length > 0 ? catering : DEFAULT_MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState<'all' | 'entree' | 'appetizer' | 'dessert'>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Synchronize when catering prop updates from sheets
  useEffect(() => {
    if (catering && catering.length > 0) {
      setMenuItems(catering);
      try {
        localStorage.setItem('s2v_catering_menu', JSON.stringify(catering));
      } catch (e) {}
    } else {
      const saved = localStorage.getItem('s2v_catering_menu');
      if (saved) {
        try {
          setMenuItems(JSON.parse(saved));
        } catch (e) {
          setMenuItems(DEFAULT_MENU_ITEMS);
        }
      }
    }
  }, [catering]);

  // Form State
  const [formState, setFormState] = useState<Partial<MenuItem>>({
    category: 'entree',
    name: '',
    description: '',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isNutFree: false,
    isGuestChoice: true,
  });

  // Save to state, localStorage and 2-way Google Sheets sync
  const saveMenuItemsToStorage = (items: MenuItem[]) => {
    setMenuItems(items);
    localStorage.setItem('s2v_catering_menu', JSON.stringify(items));
    if (onUpdateCatering) {
      onUpdateCatering(items).catch(err => console.error('Error syncing catering to Google Sheets:', err));
    }
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
      id: generateNextMenuItemId(menuItems),
      category: 'entree',
      name: '',
      description: '',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isNutFree: false,
      isGuestChoice: true,
    });
    setIsAdding(true);
    setEditingItem(null);
  };

  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormState({ ...item, isGuestChoice: item.isGuestChoice !== false });
    setIsAdding(false);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const updated = menuItems.filter(item => item.id !== itemToDelete.id);
    saveMenuItemsToStorage(updated);
    setItemToDelete(null);
  };

  const handleSave = (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();
    if (!formState.name?.trim()) {
      alert('Please enter a Menu Item Name.');
      return;
    }

    const newItem: MenuItem = {
      id: editingItem ? editingItem.id : (formState.id || generateNextMenuItemId(menuItems)),
      category: formState.category || 'entree',
      name: formState.name.trim(),
      description: formState.description?.trim() || '',
      isVegetarian: !!formState.isVegetarian,
      isVegan: !!formState.isVegan,
      isGlutenFree: !!formState.isGlutenFree,
      isNutFree: !!formState.isNutFree,
      isGuestChoice: formState.isGuestChoice !== false,
    };

    if (editingItem) {
      const oldName = editingItem.name;
      const newName = newItem.name;

      // Auto-update guests who selected this dish if the name changed
      if (oldName !== newName && onUpdateGuests) {
        const affectedGuests = guests.filter(g => (g.mealChoice || '').trim().toLowerCase() === oldName.trim().toLowerCase());
        if (affectedGuests.length > 0) {
          const updatedGuests = guests.map(g => {
            if ((g.mealChoice || '').trim().toLowerCase() === oldName.trim().toLowerCase()) {
              return { ...g, mealChoice: newName };
            }
            return g;
          });
          onUpdateGuests(updatedGuests).catch(err => console.error('Error auto-updating guest meal choices:', err));
        }
      }

      const updated = menuItems.map(item => item.id === editingItem.id ? newItem : item);
      saveMenuItemsToStorage(updated);
    } else {
      saveMenuItemsToStorage([...menuItems, newItem]);
    }

    if (continueAdding) {
      const updatedList = [...menuItems, newItem];
      setFormState({
        id: generateNextMenuItemId(updatedList),
        category: formState.category || 'entree',
        name: '',
        description: '',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isNutFree: false,
        isGuestChoice: true,
      });
      setIsAdding(true);
      setEditingItem(null);
    } else {
      setIsAdding(false);
      setEditingItem(null);
    }
  };

  const filteredItems = menuItems.filter(item => activeCategory === 'all' || item.category === activeCategory);

  const currentDishIndex = editingItem ? filteredItems.findIndex(i => i.id === editingItem.id) : -1;
  const handleNavigateAdjacentDish = (offset: number) => {
    if (currentDishIndex < 0) return;
    const targetIdx = currentDishIndex + offset;
    if (targetIdx >= 0 && targetIdx < filteredItems.length) {
      const nextDish = filteredItems[targetIdx];
      startEdit(nextDish);
    }
  };

  const entrees = menuItems.filter(i => i.category === 'entree');
  const appetizers = menuItems.filter(i => i.category === 'appetizer');
  const desserts = menuItems.filter(i => i.category === 'dessert');
  const guestSelectionEntrees = entrees.filter(i => i.isGuestChoice !== false);

  const relationalSummary = React.useMemo(() => calculateRelationalCateringSummary(guests, []), [guests]);
  const dietaryBreakdown = relationalSummary.dietaryBreakdown;

  return (
    <div style={styles.container}>
      {/* Standardized Header Banner */}
      <PageHeaderCard
        title="Catering & Menu Setup"
        subtitle="Configure your wedding menu offerings. Entrees defined here populate into guest RSVP meal selections."
        badge={`${menuItems.length} Offerings`}
        actionButtons={
          <>
            <button
              type="button"
              className="s2v-header-btn s2v-header-btn-secondary"
              onClick={handleResetDefault}
              title="Reset to default sample menu"
            >
              <RefreshCw size={14} />
              <span>RESET SAMPLES</span>
            </button>
            <button
              type="button"
              className="s2v-header-btn s2v-header-btn-primary"
              onClick={startAdd}
              disabled={isSyncing}
              title="Add Menu Item"
            >
              <Plus size={14} />
              <span>ADD MENU ITEM</span>
            </button>
          </>
        }
      />

      <style>{`
        .entree-kpi-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .entree-kpi-card:hover {
          border-color: var(--color-primary) !important;
          box-shadow: var(--box-shadow-hover) !important;
          transform: translateY(-2px);
        }
        .entree-kpi-card:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Monarch-Style Hero Metric Strip */}
      <PageMetricStrip
        style={{ marginBottom: '1.25rem' }}
        metrics={[
          {
            id: 'entrees',
            label: 'MAIN COURSES',
            value: entrees.length,
            subtext: 'Custom main courses',
            statusBadge: `${entrees.length} Options`,
            statusColor: 'blue',
          },
          {
            id: 'appetizers',
            label: 'APPETIZERS',
            value: appetizers.length,
            subtext: "Tray-passed & hors d'oeuvres",
            statusColor: 'purple',
          },
          {
            id: 'desserts',
            label: 'DESSERT SELECTION',
            value: desserts.length,
            subtext: 'Cakes & sweets',
            statusColor: 'amber',
          },
          {
            id: 'meals',
            label: 'CONFIRMED MEALS',
            value: guests.filter(g => g.rsvpStatus === 'Attending').length,
            subtext: 'Total meals to prepare',
            statusBadge: 'Attending',
            statusColor: 'green',
          },
        ]}
      />

      {/* Guest Selection Entree Breakdown Cards */}
      {guestSelectionEntrees.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              GUEST SELECTION ENTREE ORDERS
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--color-muted)',
              fontStyle: 'italic'
            }}>
              Click any entree card to view matching guests in Guest List
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}>
            {guestSelectionEntrees.map((item) => {
              const count = getItemGuestCount(item.name);
              return (
                <div
                  key={item.id || item.name}
                  onClick={() => onOpenGuestRegistry && onOpenGuestRegistry(item.name)}
                  className="entree-kpi-card"
                  style={{
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    border: '1px solid var(--color-muted)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: 'var(--box-shadow-subtle)',
                  }}
                  title={`Click to filter Guest List for "${item.name}"`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      lineHeight: 1.3
                    }}>
                      {item.name}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-bg-subtle, rgba(0,0,0,0.05))',
                      color: 'var(--color-primary)',
                      flexShrink: 0
                    }}>
                      <ChevronRight size={13} />
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: count > 0 ? 'var(--color-primary)' : 'var(--color-muted)',
                      lineHeight: 1
                    }}>
                      {count}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--color-muted)'
                    }}>
                      {count === 1 ? 'Guest Order' : 'Guest Orders'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Guest Dietary Restrictions Breakdown Cards */}
      {dietaryBreakdown.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              GUEST DIETARY RESTRICTIONS
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--color-muted)',
              fontStyle: 'italic'
            }}>
              Click any restriction card to view matching guests in Guest List
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}>
            {dietaryBreakdown.map((item) => (
              <div
                key={item.restriction}
                onClick={() => onOpenGuestRegistry && onOpenGuestRegistry(undefined, item.restriction)}
                className="entree-kpi-card"
                style={{
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: 'var(--box-shadow-subtle)',
                }}
                title={`Click to filter Guest List for "${item.restriction}"`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    lineHeight: 1.3
                  }}>
                    ⚠️ {item.restriction.toUpperCase()}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--color-red, #ef4444)',
                    flexShrink: 0
                  }}>
                    <ChevronRight size={13} />
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.75rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--color-red, #ef4444)',
                    lineHeight: 1
                  }}>
                    {item.count}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'var(--color-muted)'
                  }}>
                    {item.count === 1 ? 'Guest Tag' : 'Guest Tags'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

                  {item.isGuestChoice !== false && (
                    <span style={{
                      ...styles.categoryBadge,
                      backgroundColor: 'var(--color-green)',
                      color: 'var(--color-on-dark)'
                    }}>
                      ✓ GUEST CHOICE
                    </span>
                  )}
                </div>

                <div style={styles.actionGroup}>
                  <button style={styles.iconBtn} onClick={() => startEdit(item)} title="Edit Menu Item">
                    <Edit2 size={14} style={{ color: 'var(--color-text)' }} />
                  </button>
                  <button style={{ ...styles.iconBtn, color: 'var(--color-red)' }} onClick={() => handleDeleteClick(item)} title="Delete Item">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Dietary Tags on Separate Row */}
              {(item.isVegetarian || item.isVegan || item.isGlutenFree || item.isNutFree) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  {item.isVegetarian && <span style={styles.dietBadge}>🌱 VEGETARIAN</span>}
                  {item.isVegan && <span style={styles.dietBadge}>🌿 VEGAN</span>}
                  {item.isGlutenFree && <span style={styles.dietBadge}>🌾 GLUTEN FREE</span>}
                  {item.isNutFree && <span style={styles.dietBadge}>🥜 NUT FREE</span>}
                </div>
              )}

              <h3 style={styles.itemTitle}>{item.name}</h3>
              {item.description && <p style={styles.itemDesc}>{item.description}</p>}

              {/* Bottom Order Counter */}
              <div style={styles.cardFooter}>
                {item.isGuestChoice !== false ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={14} style={{ color: orderCount > 0 ? 'var(--color-green)' : 'var(--color-muted)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: orderCount > 0 ? 'var(--color-green)' : 'var(--color-muted)' }}>
                      {orderCount} {orderCount === 1 ? 'Guest Order' : 'Guest Orders'}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                      Buffet / Shared Course
                    </span>
                  </div>
                )}

                {item.category === 'entree' && item.isGuestChoice !== false && onOpenGuestRegistry && (
                  <button
                    type="button"
                    onClick={() => onOpenGuestRegistry(item.name)}
                    style={styles.linkBtn}
                    title={`View RSVPs for ${item.name} in Guest List`}
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

      {/* Slide-Over Menu Item Inspector [Monarch UX] */}
      <SlideOverDrawer
        isOpen={Boolean(isAdding || editingItem)}
        onClose={() => { setIsAdding(false); setEditingItem(null); }}
        title={isAdding ? 'Add Menu Offering' : (formState.name || 'Edit Menu Item')}
        subtitle={editingItem ? `${(formState.category || 'entree').toUpperCase()} · ${formState.isGuestChoice !== false ? 'Guest Choice Dish' : 'Buffet / Shared'}` : 'Configure wedding menu offering'}
        badge="MENU ITEM"
        badgeColor="#10B981"
        hasPrevious={currentDishIndex > 0}
        hasNext={currentDishIndex >= 0 && currentDishIndex < filteredItems.length - 1}
        onPrevious={() => handleNavigateAdjacentDish(-1)}
        onNext={() => handleNavigateAdjacentDish(1)}
        width="520px"
        footer={
          (() => {
            const isMenuFormValid = Boolean((formState.name || '').trim());
            const isDisabled = !isMenuFormValid || Boolean(isSyncing);
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
                {!isAdding && editingItem ? (
                  <button
                    type="button"
                    style={styles.deleteBtn}
                    onClick={() => handleDeleteClick(editingItem)}
                    title="Delete menu item"
                  >
                    DELETE
                  </button>
                ) : (
                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={() => { setIsAdding(false); setEditingItem(null); }}
                  >
                    CANCEL
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!isAdding && (
                    <button
                      type="button"
                      style={styles.cancelBtn}
                      onClick={() => { setIsAdding(false); setEditingItem(null); }}
                    >
                      CANCEL
                    </button>
                  )}
                  {isAdding && (
                    <button
                      type="button"
                      onClick={(e) => handleSave(e, true)}
                      style={{
                        ...styles.submitBtn,
                        backgroundColor: 'transparent',
                        color: isDisabled ? 'var(--color-muted, #94A3B8)' : 'var(--color-primary, #0F172A)',
                        border: `1px solid ${isDisabled ? 'var(--color-border, #CBD5E1)' : 'var(--color-primary, #0F172A)'}`,
                        opacity: isDisabled ? 0.45 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                      disabled={isDisabled}
                      title={!isMenuFormValid ? 'Enter Dish Name to enable saving' : undefined}
                    >
                      SAVE & ADD NEW
                    </button>
                  )}
                  <button
                    type="submit"
                    form="menu-inspector-form"
                    style={{
                      ...styles.submitBtn,
                      backgroundColor: isDisabled ? 'var(--color-muted, #94A3B8)' : 'var(--color-primary)',
                      color: '#ffffff',
                      opacity: isDisabled ? 0.45 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isDisabled}
                    title={!isMenuFormValid ? 'Enter Dish Name to enable saving' : undefined}
                  >
                    <Check size={14} style={{ marginRight: '4px' }} />
                    <span>{isSyncing ? 'SAVING...' : (isAdding ? 'SAVE MENU ITEM' : 'SAVE CHANGES')}</span>
                  </button>
                </div>
              </div>
            );
          })()
        }
      >
        <form id="menu-inspector-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* SECTION 1: COURSE & DISH DETAILS */}
          <DrawerSection title="COURSE & DISH DETAILS" icon={<Utensils size={13} style={{ color: 'var(--color-primary)' }} />}>
            <DrawerRow columns={2}>
              <DrawerField label="COURSE CATEGORY" required>
                <select
                  value={formState.category || 'entree'}
                  onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value as any }))}
                  style={styles.select}
                >
                  <option value="entree">Entree (Main Course)</option>
                  <option value="appetizer">Appetizer / Hors d&apos;oeuvre</option>
                  <option value="dessert">Dessert / Sweet Treat</option>
                </select>
              </DrawerField>

              <DrawerField label="OFFERING TYPE">
                <select
                  value={formState.isGuestChoice !== false ? 'choice' : 'buffet'}
                  onChange={(e) => setFormState(prev => ({ ...prev, isGuestChoice: e.target.value === 'choice' }))}
                  style={styles.select}
                >
                  <option value="choice">Guest Choice (Plated RSVP)</option>
                  <option value="buffet">Buffet / Shared Course</option>
                </select>
              </DrawerField>
            </DrawerRow>

            <DrawerField label="DISH NAME" required>
              <input
                type="text"
                required
                placeholder="e.g. Pan-Seared Salmon, Ribeye Steak"
                value={formState.name || ''}
                onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                style={styles.input}
              />
            </DrawerField>

            <DrawerField label="DESCRIPTION & INGREDIENTS">
              <textarea
                rows={3}
                placeholder="e.g. Atlantic salmon served with lemon herb butter sauce and roasted asparagus..."
                value={formState.description || ''}
                onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                style={styles.textarea}
              />
            </DrawerField>
          </DrawerSection>

          {/* SECTION 2: DIETARY & ALLERGEN TAGS */}
          <DrawerSection title="DIETARY & ALLERGEN TAGS" icon={<Leaf size={13} style={{ color: '#10B981' }} />}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              <label style={{ ...styles.checkboxLabel, padding: '0.45rem 0.65rem', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: formState.isVegetarian ? 'rgba(16, 185, 129, 0.08)' : 'transparent' }}>
                <input
                  type="checkbox"
                  checked={!!formState.isVegetarian}
                  onChange={(e) => setFormState(prev => ({ ...prev, isVegetarian: e.target.checked }))}
                />
                <span>🌱 Vegetarian</span>
              </label>

              <label style={{ ...styles.checkboxLabel, padding: '0.45rem 0.65rem', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: formState.isVegan ? 'rgba(16, 185, 129, 0.08)' : 'transparent' }}>
                <input
                  type="checkbox"
                  checked={!!formState.isVegan}
                  onChange={(e) => setFormState(prev => ({ ...prev, isVegan: e.target.checked }))}
                />
                <span>🌿 Vegan</span>
              </label>

              <label style={{ ...styles.checkboxLabel, padding: '0.45rem 0.65rem', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: formState.isGlutenFree ? 'rgba(245, 158, 11, 0.08)' : 'transparent' }}>
                <input
                  type="checkbox"
                  checked={!!formState.isGlutenFree}
                  onChange={(e) => setFormState(prev => ({ ...prev, isGlutenFree: e.target.checked }))}
                />
                <span>🌾 Gluten Free</span>
              </label>

              <label style={{ ...styles.checkboxLabel, padding: '0.45rem 0.65rem', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: formState.isNutFree ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
                <input
                  type="checkbox"
                  checked={!!formState.isNutFree}
                  onChange={(e) => setFormState(prev => ({ ...prev, isNutFree: e.target.checked }))}
                />
                <span>🥜 Nut Free</span>
              </label>
            </div>
          </DrawerSection>
        </form>
      </SlideOverDrawer>

      {/* IN-APP DELETE MENU ITEM CONFIRMATION MODAL */}
      {itemToDelete && (
        <div style={styles.modalOverlay} className="menu-delete-overlay" onClick={() => setItemToDelete(null)}>
          <div style={{ ...styles.modalContent, maxWidth: '440px' }} className="menu-delete-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <Trash2 size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE MENU ITEM
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setItemToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="menu-delete-body">
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-red)' }}>"{itemToDelete.name}"</strong>?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
                This will remove the item from your catering menu. Any guests who previously selected this meal will retain their selection until re-assigned.
              </p>

              <div className="menu-delete-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
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
                  onClick={confirmDelete}
                  disabled={isSyncing}
                >
                  <Trash2 size={15} />
                  {isSyncing ? 'DELETING...' : 'DELETE ITEM'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <MobileFAB onClick={startAdd} label="Add Menu Item" disabled={isSyncing} />
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
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
    color: 'var(--color-on-primary, #ffffff)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-on-primary, #ffffff)',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
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
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    color: 'var(--color-text)',
  },
  select: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    padding: '0.55rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    color: 'var(--color-text)',
  },
  textarea: {
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    padding: '0.55rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
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
