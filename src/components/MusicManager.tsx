'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Song, SongListType, Vendor } from '@/lib/sheets/types';
import { 
  Plus, 
  Edit2, 
  X, 
  Trash2, 
  Music, 
  Ban, 
  PlayCircle, 
  PauseCircle, 
  Loader2, 
  ExternalLink, 
  AlertCircle, 
  Mail, 
  Share2, 
  Copy, 
  Check, 
  Grid, 
  List, 
  Radio, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Square, 
  Disc,
  Play,
  Pause
} from 'lucide-react';
import MobileFAB from '@/components/MobileFAB';
import PageSearchInput from '@/components/PageSearchInput';
import PageHeaderCard from '@/components/vow/PageHeaderCard';
import PageMetricStrip from '@/components/vow/PageMetricStrip';
import SlideOverDrawer from '@/components/vow/SlideOverDrawer';
import { DrawerSection, DrawerField, DrawerRow, PriorityPills } from '@/components/vow/MonarchForm';

export type MusicOccasionGroup = 'ALL' | 'CEREMONY' | 'SPECIAL' | 'RECEPTION' | 'BANNED';

export function getOccasionGroup(song: Song): 'CEREMONY' | 'SPECIAL' | 'RECEPTION' | 'BANNED' {
  const lt = (song.listType || '').toLowerCase();
  const ps = (song.playStatus || song.priority || '').toLowerCase();
  if (lt === 'banned' || lt === 'do not play' || ps === 'banned' || song.approvalStatus === 'Banned') {
    return 'BANNED';
  }
  if (lt.includes('ceremony')) {
    return 'CEREMONY';
  }
  if (lt.includes('dance') || lt.includes('special')) {
    return 'SPECIAL';
  }
  return 'RECEPTION';
}

export function getSongPriority(song: Song): 'Must Play' | 'Play If Time' | 'Banned' {
  if (song.approvalStatus === 'Banned' || song.playStatus === 'Banned' || song.listType === 'Banned' || song.listType === 'Do Not Play') {
    return 'Banned';
  }
  if (song.playStatus === 'Play If Time' || song.priority === 'Play If Time') {
    return 'Play If Time';
  }
  return 'Must Play';
}

type DeduplicatedSong = Song & { 
  requestCount: number; 
  occasionGroup: 'CEREMONY' | 'SPECIAL' | 'RECEPTION' | 'BANNED';
  effectivePriority: 'Must Play' | 'Play If Time' | 'Banned';
};

interface MusicManagerProps {
  music: Song[];
  vendors?: Vendor[];
  onUpdate: (updatedMusic: Song[]) => Promise<void>;
  isSyncing: boolean;
  initialFilterPill?: string;
  onNavigateTab?: (tab: string, filter?: string) => void;
}

export default function MusicManager({ 
  music, 
  vendors = [], 
  onUpdate, 
  isSyncing, 
  initialFilterPill, 
  onNavigateTab 
}: MusicManagerProps) {
  // Drawer & Form State
  const [editingItem, setEditingItem] = useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<Song>>({});

  // Audio Playback & Progress State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(30);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Notifications & Feedback
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [occasionFilter, setOccasionFilter] = useState<MusicOccasionGroup>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'MUST PLAY' | 'PLAY IF TIME' | 'BANNED'>('ALL');
  const [layoutMode, setLayoutMode] = useState<'cards' | 'playlist'>('cards');

  // Handle initial filter pill from navigation props
  useEffect(() => {
    if (initialFilterPill) {
      const upper = initialFilterPill.toUpperCase();
      if (['CEREMONY', 'RECEPTION', 'BANNED'].includes(upper)) {
        setOccasionFilter(upper as MusicOccasionGroup);
      } else if (upper === 'FIRST DANCE' || upper === 'SPECIAL') {
        setOccasionFilter('SPECIAL');
      } else if (['MUST PLAY', 'PLAY IF TIME'].includes(upper)) {
        setPriorityFilter(upper as any);
      } else if (upper === 'ALL') {
        setOccasionFilter('ALL');
        setPriorityFilter('ALL');
      }
    }
  }, [initialFilterPill]);

  // iTunes Auto-Suggest State
  const [iTunesQuery, setITunesQuery] = useState('');
  const [iTunesResults, setITunesResults] = useState<any[]>([]);
  const [isSearchingITunes, setIsSearchingITunes] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced iTunes search
  useEffect(() => {
    const query = iTunesQuery.trim();
    if (!query || query.length < 2) {
      setITunesResults([]);
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearchingITunes(true);
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setITunesResults(data.results);
          setShowResults(true);
        } else {
          setITunesResults([]);
          setShowResults(false);
        }
      } catch (err) {
        console.error('iTunes search error:', err);
      } finally {
        setIsSearchingITunes(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [iTunesQuery]);

  // Deduplicate songs by Title + Artist (case-insensitive)
  const deduplicatedMusic = useMemo<DeduplicatedSong[]>(() => {
    const map = new Map<string, DeduplicatedSong>();

    for (const song of music) {
      const key = `${(song.title || '').trim().toLowerCase()}:::${(song.artist || '').trim().toLowerCase()}`;
      const occGroup = getOccasionGroup(song);
      const effectivePri = getSongPriority(song);

      if (!map.has(key)) {
        map.set(key, {
          ...song,
          requestCount: 1,
          occasionGroup: occGroup,
          effectivePriority: effectivePri,
        });
      } else {
        const existing = map.get(key)!;
        existing.requestCount += 1;
        
        // Append requester name if unique
        if (song.requestedBy && !existing.requestedBy?.toLowerCase().includes(song.requestedBy.toLowerCase())) {
          existing.requestedBy = existing.requestedBy 
            ? `${existing.requestedBy}, ${song.requestedBy}` 
            : song.requestedBy;
        }
        // Append notes if unique
        if (song.notes && !existing.notes?.toLowerCase().includes(song.notes.toLowerCase())) {
          existing.notes = existing.notes 
            ? `${existing.notes} | "${song.notes}"` 
            : song.notes;
        }
        // Audio link fallback
        if (!existing.link && song.link) {
          existing.link = song.link;
        }
        // Priority status: Banned > Approved
        if (effectivePri === 'Banned' || song.approvalStatus === 'Banned') {
          existing.approvalStatus = 'Banned';
          existing.playStatus = 'Banned';
          existing.listType = 'Banned';
          existing.occasionGroup = 'BANNED';
          existing.effectivePriority = 'Banned';
        } else if (effectivePri === 'Must Play' && existing.effectivePriority !== 'Must Play') {
          existing.effectivePriority = 'Must Play';
          existing.playStatus = 'Must Play';
        }
      }
    }

    return Array.from(map.values());
  }, [music]);

  // Filtered Songs
  const filteredMusic = useMemo(() => {
    return deduplicatedMusic.filter((song: DeduplicatedSong) => {
      // Occasion filter
      if (occasionFilter !== 'ALL' && song.occasionGroup !== occasionFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL') {
        if (priorityFilter === 'MUST PLAY' && song.effectivePriority !== 'Must Play') return false;
        if (priorityFilter === 'PLAY IF TIME' && song.effectivePriority !== 'Play If Time') return false;
        if (priorityFilter === 'BANNED' && song.effectivePriority !== 'Banned') return false;
      }

      // Search matching
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = (song.title || '').toLowerCase().includes(term);
        const matchesArtist = (song.artist || '').toLowerCase().includes(term);
        const matchesNotes = (song.notes || '').toLowerCase().includes(term);
        const matchesRequester = (song.requestedBy || '').toLowerCase().includes(term);
        const matchesOccasion = (song.listType || '').toLowerCase().includes(term);
        if (!matchesTitle && !matchesArtist && !matchesNotes && !matchesRequester && !matchesOccasion) {
          return false;
        }
      }

      return true;
    }).sort((a: DeduplicatedSong, b: DeduplicatedSong) => {
      // Banned songs sorted to end unless filtering banned
      if (occasionFilter !== 'BANNED' && priorityFilter !== 'BANNED') {
        if (a.effectivePriority === 'Banned' && b.effectivePriority !== 'Banned') return 1;
        if (a.effectivePriority !== 'Banned' && b.effectivePriority === 'Banned') return -1;
      }
      return b.requestCount - a.requestCount;
    });
  }, [deduplicatedMusic, occasionFilter, priorityFilter, searchTerm]);

  // Active playing song object
  const playingSong = useMemo(() => {
    if (!playingId) return null;
    return deduplicatedMusic.find(s => s.songId === playingId) || null;
  }, [playingId, deduplicatedMusic]);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Audio Playback Controller
  const togglePlay = (item: Song) => {
    if (!item.link) {
      setPreviewError(`No audio preview link available for "${item.title}". Use Spotify or YouTube Music below to listen.`);
      setTimeout(() => setPreviewError(null), 4500);
      return;
    }

    if (playingId === item.songId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
      setAudioProgress(0);
      setAudioCurrentTime(0);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsLoadingAudio(item.songId);
      const audio = new Audio(item.link);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setAudioCurrentTime(audio.currentTime);
          setAudioDuration(audio.duration);
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.play().then(() => {
        setIsLoadingAudio(null);
        setPlayingId(item.songId);
      }).catch((err) => {
        console.warn("Audio playback streaming error:", err);
        setIsLoadingAudio(null);
        setPlayingId(null);
        setAudioProgress(0);
        setPreviewError(`Sample audio unavailable for "${item.title}". Use Spotify or YouTube Music to listen.`);
        setTimeout(() => setPreviewError(null), 4500);
      });

      audio.onended = () => {
        setPlayingId(null);
        setAudioProgress(0);
        setAudioCurrentTime(0);
      };
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
    setAudioProgress(0);
    setAudioCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = ratio * audioDuration;
    setAudioProgress(ratio * 100);
    setAudioCurrentTime(ratio * audioDuration);
  };

  // iTunes selection handler
  const handleSelectITunesTrack = (track: any) => {
    setFormState(prev => ({
      ...prev,
      title: track.trackName,
      artist: track.artistName,
      link: track.previewUrl || `https://open.spotify.com/search/${encodeURIComponent(`${track.trackName} ${track.artistName}`)}`,
      requestedBy: prev.requestedBy || 'Admin',
      playStatus: prev.playStatus || 'Must Play',
    }));
    setITunesQuery('');
    setITunesResults([]);
    setShowResults(false);
  };

  // Drawer Open / Edit Handlers
  const startAdd = () => {
    setFormState({
      title: '',
      artist: '',
      listType: occasionFilter === 'CEREMONY' ? 'Ceremony' : occasionFilter === 'SPECIAL' ? 'First Dance' : occasionFilter === 'BANNED' ? 'Banned' : 'Reception',
      playStatus: occasionFilter === 'BANNED' ? 'Banned' : 'Must Play',
      notes: '',
      requestedBy: 'Admin',
      approvalStatus: 'Approved',
      link: '',
    });
    setITunesQuery('');
    setITunesResults([]);
    setIsAdding(true);
    setEditingItem(null);
  };

  const startEdit = (item: Song) => {
    setFormState({
      ...item,
      playStatus: item.playStatus || (item.listType === 'Banned' ? 'Banned' : 'Must Play'),
    });
    setITunesQuery('');
    setITunesResults([]);
    setEditingItem(item);
    setIsAdding(false);
  };

  const currentEditingTrackIndex = useMemo(() => {
    if (!editingItem) return -1;
    return filteredMusic.findIndex(s => s.songId === editingItem.songId);
  }, [editingItem, filteredMusic]);

  const handleNavigateAdjacentTrack = (direction: 'prev' | 'next') => {
    if (currentEditingTrackIndex === -1) return;
    const targetIndex = direction === 'prev' ? currentEditingTrackIndex - 1 : currentEditingTrackIndex + 1;
    if (targetIndex >= 0 && targetIndex < filteredMusic.length) {
      startEdit(filteredMusic[targetIndex]);
    }
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
      if (field === 'listType' && (value === 'Banned' || value === 'Do Not Play')) {
        next.playStatus = 'Banned';
        next.approvalStatus = 'Banned';
      } else if (field === 'playStatus' && value === 'Banned') {
        next.listType = 'Banned';
        next.approvalStatus = 'Banned';
      }
      return next;
    });
  };

  const saveItem = async (e: React.FormEvent, continueAdding = false) => {
    e.preventDefault();
    if (isSyncing) return;

    const isBanned = formState.listType === 'Banned' || formState.listType === 'Do Not Play' || formState.playStatus === 'Banned';

    let updatedMusic: Song[];
    if (isAdding) {
      const newItem: Song = {
        songId: `M${Date.now()}`,
        title: (formState.title || 'Unknown Song').trim(),
        artist: (formState.artist || 'Unknown Artist').trim(),
        listType: isBanned ? 'Banned' : (formState.listType || 'Reception'),
        playStatus: isBanned ? 'Banned' : (formState.playStatus || 'Must Play'),
        notes: (formState.notes || '').trim(),
        requestedBy: (formState.requestedBy || 'Admin').trim(),
        approvalStatus: isBanned ? 'Banned' : (formState.approvalStatus || 'Approved'),
        link: (formState.link || '').trim(),
      };
      updatedMusic = [...music, newItem];
    } else {
      updatedMusic = music.map(item => 
        item.songId === editingItem?.songId ? {
          ...item,
          ...formState,
          title: (formState.title || item.title || '').trim(),
          artist: (formState.artist || item.artist || '').trim(),
          listType: isBanned ? 'Banned' : (formState.listType || item.listType || 'Reception'),
          playStatus: isBanned ? 'Banned' : (formState.playStatus || item.playStatus || 'Must Play'),
          approvalStatus: isBanned ? 'Banned' : (formState.approvalStatus || item.approvalStatus || 'Approved'),
          requestedBy: (formState.requestedBy || item.requestedBy || 'Admin').trim(),
          notes: (formState.notes || '').trim(),
        } as Song : item
      );
    }

    await onUpdate(updatedMusic);

    if (continueAdding) {
      setFormState({
        title: '',
        artist: '',
        listType: formState.listType || 'Reception',
        playStatus: formState.playStatus || 'Must Play',
        notes: '',
        requestedBy: 'Admin',
        approvalStatus: 'Approved',
        link: '',
      });
      setIsAdding(true);
      setEditingItem(null);
    } else {
      closeModal();
    }
  };

  const confirmDeleteSong = async () => {
    if (!songToDelete || isSyncing) return;
    if (playingId === songToDelete.songId) {
      stopAudio();
    }
    const updated = music.filter(item => item.songId !== songToDelete.songId);
    await onUpdate(updated);
    setSongToDelete(null);
  };

  // One-Click Copy Setlist Summary to Clipboard
  const handleCopySetlist = () => {
    let text = `WEDDING MUSIC PLAYLIST & DJ CUE SHEET\n`;
    text += `Total Tracks: ${deduplicatedMusic.length} | Generated by Sheet2Vow\n\n`;

    const ceremonySongs = deduplicatedMusic.filter(s => s.occasionGroup === 'CEREMONY' && s.effectivePriority !== 'Banned');
    const specialSongs = deduplicatedMusic.filter(s => s.occasionGroup === 'SPECIAL' && s.effectivePriority !== 'Banned');
    const receptionSongs = deduplicatedMusic.filter(s => s.occasionGroup === 'RECEPTION' && s.effectivePriority !== 'Banned');
    const bannedSongs = deduplicatedMusic.filter(s => s.effectivePriority === 'Banned');

    if (ceremonySongs.length > 0) {
      text += `--- CEREMONY ---\n`;
      ceremonySongs.forEach(s => {
        text += `• "${s.title}" by ${s.artist} [${s.effectivePriority.toUpperCase()}]${s.notes ? ` (Cue: ${s.notes})` : ''}\n`;
      });
      text += `\n`;
    }

    if (specialSongs.length > 0) {
      text += `--- FIRST DANCE & SPECIAL MOMENTS ---\n`;
      specialSongs.forEach(s => {
        text += `• "${s.title}" by ${s.artist} (${s.listType}) [${s.effectivePriority.toUpperCase()}]${s.notes ? ` (Cue: ${s.notes})` : ''}\n`;
      });
      text += `\n`;
    }

    if (receptionSongs.length > 0) {
      text += `--- RECEPTION & DANCE FLOOR ---\n`;
      const mustPlay = receptionSongs.filter(s => s.effectivePriority === 'Must Play');
      const playIfTime = receptionSongs.filter(s => s.effectivePriority === 'Play If Time');

      if (mustPlay.length > 0) {
        text += `[Must Play Tracks]\n`;
        mustPlay.forEach(s => {
          text += `• "${s.title}" by ${s.artist}${s.notes ? ` (${s.notes})` : ''}\n`;
        });
      }
      if (playIfTime.length > 0) {
        text += `\n[Play If Time Tracks]\n`;
        playIfTime.forEach(s => {
          text += `• "${s.title}" by ${s.artist}${s.notes ? ` (${s.notes})` : ''}\n`;
        });
      }
      text += `\n`;
    }

    if (bannedSongs.length > 0) {
      text += `--- DO NOT PLAY / BANNED TRACKS ---\n`;
      bannedSongs.forEach(s => {
        text += `• "${s.title}" by ${s.artist}${s.notes ? ` (Reason: ${s.notes})` : ''}\n`;
      });
      text += `\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback('Playlist summary copied to clipboard! Ready to paste into your DJ form.');
      setTimeout(() => setCopyFeedback(null), 4000);
    }).catch(() => {
      setCopyFeedback('Failed to copy to clipboard.');
      setTimeout(() => setCopyFeedback(null), 3000);
    });
  };

  // Share / Email Playlist to Vendor
  const handleShareMusic = () => {
    const subject = encodeURIComponent('Wedding Music Playlist & Vendor Preferences');
    let bodyText = `Hi!\n\nHere is our official Wedding Music Playlist & Track Preferences:\n\n`;

    const ceremonySongs = deduplicatedMusic.filter(s => s.occasionGroup === 'CEREMONY' && s.effectivePriority !== 'Banned');
    const specialSongs = deduplicatedMusic.filter(s => s.occasionGroup === 'SPECIAL' && s.effectivePriority !== 'Banned');
    const mustPlay = deduplicatedMusic.filter(s => s.effectivePriority === 'Must Play' && s.occasionGroup === 'RECEPTION');
    const playIfTime = deduplicatedMusic.filter(s => s.effectivePriority === 'Play If Time' && s.occasionGroup === 'RECEPTION');
    const bannedSongs = deduplicatedMusic.filter(s => s.effectivePriority === 'Banned');

    if (ceremonySongs.length > 0) {
      bodyText += `--- CEREMONY ---\n`;
      ceremonySongs.forEach(s => {
        bodyText += `• "${s.title}" by ${s.artist}${s.notes ? ` (${s.notes})` : ''}\n`;
      });
      bodyText += `\n`;
    }

    if (specialSongs.length > 0) {
      bodyText += `--- SPECIAL MOMENTS & DANCES ---\n`;
      specialSongs.forEach(s => {
        bodyText += `• "${s.title}" by ${s.artist} [${s.listType}]${s.notes ? ` (${s.notes})` : ''}\n`;
      });
      bodyText += `\n`;
    }

    if (mustPlay.length > 0) {
      bodyText += `--- RECEPTION: MUST PLAY ---\n`;
      mustPlay.forEach(s => {
        bodyText += `• "${s.title}" by ${s.artist}${s.notes ? ` (${s.notes})` : ''}\n`;
      });
      bodyText += `\n`;
    }

    if (playIfTime.length > 0) {
      bodyText += `--- RECEPTION: PLAY IF TIME ---\n`;
      playIfTime.forEach(s => {
        bodyText += `• "${s.title}" by ${s.artist}${s.notes ? ` (${s.notes})` : ''}\n`;
      });
      bodyText += `\n`;
    }

    if (bannedSongs.length > 0) {
      bodyText += `--- DO NOT PLAY / BANNED ---\n`;
      bannedSongs.forEach(s => {
        bodyText += `• "${s.title}" by ${s.artist}${s.notes ? ` (Reason: ${s.notes})` : ''}\n`;
      });
      bodyText += `\n`;
    }

    bodyText += `Thank you!`;

    const djVendor = vendors.find(v => {
      const cat = (v.category || '').toLowerCase();
      const name = (v.vendorName || '').toLowerCase();
      return cat.includes('dj') || cat.includes('band') || cat.includes('music') || name.includes('dj') || name.includes('band');
    });
    const recipientEmail = djVendor?.emailAddress || '';

    window.location.href = `mailto:${encodeURIComponent(recipientEmail)}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  // Helper to render tactile sample audio button
  const renderSamplePlayer = (item: Song, compact = false) => {
    const isPlaying = playingId === item.songId;
    const isLoading = isLoadingAudio === item.songId;
    const hasPreview = Boolean(item.link && item.link.includes('http'));
    
    return (
      <button 
        type="button"
        className="music-play-btn"
        onClick={() => togglePlay(item)} 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: compact ? '34px' : '42px',
          height: compact ? '34px' : '42px',
          minWidth: compact ? '34px' : '42px',
          borderRadius: '50%',
          backgroundColor: isPlaying ? 'var(--color-primary, #0F172A)' : hasPreview ? 'rgba(15, 23, 42, 0.06)' : 'rgba(15, 23, 42, 0.03)',
          color: isPlaying ? '#ffffff' : hasPreview ? 'var(--color-primary, #0F172A)' : 'var(--color-muted, #94a3b8)',
          border: isPlaying ? 'none' : '1px solid var(--color-border, #e2e8f0)',
          cursor: hasPreview ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
        }} 
        title={isPlaying ? "Pause 30s Sample" : hasPreview ? "Play 30s iTunes Preview" : "No sample link available"}
        disabled={isLoadingAudio !== null && isLoadingAudio !== item.songId}
      >
        {isLoading ? (
          <Loader2 size={compact ? 16 : 20} className="spin" />
        ) : isPlaying ? (
          <Pause size={compact ? 16 : 20} />
        ) : (
          <Play size={compact ? 16 : 20} style={{ marginLeft: '2px' }} />
        )}
      </button>
    );
  };

  // Helper to render branded streaming links
  const renderStreamingLinks = (item: Song, compact = false) => {
    const query = encodeURIComponent(`${item.title} ${item.artist}`);
    const spotifyUrl = `https://open.spotify.com/search/${query}`;
    const ytMusicUrl = `https://music.youtube.com/search?q=${query}`;

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <a 
          href={spotifyUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="music-streaming-link music-spotify-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: compact ? '0.25rem 0.5rem' : '0.32rem 0.65rem',
            borderRadius: '6px',
            backgroundColor: '#1DB95415',
            color: '#1DB954',
            border: '1px solid #1DB95440',
            textDecoration: 'none',
            fontSize: compact ? '0.68rem' : '0.72rem',
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontWeight: 700,
            transition: 'all 0.15s ease',
          }}
          title="Search on Spotify"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span>Spotify</span>
        </a>

        <a 
          href={ytMusicUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="music-streaming-link music-ytm-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: compact ? '0.25rem 0.5rem' : '0.32rem 0.65rem',
            borderRadius: '6px',
            backgroundColor: '#FF000012',
            color: '#DC2626',
            border: '1px solid #FF000030',
            textDecoration: 'none',
            fontSize: compact ? '0.68rem' : '0.72rem',
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontWeight: 700,
            transition: 'all 0.15s ease',
          }}
          title="Search on YouTube Music"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>YouTube Music</span>
        </a>
      </div>
    );
  };

  // Helper to render Occasion Pill Badge
  const renderOccasionBadge = (item: Song) => {
    const occ = getOccasionGroup(item);
    let color = '#6366F1';
    let bg = 'rgba(99, 102, 241, 0.08)';
    let border = 'rgba(99, 102, 241, 0.25)';
    let label = item.listType || 'Reception';

    if (occ === 'CEREMONY') {
      color = '#8B5CF6';
      bg = 'rgba(139, 92, 246, 0.08)';
      border = 'rgba(139, 92, 246, 0.25)';
      label = item.listType || 'Ceremony';
    } else if (occ === 'SPECIAL') {
      color = '#EC4899';
      bg = 'rgba(236, 72, 153, 0.08)';
      border = 'rgba(236, 72, 153, 0.25)';
      label = item.listType || 'First Dance';
    } else if (occ === 'BANNED') {
      color = '#EF4444';
      bg = 'rgba(239, 68, 68, 0.08)';
      border = 'rgba(239, 68, 68, 0.25)';
      label = 'Do Not Play';
    }

    return (
      <span style={{
        fontFamily: 'var(--font-technical-mono, monospace)',
        fontSize: '0.64rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '0.18rem 0.45rem',
        borderRadius: '4px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}>
        {label}
      </span>
    );
  };

  // Helper to render Priority Pill Badge
  const renderPriorityBadge = (item: DeduplicatedSong) => {
    const pri = item.effectivePriority;
    let color = '#10B981';
    let bg = 'rgba(16, 185, 129, 0.08)';
    let border = 'rgba(16, 185, 129, 0.25)';
    let icon = '🔥';
    let label = 'MUST PLAY';

    if (pri === 'Play If Time') {
      color = '#F59E0B';
      bg = 'rgba(245, 158, 11, 0.08)';
      border = 'rgba(245, 158, 11, 0.25)';
      icon = '⏳';
      label = 'PLAY IF TIME';
    } else if (pri === 'Banned') {
      color = '#EF4444';
      bg = 'rgba(239, 68, 68, 0.08)';
      border = 'rgba(239, 68, 68, 0.25)';
      icon = '🚫';
      label = 'BANNED';
    }

    return (
      <span style={{
        fontFamily: 'var(--font-technical-mono, monospace)',
        fontSize: '0.64rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        padding: '0.18rem 0.45rem',
        borderRadius: '4px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}>
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    );
  };

  // Calculate Metric Strip Totals
  const totalCount = music.length;
  const uniqueCount = deduplicatedMusic.length;
  const mustPlayCount = deduplicatedMusic.filter(s => s.effectivePriority === 'Must Play').length;
  const ceremonyAndSpecialsCount = deduplicatedMusic.filter(s => (s.occasionGroup === 'CEREMONY' || s.occasionGroup === 'SPECIAL') && s.effectivePriority !== 'Banned').length;
  const bannedCount = deduplicatedMusic.filter(s => s.effectivePriority === 'Banned').length;

  return (
    <div style={{ fontFamily: 'var(--font-sans, system-ui, sans-serif)' }} className="music-manager-root">
      {/* Scoped CSS for Modern Music Responsive Layout */}
      <style>{`
        .music-toolbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .music-filters-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          flex: 1;
        }
        .music-view-toggle {
          display: inline-flex;
          align-items: center;
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 6px;
          padding: 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .music-view-toggle button {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          font-family: var(--font-technical-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
          min-height: 32px;
        }
        .music-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        .music-card {
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: var(--border-radius-md, 8px);
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          box-shadow: var(--box-shadow-subtle, 0 1px 2px rgba(0,0,0,0.03));
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          position: relative;
        }
        .music-card:hover {
          box-shadow: var(--box-shadow-medium, 0 4px 12px rgba(0,0,0,0.06));
          border-color: var(--color-border-hover, #cbd5e1);
        }
        .music-table-container {
          overflow-x: auto;
          background-color: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: var(--border-radius-md, 8px);
          box-shadow: var(--box-shadow-subtle, 0 1px 2px rgba(0,0,0,0.03));
        }
        .music-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .music-table th {
          padding: 0.75rem 0.85rem;
          text-align: left;
          font-family: var(--font-technical-mono, monospace);
          font-size: 0.68rem;
          color: var(--color-muted, #64748b);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background-color: var(--color-bg-subtle, #f8fafc);
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          white-space: nowrap;
        }
        .music-table td {
          padding: 0.75rem 0.85rem;
          border-bottom: 1px solid var(--color-border, #f1f5f9);
          vertical-align: middle;
        }
        .music-table tr:hover {
          background-color: var(--color-bg-subtle, #f8fafc);
        }
        .music-docked-player {
          position: fixed;
          bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 2rem);
          max-width: 720px;
          background-color: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 14px;
          box-shadow: 0 12px 36px -4px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(0, 0, 0, 0.06);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 150;
          animation: slideUpFade 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translate(-50%, 15px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @media (max-width: 768px) {
          .music-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .music-toolbar-row {
            flex-direction: column;
            align-items: stretch;
          }
          .music-view-toggle {
            width: 100%;
            display: flex;
          }
          .music-view-toggle button {
            flex: 1;
            justify-content: center;
          }
          .music-docked-player {
            width: calc(100% - 1.5rem);
            bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
            padding: 0.65rem 0.85rem;
            gap: 0.75rem;
          }
        }
      `}</style>

      {/* Standardized Page Header Card with Integrated Occasion Segments & Action Buttons */}
      <PageHeaderCard
        title="Music & Playlists"
        subtitle="Curate tracks for your ceremony, first dances, reception, and DJ cue sheet."
        badge={`${uniqueCount} Tracks`}
        segmentSwitcher={{
          options: [
            { id: 'ALL', label: 'ALL TRACKS', count: deduplicatedMusic.length },
            { id: 'CEREMONY', label: 'CEREMONY', count: deduplicatedMusic.filter(s => s.occasionGroup === 'CEREMONY' && s.effectivePriority !== 'Banned').length },
            { id: 'SPECIAL', label: 'SPECIAL DANCES', count: deduplicatedMusic.filter(s => s.occasionGroup === 'SPECIAL' && s.effectivePriority !== 'Banned').length },
            { id: 'RECEPTION', label: 'RECEPTION', count: deduplicatedMusic.filter(s => s.occasionGroup === 'RECEPTION' && s.effectivePriority !== 'Banned').length },
            { id: 'BANNED', label: 'DO NOT PLAY', count: deduplicatedMusic.filter(s => s.effectivePriority === 'Banned').length },
          ],
          activeId: occasionFilter,
          onChange: (id) => setOccasionFilter(id as MusicOccasionGroup),
        }}
        actionButtons={
          <>
            {/* Quick Setlist Summary Copy */}
            <button
              type="button"
              className="s2v-header-btn s2v-header-btn-secondary"
              onClick={handleCopySetlist}
              title="Copy formatted wedding music rundown to clipboard"
            >
              <Copy size={14} style={{ color: 'var(--color-primary, #0F172A)' }} />
              <span>COPY SETLIST</span>
            </button>

            {/* Email Playlist to DJ */}
            <button
              type="button"
              className="s2v-header-btn s2v-header-btn-secondary"
              onClick={handleShareMusic}
              title="Email formatted playlist directly to DJ or band"
            >
              <Mail size={14} style={{ color: 'var(--color-primary, #0F172A)' }} />
              <span>EMAIL DJ</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              className="s2v-header-btn s2v-header-btn-primary"
              onClick={startAdd}
              disabled={isSyncing}
              title="Add Track to Wedding Playlists"
            >
              <Plus size={14} />
              <span>ADD SONG</span>
            </button>
          </>
        }
      />

      {/* Monarch-Style Hero Metric Strip */}
      <PageMetricStrip
        style={{ marginBottom: '1.25rem' }}
        metrics={[
          {
            id: 'all',
            label: 'ALL SONGS',
            value: totalCount,
            subtext: `${uniqueCount} unique tracks`,
            statusBadge: 'Full Roster',
            statusColor: 'blue',
            onClick: () => {
              setOccasionFilter('ALL');
              setPriorityFilter('ALL');
            },
            isActive: occasionFilter === 'ALL' && priorityFilter === 'ALL',
          },
          {
            id: 'must-play',
            label: 'MUST PLAY',
            value: mustPlayCount,
            subtext: 'High-priority cues',
            statusBadge: 'Priority',
            statusColor: 'green',
            onClick: () => {
              setPriorityFilter(prev => prev === 'MUST PLAY' ? 'ALL' : 'MUST PLAY');
            },
            isActive: priorityFilter === 'MUST PLAY',
          },
          {
            id: 'ceremony-specials',
            label: 'CEREMONY & SPECIALS',
            value: ceremonyAndSpecialsCount,
            subtext: 'Key moment cues',
            statusBadge: 'Key Cues',
            statusColor: 'purple',
            onClick: () => {
              setOccasionFilter(prev => prev === 'CEREMONY' ? 'ALL' : 'CEREMONY');
            },
            isActive: occasionFilter === 'CEREMONY' || occasionFilter === 'SPECIAL',
          },
          {
            id: 'banned',
            label: 'DO NOT PLAY',
            value: bannedCount,
            subtext: 'Blacklisted tracks',
            statusBadge: bannedCount > 0 ? 'Protected' : 'Clear',
            statusColor: bannedCount > 0 ? 'red' : 'neutral',
            onClick: () => {
              setOccasionFilter(prev => prev === 'BANNED' ? 'ALL' : 'BANNED');
            },
            isActive: occasionFilter === 'BANNED',
          },
        ]}
      />

      {/* Toolbar: Search, Priority Filter Dropdown & View Mode Switcher */}
      <div className="music-toolbar-row">
        <div className="music-filters-left">
          <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <PageSearchInput
              placeholder="Search by title, artist, notes, or requester..."
              value={searchTerm}
              onChange={setSearchTerm}
              resultCount={filteredMusic.length}
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--border-radius-sm, 6px)',
              border: '1px solid var(--color-border, #e2e8f0)',
              backgroundColor: 'var(--color-surface, #ffffff)',
              color: 'var(--color-text, #0f172a)',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontWeight: 700,
              minHeight: '38px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="ALL">ALL PRIORITIES</option>
            <option value="MUST PLAY">🔥 MUST PLAY ONLY</option>
            <option value="PLAY IF TIME">⏳ PLAY IF TIME</option>
            <option value="BANNED">🚫 BANNED ONLY</option>
          </select>
        </div>

        {/* View Mode Switcher [CARDS] vs [PLAYLIST] */}
        <div className="music-view-toggle">
          <button
            type="button"
            onClick={() => setLayoutMode('cards')}
            style={{
              backgroundColor: layoutMode === 'cards' ? 'var(--color-primary, #0F172A)' : 'transparent',
              color: layoutMode === 'cards' ? '#ffffff' : 'var(--color-muted, #64748b)',
            }}
            title="Card Grid View"
          >
            <Grid size={13} />
            <span>CARDS</span>
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('playlist')}
            style={{
              backgroundColor: layoutMode === 'playlist' ? 'var(--color-primary, #0F172A)' : 'transparent',
              color: layoutMode === 'playlist' ? '#ffffff' : 'var(--color-muted, #64748b)',
            }}
            title="Compact Playlist Table View"
          >
            <List size={13} />
            <span>PLAYLIST</span>
          </button>
        </div>
      </div>

      {/* Active Filter Badges Row */}
      {(occasionFilter !== 'ALL' || priorityFilter !== 'ALL' || searchTerm.trim() !== '') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', color: 'var(--color-muted, #64748b)', fontWeight: 700 }}>
            ACTIVE FILTERS:
          </span>
          {occasionFilter !== 'ALL' && (
            <span 
              onClick={() => setOccasionFilter('ALL')}
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: 'var(--color-bg-subtle, #f1f5f9)',
                color: 'var(--color-primary, #0f172a)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #e2e8f0)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Click to clear occasion filter"
            >
              OCCASION: {occasionFilter} <X size={10} />
            </span>
          )}
          {priorityFilter !== 'ALL' && (
            <span 
              onClick={() => setPriorityFilter('ALL')}
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: 'var(--color-bg-subtle, #f1f5f9)',
                color: 'var(--color-primary, #0f172a)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #e2e8f0)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Click to clear priority filter"
            >
              PRIORITY: {priorityFilter} <X size={10} />
            </span>
          )}
          {searchTerm.trim() !== '' && (
            <span 
              onClick={() => setSearchTerm('')}
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: 'var(--color-bg-subtle, #f1f5f9)',
                color: 'var(--color-primary, #0f172a)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #e2e8f0)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Click to clear search"
            >
              SEARCH: "{searchTerm}" <X size={10} />
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setOccasionFilter('ALL');
              setPriorityFilter('ALL');
              setSearchTerm('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-muted, #64748b)',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-technical-mono, monospace)',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Reset All
          </button>
        </div>
      )}

      {/* Main Content: Cards Grid vs Playlist Table */}
      {layoutMode === 'cards' ? (
        <div className="music-cards-grid">
          {filteredMusic.map((item: DeduplicatedSong) => {
            const isBanned = item.effectivePriority === 'Banned';
            const isPlaying = playingId === item.songId;

            return (
              <div 
                key={item.songId}
                className="music-card"
                style={{
                  borderLeft: isBanned 
                    ? '4px solid var(--color-red, #ef4444)' 
                    : item.effectivePriority === 'Must Play'
                      ? '4px solid #10B981'
                      : '4px solid #F59E0B',
                  backgroundColor: isBanned 
                    ? 'rgba(239, 68, 68, 0.02)' 
                    : isPlaying
                      ? 'rgba(15, 23, 42, 0.02)'
                      : 'var(--color-surface, #ffffff)',
                }}
              >
                {/* Header: Occasion & Priority Badges + Actions */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {renderOccasionBadge(item)}
                    {renderPriorityBadge(item)}
                    {item.requestCount > 1 && (
                      <span style={{
                        fontSize: '0.64rem',
                        fontFamily: 'var(--font-technical-mono, monospace)',
                        fontWeight: 800,
                        backgroundColor: '#8B5CF618',
                        color: '#8B5CF6',
                        border: '1px solid #8B5CF630',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                      }}>
                        🔥 {item.requestCount} REQUESTS
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-muted, #64748b)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                      }}
                      title="Edit Track Details"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSongToDelete(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-red, #ef4444)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                      }}
                      title="Delete Track"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Main Song Info with Live Preview Player */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {renderSamplePlayer(item)}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      margin: '0 0 0.15rem 0',
                      fontFamily: 'var(--font-serif, Georgia, serif)',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: isBanned ? 'var(--color-red, #ef4444)' : 'var(--color-text, #0f172a)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: '0.825rem',
                      color: 'var(--color-muted, #64748b)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      by {item.artist}
                    </p>
                  </div>
                </div>

                {/* DJ Cue Notes / Special Instructions Callout */}
                {item.notes && (
                  <div style={{
                    padding: '0.5rem 0.65rem',
                    backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
                    border: '1px solid var(--color-border, #f1f5f9)',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontStyle: 'italic',
                    color: isBanned ? 'var(--color-red, #ef4444)' : 'var(--color-text, #334155)',
                    lineHeight: 1.35,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.35rem',
                  }}>
                    <span style={{ fontStyle: 'normal', opacity: 0.6 }}>💬</span>
                    <span>"{item.notes}"</span>
                  </div>
                )}

                {/* Card Footer: Requester Tag & Streaming Links */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginTop: 'auto',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid var(--color-border, #f1f5f9)',
                }}>
                  <span style={{
                    fontSize: '0.66rem',
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    color: 'var(--color-muted, #64748b)',
                  }}>
                    👤 {item.requestedBy || 'Admin'}
                  </span>

                  {renderStreamingLinks(item)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Playlist Table View Mode */
        <div className="music-table-container">
          <table className="music-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ width: '48px', textAlign: 'center' }}>SAMPLE</th>
                <th>TRACK TITLE & ARTIST</th>
                <th>OCCASION</th>
                <th>PRIORITY</th>
                <th>REQUESTED BY</th>
                <th>DJ NOTES</th>
                <th>STREAMING</th>
                <th style={{ width: '70px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMusic.map((item: DeduplicatedSong, idx: number) => {
                const isBanned = item.effectivePriority === 'Banned';
                const isPlaying = playingId === item.songId;

                return (
                  <tr 
                    key={item.songId}
                    style={{
                      backgroundColor: isBanned 
                        ? 'rgba(239, 68, 68, 0.02)' 
                        : isPlaying
                          ? 'rgba(15, 23, 42, 0.03)'
                          : undefined,
                    }}
                  >
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.72rem', color: 'var(--color-muted, #94a3b8)' }}>
                      {idx + 1}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {renderSamplePlayer(item, true)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                          fontFamily: 'var(--font-serif, Georgia, serif)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: isBanned ? 'var(--color-red, #ef4444)' : 'var(--color-text, #0f172a)',
                        }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>
                          {item.artist}
                        </span>
                      </div>
                    </td>
                    <td>
                      {renderOccasionBadge(item)}
                    </td>
                    <td>
                      {renderPriorityBadge(item)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.72rem', color: 'var(--color-muted, #64748b)' }}>
                      {item.requestedBy || 'Admin'}
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      {item.notes ? (
                        <span style={{ fontSize: '0.74rem', fontStyle: 'italic', color: 'var(--color-muted, #64748b)' }} title={item.notes}>
                          "{item.notes.length > 50 ? `${item.notes.slice(0, 50)}...` : item.notes}"
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-muted, #cbd5e1)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {renderStreamingLinks(item, true)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-muted, #64748b)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                          }}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSongToDelete(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-red, #ef4444)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                          }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredMusic.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px dashed var(--color-border, #cbd5e1)',
          borderRadius: 'var(--border-radius-md, 8px)',
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <Music size={32} style={{ color: 'var(--color-muted, #94a3b8)', opacity: 0.5 }} />
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1.1rem', color: 'var(--color-text, #0f172a)' }}>
            No songs found
          </h3>
          <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-muted, #64748b)', maxWidth: '360px' }}>
            {searchTerm || occasionFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'No tracks match your active search or filters. Try adjusting your filter selection.'
              : 'Your wedding playlist is currently empty. Add your favorite tracks, first dance, or ceremony cues!'}
          </p>
          {searchTerm || occasionFilter !== 'ALL' || priorityFilter !== 'ALL' ? (
            <button
              type="button"
              onClick={() => {
                setOccasionFilter('ALL');
                setPriorityFilter('ALL');
                setSearchTerm('');
              }}
              style={{
                marginTop: '0.5rem',
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: 'var(--color-surface, #ffffff)',
                color: 'var(--color-primary, #0f172a)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Clear All Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={startAdd}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--color-primary, #0f172a)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add First Song
            </button>
          )}
        </div>
      )}

      {/* DOCKED FLOATING AUDIO MINI-PLAYER BAR */}
      {playingSong && (
        <div className="music-docked-player">
          {/* Vinyl / Disc icon with pulse */}
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary, #0f172a)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            <Disc size={20} className="spin" />
          </div>

          {/* Track Details & Scrubber */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text, #0f172a)' }}>
                  {playingSong.title}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)', marginLeft: '6px' }}>
                  • {playingSong.artist}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-technical-mono, monospace)', fontSize: '0.68rem', color: 'var(--color-muted, #64748b)' }}>
                {Math.floor(audioCurrentTime)}s / {Math.floor(audioDuration)}s
              </span>
            </div>

            {/* Interactive Progress Bar */}
            <div 
              onClick={handleSeek}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: 'rgba(15, 23, 42, 0.08)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              title="Click to seek"
            >
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${audioProgress}%`,
                backgroundColor: 'var(--color-primary, #0f172a)',
                borderRadius: '3px',
                transition: 'width 0.1s linear',
              }} />
            </div>
          </div>

          {/* Player Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => togglePlay(playingSong)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'var(--color-primary, #0f172a)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Pause preview"
            >
              <Pause size={18} />
            </button>

            <button
              type="button"
              onClick={stopAudio}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-muted, #64748b)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close player"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification for Clipboard Copy / Feedback */}
      {copyFeedback && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          right: '1.5rem',
          maxWidth: '420px',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          zIndex: 10001,
          fontSize: '0.825rem',
          fontWeight: 600,
          color: 'var(--color-text, #0F172A)'
        }}>
          <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{copyFeedback}</span>
          <button 
            type="button"
            onClick={() => setCopyFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'var(--color-muted, #64748b)', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Toast Error Notification for Audio Preview */}
      {previewError && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          right: '1.5rem',
          maxWidth: '400px',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          zIndex: 10001,
          fontSize: '0.825rem',
          fontWeight: 600,
          color: 'var(--color-text, #0F172A)'
        }}>
          <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{previewError}</span>
          <button 
            type="button"
            onClick={() => setPreviewError(null)}
            style={{ background: 'none', border: 'none', color: 'var(--color-muted, #64748b)', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* MONARCH SLIDE-OVER DRAWER FOR ADD / EDIT TRACK */}
      <SlideOverDrawer
        isOpen={Boolean(isAdding || editingItem)}
        onClose={closeModal}
        title={isAdding ? 'Add Track' : 'Edit Track'}
        subtitle={
          editingItem
            ? `${editingItem.title || 'Track'} • ${editingItem.artist || 'Artist'}`
            : 'Search iTunes catalog or add track manually'
        }
        badge={editingItem ? (editingItem.listType?.toUpperCase() || 'TRACK') : 'NEW TRACK'}
        width="540px"
        onPrev={
          editingItem && currentEditingTrackIndex > 0
            ? () => handleNavigateAdjacentTrack('prev')
            : undefined
        }
        onNext={
          editingItem && currentEditingTrackIndex < filteredMusic.length - 1
            ? () => handleNavigateAdjacentTrack('next')
            : undefined
        }
        footer={
          (() => {
            const isTrackFormValid = Boolean(
              (formState.title || '').trim() && (formState.artist || '').trim()
            );
            const isDisabled = !isTrackFormValid || Boolean(isSyncing);
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem', flexWrap: 'wrap' }}>
                {editingItem ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSongToDelete(editingItem);
                      closeModal();
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
                    <span>Delete Track</span>
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={closeModal}
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

                  {isAdding && (
                    <button
                      type="button"
                      disabled={isDisabled}
                      title={!isTrackFormValid ? 'Enter Song Title and Artist to enable saving' : undefined}
                      onClick={(e) => saveItem(e, true)}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: `1.5px solid ${isDisabled ? 'var(--color-border, #cbd5e1)' : 'var(--color-primary, #0F172A)'}`,
                        backgroundColor: 'var(--color-surface, #ffffff)',
                        color: isDisabled ? 'var(--color-muted, #94a3b8)' : 'var(--color-primary, #0F172A)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.45 : 1,
                        minHeight: '44px',
                      }}
                    >
                      {isSyncing ? 'Saving...' : 'Save & Add Another'}
                    </button>
                  )}

                  <button
                    type="submit"
                    form="music-track-form"
                    disabled={isDisabled}
                    title={!isTrackFormValid ? 'Enter Song Title and Artist to enable saving' : undefined}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isDisabled ? 'var(--color-muted, #94a3b8)' : 'var(--color-primary, #0F172A)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      boxShadow: isDisabled ? 'none' : '0 2px 6px rgba(0,0,0,0.12)',
                      minHeight: '44px',
                      opacity: isDisabled ? 0.45 : 1,
                    }}
                  >
                    {isSyncing ? 'Saving...' : (isAdding ? 'Save Track' : 'Save Changes')}
                  </button>
                </div>
              </div>
            );
          })()
        }
      >
        <form id="music-track-form" onSubmit={saveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0 2rem 0' }}>
          {/* Section 1: iTunes Catalog Search & Track Info */}
          <DrawerSection title="Track Details" description="Search the iTunes catalog or enter artist & title manually">
            <DrawerField label="Auto-Search iTunes Catalog" hint="Type song title or artist to auto-fill metadata">
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Type song or artist to auto-fill..."
                  value={iTunesQuery}
                  onChange={(e) => setITunesQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    color: 'var(--color-text, #1a202c)',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    minHeight: '46px',
                  }}
                />
                {iTunesQuery && (
                  <button
                    type="button"
                    onClick={() => { setITunesQuery(''); setITunesResults([]); setShowResults(false); }}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-muted, #718096)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}

                {showResults && iTunesResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--color-surface, #ffffff)',
                    border: '2px solid var(--color-primary, #0F172A)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}>
                    {iTunesResults.map(track => (
                      <div
                        key={track.trackId}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderBottom: '1px solid var(--color-border, #e2e8f0)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          backgroundColor: 'var(--color-surface, #ffffff)',
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectITunesTrack(track);
                        }}
                      >
                        {track.artworkUrl60 && (
                          <img src={track.artworkUrl60} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.trackName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #718096)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artistName} • {track.collectionName || 'Single'}</div>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)', fontFamily: 'var(--font-technical-mono, monospace)' }}>SELECT</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {isSearchingITunes && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #718096)', fontFamily: 'var(--font-technical-mono, monospace)', marginTop: '4px' }}>
                  Searching iTunes catalog...
                </div>
              )}
            </DrawerField>

            <DrawerRow columns={2}>
              <DrawerField label="Song Title" required>
                <input
                  type="text"
                  required
                  placeholder="e.g. Perfect"
                  value={formState.title || ''}
                  onChange={(e) => handleFormChange('title', e.target.value)}
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
                    minHeight: '46px',
                  }}
                />
              </DrawerField>

              <DrawerField label="Artist" required>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ed Sheeran"
                  value={formState.artist || ''}
                  onChange={(e) => handleFormChange('artist', e.target.value)}
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
                    minHeight: '46px',
                  }}
                />
              </DrawerField>
            </DrawerRow>
          </DrawerSection>

          {/* Section 2: Occasion & Priority */}
          <DrawerSection title="Occasion & Priority" description="Which wedding moment this belongs to and DJ cue urgency">
            <DrawerRow columns={2}>
              <DrawerField label="Occasion / Moment" hint="Ceremony, Dances, or Reception">
                <select
                  value={formState.listType || 'Reception'}
                  onChange={(e) => handleFormChange('listType', e.target.value)}
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
                    cursor: 'pointer',
                    minHeight: '46px',
                  }}
                >
                  <option value="Ceremony">Ceremony (Aisle, Vows, Recessional)</option>
                  <option value="First Dance">First Dance</option>
                  <option value="Special Moment">Special Moment (Parent Dances, Cake)</option>
                  <option value="Reception">Reception & Dance Floor</option>
                  <option value="Banned">Do Not Play / Blacklist</option>
                </select>
              </DrawerField>

              <DrawerField label="Requested By" hint="Bride, Groom, or Guest name">
                <input
                  type="text"
                  placeholder="e.g. Admin, Bride, Aunt Sarah"
                  value={formState.requestedBy || 'Admin'}
                  onChange={(e) => handleFormChange('requestedBy', e.target.value)}
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
                    minHeight: '46px',
                  }}
                />
              </DrawerField>
            </DrawerRow>

            {/* Monarch PriorityPills Component */}
            <DrawerField label="DJ Priority Level" hint="Must play vs play if time allows">
              <PriorityPills
                value={formState.playStatus || 'Must Play'}
                onChange={(val) => handleFormChange('playStatus', val)}
                options={[
                  { key: 'Must Play', value: 'Must Play', label: 'MUST PLAY', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981' },
                  { key: 'Play If Time', value: 'Play If Time', label: 'PLAY IF TIME', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B' },
                  { key: 'Banned', value: 'Banned', label: 'BANNED', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444' },
                ]}
              />
            </DrawerField>
          </DrawerSection>

          {/* Section 3: Notes & Audio Link */}
          <DrawerSection title="DJ Notes & Audio Links" description="Specific cue timing, version requests, and streaming preview link">
            <DrawerField label="Audio Preview / Streaming URL" hint="Spotify, Apple Music, or MP3 preview link">
              <input
                type="text"
                placeholder="https://open.spotify.com/track/... or audio URL"
                value={formState.link || ''}
                onChange={(e) => handleFormChange('link', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  backgroundColor: 'var(--color-surface, #ffffff)',
                  color: 'var(--color-text, #1a202c)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '46px',
                }}
              />
            </DrawerField>

            <DrawerField label="DJ Cue Instructions & Notes" hint="e.g. Fade out at 2:30, cue when groom reaches altar, do not play club remix">
              <textarea
                rows={3}
                placeholder="e.g. Fade out at 2:30 when parents sit, cue as couple steps onto floor, acoustic version only..."
                value={formState.notes || ''}
                onChange={(e) => handleFormChange('notes', e.target.value)}
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

      {/* MODERN IN-APP DELETE SONG CONFIRMATION MODAL */}
      {songToDelete && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setSongToDelete(null)}
        >
          <div 
            style={{
              backgroundColor: 'var(--color-surface, #ffffff)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              border: '1px solid var(--color-border, #e2e8f0)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
              borderBottom: '1px solid var(--color-border, #e2e8f0)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-red, #dc2626)' }}>
                <AlertCircle size={18} />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-technical-mono, monospace)', fontWeight: 700 }}>
                  DELETE TRACK
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setSongToDelete(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-muted, #64748b)', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.925rem', margin: '0 0 1rem 0', color: 'var(--color-text, #0f172a)', lineHeight: 1.5 }}>
                Are you sure you want to remove <strong style={{ color: 'var(--color-red, #dc2626)' }}>"{songToDelete.title}"</strong> by {songToDelete.artist} from your playlist?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSongToDelete(null)}
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    color: 'var(--color-text, #0f172a)',
                    border: '1px solid var(--color-border, #cbd5e1)',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    minHeight: '38px',
                  }}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteSong}
                  disabled={isSyncing}
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-red, #dc2626)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1.25rem',
                    cursor: 'pointer',
                    minHeight: '38px',
                  }}
                >
                  {isSyncing ? 'DELETING...' : 'DELETE SONG'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <MobileFAB onClick={startAdd} label="Add Song" disabled={isSyncing} />
    </div>
  );
}
