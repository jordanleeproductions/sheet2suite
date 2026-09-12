'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ScheduleEvent, Vendor } from '@/lib/sheets/types';
import { Clock, MapPin, User, ChevronDown, ChevronUp, Plus, Edit2, X, ChevronLeft, ChevronRight, Sparkles, Moon, Download, Printer, AlertCircle, Check } from 'lucide-react';
import MobileFAB from '@/components/MobileFAB';
import TimeDialPicker from '@/components/TimeDialPicker';
import { parseTimeOrSerial } from '@/lib/currency';

export function formatTimeDisplay(timeStr: string | undefined | null, format?: '12h' | '24h'): string {
  if (!timeStr) return '';
  return parseTimeOrSerial(timeStr, format || '12h');
}

export function parseResponsibilities(raw: string | undefined | null): string[] {
  if (!raw) return [];
  const parts = raw.split(/[,/]/).map(r => r.trim()).filter(Boolean);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      unique.push(part);
    }
  }
  return unique;
}

export function formatResponsibilities(roles: string[]): string {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const r of roles) {
    const trimmed = r.trim();
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase());
      unique.push(trimmed);
    }
  }
  return unique.join(', ');
}

export function isLateNightTime(timeStr: string | undefined | null): boolean {
  if (!timeStr) return false;
  const time24 = parseTimeOrSerial(timeStr, '24h');
  if (!time24 || !time24.includes(':')) return false;
  const hour = parseInt(time24.split(':')[0], 10);
  return hour === 0 || (hour >= 1 && hour <= 4);
}

export function isOvernightEvent(event: Partial<ScheduleEvent>): boolean {
  if (event.isAfterMidnight === true) return true;
  if (event.isAfterMidnight === false) return false;
  return isLateNightTime(event.startTime);
}

export function parseTimeToMinutes(timeStr: string | undefined | null): number {
  if (!timeStr) return 0;
  const time24 = parseTimeOrSerial(timeStr, '24h');
  if (!time24 || !time24.includes(':')) return 0;
  const [h, m] = time24.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function compareScheduleEvents(a: ScheduleEvent, b: ScheduleEvent): number {
  const isNightA = isOvernightEvent(a) ? 1 : 0;
  const isNightB = isOvernightEvent(b) ? 1 : 0;
  
  if (isNightA !== isNightB) {
    return isNightA - isNightB;
  }

  return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
}

interface TimelineManagerProps {
  schedule: ScheduleEvent[];
  vendors?: Vendor[];
  onUpdate: (updatedSchedule: ScheduleEvent[]) => Promise<void>;
  isSyncing: boolean;
  timeFormat?: '12h' | '24h';
  onOpenPrintStudio?: (template: 'place_cards' | 'table_cards' | 'timeline' | 'vendors') => void;
}

export default function TimelineManager({ schedule, vendors = [], onUpdate, isSyncing, timeFormat = '12h', onOpenPrintStudio }: TimelineManagerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // expand first by default
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [eventToDeleteIndex, setEventToDeleteIndex] = useState<number | null>(null);
  
  const [formState, setFormState] = useState<Partial<ScheduleEvent>>({});
  const [customRoleInput, setCustomRoleInput] = useState<string>('');

  // Search, Role Filter, and UP NEXT Active State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [activeTimelineIndex, setActiveTimelineIndex] = useState<number>(0);

  // Combobox dropdown state for Responsibility / Vendors
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const roles = useMemo(() => {
    const all = schedule.flatMap(e => parseResponsibilities(e.responsibility));
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const r of all) {
      const lower = r.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(r);
      }
    }
    return unique.sort((a, b) => a.localeCompare(b));
  }, [schedule]);

  // Unique list of previous responsibility entries + standard options + vendors
  const previousResponsibilities = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    const addRole = (role: string) => {
      const trimmed = role.trim();
      if (!trimmed || seen.has(trimmed.toLowerCase())) return;
      seen.add(trimmed.toLowerCase());
      list.push(trimmed);
    };

    schedule.forEach(e => {
      if (e.responsibility) {
        parseResponsibilities(e.responsibility).forEach(r => addRole(r));
      }
    });

    if (vendors && Array.isArray(vendors)) {
      vendors.forEach(v => {
        if (v.vendorName) addRole(v.vendorName);
        if (v.category) addRole(v.category);
      });
    }

    [
      'Photographer',
      'Videographer',
      'Bridal Party',
      'Groomsmen',
      'Planner / Coordinator',
      'DJ / MC',
      'Caterer / Staff',
      'Officiant',
      'Florist',
      'Glam Team (Hair & Makeup)',
      'Musicians / Band',
      'Transportation / Driver',
      'Bride',
      'Groom'
    ].forEach(r => addRole(r));

    return list;
  }, [schedule, vendors]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleDropdownOpen]);

  const filteredEventsWithIndex = useMemo(() => {
    return schedule
      .map((event, originalIndex) => ({ event, originalIndex }))
      .filter(({ event }) => {
        const matchesSearch = 
          (event.eventMoment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.responsibility || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

        const eventRoles = parseResponsibilities(event.responsibility);
        const matchesRole = selectedRole === 'ALL' || 
          eventRoles.some(r => r.toLowerCase() === selectedRole.toLowerCase()) ||
          (event.responsibility || '').toLowerCase().includes(selectedRole.toLowerCase());

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => compareScheduleEvents(a.event, b.event));
  }, [schedule, searchTerm, selectedRole]);

  const safeActiveIndex = Math.min(Math.max(0, activeTimelineIndex), Math.max(0, filteredEventsWithIndex.length - 1));
  const activeItem = filteredEventsWithIndex[safeActiveIndex];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const startEdit = (event: ScheduleEvent, index: number) => {
    setEditingIndex(index);
    setFormState({
      ...event,
      startTime: parseTimeOrSerial(event.startTime),
      endTime: parseTimeOrSerial(event.endTime),
    });
    setCustomRoleInput('');
    setIsAdding(false);
  };

  const startAdd = () => {
    setFormState({
      startTime: '',
      endTime: '',
      eventMoment: '',
      location: '',
      responsibility: selectedRole !== 'ALL' ? selectedRole : '',
      notes: '',
    });
    setCustomRoleInput('');
    setIsAdding(true);
    setEditingIndex(null);
  };

  const handleInputChange = (field: keyof ScheduleEvent, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const selectedRoles = useMemo(() => {
    return parseResponsibilities(formState.responsibility);
  }, [formState.responsibility]);

  const toggleRole = (roleToToggle: string) => {
    const trimmed = roleToToggle.trim();
    if (!trimmed) return;
    const current = parseResponsibilities(formState.responsibility);
    const exists = current.some(r => r.toLowerCase() === trimmed.toLowerCase());
    let next: string[];
    if (exists) {
      next = current.filter(r => r.toLowerCase() !== trimmed.toLowerCase());
    } else {
      next = [...current, trimmed];
    }
    handleInputChange('responsibility', formatResponsibilities(next));
  };

  const removeRole = (roleToRemove: string) => {
    const current = parseResponsibilities(formState.responsibility);
    const next = current.filter(r => r.toLowerCase() !== roleToRemove.toLowerCase());
    handleInputChange('responsibility', formatResponsibilities(next));
  };

  const addCustomRole = (text: string) => {
    const parts = parseResponsibilities(text);
    if (parts.length === 0) return;
    const current = parseResponsibilities(formState.responsibility);
    const merged = Array.from(new Set([...current, ...parts]));
    handleInputChange('responsibility', formatResponsibilities(merged));
    setCustomRoleInput('');
  };

  const clearAllRoles = () => {
    handleInputChange('responsibility', '');
    setCustomRoleInput('');
  };

  const saveEvent = async (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();
    if (isSyncing) return;

    if (!formState.eventMoment) {
      alert('Please enter an Event Moment Name.');
      return;
    }

    const cleanForm: ScheduleEvent = {
      ...(formState as ScheduleEvent),
      startTime: parseTimeOrSerial(formState.startTime),
      endTime: parseTimeOrSerial(formState.endTime),
    };

    let updated: ScheduleEvent[];
    if (isAdding) {
      updated = [...schedule, cleanForm];
    } else if (editingIndex !== null) {
      updated = schedule.map((ev, i) => i === editingIndex ? cleanForm : ev);
    } else {
      return;
    }

    await onUpdate(updated);

    if (continueAdding) {
      setFormState({
        startTime: formState.endTime || '12:00 PM',
        endTime: '',
        eventMoment: '',
        location: formState.location || '',
        responsibility: formState.responsibility || '',
        notes: '',
        isAfterMidnight: formState.isAfterMidnight || false,
      });
      setIsAdding(true);
      setEditingIndex(null);
    } else {
      setIsAdding(false);
      setEditingIndex(null);
    }
  };

  const confirmDeleteEvent = async () => {
    if (eventToDeleteIndex === null || isSyncing) return;
    const updated = schedule.filter((_, i) => i !== eventToDeleteIndex);
    await onUpdate(updated);
    setIsAdding(false);
    setEditingIndex(null);
    setEventToDeleteIndex(null);
  };

  const exportToCSV = () => {
    const headers = ['Start Time', 'End Time', 'Event Moment', 'Location', 'Responsibility', 'Notes', 'Is After Midnight'];
    const rows = schedule.map(e => [
      `"${e.startTime || ''}"`,
      `"${e.endTime || ''}"`,
      `"${e.eventMoment || ''}"`,
      `"${e.location || ''}"`,
      `"${e.responsibility || ''}"`,
      `"${e.notes || ''}"`,
      `"${e.isAfterMidnight ? 'Yes' : 'No'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'day_of_schedule.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (onOpenPrintStudio) {
      onOpenPrintStudio('timeline');
    } else {
      window.print();
    }
  };

  return (
    <div style={styles.container}>
      {/* Scoped Responsive CSS for Timeline Header */}
      <style>{`
        .timeline-header-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-muted);
          border-radius: var(--border-radius-md);
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          box-shadow: var(--box-shadow-subtle);
        }
        .timeline-header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .timeline-add-btn {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .timeline-header-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 1rem !important;
            gap: 0.85rem !important;
          }
          .timeline-header-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            width: 100% !important;
            gap: 0.5rem !important;
          }
          .timeline-header-actions button {
            width: 100% !important;
            justify-content: center !important;
            min-height: 38px !important;
          }
        }
      `}</style>

      {/* Header Panel */}
      <div className="timeline-header-card anim-fade-in">
        <div>
          <h2 style={styles.title}>Wedding Day Timeline</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-sans)' }}>
            Coordinate day-of wedding milestones, vendor arrival times, and real-time ceremony schedule.
          </p>
        </div>
        <div className="timeline-header-actions">
          <button style={styles.secondaryBtn} onClick={exportToCSV} title="Export CSV Spreadsheet">
            <Download size={14} style={{ marginRight: '0.25rem' }} /> CSV
          </button>
          <button style={styles.secondaryBtn} onClick={handlePrint} title="Print Day-Of Schedule">
            <Printer size={14} style={{ marginRight: '0.25rem' }} /> PRINT
          </button>
          <button style={{ ...styles.addButton, color: 'var(--color-on-primary, #ffffff)' }} className="timeline-add-btn" onClick={startAdd} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD EVENT
          </button>
        </div>
      </div>

      {/* UP NEXT Featured Event Banner */}
      {filteredEventsWithIndex.length > 0 && (
        <div style={styles.upNextCard}>
          <div style={styles.upNextHeader}>
            <div style={styles.upNextBadgeRow}>
              <span style={styles.upNextBadge}>
                <Sparkles size={12} style={{ marginRight: '0.25rem' }} /> UP NEXT MOMENT
              </span>
              <span style={styles.upNextIndexText}>
                Moment {safeActiveIndex + 1} of {filteredEventsWithIndex.length}
              </span>
            </div>

            <div style={styles.upNextNavGroup}>
              <button
                style={{
                  ...styles.navBtn,
                  opacity: safeActiveIndex === 0 ? 0.4 : 1,
                  cursor: safeActiveIndex === 0 ? 'not-allowed' : 'pointer'
                }}
                onClick={() => setActiveTimelineIndex(prev => Math.max(0, prev - 1))}
                disabled={safeActiveIndex === 0}
                title="Previous Moment"
              >
                <ChevronLeft size={16} /> PREV
              </button>
              <button
                style={{
                  ...styles.navBtn,
                  opacity: safeActiveIndex >= filteredEventsWithIndex.length - 1 ? 0.4 : 1,
                  cursor: safeActiveIndex >= filteredEventsWithIndex.length - 1 ? 'not-allowed' : 'pointer'
                }}
                onClick={() => setActiveTimelineIndex(prev => Math.min(filteredEventsWithIndex.length - 1, prev + 1))}
                disabled={safeActiveIndex >= filteredEventsWithIndex.length - 1}
                title="Next Moment"
              >
                NEXT <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {activeItem && (
            <div style={styles.upNextBody}>
              <div style={styles.upNextTimeRow}>
                <span style={styles.upNextTime}>{formatTimeDisplay(activeItem.event.startTime, timeFormat)}</span>
                {activeItem.event.endTime && (
                  <span style={styles.upNextEndTime}>to {formatTimeDisplay(activeItem.event.endTime, timeFormat)}</span>
                )}
                {isOvernightEvent(activeItem.event) && (
                  <span style={styles.midnightBadge}>🌙 +1 DAY</span>
                )}
              </div>
              <h3 style={styles.upNextMomentTitle}>{activeItem.event.eventMoment}</h3>

              <div style={styles.upNextMetaRow}>
                {activeItem.event.location && (
                  <div style={styles.upNextMetaItem}>
                    <MapPin size={13} style={{ color: 'var(--color-primary)' }} />
                    <span>{activeItem.event.location}</span>
                  </div>
                )}
                {activeItem.event.responsibility && (
                  <div style={styles.upNextMetaItem}>
                    <User size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                      {parseResponsibilities(activeItem.event.responsibility).map(role => (
                        <span
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          style={{
                            fontSize: '0.725rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '999px',
                            backgroundColor: selectedRole.toLowerCase() === role.toLowerCase() ? 'var(--color-primary)' : 'var(--color-bg-subtle, rgba(255,255,255,0.2))',
                            color: selectedRole.toLowerCase() === role.toLowerCase() ? 'var(--color-on-primary, #ffffff)' : 'currentColor',
                            border: '1px solid var(--color-border)',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title={`Filter timeline by ${role}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeItem.event.notes && (
                <p style={styles.upNextNotes}>"{activeItem.event.notes}"</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Role Filter & Search Bar */}
      <div style={styles.filterSection}>
        <input
          type="text"
          placeholder="SEARCH EVENT, LOCATION, OR VENDOR..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <div style={styles.pillsRow}>
          <button
            style={{
              ...styles.pillBtn,
              backgroundColor: selectedRole === 'ALL' ? 'var(--color-primary)' : 'transparent',
              color: selectedRole === 'ALL' ? 'var(--color-on-primary)' : 'var(--color-text)',
              borderColor: selectedRole === 'ALL' ? 'var(--color-primary)' : 'var(--color-muted)',
            }}
            onClick={() => setSelectedRole('ALL')}
          >
            ALL ROLES ({schedule.length})
          </button>
          {roles.map(role => {
            const count = schedule.filter(e => 
              parseResponsibilities(e.responsibility).some(r => r.toLowerCase() === role.toLowerCase()) ||
              (e.responsibility || '').toLowerCase().includes(role.toLowerCase())
            ).length;
            const isSelected = selectedRole.toLowerCase() === role.toLowerCase();
            return (
              <button
                key={role}
                style={{
                  ...styles.pillBtn,
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                  color: isSelected ? 'var(--color-on-primary)' : 'var(--color-text)',
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-muted)',
                }}
                onClick={() => setSelectedRole(role)}
              >
                {role.toUpperCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Modal */}
      {(isAdding || editingIndex !== null) && (
        <div className="timeline-modal-overlay" style={styles.modalOverlay}>
          <style>{`
            @media (max-width: 640px) {
              .timeline-modal-overlay {
                padding: 0.5rem !important;
              }
              .timeline-modal-content {
                width: 100% !important;
                max-height: 92vh !important;
              }
              .timeline-form-grid {
                grid-template-columns: 1fr !important;
                gap: 0.75rem !important;
              }
              .timeline-field-span-2 {
                grid-column: span 1 !important;
              }
            }
            .midnight-alert-box {
              width: 100% !important;
              box-sizing: border-box !important;
            }
            .midnight-toggle-group {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 0.5rem !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            .midnight-toggle-btn {
              width: 100% !important;
              box-sizing: border-box !important;
              text-align: center !important;
              white-space: normal !important;
              word-break: break-word !important;
            }
            @media (max-width: 520px) {
              .midnight-toggle-group {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
          <div className="timeline-modal-content" style={styles.modalContent}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-primary, #ffffff)' }} className="modalTitle">
                {isAdding ? 'ADD TIMELINE MOMENT' : 'EDIT TIMELINE MOMENT'}
              </h3>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-primary, #ffffff)' }} className="closeBtn" onClick={() => { setIsAdding(false); setEditingIndex(null); }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={saveEvent} style={styles.form}>
              <div className="timeline-form-grid" style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <TimeDialPicker
                    label="START TIME"
                    required
                    placeholder="e.g. 04:00 PM"
                    value={formState.startTime || ''}
                    onChange={(val) => handleInputChange('startTime', val)}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <TimeDialPicker
                    label="END TIME"
                    placeholder="e.g. 04:30 PM"
                    value={formState.endTime || ''}
                    onChange={(val) => handleInputChange('endTime', val)}
                    referenceStartTime={formState.startTime}
                  />
                </div>

                <div className="timeline-field-span-2" style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>EVENT MOMENT *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceremony Service"
                    value={formState.eventMoment || ''}
                    onChange={(e) => handleInputChange('eventMoment', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div className="timeline-field-span-2" style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Courtyard Lawn"
                    value={formState.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div className="timeline-field-span-2" style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={styles.label}>RESPONSIBILITY / VENDORS & ROLES</label>
                    {selectedRoles.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllRoles}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-muted)',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        CLEAR ALL ({selectedRoles.length})
                      </button>
                    )}
                  </div>

                  {/* Selected Roles Chips */}
                  {selectedRoles.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.35rem',
                      marginBottom: '0.5rem',
                      padding: '0.45rem 0.6rem',
                      backgroundColor: 'var(--color-bg-subtle, #f8f9fa)',
                      borderRadius: 'var(--border-radius-sm, 6px)',
                      border: '1px solid var(--color-border, #e5e7eb)',
                    }}>
                      {selectedRoles.map((role) => (
                        <span
                          key={role}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-on-primary, #ffffff)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        >
                          <User size={11} />
                          <span>{role}</span>
                          <button
                            type="button"
                            onClick={() => removeRole(role)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'inherit',
                              padding: '0',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              opacity: 0.85,
                            }}
                            title={`Remove ${role}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Combobox Search & Input */}
                  <div ref={roleDropdownRef} style={{ position: 'relative', width: '100%' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder={selectedRoles.length === 0 ? "Select roles below or type custom assignee..." : "Type custom name or search roles..."}
                          value={customRoleInput}
                          onChange={(e) => {
                            setCustomRoleInput(e.target.value);
                            setIsRoleDropdownOpen(true);
                          }}
                          onFocus={() => setIsRoleDropdownOpen(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customRoleInput.trim()) {
                                addCustomRole(customRoleInput);
                              }
                            } else if (e.key === ',') {
                              e.preventDefault();
                              if (customRoleInput.trim()) {
                                addCustomRole(customRoleInput);
                              }
                            }
                          }}
                          style={{
                            ...styles.input,
                            paddingRight: '2.5rem',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setIsRoleDropdownOpen(prev => !prev)}
                          title="Toggle roles and vendors list"
                          style={{
                            position: 'absolute',
                            right: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-muted)',
                            padding: '0.35rem',
                            cursor: 'pointer',
                          }}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      {customRoleInput.trim() && (
                        <button
                          type="button"
                          onClick={() => addCustomRole(customRoleInput)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.55rem 0.85rem',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            borderRadius: 'var(--border-radius-sm, 6px)',
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-on-primary, #ffffff)',
                            border: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Plus size={13} /> ADD
                        </button>
                      )}
                    </div>

                    {/* Multi-Select Combobox Dropdown */}
                    {isRoleDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          maxHeight: '220px',
                          overflowY: 'auto',
                          backgroundColor: 'var(--color-surface, #ffffff)',
                          border: '1px solid var(--color-muted, #d1d5db)',
                          borderRadius: 'var(--border-radius-sm)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                          zIndex: 50,
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.45rem 0.75rem',
                          borderBottom: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg-subtle, #f9fafb)',
                        }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-muted)', letterSpacing: '0.05em' }}>
                            SELECT ASSIGNEES ({selectedRoles.length} SELECTED)
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsRoleDropdownOpen(false)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                            }}
                          >
                            DONE ✓
                          </button>
                        </div>

                        {customRoleInput.trim() && (
                          <button
                            type="button"
                            onClick={() => addCustomRole(customRoleInput)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              width: '100%',
                              padding: '0.55rem 0.75rem',
                              textAlign: 'left',
                              fontSize: '0.8rem',
                              fontFamily: 'var(--font-sans)',
                              backgroundColor: 'rgba(205, 162, 80, 0.1)',
                              color: 'var(--color-primary)',
                              fontWeight: 700,
                              border: 'none',
                              borderBottom: '1px solid var(--color-border)',
                              cursor: 'pointer',
                            }}
                          >
                            <Plus size={14} /> Add custom: &ldquo;{customRoleInput.trim()}&rdquo;
                          </button>
                        )}

                        {previousResponsibilities
                          .filter(role =>
                            !customRoleInput.trim() ||
                            role.toLowerCase().includes(customRoleInput.trim().toLowerCase())
                          )
                          .map((role) => {
                            const isSelected = selectedRoles.some(r => r.toLowerCase() === role.toLowerCase());
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => toggleRole(role)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  padding: '0.55rem 0.75rem',
                                  textAlign: 'left',
                                  fontSize: '0.8rem',
                                  fontFamily: 'var(--font-sans)',
                                  backgroundColor: isSelected ? 'var(--color-bg-subtle, #f3f4f6)' : 'transparent',
                                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                                  fontWeight: isSelected ? 700 : 500,
                                  border: 'none',
                                  borderBottom: '1px solid var(--color-border, #f3f4f6)',
                                  cursor: 'pointer',
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '3px',
                                    border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-muted)'}`,
                                    backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    {isSelected && <Check size={12} style={{ color: 'var(--color-on-primary, #ffffff)' }} />}
                                  </span>
                                  {role}
                                </span>
                                {isSelected && (
                                  <span style={{ fontSize: '0.675rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                                    ADDED
                                  </span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Quick-Pick Popular Suggestion Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.675rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-muted)' }}>
                      QUICK ADD:
                    </span>
                    {[
                      'Photographer',
                      'Videographer',
                      'Bridal Party',
                      'Groomsmen',
                      'Planner / Coordinator',
                      'DJ / MC',
                      'Caterer / Staff',
                      'Officiant',
                      'Bride',
                      'Groom'
                    ].map(sug => {
                      const isSelected = selectedRoles.some(r => r.toLowerCase() === sug.toLowerCase());
                      return (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => toggleRole(sug)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontSize: '0.675rem',
                            fontFamily: 'var(--font-sans)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-muted)'}`,
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                            color: isSelected ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title={isSelected ? `Remove ${sug}` : `Add ${sug}`}
                        >
                          {isSelected ? <Check size={10} /> : <Plus size={10} />}
                          <span>{sug}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="timeline-field-span-2" style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>NOTES / DETAILS</label>
                  <textarea
                    placeholder="Provide specific guidelines, cues, setup details..."
                    value={formState.notes || ''}
                    rows={3}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    style={styles.textarea}
                  />
                </div>

                {(isLateNightTime(formState.startTime || '') || isLateNightTime(formState.endTime || '') || formState.isAfterMidnight) && (
                  <div style={{ ...styles.fieldGroup, gridColumn: 'span 2', width: '100%' }}>
                    <div className="midnight-alert-box" style={styles.midnightAlertBox}>
                      <div style={styles.midnightAlertHeader}>
                        <Moon size={14} style={{ color: '#8b5cf6', marginRight: '0.35rem', flexShrink: 0 }} />
                        <span style={styles.midnightAlertTitle}>EVENT RUNS PAST MIDNIGHT?</span>
                      </div>
                      <p style={styles.midnightAlertDesc}>
                        Selected time is between 12:00 AM – 4:00 AM. Is this moment at the end of the wedding night (e.g. after-party) or early morning prep?
                      </p>
                      <div className="midnight-toggle-group" style={styles.midnightToggleGroup}>
                        <button
                          type="button"
                          className="midnight-toggle-btn"
                          style={{
                            ...styles.midnightToggleBtn,
                            backgroundColor: formState.isAfterMidnight !== false ? '#7c3aed' : '#ffffff',
                            color: formState.isAfterMidnight !== false ? '#ffffff' : '#4c1d95',
                            borderColor: formState.isAfterMidnight !== false ? '#7c3aed' : '#a78bfa',
                            fontWeight: 700
                          }}
                          onClick={() => setFormState(prev => ({ ...prev, isAfterMidnight: true, eventDate: 'Next Day (+1)' }))}
                        >
                          🌙 YES — OVERNIGHT (+1 DAY)
                        </button>
                        <button
                          type="button"
                          className="midnight-toggle-btn"
                          style={{
                            ...styles.midnightToggleBtn,
                            backgroundColor: formState.isAfterMidnight === false ? '#0d9488' : '#ffffff',
                            color: formState.isAfterMidnight === false ? '#ffffff' : '#4c1d95',
                            borderColor: formState.isAfterMidnight === false ? '#0d9488' : '#a78bfa',
                            fontWeight: 700
                          }}
                          onClick={() => setFormState(prev => ({ ...prev, isAfterMidnight: false, eventDate: 'Main Wedding Day' }))}
                        >
                          ☀️ NO — EARLY MORNING
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.formActions}>
                {editingIndex !== null && (
                  <button 
                    type="button" 
                    style={styles.deleteBtn}
                    onClick={() => setEventToDeleteIndex(editingIndex)}
                  >
                    DELETE
                  </button>
                )}
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => { setIsAdding(false); setEditingIndex(null); }}
                >
                  CANCEL
                </button>
                {isAdding && (
                  <button
                    type="button"
                    style={{
                      ...styles.saveBtn,
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      color: 'var(--color-primary)',
                      border: '2px solid var(--color-primary)',
                    }}
                    disabled={isSyncing}
                    onClick={(e) => saveEvent(e, true)}
                  >
                    {isSyncing ? 'SAVING...' : 'SAVE & ADD NEW'}
                  </button>
                )}
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : (isAdding ? 'SAVE MOMENT' : 'SAVE CHANGES')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE TIMELINE EVENT CONFIRMATION MODAL */}
      {eventToDeleteIndex !== null && schedule[eventToDeleteIndex] && (
        <div style={styles.modalOverlay} onClick={() => setEventToDeleteIndex(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE EVENT CONFIRMATION
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setEventToDeleteIndex(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-red)' }}>"{schedule[eventToDeleteIndex].eventMoment}"</strong> ({schedule[eventToDeleteIndex].startTime})?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
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
                  onClick={() => setEventToDeleteIndex(null)}
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
                  onClick={confirmDeleteEvent}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'DELETING...' : 'DELETE EVENT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Timeline Layout */}
      <div style={styles.timelineList}>
        {filteredEventsWithIndex.length === 0 ? (
          <div style={styles.emptyState}>No schedule events found matching filters.</div>
        ) : (
          filteredEventsWithIndex.map(({ event, originalIndex }, index) => {
            const isExpanded = expandedIndex === originalIndex;
            const isActiveNext = safeActiveIndex === index;
            
            return (
              <div key={originalIndex} style={styles.timelineItem}>
                {/* Left Side: Time node */}
                <div style={styles.timelineTimeSide}>
                  <span style={{
                    ...styles.timeText,
                    color: isActiveNext ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: isActiveNext ? 700 : 600
                  }}>{formatTimeDisplay(event.startTime, timeFormat)}</span>
                  {event.endTime && <span style={styles.endTimeText}>to {formatTimeDisplay(event.endTime, timeFormat)}</span>}
                  {isOvernightEvent(event) && (
                    <span style={styles.midnightBadge}>🌙 +1 DAY</span>
                  )}
                </div>

                {/* Vertical line and dot */}
                <div style={styles.lineConnector}>
                  <div style={{
                    ...styles.timelineDot,
                    backgroundColor: isActiveNext ? '#cda250' : 'var(--color-primary)',
                    transform: isActiveNext ? 'scale(1.3)' : 'scale(1)'
                  }} />
                  {index < filteredEventsWithIndex.length - 1 && <div style={styles.timelineVerticalLine} />}
                </div>

                {/* Right Side: Collapsible detail card */}
                <div 
                  className={`timeline-card ${isExpanded ? 'is-expanded' : ''}`}
                  style={{
                    ...styles.timelineCard,
                    borderColor: isActiveNext ? '#cda250' : isExpanded ? 'var(--color-primary)' : 'var(--color-muted)',
                    borderWidth: isActiveNext ? '2px' : '1px',
                    boxShadow: isActiveNext ? '0 4px 12px rgba(205, 162, 80, 0.15)' : 'none'
                  }}
                  onClick={() => setActiveTimelineIndex(index)}
                >
                  {/* Card click header */}
                  <div className="timeline-card-header" style={styles.cardHeader} onClick={() => toggleExpand(originalIndex)}>
                    <div style={styles.cardMainInfo}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={styles.eventMomentTitle}>{event.eventMoment}</h3>
                        {isActiveNext && (
                          <span style={styles.activeMomentBadge}>ACTIVE</span>
                        )}
                      </div>
                      {event.location && (
                        <div style={styles.locationContainer}>
                          <MapPin size={12} style={styles.cardIcon} />
                          <span style={styles.locationText}>{event.location}</span>
                        </div>
                      )}
                      {event.responsibility && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.3rem' }}>
                          {parseResponsibilities(event.responsibility).map((role) => (
                            <span
                              key={role}
                              style={{
                                fontSize: '0.675rem',
                                padding: '0.1rem 0.45rem',
                                borderRadius: '999px',
                                backgroundColor: selectedRole.toLowerCase() === role.toLowerCase() ? 'var(--color-primary)' : 'var(--color-bg-subtle, #f3f4f6)',
                                color: selectedRole.toLowerCase() === role.toLowerCase() ? 'var(--color-on-primary, #ffffff)' : 'var(--color-muted)',
                                border: '1px solid var(--color-border)',
                                fontWeight: 600,
                              }}
                            >
                              👤 {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div style={styles.headerRightActions}>
                      <button 
                        style={styles.editCardBtn} 
                        onClick={(e) => { e.stopPropagation(); startEdit(event, originalIndex); }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <div style={styles.expandChevron}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail section */}
                  {isExpanded && (
                    <div className="timeline-card-body" style={styles.cardBody}>
                      {event.responsibility && (
                        <div style={{ ...styles.bodyDetailRow, flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                            <User size={12} style={styles.cardIcon} />
                            <span>ASSIGNED ROLES:</span>
                          </div>
                          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
                            {parseResponsibilities(event.responsibility).map((role) => {
                              const isFiltered = selectedRole.toLowerCase() === role.toLowerCase();
                              return (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRole(role);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.725rem',
                                    fontWeight: 600,
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '999px',
                                    backgroundColor: isFiltered ? 'var(--color-primary)' : 'var(--color-bg-subtle, #f3f4f6)',
                                    color: isFiltered ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                                    border: `1px solid ${isFiltered ? 'var(--color-primary)' : 'var(--color-border, #e5e7eb)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  title={`Filter itinerary by ${role}`}
                                >
                                  <span>{role}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {event.notes && (
                        <div style={styles.notesSection}>
                          <div style={styles.notesLabel}>NOTES FOR COORDINATOR</div>
                          <p style={styles.notesText}>{event.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <MobileFAB onClick={startAdd} label="Add Timeline Moment" disabled={isSyncing} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  midnightAlertBox: {
    backgroundColor: '#f5f3ff',
    border: '1px solid #c4b5fd',
    borderRadius: 'var(--border-radius-md)',
    padding: '0.75rem',
    marginTop: '0.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  midnightAlertHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  midnightAlertTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#6d28d9',
    letterSpacing: '0.05em',
  },
  midnightAlertDesc: {
    fontSize: '0.75rem',
    color: '#4c1d95',
    lineHeight: '1.35',
    margin: 0,
    wordBreak: 'break-word',
  },
  midnightToggleGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    marginTop: '0.25rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  midnightToggleBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.5rem 0.4rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },
  midnightBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    backgroundColor: '#f5f3ff',
    color: '#6d28d9',
    padding: '1px 5px',
    borderRadius: '2px',
    marginTop: '2px',
    display: 'inline-block',
  },
  upNextCard: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '2px solid #cda250',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: '0 4px 12px rgba(205, 162, 80, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  upNextHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px dotted var(--color-muted)',
    paddingBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  upNextBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  upNextBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-highlight)',
    color: '#000000',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
  },
  upNextIndexText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    fontWeight: 600,
  },
  upNextNavGroup: {
    display: 'flex',
    gap: '0.35rem',
  },
  navBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '0.3rem 0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
  },
  upNextBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  upNextTimeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  upNextTime: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  upNextEndTime: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
  },
  upNextMomentTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    margin: 0,
  },
  upNextMetaRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginTop: '0.25rem',
  },
  upNextMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--color-text)',
  },
  upNextNotes: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    fontStyle: 'italic',
    marginTop: '0.25rem',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  searchInput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    color: 'var(--color-text)',
    width: '100%',
  },
  pillsRow: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pillBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '0.35rem 0.6rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  activeMomentBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    fontWeight: 700,
    backgroundColor: 'var(--color-highlight)',
    color: '#000000',
    padding: '1px 5px',
    borderRadius: '2px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.75rem',
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
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: 'var(--color-primary)',
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
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingLeft: '0.25rem',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    position: 'relative',
    marginBottom: '1rem',
  },
  timelineTimeSide: {
    width: '100px',
    flexShrink: 0,
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: '0.75rem',
  },
  timeText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  endTimeText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
  lineConnector: {
    width: '16px',
    flexShrink: 0,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  timelineDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    zIndex: 3,
    marginTop: '0.9rem',
    border: '2px solid var(--color-white)',
  },
  timelineVerticalLine: {
    position: 'absolute',
    top: '0.9rem',
    bottom: '-1.5rem',
    width: '1px',
    backgroundColor: 'var(--color-muted)',
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: 'var(--color-surface, #ffffff)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--box-shadow-subtle)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'var(--transition-smooth)',
  },
  cardHeader: {
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  cardMainInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  eventMomentTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'var(--color-primary)',
  },
  locationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  cardIcon: {
    color: 'var(--color-muted)',
    flexShrink: 0,
  },
  locationText: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
  headerRightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  editCardBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  expandChevron: {
    color: 'var(--color-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  cardBody: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fafafa',
    borderTop: '1px dotted var(--color-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  bodyDetailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--color-text)',
  },
  bodyDetailText: {
    fontSize: '0.75rem',
  },
  notesSection: {
    marginTop: '0.5rem',
    borderTop: '1px solid #eeeeee',
    paddingTop: '0.5rem',
  },
  notesLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  notesText: {
    fontSize: '0.75rem',
    color: 'var(--color-text)',
    lineHeight: '1.4',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
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
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    color: 'var(--color-text)',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
    backgroundColor: 'var(--color-input-bg, #ffffff)',
    color: 'var(--color-text)',
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
  deleteBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: '#000000',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    marginRight: 'auto',
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
