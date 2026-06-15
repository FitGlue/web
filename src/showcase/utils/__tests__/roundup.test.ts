import { describe, it, expect } from 'vitest';
import {
  fmtKm,
  fmtHM,
  pad2,
  periodWord,
  heroTitle,
  periodShortLabel,
  formatDateRange,
  ownerInitials,
  isoWeek,
  computePrevPeriodKey,
  buildSportVMs,
  buildCalendarDays,
  calloutVisual,
  buildPRVM,
  pctDelta,
  buildDeltas,
  SPORT_PALETTE,
  type ShowcaseRoundup,
} from '../roundup';

describe('format helpers', () => {
  it('fmtKm rounds metres to whole km', () => {
    expect(fmtKm(0)).toBe('0');
    expect(fmtKm(5400)).toBe('5');
    expect(fmtKm(142_000)).toBe('142');
  });

  it('fmtHM splits seconds into hours and minutes', () => {
    expect(fmtHM(0)).toEqual({ h: 0, m: 0 });
    expect(fmtHM(3600)).toEqual({ h: 1, m: 0 });
    expect(fmtHM(3661)).toEqual({ h: 1, m: 1 });
    expect(fmtHM(20_520)).toEqual({ h: 5, m: 42 });
  });

  it('pad2 zero-pads single digits', () => {
    expect(pad2(1)).toBe('01');
    expect(pad2(12)).toBe('12');
  });

  it('periodWord maps the enum', () => {
    expect(periodWord('ROUNDUP_PERIOD_TYPE_WEEK')).toBe('Week');
    expect(periodWord('ROUNDUP_PERIOD_TYPE_MONTH')).toBe('Month');
    expect(periodWord('ROUNDUP_PERIOD_TYPE_YEAR')).toBe('Year');
    expect(periodWord(undefined)).toBe('Period');
  });

  it('ownerInitials derives up to two letters', () => {
    expect(ownerInitials(undefined)).toBe('FG');
    expect(ownerInitials('')).toBe('FG');
    expect(ownerInitials('Darcey')).toBe('DA');
    expect(ownerInitials('Jane Doe')).toBe('JD');
    expect(ownerInitials('  mary jane watson ')).toBe('MW');
  });
});

describe('period labels', () => {
  it('heroTitle is concise per period', () => {
    expect(heroTitle('week-24-2025')).toBe('WEEK 24');
    expect(heroTitle('week-03-2025')).toBe('WEEK 3');
    expect(heroTitle('month-06-2025')).toBe('JUNE');
    expect(heroTitle('year-2025')).toBe('2025');
  });

  it('periodShortLabel includes the year context', () => {
    expect(periodShortLabel('week-24-2025')).toBe('WEEK 24 · 2025');
    expect(periodShortLabel('month-06-2025')).toBe('JUNE 2025');
    expect(periodShortLabel('year-2025')).toBe('2025');
  });
});

describe('formatDateRange', () => {
  it('returns null with no inputs', () => {
    expect(formatDateRange(undefined, undefined)).toBeNull();
  });

  it('shows an inclusive range (end is exclusive in the data)', () => {
    // Week of Mon 9 Jun → exclusive end Mon 16 Jun ⇒ last day shown is Sun 15 Jun.
    expect(formatDateRange('2025-06-09T00:00:00Z', '2025-06-16T00:00:00Z'))
      .toBe('9 JUN — 15 JUN 2025');
  });

  it('formats a single start date', () => {
    expect(formatDateRange('2025-06-09T00:00:00Z', undefined)).toBe('9 JUN');
  });
});

describe('isoWeek', () => {
  it('matches known ISO week numbers', () => {
    // 1 Jan 2025 is a Wednesday → ISO week 1 of 2025.
    expect(isoWeek(new Date(Date.UTC(2025, 0, 1)))).toEqual({ week: 1, year: 2025 });
    // 29 Dec 2025 (Mon) belongs to ISO week 1 of 2026.
    expect(isoWeek(new Date(Date.UTC(2025, 11, 29)))).toEqual({ week: 1, year: 2026 });
    // Mid-year sanity check.
    expect(isoWeek(new Date(Date.UTC(2025, 5, 9)))).toEqual({ week: 24, year: 2025 });
  });
});

describe('computePrevPeriodKey', () => {
  it('decrements the week, wrapping across the year boundary', () => {
    const r: ShowcaseRoundup = {
      periodType: 'ROUNDUP_PERIOD_TYPE_WEEK',
      periodStart: '2025-06-09T00:00:00Z', // ISO week 24
    };
    expect(computePrevPeriodKey(r)).toBe('week-23-2025');

    const wrap: ShowcaseRoundup = {
      periodType: 'ROUNDUP_PERIOD_TYPE_WEEK',
      periodStart: '2025-01-06T00:00:00Z', // ISO week 2 → prev week 1
    };
    expect(computePrevPeriodKey(wrap)).toBe('week-01-2025');
  });

  it('decrements the month, wrapping to December', () => {
    expect(computePrevPeriodKey({
      periodType: 'ROUNDUP_PERIOD_TYPE_MONTH',
      periodStart: '2025-06-01T00:00:00Z',
    })).toBe('month-05-2025');

    expect(computePrevPeriodKey({
      periodType: 'ROUNDUP_PERIOD_TYPE_MONTH',
      periodStart: '2025-01-01T00:00:00Z',
    })).toBe('month-12-2024');
  });

  it('decrements the year', () => {
    expect(computePrevPeriodKey({
      periodType: 'ROUNDUP_PERIOD_TYPE_YEAR',
      periodStart: '2025-01-01T00:00:00Z',
    })).toBe('year-2024');
  });

  it('returns null without a period start', () => {
    expect(computePrevPeriodKey({ periodType: 'ROUNDUP_PERIOD_TYPE_WEEK' })).toBeNull();
  });
});

describe('buildSportVMs', () => {
  it('sorts by count and assigns distinct palette colours', () => {
    const vms = buildSportVMs([
      { activityType: 'ACTIVITY_TYPE_RUN', activityCount: 2, totalDistanceMeters: 10_000 },
      { activityType: 'ACTIVITY_TYPE_RIDE', activityCount: 5, totalDistanceMeters: 80_000 },
    ]);
    expect(vms.map((v) => v.type)).toEqual(['ACTIVITY_TYPE_RIDE', 'ACTIVITY_TYPE_RUN']);
    expect(vms[0].color).toBe(SPORT_PALETTE[0]);
    expect(vms[1].color).toBe(SPORT_PALETTE[1]);
    expect(vms[0].count).toBe(5);
    expect(vms[0].distanceMeters).toBe(80_000);
    expect(vms[0].glyph).toBeTruthy();
    expect(vms[0].label).toBeTruthy();
  });

  it('handles an empty breakdown', () => {
    expect(buildSportVMs([])).toEqual([]);
  });
});

describe('buildCalendarDays', () => {
  it('emits one entry per UTC day in the [start, end) range', () => {
    const days = buildCalendarDays(
      '2025-06-09T00:00:00Z',
      '2025-06-16T00:00:00Z',
      [
        { date: '2025-06-09', effortLevel: 2 },
        { date: '2025-06-11', effortLevel: 4 },
      ],
    );
    expect(days).toHaveLength(7); // Mon..Sun, end exclusive
    expect(days[0].level).toBe(2);   // 9 Jun
    expect(days[1].level).toBe(0);   // 10 Jun rest day
    expect(days[2].level).toBe(4);   // 11 Jun
    // 9 Jun 2025 is a Monday → dow 1.
    expect(days[0].dow).toBe(1);
    expect(days[6].dow).toBe(0); // Sunday
  });

  it('returns an empty array for a zero-length range', () => {
    expect(buildCalendarDays('2025-06-09T00:00:00Z', '2025-06-09T00:00:00Z', [])).toEqual([]);
  });
});

describe('calloutVisual', () => {
  it('maps streak and record kinds to fixed glyphs', () => {
    expect(calloutVisual({ kind: 'LONGEST STREAK' })).toEqual({ glyph: '🔥', color: '#22d3ee' });
    expect(calloutVisual({ kind: 'PERSONAL RECORDS' })).toEqual({ glyph: '🏆', color: '#8b5cf6' });
  });

  it('uses the activity icon for a biggest-session callout', () => {
    const v = calloutVisual({ kind: 'BIGGEST SESSION', activityType: 'ACTIVITY_TYPE_RUN' });
    expect(v.color).toBe('#ff3da6');
    expect(v.glyph).toBeTruthy();
  });

  it('falls back to a default glyph with no activity type', () => {
    expect(calloutVisual({ kind: 'BIGGEST SESSION' })).toEqual({ glyph: '⚡', color: '#ff3da6' });
  });
});

describe('buildPRVM', () => {
  it('formats a weight PR with a positive delta', () => {
    const vm = buildPRVM({
      recordType: 'BENCH_PRESS_1RM',
      value: 100,
      unit: 'kg',
      previousValue: 95,
      achievedAt: '2025-06-14T10:00:00Z',
    });
    expect(vm.value).toBe('100');
    expect(vm.unit).toBe('kg');
    expect(vm.sport).toBe('STRENGTH');
    expect(vm.glyph).toBe('🏋️');
    expect(vm.label).toBe('BENCH PRESS 1RM');
    expect(vm.delta).toBe('+5 kg');
    expect(vm.date).toBe('14 JUN');
  });

  it('formats a time PR (mm:ss) with a faster-time delta', () => {
    const vm = buildPRVM({ recordType: 'FASTEST_5K', value: 1342, unit: 'seconds', previousValue: 1360 });
    expect(vm.value).toBe('22:22');
    expect(vm.unit).toBe('');
    expect(vm.sport).toBe('ENDURANCE');
    expect(vm.delta).toBe('−18s');
  });

  it('formats a long time PR as h:mm:ss', () => {
    const vm = buildPRVM({ recordType: 'LONGEST_RUN', value: 3661, unit: 'seconds' });
    expect(vm.value).toBe('1:01:01');
  });

  it('marks records with no previous value as NEW', () => {
    const vm = buildPRVM({ recordType: 'TOTAL_REPS', value: 50, unit: 'reps' });
    expect(vm.value).toBe('50');
    expect(vm.unit).toBe('reps');
    expect(vm.delta).toBe('NEW');
    expect(vm.glyph).toBe('🏅');
  });
});

describe('pctDelta', () => {
  it('returns null when there is no previous baseline', () => {
    expect(pctDelta(10, 0)).toBeNull();
  });

  it('reports increases, decreases and flat', () => {
    expect(pctDelta(112, 100)).toEqual({ value: '+12%', dir: 'up' });
    expect(pctDelta(92, 100)).toEqual({ value: '−8%', dir: 'down' });
    expect(pctDelta(100, 100)).toEqual({ value: '0%', dir: 'reg' });
  });
});

describe('buildDeltas', () => {
  it('builds session/time/distance/records deltas', () => {
    const cur: ShowcaseRoundup = {
      totalActivities: 12,
      totalDurationSeconds: 36_000,
      totalDistanceMeters: 110_000,
      totalCaloriesKcal: 9000,
      prsAchieved: [{}, {}, {}],
    };
    const prev: ShowcaseRoundup = {
      totalActivities: 10,
      totalDurationSeconds: 40_000,
      totalDistanceMeters: 100_000,
      totalCaloriesKcal: 9000,
      prsAchieved: [{}],
    };
    const deltas = buildDeltas(cur, prev);
    const byLabel = Object.fromEntries(deltas.map((d) => [d.label, d]));
    expect(byLabel.Sessions).toEqual({ label: 'Sessions', value: '+20%', dir: 'up' });
    expect(byLabel.Time.dir).toBe('down');
    expect(byLabel.Distance.dir).toBe('up');
    expect(byLabel.Records).toEqual({ label: 'Records', value: '+2', dir: 'up' });
    // Calories were unchanged → flat "0%" delta (shown as holding steady).
    expect(byLabel.Calories).toEqual({ label: 'Calories', value: '0%', dir: 'reg' });
  });

  it('skips distance when either side lacks meaningful distance', () => {
    const deltas = buildDeltas(
      { totalActivities: 5, totalDistanceMeters: 0 },
      { totalActivities: 4, totalDistanceMeters: 0 },
    );
    expect(deltas.find((d) => d.label === 'Distance')).toBeUndefined();
  });
});
