/**
 * Checks that hand-maintained src/types/pb/user.ts is in sync with the
 * auto-generated src/types/pb/models/plugin/provider.ts for EnricherProviderType.
 *
 * The generated file is updated by `make generate` in server/. If new enum
 * values are added to the Go proto but this sync step is skipped, saves will
 * silently write blank Firestore entries for those enrichers.
 *
 * Run: node scripts/check-proto-sync.mjs
 * Exit 0 = in sync, Exit 1 = out of sync (preflight should fail).
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function extractEnricherEnumValues(filePath) {
  const src = readFileSync(filePath, 'utf8');
  const values = new Map();
  // Match lines like:  ENRICHER_PROVIDER_FOO = 42,
  const re = /^\s+(ENRICHER_PROVIDER_\w+)\s*=\s*(-?\d+)/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    values.set(m[1], parseInt(m[2], 10));
  }
  return values;
}

const generated = extractEnricherEnumValues(
  resolve(root, 'src/types/pb/models/plugin/provider.ts')
);
const maintained = extractEnricherEnumValues(
  resolve(root, 'src/types/pb/user.ts')
);

const missing = [];
const wrongValue = [];

for (const [name, value] of generated) {
  if (!maintained.has(name)) {
    missing.push(`  ${name} = ${value}`);
  } else if (maintained.get(name) !== value) {
    wrongValue.push(`  ${name}: user.ts has ${maintained.get(name)}, generated has ${value}`);
  }
}

if (missing.length === 0 && wrongValue.length === 0) {
  console.log('✅ Proto sync check passed — user.ts EnricherProviderType is up to date');
  process.exit(0);
}

console.error('\n❌ Proto sync check FAILED — src/types/pb/user.ts is out of sync with generated types\n');
console.error('Run `make generate` in server/ to regenerate, then add the missing values to user.ts:\n');
if (missing.length > 0) {
  console.error('Missing values:');
  missing.forEach(l => console.error(l));
}
if (wrongValue.length > 0) {
  console.error('\nWrong values:');
  wrongValue.forEach(l => console.error(l));
}
console.error('');
process.exit(1);
