import React from 'react';

export interface SegmentOption {
  id?: string;
  key?: string;
  label: string;
  icon?: React.ReactNode | React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  count?: number;
}

export interface PageHeaderCardProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  segmentSwitcher?: {
    options?: SegmentOption[];
    segments?: SegmentOption[];
    activeId?: string;
    activeKey?: string;
    onChange: (id: string) => void;
  };
  actions?: React.ReactNode;
  actionButtons?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function PageHeaderCard({
  title,
  subtitle,
  badge,
  segmentSwitcher,
  actions,
  actionButtons,
  className = '',
  style = {},
}: PageHeaderCardProps) {
  const effectiveActions = actions ?? actionButtons;
  const rawOptions = segmentSwitcher ? (segmentSwitcher.options || segmentSwitcher.segments || []) : [];
  const currentActiveId = segmentSwitcher ? (segmentSwitcher.activeId || segmentSwitcher.activeKey || '') : '';
  return (
    <div
      className={`s2v-page-header-card anim-fade-in ${className}`.trim()}
      style={{
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: 'var(--border-radius-md, 8px)',
        padding: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        boxShadow: 'var(--box-shadow-subtle, 0 1px 2px rgba(0,0,0,0.04))',
        position: 'relative',
        ...style,
      }}
    >
      {/* Scoped CSS for responsive stacking on mobile viewports */}
      <style>{`
        .s2v-page-header-card {
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }
        .s2v-page-header-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }
        .s2v-page-header-actions {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
        }
        .s2v-header-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.5rem 0.85rem;
          font-size: 0.75rem;
          font-family: var(--font-technical-mono, monospace);
          font-weight: 700;
          letter-spacing: 0.03em;
          border-radius: var(--border-radius-sm, 4px);
          cursor: pointer;
          transition: all 0.15s ease;
          min-height: 38px;
          white-space: nowrap;
          text-decoration: none;
        }
        .s2v-header-btn:active {
          transform: scale(0.97);
        }
        .s2v-header-btn-secondary {
          background-color: var(--color-bg, #F8FAFC);
          color: var(--color-text, #0F172A);
          border: 1px solid var(--color-border, #CBD5E1);
        }
        .s2v-header-btn-secondary:hover {
          background-color: var(--color-bg-hover, #F1F5F9);
          border-color: var(--color-primary, #0F172A);
        }
        .s2v-header-btn-primary {
          background-color: var(--color-primary, #0F172A);
          color: var(--color-on-primary, #FFFFFF);
          border: none;
        }
        .s2v-header-btn-primary:hover {
          opacity: 0.92;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        }
        .s2v-segment-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          font-size: 0.72rem;
          font-family: var(--font-technical-mono, monospace);
          font-weight: 700;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          background: transparent;
          color: var(--color-muted, #64748B);
        }
        .s2v-segment-pill:active {
          transform: scale(0.97);
        }
        .s2v-segment-pill.active {
          background-color: var(--color-primary, #0F172A);
          color: var(--color-on-primary, #FFFFFF);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        @media (max-width: 768px) {
          .s2v-page-header-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 1rem !important;
            gap: 0.85rem !important;
          }
          .s2v-page-header-actions {
            display: flex !important;
            width: 100% !important;
            gap: 0.45rem !important;
          }
          .s2v-page-header-actions > * {
            flex: 1 1 0 !important;
            min-height: 44px !important;
            justify-content: center !important;
            font-size: 0.72rem !important;
            padding: 0.45rem 0.6rem !important;
          }
          .s2v-segment-switcher-container {
            width: 100% !important;
          }
          .s2v-segment-switcher {
            width: 100% !important;
            display: flex !important;
          }
          .s2v-segment-switcher > .s2v-segment-pill {
            flex: 1 1 0 !important;
            justify-content: center !important;
            min-height: 40px !important;
          }
        }
      `}</style>

      {/* Left: Title, Subtitle & Optional Segment Switcher */}
      <div className="s2v-page-header-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-primary, #0F172A)',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
          {badge && (
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              {typeof badge === 'string' ? (
                <span
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-bg-subtle, #F1F5F9)',
                    color: 'var(--color-muted, #64748B)',
                    border: '1px solid var(--color-border, #E2E8F0)',
                  }}
                >
                  {badge}
                </span>
              ) : (
                badge
              )}
            </div>
          )}
        </div>

        {subtitle && (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-muted, #64748B)',
              margin: 0,
              fontFamily: 'var(--font-sans, system-ui)',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Optional Segment Switcher (e.g. Reception Tables vs Ceremony Aisle, or Shot List vs Guestbook) */}
        {segmentSwitcher && rawOptions.length > 0 && (
          <div className="s2v-segment-switcher-container" style={{ marginTop: '0.5rem' }}>
            <div
              className="s2v-segment-switcher"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.2rem',
                backgroundColor: 'var(--color-bg-subtle, #F1F5F9)',
                border: '1px solid var(--color-border, #E2E8F0)',
                borderRadius: '8px',
              }}
            >
              {rawOptions.map((opt) => {
                const optId = opt.id || opt.key || '';
                const isActive = optId === currentActiveId;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={optId}
                    type="button"
                    onClick={() => segmentSwitcher.onChange(optId)}
                    className={`s2v-segment-pill ${isActive ? 'active' : ''}`.trim()}
                  >
                    {IconComponent && (
                      React.isValidElement(IconComponent) 
                        ? IconComponent 
                        : typeof IconComponent === 'function' 
                          ? <IconComponent size={13} /> 
                          : null
                    )}
                    <span>{opt.label}</span>
                    {opt.count !== undefined && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          padding: '0.05rem 0.3rem',
                          borderRadius: '8px',
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.06)',
                          color: isActive ? '#FFFFFF' : 'var(--color-muted, #64748B)',
                        }}
                      >
                        {opt.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      {effectiveActions && (
        <div className="s2v-page-header-actions">
          {effectiveActions}
        </div>
      )}
    </div>
  );
}
