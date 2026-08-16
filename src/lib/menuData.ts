export interface MenuItem {
  id: string;
  category: 'entree' | 'appetizer' | 'dessert';
  name: string;
  description?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
  isGuestChoice?: boolean; // Toggles whether guests can select this meal choice (e.g. true for plated choices, false for buffet/shared items)
}

export const DEFAULT_MENU_ITEMS: MenuItem[] = [];
