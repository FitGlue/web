import { describe, it, expect } from 'vitest';
import { parseRecordType, topPR, prValueString, prDeltaString } from '../prFormat';

describe('parseRecordType', () => {
  it('parses strength 1RM records', () => {
    expect(parseRecordType('bench_press_1rm')).toEqual({
      label: 'Bench Press',
      prType: '1RM',
      isStrength: true,
    });
  });

  it('parses set volume records', () => {
    const r = parseRecordType('back_squat_set_volume');
    expect(r.label).toBe('Back Squat');
    expect(r.prType).toBe('SET VOLUME');
    expect(r.isStrength).toBe(true);
  });

  it('parses volume and reps suffixes', () => {
    expect(parseRecordType('deadlift_volume').prType).toBe('VOLUME');
    expect(parseRecordType('pullup_reps').prType).toBe('REPS');
  });

  it('treats cardio records as label-only', () => {
    expect(parseRecordType('fastest_5k')).toEqual({
      label: 'fastest 5k',
      prType: '',
      isStrength: false,
    });
  });
});

describe('topPR', () => {
  it('prefers 1RM over other strength suffixes', () => {
    const top = topPR([
      { recordType: 'squat_reps' },
      { recordType: 'squat_1rm' },
    ]);
    expect(top.recordType).toBe('squat_1rm');
  });

  it('prefers strength records over cardio records', () => {
    const top = topPR([
      { recordType: 'fastest_5k' },
      { recordType: 'bench_press_1rm' },
    ]);
    expect(top.recordType).toBe('bench_press_1rm');
  });

  it('prefers longer-distance cardio records', () => {
    const top = topPR([
      { recordType: 'fastest_5k' },
      { recordType: 'longest_run' },
    ]);
    expect(top.recordType).toBe('longest_run');
  });

  it('does not mutate the input array', () => {
    const input = [{ recordType: 'fastest_5k' }, { recordType: 'longest_run' }];
    const copy = [...input];
    topPR(input);
    expect(input).toEqual(copy);
  });
});

describe('prValueString', () => {
  it('formats sub-hour times as m:ss', () => {
    expect(prValueString(125, 'seconds')).toEqual({ val: '2:05', unit: '' });
  });

  it('formats hour-plus times as h:mm:ss', () => {
    expect(prValueString(3661, 'seconds')).toEqual({ val: '1:01:01', unit: '' });
  });

  it('rounds kilograms', () => {
    expect(prValueString(80.6, 'kg')).toEqual({ val: '81', unit: 'kg' });
  });

  it('formats metres and kilometres', () => {
    expect(prValueString(500, 'meters')).toEqual({ val: '500', unit: 'm' });
    expect(prValueString(5400, 'meters')).toEqual({ val: '5.4', unit: 'km' });
  });

  it('falls back to rounding with passed-through unit', () => {
    expect(prValueString(12.4, 'reps')).toEqual({ val: '12', unit: 'reps' });
  });
});

describe('prDeltaString', () => {
  it('returns null with no usable previous value', () => {
    expect(prDeltaString(100, null, 'kg')).toBeNull();
    expect(prDeltaString(100, 0, 'kg')).toBeNull();
  });

  it('shows time improvements (lower is better)', () => {
    expect(prDeltaString(290, 300, 'seconds')).toBe('−10s');
    expect(prDeltaString(180, 320, 'seconds')).toBe('−2:20');
  });

  it('returns null when time did not improve', () => {
    expect(prDeltaString(310, 300, 'seconds')).toBeNull();
  });

  it('shows positive deltas for non-time units', () => {
    expect(prDeltaString(110, 100, 'kg')).toBe('+10 kg');
  });

  it('returns null when a non-time value did not improve', () => {
    expect(prDeltaString(90, 100, 'kg')).toBeNull();
  });
});
