import { SuiteProductId } from '@/lib/buildInfo';

export interface ReleaseNoteItem {
  version: string;
  product?: SuiteProductId;
  title: string;
  date: string;
  badge?: string;
  badgeColor?: string;
  highlights: string[];
  details?: string;
  category?: 'major' | 'feature' | 'enhancement' | 'fix';
}

export const SUITE_RELEASE_NOTES: ReleaseNoteItem[] = [
  {
    version: 'v1.23.4',
    product: 'suite',
    title: 'Admin Authentication Privacy & Security Hardening',
    date: 'Nov 3, 2026',
    badge: 'Latest',
    badgeColor: '#4F46E5',
    category: 'fix',
    highlights: [
      'Eliminated administrator email exposure from the Admin Portal authentication interface.',
      'Enforced zero-trust allowlist messaging without revealing privileged account identities.',
      'Sanitized default developer input states across private preview gates.',
    ],
    details: 'Hardens administrative privacy by preventing email disclosure on public authentication screens.',
  },
  {
    version: 'v1.23.3',
    product: 'suite',
    title: 'Multi-Product Version Isolation & Release Architecture',
    date: 'Nov 3, 2026',
    badge: 'Update',
    badgeColor: '#4F46E5',
    category: 'enhancement',
    highlights: [
      'Decoupled version tracking between Sheet2Suite (Platform & Admin), Sheet2Vow, Sheet2Vault, and future suite products.',
      'Isolated customer-facing release notes so Admin Portal and core platform updates no longer alter the Sheet2Vow version or trigger false update banners for wedding planners.',
      'Upgraded Admin Release Notes Inspector with per-product filtering, multi-product build version matrix, and product-scoped bump scripts.',
    ],
    details: 'Separates platform-level and administrative versioning from individual customer-facing suite applications.',
  },
  {
    version: 'v1.23.2',
    product: 'suite',
    title: 'Pre-Launch Security Hardening & Order Verification Safeguards',
    date: 'Nov 3, 2026',
    badge: 'Update',
    badgeColor: '#4F46E5',
    category: 'fix',
    highlights: [
      'Cryptographic workspace session tokens (HMAC-SHA256 HttpOnly cookies) verifying caller ownership on all spreadsheet APIs.',
      'Strict 9-to-11 digit Etsy receipt validation with purchaser email binding and explicit promo secret gating.',
      'Distributed Firestore rate limiting across authentication, order activation, and support endpoints.',
      'Hardened OAuth postMessage origin allowlisting and Content Security Policy frame protections.',
    ],
    details: 'Comprehensive zero-trust security hardening across platform licensing, OAuth handshakes, and API boundaries.',
  },
  {
    version: 'v1.23.1',
    product: 'suite',
    title: 'Admin Portal Brand Alignment & Refinements',
    date: 'Nov 3, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'fix',
    highlights: [
      'Streamlined admin navigation and header branding across the administrative suite.',
      'Refined portal status pills and identity badges for seamless platform consistency.',
      'Polished authentication modal transitions and diagnostic inspector controls.',
    ],
    details: 'Brand alignment and administrative interface refinements across the Sheet2Suite console.',
  },
  {
    version: 'v1.23.0',
    product: 'suite',
    title: 'Sheet2Suite Admin Suite & Platform Diagnostics',
    date: 'Nov 3, 2026',
    badge: 'Update',
    badgeColor: '#059669',
    category: 'feature',
    highlights: [
      'Executive Operations Pulse dashboard tracking active workspaces and platform telemetry.',
      'License Key & Google Sheet relational tracker with quick audit and sheet navigation.',
      'Advanced Sheet Validator with tab compliance auditing and 1-click header auto-repair.',
      'Golden Master Template Inspector supporting both Sheet2Vow and upcoming Sheet2Vault.',
      'Full WCAG AA visual contrast overhaul resolving font readability across light surfaces and buttons.',
    ],
    details: 'Comprehensive administrative tooling and diagnostic engines to monitor customer workspaces and maintain canonical spreadsheet integrity.',
  },
  {
    version: 'v1.22.2',
    product: 'suite',
    title: 'Google OAuth Admin Identity Authentication',
    date: 'Nov 2, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'enhancement',
    highlights: [
      'Google Identity sign-in: Upgraded Admin Portal login from manual secret key entry to 1-click Google OAuth authentication.',
      'Strict email allowlist: Enforced zero-trust access control allowing only verified administrator Google accounts to unlock the portal.',
      'Secure HMAC session: Introduced signed, tamper-proof HttpOnly administrator sessions with automatic identity recognition.',
    ],
    details: 'Strengthens administrative security by replacing password-based entry with cryptographically verified Google account authentication restricted to authorized platform owners.',
  },
  {
    version: 'v1.22.1',
    product: 'suite',
    title: 'Mobile Experience Polish & Platform Refinements',
    date: 'Nov 2, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'enhancement',
    highlights: [
      'Mobile Navigation Redesign: Streamlined the parent hub header into a balanced two-tier utility strip on smartphones, eliminating horizontal overflow and button clipping.',
      'Fluid Typography & Responsive Grids: Added dynamic fluid headline scaling and full-width thumb-friendly action buttons for smaller mobile viewports.',
      'Google OAuth Administrative Sign-In: Enabled secure one-click Google OAuth authentication for authorized platform administrators with popup handshake fallback.',
    ],
    details: 'Improves smartphone usability and navigation on the main platform hub, ensuring a smooth, zero-overflow browsing experience on all screen sizes, and introduces seamless Google OAuth for admin portal management.',
  },
  {
    version: 'v1.22.0',
    product: 'suite',
    title: 'Admin Portal Redesign & Product Ecosystem Focus',
    date: 'Nov 2, 2026',
    badge: 'Update',
    badgeColor: '#059669',
    category: 'enhancement',
    highlights: [
      'Monarch Admin Portal UX: Fully aligned the database and entitlements inspector with the Sheet2Suite design system tokens, typography, and theme engine.',
      'Refined suite showcase: Streamlined product family roadmap cards to highlight upcoming applications, featuring Sheet2Vault alongside Sheet2Vow.',
      'Unified licensing & checkout: Standardized Etsy order activation and verified license provisioning across all platforms.',
    ],
    details: 'Modernizes administrative workspace inspection tools, cleans up product family roadmaps to focus on upcoming suite canvases, and refines license activation across the platform.',
  },
  {
    version: 'v1.21.1',
    product: 'suite',
    title: 'Support & Help Center Design System Alignment',
    date: 'Oct 30, 2026',
    badge: 'Update',
    badgeColor: '#10B981',
    category: 'enhancement',
    highlights: [
      'Platform visual harmony: Aligned the Help Center layout, typography, and card hierarchy with the parent Sheet2Suite design system.',
      'Dynamic theme responsiveness: Connected all guide cards, search inputs, and category pills directly to the platform theme engine for seamless light and dark mode adaptivity.',
      'Enhanced navigation: Introduced a subpage navigation bar matching Privacy and Terms with one-click return to the main platform hub.',
    ],
    details: 'Refines the Support & Help Center visual experience, unifying it with the Sheet2Suite design system, CSS custom property tokens, and multi-theme architecture.',
  },
  {
    version: 'v1.21.0',
    product: 'suite',
    title: 'Monarch Editorial Help Center & Knowledge Base',
    date: 'Oct 30, 2026',
    badge: 'Update',
    badgeColor: '#059669',
    category: 'feature',
    highlights: [
      'Official Support & Help Center: Launched a dedicated knowledge base at /support with instant search, interactive guide accordions, and categorized tutorials.',
      'Comprehensive onboarding guides: Step-by-step instructions for finding order receipts, connecting Google Drive, understanding drive.file privacy, and sharing workspaces.',
      'Co-planning & sharing clarity: Clear guides explaining the 2-user household collaboration model and coordinator Pro tier options.',
      'In-page diagnostic support: Integrated direct support contact form with automatic non-sensitive diagnostic telemetry for rapid assistance.',
    ],
    details: 'Introduces a comprehensive, searchable Help Center and knowledge base educating users on workspace activation, co-planning, two-way sync, and data sovereignty.',
  },
  {
    version: 'v1.20.1',
    product: 'suite',
    title: 'Spec Kit Feature Pipeline Automation & Architectural Governance',
    date: 'Oct 30, 2026',
    badge: 'Update',
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
    product: 'suite',
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
];

export const VOW_RELEASE_NOTES: ReleaseNoteItem[] = [
  {
    version: 'v1.19.0',
    product: 'vow',
    title: 'Curated Wedding Styles: Editorial, Botanical & Formal Streamlining',
    date: 'Oct 29, 2026',
    badge: 'Latest',
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
    product: 'vow',
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
    product: 'vow',
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
    product: 'vow',
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
    product: 'vow',
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
    product: 'vow',
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

export const VAULT_RELEASE_NOTES: ReleaseNoteItem[] = [
  {
    version: 'v0.1.0',
    product: 'vault',
    title: 'Sheet2Vault Developer Preview & Insurance Claim Dossier Engine',
    date: 'Nov 2, 2026',
    badge: 'Preview',
    badgeColor: '#D97706',
    category: 'major',
    highlights: [
      'Room-by-room personal asset inventory ledger with serial number, model, and replacement value tracking.',
      'Automated policy sub-limit alerts for high-value categories including Jewelry and Electronics.',
      'Claim readiness scoring and 1-click Insurance Claim Dossier preview.',
    ],
    details: 'Initial private developer preview of Sheet2Vault for home asset protection and insurance documentation.',
  },
];

export const PRODUCT_RELEASE_NOTES: Record<SuiteProductId, ReleaseNoteItem[]> = {
  suite: SUITE_RELEASE_NOTES,
  vow: VOW_RELEASE_NOTES,
  vault: VAULT_RELEASE_NOTES,
  finance: [],
  home: [],
  closet: [],
  inventory: [],
};

export const ALL_RELEASE_NOTES: ReleaseNoteItem[] = [
  ...SUITE_RELEASE_NOTES,
  ...VOW_RELEASE_NOTES,
  ...VAULT_RELEASE_NOTES,
];

export function getReleaseNotesByProduct(product: SuiteProductId | 'all' = 'vow'): ReleaseNoteItem[] {
  if (product === 'all') {
    return ALL_RELEASE_NOTES;
  }
  return PRODUCT_RELEASE_NOTES[product] || [];
}

// Default export for backward compatibility in /vow components
export const RELEASE_NOTES: ReleaseNoteItem[] = VOW_RELEASE_NOTES;
