'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Music, Play, Pause, Search, Heart, CheckCircle2, AlertCircle, RefreshCw, User, MessageSquare, Plus, Disc, Sparkles } from 'lucide-react';

interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  previewUrl?: string;
}

export default function GuestSongRequestPage() {
  const routeParams = useParams();
  const token = routeParams?.token as string;

  // Metadata State
  const [weddingName, setWeddingName] = useState<string>('Our Wedding');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(true);

  // Search & Track Selection State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ITunesTrack[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<ITunesTrack | null>(null);

  // Manual Custom Entry Fallback
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualArtist, setManualArtist] = useState<string>('');

  // Requester Info State
  const [requestedBy, setRequestedBy] = useState<string>('');
  const [dedicationNotes, setDedicationNotes] = useState<string>('');

  // Audio Preview Player State
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch Metadata & Verify Token
  useEffect(() => {
    if (!token) return;
    async function fetchMeta() {
      try {
        setIsLoadingMeta(true);
        const res = await fetch(`/api/request-song/${token}`);
        if (!res.ok) {
          setIsValidToken(false);
          setIsLoadingMeta(false);
          return;
        }
        const data = await res.json();
        setWeddingName(data.weddingName || 'Our Wedding');
        setIsValidToken(true);
      } catch (err) {
        console.error('Failed to verify token:', err);
        setIsValidToken(false);
      } finally {
        setIsLoadingMeta(false);
      }
    }
    fetchMeta();
  }, [token]);

  // iTunes Auto-Suggest Debounced Search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2 || isManualEntry) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=6`);
        const data = await res.json();
        if (data.results) {
          setSearchResults(data.results);
        }
      } catch (err) {
        console.error('iTunes search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, isManualEntry]);

  // Play / Pause 30s Audio Preview
  const togglePlayPreview = (previewUrl?: string) => {
    if (!previewUrl) return;

    if (playingPreviewUrl === previewUrl) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingPreviewUrl(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const newAudio = new Audio(previewUrl);
      audioRef.current = newAudio;
      newAudio.play().catch(e => console.error('Audio play error:', e));
      newAudio.onended = () => setPlayingPreviewUrl(null);
      setPlayingPreviewUrl(previewUrl);
    }
  };

  const handleSelectTrack = (track: ITunesTrack) => {
    setSelectedTrack(track);
    setSearchQuery(`${track.trackName} - ${track.artistName}`);
    setSearchResults([]);
    setErrorMessage('');
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const title = isManualEntry ? manualTitle.trim() : selectedTrack?.trackName || searchQuery.trim();
    const artist = isManualEntry ? manualArtist.trim() : selectedTrack?.artistName || '';

    if (!title) {
      setErrorMessage('Please enter or select a song title.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/request-song/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle: title,
          artist: artist || 'Various Artists',
          requestedBy: requestedBy.trim(),
          notes: dedicationNotes.trim(),
          audioPreviewUrl: selectedTrack?.previewUrl || '',
          albumArt: selectedTrack?.artworkUrl100 || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit song request');
      }

      setIsSuccess(true);
      if (audioRef.current) audioRef.current.pause();
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMessage(err.message || 'An error occurred while submitting your song request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedTrack(null);
    setSearchQuery('');
    setSearchResults([]);
    setIsManualEntry(false);
    setManualTitle('');
    setManualArtist('');
    setRequestedBy('');
    setDedicationNotes('');
    setIsSuccess(false);
    setErrorMessage('');
    if (audioRef.current) audioRef.current.pause();
  };

  if (isLoadingMeta) {
    return (
      <div style={styles.fullscreenCenter}>
        <RefreshCw size={36} className="spin" style={{ color: '#cda250', marginBottom: '1rem' }} />
        <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#9ca3af' }}>
          VERIFYING SONG REQUEST PORTAL...
        </p>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div style={styles.fullscreenCenter}>
        <div style={styles.errorCard}>
          <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
          <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#111827' }}>
            Invalid or Expired Link
          </h2>
          <p style={{ fontFamily: 'sans-serif', fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            This song request link is invalid or has expired. Please request a new link from the couple or DJ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Top Banner Header */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Disc size={20} style={{ color: '#cda250' }} />
          <span style={styles.weddingTag}>{weddingName.toUpperCase()} • LIVE DJ REQUESTS</span>
        </div>
        <h1 style={styles.mainHeading}>Request a Song for the DJ</h1>
        <p style={styles.subHeading}>
          Search for your favorite track and send your live request directly to the DJ booth!
        </p>
      </header>

      {/* Main Request Form Card */}
      <div style={styles.card}>
        {isSuccess ? (
          <div style={styles.successState}>
            <div style={styles.successIconWrapper}>
              <CheckCircle2 size={48} style={{ color: '#10b981' }} />
            </div>
            <h2 style={styles.successTitle}>Song Request Sent!</h2>
            <p style={styles.successMessage}>
              Your song request has been sent to <strong>{weddingName}’s</strong> DJ. Listen out for your track on the dance floor!
            </p>

            <button type="button" onClick={resetForm} style={styles.requestMoreBtn}>
              <Music size={18} style={{ marginRight: '0.4rem' }} /> REQUEST ANOTHER SONG
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitRequest} style={styles.form}>
            {/* Search or Manual Entry Toggle */}
            <div style={styles.toggleRow}>
              <button
                type="button"
                onClick={() => { setIsManualEntry(false); setSelectedTrack(null); }}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: !isManualEntry ? '#cda250' : 'transparent',
                  color: !isManualEntry ? '#0f172a' : '#94a3b8',
                }}
              >
                <Search size={14} style={{ marginRight: '0.35rem' }} /> SEARCH CATALOG
              </button>
              <button
                type="button"
                onClick={() => { setIsManualEntry(true); setSelectedTrack(null); }}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: isManualEntry ? '#cda250' : 'transparent',
                  color: isManualEntry ? '#0f172a' : '#94a3b8',
                }}
              >
                <Plus size={14} style={{ marginRight: '0.35rem' }} /> CUSTOM ENTRY
              </button>
            </div>

            {!isManualEntry ? (
              /* iTunes Search Input & Results */
              <div style={{ position: 'relative' }}>
                <label style={styles.inputLabel}>
                  <Search size={13} style={{ marginRight: '0.35rem' }} /> SEARCH SONG OR ARTIST
                </label>
                <div style={styles.searchWrapper}>
                  <input
                    type="text"
                    placeholder="Type song title or artist name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedTrack(null);
                    }}
                    style={styles.textInput}
                  />
                  {isSearching && (
                    <RefreshCw size={16} className="spin" style={{ position: 'absolute', right: '12px', top: '12px', color: '#cda250' }} />
                  )}
                </div>

                {/* Auto-suggest dropdown list */}
                {searchResults.length > 0 && !selectedTrack && (
                  <div style={styles.searchResultsDropdown}>
                    {searchResults.map((track) => (
                      <div
                        key={track.trackId}
                        style={styles.searchResultItem}
                        onClick={() => handleSelectTrack(track)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                          {track.artworkUrl100 ? (
                            <img src={track.artworkUrl100} alt={track.trackName} style={styles.trackThumb} />
                          ) : (
                            <div style={styles.trackThumbFallback}><Music size={16} /></div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                              {track.trackName}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                              {track.artistName}
                            </span>
                          </div>
                        </div>

                        {track.previewUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlayPreview(track.previewUrl);
                            }}
                            style={styles.previewBtn}
                            title="30s Audio Preview"
                          >
                            {playingPreviewUrl === track.previewUrl ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Track Preview Badge */}
                {selectedTrack && (
                  <div style={styles.selectedBadge}>
                    {selectedTrack.artworkUrl100 && (
                      <img src={selectedTrack.artworkUrl100} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                        {selectedTrack.trackName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#cda250', fontFamily: 'monospace' }}>
                        {selectedTrack.artistName}
                      </span>
                    </div>
                    {selectedTrack.previewUrl && (
                      <button
                        type="button"
                        onClick={() => togglePlayPreview(selectedTrack.previewUrl)}
                        style={styles.previewBtn}
                      >
                        {playingPreviewUrl === selectedTrack.previewUrl ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Custom Manual Entry Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.inputLabel}>SONG TITLE *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uptown Funk"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    style={styles.textInput}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.inputLabel}>ARTIST NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bruno Mars"
                    value={manualArtist}
                    onChange={(e) => setManualArtist(e.target.value)}
                    style={styles.textInput}
                  />
                </div>
              </div>
            )}

            {/* Requester Name & Dedication Notes */}
            <div style={styles.fieldGroup}>
              <label style={styles.inputLabel}>
                <User size={13} style={{ marginRight: '0.35rem' }} /> YOUR NAME (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="e.g. Cousin Alex"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                style={styles.textInput}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.inputLabel}>
                <MessageSquare size={13} style={{ marginRight: '0.35rem' }} /> SPECIAL DEDICATION / NOTE FOR DJ (OPTIONAL)
              </label>
              <textarea
                rows={2}
                placeholder="For the Bride & Groom's college reunion group!"
                value={dedicationNotes}
                onChange={(e) => setDedicationNotes(e.target.value)}
                style={styles.textareaInput}
              />
            </div>

            {/* Error Notice */}
            {errorMessage && (
              <div style={styles.errorNotice}>
                <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Song Request Trigger */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitBtn,
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} className="spin" style={{ marginRight: '0.5rem' }} />
                  SENDING TO DJ...
                </>
              ) : (
                <>
                  <Sparkles size={18} style={{ marginRight: '0.5rem' }} />
                  SEND SONG REQUEST TO DJ
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer Branding */}
      <footer style={styles.footer}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#6b7280' }}>
          POWERED BY SHEET2VOW • LIVE DJ SYNC
        </span>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fullscreenCenter: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: '1.5rem',
  },
  errorCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    maxWidth: '420px',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
  },
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    maxWidth: '600px',
    marginBottom: '1.5rem',
  },
  weddingTag: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#cda250',
    letterSpacing: '0.1em',
  },
  mainHeading: {
    fontFamily: 'serif',
    fontSize: '2rem',
    margin: '0.25rem 0 0.5rem 0',
    color: '#ffffff',
  },
  subHeading: {
    fontFamily: 'sans-serif',
    fontSize: '0.875rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.4,
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '560px',
    padding: '1.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
  },
  toggleRow: {
    display: 'flex',
    backgroundColor: '#0f172a',
    padding: '4px',
    borderRadius: '8px',
    gap: '4px',
  },
  toggleBtn: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    fontWeight: 700,
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  inputLabel: {
    fontFamily: 'monospace',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
  },
  searchWrapper: {
    position: 'relative',
  },
  textInput: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '0.85rem',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
  },
  textareaInput: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '0.85rem',
    fontFamily: 'sans-serif',
    resize: 'none',
    boxSizing: 'border-box',
  },
  searchResultsDropdown: {
    marginTop: '0.35rem',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    maxHeight: '220px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  searchResultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 0.75rem',
    borderBottom: '1px solid #1e293b',
    cursor: 'pointer',
  },
  trackThumb: {
    width: '36px',
    height: '36px',
    borderRadius: '4px',
    objectFit: 'cover',
  },
  trackThumbFallback: {
    width: '36px',
    height: '36px',
    borderRadius: '4px',
    backgroundColor: '#334155',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#94a3b8',
  },
  previewBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#cda250',
    color: '#0f172a',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  selectedBadge: {
    marginTop: '0.5rem',
    padding: '0.65rem',
    backgroundColor: 'rgba(205, 162, 80, 0.15)',
    border: '1px solid #cda250',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  errorNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    fontSize: '0.75rem',
    color: '#fca5a5',
  },
  submitBtn: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    fontWeight: 700,
    backgroundColor: '#cda250',
    color: '#0f172a',
    border: 'none',
    borderRadius: '10px',
    padding: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '0.5rem',
  },
  successState: {
    textAlign: 'center',
    padding: '1rem 0',
  },
  successIconWrapper: {
    display: 'inline-flex',
    padding: '1rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    marginBottom: '1rem',
  },
  successTitle: {
    fontFamily: 'serif',
    fontSize: '1.75rem',
    margin: '0 0 0.5rem 0',
    color: '#ffffff',
  },
  successMessage: {
    fontFamily: 'sans-serif',
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
  requestMoreBtn: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    fontWeight: 700,
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '0.75rem 1.25rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
  },
};
