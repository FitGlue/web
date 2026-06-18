import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileActivityList } from '../ProfileActivityList';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];

const entry = (over: Partial<ShowcaseProfileEntry> = {}): ShowcaseProfileEntry =>
  ({
    showcaseId: 'abc',
    title: 'Morning Run',
    activityType: 'ACTIVITY_TYPE_RUN',
    startTime: '2026-05-01T08:00:00Z',
    distanceMeters: 5000,
    durationSeconds: 1800,
    ...over,
  }) as ShowcaseProfileEntry;

describe('ProfileActivityList', () => {
  it('renders grouped activities with a load-more button', () => {
    render(
      <ProfileActivityList
        entries={[entry(), entry({ showcaseId: 'def', title: 'Evening Ride', activityType: 'ACTIVITY_TYPE_RIDE' })]}
        hasMore
        loadingMore={false}
        onLoadMore={() => {}}
        profileSlug="jdoe"
      />,
    );
    expect(screen.getByText('Showcased Activities')).toBeInTheDocument();
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
    expect(screen.getByText('Load More Activities')).toBeInTheDocument();
  });

  it('shows the all-loaded footer when there is no more', () => {
    render(
      <ProfileActivityList
        entries={[entry()]}
        hasMore={false}
        loadingMore={false}
        onLoadMore={() => {}}
        profileSlug="jdoe"
      />,
    );
    expect(screen.getByText(/all the activities/)).toBeInTheDocument();
  });
});
