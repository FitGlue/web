/**
 * Render-level tests for the reel canvas drawing code.
 *
 * jsdom has no real 2D canvas context, so we drive the drawing functions with a
 * Skia-backed context from @napi-rs/canvas (already a dev dependency). This
 * actually executes every per-scene draw routine end-to-end, which guards
 * against runtime crashes in the rendering pipeline (bad gradients, undefined
 * field access, etc.) that pure-logic tests can't catch.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createCanvas } from '@napi-rs/canvas';
import {
  buildReelData,
  planScenes,
  reelDuration,
  drawReelFrame,
  recordReel,
  REEL_W,
  REEL_H,
  type SceneId,
} from '../roundupReel';
import type { ShowcaseRoundup } from '../roundup';

// The drawing code's film-grain helper calls document.createElement('canvas')
// .getContext('2d'); jsdom logs a noisy "Not implemented" each time. Returning
// null quietly preserves the production fallback (grain is simply skipped).
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

function ctx2d() {
  const canvas = createCanvas(REEL_W, REEL_H);
  return canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
}

// A roundup rich enough that planScenes emits every scene type.
const richRoundup: ShowcaseRoundup = {
  periodType: 'ROUNDUP_PERIOD_TYPE_MONTH',
  periodKey: 'month-05-2026',
  periodStart: '2026-05-01T00:00:00Z',
  periodEnd: '2026-06-01T00:00:00Z',
  ownerDisplayName: 'James King',
  ownerProfileSlug: 'jamesking',
  totalActivities: 42,
  totalDurationSeconds: 180000,
  totalDistanceMeters: 520000,
  totalElevationGainMeters: 3200,
  totalCaloriesKcal: 64000,
  activityTypeBreakdowns: [
    { activityType: 'ACTIVITY_TYPE_RUN', activityCount: 20, totalSets: 0 },
    { activityType: 'ACTIVITY_TYPE_RIDE', activityCount: 12 },
    { activityType: 'ACTIVITY_TYPE_SWIM', activityCount: 6 },
    { activityType: 'ACTIVITY_TYPE_WEIGHT_TRAINING', activityCount: 4, totalSets: 80, totalWeightKg: 30000 },
  ],
  hrZoneMinutes: [10, 120, 240, 90, 40, 12],
  dayEntries: [
    { date: '2026-05-02', effortLevel: 2 },
    { date: '2026-05-09', effortLevel: 4 },
    { date: '2026-05-17', effortLevel: 5 },
    { date: '2026-05-25', effortLevel: 1 },
  ],
  bestEfforts: [
    { distanceKey: '5k', display: '5K', timeSeconds: 1140, distanceM: 5000 },
    { distanceKey: '10k', display: '10K', timeSeconds: 2520, distanceM: 10000 },
  ],
  muscles: [
    { name: 'upper_back', count: 12 },
    { name: 'chest', count: 9 },
    { name: 'quads', count: 7 },
  ],
  places: [
    { name: 'Bushy Park', country: 'England', activityCount: 8 },
    { name: 'Richmond Park', country: 'England', activityCount: 5 },
  ],
  weather: { sessionCount: 30, rainCount: 6, coldestTempC: 1.4, hottestTempC: 27.9 },
  prsAchieved: [
    { recordType: 'bench_press_1rm', value: 100, unit: 'kg', previousValue: 95 },
    { recordType: 'bench_press_reps', value: 12, unit: 'reps' },
    { recordType: 'squat_1rm', value: 150, unit: 'kg' },
    { recordType: 'fastest_5k', value: 1140, unit: 'seconds', previousValue: 1200 },
  ],
  photos: [{ url: 'https://cdn.example/p1.jpg' }, { url: 'https://cdn.example/p2.jpg' }],
  routes: [{ thumbnailUrl: 'https://cdn.example/r1.png' }],
};

describe('drawReelFrame', () => {
  it('plans every scene type from the rich roundup', () => {
    const d = buildReelData(richRoundup, 'month-05-2026');
    const ids = new Set(planScenes(d, true).map((s) => s.id));
    const expected: SceneId[] = [
      'cover', 'stats', 'donut', 'photos', 'heatmap', 'hr',
      'efforts', 'muscles', 'places', 'weather', 'prcards', 'highlight', 'outro',
    ];
    for (const id of expected) expect(ids.has(id)).toBe(true);
  });

  it('renders every scene + transition across the full timeline without throwing', () => {
    const d = buildReelData(richRoundup, 'month-05-2026');
    const total = reelDuration(planScenes(d, true));
    const ctx = ctx2d();

    // Step finely enough to land inside every scene and both transition edges.
    for (let t = 0; t <= total + 0.5; t += 0.1) {
      expect(() => drawReelFrame(ctx, d, t, '#22D3EE', { images: [], hasPhotos: true })).not.toThrow();
    }
  });

  it('renders with loaded photo images supplied in the draw context', () => {
    const d = buildReelData(richRoundup, 'month-05-2026');
    const ctx = ctx2d();

    // Build two real raster images for the montage scene.
    const mk = (color: string) => {
      const c = createCanvas(400, 400);
      const cc = c.getContext('2d');
      cc.fillStyle = color;
      cc.fillRect(0, 0, 400, 400);
      return c as unknown as HTMLImageElement;
    };
    const images = [mk('#ff0000'), mk('#00ff00')];

    const scenes = planScenes(d, true);
    let acc = 0;
    for (const s of scenes) {
      // Sample the middle of each scene where content is fully drawn.
      const mid = acc + s.dur / 2;
      expect(() => drawReelFrame(ctx, d, mid, '#FF3DA6', { images, hasPhotos: true })).not.toThrow();
      acc += s.dur;
    }
  });

  it('handles a sparse roundup (only cover, stats and outro)', () => {
    const d = buildReelData({ totalActivities: 1, totalDurationSeconds: 600 }, 'year-2025');
    const ctx = ctx2d();
    const total = reelDuration(planScenes(d, false));
    for (let t = 0; t <= total; t += 0.2) {
      expect(() => drawReelFrame(ctx, d, t, '#8B5CF6', { images: [], hasPhotos: false })).not.toThrow();
    }
  });

  it('clamps out-of-range times to the timeline bounds', () => {
    const d = buildReelData(richRoundup, 'month-05-2026');
    const ctx = ctx2d();
    expect(() => drawReelFrame(ctx, d, -5, '#22D3EE')).not.toThrow();
    expect(() => drawReelFrame(ctx, d, 9999, '#22D3EE')).not.toThrow();
  });

  it('drops disabled scenes from the render plan', () => {
    const d = buildReelData(richRoundup, 'month-05-2026');
    const ctx = ctx2d();
    const disabled = new Set<SceneId>(['donut', 'hr', 'weather']);
    expect(() =>
      drawReelFrame(ctx, d, 1, '#22D3EE', { images: [], hasPhotos: false, disabled }),
    ).not.toThrow();
    const ids = planScenes(d, false, disabled).map((s) => s.id);
    expect(ids).not.toContain('donut');
    expect(ids).not.toContain('weather');
  });
});

describe('recordReel', () => {
  it('rejects when MediaRecorder is unavailable in the environment', async () => {
    const canvas = createCanvas(REEL_W, REEL_H) as unknown as HTMLCanvasElement;
    await expect(recordReel(canvas, () => {}, 1)).rejects.toThrow(/not supported/i);
  });
});
