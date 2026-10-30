'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  styleTheme?: string;
  isMobile?: boolean;
}

/**
 * ToastNotification Component (Monarch-Style)
 * Renders lightweight, frosted glass toast notifications with smooth slide-up
 * animations, category color badges, progress timers, and responsive positioning.
 */
export default function ToastNotification({
  toasts,
  onDismiss,
  styleTheme,
  isMobile: isMobileProp,
}: ToastNotificationProps) {
  const [viewportMobile, setViewportMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setViewportMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isMobile = isMobileProp ?? viewportMobile;

  if (!toasts || toasts.length === 0) return null;

  // Enforce strict limit of max 2 visible toasts to prevent vertical clutter
  const visibleToasts = toasts.slice(-2);

  return (
    <div
      role="region"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: isMobile ? 'calc(4.75rem + env(safe-area-inset-bottom, 0px))' : '1.5rem',
        right: isMobile ? '1rem' : '1.5rem',
        left: isMobile ? '1rem' : 'auto',
        maxWidth: isMobile ? 'none' : '380px',
        width: isMobile ? 'auto' : 'calc(100vw - 3rem)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        pointerEvents: 'none',
      }}
    >
      {visibleToasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          styleTheme={styleTheme}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
  styleTheme,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  styleTheme?: string;
}) {
  const { id, message, type = 'success', duration = 3000 } = toast;
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 200);
  }, [id, onDismiss]);

  useEffect(() => {
    if (isHovered) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, isHovered, handleDismiss]);


  // Configuration for category badges aligned with Monarch styling
  let icon = <CheckCircle2 size={17} strokeWidth={2.2} />;
  let iconBg = 'rgba(16, 185, 129, 0.12)';
  let iconColor = '#059669';

  if (type === 'warning') {
    icon = <AlertTriangle size={17} strokeWidth={2.2} />;
    iconBg = 'rgba(245, 158, 11, 0.12)';
    iconColor = '#D97706';
  } else if (type === 'error') {
    icon = <AlertCircle size={17} strokeWidth={2.2} />;
    iconBg = 'rgba(239, 68, 68, 0.12)';
    iconColor = '#DC2626';
  } else if (type === 'info') {
    icon = <Info size={17} strokeWidth={2.2} />;
    iconBg = 'rgba(79, 70, 229, 0.10)';
    iconColor = '#4F46E5';
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.75rem 0.85rem',
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: 'var(--color-text, #0F172A)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '14px',
        boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        animation: isExiting
          ? 'toastSlideOut 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          : 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateY(14px) scale(0.96);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes toastSlideOut {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(12px) scale(0.96);
            opacity: 0;
          }
        }
        @keyframes toastProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>

      {/* Main Toast Content: Category Icon Badge + Message */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <span
          style={{
            fontFamily: 'var(--font-interface-sans, system-ui, -apple-system, sans-serif)',
            fontSize: '0.825rem',
            fontWeight: 600,
            lineHeight: 1.35,
            color: 'var(--color-text, #0F172A)',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </span>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Dismiss notification"
        style={{
          background: isHovered ? 'var(--color-bg-hover, #F1F5F9)' : 'transparent',
          border: 'none',
          color: 'var(--color-muted, #64748B)',
          cursor: 'pointer',
          padding: 0,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          flexShrink: 0,
          transition: 'background-color 0.15s ease, color 0.15s ease',
        }}
      >
        <X size={14} />
      </button>

      {/* Subtle Bottom Expiration Progress Indicator */}
      {duration > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            backgroundColor: iconColor,
            opacity: 0.25,
            animation: `toastProgress ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}
