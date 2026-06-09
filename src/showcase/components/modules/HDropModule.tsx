import React from 'react';
import type { HDropSummary, HDropTimeseriesPoint } from '../../../types/pb/models/activity/enrichments';
import { Module } from './index';

function FluidLossChart({ points }: { points: HDropTimeseriesPoint[] }) {
  if (points.length < 2) return null;

  const maxTime = points[points.length - 1].timeMinutes;
  const maxLoss = Math.max(...points.map((p) => p.fluidLossCumulative), 0.001);

  const toX = (t: number) => ((t / maxTime) * 100).toFixed(2);
  const toY = (v: number) => (100 - (v / maxLoss) * 88 - 6).toFixed(2);

  const linePts = points.map((p) => `${toX(p.timeMinutes)},${toY(p.fluidLossCumulative)}`);
  const line = `M ${linePts.join(' L ')}`;
  const area = `${line} L ${toX(maxTime)},100 L 0,100 Z`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: 72, marginTop: 'var(--space-sm)' }}
    >
      <defs>
        <linearGradient id="hdrop-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#hdrop-grad)" opacity=".18" />
      <path d={line} stroke="url(#hdrop-grad)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

interface Props {
  data?: HDropSummary;
}

export default function HDropModule({ data }: Props): React.ReactElement | null {
  if (!data || data.totalFluidLossL === undefined) return null;

  const scoreLabel = data.avgHdropScore >= 70 ? 'Good' : data.avgHdropScore >= 50 ? 'Moderate' : 'Low';

  return (
    <Module title="Sweat Analysis" span={6} right={`hDrop ${scoreLabel}`}>
      <div className="mini-row">
        <div className="mini">
          <span className="mini__value mini__value--aurora">{data.totalFluidLossL.toFixed(2)}L</span>
          <span className="mini__label">FLUID LOST</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.sweatRateLPerHr.toFixed(2)}</span>
          <span className="mini__label">L/HR</span>
        </div>
        <div className="mini">
          <span className="mini__value">{Math.round(data.totalSodiumMg)}</span>
          <span className="mini__label">Na mg</span>
        </div>
        <div className="mini">
          <span className="mini__value">{Math.round(data.totalPotassiumMg)}</span>
          <span className="mini__label">K mg</span>
        </div>
      </div>
      <FluidLossChart points={data.timeseries ?? []} />
      <div className="mini-row" style={{ marginTop: 'var(--space-xs)' }}>
        <div className="mini">
          <span className="mini__value">{Math.round(data.avgHdropScore)}/100</span>
          <span className="mini__label">hDrop AVG</span>
        </div>
        <div className="mini">
          <span className="mini__value">{Math.round(data.sodiumConcentrationMgPerL)}</span>
          <span className="mini__label">Na mg/L</span>
        </div>
        <div className="mini">
          <span className="mini__value">{data.minTemperatureC.toFixed(1)}→{data.maxTemperatureC.toFixed(1)}°C</span>
          <span className="mini__label">SKIN TEMP</span>
        </div>
      </div>
    </Module>
  );
}
