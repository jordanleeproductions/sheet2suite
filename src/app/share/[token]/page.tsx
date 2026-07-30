'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Song, PhotoShot, ScheduleEvent } from '@/lib/sheets/types';
import { 
  Music, 
  Camera, 
  Clock, 
  Utensils, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  Search,
  Filter,
  Printer,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';

interface CateringSummary {
  attendingCount: number;
  dietarySummary: Array<{ restriction: string; count: number }>;
  mealChoicesSummary?: Array<{ meal: string; count: number }>;
  dietaryGuestList?: Array<{ name: string; restriction: string; mealChoice: string; table: string }>;
  tableSummary: Array<{ tableName: string; count: number }>;
}

interface ShareResponseData {
  music?: Song[];
  photos?: PhotoShot[];
  schedule?: ScheduleEvent[];
  catering?: CateringSummary;
}

export default function VendorSharePage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weddingName, setWeddingName] = useState<string>('Wedding Portal');
  const [scope, setScope] = useState<string>('vendor_hub');
  const [data, setData] = useState<ShareResponseData>({});

  // Active Tab for Hub Mode
  const [activeTab, setActiveTab] = useState<'timeline' | 'music' | 'photos' | 'catering'>('timeline');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [searchTerm, setSearchTerm] = useState('');

  // Music Page Quick Filter & Sorting
  const [musicFilter, setMusicFilter] = useState<'all' | 'requested' | 'banned'>('all');

  // Catering Dietary Restriction Interactive Drawer Toggle
  const [selectedRestriction, setSelectedRestriction] = useState<string | null>(null);

  // Fetch Vendor Data
  useEffect(() => {
    if (!token) return;

    async function fetchVendorData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/share/${token}`);
        const result = await res.json();

        if (!result.success) {
          setError(result.error || 'Invalid or expired share token.');
          return;
        }

        setWeddingName(result.weddingName || 'Wedding Portal');
        setScope(result.scope || 'vendor_hub');
        setData(result.data || {});

        // Set default active tab based on scope
        if (result.scope === 'music') setActiveTab('music');
        else if (result.scope === 'photos') setActiveTab('photos');
        else if (result.scope === 'timeline') setActiveTab('timeline');
        else if (result.scope === 'catering') setActiveTab('catering');
        else setActiveTab('timeline');

      } catch (err: any) {
        console.error('Error loading vendor share portal:', err);
        setError('Network error loading vendor portal. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchVendorData();
  }, [token]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0d1b2a' : '#f8fafc';
  const surfaceColor = isDark ? '#1b263b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';

  if (loading) {
    return (
      <div style={{ ...styles.fullScreen, backgroundColor: bgColor, color: textColor }}>
        <RefreshCw className="spin" size={36} style={{ color: 'var(--color-primary, #13AA52)', marginBottom: '1rem' }} />
        <h3 style={{ fontFamily: 'sans-serif', margin: 0 }}>Loading Vendor Portal...</h3>
        <p style={{ color: mutedColor, fontSize: '0.85rem' }}>Verifying secure token signature</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.fullScreen, backgroundColor: bgColor, color: textColor, padding: '1.5rem' }}>
        <div style={{ ...styles.errorCard, backgroundColor: surfaceColor, borderColor: '#ef4444' }}>
          <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '0.75rem' }} />
          <h2 style={{ margin: 0, fontFamily: 'sans-serif', fontSize: '1.25rem' }}>Access Denied or Link Expired</h2>
          <p style={{ color: mutedColor, fontSize: '0.85rem', margin: '0.5rem 0 1rem 0', lineHeight: 1.5 }}>
            {error}
          </p>
          <span style={{ fontSize: '0.75rem', color: mutedColor }}>
            Please request an updated share link from the wedding couple or event coordinator.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor, transition: 'background-color 0.2s' }}>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print-hide, nav, button {
            display: none !important;
          }
          body, div, main {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .print-card {
            border: 1px solid #cccccc !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Top Mobile Bar */}
      <header style={{ ...styles.header, backgroundColor: surfaceColor, borderBottomColor: borderColor }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ ...styles.badge, backgroundColor: '#13AA52', color: '#ffffff' }}>VENDOR PORTAL</span>
            <span style={{ ...styles.badge, backgroundColor: surfaceColor, color: mutedColor, border: `1px solid ${borderColor}` }}>
              READ-ONLY VIEW
            </span>
          </div>
          <h1 style={{ ...styles.weddingTitle, color: textColor }}>{weddingName.toUpperCase()}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="print-hide">
          <button 
            onClick={() => window.print()} 
            style={{ ...styles.themeBtn, backgroundColor: '#13AA52', color: '#ffffff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
            title="Print or Export PDF"
          >
            <Printer size={16} /> PRINT / EXPORT PDF
          </button>

          <button 
            onClick={toggleTheme} 
            style={{ ...styles.themeBtn, backgroundColor: bgColor, color: textColor, borderColor: borderColor }}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Navigation Tabs (If Vendor Hub) */}
      {scope === 'vendor_hub' && (
        <nav style={{ ...styles.nav, backgroundColor: surfaceColor, borderBottomColor: borderColor }}>
          {[
            { id: 'timeline', label: 'TIMELINE', icon: Clock, count: data.schedule?.length },
            { id: 'music', label: 'MUSIC', icon: Music, count: data.music?.length },
            { id: 'photos', label: 'PHOTOS', icon: Camera, count: data.photos?.length },
            { id: 'catering', label: 'CATERING', icon: Utensils, count: data.catering?.attendingCount },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                style={{
                  ...styles.tabBtn,
                  color: isActive ? '#13AA52' : mutedColor,
                  borderBottomColor: isActive ? '#13AA52' : 'transparent',
                  fontWeight: isActive ? 700 : 400,
                }}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && <small style={{ opacity: 0.7 }}>({tab.count})</small>}
              </button>
            );
          })}
        </nav>
      )}

      {/* Main Vendor Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '1.25rem' }}>

        {/* TIMELINE VIEW */}
        {(activeTab === 'timeline' || scope === 'timeline') && data.schedule && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={{ ...styles.sectionTitle, color: textColor }}>Day-Of Schedule Itinerary</h2>
              <span style={{ fontSize: '0.8rem', color: mutedColor }}>{data.schedule.length} Events</span>
            </div>

            <div style={styles.listContainer}>
              {data.schedule.map((item, idx) => (
                <div key={idx} style={{ ...styles.card, backgroundColor: surfaceColor, borderColor }}>
                  <div style={styles.timeBadge}>
                    <Clock size={14} style={{ marginRight: '4px', color: '#13AA52' }} />
                    {item.startTime} {item.endTime ? `- ${item.endTime}` : ''}
                  </div>

                  <h3 style={{ ...styles.itemTitle, color: textColor }}>{item.eventMoment}</h3>

                  {item.location && (
                    <div style={{ fontSize: '0.8rem', color: mutedColor, marginTop: '0.2rem' }}>
                      📍 Location: {item.location}
                    </div>
                  )}

                  {item.responsibility && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#13AA52', marginTop: '0.35rem' }}>
                      👤 Assigned: {item.responsibility}
                    </div>
                  )}

                  {item.notes && (
                    <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: mutedColor, margin: '0.5rem 0 0 0', borderTop: `1px dashed ${borderColor}`, paddingTop: '0.35rem' }}>
                      💡 {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MUSIC PLAYLIST VIEW */}
        {(activeTab === 'music' || scope === 'music') && data.music && (() => {
          const filteredMusic = data.music.filter(song => {
            const isBanned = song.listType === 'Do Not Play' || song.priority === 'Banned';
            if (musicFilter === 'requested') return !isBanned;
            if (musicFilter === 'banned') return isBanned;
            return true;
          }).sort((a, b) => {
            const aBanned = a.listType === 'Do Not Play' || a.priority === 'Banned';
            const bBanned = b.listType === 'Do Not Play' || b.priority === 'Banned';
            if (aBanned && !bBanned) return 1; // Sort banned to bottom
            if (!aBanned && bBanned) return -1;
            return 0;
          });

          return (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={{ ...styles.sectionTitle, color: textColor }}>Wedding Music & Track Preferences</h2>
                <span style={{ fontSize: '0.8rem', color: mutedColor }}>{filteredMusic.length} Tracks</span>
              </div>

              {/* Quick Filter Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0', flexWrap: 'wrap' }} className="print-hide">
                {[
                  { id: 'all', label: 'ALL SONGS' },
                  { id: 'requested', label: '🎵 REQUESTED SONGS' },
                  { id: 'banned', label: '🚫 BANNED MUSIC' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setMusicFilter(f.id as any)}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: '0.75rem',
                      fontWeight: musicFilter === f.id ? 700 : 400,
                      padding: '0.4rem 0.75rem',
                      borderRadius: '4px',
                      border: `1px solid ${musicFilter === f.id ? '#13AA52' : borderColor}`,
                      backgroundColor: musicFilter === f.id ? '#13AA52' : surfaceColor,
                      color: musicFilter === f.id ? '#ffffff' : textColor,
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div style={styles.listContainer}>
                {filteredMusic.map((song, idx) => {
                  const isBanned = song.listType === 'Do Not Play' || song.priority === 'Banned';
                  return (
                    <div 
                      key={idx} 
                      className="print-card"
                      style={{ 
                        ...styles.card, 
                        backgroundColor: surfaceColor, 
                        borderColor: isBanned ? '#ef4444' : borderColor 
                      }}
                    >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: isBanned ? '#ef4444' : '#13AA52',
                          color: '#ffffff',
                          display: 'inline-block',
                          marginBottom: '0.35rem'
                        }}>
                          {song.listType || 'Play List'}
                        </span>

                        <h3 style={{ ...styles.itemTitle, color: isBanned ? '#ef4444' : textColor }}>
                          "{song.title}"
                        </h3>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: mutedColor }}>
                          by {song.artist}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <a
                          href={`https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ ...styles.linkBtn, borderColor }}
                        >
                          Spotify
                        </a>
                      </div>
                    </div>

                    {song.notes && (
                      <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: mutedColor, margin: '0.5rem 0 0 0', borderTop: `1px dashed ${borderColor}`, paddingTop: '0.35rem' }}>
                        💡 DJ Note: {song.notes}
                      </p>
                    )}
                  </div>
                );
              </div>
            </div>
          );
        })()}

        {/* PHOTO SHOT LIST VIEW */}
        {(activeTab === 'photos' || scope === 'photos') && data.photos && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={{ ...styles.sectionTitle, color: textColor }}>Required Photography Shot List</h2>
              <span style={{ fontSize: '0.8rem', color: mutedColor }}>{data.photos.length} Required Shots</span>
            </div>

            <div style={styles.listContainer}>
              {data.photos.map((photo, idx) => (
                <div key={idx} style={{ ...styles.card, backgroundColor: surfaceColor, borderColor }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: borderColor, color: textColor }}>
                          {photo.shotId}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: photo.priority === 'Must Have' ? '#f59e0b' : '#3b82f6', color: '#ffffff' }}>
                          {photo.priority || 'Must Have'}
                        </span>
                      </div>

                      <h3 style={{ ...styles.itemTitle, color: textColor }}>{photo.description}</h3>
                    </div>

                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: photo.status === 'Captured' ? '#13AA52' : mutedColor }}>
                      {photo.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: mutedColor, marginTop: '0.4rem' }}>
                    {photo.location && <span>📍 {photo.location}</span>}
                    {photo.shotTime && <span>⏰ {photo.shotTime}</span>}
                    {photo.people && <span>👥 {photo.people}</span>}
                  </div>

                  {photo.notes && (
                    <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: mutedColor, margin: '0.5rem 0 0 0', borderTop: `1px dashed ${borderColor}`, paddingTop: '0.35rem' }}>
                      💡 Posing/Lighting: {photo.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATERING & VENUE VIEW */}
        {(activeTab === 'catering' || scope === 'catering') && data.catering && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={{ ...styles.sectionTitle, color: textColor }}>Catering & Venue Manager Overview</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="print-card" style={{ ...styles.card, backgroundColor: surfaceColor, borderColor }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: mutedColor }}>TOTAL ATTENDING HEADCOUNT</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#13AA52' }}>
                  {data.catering.attendingCount} Attending Guests
                </span>
              </div>
            </div>

            {/* Guest Meal Choice Totals Summary */}
            {data.catering.mealChoicesSummary && data.catering.mealChoicesSummary.length > 0 && (
              <div className="print-card" style={{ ...styles.card, backgroundColor: surfaceColor, borderColor, marginBottom: '1.25rem' }}>
                <h3 style={{ ...styles.itemTitle, color: textColor, marginBottom: '0.75rem' }}>
                  🍽️ Guest Meal Choice Totals Breakdown
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {data.catering.mealChoicesSummary.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.625rem 0.75rem', backgroundColor: bgColor, borderRadius: '4px', border: `1px solid ${borderColor}` }}>
                      <span style={{ fontWeight: 600, color: textColor }}>{item.meal}</span>
                      <strong style={{ color: '#13AA52', fontFamily: 'inherit', fontSize: '0.95rem' }}>{item.count} Meals</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Dietary Restrictions Breakdown */}
            <div className="print-card" style={{ ...styles.card, backgroundColor: surfaceColor, borderColor, marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ ...styles.itemTitle, color: textColor, margin: 0 }}>
                  ⚠️ Dietary Restrictions Summary
                </h3>
                <span style={{ fontSize: '0.7rem', color: mutedColor }}>Click any restriction to view guest names</span>
              </div>

              {data.catering.dietarySummary.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data.catering.dietarySummary.map((item, idx) => {
                    const isExpanded = selectedRestriction === item.restriction;
                    const matchingGuests = (data.catering?.dietaryGuestList || []).filter(g => g.restriction === item.restriction);

                    return (
                      <div key={idx} style={{ border: `1px solid ${borderColor}`, borderRadius: '4px', overflow: 'hidden' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedRestriction(isExpanded ? null : item.restriction)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            padding: '0.625rem 0.75rem',
                            backgroundColor: isExpanded ? 'rgba(19, 170, 82, 0.1)' : bgColor,
                            border: 'none',
                            color: textColor,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700 }}>{item.restriction}</span>
                            <span style={{ fontSize: '0.7rem', color: mutedColor }}>({matchingGuests.length} Guests)</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: '#13AA52' }}>{item.count} Guests</strong>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {/* Expanded Guest List Drawer */}
                        {isExpanded && (
                          <div style={{ padding: '0.75rem 1rem', backgroundColor: surfaceColor, borderTop: `1px solid ${borderColor}` }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: mutedColor, margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                              Guests with {item.restriction}:
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              {matchingGuests.map((g, gIdx) => (
                                <div key={gIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.35rem 0', borderBottom: gIdx < matchingGuests.length - 1 ? `1px dashed ${borderColor}` : 'none' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <UserCheck size={14} style={{ color: '#13AA52' }} />
                                    <strong style={{ color: textColor }}>{g.name}</strong>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: mutedColor }}>
                                    <span>🍽️ {g.mealChoice}</span>
                                    <span>📍 {g.table}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: mutedColor }}>No special dietary restrictions recorded.</span>
              )}
            </div>

            {/* Seating Table Breakdown */}
            <div className="print-card" style={{ ...styles.card, backgroundColor: surfaceColor, borderColor }}>
              <h3 style={{ ...styles.itemTitle, color: textColor, marginBottom: '0.75rem' }}>Table Seating Capacity Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                {data.catering.tableSummary.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.5rem 0.75rem', backgroundColor: bgColor, borderRadius: '4px', border: `1px solid ${borderColor}` }}>
                    <span>{item.tableName}</span>
                    <strong>{item.count} Seats</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fullScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  errorCard: {
    border: '2px solid #ef4444',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '440px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  header: {
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid',
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  weddingTitle: {
    fontFamily: 'serif',
    fontSize: '1.25rem',
    margin: '0.25rem 0 0 0',
  },
  themeBtn: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '0.4rem 0.6rem',
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    borderBottom: '1px solid',
    padding: '0 1rem',
    overflowX: 'auto',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0.75rem 0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: '1.15rem',
    margin: 0,
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  card: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  timeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    color: '#13AA52',
  },
  itemTitle: {
    fontFamily: 'sans-serif',
    fontSize: '0.95rem',
    fontWeight: 700,
    margin: 0,
  },
  linkBtn: {
    fontSize: '0.7rem',
    fontFamily: 'monospace',
    padding: '0.2rem 0.5rem',
    border: '1px solid',
    borderRadius: '4px',
    textDecoration: 'none',
    color: 'inherit',
  },
};
