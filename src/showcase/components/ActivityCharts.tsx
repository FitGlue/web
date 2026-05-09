import React, { useEffect, useRef } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { components } from '../../shared/api/schema-public';
import type { DescriptionSection } from './DescriptionSections';
import { HeartRateStats } from './sections/HeartRateSection';
import { ElevationStats } from './sections/ElevationSection';
import { PaceStats } from './sections/PaceSection';
import { PowerStats } from './sections/PowerSection';
import { CadenceStats } from './sections/CadenceSection';
import { SpeedStats } from './sections/SpeedSection';

type Record = components['schemas']['Record'];

interface ChartData {
  labels: string[];
  values: number[];
}

function buildTimeLabels(records: Record[]): string[] {
  if (records.length === 0) return [];
  const first = new Date(records[0].timestamp!).getTime();
  return records.map((r) => {
    const elapsed = (new Date(r.timestamp!).getTime() - first) / 1000;
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    return h > 0 ? `${h}h${m}m` : `${m}m`;
  });
}

function buildChartConfig(data: ChartData, color: string): ChartConfiguration<'line'> {
  return {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        borderColor: color,
        backgroundColor: `${color}22`,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          display: true,
          ticks: { maxTicksLimit: 8, color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          display: true,
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  };
}

const SingleChart: React.FC<{
  title: string;
  data: ChartData;
  color: string;
  statsContent?: React.ReactNode;
}> = ({ title, data, color, statsContent }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.values.length === 0) return;
    let cancelled = false;
    import('chart.js/auto').then((mod) => {
      if (cancelled || !canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();
      const Chart = mod.default;
      chartRef.current = new Chart(canvasRef.current, buildChartConfig(data, color));
    });
    return () => {
      cancelled = true;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = null;
    };
  }, [data, color]);

  if (data.values.length === 0) return null;

  return (
    <div className="showcase-section glass-card">
      <div className="section-header"><h2>{title}</h2></div>
      {statsContent && <div className="chart-stats-strip">{statsContent}</div>}
      <div className="chart-container" style={{ height: '200px', position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

interface Props {
  records: Record[];
  timeMarkers?: components['schemas']['TimeMarker'][];
  descriptionSections?: DescriptionSection[];
}

export const ActivityCharts: React.FC<Props> = ({ records, descriptionSections = [] }) => {
  if (records.length === 0) return null;

  const findSection = (title: string) => descriptionSections.find((s) => s.title === title);

  const hrRecords = records.filter((r) => r.heartRate !== undefined && r.heartRate > 0);
  const hrLabels = buildTimeLabels(hrRecords);

  const elevData: ChartData = {
    labels: buildTimeLabels(records.filter((r) => r.altitude !== undefined)),
    values: records.filter((r) => r.altitude !== undefined).map((r) => r.altitude!),
  };

  const speedRecords = records.filter((r) => (r.speed ?? 0) > 0);
  const paceData: ChartData = {
    labels: buildTimeLabels(speedRecords),
    values: speedRecords.map((r) => {
      const mps = r.speed!;
      return mps > 0 ? parseFloat((1000 / mps / 60).toFixed(2)) : 0;
    }),
  };

  const powerRecords = records.filter((r) => (r.power ?? 0) > 0);
  const powerData: ChartData = {
    labels: buildTimeLabels(powerRecords),
    values: powerRecords.map((r) => r.power!),
  };

  const cadenceRecords = records.filter((r) => (r.cadence ?? 0) > 0);
  const cadenceData: ChartData = {
    labels: buildTimeLabels(cadenceRecords),
    values: cadenceRecords.map((r) => r.cadence!),
  };

  const speedData: ChartData = {
    labels: buildTimeLabels(speedRecords),
    values: speedRecords.map((r) => parseFloat((r.speed! * 3.6).toFixed(2))),
  };

  const hrSection = findSection('Heart Rate');
  const elevSection = findSection('Elevation');
  const paceSection = findSection('Pace');
  const powerSection = findSection('Power');
  const cadenceSection = findSection('Cadence');
  const speedSection = findSection('Speed');

  return (
    <>
      <SingleChart
        title="❤️ Heart Rate"
        data={{ labels: hrLabels, values: hrRecords.map((r) => r.heartRate!) }}
        color="#EF4444"
        statsContent={hrSection ? <HeartRateStats section={hrSection} /> : undefined}
      />
      <SingleChart
        title="⛰️ Elevation"
        data={elevData}
        color="#10B981"
        statsContent={elevSection ? <ElevationStats section={elevSection} /> : undefined}
      />
      <SingleChart
        title="⚡ Pace"
        data={paceData}
        color="#6366F1"
        statsContent={paceSection ? <PaceStats section={paceSection} /> : undefined}
      />
      <SingleChart
        title="⚡ Power"
        data={powerData}
        color="#F59E0B"
        statsContent={powerSection ? <PowerStats section={powerSection} /> : undefined}
      />
      <SingleChart
        title="🦶 Cadence"
        data={cadenceData}
        color="#8B5CF6"
        statsContent={cadenceSection ? <CadenceStats section={cadenceSection} /> : undefined}
      />
      <SingleChart
        title="🚀 Speed"
        data={speedData}
        color="#06B6D4"
        statsContent={speedSection ? <SpeedStats section={speedSection} /> : undefined}
      />
    </>
  );
};
