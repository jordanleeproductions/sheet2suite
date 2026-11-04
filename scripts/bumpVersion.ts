import fs from 'fs';
import path from 'path';

type BumpType = 'patch' | 'minor' | 'major';
type SuiteProductId = 'suite' | 'vow' | 'vault' | 'finance' | 'home' | 'closet' | 'inventory';

const VALID_PRODUCTS: SuiteProductId[] = ['suite', 'vow', 'vault', 'finance', 'home', 'closet', 'inventory'];

const rawArgs = process.argv.slice(2);
const bumpArg = (rawArgs.find((a) => ['patch', 'minor', 'major'].includes(a)) as BumpType) || 'patch';
const productArgRaw = rawArgs.find((a) => !['patch', 'minor', 'major'].includes(a) && !a.startsWith('--'))
  || rawArgs.find((a) => a.startsWith('--product='))?.split('=')[1]
  || 'suite';

const targetProduct: SuiteProductId = VALID_PRODUCTS.includes(productArgRaw as SuiteProductId)
  ? (productArgRaw as SuiteProductId)
  : 'suite';

const buildInfoPath = path.resolve(process.cwd(), 'src/lib/buildInfo.ts');
let buildInfoContent = fs.readFileSync(buildInfoPath, 'utf-8');

const productBlockRegex = new RegExp(
  `(${targetProduct}:\\s*\\{[\\s\\S]*?version:\\s*['"]v?)(\\d+\\.\\d+\\.\\d+)(['"][\\s\\S]*?buildTimestamp:\\s*['"])([^'"]+)(['"][\\s\\S]*?buildEpoch:\\s*)(\\d+)(,[\\s\\S]*?buildIso:\\s*['"])([^'"]+)(['"])`,
  'm'
);

const match = buildInfoContent.match(productBlockRegex);
if (!match) {
  console.error(`Could not locate product "${targetProduct}" in src/lib/buildInfo.ts`);
  process.exit(1);
}

const currentSemver = match[2];
const [major, minor, patch] = currentSemver.split('.').map(Number);

let nextMajor = major;
let nextMinor = minor;
let nextPatch = patch;

if (bumpArg === 'major') {
  nextMajor += 1;
  nextMinor = 0;
  nextPatch = 0;
} else if (bumpArg === 'minor') {
  nextMinor += 1;
  nextPatch = 0;
} else {
  nextPatch += 1;
}

const nextVersion = `${nextMajor}.${nextMinor}.${nextPatch}`;
const nextVersionTag = `v${nextVersion}`;
const now = new Date();
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const month = months[now.getMonth()];
const day = now.getDate();
const year = now.getFullYear();
let hours = now.getHours();
const minutes = now.getMinutes().toString().padStart(2, '0');
const ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12;
const formattedTimestamp = `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
const epoch = now.getTime();
const iso = now.toISOString();

buildInfoContent = buildInfoContent.replace(
  productBlockRegex,
  `$1${nextVersion}$3${formattedTimestamp}$5${epoch}$7${iso}$9`
);

fs.writeFileSync(buildInfoPath, buildInfoContent, 'utf-8');

if (targetProduct === 'suite') {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = nextVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}

const releaseNotesPath = path.resolve(process.cwd(), 'src/lib/releaseNotes.ts');
if (fs.existsSync(releaseNotesPath)) {
  const notesContent = fs.readFileSync(releaseNotesPath, 'utf-8');
  const arrayMap: Record<SuiteProductId, string> = {
    suite: 'SUITE_RELEASE_NOTES',
    vow: 'VOW_RELEASE_NOTES',
    vault: 'VAULT_RELEASE_NOTES',
    finance: 'SUITE_RELEASE_NOTES',
    home: 'SUITE_RELEASE_NOTES',
    closet: 'SUITE_RELEASE_NOTES',
    inventory: 'SUITE_RELEASE_NOTES',
  };
  const targetArrayName = arrayMap[targetProduct];

  if (!notesContent.includes(`version: '${nextVersionTag}'`)) {
    const formattedDate = `${month} ${day}, ${year}`;
    const category = bumpArg === 'major' ? 'major' : bumpArg === 'minor' ? 'feature' : 'fix';
    const badgeColor = targetProduct === 'suite' ? '#4F46E5' : targetProduct === 'vow' ? '#059669' : '#D97706';

    const newNoteEntry = `  {
    version: '${nextVersionTag}',
    product: '${targetProduct}',
    title: '${targetProduct === 'suite' ? 'Sheet2Suite Platform' : targetProduct === 'vow' ? 'Sheet2Vow' : 'Sheet2Vault'} Update (${nextVersionTag})',
    date: '${formattedDate}',
    badge: 'Latest',
    badgeColor: '${badgeColor}',
    category: '${category}',
    highlights: [
      'Refined user experience, interface responsiveness, and reliability improvements.',
    ],
    details: 'Summary of user-facing improvements and fixes for this release.',
  },`;

    const arrayExportMarker = `export const ${targetArrayName}: ReleaseNoteItem[] = [`;
    if (notesContent.includes(arrayExportMarker)) {
      const [beforeMarker, afterMarker] = notesContent.split(arrayExportMarker);
      const updatedAfter = afterMarker.replace(`badge: 'Latest'`, `badge: 'Update'`);
      const updatedNotes = `${beforeMarker}${arrayExportMarker}\n${newNoteEntry}${updatedAfter}`;
      fs.writeFileSync(releaseNotesPath, updatedNotes, 'utf-8');
      console.log(`📝 Added ${nextVersionTag} release note entry to ${targetArrayName} in src/lib/releaseNotes.ts`);
    }
  }
}

console.log(`✅ Bumped [${targetProduct.toUpperCase()}] to ${nextVersionTag} (${formattedTimestamp})`);
