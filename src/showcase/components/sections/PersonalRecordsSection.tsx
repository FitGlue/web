import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { splitLines, stripBullet } from '../../utils/section';

interface PRRecord {
  emoji: string; name: string; recordType: string; value: string;
  previous: string; improvement: string; typeClass: string;
}

const TYPE_PATTERNS = [
  '1RM', 'Best Set Volume', 'Total Volume', 'Volume', 'Max Reps',
  'Total Time', 'Longest Run', 'Longest Ride', 'Highest Elevation Gain',
];

function parsePRLine(line: string): PRRecord | null {
  line = stripBullet(line);
  if (!line) return null;

  const chars = [...line];
  const firstCp = line.codePointAt(0) ?? 0;
  const emoji = firstCp > 0xFF ? chars[0] : '🏆';
  const rest = firstCp > 0xFF ? line.slice(emoji.length).trim() : line;

  let name = '', recordType = '', value = '', previous = '', improvement = '';
  let matched = false;

  const fastestMatch = rest.match(/^(Fastest\s+[^:]+?):\s*(.+)$/);
  if (fastestMatch) {
    recordType = fastestMatch[1].trim();
    const after = fastestMatch[2].trim();
    const parenM = after.match(/^(.+?)\s*\(previous:\s*(.+?),\s*([+-]?[\d.]+%)\)$/);
    if (parenM) { value = parenM[1].trim(); previous = parenM[2].trim(); improvement = parenM[3].trim(); }
    else value = after;
    matched = true;
  }

  if (!matched) {
    for (const tp of TYPE_PATTERNS) {
      const i = rest.lastIndexOf(tp + ':');
      if (i >= 0) {
        name = rest.substring(0, i).trim();
        const after = rest.substring(i + tp.length + 1).trim();
        recordType = tp;
        const parenM = after.match(/^(.+?)\s*\(previous:\s*(.+?),\s*([+-]?[\d.]+%)\)$/);
        if (parenM) { value = parenM[1].trim(); previous = parenM[2].trim(); improvement = parenM[3].trim(); }
        else value = after;
        matched = true;
        break;
      }
    }
  }

  if (!matched) {
    const ci = rest.indexOf(':');
    if (ci < 0) return null;
    const bc = rest.substring(0, ci).trim();
    const ac = rest.substring(ci + 1).trim();
    name = bc; recordType = '';
    const parenM = ac.match(/^(.+?)\s*\(previous:\s*(.+?),\s*([+-]?[\d.]+%)\)$/);
    if (parenM) { value = parenM[1].trim(); previous = parenM[2].trim(); improvement = parenM[3].trim(); }
    else value = ac;
  }

  const lt = recordType.toLowerCase();
  const typeClass =
    lt === '1rm' ? '1rm' :
    lt.includes('volume') ? 'volume' :
    lt.includes('reps') ? 'reps' :
    lt.includes('fastest') || lt.includes('time') ? 'time' :
    lt.includes('longest') || lt.includes('distance') || lt.includes('elevation') ? 'distance' :
    'time';

  return { emoji, name, recordType, value, previous, improvement, typeClass };
}

function Improvement({ improvement, isTime }: { improvement: string; isTime: boolean }) {
  if (!improvement) return null;
  const positive = isTime ? improvement.startsWith('-') : !improvement.startsWith('-');
  return (
    <span className={`pr-record-improvement ${positive ? 'positive' : 'negative'}`}>
      {positive ? '▲' : '▼'} {improvement}
    </span>
  );
}

export const PersonalRecordsSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const records = splitLines(section.content).map(parsePRLine).filter(Boolean) as PRRecord[];

  if (records.length === 0) {
    return (
      <SectionCard section={section} idx={idx}>
        <pre className="activity-description">{section.content}</pre>
      </SectionCard>
    );
  }

  const grouped: Record<string, { name: string; emoji: string; records: PRRecord[] }> = {};
  const groupOrder: string[] = [];
  for (const pr of records) {
    if (!grouped[pr.name]) { grouped[pr.name] = { name: pr.name, emoji: pr.emoji, records: [] }; groupOrder.push(pr.name); }
    grouped[pr.name].records.push(pr);
    if (pr.emoji === '🏆') grouped[pr.name].emoji = '🏆';
  }

  const distanceRecords = grouped['']?.records ?? [];
  const exerciseGroups = groupOrder.filter((n) => n !== '');

  return (
    <SectionCard section={section} idx={idx}>
      {distanceRecords.length > 0 && (
        <div className="pr-distance-grid">
          {distanceRecords.map((pr, i) => {
            const distLabel = pr.recordType.replace(/^Fastest\s+/i, '');
            const isTime = pr.typeClass === 'time';
            return (
              <div key={i} className="pr-distance-card" style={{ animationDelay: `${idx * 0.1 + i * 0.04}s` }}>
                <span className="pr-distance-value">{pr.value}</span>
                <span className="pr-distance-label">{distLabel}</span>
                {pr.improvement && (
                  <span className={`pr-distance-improvement ${(isTime ? pr.improvement.startsWith('-') : !pr.improvement.startsWith('-')) ? 'positive' : 'negative'}`}>
                    {(isTime ? pr.improvement.startsWith('-') : !pr.improvement.startsWith('-')) ? '▲' : '▼'} {pr.improvement}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      {exerciseGroups.length > 0 && (
        <div className="pr-records-grid">
          {exerciseGroups.map((name, i) => {
            const group = grouped[name];
            const delay = idx * 0.1 + ((distanceRecords.length > 0 ? 1 : 0) + i) * 0.06;
            return (
              <div key={name} className="pr-grouped-card" style={{ animationDelay: `${delay}s` }}>
                <div className="pr-grouped-header">
                  <span className="pr-emoji">{group.emoji}</span>
                  <span className="pr-grouped-name">{group.name}</span>
                </div>
                <div className="pr-grouped-records">
                  {group.records.map((pr, j) => (
                    <div key={j} className={`pr-record-chip chip-${pr.typeClass}`}>
                      <span className="pr-record-value">{pr.value}</span>
                      <span className="pr-record-type">{pr.recordType || 'Record'}</span>
                      <Improvement improvement={pr.improvement} isTime={pr.typeClass === 'time'} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
};
