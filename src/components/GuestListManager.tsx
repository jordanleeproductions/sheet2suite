'use client';

import React, { useState } from 'react';
import { Guest, AgeCategory, RSVPStatus } from '@/lib/sheets/types';
import { calculateRelationalCateringSummary } from '@/lib/sheets/relationalSync';
import { User, Mail, Phone, MapPin, Coffee, Tag, Plus, Edit2, Check, X, Utensils, Users, Grid, AlertTriangle, Download, Printer, Heart, ChevronDown, ChevronUp, List } from 'lucide-react';

interface GuestListManagerProps {
  guests: Guest[];
  onUpdate: (updatedGuests: Guest[]) => Promise<void>;
  isSyncing: boolean;
  availableTables?: string[];
  onOpenPrintStudio?: (template: 'place_cards' | 'table_cards' | 'timeline' | 'vendors') => void;
  initialRsvpFilter?: RSVPStatus | 'All';
}

export default function GuestListManager({ guests, onUpdate, isSyncing, availableTables, onOpenPrintStudio, initialRsvpFilter }: GuestListManagerProps) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<RSVPStatus | 'All'>(initialRsvpFilter || 'All');
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [mealFilter, setMealFilter] = useState<string>('All');
  const [dietFilter, setDietFilter] = useState<string>('All');
  const [isCateringCollapsed, setIsCateringCollapsed] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialRsvpFilter) {
      setRsvpFilter(initialRsvpFilter);
    }
  }, [initialRsvpFilter]);
  
  // Edit Dialog State
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<Guest>>({});

  // Derive known tables from props and existing guests
  const existingTables = Array.from(new Set([
    ...(availableTables || []),
    ...guests.map(g => (g.tableAssignment || '').trim()).filter(Boolean)
  ])).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  // View Display State: Grouping Mode ('all' | 'seating' | 'party') & Layout Mode ('cards' | 'list') [GUEST-6]
  const [groupingMode, setGroupingMode] = useState<'all' | 'seating' | 'party'>('all');
  const [layoutMode, setLayoutMode] = useState<'cards' | 'list'>('cards');

  // Dynamic Catering Menu Entree Options
  const [menuOptions, setMenuOptions] = useState<string[]>([]);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('s2v_catering_menu');
      if (saved) {
        const parsed = JSON.parse(saved);
        const entrees = parsed
          .filter((i: any) => i.category === 'entree' && i.isGuestChoice !== false)
          .map((i: any) => i.name);
        if (entrees.length > 0) {
          setMenuOptions(entrees);
          return;
        }
      }
    } catch (e) {}
    // If no menu configured, collect distinct meal choices from existing guests
    const distinctGuestMeals = Array.from(new Set(guests.map(g => (g.mealChoice || '').trim()).filter(Boolean)));
    setMenuOptions(distinctGuestMeals);
  }, [guests]);

  // Unique list of groups for filtering
  const groups = Array.from(new Set(guests.map(g => g.partyGroup).filter(Boolean)));

  // Filtered Guests
  const filteredGuests = guests.filter(guest => {
    const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchLower) || 
      (guest.emailAddress || '').toLowerCase().includes(searchLower) ||
      (guest.dietaryRestrictions || '').toLowerCase().includes(searchLower) ||
      (guest.tableAssignment || '').toLowerCase().includes(searchLower) ||
      (guest.phoneNumber || '').toLowerCase().includes(searchLower);

    const matchesRsvp = rsvpFilter === 'All' || guest.rsvpStatus === rsvpFilter;
    const matchesGroup = groupFilter === 'All' || guest.partyGroup === groupFilter;
    const matchesMeal = mealFilter === 'All' || (guest.mealChoice || '').toLowerCase() === mealFilter.toLowerCase();
    const matchesDiet = dietFilter === 'All' || 
      (dietFilter === 'HAS_DIET' ? Boolean((guest.dietaryRestrictions || '').trim()) : 
      (guest.dietaryRestrictions || '').toLowerCase().includes(dietFilter.toLowerCase()));
    
    return matchesSearch && matchesRsvp && matchesGroup && matchesMeal && matchesDiet;
  });

  // Grouping helper for Seating Tables
  const tableGroupsMap = filteredGuests.reduce((acc, guest) => {
    const table = (guest.tableAssignment || '').trim() || 'Unassigned';
    if (!acc[table]) acc[table] = [];
    acc[table].push(guest);
    return acc;
  }, {} as Record<string, Guest[]>);

  const tableKeys = Object.keys(tableGroupsMap).sort((a, b) => {
    if (a === 'Unassigned') return -1;
    if (b === 'Unassigned') return 1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Grouping helper for Party Groups
  const partyGroupsMap = filteredGuests.reduce((acc, guest) => {
    const party = (guest.partyGroup || '').trim() || 'General';
    if (!acc[party]) acc[party] = [];
    acc[party].push(guest);
    return acc;
  }, {} as Record<string, Guest[]>);

  const partyKeys = Object.keys(partyGroupsMap).sort();

  // Handle Edit Click
  const startEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormState(guest);
    setIsAdding(false);
  };

  // Handle Add Click
  const startAdd = () => {
    const nextId = `G${guests.length + 1}`;
    setFormState({
      guestId: nextId,
      firstName: '',
      lastName: '',
      partyGroup: groups[0] || 'Friends',
      ageCategory: 'Adult',
      rsvpStatus: 'No Response',
      dietaryRestrictions: '',
      tableAssignment: '',
      mealChoice: 'Unassigned / Pending',
      emailAddress: '',
      phoneNumber: '',
      mailingAddress: '',
    });
    setIsAdding(true);
    setEditingGuest(null);
  };

  // Handle Form Input Changes
  const handleInputChange = (field: keyof Guest, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Handle Quick RSVP Change directly on card
  const handleQuickRsvp = async (guest: Guest, newStatus: RSVPStatus) => {
    if (isSyncing) return;
    const updated = guests.map(g => 
      g.guestId === guest.guestId ? { ...g, rsvpStatus: newStatus } : g
    );
    await onUpdate(updated);
  };

  // Save changes
  const saveGuest = async (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();
    if (isSyncing) return;

    if (!formState.firstName || !formState.lastName) {
      alert('Please enter both First Name and Last Name.');
      return;
    }

    let updatedGuests: Guest[];
    if (isAdding) {
      updatedGuests = [...guests, formState as Guest];
    } else {
      updatedGuests = guests.map(g => 
        g.guestId === editingGuest?.guestId ? (formState as Guest) : g
      );
    }

    await onUpdate(updatedGuests);

    if (continueAdding) {
      const nextId = `G${updatedGuests.length + 1}`;
      setFormState({
        guestId: nextId,
        firstName: '',
        lastName: '',
        partyGroup: formState.partyGroup || groups[0] || 'Friends',
        ageCategory: formState.ageCategory || 'Adult',
        rsvpStatus: 'No Response',
        dietaryRestrictions: '',
        tableAssignment: '',
        mealChoice: 'Unassigned / Pending',
        emailAddress: '',
        phoneNumber: '',
        mailingAddress: '',
      });
      setIsAdding(true);
      setEditingGuest(null);
    } else {
      setEditingGuest(null);
      setIsAdding(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Guest ID', 'First Name', 'Last Name', 'Party Group', 'Age Category', 'RSVP Status', 'Dietary Restrictions', 'Table Assignment', 'Email', 'Phone', 'Address'];
    const rows = filteredGuests.map(g => [
      `"${g.guestId || ''}"`,
      `"${g.firstName || ''}"`,
      `"${g.lastName || ''}"`,
      `"${g.partyGroup || ''}"`,
      `"${g.ageCategory || ''}"`,
      `"${g.rsvpStatus || ''}"`,
      `"${g.dietaryRestrictions || ''}"`,
      `"${g.tableAssignment || ''}"`,
      `"${g.emailAddress || ''}"`,
      `"${g.phoneNumber || ''}"`,
      `"${g.mailingAddress || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'wedding_guests.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (onOpenPrintStudio) {
      onOpenPrintStudio('place_cards');
    } else {
      window.print();
    }
  };

  const renderGuestCard = (guest: Guest) => {
    const rsvpColor = 
      guest.rsvpStatus === 'Attending' ? 'var(--color-primary)' :
      guest.rsvpStatus === 'Declined' ? 'var(--color-muted)' :
      '#e6b800'; // dark gold/amber
      // Note: using hardcoded for distinct RSVP visual; mapped to --color-amber-dark in dark themes

    return (
      <div key={guest.guestId} style={styles.card} className="anim-slide-up anim-hover-scale anim-ripple">
        <div style={styles.cardHeader}>
          <div style={styles.cardMeta}>
            <span style={styles.upNextBadge} className="anim-badge-pulse">{guest.partyGroup.toUpperCase()}</span>
            <span style={{ ...styles.monoBadge, backgroundColor: 'var(--color-highlight)' }}>
              {guest.ageCategory.toUpperCase()}
            </span>
          </div>
          <button style={styles.editBtn} className="anim-ripple" onClick={() => startEdit(guest)}>
            <Edit2 size={12} />
          </button>
        </div>

        <h3 style={styles.cardName}>{guest.firstName} {guest.lastName}</h3>

        <div style={styles.cardDetails}>
          <div style={styles.detailColumn}>
            {guest.emailAddress && (
              <div style={styles.detailItem}>
                <Mail size={12} style={styles.icon} />
                <span>{guest.emailAddress}</span>
              </div>
            )}
            {guest.phoneNumber && (
              <div style={styles.detailItem}>
                <Phone size={12} style={styles.icon} />
                <span>{guest.phoneNumber}</span>
              </div>
            )}
          </div>
          <div style={styles.detailColumn}>
            <div style={styles.detailItem}>
              <Coffee size={12} style={styles.icon} />
              <span>Diet: {guest.dietaryRestrictions || 'None'}</span>
            </div>
            <div style={styles.detailItem}>
              <Tag size={12} style={styles.icon} />
              <span>Table: {guest.tableAssignment || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* RSVP Status Selector Toggle */}
        <div style={styles.rsvpToggleSection}>
          <span style={styles.rsvpLabel}>RSVP STATUS:</span>
          <div style={styles.rsvpButtonGroup}>
            {(['No Response', 'Attending', 'Declined'] as RSVPStatus[]).map((status) => {
              const isSelected = guest.rsvpStatus === status;
              let btnStyle: React.CSSProperties = styles.rsvpToggleBtn;

              if (isSelected) {
                if (status === 'Declined') {
                  btnStyle = {
                    ...styles.rsvpToggleBtn,
                    backgroundColor: 'var(--color-red)',
                    color: 'var(--color-on-light)',
                    border: '2px solid var(--color-muted, #121824)',
                    fontWeight: 700,
                  };
                } else if (status === 'Attending') {
                  btnStyle = {
                    ...styles.rsvpToggleBtn,
                    backgroundColor: 'var(--color-green)',
                    color: 'var(--color-on-light)',
                    border: '2px solid var(--color-muted, #121824)',
                    fontWeight: 700,
                  };
                } else {
                  // No Response / Pending / Yellow
                  btnStyle = {
                    ...styles.rsvpToggleBtn,
                    backgroundColor: 'var(--color-gold)',
                    color: 'var(--color-on-light)',
                    border: '2px solid var(--color-muted, #121824)',
                    fontWeight: 700,
                  };
                }
              }

              return (
                <button 
                  key={status} 
                  style={btnStyle}
                  onClick={() => handleQuickRsvp(guest, status)}
                  disabled={isSyncing}
                >
                  {status === 'No Response' ? '?' : status.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render reusable compact Guest List Table [GUEST-6]
  const renderGuestListTable = (targetGuests: Guest[]) => {
    return (
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-muted)', borderRadius: 'var(--border-radius-md)', marginTop: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg, #f9fafb)', borderBottom: '2px solid var(--color-muted)' }}>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700 }}>GUEST NAME</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700 }}>PARTY GROUP</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700 }}>AGE</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700 }}>RSVP STATUS</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700 }}>MEAL CHOICE</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700 }}>DIETARY TAGS</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700 }}>TABLE</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {targetGuests.map(guest => (
              <tr key={guest.guestId} style={{ borderBottom: '1px solid var(--color-muted)', transition: 'background-color 0.15s ease' }}>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  <div>{guest.firstName} {guest.lastName}</div>
                  {guest.emailAddress && <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{guest.emailAddress}</div>}
                </td>
                <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  <span style={{ backgroundColor: 'var(--color-bg)', padding: '0.15rem 0.4rem', borderRadius: '3px', border: '1px solid var(--color-muted)' }}>
                    {guest.partyGroup}
                  </span>
                </td>
                <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {guest.ageCategory}
                </td>
                <td style={{ padding: '0.6rem 0.75rem' }}>
                  <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                    {(['No Response', 'Attending', 'Declined'] as RSVPStatus[]).map((status) => {
                      const isSelected = guest.rsvpStatus === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleQuickRsvp(guest, status)}
                          disabled={isSyncing}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: '3px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: isSelected 
                              ? (status === 'Attending' ? 'var(--color-green)' : status === 'Declined' ? 'var(--color-red)' : 'var(--color-gold)')
                              : 'var(--color-bg, #f3f4f6)',
                            color: isSelected ? '#ffffff' : 'var(--color-muted)',
                          }}
                          title={`Set RSVP to ${status}`}
                        >
                          {status === 'No Response' ? 'PENDING' : status.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text)' }}>
                  {guest.mealChoice || '-'}
                </td>
                <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {guest.dietaryRestrictions ? (
                    <span style={{ color: 'var(--color-red)', fontWeight: 700, backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.15rem 0.4rem', borderRadius: '3px', border: '1px solid #ef4444' }}>
                      ⚠️ {guest.dietaryRestrictions}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-muted)' }}>None</span>
                  )}
                </td>
                <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {guest.tableAssignment || 'Unassigned'}
                </td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => startEdit(guest)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-muted)',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      color: 'var(--color-text)',
                    }}
                    title="Edit Guest Details"
                  >
                    <Edit2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {targetGuests.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                  No guests found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Scoped Responsive CSS for Guest Registry Header */}
      <style>{`
        .guest-header-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-muted);
          border-radius: var(--border-radius-md);
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          box-shadow: var(--box-shadow-subtle);
        }
        .guest-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .guest-view-toggle {
          display: flex;
          border: 1px solid var(--color-muted);
          border-radius: var(--border-radius-sm);
          overflow: hidden;
          background-color: var(--color-surface);
          flex-shrink: 0;
        }
        .guest-view-toggle button {
          border: none;
          padding: 0.35rem 0.6rem;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
        }
        @media (max-width: 768px) {
          .guest-header-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 1rem !important;
            gap: 0.75rem !important;
          }
          .guest-header-actions {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
            width: 100% !important;
          }
          .guest-toggles-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
            width: 100% !important;
          }
          .guest-view-toggle {
            width: 100% !important;
            display: flex !important;
          }
          .guest-view-toggle button {
            flex: 1 1 auto !important;
            padding: 0.45rem 0.35rem !important;
            min-height: 38px !important;
            font-size: 0.68rem !important;
          }
          .guest-action-buttons-row {
            display: grid !important;
            grid-template-columns: auto auto 1fr !important;
            gap: 0.5rem !important;
            width: 100% !important;
            margin-left: 0 !important;
          }
          .guest-action-buttons-row button {
            min-height: 38px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Header Panel */}
      <div className="guest-header-card anim-fade-in">
        <div>
          <h2 style={styles.title}>Guest List</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-sans)' }}>
            Manage wedding invitations, track RSVPs, table assignments, and catering dietary preferences.
          </p>
        </div>
        <div className="guest-header-actions">
          <div className="guest-toggles-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Grouping Mode Toggle (ALL | SEATING | GROUPS) */}
            <div className="guest-view-toggle">
              <button
                style={{
                  backgroundColor: groupingMode === 'all' ? 'var(--color-primary)' : 'transparent',
                  color: groupingMode === 'all' ? 'var(--color-on-primary)' : 'var(--color-muted)'
                }}
                onClick={() => setGroupingMode('all')}
                title="All Guests View"
              >
                <Grid size={13} style={{ marginRight: '0.2rem' }} /> ALL
              </button>
              <button
                style={{
                  backgroundColor: groupingMode === 'seating' ? 'var(--color-primary)' : 'transparent',
                  color: groupingMode === 'seating' ? 'var(--color-on-primary)' : 'var(--color-muted)'
                }}
                onClick={() => setGroupingMode('seating')}
                title="Seating Chart Grouping View"
              >
                <Utensils size={13} style={{ marginRight: '0.2rem' }} /> SEATING
              </button>
              <button
                style={{
                  backgroundColor: groupingMode === 'party' ? 'var(--color-primary)' : 'transparent',
                  color: groupingMode === 'party' ? 'var(--color-on-primary)' : 'var(--color-muted)'
                }}
                onClick={() => setGroupingMode('party')}
                title="Party Grouping View"
              >
                <Users size={13} style={{ marginRight: '0.2rem' }} /> GROUPS
              </button>
            </div>

            {/* Independent Layout Mode Toggle (CARDS vs LIST) [GUEST-6] */}
            <div className="guest-view-toggle">
              <button
                style={{
                  backgroundColor: layoutMode === 'cards' ? 'var(--color-primary)' : 'transparent',
                  color: layoutMode === 'cards' ? 'var(--color-on-primary)' : 'var(--color-muted)'
                }}
                onClick={() => setLayoutMode('cards')}
                title="Card Grid Cards Layout"
              >
                <Grid size={13} style={{ marginRight: '0.2rem' }} /> CARDS
              </button>
              <button
                style={{
                  backgroundColor: layoutMode === 'list' ? 'var(--color-primary)' : 'transparent',
                  color: layoutMode === 'list' ? 'var(--color-on-primary)' : 'var(--color-muted)'
                }}
                onClick={() => setLayoutMode('list')}
                title="Compact Desktop List Rows Layout [GUEST-6]"
              >
                <List size={13} style={{ marginRight: '0.2rem' }} /> LIST
              </button>
            </div>
          </div>

          <div className="guest-action-buttons-row" style={{ ...styles.actionButtonGroup, marginLeft: 'auto' }}>
            <button style={styles.secondaryBtn} onClick={exportToCSV} title="Export CSV Spreadsheet">
              <Download size={14} style={{ marginRight: '0.25rem' }} /> CSV
            </button>
            <button style={styles.secondaryBtn} onClick={handlePrint} title="Print Guest Registry">
              <Printer size={14} style={{ marginRight: '0.25rem' }} /> PRINT
            </button>
            <button style={styles.addButton} onClick={startAdd} disabled={isSyncing}>
              <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD GUEST
            </button>
          </div>
        </div>
      </div>

      {/* RSVP Stats KPI Cards & Collapsible Catering Filters Banner */}
      {(() => {
        const summary = calculateRelationalCateringSummary(guests, []);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
            {/* Standalone RSVP Stat Filter Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
            }}>
              {/* Confirmed Attending Card */}
              <div
                onClick={() => setRsvpFilter(prev => prev === 'Attending' ? 'All' : 'Attending')}
                style={{
                  backgroundColor: rsvpFilter === 'Attending' ? 'var(--color-green, #10b981)' : 'var(--color-surface, #ffffff)',
                  color: rsvpFilter === 'Attending' ? '#ffffff' : 'var(--color-text)',
                  border: rsvpFilter === 'Attending' ? '2px solid var(--color-green, #10b981)' : '1px solid var(--color-muted)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '0.2rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--box-shadow-subtle)',
                  transition: 'all 0.2s ease',
                }}
                title="Click to filter list by Confirmed Attending guests"
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: rsvpFilter === 'Attending' ? '#ffffff' : 'var(--color-muted)', textAlign: 'center' }}>
                  CONFIRMED ATTENDING
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: rsvpFilter === 'Attending' ? '#ffffff' : 'var(--color-green, #10b981)', textAlign: 'center' }}>
                  {summary.attendingCount}
                </span>
              </div>

              {/* Pending Response Card */}
              <div
                onClick={() => setRsvpFilter(prev => prev === 'No Response' ? 'All' : 'No Response')}
                style={{
                  backgroundColor: rsvpFilter === 'No Response' ? 'var(--color-gold, #f59e0b)' : 'var(--color-surface, #ffffff)',
                  color: rsvpFilter === 'No Response' ? '#ffffff' : 'var(--color-text)',
                  border: rsvpFilter === 'No Response' ? '2px solid var(--color-gold, #f59e0b)' : '1px solid var(--color-muted)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '0.2rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--box-shadow-subtle)',
                  transition: 'all 0.2s ease',
                }}
                title="Click to filter list by Pending RSVP guests"
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: rsvpFilter === 'No Response' ? '#ffffff' : 'var(--color-muted)', textAlign: 'center' }}>
                  PENDING RESPONSES
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: rsvpFilter === 'No Response' ? '#ffffff' : 'var(--color-gold, #f59e0b)', textAlign: 'center' }}>
                  {summary.pendingCount}
                </span>
              </div>

              {/* Declined Card */}
              <div
                onClick={() => setRsvpFilter(prev => prev === 'Declined' ? 'All' : 'Declined')}
                style={{
                  backgroundColor: rsvpFilter === 'Declined' ? 'var(--color-red, #ef4444)' : 'var(--color-surface, #ffffff)',
                  color: rsvpFilter === 'Declined' ? '#ffffff' : 'var(--color-text)',
                  border: rsvpFilter === 'Declined' ? '2px solid var(--color-red, #ef4444)' : '1px solid var(--color-muted)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '0.2rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--box-shadow-subtle)',
                  transition: 'all 0.2s ease',
                }}
                title="Click to filter list by Declined guests"
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: rsvpFilter === 'Declined' ? '#ffffff' : 'var(--color-muted)', textAlign: 'center' }}>
                  DECLINED
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: rsvpFilter === 'Declined' ? '#ffffff' : 'var(--color-muted)', textAlign: 'center' }}>
                  {summary.declinedCount}
                </span>
              </div>
            </div>

            {/* Collapsible Catering Filters Banner */}
            <div style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-muted)',
              borderRadius: 'var(--border-radius-md)',
              padding: isCateringCollapsed ? '0.75rem 1.25rem' : '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: isCateringCollapsed ? '0' : '0.75rem',
              transition: 'all 0.25s ease',
            }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setIsCateringCollapsed(!isCateringCollapsed)}
                title={isCateringCollapsed ? "Click to expand Catering Filters" : "Click to collapse Catering Filters"}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Utensils size={18} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    CATERING FILTERS
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                    ({summary.mealChoiceBreakdown.reduce((acc, m) => acc + m.count, 0)} meals selected • {summary.dietaryBreakdown.reduce((acc, d) => acc + d.count, 0)} dietary tags)
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsCateringCollapsed(!isCateringCollapsed); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                >
                  {isCateringCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>

              {/* Collapsible Content Body */}
              {!isCateringCollapsed && (
                <>
                  {/* Meal Choice Breakdown Pills [GUEST-5] */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', fontWeight: 600 }}>
                      MEAL TOTALS:
                    </span>
                    {summary.mealChoiceBreakdown.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>No meal choices selected yet</span>
                    ) : (
                      summary.mealChoiceBreakdown.map((item, idx) => {
                        const isSelected = mealFilter.toLowerCase() === item.meal.toLowerCase();
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setMealFilter(prev => prev.toLowerCase() === item.meal.toLowerCase() ? 'All' : item.meal)}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg, #f9fafb)',
                              color: isSelected ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                              border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                              borderRadius: '4px',
                              padding: '0.2rem 0.5rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            title={`Click to filter list by ${item.meal}`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.meal}:</span>
                            <strong style={{ color: isSelected ? '#ffffff' : 'var(--color-primary)' }}>{item.count}</strong>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Dedicated Dietary Restrictions Row [GUEST-5] */}
                  {summary.dietaryBreakdown.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px dashed var(--color-muted)' }}>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', fontWeight: 600 }}>
                        DIETARY RESTRICTIONS:
                      </span>
                      {summary.dietaryBreakdown.map((item, idx) => {
                        const isSelected = dietFilter.toLowerCase() === item.restriction.toLowerCase();
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setDietFilter(prev => prev.toLowerCase() === item.restriction.toLowerCase() ? 'All' : item.restriction)}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: isSelected ? 'var(--color-red)' : 'rgba(239,68,68,0.1)',
                              color: isSelected ? '#ffffff' : 'var(--color-red)',
                              border: '1px solid #ef4444',
                              borderRadius: '4px',
                              padding: '0.2rem 0.5rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            title={`Click to filter list by ${item.restriction}`}
                          >
                            <AlertTriangle size={13} />
                            <span>{item.restriction.toUpperCase()}:</span>
                            <strong style={{ color: isSelected ? '#ffffff' : 'var(--color-red)' }}>{item.count}</strong>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Filter and Search Bar */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="SEARCH GUEST, EMAIL, DIET, OR TABLE..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <div style={styles.filtersGroup}>
          <select 
            value={rsvpFilter} 
            onChange={(e) => setRsvpFilter(e.target.value as any)}
            style={styles.filterSelect}
          >
            <option value="All">ALL RSVPS</option>
            <option value="No Response">NO RESPONSE</option>
            <option value="Attending">ATTENDING</option>
            <option value="Declined">DECLINED</option>
          </select>

          <select 
            value={groupFilter} 
            onChange={(e) => setGroupFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">ALL GROUPS</option>
            {groups.map(grp => (
              <option key={grp} value={grp}>{grp.toUpperCase()}</option>
            ))}
          </select>

          {(mealFilter !== 'All' || dietFilter !== 'All') && (
            <button
              type="button"
              onClick={() => { setMealFilter('All'); setDietFilter('All'); }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: 'var(--color-red-muted, #fee2e2)',
                color: 'var(--color-red, #ef4444)',
                border: '1px solid var(--color-red)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Clear active meal and dietary restriction filters"
            >
              <X size={12} /> RESET FILTERS
            </button>
          )}
        </div>
      </div>

      {/* Stats Counter */}
      <div style={styles.statsBar}>
        <span>FOUND: <strong>{filteredGuests.length}</strong> GUESTS</span>
        <span>
          ATTENDING: <strong>{guests.filter(g => g.rsvpStatus === 'Attending').length}</strong> | 
          DECLINED: <strong>{guests.filter(g => g.rsvpStatus === 'Declined').length}</strong> | 
          PENDING: <strong>{guests.filter(g => g.rsvpStatus === 'No Response').length}</strong>
        </span>
      </div>      {/* View Content (ALL | SEATING | GROUPS crossed with CARDS | LIST layout) */}
      {groupingMode === 'all' && (
        layoutMode === 'cards' ? (
          <div style={styles.grid}>
            {filteredGuests.map(guest => renderGuestCard(guest))}
            {filteredGuests.length === 0 && (
              <div style={styles.emptyState}>No guests found matching filters.</div>
            )}
          </div>
        ) : (
          renderGuestListTable(filteredGuests)
        )
      )}

      {groupingMode === 'seating' && (
        <div style={styles.clustersContainer}>
          {tableKeys.map(table => {
            const tableGuests = tableGroupsMap[table];
            const attendingCount = tableGuests.filter(g => g.rsvpStatus === 'Attending').length;
            const isUnassigned = table === 'Unassigned';

            return (
              <div key={table} style={{
                ...styles.clusterCard,
                borderColor: isUnassigned ? 'var(--color-red)' : 'var(--color-muted)',
                backgroundColor: isUnassigned ? 'var(--color-red-muted)' : 'var(--color-bg)'
              }}>
                <div style={styles.clusterHeader}>
                  <div style={styles.clusterTitleRow}>
                    <Utensils size={18} style={{ color: isUnassigned ? 'var(--color-red)' : 'var(--color-primary)' }} />
                    <h3 style={{ ...styles.clusterTitle, color: isUnassigned ? 'var(--color-red)' : 'var(--color-primary)' }}>
                      {isUnassigned ? 'UNASSIGNED SEATING' : table.toUpperCase()}
                    </h3>
                    {isUnassigned && (
                      <span style={styles.unassignedBadge}>
                        <AlertTriangle size={11} style={{ marginRight: '0.2rem' }} /> {tableGuests.length} NEED TABLES
                      </span>
                    )}
                  </div>
                  <div style={styles.clusterMeta}>
                    <span>{tableGuests.length} Guests ({attendingCount} Attending)</span>
                  </div>
                </div>

                {layoutMode === 'cards' ? (
                  <div style={styles.grid}>
                    {tableGuests.map(guest => renderGuestCard(guest))}
                  </div>
                ) : (
                  renderGuestListTable(tableGuests)
                )}
              </div>
            );
          })}
          {tableKeys.length === 0 && (
            <div style={styles.emptyState}>No guests found matching filters.</div>
          )}
        </div>
      )}

      {groupingMode === 'party' && (
        <div style={styles.clustersContainer}>
          {partyKeys.map(party => {
            const partyGuests = partyGroupsMap[party];
            const attendingCount = partyGuests.filter(g => g.rsvpStatus === 'Attending').length;

            return (
              <div key={party} style={styles.clusterCard}>
                <div style={styles.clusterHeader}>
                  <div style={styles.clusterTitleRow}>
                    <Tag size={18} style={{ color: 'var(--color-primary)' }} />
                    <h3 style={styles.clusterTitle}>{party.toUpperCase()}</h3>
                  </div>
                  <div style={styles.clusterMeta}>
                    <span>{partyGuests.length} Guests ({attendingCount} Attending)</span>
                  </div>
                </div>

                {layoutMode === 'cards' ? (
                  <div style={styles.grid}>
                    {partyGuests.map(guest => renderGuestCard(guest))}
                  </div>
                ) : (
                  renderGuestListTable(partyGuests)
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Overlay Modal */}
      {(editingGuest || isAdding) && (
        <div className="guest-modal-overlay" style={styles.modalOverlay}>
          <style>{`
            @media (max-width: 640px) {
              .guest-modal-overlay {
                padding: 0.5rem !important;
              }
              .guest-modal-content {
                width: 100% !important;
                max-height: 92vh !important;
                padding: 1rem !important;
              }
              .guest-form-grid {
                grid-template-columns: 1fr !important;
                gap: 0.75rem !important;
              }
              .form-field-span-2 {
                grid-column: span 1 !important;
              }
            }
          `}</style>
          <div className="guest-modal-content" style={styles.modalContent}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-light)' }} className="modalTitle">
                {isAdding ? 'ADD NEW GUEST' : `EDIT GUEST: ${formState.firstName} ${formState.lastName}`}
              </h3>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-light)' }} className="closeBtn" onClick={() => { setEditingGuest(null); setIsAdding(false); }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={saveGuest} style={styles.form}>
              <div className="guest-form-grid" style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>FIRST NAME *</label>
                  <input
                    type="text"
                    required
                    value={formState.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>LAST NAME *</label>
                  <input
                    type="text"
                    required
                    value={formState.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                {/* Dynamic Party Group Combo Dropdown [GUEST-8] */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>PARTY GROUP</label>
                  <input
                    type="text"
                    list="party-group-options"
                    value={formState.partyGroup || ''}
                    placeholder="Select existing or type custom group..."
                    onChange={(e) => handleInputChange('partyGroup', e.target.value)}
                    style={styles.input}
                  />
                  <datalist id="party-group-options">
                    {groups.map(grp => (
                      <option key={grp} value={grp} />
                    ))}
                    <option value="Bride Family" />
                    <option value="Groom Family" />
                    <option value="Wedding Party" />
                    <option value="Mutual Friends" />
                    <option value="Co-Workers" />
                  </datalist>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>AGE CATEGORY</label>
                  <select
                    value={formState.ageCategory || 'Adult'}
                    onChange={(e) => handleInputChange('ageCategory', e.target.value)}
                    style={styles.select}
                  >
                    <option value="Adult">Adult</option>
                    <option value="Youth">Youth</option>
                    <option value="Child">Child</option>
                    <option value="Infant">Infant</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>RSVP STATUS</label>
                  <select
                    value={formState.rsvpStatus || 'No Response'}
                    onChange={(e) => handleInputChange('rsvpStatus', e.target.value)}
                    style={styles.select}
                  >
                    <option value="No Response">No Response</option>
                    <option value="Attending">Attending</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>TABLE ASSIGNMENT</label>
                  {existingTables.length > 0 ? (
                    <select
                      value={formState.tableAssignment || ''}
                      onChange={(e) => handleInputChange('tableAssignment', e.target.value)}
                      style={styles.select}
                    >
                      <option value="">Unassigned</option>
                      {existingTables.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', padding: '0.5rem 0.625rem', backgroundColor: 'var(--color-bg)', border: '1px dashed var(--color-muted)', borderRadius: 'var(--border-radius-sm)' }}>
                      No tables set up yet. Go to <strong>Seating Chart</strong> to add tables first.
                    </div>
                  )}
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>MEAL SELECTION</label>
                  <select
                    value={formState.mealChoice || 'Unassigned / Pending'}
                    onChange={(e) => handleInputChange('mealChoice', e.target.value)}
                    style={styles.select}
                  >
                    <option value="Unassigned / Pending">Unassigned / Pending</option>
                    {menuOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={formState.emailAddress || ''}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>PHONE NUMBER</label>
                  <input
                    type="text"
                    value={formState.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div className="form-field-span-2" style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>DIETARY RESTRICTIONS</label>
                  <input
                    type="text"
                    value={formState.dietaryRestrictions || ''}
                    placeholder="e.g. Vegetarian, Gluten Free, Nut Allergy"
                    onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div className="form-field-span-2" style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>MAILING ADDRESS</label>
                  <textarea
                    value={formState.mailingAddress || ''}
                    rows={2}
                    onChange={(e) => handleInputChange('mailingAddress', e.target.value)}
                    style={styles.textarea}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => { setEditingGuest(null); setIsAdding(false); }}
                >
                  CANCEL
                </button>
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
                    onClick={(e) => saveGuest(e, true)}
                  >
                    {isSyncing ? 'SAVING...' : 'SAVE & ADD NEW'}
                  </button>
                )}
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : (isAdding ? 'SAVE GUEST' : 'SAVE CHANGES')}
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
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  actionButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  secondaryBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.4rem 0.6rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
  },
  viewToggle: {
    display: 'flex',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    overflow: 'hidden',
  },
  toggleBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 600,
    border: 'none',
    padding: '0.4rem 0.6rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
  },
  clustersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginTop: '0.5rem',
  },
  clusterCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: 'var(--box-shadow-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  clusterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  clusterTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  clusterTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    margin: 0,
  },
  clusterMeta: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    fontWeight: 600,
  },
  unassignedBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-red-muted)',
    color: 'var(--color-red)',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
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
    justifyContent: 'center',
    textAlign: 'center',
    transition: 'var(--transition-smooth)',
  },
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  searchInput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    padding: '0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    width: '100%',
  },
  filtersGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterSelect: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem',
  },
  statsBar: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    borderBottom: '1px dotted var(--color-muted)',
    paddingBottom: '0.5rem',
    gap: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  card: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--box-shadow-subtle)',
    position: 'relative',
    transition: 'var(--transition-smooth)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  cardMeta: {
    display: 'flex',
    gap: '0.25rem',
  },
  monoBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-bg-hover)',
    color: 'var(--color-text)',
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  cardName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    color: 'var(--color-primary)',
    marginBottom: '0.75rem',
    fontWeight: '600',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '0.5rem',
    marginBottom: '1rem',
    fontSize: '0.8rem',
    color: 'var(--color-text)',
  },
  detailColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  icon: {
    color: 'var(--color-muted)',
    flexShrink: 0,
  },
  rsvpToggleSection: {
    marginTop: 'auto',
    borderTop: '1px dotted var(--color-muted)',
    paddingTop: '0.75rem',
  },
  rsvpLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
    display: 'block',
    marginBottom: '0.375rem',
  },
  rsvpButtonGroup: {
    display: 'flex',
    gap: '0.25rem',
  },
  rsvpToggleBtn: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '0.375rem 0',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
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
  textarea: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
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
  }
};
