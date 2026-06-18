import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartExportTab, buildChartDefs } from '../ShowcaseExportChart';
import { RouteExportTab } from '../ShowcaseExportRoute';
import { HybridRaceExportTab } from '../ShowcaseExportHybridRace';
import { PRExportTab } from '../ShowcaseExportPR';
import { StoryExportTab } from '../ShowcaseExportStory';
import { ShowcaseExportModal, buildAllStats } from '../ShowcaseExportModal';
import type { components } from '../../../shared/api/schema-public';

type Record = components['schemas']['Record'];
type ShowcasedActivity = components['schemas']['ShowcasedActivity'];
type HybridRaceSegment = components['schemas']['HybridRaceSegment'];
type PersonalRecord = components['schemas']['PersonalRecord'];

vi.mock('../../../shared/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock('html-to-image', () => ({ toPng: vi.fn().mockResolvedValue('data:image/png;base64,') }));
vi.mock('../../utils/exportImage', () => ({ saveImage: vi.fn().mockResolvedValue(undefined) }));

const records: Record[] = [
  { timestamp: '2026-05-01T08:00:00Z', heartRate: 140, altitude: 10, speed: 3, power: 200, cadence: 80, positionLat: 1, positionLong: 2 },
  { timestamp: '2026-05-01T08:01:00Z', heartRate: 150, altitude: 12, speed: 3.2, power: 210, cadence: 82, positionLat: 1.1, positionLong: 2.1 },
  { timestamp: '2026-05-01T08:02:00Z', heartRate: 155, altitude: 14, speed: 3.4, power: 220, cadence: 84, positionLat: 1.2, positionLong: 2.2 },
] as unknown as Record[];

const activity = {
  showcaseId: 'abc',
  title: 'Morning Run',
  activityType: 'ACTIVITY_TYPE_RUN',
  startTime: '2026-05-01T08:00:00Z',
  ownerDisplayName: 'Jane',
  source: 'SOURCE_STRAVA',
  activityData: { sessions: [{ totalDistance: 5000, totalElapsedTime: 1800, laps: [{ records }] }] },
  enrichments: { personalRecords: { records: [{ recordType: 'Bench Press_1rm', newValue: 100, unit: 'kg' }] } },
} as unknown as ShowcasedActivity;

const noop = () => {};

describe('buildChartDefs / buildAllStats', () => {
  it('builds chart defs from records', () => {
    expect(buildChartDefs(records).length).toBeGreaterThan(0);
  });
  it('builds stats from an activity', () => {
    expect(buildAllStats(activity).length).toBeGreaterThan(0);
  });
});

describe('ChartExportTab', () => {
  it('renders with chart data', () => {
    render(<ChartExportTab records={records} accent="#fff" onAccentChange={noop} textColor="#fff" onTextColorChange={noop} activityTitle="Run" />);
    expect(screen.getByText(/Download PNG/)).toBeInTheDocument();
  });
  it('renders empty state with no charts', () => {
    render(<ChartExportTab records={[]} accent="#fff" onAccentChange={noop} textColor="#fff" onTextColorChange={noop} activityTitle="Run" />);
    expect(screen.getByText(/No chart data/)).toBeInTheDocument();
  });
});

describe('RouteExportTab', () => {
  it('renders with gps points', () => {
    render(<RouteExportTab gpsPoints={[{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }]} accent="#fff" onAccentChange={noop} />);
    expect(screen.getByText(/Download PNG/)).toBeInTheDocument();
  });
  it('renders empty state with no gps', () => {
    render(<RouteExportTab gpsPoints={[]} accent="#fff" onAccentChange={noop} />);
    expect(screen.getByText(/No GPS data/)).toBeInTheDocument();
  });
});

describe('HybridRaceExportTab', () => {
  it('renders race segments', () => {
    const segments = [
      { label: 'Run 1', durationSeconds: 240, isRun: true, icon: '🏃' },
      { label: 'Wall Balls', durationSeconds: 180, isRun: false, icon: '💪' },
    ] as unknown as HybridRaceSegment[];
    render(<HybridRaceExportTab segments={segments} activityTitle="Race" accent="#fff" onAccentChange={noop} />);
    expect(screen.getByText(/Download PNG/)).toBeInTheDocument();
  });
});

describe('PRExportTab', () => {
  it('renders PR records', () => {
    const prs = [{ recordType: 'Bench Press_1rm', newValue: 100, unit: 'kg' }] as unknown as PersonalRecord[];
    render(<PRExportTab records={prs} activity={activity} accent="#fff" onAccentChange={noop} textColor="#fff" onTextColorChange={noop} />);
    expect(screen.getByText(/Download PNG/)).toBeInTheDocument();
  });
});

describe('StoryExportTab', () => {
  it('renders the story preview', () => {
    render(<StoryExportTab data={activity} accent="#fff" onAccentChange={noop} textColor="#fff" onTextColorChange={noop} />);
    expect(screen.getByText(/Download PNG/)).toBeInTheDocument();
  });
});

describe('ShowcaseExportModal', () => {
  it('renders the modal with tabs', () => {
    render(<ShowcaseExportModal data={activity} onClose={noop} />);
    expect(screen.getByText(/Share Activity/)).toBeInTheDocument();
    expect(screen.getAllByText('Stats').length).toBeGreaterThan(0);
  });
});
