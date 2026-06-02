import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';

interface ModuleProps {
  title: string;
  right?: string;
  span?: 4 | 6 | 12;
  children: React.ReactNode;
}

export function Module({ title, right, span = 6, children }: ModuleProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(async (transparent: boolean) => {
    if (!ref.current || downloading) return;
    setDownloading(true);
    const el = ref.current;
    const origBg = el.style.background;
    if (transparent) el.style.background = 'transparent';
    try {
      const png = await toPng(el, {
        pixelRatio: 2,
        backgroundColor: transparent ? undefined : '#0d0d0d',
      });
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-fitglue.png`;
      link.href = png;
      link.click();
    } catch (err) {
      console.error('Module export failed:', err);
    } finally {
      if (transparent) el.style.background = origBg;
      setDownloading(false);
    }
  }, [title, downloading]);

  return (
    <div ref={ref} className={`mod mod--span${span}`}>
      <div className="mod__header">
        <h3 className="mod__title">{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {right && <span className="mod__right">{right}</span>}
          <div className="mod__share-btns">
            <button
              className="mod__share-btn"
              onClick={() => download(false)}
              title="Save as image (dark)"
              disabled={downloading}
            >
              ◼
            </button>
            <button
              className="mod__share-btn mod__share-btn--clear"
              onClick={() => download(true)}
              title="Save as image (transparent)"
              disabled={downloading}
            >
              ◻
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export { default as HeartRateModule } from './HeartRateModule';
export { default as HRZonesModule } from './HRZonesModule';
export { default as PaceModule } from './PaceModule';
export { default as SpeedModule } from './SpeedModule';
export { default as CadenceModule } from './CadenceModule';
export { default as PowerModule } from './PowerModule';
export { default as ElevationModule } from './ElevationModule';
export { default as EffortModule } from './EffortModule';
export { default as CaloriesModule } from './CaloriesModule';
export { default as TrainingLoadModule } from './TrainingLoadModule';
export { default as RecoveryModule } from './RecoveryModule';
export { default as StreakModule } from './StreakModule';
export { default as WeatherModule } from './WeatherModule';
export { default as IntervalsModule } from './IntervalsModule';
export { default as RunningDynamicsModule } from './RunningDynamicsModule';
export { default as ParkrunModule } from './ParkrunModule';
export { default as SpotifyModule } from './SpotifyModule';
export { default as GoalTrackerModule } from './GoalTrackerModule';
export { default as MuscleHeatmapModule } from './MuscleHeatmapModule';
export { default as SetListModule } from './SetListModule';
export { default as PersonalRecordsCallout } from './PersonalRecordsCallout';
export { default as MilestoneCallout } from './MilestoneCallout';
export { default as BestEffortsModule } from './BestEffortsModule';
