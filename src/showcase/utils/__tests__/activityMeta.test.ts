import { describe, it, expect } from 'vitest';
import {
  getActivityIcon,
  getActivityCategory,
  ACTIVITY_TYPE_ICONS,
  ACTIVITY_CATEGORY,
} from '../activityMeta';

describe('getActivityIcon', () => {
  it('returns the medal fallback for undefined', () => {
    expect(getActivityIcon(undefined)).toBe('🏅');
  });

  it('returns the medal fallback for unknown types', () => {
    expect(getActivityIcon('ACTIVITY_TYPE_NOPE')).toBe('🏅');
  });

  it('returns the mapped icon for known types', () => {
    expect(getActivityIcon('ACTIVITY_TYPE_RUN')).toBe('🏃');
    expect(getActivityIcon('ACTIVITY_TYPE_SWIM')).toBe('🏊');
  });
});

describe('getActivityCategory', () => {
  it('returns general for undefined', () => {
    expect(getActivityCategory(undefined)).toBe('general');
  });

  it('returns general for unknown types', () => {
    expect(getActivityCategory('ACTIVITY_TYPE_NOPE')).toBe('general');
  });

  it('returns the mapped category for known types', () => {
    expect(getActivityCategory('ACTIVITY_TYPE_RUN')).toBe('cardio');
    expect(getActivityCategory('ACTIVITY_TYPE_WEIGHT_TRAINING')).toBe('strength');
    expect(getActivityCategory('ACTIVITY_TYPE_ALPINE_SKI')).toBe('winter');
    expect(getActivityCategory('ACTIVITY_TYPE_TENNIS')).toBe('sport');
    expect(getActivityCategory('ACTIVITY_TYPE_YOGA')).toBe('mind');
  });
});

describe('lookup tables', () => {
  it('expose non-empty maps', () => {
    expect(Object.keys(ACTIVITY_TYPE_ICONS).length).toBeGreaterThan(0);
    expect(Object.keys(ACTIVITY_CATEGORY).length).toBeGreaterThan(0);
  });
});
