'use client';

import React, { useState } from 'react';
import { Guest, ScheduleEvent, Vendor } from '@/lib/sheets/types';
import { Printer, X, Filter, Check, Heart, Calendar, Users, Clock, Phone, Mail, MapPin, Sparkles, Scissors } from 'lucide-react';
import { formatTimeDisplay } from '@/components/TimelineManager';
import { formatCurrency } from '@/lib/currency';

export type PrintTemplateType = 'place_cards' | 'table_cards' | 'timeline' | 'vendors';

interface PrintTemplatesModalProps {
  initialTemplate?: PrintTemplateType;
  guests?: Guest[];
  schedule?: ScheduleEvent[];
  vendors?: Vendor[];
  weddingName?: string;
  weddingDate?: string;
  timeFormat?: '12h' | '24h';
  currency?: string;
  onClose: () => void;
}

export default function PrintTemplatesModal({
  initialTemplate = 'place_cards',
  guests = [],
  schedule = [],
  vendors = [],
  weddingName = 'Our Wedding',
  weddingDate = '',
  timeFormat = '12h',
  currency = 'USD',
  onClose,
}: PrintTemplatesModalProps) {
  const [activeTemplate, setActiveTemplate] = useState<PrintTemplateType>(initialTemplate);

  // Filters & Customization Options
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedVendorCatFilter, setSelectedVendorCatFilter] = useState<string>('ALL');
  const [showMealChoiceOnCards, setShowMealChoiceOnCards] = useState<boolean>(true);
  const [showFoldLines, setShowFoldLines] = useState<boolean>(true);

  // Filtered Lists
  const tablesList = Array.from(new Set(guests.map(g => g.tableAssignment).filter(Boolean)));
  const rolesList = Array.from(new Set(
    schedule.flatMap(e => (e.responsibility || '').split(/[,/]/).map(r => r.trim()).filter(Boolean))
  ));
  const vendorCategoriesList = Array.from(new Set(vendors.map(v => v.category).filter(Boolean)));

  // Filtered Guests for Place Cards & Table Cards
  const attendingGuests = guests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'attending');
  
  const filteredPlaceCardGuests = attendingGuests.filter(g => {
    if (selectedTableFilter === 'ALL') return true;
    return (g.tableAssignment || '').toLowerCase() === selectedTableFilter.toLowerCase();
  });

  const filteredTimelineEvents = schedule.filter(e => {
    if (selectedRoleFilter === 'ALL') return true;
    return (e.responsibility || '').toLowerCase().includes(selectedRoleFilter.toLowerCase());
  });

  const filteredVendors = vendors.filter(v => {
    if (selectedVendorCatFilter === 'ALL') return true;
    return (v.category || '').toLowerCase() === selectedVendorCatFilter.toLowerCase();
  });

  const handlePrint = () => {
    window.print();
  };

  const getMealIcon = (meal?: string) => {
    if (!meal) return '🍽️';
    const m = meal.toLowerCase();
    if (m.includes('beef') || m.includes('steak') || m.includes('meat')) return '🥩';
    if (m.includes('chicken') || m.includes('poultry')) return '🍗';
    if (m.includes('fish') || m.includes('salmon') || m.includes('seafood')) return '🐟';
    if (m.includes('vegan') || m.includes('veggie') || m.includes('vegetarian')) return '🌱';
    if (m.includes('kid') || m.includes('child')) return '🍟';
    return '🍽️';
  };

  return (
    <div className="print-modal-overlay" style={styles.overlay} onClick={onClose}>
      {/* Dynamic CSS Print Styles Injection */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-studio-paper-content, #print-studio-paper-content * {
            visibility: visible !important;
          }
          #print-studio-paper-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
        }
      `}</style>

      <div className="print-modal-container" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.header} className="print-no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Printer size={20} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h3 style={styles.title}>PRINT & EXPORT STUDIO</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                Professional Print Templates & Escort Cards Generator
              </span>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} title="Close Print Studio">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={styles.body}>
          {/* Left Navigation Sidebar */}
          <nav style={styles.sidebar} className="print-no-print">
            <div style={{ padding: '0.5rem', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', fontWeight: 600 }}>
              TEMPLATE SELECTION
            </div>
            {[
              { id: 'place_cards', label: 'Escort & Place Cards', icon: Users, count: attendingGuests.length },
              { id: 'table_cards', label: 'Table Tent Cards', icon: Heart, count: tablesList.length },
              { id: 'timeline', label: 'Day-Of Timeline Roster', icon: Clock, count: schedule.length },
              { id: 'vendors', label: 'Vendor Directory Sheet', icon: Phone, count: vendors.length },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTemplate === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTemplate(tab.id as PrintTemplateType)}
                  style={{
                    ...styles.tabBtn,
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>
                    ({tab.count})
                  </span>
                </button>
              );
            })}

            {/* Template Filters & Customization Panel */}
            <div style={styles.filterBox}>
              <div style={styles.filterTitle}>
                <Filter size={13} style={{ marginRight: '0.35rem' }} /> OPTIONS & FILTERS
              </div>

              {activeTemplate === 'place_cards' && (
                <>
                  <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>FILTER BY TABLE</label>
                    <select
                      value={selectedTableFilter}
                      onChange={(e) => setSelectedTableFilter(e.target.value)}
                      style={styles.filterSelect}
                    >
                      <option value="ALL">ALL TABLES ({attendingGuests.length} Guests)</option>
                      {tablesList.map(tbl => (
                        <option key={tbl} value={tbl}>{tbl}</option>
                      ))}
                    </select>
                  </div>

                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={showMealChoiceOnCards}
                      onChange={(e) => setShowMealChoiceOnCards(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>SHOW MEAL SELECTION ICON</span>
                  </label>

                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={showFoldLines}
                      onChange={(e) => setShowFoldLines(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>SHOW FOLD & CROP MARKS</span>
                  </label>
                </>
              )}

              {activeTemplate === 'table_cards' && (
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>FILTER BY TABLE</label>
                  <select
                    value={selectedTableFilter}
                    onChange={(e) => setSelectedTableFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="ALL">ALL TABLES ({tablesList.length} Tables)</option>
                    {tablesList.map(tbl => (
                      <option key={tbl} value={tbl}>{tbl}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTemplate === 'timeline' && (
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>FILTER BY RESPONSIBILITY / ROLE</label>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="ALL">ALL ROLES ({schedule.length} Moments)</option>
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTemplate === 'vendors' && (
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>FILTER BY VENDOR CATEGORY</label>
                  <select
                    value={selectedVendorCatFilter}
                    onChange={(e) => setSelectedVendorCatFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="ALL">ALL CATEGORIES ({vendors.length} Vendors)</option>
                    {vendorCategoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Print Action Trigger */}
            <button type="button" onClick={handlePrint} style={styles.printTriggerBtn}>
              <Printer size={16} style={{ marginRight: '0.4rem' }} /> PRINT / EXPORT PDF
            </button>
          </nav>

          {/* Right Live Preview Content Sheet */}
          <div style={styles.previewContainer}>
            <div id="print-studio-paper-content" style={styles.paperSheet}>
              {/* WEDDING HEADER WATERMARK FOR PRINT */}
              <div style={styles.paperHeader}>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={styles.paperWeddingTitle}>{weddingName.toUpperCase()}</h2>
                  {weddingDate && (
                    <span style={styles.paperWeddingDate}>{weddingDate}</span>
                  )}
                </div>
              </div>

              {/* TEMPLATE 1: ESCORT & PLACE CARDS */}
              {activeTemplate === 'place_cards' && (
                <div>
                  <div style={styles.paperSectionTitleRow}>
                    <h3 style={styles.paperSectionTitle}>GUEST ESCORT & PLACE CARDS</h3>
                    <span style={styles.paperSectionMeta}>{filteredPlaceCardGuests.length} Attending Guest Cards</span>
                  </div>

                  {filteredPlaceCardGuests.length === 0 ? (
                    <div style={styles.emptyNotice}>No attending guests found for selected table filter.</div>
                  ) : (
                    <div style={styles.placeCardsGrid}>
                      {filteredPlaceCardGuests.map((guest) => (
                        <div key={guest.guestId} style={{ ...styles.placeCard, borderStyle: showFoldLines ? 'dashed' : 'solid' }}>
                          {showFoldLines && (
                            <div style={styles.foldIndicator}>
                              <Scissors size={10} style={{ marginRight: '2px' }} /> FOLD LINE
                            </div>
                          )}
                          <div style={styles.placeCardContent}>
                            <h4 style={styles.placeCardGuestName}>{guest.firstName} {guest.lastName}</h4>
                            <div style={styles.placeCardTableBadge}>
                              {guest.tableAssignment ? guest.tableAssignment.toUpperCase() : 'UNASSIGNED TABLE'}
                            </div>
                            {showMealChoiceOnCards && (guest.mealChoice || guest.dietaryRestrictions) && (
                              <div style={styles.placeCardMeal}>
                                <span>{getMealIcon(guest.mealChoice)}</span>
                                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                                  {guest.mealChoice || guest.dietaryRestrictions}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TEMPLATE 2: TABLE TENT CARDS */}
              {activeTemplate === 'table_cards' && (
                <div>
                  <div style={styles.paperSectionTitleRow}>
                    <h3 style={styles.paperSectionTitle}>TABLE TENT CARDS & SEATING ROSTER</h3>
                    <span style={styles.paperSectionMeta}>{tablesList.length} Tables Configured</span>
                  </div>

                  {tablesList.length === 0 ? (
                    <div style={styles.emptyNotice}>No seating tables configured yet in Seating Chart.</div>
                  ) : (
                    <div style={styles.tableCardsGrid}>
                      {(selectedTableFilter === 'ALL' ? tablesList : [selectedTableFilter]).map((tableName) => {
                        const tableGuests = attendingGuests.filter(g => (g.tableAssignment || '').toLowerCase() === tableName.toLowerCase());
                        return (
                          <div key={tableName} style={styles.tableTentCard}>
                            <div style={styles.tableTentHeader}>
                              <h3 style={styles.tableTentTitle}>{tableName.toUpperCase()}</h3>
                              <span style={styles.tableTentSubtitle}>{tableGuests.length} Guests Assigned</span>
                            </div>

                            <div style={styles.tableTentGuestList}>
                              {tableGuests.length === 0 ? (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>No guests assigned to this table</span>
                              ) : (
                                tableGuests.map((g, idx) => (
                                  <div key={g.guestId} style={styles.tableTentGuestRow}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                      {idx + 1}. {g.firstName} {g.lastName}
                                    </span>
                                    {g.mealChoice && (
                                      <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                                        {getMealIcon(g.mealChoice)} {g.mealChoice}
                                      </span>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TEMPLATE 3: DAY-OF TIMELINE ROSTER */}
              {activeTemplate === 'timeline' && (
                <div>
                  <div style={styles.paperSectionTitleRow}>
                    <h3 style={styles.paperSectionTitle}>DAY-OF EVENT TIMELINE ROSTER</h3>
                    <span style={styles.paperSectionMeta}>{filteredTimelineEvents.length} Scheduled Moments</span>
                  </div>

                  {filteredTimelineEvents.length === 0 ? (
                    <div style={styles.emptyNotice}>No schedule events found for selected role filter.</div>
                  ) : (
                    <div style={styles.timelineTableWrapper}>
                      <table style={styles.paperTable}>
                        <thead>
                          <tr>
                            <th style={styles.paperTh}>TIME</th>
                            <th style={styles.paperTh}>MOMENT / EVENT</th>
                            <th style={styles.paperTh}>RESPONSIBILITY</th>
                            <th style={styles.paperTh}>LOCATION</th>
                            <th style={styles.paperTh}>NOTES</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTimelineEvents.map((event, idx) => (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                              <td style={styles.paperTdBold}>
                                {formatTimeDisplay(event.startTime, timeFormat)}
                                {event.endTime ? ` - ${formatTimeDisplay(event.endTime, timeFormat)}` : ''}
                                {event.isAfterMidnight ? ' 🌙 (+1)' : ''}
                              </td>
                              <td style={styles.paperTdBold}>{event.eventMoment}</td>
                              <td style={styles.paperTd}>{event.responsibility || '-'}</td>
                              <td style={styles.paperTd}>{event.location || '-'}</td>
                              <td style={styles.paperTd}>{event.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TEMPLATE 4: EMERGENCY VENDOR CONTACT ROSTER */}
              {activeTemplate === 'vendors' && (
                <div>
                  <div style={styles.paperSectionTitleRow}>
                    <h3 style={styles.paperSectionTitle}>EMERGENCY VENDOR CONTACT DIRECTORY</h3>
                    <span style={styles.paperSectionMeta}>{filteredVendors.length} Hired Vendors</span>
                  </div>

                  {filteredVendors.length === 0 ? (
                    <div style={styles.emptyNotice}>No vendor directory contacts found for selected category filter.</div>
                  ) : (
                    <div style={styles.vendorsTableWrapper}>
                      <table style={styles.paperTable}>
                        <thead>
                          <tr>
                            <th style={styles.paperTh}>CATEGORY</th>
                            <th style={styles.paperTh}>BUSINESS / VENDOR</th>
                            <th style={styles.paperTh}>CONTACT PERSON</th>
                            <th style={styles.paperTh}>PHONE NUMBER</th>
                            <th style={styles.paperTh}>EMAIL ADDRESS</th>
                            <th style={styles.paperTh}>ARRIVAL / NOTES</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVendors.map((vendor, idx) => (
                            <tr key={vendor.vendorId || idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                              <td style={styles.paperTdBold}>{vendor.category || 'General'}</td>
                              <td style={styles.paperTdBold}>{vendor.vendorName}</td>
                              <td style={styles.paperTd}>{vendor.contactPerson || '-'}</td>
                              <td style={styles.paperTdMono}>{vendor.phone || '-'}</td>
                              <td style={styles.paperTdMono}>{vendor.email || '-'}</td>
                              <td style={styles.paperTd}>
                                {vendor.arrivalTime ? `Arrival: ${vendor.arrivalTime}` : ''}
                                {vendor.notes ? ` ${vendor.notes}` : ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modal: {
    backgroundColor: 'var(--color-bg)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '1100px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.15rem',
    color: 'var(--color-on-primary)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-on-primary)',
    cursor: 'pointer',
  },
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  sidebar: {
    width: '280px',
    backgroundColor: 'var(--color-bg)',
    borderRight: '1px solid var(--color-muted)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    overflowY: 'auto',
    flexShrink: 0,
  },
  tabBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
  },
  filterBox: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  filterTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  filterLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  filterSelect: {
    padding: '0.35rem 0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.68rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  printTriggerBtn: {
    marginTop: 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
  },
  paperSheet: {
    backgroundColor: '#ffffff',
    color: '#111827',
    width: '100%',
    maxWidth: '780px',
    minHeight: '800px',
    padding: '2rem',
    borderRadius: '4px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  paperHeader: {
    borderBottom: '2px solid #111827',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  paperWeddingTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.75rem',
    margin: 0,
    letterSpacing: '0.05em',
    color: '#111827',
  },
  paperWeddingDate: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: '#6b7280',
    letterSpacing: '0.1em',
  },
  paperSectionTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0.5rem',
  },
  paperSectionTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.95rem',
    fontWeight: 700,
    margin: 0,
    color: '#111827',
  },
  paperSectionMeta: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: '#6b7280',
  },
  emptyNotice: {
    padding: '2rem',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: '#6b7280',
    border: '1px dashed #d1d5db',
    borderRadius: '4px',
  },
  placeCardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  placeCard: {
    border: '1px dashed #9ca3af',
    borderRadius: '4px',
    padding: '1rem',
    backgroundColor: '#ffffff',
    position: 'relative',
    minHeight: '130px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  foldIndicator: {
    position: 'absolute',
    top: '4px',
    right: '8px',
    fontSize: '0.55rem',
    fontFamily: 'var(--font-mono)',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
  },
  placeCardContent: {
    textAlign: 'center',
  },
  placeCardGuestName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.2rem',
    margin: '0 0 0.4rem 0',
    color: '#111827',
  },
  placeCardTableBadge: {
    display: 'inline-block',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    padding: '0.2rem 0.5rem',
    borderRadius: '2px',
    color: '#374151',
  },
  placeCardMeal: {
    marginTop: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    color: '#4b5563',
  },
  tableCardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
  },
  tableTentCard: {
    border: '2px solid #111827',
    borderRadius: '4px',
    padding: '1.25rem',
    backgroundColor: '#ffffff',
  },
  tableTentHeader: {
    borderBottom: '1px solid #111827',
    paddingBottom: '0.5rem',
    marginBottom: '0.75rem',
    textAlign: 'center',
  },
  tableTentTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.35rem',
    margin: 0,
    color: '#111827',
  },
  tableTentSubtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: '#6b7280',
  },
  tableTentGuestList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  tableTentGuestRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.2rem 0',
    borderBottom: '1px dashed #f3f4f6',
  },
  timelineTableWrapper: {
    overflowX: 'auto',
  },
  vendorsTableWrapper: {
    overflowX: 'auto',
  },
  paperTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.75rem',
  },
  paperTh: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '0.5rem 0.6rem',
    borderBottom: '2px solid #111827',
    textAlign: 'left',
  },
  paperTd: {
    padding: '0.5rem 0.6rem',
    borderBottom: '1px solid #e5e7eb',
    color: '#374151',
  },
  paperTdBold: {
    padding: '0.5rem 0.6rem',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 600,
    color: '#111827',
  },
  paperTdMono: {
    padding: '0.5rem 0.6rem',
    borderBottom: '1px solid #e5e7eb',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: '#374151',
  },
};
