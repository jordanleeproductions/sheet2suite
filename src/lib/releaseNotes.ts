export interface ReleaseNoteItem {
  version: string;
  title: string;
  date: string;
  badge?: string;
  badgeColor?: string;
  highlights: string[];
  details?: string;
  category?: 'major' | 'feature' | 'enhancement' | 'fix';
}

export const RELEASE_NOTES: ReleaseNoteItem[] = [
  {
    version: 'v1.12.1',
    title: 'Interactive Release Notes & Navigation Badges',
    date: 'Oct 19, 2026',
    badge: 'Latest',
    badgeColor: '#10B981',
    category: 'feature',
    highlights: [
      'Tappable version badge in desktop sidebar and mobile drawer to inspect release summaries.',
      'Responsive release notes viewer: frosted glass floating toast on desktop and slide-up bottom sheet popup on mobile.',
      'Quick-access release history archive with scannable bullet highlights.',
    ],
    details: 'Clicking or tapping the version number anywhere in the navigation opens an instant high-level summary of the latest features and past release history.',
  },
  {
    version: 'v1.12.0',
    title: 'Pre-Launch Setup Hardening & Licensing Unification',
    date: 'Oct 19, 2026',
    badge: 'Hardening',
    badgeColor: '#4F46E5',
    category: 'feature',
    highlights: [
      'Unified Standard vs. Pro licensing architecture with automated Etsy order description verification.',
      'Hardened Guided Setup wizard with step validation, real-time connection checks, and error boundaries.',
      'Robust guest roster import safeguards with resilient CSV fallback handling.',
      'System health and error boundary monitors protecting the planning suite from runtime crashes.',
    ],
    details: 'Hardened the pre-launch experience for real users with bulletproof setup flows, explicit licensing tiers, and fallback error handling.',
  },
  {
    version: 'v1.11.0',
    title: 'Monarch Admin Experience & Mobile Inspector',
    date: 'Oct 19, 2026',
    badge: 'Admin UX',
    badgeColor: '#7C3AED',
    category: 'feature',
    highlights: [
      'Full Monarch UX redesign for Admin portal with key metric cards and quick filters.',
      'Responsive grouped cards layout with touch-friendly actions on mobile screens.',
      'SlideOverDrawer record inspector for seamless user, license, and activity management.',
      'Hidden public admin entry points to protect authentication surface security.',
    ],
    details: 'Transformed administrative management with high-contrast cards, instant search, and mobile-friendly SlideOver drawers.',
  },
  {
    version: 'v1.10.0',
    title: 'Universal Monarch Edit Screens',
    date: 'Oct 19, 2026',
    badge: 'Monarch UX',
    badgeColor: '#0284C7',
    category: 'feature',
    highlights: [
      'SlideOverDrawer edit interfaces across guests, expenses, schedule, vendors, and tasks.',
      'Unified form controls, segmented pickers, and grouped input sections.',
      'Mobile bottom-sticky action bars with safe-area spacing and keyboard shortcuts.',
      'Frictionless escape and backdrop dismiss gestures with unsaved change awareness.',
    ],
    details: 'Replaced full-page modal disruptions with clean, responsive slide-over drawers inspired by modern financial apps.',
  },
  {
    version: 'v1.9.0',
    title: 'Jira Mobile-Inspired Tasks & Checklist',
    date: 'Oct 19, 2026',
    badge: 'Tasks UX',
    badgeColor: '#EA580C',
    category: 'feature',
    highlights: [
      'Distinct left-border color accents categorized by priority (Urgent, High, Medium, Low).',
      'Quick filter chips for task status, priority, and assignees.',
      'Touch-optimized task action sheets and fast completion toggles.',
      'Streamlined Kanban cards with milestone progress tracking.',
    ],
    details: 'Re-imagined the mobile checklist experience with Jira-inspired priority accents and rapid tactile task triage.',
  },
  {
    version: 'v1.8.0',
    title: 'Collision-Proof Seating Plan & Numbered Seats',
    date: 'Oct 19, 2026',
    badge: 'Seating',
    badgeColor: '#059669',
    category: 'fix',
    highlights: [
      'Reliable guest seat position persistence to Google Sheets without reload shifting.',
      'Drag-and-drop table planner with numbered chairs and occupancy tracking.',
      'Theme-adaptive planning progress cards for Editorial and Botanical styles.',
    ],
    details: 'Permanently fixed seating plan assignment state syncing and table position coordinates in the master spreadsheet.',
  },
  {
    version: 'v1.7.0',
    title: 'Ambient Sync & Clean Notifications',
    date: 'Oct 18, 2026',
    badge: 'Sync Engine',
    badgeColor: '#10B981',
    category: 'enhancement',
    highlights: [
      'Ambient top-header sync status indicator (Synced, Saving, Offline).',
      'Eliminated stacked toast notifications during rapid spreadsheet edits.',
      'Debounced auto-save engine for seamless Google Sheets background syncing.',
    ],
    details: 'Replaced noisy save notification popups with a subtle, non-intrusive status pill in the top header.',
  },
  {
    version: 'v1.6.0',
    title: 'Unified Page Experience & Milestone Confetti',
    date: 'Oct 18, 2026',
    badge: 'Design System',
    badgeColor: '#D97706',
    category: 'feature',
    highlights: [
      'Universal PageHeaderCard across all wedding planning modules.',
      'Monarch hero metric strips with live counters and progress highlights.',
      'Celebratory milestone confetti upon wedding task completion.',
    ],
    details: 'Unified typography, hero metrics, and celebration moments across all planning tabs.',
  },
];

export function getLatestReleaseNote(): ReleaseNoteItem {
  return RELEASE_NOTES[0];
}

export function getReleaseNoteByVersion(version: string): ReleaseNoteItem | undefined {
  const normalized = version.startsWith('v') ? version : `v${version}`;
  return RELEASE_NOTES.find((item) => item.version.toLowerCase() === normalized.toLowerCase());
}

export function getAllReleaseNotes(): ReleaseNoteItem[] {
  return RELEASE_NOTES;
}
