import { describe, it, expect } from 'vitest';
import { buildReelData, planScenes, reelDuration, REEL_W, REEL_H, REEL_DURATION } from '../roundupReel';
import type { ShowcaseRoundup } from '../roundup';

describe('reel constants', () => {
  it('is a 9:16 vertical clip', () => {
    expect(REEL_W).toBe(1080);
    expect(REEL_H).toBe(1920);
    expect(REEL_H / REEL_W).toBeCloseTo(16 / 9, 5);
    expect(REEL_DURATION).toBeGreaterThan(0);
  });
});

describe('buildReelData', () => {
  it('derives eyebrow, title and counting stats', () => {
    const r: ShowcaseRoundup = {
      periodType: 'ROUNDUP_PERIOD_TYPE_YEAR',
      periodKey: 'year-2025',
      totalActivities: 180,
      totalDurationSeconds: 360000, // 100h
      totalDistanceMeters: 1_420_000, // 1420km
      totalCaloriesKcal: 90000,
    };
    const d = buildReelData(r, 'year-2025');
    expect(d.eyebrow).toBe('YEAR IN SPORT');
    expect(d.title).toBe('2025');
    const byLabel = Object.fromEntries(d.stats.map((s) => [s.label, s]));
    expect(byLabel.Sessions.num).toBe(180);
    expect(byLabel['Total Time']).toEqual({ num: 100, suffix: 'h', label: 'Total Time' });
    expect(byLabel.Distance).toEqual({ num: 1420, suffix: 'km', label: 'Distance' });
    expect(byLabel.Calories.num).toBe(90000);
    expect(d.stats.length).toBeLessThanOrEqual(4);
  });

  it('uses weight moved when there is no distance', () => {
    const r: ShowcaseRoundup = {
      periodType: 'ROUNDUP_PERIOD_TYPE_MONTH',
      totalActivities: 12,
      totalDurationSeconds: 36000,
      activityTypeBreakdowns: [
        { activityType: 'ACTIVITY_TYPE_WEIGHT_TRAINING', activityCount: 12, totalSets: 200, totalWeightKg: 48000 },
      ],
    };
    const d = buildReelData(r, 'month-06-2025');
    const moved = d.stats.find((s) => s.label === 'Moved');
    expect(moved).toEqual({ num: 48, suffix: 't', label: 'Moved' });
    expect(d.stats.find((s) => s.label === 'Distance')).toBeUndefined();
  });

  it('prioritises PRs for the highlight scene', () => {
    const r: ShowcaseRoundup = {
      periodType: 'ROUNDUP_PERIOD_TYPE_WEEK',
      totalActivities: 5,
      totalElevationGainMeters: 800,
      prsAchieved: [{}, {}, {}],
    };
    const d = buildReelData(r, 'week-24-2025');
    expect(d.highlight?.big).toBe('3');
    expect(d.highlight?.label).toBe('Personal Records');
  });

  it('falls back to elevation, then longest session, then null', () => {
    const elev = buildReelData({ totalElevationGainMeters: 1200 }, 'year-2025');
    expect(elev.highlight?.label).toBe('Total Vertical');

    const longest = buildReelData({ longestActivityDurationSeconds: 7200 }, 'year-2025');
    expect(longest.highlight?.label).toBe('Longest Session');
    expect(longest.highlight?.big).toBe('2h 0m');

    const none = buildReelData({ totalActivities: 1 }, 'year-2025');
    expect(none.highlight).toBeNull();
  });

  it('caps sports at five with percentages', () => {
    const r: ShowcaseRoundup = {
      activityTypeBreakdowns: [
        { activityType: 'ACTIVITY_TYPE_RUN', activityCount: 10 },
        { activityType: 'ACTIVITY_TYPE_RIDE', activityCount: 6 },
        { activityType: 'ACTIVITY_TYPE_SWIM', activityCount: 3 },
        { activityType: 'ACTIVITY_TYPE_HIKE', activityCount: 2 },
        { activityType: 'ACTIVITY_TYPE_YOGA', activityCount: 1 },
        { activityType: 'ACTIVITY_TYPE_WALK', activityCount: 1 },
      ],
    };
    const d = buildReelData(r, 'year-2025');
    expect(d.sports.length).toBe(5);
    expect(d.sports[0].count).toBe(10);
    expect(d.sports[0].pct).toBeCloseTo(10 / 23, 5);
  });

  it('exposes page-style data sources (date range, photos, cal days, hr)', () => {
    const r: ShowcaseRoundup = {
      periodType: 'ROUNDUP_PERIOD_TYPE_MONTH',
      periodStart: '2026-05-01T00:00:00Z',
      periodEnd: '2026-06-01T00:00:00Z',
      ownerDisplayName: 'James King',
      ownerProfileSlug: 'jamesking',
      hrZoneMinutes: [0, 100, 200, 50, 20, 5],
      dayEntries: [{ date: '2026-05-03', effortLevel: 3 }],
      photos: [{ url: 'https://cdn.example/p1.jpg' }, { url: '' }],
      routes: [{ thumbnailUrl: 'https://cdn.example/r1.png' }],
    };
    const d = buildReelData(r, 'month-05-2026');
    expect(d.dateRange).toContain('MAY');
    expect(d.handle).toBe('jamesking');
    expect(d.photos).toEqual(['https://cdn.example/p1.jpg', 'https://cdn.example/r1.png']);
    expect(d.calDays.length).toBeGreaterThan(1);
    expect(d.hrMinutes).toEqual([0, 100, 200, 50, 20, 5]);
  });
});

describe('planScenes', () => {
  const rich: ShowcaseRoundup = {
    periodType: 'ROUNDUP_PERIOD_TYPE_MONTH',
    periodStart: '2026-05-01T00:00:00Z',
    periodEnd: '2026-06-01T00:00:00Z',
    totalActivities: 20,
    totalDurationSeconds: 72000,
    activityTypeBreakdowns: [{ activityType: 'ACTIVITY_TYPE_RUN', activityCount: 20 }],
    hrZoneMinutes: [0, 100, 200, 50, 20, 5],
    dayEntries: [{ date: '2026-05-03', effortLevel: 3 }],
    prsAchieved: [{}, {}],
  };

  it('always includes cover, stats and outro', () => {
    const ids = planScenes(buildReelData({ totalActivities: 1 }, 'year-2025'), false).map((s) => s.id);
    expect(ids[0]).toBe('cover');
    expect(ids).toContain('stats');
    expect(ids[ids.length - 1]).toBe('outro');
  });

  it('includes data-driven scenes only when supported', () => {
    const ids = planScenes(buildReelData(rich, 'month-05-2026'), false).map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(['donut', 'heatmap', 'hr', 'highlight']));
    expect(ids).not.toContain('photos'); // no usable photos passed
    expect(ids).not.toContain('efforts'); // no best efforts on `rich`
  });

  it('adds the efforts scene when best efforts exist', () => {
    const d = buildReelData(
      { ...rich, bestEfforts: [{ distanceKey: '5k', display: '5K', timeSeconds: 1200, distanceM: 5000 }] },
      'month-05-2026',
    );
    expect(d.efforts).toEqual([{ label: '5K', time: '20:00' }]);
    expect(planScenes(d, false).map((s) => s.id)).toContain('efforts');
  });

  it('adds the photo scene only when usable photos exist', () => {
    const d = buildReelData(rich, 'month-05-2026');
    expect(planScenes(d, false).map((s) => s.id)).not.toContain('photos');
    expect(planScenes(d, true).map((s) => s.id)).toContain('photos');
  });

  it('reelDuration sums scene durations and grows with content', () => {
    const lean = reelDuration(planScenes(buildReelData({ totalActivities: 1 }, 'year-2025'), false));
    const full = reelDuration(planScenes(buildReelData(rich, 'month-05-2026'), true));
    expect(lean).toBeGreaterThan(0);
    expect(full).toBeGreaterThan(lean);
  });
});
