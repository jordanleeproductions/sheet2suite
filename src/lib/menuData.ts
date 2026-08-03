export interface MenuItem {
  id: string;
  category: 'entree' | 'appetizer' | 'dessert';
  name: string;
  description?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isNutFree?: boolean;
}

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // Entrees
  { id: 'm1', category: 'entree', name: 'Filet Mignon', description: 'Center-cut tenderloin with red wine reduction & truffle mash', isGlutenFree: true },
  { id: 'm2', category: 'entree', name: 'Pan-Seared Salmon', description: 'Atlantic salmon with lemon herb butter & asparagus', isGlutenFree: true },
  { id: 'm3', category: 'entree', name: 'Vegan Risotto', description: 'Wild mushroom & arborio rice with truffle oil', isVegetarian: true, isVegan: true, isGlutenFree: true },
  { id: 'm4', category: 'entree', name: 'Kids Chicken Tenders', description: 'Crispy tenders with French fries & honey mustard', isNutFree: true },
  
  // Appetizers
  { id: 'a1', category: 'appetizer', name: 'Caprese Skewers', description: 'Cherry tomato, fresh mozzarella & basil drizzle', isVegetarian: true, isGlutenFree: true },
  { id: 'a2', category: 'appetizer', name: 'Mini Crab Cakes', description: 'Jumbo lump crab with remoulade sauce' },
  { id: 'a3', category: 'appetizer', name: 'Stuffed Mushrooms', description: 'Spinach & garlic herb breadcrumbs', isVegetarian: true, isVegan: true },
  
  // Desserts
  { id: 'd1', category: 'dessert', name: 'Wedding Cake Slice', description: 'Vanilla almond cake with champagne buttercream', isVegetarian: true },
  { id: 'd2', category: 'dessert', name: 'Chocolate Lava Cake', description: 'Warm molten chocolate cake with fresh berries', isVegetarian: true },
  { id: 'd3', category: 'dessert', name: 'Fruit Tartlet', description: 'Seasonal berries with vegan pastry cream', isVegetarian: true, isVegan: true, isGlutenFree: true }
];
