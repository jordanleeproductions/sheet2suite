'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  AlertTriangle, 
  Utensils, 
  Search, 
  Filter, 
  Users, 
  ShieldAlert,
  ChevronDown,
  Info
} from 'lucide-react';
import { Guest, TableConfig } from '@/types/wedding';

interface CateringDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableConfig[];
  guests: Guest[];
  weddingName?: string;
}

// Entree categorization helper
export function categorizeMeal(meal?: string): { category: string; emoji: string; color: string } {
  const m = (meal || '').trim().toLowerCase();
  if (!m) return { category: 'Not Selected', emoji: '⏳', color: 'var(--color-muted, #64748B)' };
  if (m.includes('beef') || m.includes('steak') || m.includes('filet') || m.includes('prime rib')) {
    return { category: 'Beef / Steak', emoji: '🥩', color: '#DC2626' };
  }
  if (m.includes('chicken') || m.includes('poultry') || m.includes('fowl')) {
    return { category: 'Chicken', emoji: '🍗', color: '#D97706' };
  }
  if (m.includes('fish') || m.includes('salmon') || m.includes('halibut') || m.includes('seafood') || m.includes('tuna') || m.includes('bass')) {
    return { category: 'Fish / Seafood', emoji: '🐟', color: '#0284C7' };
  }
  if (m.includes('vegan')) {
    return { category: 'Vegan', emoji: '🌱', color: '#16A34A' };
  }
  if (m.includes('veg') || m.includes('vegetarian')) {
    return { category: 'Vegetarian', emoji: '🥗', color: '#059669' };
  }
  if (m.includes('child') || m.includes('kid')) {
    return { category: 'Kids Meal', emoji: '👶', color: '#9333EA' };
  }
  return { category: meal || 'Custom Option', emoji: '🍽️', color: '#4F46E5' };
}

export default function CateringDossierModal({
  isOpen,
  onClose,
  tables,
  guests,
  weddingName = 'Our Wedding',
}: CateringDossierModalProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAllergiesOnly, setFilterAllergiesOnly] = useState(false);

  // Helper to check if guest is seated at a given table
  const isGuestAtTable = (guest: Guest, table: TableConfig): boolean => {
    if (!guest || !guest.tableAssignment) return false;
    const assignment = guest.tableAssignment.trim().toLowerCase();
    const tableId = (table.tableId || '').trim().toLowerCase();
    const tableName = (table.tableName || '').trim().toLowerCase();
    return (Boolean(tableId) && assignment === tableId) || (Boolean(tableName) && assignment === tableName);
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

  // Overall Entree Totals Matrix
  const overallMealTally = useMemo(() => {
    const tally: Record<string, { count: number; emoji: string; color: string }> = {};
    seatedGuests.forEach((g) => {
      const { category, emoji, color } = categorizeMeal(g.mealChoice);
      if (!tally[category]) {
        tally[category] = { count: 0, emoji, color };
      }
      tally[category].count += 1;
    });
    return Object.entries(tally).sort((a, b) => b[1].count - a[1].count);
  }, [seatedGuests]);

  // Total guests with allergies or dietary restrictions
  const guestsWithAllergiesCount = useMemo(() => {
    return seatedGuests.filter((g) => Boolean((g.dietaryRestrictions || '').trim())).length;
  }, [seatedGuests]);

  // Table breakdown dossiers
  const tableDossiers = useMemo(() => {
    return tables.map((t) => {
      const tableGuests = seatedGuests.filter((g) => isGuestAtTable(g, t));
      // Tally meals for this table
      const mealCounts: Record<string, { count: number; emoji: string; color: string }> = {};
      const allergyGuests: Guest[] = [];

      tableGuests.forEach((g) => {
        const { category, emoji, color } = categorizeMeal(g.mealChoice);
        if (!mealCounts[category]) {
          mealCounts[category] = { count: 0, emoji, color };
        }
        mealCounts[category].count += 1;

        if (Boolean((g.dietaryRestrictions || '').trim())) {
          allergyGuests.push(g);
        }
      });

      return {
        table: t,
        tableGuests,
        mealCounts: Object.entries(mealCounts).sort((a, b) => b[1].count - a[1].count),
        allergyGuests,
        hasAllergies: allergyGuests.length > 0,
      };
    });
  }, [tables, seatedGuests]);

  // Filtered table dossiers
  const filteredDossiers = useMemo(() => {
    return tableDossiers.filter((d) => {
      if (filterAllergiesOnly && !d.hasAllergies) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchesTableName = d.table.tableName.toLowerCase().includes(q);
      const matchesGuest = d.tableGuests.some(
        (g) =>
          `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
          (g.dietaryRestrictions || '').toLowerCase().includes(q) ||
          (g.mealChoice || '').toLowerCase().includes(q)
      );
      return matchesTableName || matchesGuest;
    });
  }, [tableDossiers, filterAllergiesOnly, searchQuery]);

  // Copy Plaintext Summary for Caterer Email
  const handleCopySummary = () => {
    let text = `====================================================\n`;
    text += `CHEF'S CATERING DOSSIER & ALLERGY MATRIX\n`;
    text += `${weddingName.toUpperCase()}\n`;
    text += `Generated on: ${new Date().toLocaleDateString()}\n`;
    text += `Total Seated Guests: ${seatedGuests.length} across ${tables.length} tables\n`;
    text += `====================================================\n\n`;

    text += `--- VENUE-WIDE ENTREE TOTALS ---\n`;
    overallMealTally.forEach(([cat, { count, emoji }]) => {
      text += `• ${emoji} ${cat}: ${count}\n`;
    });
    text += `\nTotal Guests with Dietary/Allergy Alerts: ${guestsWithAllergiesCount}\n\n`;

    text += `====================================================\n`;
    text += `TABLE-BY-TABLE BREAKDOWN & DIETARY DANGERS\n`;
    text += `====================================================\n\n`;

    tableDossiers.forEach(({ table, tableGuests, mealCounts, allergyGuests }) => {
      text += `TABLE: ${table.tableName.toUpperCase()} (${tableGuests.length} / ${table.capacity} seats)\n`;
      text += `Entrees: ${mealCounts.map(([cat, info]) => `${info.emoji} ${cat}: ${info.count}`).join(' | ')}\n`;

      if (allergyGuests.length > 0) {
        text += `⚠️ DIETARY & ALLERGY ALERTS (${allergyGuests.length}):\n`;
        allergyGuests.forEach((ag) => {
          text += `  - Seat ${ag.seatNumber || '?'}: ${ag.firstName} ${ag.lastName} ➔ ${ag.dietaryRestrictions} (Meal: ${ag.mealChoice || 'None'})\n`;
        });
      } else {
        text += `Dietary Alerts: None (Standard prep)\n`;
      }
      text += `----------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="catering-modal-overlay" style={styles.overlay} onClick={onClose}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .catering-modal-printable, .catering-modal-printable * {
            visibility: visible !important;
          }
          .catering-modal-printable {
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
          .catering-no-print {
            display: none !important;
          }
          .catering-table-break {
            page-break-inside: avoid;
            break-inside: avoid;
            border: 1px solid #cbd5e1 !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>

      <div
        className="catering-modal-printable"
        style={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div style={styles.header} className="catering-no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={styles.iconEmblem}>
              <Utensils size={20} />
            </div>
            <div>
              <h2 style={styles.title}>Chef's Catering Dossier & Allergy Matrix</h2>
              <span style={styles.subtitle}>
                Table-by-table meal headcounts, entree tallies, and critical kitchen allergy alerts for {weddingName}
              </span>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Close dossier">
            <X size={20} />
          </button>
        </div>

        {/* Printable Letterhead (Only visible when printing) */}
        <div style={styles.printHeader} className="print-only">
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Chef's Master Catering Dossier & Allergy Matrix
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                {weddingName} • Reception Dining Service • Printed {new Date().toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{seatedGuests.length} Guests Seated</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                {guestsWithAllergiesCount} Critical Dietary Alerts
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div style={styles.actionBar} className="catering-no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="text"
                placeholder="Search table, guest, or meal..."
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

            <button
              type="button"
              onClick={() => setFilterAllergiesOnly(!filterAllergiesOnly)}
              style={{
                ...styles.filterBtn,
                backgroundColor: filterAllergiesOnly ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-bg-subtle)',
                color: filterAllergiesOnly ? '#DC2626' : 'var(--color-text)',
                borderColor: filterAllergiesOnly ? 'rgba(239, 68, 68, 0.35)' : 'var(--color-border)',
              }}
            >
              <AlertTriangle size={13} />
              <span>{filterAllergiesOnly ? 'Showing Allergies Only' : 'Filter Allergies Only'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCopySummary}
              style={styles.secondaryBtn}
              title="Copy plain text catering breakdown to paste in an email"
            >
              {copied ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Email Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={styles.primaryBtn}
              title="Print Chef's Dossier"
            >
              <Printer size={14} />
              <span>Print Chef's Packet</span>
            </button>
          </div>
        </div>

        {/* Global Grand Totals Strip */}
        <div style={styles.grandTotalsStrip}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
              Venue-Wide Entree Totals ({seatedGuests.length} Seated across {tables.length} Tables)
            </span>
            {guestsWithAllergiesCount > 0 && (
              <span style={styles.allergyBadge}>
                <ShieldAlert size={12} />
                <span>{guestsWithAllergiesCount} Special Dietary / Allergy Alerts</span>
              </span>
            )}
          </div>

          <div style={styles.mealPillGrid}>
            {overallMealTally.map(([cat, { count, emoji, color }]) => (
              <div key={cat} style={styles.mealPill}>
                <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)' }}>{cat}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table-by-Table Breakdown Dossier */}
        <div style={styles.tableListContainer}>
          {filteredDossiers.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No tables match your current search or allergy filter.</p>
            </div>
          ) : (
            filteredDossiers.map(({ table, tableGuests, mealCounts, allergyGuests, hasAllergies }) => (
              <div
                key={table.tableId}
                className="catering-table-break"
                style={{
                  ...styles.tableCard,
                  borderColor: hasAllergies ? 'rgba(239, 68, 68, 0.35)' : 'var(--color-border)',
                }}
              >
                {/* Table Header Bar */}
                <div style={styles.tableCardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={styles.tableShapeBadge}>
                      {table.shape.toUpperCase()}
                    </span>
                    <h3 style={styles.tableCardTitle}>{table.tableName}</h3>
                    <span style={styles.tableSeatCount}>
                      {tableGuests.length} / {table.capacity} Seats Seated
                    </span>
                  </div>

                  {hasAllergies && (
                    <span style={styles.tableAllergyAlertPill}>
                      <AlertTriangle size={12} />
                      <span>{allergyGuests.length} Allergy Flag{allergyGuests.length > 1 ? 's' : ''}</span>
                    </span>
                  )}
                </div>

                {/* Table Entree Counts Row */}
                <div style={styles.tableMealRow}>
                  <span style={{ fontSize: '0.675rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                    ENTREES:
                  </span>
                  {mealCounts.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>No guests assigned to table</span>
                  ) : (
                    mealCounts.map(([cat, info]) => (
                      <span key={cat} style={styles.tableMealPill}>
                        <span>{info.emoji}</span>
                        <strong style={{ color: 'var(--color-text)' }}>{cat}:</strong>
                        <span style={{ color: info.color, fontWeight: 700 }}>{info.count}</span>
                      </span>
                    ))
                  )}
                </div>

                {/* Critical Allergy Callout Alert Box */}
                {hasAllergies && (
                  <div style={styles.allergyCalloutBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#B91C1C', fontWeight: 800, fontSize: '0.725rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      <AlertTriangle size={14} />
                      <span>Critical Kitchen Allergy & Dietary Notice</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {allergyGuests.map((ag) => (
                        <div key={ag.guestId} style={styles.allergyItemRow}>
                          <span style={styles.seatNumBadge}>
                            {ag.seatNumber ? `Seat #${ag.seatNumber}` : 'Seat TBD'}
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                            {ag.firstName} {ag.lastName}:
                          </span>
                          <span style={{ color: '#DC2626', fontWeight: 700 }}>
                            {ag.dietaryRestrictions}
                          </span>
                          <span style={{ color: 'var(--color-muted)', fontSize: '0.7rem' }}>
                            (Entree: {ag.mealChoice || 'None'})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Guest Seating List for Table */}
                <div style={styles.guestRosterList}>
                  {tableGuests.map((g) => (
                    <div key={g.guestId} style={styles.guestRosterRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', minWidth: '46px' }}>
                          {g.seatNumber ? `Seat ${g.seatNumber}` : 'Seat -'}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
                          {g.firstName} {g.lastName}
                        </span>
                        {g.ageCategory && g.ageCategory !== 'Adult' && (
                          <span style={styles.ageBadge}>{g.ageCategory}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <span>{categorizeMeal(g.mealChoice).emoji}</span>
                          <span>{g.mealChoice || 'No meal'}</span>
                        </span>
                        {g.dietaryRestrictions && (
                          <span style={styles.inlineAllergyBadge} title={g.dietaryRestrictions}>
                            {g.dietaryRestrictions}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
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
    maxWidth: '920px',
    maxHeight: '90vh',
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
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    border: '1px solid rgba(5, 150, 105, 0.3)',
    color: '#059669',
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
    borderRadius: '4px',
  },
  printHeader: {
    display: 'none',
  },
  actionBar: {
    padding: '0.75rem 1.35rem',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface, #ffffff)',
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
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-text)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  filterBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
  },
  grandTotalsStrip: {
    padding: '0.85rem 1.35rem',
    backgroundColor: 'var(--color-bg-subtle)',
    borderBottom: '1px solid var(--color-border)',
  },
  allergyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#DC2626',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    padding: '2px 7px',
    borderRadius: '4px',
    fontSize: '0.675rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
  },
  mealPillGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '0.5rem',
  },
  mealPill: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '0.5rem 0.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tableListContainer: {
    padding: '1rem 1.35rem',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  tableCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    padding: '1rem 1.15rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  tableCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  tableShapeBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 800,
    backgroundColor: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-muted)',
    padding: '2px 5px',
    borderRadius: '4px',
  },
  tableCardTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-sans)',
  },
  tableSeatCount: {
    fontSize: '0.725rem',
    color: 'var(--color-muted)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
  },
  tableAllergyAlertPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#DC2626',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '0.675rem',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  },
  tableMealRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    flexWrap: 'wrap',
    padding: '0.4rem 0',
    borderTop: '1px dashed var(--color-border)',
    borderBottom: '1px dashed var(--color-border)',
  },
  tableMealPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.725rem',
    backgroundColor: 'var(--color-bg-subtle)',
    padding: '2px 7px',
    borderRadius: '4px',
    border: '1px solid var(--color-border)',
  },
  allergyCalloutBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    padding: '0.6rem 0.75rem',
  },
  allergyItemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontSize: '0.75rem',
    flexWrap: 'wrap',
  },
  seatNumBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 800,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#B91C1C',
    padding: '1px 5px',
    borderRadius: '3px',
  },
  guestRosterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    marginTop: '0.25rem',
  },
  guestRosterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.35rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'var(--color-bg-subtle)',
    fontSize: '0.75rem',
  },
  ageBadge: {
    fontSize: '0.6rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    color: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: '1px 4px',
    borderRadius: '3px',
  },
  inlineAllergyBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#DC2626',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: '1px 6px',
    borderRadius: '3px',
    maxWidth: '180px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
