'use client';

import React, { useState } from 'react';
import { PhotoShot } from '@/lib/sheets/types';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  AlertCircle,
  Tag,
  Mail
} from 'lucide-react';

interface PhotoShotListManagerProps {
  photos: PhotoShot[];
  onUpdatePhotos: (updatedPhotos: PhotoShot[]) => Promise<void>;
  isSyncing?: boolean;
}

export default function PhotoShotListManager({ photos, onUpdatePhotos, isSyncing }: PhotoShotListManagerProps) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Modals State
  const [isAddingShot, setIsAddingShot] = useState(false);
  const [editingShot, setEditingShot] = useState<PhotoShot | null>(null);
  const [shotToDelete, setShotToDelete] = useState<PhotoShot | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<PhotoShot>>({
    description: '',
    location: 'Main Chapel',
    shotTime: '03:30 PM (Post-Ceremony)',
    people: '',
    status: 'Pending',
    priority: 'Must Have',
    notes: '',
  });

  // Calculate KPIs
  const totalShots = photos.length;
  const capturedShots = photos.filter(p => p.status === 'Captured').length;
  const pendingShots = photos.filter(p => p.status === 'Pending').length;
  const mustHaveShots = photos.filter(p => p.priority === 'Must Have').length;

  // Filtered Shots
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = 
      (photo.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.people || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || photo.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || photo.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Toggle Shot Status (Captured <-> Pending)
  const toggleShotStatus = async (shotId: string) => {
    const updated = photos.map(p => {
      if (p.shotId === shotId) {
        const isCurrentCaptured = 
          (p.status || '').toLowerCase() === 'captured' || 
          (p.status || '').toLowerCase() === 'completed';

        return {
          ...p,
          status: isCurrentCaptured ? ('Pending' as const) : ('Captured' as const)
        };
      }
      return p;
    });
    await onUpdatePhotos(updated);
  };

  // Open Add Shot Modal
  const startAddShot = () => {
    setFormData({
      description: '',
      location: 'Main Chapel',
      shotTime: '03:30 PM (Post-Ceremony)',
      people: '',
      status: 'Pending',
      priority: 'Must Have',
      notes: '',
    });
    setIsAddingShot(true);
    setEditingShot(null);
  };

  // Open Edit Shot Modal
  const startEditShot = (shot: PhotoShot) => {
    setFormData(shot);
    setEditingShot(shot);
    setIsAddingShot(false);
  };

  // Save Shot Handler
  const handleSaveShot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    if (isAddingShot) {
      const newShot: PhotoShot = {
        shotId: `P${Date.now().toString().slice(-4)}`,
        description: formData.description || 'New Photo Shot',
        location: formData.location || 'Main Venue',
        shotTime: formData.shotTime || 'TBD',
        people: formData.people || '',
        status: (formData.status as any) || 'Pending',
        priority: (formData.priority as any) || 'Must Have',
        notes: formData.notes || '',
      };
      await onUpdatePhotos([...photos, newShot]);
    } else if (editingShot) {
      const updated = photos.map(p => 
        p.shotId === editingShot.shotId ? { ...p, ...formData } as PhotoShot : p
      );
      await onUpdatePhotos(updated);
    }

    setIsAddingShot(false);
    setEditingShot(null);
  };

  // Confirm Delete Handler
  const confirmDeleteShot = async () => {
    if (!shotToDelete) return;
    const updated = photos.filter(p => p.shotId !== shotToDelete.shotId);
    await onUpdatePhotos(updated);
    setShotToDelete(null);
  };

  // Share / Email Shot List to Photographer
  const handleSharePhotos = () => {
    const subject = encodeURIComponent('Wedding Photography Shot List & VIP Moments');
    
    let bodyText = `Hi!\n\nHere is our official Wedding Photography Shot List:\n\n`;

    const mustHave = photos.filter(p => p.priority === 'Must Have');
    const niceToHave = photos.filter(p => p.priority !== 'Must Have');

    if (mustHave.length > 0) {
      bodyText += `--- MUST HAVE SHOTS (${mustHave.length}) ---\n`;
      mustHave.forEach((p, idx) => {
        bodyText += `${idx + 1}. [${p.shotId}] ${p.description}\n`;
        if (p.location) bodyText += `   Location: ${p.location}\n`;
        if (p.shotTime) bodyText += `   Est. Time: ${p.shotTime}\n`;
        if (p.people) bodyText += `   People Included: ${p.people}\n`;
        if (p.notes) bodyText += `   Notes: ${p.notes}\n`;
        bodyText += `\n`;
      });
    }

    if (niceToHave.length > 0) {
      bodyText += `--- NICE TO HAVE SHOTS (${niceToHave.length}) ---\n`;
      niceToHave.forEach((p, idx) => {
        bodyText += `${idx + 1}. [${p.shotId}] ${p.description}\n`;
        if (p.location) bodyText += `   Location: ${p.location}\n`;
        if (p.shotTime) bodyText += `   Est. Time: ${p.shotTime}\n`;
        if (p.people) bodyText += `   People Included: ${p.people}\n`;
        if (p.notes) bodyText += `   Notes: ${p.notes}\n`;
        bodyText += `\n`;
      });
    }

    bodyText += `Thank you so much!`;

    window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  return (
    <div style={styles.container}>
      {/* Header Title & Actions */}
      <div style={styles.header}>
        <div>
          <h2 style={{ ...styles.title, color: 'var(--color-text)' }}>Photography Shot List</h2>
          <p style={styles.subtitle}>
            Manage required photography moments, VIP group poses, and shot progress for your photographer.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button 
            type="button"
            style={{
              ...styles.addButton,
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-muted)'
            }} 
            onClick={handleSharePhotos}
            title="Email shot list to Photographer"
          >
            <Mail size={16} style={{ marginRight: '6px' }} /> EMAIL LIST
          </button>

          <button style={styles.addButton} onClick={startAddShot}>
            <Plus size={16} style={{ marginRight: '6px' }} /> ADD PHOTO SHOT
          </button>
        </div>
      </div>

      {/* KPI Bar */}
      <div style={styles.kpiBar}>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>TOTAL REQUIRED SHOTS</span>
          <span style={styles.kpiValue}>{totalShots}</span>
        </div>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>CAPTURED SHOTS</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-green)' }}>{capturedShots}</span>
        </div>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>PENDING SHOTS</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-gold)' }}>{pendingShots}</span>
        </div>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>MUST HAVE SHOTS</span>
          <span style={{ ...styles.kpiValue, color: 'var(--color-primary)' }}>{mustHaveShots}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search description, location, or people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <Filter size={16} style={{ color: 'var(--color-muted)' }} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Captured">Captured</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">All Priorities</option>
            <option value="Must Have">Must Have</option>
            <option value="Nice To Have">Nice To Have</option>
          </select>
        </div>
      </div>

      {/* Photo Shot List Grid */}
      <div className="photo-shots-list" style={styles.shotsGrid}>
        {filteredPhotos.map(shot => {
          const isCaptured = (shot.status || '').toLowerCase() === 'captured' || (shot.status || '').toLowerCase() === 'completed';
          const isMustHave = shot.priority === 'Must Have';

          return (
            <div 
              key={shot.shotId} 
              className="photo-shot-card"
              style={{
                ...styles.shotCard,
                borderColor: isCaptured ? 'var(--color-green)' : 'var(--color-text)',
                borderWidth: '2px',
                opacity: isCaptured ? 0.85 : 1
              }}
            >
              {/* Left Group: Checkbox + Badges + Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 320px', minWidth: 0 }}>
                <button 
                  type="button"
                  style={{
                    ...styles.statusCheckBtn,
                    color: isCaptured ? 'var(--color-green)' : 'var(--color-text)'
                  }}
                  onClick={() => toggleShotStatus(shot.shotId)}
                  title={isCaptured ? 'Mark as Pending' : 'Mark as Captured'}
                >
                  {isCaptured ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ ...styles.shotIdBadge, color: 'var(--color-text)', borderColor: 'var(--color-text)' }}>{shot.shotId}</span>
                    {shot.priority && (
                      <span style={{
                        ...styles.priorityBadge,
                        backgroundColor: isMustHave ? 'var(--color-gold-muted)' : 'var(--color-bg)',
                        color: isMustHave ? 'var(--color-gold)' : 'var(--color-text)',
                        borderColor: isMustHave ? 'var(--color-gold)' : 'var(--color-text)'
                      }}>
                        {shot.priority}
                      </span>
                    )}
                    {shot.location && (
                      <span style={{ ...styles.metaBadge, border: '1px solid var(--color-muted)' }}>
                        <MapPin size={12} style={{ marginRight: '4px' }} /> {shot.location}
                      </span>
                    )}
                  </div>

                  <h3 style={{
                    ...styles.shotTitle,
                    color: 'var(--color-text)',
                    textDecoration: isCaptured ? 'line-through' : 'none'
                  }}>
                    {shot.description}
                  </h3>

                  {shot.notes && (
                    <p style={styles.notesText}>
                      💡 {shot.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Middle Group: Who / People Included (Bolder so it sticks out!) */}
              {shot.people ? (
                <div className="shot-who-group" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: '1 1 200px', padding: '0 0.5rem' }}>
                  <Users size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    {shot.people}
                  </span>
                </div>
              ) : <div style={{ flex: '1 1 100px' }} />}

              {/* Right Group: Aligned Further Right Time & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, marginLeft: 'auto' }}>
                {shot.shotTime && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-text)',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--border-radius-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    <Clock size={13} style={{ marginRight: '5px' }} /> {shot.shotTime}
                  </span>
                )}

                <div style={styles.actionGroup}>
                  <button style={styles.iconBtn} onClick={() => startEditShot(shot)} title="Edit Shot">
                    <Edit2 size={15} style={{ color: 'var(--color-text)' }} />
                  </button>
                  <button style={{ ...styles.iconBtn, color: 'var(--color-red)' }} onClick={() => setShotToDelete(shot)} title="Delete Shot">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPhotos.length === 0 && (
          <div style={styles.emptyState}>
            <Camera size={40} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
            <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>No Photography Shots Found</h4>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Add a new shot or adjust your search filters above.
            </p>
          </div>
        )}
      </div>

      {/* ADD / EDIT SHOT MODAL */}
      {(isAddingShot || editingShot) && (
        <div className="photo-modal-overlay" style={styles.modalOverlay} onClick={() => { setIsAddingShot(false); setEditingShot(null); }}>
          <style>{`
            @media (max-width: 640px) {
              .photo-modal-overlay {
                padding: 0.5rem !important;
              }
              .photo-modal-content {
                width: 100% !important;
                max-height: 92vh !important;
              }
              .photo-form-row {
                grid-template-columns: 1fr !important;
                gap: 0.75rem !important;
              }
            }
          `}</style>
          <div className="photo-modal-content" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: 'var(--color-on-light)' }} className="modalTitle">
                {isAddingShot ? 'ADD NEW PHOTO SHOT' : 'EDIT PHOTO SHOT'}
              </h3>
              <button style={{ ...styles.closeBtn, color: 'var(--color-on-light)' }} className="closeBtn" onClick={() => { setIsAddingShot(false); setEditingShot(null); }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveShot} style={styles.form}>
              <div style={styles.modalBodyScroll}>
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>SHOT DESCRIPTION / DETAILS *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bride & Groom with Bride's Grandparents"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={styles.inputField}
                  />
                </div>

                <div className="photo-form-row" style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>LOCATION</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Chapel Altar"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={styles.inputField}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>ESTIMATED TIME</label>
                    <input
                      type="text"
                      placeholder="e.g. 03:30 PM (Post-Ceremony)"
                      value={formData.shotTime || ''}
                      onChange={(e) => setFormData({ ...formData, shotTime: e.target.value })}
                      style={styles.inputField}
                    />
                  </div>
                </div>

                <div className="photo-form-row" style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>INCLUDED PEOPLE / VIPS</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah, John, Grandma Mary"
                      value={formData.people || ''}
                      onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                      style={styles.inputField}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>PRIORITY</label>
                    <select
                      value={formData.priority || 'Must Have'}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      style={styles.selectInput}
                    >
                      <option value="Must Have">Must Have</option>
                      <option value="Nice To Have">Nice To Have</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>STATUS</label>
                  <select
                    value={formData.status || 'Pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={styles.selectInput}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Captured">Captured</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>POSING / LIGHTING NOTES</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Golden hour lighting preferred, wide-angle lens"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ ...styles.inputField, height: 'auto', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => { setIsAddingShot(false); setEditingShot(null); }}
                >
                  CANCEL
                </button>
                <button type="submit" style={styles.saveBtn} className="saveBtn">
                  SAVE SHOT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE SHOT CONFIRMATION MODAL */}
      {shotToDelete && (
        <div style={styles.modalOverlay} onClick={() => setShotToDelete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE PHOTO SHOT CONFIRMATION
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setShotToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-red)' }}>"{shotToDelete.description}"</strong>?
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
                  onClick={confirmDeleteShot}
                >
                  DELETE SHOT
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
  shotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  shotCard: {
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
  shotHeader: {
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
  shotIdBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-muted)',
  },
  priorityBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
  },
  shotTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
    fontWeight: 700,
    margin: '0.25rem 0 0 0',
    lineHeight: 1.3,
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
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  metaBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    backgroundColor: 'var(--color-bg)',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
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
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    flexShrink: 0,
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
