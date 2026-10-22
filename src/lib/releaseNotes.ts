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
    version: 'v1.15.5',
    title: 'Workspace Privacy Protection & Identity Verification',
    date: 'Oct 22, 2026',
    badge: 'Latest',
    badgeColor: '#10B981',
    category: 'fix',
    highlights: [
      'Reinforced workspace privacy controls to ensure account data and spreadsheets are only accessible to verified owners and partners.',
      'Streamlined workspace auto-discovery and reconnection when switching between devices.',
      'Improved account onboarding verification for reliable setup and partner collaboration.',
    ],
    details: 'Enhanced workspace privacy controls and session verification to ensure your wedding planning spreadsheets and files remain completely private and accessible only to authorized planners.',
  },
  {
    version: 'v1.15.3',
    title: 'Release Notes Viewer & Version Synchronization',
    date: 'Oct 21, 2026',
    badge: 'Update',
    badgeColor: '#6B7280',
    category: 'enhancement',
    highlights: [
      'Interactive release notes now always reflect the latest application version and deployment date.',
      'Simplified, plain-language release summaries focused on user experience benefits.',
      'Automated versioning safeguards ensuring release notes stay up to date with every release.',
    ],
    details: 'Upgraded the release notes viewer and versioning system to ensure updates are always current, clear, and easy to read.',
  },
  {
    version: 'v1.15.2',
    title: 'Platform Security & Access Safeguards',
    date: 'Oct 21, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'fix',
    highlights: [
      'Enhanced account protection and administrative access safeguards.',
      'Strengthened workspace connection and data integrity protocols.',
      'General performance optimizations and background stability improvements.',
    ],
    details: 'Reinforced platform authentication safeguards and workspace data protection to keep your wedding planning data secure and private.',
  },
  {
    version: 'v1.15.1',
    title: 'Account Connection & Authentication Hardening',
    date: 'Oct 21, 2026',
    badge: 'Security',
    badgeColor: '#059669',
    category: 'fix',
    highlights: [
      'Strengthened Google Drive and spreadsheet connection flow for smoother sign-in.',
      'Improved account authorization handling during setup and workspace provisioning.',
      'Enhanced reliability when connecting external accounts and partner access.',
    ],
    details: 'Enhanced account authentication and Google integration flows for seamless, secure wedding workspace connections.',
  },
  {
    version: 'v1.15.0',
    title: 'Inclusive Wedding Language & Ceremony Seating Layout',
    date: 'Oct 21, 2026',
    badge: 'Ceremony',
    badgeColor: '#7C3AED',
    category: 'feature',
    highlights: [
      'Inclusive terminology options across timeline moments, wedding parties, and guest roles.',
      'Streamlined ceremony aisle planner with balanced side-by-side seating rows.',
      'Clear visual indicators for honored guests, wedding parties, and immediate family seating.',
    ],
    details: 'Introduced inclusive wedding party terminology and redesigned ceremony seating layouts for modern couples.',
  },
  {
    version: 'v1.14.0',
    title: 'Expense Contributor Tracking & Family Breakdown',
    date: 'Oct 20, 2026',
    badge: 'Financials',
    badgeColor: '#0284C7',
    category: 'feature',
    highlights: [
      'Track who paid for each expense item with 1-tap quick pills for Couple, Parents, In-Laws, and custom contributors.',
      'Interactive family contribution breakdown bar displaying total spend and percentage shares at a glance.',
      '1-tap ledger filtering to easily review purchases funded by specific contributors or families.',
      'Color-coded contributor tags across desktop receipts and mobile payment cards.',
    ],
    details: 'Easily track family contributions and gifts toward wedding expenses with clear visual breakdowns and contributor filters.',
  },
  {
    version: 'v1.13.0',
    title: 'Mobile Ceremony Seating & Unified Aisle Cards',
    date: 'Oct 20, 2026',
    badge: 'Mobile UX',
    badgeColor: '#D97706',
    category: 'enhancement',
    highlights: [
      'Mobile-optimized ceremony seating view with clear aisle arrangement cards.',
      'Interactive row roster deck for quick guest seating adjustments on phones and tablets.',
      'High-contrast seat availability counters and immediate family row indicators.',
    ],
    details: 'Redesigned the mobile ceremony seating experience for easy, intuitive guest arrangements from any handheld device.',
  },
  {
    version: 'v1.12.2',
    title: 'Seating Chart Flow & Stable Seat Positions',
    date: 'Oct 19, 2026',
    badge: 'Seating',
    badgeColor: '#059669',
    category: 'fix',
    highlights: [
      'Seamless guest seating: eliminated accidental seat shifting when updating or removing guests from tables.',
      'Permanent seat number locking so reception table arrangements stay perfectly organized.',
      'Improved responsiveness and reliability across the interactive table planner.',
    ],
    details: 'Enhanced the reception table planner for smooth, reliable seat assignments without unexpected reordering.',
  },
  {
    version: 'v1.12.1',
    title: 'Interactive Release Notes & Navigation Badges',
    date: 'Oct 19, 2026',
    badge: 'Navigation',
    badgeColor: '#059669',
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
    badge: 'Setup',
    badgeColor: '#4F46E5',
    category: 'feature',
    highlights: [
      'Unified Standard and Pro licensing tiers with automated order verification.',
      'Streamlined Guided Setup wizard with step validation, real-time connection checks, and safety boundaries.',
      'Robust guest roster import safeguards with resilient file handling.',
      'System health and runtime safeguards protecting the planning suite from unexpected interruptions.',
    ],
    details: 'Hardened the pre-launch experience for couples with smooth setup flows, explicit licensing tiers, and resilient error recovery.',
  },
  {
    version: 'v1.11.0',
    title: 'Monarch Admin Experience & Mobile Inspector',
    date: 'Oct 19, 2026',
    badge: 'Admin UX',
    badgeColor: '#7C3AED',
    category: 'feature',
    highlights: [
      'Monarch-inspired design for Admin portal with key metric cards and quick filters.',
      'Responsive grouped cards layout with touch-friendly actions on mobile screens.',
      'Slide-over inspector drawers for seamless user, license, and activity management.',
      'Enhanced privacy controls and administrative management tools.',
    ],
    details: 'Transformed administrative management with high-contrast cards, instant search, and mobile-friendly slide-over drawers.',
  },
  {
    version: 'v1.10.0',
    title: 'Universal Monarch Edit Screens',
    date: 'Oct 19, 2026',
    badge: 'Monarch UX',
    badgeColor: '#0284C7',
    category: 'feature',
    highlights: [
      'Slide-over edit drawers across guests, expenses, schedule, vendors, and tasks.',
      'Unified form controls, segmented pickers, and grouped input sections.',
      'Mobile bottom action bars with comfortable touch spacing and keyboard shortcuts.',
      'Frictionless escape and backdrop dismiss gestures with unsaved change protection.',
    ],
    details: 'Replaced disruptive popups with clean, responsive slide-over drawers inspired by modern financial apps.',
  },
  {
    version: 'v1.9.0',
    title: 'Mobile Tasks & Checklist Experience',
    date: 'Oct 19, 2026',
    badge: 'Tasks UX',
    badgeColor: '#EA580C',
    category: 'feature',
    highlights: [
      'Clear color accents categorized by priority (Urgent, High, Medium, Low).',
      'Quick filter chips for task status, priority, and assignees.',
      'Touch-optimized task action sheets and fast completion toggles.',
      'Streamlined planning cards with milestone progress tracking.',
    ],
    details: 'Re-imagined the mobile checklist experience with clean priority accents and rapid tactile task management.',
  },
  {
    version: 'v1.8.0',
    title: 'Seating Plan & Permanent Seat Numbers',
    date: 'Oct 19, 2026',
    badge: 'Seating',
    badgeColor: '#059669',
    category: 'fix',
    highlights: [
      'Reliable guest seat position saving across devices without reload shifting.',
      'Interactive table planner with numbered chairs and occupancy tracking.',
      'Theme-adaptive planning progress cards for Editorial and Botanical styles.',
    ],
    details: 'Fixed seating plan assignment state syncing and table position coordinates in the master spreadsheet.',
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
      'Eliminated stacked toast notifications during rapid edits.',
      'Background auto-save engine for seamless spreadsheet syncing.',
    ],
    details: 'Replaced save notification popups with a subtle, non-intrusive status indicator in the top header.',
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
