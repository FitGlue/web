import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { extractEmojiPrefix, splitLines, stripBullet } from '../../utils/section';

interface Split { label: string; pace: string; totalSec: number; isFastest: boolean; isSlowest: boolean }

export const SplitsSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const lines = splitLines(section.content);
  const bulletLines = lines.filter((l) => l.trim().startsWith('•'));
  const insightLines = lines.filter((l) => !l.trim().startsWith('•'));

  const splits: Split[] = bulletLines.map((line) => {
    const clean = stripBullet(line);
    const m = clean.match(/^(Km\s*\d+|Mile\s*\d+):\s*(\d+:\d{2})(.*)$/i);
    if (!m) return null;
    const [min, sec] = m[2].split(':').map(Number);
    return { label: m[1], pace: m[2], totalSec: min * 60 + sec, isFastest: m[3].includes('🏆'), isSlowest: m[3].includes('🐢') };
  }).filter(Boolean) as Split[];

  if (splits.length === 0) {
    const allBullets = bulletLines.length > 0 && bulletLines.length === lines.length;
    if (allBullets) {
      return (
        <SectionCard section={section} idx={idx}>
          <div className="bullet-list-rows">
            {lines.map((l, i) => {
              const clean = stripBullet(l);
              const ci = clean.indexOf(':');
              if (ci > 0) return <div key={i} className="bullet-stat-row"><span className="bullet-stat-label">{clean.slice(0, ci).trim()}</span><span className="bullet-stat-value">{clean.slice(ci + 1).trim()}</span></div>;
              return <div key={i} className="bullet-stat-row-simple">• {clean}</div>;
            })}
          </div>
        </SectionCard>
      );
    }
  }

  const fastest = Math.min(...splits.map((s) => s.totalSec));
  const slowest = Math.max(...splits.map((s) => s.totalSec));
  const range = slowest - fastest || 1;

  return (
    <SectionCard section={section} idx={idx}>
      <div className="splits-grid">
        {splits.map((s, i) => {
          const pct = 100 - ((s.totalSec - fastest) / range) * 60;
          const fillClass = s.isFastest ? 'fastest' : s.isSlowest ? 'slowest' : '';
          return (
            <div key={i} className="split-row" style={{ animationDelay: `${idx * 0.1 + i * 0.03}s` }}>
              <span className="split-label">{s.label}</span>
              <div className="split-bar-track">
                <div className={`split-bar-fill ${fillClass}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="split-value">
                {s.pace}
                {(s.isFastest || s.isSlowest) && <span className="split-badge">{s.isFastest ? '🏆' : '🐢'}</span>}
              </span>
            </div>
          );
        })}
      </div>
      {insightLines.map((line, i) => {
        const { emoji, rest } = extractEmojiPrefix(line.trim());
        return (
          <div key={i} className="split-insight" style={{ animationDelay: `${idx * 0.1 + splits.length * 0.03 + i * 0.08}s` }}>
            {emoji && <span className="insight-emoji">{emoji}</span>}
            <span className="highlight">{rest || line.trim()}</span>
          </div>
        );
      })}
    </SectionCard>
  );
};
