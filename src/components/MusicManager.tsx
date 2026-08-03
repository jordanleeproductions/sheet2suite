'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Song, SongListType } from '@/lib/sheets/types';
import { Plus, Edit2, X, Trash2, Music, Ban, PlayCircle, PauseCircle, Loader2, ExternalLink, AlertCircle, Mail, Share2 } from 'lucide-react';

interface MusicManagerProps {
  music: Song[];
  onUpdate: (updatedMusic: Song[]) => Promise<void>;
  isSyncing: boolean;
}

export default function MusicManager({ music, onUpdate, isSyncing }: MusicManagerProps) {
  const [editingItem, setEditingItem] = useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<Song>>({});

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPill, setFilterPill] = useState<string>('ALL');

  const pendingSongs = music.filter(s => s.approvalStatus === 'Pending Approval');

  const updateApprovalStatus = async (item: Song, approvalStatus: 'Approved' | 'Declined' | 'Banned', e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (isSyncing) return;
    const updated = music.map(s => {
      if (s.songId === item.songId || (s.title === item.title && s.artist === item.artist)) {
        return {
          ...s,
          approvalStatus,
          playStatus: approvalStatus === 'Banned' ? 'Banned' : s.playStatus || 'Must Play',
        };
      }
      return s;
    });
    await onUpdate(updated);
  };

  const filteredMusic = music.filter(song => {
    const status = song.playStatus || (song.listType === 'Do Not Play' || song.priority === 'Banned' ? 'Banned' : song.priority || 'Must Play');
    const appStatus = song.approvalStatus || 'Approved';

    const matchesSearch = 
      (song.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artist || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.requestedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.listType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      appStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterPill = 
      filterPill === 'ALL' ? true :
      filterPill === 'PENDING APPROVAL' ? appStatus === 'Pending Approval' :
      status.toUpperCase() === filterPill.toUpperCase() ||
      (song.listType || '').toUpperCase() === filterPill.toUpperCase() ||
      appStatus.toUpperCase() === filterPill.toUpperCase();

    return matchesSearch && matchesFilterPill;
  }).sort((a, b) => {
    if (filterPill === 'ALL') {
      const aIsPending = a.approvalStatus === 'Pending Approval';
      const bIsPending = b.approvalStatus === 'Pending Approval';
      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;
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

  // iTunes Auto-Suggest state
  const [iTunesQuery, setITunesQuery] = useState('');
  const [iTunesResults, setITunesResults] = useState<any[]>([]);
  const [isSearchingITunes, setIsSearchingITunes] = useState(false);

  useEffect(() => {
    if (!iTunesQuery || iTunesQuery.trim().length < 2) {
      setITunesResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearchingITunes(true);
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(iTunesQuery)}&entity=song&limit=5`);
        const data = await res.json();
        if (data.results) {
          setITunesResults(data.results);
        }
      } catch (err) {
        console.error('iTunes search error:', err);
      } finally {
        setIsSearchingITunes(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [iTunesQuery]);

  const handleSelectITunesTrack = (track: any) => {
    setFormState(prev => ({
      ...prev,
      title: track.trackName,
      artist: track.artistName,
      link: track.previewUrl || `https://open.spotify.com/search/${encodeURIComponent(`${track.trackName} ${track.artistName}`)}`,
      requestedBy: prev.requestedBy || 'Admin',
      playStatus: prev.playStatus || 'Must Play',
    }));
    setITunesQuery(`${track.trackName} - ${track.artistName}`);
    setITunesResults([]);
  };

  const startAdd = () => {
    setFormState({
      title: '',
      artist: '',
      listType: 'Reception',
      playStatus: 'Must Play',
      notes: '',
      requestedBy: 'Admin',
      approvalStatus: 'Approved',
    });
    setITunesQuery('');
    setITunesResults([]);
    setIsAdding(true);
    setEditingItem(null);
  };

  const startEdit = (item: Song) => {
    setFormState(item);
    setITunesQuery('');
    setITunesResults([]);
    setEditingItem(item);
    setIsAdding(false);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormState({});
    setITunesQuery('');
    setITunesResults([]);
  };

  const handleFormChange = (field: keyof Song, value: any) => {
    setFormState(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'listType' && value === 'Banned') {
        next.playStatus = 'Banned';
        next.approvalStatus = 'Banned';
      } else if (field === 'playStatus' && value === 'Banned') {
        next.listType = 'Banned';
        next.approvalStatus = 'Banned';
      } else if (field === 'approvalStatus' && value === 'Banned') {
        next.listType = 'Banned';
        next.playStatus = 'Banned';
      }
      return next;
    });
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;

    const isBanned = formState.listType === 'Banned' || formState.listType === 'Do Not Play' || formState.playStatus === 'Banned' || formState.approvalStatus === 'Banned';

    let updatedMusic: Song[];
    if (isAdding) {
      const newItem: Song = {
        songId: `M${Date.now()}`,
        title: formState.title || 'Unknown Song',
        artist: formState.artist || 'Unknown Artist',
        listType: isBanned ? 'Banned' : (formState.listType || 'Reception'),
        playStatus: isBanned ? 'Banned' : (formState.playStatus || 'Must Play'),
        notes: formState.notes || '',
        requestedBy: formState.requestedBy || 'Admin',
        approvalStatus: isBanned ? 'Banned' : (formState.approvalStatus || 'Approved'),
        link: formState.link || '',
      };
      updatedMusic = [...music, newItem];
    } else {
      updatedMusic = music.map(item => 
        item.songId === editingItem?.songId ? {
          ...item,
          ...formState,
          listType: isBanned ? 'Banned' : (formState.listType || item.listType || 'Reception'),
          playStatus: isBanned ? 'Banned' : (formState.playStatus || item.playStatus || 'Must Play'),
          approvalStatus: isBanned ? 'Banned' : (formState.approvalStatus || item.approvalStatus || 'Approved'),
          requestedBy: formState.requestedBy || item.requestedBy || 'Admin',
        } as Song : item
      );
    }

    await onUpdate(updatedMusic);
    closeModal();
  };

  const confirmDeleteSong = async () => {
    if (!songToDelete || isSyncing) return;
    const updated = music.filter(item => item.songId !== songToDelete.songId);
    await onUpdate(updated);
    setSongToDelete(null);
  };

  // Sample Audio Player toggle
  const togglePlay = (item: Song) => {
    if (!item.link) {
      setPreviewError(`No audio preview link available for "${item.title}". Use Spotify/YouTube links below to search.`);
      setTimeout(() => setPreviewError(null), 4000);
      return;
    }

    if (playingId === item.songId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsLoadingAudio(item.songId);
      const audio = new Audio(item.link);
      audioRef.current = audio;

      audio.play().then(() => {
        setIsLoadingAudio(null);
        setPlayingId(item.songId);
      }).catch((err) => {
        console.error("Audio playback error:", err);
        setIsLoadingAudio(null);
        setPlayingId(null);
        setPreviewError(`Unable to play sample for "${item.title}". Streaming links may be restricted.`);
        setTimeout(() => setPreviewError(null), 4000);
      });

      audio.onended = () => {
        setPlayingId(null);
      };
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <a 
          href={spotifyUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#1DB954',
            color: '#ffffff',
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          title="Search on Spotify"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C9.6 9.9 15 10.561 18.72 12.841c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72.96.42 1.5-.3.54-.96.72-1.5.42z"/>
          </svg>
        </a>
        <a 
          href={youtubeUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#FF0000',
            color: '#ffffff',
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          title="Search on YouTube"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
        {item.link && (
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-bg, #f3f4f6)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-muted)',
              textDecoration: 'none',
            }}
            title="Open Direct Audio Link"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    );
  };

  // Share / Email Playlist to Vendor
  const handleShareMusic = () => {
    const subject = encodeURIComponent('Wedding Music Playlist & Vendor Preferences');
    
    let bodyText = `Hi!\n\nHere is our official Wedding Music Playlist & Track Preferences:\n\n`;

    const specialSongs = music.filter(s => s.listType === 'First Dance' || s.listType === 'Ceremony' || s.listType === 'Special Moment');
    const mustPlay = music.filter(s => (s.playStatus || s.priority) === 'Must Play' && !specialSongs.includes(s));
    const playIfTime = music.filter(s => (s.playStatus || s.priority) === 'Play If Time' && !specialSongs.includes(s));
    const bannedSongs = music.filter(s => (s.playStatus || s.priority) === 'Banned' || s.listType === 'Do Not Play' || s.listType === 'Banned');

    if (specialSongs.length > 0) {
      bodyText += `--- SPECIAL MOMENTS & FIRST DANCES ---\n`;
      specialSongs.forEach(s => {
        bodyText += `• "${s.title}" by ${s.artist}${s.notes ? ` (${s.notes})` : ''}\n`;
      });
      bodyText += `\n`;
    }

    if (mustPlay.length > 0) {
      bodyText += `--- MUST PLAY SONGS ---\n`;
      mustPlay.forEach(s => {
        bodyText += `• "${s.title}" by ${s.artist}${s.notes ? ` (${s.notes})` : ''}\n`;
      });
      bodyText += `\n`;
    }

    if (playIfTime.length > 0) {
      bodyText += `--- PLAY IF TIME ---\n`;
      playIfTime.forEach(s => {
        bodyText += `• "${s.title}" by ${s.artist}${s.notes ? ` (${s.notes})` : ''}\n`;
      });
      bodyText += `\n`;
    }

    if (bannedSongs.length > 0) {
      bodyText += `--- BANNED SONGS (DO NOT PLAY) ---\n`;
      bannedSongs.forEach(s => {
        bodyText += `• "${s.title}" by ${s.artist}${s.notes ? ` (Reason: ${s.notes})` : ''}\n`;
      });
      bodyText += `\n`;
    }

    bodyText += `Thank you so much!`;

    window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Wedding Playlist</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button 
            type="button"
            style={{
              ...styles.addButton,
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-muted)'
            }} 
            onClick={handleShareMusic}
            title="Email music playlist to DJ or Band"
          >
            <Mail size={16} style={{ marginRight: '0.35rem' }} /> EMAIL LIST
          </button>

          <button style={styles.addButton} onClick={startAdd} disabled={isSyncing}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD SONG
          </button>
        </div>
      </div>

      {/* Pending Guest Requests Alert Banner */}
      {pendingSongs.length > 0 && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #f59e0b',
          borderRadius: 'var(--border-radius-md)',
          padding: '0.875rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⏳</span>
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#92400e', display: 'block' }}>
                {pendingSongs.length} PENDING GUEST SONG REQUEST{pendingSongs.length > 1 ? 'S' : ''} NEED APPROVAL
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                Guests have requested new tracks for your reception. Review and approve before syncing to DJ.
              </span>
            </div>
          </div>
          <button
            type="button"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onClick={() => setFilterPill('PENDING APPROVAL')}
          >
            REVIEW PENDING ({pendingSongs.length})
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div style={styles.filterSection}>
        <input
          type="text"
          placeholder="SEARCH TITLE, ARTIST, REQUESTED BY, OR NOTES..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <div style={styles.pillsRow}>
          {[
            { id: 'ALL', label: 'ALL SONGS', count: music.length },
            { id: 'PENDING APPROVAL', label: '⏳ PENDING APPROVAL', count: pendingSongs.length },
            { id: 'MUST PLAY', label: '🔥 MUST PLAY', count: music.filter(s => (s.playStatus || s.priority || 'Must Play') === 'Must Play' && s.listType !== 'Do Not Play').length },
            { id: 'PLAY IF TIME', label: '⏳ PLAY IF TIME', count: music.filter(s => (s.playStatus || s.priority) === 'Play If Time').length },
            { id: 'BANNED', label: '🚫 BANNED', count: music.filter(s => (s.playStatus || s.priority) === 'Banned' || s.listType === 'Do Not Play').length },
            { id: 'CEREMONY', label: 'CEREMONY', count: music.filter(s => s.listType === 'Ceremony').length },
            { id: 'RECEPTION', label: 'RECEPTION', count: music.filter(s => s.listType === 'Reception').length },
            { id: 'FIRST DANCE', label: 'FIRST DANCE', count: music.filter(s => s.listType === 'First Dance').length },
          ].map(pill => (
            <button
              key={pill.id}
              style={{
                ...styles.pillBtn,
                backgroundColor: filterPill === pill.id ? (pill.id === 'BANNED' ? '#ef4444' : pill.id === 'PENDING APPROVAL' ? '#f59e0b' : 'var(--color-primary)') : 'transparent',
                color: filterPill === pill.id ? (pill.id === 'BANNED' || pill.id === 'PENDING APPROVAL' ? '#ffffff' : 'var(--color-on-primary)') : 'var(--color-text)',
                borderColor: filterPill === pill.id ? (pill.id === 'BANNED' ? '#ef4444' : pill.id === 'PENDING APPROVAL' ? '#f59e0b' : 'var(--color-primary)') : 'var(--color-muted)',
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
          const status = item.playStatus || (item.listType === 'Do Not Play' || item.priority === 'Banned' ? 'Banned' : item.priority || 'Must Play');
          const isBanned = status === 'Banned' || item.approvalStatus === 'Banned';
          const isPending = item.approvalStatus === 'Pending Approval';
          const isGuestRequest = isPending || (item.requestedBy && item.requestedBy !== 'Admin') || item.songId.startsWith('req-');

          return (
            <div 
              key={item.songId} 
              style={{
                ...styles.card,
                borderColor: isPending ? '#f59e0b' : isBanned ? '#ef4444' : 'var(--color-muted)',
                backgroundColor: isPending ? '#fffbeb' : isBanned ? '#fff5f5' : 'var(--color-surface, #ffffff)'
              }}
            >
              <div style={styles.cardHeader}>
                <div style={{ ...styles.cardMeta, display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{
                    ...styles.categoryBadge,
                    backgroundColor: isBanned ? '#ef4444' : status === 'Must Play' ? 'var(--color-highlight, #00ED64)' : '#f59e0b',
                    color: isBanned ? '#ffffff' : '#000000'
                  }}>
                    {isBanned ? '🚫 BANNED' : status === 'Must Play' ? '🔥 MUST PLAY' : '⏳ PLAY IF TIME'}
                  </span>

                  {isGuestRequest && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      backgroundColor: isPending ? '#f59e0b' : 'var(--color-primary)',
                      color: '#ffffff',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                    }}>
                      🎵 SONG REQUEST
                    </span>
                  )}

                  {!isGuestRequest && item.listType !== 'Requested Song' && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      backgroundColor: 'rgba(0,0,0,0.06)',
                      color: 'var(--color-text)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                    }}>
                      {item.listType || 'Reception'}
                    </span>
                  )}
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    color: 'var(--color-text)',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                  }}>
                    👤 {item.requestedBy || 'Admin'}
                  </span>
                </div>

                <div style={styles.cardActions}>
                  <button style={styles.actionBtn} onClick={() => startEdit(item)} title="Edit Song">
                    <Edit2 size={14} />
                  </button>
                  <button style={{ ...styles.actionBtn, color: '#ef4444' }} onClick={() => setSongToDelete(item)} title="Delete Song">
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

              {/* Fixed Bottom Card Footer for Streaming Icons & Approve/Decline Controls */}
              <div style={{
                ...styles.cardFooter,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                flexWrap: 'wrap',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--color-muted)',
              }}>
                {renderExternalLinks(item)}

                {isPending && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(16,185,129,0.2)',
                      }}
                      title="Approve song request"
                      onClick={(e) => updateApprovalStatus(item, 'Approved', e)}
                    >
                      APPROVE ✓
                    </button>
                    <button
                      type="button"
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(239,68,68,0.2)',
                      }}
                      title="Decline song request"
                      onClick={(e) => updateApprovalStatus(item, 'Declined', e)}
                    >
                      DECLINE ✗
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredMusic.length === 0 && (
          <div style={styles.emptyState}>No songs found matching your search/filter.</div>
        )}
      </div>

      {/* ADD / EDIT SONG MODAL */}
      {(isAdding || editingItem) && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader} className="modalHeader">
              <h3 style={{ ...styles.modalTitle, color: '#000000' }} className="modalTitle">
                {isAdding ? 'Add Song to Playlist' : 'Edit Song Details'}
              </h3>
              <button style={{ ...styles.closeBtn, color: '#000000' }} className="closeBtn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveItem} style={styles.modalForm}>
              <div style={styles.formGrid} className="formGrid">
                
                {/* Auto-Search Row */}
                <div className="music-field-span-2" style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>
                    🎵 Auto-Search iTunes Database (Auto-Fills Details)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{
                        ...styles.input,
                        padding: '0.55rem 2rem 0.55rem 0.75rem',
                        fontSize: '0.8rem',
                        borderColor: 'var(--color-muted)',
                        backgroundColor: 'var(--color-bg, #f9fafb)',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                      type="text"
                      placeholder="Type song or artist to auto-fill..."
                      value={iTunesQuery}
                      onChange={(e) => setITunesQuery(e.target.value)}
                    />
                    {iTunesQuery && (
                      <button
                        type="button"
                        onClick={() => { setITunesQuery(''); setITunesResults([]); }}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}
                        title="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}

                    {iTunesResults.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--color-surface, #ffffff)',
                        border: '2px solid var(--color-primary, #000000)',
                        borderRadius: '6px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        zIndex: 9999,
                        marginTop: '4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}>
                        {iTunesResults.map(track => (
                          <div
                            key={track.trackId}
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderBottom: '1px solid var(--color-muted, #e5e7eb)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              backgroundColor: 'var(--color-surface, #ffffff)',
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectITunesTrack(track);
                            }}
                          >
                            {track.artworkUrl60 && (
                              <img src={track.artworkUrl60} alt="" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                            )}
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text, #111827)' }}>{track.trackName}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-muted, #6b7280)' }}>{track.artistName} • {track.collectionName || 'Single'}</div>
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary, #10b981)', fontFamily: 'var(--font-mono)' }}>SELECT</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {isSearchingITunes && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem', display: 'block' }}>
                      Searching iTunes catalog...
                    </span>
                  )}
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Song Title *</label>
                  <input
                    style={styles.input}
                    value={formState.title || ''}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    required
                    placeholder="e.g. Perfect"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Artist *</label>
                  <input
                    style={styles.input}
                    value={formState.artist || ''}
                    onChange={(e) => handleFormChange('artist', e.target.value)}
                    required
                    placeholder="e.g. Ed Sheeran"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Requested By</label>
                  <input
                    style={styles.input}
                    value={formState.requestedBy || 'Admin'}
                    onChange={(e) => handleFormChange('requestedBy', e.target.value)}
                    placeholder="e.g. Admin, Guest, Aunt Sarah"
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
                    <option value="Banned">Banned (Do Not Play)</option>
                  </select>
                </div>
                
                <div className="music-field-span-2" style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
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

      {/* TOAST ERROR NOTIFICATION FOR AUDIO PREVIEW */}
      {previewError && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 9999,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          <AlertCircle size={18} />
          <span>{previewError}</span>
          <button 
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '0.5rem' }} 
            onClick={() => setPreviewError(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* IN-APP DELETE SONG CONFIRMATION MODAL */}
      {songToDelete && (
        <div style={styles.modalOverlay} onClick={() => setSongToDelete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: 'var(--color-red)' }} className="modalHeader">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <AlertCircle size={20} />
                <h3 style={{ ...styles.modalTitle, color: '#ffffff' }} className="modalTitle">
                  DELETE SONG CONFIRMATION
                </h3>
              </div>
              <button style={{ ...styles.closeBtn, color: '#ffffff' }} className="closeBtn" onClick={() => setSongToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--color-red)' }}>"{songToDelete.title}"</strong> by {songToDelete.artist}?
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
                  onClick={() => setSongToDelete(null)}
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
                  onClick={confirmDeleteSong}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'DELETING...' : 'DELETE SONG'}
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
    maxWidth: '520px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    flexShrink: 0,
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
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
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
    padding: '0.875rem 1.5rem',
    borderTop: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-bg)',
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
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
