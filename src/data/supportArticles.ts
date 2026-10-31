export type SupportCategory = 
  | 'all'
  | 'activation' 
  | 'collaboration' 
  | 'sync' 
  | 'privacy' 
  | 'troubleshooting';

export interface SupportArticle {
  id: string;
  slug: string;
  category: 'activation' | 'collaboration' | 'sync' | 'privacy' | 'troubleshooting';
  categoryLabel: string;
  title: string;
  summary: string;
  keywords: string[];
  content: string[];
  callout?: {
    type: 'tip' | 'info' | 'warning';
    text: string;
  };
}

export const SUPPORT_CATEGORIES: { id: SupportCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Topics', icon: 'BookOpen' },
  { id: 'activation', label: 'Activation & Setup', icon: 'Zap' },
  { id: 'collaboration', label: 'Co-Planning & Sharing', icon: 'Users' },
  { id: 'sync', label: 'Sheets & Two-Way Sync', icon: 'Table' },
  { id: 'privacy', label: 'Privacy & Sovereignty', icon: 'ShieldCheck' },
  { id: 'troubleshooting', label: 'Troubleshooting & FAQ', icon: 'HelpCircle' },
];

export const SUPPORT_ARTICLES: SupportArticle[] = [
  {
    id: 'art-001',
    slug: 'how-to-find-etsy-order-number',
    category: 'activation',
    categoryLabel: 'Activation & Setup',
    title: 'How to Find Your 10-Digit Etsy Order Receipt Number',
    summary: 'Locate your numeric purchase receipt identifier in Etsy to activate your workspace.',
    keywords: ['etsy', 'order id', 'order number', 'receipt', 'activate', 'license', 'purchase'],
    content: [
      'To activate your Sheet2Suite or Sheet2Vow license, you will need your 10-digit numeric order receipt number from your purchase.',
      '1. Sign in to your Etsy account on a web browser or the Etsy app.',
      '2. Click on your profile avatar in the top right and select "Purchases and reviews".',
      '3. Locate your Sheet2Suite or Sheet2Vow purchase and click "View Receipt" (or "Download Files").',
      '4. Near the top of the receipt, you will find your 10-digit Order Number (e.g. 3489218492).',
      '5. Paste this number into the Order ID field on the activation page at activate.sheet2suite.com along with your email address.'
    ],
    callout: {
      type: 'tip',
      text: 'If you downloaded the official PDF guide from Etsy and clicked the direct activation button, your order number is automatically detected and filled in for you with an "AUTO-FILLED" badge.'
    }
  },
  {
    id: 'art-002',
    slug: 'how-workspace-activation-works',
    category: 'activation',
    categoryLabel: 'Activation & Setup',
    title: 'The 3-Step Workspace Setup & Provisioning Process',
    summary: 'Understand what happens during activation as your private spreadsheet is prepared.',
    keywords: ['setup', 'provisioning', 'google drive', 'stepper', 'how it works', 'steps'],
    content: [
      'The Sheet2Suite activation pipeline is designed to be frictionless, transparent, and completely private.',
      'Step 1 — License & Order Verification: Confirms your purchase entitlement and resolves the features included in your package.',
      'Step 2 — Google Account Connection: Connects your personal Google account with restricted drive.file permissions so the spreadsheet can be saved directly in your personal Google Drive.',
      'Step 3 — Custom Setup Wizard: Collects initial details (such as couple names, wedding date, currency, and starting budget) to pre-configure your workspace.',
      'Step 4 — Automated Live Provisioning: Our system duplicates the master template directly into your Google Drive, applies dropdown validation rules, and launches your digital canvas in 4 to 8 seconds.'
    ],
    callout: {
      type: 'info',
      text: 'You never need to manually download or upload XLSX files. Everything is created seamlessly and safely inside your own Google Drive.'
    }
  },
  {
    id: 'art-003',
    slug: 'where-is-spreadsheet-stored',
    category: 'activation',
    categoryLabel: 'Activation & Setup',
    title: 'Where Is My Spreadsheet Stored in Google Drive?',
    summary: 'Find the exact folder destination where your private Google Sheet is created.',
    keywords: ['folder', 'destination', 'my drive', 'storage', 'location', 'path', 'sheet link'],
    content: [
      'During activation, Sheet2Suite automatically creates a dedicated, organized folder in your personal Google Drive:',
      '• Path: My Drive / Sheet2Suite / Sheet2Vow (or the relevant sub-product name)',
      'Your spreadsheet lives permanently in this folder. It is owned 100% by your personal Google account.',
      'To open your spreadsheet directly in Google Sheets at any time, click your profile avatar in the top-right corner of Sheet2Vow and select "Open Google Spreadsheet".'
    ],
    callout: {
      type: 'tip',
      text: 'You can bookmark the direct Google Spreadsheet URL or add it to your "Starred" files in Google Drive for fast access across any computer or mobile device.'
    }
  },
  {
    id: 'art-004',
    slug: 'two-user-collaboration-model',
    category: 'collaboration',
    categoryLabel: 'Co-Planning & Sharing',
    title: 'How the 2-User Collaboration Model Works',
    summary: 'Learn about standard workspace limits, primary owner roles, and partner access.',
    keywords: ['users', 'partner', 'spouse', 'limit', 'collaborators', 'co-planner', 'seats', 'two users'],
    content: [
      'Every standard Sheet2Suite workspace supports up to 2 simultaneous collaborators: 1 Primary Owner + 1 Secondary Partner or Co-Planner.',
      'Both the primary owner and the partner have equal co-planning capabilities: both can view, edit, add, and delete records across all planning modules.',
      'Both users connect their personal Google accounts and receive direct Google Drive permissions on the spreadsheet file.',
      'This 2-user model ensures secure household co-planning while maintaining strict license integrity and sync performance.'
    ],
    callout: {
      type: 'info',
      text: 'Standard licenses enforce a maximum of 2 users. If you need to invite additional coordinators or party members, explore the Pro tier.'
    }
  },
  {
    id: 'art-005',
    slug: 'how-to-invite-partner-co-planner',
    category: 'collaboration',
    categoryLabel: 'Co-Planning & Sharing',
    title: 'How to Invite Your Partner or Co-Planner to Your Workspace',
    summary: 'Step-by-step instructions for adding your partner to your active workspace.',
    keywords: ['invite', 'add partner', 'share workspace', 'co-planner', 'permissions', 'email'],
    content: [
      'Inviting your spouse, fiance, or planning partner is simple and takes under 30 seconds:',
      '1. Open your Sheet2Vow workspace and navigate to Settings (gear icon in the top bar or sidebar).',
      '2. Select the "Workspace Users" tab.',
      '3. In the "Secondary Co-Planner" card, enter your partner\'s Google account email address.',
      '4. Click "Invite Partner".',
      '5. Sheet2Suite automatically grants their Google email editor permissions on your Google Drive spreadsheet and sends an email notification.',
      '6. Your partner can then sign in at vow.sheet2suite.com with their Google account to instantly co-plan with you!'
    ]
  },
  {
    id: 'art-006',
    slug: 'pro-tier-upgrade-advantages',
    category: 'collaboration',
    categoryLabel: 'Co-Planning & Sharing',
    title: 'When Do I Need a Pro Tier Upgrade?',
    summary: 'Discover what is included in Sheet2Vow Pro and how to unlock unlimited collaborator seats.',
    keywords: ['pro', 'upgrade', 'unlimited', 'coordinators', 'bridal party', 'tier', 'cost'],
    content: [
      'The Standard license covers the vast majority of couples with complete access to all 10 planning modules and 2 active co-planner seats.',
      'You should consider the Pro Tier upgrade if:',
      '• You are working with a professional wedding coordinator or day-of event manager who needs their own authenticated workspace seat.',
      '• You want to delegate tasks to bridesmaids, groomsmen, parents, or family members with individual Google accounts.',
      '• You require priority cloud synchronization and advanced multi-workspace management.',
      'When an owner attempts to invite a 3rd user, the system prompts the Pro Upgrade dialog with 1-click upgrade instructions.'
    ]
  },
  {
    id: 'art-007',
    slug: 'two-way-google-sheets-sync',
    category: 'sync',
    categoryLabel: 'Sheets & Two-Way Sync',
    title: 'How Two-Way Google Sheets Synchronization Operates',
    summary: 'Understand how edits made in the app reflect in Google Sheets and vice versa.',
    keywords: ['sync', 'bidirectional', 'real time', 'google sheets api', 'ambient sync', 'changes'],
    content: [
      'Sheet2Suite is a live visual canvas connected directly to your private Google Spreadsheet via Google Sheets API v4.',
      '• When you save in the app: Changes to guests, expenses, tasks, or timeline moments update your Google Sheet in real time. The Ambient Sync indicator in the top header confirms "Saved to Sheets".',
      '• When you edit directly in Google Sheets: You can open your spreadsheet in Google Sheets, enter rows or modify numbers, and your Sheet2Suite app will automatically reflect those updates upon your next page load or session refresh.',
      '• Zero Latency Caching: The app uses optimistic client updates so you never experience lag while typing or checking off tasks.'
    ],
    callout: {
      type: 'tip',
      text: 'Routine auto-saves are reflected quietly in the top masthead sync badge without disruptive popup toasts.'
    }
  },
  {
    id: 'art-008',
    slug: 'cellguard-formula-preservation',
    category: 'sync',
    categoryLabel: 'Sheets & Two-Way Sync',
    title: 'What Is CellGuard and How Are Spreadsheet Formulas Protected?',
    summary: 'Learn how our proprietary engine prevents accidental formula overwrites.',
    keywords: ['cellguard', 'formulas', 'sum', 'math', 'protection', 'safety', 'cells'],
    content: [
      'Spreadsheets derive their real power from formulas like =SUM(Expenses!E:E), =COUNTA(Guests!A:A), and dynamic percentage calculations.',
      'Traditional apps that write back to spreadsheets frequently overwrite formulas with raw numbers, permanently breaking the sheet.',
      'Sheet2Suite uses CellGuard: an intelligent engine that inspects every cell before writing. If a cell contains a formula, CellGuard preserves the exact formula string while updating only the underlying source data ranges.',
      'CellGuard also sanitizes all user inputs against malicious formula injection (e.g. leading = or + signs in text fields).'
    ]
  },
  {
    id: 'art-009',
    slug: 'offline-google-sheets-access',
    category: 'sync',
    categoryLabel: 'Sheets & Two-Way Sync',
    title: 'Can I Access My Data When Offline or Without Sheet2Suite?',
    summary: 'How to view, edit, and print your wedding planner even without internet access.',
    keywords: ['offline', 'no internet', 'airplane mode', 'export', 'google drive offline', 'mobile app'],
    content: [
      'Yes! Zero vendor lock-in means your data is never trapped in a proprietary database.',
      'Because all records are stored in a standard Google Spreadsheet in your personal Google Drive:',
      '1. Enable offline mode in Google Drive or download the official Google Sheets app on iOS or Android.',
      '2. Mark your Sheet2Vow spreadsheet as "Available offline".',
      '3. You can view guest lists, review timeline schedules, and check vendor contracts on an airplane or at remote wedding venues with zero Wi-Fi or cellular service.',
      'When your device reconnects to the internet, Google Drive syncs your changes automatically.'
    ]
  },
  {
    id: 'art-010',
    slug: 'google-oauth-drive-file-scope',
    category: 'privacy',
    categoryLabel: 'Privacy & Sovereignty',
    title: 'Why Does Sheet2Suite Only Request the "drive.file" OAuth Scope?',
    summary: 'Learn why our minimized permissions guarantee total privacy for your personal files.',
    keywords: ['privacy', 'oauth', 'scopes', 'security', 'drive.file', 'casa', 'permissions'],
    content: [
      'Many cloud apps request broad "Full Drive Access" (https://www.googleapis.com/auth/drive), allowing them to view every document, photo, and spreadsheet in your account.',
      'Sheet2Suite rejects broad access. We request strictly the narrowest non-sensitive scope available: https://www.googleapis.com/auth/drive.file.',
      'Under the drive.file scope, Google\'s security architecture physically prevents Sheet2Suite from seeing or opening any file in your Google Drive, EXCEPT the specific spreadsheets created by or explicitly opened with Sheet2Suite.',
      'Your personal photos, tax documents, work files, and private folders are completely invisible and inaccessible to us.'
    ],
    callout: {
      type: 'info',
      text: 'Our OAuth integration is verified by Google and satisfies strict zero-trust data protection principles.'
    }
  },
  {
    id: 'art-011',
    slug: 'resolving-session-expired-error',
    category: 'troubleshooting',
    categoryLabel: 'Troubleshooting & FAQ',
    title: 'Resolving "Session Expired" or Google Sign-In Prompts',
    summary: 'How to easily restore your connection when an authentication token times out.',
    keywords: ['session expired', '401', 'sign in with google', 'reauth', 'login prompt', 'token'],
    content: [
      'For your security, Google OAuth access tokens automatically expire after 60 minutes.',
      'Sheet2Suite implements a 90-day silent refresh engine that automatically renews your session in the background whenever you switch tabs or perform actions.',
      'If you ever see a "Session Expired" modal:',
      '1. Click the primary "Sign in with Google" button.',
      '2. Complete the standard Google popup authentication with the account that owns or co-plans your workspace.',
      '3. The modal will close automatically and your changes will resume seamlessly—no typed data or form progress will be lost.'
    ]
  },
  {
    id: 'art-012',
    slug: 'google-account-differs-from-etsy',
    category: 'troubleshooting',
    categoryLabel: 'Troubleshooting & FAQ',
    title: 'Can I Use a Different Google Account Than My Purchase Email?',
    summary: 'How to activate your workspace using any Google Drive account you prefer.',
    keywords: ['etsy email', 'different email', 'google account mismatch', 'purchase email'],
    content: [
      'Yes, absolutely. Your Etsy or Lemon Squeezy purchase receipt email does NOT need to match the Google account you use for Google Drive.',
      'During Step 0 of activation, enter your purchase receipt number and the email address used at checkout so we can verify your order.',
      'In Step 1, you can connect ANY personal or shared Google account where you want the spreadsheet to live.',
      'This is especially helpful for couples who purchased using a personal shopping email but want the wedding planner stored in a shared couple Google account.'
    ]
  },
  {
    id: 'art-013',
    slug: 'install-sheet2suite-as-pwa-app',
    category: 'troubleshooting',
    categoryLabel: 'Troubleshooting & FAQ',
    title: 'How to Install Sheet2Suite as an App on Your Phone or Tablet',
    summary: 'Add Sheet2Suite to your iPhone, iPad, or Android home screen for a full-screen app experience.',
    keywords: ['pwa', 'mobile app', 'home screen', 'install', 'iphone', 'android', 'safari'],
    content: [
      'Sheet2Suite is built as a Progressive Web App (PWA), meaning you can install it on your mobile device without going through the App Store or Google Play Store:',
      '• On iPhone / iPad (Safari): Open vow.sheet2suite.com, tap the "Share" button at the bottom of Safari, scroll down and tap "Add to Home Screen", then tap "Add".',
      '• On Android (Chrome): Open vow.sheet2suite.com, tap the three dots menu in the top right, and tap "Install app" or "Add to Home screen".',
      'This creates a standalone app icon on your home screen that opens in full-screen mode without browser address bars, complete with offline icon badging.'
    ]
  }
];
