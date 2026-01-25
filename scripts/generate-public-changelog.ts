#!/usr/bin/env npx tsx
/**
 * Unified Public Changelog Generator
 *
 * Parses CHANGELOG.md from both server and web repos, detects unpublished versions,
 * and generates a merged PUBLIC_CHANGELOG.md with user-friendly formatting.
 *
 * Usage:
 *   npm run generate-changelog                 # Basic merge
 *   npm run generate-changelog -- --ai-polish  # With AI rewriting (uses Gemini)
 *
 * Environment variables:
 *   GEMINI_API_KEY - Required for --ai-polish mode
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface ChangelogEntry {
  type: 'feature' | 'fix' | 'breaking';
  message: string;
  scope?: string;
}

interface VersionBlock {
  version: string;
  date: string;
  entries: ChangelogEntry[];
}

// ESM-compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEB_CHANGELOG = path.join(__dirname, '..', 'CHANGELOG.md');
const SERVER_CHANGELOG = path.join(__dirname, '..', '..', 'server', 'CHANGELOG.md');
const PUBLIC_CHANGELOG = path.join(__dirname, '..', 'PUBLIC_CHANGELOG.md');

// Parse command line args
const AI_POLISH_MODE = process.argv.includes('--ai-polish');

/**
 * Parse a standard-version generated CHANGELOG.md into structured version blocks
 */
function parseChangelog(filePath: string): VersionBlock[] {
  if (!fs.existsSync(filePath)) {
    console.error(`Changelog not found: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const versions: VersionBlock[] = [];

  let currentVersion: VersionBlock | null = null;
  let currentType: 'feature' | 'fix' | 'breaking' | null = null;
  let inBreakingSection = false;

  for (const line of lines) {
    // Match version header: ## [7.1.0](...) (2026-01-24) or ### [6.0.2](...) (2026-01-24)
    const versionMatch = line.match(/^#{2,3}\s+\[(\d+\.\d+\.\d+)\].*\((\d{4}-\d{2}-\d{2})\)/);
    if (versionMatch) {
      if (currentVersion) {
        versions.push(currentVersion);
      }
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2],
        entries: [],
      };
      currentType = null;
      inBreakingSection = false;
      continue;
    }

    if (!currentVersion) continue;

    // Match section headers
    if (line.match(/^###\s+⚠\s*BREAKING CHANGES/i)) {
      inBreakingSection = true;
      currentType = 'breaking';
      continue;
    }

    if (line.match(/^###\s+Features?/i)) {
      inBreakingSection = false;
      currentType = 'feature';
      continue;
    }

    if (line.match(/^###\s+Bug Fixes?/i)) {
      inBreakingSection = false;
      currentType = 'fix';
      continue;
    }

    // Match entry lines: * message ([commit](link)) or * **scope:** message ([commit](link))
    // The message continues until we hit an optional trailing commit link like ([abc123](url))
    if (line.startsWith('* ') && currentType) {
      let entryLine = line.slice(2); // Remove "* "

      // Extract scope if present: **scope:** message
      let scope: string | undefined;
      const scopeMatch = entryLine.match(/^\*\*([^*]+)\*\*:\s*/);
      if (scopeMatch) {
        scope = scopeMatch[1];
        entryLine = entryLine.slice(scopeMatch[0].length);
      }

      // Remove trailing commit link: ([abc123](https://...))
      let message = entryLine.replace(/\s*\(\[[a-f0-9]+\]\([^)]+\)\)\s*$/, '').trim();

      if (message) {
        currentVersion.entries.push({
          type: currentType,
          message,
          scope,
        });
      }
      continue;
    }

    // Handle breaking change bullet points (they appear as - items under the ⚠ section)
    if (inBreakingSection && line.match(/^-\s+/)) {
      const breakingMessage = line.replace(/^-\s+/, '').trim();
      if (breakingMessage) {
        currentVersion.entries.push({
          type: 'breaking',
          message: breakingMessage,
        });
      }
    }
  }

  if (currentVersion) {
    versions.push(currentVersion);
  }

  return versions;
}

/**
 * Extract the last published versions from PUBLIC_CHANGELOG.md
 */
function getLastPublishedVersions(publicChangelogPath: string): { server: string; web: string } {
  const defaultVersions = { server: '0.0.0', web: '0.0.0' };

  if (!fs.existsSync(publicChangelogPath)) {
    return defaultVersions;
  }

  const content = fs.readFileSync(publicChangelogPath, 'utf-8');

  // Look for: <!-- LAST_PUBLISHED: server=v7.0.0, web=v6.0.0 -->
  const match = content.match(/<!--\s*LAST_PUBLISHED:\s*server=v?([\d.]+),\s*web=v?([\d.]+)\s*-->/);
  if (match) {
    return { server: match[1], web: match[2] };
  }

  return defaultVersions;
}

/**
 * Compare semver versions (returns true if a > b)
 */
function isNewerVersion(a: string, b: string): boolean {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (partsA[i] > partsB[i]) return true;
    if (partsA[i] < partsB[i]) return false;
  }
  return false;
}

/**
 * Filter versions to only those newer than the last published version
 */
function getUnpublishedVersions(versions: VersionBlock[], lastPublished: string): VersionBlock[] {
  return versions.filter((v) => isNewerVersion(v.version, lastPublished));
}

/**
 * Merge and deduplicate entries from both repos
 */
function mergeEntries(
  serverVersions: VersionBlock[],
  webVersions: VersionBlock[]
): { breaking: ChangelogEntry[]; features: ChangelogEntry[]; fixes: ChangelogEntry[] } {
  const breaking: ChangelogEntry[] = [];
  const features: ChangelogEntry[] = [];
  const fixes: ChangelogEntry[] = [];

  const seen = new Set<string>();

  const addEntries = (versions: VersionBlock[], repoPrefix: string) => {
    for (const version of versions) {
      for (const entry of version.entries) {
        // Create a key for deduplication
        const key = `${entry.type}:${entry.message.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // Skip internal/CI entries
        if (isInternalEntry(entry.message)) continue;

        // Add repo context if no scope
        const entryWithContext: ChangelogEntry = {
          ...entry,
          scope: entry.scope || repoPrefix,
        };

        switch (entry.type) {
          case 'breaking':
            breaking.push(entryWithContext);
            break;
          case 'feature':
            features.push(entryWithContext);
            break;
          case 'fix':
            fixes.push(entryWithContext);
            break;
        }
      }
    }
  };

  addEntries(serverVersions, 'Backend');
  addEntries(webVersions, 'UI');

  return { breaking, features, fixes };
}

/**
 * Check if an entry is internal/CI-related and should be excluded from user-facing changelog
 */
function isInternalEntry(message: string): boolean {
  const internalPatterns = [
    /\bCI\b/i,
    /\bCI\/CD\b/i,
    /\bcircle\s?ci\b/i,
    /\bterraform\b/i,
    /\bOOM\b/i,
    /\bbuild\s*concurrency\b/i,
    /\bzip\s*builds?\b/i,
    /\bsourcemaps?\b/i,
    /\bsentry\b/i,
    /\blint(er|ing)?\b/i,
    /\benv\s*vars?\b/i,
    /\bskip\s*ci\b/i,
    /\bgofmt\b/i,
    /\btf\s+failures?\b/i,
    /OH MY GOD/i,
    /I'm tired/i,
    /many things/i,
  ];

  return internalPatterns.some((pattern) => pattern.test(message));
}

/**
 * Format a date string nicely
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Use Gemini to polish changelog entries into user-friendly language
 */
async function polishWithGemini(
  merged: { breaking: ChangelogEntry[]; features: ChangelogEntry[]; fixes: ChangelogEntry[] }
): Promise<{ breaking: string[]; features: string[]; fixes: string[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY environment variable not set');
    return null;
  }

  // Format the raw entries for the prompt
  const formatEntries = (entries: ChangelogEntry[]): string => {
    return entries.map((e) => `- ${e.scope ? `[${e.scope}] ` : ''}${e.message}`).join('\n');
  };

  const rawChangelog = `
BREAKING CHANGES:
${merged.breaking.length > 0 ? formatEntries(merged.breaking) : '(none)'}

FEATURES:
${merged.features.length > 0 ? formatEntries(merged.features) : '(none)'}

BUG FIXES:
${merged.fixes.length > 0 ? formatEntries(merged.fixes) : '(none)'}
`.trim();

  const prompt = `You are a technical writer for FitGlue, a fitness activity sync platform that automatically syncs workouts between apps like Strava, Fitbit, Garmin, Apple Health, and Hevy.

Rewrite the following technical changelog entries into user-friendly language that non-technical users can understand. Focus on the USER BENEFIT, not implementation details.

Guidelines:
- Use friendly, conversational language
- Focus on what the user can now DO, not how it was built
- Consolidate related entries into single meaningful bullets
- Remove any purely internal/infrastructure changes that don't affect users
- Keep each section to 3-5 bullet points maximum
- Use action verbs and be concise
- Don't mention technical terms like "protobuf", "terraform", "API", "enum", "handler" etc.

RAW CHANGELOG:
${rawChangelog}

Respond with ONLY the rewritten changelog in this exact format (include all sections even if empty):
BREAKING:
- bullet point 1
- bullet point 2

FEATURES:
- bullet point 1
- bullet point 2

FIXES:
- bullet point 1
- bullet point 2`;

  console.log('🤖 Calling Gemini API for AI polish...');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('❌ No text in Gemini response');
      return null;
    }

    // Parse the AI response
    const parseSection = (sectionName: string): string[] => {
      const regex = new RegExp(`${sectionName}:\\s*\\n([\\s\\S]*?)(?=\\n(?:BREAKING|FEATURES|FIXES):|$)`, 'i');
      const match = text.match(regex);
      if (!match) return [];

      return match[1]
        .split('\n')
        .map((line) => line.replace(/^-\s*/, '').trim())
        .filter((line) => line.length > 0 && !line.startsWith('('));
    };

    const result = {
      breaking: parseSection('BREAKING'),
      features: parseSection('FEATURES'),
      fixes: parseSection('FIXES'),
    };

    console.log(`✨ AI polish complete: ${result.features.length} features, ${result.fixes.length} fixes`);
    return result;
  } catch (error) {
    console.error('❌ Gemini API call failed:', error);
    return null;
  }
}

/**
 * Generate the markdown section for the public changelog
 */
function generatePublicSection(
  serverVersion: string,
  webVersion: string,
  merged: { breaking: ChangelogEntry[]; features: ChangelogEntry[]; fixes: ChangelogEntry[] }
): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const lines: string[] = [];
  lines.push(`## Server v${serverVersion} / Web v${webVersion} - ${today}`);
  lines.push('');

  if (merged.breaking.length > 0) {
    lines.push('### ⚠ Breaking Changes');
    lines.push('');
    for (const entry of merged.breaking) {
      lines.push(`- ${entry.message}`);
    }
    lines.push('');
  }

  if (merged.features.length > 0) {
    lines.push('### ✨ Features');
    lines.push('');
    for (const entry of merged.features) {
      const prefix = entry.scope ? `**${entry.scope}**: ` : '';
      lines.push(`- ${prefix}${capitalizeFirst(entry.message)}`);
    }
    lines.push('');
  }

  if (merged.fixes.length > 0) {
    lines.push('### 🐛 Bug Fixes');
    lines.push('');
    for (const entry of merged.fixes) {
      const prefix = entry.scope ? `**${entry.scope}**: ` : '';
      lines.push(`- ${prefix}${capitalizeFirst(entry.message)}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Update the PUBLIC_CHANGELOG.md with the new section
 */
function updatePublicChangelog(
  publicChangelogPath: string,
  newSection: string,
  serverVersion: string,
  webVersion: string
): void {
  let content: string;

  if (fs.existsSync(publicChangelogPath)) {
    content = fs.readFileSync(publicChangelogPath, 'utf-8');
  } else {
    content = `# FitGlue Changelog

<!-- LAST_PUBLISHED: server=v0.0.0, web=v0.0.0 -->
`;
  }

  // Update the LAST_PUBLISHED comment
  content = content.replace(
    /<!--\s*LAST_PUBLISHED:[^>]+-->/,
    `<!-- LAST_PUBLISHED: server=v${serverVersion}, web=v${webVersion} -->`
  );

  // Find where to insert the new section (after the header comment)
  const insertPoint = content.indexOf('<!-- LAST_PUBLISHED');
  if (insertPoint === -1) {
    console.error('Could not find LAST_PUBLISHED marker in PUBLIC_CHANGELOG.md');
    return;
  }

  const afterMarker = content.indexOf('-->', insertPoint) + 3;
  const before = content.slice(0, afterMarker);
  const after = content.slice(afterMarker);

  const updatedContent = before + '\n\n' + newSection + after;

  fs.writeFileSync(publicChangelogPath, updatedContent, 'utf-8');
}

/**
 * Generate the markdown section from AI-polished entries
 */
function generatePolishedSection(
  serverVersion: string,
  webVersion: string,
  polished: { breaking: string[]; features: string[]; fixes: string[] }
): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const lines: string[] = [];
  lines.push(`## Server v${serverVersion} / Web v${webVersion} - ${today}`);
  lines.push('');

  if (polished.breaking.length > 0) {
    lines.push('### ⚠ Breaking Changes');
    lines.push('');
    for (const entry of polished.breaking) {
      lines.push(`- ${entry}`);
    }
    lines.push('');
  }

  if (polished.features.length > 0) {
    lines.push('### ✨ New Features');
    lines.push('');
    for (const entry of polished.features) {
      lines.push(`- ${entry}`);
    }
    lines.push('');
  }

  if (polished.fixes.length > 0) {
    lines.push('### 🐛 Bug Fixes');
    lines.push('');
    for (const entry of polished.fixes) {
      lines.push(`- ${entry}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('📋 Parsing changelogs...');

  if (AI_POLISH_MODE) {
    console.log('🤖 AI polish mode enabled');
  }

  const serverVersions = parseChangelog(SERVER_CHANGELOG);
  const webVersions = parseChangelog(WEB_CHANGELOG);

  console.log(`   Server: ${serverVersions.length} versions found`);
  console.log(`   Web: ${webVersions.length} versions found`);

  if (serverVersions.length === 0 || webVersions.length === 0) {
    console.error('❌ Could not parse changelogs. Exiting.');
    process.exit(1);
  }

  const latestServer = serverVersions[0].version;
  const latestWeb = webVersions[0].version;

  console.log(`📌 Latest versions: Server v${latestServer}, Web v${latestWeb}`);

  const lastPublished = getLastPublishedVersions(PUBLIC_CHANGELOG);
  console.log(`📖 Last published: Server v${lastPublished.server}, Web v${lastPublished.web}`);

  const unpublishedServer = getUnpublishedVersions(serverVersions, lastPublished.server);
  const unpublishedWeb = getUnpublishedVersions(webVersions, lastPublished.web);

  if (unpublishedServer.length === 0 && unpublishedWeb.length === 0) {
    console.log('✅ Public changelog is already up-to-date!');
    return;
  }

  console.log(`🔄 Unpublished: ${unpublishedServer.length} server versions, ${unpublishedWeb.length} web versions`);

  const merged = mergeEntries(unpublishedServer, unpublishedWeb);
  const totalEntries = merged.breaking.length + merged.features.length + merged.fixes.length;

  if (totalEntries === 0) {
    console.log('⚠️  No user-facing changes found (all entries were internal/CI-related)');
    return;
  }

  console.log(`📝 Merged entries: ${merged.breaking.length} breaking, ${merged.features.length} features, ${merged.fixes.length} fixes`);

  let newSection: string;

  if (AI_POLISH_MODE) {
    const polished = await polishWithGemini(merged);
    if (polished) {
      newSection = generatePolishedSection(latestServer, latestWeb, polished);
    } else {
      console.log('⚠️  AI polish failed, falling back to raw merge');
      newSection = generatePublicSection(latestServer, latestWeb, merged);
    }
  } else {
    newSection = generatePublicSection(latestServer, latestWeb, merged);
  }

  updatePublicChangelog(PUBLIC_CHANGELOG, newSection, latestServer, latestWeb);

  console.log('✅ PUBLIC_CHANGELOG.md updated successfully!');
  console.log(`   New section: Server v${latestServer} / Web v${latestWeb}`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

