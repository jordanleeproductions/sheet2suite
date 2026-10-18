import React from 'react';

export interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  subtext?: string;
  statusBadge?: string;
  statusColor?: 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'neutral';
  progress?: number; // 0 to 100
  onClick?: () => void;
  isActive?: boolean;
  tooltip?: string;
}

export interface PageMetricStripProps {
  metrics: MetricItem[];
  columns?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function PageMetricStrip({
  metrics,
  columns,
  className = '',
  style = {},
}: PageMetricStripProps) {
  const colCount = columns || Math.min(4, Math.max(2, metrics.length));

  const resolveColor = (status?: string, fallback = 'var(--color-text, #0F172A)') => {
    switch (status) {
      case 'green':
        return 'var(--color-green, #10B981)';
      case 'red':
        return 'var(--color-red, #EF4444)';
      case 'amber':
        return 'var(--color-amber, #F59E0B)';
      case 'blue':
        return 'var(--color-primary, #0284C7)';
      case 'purple':
        return 'var(--color-purple, #7C3AED)';
      default:
        return fallback;
    }
  };

  const resolveBadgeBg = (status?: string) => {
    switch (status) {
      case 'green':
        return 'rgba(16, 185, 129, 0.12)';
      case 'red':
        return 'rgba(239, 68, 68, 0.12)';
      case 'amber':
        return 'rgba(245, 158, 11, 0.12)';
      case 'blue':
        return 'rgba(2, 132, 199, 0.12)';
      case 'purple':
        return 'rgba(124, 58, 237, 0.12)';
      default:
        return 'var(--color-bg-subtle, #F1F5F9)';
    }
  };

  return (
    <div
      className={`s2v-page-metric-strip anim-fade-in ${className}`.trim()}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
        gap: '0.65rem',
        backgroundColor: 'var(--color-surface, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: 'var(--border-radius-md, 8px)',
        padding: '0.85rem 1rem',
        boxShadow: 'var(--box-shadow-subtle, 0 1px 2px rgba(0,0,0,0.04))',
        ...style,
      }}
    >
      <style>{`
        .s2v-metric-card {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          min-width: 0;
          padding: 0.25rem 0.35rem;
          border-radius: 4px;
          transition: background-color 0.15s ease, transform 0.15s ease;
        }
        .s2v-metric-card.is-clickable {
          cursor: pointer;
        }
        .s2v-metric-card.is-clickable:hover {
          background-color: var(--color-bg-subtle, #F8FAFC);
        }
        .s2v-metric-card.is-clickable:active {
          transform: scale(0.98);
        }
        .s2v-metric-card.is-active {
          background-color: var(--color-bg-subtle, #F1F5F9);
          outline: 2px solid var(--color-primary, #0F172A);
        }
        .s2v-metric-value {
          font-family: var(--font-technical-mono, monospace);
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 768px) {
          .s2v-page-metric-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.5rem !important;
            padding: 0.65rem 0.75rem !important;
          }
          .s2v-metric-value {
            font-size: 1.15rem !important;
          }
        }
      `}</style>

      {metrics.map((m) => {
        const isClickable = Boolean(m.onClick);
        const valueColor = resolveColor(m.statusColor, 'var(--color-primary, #0F172A)');

        return (
          <div
            key={m.id}
            className={`s2v-metric-card ${isClickable ? 'is-clickable' : ''} ${m.isActive ? 'is-active' : ''}`.trim()}
            onClick={m.onClick}
            title={m.tooltip || (typeof m.value === 'string' ? m.value : undefined)}
          >
            {/* Header Row: Label & Status Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'var(--color-muted, #64748B)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {m.label}
              </span>
              {m.statusBadge && (
                <span
                  style={{
                    fontFamily: 'var(--font-technical-mono, monospace)',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    color: resolveColor(m.statusColor),
                    backgroundColor: resolveBadgeBg(m.statusColor),
                    padding: '0.05rem 0.35rem',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {m.statusBadge}
                </span>
              )}
            </div>

            {/* Big Value Metric */}
            <div
              className="s2v-metric-value"
              style={{
                color: valueColor,
              }}
            >
              {m.value}
            </div>

            {/* Optional Micro Progress Bar */}
            {m.progress !== undefined && (
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'var(--color-border, #E2E8F0)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginTop: '0.1rem',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, m.progress))}%`,
                    backgroundColor: resolveColor(m.statusColor, 'var(--color-green, #10B981)'),
                    borderRadius: '2px',
                    transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            )}

            {/* Subtext */}
            {m.subtext && (
              <span
                style={{
                  fontFamily: 'var(--font-technical-mono, monospace)',
                  fontSize: '0.6rem',
                  color: 'var(--color-muted, #64748B)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '0.05rem',
                }}
              >
                {m.subtext}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
