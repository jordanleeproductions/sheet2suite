'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Search, 
  Sparkles, 
  LayoutList, 
  FileText, 
  ExternalLink, 
  Check, 
  Copy,
  Users,
  Grid
} from 'lucide-react';
import { Guest, TableConfig } from '@/types/wedding';

interface EscortChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableConfig[];
  guests: Guest[];
  weddingName?: string;
  initialTab?: 'alphabetical' | 'table_roster' | 'canva_studio';
}

export default function EscortChartModal({
  isOpen,
  onClose,
  tables,
  guests,
  weddingName = 'Our Wedding',
  initialTab = 'alphabetical',
}: EscortChartModalProps) {
  const [activeTab, setActiveTab] = useState<'alphabetical' | 'table_roster' | 'canva_studio'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [csvDownloaded, setCsvDownloaded] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Helper to check if guest is seated at a given table
  const isGuestAtTable = (guest: Guest, table: TableConfig): boolean => {
    if (!guest || !guest.tableAssignment) return false;
    const assignment = guest.tableAssignment.trim().toLowerCase();
    const tableId = (table.tableId || '').trim().toLowerCase();
    const tableName = (table.tableName || '').trim().toLowerCase();
    return (Boolean(tableId) && assignment === tableId) || (Boolean(tableName) && assignment === tableName);
  };

  // Helper to resolve clean display table name for a guest
  const getTableDisplayName = (guest: Guest): string => {
    if (!guest.tableAssignment || guest.tableAssignment === 'Unassigned') return 'Unassigned';
    const match = tables.find((t) => isGuestAtTable(guest, t));
    return match ? match.tableName : guest.tableAssignment;
  };

  // Seated eligible guests (attending or pending)
  const seatedGuests = useMemo(() => {
    return guests.filter(
      (g) =>
        (g.rsvpStatus || '').toLowerCase() !== 'declined' &&
        g.tableAssignment &&
        g.tableAssignment.trim() !== '' &&
        g.tableAssignment !== 'Unassigned'
    );
  }, [guests]);

  // Alphabetical sorting by Last Name, then First Name
  const alphabeticalGuests = useMemo(() => {
    return [...seatedGuests].sort((a, b) => {
      const lastCompare = (a.lastName || '').localeCompare(b.lastName || '');
      if (lastCompare !== 0) return lastCompare;
      return (a.firstName || '').localeCompare(b.firstName || '');
    });
  }, [seatedGuests]);

  // Grouped by Alphabet letter (A, B, C...)
  const alphabeticalGroups = useMemo(() => {
    const groups: Record<string, Guest[]> = {};
    alphabeticalGuests.forEach((g) => {
      const letter = (g.lastName || g.firstName || '?').trim().charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(g);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [alphabeticalGuests]);

  // Filtered alphabetical groups by search
  const filteredAlphabeticalGroups = useMemo(() => {
    if (!searchQuery.trim()) return alphabeticalGroups;
    const q = searchQuery.toLowerCase();
    const filtered: [string, Guest[]][] = [];

    alphabeticalGroups.forEach(([letter, gList]) => {
      const matching = gList.filter(
        (g) =>
          `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
          getTableDisplayName(g).toLowerCase().includes(q)
      );
      if (matching.length > 0) {
        filtered.push([letter, matching]);
      }
    });

    return filtered;
  }, [alphabeticalGroups, searchQuery, tables]);

  // Table by table rosters
  const tableRosters = useMemo(() => {
    return tables.map((t) => {
      const tableGuests = seatedGuests
        .filter((g) => isGuestAtTable(g, t))
        .sort((a, b) => (a.seatNumber || 999) - (b.seatNumber || 999));
      return { table: t, tableGuests };
    });
  }, [tables, seatedGuests]);

  // Filtered table rosters
  const filteredTableRosters = useMemo(() => {
    if (!searchQuery.trim()) return tableRosters;
    const q = searchQuery.toLowerCase();
    return tableRosters.filter(({ table, tableGuests }) => {
      const matchesTable = table.tableName.toLowerCase().includes(q);
      const matchesGuest = tableGuests.some((g) =>
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(q)
      );
      return matchesTable || matchesGuest;
    });
  }, [tableRosters, searchQuery]);

  // 1-Click Canva Place Cards CSV Export
  const handleExportCanvaPlaceCardsCSV = () => {
    const headers = [
      'Full Name',
      'First Name',
      'Last Name',
      'Table Assignment',
      'Table Number Only',
      'Seat Number',
      'Meal Choice',
      'Dietary Restrictions',
      'Party Group',
    ];

    const rows = seatedGuests.map((g) => {
      const tableName = getTableDisplayName(g);
      const numMatch = tableName.match(/\d+/);
      const tableNumOnly = numMatch ? numMatch[0] : '';

      return [
        `"${(`${g.firstName || ''} ${g.lastName || ''}`).trim().replace(/"/g, '""')}"`,
        `"${(g.firstName || '').replace(/"/g, '""')}"`,
        `"${(g.lastName || '').replace(/"/g, '""')}"`,
        `"${tableName.replace(/"/g, '""')}"`,
        `"${tableNumOnly}"`,
        `"${g.seatNumber || ''}"`,
        `"${(g.mealChoice || '').replace(/"/g, '""')}"`,
        `"${(g.dietaryRestrictions || '').replace(/"/g, '""')}"`,
        `"${(g.partyGroup || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `sheet2vow_canva_place_cards_${weddingName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 3000);
  };

  // 1-Click Alphabetical Escort CSV Export
  const handleExportAlphabeticalCSV = () => {
    const headers = ['Last Name', 'First Name', 'Full Name', 'Table Assignment', 'Seat Number'];
    const rows = alphabeticalGuests.map((g) => [
      `"${(g.lastName || '').replace(/"/g, '""')}"`,
      `"${(g.firstName || '').replace(/"/g, '""')}"`,
      `"${(`${g.lastName || ''}, ${g.firstName || ''}`).trim().replace(/"/g, '""')}"`,
      `"${getTableDisplayName(g).replace(/"/g, '""')}"`,
      `"${g.seatNumber || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `sheet2vow_alphabetical_escort_chart_${weddingName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="escort-modal-overlay" style={styles.overlay} onClick={onClose}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .escort-modal-printable, .escort-modal-printable * {
            visibility: visible !important;
          }
          .escort-modal-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .escort-no-print {
            display: none !important;
          }
          .escort-print-columns {
            column-count: 2 !important;
            column-gap: 2rem !important;
          }
          .escort-group-break {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 1.25rem !important;
          }
        }
      `}</style>

      <div
        className="escort-modal-printable"
        style={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={styles.header} className="escort-no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={styles.iconEmblem}>
              <LayoutList size={20} />
            </div>
            <div>
              <h2 style={styles.title}>Guest Escort Chart & Place Card Studio</h2>
              <span style={styles.subtitle}>
                Alphabetical entrance easel chart, table-by-table tent rosters, and 1-click Canva Bulk Create exports
              </span>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Close window">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div style={styles.tabStrip} className="escort-no-print">
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('alphabetical')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeTab === 'alphabetical' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'alphabetical' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
              }}
            >
              <LayoutList size={14} />
              <span>Alphabetical Easel Sign (A-Z)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('table_roster')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeTab === 'table_roster' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'table_roster' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
              }}
            >
              <Grid size={14} />
              <span>Table-by-Table Roster</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('canva_studio')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeTab === 'canva_studio' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'canva_studio' ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
              }}
            >
              <Sparkles size={14} />
              <span>Canva Bulk Create Exporter</span>
              <span style={styles.csvTag}>CSV</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeTab !== 'canva_studio' && (
              <button
                type="button"
                onClick={handlePrint}
                style={styles.printActionBtn}
                title="Print this formatted chart"
              >
                <Printer size={14} />
                <span>Print {activeTab === 'alphabetical' ? 'Easel Chart' : 'Roster'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar for Alphabetical and Table Roster */}
        {activeTab !== 'canva_studio' && (
          <div style={styles.searchBarRow} className="escort-no-print">
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="text"
                placeholder={activeTab === 'alphabetical' ? "Find guest in alphabetical list..." : "Search table or guest..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
              Showing {seatedGuests.length} Seated Guests across {tables.length} Tables
            </span>
          </div>
        )}

        {/* Print Only Letterhead */}
        <div style={styles.printHeader} className="print-only">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #0f172a', paddingBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontFamily: 'var(--font-editorial-serif, serif)', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
              {weddingName}
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', fontFamily: 'var(--font-mono)' }}>
              {activeTab === 'alphabetical' ? 'Guest Seating Directory' : 'Table by Table Seating Plan'}
            </p>
          </div>
        </div>

        {/* TAB 1: ALPHABETICAL EASEL CHART */}
        {activeTab === 'alphabetical' && (
          <div style={styles.tabContentArea}>
            <div className="escort-print-columns" style={styles.alphabeticalColumns}>
              {filteredAlphabeticalGroups.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)', gridColumn: '1 / -1' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>No guests match your search.</p>
                </div>
              ) : (
                filteredAlphabeticalGroups.map(([letter, gList]) => (
                  <div key={letter} className="escort-group-break" style={styles.letterGroupCard}>
                    <div style={styles.letterBadgeRow}>
                      <span style={styles.letterBadge}>{letter}</span>
                      <div style={styles.letterDividerLine} />
                    </div>

                    <div style={styles.guestRowsContainer}>
                      {gList.map((g) => (
                        <div key={g.guestId} style={styles.escortRow}>
                          <span style={styles.guestNameCol}>
                            <strong>{g.lastName}</strong>, {g.firstName}
                          </span>
                          <span style={styles.dotLeader} />
                          <span style={styles.tableCol}>
                            {getTableDisplayName(g)}
                            {g.seatNumber ? ` (Seat ${g.seatNumber})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TABLE-BY-TABLE ROSTER */}
        {activeTab === 'table_roster' && (
          <div style={styles.tabContentArea}>
            <div style={styles.tableRosterGrid}>
              {filteredTableRosters.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>No tables match your search.</p>
                </div>
              ) : (
                filteredTableRosters.map(({ table, tableGuests }) => (
                  <div key={table.tableId} className="escort-group-break" style={styles.tableCardBlock}>
                    <div style={styles.tableCardHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={styles.tablePill}>{table.shape.toUpperCase()}</span>
                        <h3 style={styles.tableHeading}>{table.tableName}</h3>
                      </div>
                      <span style={styles.capacityMeta}>
                        {tableGuests.length} / {table.capacity} Seated
                      </span>
                    </div>

                    <div style={styles.tableGuestList}>
                      {tableGuests.length === 0 ? (
                        <p style={{ margin: '0.5rem 0', fontSize: '0.75rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                          No guests assigned to table
                        </p>
                      ) : (
                        tableGuests.map((g) => (
                          <div key={g.guestId} style={styles.rosterRowItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={styles.seatNumTag}>
                                {g.seatNumber ? `#${g.seatNumber}` : '—'}
                              </span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                {g.firstName} {g.lastName}
                              </span>
                              {g.partyGroup && (
                                <span style={styles.partyTag}>{g.partyGroup}</span>
                              )}
                            </div>

                            {g.mealChoice && (
                              <span style={styles.mealTag}>
                                {g.mealChoice}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CANVA BULK CREATE EXPORTER */}
        {activeTab === 'canva_studio' && (
          <div style={styles.tabContentArea}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '820px', margin: '0 auto' }}>
              {/* Feature Hero Card */}
              <div style={styles.canvaHeroCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={styles.canvaIconContainer}>
                    <Sparkles size={24} style={{ color: '#4F46E5' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)' }}>
                      Automated Stationery Generation with Canva Bulk Create
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                      Export your live seating plan into Canva's native <strong>Bulk Create</strong> tool to automatically generate hundreds of bespoke place cards, escort tent cards, and wedding menu inserts in under 60 seconds.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.15rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleExportCanvaPlaceCardsCSV}
                    style={styles.canvaDownloadPrimaryBtn}
                  >
                    {csvDownloaded ? <Check size={16} /> : <Download size={16} />}
                    <span>{csvDownloaded ? 'Place Cards CSV Downloaded!' : 'Download Place Cards CSV'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportAlphabeticalCSV}
                    style={styles.canvaDownloadSecondaryBtn}
                  >
                    <Download size={15} />
                    <span>Download Alphabetical Easel CSV</span>
                  </button>
                </div>
              </div>

              {/* Step by Step Tutorial Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div style={styles.stepCard}>
                  <div style={styles.stepNumberBadge}>STEP 1</div>
                  <h4 style={styles.stepTitle}>Pick a Canva Template</h4>
                  <p style={styles.stepDesc}>
                    In Canva, search for <em>"Wedding Place Card"</em> or <em>"Tent Card"</em> and pick your favorite aesthetic.
                  </p>
                </div>

                <div style={styles.stepCard}>
                  <div style={styles.stepNumberBadge}>STEP 2</div>
                  <h4 style={styles.stepTitle}>Open Bulk Create App</h4>
                  <p style={styles.stepDesc}>
                    In Canva's left tool rail, click <strong>Apps</strong> ➔ Search for <strong>"Bulk Create"</strong> ➔ Click <strong>"Upload CSV"</strong>.
                  </p>
                </div>

                <div style={styles.stepCard}>
                  <div style={styles.stepNumberBadge}>STEP 3</div>
                  <h4 style={styles.stepTitle}>Connect Data Fields</h4>
                  <p style={styles.stepDesc}>
                    Right-click the guest name box ➔ <strong>Connect data</strong> ➔ Select <code>Full Name</code>. Connect table text to <code>Table Assignment</code>.
                  </p>
                </div>

                <div style={styles.stepCard}>
                  <div style={styles.stepNumberBadge}>STEP 4</div>
                  <h4 style={styles.stepTitle}>Generate & Print</h4>
                  <p style={styles.stepDesc}>
                    Click <strong>Continue</strong> ➔ <strong>Generate Pages</strong>. Canva generates {seatedGuests.length} individual place cards instantly ready for print!
                  </p>
                </div>
              </div>

              {/* Column Mapping Reference Box */}
              <div style={styles.columnRefBox}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                  Included CSV Data Columns (Pre-formatted for Canva)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {['Full Name', 'First Name', 'Last Name', 'Table Assignment', 'Table Number Only', 'Seat Number', 'Meal Choice', 'Dietary Restrictions', 'Party Group'].map((col) => (
                    <span key={col} style={styles.colBadge}>
                      <code>{col}</code>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
    boxSizing: 'border-box',
  },
  modalCard: {
    width: '100%',
    maxWidth: '960px',
    height: '90vh',
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: '14px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '1.15rem 1.35rem',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--color-bg-subtle)',
  },
  iconEmblem: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: 'rgba(79, 70, 229, 0.12)',
    border: '1px solid rgba(79, 70, 229, 0.3)',
    color: '#4F46E5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 800,
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text)',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    marginTop: '2px',
    display: 'block',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStrip: {
    padding: '0.65rem 1.35rem',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface, #ffffff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.775rem',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  csvTag: {
    fontSize: '0.6rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 800,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: '1px 4px',
    borderRadius: '3px',
  },
  printActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '6px',
    fontSize: '0.775rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    border: 'none',
    cursor: 'pointer',
  },
  searchBarRow: {
    padding: '0.65rem 1.35rem',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    width: '100%',
    padding: '7px 28px 7px 30px',
    fontSize: '0.8rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface, #ffffff)',
    color: 'var(--color-text)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  printHeader: {
    display: 'none',
  },
  tabContentArea: {
    padding: '1.25rem 1.35rem',
    overflowY: 'auto',
    flex: 1,
  },
  alphabeticalColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '1.25rem',
  },
  letterGroupCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  letterBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '0.25rem',
  },
  letterBadge: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    fontWeight: 900,
    fontSize: '0.85rem',
    fontFamily: 'var(--font-mono)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  letterDividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--color-border)',
  },
  guestRowsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  escortRow: {
    display: 'flex',
    alignItems: 'baseline',
    fontSize: '0.8125rem',
    gap: '0.35rem',
  },
  guestNameCol: {
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
  },
  dotLeader: {
    flex: 1,
    borderBottom: '1px dotted var(--color-border)',
    marginBottom: '4px',
  },
  tableCol: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: '0.75rem',
    color: '#4F46E5',
    whiteSpace: 'nowrap',
  },
  tableRosterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  tableCardBlock: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  tableCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '0.45rem',
    borderBottom: '1px solid var(--color-border)',
  },
  tablePill: {
    fontSize: '0.6rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 800,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-muted)',
    padding: '2px 5px',
    borderRadius: '4px',
    border: '1px solid var(--color-border)',
  },
  tableHeading: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 800,
    color: 'var(--color-text)',
  },
  capacityMeta: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
    fontWeight: 600,
  },
  tableGuestList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  rosterRowItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.3rem 0.45rem',
    borderRadius: '4px',
    backgroundColor: 'var(--color-bg-subtle)',
    fontSize: '0.75rem',
  },
  seatNumTag: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    color: 'var(--color-muted)',
    minWidth: '22px',
  },
  partyTag: {
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
  },
  mealTag: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    padding: '1px 5px',
    borderRadius: '3px',
  },
  canvaHeroCard: {
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
  },
  canvaIconContainer: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: 'rgba(79, 70, 229, 0.12)',
    border: '1px solid rgba(79, 70, 229, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  canvaDownloadPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 18px',
    borderRadius: '6px',
    fontSize: '0.825rem',
    fontWeight: 700,
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
  },
  canvaDownloadSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '6px',
    fontSize: '0.825rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-surface, #ffffff)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
  },
  stepCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  stepNumberBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 800,
    color: '#4F46E5',
    letterSpacing: '0.06em',
  },
  stepTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 800,
    color: 'var(--color-text)',
  },
  stepDesc: {
    margin: 0,
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    lineHeight: 1.4,
  },
  columnRefBox: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
  },
  colBadge: {
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    padding: '2px 7px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: 'var(--color-text)',
  },
};
