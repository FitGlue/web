const fs = require('fs');
const path = require('path');

const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
const packagePath = path.resolve(__dirname, '../package.json');
const envPath = path.resolve(__dirname, '../.env');

// Read Changelog
const changelog = fs.readFileSync(changelogPath, 'utf8');

// Regex to find the latest version in the format: ## [x.y.z]
const versionRegex = /^## \[(\d+\.\d+\.\d+)\]/m;
const match = changelog.match(versionRegex);

if (!match) {
  console.error('Could not find version in CHANGELOG.md');
  process.exit(1);
}

const version = match[1];
console.log(`Found version: ${version}`);

// Update package.json
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
if (packageJson.version !== version) {
  packageJson.version = version;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated package.json to version ${version}`);
} else {
  console.log('package.json version is already up to date');
}

// Update .env file (for Vite)
// We read the existing .env if it exists, replace or append VITE_APP_VERSION
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const envVar = `VITE_APP_VERSION=${version}`;
const envRegex = /^VITE_APP_VERSION=.*$/m;

if (envRegex.test(envContent)) {
  envContent = envContent.replace(envRegex, envVar);
} else {
  envContent += `\n${envVar}\n`;
}

fs.writeFileSync(envPath, envContent.trim() + '\n');
console.log(`Updated .env with ${envVar}`);
