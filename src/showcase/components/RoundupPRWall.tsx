/**
 * Grouped Personal-Records wall — one card per exercise, each listing every
 * metric PR for that exercise (1RM / best set / total volume / reps). Shared by
 * the roundup page and the showcased-activity page so they render identically.
 * Styling lives in showcase.css (.rp-prs / .rp-pr*).
 */
import React from 'react';
import type { PRGroupVM } from '../utils/roundup';

export function RoundupPRWall({ groups, animate }: { groups: PRGroupVM[]; animate?: boolean }) {
  return (
    <div className="rp-prs">
      {groups.map((g, i) => (
        <article
          key={g.label || i}
          className={`rp-pr${animate ? ' rp-anim' : ''}`}
          style={{
            borderTop: `3px solid ${g.color}`,
            background: `linear-gradient(165deg, ${g.color}22 0%, rgba(255,255,255,0.03) 60%)`,
            ...(animate ? { transitionDelay: `${(i % 6) * 50}ms` } : {}),
          }}
        >
          <div className="rp-pr__top">
            <span className="rp-pr__sport" style={{ color: g.color }}>{g.glyph} {g.sport}</span>
            {g.date && <span className="rp-pr__date">{g.date}</span>}
          </div>
          <div className="rp-pr__ex">{g.label.toUpperCase()}</div>
          <div className="rp-pr__metrics">
            {g.metrics.map((m, mi) => (
              <div key={mi} className="rp-pr__metric">
                <span className="rp-pr__metric-type" style={{ color: g.color }}>{m.type || 'PR'}</span>
                <span className="rp-pr__metric-val">{m.value}{m.unit && <i>{m.unit}</i>}</span>
                {m.delta && <span className={`rp-pr__delta${m.delta === 'NEW' ? ' rp-pr__delta--new' : ''}`}>{m.delta}</span>}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
