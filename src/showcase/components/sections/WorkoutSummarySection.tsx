import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';
import { splitLines, stripBullet } from '../../utils/section';

interface Exercise { superset: string; name: string; sets: string }

const STRETCH_NAMES = [
  'stretch', 'pigeon', 'yoga', 'foam roll', 'shoulder blade',
  'cool down', 'cooldown', 'warm up', 'hip opener', "child's pose",
];

function categorise(ex: Exercise): 'weighted' | 'timed' | 'bodyweight' | 'stretch' {
  const lower = ex.name.toLowerCase();
  const sets = ex.sets.toLowerCase();
  if (STRETCH_NAMES.some((s) => lower.includes(s))) return 'stretch';
  if (/×\s*[\d.]+\s*kg/i.test(sets) || /x\s*[\d.]+\s*kg/i.test(sets)) return 'weighted';
  if (/^\d+:\d{2}/.test(sets) || /\d+:\d{2}/.test(ex.sets)) return 'timed';
  return 'bodyweight';
}

const CAT_ICONS: Record<string, string> = {
  weighted: '🏋️',
  bodyweight: '💪',
  timed: '⏱️',
  stretch: '🧘',
};

export const WorkoutSummarySection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const lines = splitLines(section.content);
  const headlineStats: string[] = [];
  let heaviestLine = '';
  const exercises: Exercise[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('•') && trimmed.includes(' • ')) {
      headlineStats.push(...trimmed.split(' • ').map((s) => s.trim()).filter(Boolean));
      continue;
    }
    if (trimmed.startsWith('Heaviest:') || trimmed.startsWith('• Heaviest:')) {
      heaviestLine = stripBullet(trimmed);
      continue;
    }
    if (trimmed.startsWith('•')) {
      const content = trimmed.slice(1).trim();
      let superset = '';
      let exerciseContent = content;
      const supersetMatch = content.match(/^([1-9]️⃣|🔟|⬜)\s*(.+)$/);
      if (supersetMatch) { superset = supersetMatch[1]; exerciseContent = supersetMatch[2]; }
      const colonIdx = exerciseContent.indexOf(':');
      if (colonIdx > 0) {
        exercises.push({ superset, name: exerciseContent.substring(0, colonIdx).trim(), sets: exerciseContent.substring(colonIdx + 1).trim() });
      } else {
        exercises.push({ superset, name: exerciseContent, sets: '' });
      }
    }
  }

  return (
    <SectionCard section={section} idx={idx}>
      <div className="workout-summary-body">
        {headlineStats.length > 0 && (
          <div className="workout-headline-stats">
            {headlineStats.map((s, i) => (
              <span key={i} className="stat-pill"><span className="stat-pill-value">{s}</span></span>
            ))}
          </div>
        )}
        {heaviestLine && <div className="workout-headline-callout">🏅 {heaviestLine}</div>}
        {exercises.length > 0 && (
          <div className="workout-exercises">
            {exercises.map((ex, i) => {
              const cat = categorise(ex);
              const delay = idx * 0.1 + i * 0.04;
              const setItems = ex.sets ? ex.sets.split(',').map((s) => s.trim()).filter(Boolean) : [];
              const hasSupersetBadge = ex.superset && ex.superset !== '⬜';
              return (
                <div
                  key={i}
                  className={`workout-exercise-card cat-${cat}${hasSupersetBadge ? ' has-superset' : ''}`}
                  style={{ animationDelay: `${delay}s` }}
                >
                  <div className="workout-ex-header">
                    <span className="workout-ex-icon">{CAT_ICONS[cat]}</span>
                    {hasSupersetBadge && <span className="workout-ex-superset-badge">{ex.superset}</span>}
                    <span className="workout-ex-name">{ex.name}</span>
                  </div>
                  {setItems.length > 0 && (
                    <div className="workout-ex-set-rows">
                      {setItems.map((s, si) => (
                        <div key={si} className="workout-ex-set-row" style={{ animationDelay: `${delay + (si + 1) * 0.03}s` }}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionCard>
  );
};
