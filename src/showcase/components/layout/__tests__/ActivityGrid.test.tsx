import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityGrid from '../ActivityGrid';
import type { components } from '../../../../shared/api/schema-public';

type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];

vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('html-to-image', () => ({ toPng: vi.fn().mockResolvedValue('data:image/png;base64,') }));
vi.mock('../../../utils/exportImage', () => ({ saveImage: vi.fn().mockResolvedValue(undefined) }));

const entry = (over: Partial<ShowcaseProfileEntry> = {}): ShowcaseProfileEntry =>
  ({
    showcaseId: 'abc',
    title: 'Morning Run',
    activityType: 'ACTIVITY_TYPE_RUN',
    startTime: '2026-05-01T08:00:00Z',
    distanceMeters: 5000,
    durationSeconds: 1800,
    avgHeartRate: 150,
    ...over,
  }) as ShowcaseProfileEntry;

describe('ActivityGrid', () => {
  it('renders the feed head and activity cards', () => {
    render(
      <ActivityGrid
        entries={[entry(), entry({ showcaseId: 'def', title: 'Ride', activityType: 'ACTIVITY_TYPE_RIDE' })]}
        totalActivities={2}
        profileSlug="jane"
      />,
    );
    expect(screen.getByText(/Activity feed/)).toBeInTheDocument();
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
  });

  it('shows the no-activities fallback when empty', () => {
    render(<ActivityGrid entries={[]} profileSlug="jane" />);
    expect(screen.getByText('No activities')).toBeInTheDocument();
  });
});
