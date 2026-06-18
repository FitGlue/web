import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModuleGrid from '../ModuleGrid';
import type { components } from '../../../../shared/api/schema-public';
import type { ModuleKey } from '../../../utils/enricherModules';

type ShowcasedActivity = components['schemas']['ShowcasedActivity'];

vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));

const activity = {
  showcaseId: 'abc',
  title: 'Morning Run',
  activityType: 'ACTIVITY_TYPE_RUN',
  source: 'SOURCE_STRAVA',
  description: 'A solid run today.',
  tags: ['easy', 'recovery'],
  activityData: { sessions: [] },
} as unknown as ShowcasedActivity;

describe('ModuleGrid', () => {
  it('renders the no-enrichments fallback when enrichments are missing', () => {
    render(<ModuleGrid moduleOrder={[]} enrichments={undefined} activity={activity} />);
    expect(screen.getByText(/Boosters didn/)).toBeInTheDocument();
  });

  it('renders pre-grid description and tags modules', () => {
    const order: ModuleKey[] = ['description', 'tags'];
    const { container } = render(<ModuleGrid moduleOrder={order} enrichments={undefined} activity={activity} />);
    expect(container.querySelector('.activity-description')).toBeTruthy();
    expect(screen.getByText('easy')).toBeInTheDocument();
  });
});
