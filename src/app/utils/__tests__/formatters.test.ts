import { describe, it, expect } from 'vitest';
import {
  formatFieldLabel,
  humanizeKey,
  humanizeServiceName,
  humanizeEnumValue,
  formatDuration,
  formatDurationFromRange,
} from '../formatters';

describe('formatFieldLabel', () => {
  it('converts snake_case to Title Case', () => {
    expect(formatFieldLabel('heart_rate_zones')).toBe('Heart Rate Zones');
  });

  it('handles single word', () => {
    expect(formatFieldLabel('pace')).toBe('Pace');
  });

  it('handles already-capitalised input', () => {
    expect(formatFieldLabel('Speed')).toBe('Speed');
  });

  it('handles empty string', () => {
    expect(formatFieldLabel('')).toBe('');
  });
});

describe('humanizeKey', () => {
  it('is an alias for formatFieldLabel', () => {
    expect(humanizeKey('avg_power')).toBe(formatFieldLabel('avg_power'));
  });
});

describe('humanizeServiceName', () => {
  it('returns Unknown Service for undefined', () => {
    expect(humanizeServiceName(undefined)).toBe('Unknown Service');
  });

  it('returns Data Enrichment for enricher', () => {
    expect(humanizeServiceName('enricher')).toBe('Data Enrichment');
  });

  it('returns Destination Router for router', () => {
    expect(humanizeServiceName('router')).toBe('Destination Router');
  });

  it('strips -handler suffix and title-cases', () => {
    expect(humanizeServiceName('fitbit-handler')).toBe('Fitbit');
    expect(humanizeServiceName('strava-handler')).toBe('Strava');
  });

  it('strips -webhook suffix', () => {
    expect(humanizeServiceName('strava-webhook')).toBe('Strava');
  });

  it('title-cases multi-word kebab names', () => {
    expect(humanizeServiceName('apple-health')).toBe('Apple Health');
  });
});

describe('humanizeEnumValue', () => {
  it('strips ENRICHER_PROVIDER_ prefix and title-cases words', () => {
    expect(humanizeEnumValue('ENRICHER_PROVIDER_FITBIT_HEART_RATE')).toBe('Fitbit Heart Rate');
  });

  it('handles values without the prefix', () => {
    expect(humanizeEnumValue('SOME_VALUE')).toBe('Some Value');
  });

  it('handles single-word enums', () => {
    expect(humanizeEnumValue('ENRICHER_PROVIDER_STRAVA')).toBe('Strava');
  });
});

describe('formatDuration', () => {
  it('formats sub-second durations as ms', () => {
    expect(formatDuration(500)).toBe('500ms');
    expect(formatDuration(0)).toBe('0ms');
    expect(formatDuration(999)).toBe('999ms');
  });

  it('formats durations under a minute as seconds', () => {
    expect(formatDuration(1000)).toBe('1.0s');
    expect(formatDuration(1500)).toBe('1.5s');
    expect(formatDuration(59999)).toBe('60.0s');
  });

  it('formats durations over a minute as minutes', () => {
    expect(formatDuration(60000)).toBe('1.0m');
    expect(formatDuration(90000)).toBe('1.5m');
    expect(formatDuration(150000)).toBe('2.5m');
  });
});

describe('formatDurationFromRange', () => {
  it('returns empty string if start is missing', () => {
    expect(formatDurationFromRange(null, '2024-01-01T00:01:30Z')).toBe('');
    expect(formatDurationFromRange(undefined, '2024-01-01T00:01:30Z')).toBe('');
  });

  it('returns empty string if end is missing', () => {
    expect(formatDurationFromRange('2024-01-01T00:00:00Z', null)).toBe('');
    expect(formatDurationFromRange('2024-01-01T00:00:00Z', undefined)).toBe('');
  });

  it('formats duration between two timestamps', () => {
    expect(formatDurationFromRange('2024-01-01T00:00:00Z', '2024-01-01T00:01:30Z')).toBe('1.5m');
    expect(formatDurationFromRange('2024-01-01T00:00:00Z', '2024-01-01T00:00:02Z')).toBe('2.0s');
  });
});
