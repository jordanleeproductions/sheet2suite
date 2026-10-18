export type DashboardSectionKey =
  | 'action_center'
  | 'budget'
  | 'guests'
  | 'tasks'
  | 'tables'
  | 'music'
  | 'photos';

export interface DashboardSectionConfig {
  key: DashboardSectionKey;
  label: string;
  enabled: boolean;
}

export const DEFAULT_DASHBOARD_SECTIONS: DashboardSectionConfig[] = [
  { key: 'action_center', label: 'Action Center & Priority Alerts', enabled: true },
  { key: 'budget', label: 'Financials & Expenses', enabled: true },
  { key: 'guests', label: 'Guest Registry & RSVP Summary', enabled: true },
  { key: 'tasks', label: 'Kanban Checklist & Task Completion', enabled: true },
  { key: 'tables', label: 'Reception Table Seating', enabled: true },
  { key: 'music', label: 'Music Playlist & Song Requests', enabled: true },
  { key: 'photos', label: 'Photography Shot List', enabled: true },
];

export function loadDashboardLayout(): DashboardSectionConfig[] {
  if (typeof window === 'undefined') return DEFAULT_DASHBOARD_SECTIONS;
  try {
    const saved = localStorage.getItem('s2v_dashboard_layout');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure any newly added section keys exist in the loaded config
        const existingKeys = new Set(parsed.map((item: { key: string }) => item.key));
        const missing = DEFAULT_DASHBOARD_SECTIONS.filter((sec) => !existingKeys.has(sec.key));
        return [...parsed, ...missing];
      }
    }
  } catch (e) {
    console.error('Error loading dashboard layout:', e);
  }
  return DEFAULT_DASHBOARD_SECTIONS;
}

export function saveDashboardLayout(sections: DashboardSectionConfig[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('s2v_dashboard_layout', JSON.stringify(sections));
    window.dispatchEvent(new CustomEvent('s2v:dashboard-layout-updated', { detail: sections }));
  } catch (e) {
    console.error('Error saving dashboard layout:', e);
  }
}

export const DEFAULT_PLANNING_TOOLS_ORDER: string[] = [
  'guests',
  'menu',
  'tables',
  'budget',
  'schedule',
  'vendors',
  'tasks',
  'music',
  'photos',
  'thanks',
];

export function loadPlanningToolsOrder(): string[] {
  if (typeof window === 'undefined') return DEFAULT_PLANNING_TOOLS_ORDER;
  try {
    const saved = localStorage.getItem('s2v_planning_tools_order');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalize 'gifts' to 'thanks'
        const normalized = parsed.map((k: string) => (k === 'gifts' ? 'thanks' : k));
        const existing = new Set(normalized);
        const missing = DEFAULT_PLANNING_TOOLS_ORDER.filter((k) => !existing.has(k));
        return [...normalized, ...missing];
      }
    }
  } catch (e) {
    console.error('Error loading planning tools order:', e);
  }
  return DEFAULT_PLANNING_TOOLS_ORDER;
}

export function savePlanningToolsOrder(order: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('s2v_planning_tools_order', JSON.stringify(order));
    window.dispatchEvent(new CustomEvent('s2v:tools-order-updated', { detail: order }));
  } catch (e) {
    console.error('Error saving planning tools order:', e);
  }
}
