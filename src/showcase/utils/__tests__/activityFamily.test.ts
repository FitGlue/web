import { describe, it, expect } from 'vitest';
import { resolveFamily, FAMILY_STAMP_CLASS } from '../activityFamily';

describe('resolveFamily', () => {
  it('returns "other" for undefined', () => {
    expect(resolveFamily(undefined)).toBe('other');
  });

  it('returns "other" for unknown activity types', () => {
    expect(resolveFamily('ACTIVITY_TYPE_UNKNOWN')).toBe('other');
  });

  it('maps run variants to run', () => {
    expect(resolveFamily('ACTIVITY_TYPE_RUN')).toBe('run');
    expect(resolveFamily('ACTIVITY_TYPE_TRAIL_RUN')).toBe('run');
    expect(resolveFamily('ACTIVITY_TYPE_VIRTUAL_RUN')).toBe('run');
  });

  it('maps ride variants to ride', () => {
    expect(resolveFamily('ACTIVITY_TYPE_RIDE')).toBe('ride');
    expect(resolveFamily('ACTIVITY_TYPE_EBIKE_RIDE')).toBe('ride');
    expect(resolveFamily('ACTIVITY_TYPE_ROLLER_SKI')).toBe('ride');
  });

  it('maps strength, crossfit, hiit and yoga families', () => {
    expect(resolveFamily('ACTIVITY_TYPE_WEIGHT_TRAINING')).toBe('strength');
    expect(resolveFamily('ACTIVITY_TYPE_WORKOUT')).toBe('strength');
    expect(resolveFamily('ACTIVITY_TYPE_CROSSFIT')).toBe('crossfit');
    expect(resolveFamily('ACTIVITY_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING')).toBe('hiit');
    expect(resolveFamily('ACTIVITY_TYPE_ELLIPTICAL')).toBe('hiit');
    expect(resolveFamily('ACTIVITY_TYPE_YOGA')).toBe('yoga');
    expect(resolveFamily('ACTIVITY_TYPE_PILATES')).toBe('yoga');
  });

  it('maps sport and paddle families', () => {
    expect(resolveFamily('ACTIVITY_TYPE_TENNIS')).toBe('sport');
    expect(resolveFamily('ACTIVITY_TYPE_SOCCER')).toBe('sport');
    expect(resolveFamily('ACTIVITY_TYPE_KAYAKING')).toBe('paddle');
    expect(resolveFamily('ACTIVITY_TYPE_ROWING')).toBe('paddle');
    expect(resolveFamily('ACTIVITY_TYPE_SURFING')).toBe('paddle');
  });

  it('maps swim and hike families', () => {
    expect(resolveFamily('ACTIVITY_TYPE_SWIM')).toBe('swim');
    expect(resolveFamily('ACTIVITY_TYPE_HIKE')).toBe('hike');
    expect(resolveFamily('ACTIVITY_TYPE_WALK')).toBe('hike');
  });
});

describe('FAMILY_STAMP_CLASS', () => {
  it('has a class for every family resolveFamily can return', () => {
    const families = ['run', 'ride', 'swim', 'hike', 'strength', 'crossfit', 'hiit', 'yoga', 'sport', 'paddle', 'other'] as const;
    for (const f of families) {
      expect(FAMILY_STAMP_CLASS[f]).toBe(f);
    }
  });
});
