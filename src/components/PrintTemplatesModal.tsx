'use client';

import React, { useState } from 'react';
import { Guest, ScheduleEvent, Vendor } from '@/lib/sheets/types';
import { Printer, X, Filter, Check, Heart, Calendar, Users, Clock, Phone, Mail, MapPin, Sparkles, Scissors, Music } from 'lucide-react';
import { formatTimeDisplay } from '@/components/TimelineManager';
import { formatCurrency } from '@/lib/currency';

export type PrintTemplateType = 'place_cards' | 'table_cards' | 'timeline' | 'vendors' | 'upload_qr_cards' | 'song_request_qr_cards';

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

  // Filters & Customization Options [PRINT-5 & PRINT-6]
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedVendorCatFilter, setSelectedVendorCatFilter] = useState<string>('ALL');
  
  // Field & Aesthetic Controls [PRINT-5 & PRINT-6 & PRINT-12]
  const [showMealChoiceOnCards, setShowMealChoiceOnCards] = useState<boolean>(true);
  const [showDietaryBadgesOnCards, setShowDietaryBadgesOnCards] = useState<boolean>(true);
  const [showPlusOneOnCards, setShowPlusOneOnCards] = useState<boolean>(true);
  const [showTableNumberOnCards, setShowTableNumberOnCards] = useState<boolean>(true);
  const [showFoldLines, setShowFoldLines] = useState<boolean>(true);
  const [showSeatMaps, setShowSeatMaps] = useState<boolean>(true);
  const [showDecorativeIcons, setShowDecorativeIcons] = useState<boolean>(true);
  const [enableBinderPunchMargins, setEnableBinderPunchMargins] = useState<boolean>(false);
  const [printTypography, setPrintTypography] = useState<'serif' | 'sans' | 'script' | 'mono'>('serif');

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

  const renderTableDiagram = (tableName: string, seatedGuests: Guest[]) => {
    const lowerName = tableName.toLowerCase();
    const isSweetheart = lowerName.includes('sweetheart') || lowerName.includes('bride & groom');
    const isSquare = lowerName.includes('vip') || lowerName.includes('square');
    const isRectangle = lowerName.includes('head') || lowerName.includes('bridal') || lowerName.includes('rectangle');

    const capacity = Math.max(seatedGuests.length, isSweetheart ? 2 : 8);

    if (isSweetheart) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.75rem 0', padding: '0.5rem', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4b5563', marginBottom: '0.35rem' }}>
            SEAT MAP DIAGRAM (SWEETHEART)
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {Array.from({ length: 2 }).map((_, idx) => {
              const seatNum = idx + 1;
              const guest = seatedGuests.find(g => g.seatNumber === seatNum) || seatedGuests[idx];
              return (
                <div key={seatNum} style={{ textAlign: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#111827', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, margin: '0 auto 2px auto' }}>
                    #{seatNum}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: '#374151', fontWeight: 600, display: 'block', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {guest ? guest.firstName : 'Empty'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (isRectangle || isSquare) {
      const perSide = Math.ceil(capacity / 2);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.75rem 0', padding: '0.5rem', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4b5563', marginBottom: '0.35rem' }}>
            SEAT MAP DIAGRAM ({isSquare ? 'SQUARE' : 'RECTANGLE'})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {Array.from({ length: perSide }).map((_, idx) => {
                const seatNum = idx + 1;
                return (
                  <div key={`top-${seatNum}`} style={{ textAlign: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#111827', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                      #{seatNum}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ height: '22px', backgroundColor: '#e5e7eb', border: '1px solid #9ca3af', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#374151', fontFamily: 'var(--font-mono)' }}>
              TABLE SURFACE
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {Array.from({ length: perSide }).map((_, idx) => {
                const seatNum = perSide + idx + 1;
                return (
                  <div key={`bottom-${seatNum}`} style={{ textAlign: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#111827', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                      #{seatNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Default Round Table
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.75rem 0', padding: '0.5rem', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '6px' }}>
        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4b5563', marginBottom: '0.35rem' }}>
          SEAT MAP DIAGRAM (ROUND TABLE)
        </span>
        <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#e5e7eb', border: '2px solid #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#374151', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            DISC
          </div>
          {Array.from({ length: capacity }).map((_, idx) => {
            const seatNum = idx + 1;
            const angle = (2 * Math.PI * idx) / capacity - Math.PI / 2;
            const radius = 48;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={seatNum}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px - 11px)`,
                  top: `calc(50% + ${y}px - 11px)`,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                #{seatNum}
              </div>
            );
          })}
        </div>
      </div>
    );
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
            padding: ${enableBinderPunchMargins ? '0 0 0 25mm' : '0'} !important;
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
            margin: ${enableBinderPunchMargins ? '12mm 12mm 12mm 25mm' : '12mm'};
          }
        }
      `}</style>

      <div className="print-modal-container" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          backgroundColor: 'var(--color-bg-subtle)',
          borderBottom: '2px solid var(--color-primary)',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }} className="modalHeader print-no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Printer size={22} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.1 }}>
                PRINT & EXPORT STUDIO
              </h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                Professional Print Templates & Escort Cards Generator
              </span>
            </div>
          </div>
          <button
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.4rem 0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            onClick={onClose}
            title="Exit Print Studio"
          >
            <X size={16} />
            <span>EXIT STUDIO</span>
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
              { id: 'upload_qr_cards', label: 'Guest Photo Upload QR Cards', icon: Sparkles, count: 4 },
              { id: 'song_request_qr_cards', label: 'Guest Song Request QR Cards', icon: Music, count: 4 },
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
              <div style={{ ...styles.filterGroup, borderBottom: '1px solid var(--color-muted)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <label style={styles.filterLabel}>PRINT TYPOGRAPHY THEME [PRINT-4]</label>
                <select
                  value={printTypography}
                  onChange={(e) => setPrintTypography(e.target.value as any)}
                  style={styles.filterSelect}
                >
                  <option value="serif">Classic Serif (Default)</option>
                  <option value="sans">Modern Sans-Serif</option>
                  <option value="script">Elegant Script / Cursive</option>
                  <option value="mono">Technical Monospace</option>
                </select>
              </div>

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
                      checked={showTableNumberOnCards}
                      onChange={(e) => setShowTableNumberOnCards(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>SHOW TABLE NUMBER [PRINT-6]</span>
                  </label>

                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={showMealChoiceOnCards}
                      onChange={(e) => setShowMealChoiceOnCards(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>SHOW MEAL SELECTION ICON [PRINT-6]</span>
                  </label>

                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={showDietaryBadgesOnCards}
                      onChange={(e) => setShowDietaryBadgesOnCards(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>SHOW DIETARY RESTRICTIONS [PRINT-6]</span>
                  </label>

                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={showPlusOneOnCards}
                      onChange={(e) => setShowPlusOneOnCards(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>SHOW PLUS-ONE / PARTY NAME [PRINT-6]</span>
                  </label>

                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={showDecorativeIcons}
                      onChange={(e) => setShowDecorativeIcons(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>SHOW DECORATIVE ICONS [PRINT-5]</span>
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

                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={enableBinderPunchMargins}
                      onChange={(e) => setEnableBinderPunchMargins(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>3-RING BINDER HOLE MARGINS [PRINT-12]</span>
                  </label>
                </>
              )}

              {activeTemplate === 'table_cards' && (
                <>
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

                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={showSeatMaps}
                      onChange={(e) => setShowSeatMaps(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>SHOW COORDINATOR SEAT MAPS</span>
                  </label>
                </>
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

              {activeTemplate !== 'place_cards' && (
                <label style={{ ...styles.checkLabel, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-muted)' }}>
                  <input
                    type="checkbox"
                    checked={enableBinderPunchMargins}
                    onChange={(e) => setEnableBinderPunchMargins(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>3-RING BINDER HOLE MARGINS [PRINT-12]</span>
                </label>
              )}
            </div>

            {/* Print Action Trigger */}
            <button type="button" onClick={handlePrint} style={styles.printTriggerBtn}>
              <Printer size={16} style={{ marginRight: '0.4rem' }} /> PRINT / EXPORT PDF
            </button>
          </nav>

          {/* Right Live Preview Content Sheet */}
          <div style={styles.previewContainer}>
            <div
              id="print-studio-paper-content"
              style={{
                ...styles.paperSheet,
                paddingLeft: enableBinderPunchMargins ? '2.5rem' : '2rem',
                borderLeft: enableBinderPunchMargins ? '4px solid var(--color-primary)' : styles.paperSheet.border,
                transition: 'all 0.2s ease',
                ...(printTypography === 'sans' ? { '--font-serif': 'var(--font-sans)', '--font-header': 'var(--font-sans)' } :
                    printTypography === 'mono' ? { '--font-serif': 'var(--font-mono)', '--font-header': 'var(--font-mono)', '--font-sans': 'var(--font-mono)' } :
                    printTypography === 'script' ? { '--font-serif': '"Great Vibes", "Dancing Script", "Brush Script MT", cursive', '--font-header': '"Great Vibes", "Dancing Script", "Brush Script MT", cursive' } :
                    {}) as any
              }}
            >
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
                            {showDecorativeIcons && (
                              <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem', opacity: 0.85 }}>
                                💍 ✨
                              </div>
                            )}

                            <h4 style={styles.placeCardGuestName}>
                              {guest.firstName} {guest.lastName}
                              {showPlusOneOnCards && guest.partyGroup && guest.partyGroup !== 'Individual' && (
                                <span style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 400, color: '#6b7280', marginTop: '2px' }}>
                                  ({guest.partyGroup})
                                </span>
                              )}
                            </h4>

                            {showTableNumberOnCards && (
                              <div style={styles.placeCardTableBadge}>
                                {guest.tableAssignment ? guest.tableAssignment.toUpperCase() : 'UNASSIGNED TABLE'}
                              </div>
                            )}

                            {(showMealChoiceOnCards || showDietaryBadgesOnCards) && (guest.mealChoice || guest.dietaryRestrictions) && (
                              <div style={styles.placeCardMeal}>
                                {showMealChoiceOnCards && <span>{getMealIcon(guest.mealChoice)}</span>}
                                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                                  {showMealChoiceOnCards && guest.mealChoice ? guest.mealChoice : ''}
                                  {showMealChoiceOnCards && guest.mealChoice && showDietaryBadgesOnCards && guest.dietaryRestrictions ? ' • ' : ''}
                                  {showDietaryBadgesOnCards && guest.dietaryRestrictions ? `⚠️ ${guest.dietaryRestrictions}` : ''}
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
                    <div>
                      {Array.from({ length: Math.ceil((selectedTableFilter === 'ALL' ? tablesList : [selectedTableFilter]).length / 2) }, (_, i) => 
                        (selectedTableFilter === 'ALL' ? tablesList : [selectedTableFilter]).slice(i * 2, i * 2 + 2)
                      ).map((tableChunk, chunkIdx, chunksArray) => (
                        <div key={chunkIdx} style={{ pageBreakAfter: chunkIdx === chunksArray.length - 1 ? 'auto' : 'always', marginBottom: '2rem' }}>
                          <div style={styles.tableCardsGrid}>
                            {tableChunk.map((tableName) => {
                              const tableGuests = attendingGuests.filter(g => (g.tableAssignment || '').toLowerCase() === tableName.toLowerCase());
                              return (
                                <div key={tableName} style={styles.tableTentCard}>
                                  <div style={styles.tableTentHeader}>
                                    <h3 style={styles.tableTentTitle}>{tableName.toUpperCase()}</h3>
                                    <span style={styles.tableTentSubtitle}>{tableGuests.length} Guests Assigned</span>
                                  </div>

                                  {/* Coordinator Visual Table Diagram */}
                                  {showSeatMaps && renderTableDiagram(tableName, tableGuests)}

                                  <div style={styles.tableTentGuestList}>
                                    {tableGuests.length === 0 ? (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>No guests assigned to this table</span>
                                    ) : (
                                      tableGuests.map((g, idx) => {
                                        const seatNum = typeof g.seatNumber === 'number' ? g.seatNumber : idx + 1;
                                        return (
                                          <div key={g.guestId} style={styles.tableTentGuestRow}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                              <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                backgroundColor: '#111827',
                                                color: '#ffffff',
                                                borderRadius: '3px',
                                                padding: '0.1rem 0.35rem',
                                              }}>
                                                #{seatNum}
                                              </span>
                                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                                {g.firstName} {g.lastName}
                                              </span>
                                            </div>
                                            {g.mealChoice && (
                                              <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                                                {getMealIcon(g.mealChoice)} {g.mealChoice}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TEMPLATE: GUEST PHOTO UPLOAD QR CARDS */}
              {activeTemplate === 'upload_qr_cards' && (
                <div>
                  <div style={styles.paperSectionTitleRow}>
                    <h3 style={styles.paperSectionTitle}>GUEST RECEPTION PHOTO UPLOAD QR CARDS</h3>
                    <span style={styles.paperSectionMeta}>Table & Bar Display Cards</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {[1, 2, 3, 4].map((cardNum) => (
                      <div key={cardNum} style={{ border: '2px solid #111827', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: '0 0 0.25rem 0', color: '#111827' }}>
                          SHARE YOUR MEMORIES
                        </h3>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6b7280', margin: '0 0 1rem 0' }}>
                          {weddingName.toUpperCase()} {weddingDate ? `• ${weddingDate}` : ''}
                        </p>

                        {/* Simulated QR Code Box */}
                        <div style={{ width: '120px', height: '120px', border: '3px solid #111827', padding: '8px', borderRadius: '8px', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ width: '100%', height: '100%', border: '2px dashed #374151', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                            <span style={{ fontSize: '1.5rem' }}>📷</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700, color: '#111827', marginTop: '2px' }}>SCAN QR</span>
                          </div>
                        </div>

                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: '#374151', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                          Point your phone camera to upload photos & videos directly to our Google Drive!
                        </p>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#9ca3af' }}>
                          No App Required • Direct Drive Upload
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEMPLATE: GUEST SONG REQUEST QR CARDS */}
              {activeTemplate === 'song_request_qr_cards' && (
                <div>
                  <div style={styles.paperSectionTitleRow}>
                    <h3 style={styles.paperSectionTitle}>GUEST RECEPTION SONG REQUEST QR CARDS</h3>
                    <span style={styles.paperSectionMeta}>Bar & DJ Booth Tent Cards</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {[1, 2, 3, 4].map((cardNum) => (
                      <div key={cardNum} style={{ border: '2px solid #111827', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: '0 0 0.25rem 0', color: '#111827' }}>
                          REQUEST A SONG! 🎵
                        </h3>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#6b7280', margin: '0 0 1rem 0' }}>
                          {weddingName.toUpperCase()} {weddingDate ? `• ${weddingDate}` : ''}
                        </p>

                        {/* Simulated QR Code Box */}
                        <div style={{ width: '120px', height: '120px', border: '3px solid #111827', padding: '8px', borderRadius: '8px', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ width: '100%', height: '100%', border: '2px dashed #374151', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                            <span style={{ fontSize: '1.5rem' }}>🎶</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', fontWeight: 700, color: '#111827', marginTop: '2px' }}>SCAN QR</span>
                          </div>
                        </div>

                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: '#374151', margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                          Point your phone camera to search & send live song requests to the DJ!
                        </p>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#9ca3af' }}>
                          Includes 30s Audio Previews • Live DJ Sync
                        </span>
                      </div>
                    ))}
                  </div>
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
                              <td style={styles.paperTd}>{vendor.contactName || '-'}</td>
                              <td style={styles.paperTdMono}>{vendor.phoneNumber || '-'}</td>
                              <td style={styles.paperTdMono}>{vendor.emailAddress || '-'}</td>
                              <td style={styles.paperTd}>{vendor.notes || '-'}</td>
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
    padding: '1.5rem',
  },
  modal: {
    backgroundColor: 'var(--color-bg)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-lg)',
    width: '85vw',
    height: '85vh',
    maxWidth: '85%',
    maxHeight: '85%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
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
