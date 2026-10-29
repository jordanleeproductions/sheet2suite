'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  UserCheck,
  ChevronDown,
  Tag
} from 'lucide-react';
import MobileFAB from '@/components/MobileFAB';
import PageSearchInput from '@/components/PageSearchInput';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import PageHeaderCard from '@/components/vow/PageHeaderCard';
import PageMetricStrip from '@/components/vow/PageMetricStrip';
import { triggerConfetti } from '@/lib/confetti';
import SlideOverDrawer from '@/components/vow/SlideOverDrawer';
import { DrawerSection, DrawerField, DrawerRow } from '@/components/vow/MonarchForm';

const DEFAULT_GIFT_CATEGORIES = [
  'Kitchen & Dining',
  'Cash & Honeymoon Fund',
  'Home & Decor',
  'Electronics & Appliances',
  'Bed & Bath',
  'Bar & Glassware',
  'Experiences & Travel',
  'Charity Donation',
  'Gift Card & Retail',
  'General',
];

interface GiftCategoryComboboxProps {
  value: string;
  onChange: (val: string) => void;
  categories: string[];
  inputStyle?: React.CSSProperties;
}

function GiftCategoryCombobox({
  value,
  onChange,
  categories,
  inputStyle,
}: GiftCategoryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter(c => c.toLowerCase().includes(term));
  }, [categories, searchTerm]);

  const hasExactMatch = categories.some(
    c => c.toLowerCase() === searchTerm.trim().toLowerCase()
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          style={{
            ...inputStyle,
            paddingRight: '2.2rem',
            width: '100%',
          }}
          value={searchTerm}
          onChange={(e) => {
            const nextVal = e.target.value;
            setSearchTerm(nextVal);
            onChange(nextVal);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Select category or enter store..."
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(prev => !prev)}
          title="Toggle categories"
          style={{
            position: 'absolute',
            right: '0.6rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '210px',
            overflowY: 'auto',
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-muted)',
            borderRadius: 'var(--border-radius-sm, 6px)',
            boxShadow: 'var(--box-shadow-heavy, 0 8px 24px rgba(0, 0, 0, 0.2))',
            padding: '4px',
          }}
        >
          {filteredCategories.map((cat) => {
            const isSelected = cat.toLowerCase() === (value || '').toLowerCase();
            return (
              <div
                key={cat}
                onClick={() => {
                  onChange(cat);
                  setSearchTerm(cat);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isSelected ? 'var(--color-primary-light, rgba(226, 149, 120, 0.15))' : 'transparent',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: isSelected ? 700 : 400,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-light, rgba(226, 149, 120, 0.1))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isSelected ? 'var(--color-primary-light, rgba(226, 149, 120, 0.15))' : 'transparent';
                }}
              >
                <span>{cat}</span>
                {isSelected && <Check size={14} />}
              </div>
            );
          })}

          {searchTerm.trim() && !hasExactMatch && (
            <div
              onClick={() => {
                onChange(searchTerm.trim());
                setIsOpen(false);
              }}
              style={{
                padding: '0.45rem 0.65rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                borderRadius: '4px',
                cursor: 'pointer',
                borderTop: filteredCategories.length > 0 ? '1px dashed var(--color-muted)' : 'none',
                marginTop: filteredCategories.length > 0 ? '4px' : 0,
                color: 'var(--color-primary)',
                fontWeight: 600,
              }}
            >
              + Use custom: &quot;{searchTerm.trim()}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ThankYouManagerProps {
  gifts: GiftItem[];
  guests: Guest[];
  currency?: string;
  weddingName?: string;
  onUpdateGifts: (updatedGifts: GiftItem[]) => Promise<void>;
  onUpdateGuests: (updatedGuests: Guest[]) => Promise<void>;
  isSyncing?: boolean;
}

export default function ThankYouManager({
  gifts,
  guests,
  currency = 'USD',
  weddingName,
  onUpdateGifts,
  onUpdateGuests,
  isSyncing
}: ThankYouManagerProps) {
  // Active Sub-Tab: 'gifts' | 'attendance'
  const [subTab, setSubTab] = useState<'gifts' | 'attendance'>('gifts');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const currencySymbol = getCurrencySymbol(currency);
  const [thankedFilter, setThankedFilter] = useState<'All' | 'Thanked' | 'Pending'>('All');

  // Distinct Categories from gifts and defaults
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    // First include any previously written categories from existing gifts
    gifts.forEach(g => {
      const c = (g.category || '').trim();
      if (c) cats.add(c);
    });
    // Then include default wedding categories
    DEFAULT_GIFT_CATEGORIES.forEach(c => cats.add(c));
    return Array.from(cats);
  }, [gifts]);

  // Modals State for Gifts
  const [isAddingGift, setIsAddingGift] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  const [giftToDelete, setShotToDelete] = useState<GiftItem | null>(null);

  // Form State for Add / Edit Gift
  const [formData, setFormData] = useState<Omit<Partial<GiftItem>, 'amount'> & { amount?: number | string }>({
    description: '',
    giverName: '',
    category: 'Kitchen & Dining',
    amount: '',
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

  const effectiveWeddingName = weddingName || (typeof window !== 'undefined' ? localStorage.getItem('s2v_wedding_name') || '' : '');

  // Helper to detect if a party represents the Bride & Groom / Couple (who do not receive attendance thank-you cards)
  const isCoupleOrBrideGroomParty = (groupKey: string, members: Guest[]): boolean => {
    const cleanKey = groupKey.trim().toLowerCase();
    
    // 1. Direct regex match on partyGroup / groupKey
    if (/^(bride\s*(&|and|\+|\/)\s*groom|groom\s*(&|and|\+|\/)\s*bride|the\s+couple|wedding\s+couple|couple|bride|groom|bride\s*(&|and|\+|\/)\s*bride|groom\s*(&|and|\+|\/)\s*groom|newlyweds)$/i.test(cleanKey)) {
      return true;
    }

    // 2. Individual guest inspection within the party
    const hasBrideOrGroomIndividual = members.some(m => {
      const pg = (m.partyGroup || '').trim().toLowerCase();
      if (/^(bride\s*(&|and|\+|\/)\s*groom|groom\s*(&|and|\+|\/)\s*bride|the\s+couple|wedding\s+couple|couple|bride|groom|newlyweds)$/i.test(pg)) {
        return true;
      }
      const roleNotes = (m.notes || '').toLowerCase();
      if (/\b(bride|groom|the couple)\b/i.test(roleNotes)) {
        return true;
      }
      return false;
    });

    if (hasBrideOrGroomIndividual && members.length <= 2) {
      return true;
    }

    // 3. Sweetheart Table Assignment
    const allSeatedAtSweetheart = members.length > 0 && members.every(m => {
      const table = (m.tableAssignment || '').toLowerCase();
      return table.includes('sweetheart') || /bride\s*(&|and)\s*groom/i.test(table);
    });
    if (allSeatedAtSweetheart) {
      return true;
    }

    // 4. Match against Wedding Name if available (e.g. "Alex & Sam's Wedding" or "Alex & Sam")
    if (effectiveWeddingName) {
      const cleanWeddingName = effectiveWeddingName.replace(/['’]s\s+wedding/i, '').replace(/wedding/i, '').trim();
      const coupleParts = cleanWeddingName.split(/\s*(?:&|and|\+)\s*/i).map(s => s.trim().toLowerCase()).filter(Boolean);
      if (coupleParts.length >= 2) {
        const memberFirstNames = members.map(m => (m.firstName || '').trim().toLowerCase());
        const matchesP1 = memberFirstNames.some(fn => coupleParts[0].includes(fn) || fn.includes(coupleParts[0]));
        const matchesP2 = memberFirstNames.some(fn => coupleParts[1].includes(fn) || fn.includes(coupleParts[1]));
        if (matchesP1 && (matchesP2 || members.length === 1)) {
          return true;
        }
      }
    }

    return false;
  };

  interface AttendingPartyGroup {
    groupKey: string;
    members: Guest[];
    mailingAddress: string;
    emailAddress: string;
    isThanked: boolean;
  }

  const attendingParties: AttendingPartyGroup[] = Array.from(partyMap.entries())
    .filter(([groupKey, members]) => !isCoupleOrBrideGroomParty(groupKey, members))
    .map(([groupKey, members]) => {
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
    const cleanSearch = searchTerm.trim().toLowerCase().replace(/^\$/, '');
    const matchesSearch = 
      (gift.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gift.giverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gift.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cleanSearch !== '' && (
        String(gift.amount || 0).includes(cleanSearch) ||
        (gift.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesCategory = 
      categoryFilter === 'All' ? true :
      (gift.category || 'General').toLowerCase() === categoryFilter.toLowerCase();

    const matchesThanked = 
      thankedFilter === 'All' ? true :
      thankedFilter === 'Thanked' ? gift.thankYouSent :
      !gift.thankYouSent;

    return matchesSearch && matchesCategory && matchesThanked;
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
    const targetGift = gifts.find(g => g.giftId === giftId);
    const willBeThanked = targetGift && !targetGift.thankYouSent;

    const updated = gifts.map(g => 
      g.giftId === giftId ? { ...g, thankYouSent: !g.thankYouSent } : g
    );

    if (willBeThanked) {
      const remainingUnthanked = updated.filter(g => !g.thankYouSent);
      if (remainingUnthanked.length === 0 && updated.length > 0) {
        triggerConfetti({ particleCount: 90 });
      }
    }

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

    if (newThankedState) {
      const attendingGuestsList = updated.filter(g => (g.rsvpStatus || '').toLowerCase() === 'attending');
      const allAttendingThanked = attendingGuestsList.length > 0 && attendingGuestsList.every(g => Boolean(g.thankedSent));
      if (allAttendingThanked) {
        triggerConfetti({ particleCount: 90 });
      }
    }

    await onUpdateGuests(updated);
  };

  // Open Add Gift Modal
  const startAddGift = () => {
    setFormData({
      description: '',
      giverName: '',
      category: allCategories[0] || 'Kitchen & Dining',
      amount: '',
      thankYouSent: false,
      notes: '',
    });
    setIsAddingGift(true);
    setEditingGift(null);
  };

  // Open Edit Gift Modal
  const startEditGift = (gift: GiftItem) => {
    setFormData({
      ...gift,
      amount: gift.amount === 0 ? '' : gift.amount,
    });
    setEditingGift(gift);
    setIsAddingGift(false);
  };

  const currentEditingGiftIndex = useMemo(() => {
    if (!editingGift) return -1;
    return filteredGifts.findIndex(g => g.giftId === editingGift.giftId);
  }, [editingGift, filteredGifts]);

  const handleNavigateAdjacentGift = (direction: 'prev' | 'next') => {
    if (currentEditingGiftIndex === -1) return;
    const targetIndex = direction === 'prev' ? currentEditingGiftIndex - 1 : currentEditingGiftIndex + 1;
    if (targetIndex >= 0 && targetIndex < filteredGifts.length) {
      const nextGift = filteredGifts[targetIndex];
      startEditGift(nextGift);
    }
  };

  const isGiftFormValid = Boolean(
    (formData.description || '').trim() && (formData.giverName || '').trim()
  );

  // Save Gift Handler
  const handleSaveGift = async (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();
    if (!formData.description || !formData.giverName) {
      alert('Please provide Gift Description and Giver Name.');
      return;
    }

    const rawAmount = formData.amount;
    const parsedAmount = (typeof rawAmount === 'number')
      ? rawAmount
      : (rawAmount !== '' && rawAmount !== undefined && rawAmount !== null 
          ? Number(String(rawAmount).replace(/[^0-9.-]+/g, '')) 
          : 0);
    const validAmount = isNaN(parsedAmount) ? 0 : parsedAmount;

    let updated: GiftItem[];
    if (isAddingGift) {
      const newGift: GiftItem = {
        giftId: `G${Date.now().toString().slice(-4)}`,
        description: formData.description || 'New Gift',
        giverName: formData.giverName || 'Anonymous Giver',
        category: formData.category || 'General',
        amount: validAmount,
        thankYouSent: Boolean(formData.thankYouSent),
        notes: formData.notes || '',
      };
      updated = [...gifts, newGift];
    } else if (editingGift) {
      updated = gifts.map(g => 
        g.giftId === editingGift.giftId ? { ...g, ...formData, amount: validAmount } as GiftItem : g
      );
    } else {
      return;
    }

    await onUpdateGifts(updated);

    if (continueAdding) {
      setFormData({
        description: '',
        giverName: '',
        category: formData.category || 'General',
        amount: '',
        thankYouSent: false,
        notes: '',
      });
      setIsAddingGift(true);
      setEditingGift(null);
    } else {
      setIsAddingGift(false);
      setEditingGift(null);
    }
  };

  // Confirm Delete Gift
  const confirmDeleteGift = async () => {
    if (!giftToDelete) return;
    const updated = gifts.filter(g => g.giftId !== giftToDelete.giftId);
    await onUpdateGifts(updated);
    setShotToDelete(null);
  };

  return (
    <div style={styles.container} className="thankyou-container">
      {/* Standardized Header Card with Integrated View Switcher */}
      <PageHeaderCard
        title="Thank You & Gift Tracker"
        subtitle="Track wedding gifts received, thank you note progress, and attendance thank you cards."
        badge={subTab === 'gifts' ? `${gifts.length} Gifts` : `${attendingParties.length} Parties`}
        segmentSwitcher={{
          activeKey: subTab,
          onChange: (key) => setSubTab(key as 'gifts' | 'attendance'),
          segments: [
            { key: 'gifts', label: 'GIFT REGISTRY', icon: <Gift size={14} /> },
            { key: 'attendance', label: 'ATTENDANCE CARDS', icon: <UserCheck size={14} /> },
          ],
        }}
        actionButtons={
          subTab === 'gifts' ? (
            <button
              type="button"
              className="s2v-header-btn s2v-header-btn-primary thankyou-add-btn"
              onClick={startAddGift}
              disabled={isSyncing}
              title="Log Received Gift"
            >
              <Plus size={14} />
              <span>LOG GIFT</span>
            </button>
          ) : undefined
        }
      />

      <style>{`
        @media (max-width: 768px) {
          .thankyou-container {
            gap: 1rem !important;
          }
          .thankyou-add-btn {
            display: none !important;
          }
          .thankyou-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.65rem !important;
            width: 100% !important;
          }
          .thankyou-search-wrapper {
            width: 100% !important;
            flex: 0 0 auto !important;
          }
          .thankyou-filter-group {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
          }
          .thankyou-filter-item {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.4rem !important;
          }
          .thankyou-filter-select {
            width: 100% !important;
            flex: 1 1 auto !important;
            min-width: 0 !important;
            max-width: 100% !important;
            text-overflow: ellipsis !important;
          }
        }
      `}</style>

      {/* Monarch-Style Hero Metric Strip */}
      <PageMetricStrip
        metrics={subTab === 'gifts' ? [
          {
            id: 'gifts',
            label: 'TOTAL GIFTS',
            value: totalGifts,
            subtext: 'Recorded gifts',
            statusBadge: `${totalGifts} Received`,
            statusColor: 'blue',
            onClick: () => setThankedFilter('All'),
            isActive: thankedFilter === 'All',
          },
          {
            id: 'value',
            label: 'ESTIMATED VALUE',
            value: formatCurrency(totalGiftValue, currency),
            subtext: 'Registry & cash funds',
            statusColor: 'purple',
          },
          {
            id: 'gift-thanked',
            label: 'THANK YOUS SENT',
            value: `${giftsThankedCount} / ${totalGifts}`,
            progress: giftsThankedPercent,
            statusBadge: `${giftsThankedPercent}% Sent`,
            statusColor: giftsThankedPercent === 100 && totalGifts > 0 ? 'green' : 'blue',
            onClick: () => setThankedFilter(thankedFilter === 'Thanked' ? 'All' : 'Thanked'),
            isActive: thankedFilter === 'Thanked',
          },
          {
            id: 'pending',
            label: 'PENDING CARDS',
            value: Math.max(0, totalGifts - giftsThankedCount),
            subtext: 'Cards left to write',
            statusBadge: totalGifts - giftsThankedCount === 0 ? 'All Sent' : `${totalGifts - giftsThankedCount} Left`,
            statusColor: totalGifts - giftsThankedCount === 0 ? 'green' : 'amber',
            onClick: () => setThankedFilter(thankedFilter === 'Pending' ? 'All' : 'Pending'),
            isActive: thankedFilter === 'Pending',
          },
        ] : [
          {
            id: 'parties',
            label: 'ATTENDING PARTIES',
            value: attendingParties.length,
            subtext: `${attendingGuests.length} total guests`,
            statusBadge: `${attendingParties.length} Households`,
            statusColor: 'blue',
            onClick: () => setThankedFilter('All'),
            isActive: thankedFilter === 'All',
          },
          {
            id: 'attendance-thanked',
            label: 'NOTES SENT',
            value: `${attendanceThankedCount} / ${attendingParties.length}`,
            progress: attendanceThankedPercent,
            statusBadge: `${attendanceThankedPercent}% Sent`,
            statusColor: attendanceThankedPercent === 100 && attendingParties.length > 0 ? 'green' : 'blue',
            onClick: () => setThankedFilter(thankedFilter === 'Thanked' ? 'All' : 'Thanked'),
            isActive: thankedFilter === 'Thanked',
          },
          {
            id: 'attendance-pending',
            label: 'PENDING HOUSEHOLDS',
            value: Math.max(0, attendingParties.length - attendanceThankedCount),
            subtext: 'Parties left to thank',
            statusBadge: attendingParties.length - attendanceThankedCount === 0 ? 'All Sent' : `${attendingParties.length - attendanceThankedCount} Left`,
            statusColor: attendingParties.length - attendanceThankedCount === 0 ? 'green' : 'amber',
            onClick: () => setThankedFilter(thankedFilter === 'Pending' ? 'All' : 'Pending'),
            isActive: thankedFilter === 'Pending',
          },
          {
            id: 'guests-total',
            label: 'CONFIRMED GUESTS',
            value: attendingGuests.length,
            subtext: 'Celebrated in person',
            statusBadge: 'Attended',
            statusColor: 'green',
          },
        ]}
      />

      {/* Search & Filter Section */}
      <div style={styles.filterBar} className="thankyou-filter-bar">
        <PageSearchInput
          className="thankyou-search-wrapper"
          placeholder={subTab === 'gifts' ? "Search gift description, giver, category, or amount..." : "Search attending guest or party name..."}
          value={searchTerm}
          onChange={setSearchTerm}
          resultCount={subTab === 'gifts' ? filteredGifts.length : filteredAttendingParties.length}
          style={{ flex: '1 1 280px' }}
        />

        <div style={styles.filterGroup} className="thankyou-filter-group">
          {subTab === 'gifts' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="thankyou-filter-item">
              <Tag size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={styles.filterSelect}
                className="thankyou-filter-select"
              >
                <option value="All">All Categories ({totalGifts})</option>
                {allCategories.map(cat => {
                  const count = gifts.filter(g => (g.category || 'General').toLowerCase() === cat.toLowerCase()).length;
                  const catVal = gifts
                    .filter(g => (g.category || 'General').toLowerCase() === cat.toLowerCase())
                    .reduce((sum, g) => sum + (g.amount || 0), 0);
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count} • {formatCurrency(catVal, currency)})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="thankyou-filter-item">
            <Filter size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
            <select 
              value={thankedFilter} 
              onChange={(e) => setThankedFilter(e.target.value as any)}
              style={styles.filterSelect}
              className="thankyou-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Thanked">Thanked Only (Sent)</option>
              <option value="Pending">Pending Only (Unsent)</option>
            </select>
          </div>
        </div>
      </div>

      {subTab === 'gifts' && (categoryFilter !== 'All' || searchTerm.trim() !== '' || thankedFilter !== 'All') && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 0.85rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-muted)',
          borderRadius: 'var(--border-radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--color-text)',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '-0.35rem',
        }}>
          <span>
            Showing <strong>{filteredGifts.length}</strong> of {totalGifts} gifts
            {categoryFilter !== 'All' && <span> in category <strong>&quot;{categoryFilter}&quot;</strong></span>}
            {searchTerm.trim() && <span> matching <strong>&quot;{searchTerm}&quot;</strong></span>}
          </span>
          <span>
            Category / Filtered Total Value: <strong style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(filteredGifts.reduce((s, g) => s + (g.amount || 0), 0), currency)}</strong>
          </span>
        </div>
      )}

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
                    {gift.amount > 0 ? formatCurrency(gift.amount, currency) : 'N/A'}
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
                  color: party.isThanked ? 'var(--color-green)' : 'var(--color-amber-dark)',
                  borderColor: party.isThanked ? 'var(--color-green)' : 'var(--color-gold-dark)'
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

      {/* MONARCH SLIDE-OVER DRAWER FOR ADD / EDIT GIFT RECORD */}
      <SlideOverDrawer
        isOpen={Boolean(isAddingGift || editingGift)}
        onClose={() => { setIsAddingGift(false); setEditingGift(null); }}
        title={isAddingGift ? 'Log Received Gift' : 'Edit Gift Record'}
        subtitle={
          editingGift
            ? `${editingGift.giftId || 'Gift'} • From ${editingGift.giverName || 'Guest'}`
            : 'Track wedding gifts & thank-you notes'
        }
        badge={editingGift ? (editingGift.giftId || 'GIFT') : 'NEW GIFT'}
        width="520px"
        onPrev={
          editingGift && currentEditingGiftIndex > 0
            ? () => handleNavigateAdjacentGift('prev')
            : undefined
        }
        onNext={
          editingGift && currentEditingGiftIndex < filteredGifts.length - 1
            ? () => handleNavigateAdjacentGift('next')
            : undefined
        }
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem', flexWrap: 'wrap' }}>
            {editingGift ? (
              <button
                type="button"
                onClick={() => {
                  setShotToDelete(editingGift);
                  setIsAddingGift(false);
                  setEditingGift(null);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-red, #dc2626)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                }}
              >
                <Trash2 size={15} />
                Delete Gift
              </button>
            ) : <div />}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={() => { setIsAddingGift(false); setEditingGift(null); }}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  color: 'var(--color-text, #1a202c)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                Cancel
              </button>

              {isAddingGift && (
                <button
                  type="button"
                  disabled={!isGiftFormValid || Boolean(isSyncing)}
                  title={!isGiftFormValid ? 'Enter Gift Description and Gift Giver to enable saving' : undefined}
                  onClick={(e) => handleSaveGift(e, true)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: `1.5px solid ${!isGiftFormValid || isSyncing ? 'var(--color-border, #cbd5e1)' : 'var(--color-primary)'}`,
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    color: !isGiftFormValid || isSyncing ? 'var(--color-muted, #94a3b8)' : 'var(--color-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: !isGiftFormValid || isSyncing ? 'not-allowed' : 'pointer',
                    opacity: !isGiftFormValid || isSyncing ? 0.45 : 1,
                    minHeight: '44px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Save & Add Another
                </button>
              )}

              <button
                type="submit"
                form="gift-form"
                disabled={!isGiftFormValid || Boolean(isSyncing)}
                title={!isGiftFormValid ? 'Enter Gift Description and Gift Giver to enable saving' : undefined}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: !isGiftFormValid || isSyncing ? 'var(--color-muted, #94a3b8)' : 'var(--color-primary, #6366f1)',
                  color: !isGiftFormValid || isSyncing ? '#ffffff' : 'var(--color-on-primary, #ffffff)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: !isGiftFormValid || isSyncing ? 'not-allowed' : 'pointer',
                  opacity: !isGiftFormValid || isSyncing ? 0.45 : 1,
                  boxShadow: !isGiftFormValid || isSyncing ? 'none' : '0 2px 6px rgba(0,0,0,0.12)',
                  minHeight: '44px',
                  transition: 'all 0.15s ease',
                }}
              >
                {isAddingGift ? 'Save Gift' : 'Save Changes'}
              </button>
            </div>
          </div>
        }
      >
        <form id="gift-form" onSubmit={handleSaveGift} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Section 1: Item & Giver */}
          <DrawerSection title="Gift & Giver" description="Who gave the gift and what was received">
            <DrawerField label="Gift Description / Item Name" required hint="e.g. KitchenAid Stand Mixer or Cash Fund">
              <input
                type="text"
                required
                placeholder="e.g. KitchenAid Stand Mixer or $200 Cash Gift"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  color: 'var(--color-text, #1a202c)',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </DrawerField>

            <DrawerField label="Gift Giver (From)" required hint="Guest name or family group">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Users
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted, #718096)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="e.g. Uncle Bob & Aunt Sarah"
                  value={formData.giverName || ''}
                  onChange={(e) => setFormData({ ...formData, giverName: e.target.value })}
                  style={{
                    width: '100%',
                    paddingTop: '10px',
                    paddingRight: '12px',
                    paddingBottom: '10px',
                    paddingLeft: '38px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    color: 'var(--color-text, #1a202c)',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </DrawerField>
          </DrawerSection>

          {/* Section 2: Category & Value */}
          <DrawerSection title="Valuation & Category" description="Registry department and estimated monetary value">
            <DrawerRow columns={2}>
              <DrawerField label="Category / Store">
                <GiftCategoryCombobox
                  value={formData.category || ''}
                  onChange={(cat) => setFormData({ ...formData, category: cat })}
                  categories={allCategories}
                  inputStyle={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    color: 'var(--color-text, #1a202c)',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </DrawerField>

              <DrawerField label="Estimated Value / Amount">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted, #718096)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    zIndex: 1,
                  }}>
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount !== undefined && formData.amount !== null && formData.amount !== '' ? formData.amount : ''}
                    onFocus={() => {
                      if (formData.amount === 0 || formData.amount === '0') {
                        setFormData(prev => ({ ...prev, amount: '' }));
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormData(prev => ({ ...prev, amount: '' }));
                        return;
                      }
                      const clean = val.replace(/^0+(?=\d)/, '');
                      const num = Number(clean);
                      setFormData(prev => ({ ...prev, amount: isNaN(num) ? clean : num }));
                    }}
                    style={{
                      width: '100%',
                      paddingTop: '10px',
                      paddingRight: '12px',
                      paddingBottom: '10px',
                      paddingLeft: currencySymbol.length > 1 ? '42px' : '34px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border, #e2e8f0)',
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      color: 'var(--color-text, #1a202c)',
                      fontSize: '1rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </DrawerField>
            </DrawerRow>
          </DrawerSection>

          {/* Section 3: Thank You Note Status & Notes */}
          <DrawerSection title="Thank You Card & Notes" description="Keep track of heartfelt notes and deliveries">
            <DrawerField label="Thank You Status">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, thankYouSent: false })}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: !formData.thankYouSent ? '2px solid var(--color-primary)' : '1px solid var(--color-border, #e2e8f0)',
                    backgroundColor: !formData.thankYouSent ? 'var(--color-primary-subtle, rgba(99, 102, 241, 0.08))' : 'var(--color-surface, #ffffff)',
                    color: !formData.thankYouSent ? 'var(--color-primary)' : 'var(--color-text-muted, #718096)',
                    fontSize: '0.875rem',
                    fontWeight: !formData.thankYouSent ? 600 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '42px',
                  }}
                >
                  <Circle size={15} />
                  Pending Note
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, thankYouSent: true })}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: formData.thankYouSent ? '2px solid #10b981' : '1px solid var(--color-border, #e2e8f0)',
                    backgroundColor: formData.thankYouSent ? '#ecfdf5' : 'var(--color-surface, #ffffff)',
                    color: formData.thankYouSent ? '#059669' : 'var(--color-text-muted, #718096)',
                    fontSize: '0.875rem',
                    fontWeight: formData.thankYouSent ? 600 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '42px',
                  }}
                >
                  <CheckCircle2 size={15} />
                  Card Sent
                </button>
              </div>
            </DrawerField>

            <DrawerField label="Delivery / Special Notes" hint="Personal anecdotes or shipping tracking">
              <textarea
                rows={3}
                placeholder="e.g. Shipped via Amazon, include special note about trip to Italy"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  color: 'var(--color-text, #1a202c)',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                }}
              />
            </DrawerField>
          </DrawerSection>
        </form>
      </SlideOverDrawer>

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

      {/* Mobile Floating Action Button (FAB) */}
      {subTab === 'gifts' && (
        <MobileFAB onClick={startAddGift} label="Log Received Gift" />
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
    gap: '0.75rem',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: '100%',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 240px',
    minWidth: 0,
    maxWidth: '100%',
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
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    boxSizing: 'border-box',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  filterSelect: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    maxWidth: '100%',
    minWidth: 0,
    textOverflow: 'ellipsis',
    boxSizing: 'border-box',
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
    color: 'var(--color-amber-dark)',
    border: '1px solid var(--color-gold-dark)',
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
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--box-shadow-heavy)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary, #ffffff)',
    flexShrink: 0,
  },
  modalTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
    color: 'var(--color-on-primary, #ffffff)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-on-primary, #ffffff)',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '1.25rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  modalBodyScroll: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
    overflowY: 'auto',
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
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
  },
  selectInput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '0.625rem',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '0.875rem 1.25rem',
    borderTop: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-surface)',
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
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
