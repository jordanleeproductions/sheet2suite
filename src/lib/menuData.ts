import { MenuItem } from '@/types/wedding';

export type { MenuItem };

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'M101',
    category: 'entree',
    name: 'Filet Mignon',
    description: 'Grilled 8oz beef tenderloin with truffle mash and seasonal vegetables',
    isGuestChoice: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isNutFree: true,
  },
  {
    id: 'M102',
    category: 'entree',
    name: 'Pan-Seared Salmon',
    description: 'Fresh herb-crusted Atlantic salmon with wild rice pilaf and asparagus',
    isGuestChoice: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isNutFree: true,
  },
  {
    id: 'M103',
    category: 'entree',
    name: 'Vegan Risotto',
    description: 'Creamy arborio rice with roasted foraged mushrooms, peas, and truffle oil',
    isGuestChoice: true,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isNutFree: true,
  },
  {
    id: 'M104',
    category: 'entree',
    name: 'Kids Chicken Tenders',
    description: 'Crispy chicken tenders with french fries and honey mustard dip',
    isGuestChoice: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isNutFree: true,
  },
  {
    id: 'M105',
    category: 'appetizer',
    name: 'Caprese Skewers',
    description: 'Cherry tomatoes with fresh mozzarella, basil, and balsamic reduction',
    isGuestChoice: false,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isNutFree: true,
  },
  {
    id: 'M106',
    category: 'dessert',
    name: 'Vanilla Almond Wedding Cake',
    description: '3-tier vanilla sponge cake with almond buttercream and gold leaf accents',
    isGuestChoice: false,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isNutFree: false,
  },
];

/**
 * Generates a clean, sequential Menu Item ID (e.g. M101, M102, M108) matching the master template contract.
 * Automatically gap-fills missing numbers and preserves 3-digit catalog convention (or 1-digit if custom).
 */
export function generateNextMenuItemId(existingItems: MenuItem[] = []): string {
  const existingIds = new Set(existingItems.map(item => (item.id || '').trim().toUpperCase()));
  const usedNumbers = new Set<number>();

  existingItems.forEach(item => {
    const id = (item.id || '').trim();
    const match = id.match(/^M(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) usedNumbers.add(num);
    }
  });

  const hasTripleDigits = Array.from(usedNumbers).some(n => n >= 100);
  let candidate = hasTripleDigits || usedNumbers.size === 0 ? 101 : 1;

  while (usedNumbers.has(candidate) || existingIds.has(`M${candidate}`)) {
    candidate++;
  }

  return `M${candidate}`;
}
