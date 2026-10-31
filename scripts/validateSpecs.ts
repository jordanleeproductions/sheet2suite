import * as fs from 'fs';
import * as path from 'path';

interface SpecValidationResult {
  slug: string;
  errors: string[];
  warnings: string[];
}

function validateSpecDirectory(specDir: string): SpecValidationResult {
  const slug = path.basename(specDir);
  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredFiles = ['spec.md', 'plan.md', 'tasks.md'];
  for (const file of requiredFiles) {
    const filePath = path.join(specDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  // Check spec.md
  const specPath = path.join(specDir, 'spec.md');
  if (fs.existsSync(specPath)) {
    const content = fs.readFileSync(specPath, 'utf8');
    if (!content.includes('Acceptance Criteria')) {
      errors.push('spec.md must include an "Acceptance Criteria" section.');
    }
    if (!content.includes('Non-Goals') && !content.includes('Scope Guardrails')) {
      errors.push('spec.md must include an "Explicit Non-Goals" or "Scope Guardrails" section.');
    }
    if (content.includes('[FEAT-XXX]')) {
      warnings.push('spec.md still contains unreplaced placeholder [FEAT-XXX].');
    }
  }

  // Check plan.md
  const planPath = path.join(specDir, 'plan.md');
  if (fs.existsSync(planPath)) {
    const content = fs.readFileSync(planPath, 'utf8');
    if (!content.includes('Target Files') && !content.includes('File Inventory')) {
      warnings.push('plan.md should include a Target Files or File Inventory section.');
    }
  }

  // Check tasks.md
  const tasksPath = path.join(specDir, 'tasks.md');
  if (fs.existsSync(tasksPath)) {
    const content = fs.readFileSync(tasksPath, 'utf8');
    const hasCheckboxes = /- \[[ x]\]/i.test(content);
    if (!hasCheckboxes) {
      warnings.push('tasks.md does not contain any task checkboxes (- [ ]).');
    }
  }

  return { slug, errors, warnings };
}

async function main() {
  console.log('🔍 Validating Spec Kit specifications in specs/...\n');

  const rootDir = path.resolve(__dirname, '..');
  const specsDir = path.join(rootDir, 'specs');

  if (!fs.existsSync(specsDir)) {
    console.error('❌ Error: specs/ directory does not exist.');
    process.exit(1);
  }

  const entries = fs.readdirSync(specsDir, { withFileTypes: true });
  const ignored = ['template', 'archive', '.git', 'node_modules'];
  const activeSpecDirs = entries
    .filter(e => e.isDirectory() && !ignored.includes(e.name))
    .map(e => path.join(specsDir, e.name));

  if (activeSpecDirs.length === 0) {
    console.log('ℹ️  No active feature specifications found in specs/.');
    console.log('   (specs/template and specs/archive were checked and ignored)');
    console.log('✓ Spec directory structure is clean and valid.\n');
    return;
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const dir of activeSpecDirs) {
    const result = validateSpecDirectory(dir);
    console.log(`Checking specs/${result.slug}...`);

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log(`  ✓ Conforms to Spec Kit standard.`);
    } else {
      for (const err of result.errors) {
        console.error(`  ❌ Error: ${err}`);
        totalErrors++;
      }
      for (const warn of result.warnings) {
        console.warn(`  ⚠️  Warning: ${warn}`);
        totalWarnings++;
      }
    }
  }

  console.log('\n--- Spec Validation Summary ---');
  console.log(`Total active specs checked: ${activeSpecDirs.length}`);
  console.log(`Total errors:   ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.error('\n❌ Spec validation failed. Please address the errors above.');
    process.exit(1);
  } else {
    console.log('\n✓ All active specifications satisfy the Spec Kit standards.');
  }
}

main().catch(err => {
  console.error('Unexpected error during spec validation:', err);
  process.exit(1);
});
