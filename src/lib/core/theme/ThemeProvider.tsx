'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type StyleTheme = 'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo';
export type ColorTheme = 'light' | 'dark';

interface ThemeContextType {
  styleTheme: StyleTheme;
  theme: ColorTheme;
  primaryColor: string;
  fontSizeScale: number; // 80% to 120%
  setStyleTheme: (style: StyleTheme) => void;
  setTheme: (mode: ColorTheme) => void;
  setPrimaryColor: (color: string) => void;
  setFontSizeScale: (scale: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Sheet2ThemeProvider({ children }: { children: React.ReactNode }) {
  const [styleTheme, setStyleTheme] = useState<StyleTheme>('editorial');
  const [theme, setTheme] = useState<ColorTheme>('light');
  const [primaryColor, setPrimaryColor] = useState<string>('');
  const [fontSizeScale, setFontSizeScaleState] = useState<number>(100);

  useEffect(() => {
    const savedStyle = localStorage.getItem('s2v_style_theme') as StyleTheme;
    const savedTheme = localStorage.getItem('s2v_theme') as ColorTheme;
    const savedColor = localStorage.getItem('s2v_primary_color');
    const savedFontScale = localStorage.getItem('s2v_font_scale');

    if (savedStyle === 'editorial' || savedStyle === 'neo-brutalism' || savedStyle === 'botanical-romance' || savedStyle === 'midnight-tuxedo') setStyleTheme(savedStyle);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    if (savedColor) setPrimaryColor(savedColor);
    if (savedFontScale) {
      const parsed = parseInt(savedFontScale, 10);
      if (!isNaN(parsed) && parsed >= 80 && parsed <= 120) {
        setFontSizeScaleState(parsed);
      }
    }
  }, []);

  const setFontSizeScale = (scale: number) => {
    const clamped = Math.min(120, Math.max(80, scale));
    setFontSizeScaleState(clamped);
    localStorage.setItem('s2v_font_scale', clamped.toString());
  };

  // Effect 1: Style theme (aesthetic) — only fires when the visual style changes
  useEffect(() => {
    document.documentElement.setAttribute('data-style', styleTheme);
    localStorage.setItem('s2v_style_theme', styleTheme);
  }, [styleTheme]);

  // Effect 2: Color mode + primary accent — only fires when light/dark or color changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (primaryColor) {
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      localStorage.setItem('s2v_primary_color', primaryColor);
    } else {
      document.documentElement.style.removeProperty('--color-primary');
      localStorage.removeItem('s2v_primary_color');
    }
    localStorage.setItem('s2v_theme', theme);
  }, [theme, primaryColor]);

  // Effect 3: Font size scale — isolated so it NEVER touches theme attributes
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeScale}%`;
  }, [fontSizeScale]);

  return (
    <ThemeContext.Provider value={{ styleTheme, theme, primaryColor, fontSizeScale, setStyleTheme, setTheme, setPrimaryColor, setFontSizeScale }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSheet2Theme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSheet2Theme must be used within a Sheet2ThemeProvider');
  }
  return context;
}
