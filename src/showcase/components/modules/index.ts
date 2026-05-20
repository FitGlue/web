import React from 'react';

interface ModuleProps {
  title: string;
  right?: string;
  span?: 4 | 6 | 12;
  children: React.ReactNode;
}

export function Module({ title, right, span = 6, children }: ModuleProps): React.ReactElement {
  return React.createElement(
    'div',
    { className: `mod mod--span${span}` },
    React.createElement(
      'div',
      { className: 'mod__header' },
      React.createElement('h3', { className: 'mod__title' }, title),
      right ? React.createElement('span', { className: 'mod__right' }, right) : null,
    ),
    children,
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
