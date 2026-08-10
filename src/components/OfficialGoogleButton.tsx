'use client';

import React from 'react';

interface OfficialGoogleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  variant?: 'light' | 'dark';
}

export const OfficialGoogleButton: React.FC<OfficialGoogleButtonProps> = ({
  onClick,
  disabled = false,
  text = 'Sign in with Google',
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        backgroundColor: isDark ? '#131314' : '#ffffff',
        color: isDark ? '#e3e3e3' : '#1f1f1f',
        border: `1px solid ${isDark ? '#444746' : '#747775'}`,
        borderRadius: '20px',
        padding: '0.625rem 1.25rem',
        fontFamily: "'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        width: '100%',
      }}
    >
      {/* Official 4-color Google "G" Logo SVG */}
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.617z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        />
      </svg>
      <span>{text}</span>
    </button>
  );
};

export default OfficialGoogleButton;
