import { describe, it, expect } from 'vitest';
import {
  secondsToTime,
  timeToSeconds,
  formatDuration,
  formatRecordValue,
  getRecordDisplayName,
  getBoosterLabel,
  formatDate,
  getGroupedExercises,
} from '../helpers';

describe('time helpers', () => {
  it('secondsToTime splits hours/minutes/seconds', () => {
    expect(secondsToTime(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
  });
  it('timeToSeconds is the inverse', () => {
    expect(timeToSeconds(1, 1, 1)).toBe(3661);
  });
  it('formatDuration shows hours when present and omits when not', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(65)).toBe('1:05');
  });
});

describe('formatRecordValue', () => {
  it('formats seconds as duration', () => {
    expect(formatRecordValue(65, 'seconds')).toBe('1:05');
  });
  it('formats meters as km when >= 1000', () => {
    expect(formatRecordValue(5000, 'meters')).toBe('5.00 km');
    expect(formatRecordValue(500, 'meters')).toBe('500 m');
  });
  it('formats kg, reps and unknown units', () => {
    expect(formatRecordValue(100, 'kg')).toBe('100 kg');
    expect(formatRecordValue(10, 'reps')).toBe('10 reps');
    expect(formatRecordValue(3, 'widgets')).toBe('3 widgets');
  });
});

describe('getRecordDisplayName', () => {
  it('resolves cardio records', () => {
    expect(getRecordDisplayName('fastest_5k')).toBe('Fastest 5K');
  });
  it('resolves strength records via suffix + exercise', () => {
    expect(getRecordDisplayName('bench_press_1rm')).toBe('Bench Press 1 Rep Max');
  });
  it('falls back to title case for unknown strength exercise', () => {
    expect(getRecordDisplayName('mystery_lift_1rm')).toBe('Mystery Lift 1 Rep Max');
  });
  it('resolves hybrid race records', () => {
    expect(getRecordDisplayName('hybrid_race_hyrox_skierg')).toBe('HYROX SkiErg');
  });
  it('falls back to title case for unknown types', () => {
    expect(getRecordDisplayName('some_thing')).toBe('Some Thing');
  });
});

describe('getBoosterLabel', () => {
  it('labels goal trackers', () => {
    expect(getBoosterLabel('goal_tracker_week_distance')).toBe('Weekly Distance');
    expect(getBoosterLabel('goal_tracker_year_activities')).toBe('Yearly Activities');
    expect(getBoosterLabel('goal_tracker_month_elevation')).toBe('Monthly Elevation');
  });
  it('labels streak trackers', () => {
    expect(getBoosterLabel('streak_tracker_any')).toBe('All Activities');
    expect(getBoosterLabel('streak_tracker_running')).toBe('Running');
  });
  it('labels distance milestones', () => {
    expect(getBoosterLabel('distance_milestones_any')).toBe('All Sports');
    expect(getBoosterLabel('distance_milestones_cycling')).toBe('Cycling');
  });
  it('returns id unchanged when no prefix matches', () => {
    expect(getBoosterLabel('custom_thing')).toBe('custom_thing');
  });
});

describe('formatDate', () => {
  it('returns N/A for empty', () => {
    expect(formatDate()).toBe('N/A');
  });
  it('formats a date string', () => {
    expect(formatDate('2026-05-01T00:00:00Z')).toMatch(/\d/);
  });
});

describe('getGroupedExercises', () => {
  it('groups exercises by muscle group', () => {
    const groups = getGroupedExercises();
    expect(Object.keys(groups)).toContain('Chest');
    expect(groups.Chest.some(e => e.value === 'bench_press')).toBe(true);
  });
});
