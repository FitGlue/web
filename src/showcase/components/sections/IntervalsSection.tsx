import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';

type LineType = 'warmup' | 'cooldown' | 'insight-comparison' | 'insight-trend' | 'group-header' | 'sub-row' | 'generic';
interface ClassifiedLine { type: LineType; text: string }

function classifyLine(line: string): ClassifiedLine {
  const trimmed = line.trim();
  const isIndented = line.startsWith('  ') || line.startsWith('\t');
  if (/^🔥/.test(trimmed)) return { type: 'warmup', text: trimmed };
  if (/^❄️/.test(trimmed)) return { type: 'cooldown', text: trimmed };
  if (/^📊/.test(trimmed)) return { type: 'insight-comparison', text: trimmed };
  if (/^📈/.test(trimmed) || /^📉/.test(trimmed)) return { type: 'insight-trend', text: trimmed };
  if (/^💨/.test(trimmed) && /×/.test(trimmed) && /intervals/i.test(trimmed)) return { type: 'group-header', text: trimmed };
  if (isIndented || (/^💨/.test(trimmed) && /Run \d/i.test(trimmed))) return { type: 'sub-row', text: trimmed };
  return { type: 'generic', text: trimmed };
}

function parseStatPills(text: string): string[] {
  let parts = text.split('•').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1 && text.includes(',')) parts = text.split(',').map((p) => p.trim()).filter(Boolean);
  return parts;
}

function statClass(part: string): string {
  if (/\/km/.test(part)) return 'pace';
  if (/bpm/i.test(part)) return 'hr';
  if (/\d+\s*m\b/.test(part) || /\d+\.\d+\s*km/.test(part)) return 'dist';
  if (/^\d+:\d{2}$/.test(part.trim())) return 'time';
  return '';
}

const StatPills: React.FC<{ text: string }> = ({ text }) => {
  const pills = parseStatPills(text);
  if (pills.length === 0) return null;
  return (
    <div className="interval-stats">
      {pills.map((p, i) => {
        const display = p.replace(/^\(/, '').replace(/\)$/, '').trim();
        return <span key={i} className={`interval-stat ${statClass(p)}`}>{display}</span>;
      })}
    </div>
  );
};

const GroupCard: React.FC<{ header: string; subRows: string[]; delay: number }> = ({
  header,
  subRows,
  delay,
}) => (
  <div className="interval-group-card" style={{ animationDelay: `${delay}s` }}>
    <div className="interval-group-header" style={{ animationDelay: `${delay}s` }}>
      <span className="interval-group-label">{header}</span>
    </div>
    {subRows.length > 0 && (
      <div className="interval-sub-rows">
        {subRows.map((text, i) => (
          <div key={i} className="interval-sub-row" style={{ animationDelay: `${delay + (i + 1) * 0.04}s` }}>
            <span className="interval-sub-label">{text.split('•')[0]?.trim()}</span>
            <StatPills text={text.includes('•') ? text.slice(text.indexOf('•')) : text} />
          </div>
        ))}
      </div>
    )}
  </div>
);

export const IntervalsSection: React.FC<{ section: DescriptionSection; idx: number }> = ({
  section,
  idx,
}) => {
  const lines = section.content.split('\n').filter((l) => l.trim());
  const classified: ClassifiedLine[] = lines.map(classifyLine);

  let workoutSubtitle = '';
  const workItems = [...classified];
  if (workItems.length > 0 && workItems[0].type === 'generic') {
    workoutSubtitle = workItems.shift()!.text;
  }

  const cards: React.ReactNode[] = [];
  let cardIdx = 0;
  let i = 0;

  while (i < workItems.length) {
    const item = workItems[i];
    const delay = idx * 0.1 + cardIdx * 0.08;

    if (item.type === 'group-header') {
      const subRows: string[] = [];
      let j = i + 1;
      while (j < workItems.length && workItems[j].type === 'sub-row') {
        subRows.push(workItems[j].text);
        j++;
      }
      cards.push(<GroupCard key={cardIdx} header={item.text} subRows={subRows} delay={delay} />);
      cardIdx++;
      i = j;
      continue;
    }

    if (item.type === 'warmup' || item.type === 'cooldown') {
      cards.push(
        <div key={cardIdx} className={`interval-standalone-row interval-${item.type}`} style={{ animationDelay: `${delay}s` }}>
          <span className="interval-standalone-label">{item.text.split('•')[0]?.trim()}</span>
          <StatPills text={item.text.includes('•') ? item.text.slice(item.text.indexOf('•')) : ''} />
        </div>
      );
      cardIdx++;
      i++;
      continue;
    }

    if (item.type === 'insight-comparison' || item.type === 'insight-trend') {
      cards.push(
        <div key={cardIdx} className="interval-insight-card" style={{ animationDelay: `${delay}s` }}>
          <span className="interval-insight-text">{item.text}</span>
        </div>
      );
      cardIdx++;
      i++;
      continue;
    }

    // generic
    cards.push(
      <div key={cardIdx} className="interval-generic-row" style={{ animationDelay: `${delay}s` }}>
        {item.text}
      </div>
    );
    cardIdx++;
    i++;
  }

  return (
    <div className="showcase-section glass-card description-section-card" style={{ animationDelay: `${idx * 0.1}s` }}>
      <div className="section-header">
        <h2>{section.emoji} {section.title}</h2>
        {workoutSubtitle && <span className="section-subtitle">{workoutSubtitle}</span>}
      </div>
      <div className="intervals-body">{cards}</div>
    </div>
  );
};
