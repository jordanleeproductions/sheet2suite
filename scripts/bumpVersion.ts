import fs from 'fs';
import path from 'path';

/**
 * Version Bumping Script for Sheet2Vow
 * 
 * Rules:
 * - patch: Bug fixes, styling tweaks, minor cleanups (e.g. 1.2.1 -> 1.2.2).
 * - minor: Features added, updated, or removed (e.g. 1.2.2 -> 1.3.0).
 * - major: Significant changes / "New release bundles" (e.g. 1.3.0 -> 2.0.0). Only when explicitly requested.
 *
 * Usage:
 *   npx tsx scripts/bumpVersion.ts [patch|minor|major]
 */

const type = (process.argv[2] || 'patch').toLowerCase() as 'patch' | 'minor' | 'major';

if (!['patch', 'minor', 'major'].includes(type)) {
  console.error(`Invalid version bump type: "${type}". Must be "patch", "minor", or "major".`);
  process.exit(1);
}

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const buildInfoPath = path.resolve(process.cwd(), 'src/lib/buildInfo.ts');
const releaseNotesPath = path.resolve(process.cwd(), 'src/lib/releaseNotes.ts');

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = pkg.version || '1.2.1';
const [majorStr, minorStr, patchStr] = currentVersion.split('.');

let major = parseInt(majorStr, 10) || 1;
let minor = parseInt(minorStr, 10) || 0;
let patch = parseInt(patchStr, 10) || 0;

if (type === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (type === 'minor') {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;
pkg.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// Format date & time in user's locale/standard format: e.g. "Oct 17, 2026 • 11:07 AM"
const now = new Date();
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const month = months[now.getMonth()];
const day = now.getDate();
const year = now.getFullYear();

let hours = now.getHours();
const minutes = now.getMinutes().toString().padStart(2, '0');
const ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12; // 0 becomes 12

const formattedTimestamp = `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
const isoTimestamp = now.toISOString();

const buildInfoContent = `// Application Build & Version Information
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'v${newVersion}';
export const BUILD_TIMESTAMP = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || '${formattedTimestamp}';
export const BUILD_ISO = process.env.NEXT_PUBLIC_BUILD_ISO || '${isoTimestamp}';
`;

fs.writeFileSync(buildInfoPath, buildInfoContent, 'utf8');

// Synchronize src/lib/releaseNotes.ts automatically
if (fs.existsSync(releaseNotesPath)) {
  let releaseNotesContent = fs.readFileSync(releaseNotesPath, 'utf8');
  const versionTag = `v${newVersion}`;

  if (!releaseNotesContent.includes(`version: '${versionTag}'`)) {
    // Demote any existing 'Latest' badges in past releases to an appropriate badge
    releaseNotesContent = releaseNotesContent.replace(/badge: 'Latest',/g, "badge: 'Update',");

    const defaultTitle = type === 'major'
      ? 'Major Platform Release'
      : type === 'minor'
      ? 'New Features & Enhancements'
      : 'Performance Improvements & Refinements';

    const defaultBadgeColor = type === 'major' ? '#7C3AED' : type === 'minor' ? '#059669' : '#10B981';
    const defaultCategory = type === 'major' ? 'major' : type === 'minor' ? 'feature' : 'fix';

    const defaultHighlights = type === 'minor'
      ? [
          'New planning features and workflow enhancements.',
          'Responsive design refinements across mobile and desktop views.',
          'Smooth and reliable background data synchronization.',
        ]
      : [
          'Platform stability enhancements and performance optimizations.',
          'User interface refinements and responsive layout polish.',
          'General improvements to planning suite reliability.',
        ];

    const highlightsStr = defaultHighlights.map(h => `      '${h}',`).join('\n');

    const newEntry = `  {
    version: '${versionTag}',
    title: '${defaultTitle}',
    date: '${month} ${day}, ${year}',
    badge: 'Latest',
    badgeColor: '${defaultBadgeColor}',
    category: '${defaultCategory}',
    highlights: [
${highlightsStr}
    ],
    details: 'Continuous platform enhancements to make your wedding planning experience smoother and more reliable.',
  },\n`;

    const marker = 'export const RELEASE_NOTES: ReleaseNoteItem[] = [\n';
    if (releaseNotesContent.includes(marker)) {
      releaseNotesContent = releaseNotesContent.replace(marker, marker + newEntry);
      fs.writeFileSync(releaseNotesPath, releaseNotesContent, 'utf8');
      console.log(`✓ Synchronized src/lib/releaseNotes.ts with ${versionTag} entry.`);
    }
  }
}

console.log(`Successfully bumped to ${newVersion} (${type}) • Deployed: ${formattedTimestamp}`);
console.log(`ℹ️  Reminder: Keep release notes user-facing, high-level, and free of code or internal method names.`);
