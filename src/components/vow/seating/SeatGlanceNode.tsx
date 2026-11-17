'use client';

import React from 'react';
import { Guest } from '@/types/wedding';
import { categorizeMeal } from './CateringDossierModal';

interface SeatGlanceNodeProps {
  guest?: Guest;
  seatNum: number;
  shape?: 'circle' | 'rect';
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isPartyHighlighted?: boolean;
  isSwappingSource?: boolean;
  isSwapModeActive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function SeatGlanceNode({
  guest,
  seatNum,
  shape = 'circle',
  onClick,
  onMouseEnter,
  onMouseLeave,
  isPartyHighlighted = false,
  isSwappingSource = false,
  isSwapModeActive = false,
  style = {},
  className = '',
}: SeatGlanceNodeProps) {
  const hasGuest = Boolean(guest);
  const initials = guest ? `${guest.firstName?.[0] || ''}${guest.lastName?.[0] || ''}`.toUpperCase() : '';

  const mealInfo = guest?.mealChoice ? categorizeMeal(guest.mealChoice) : null;
  const hasDietaryAlert = Boolean(
    guest?.dietaryRestrictions &&
    guest.dietaryRestrictions.trim() !== '' &&
    guest.dietaryRestrictions.toLowerCase() !== 'none' &&
    guest.dietaryRestrictions.toLowerCase() !== 'n/a' &&
    guest.dietaryRestrictions.toLowerCase() !== 'no'
  );

  // Dynamic Tooltip
  const tooltipText = hasGuest
    ? [
        `Seat #${seatNum}: ${guest?.firstName} ${guest?.lastName} (${guest?.rsvpStatus})`,
        guest?.partyGroup ? `Party: ${guest.partyGroup}` : null,
        guest?.mealChoice ? `Meal: ${guest.mealChoice}` : null,
        hasDietaryAlert ? `⚠️ Dietary Alert: ${guest?.dietaryRestrictions}` : null,
        isSwapModeActive ? (isSwappingSource ? 'Source guest (Click seat to cancel)' : 'Click to swap with this guest') : null,
      ]
        .filter(Boolean)
        .join(' • ')
    : `Seat #${seatNum}: ${isSwapModeActive ? 'Click to move guest to this seat' : 'Empty Seat (Click to assign)'}`;

  // Dynamic Ring & Shadow
  let dynamicBoxShadow = 'var(--box-shadow-subtle, 0 1px 3px rgba(0,0,0,0.08))';
  let dynamicBorderColor = 'var(--color-primary, #0f172a)';
  let dynamicTransform = style.transform || '';

  if (isSwappingSource) {
    dynamicBoxShadow = '0 0 0 3px #10B981, 0 0 12px rgba(16, 185, 129, 0.45)';
    dynamicBorderColor = '#10B981';
  } else if (isSwapModeActive) {
    dynamicBoxShadow = '0 0 0 2px #3B82F6, 0 0 8px rgba(59, 130, 246, 0.35)';
    dynamicBorderColor = '#3B82F6';
  } else if (isPartyHighlighted) {
    dynamicBoxShadow = '0 0 0 3px #F59E0B, 0 0 10px rgba(245, 158, 11, 0.45)';
    dynamicBorderColor = '#F59E0B';
  }

  const baseNodeStyles: React.CSSProperties = {
    position: 'relative',
    width: '44px',
    height: '44px',
    borderRadius: shape === 'circle' ? '50%' : '6px',
    backgroundColor: hasGuest ? 'var(--color-surface, #ffffff)' : 'var(--color-bg, #f8fafc)',
    border: `2px solid ${dynamicBorderColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    boxShadow: dynamicBoxShadow,
    userSelect: 'none',
    ...style,
    transform: dynamicTransform,
  };

  return (
    <div
      style={baseNodeStyles}
      className={`seat-glance-node group ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={tooltipText}
    >
      {hasGuest ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: shape === 'circle' ? '50%' : '4px',
            backgroundColor: isSwappingSource
              ? '#10B981'
              : isPartyHighlighted
              ? '#D97706'
              : 'var(--color-primary, #0f172a)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Guest Initials */}
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            {initials || '?'}
          </span>

          {/* Top-Right Allergy Alert Pip */}
          {hasDietaryAlert && (
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                border: '1.5px solid #ffffff',
                zIndex: 2,
              }}
              title={`Allergy Alert: ${guest?.dietaryRestrictions}`}
            >
              !
            </span>
          )}

          {/* Bottom-Right Meal Choice Pip */}
          {mealInfo && mealInfo.category !== 'Not Selected' && (
            <span
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: mealInfo.color,
                color: '#ffffff',
                fontSize: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                border: '1.5px solid #ffffff',
                zIndex: 2,
              }}
              title={`Meal: ${mealInfo.category} (${guest?.mealChoice})`}
            >
              <span style={{ fontSize: '8px' }}>{mealInfo.emoji}</span>
            </span>
          )}

          {/* Swap Indicator Overlay (When this is the source guest being swapped) */}
          {isSwappingSource && (
            <span
              style={{
                position: 'absolute',
                top: '-6px',
                left: '-6px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #ffffff',
                zIndex: 3,
              }}
            >
              ⇄
            </span>
          )}
        </div>
      ) : (
        <span
          style={{
            fontSize: isSwapModeActive ? '0.75rem' : '1rem',
            color: isSwapModeActive ? '#3B82F6' : 'var(--color-muted, #94a3b8)',
            fontWeight: 700,
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {isSwapModeActive ? 'SWAP' : '+'}
        </span>
      )}
    </div>
  );
}
