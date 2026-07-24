'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Song, SongListType } from '@/lib/sheets/types';
import { Plus, Edit2, X, Trash2, Music, Ban, PlayCircle, PauseCircle, Loader2, ExternalLink } from 'lucide-react';

interface MusicManagerProps {
  music: Song[];
  onUpdate: (updatedMusic: Song[]) => Promise<void>;
  isSyncing: boolean;
}

export default function MusicManager({ music, onUpdate, isSyncing }: MusicManagerProps) {
  const [editingItem, setEditingItem] = useState<Song | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<Song>>({});

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPill, setFilterPill] = useState<string>('ALL');

  const filteredMusic = music.filter(song => {
    const matchesSearch = 
      (song.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artist || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.listType || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterPill = 
      filterPill === 'ALL' ? true :
      (song.listType || '').toUpperCase() === filterPill.toUpperCase();

    return matchesSearch && matchesFilterPill;
  }).sort((a, b) => {
    if (filterPill === 'ALL') {
      const aIsBanned = a.listType === 'Do Not Play';
      const bIsBanned = b.listType === 'Do Not Play';
      if (aIsBanned && !bIsBanned) return 1;
      if (!aIsBanned && bIsBanned) return -1;
    }
    return 0;
  });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startAdd = () => {
    setFormState({
      title: '',
      artist: '',
      listType: 'Play List',
      link: '',
      notes: '',
    });
    setIsAdding(true);
    setEditingItem(null);
  };

  const startEdit = (item: Song) => {
    setFormState(item);
    setEditingItem(item);
    setIsAdding(false);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormState({});
  };

  const handleFormChange = (field: keyof Song, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;

    let updatedMusic: Song[];
    if (isAdding) {
      const newItem: Song = {
        songId: `M${Date.now()}`,
        title: formState.title || 'Unknown Song',
        artist: formState.artist || 'Unknown Artist',
        listType: formState.listType || 'Play List',
        link: formState.link || '',
        notes: formState.notes || '',
      };
      updatedMusic = [...music, newItem];
    } else {
      updatedMusic = music.map(item => 
        item.songId === editingItem?.songId ? { ...item, ...formState } as Song : item
      );
    }

    await onUpdate(updatedMusic);
    closeModal();
  };

  const deleteItem = async (songId: string) => {
    if (isSyncing || !confirm('Are you sure you want to delete this song?')) return;
    const updated = music.filter(item => item.songId !== songId);
    await onUpdate(updated);
  };

  // Render a play icon that fetches and plays a preview from iTunes
  const togglePlay = async (item: Song) => {
    if (playingId === item.songId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsLoadingAudio(item.songId);
    
    try {
      const query = encodeURIComponent(`${item.artist} ${item.title}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&limit=1&entity=song`);
      const data = await res.json();

      if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
        const previewUrl = data.results[0].previewUrl;
        const audio = new Audio(previewUrl);
        audioRef.current = audio;
        
        audio.onended = () => setPlayingId(null);
        
        await audio.play();
        setPlayingId(item.songId);
      } else {
        alert('Preview not available for this song.');
      }
    } catch (err) {
      console.error('Error fetching preview:', err);
      alert('Error fetching song preview.');
    } finally {
      setIsLoadingAudio(null);
    }
  };

  const renderSamplePlayer = (item: Song) => {
    const isPlaying = playingId === item.songId;
    const isLoading = isLoadingAudio === item.songId;
    
    return (
      <button 
        onClick={() => togglePlay(item)} 
        style={styles.playIconBtn} 
        title={isPlaying ? "Pause Sample" : "Preview Sample"}
        disabled={isLoadingAudio !== null && isLoadingAudio !== item.songId}
      >
        {isLoading ? (
          <Loader2 size={20} className="spin" />
        ) : isPlaying ? (
          <PauseCircle size={20} />
        ) : (
          <PlayCircle size={20} />
        )}
      </button>
    );
  };

  const renderExternalLinks = (item: Song) => {
    const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(`${item.title} ${item.artist}`)}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.title} ${item.artist}`)}`;

    return (
      <div style={styles.externalLinksGroup}>
        <a 
          href={spotifyUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={styles.streamLinkBtn}
          title="Search on Spotify"
        >
          Spotify
        </a>
        <a 
          href={youtubeUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={styles.streamLinkBtn}
          title="Search on YouTube"
        >
          YouTube
        </a>
        {item.link && (
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={styles.customLinkBtn}
            title="Open Direct Link"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Wedding Playlist</h2>
        <button style={styles.addButton} onClick={startAdd} disabled={isSyncing}>
          <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD SONG
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div style={styles.filterSection}>
        <input
          type="text"
          placeholder="SEARCH TITLE, ARTIST, OR NOTES..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <div style={styles.pillsRow}>
          {[
            { id: 'ALL', label: 'ALL SONGS', count: music.length },
            { id: 'Play List', label: 'MUST PLAY', count: music.filter(s => s.listType === 'Play List').length },
            { id: 'First Dance', label: 'FIRST DANCE', count: music.filter(s => s.listType === 'First Dance').length },
            { id: 'Ceremony', label: 'CEREMONY', count: music.filter(s => s.listType === 'Ceremony').length },
            { id: 'Reception', label: 'RECEPTION', count: music.filter(s => s.listType === 'Reception').length },
            { id: 'Do Not Play', label: 'DO NOT PLAY', count: music.filter(s => s.listType === 'Do Not Play').length },
          ].map(pill => (
            <button
              key={pill.id}
              style={{
                ...styles.pillBtn,
                backgroundColor: filterPill === pill.id ? (pill.id === 'Do Not Play' ? '#ef4444' : 'var(--color-primary)') : 'transparent',
                color: filterPill === pill.id ? (pill.id === 'Do Not Play' ? '#000000' : 'var(--color-on-primary)') : 'var(--color-text)',
                borderColor: filterPill === pill.id ? (pill.id === 'Do Not Play' ? '#ef4444' : 'var(--color-primary)') : 'var(--color-muted)',
              }}
              onClick={() => setFilterPill(pill.id)}
            >
              {pill.label} ({pill.count})
            </button>
          ))}
        </div>
      </div>

      <div style={styles.cardGrid}>
        {filteredMusic.map((item) => {
          const isBanned = item.listType === 'Do Not Play';
          return (
            <div 
              key={item.songId} 
              style={{
                ...styles.card,
                borderColor: 'var(--color-muted)',
                backgroundColor: isBanned ? '#fff5f5' : 'var(--color-surface, #ffffff)'
              }}
            >
              <div style={styles.cardHeader}>
                <div style={styles.cardMeta}>
                  <span style={{
                    ...styles.categoryBadge,
                    backgroundColor: isBanned ? '#ef4444' : 'var(--color-highlight, #00ED64)',
                    color: '#000000'
                  }}>
                    {isBanned ? 'BANNED' : item.listType.toUpperCase()}
                  </span>
                </div>
                <div style={styles.cardActions}>
                  <button style={styles.actionBtn} onClick={() => startEdit(item)}>
                    <Edit2 size={14} />
                  </button>
                  <button style={{ ...styles.actionBtn, color: '#ef4444' }} onClick={() => deleteItem(item.songId)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div style={styles.cardBodyContent}>
                {/* Row 1: Title & Artist on Left, Play Button on Right */}
                <div style={styles.songMainRow}>
                  <div style={styles.songInfoCol}>
                    <h4 style={{ ...styles.songTitle, color: isBanned ? '#7f1d1d' : 'var(--color-primary)' }}>{item.title}</h4>
                    <p style={{ ...styles.songArtist, color: isBanned ? '#991b1b' : 'var(--color-muted)' }}>by {item.artist}</p>
                  </div>
                  <div style={styles.playButtonCol}>
                    {renderSamplePlayer(item)}
                  </div>
                </div>

                {/* Row 2: Comments / Notes as a new row */}
                {item.notes && (
                  <p style={{
                    ...styles.songNotes,
                    color: isBanned ? '#991b1b' : 'var(--color-muted)',
                    backgroundColor: isBanned ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.03)'
                  }}>"{item.notes}"</p>
                )}
              </div>

              {/* Fixed Bottom Card Footer for Spotify & YouTube */}
              <div style={styles.cardFooter}>
                {renderExternalLinks(item)}
              </div>
            </div>
          );
        })}
        {filteredMusic.length === 0 && (
          <div style={styles.emptyState}>No songs found matching your search/filter.</div>
        )}
      </div>

      {/* Modal Overlay for Add/Edit */}
      {(isAdding || editingItem) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: '#000000' }} className="modalTitle">{isAdding ? 'ADD SONG' : 'EDIT SONG'}</h3>
              <button style={{ ...styles.closeBtn, color: '#000000' }} className="closeBtn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={saveItem} style={styles.form}>
              <div style={styles.formGrid}>
                
                <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Song Title</label>
                  <input
                    style={styles.input}
                    value={formState.title || ''}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    required
                    placeholder="e.g. Perfect"
                  />
                </div>
                
                <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Artist</label>
                  <input
                    style={styles.input}
                    value={formState.artist || ''}
                    onChange={(e) => handleFormChange('artist', e.target.value)}
                    required
                    placeholder="e.g. Ed Sheeran"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>List Type</label>
                  <select
                    style={styles.select}
                    value={formState.listType || 'Play List'}
                    onChange={(e) => handleFormChange('listType', e.target.value)}
                  >
                    <option value="Play List">Play List (Must Play)</option>
                    <option value="First Dance">First Dance</option>
                    <option value="Ceremony">Ceremony</option>
                    <option value="Reception">Reception</option>
                    <option value="Special Moment">Special Moment</option>
                    <option value="Do Not Play">Do Not Play</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Music Link (Spotify/YouTube)</label>
                  <input
                    style={styles.input}
                    type="url"
                    value={formState.link || ''}
                    onChange={(e) => handleFormChange('link', e.target.value)}
                    placeholder="https://open.spotify.com/..."
                  />
                  <span style={styles.fieldInfo}>Paste a Spotify track link for a 30s preview embed!</span>
                </div>
                
                <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Notes</label>
                  <textarea
                    style={styles.textarea}
                    value={formState.notes || ''}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="e.g. First Dance, don't play the remix..."
                    rows={2}
                  />
                </div>
                
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>CANCEL</button>
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : 'SAVE SONG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'var(--font-sans)',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.25rem',
  },
  searchInput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    width: '100%',
  },
  pillsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pillBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 600,
    padding: '0.35rem 0.65rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  externalLinksGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  streamLinkBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '0.25rem 0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
  },
  customLinkBtn: {
    padding: '0.25rem',
    color: 'var(--color-primary)',
    display: 'inline-flex',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-serif)',
    fontWeight: 600,
    color: 'var(--color-primary)',
    margin: 0,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  listsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.5rem',
  },
  sectionTitle: {
    margin: 0,
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    color: 'var(--color-primary)',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: 'var(--color-surface, #ffffff)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--box-shadow-subtle)',
    border: '1px solid var(--color-muted)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  cardMeta: {
    display: 'flex',
  },
  categoryBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    backgroundColor: '#eef2f7',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
  },
  cardBodyContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '0.5rem',
  },
  songMainRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  },
  songInfoCol: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  playButtonCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  songTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    margin: '0 0 0.15rem 0',
  },
  songArtist: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    margin: '0',
  },
  songNotes: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    color: 'var(--color-text)',
    fontStyle: 'italic',
    margin: '0.25rem 0 0 0',
    padding: '0.35rem 0.5rem',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: '4px',
    textAlign: 'left',
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: '0.75rem',
    borderTop: '1px solid var(--color-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  playIconBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: 'none',
    transition: 'var(--transition-smooth)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: 'var(--color-muted)',
    fontStyle: 'italic',
    gridColumn: '1 / -1',
    border: '1px dashed var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-bg)',
    borderRadius: 'var(--border-radius-md)',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    color: 'var(--color-on-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-on-primary)',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
  },
  form: {
    padding: '1.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)',
  },
  fieldInfo: {
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
    fontFamily: 'var(--font-mono)',
    marginTop: '0.25rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--color-muted)',
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid var(--color-muted)',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
  },
  saveBtn: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none',
    padding: '0.5rem 1.5rem',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
  }
};
