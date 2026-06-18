import { describe, it, expect } from 'vitest';
import {
  resolveCategory,
  CATEGORY_ACCENT,
  CATEGORY_STAMP_CLASS,
  CATEGORY_EMOJI,
} from '../activityCategory';

// Minimal cast helper — resolveCategory only reads activityType and activityData.
const act = (overrides: Record<string, unknown>) => overrides as never;

describe('resolveCategory', () => {
  it('forces strength when any session has strength sets', () => {
    const a = act({
      activityType: 'ACTIVITY_TYPE_RUN',
      activityData: { sessions: [{ strengthSets: [{}] }] },
    });
    expect(resolveCategory(a)).toBe('strength');
  });

  it('ignores empty strengthSets arrays', () => {
    const a = act({
      activityType: 'ACTIVITY_TYPE_RUN',
      activityData: { sessions: [{ strengthSets: [] }] },
    });
    expect(resolveCategory(a)).toBe('cardio-distance');
  });

  it('classifies cardio-distance types', () => {
    expect(resolveCategory(act({ activityType: 'ACTIVITY_TYPE_RIDE' }))).toBe('cardio-distance');
    expect(resolveCategory(act({ activityType: 'ACTIVITY_TYPE_SWIM' }))).toBe('cardio-distance');
  });

  it('classifies cardio-time types', () => {
    expect(resolveCategory(act({ activityType: 'ACTIVITY_TYPE_YOGA' }))).toBe('cardio-time');
    expect(resolveCategory(act({ activityType: 'ACTIVITY_TYPE_ELLIPTICAL' }))).toBe('cardio-time');
  });

  it('classifies sport types', () => {
    expect(resolveCategory(act({ activityType: 'ACTIVITY_TYPE_TENNIS' }))).toBe('sport');
    expect(resolveCategory(act({ activityType: 'ACTIVITY_TYPE_GOLF' }))).toBe('sport');
  });

  it('treats WORKOUT/CROSSFIT without strength sets as cardio-time', () => {
    expect(resolveCategory(act({ activityType: 'ACTIVITY_TYPE_WORKOUT' }))).toBe('cardio-time');
    expect(resolveCategory(act({ activityType: 'ACTIVITY_TYPE_CROSSFIT' }))).toBe('cardio-time');
  });

  it('falls back to untraditional', () => {
    expect(resolveCategory(act({ activityType: 'ACTIVITY_TYPE_MYSTERY' }))).toBe('untraditional');
    expect(resolveCategory(act({}))).toBe('untraditional');
  });
});

describe('category lookup tables', () => {
  const categories = ['cardio-distance', 'cardio-time', 'strength', 'sport', 'untraditional'] as const;

  it('have an entry per category', () => {
    for (const c of categories) {
      expect(CATEGORY_ACCENT[c]).toBeTruthy();
      expect(CATEGORY_STAMP_CLASS[c]).toContain('stamp--');
      expect(CATEGORY_EMOJI[c]).toBeTruthy();
    }
  });
});
