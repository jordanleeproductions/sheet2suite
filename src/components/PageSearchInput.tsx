'use client';

import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface PageSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  resultCount?: number;
  onClear?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const PageSearchInput: React.FC<PageSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  id,
  className = '',
  style,
  inputStyle,
  autoFocus,
  size = 'md',
  resultCount,
  onClear,
  onKeyDown,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && value) {
      e.preventDefault();
      e.stopPropagation();
      onChange('');
      if (onClear) onClear();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <div
      className={`page-search-container page-search-${size} ${className}`}
      style={style}
    >
      <Search
        size={iconSize}
        className="page-search-icon"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className="page-search-input"
        style={inputStyle}
      />
      {resultCount !== undefined && value.trim().length > 0 && (
        <span className="page-search-result-badge">
          {resultCount} {resultCount === 1 ? 'match' : 'matches'}
        </span>
      )}
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="page-search-clear-btn"
          aria-label="Clear search query"
          title="Clear search (Esc)"
        >
          <X size={size === 'sm' ? 12 : 14} />
        </button>
      )}
    </div>
  );
};

export default PageSearchInput;
