export interface ColorPreset {
  name: string;
  hex: string;
  desc: string;
}

export type StyleTheme = 'editorial' | 'botanical-romance' | 'midnight-tuxedo';
export type ColorMode = 'light' | 'dark';

export const COLOR_PRESETS: Record<StyleTheme, Record<ColorMode, ColorPreset[]>> = {
  editorial: {
    light: [
      { name: 'Deep Slate Ink', hex: '#0F172A', desc: 'High-Contrast Editorial Slate' },
      { name: 'Ledger Emerald', hex: '#059669', desc: 'Reconciled Positive Ledger Green' },
      { name: 'Ceremonial Gold', hex: '#D4AF37', desc: 'Refined Ceremonial Milestone Gold' },
      { name: 'Burgundy Rose', hex: '#881337', desc: 'Rich Bordeaux Rose' },
    ],
    dark: [
      { name: 'Paper White Ink', hex: '#F8FAFC', desc: 'High-Contrast Technical White' },
      { name: 'Sage Leaf', hex: '#10B981', desc: 'Reconciled Luminous Sage' },
      { name: 'Ceremonial Gold', hex: '#EAB308', desc: 'Warm Milestone Gold' },
      { name: 'Rose Petal', hex: '#FB7185', desc: 'Soft Vintage Blush' },
    ],
  },
  'botanical-romance': {
    light: [
      { name: 'Restrained Forest', hex: '#1B4332', desc: 'Warm Cream & Restrained Forest Green' },
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
