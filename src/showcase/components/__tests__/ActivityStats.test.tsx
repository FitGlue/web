import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityStats } from '../ActivityStats';
import type { components } from '../../../shared/api/schema-public';

type Session = components['schemas']['Session'];

describe('ActivityStats', () => {
  it('renders nothing when there are no usable stats', () => {
    const { container } = render(<ActivityStats session={{} as Session} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders duration, distance and HR cards for a cardio session', () => {
    const session = {
      totalElapsedTime: 1800,
      totalDistance: 5000,
      laps: [
        {
          records: [
            { heartRate: 150 },
            { heartRate: 160 },
            { power: 200 },
            { cadence: 80 },
            { speed: 3 },
          ],
        },
      ],
    } as unknown as Session;

    render(<ActivityStats session={session} activityType="ACTIVITY_TYPE_RUN" />);
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('Avg BPM')).toBeInTheDocument();
    expect(screen.getByText('Avg Power')).toBeInTheDocument();
  });

  it('renders strength stats from strengthSets', () => {
    const session = {
      strengthSets: [
        { reps: 10, weightKg: 50 },
        { reps: 8, weightKg: 60 },
      ],
    } as unknown as Session;

    render(<ActivityStats session={session} activityType="ACTIVITY_TYPE_WEIGHT_TRAINING" />);
    expect(screen.getByText('Sets')).toBeInTheDocument();
    expect(screen.getByText('Reps')).toBeInTheDocument();
  });
});
