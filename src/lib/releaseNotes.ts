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
    version: 'v1.20.1',
    title: 'Spec Kit Feature Pipeline Automation & Architectural Governance',
    date: 'Oct 30, 2026',
    badge: 'Latest',
    badgeColor: '#10B981',
    category: 'enhancement',
    highlights: [
      'Architectural Constitution: Formalized non-negotiable core invariants for data sovereignty, spreadsheet formula preservation, and mobile touch discipline.',
      'Automated feature scaffolding: Integrated rapid spec generation and registry automation for upcoming platform and suite capabilities.',
      'Quality validation engine: Added automated specification auditing to guarantee complete acceptance criteria, non-goals, and technical blueprints before development.',
    ],
    details: 'Establishes full Spec Kit pipeline automation, lifecycle registry tracking, and architectural constitution governance across the engineering workflow.',
  },
  {
    version: 'v1.20.0',
    title: 'Modular Documentation & Hybrid Spec Architecture',
    date: 'Oct 30, 2026',
    badge: 'Update',
    badgeColor: '#059669',
    category: 'feature',
    highlights: [
      'Modular platform architecture: Reorganized platform specifications into focused core guides for activation, licensing, routing, and design systems.',
      'Domain module specifications: Established dedicated, domain-specific specifications for seating floorplans, guest registry, financials, timelines, vendors, and settings.',
      'Spec kit feature pipeline: Introduced standardized feature planning blueprints to ensure consistent quality, design harmony, and rigor across all upcoming suite capabilities.',
      'Preserved schema integrity: Centralized the authoritative 15-tab spreadsheet contracts and archived completed historical feature milestones.',
    ],
    details: 'Establishes a modular hybrid documentation architecture and standardized feature engineering framework across the Sheet2Suite platform and Sheet2Vow application.',
  },
  {
    version: 'v1.19.0',
    title: 'Curated Wedding Styles: Editorial, Botanical & Formal Streamlining',
    date: 'Oct 29, 2026',
    badge: 'Update',
    badgeColor: '#059669',
    category: 'enhancement',
    highlights: [
      'Focused aesthetic choices: Streamlined the suite appearance settings to three authentic wedding styles—Editorial Minimalist (classic serif paper), Botanical Romance (earthy forest and sage), and Formal (obsidian black-tie gala).',
      'Consistent visual harmony: Retired the experimental neo-brutalist display style, eliminating harsh neon green accents and ensuring a cohesive, luxury wedding aesthetic across every tab.',
      'Enhanced interface performance: Streamlined global stylesheets and component framing across all viewports, delivering snappier page loads and smoother navigation.',
      'Seamless automatic transition: Existing accounts seamlessly transition to the timeless Editorial style with zero action required and full preservation of all event data.',
    ],
    details: 'Curates the wedding display styles into three timeless, high-contrast aesthetics matching real-world wedding themes while streamlining suite performance and interface harmony.',
  },
  {
    version: 'v1.18.3',
    title: 'Account Authentication & Connection Protection',
    date: 'Oct 29, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'fix',
    highlights: [
      'Upgraded account connection and sign-in verification safeguards.',
      'Protected Google account linking against session tampering and cross-browser interference.',
      'Refined connection reliability and smooth background authorization for connected spreadsheets.',
    ],
    details: 'Enhanced sign-in and Google account verification protocols to ensure secure, tamper-proof connection handling when linking your wedding spreadsheets.',
  },
  {
    version: 'v1.18.2',
    title: 'Workspace Data Protection & Access Safeguards',
    date: 'Oct 29, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'fix',
    highlights: [
      'Reinforced workspace authorization and privacy controls across all connected spreadsheets.',
      'Enhanced account session security and background verification.',
      'Strengthened multi-planner data synchronization and collaborative safeguards.',
    ],
    details: 'Upgraded workspace privacy and access controls to ensure your wedding planning data is always securely protected and only accessible to authorized planners.',
  },
  {
    version: 'v1.18.1',
    title: 'Modern Style Aesthetic Polish & High-Contrast Light Mode Support',
    date: 'Oct 29, 2026',
    badge: 'Update',
    badgeColor: '#059669',
    category: 'fix',
    highlights: [
      'Authentic Modern aesthetic in Light mode: sharp dark borders and crisp offset drop shadows now render cleanly across all cards, containers, buttons, and input fields.',
      'Refined visual hierarchy: optimized muted text tones ensure timestamps, labels, badges, and secondary notes remain readable and properly balanced against primary headings.',
      'Perfect button & header contrast: primary action buttons, dialog headers, and active segment pills now maintain clear, high-contrast text and icons in every color mode.',
      'Cohesive technical navigation: the sidebar and mobile drawer now cleanly honor the technical Geist typography and structured framing when switching to Modern style.',
    ],
    details: 'Restores full visual fidelity and high-contrast ergonomics to the Modern display style in Light mode, delivering the intended crisp borders, offset drop shadows, and balanced technical typography.',
  },
  {
    version: 'v1.18.0',
    title: 'Music & Playlists Modernization, Dual View Modes & Docked Audio Player',
    date: 'Oct 29, 2026',
    badge: 'Update',
    badgeColor: '#059669',
    category: 'feature',
    highlights: [
      'Dual view mode switcher: toggle seamlessly between an expansive visual card grid and a high-density curator playlist table on desktop.',
      'Wedding moment & priority segmentation: effortlessly browse tracks by occasion (Ceremony, Special Dances, Reception, or Do Not Play) and filter by urgency (Must Play or Play If Time).',
      'Docked live audio mini-player: listen to 30-second previews with a persistent floating bottom dock complete with track details, seekable scrubber, and one-tap streaming links.',
      'One-click DJ setlist export: copy your complete formatted wedding playlist and cue notes to your clipboard in one tap for quick pasting into DJ forms or emails.',
      'Overhauled track inspector drawer: search the iTunes catalog with live cover art previews, set DJ cues, and assign priority levels with tactile pills.',
    ],
    details: 'Modernizes the wedding music curation experience with a professional playlist table view, floating audio player, occasion-based filtering, and one-click setlist sharing for DJs.',
  },
  {
    version: 'v1.17.5',
    title: 'Smart Form Validation & Disabled Save Button Visual Guardrails',
    date: 'Oct 28, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'enhancement',
    highlights: [
      'Real-time required field validation: Save and Save & Add New buttons across all planning modules now remain disabled until all mandatory fields are populated.',
      'Clear visual feedback: disabled save buttons appear distinctly dimmed with a muted palette and helpful hover tooltips indicating which required fields are missing.',
      'Instant activation on input: as soon as all required fields are entered when adding or editing records, save actions immediately illuminate in full color.',
    ],
    details: 'Prevents incomplete records across Guests, Gifts, Vendors, Financials, Tasks, Timeline, Music, Photo Shots, Menu, and Seating by disabling and visually dimming save actions until all mandatory fields are filled.',
  },
];
