'use client';

import React, { useState } from 'react';
import { GiftItem, Guest } from '@/lib/sheets/types';
import { 
  Heart, 
  Gift, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  DollarSign, 
  Users, 
  Mail, 
  AlertCircle,
  Sparkles,
  Check,
  UserCheck
} from 'lucide-react';

interface ThankYouManagerProps {
  gifts: GiftItem[];
  guests: Guest[];
  onUpdateGifts: (updatedGifts: GiftItem[]) => Promise<void>;
  onUpdateGuests: (updatedGuests: Guest[]) => Promise<void>;
  isSyncing?: boolean;
}

export default function ThankYouManager({
  gifts,
  guests,
  onUpdateGifts,
  onUpdateGuests,
  isSyncing
}: ThankYouManagerProps) {
  // Active Sub-Tab: 'gifts' | 'attendance'
  const [subTab, setSubTab] = useState<'gifts' | 'attendance'>('gifts');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [thankedFilter, setThankedFilter] = useState<'All' | 'Thanked' | 'Pending'>('All');

  // Modals State for Gifts
  const [isAddingGift, setIsAddingGift] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  const [giftToDelete, setShotToDelete] = useState<GiftItem | null>(null);

  // Form State for Add / Edit Gift
  const [formData, setFormData] = useState<Partial<GiftItem>>({
    description: '',
    giverName: '',
    category: 'Kitchen & Dining',
    amount: 0,
    thankYouSent: false,
    notes: '',
  });

  // Calculate KPIs
  const totalGifts = gifts.length;
  const totalGiftValue = gifts.reduce((sum, g) => sum + (g.amount || 0), 0);
  const giftsThankedCount = gifts.filter(g => g.thankYouSent).length;
  const giftsThankedPercent = totalGifts > 0 ? Math.round((giftsThankedCount / totalGifts) * 100) : 0;

  // Group ONLY Attending Guests by Party Group
  const attendingGuests = guests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'attending');

  const partyMap = new Map<string, Guest[]>();
  attendingGuests.forEach(guest => {
    const key = guest.partyGroup && guest.partyGroup.trim() !== '' 
      ? guest.partyGroup.trim() 
      : `${guest.firstName} ${guest.lastName}`;
    
    if (!partyMap.has(key)) {
      partyMap.set(key, []);
    }
    partyMap.get(key)!.push(guest);
  });

  interface AttendingPartyGroup {
    groupKey: string;
    members: Guest[];
    mailingAddress: string;
    emailAddress: string;
    isThanked: boolean;
  }

  const attendingParties: AttendingPartyGroup[] = Array.from(partyMap.entries()).map(([groupKey, members]) => {
    const mailingAddress = members.find(m => m.mailingAddress)?.mailingAddress || '';
    const emailAddress = members.find(m => m.emailAddress)?.emailAddress || '';
    const isThanked = members.length > 0 && members.every(m => Boolean(m.thankedSent));

    return {
      groupKey,
      members,
      mailingAddress,
      emailAddress,
      isThanked
    };
  });

  const attendanceThankedCount = attendingParties.filter(p => p.isThanked).length;
  const attendanceThankedPercent = attendingParties.length > 0 ? Math.round((attendanceThankedCount / attendingParties.length) * 100) : 0;

  // Filtered Gifts
  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = 
      (gift.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gift.giverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gift.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesThanked = 
      thankedFilter === 'All' ? true :
      thankedFilter === 'Thanked' ? gift.thankYouSent :
      !gift.thankYouSent;

    return matchesSearch && matchesThanked;
  });

  // Filtered Attending Parties for Attendance Thank Yous
  const filteredAttendingParties = attendingParties.filter(party => {
    const memberNames = party.members.map(m => `${m.firstName} ${m.lastName}`).join(' ');
    const searchTarget = `${party.groupKey} ${memberNames}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    
    const matchesThanked = 
      thankedFilter === 'All' ? true :
      thankedFilter === 'Thanked' ? party.isThanked :
      !party.isThanked;

    return matchesSearch && matchesThanked;
  });

  // Toggle Gift Thank You Status
  const toggleGiftThanked = async (giftId: string) => {
    if (isSyncing) return;
    const updated = gifts.map(g => 
      g.giftId === giftId ? { ...g, thankYouSent: !g.thankYouSent } : g
    );
    await onUpdateGifts(updated);
  };

  // Toggle Guest Attendance Thank You Status for Entire Party Group
  const togglePartyAttendanceThanked = async (members: Guest[], currentThankedState: boolean) => {
    if (isSyncing) return;
    const targetGuestIds = new Set(members.map(m => m.guestId));
    const newThankedState = !currentThankedState;

    const updated = guests.map(g => 
      targetGuestIds.has(g.guestId) ? { ...g, thankedSent: newThankedState } : g
    );
    await onUpdateGuests(updated);
  };

  // Open Add Gift Modal
  const startAddGift = () => {
    setFormData({
      description: '',
      giverName: '',
      category: 'Kitchen & Dining',
      amount: 0,
      thankYouSent: false,
      notes: '',
    });
    setIsAddingGift(true);
    setEditingGift(null);
  };

  // Open Edit Gift Modal
  const startEditGift = (gift: GiftItem) => {
    setFormData(gift);
    setEditingGift(gift);
    setIsAddingGift(false);
  };

  // Save Gift Handler
  const handleSaveGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.giverName) return;

    if (isAddingGift) {
      const newGift: GiftItem = {
        giftId: `G${Date.now().toString().slice(-4)}`,
        description: formData.description || 'New Gift',
        giverName: formData.giverName || 'Anonymous Giver',
        category: formData.category || 'General',
        amount: Number(formData.amount) || 0,
        thankYouSent: Boolean(formData.thankYouSent),
        notes: formData.notes || '',
      };
      await onUpdateGifts([...gifts, newGift]);
    } else if (editingGift) {
      const updated = gifts.map(g => 
        g.giftId === editingGift.giftId ? { ...g, ...formData, amount: Number(formData.amount) || 0 } as GiftItem : g
      );
      await onUpdateGifts(updated);
    }

    setIsAddingGift(false);
    setEditingGift(null);
  };

  // Confirm Delete Gift
  const confirmDeleteGift = async () => {
    if (!giftToDelete) return;
    const updated = gifts.filter(g => g.giftId !== giftToDelete.giftId);
    await onUpdateGifts(updated);
    setShotToDelete(null);
  };

  return (
    <div style={styles.container}>
      {/* Header Title & Top Controls */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Thank You Card & Gift Tracker</h2>
          <p style={styles.subtitle}>
            Track wedding gifts received, thank you note progress, and attendance thank you cards.
          </p>
        </div>

        {subTab === 'gifts' && (
          <button style={styles.addButton} onClick={startAddGift}>
            <Plus size={16} style={{ marginRight: '6px' }} /> LOG RECEIVED GIFT
          </button>
        )}
      </div>

      {/* KPI Bar */}
      <div style={styles.kpiBar}>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>TOTAL GIFTS RECEIVED</span>
          <span style={styles.kpiValue}>
            {totalGifts} <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 400 }}>(${totalGiftValue.toLocaleString()})</span>
          </span>
        </div>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>GIFT THANK YOUS SENT</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>
            {giftsThankedCount} / {totalGifts} ({giftsThankedPercent}%)
          </span>
        </div>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>ATTENDING PARTIES</span>
          <span style={styles.kpiValue}>
            {attendingParties.length} Parties <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 400 }}>({attendingGuests.length} Guests)</span>
          </span>
        </div>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>ATTENDANCE CARDS SENT</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-primary)' }}>
            {attendanceThankedCount} / {attendingParties.length} ({attendanceThankedPercent}%)
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div style={styles.subTabBar}>
        <button
          style={{
            ...styles.subTabBtn,
            backgroundColor: subTab === 'gifts' ? 'var(--color-primary)' : 'transparent',
            color: subTab === 'gifts' ? 'var(--color-on-primary)' : 'var(--color-text)',
            fontWeight: subTab === 'gifts' ? 700 : 400
          }}
          onClick={() => setSubTab('gifts')}
        >
          <Gift size={16} style={{ marginRight: '6px' }} /> GIFT REGISTRY THANK YOUS ({gifts.length})
        </button>

        <button
          style={{
            ...styles.subTabBtn,
            backgroundColor: subTab === 'attendance' ? 'var(--color-primary)' : 'transparent',
            color: subTab === 'attendance' ? 'var(--color-on-primary)' : 'var(--color-text)',
            fontWeight: subTab === 'attendance' ? 700 : 400
          }}
          onClick={() => setSubTab('attendance')}
        >
          <UserCheck size={16} style={{ marginRight: '6px' }} /> GUEST ATTENDANCE CARDS ({attendingParties.length} PARTIES)
        </button>
      </div>

      {/* Search & Filter Section */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder={subTab === 'gifts' ? "Search gift description, giver name, or category..." : "Search attending guest or party name..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <Filter size={16} style={{ color: 'var(--color-muted)' }} />
          <select 
            value={thankedFilter} 
            onChange={(e) => setThankedFilter(e.target.value as any)}
            style={styles.filterSelect}
          >
            <option value="All">All Thank You Statuses</option>
            <option value="Thanked">Thanked Only (Sent)</option>
            <option value="Pending">Pending Only (Unsent)</option>
          </select>
        </div>
      </div>

      {/* SUB-TAB 1: GIFTS REGISTRY TRACKER */}
      {subTab === 'gifts' && (
        <div style={styles.gridContainer}>
          {filteredGifts.map(gift => (
            <div 
              key={gift.giftId} 
              style={{
                ...styles.card,
                borderColor: gift.thankYouSent ? 'var(--color-green)' : 'var(--color-muted)',
                opacity: gift.thankYouSent ? 0.9 : 1
              }}
            >
              <div style={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    style={{
                      ...styles.statusCheckBtn,
                      color: gift.thankYouSent ? 'var(--color-green)' : 'var(--color-muted)'
                    }}
                    onClick={() => toggleGiftThanked(gift.giftId)}
                    title={gift.thankYouSent ? 'Mark Thank You Unsent' : 'Mark Thank You Sent'}
                  >
                    {gift.thankYouSent ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={styles.idBadge}>{gift.giftId}</span>
                      <span style={styles.categoryBadge}>{gift.category}</span>
                    </div>
                    <h3 style={{ ...styles.cardTitle, textDecoration: gift.thankYouSent ? 'line-through' : 'none' }}>
                      {gift.description}
                    </h3>
                  </div>
                </div>

                <div style={styles.actionGroup}>
                  <button style={styles.iconBtn} onClick={() => startEditGift(gift)} title="Edit Gift">
                    <Edit2 size={14} />
                  </button>
                  <button style={{ ...styles.iconBtn, color: '#ef4444' }} onClick={() => setShotToDelete(gift)} title="Delete Gift">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.giverBox}>
                  <span style={styles.giverLabel}>GIFT FROM:</span>
                  <span style={styles.giverValue}>{gift.giverName}</span>
                </div>

                <div style={styles.amountBox}>
                  <span style={styles.amountLabel}>EST. VALUE / CASH:</span>
                  <span style={styles.amountValue}>
                    {gift.amount > 0 ? `$${gift.amount.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
              </div>

              {gift.notes && (
                <p style={styles.notesText}>
                  💡 {gift.notes}
                </p>
              )}
            </div>
          ))}

          {filteredGifts.length === 0 && (
            <div style={styles.emptyState}>
              <Gift size={40} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
              <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>No Received Gifts Logged</h4>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Log received wedding gifts to track who gave what and send thank you notes!
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ATTENDANCE THANK YOU CARDS TRACKER */}
      {subTab === 'attendance' && (
        <div style={styles.gridContainer}>
          {filteredAttendingParties.map(party => (
            <div 
              key={party.groupKey} 
              style={{
                ...styles.card,
                borderColor: party.isThanked ? 'var(--color-green)' : 'var(--color-muted)',
                opacity: party.isThanked ? 0.9 : 1
              }}
            >
              <div style={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    style={{
                      ...styles.statusCheckBtn,
                      color: party.isThanked ? 'var(--color-green)' : 'var(--color-muted)'
                    }}
                    onClick={() => togglePartyAttendanceThanked(party.members, party.isThanked)}
                    title={party.isThanked ? 'Mark Party Attendance Card Unsent' : 'Mark Party Attendance Card Sent'}
                  >
                    {party.isThanked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>

                  <div>
                    <h3 style={{ ...styles.cardTitle, textDecoration: party.isThanked ? 'line-through' : 'none' }}>
                      {party.groupKey}
                    </h3>
                    <span style={styles.partyText}>
                      {party.members.length} Attending {party.members.length === 1 ? 'Guest' : 'Guests'}: {party.members.map(m => `${m.firstName} ${m.lastName}`).join(', ')}
                    </span>
                  </div>
                </div>

                <span style={{
                  ...styles.statusTag,
                  backgroundColor: party.isThanked ? 'var(--color-green-muted)' : 'var(--color-gold-muted)',
                  color: party.isThanked ? 'var(--color-green)' : 'var(--color-gold)',
                  borderColor: party.isThanked ? 'var(--color-green)' : 'var(--color-gold)'
                }}>
                  {party.isThanked ? 'THANK YOU SENT' : 'PENDING CARD'}
                </span>
              </div>

              {(party.emailAddress || party.mailingAddress) && (
                <div style={{ ...styles.cardBody, flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-muted)', alignItems: 'flex-start' }}>
                  {party.mailingAddress && <span>📫 Mailing Address: {party.mailingAddress}</span>}
                  {party.emailAddress && <span>✉️ Email: {party.emailAddress}</span>}
                </div>
              )}
            </div>
          ))}

          {filteredAttendingParties.length === 0 && (
            <div style={styles.emptyState}>
              <UserCheck size={40} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
              <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>No Attending Parties Found</h4>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Attending party groups from your Guest List tab will automatically appear here!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT GIFT MODAL */}
      {(isAddingGift || editingGift) && (
        <div style={styles.modalOverlay} onClick={() => { setIsAddingGift(false); setEditingGift(null); }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: '#000000' }} className="modalTitle">
                {isAddingGift ? 'LOG RECEIVED GIFT' : 'EDIT GIFT RECORD'}
              </h3>
              <button style={{ ...styles.closeBtn, color: '#000000' }} className="closeBtn" onClick={() => { setIsAddingGift(false); setEditingGift(null); }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGift} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>GIFT DESCRIPTION / ITEM NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KitchenAid Stand Mixer or $200 Cash Gift"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.inputField}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>GIFT GIVER (FROM) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uncle Bob & Aunt Sarah"
                    value={formData.giverName || ''}
                    onChange={(e) => setFormData({ ...formData, giverName: e.target.value })}
                    style={styles.inputField}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>CATEGORY / STORE</label>
                  <input
                    type="text"
                    placeholder="e.g. Kitchen & Dining, Honeyfund, Target"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>ESTIMATED VALUE / CASH AMOUNT ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 150"
                    value={formData.amount || 0}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    style={styles.inputField}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>THANK YOU SENT?</label>
                  <select
                    value={formData.thankYouSent ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, thankYouSent: e.target.value === 'true' })}
                    style={styles.selectInput}
                  >
                    <option value="false">Pending (Not Sent Yet)</option>
                    <option value="true">Sent (Thanked)</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>DELIVERY / POSING NOTES</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Shipped via Amazon, include special note about trip to Italy"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ ...styles.inputField, height: 'auto', resize: 'vertical' }}
                />
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.saveBtn} className="saveBtn">
                  SAVE GIFT RECORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE GIFT CONFIRMATION MODAL */}
      {giftToDelete && (
        <div style={styles.modalOverlay} onClick={() => setShotToDelete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE GIFT RECORD CONFIRMATION
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setShotToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-red)' }}>"{giftToDelete.description}"</strong> from {giftToDelete.giverName}?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShotToDelete(null)}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  style={styles.confirmDeleteBtn}
                  onClick={confirmDeleteGift}
                >
                  DELETE GIFT
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
    gap: '1.5rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  subTabBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.5rem',
  },
  subTabBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.5rem 0.875rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 240px',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '10px',
    color: 'var(--color-muted)',
  },
  searchInput: {
    width: '100%',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterSelect: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: 'var(--box-shadow-subtle)',
    transition: 'var(--transition-smooth)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  statusCheckBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  idBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-muted)',
  },
  categoryBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    backgroundColor: 'var(--color-gold-muted)',
    color: 'var(--color-gold)',
    border: '1px solid var(--color-gold)',
    borderRadius: 'var(--border-radius-sm)',
  },
  statusTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid transparent',
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
    fontWeight: 700,
    margin: '0.25rem 0 0 0',
    lineHeight: 1.3,
  },
  partyText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    display: 'block',
    marginTop: '0.2rem',
  },
  cardBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
  },
  giverBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  giverLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  giverValue: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  amountBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  amountValue: {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
  notesText: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    margin: 0,
    fontStyle: 'italic',
    borderTop: '1px dashed var(--color-muted)',
    paddingTop: '0.5rem',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-surface)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    width: '100%',
    maxWidth: '520px',
    boxShadow: 'var(--box-shadow-heavy)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
  },
  modalTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '1.25rem',
  },
  form: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  fieldLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
  },
  inputField: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.625rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
  },
  selectInput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.625rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '0.5rem',
  },
  saveBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-btn-selected-bg)',
    color: 'var(--color-btn-selected-text)',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  cancelBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
  confirmDeleteBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-red)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.625rem 1.25rem',
    cursor: 'pointer',
  },
};
