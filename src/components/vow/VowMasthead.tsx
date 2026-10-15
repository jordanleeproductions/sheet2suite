'use client';

import React from 'react';

export interface VowMastheadProps {
  weddingName?: string;
  weddingDate?: string;
  locationDetails?: string;
  countdown: string;
  activeTab: string;
  isMobile?: boolean;
}

const TAB_TITLES: Record<string, string> = {
  home: 'EXECUTIVE SUMMARY',
  metrics: 'EXECUTIVE SUMMARY',
  guests: 'GUEST REGISTRY & CATERING',
  menu: 'CATERING & MENU SETUP',
  tables: 'SEATING & FLOORPLAN PLANNER',
  budget: 'FINANCIAL LEDGER & EXPENSES',
  schedule: 'DAY-OF SCHEDULE & TIMELINE',
  vendors: 'VENDOR DIRECTORY & CONTRACTS',
  tasks: 'PLANNING CHECKLIST & MILESTONES',
  music: 'MUSIC CATALOG & DJ PLAYLISTS',
  photos: 'PHOTOGRAPHY SHOT LIST',
  thanks: 'THANK YOU NOTES & GIFTS',
};

export default function VowMasthead({
  weddingName,
  weddingDate,
  locationDetails,
  countdown,
  activeTab,
  isMobile = false,
}: VowMastheadProps) {
  const isDataDense = activeTab !== 'home' && activeTab !== 'metrics';
  const displayTitle = (weddingName && weddingName.trim()) ? weddingName.trim().toUpperCase() : 'OUR WEDDING';
  const activeTabTitle = TAB_TITLES[activeTab] || activeTab.toUpperCase();

  // Compressed Single-Line Horizontal Masthead for Data-Dense Screens
  if (isDataDense) {
    return (
      <div
        className="vow-masthead-compressed"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem 1rem',
          padding: isMobile ? '0.35rem 0.65rem' : '0.45rem 0.85rem',
          backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
          borderBottom: '1px solid var(--color-border, #E2E8F0)',
          borderTop: '1px solid var(--color-border, #E2E8F0)',
          marginBottom: '1rem',
          borderRadius: '2px',
        }}
      >
        {/* Left: Editorial Title + Tab Identifier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-editorial-serif, serif)',
              fontSize: isMobile ? '0.85rem' : '0.98rem',
              fontWeight: 700,
              color: 'var(--color-primary, #0F172A)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayTitle}
          </span>
          <span style={{ color: 'var(--color-border, #CBD5E1)', fontSize: '0.75rem' }}>/</span>
          <span
            style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: isMobile ? '0.62rem' : '0.7rem',
              fontWeight: 600,
              color: 'var(--color-muted, #64748B)',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeTabTitle}
          </span>
        </div>

        {/* Right: Technical Monospace Relative Date / Countdown Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {weddingDate && (
            <span
              style={{
                fontFamily: 'var(--font-technical-mono, monospace)',
                fontSize: '0.65rem',
                color: 'var(--color-muted, #64748B)',
                letterSpacing: '0.02em',
              }}
            >
              {weddingDate}
            </span>
          )}
          <span
            className="ceremonial-milestone"
            style={{
              fontFamily: 'var(--font-technical-mono, monospace)',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              padding: '0.15rem 0.45rem',
              borderRadius: '2px',
              border: '1px solid var(--color-border, #E2E8F0)',
              backgroundColor: 'var(--color-surface, #FFFFFF)',
              color: 'var(--color-text, #0F172A)',
            }}
          >
            {countdown}
          </span>
        </div>
      </div>
    );
  }

  // Centered Editorial Masthead Mode for Executive Summary / Overview
  return (
    <div
      className="vow-masthead-centered"
      style={{
        textAlign: 'center',
        paddingTop: isMobile ? '0.75rem' : '1.25rem',
        paddingBottom: isMobile ? '0.75rem' : '1.25rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--color-border, #E2E8F0)',
        position: 'relative',
      }}
    >
      {/* Subtle Top Metadata Dateline */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '0.35rem',
          fontFamily: 'var(--font-technical-mono, monospace)',
          fontSize: '0.65rem',
          fontWeight: 600,
          color: 'var(--color-muted, #64748B)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <span>OFFICIAL REGISTRY</span>
        <span>•</span>
        <span>{weddingDate || 'DATE TBD'}</span>
        {locationDetails && (
          <>
            <span>•</span>
            <span>{locationDetails}</span>
          </>
        )}
      </div>

      {/* Main Masthead Title in Editorial Serif */}
      <h1
        className="wedding-masthead-title"
        style={{
          fontFamily: 'var(--font-editorial-serif, serif)',
          fontSize: isMobile ? '1.65rem' : '2.35rem',
          fontWeight: 700,
          color: 'var(--color-primary, #0F172A)',
          letterSpacing: '-0.025em',
          margin: 0,
          lineHeight: '1.15',
        }}
      >
        {displayTitle}
      </h1>

      {/* Relative Date / Countdown Indicator in Monospace */}
      <div
        style={{
          marginTop: '0.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
        }}
      >
        <span
          className="ceremonial-milestone"
          style={{
            fontFamily: 'var(--font-technical-mono, monospace)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '0.2rem 0.6rem',
            borderRadius: '2px',
            backgroundColor: 'var(--color-bg-pane, #F8FAFC)',
            border: '1px solid var(--color-border, #E2E8F0)',
            color: 'var(--color-text, #0F172A)',
          }}
        >
          {countdown}
        </span>
      </div>
    </div>
  );
}
