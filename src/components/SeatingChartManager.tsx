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
  Utensils, 
  User, 
  UserCheck, 
  Settings2,
  Sparkles,
  Search,
  Filter,
  Heart,
  Printer,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Star,
  SlidersHorizontal
} from 'lucide-react';
import MobileFAB from '@/components/MobileFAB';
import PageSearchInput from '@/components/PageSearchInput';
import PageHeaderCard from '@/components/vow/PageHeaderCard';
import PageMetricStrip from '@/components/vow/PageMetricStrip';
import { triggerConfetti } from '@/lib/confetti';

interface SeatingChartManagerProps {
  guests: Guest[];
  tables?: TableConfig[];
  onUpdateGuests: (updatedGuests: Guest[]) => Promise<void>;
  onUpdateTables?: (updatedTables: TableConfig[]) => Promise<void>;
  isSyncing?: boolean;
  onOpenPrintStudio?: (template: 'place_cards' | 'table_cards' | 'timeline' | 'vendors') => void;
}

// Default Table Configurations if none exist (Only sweetheart table)
const INITIAL_TABLES: TableConfig[] = [
  { tableId: 'table-sweetheart', tableName: 'Sweetheart Table (Bride & Groom)', shape: 'rectangle', capacity: 2, singleSideSeating: true },
];

// Generate clean, human-readable, sequence-based table IDs (e.g. table-1, table-2, table-sweetheart)
export function generateNextTableId(tableName: string, existingTables: TableConfig[]): string {
  const existingIds = new Set(existingTables.map(t => (t.tableId || '').trim().toLowerCase()));

  const trimmedName = (tableName || '').trim();

  // 1. If table name specifies a number like "Table 3", "Table 3 - VIP", or "T3"
  const nameNumberMatch = trimmedName.match(/^(?:table|t)\s*(\d+)/i);
  if (nameNumberMatch) {
    const specifiedNum = parseInt(nameNumberMatch[1], 10);
    const candidate = `table-${specifiedNum}`;
    if (!existingIds.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  // 2. If custom semantic name like "Sweetheart Table", "Head Table", "Kids Table", etc.
  // Strip leading or trailing "table" word so "Sweetheart Table" -> "sweetheart"
  const cleanSlug = trimmedName
    .toLowerCase()
    .replace(/^table\s*[-_]?/i, '')
    .replace(/[-_\s]?table$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (cleanSlug && cleanSlug !== 'table' && !/^\d+$/.test(cleanSlug)) {
    const candidate = `table-${cleanSlug}`;
    if (!existingIds.has(candidate.toLowerCase())) {
      return candidate;
    }
    let counter = 2;
    while (existingIds.has(`${candidate}-${counter}`.toLowerCase())) {
      counter++;
    }
    return `${candidate}-${counter}`;
  }

  // 3. Fallback: compact sequence (table-${nextAvailableNumber})
  let nextNum = 1;
  while (existingIds.has(`table-${nextNum}`.toLowerCase())) {
    nextNum++;
  }
  return `table-${nextNum}`;
}

// Calculate the next suggested display table number based on existing tables
export function getNextSuggestedTableNumber(existingTables: TableConfig[]): number {
  const isSpecialTable = (t: TableConfig): boolean => {
    const name = (t.tableName || '').toLowerCase();
    const id = (t.tableId || '').toLowerCase();
    return name.includes('sweetheart') || name.includes('head') || id.includes('sweetheart') || id.includes('head');
  };

  const hasSpecialTable = existingTables.some(isSpecialTable);

  // Collect numbers currently in use by numbered tables (ignore special sweetheart / head tables)
  const usedNumbers = new Set<number>();
  existingTables.forEach(t => {
    if (isSpecialTable(t)) return;
    const matchName = (t.tableName || '').match(/Table\s*(\d+)/i);
    const matchId = (t.tableId || '').match(/^table[-_]?(\d+)$/i);
    if (matchName) usedNumbers.add(parseInt(matchName[1], 10));
    else if (matchId) usedNumbers.add(parseInt(matchId[1], 10));
  });

  // Dynamically set based on total number of tables; if Sweetheart or Head table exists, subtract 1
  // Example: 1 Sweetheart Table -> (1 - 1) + 1 = 1 -> "Table 1"
  const countOffset = hasSpecialTable ? 1 : 0;
  const targetNumber = Math.max(1, (existingTables.length - countOffset) + 1);

  // If targetNumber is not already used, fill lowest gap if one exists below it, otherwise use targetNumber
  if (!usedNumbers.has(targetNumber)) {
    let lowestGap = 1;
    while (usedNumbers.has(lowestGap)) {
      lowestGap++;
    }
    return Math.min(lowestGap, targetNumber);
  }

  // Otherwise find lowest available positive integer
  let candidate = targetNumber;
  while (usedNumbers.has(candidate)) {
    candidate++;
  }
  return candidate;
}

export default function SeatingChartManager({ guests, tables: tablesProp, onUpdateGuests, onUpdateTables, isSyncing, onOpenPrintStudio }: SeatingChartManagerProps) {
  // Filter out any ghost/empty records with no tableId
  const sanitizeTables = (raw?: TableConfig[]): TableConfig[] => {
    if (!raw) return [];
    return raw.filter(t => Boolean(t && t.tableId && t.tableId.trim() !== ''));
  };

  const [tables, setTables] = useState<TableConfig[]>(() => {
    const valid = sanitizeTables(tablesProp);
    if (valid.length > 0) return valid;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('s2v_tables_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const sanitizedSaved = sanitizeTables(parsed);
          if (sanitizedSaved.length > 0) return sanitizedSaved;
        } catch (e) {}
      }
    }
    return INITIAL_TABLES;
  });

  // Synchronize when tables prop updates from sheets
  React.useEffect(() => {
    if (tablesProp !== undefined) {
      const valid = sanitizeTables(tablesProp);
      const toSet = valid.length > 0 ? valid : INITIAL_TABLES;
      setTables(toSet);
      if (typeof window !== 'undefined') {
        localStorage.setItem('s2v_tables_config', JSON.stringify(toSet));
      }
    }
  }, [tablesProp]);

  // Helper to persist tables to state, localStorage, and 2-way Google Sheets sync
  const saveTables = async (updatedTables: TableConfig[]) => {
    const valid = sanitizeTables(updatedTables);
    setTables(valid);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s2v_tables_config', JSON.stringify(valid));
    }
    if (onUpdateTables) {
      try {
        await onUpdateTables(valid);
      } catch (err) {
        console.error('Error syncing tables to Google Sheets:', err);
      }
    }
  };

  // Helper to check if a guest belongs to a given table (supporting tableId or legacy tableName)
  const isGuestAtTable = (guest: Guest, table?: Partial<TableConfig> | null): boolean => {
    if (!guest || !guest.tableAssignment || !table) return false;
    const assignment = guest.tableAssignment.trim().toLowerCase();
    const tableId = (table.tableId || '').trim().toLowerCase();
    const tableName = (table.tableName || '').trim().toLowerCase();
    return (Boolean(tableId) && assignment === tableId) || (Boolean(tableName) && assignment === tableName);
  };

  // Helper to stably resolve physical seat numbers (1..capacity) for all guests at a table
  const getResolvedGuestSeatsForTable = (table: TableConfig, tableGuests: Guest[]): Map<string, number> => {
    const result = new Map<string, number>();
    const takenSeats = new Set<number>();
    const unplacedGuests: Guest[] = [];

    // Step 1: Retain guests who already have valid physical seat numbers (1..capacity) without duplicates
    tableGuests.forEach((g) => {
      if (
        typeof g.seatNumber === 'number' &&
        g.seatNumber >= 1 &&
        g.seatNumber <= table.capacity &&
        !takenSeats.has(g.seatNumber)
      ) {
        takenSeats.add(g.seatNumber);
        result.set(g.guestId, g.seatNumber);
      } else {
        unplacedGuests.push(g);
      }
    });

    // Step 2: Identify all open physical seat slots in ascending order
    const openSlots: number[] = [];
    for (let s = 1; s <= table.capacity; s++) {
      if (!takenSeats.has(s)) {
        openSlots.push(s);
      }
    }

    // Step 3: Allocate open slots to unplaced guests in a stable, predictable order
    unplacedGuests.forEach((g, idx) => {
      if (idx < openSlots.length) {
        result.set(g.guestId, openSlots[idx]);
      }
    });

    return result;
  };

  // Helper to resolve table display name for a guest
  const getTableForGuest = (guest: Guest): TableConfig | undefined => {
    if (!guest.tableAssignment || guest.tableAssignment === 'Unassigned') return undefined;
    return tables.find(t => isGuestAtTable(guest, t));
  };
  
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

  // Ceremony Mobile & View States
  const [ceremonyMobileView, setCeremonyMobileView] = useState<'aisle' | 'roster'>('aisle');
  const [selectedCeremonyRow, setSelectedCeremonyRow] = useState<number | null>(null);
  const [showCeremonySettings, setShowCeremonySettings] = useState<boolean>(false);
  const [rosterSideTab, setRosterSideTab] = useState<'left' | 'right'>('left');

  // Seating Capacity Calculations: Accepted + Pending RSVP (excluding Declined)
  const eligibleSeatingGuests = guests.filter(g => (g.rsvpStatus || '').toLowerCase() !== 'declined');
  const ceremonyRequiredGuests = eligibleSeatingGuests;
  const ceremonyDeclinedCount = guests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'declined').length;
  const totalCeremonyCapacity = ceremonyConfig.rowsCount * ceremonyConfig.chairsPerSide * 2;

  // Calculate assigned vs unassigned guests (excluding Declined guests)
  const unassignedGuests = eligibleSeatingGuests.filter(
    g => !g.tableAssignment || g.tableAssignment.trim() === '' || g.tableAssignment === 'Unassigned'
  );
  const seatedGuestsCount = eligibleSeatingGuests.filter(
    g => g.tableAssignment && g.tableAssignment.trim() !== '' && g.tableAssignment !== 'Unassigned'
  ).length;
  
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

  // Helper to find guest seated at a ceremony row & seat (resilient to ID vs Name formatting)
  const getCeremonyGuest = (tableName: string, seatNum: number): Guest | undefined => {
    const norm = tableName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return guests.find(g => {
      if (g.seatNumber !== seatNum) return false;
      const cNorm = (g.ceremonySeating || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const tNorm = (g.tableAssignment || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        g.ceremonySeating === tableName ||
        g.tableAssignment === tableName ||
        (cNorm !== '' && cNorm === norm) ||
        (tNorm !== '' && tNorm === norm)
      );
    });
  };

  // Helper to assign a guest to a table (by tableId or tableName) and specific seat number
  const assignGuestToTable = async (guestId: string, tableIdOrName: string, seatNumber?: number, isCeremonyMode = false) => {
    if (isSyncing) return;

    // 1. Resolve canonical tableId and TableConfig if assigning to a table
    let targetAssignment = tableIdOrName;
    let targetTable: TableConfig | undefined;
    if (!isCeremonyMode && tableIdOrName !== 'Unassigned') {
      targetTable = tables.find(
        (t) =>
          t.tableId.toLowerCase() === tableIdOrName.toLowerCase() ||
          t.tableName.toLowerCase() === tableIdOrName.toLowerCase()
      );
      if (targetTable) {
        targetAssignment = targetTable.tableId;
      }
    }

    // Special handling for Ceremony mode
    if (isCeremonyMode) {
      const normTarget = tableIdOrName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const updated = guests.map((g) => {
        if (g.guestId === guestId) {
          return {
            ...g,
            ceremonySeating: tableIdOrName === 'Unassigned' ? '' : tableIdOrName,
            tableAssignment: (g.tableAssignment || '').startsWith('Ceremony')
              ? (tableIdOrName === 'Unassigned' ? 'Unassigned' : tableIdOrName)
              : g.tableAssignment,
            seatNumber: tableIdOrName === 'Unassigned' ? undefined : seatNumber,
          };
        }
        // If assigning to a specific seat, vacate any prior guest who occupied this seat
        if (
          tableIdOrName !== 'Unassigned' &&
          seatNumber !== undefined &&
          g.seatNumber === seatNumber
        ) {
          const cNorm = (g.ceremonySeating || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const tNorm = (g.tableAssignment || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (
            cNorm === normTarget ||
            tNorm === normTarget ||
            g.ceremonySeating === tableIdOrName ||
            g.tableAssignment === tableIdOrName
          ) {
            return {
              ...g,
              ceremonySeating: '',
              tableAssignment: (g.tableAssignment || '').startsWith('Ceremony') ? 'Unassigned' : g.tableAssignment,
              seatNumber: undefined,
            };
          }
        }
        return g;
      });
      await onUpdateGuests(updated);
      setSelectedGuest(null);
      setAssignSeatTable(null);
      setTargetSeatIndex(null);
      setAssignSearch('');
      return;
    }

    // 2. Lock in currently displayed physical seat numbers across all tables
    // so removing or reassigning any guest never causes other guests to shift!
    const guestSeatUpdates = new Map<string, { tableAssignment: string; seatNumber?: number }>();

    tables.forEach((tbl) => {
      const seated = guests.filter((g) => isGuestAtTable(g, tbl));
      const resolvedSeats = getResolvedGuestSeatsForTable(tbl, seated);
      seated.forEach((g) => {
        const resolvedSeat = resolvedSeats.get(g.guestId);
        guestSeatUpdates.set(g.guestId, {
          tableAssignment: tbl.tableId,
          seatNumber: resolvedSeat,
        });
      });
    });

    // 3. Determine target seat number for the guest being assigned/unassigned
    let finalSeatNumber = seatNumber;

    if (tableIdOrName !== 'Unassigned' && targetTable) {
      if (
        typeof finalSeatNumber === 'number' &&
        finalSeatNumber >= 1 &&
        finalSeatNumber <= targetTable.capacity
      ) {
        // Specific seat requested: check for collision at targetTable
        guests.forEach((g) => {
          if (g.guestId !== guestId) {
            const currentUpdate = guestSeatUpdates.get(g.guestId);
            const currentTable = currentUpdate?.tableAssignment || g.tableAssignment;
            const currentSeat = currentUpdate?.seatNumber ?? g.seatNumber;
            if (
              (currentTable === targetTable!.tableId || isGuestAtTable(g, targetTable!)) &&
              currentSeat === finalSeatNumber
            ) {
              // Vacate the seat from the previous occupant
              guestSeatUpdates.set(g.guestId, {
                tableAssignment: targetTable!.tableId,
                seatNumber: undefined,
              });
            }
          }
        });
      } else {
        // No specific seatNumber requested (e.g. from table dropdown): find first available slot
        const taken = new Set<number>();
        guests.forEach((g) => {
          if (g.guestId !== guestId) {
            const currentUpdate = guestSeatUpdates.get(g.guestId);
            const currentTable = currentUpdate?.tableAssignment || g.tableAssignment;
            const currentSeat = currentUpdate?.seatNumber ?? g.seatNumber;
            if (
              (currentTable === targetTable!.tableId || isGuestAtTable(g, targetTable!)) &&
              typeof currentSeat === 'number' &&
              currentSeat >= 1 &&
              currentSeat <= targetTable!.capacity
            ) {
              taken.add(currentSeat);
            }
          }
        });

        for (let s = 1; s <= targetTable.capacity; s++) {
          if (!taken.has(s)) {
            finalSeatNumber = s;
            break;
          }
        }
      }
    }

    // 4. Update the target guest's record
    if (tableIdOrName === 'Unassigned') {
      guestSeatUpdates.set(guestId, {
        tableAssignment: 'Unassigned',
        seatNumber: undefined,
      });
    } else {
      guestSeatUpdates.set(guestId, {
        tableAssignment: targetAssignment,
        seatNumber: finalSeatNumber,
      });
    }

    // 5. Construct updated guests array
    const updated = guests.map((g) => {
      const update = guestSeatUpdates.get(g.guestId);
      if (update) {
        return {
          ...g,
          tableAssignment: update.tableAssignment,
          seatNumber: update.seatNumber,
        };
      }
      return g;
    });

    await onUpdateGuests(updated);

    const remainingUnassigned = updated.filter(
      (g) =>
        (g.rsvpStatus === 'Attending' || g.rsvpStatus === 'No Response') &&
        (!g.tableAssignment || g.tableAssignment.trim() === '' || g.tableAssignment === 'Unassigned')
    );
    if (remainingUnassigned.length === 0 && updated.length > 0) {
      triggerConfetti({ particleCount: 90 });
    }

    // Reset all popups cleanly
    setSelectedGuest(null);
    setAssignSeatTable(null);
    setTargetSeatIndex(null);
    setAssignSearch('');
  };

  // Open Add Table Modal
  const startAddTable = () => {
    const nextTableNumber = getNextSuggestedTableNumber(tables);
    setTableFormState({
      tableName: `Table ${nextTableNumber}`,
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
  const saveTableConfig = (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();
    if (!tableFormState.tableName) {
      alert('Please enter a Table Name.');
      return;
    }

    let finalCapacity = Number(tableFormState.capacity) || 8;
    const finalShape = tableFormState.shape || 'circle';

    if (finalShape === 'square') {
      finalCapacity = finalCapacity <= 4 ? 4 : 8;
    } else if (finalShape === 'rectangle' && !tableFormState.singleSideSeating && finalCapacity % 2 !== 0) {
      finalCapacity = finalCapacity + 1;
    }

    const tableData: TableConfig = {
      tableId: isAddingTable ? generateNextTableId(tableFormState.tableName, tables) : editingTable!.tableId,
      tableName: tableFormState.tableName,
      shape: finalShape,
      capacity: finalCapacity,
      includeEndSeats: finalShape === 'rectangle' && !tableFormState.singleSideSeating ? (tableFormState.includeEndSeats || false) : false,
      singleSideSeating: finalShape === 'rectangle' ? (tableFormState.singleSideSeating || false) : false,
    };

    let updatedTables: TableConfig[];
    if (isAddingTable) {
      updatedTables = [...tables, tableData];
      saveTables(updatedTables);
    } else if (editingTable) {
      updatedTables = tables.map(t => t.tableId === editingTable.tableId ? tableData : t);
      saveTables(updatedTables);
    } else {
      return;
    }

    if (continueAdding) {
      const nextTableNumber = getNextSuggestedTableNumber(updatedTables);
      setTableFormState({
        tableName: `Table ${nextTableNumber}`,
        shape: tableFormState.shape || 'circle',
        capacity: tableFormState.capacity || 8,
        includeEndSeats: false,
        singleSideSeating: false,
      });
      setIsAddingTable(true);
      setEditingTable(null);
    } else {
      setIsAddingTable(false);
      setEditingTable(null);
    }
  };

  // Delete Table Confirmation Handler
  const confirmDeleteTable = () => {
    if (!tableToDelete) return;
    const updatedTables = tables.filter(t => t.tableId !== tableToDelete.tableId);
    saveTables(updatedTables);

    // Unassign guests at this table (matching by tableId or legacy tableName)
    const updated = guests.map(g => 
      isGuestAtTable(g, tableToDelete) ? { ...g, tableAssignment: 'Unassigned', seatNumber: undefined } : g
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
      {/* 0. Page Header Card [Consistent Monarch UX] */}
      <PageHeaderCard
        title={seatingMode === 'reception' ? 'Seating & Tables' : 'Ceremony Aisle Seating'}
        subtitle={seatingMode === 'reception'
          ? 'Arrange floorplan layouts, configure seat capacities, and view guest assignments.'
          : 'Configure dual-side aisle seating, account for accepted + pending guests, and assign ceremony seats.'
        }
        segmentSwitcher={{
          options: [
            { id: 'reception', label: 'RECEPTION TABLES', icon: Utensils, count: tables.length },
            { id: 'ceremony', label: 'CEREMONY AISLE', icon: Sparkles },
          ],
          activeId: seatingMode,
          onChange: (id) => setSeatingMode(id as 'reception' | 'ceremony'),
        }}
        actions={
          <>
            {onOpenPrintStudio && (
              <button 
                type="button"
                className="s2v-header-btn s2v-header-btn-secondary"
                onClick={() => onOpenPrintStudio('table_cards')}
                title="Print Table Tent Cards & Seating Roster"
              >
                <Printer size={14} />
                <span>PRINT CARDS</span>
              </button>
            )}

            <button 
              type="button"
              className="s2v-header-btn s2v-header-btn-secondary"
              onClick={() => setShowUnassignedDrawer(!showUnassignedDrawer)}
              style={{
                borderColor: unassignedGuests.length > 0 ? 'var(--color-amber, #F59E0B)' : undefined,
                color: unassignedGuests.length > 0 ? 'var(--color-amber-dark, #92400E)' : undefined,
              }}
            >
              <UserPlus size={14} />
              <span>UNASSIGNED ({unassignedGuests.length})</span>
            </button>

            <button
              type="button"
              className="s2v-header-btn s2v-header-btn-primary seating-add-table-btn"
              onClick={startAddTable}
              disabled={isSyncing}
              title="Add New Table"
            >
              <Plus size={14} />
              <span>ADD TABLE</span>
            </button>
          </>
        }
      />

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
          <div style={styles.unassignedGrid}>
            {unassignedGuests.map(guest => (
              <div 
                key={guest.guestId} 
                style={styles.unassignedChip}
                onClick={() => setSelectedGuest(guest)}
              >
                <div style={styles.initialsAvatar}>
                  {getInitials(guest)}
                </div>
                <div style={styles.unassignedMeta}>
                  <span style={styles.guestNameText}>{guest.firstName} {guest.lastName}</span>
                  <span style={styles.partyText}>{guest.partyGroup || 'No Party'} • {guest.rsvpStatus}</span>
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
          <PageMetricStrip
            style={{ marginBottom: '0.5rem' }}
            metrics={[
              {
                id: 'ceremony-needed',
                label: 'SEATS NEEDED',
                value: ceremonyRequiredGuests.length,
                subtext: 'Attending + Pending',
                statusBadge: 'Required',
                statusColor: 'blue',
              },
              {
                id: 'ceremony-declined',
                label: 'DECLINED GUESTS',
                value: ceremonyDeclinedCount,
                subtext: 'Excluded from chairs',
                statusColor: 'neutral',
              },
              {
                id: 'ceremony-capacity',
                label: 'CHAIR CAPACITY',
                value: `${totalCeremonyCapacity} Seats`,
                subtext: `${ceremonyConfig.rowsCount} rows × ${ceremonyConfig.chairsPerSide * 2} chairs`,
                statusBadge: totalCeremonyCapacity >= ceremonyRequiredGuests.length ? 'Sufficient' : 'Shortage',
                statusColor: totalCeremonyCapacity >= ceremonyRequiredGuests.length ? 'green' : 'red',
              },
              {
                id: 'ceremony-layout',
                label: 'CURRENT LAYOUT',
                value: `${ceremonyConfig.rowsCount} Rows`,
                subtext: `${ceremonyConfig.chairsPerSide} chairs / side`,
                statusColor: 'neutral',
              },
            ]}
          />

          {/* Ceremony Configuration & View Controls Toolbar */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-muted)',
            borderRadius: 'var(--border-radius-md)',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {/* Top Row: View Switcher (Aisle vs Roster) + Settings (Desktop inline / Mobile toggle button) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              {/* View Switcher Pills */}
              <div style={{
                display: 'inline-flex',
                backgroundColor: 'var(--color-bg)',
                padding: '3px',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--color-muted)',
                gap: '2px',
              }}>
                <button
                  type="button"
                  onClick={() => setCeremonyMobileView('aisle')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: ceremonyMobileView === 'aisle' ? 'var(--color-primary)' : 'transparent',
                    color: ceremonyMobileView === 'aisle' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  <LayoutGrid size={14} /> AISLE MAP
                </button>
                <button
                  type="button"
                  onClick={() => setCeremonyMobileView('roster')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: ceremonyMobileView === 'roster' ? 'var(--color-primary)' : 'transparent',
                    color: ceremonyMobileView === 'roster' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  <List size={14} /> ROW ROSTER
                </button>
              </div>

              {/* Mobile Settings Toggle Button */}
              <div className="ceremony-mobile-settings-toggle">
                <button
                  type="button"
                  onClick={() => setShowCeremonySettings(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--color-muted)',
                    backgroundColor: showCeremonySettings ? 'var(--color-highlight)' : 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Settings2 size={14} />
                  <span>SETTINGS: {ceremonyConfig.rowsCount}R × {ceremonyConfig.chairsPerSide}C</span>
                  {showCeremonySettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Desktop Steppers & Labels (Inline) */}
              <div className="ceremony-desktop-settings" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
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
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>CHAIRS / SIDE:</span>
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

                {/* Inputs: Left / Right Labels */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={ceremonyConfig.leftLabel}
                    onChange={(e) => setCeremonyConfig(prev => ({ ...prev, leftLabel: e.target.value }))}
                    style={{ ...styles.inputField, width: '150px', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    placeholder="Left Side Label"
                  />
                  <input
                    type="text"
                    value={ceremonyConfig.rightLabel}
                    onChange={(e) => setCeremonyConfig(prev => ({ ...prev, rightLabel: e.target.value }))}
                    style={{ ...styles.inputField, width: '150px', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    placeholder="Right Side Label"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Collapsible Settings Drawer */}
            {showCeremonySettings && (
              <div className="ceremony-mobile-settings-drawer" style={{
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>CHAIRS / SIDE:</span>
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
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={ceremonyConfig.leftLabel}
                    onChange={(e) => setCeremonyConfig(prev => ({ ...prev, leftLabel: e.target.value }))}
                    style={{ ...styles.inputField, flex: 1, minWidth: '130px', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    placeholder="Left Side Label"
                  />
                  <input
                    type="text"
                    value={ceremonyConfig.rightLabel}
                    onChange={(e) => setCeremonyConfig(prev => ({ ...prev, rightLabel: e.target.value }))}
                    style={{ ...styles.inputField, flex: 1, minWidth: '130px', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    placeholder="Right Side Label"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Row Jump Pill Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}>
            <span style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--color-muted)',
              textTransform: 'uppercase',
              flexShrink: 0,
              marginRight: '0.25rem',
            }}>
              JUMP:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCeremonyRow(null)}
              style={{
                padding: '0.35rem 0.7rem',
                borderRadius: '999px',
                border: selectedCeremonyRow === null ? '1px solid var(--color-primary)' : '1px solid var(--color-muted)',
                backgroundColor: selectedCeremonyRow === null ? 'var(--color-primary)' : 'var(--color-surface)',
                color: selectedCeremonyRow === null ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'var(--transition-smooth)',
              }}
            >
              ALL ROWS ({ceremonyConfig.rowsCount})
            </button>
            {Array.from({ length: ceremonyConfig.rowsCount }).map((_, rIdx) => {
              const rowNum = rIdx + 1;
              const isSelected = selectedCeremonyRow === rowNum;
              const isVip = rowNum <= 2;
              return (
                <button
                  key={`jump-row-${rowNum}`}
                  type="button"
                  onClick={() => setSelectedCeremonyRow(isSelected ? null : rowNum)}
                  style={{
                    padding: '0.35rem 0.7rem',
                    borderRadius: '999px',
                    border: isSelected ? '1px solid var(--color-primary)' : isVip ? '1px solid var(--color-gold-dark, #b45309)' : '1px solid var(--color-muted)',
                    backgroundColor: isSelected ? 'var(--color-primary)' : isVip ? 'var(--color-gold-muted, #fef3c7)' : 'var(--color-surface)',
                    color: isSelected ? 'var(--color-on-primary, #ffffff)' : isVip ? 'var(--color-gold-dark, #b45309)' : 'var(--color-text)',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  {isVip && <Star size={11} fill="currentColor" />} ROW {rowNum}
                </button>
              );
            })}
          </div>

          {/* Ceremony Altar Header Visual */}
          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary, #ffffff)',
            borderRadius: 'var(--border-radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            boxShadow: 'var(--box-shadow-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}>
            <span>💒</span>
            <span>CEREMONY ALTAR / WEDDING ARCH</span>
            <span>💒</span>
          </div>

          {/* CSS Responsive Styles for Mobile vs Desktop Ceremony Decks */}
          <style>{`
            .ceremony-canvas-grid {
              display: grid;
              grid-template-columns: 1fr 60px 1fr;
              gap: 1rem;
            }
            .ceremony-mobile-deck {
              display: none;
              flex-direction: column;
              gap: 0.875rem;
            }
            .ceremony-mobile-settings-toggle {
              display: none;
            }
            .ceremony-desktop-settings {
              display: flex;
            }
            @media (max-width: 768px) {
              .ceremony-canvas-grid {
                display: none !important;
              }
              .ceremony-mobile-deck {
                display: flex !important;
              }
              .ceremony-mobile-settings-toggle {
                display: block !important;
              }
              .ceremony-desktop-settings {
                display: none !important;
              }
            }
          `}</style>

          {/* VIEW MODE 1: VISUAL AISLE MAP */}
          {ceremonyMobileView === 'aisle' && (
            <>
              {/* DESKTOP 3-COLUMN CANVAS GRID (Visible >= 769px) */}
              <div className="ceremony-canvas-grid">
                {/* LEFT SIDE CARD */}
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
                  {Array.from({ length: ceremonyConfig.rowsCount })
                    .map((_, rIdx) => rIdx + 1)
                    .filter(r => selectedCeremonyRow === null || selectedCeremonyRow === r)
                    .map(rowNum => {
                      const tableName = `Ceremony R${rowNum}-Left`;
                      const isVip = rowNum <= 2;
                      return (
                        <div key={`left-row-${rowNum}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', minWidth: '48px', color: isVip ? 'var(--color-gold-dark, #b45309)' : 'var(--color-muted)', textAlign: 'right', fontWeight: isVip ? 700 : 500 }}>
                            {isVip && '⭐ '}ROW {rowNum}:
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {Array.from({ length: ceremonyConfig.chairsPerSide }).map((_, cIdx) => {
                              const seatNum = cIdx + 1;
                              const guest = getCeremonyGuest(tableName, seatNum);
                              return (
                                <div
                                  key={`left-r${rowNum}-s${seatNum}`}
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '6px',
                                    backgroundColor: guest ? 'var(--color-primary)' : 'var(--color-bg)',
                                    color: guest ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                                    border: guest ? '1px solid var(--color-primary)' : '1px dashed var(--color-muted)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-smooth)',
                                  }}
                                  title={guest ? `${guest.firstName} ${guest.lastName} (${tableName}, Seat ${seatNum})` : `Row ${rowNum} Left, Seat ${seatNum}: Click to assign`}
                                  onClick={() => {
                                    const tableConfig: TableConfig = {
                                      tableId: tableName,
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
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>{guest ? getInitials(guest) : '+'}</span>
                                  <span style={{ fontSize: '0.5rem', opacity: 0.65, lineHeight: 1, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>#{seatNum}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* CENTRAL AISLE RUNNER */}
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

                {/* RIGHT SIDE CARD */}
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
                  {Array.from({ length: ceremonyConfig.rowsCount })
                    .map((_, rIdx) => rIdx + 1)
                    .filter(r => selectedCeremonyRow === null || selectedCeremonyRow === r)
                    .map(rowNum => {
                      const tableName = `Ceremony R${rowNum}-Right`;
                      const isVip = rowNum <= 2;
                      return (
                        <div key={`right-row-${rowNum}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', minWidth: '48px', color: isVip ? 'var(--color-gold-dark, #b45309)' : 'var(--color-muted)', fontWeight: isVip ? 700 : 500 }}>
                            {isVip && '⭐ '}ROW {rowNum}:
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {Array.from({ length: ceremonyConfig.chairsPerSide }).map((_, cIdx) => {
                              const seatNum = cIdx + 1;
                              const guest = getCeremonyGuest(tableName, seatNum);
                              return (
                                <div
                                  key={`right-r${rowNum}-s${seatNum}`}
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '6px',
                                    backgroundColor: guest ? 'var(--color-primary)' : 'var(--color-bg)',
                                    color: guest ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                                    border: guest ? '1px solid var(--color-primary)' : '1px dashed var(--color-muted)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-smooth)',
                                  }}
                                  title={guest ? `${guest.firstName} ${guest.lastName} (${tableName}, Seat ${seatNum})` : `Row ${rowNum} Right, Seat ${seatNum}: Click to assign`}
                                  onClick={() => {
                                    const tableConfig: TableConfig = {
                                      tableId: tableName,
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
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>{guest ? getInitials(guest) : '+'}</span>
                                  <span style={{ fontSize: '0.5rem', opacity: 0.65, lineHeight: 1, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>#{seatNum}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* MOBILE UNIFIED ROW-BY-ROW AISLE DECK (Visible <= 768px) */}
              <div className="ceremony-mobile-deck">
                {Array.from({ length: ceremonyConfig.rowsCount })
                  .map((_, rIdx) => rIdx + 1)
                  .filter(r => selectedCeremonyRow === null || selectedCeremonyRow === r)
                  .map(rowNum => {
                    const leftTableName = `Ceremony R${rowNum}-Left`;
                    const rightTableName = `Ceremony R${rowNum}-Right`;
                    const isVip = rowNum <= 2;

                    // Calculate total seated count for this row
                    let rowFilled = 0;
                    for (let s = 1; s <= ceremonyConfig.chairsPerSide; s++) {
                      if (getCeremonyGuest(leftTableName, s)) rowFilled++;
                      if (getCeremonyGuest(rightTableName, s)) rowFilled++;
                    }
                    const totalRowSeats = ceremonyConfig.chairsPerSide * 2;

                    return (
                      <div
                        key={`mob-aisle-row-${rowNum}`}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          border: isVip ? '1.5px solid var(--color-gold-dark, #b45309)' : '1px solid var(--color-muted)',
                          borderRadius: 'var(--border-radius-md)',
                          padding: '0.875rem 0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                          boxShadow: 'var(--box-shadow-subtle)',
                        }}
                      >
                        {/* Row Header Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              color: 'var(--color-primary)',
                            }}>
                              ROW {rowNum}
                            </span>
                            {isVip && (
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                backgroundColor: 'var(--color-gold-muted, #fef3c7)',
                                color: 'var(--color-gold-dark, #b45309)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}>
                                <Star size={10} fill="currentColor" /> VIP / FRONT
                              </span>
                            )}
                          </div>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: rowFilled === totalRowSeats ? 'var(--color-green, #10b981)' : 'var(--color-muted)',
                          }}>
                            {rowFilled} / {totalRowSeats} FILLED
                          </span>
                        </div>

                        {/* Side Sub-Labels */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 36px 1fr',
                          gap: '0.5rem',
                          alignItems: 'center',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: 'var(--color-muted)',
                          textAlign: 'center',
                        }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                            {ceremonyConfig.leftLabel}
                          </div>
                          <div style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                            AISLE
                          </div>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                            {ceremonyConfig.rightLabel}
                          </div>
                        </div>

                        {/* Dual-Side Chair Track with Central Aisle Divider */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          overflowX: 'auto',
                          padding: '0.25rem 0',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'thin',
                        }}>
                          {/* Left Chairs (Seats 1 to chairsPerSide) */}
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexShrink: 0 }}>
                            {Array.from({ length: ceremonyConfig.chairsPerSide }).map((_, cIdx) => {
                              const seatNum = cIdx + 1;
                              const guest = getCeremonyGuest(leftTableName, seatNum);
                              const isOccupied = Boolean(guest);
                              return (
                                <div
                                  key={`mob-left-r${rowNum}-s${seatNum}`}
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '8px',
                                    backgroundColor: isOccupied ? 'var(--color-primary)' : 'var(--color-surface)',
                                    color: isOccupied ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                                    border: isOccupied ? '1.5px solid var(--color-primary)' : '1.5px dashed var(--color-muted)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: isOccupied ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                                    flexShrink: 0,
                                    transition: 'var(--transition-smooth)',
                                  }}
                                  title={guest ? `${guest.firstName} ${guest.lastName} (${leftTableName}, Seat ${seatNum})` : `Row ${rowNum} Left, Seat ${seatNum}: Click to assign`}
                                  onClick={() => {
                                    const tableConfig: TableConfig = {
                                      tableId: leftTableName,
                                      tableName: leftTableName,
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
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1 }}>{guest ? getInitials(guest) : '+'}</span>
                                  <span style={{ fontSize: '0.52rem', fontFamily: 'var(--font-mono)', fontWeight: 600, opacity: isOccupied ? 0.8 : 0.6, lineHeight: 1, marginTop: '2px' }}>
                                    #{seatNum}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Central Aisle Notch */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '32px',
                            height: '42px',
                            backgroundColor: 'var(--color-bg)',
                            borderLeft: '2px dashed var(--color-muted)',
                            borderRight: '2px dashed var(--color-muted)',
                            borderRadius: '3px',
                            flexShrink: 0,
                            padding: '0 2px',
                          }}>
                            <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>🚶</span>
                            <span style={{ fontSize: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-muted)', lineHeight: 1, marginTop: '2px' }}>
                              AISLE
                            </span>
                          </div>

                          {/* Right Chairs (Seats 1 to chairsPerSide) */}
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-start', flexShrink: 0 }}>
                            {Array.from({ length: ceremonyConfig.chairsPerSide }).map((_, cIdx) => {
                              const seatNum = cIdx + 1;
                              const guest = getCeremonyGuest(rightTableName, seatNum);
                              const isOccupied = Boolean(guest);
                              return (
                                <div
                                  key={`mob-right-r${rowNum}-s${seatNum}`}
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '8px',
                                    backgroundColor: isOccupied ? 'var(--color-primary)' : 'var(--color-surface)',
                                    color: isOccupied ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                                    border: isOccupied ? '1.5px solid var(--color-primary)' : '1.5px dashed var(--color-muted)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: isOccupied ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                                    flexShrink: 0,
                                    transition: 'var(--transition-smooth)',
                                  }}
                                  title={guest ? `${guest.firstName} ${guest.lastName} (${rightTableName}, Seat ${seatNum})` : `Row ${rowNum} Right, Seat ${seatNum}: Click to assign`}
                                  onClick={() => {
                                    const tableConfig: TableConfig = {
                                      tableId: rightTableName,
                                      tableName: rightTableName,
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
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1 }}>{guest ? getInitials(guest) : '+'}</span>
                                  <span style={{ fontSize: '0.52rem', fontFamily: 'var(--font-mono)', fontWeight: 600, opacity: isOccupied ? 0.8 : 0.6, lineHeight: 1, marginTop: '2px' }}>
                                    #{seatNum}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {/* VIEW MODE 2: ROW ROSTER VIEW (Mobile & Desktop Production View) */}
          {ceremonyMobileView === 'roster' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Side Segment Switcher */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
              }}>
                <button
                  type="button"
                  onClick={() => setRosterSideTab('left')}
                  style={{
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--border-radius-sm)',
                    border: rosterSideTab === 'left' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                    backgroundColor: rosterSideTab === 'left' ? 'var(--color-surface)' : 'var(--color-bg)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    color: rosterSideTab === 'left' ? 'var(--color-primary)' : 'var(--color-muted)',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  👰 {ceremonyConfig.leftLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setRosterSideTab('right')}
                  style={{
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--border-radius-sm)',
                    border: rosterSideTab === 'right' ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                    backgroundColor: rosterSideTab === 'right' ? 'var(--color-surface)' : 'var(--color-bg)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    color: rosterSideTab === 'right' ? 'var(--color-primary)' : 'var(--color-muted)',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  🤵 {ceremonyConfig.rightLabel}
                </button>
              </div>

              {/* Roster Cards per Row */}
              {Array.from({ length: ceremonyConfig.rowsCount })
                .map((_, rIdx) => rIdx + 1)
                .filter(r => selectedCeremonyRow === null || selectedCeremonyRow === r)
                .map(rowNum => {
                  const activeTableName = rosterSideTab === 'left' ? `Ceremony R${rowNum}-Left` : `Ceremony R${rowNum}-Right`;
                  const isVip = rowNum <= 2;

                  let sideFilled = 0;
                  for (let s = 1; s <= ceremonyConfig.chairsPerSide; s++) {
                    if (getCeremonyGuest(activeTableName, s)) sideFilled++;
                  }

                  return (
                    <div
                      key={`roster-row-${rosterSideTab}-${rowNum}`}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: isVip ? '1.5px solid var(--color-gold-dark, #b45309)' : '1px solid var(--color-muted)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        boxShadow: 'var(--box-shadow-subtle)',
                      }}
                    >
                      {/* Roster Row Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            ROW {rowNum}
                          </span>
                          {isVip && (
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              backgroundColor: 'var(--color-gold-muted, #fef3c7)',
                              color: 'var(--color-gold-dark, #b45309)',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}>
                              <Star size={10} fill="currentColor" /> VIP / FRONT
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: sideFilled === ceremonyConfig.chairsPerSide ? 'var(--color-green, #10b981)' : 'var(--color-muted)',
                        }}>
                          {sideFilled} of {ceremonyConfig.chairsPerSide} Seats Assigned
                        </span>
                      </div>

                      {/* Roster Seats List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {Array.from({ length: ceremonyConfig.chairsPerSide }).map((_, cIdx) => {
                          const seatNum = cIdx + 1;
                          const guest = getCeremonyGuest(activeTableName, seatNum);

                          if (guest) {
                            return (
                              <div
                                key={`roster-seat-${seatNum}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.625rem 0.875rem',
                                  backgroundColor: 'var(--color-bg)',
                                  border: '1px solid var(--color-muted)',
                                  borderRadius: 'var(--border-radius-sm)',
                                  gap: '0.75rem',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                  <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    color: 'var(--color-primary)',
                                    minWidth: '28px',
                                  }}>
                                    #{seatNum}
                                  </span>
                                  <div style={styles.initialsAvatar}>
                                    {getInitials(guest)}
                                  </div>
                                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                    <span style={{
                                      fontSize: '0.85rem',
                                      fontWeight: 700,
                                      color: 'var(--color-text)',
                                      display: 'block',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}>
                                      {guest.firstName} {guest.lastName}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                                      {guest.partyGroup || 'General Guest'}
                                      {guest.dietaryRestrictions ? ` • ⚠️ ${guest.dietaryRestrictions}` : ''}
                                    </span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                  <button
                                    type="button"
                                    title="View Guest Details"
                                    onClick={() => setSelectedGuest(guest)}
                                    style={{
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '4px',
                                      border: '1px solid var(--color-muted)',
                                      backgroundColor: 'var(--color-surface)',
                                      fontSize: '0.7rem',
                                      fontFamily: 'var(--font-mono)',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      color: 'var(--color-text)',
                                    }}
                                  >
                                    VIEW
                                  </button>
                                  <button
                                    type="button"
                                    title="Unassign Seat"
                                    onClick={async () => {
                                      await assignGuestToTable(guest.guestId, 'Unassigned', undefined, true);
                                    }}
                                    style={{
                                      padding: '0.35rem 0.5rem',
                                      borderRadius: '4px',
                                      border: '1px solid var(--color-red-muted, #fecaca)',
                                      backgroundColor: 'var(--color-red-muted, #fee2e2)',
                                      color: 'var(--color-red, #dc2626)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={`roster-empty-${seatNum}`}
                              type="button"
                              onClick={() => {
                                const tableConfig: TableConfig = {
                                  tableId: activeTableName,
                                  tableName: activeTableName,
                                  shape: 'square',
                                  capacity: ceremonyConfig.chairsPerSide,
                                };
                                setAssignSeatTable(tableConfig);
                                setTargetSeatIndex(seatNum);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.625rem 0.875rem',
                                backgroundColor: 'transparent',
                                border: '1.5px dashed var(--color-muted)',
                                borderRadius: 'var(--border-radius-sm)',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'left',
                                transition: 'var(--transition-smooth)',
                              }}
                            >
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: 'var(--color-muted)',
                                minWidth: '28px',
                              }}>
                                #{seatNum}
                              </span>
                              <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                border: '1.5px dashed var(--color-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-muted)',
                                fontSize: '0.85rem',
                                flexShrink: 0,
                              }}>
                                +
                              </div>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                color: 'var(--color-primary)',
                                fontWeight: 600,
                              }}>
                                Empty Seat — Tap to assign guest
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Summary KPI Strip */}
          <PageMetricStrip
            style={{ marginBottom: '1.25rem' }}
            metrics={[
              {
                id: 'tables',
                label: 'TOTAL TABLES',
                value: tables.length,
                subtext: 'Configured tables',
                statusBadge: `${tables.length} Active`,
                statusColor: 'blue',
              },
              {
                id: 'capacity',
                label: 'SEAT CAPACITY',
                value: tables.reduce((acc, t) => acc + t.capacity, 0),
                subtext: `${Math.max(0, tables.reduce((acc, t) => acc + t.capacity, 0) - seatedGuestsCount)} open seats`,
                statusColor: 'neutral',
              },
              {
                id: 'seated',
                label: 'SEATED GUESTS',
                value: `${seatedGuestsCount} / ${eligibleSeatingGuests.length}`,
                progress: eligibleSeatingGuests.length > 0 ? Math.round((seatedGuestsCount / eligibleSeatingGuests.length) * 100) : 0,
                statusBadge: seatedGuestsCount === eligibleSeatingGuests.length && eligibleSeatingGuests.length > 0 ? '100% Seated' : `${eligibleSeatingGuests.length > 0 ? Math.round((seatedGuestsCount / eligibleSeatingGuests.length) * 100) : 0}%`,
                statusColor: seatedGuestsCount === eligibleSeatingGuests.length && eligibleSeatingGuests.length > 0 ? 'green' : 'blue',
              },
              {
                id: 'unassigned',
                label: 'UNASSIGNED GUESTS',
                value: unassignedGuests.length,
                statusBadge: unassignedGuests.length === 0 ? 'All Assigned' : `${unassignedGuests.length} unseated`,
                statusColor: unassignedGuests.length === 0 ? 'green' : 'amber',
                onClick: () => setShowUnassignedDrawer(prev => !prev),
              },
            ]}
          />

          {/* Main Floorplan Canvas Grid */}
          <div style={styles.floorplanGrid}>
        {filteredTables.map(table => {
          const seatedGuests = guests.filter(g => isGuestAtTable(g, table));
          const isOverCapacity = seatedGuests.length > table.capacity;

          // Helper to resolve specific guest at physical seat number (1..capacity)
          const seatMap = getResolvedGuestSeatsForTable(table, seatedGuests);
          const seatToGuest = new Map<number, Guest>();
          seatedGuests.forEach((g) => {
            const s = seatMap.get(g.guestId);
            if (typeof s === 'number') {
              seatToGuest.set(s, g);
            }
          });

          const getGuestAtSeat = (seatNum: number): Guest | undefined => {
            return seatToGuest.get(seatNum);
          };

          // Helper to handle seat clicks cleanly
          const handleSeatClick = (e: React.MouseEvent, guest: Guest | undefined, seatNum: number) => {
            e.stopPropagation();
            e.preventDefault();
            if (guest) {
              setAssignSeatTable(null);
              setTargetSeatIndex(null);
              setSelectedGuest({ ...guest, seatNumber: seatNum });
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
                    <Circle size={16} style={{ color: 'var(--color-text, currentColor)' }} />
                  ) : table.shape === 'square' ? (
                    <Square size={16} style={{ color: 'var(--color-text, currentColor)' }} />
                  ) : (
                    <Square size={16} style={{ color: 'var(--color-text, currentColor)', transform: 'scaleX(1.3)' }} />
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
                            <Square size={20} style={{ color: 'var(--color-text, currentColor)', marginBottom: '4px' }} />
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
                  <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-primary, #ffffff)' }} className="modalTitle">
                    {selectedGuest.firstName} {selectedGuest.lastName}
                  </h3>
                  <span style={styles.modalSubtitleText}>Guest Profile & Table Assignment</span>
                </div>
              </div>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-primary, #ffffff)' }} className="closeBtn" onClick={() => setSelectedGuest(null)}>
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
                  value={getTableForGuest(selectedGuest)?.tableId || selectedGuest.tableAssignment || 'Unassigned'}
                  onChange={async (e) => {
                    await assignGuestToTable(selectedGuest.guestId, e.target.value);
                  }}
                  style={styles.selectInput}
                  disabled={isSyncing}
                >
                  <option value="Unassigned">Unassigned (No Table)</option>
                  {tables.map(t => (
                    <option key={t.tableId} value={t.tableId}>
                      {t.tableName} ({guests.filter(g => isGuestAtTable(g, t)).length}/{t.capacity} seats)
                    </option>
                  ))}
                </select>

                {selectedGuest.tableAssignment && selectedGuest.tableAssignment !== 'Unassigned' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.45rem', padding: '0.35rem 0.5rem', backgroundColor: 'var(--color-bg)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>PHYSICAL SEAT:</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                      {selectedGuest.seatNumber ? `Seat #${selectedGuest.seatNumber}` : 'Assigned (Open Seat)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Meal Selection & Dietary Restrictions */}
              <div style={styles.detailsGrid}>
                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>
                    <Utensils size={14} style={{ marginRight: '6px', color: 'var(--color-highlight)' }} />
                    MEAL SELECTION
                  </div>
                  <p style={styles.detailValue}>
                    {selectedGuest.mealChoice || 'None selected'}
                  </p>
                </div>

                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>
                    <AlertCircle size={14} style={{ marginRight: '6px', color: 'var(--color-highlight)' }} />
                    DIETARY RESTRICTIONS
                  </div>
                  <p style={styles.detailValue}>
                    {selectedGuest.dietaryRestrictions || 'None specified'}
                  </p>
                </div>
              </div>

              {/* UNASSIGN SEAT BUTTON */}
              {((selectedGuest.tableAssignment && selectedGuest.tableAssignment !== 'Unassigned') ||
                (selectedGuest.ceremonySeating && selectedGuest.ceremonySeating.trim() !== '')) && (
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
                  onClick={async () => {
                    const isCeremonyTarget = seatingMode === 'ceremony' || Boolean(selectedGuest.ceremonySeating);
                    await assignGuestToTable(selectedGuest.guestId, 'Unassigned', undefined, isCeremonyTarget);
                    setSelectedGuest(null);
                  }}
                >
                  <Trash2 size={16} /> UNASSIGN SEAT FROM {(
                    getTableForGuest(selectedGuest)?.tableName ||
                    (seatingMode === 'ceremony' ? selectedGuest.ceremonySeating : selectedGuest.tableAssignment) ||
                    'SEAT'
                  ).toUpperCase()}
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
                <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-primary, #ffffff)' }} className="modalTitle">
                  ASSIGN SEAT {targetSeatIndex ? `#${targetSeatIndex}` : ''}: {assignSeatTable.tableName.toUpperCase()}
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-primary, #ffffff)' }} className="closeBtn" onClick={() => { setAssignSeatTable(null); setTargetSeatIndex(null); }}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Search Bar */}
              <PageSearchInput
                placeholder="Filter guests by name or party..."
                value={assignSearch}
                onChange={setAssignSearch}
                style={{ marginBottom: '1rem' }}
              />

              <span style={{ ...styles.fieldLabel, marginBottom: '0.5rem', display: 'block' }}>
                GUEST REGISTRY ({unassignedGuests.length} unassigned)
              </span>

              {/* Guest Selection List */}
              <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(() => {
                  const seatedPartyGroups = new Set(
                    guests
                      .filter(g => isGuestAtTable(g, assignSeatTable) && g.partyGroup)
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
                    .filter(g => (g.rsvpStatus || '').toLowerCase() !== 'declined')
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
                    const isAlreadyHere = isGuestAtTable(guest, assignSeatTable) && guest.seatNumber === (targetSeatIndex || undefined);
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
                        onClick={async () => {
                          if (!isAlreadyHere) {
                            await assignGuestToTable(
                              guest.guestId,
                              assignSeatTable.tableId || assignSeatTable.tableName,
                              targetSeatIndex || undefined,
                              seatingMode === 'ceremony'
                            );
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
                              Seated at {getTableForGuest(guest)?.tableName || guest.tableAssignment}
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
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-primary, #ffffff)' }} className="modalTitle">
                {isAddingTable ? 'ADD NEW TABLE' : 'EDIT TABLE CONFIGURATION'}
              </h3>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-primary, #ffffff)' }} className="closeBtn" onClick={() => { setIsAddingTable(false); setEditingTable(null); }}>
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
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => { setIsAddingTable(false); setEditingTable(null); }}
                >
                  CANCEL
                </button>
                {isAddingTable && (
                  <button
                    type="button"
                    style={{
                      ...styles.saveBtn,
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      color: 'var(--color-primary)',
                      border: '2px solid var(--color-primary)',
                    }}
                    onClick={(e) => saveTableConfig(e, true)}
                  >
                    SAVE & ADD NEW
                  </button>
                )}
                <button type="submit" style={styles.saveBtn} className="saveBtn">
                  {isAddingTable ? 'SAVE TABLE' : 'SAVE CHANGES'}
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

              {guests.filter(g => isGuestAtTable(g, tableToDelete)).length > 0 && (
                <div style={{ ...styles.reassignBox, borderColor: 'var(--color-red)', backgroundColor: 'var(--color-red-muted)' }}>
                  <span style={{ ...styles.fieldLabel, color: 'var(--color-red)' }}>
                    SEATED GUESTS IMPACT ({guests.filter(g => isGuestAtTable(g, tableToDelete)).length} guests)
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

      {/* Mobile Floating Action Button (FAB) */}
      <MobileFAB onClick={startAddTable} label="Add Table" disabled={isSyncing} />
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
    color: 'var(--color-amber-dark)',
    border: '1px solid var(--color-gold-dark)',
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
    fontFamily: 'var(--font-mono)',
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
    backgroundColor: 'var(--color-input-bg, #ffffff)',
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
    backgroundColor: 'var(--color-input-bg, #ffffff)',
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
  cancelBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'transparent',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
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
