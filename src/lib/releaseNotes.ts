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
    version: 'v1.17.5',
    title: 'Smart Form Validation & Disabled Save Button Visual Guardrails',
    date: 'Oct 28, 2026',
    badge: 'Latest',
    badgeColor: '#10B981',
    category: 'enhancement',
    highlights: [
      'Real-time required field validation: Save and Save & Add New buttons across all planning modules now remain disabled until all mandatory fields are populated.',
      'Clear visual feedback: disabled save buttons appear distinctly dimmed with a muted palette and helpful hover tooltips indicating which required fields are missing.',
      'Instant activation on input: as soon as all required fields are entered when adding or editing records, save actions immediately illuminate in full color.',
    ],
    details: 'Prevents incomplete records across Guests, Gifts, Vendors, Financials, Tasks, Timeline, Music, Photo Shots, Menu, and Seating by disabling and visually dimming save actions until all mandatory fields are filled.',
  },
  {
    version: 'v1.17.4',
    title: 'Mobile Guest Edit Screen Redesign & Compact Release History',
    date: 'Oct 28, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'enhancement',
    highlights: [
      'Redesigned mobile guest editing: guest details are now organized into dedicated, card-based sections (Identity, Attendance, Seating, Catering, Contact) that smoothly collapse to full-width on mobile screens.',
      'Quick-touch RSVP selector: update attendance instantly with large, tactile buttons that clearly reflect pending, attending, or declined status.',
      'Context-aware form simplification: when a guest declines attendance, seating and catering fields are cleanly replaced with a helpful notice, keeping mobile screens uncluttered.',
      'Streamlined release notes: the release notes viewer now focuses exclusively on the active update and the preceding release for clean, clutter-free reading.',
      'Responsive vendor edit forms: vendor inspector forms now reflow seamlessly into a comfortable single-column layout on mobile devices.',
    ],
    details: 'Brings modern card-based organization and single-tap RSVP controls to the mobile guest editing experience while keeping update history focused and easy to digest.',
  },
  {
    version: 'v1.17.3',
    title: 'Mobile Thank You Tracker Layout & Input Refinements',
    date: 'Oct 28, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'fix',
    highlights: [
      'Compact mobile search & filter spacing: removed extra vertical whitespace around the Thank You tracker search bar and category/status dropdowns on mobile screens.',
      'Clean currency & giver icon alignment: fixed overlapping currency symbols and guest icons inside the Received Gift form drawer on mobile devices.',
      'Polished mobile drawer input ergonomics: preserved custom leading icon spacing across all mobile slide-over forms while maintaining touch-friendly heights.',
    ],
    details: 'Refines the mobile Thank You & Gift Tracker experience by eliminating excess vertical gaps around search and filter controls and ensuring leading icons in the gift logging drawer never overlap text.',
  },
  {
    version: 'v1.17.2',
    title: 'Setup Wizard Budget Flexibility & Education Callout',
    date: 'Oct 27, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'enhancement',
    highlights: [
      'Clear budget flexibility education: step 5 now explicitly reassures couples that setting a total budget is optional and can be adjusted anytime.',
      'Dynamic target budget status pill: real-time summary pill confirming whether a target budget is configured or operating in flexible mode.',
      'Clearer budget input labels: added optional indicator and helpful guidance directly below budget inputs during setup.',
    ],
    details: 'Enhances the setup wizard with an educational callout explaining that total budgets are optional and can be updated anytime later in Financials settings, eliminating onboarding hesitation.',
  },
  {
    version: 'v1.17.1',
    title: 'Setup Wizard Ergonomics & Currency Refinements',
    date: 'Oct 27, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'fix',
    highlights: [
      'Smart co-planner permission handling: co-admin access checkbox now intelligently auto-checks when a partner email is entered.',
      'Automatic thousand comma formatting: budget numbers now format automatically with readable thousand separators (e.g. 35,000) as you type.',
      'Expanded international currency support: widened currency selector to display full labels clearly and added New Zealand Dollar (NZL $) support.',
      'Streamlined contact inputs: simplified partner contact details to focus exclusively on essential email addresses.',
      'Curated checklist presets: removed duplicate blank template options so couples choose between pre-built checklists or a clean slate with zero confusion.',
      'Music module label alignment: updated music selection in setup to focus purely on ceremony, reception, and DJ playlists.',
    ],
    details: 'Setup wizard polish addressing partner co-planner permissions, currency selector visibility, New Zealand Dollar support, real-time thousand comma formatting for budget inputs, and refined checklist templates.',
  },
  {
    version: 'v1.17.0',
    title: 'Streamlined Setup Flow & Guided Onboarding Experience',
    date: 'Oct 26, 2026',
    badge: 'Update',
    badgeColor: '#059669',
    category: 'feature',
    highlights: [
      'Top-level visual progress tracker: clear 3-stage roadmap guiding you from license confirmation through Google Drive connection to wedding setup.',
      'Smart celebration naming & contact setup: enter partner names once to automatically generate your wedding title, eliminating repetitive typing.',
      'Dynamic wedding date calculation: smart date picker automatically defaults to a realistic future weekend date 6 months ahead.',
      'Live provisioning milestone checklist: real-time animated checklist displaying setup progress as your private Google Drive spreadsheet is initialized.',
      'Mobile touch ergonomics: polished form inputs with touch-friendly heights and anti-zoom scaling optimized for smartphone web browsers.',
    ],
    details: 'Comprehensive redesign of the initial activation and onboarding experience featuring an intuitive top-level stepper, intelligent name derivations, dynamic calendar recommendations, touch-friendly mobile styling, and transparent live spreadsheet initialization.',
  },
  {
    version: 'v1.16.0',
    title: 'Streamlined Setup & Data Sovereignty Architecture',
    date: 'Oct 24, 2026',
    badge: 'Update',
    badgeColor: '#059669',
    category: 'feature',
    highlights: [
      'Automated Google Drive workspace setup: your wedding spreadsheet is now automatically organized into a dedicated, private folder with zero manual configuration.',
      'Least-privilege cloud data protection: simplified permissions ensuring the application only accesses files created specifically for your wedding.',
      'Dedicated legal compliance and data protection guidelines accessible directly across the app.',
      'Clear, focused workspace launch experience designed specifically for wedding couples and planners.',
    ],
    details: 'Introduces automated Google Drive folder organization, streamlined setup workflows, least-privilege cloud access protection, and published data privacy guidelines.',
  },
  {
    version: 'v1.15.5',
    title: 'Workspace Privacy Protection & Identity Verification',
    date: 'Oct 22, 2026',
    badge: 'Update',
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
