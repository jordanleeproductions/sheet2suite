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
  Heart,
  Printer
} from 'lucide-react';

interface SeatingChartManagerProps {
  guests: Guest[];
  onUpdateGuests: (updatedGuests: Guest[]) => Promise<void>;
  isSyncing?: boolean;
  onOpenPrintStudio?: (template: 'place_cards' | 'table_cards' | 'timeline' | 'vendors') => void;
}

// Default Table Configurations if none exist
const INITIAL_TABLES: TableConfig[] = [
  { tableId: 'table-sweetheart', tableName: 'Sweetheart Table (Bride & Groom)', shape: 'rectangle', capacity: 2, singleSideSeating: true },
  { tableId: 'table-1', tableName: 'Table 1 - Head Table', shape: 'circle', capacity: 8 },
  { tableId: 'table-2', tableName: 'Table 2 - Family VIP', shape: 'square', capacity: 8 },
  { tableId: 'table-3', tableName: 'Table 3 - Bridal Party', shape: 'rectangle', capacity: 10 },
  { tableId: 'table-4', tableName: 'Table 4 - Friends & College', shape: 'circle', capacity: 6 },
];

export default function SeatingChartManager({ guests, onUpdateGuests, isSyncing, onOpenPrintStudio }: SeatingChartManagerProps) {
  const [tables, setTables] = useState<TableConfig[]>(INITIAL_TABLES);
  
  // Modals & Active Selections
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editingTable, setEditingTable] = useState<TableConfig | null>(null);
  const [tableToDelete, setTableToDelete] = useState<TableConfig | null>(null);
  const [assignSeatTable, setAssignSeatTable] = useState<TableConfig | null>(null);
  const [targetSeatIndex, setTargetSeatIndex] = useState<number | null>(null);
  const [assignSearch, setAssignSearch] = useState<string>('');
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

  // Seating Mode Switcher ('reception' | 'ceremony')
  const [seatingMode, setSeatingMode] = useState<'reception' | 'ceremony'>('reception');

  // Ceremony Aisle Config State
  const [ceremonyConfig, setCeremonyConfig] = useState({
    rowsCount: 7,
    chairsPerSide: 6,
    leftLabel: "Bride's Side (Left)",
    rightLabel: "Groom's Side (Right)",
  });

  // Ceremony Capacity Calculations: Accepted + Pending (excluding Declined)
  const ceremonyRequiredGuests = guests.filter(g => (g.rsvpStatus || '').toLowerCase() !== 'declined');
  const ceremonyDeclinedCount = guests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'declined').length;
  const totalCeremonyCapacity = ceremonyConfig.rowsCount * ceremonyConfig.chairsPerSide * 2;

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

  // Helper to assign a guest to a table and specific seat number
  const assignGuestToTable = async (guestId: string, tableName: string, seatNumber?: number) => {
    if (isSyncing) return;
    const updated = guests.map(g => 
      g.guestId === guestId 
        ? { ...g, tableAssignment: tableName, seatNumber: tableName === 'Unassigned' ? undefined : seatNumber } 
        : g
    );
    await onUpdateGuests(updated);
    
    // Reset all popups cleanly
    setSelectedGuest(null);
    setAssignSeatTable(null);
    setTargetSeatIndex(null);
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

    if (finalShape === 'square') {
      finalCapacity = finalCapacity <= 4 ? 4 : 8;
    } else if (finalShape === 'rectangle' && !tableFormState.singleSideSeating && finalCapacity % 2 !== 0) {
      finalCapacity = finalCapacity + 1;
    }

    const tableData: TableConfig = {
      tableId: isAddingTable ? `table-${Date.now()}` : editingTable!.tableId,
      tableName: tableFormState.tableName,
      shape: finalShape,
      capacity: finalCapacity,
      includeEndSeats: finalShape === 'rectangle' && !tableFormState.singleSideSeating ? (tableFormState.includeEndSeats || false) : false,
      singleSideSeating: finalShape === 'rectangle' ? (tableFormState.singleSideSeating || false) : false,
    };

    if (isAddingTable) {
      setTables([...tables, tableData]);
    } else if (editingTable) {
      setTables(tables.map(t => t.tableId === editingTable.tableId ? tableData : t));
    }

    setIsAddingTable(false);
    setEditingTable(null);
  };

  // Delete Table Confirmation Handler
  const confirmDeleteTable = () => {
    if (!tableToDelete) return;
    setTables(tables.filter(t => t.tableId !== tableToDelete.tableId));

    // Unassign guests at this table
    const updated = guests.map(g => 
      g.tableAssignment === tableToDelete.tableName ? { ...g, tableAssignment: 'Unassigned' } : g
    );
    onUpdateGuests(updated);
    setTableToDelete(null);
  };



  // Filtered tables by search
  const filteredTables = tables.filter(t => 
    t.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Seating Mode View Switcher Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          style={{
            padding: '0.55rem 1.1rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            backgroundColor: seatingMode === 'reception' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: seatingMode === 'reception' ? 'var(--color-on-primary)' : 'var(--color-text)',
            border: '1px solid var(--color-muted)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'var(--transition-smooth)',
          }}
          onClick={() => setSeatingMode('reception')}
        >
          <Utensils size={15} /> RECEPTION TABLES
        </button>
        <button
          type="button"
          style={{
            padding: '0.55rem 1.1rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            backgroundColor: seatingMode === 'ceremony' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: seatingMode === 'ceremony' ? 'var(--color-on-primary)' : 'var(--color-text)',
            border: '1px solid var(--color-muted)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'var(--transition-smooth)',
          }}
          onClick={() => setSeatingMode('ceremony')}
        >
          <Sparkles size={15} /> CEREMONY AISLE SEATING
        </button>
      </div>

      {/* Header Toolbar */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{seatingMode === 'reception' ? 'Visual Table Seating Plan' : 'Ceremony Aisle Seating Planner'}</h2>
          <p style={styles.subtitle}>
            {seatingMode === 'reception'
              ? 'Arrange seating layouts, configure seat capacities, and view guest profiles.'
              : 'Configure dual-side aisle seating, account for accepted + pending guests, and assign ceremony seats.'}
          </p>
        </div>

        <div style={styles.headerActions}>
          {onOpenPrintStudio && (
            <button 
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
              onClick={() => onOpenPrintStudio('table_cards')}
              title="Print Table Tent Cards & Seating Roster"
            >
              <Printer size={15} style={{ marginRight: '0.35rem' }} /> PRINT TABLE CARDS
            </button>
          )}

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
          <div style={styles.drawerList}>
            {unassignedGuests.map(guest => (
              <div 
                key={guest.guestId} 
                style={styles.drawerItem}
                onClick={() => setSelectedGuest(guest)}
              >
                <div style={styles.initialsAvatar}>
                  {getInitials(guest)}
                </div>
                <div style={styles.drawerItemMeta}>
                  <span style={styles.drawerItemName}>{guest.firstName} {guest.lastName}</span>
                  <span style={styles.drawerItemGroup}>{guest.partyGroup || 'No Party'} • {guest.rsvpStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW CONDITIONAL RENDERING: CEREMONY AISLE SEATING VS RECEPTION TABLES */}
      {seatingMode === 'ceremony' ? (
        <div className="ceremony-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          {/* Ceremony KPI Summary Strip */}
          <div style={styles.kpiBar}>
            <div style={styles.kpiItem}>
              <span style={styles.kpiLabel}>REQUIRED CEREMONY SEATS</span>
              <span style={{ ...styles.kpiValue, color: 'var(--color-primary)' }}>
                {ceremonyRequiredGuests.length}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                (Attending + Pending)
              </span>
            </div>
            <div style={styles.kpiItem}>
              <span style={styles.kpiLabel}>DECLINED GUESTS</span>
              <span style={{ ...styles.kpiValue, color: 'var(--color-muted)' }}>
                {ceremonyDeclinedCount}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                (Excluded)
              </span>
            </div>
            <div style={styles.kpiItem}>
              <span style={styles.kpiLabel}>TOTAL CHAIR CAPACITY</span>
              <span style={{ ...styles.kpiValue, color: totalCeremonyCapacity >= ceremonyRequiredGuests.length ? 'var(--color-green, #10b981)' : '#ef4444' }}>
                {totalCeremonyCapacity} Seats
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                ({ceremonyConfig.rowsCount} rows × {ceremonyConfig.chairsPerSide * 2} per row)
              </span>
            </div>
            <div style={styles.kpiItem}>
              <span style={styles.kpiLabel}>CONFIGURED LAYOUT</span>
              <span style={styles.kpiValue}>
                {ceremonyConfig.rowsCount} Rows
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                {ceremonyConfig.chairsPerSide} per side
              </span>
            </div>
          </div>

          {/* Ceremony Configuration Toolbar */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-muted)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Stepper: Rows Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>ROWS:</span>
                <button
                  type="button"
                  style={styles.actionIconBtn}
                  onClick={() => setCeremonyConfig(prev => ({ ...prev, rowsCount: Math.max(1, prev.rowsCount - 1) }))}
                >
                  -
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', minWidth: '24px', textAlign: 'center' }}>
                  {ceremonyConfig.rowsCount}
                </span>
                <button
                  type="button"
                  style={styles.actionIconBtn}
                  onClick={() => setCeremonyConfig(prev => ({ ...prev, rowsCount: Math.min(30, prev.rowsCount + 1) }))}
                >
                  +
                </button>
              </div>

              {/* Stepper: Chairs Per Side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>CHAIRS PER SIDE:</span>
                <button
                  type="button"
                  style={styles.actionIconBtn}
                  onClick={() => setCeremonyConfig(prev => ({ ...prev, chairsPerSide: Math.max(1, prev.chairsPerSide - 1) }))}
                >
                  -
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)', minWidth: '24px', textAlign: 'center' }}>
                  {ceremonyConfig.chairsPerSide}
                </span>
                <button
                  type="button"
                  style={styles.actionIconBtn}
                  onClick={() => setCeremonyConfig(prev => ({ ...prev, chairsPerSide: Math.min(15, prev.chairsPerSide + 1) }))}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={ceremonyConfig.leftLabel}
                onChange={(e) => setCeremonyConfig(prev => ({ ...prev, leftLabel: e.target.value }))}
                style={{ ...styles.inputField, width: '160px', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                placeholder="Left Side Label"
              />
              <input
                type="text"
                value={ceremonyConfig.rightLabel}
                onChange={(e) => setCeremonyConfig(prev => ({ ...prev, rightLabel: e.target.value }))}
                style={{ ...styles.inputField, width: '160px', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                placeholder="Right Side Label"
              />
            </div>
          </div>

          {/* Ceremony Altar Header Visual */}
          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            borderRadius: 'var(--border-radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            boxShadow: 'var(--box-shadow-subtle)',
          }}>
            💒 CEREMONY ALTAR / WEDDING ARCH
          </div>

          {/* Dual-Side Ceremony Rows Visual Canvas with Mobile Responsive Card Splitting */}
          <style>{`
            .ceremony-canvas-grid {
              display: grid;
              grid-template-columns: 1fr 60px 1fr;
              gap: 1rem;
            }
            @media (max-width: 768px) {
              .ceremony-canvas-grid {
                grid-template-columns: 1fr !important;
                gap: 1.5rem !important;
              }
              .ceremony-aisle-runner {
                display: none !important;
              }
            }
          `}</style>

          <div className="ceremony-canvas-grid">
            {/* LEFT SIDE CARD (Bride's Side) */}
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-muted)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 700, borderBottom: '1px solid var(--color-muted)', paddingBottom: '0.5rem', color: 'var(--color-primary)', textAlign: 'right' }}>
                {ceremonyConfig.leftLabel}
              </h3>
              {Array.from({ length: ceremonyConfig.rowsCount }).map((_, rIdx) => {
                const rowNum = rIdx + 1;
                const tableName = `Ceremony R${rowNum}-Left`;

                return (
                  <div key={`left-row-${rowNum}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', minWidth: '42px', color: 'var(--color-muted)', textAlign: 'right' }}>
                      ROW {rowNum}:
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {Array.from({ length: ceremonyConfig.chairsPerSide }).map((_, cIdx) => {
                        const seatNum = cIdx + 1;
                        const guest = guests.find(g => g.tableAssignment === tableName && g.seatNumber === seatNum);

                        return (
                          <div
                            key={`left-r${rowNum}-s${seatNum}`}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: guest ? 'var(--color-primary)' : 'var(--color-bg)',
                              color: guest ? 'var(--color-on-primary)' : 'var(--color-muted)',
                              border: guest ? '1px solid var(--color-primary)' : '1px dashed var(--color-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title={guest ? `${guest.firstName} ${guest.lastName} (${tableName}, Seat ${seatNum})` : `Row ${rowNum} Left, Seat ${seatNum}: Click to assign`}
                            onClick={() => {
                              const tableConfig: TableConfig = {
                                tableId: `ceremony-r${rowNum}-left`,
                                tableName,
                                shape: 'square',
                                capacity: ceremonyConfig.chairsPerSide,
                              };
                              if (guest) {
                                setSelectedGuest(guest);
                              } else {
                                setAssignSeatTable(tableConfig);
                                setTargetSeatIndex(seatNum);
                              }
                            }}
                          >
                            {guest ? getInitials(guest) : '+'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CENTRAL AISLE RUNNER (Hidden on Mobile) */}
            <div className="ceremony-aisle-runner" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderLeft: '2px dashed var(--color-muted)',
              borderRight: '2px dashed var(--color-muted)',
              backgroundColor: 'var(--color-bg)',
              borderRadius: '4px',
              padding: '0.5rem',
            }}>
              <span style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--color-muted)',
                letterSpacing: '0.2em',
              }}>
                CENTRAL AISLE
              </span>
            </div>

            {/* RIGHT SIDE CARD (Groom's Side) */}
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-muted)',
              borderRadius: 'var(--border-radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 700, borderBottom: '1px solid var(--color-muted)', paddingBottom: '0.5rem', color: 'var(--color-primary)' }}>
                {ceremonyConfig.rightLabel}
              </h3>
              {Array.from({ length: ceremonyConfig.rowsCount }).map((_, rIdx) => {
                const rowNum = rIdx + 1;
                const tableName = `Ceremony R${rowNum}-Right`;

                return (
                  <div key={`right-row-${rowNum}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', minWidth: '42px', color: 'var(--color-muted)' }}>
                      ROW {rowNum}:
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {Array.from({ length: ceremonyConfig.chairsPerSide }).map((_, cIdx) => {
                        const seatNum = cIdx + 1;
                        const guest = guests.find(g => g.tableAssignment === tableName && g.seatNumber === seatNum);

                        return (
                          <div
                            key={`right-r${rowNum}-s${seatNum}`}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: guest ? 'var(--color-primary)' : 'var(--color-bg)',
                              color: guest ? 'var(--color-on-primary)' : 'var(--color-muted)',
                              border: guest ? '1px solid var(--color-primary)' : '1px dashed var(--color-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title={guest ? `${guest.firstName} ${guest.lastName} (${tableName}, Seat ${seatNum})` : `Row ${rowNum} Right, Seat ${seatNum}: Click to assign`}
                            onClick={() => {
                              const tableConfig: TableConfig = {
                                tableId: `ceremony-r${rowNum}-right`,
                                tableName,
                                shape: 'square',
                                capacity: ceremonyConfig.chairsPerSide,
                              };
                              if (guest) {
                                setSelectedGuest(guest);
                              } else {
                                setAssignSeatTable(tableConfig);
                                setTargetSeatIndex(seatNum);
                              }
                            }}
                          >
                            {guest ? getInitials(guest) : '+'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
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

          {/* Main Floorplan Canvas Grid */}
          <div style={styles.floorplanGrid}>
        {filteredTables.map(table => {
          const seatedGuests = guests.filter(g => g.tableAssignment === table.tableName);
          const isOverCapacity = seatedGuests.length > table.capacity;

          // Helper to resolve specific guest at physical seat number (1..capacity)
          const getGuestAtSeat = (seatNum: number): Guest | undefined => {
            const exact = seatedGuests.find(g => g.seatNumber === seatNum);
            if (exact) return exact;
            const unassignedNumber = seatedGuests.filter(g => typeof g.seatNumber !== 'number');
            return unassignedNumber[seatNum - 1];
          };

          // Helper to handle seat clicks cleanly
          const handleSeatClick = (e: React.MouseEvent, guest: Guest | undefined, seatNum: number) => {
            e.stopPropagation();
            e.preventDefault();
            if (guest) {
              setAssignSeatTable(null);
              setTargetSeatIndex(null);
              setSelectedGuest(guest);
            } else {
              setSelectedGuest(null);
              setAssignSeatTable(table);
              setTargetSeatIndex(seatNum);
            }
          };

          return (
            <div key={table.tableId} style={styles.tableCard}>
              {/* Table Header Controls */}
              <div style={styles.tableCardHeader}>
                <div style={styles.tableNameGroup}>
                  {table.shape === 'circle' ? (
                    <Circle size={16} style={{ color: 'var(--color-highlight)' }} />
                  ) : table.shape === 'square' ? (
                    <Square size={16} style={{ color: 'var(--color-highlight)' }} />
                  ) : (
                    <Square size={16} style={{ color: 'var(--color-highlight)', transform: 'scaleX(1.3)' }} />
                  )}
                  <h3 style={styles.tableName}>{table.tableName}</h3>
                </div>

                <div style={styles.tableCardActions}>
                  <span style={{
                    ...styles.capacityBadge,
                    backgroundColor: isOverCapacity ? '#ef4444' : seatedGuests.length === table.capacity ? '#10b981' : 'var(--color-bg)',
                    color: isOverCapacity || seatedGuests.length === table.capacity ? '#ffffff' : 'var(--color-text)',
                    fontWeight: 700,
                  }}>
                    {isOverCapacity ? `⚠️ OVER CAPACITY (${seatedGuests.length}/${table.capacity})` : seatedGuests.length === table.capacity ? `FULL (${seatedGuests.length}/${table.capacity})` : `${seatedGuests.length} / ${table.capacity} Seats`}
                  </span>
                  <button style={styles.actionIconBtn} onClick={() => startEditTable(table)} title="Edit Table Config">
                    <Settings2 size={14} />
                  </button>
                  <button style={{ ...styles.actionIconBtn, color: '#ef4444' }} onClick={() => setTableToDelete(table)} title="Delete Table">
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
                      const seatNum = index + 1;
                      const angle = (index * (2 * Math.PI / table.capacity)) - (Math.PI / 2);
                      const radius = 112; // Radial distance from center in px
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      const guest = getGuestAtSeat(seatNum);

                      return (
                        <div
                          key={index}
                          style={{
                            ...styles.seatNodeCircle,
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                          onClick={(e) => handleSeatClick(e, guest, seatNum)}
                          title={guest ? `${guest.firstName} ${guest.lastName} (${guest.rsvpStatus})` : `Seat ${seatNum}: Click to assign guest`}
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
                ) : table.shape === 'square' ? (
                  // SQUARE TABLE VISUAL LAYOUT (Seats arranged on all 4 sides: Top, Right, Bottom, Left - strictly 4 or 8 seats)
                  (() => {
                    const cap = table.capacity <= 4 ? 4 : 8;
                    const perSide = Math.max(1, Math.floor(cap / 4));
                    const surfaceDim = perSide === 1 ? '135px' : '160px';

                    const renderSquareSeatNode = (seatNum: number, seatKey: string) => {
                      const guest = getGuestAtSeat(seatNum);
                      return (
                        <div
                          key={seatKey}
                          style={styles.seatNodeRect}
                          onClick={(e) => handleSeatClick(e, guest, seatNum)}
                          title={guest ? `${guest.firstName} ${guest.lastName} (${guest.rsvpStatus})` : `Seat ${seatNum}: Click to assign guest`}
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
                    };

                    return (
                      <div style={styles.squareTableContainer}>
                        {/* Top Side Row */}
                        <div style={styles.rectSideRow}>
                          {Array.from({ length: perSide }).map((_, i) => renderSquareSeatNode(i + 1, `square-top-${i}`))}
                        </div>

                        {/* Middle Row: Left Seats + Central Square Surface + Right Seats */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {Array.from({ length: perSide }).map((_, i) => renderSquareSeatNode(perSide * 3 + i + 1, `square-left-${i}`))}
                          </div>

                          <div style={{
                            ...styles.rectTableSurface,
                            width: surfaceDim,
                            height: surfaceDim,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '8px'
                          }}>
                            <Square size={20} style={{ color: 'var(--color-highlight)', marginBottom: '4px' }} />
                            <span style={{ ...styles.discLabel, fontSize: '0.95rem' }}>{table.tableName}</span>
                            <span style={{ ...styles.discSubLabel, fontSize: '0.7rem' }}>{seatedGuests.length} / {table.capacity} Seated</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {Array.from({ length: perSide }).map((_, i) => renderSquareSeatNode(perSide + i + 1, `square-right-${i}`))}
                          </div>
                        </div>

                        {/* Bottom Side Row */}
                        <div style={styles.rectSideRow}>
                          {Array.from({ length: perSide }).map((_, i) => renderSquareSeatNode(perSide * 2 + i + 1, `square-bottom-${i}`))}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // RECTANGULAR TABLE VISUAL LAYOUT (Supports single-side seating, top/bottom split, and end seats)
                  (() => {
                    const singleSide = table.singleSideSeating || false;
                    const includeEnd = table.includeEndSeats || false;
                    const cap = table.capacity;

                    const renderRectSeatNode = (seatNum: number, seatKey: string) => {
                      const guest = getGuestAtSeat(seatNum);
                      return (
                        <div
                          key={seatKey}
                          style={styles.seatNodeRect}
                          onClick={(e) => handleSeatClick(e, guest, seatNum)}
                          title={guest ? `${guest.firstName} ${guest.lastName} (${guest.rsvpStatus})` : `Seat ${seatNum}: Click to assign guest`}
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
                    };

                    if (singleSide) {
                      // SINGLE-SIDE SEATING: All seats placed on one side facing out
                      const dynamicWidth = `${Math.max(120, cap * 54 - 10)}px`;
                      return (
                        <div style={styles.rectTableContainer}>
                          {/* Top Single Row */}
                          <div style={styles.rectSideRow}>
                            {Array.from({ length: cap }).map((_, i) => renderRectSeatNode(i + 1, `single-${i}`))}
                          </div>

                          {/* Central Table Surface */}
                          <div style={{ ...styles.rectTableSurface, width: dynamicWidth }}>
                            <span style={styles.discLabel}>{table.tableName}</span>
                            <span style={styles.discSubLabel}>{seatedGuests.length} / {table.capacity} Seated</span>
                          </div>
                        </div>
                      );
                    } else if (!includeEnd) {
                      // DEFAULT: Even seats split on top and bottom rows
                      const sideCount = Math.max(1, Math.floor(cap / 2));
                      const dynamicWidth = `${Math.max(120, sideCount * 54 - 10)}px`;

                      return (
                        <div style={styles.rectTableContainer}>
                          {/* Top Side Row */}
                          <div style={styles.rectSideRow}>
                            {Array.from({ length: sideCount }).map((_, i) => renderRectSeatNode(i + 1, `top-${i}`))}
                          </div>

                          {/* Central Table Surface matching side seats length */}
                          <div style={{ ...styles.rectTableSurface, width: dynamicWidth }}>
                            <span style={styles.discLabel}>{table.tableName}</span>
                            <span style={styles.discSubLabel}>{seatedGuests.length} / {table.capacity} Seated</span>
                          </div>

                          {/* Bottom Side Row */}
                          <div style={styles.rectSideRow}>
                            {Array.from({ length: sideCount }).map((_, i) => renderRectSeatNode(sideCount + i + 1, `bottom-${i}`))}
                          </div>
                        </div>
                      );
                    } else {
                      // END SEATS ENABLED: 1 Head Seat (Left), 1 Foot Seat (Right), equal side seats top & bottom
                      const sideCount = Math.max(1, Math.floor((cap - 2) / 2));
                      const dynamicWidth = `${Math.max(120, sideCount * 54 - 10)}px`;

                      return (
                        <div style={styles.rectTableContainer}>
                          {/* Top Side Row */}
                          <div style={styles.rectSideRow}>
                            {Array.from({ length: sideCount }).map((_, i) => renderRectSeatNode(1 + i + 1, `top-${i}`))}
                          </div>

                          {/* Middle Row: Head End Seat + Table Surface + Foot End Seat */}
                          <div style={styles.rectMiddleRow}>
                            {renderRectSeatNode(1, 'head-seat')}
                            <div style={{ ...styles.rectTableSurfaceWithEnds, width: dynamicWidth }}>
                              <span style={styles.discLabel}>{table.tableName}</span>
                              <span style={styles.discSubLabel}>{seatedGuests.length} / {table.capacity} Seated</span>
                            </div>
                            {renderRectSeatNode(1 + sideCount + 1, 'foot-seat')}
                          </div>

                          {/* Bottom Side Row */}
                          <div style={styles.rectSideRow}>
                            {Array.from({ length: sideCount }).map((_, i) => renderRectSeatNode(2 + sideCount + i + 1, `bottom-${i}`))}
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
      </>
      )}

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

              {/* UNASSIGN SEAT BUTTON */}
              {selectedGuest.tableAssignment && selectedGuest.tableAssignment !== 'Unassigned' && (
                <button
                  type="button"
                  style={{
                    width: '100%',
                    marginTop: '1.25rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-red-muted)',
                    color: 'var(--color-red)',
                    border: '1px solid var(--color-red)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => {
                    assignGuestToTable(selectedGuest.guestId, 'Unassigned');
                    setSelectedGuest(null);
                  }}
                >
                  <Trash2 size={16} /> UNASSIGN SEAT FROM {selectedGuest.tableAssignment.toUpperCase()}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IN-APP GUEST SEAT ASSIGNMENT MODAL */}
      {assignSeatTable && (
        <div style={styles.modalOverlay} onClick={() => setAssignSeatTable(null)}>
          <div style={{ ...styles.modalContent, maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} style={{ color: 'var(--color-highlight)' }} />
                <h3 style={{ ...styles.modalTitle, color: '#000000' }} className="modalTitle">
                  ASSIGN SEAT {targetSeatIndex ? `#${targetSeatIndex}` : ''}: {assignSeatTable.tableName.toUpperCase()}
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#000000' }} className="closeBtn" onClick={() => { setAssignSeatTable(null); setTargetSeatIndex(null); }}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter guests by name or party..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  style={{
                    ...styles.inputField,
                    paddingLeft: '32px'
                  }}
                  autoFocus
                />
              </div>

              <span style={{ ...styles.fieldLabel, marginBottom: '0.5rem', display: 'block' }}>
                GUEST REGISTRY ({guests.filter(g => g.tableAssignment === 'Unassigned' || !g.tableAssignment).length} unassigned)
              </span>

              {/* Guest Selection List */}
              <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(() => {
                  const seatedPartyGroups = new Set(
                    guests
                      .filter(g => g.tableAssignment === assignSeatTable.tableName && g.partyGroup)
                      .map(g => g.partyGroup.toLowerCase().trim())
                  );

                  const getPriorityScore = (g: Guest) => {
                    const isUnassigned = !g.tableAssignment || g.tableAssignment === 'Unassigned';
                    const matchesParty = isUnassigned && g.partyGroup && seatedPartyGroups.has(g.partyGroup.toLowerCase().trim());
                    if (matchesParty) return 3; // Priority 1: Unassigned + Same Party Group
                    if (isUnassigned) return 2; // Priority 2: Unassigned
                    return 1; // Priority 3: Already assigned
                  };

                  const sortedGuests = guests
                    .filter(g => `${g.firstName} ${g.lastName} ${g.partyGroup || ''}`.toLowerCase().includes(assignSearch.toLowerCase()))
                    .sort((a, b) => {
                      const scoreA = getPriorityScore(a);
                      const scoreB = getPriorityScore(b);
                      if (scoreA !== scoreB) return scoreB - scoreA;
                      return (a.lastName || '').localeCompare(b.lastName || '');
                    });

                  if (sortedGuests.length === 0) {
                    return (
                      <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                        No matching guests found.
                      </p>
                    );
                  }

                  return sortedGuests.map(guest => {
                    const isAlreadyHere = guest.tableAssignment === assignSeatTable.tableName && guest.seatNumber === (targetSeatIndex || undefined);
                    const isUnassigned = !guest.tableAssignment || guest.tableAssignment === 'Unassigned';
                    const matchesSameParty = isUnassigned && guest.partyGroup && seatedPartyGroups.has(guest.partyGroup.toLowerCase().trim());

                    return (
                      <div
                        key={guest.guestId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.625rem 0.875rem',
                          backgroundColor: matchesSameParty 
                            ? 'rgba(16, 185, 129, 0.08)' 
                            : isAlreadyHere 
                            ? 'var(--color-gold-muted)' 
                            : 'var(--color-surface)',
                          border: matchesSameParty 
                            ? '2px solid #10b981' 
                            : isAlreadyHere 
                            ? '2px solid var(--color-gold)' 
                            : '1px solid var(--color-muted)',
                          borderRadius: 'var(--border-radius-sm)',
                          cursor: isAlreadyHere ? 'default' : 'pointer',
                          transition: 'var(--transition-smooth)'
                        }}
                        onClick={() => {
                          if (!isAlreadyHere) {
                            assignGuestToTable(guest.guestId, assignSeatTable.tableName, targetSeatIndex || undefined);
                            setAssignSeatTable(null);
                            setTargetSeatIndex(null);
                            setAssignSearch('');
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={styles.initialsAvatar}>
                            {getInitials(guest)}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', display: 'block' }}>
                              {guest.firstName} {guest.lastName}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                              {guest.partyGroup || 'General Guest'} • {guest.rsvpStatus}
                            </span>
                          </div>
                        </div>

                        <div>
                          {matchesSameParty ? (
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px'
                            }}>
                              🎉 SAME PARTY ({guest.partyGroup})
                            </span>
                          ) : isUnassigned ? (
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              backgroundColor: 'var(--color-gold-muted)',
                              color: 'var(--color-gold-dark, #b45309)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px'
                            }}>
                              UNASSIGNED
                            </span>
                          ) : (
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              color: 'var(--color-muted)',
                              backgroundColor: 'var(--color-bg)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid var(--color-muted)'
                            }}>
                              Seated at {guest.tableAssignment}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
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
                    <Square size={18} style={{ marginRight: '6px', transform: 'scaleX(1.3)' }} /> Rectangle
                  </button>

                  <button
                    type="button"
                    style={{
                      ...styles.shapeBtn,
                      borderColor: tableFormState.shape === 'square' ? 'var(--color-highlight)' : 'var(--color-muted)',
                      backgroundColor: tableFormState.shape === 'square' ? 'var(--color-surface)' : 'transparent'
                    }}
                    onClick={() => setTableFormState({ ...tableFormState, shape: 'square' })}
                  >
                    <Square size={18} style={{ marginRight: '6px' }} /> Square
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>SEAT CAPACITY (NUMBER OF SEATS) *</label>
                <input
                  type="number"
                  required
                  min="2"
                  max="32"
                  step={tableFormState.shape === 'rectangle' && !tableFormState.singleSideSeating ? 2 : tableFormState.shape === 'square' ? 4 : 1}
                  value={tableFormState.capacity || 8}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (tableFormState.shape === 'rectangle' && !tableFormState.singleSideSeating && val % 2 !== 0) {
                      val = val + 1;
                    }
                    setTableFormState({ ...tableFormState, capacity: val });
                  }}
                  style={styles.inputField}
                />
                <span style={styles.hintText}>
                  {tableFormState.shape === 'rectangle' 
                    ? (tableFormState.singleSideSeating ? 'Configure total single-sided seats (e.g. 2 for Sweetheart, 4 for Head Table).' : 'Rectangular tables enforce an even number of total seats.') 
                    : tableFormState.shape === 'square'
                    ? 'Square tables distribute seats equally on all 4 sides.'
                    : 'Configure total seats per table (e.g. 6, 8, 10, 12).'}
                </span>
              </div>

              {tableFormState.shape === 'rectangle' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text)', marginTop: '0.25rem' }}>
                      <input
                        type="checkbox"
                        checked={tableFormState.singleSideSeating || false}
                        onChange={(e) => setTableFormState({ 
                          ...tableFormState, 
                          singleSideSeating: e.target.checked,
                          includeEndSeats: e.target.checked ? false : tableFormState.includeEndSeats
                        })}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      Seating on single side (All seats arranged on one side, e.g. Sweetheart or Head Table)
                    </label>
                  </div>

                  {!tableFormState.singleSideSeating && (
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
                        By default (off), all seats are arranged evenly along top and bottom sides.
                      </span>
                    </div>
                  )}
                </>
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

      {/* IN-APP DELETE TABLE CONFIRMATION MODAL */}
      {tableToDelete && (
        <div style={styles.modalOverlay} onClick={() => setTableToDelete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE TABLE CONFIRMATION
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setTableToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-red)' }}>"{tableToDelete.tableName}"</strong>?
              </p>

              {guests.filter(g => g.tableAssignment === tableToDelete.tableName).length > 0 && (
                <div style={{ ...styles.reassignBox, borderColor: 'var(--color-red)', backgroundColor: 'var(--color-red-muted)' }}>
                  <span style={{ ...styles.fieldLabel, color: 'var(--color-red)' }}>
                    SEATED GUESTS IMPACT ({guests.filter(g => g.tableAssignment === tableToDelete.tableName).length} guests)
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text)', margin: '0.25rem 0 0 0' }}>
                    Deleting this table will automatically unassign all seated guests and move them back into the Unassigned Pool.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
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
                  onClick={() => setTableToDelete(null)}
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
                  onClick={confirmDeleteTable}
                >
                  DELETE TABLE
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
    maxWidth: '100%',
    overflow: 'hidden',
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
    padding: '1rem 0.5rem',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  squareTableContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.625rem',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  circleTableWrapper: {
    position: 'relative',
    width: '275px',
    height: '275px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTableDisc: {
    width: '145px',
    height: '145px',
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
    width: '44px',
    height: '44px',
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
    height: '80px',
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
    height: '80px',
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
    width: '44px',
    height: '44px',
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
    fontSize: '0.8rem',
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
