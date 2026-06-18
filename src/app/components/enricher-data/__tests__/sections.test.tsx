import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const { GET, PUT, DELETE } = vi.hoisted(() => ({
  GET: vi.fn(),
  PUT: vi.fn(),
  DELETE: vi.fn(),
}));

vi.mock('../../../../shared/api/client', () => ({
  client: { GET: (...a: unknown[]) => GET(...a), PUT: (...a: unknown[]) => PUT(...a), DELETE: (...a: unknown[]) => DELETE(...a) },
  default: { GET: (...a: unknown[]) => GET(...a), PUT: (...a: unknown[]) => PUT(...a), DELETE: (...a: unknown[]) => DELETE(...a) },
}));
vi.mock('../../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('../../library/ui', async (orig) => {
  const actual = await orig<typeof import('../../library/ui')>();
  return { ...actual, useToast: () => ({ show: vi.fn(), success: vi.fn(), error: vi.fn() }) };
});

import CountersSection from '../CountersSection';
import DurationInput from '../DurationInput';
import DistanceMilestonesSection from '../DistanceMilestonesSection';
import GoalTrackersSection from '../GoalTrackersSection';
import StreakTrackersSection from '../StreakTrackersSection';
import PersonalRecordsSection from '../PersonalRecordsSection';

beforeEach(() => {
  vi.clearAllMocks();
  GET.mockResolvedValue({ data: { counters: [], records: [] } });
  PUT.mockResolvedValue({ data: {} });
  DELETE.mockResolvedValue({ data: {} });
});

describe('DurationInput', () => {
  it('renders hours/minutes/seconds and propagates changes', () => {
    const onChange = vi.fn();
    render(<DurationInput value={3661} onChange={onChange} />);
    const hours = screen.getByLabelText('Hours') as HTMLInputElement;
    expect(hours.value).toBe('1');
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '30' } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('CountersSection', () => {
  it('renders and loads counters, then expands', async () => {
    GET.mockResolvedValue({ data: { counters: [{ id: 'c1', count: 5, lastUpdated: '2026-01-01' }] } });
    const { container } = render(<CountersSection />);
    expect(container).toBeTruthy();
    await waitFor(() => expect(GET).toHaveBeenCalled());
    fireEvent.click(screen.getByText('Auto-Increment Counters'));
    expect(screen.getByText('c1')).toBeTruthy();
  });
});

describe('PersonalRecordsSection', () => {
  it('renders without throwing', async () => {
    const { container } = render(<PersonalRecordsSection />);
    expect(container).toBeTruthy();
    await waitFor(() => expect(GET).toHaveBeenCalled());
  });
});

describe('booster-data driven sections', () => {
  const entries = [{ id: 'goal_tracker_week_distance', data: { current: 10 } }];
  const onRefresh = vi.fn();

  it('DistanceMilestonesSection renders', () => {
    const { container } = render(
      <DistanceMilestonesSection entries={[{ id: 'distance_milestones_any', data: {} }]} loading={false} onRefresh={onRefresh} />,
    );
    expect(container).toBeTruthy();
  });

  it('GoalTrackersSection renders', () => {
    const { container } = render(<GoalTrackersSection entries={entries} loading={false} onRefresh={onRefresh} />);
    expect(container).toBeTruthy();
  });

  it('StreakTrackersSection renders', () => {
    const { container } = render(
      <StreakTrackersSection entries={[{ id: 'streak_tracker_any', data: {} }]} loading={false} onRefresh={onRefresh} />,
    );
    expect(container).toBeTruthy();
  });

  it('renders loading state', () => {
    const { container } = render(<GoalTrackersSection entries={[]} loading={true} onRefresh={onRefresh} />);
    expect(container).toBeTruthy();
  });
});
