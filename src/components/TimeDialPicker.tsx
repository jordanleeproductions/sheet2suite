'use client';

import React, { useRef } from 'react';
import { Clock } from 'lucide-react';
import { parseTimeOrSerial } from '@/lib/currency';

interface TimeDialPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  referenceStartTime?: string; // Optional: when provided (e.g. for End Time), enables +30m, +1h quick duration chips
}

// Convert 12h or raw time string (e.g. "04:30 PM", "4:30:00 PM", 0.58333) to 24h "HH:mm" for native <input type="time">
export function time12To24(timeStr: string | undefined | null): string {
  if (!timeStr) return '';
  return parseTimeOrSerial(timeStr, '24h');
}

// Convert 24h or raw time to standard 12h "h:mm A" (e.g. "16:30" -> "4:30 PM", "08:00" -> "8:00 AM")
export function time24To12(time24: string | undefined | null): string {
  if (!time24) return '';
  return parseTimeOrSerial(time24, '12h');
}

// Helper to add minutes to a 12h time string
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const t24 = time12To24(timeStr);
  if (!t24) return '';
  const [h, m] = t24.split(':').map(Number);
  let totalMin = h * 60 + m + minutesToAdd;
  totalMin = (totalMin + 1440) % 1440; // 24h wraparound
  const newH = Math.floor(totalMin / 60);
  const newM = totalMin % 60;
  const paddedH = newH < 10 ? `0${newH}` : `${newH}`;
  const paddedM = newM < 10 ? `0${newM}` : `${newM}`;
  return time24To12(`${paddedH}:${paddedM}`);
}

export default function TimeDialPicker({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'e.g. 4:00 PM',
  referenceStartTime,
}: TimeDialPickerProps) {
  const nativeInputRef = useRef<HTMLInputElement>(null);

  const native24Value = time12To24(value);

  // Trigger the native mobile/desktop time dial
  const handleOpenNativePicker = () => {
    if (!nativeInputRef.current) return;
    try {
      if (typeof (nativeInputRef.current as any).showPicker === 'function') {
        (nativeInputRef.current as any).showPicker();
      } else {
        nativeInputRef.current.focus();
        nativeInputRef.current.click();
      }
    } catch {
      nativeInputRef.current.focus();
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      onChange('');
      return;
    }
    onChange(time24To12(val));
  };

  // Toggle AM / PM
  const handleToggleMeridiem = (target: 'AM' | 'PM') => {
    if (!value) {
      onChange(target === 'AM' ? '9:00 AM' : '2:00 PM');
      return;
    }
    const currentT24 = time12To24(value);
    if (!currentT24) {
      onChange(`12:00 ${target}`);
      return;
    }
    const [hStr, mStr] = currentT24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';

    if (target === 'AM' && h >= 12) {
      h -= 12;
    } else if (target === 'PM' && h < 12) {
      h += 12;
    }
    const paddedH = h < 10 ? `0${h}` : `${h}`;
    onChange(time24To12(`${paddedH}:${m}`));
  };

  // Quick set minutes (:00, :15, :30, :45)
  const handleSetMinute = (minStr: string) => {
    if (!value) {
      onChange(`12:${minStr} PM`);
      return;
    }
    const currentT24 = time12To24(value);
    if (!currentT24) {
      onChange(`12:${minStr} PM`);
      return;
    }
    const [hStr] = currentT24.split(':');
    onChange(time24To12(`${hStr}:${minStr}`));
  };

  // Determine active meridiem
  const isPM = (value || '').toUpperCase().includes('PM');
  const isAM = (value || '').toUpperCase().includes('AM');

  // Determine active minute preset
  const currentMinute = (value || '').match(/:(\d{2})/)?.[1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={styles.label}>
        {label} {required && <span style={{ color: 'var(--color-primary)' }}>*</span>}
      </label>

      {/* Main input container with Clock Dial button and AM/PM switch */}
      <div style={styles.inputRow}>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              // Standardize formatting on blur if valid
              if (value.trim()) {
                const t24 = time12To24(value);
                if (t24) onChange(time24To12(t24));
              }
            }}
            style={styles.textInput}
          />

          {/* Hidden native time input synchronized for OS dial picker */}
          <input
            ref={nativeInputRef}
            type="time"
            value={native24Value}
            onChange={handleNativeChange}
            tabIndex={-1}
            aria-hidden="true"
            style={styles.hiddenNativeInput}
          />

          {/* Trigger button for Mobile Time Dial */}
          <button
            type="button"
            onClick={handleOpenNativePicker}
            title="Open Time Dial Picker"
            style={styles.dialBtn}
          >
            <Clock size={16} />
            <span style={styles.dialBtnText}>DIAL</span>
          </button>
        </div>

        {/* 1-Tap AM / PM Switch */}
        <div style={styles.meridiemGroup}>
          <button
            type="button"
            onClick={() => handleToggleMeridiem('AM')}
            style={{
              ...styles.meridiemBtn,
              backgroundColor: isAM ? 'var(--color-primary)' : 'var(--color-surface, #ffffff)',
              color: isAM ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
              borderColor: isAM ? 'var(--color-primary)' : 'var(--color-muted)',
              fontWeight: isAM ? 700 : 500,
            }}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handleToggleMeridiem('PM')}
            style={{
              ...styles.meridiemBtn,
              backgroundColor: isPM ? 'var(--color-primary)' : 'var(--color-surface, #ffffff)',
              color: isPM ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
              borderColor: isPM ? 'var(--color-primary)' : 'var(--color-muted)',
              fontWeight: isPM ? 700 : 500,
            }}
          >
            PM
          </button>
        </div>
      </div>

      {/* Quick 15-Minute Rounding Chips */}
      <div style={styles.chipsRow}>
        <span style={styles.chipsLabel}>MIN:</span>
        {['00', '15', '30', '45'].map((min) => {
          const isSelected = currentMinute === min;
          return (
            <button
              key={min}
              type="button"
              onClick={() => handleSetMinute(min)}
              style={{
                ...styles.minuteChip,
                backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface, #ffffff)',
                color: isSelected ? 'var(--color-on-primary, #ffffff)' : 'var(--color-text)',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                fontWeight: isSelected ? 700 : 500,
              }}
            >
              :{min}
            </button>
          );
        })}

        {/* Smart duration offsets if reference start time is provided */}
        {referenceStartTime && (
          <div style={styles.durationOffsetsGroup}>
            <span style={styles.chipsLabel}>+DURATION:</span>
            {[
              { label: '+30m', min: 30 },
              { label: '+45m', min: 45 },
              { label: '+1h', min: 60 },
              { label: '+1.5h', min: 90 },
              { label: '+2h', min: 120 },
            ].map(({ label: durLabel, min }) => (
              <button
                key={durLabel}
                type="button"
                onClick={() => {
                  const calculated = addMinutesToTime(referenceStartTime, min);
                  if (calculated) onChange(calculated);
                }}
                title={`Set end time to ${durLabel} after start time`}
                style={styles.durationChip}
              >
                {durLabel}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    letterSpacing: '0.5px',
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
    padding: '0.625rem 4.5rem 0.625rem 0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--color-muted)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    outline: 'none',
  },
  hiddenNativeInput: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    width: 0,
    height: 0,
    border: 'none',
    padding: 0,
    margin: 0,
  },
  dialBtn: {
    position: 'absolute',
    right: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: 'var(--color-background, #f3f4f6)',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-border, #d1d5db)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.35rem 0.55rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    touchAction: 'manipulation',
  },
  dialBtnText: {
    fontSize: '0.65rem',
    letterSpacing: '0.5px',
  },
  meridiemGroup: {
    display: 'flex',
    borderRadius: 'var(--border-radius-sm)',
    overflow: 'hidden',
    border: '1px solid var(--color-muted)',
  },
  meridiemBtn: {
    padding: '0.625rem 0.65rem',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    border: 'none',
    cursor: 'pointer',
    minWidth: '38px',
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
  },
  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.15rem',
  },
  chipsLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
    fontWeight: 700,
  },
  minuteChip: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
  },
  durationOffsetsGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.3rem',
    marginLeft: '0.25rem',
    borderLeft: '1px solid var(--color-border)',
    paddingLeft: '0.35rem',
  },
  durationChip: {
    padding: '0.25rem 0.45rem',
    fontSize: '0.68rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    backgroundColor: 'var(--color-background, #f3f4f6)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    cursor: 'pointer',
    touchAction: 'manipulation',
  },
};
