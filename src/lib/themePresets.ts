export interface ColorPreset {
  name: string;
  hex: string;
  desc: string;
}

export type StyleTheme = 'editorial' | 'neo-brutalism' | 'botanical-romance' | 'midnight-tuxedo';
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
  'botanical-romance': {
    light: [
      { name: 'Deep Sage', hex: '#3b5240', desc: 'Earthy Botanical Sage' },
      { name: 'Deep Rose', hex: '#8a3b3b', desc: 'Soft Vintage Romance' },
      { name: 'Dark Lavender', hex: '#5c4a75', desc: 'Gentle Floral Purple' },
      { name: 'Warm Earth', hex: '#7a6654', desc: 'Neutral Earth Tone' },
    ],
    dark: [
      { name: 'Bright Moss', hex: '#9bd1a6', desc: 'Luminous Night Forest' },
      { name: 'Soft Coral', hex: '#e87d7d', desc: 'Bright Romantic Red' },
      { name: 'Soft Lavender', hex: '#b895d6', desc: 'Light Floral Purple' },
      { name: 'Warm Sand', hex: '#e3cab3', desc: 'Bright Earth Tone' },
    ],
  },
  'midnight-tuxedo': {
    light: [
      { name: 'Tuxedo Black', hex: '#111111', desc: 'Sharp Classic Black' },
      { name: 'Midnight Blue', hex: '#1a202c', desc: 'Deep Formal Navy' },
    ],
    dark: [
      { name: 'Pure White', hex: '#ffffff', desc: 'Crisp Formal White' },
      { name: 'Platinum', hex: '#a0aec0', desc: 'Bright Metallic Grey' },
      { name: 'Champagne Gold', hex: '#ecc94b', desc: 'Luminous Gold Accent' },
    ],
  },
};

export function getColorPresets(style: StyleTheme, mode: ColorMode): ColorPreset[] {
  return COLOR_PRESETS[style]?.[mode] || COLOR_PRESETS.editorial.light;
}
