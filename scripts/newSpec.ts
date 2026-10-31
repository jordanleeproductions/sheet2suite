import * as fs from 'fs';
import * as path from 'path';

function toTitleCase(kebab: string): string {
  return kebab
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getNextFeatureId(specsDir: string): string {
  let highestNum = 0;
  const regex = /FEAT-(\d+)/i;

  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const match = entry.name.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > highestNum) highestNum = num;
        }
        // Also check files inside for FEAT-XXX
        const subDir = path.join(dir, entry.name);
        const subFiles = fs.readdirSync(subDir);
        for (const file of subFiles) {
          if (file.endsWith('.md')) {
            const content = fs.readFileSync(path.join(subDir, file), 'utf8');
            const fileMatch = content.match(/FEAT-(\d+)/g);
            if (fileMatch) {
              for (const m of fileMatch) {
                const subNum = parseInt(m.replace(/\D/g, ''), 10);
                if (subNum > highestNum) highestNum = subNum;
              }
            }
          }
        }
      }
    }
  }

  scanDir(specsDir);
  const nextNum = highestNum + 1;
  return `FEAT-${String(nextNum).padStart(3, '0')}`;
}

async function main() {
  const args = process.argv.slice(2);
  const rawName = args[0];

  if (!rawName) {
    console.error('❌ Error: Missing feature name.\n');
    console.log('Usage:');
    console.log('  npm run spec:new <feature-name>');
    console.log('Example:');
    console.log('  npm run spec:new guest-rsvp-qr-code\n');
    process.exit(1);
  }

  const featureSlug = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!featureSlug) {
    console.error('❌ Error: Invalid feature name. Please use alphanumeric characters and hyphens.');
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, '..');
  const specsDir = path.join(rootDir, 'specs');
  const templateDir = path.join(specsDir, 'template');
  const targetDir = path.join(specsDir, featureSlug);

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Error: Specification directory already exists at specs/${featureSlug}`);
    process.exit(1);
  }

  if (!fs.existsSync(templateDir)) {
    console.error('❌ Error: Template directory specs/template not found.');
    process.exit(1);
  }

  const featureId = getNextFeatureId(specsDir);
  const featureTitle = toTitleCase(featureSlug);
  const todayDate = new Date().toISOString().split('T')[0];

  fs.mkdirSync(targetDir, { recursive: true });

  const templates = ['spec.md', 'plan.md', 'tasks.md'];
  for (const file of templates) {
    const srcPath = path.join(templateDir, file);
    const destPath = path.join(targetDir, file);

    let content = fs.readFileSync(srcPath, 'utf8');
    content = content.replace(/\[Epic \/ Feature Name\]/g, featureTitle);
    content = content.replace(/\[FEAT-XXX\]/g, `[${featureId}]`);
    content = content.replace(/YYYY-MM-DD/g, todayDate);
    content = content.replace(/\[feature-name\]/g, featureSlug);

    fs.writeFileSync(destPath, content, 'utf8');
  }

  // Update specs/README.md registry
  const readmePath = path.join(specsDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    const tableHeader = '| Feature ID | Feature Name | Product | Target Release | DRI / Lead | Status | Specification Links |\n|---|---|---|---|---|---|---|';
    const emptyRow = '| *None active* | *Run `npm run spec:new <feature-name>` to scaffold an epic* | — | — | — | — | — |';
    const newRow = `| **[${featureId}]** | ${featureTitle} | Sheet2Vow | Next Minor | Unassigned | Draft | [spec](${featureSlug}/spec.md) · [plan](${featureSlug}/plan.md) · [tasks](${featureSlug}/tasks.md) |`;

    if (readme.includes(emptyRow)) {
      readme = readme.replace(emptyRow, newRow);
    } else if (readme.includes(tableHeader)) {
      readme = readme.replace(tableHeader, `${tableHeader}\n${newRow}`);
    }

    fs.writeFileSync(readmePath, readme, 'utf8');
  }

  console.log(`\n✨ Successfully created new feature specification workspace!`);
  console.log(`📁 Directory:    specs/${featureSlug}/`);
  console.log(`🏷️  Feature ID:   [${featureId}]`);
  console.log(`📝 Title:        ${featureTitle}`);
  console.log(`📅 Created Date: ${todayDate}`);
  console.log(`\nNext Steps:`);
  console.log(`1. Fill in product requirements and acceptance criteria in: specs/${featureSlug}/spec.md`);
  console.log(`2. Define technical architecture and file blueprints in:     specs/${featureSlug}/plan.md`);
  console.log(`3. Break down execution tasks in:                           specs/${featureSlug}/tasks.md`);
  console.log(`4. Run validation when ready:                               npm run spec:validate\n`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
