export type DashboardSectionKey = 'budget' | 'guests' | 'tasks' | 'music' | 'tables' | 'photos';

export interface DashboardSectionConfig {
  key: DashboardSectionKey;
  label: string;
  enabled: boolean;
}

export const DEFAULT_DASHBOARD_SECTIONS: DashboardSectionConfig[] = [
  { key: 'budget', label: 'Financial KPI Overview & Budget Progress', enabled: true },
  { key: 'guests', label: 'Guest Registry & RSVP Summary', enabled: true },
  { key: 'tasks', label: 'Kanban Checklist & Task Completion', enabled: true },
  { key: 'music', label: 'Music Playlist & Song Requests', enabled: true },
  { key: 'tables', label: 'Reception Table Seating', enabled: true },
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
        const existingKeys = new Set(parsed.map((item: any) => item.key));
        const missing = DEFAULT_DASHBOARD_SECTIONS.filter(sec => !existingKeys.has(sec.key));
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
  } catch (e) {
    console.error('Error saving dashboard layout:', e);
  }
}
