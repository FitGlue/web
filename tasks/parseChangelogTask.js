/**
 * Parse Changelog Task
 * Reads PUBLIC_CHANGELOG.md and converts it to structured data for the changelog page template.
 */

import { readFileSync } from 'fs';

/**
 * Convert inline markdown bold (**text**) to HTML <strong>.
 * @param {string} text
 */
function inlineMd(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

const MONTH_ABBR = {
  January: 'JAN', February: 'FEB', March: 'MAR', April: 'APR',
  May: 'MAY', June: 'JUN', July: 'JUL', August: 'AUG',
  September: 'SEP', October: 'OCT', November: 'NOV', December: 'DEC',
};

/**
 * Parse "Month DD, YYYY" without Date object to avoid UTC offset issues.
 * Returns { day, mon, year } or null.
 * @param {string} dateStr
 */
function parseDateStr(dateStr) {
  const m = dateStr.match(/(\w+)\s+(\d+),\s*(\d{4})/);
  if (!m) return null;
  return { day: m[2], mon: MONTH_ABBR[m[1]] || m[1].slice(0, 3).toUpperCase(), year: m[3] };
}

/**
 * @param {string} content  Full text of PUBLIC_CHANGELOG.md
 */
function parsePublicChangelog(content) {
  const entries = [];
  const usedIds = new Map(); // id base → count, for deduplication
  let current = null;
  let section = null;

  for (const line of content.split('\n')) {
    if (line.startsWith('<!--')) continue;

    // Section header: ## Server vX.Y.Z / Web vA.B.C - Month DD, YYYY
    const verMatch = line.match(/^##\s+Server v([\d.]+)\s*\/\s*Web v([\d.]+)\s*[-–]\s*(.+)/);
    if (verMatch) {
      if (current) entries.push(current);
      const serverVer = verMatch[1];
      const webVer = verMatch[2];
      const dateStr = verMatch[3].trim();
      const [major, minor] = webVer.split('.');

      const parsed = parseDateStr(dateStr);
      const displayDate = parsed ? `${parsed.mon} ${parsed.year}` : dateStr.toUpperCase();
      const displayDateFull = parsed ? `${parsed.day} ${parsed.mon} ${parsed.year}` : dateStr.toUpperCase();

      // Deduplicate anchor IDs — same web version can appear when server bumps alone
      const idBase = `v${webVer.replace(/\./g, '-')}`;
      const count = usedIds.get(idBase) || 0;
      usedIds.set(idBase, count + 1);
      const id = count === 0 ? idBase : `${idBase}-s${serverVer.split('.')[0]}`;

      current = {
        id,
        serverVersion: serverVer,
        webVersion: webVer,
        displayVersion: `v${major}.${minor}`,
        displayDate,
        displayDateFull,
        breaking: [],
        features: [],
        fixes: [],
      };
      section = null;
      continue;
    }

    if (!current) continue;

    if (line.match(/^###.*Breaking/i)) { section = 'breaking'; continue; }
    if (line.match(/^###.*(Feature|New)/i)) { section = 'features'; continue; }
    if (line.match(/^###.*Fix/i)) { section = 'fixes'; continue; }

    if (line.startsWith('- ') && section) {
      const raw = line.slice(2).trim();
      // Skip placeholder "none" entries written by old AI polish runs
      if (/^[\*_]*none[\*_]*/i.test(raw) || /^no breaking changes/i.test(raw)) continue;
      current[section].push({ text: inlineMd(raw) });
    }
  }

  if (current) entries.push(current);
  return entries;
}

/**
 * @param {Object} config
 * @param {string} config.mdPath      Path to PUBLIC_CHANGELOG.md
 * @param {string} config.outputVar   Name of the template variable to set
 */
export function parseChangelogTask(config) {
  return {
    name: 'parse-changelog',
    title: `Parse changelog from ${config.mdPath}`,
    config,
    run: async (cfg, ctx) => {
      const content = readFileSync(cfg.mdPath, 'utf-8');
      const entries = parsePublicChangelog(content);
      ctx.logger.info(`Parsed ${entries.length} changelog entries`);
      return { [cfg.outputVar]: entries };
    },
  };
}
