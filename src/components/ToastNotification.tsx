'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
  duration?: number;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        maxWidth: '360px',
        width: 'calc(100vw - 3rem)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const { id, message, type = 'success', duration = 3000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const isSuccess = type === 'success';
  const isWarning = type === 'warning';

  return (
    <div
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-surface, #ffffff)',
        color: 'var(--color-text, #1e293b)',
        border: isSuccess 
          ? '2px solid var(--color-green, #10b981)' 
          : isWarning 
          ? '2px solid var(--color-gold, #f59e0b)' 
          : '2px solid var(--color-primary, #10b981)',
        borderRadius: 'var(--border-radius-md, 8px)',
        boxShadow: 'var(--box-shadow-hover, 0 10px 25px -5px rgba(0, 0, 0, 0.15))',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.825rem',
        fontWeight: 600,
        animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
        {isSuccess ? (
          <CheckCircle2 size={18} style={{ color: 'var(--color-green, #10b981)', flexShrink: 0 }} />
        ) : isWarning ? (
          <AlertTriangle size={18} style={{ color: 'var(--color-gold, #f59e0b)', flexShrink: 0 }} />
        ) : (
          <Info size={18} style={{ color: 'var(--color-primary, #10b981)', flexShrink: 0 }} />
        )}
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-muted, #64748b)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'color 0.2s ease',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
