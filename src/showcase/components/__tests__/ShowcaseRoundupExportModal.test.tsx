import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShowcaseRoundupExportModal } from '../ShowcaseRoundupExportModal';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('html-to-image', () => ({ toPng: vi.fn().mockResolvedValue('data:image/png;base64,') }));
vi.mock('../../utils/exportImage', () => ({ saveImage: vi.fn().mockResolvedValue(undefined) }));

const roundup = {
  periodKey: 'month-05-2026',
  periodType: 'ROUNDUP_PERIOD_TYPE_MONTH',
  periodStart: '2026-05-01T00:00:00Z',
  periodEnd: '2026-06-01T00:00:00Z',
  ownerDisplayName: 'Jane',
  totalActivities: 12,
  totalDurationSeconds: 36000,
  totalDistanceMeters: 60000,
  activityTypeBreakdowns: [{ activityType: 'ACTIVITY_TYPE_RUN', count: 12, totalDistanceMeters: 60000 }],
  hrZoneMinutes: [0, 30, 60, 40, 20, 10],
  dayEntries: [{ date: '2026-05-02', effortLevel: 2 }, { date: '2026-05-03', effortLevel: 1 }],
  prsAchieved: [{ recordType: 'Bench Press_1rm', newValue: 100, unit: 'kg', exerciseName: 'Bench Press' }],
  sources: ['SOURCE_STRAVA'],
} as unknown as ShowcaseRoundup;

describe('ShowcaseRoundupExportModal', () => {
  it('renders the modal with the overview tab', () => {
    render(<ShowcaseRoundupExportModal roundup={roundup} periodKey="month-05-2026" onClose={() => {}} />);
    expect(screen.getByText(/Share Roundup/)).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });
});
