export interface ColorPreset {
  name: string;
  hex: string;
  desc: string;
}

export type StyleTheme = 'editorial' | 'neo-brutalism';
export type ColorMode = 'light' | 'dark';

export const COLOR_PRESETS: Record<StyleTheme, Record<ColorMode, ColorPreset[]>> = {
  editorial: {
    light: [
      { name: 'Forest Green', hex: '#11552D', desc: 'Classic Deep Emerald' },
      { name: 'Royal Navy', hex: '#0d1b2a', desc: 'Midnight Luxury Navy' },
      { name: 'Burgundy Rose', hex: '#881337', desc: 'Rich Bordeaux Rose' },
      { name: 'Warm Amber', hex: '#b45309', desc: 'Golden Ochre Tone' },
    ],
    dark: [
      { name: 'Sage Leaf', hex: '#4ade80', desc: 'Soft Luminous Sage' },
      { name: 'Celestial Gold', hex: '#fbbf24', desc: 'Warm Starlight Gold' },
      { name: 'Rose Petal', hex: '#fb7185', desc: 'Soft Vintage Blush' },
      { name: 'Lavender Mist', hex: '#c084fc', desc: 'Subtle Lilac Glow' },
    ],
  },
  'neo-brutalism': {
    light: [
      { name: 'Electric Green', hex: '#00ED64', desc: 'High-Octane Acid Green' },
      { name: 'Vivid Violet', hex: '#7c3aed', desc: 'Punchy Neo Violet' },
      { name: 'Hot Coral', hex: '#f43f5e', desc: 'High-Contrast Crimson' },
      { name: 'Electric Cyan', hex: '#06b6d4', desc: 'Cyber Teal Pop' },
    ],
    dark: [
      { name: 'Neon Lime', hex: '#00ED64', desc: 'Vibrant Cyber Lime' },
      { name: 'Cyber Yellow', hex: '#facc15', desc: 'High-Visibility Yellow' },
      { name: 'Neon Pink', hex: '#f43f5e', desc: 'Hot Neon Magenta' },
      { name: 'Electric Purple', hex: '#a855f7', desc: 'Luminous Violet Neon' },
    ],
  },
};

export function getColorPresets(style: StyleTheme, mode: ColorMode): ColorPreset[] {
  return COLOR_PRESETS[style]?.[mode] || COLOR_PRESETS.editorial.light;
}
