import React from 'react';
import type { components } from '../../../shared/api/schema-public';

type LifetimeZoneSplit = components['schemas']['LifetimeZoneSplit'];

// Zone colors map to FG brand tokens by intensity
const ZONE_COLORS = ['#334155', '#22d3ee', '#a3ff3d', '#ffd60a', '#ff3da6'];
const ZONE_FALLBACK_NAMES = ['Z1 · RECOVERY', 'Z2 · BASE', 'Z3 · AEROBIC', 'Z4 · THRESHOLD', 'Z5 · MAX'];

interface Props {
  zoneSplit?: LifetimeZoneSplit;
}

export default function ZoneBar({ zoneSplit }: Props): React.ReactElement | null {
  const zones = zoneSplit?.zones;
  if (!zones || zones.length === 0) return null;

  const total = zones.reduce((s, z) => s + (z.minutes ?? 0), 0);
  if (total < 60) return null;

  const totalHours = Math.round(total / 60);

  return (
    <div className="zone-band">
      <div className="zone-band__label">
        ❤️ LIFETIME HR ZONES · {totalHours.toLocaleString()}H TRACKED
      </div>
      <div className="zone-bar">
        {zones.map((z, i) => {
          const pct = ((z.minutes ?? 0) / total) * 100;
          if (pct < 0.5) return null;
          const color = ZONE_COLORS[i] ?? ZONE_COLORS[4];
          return (
            <div
              key={i}
              className="zone-bar__seg"
              style={{ width: `${pct.toFixed(2)}%`, background: color }}
              title={`${z.name ?? ZONE_FALLBACK_NAMES[i]}: ${Math.round(pct)}%`}
            />
          );
        })}
      </div>
      <div className="zone-legend">
        {zones.map((z, i) => {
          const pct = Math.round(((z.minutes ?? 0) / total) * 100);
          if (pct < 1) return null;
          const hours = Math.round((z.minutes ?? 0) / 60);
          const color = ZONE_COLORS[i] ?? ZONE_COLORS[4];
          const name = z.name ?? ZONE_FALLBACK_NAMES[i];
          return (
            <div key={i} className="zone-legend__item">
              <span className="zone-legend__dot" style={{ background: color }} />
              <span className="zone-legend__name">{name}</span>
              <span className="zone-legend__pct">{pct}%</span>
              {hours > 0 && <span className="zone-legend__hours">{hours}h</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
