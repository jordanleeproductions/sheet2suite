'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type StyleTheme = 'editorial' | 'neo-brutalism';
export type ColorTheme = 'light' | 'dark';

interface ThemeContextType {
  styleTheme: StyleTheme;
  theme: ColorTheme;
  primaryColor: string;
  setStyleTheme: (style: StyleTheme) => void;
  setTheme: (mode: ColorTheme) => void;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Sheet2ThemeProvider({ children }: { children: React.ReactNode }) {
  const [styleTheme, setStyleTheme] = useState<StyleTheme>('editorial');
  const [theme, setTheme] = useState<ColorTheme>('light');
  const [primaryColor, setPrimaryColor] = useState<string>('');

  useEffect(() => {
    const savedStyle = localStorage.getItem('s2v_style_theme') as StyleTheme;
    const savedTheme = localStorage.getItem('s2v_theme') as ColorTheme;
    const savedColor = localStorage.getItem('s2v_primary_color');

    if (savedStyle === 'editorial' || savedStyle === 'neo-brutalism') setStyleTheme(savedStyle);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    if (savedColor) setPrimaryColor(savedColor);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-style', styleTheme);
    document.documentElement.setAttribute('data-theme', theme);
    if (primaryColor) {
      document.documentElement.style.setProperty('--color-primary', primaryColor);
    } else {
      document.documentElement.style.removeProperty('--color-primary');
    }

    localStorage.setItem('s2v_style_theme', styleTheme);
    localStorage.setItem('s2v_theme', theme);
    if (primaryColor) localStorage.setItem('s2v_primary_color', primaryColor);
    else localStorage.removeItem('s2v_primary_color');
  }, [styleTheme, theme, primaryColor]);

  return (
    <ThemeContext.Provider value={{ styleTheme, theme, primaryColor, setStyleTheme, setTheme, setPrimaryColor }}>
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
