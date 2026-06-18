import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConsistencyHeatmap from '../ConsistencyHeatmap';
import LifetimeStats from '../LifetimeStats';
import MedalWall from '../MedalWall';
import ProfileHero from '../ProfileHero';
import RouteMosaic from '../RouteMosaic';
import ZoneBar from '../ZoneBar';
import BoosterTimeline from '../BoosterTimeline';
import ActivityHero from '../ActivityHero';
import type { components } from '../../../../shared/api/schema-public';

type ShowcaseProfile = components['schemas']['ShowcaseProfile'];
type ShowcaseProfileEntry = components['schemas']['ShowcaseProfileEntry'];
type ShowcasedActivity = components['schemas']['ShowcasedActivity'];

const profile = (over: Partial<ShowcaseProfile> = {}): ShowcaseProfile =>
  ({
    displayName: 'Jane Doe',
    slug: 'jane',
    totalActivities: 1200,
    totalDistanceMeters: 5_000_000,
    totalDurationSeconds: 360000,
    totalWeightKg: 120000,
    createdAt: '2024-01-01T00:00:00Z',
    latestActivityAt: '2026-06-01T00:00:00Z',
    streakHistory: { weeklyActive: new Array(20).fill(true), weeksTracked: 20, missedWeeks: 1 },
    zoneSplit: { zones: [{ minutes: 600, percentage: 20 }, { minutes: 900, percentage: 30 }, { minutes: 300, percentage: 10 }, { minutes: 300, percentage: 10 }, { minutes: 300, percentage: 10 }] },
    topPrs: [{ recordType: 'bench_1rm', value: 100, unit: 'kg', achievedAt: '2026-05-01T00:00:00Z', previousValue: 95 }],
    ...over,
  }) as ShowcaseProfile;

describe('ConsistencyHeatmap', () => {
  it('returns null with too few weeks', () => {
    const { container } = render(<ConsistencyHeatmap streakHistory={{ weeklyActive: [true, false] }} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('renders a heatmap grid', () => {
    const { container } = render(<ConsistencyHeatmap streakHistory={{ weeklyActive: new Array(10).fill(true) }} />);
    expect(container.querySelectorAll('.heatmap-sq').length).toBe(10);
  });
});

describe('LifetimeStats', () => {
  it('renders lifetime activity counts', () => {
    render(<LifetimeStats profile={profile()} />);
    expect(screen.getByText('Activities')).toBeInTheDocument();
  });
});

describe('MedalWall', () => {
  it('renders the medal band when medals exist', () => {
    const { container } = render(<MedalWall profile={profile()} />);
    expect(container.querySelector('.medal-band')).toBeTruthy();
  });
  it('returns null with no medals', () => {
    const { container } = render(<MedalWall profile={profile({ totalActivities: 0, totalDistanceMeters: 0, totalWeightKg: 0, streakHistory: undefined, topPrs: [] })} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ProfileHero', () => {
  it('renders the athlete name and handle', () => {
    render(<ProfileHero profile={profile()} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });
});

describe('RouteMosaic', () => {
  it('returns null with fewer than 3 thumbnails', () => {
    const { container } = render(<RouteMosaic entries={[]} profileSlug="jane" />);
    expect(container).toBeEmptyDOMElement();
  });
  it('renders thumbnails when there are enough', () => {
    const entries = [1, 2, 3].map((i) => ({ showcaseId: `s${i}`, title: `Run ${i}`, routeThumbnailUrl: `/r${i}.jpg` })) as unknown as ShowcaseProfileEntry[];
    const { container } = render(<RouteMosaic entries={entries} profileSlug="jane" />);
    expect(container.querySelectorAll('.route-mosaic__item').length).toBe(3);
  });
});

describe('ZoneBar', () => {
  it('returns null without zones', () => {
    const { container } = render(<ZoneBar zoneSplit={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('renders zone segments', () => {
    const { container } = render(<ZoneBar zoneSplit={{ zones: [{ minutes: 600, name: 'Z1' }, { minutes: 1200, name: 'Z2' }] }} />);
    expect(container.querySelector('.zone-bar')).toBeTruthy();
  });
});

describe('BoosterTimeline', () => {
  it('renders applied enrichers', () => {
    render(<BoosterTimeline appliedEnrichments={['ENRICHER_PROVIDER_HEART_RATE_SUMMARY', 'ENRICHER_PROVIDER_AI_BANNER']} />);
    expect(screen.getByText(/Booster Sequence/)).toBeInTheDocument();
    expect(screen.getByText(/2 ran/)).toBeInTheDocument();
  });
});

describe('ActivityHero', () => {
  it('renders the activity title and anchor stats', () => {
    const activity = {
      title: 'Morning Run',
      activityType: 'ACTIVITY_TYPE_RUN',
      startTime: '2026-05-01T08:00:00Z',
      ownerDisplayName: 'Jane',
      source: 'SOURCE_STRAVA',
      activityData: { sessions: [{ totalElapsedTime: 1800, totalDistance: 5000 }] },
      enrichments: { heartRate: { avgBpm: 150 } },
    } as unknown as ShowcasedActivity;
    render(<ActivityHero activity={activity} ownerProfileSlug="jane" />);
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
  });
});
