'use client';

import React, { useState } from 'react';
import { Guest, AgeCategory, RSVPStatus } from '@/lib/sheets/types';
import { calculateRelationalCateringSummary } from '@/lib/sheets/relationalSync';
import { User, Mail, Phone, MapPin, Coffee, Tag, Plus, Edit2, Check, X, Utensils, Users, Grid, AlertTriangle, Download, Printer, Heart } from 'lucide-react';

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

  // View Display State ('grid' | 'seating' | 'party')
  const [displayView, setDisplayView] = useState<'grid' | 'seating' | 'party'>('grid');

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
    setMenuOptions(['Filet Mignon', 'Pan-Seared Salmon', 'Vegan Risotto', 'Kids Chicken Tenders']);
  }, []);

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
    
    return matchesSearch && matchesRsvp && matchesGroup;
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
  const saveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;

    let updatedGuests: Guest[];
    if (isAdding) {
      updatedGuests = [...guests, formState as Guest];
    } else {
      updatedGuests = guests.map(g => 
        g.guestId === editingGuest?.guestId ? (formState as Guest) : g
      );
    }

    await onUpdate(updatedGuests);
    setEditingGuest(null);
    setIsAdding(false);
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

  return (
    <div style={styles.container}>
      {/* Header Panel */}
      <div style={styles.upNextCard} className="anim-fade-in">
        <div>
          <h2 style={styles.title}>Guest Registry</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-sans)' }}>
            Manage wedding invitations, track RSVPs, table assignments, and catering dietary preferences.
          </p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.toggleBtn,
                backgroundColor: displayView === 'grid' ? 'var(--color-primary)' : 'transparent',
                color: displayView === 'grid' ? 'var(--color-on-primary)' : 'var(--color-muted)'
              }}
              onClick={() => setDisplayView('grid')}
              title="All Guests Grid"
            >
              <Grid size={14} style={{ marginRight: '0.25rem' }} /> ALL
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                backgroundColor: displayView === 'seating' ? 'var(--color-primary)' : 'transparent',
                color: displayView === 'seating' ? 'var(--color-on-primary)' : 'var(--color-muted)'
              }}
              onClick={() => setDisplayView('seating')}
              title="Seating Chart View"
            >
              <Utensils size={14} style={{ marginRight: '0.25rem' }} /> SEATING
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                backgroundColor: displayView === 'party' ? 'var(--color-primary)' : 'transparent',
                color: displayView === 'party' ? 'var(--color-on-primary)' : 'var(--color-muted)'
              }}
              onClick={() => setDisplayView('party')}
              title="Party Group View"
            >
              <Users size={14} style={{ marginRight: '0.25rem' }} /> GROUPS
            </button>
          </div>

          <div style={styles.actionButtonGroup}>
            <button style={styles.secondaryBtn} onClick={exportToCSV} title="Export CSV Spreadsheet">
              <Download size={14} style={{ marginRight: '0.25rem' }} /> CSV
            </button>
            <button style={styles.secondaryBtn} onClick={handlePrint} title="Print Guest Registry">
              <Printer size={14} style={{ marginRight: '0.25rem' }} /> PRINT
            </button>
            <button style={{ ...styles.addButton, marginLeft: 'auto' }} onClick={startAdd} disabled={isSyncing}>
              <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD GUEST
            </button>
          </div>
        </div>
      </div>

      {/* Relational RSVP & Catering Intelligence Banner */}
      {(() => {
        const summary = calculateRelationalCateringSummary(guests, []);
        return (
          <div style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-muted)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1rem 1.25rem',
            margin: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={18} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  RELATIONAL RSVP & CATERING INTELLIGENCE
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--color-green, #10b981)', fontWeight: 700 }}>
                  CONFIRMED ATTENDING: {summary.attendingCount} / {summary.totalInvited}
                </span>
                <span style={{ color: 'var(--color-muted)' }}>
                  DECLINED: {summary.declinedCount}
                </span>
                <span style={{ color: 'var(--color-muted)' }}>
                  PENDING: {summary.pendingCount}
                </span>
              </div>
            </div>

            {/* Meal Choice Breakdown Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', fontWeight: 600 }}>
                MEAL TOTALS:
              </span>
              {summary.mealChoiceBreakdown.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>No meal choices selected yet</span>
              ) : (
                summary.mealChoiceBreakdown.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-bg, #f9fafb)',
                      border: '1px solid var(--color-muted)',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.meal}:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{item.count}</strong>
                  </span>
                ))
              )}
            </div>

            {/* Dedicated Dietary Restrictions Row (GUEST-4) */}
            {summary.dietaryBreakdown.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem', borderTop: '1px dashed var(--color-muted)' }}>
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', fontWeight: 600 }}>
                  DIETARY RESTRICTIONS:
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    color: 'var(--color-red)',
                    border: '1px solid #ef4444',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <AlertTriangle size={13} />
                  <span>{summary.dietaryBreakdown.reduce((acc, d) => acc + d.count, 0)} TOTAL RESTRICTION(S) ({summary.dietaryBreakdown.map(d => `${d.diet}: ${d.count}`).join(', ')})</span>
                </span>
              </div>
            )}
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
      </div>

      {/* View Content */}
      {displayView === 'grid' && (
        <div style={styles.grid}>
          {filteredGuests.map(guest => renderGuestCard(guest))}
          {filteredGuests.length === 0 && (
            <div style={styles.emptyState}>No guests found matching filters.</div>
          )}
        </div>
      )}

      {displayView === 'seating' && (
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

                <div style={styles.grid}>
                  {tableGuests.map(guest => renderGuestCard(guest))}
                </div>
              </div>
            );
          })}
          {tableKeys.length === 0 && (
            <div style={styles.emptyState}>No guests found matching filters.</div>
          )}
        </div>
      )}

      {displayView === 'party' && (
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

                <div style={styles.grid}>
                  {partyGuests.map(guest => renderGuestCard(guest))}
                </div>
              </div>
            );
          })}
          {partyKeys.length === 0 && (
            <div style={styles.emptyState}>No guests found matching filters.</div>
          )}
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

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>PARTY GROUP</label>
                  <input
                    type="text"
                    value={formState.partyGroup || ''}
                    placeholder="e.g. Groom Family, Bride Friends"
                    onChange={(e) => handleInputChange('partyGroup', e.target.value)}
                    style={styles.input}
                  />
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
                      ⚠️ No tables created yet. Add tables in the <strong>Seating Chart</strong> tab before assigning.
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
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : 'SAVE CHANGES'}
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
