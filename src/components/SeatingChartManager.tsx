'use client';

import React, { useState } from 'react';
import { Guest, TableConfig, TableShape } from '@/lib/sheets/types';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Circle, 
  Square, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Mail, 
  Phone, 
  Utensils, 
  User, 
  UserCheck, 
  Settings2,
  Sparkles,
  Search,
  Filter,
  Heart
} from 'lucide-react';

interface SeatingChartManagerProps {
  guests: Guest[];
  onUpdateGuests: (updatedGuests: Guest[]) => Promise<void>;
  isSyncing?: boolean;
}

// Default Table Configurations if none exist
const INITIAL_TABLES: TableConfig[] = [
  { tableId: 'table-sweetheart', tableName: 'Sweetheart Table', shape: 'sweetheart', capacity: 2 },
  { tableId: 'table-1', tableName: 'Table 1 - Head Table', shape: 'circle', capacity: 8 },
  { tableId: 'table-2', tableName: 'Table 2 - Family VIP', shape: 'circle', capacity: 8 },
  { tableId: 'table-3', tableName: 'Table 3 - Bridal Party', shape: 'rectangle', capacity: 10 },
  { tableId: 'table-4', tableName: 'Table 4 - Friends & College', shape: 'circle', capacity: 6 },
];

export default function SeatingChartManager({ guests, onUpdateGuests, isSyncing }: SeatingChartManagerProps) {
  const [tables, setTables] = useState<TableConfig[]>(INITIAL_TABLES);
  
  // Modals & Active Selections
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editingTable, setEditingTable] = useState<TableConfig | null>(null);
  const [isAddingTable, setIsAddingTable] = useState<boolean>(false);
  const [showUnassignedDrawer, setShowUnassignedDrawer] = useState<boolean>(false);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [rsvpFilter, setRsvpFilter] = useState<string>('All');
  
  // Form State for Table Config Modal
  const [tableFormState, setTableFormState] = useState<Partial<TableConfig>>({
    tableName: '',
    shape: 'circle',
    capacity: 8,
  });

  // Calculate assigned vs unassigned guests
  const unassignedGuests = guests.filter(g => !g.tableAssignment || g.tableAssignment.trim() === '' || g.tableAssignment === 'Unassigned');
  
  // Helper to compute guest initials (e.g. "Jane Doe" -> "JD")
  const getInitials = (guest: Guest): string => {
    const first = (guest.firstName || '').trim().charAt(0);
    const last = (guest.lastName || '').trim().charAt(0);
    if (!first && !last) return '??';
    return `${first}${last}`.toUpperCase();
  };

  // Helper to get RSVP status color badge
  const getRsvpBadgeClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'attending') return 'badge-green';
    if (s === 'declined') return 'badge-red';
    return 'badge-gold';
  };

  // Helper to assign a guest to a table
  const assignGuestToTable = async (guestId: string, tableName: string) => {
    if (isSyncing) return;
    const updated = guests.map(g => 
      g.guestId === guestId ? { ...g, tableAssignment: tableName } : g
    );
    await onUpdateGuests(updated);
    if (selectedGuest && selectedGuest.guestId === guestId) {
      setSelectedGuest({ ...selectedGuest, tableAssignment: tableName });
    }
  };

  // Open Add Table Modal
  const startAddTable = () => {
    setTableFormState({
      tableName: `Table ${tables.length + 1}`,
      shape: 'circle',
      capacity: 8,
      includeEndSeats: false,
    });
    setIsAddingTable(true);
    setEditingTable(null);
  };

  // Open Edit Table Modal
  const startEditTable = (table: TableConfig) => {
    setEditingTable(table);
    setTableFormState(table);
    setIsAddingTable(false);
  };

  // Save Table Configuration
  const saveTableConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableFormState.tableName) return;

    let finalCapacity = Number(tableFormState.capacity) || 8;
    const finalShape = tableFormState.shape || 'circle';

    if (finalShape === 'sweetheart') {
      finalCapacity = 2;
    } else if (finalShape === 'rectangle' && finalCapacity % 2 !== 0) {
      finalCapacity = finalCapacity + 1;
    }

    const tableData: TableConfig = {
      tableId: isAddingTable ? `table-${Date.now()}` : editingTable!.tableId,
      tableName: tableFormState.tableName,
      shape: finalShape,
      capacity: finalCapacity,
      includeEndSeats: finalShape === 'rectangle' ? (tableFormState.includeEndSeats || false) : false,
    };

    if (isAddingTable) {
      setTables([...tables, tableData]);
    } else if (editingTable) {
      setTables(tables.map(t => t.tableId === editingTable.tableId ? tableData : t));
    }

    setIsAddingTable(false);
    setEditingTable(null);
  };

  // Delete Table
  const deleteTable = (table: TableConfig) => {
    if (!confirm(`Delete ${table.tableName}? Guests assigned to this table will become unassigned.`)) return;
    setTables(tables.filter(t => t.tableId !== table.tableId));

    // Unassign guests at this table
    const updated = guests.map(g => 
      g.tableAssignment === table.tableName ? { ...g, tableAssignment: 'Unassigned' } : g
    );
    onUpdateGuests(updated);
  };

  // Filtered tables by search
  const filteredTables = tables.filter(t => 
    t.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header Toolbar */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Visual Table Seating Plan</h2>
          <p style={styles.subtitle}>
            Arrange seating layouts, configure seat capacities, and view guest profiles.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button 
            style={styles.drawerToggleBtn} 
            onClick={() => setShowUnassignedDrawer(!showUnassignedDrawer)}
          >
            <UserPlus size={16} style={{ marginRight: '0.35rem' }} />
            UNASSIGNED GUESTS ({unassignedGuests.length})
          </button>

          <button style={styles.addButton} onClick={startAddTable} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.35rem' }} /> ADD TABLE
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div style={styles.kpiBar}>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>TOTAL TABLES</span>
          <span style={styles.kpiValue}>{tables.length}</span>
        </div>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>TOTAL SEAT CAPACITY</span>
          <span style={styles.kpiValue}>
            {tables.reduce((acc, t) => acc + t.capacity, 0)}
          </span>
        </div>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>SEATED GUESTS</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>
            {guests.length - unassignedGuests.length} / {guests.length}
          </span>
        </div>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>UNASSIGNED GUESTS</span>
          <span style={{ ...styles.kpiValue, color: unassignedGuests.length > 0 ? 'var(--color-gold)' : 'var(--color-muted)' }}>
            {unassignedGuests.length}
          </span>
        </div>
      </div>

      {/* Unassigned Guests Quick Drawer Panel */}
      {showUnassignedDrawer && (
        <div style={styles.drawerPanel}>
          <div style={styles.drawerHeader}>
            <h4 style={styles.drawerTitle}>
              <UserPlus size={16} style={{ marginRight: '0.35rem', color: 'var(--color-highlight)' }} />
              Unassigned Guests Pool ({unassignedGuests.length})
            </h4>
            <button style={styles.closeIconBtn} onClick={() => setShowUnassignedDrawer(false)}>
              <X size={16} />
            </button>
          </div>

          {unassignedGuests.length === 0 ? (
            <p style={styles.emptyText}>All guests have been assigned to tables! 🎉</p>
          ) : (
            <div style={styles.unassignedGrid}>
              {unassignedGuests.map(guest => (
                <div 
                  key={guest.guestId} 
                  style={styles.unassignedChip}
                  onClick={() => setSelectedGuest(guest)}
                >
                  <span style={styles.initialsAvatar}>{getInitials(guest)}</span>
                  <div style={styles.unassignedMeta}>
                    <strong style={styles.guestNameText}>{guest.firstName} {guest.lastName}</strong>
                    <span style={styles.partyText}>{guest.partyGroup || 'General'} &bull; {guest.rsvpStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Floorplan Canvas Grid */}
      <div style={styles.floorplanGrid}>
        {filteredTables.map(table => {
          const seatedGuests = guests.filter(g => g.tableAssignment === table.tableName);
          const isOverCapacity = seatedGuests.length > table.capacity;

          return (
            <div key={table.tableId} style={styles.tableCard}>
              {/* Table Header Controls */}
              <div style={styles.tableCardHeader}>
                <div style={styles.tableNameGroup}>
                  {table.shape === 'circle' ? (
                    <Circle size={16} style={{ color: 'var(--color-highlight)' }} />
                  ) : table.shape === 'sweetheart' ? (
                    <Heart size={16} style={{ color: 'var(--color-sweetheart)' }} />
                  ) : (
                    <Square size={16} style={{ color: 'var(--color-highlight)' }} />
                  )}
                  <h3 style={styles.tableName}>{table.tableName}</h3>
                </div>

                <div style={styles.tableCardActions}>
                  <span style={{
                    ...styles.capacityBadge,
                    backgroundColor: isOverCapacity ? 'var(--color-red-muted)' : 'var(--color-bg)',
                    color: isOverCapacity ? 'var(--color-red)' : 'var(--color-text)'
                  }}>
                    {seatedGuests.length} / {table.capacity} Seats
                  </span>
                  <button style={styles.actionIconBtn} onClick={() => startEditTable(table)} title="Edit Table Config">
                    <Settings2 size={14} />
                  </button>
                  <button style={{ ...styles.actionIconBtn, color: '#ef4444' }} onClick={() => deleteTable(table)} title="Delete Table">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Visual Table Graphics Container */}
              <div style={styles.canvasContainer}>
                {table.shape === 'circle' ? (
                  // CIRCULAR TABLE VISUAL LAYOUT
                  <div style={styles.circleTableWrapper}>
                    {/* Central Table Surface */}
                    <div style={styles.circleTableDisc}>
                      <span style={styles.discLabel}>{table.tableName}</span>
                      <span style={styles.discSubLabel}>{seatedGuests.length} Seated</span>
                    </div>

                    {/* Perimeter Seat Nodes */}
                    {Array.from({ length: table.capacity }).map((_, index) => {
                      const angle = (index * (2 * Math.PI / table.capacity)) - (Math.PI / 2);
                      const radius = 105; // Radial distance from center in px
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      const guest = seatedGuests[index];

                      return (
                        <div
                          key={index}
                          style={{
                            ...styles.seatNodeCircle,
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                          onClick={() => {
                            if (guest) setSelectedGuest(guest);
                            else setShowUnassignedDrawer(true);
                          }}
                          title={guest ? `${guest.firstName} ${guest.lastName} (${guest.rsvpStatus})` : 'Empty Seat Slot'}
                        >
                          {guest ? (
                            <div style={styles.seatedAvatar}>
                              <span style={styles.initialsText}>{getInitials(guest)}</span>
                            </div>
                          ) : (
                            <span style={styles.emptySeatText}>+</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : table.shape === 'sweetheart' ? (
                  // SWEETHEART TABLE (Bride & Groom side-by-side on same top side)
                  (() => {
                    const brideSeat = seatedGuests[0];
                    const groomSeat = seatedGuests[1];

                    const renderSeatNode = (guest: Guest | undefined, seatKey: string) => (
                      <div
                        key={seatKey}
                        style={styles.seatNodeRect}
                        onClick={() => {
                          if (guest) setSelectedGuest(guest);
                          else setShowUnassignedDrawer(true);
                        }}
                        title={guest ? `${guest.firstName} ${guest.lastName} (${guest.rsvpStatus})` : 'Empty Seat Slot'}
                      >
                        {guest ? (
                          <div style={styles.seatedAvatar}>
                            <span style={styles.initialsText}>{getInitials(guest)}</span>
                          </div>
                        ) : (
                          <span style={styles.emptySeatText}>+</span>
                        )}
                      </div>
                    );

                    return (
                      <div style={styles.rectTableContainer}>
                        {/* Top Side Row (Bride & Groom side-by-side facing out) */}
                        <div style={styles.rectSideRow}>
                          {renderSeatNode(brideSeat, 'sweet-1')}
                          {renderSeatNode(groomSeat, 'sweet-2')}
                        </div>

                        {/* Central Sweetheart Table Surface */}
                        <div style={{
                          ...styles.rectTableSurface,
                          width: '120px',
                          border: '3px solid var(--color-sweetheart)',
                          backgroundColor: 'var(--color-surface)',
                          boxShadow: 'var(--box-shadow-subtle)'
                        }}>
                          <Heart size={16} style={{ color: 'var(--color-sweetheart)', marginBottom: '2px' }} />
                          <span style={{ ...styles.discLabel, fontSize: '0.75rem', color: 'var(--color-text)' }}>{table.tableName}</span>
                          <span style={{ ...styles.discSubLabel, color: 'var(--color-sweetheart)', fontWeight: 600 }}>Bride & Groom</span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // RECTANGULAR TABLE VISUAL LAYOUT (Even seats on sides + optional head/foot end seats)
                  (() => {
                    const includeEnd = table.includeEndSeats || false;
                    const cap = table.capacity;

                    // Helper to render an individual seat node
                    const renderSeatNode = (guest: Guest | undefined, seatKey: string) => (
                      <div
                        key={seatKey}
                        style={styles.seatNodeRect}
                        onClick={() => {
                          if (guest) setSelectedGuest(guest);
                          else setShowUnassignedDrawer(true);
                        }}
                        title={guest ? `${guest.firstName} ${guest.lastName} (${guest.rsvpStatus})` : 'Empty Seat Slot'}
                      >
                        {guest ? (
                          <div style={styles.seatedAvatar}>
                            <span style={styles.initialsText}>{getInitials(guest)}</span>
                          </div>
                        ) : (
                          <span style={styles.emptySeatText}>+</span>
                        )}
                      </div>
                    );

                    if (!includeEnd) {
                      // DEFAULT: Even seats split on top and bottom rows
                      const sideCount = Math.max(1, Math.floor(cap / 2));
                      const topSeats = seatedGuests.slice(0, sideCount);
                      const bottomSeats = seatedGuests.slice(sideCount, cap);
                      const dynamicWidth = `${Math.max(100, sideCount * 48 - 10)}px`;

                      return (
                        <div style={styles.rectTableContainer}>
                          {/* Top Side Row */}
                          <div style={styles.rectSideRow}>
                            {Array.from({ length: sideCount }).map((_, i) => renderSeatNode(topSeats[i], `top-${i}`))}
                          </div>

                          {/* Central Table Surface matching side seats length */}
                          <div style={{ ...styles.rectTableSurface, width: dynamicWidth }}>
                            <span style={styles.discLabel}>{table.tableName}</span>
                            <span style={styles.discSubLabel}>{seatedGuests.length} / {table.capacity} Seated</span>
                          </div>

                          {/* Bottom Side Row */}
                          <div style={styles.rectSideRow}>
                            {Array.from({ length: sideCount }).map((_, i) => renderSeatNode(bottomSeats[i], `bottom-${i}`))}
                          </div>
                        </div>
                      );
                    } else {
                      // END SEATS ENABLED: 1 Head Seat (Left), 1 Foot Seat (Right), equal side seats top & bottom
                      const sideCount = Math.max(1, Math.floor((cap - 2) / 2));
                      const headSeat = seatedGuests[0];
                      const topSeats = seatedGuests.slice(1, 1 + sideCount);
                      const footSeat = seatedGuests[1 + sideCount];
                      const bottomSeats = seatedGuests.slice(2 + sideCount, cap);
                      const dynamicWidth = `${Math.max(100, sideCount * 48 - 10)}px`;

                      return (
                        <div style={styles.rectTableContainer}>
                          {/* Top Side Row */}
                          <div style={styles.rectSideRow}>
                            {Array.from({ length: sideCount }).map((_, i) => renderSeatNode(topSeats[i], `top-${i}`))}
                          </div>

                          {/* Middle Row: Head End Seat + Table Surface + Foot End Seat */}
                          <div style={styles.rectMiddleRow}>
                            {renderSeatNode(headSeat, 'head-seat')}
                            <div style={{ ...styles.rectTableSurfaceWithEnds, width: dynamicWidth }}>
                              <span style={styles.discLabel}>{table.tableName}</span>
                              <span style={styles.discSubLabel}>{seatedGuests.length} / {table.capacity} Seated</span>
                            </div>
                            {renderSeatNode(footSeat, 'foot-seat')}
                          </div>

                          {/* Bottom Side Row */}
                          <div style={styles.rectSideRow}>
                            {Array.from({ length: sideCount }).map((_, i) => renderSeatNode(bottomSeats[i], `bottom-${i}`))}
                          </div>
                        </div>
                      );
                    }
                  })()
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* GUEST PROFILE POPUP MODAL */}
      {selectedGuest && (
        <div style={styles.modalOverlay} onClick={() => setSelectedGuest(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={styles.modalInitialsAvatar}>
                  {getInitials(selectedGuest)}
                </div>
                <div>
                  <h3 style={{ ...styles.modalTitle, color: '#000000' }} className="modalTitle">
                    {selectedGuest.firstName} {selectedGuest.lastName}
                  </h3>
                  <span style={styles.modalSubtitleText}>Guest Profile & Table Assignment</span>
                </div>
              </div>
              <button style={{ ...styles.closeBtn, color: '#000000' }} className="closeBtn" onClick={() => setSelectedGuest(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Status Badges Row */}
              <div style={styles.badgeRow}>
                <span className={getRsvpBadgeClass(selectedGuest.rsvpStatus)} style={styles.statusBadge}>
                  RSVP: {selectedGuest.rsvpStatus.toUpperCase()}
                </span>
                <span style={styles.infoBadge}>
                  {selectedGuest.partyGroup || 'GENERAL GUEST'}
                </span>
                <span style={styles.infoBadge}>
                  {selectedGuest.ageCategory || 'Adult'}
                </span>
              </div>

              {/* Table Reassignment Selector */}
              <div style={styles.reassignBox}>
                <label style={styles.fieldLabel}>SEATING ASSIGNMENT</label>
                <select
                  value={selectedGuest.tableAssignment || 'Unassigned'}
                  onChange={(e) => assignGuestToTable(selectedGuest.guestId, e.target.value)}
                  style={styles.selectInput}
                  disabled={isSyncing}
                >
                  <option value="Unassigned">Unassigned (No Table)</option>
                  {tables.map(t => (
                    <option key={t.tableId} value={t.tableName}>
                      {t.tableName} ({guests.filter(g => g.tableAssignment === t.tableName).length}/{t.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary Restrictions & Details */}
              <div style={styles.detailsGrid}>
                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>
                    <Utensils size={14} style={{ marginRight: '6px', color: 'var(--color-highlight)' }} />
                    DIETARY RESTRICTIONS
                  </div>
                  <p style={styles.detailValue}>
                    {selectedGuest.dietaryRestrictions || 'None specified'}
                  </p>
                </div>

                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>
                    <Mail size={14} style={{ marginRight: '6px', color: 'var(--color-highlight)' }} />
                    EMAIL ADDRESS
                  </div>
                  <p style={styles.detailValue}>
                    {selectedGuest.emailAddress || 'No email on file'}
                  </p>
                </div>

                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>
                    <Phone size={14} style={{ marginRight: '6px', color: 'var(--color-highlight)' }} />
                    PHONE NUMBER
                  </div>
                  <p style={styles.detailValue}>
                    {selectedGuest.phoneNumber || 'No phone number'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE CONFIGURATION EDIT MODAL */}
      {(isAddingTable || editingTable) && (
        <div style={styles.modalOverlay} onClick={() => { setIsAddingTable(false); setEditingTable(null); }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: '#000000' }} className="modalTitle">
                {isAddingTable ? 'ADD NEW TABLE' : 'EDIT TABLE CONFIGURATION'}
              </h3>
              <button style={{ ...styles.closeBtn, color: '#000000' }} className="closeBtn" onClick={() => { setIsAddingTable(false); setEditingTable(null); }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveTableConfig} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>TABLE NAME / TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 1 - Family VIP"
                  value={tableFormState.tableName || ''}
                  onChange={(e) => setTableFormState({ ...tableFormState, tableName: e.target.value })}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>TABLE SHAPE</label>
                <div style={styles.shapeToggleGrid}>
                  <button
                    type="button"
                    style={{
                      ...styles.shapeBtn,
                      borderColor: tableFormState.shape === 'circle' ? 'var(--color-highlight)' : 'var(--color-muted)',
                      backgroundColor: tableFormState.shape === 'circle' ? 'var(--color-surface)' : 'transparent'
                    }}
                    onClick={() => setTableFormState({ ...tableFormState, shape: 'circle' })}
                  >
                    <Circle size={18} style={{ marginRight: '6px' }} /> Round Circle
                  </button>

                  <button
                    type="button"
                    style={{
                      ...styles.shapeBtn,
                      borderColor: tableFormState.shape === 'rectangle' ? 'var(--color-highlight)' : 'var(--color-muted)',
                      backgroundColor: tableFormState.shape === 'rectangle' ? 'var(--color-surface)' : 'transparent'
                    }}
                    onClick={() => setTableFormState({ ...tableFormState, shape: 'rectangle' })}
                  >
                    <Square size={18} style={{ marginRight: '6px' }} /> Rectangle Banquet
                  </button>

                  <button
                    type="button"
                    style={{
                      ...styles.shapeBtn,
                      gridColumn: 'span 2',
                      borderColor: tableFormState.shape === 'sweetheart' ? 'var(--color-sweetheart)' : 'var(--color-muted)',
                      backgroundColor: tableFormState.shape === 'sweetheart' ? 'var(--color-surface)' : 'transparent',
                      color: tableFormState.shape === 'sweetheart' ? 'var(--color-sweetheart)' : 'var(--color-text)'
                    }}
                    onClick={() => setTableFormState({ 
                      ...tableFormState, 
                      shape: 'sweetheart', 
                      capacity: 2, 
                      tableName: tableFormState.tableName || 'Sweetheart Table (Bride & Groom)' 
                    })}
                  >
                    <Heart size={18} style={{ marginRight: '6px', color: 'var(--color-sweetheart)' }} /> 💑 Sweetheart Table (Bride & Groom)
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>SEAT CAPACITY (NUMBER OF SEATS) *</label>
                <input
                  type="number"
                  required
                  min="2"
                  max="24"
                  step={tableFormState.shape === 'rectangle' ? 2 : 1}
                  value={tableFormState.capacity || 8}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (tableFormState.shape === 'rectangle' && val % 2 !== 0) {
                      val = val + 1;
                    }
                    setTableFormState({ ...tableFormState, capacity: val });
                  }}
                  style={styles.inputField}
                />
                <span style={styles.hintText}>
                  {tableFormState.shape === 'rectangle' 
                    ? 'Rectangular tables enforce an even number of total seats (equal seats per side).' 
                    : 'Configure total seats per table (e.g. 6, 8, 10, 12).'}
                </span>
              </div>

              {tableFormState.shape === 'rectangle' && (
                <div style={styles.formGroup}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text)', marginTop: '0.25rem' }}>
                    <input
                      type="checkbox"
                      checked={tableFormState.includeEndSeats || false}
                      onChange={(e) => setTableFormState({ ...tableFormState, includeEndSeats: e.target.checked })}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    Include Head & Foot End Seats (1 person on each end)
                  </label>
                  <span style={styles.hintText}>
                    By default (off), all seats are arranged evenly along the top and bottom sides.
                  </span>
                </div>
              )}

              <div style={styles.formActions}>
                <button type="submit" style={styles.saveBtn} className="saveBtn">
                  SAVE TABLE
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    margin: 0,
    color: 'var(--color-primary)',
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    margin: '0.25rem 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  drawerToggleBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-gold-muted)',
    color: 'var(--color-gold)',
    border: '1px solid var(--color-gold)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  addButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-btn-selected-bg)',
    color: 'var(--color-btn-selected-text)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  kpiBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.875rem',
  },
  kpiItem: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.875rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  kpiLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  kpiValue: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  drawerPanel: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-highlight)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: 'var(--box-shadow-hover)',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  drawerTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  closeIconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    margin: 0,
  },
  unassignedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  unassignedChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  initialsAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  unassignedMeta: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  guestNameText: {
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  partyText: {
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
  },
  floorplanGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  tableCard: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '1.25rem',
    boxShadow: 'var(--box-shadow-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  tableCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.75rem',
  },
  tableNameGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tableName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: 0,
  },
  tableCardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  capacityBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
  },
  actionIconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
  canvasContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '260px',
    padding: '1rem 0',
  },
  circleTableWrapper: {
    position: 'relative',
    width: '260px',
    height: '260px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTableDisc: {
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg)',
    border: '3px solid var(--color-primary)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0.5rem',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
  },
  discLabel: {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.85rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  discSubLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
    marginTop: '4px',
  },
  seatNodeCircle: {
    position: 'absolute',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  rectTableWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  rectTableContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.625rem',
  },
  rectSideRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.625rem',
    width: '100%',
    flexWrap: 'wrap',
  },
  rectMiddleRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.625rem',
    width: '100%',
  },
  rectTableSurface: {
    minWidth: '100px',
    height: '75px',
    backgroundColor: 'var(--color-bg)',
    border: '3px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0.375rem',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
  },
  rectTableSurfaceWithEnds: {
    minWidth: '100px',
    height: '75px',
    backgroundColor: 'var(--color-bg)',
    border: '3px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0.375rem',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
  },
  rectSeatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))',
    gap: '0.5rem',
    width: '100%',
    justifyItems: 'center',
  },
  seatNodeRect: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  seatedAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  emptySeatText: {
    fontSize: '1rem',
    color: 'var(--color-muted)',
    fontWeight: 700,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: 'var(--color-highlight)',
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalInitialsAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#000000',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  modalTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.2rem',
    margin: 0,
  },
  modalSubtitleText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: '#000000',
    opacity: 0.8,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  statusBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  infoBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  reassignBox: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  fieldLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  selectInput: {
    padding: '0.625rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    outline: 'none',
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  detailCard: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1rem',
  },
  detailLabel: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
    marginBottom: '0.25rem',
  },
  detailValue: {
    fontSize: '0.9rem',
    margin: 0,
    fontWeight: 600,
  },
  form: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  inputField: {
    padding: '0.625rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  shapeToggleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  shapeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem',
    border: '2px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: 'var(--color-text)',
  },
  hintText: {
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  saveBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
};
