import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { DescriptionSection } from '../../DescriptionSections';

import { BulletListSection } from '../BulletListSection';
import { CadenceSection } from '../CadenceSection';
import { CaloriesSection } from '../CaloriesSection';
import { CompactPillsSection } from '../CompactPillsSection';
import { ConditionsSection } from '../ConditionsSection';
import { DistanceMilestonesSection } from '../DistanceMilestonesSection';
import { EffortSection } from '../EffortSection';
import { ElevationSection } from '../ElevationSection';
import { GoalSection } from '../GoalSection';
import { HRZonesSection } from '../HRZonesSection';
import { HeartRateSection } from '../HeartRateSection';
import { IntervalsSection } from '../IntervalsSection';
import { MuscleHeatmapSection } from '../MuscleHeatmapSection';
import { PaceSection } from '../PaceSection';
import { PersonalRecordsSection } from '../PersonalRecordsSection';
import { PowerSection } from '../PowerSection';
import { RecoveryAdvisorSection } from '../RecoveryAdvisorSection';
import { RunningDynamicsSection } from '../RunningDynamicsSection';
import { SpeedSection } from '../SpeedSection';
import { SplitsSection } from '../SplitsSection';
import { SpotifySoundtrackSection } from '../SpotifySoundtrackSection';
import { StreakSection } from '../StreakSection';
import { TrainingLoadSection } from '../TrainingLoadSection';
import { WorkoutSummarySection } from '../WorkoutSummarySection';

/** Build a minimal DescriptionSection with the given content. */
function section(content: string, over: Partial<DescriptionSection> = {}): DescriptionSection {
  return { emoji: '✨', title: 'Section', content, ...over };
}

describe('BulletListSection', () => {
  it('renders key:value and simple bullet rows', () => {
    const { container } = render(
      <BulletListSection section={section('• Reps: 100\n• Just a note')} idx={0} />,
    );
    expect(container.querySelector('.bullet-stat-row')).toBeTruthy();
    expect(container.querySelector('.bullet-stat-row-simple')).toBeTruthy();
  });
});

describe('CadenceSection', () => {
  it('renders parsed cadence stats', () => {
    const { container, getByText } = render(
      <CadenceSection section={section('178 spm avg • 190 spm max\nPace Correlation: strong')} idx={0} />,
    );
    expect(container.querySelector('.chart-stats-bar')).toBeTruthy();
    expect(getByText('178')).toBeInTheDocument();
    expect(getByText('190')).toBeInTheDocument();
  });
});

describe('CaloriesSection', () => {
  it('renders the calorie display when kcal pattern matches', () => {
    const { getByText } = render(
      <CaloriesSection section={section('540 kcal ≈ 2 burgers')} idx={0} />,
    );
    expect(getByText('540')).toBeInTheDocument();
    expect(getByText(/burgers/)).toBeInTheDocument();
  });

  it('falls back to pills when no kcal pattern', () => {
    const { container } = render(
      <CaloriesSection section={section('A • B')} idx={0} />,
    );
    expect(container.querySelector('.stat-pill')).toBeTruthy();
  });
});

describe('CompactPillsSection', () => {
  it('renders multiple pills', () => {
    const { container } = render(<CompactPillsSection section={section('a • b • c')} idx={0} />);
    expect(container.querySelectorAll('.stat-pill').length).toBe(3);
  });

  it('renders single value when only one part', () => {
    const { container } = render(<CompactPillsSection section={section('just one')} idx={0} />);
    expect(container.querySelector('.compact-pill-value')).toBeTruthy();
  });
});

describe('ConditionsSection', () => {
  it('renders merged location and weather items', () => {
    const { container } = render(
      <ConditionsSection
        section={section('', {
          title: 'Conditions',
          _merged: true,
          _location: section('London (UK)', { title: 'Location' }),
          _weather: section('Temp: 12°C • Wind: 10kph', { title: 'Weather' }),
        })}
        idx={0}
      />,
    );
    expect(container.querySelectorAll('.conditions-item').length).toBeGreaterThan(0);
  });
});

describe('DistanceMilestonesSection', () => {
  it('renders milestone-hit layout', () => {
    const { container } = render(
      <DistanceMilestonesSection
        section={section('MILESTONE: 1000 km\n100 km total\nThis run: +5 km')}
        idx={0}
      />,
    );
    expect(container.querySelector('.milestone-hit')).toBeTruthy();
  });

  it('renders progress layout when no milestone is hit', () => {
    const { container } = render(
      <DistanceMilestonesSection
        section={section('Total: 500 km\nNext: 600 km')}
        idx={0}
      />,
    );
    expect(container.querySelector('.milestone-progress-body')).toBeTruthy();
  });
});

describe('EffortSection', () => {
  it('renders the score header and bar', () => {
    const { container, getByText } = render(
      <EffortSection section={section('72/100 – Hard\nHeart rate elevated')} idx={0} />,
    );
    expect(getByText('72/100')).toBeInTheDocument();
    expect(container.querySelector('.effort-bar-fill')).toBeTruthy();
  });
});

describe('ElevationSection', () => {
  it('renders elevation stats', () => {
    const { container } = render(
      <ElevationSection section={section('+120m gain • -80m loss')} idx={0} />,
    );
    expect(container.querySelector('.chart-stats-bar')).toBeTruthy();
  });
});

describe('GoalSection', () => {
  it('renders a progress bar', () => {
    const { container } = render(
      <GoalSection section={section('[####....] 60% on track\n🎯 Keep going')} idx={0} />,
    );
    expect(container.querySelector('.progress-bar-fill')).toBeTruthy();
  });
});

describe('HRZonesSection', () => {
  it('renders a bar per zone', () => {
    const { container } = render(
      <HRZonesSection section={section('Zone 1 (Recovery): 10 min\nZone 2 (Endurance): 25 min')} idx={0} />,
    );
    expect(container.querySelector('.hr-zones-list')).toBeTruthy();
  });
});

describe('HeartRateSection', () => {
  it('renders parsed heart-rate stats', () => {
    const { getByText } = render(
      <HeartRateSection section={section('60 bpm min • 140 bpm avg • 180 bpm max\nDrift: +5 bpm (mild)')} idx={0} />,
    );
    expect(getByText('60')).toBeInTheDocument();
    expect(getByText('180')).toBeInTheDocument();
  });
});

describe('IntervalsSection', () => {
  it('renders interval group cards', () => {
    const { container } = render(
      <IntervalsSection
        section={section('5 × 400m\n💨 5 × 400m intervals\n  Run 1 • 1:25 • 165 bpm\n🔥 Warmup • 1.0km')}
        idx={0}
      />,
    );
    expect(container.querySelector('.intervals-body')).toBeTruthy();
  });
});

describe('MuscleHeatmapSection', () => {
  it('renders muscle bars when parseable', () => {
    const { container } = render(
      <MuscleHeatmapSection section={section('Chest: 🟪🟪⬜\nBack: High')} idx={0} />,
    );
    expect(container.querySelector('.muscle-heatmap-grid')).toBeTruthy();
  });

  it('falls back to pills when not parseable', () => {
    const { container } = render(
      <MuscleHeatmapSection section={section('A • B')} idx={0} />,
    );
    expect(container.querySelector('.stat-pill')).toBeTruthy();
  });
});

describe('PaceSection', () => {
  it('renders pace stats', () => {
    const { getByText } = render(
      <PaceSection section={section('5:30/km avg • 4:50/km best')} idx={0} />,
    );
    expect(getByText('5:30/km')).toBeInTheDocument();
  });
});

describe('PersonalRecordsSection', () => {
  it('renders grouped PR records', () => {
    const { container } = render(
      <PersonalRecordsSection
        section={section('🏆 Bench Press 1RM: 100kg (previous: 95kg, +5.3%)')}
        idx={0}
      />,
    );
    expect(container.querySelector('.pr-records-grid, .pr-distance-grid')).toBeTruthy();
  });

  it('falls back to pre when not parseable', () => {
    const { container } = render(
      <PersonalRecordsSection section={section('no records here')} idx={0} />,
    );
    expect(container.querySelector('pre')).toBeTruthy();
  });
});

describe('PowerSection', () => {
  it('renders power stats', () => {
    const { getByText } = render(
      <PowerSection section={section('220W avg • 600W max\nEst. FTP: 250W\nPeak 5s: 700W')} idx={0} />,
    );
    expect(getByText('220W')).toBeInTheDocument();
  });
});

describe('RecoveryAdvisorSection', () => {
  it('renders recovery stat blocks', () => {
    const { container } = render(
      <RecoveryAdvisorSection
        section={section(
          'Session load: 120 TRIMP (Hard)\n7-day load: 500 TRIMP • 28-day avg: 400 TRIMP\nACWR: 1.25 (optimal)\nSuggested recovery: 24h',
        )}
        idx={0}
      />,
    );
    expect(container.querySelector('.recovery-grid')).toBeTruthy();
  });
});

describe('RunningDynamicsSection', () => {
  it('renders dynamics stat blocks', () => {
    const { container } = render(
      <RunningDynamicsSection section={section('👟 GCT: 240ms • ↕️ Vert: 8.5cm')} idx={0} />,
    );
    expect(container.querySelector('.dynamics-grid')).toBeTruthy();
  });
});

describe('SpeedSection', () => {
  it('renders speed stats', () => {
    const { getByText } = render(
      <SpeedSection section={section('30.5 km/h avg • 45.0 km/h max\nConsistency: 80% (steady)')} idx={0} />,
    );
    expect(getByText('30.5')).toBeInTheDocument();
  });
});

describe('SplitsSection', () => {
  it('renders split rows with bars', () => {
    const { container } = render(
      <SplitsSection
        section={section('• Km 1: 5:30 🏆\n• Km 2: 5:45 🐢\nNegative split!')}
        idx={0}
      />,
    );
    expect(container.querySelector('.splits-grid')).toBeTruthy();
  });
});

describe('SpotifySoundtrackSection', () => {
  it('renders soundtrack details', () => {
    const { getByText } = render(
      <SpotifySoundtrackSection
        section={section('12 tracks • Top played: Song A • From playlist: Run Mix')}
        idx={0}
      />,
    );
    expect(getByText('12')).toBeInTheDocument();
    expect(getByText('Song A')).toBeInTheDocument();
  });
});

describe('StreakSection', () => {
  it('renders streak hero count', () => {
    const { container, getByText } = render(
      <StreakSection section={section('5-day streak\nPersonal best!\nKeep it up')} idx={0} />,
    );
    expect(container.querySelector('.streak-hero')).toBeTruthy();
    expect(getByText('5')).toBeInTheDocument();
  });
});

describe('TrainingLoadSection', () => {
  it('renders the load display when parseable', () => {
    const { container, getByText } = render(
      <TrainingLoadSection section={section('320 (Hard)')} idx={0} />,
    );
    expect(container.querySelector('.training-load-display')).toBeTruthy();
    expect(getByText('320')).toBeInTheDocument();
  });

  it('falls back to pills when not parseable', () => {
    const { container } = render(
      <TrainingLoadSection section={section('A • B')} idx={0} />,
    );
    expect(container.querySelector('.stat-pill')).toBeTruthy();
  });
});

describe('WorkoutSummarySection', () => {
  it('renders headline stats and exercise cards', () => {
    const { container } = render(
      <WorkoutSummarySection
        section={section('5 exercises • 20 sets\nHeaviest: Squat 120kg\n• Bench Press: 10 × 60kg, 10 × 60kg')}
        idx={0}
      />,
    );
    expect(container.querySelector('.workout-summary-body')).toBeTruthy();
    expect(container.querySelector('.workout-exercise-card')).toBeTruthy();
  });
});
