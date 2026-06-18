import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatDurationLong,
  formatDistance,
  formatWeight,
  formatNumber,
  formatActivityType,
  formatSource,
  formatDate,
  formatDateFull,
  formatDateGroupHeader,
  getDateKey,
  getEnricherInfo,
} from '../format';

describe('formatDuration', () => {
  it('returns null for falsy or non-positive input', () => {
    expect(formatDuration(undefined)).toBeNull();
    expect(formatDuration(0)).toBeNull();
    expect(formatDuration(-10)).toBeNull();
  });

  it('formats minutes-only durations', () => {
    expect(formatDuration(90)).toBe('1m');
    expect(formatDuration(59)).toBe('0m');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(3661)).toBe('1h 1m');
    expect(formatDuration(7200)).toBe('2h 0m');
  });
});

describe('formatDurationLong', () => {
  it('returns null for non-positive', () => {
    expect(formatDurationLong(0)).toBeNull();
  });

  it('uses "min" suffix when under an hour', () => {
    expect(formatDurationLong(120)).toBe('2 min');
  });

  it('uses "h m" format over an hour', () => {
    expect(formatDurationLong(3720)).toBe('1h 2m');
  });
});

describe('formatDistance', () => {
  it('returns null for non-positive', () => {
    expect(formatDistance(undefined)).toBeNull();
    expect(formatDistance(0)).toBeNull();
  });

  it('formats metres below 1km', () => {
    expect(formatDistance(500)).toBe('500 m');
    expect(formatDistance(999.6)).toBe('1000 m');
  });

  it('formats kilometres at or above 1000m', () => {
    expect(formatDistance(1000)).toBe('1.0 km');
    expect(formatDistance(5432)).toBe('5.4 km');
  });
});

describe('formatWeight', () => {
  it('returns null for non-positive', () => {
    expect(formatWeight(0)).toBeNull();
  });

  it('formats kilograms below a tonne', () => {
    expect(formatWeight(80)).toBe('80 kg');
    expect(formatWeight(1234)).toBe('1.2t');
  });

  it('uses thousands separators for kg', () => {
    expect(formatWeight(999)).toBe('999 kg');
  });
});

describe('formatNumber', () => {
  it('returns null for non-positive', () => {
    expect(formatNumber(0)).toBeNull();
    expect(formatNumber(undefined)).toBeNull();
  });

  it('formats with locale separators', () => {
    expect(formatNumber(1000)).toBe((1000).toLocaleString());
  });
});

describe('formatActivityType', () => {
  it('returns Activity for falsy', () => {
    expect(formatActivityType(undefined)).toBe('Activity');
  });

  it('humanizes ACTIVITY_TYPE_ enums', () => {
    expect(formatActivityType('ACTIVITY_TYPE_TRAIL_RUN')).toBe('Trail Run');
  });

  it('passes through non-enum strings', () => {
    expect(formatActivityType('Custom')).toBe('Custom');
  });
});

describe('formatSource', () => {
  it('returns Unknown for falsy', () => {
    expect(formatSource(undefined)).toBe('Unknown');
  });

  it('humanizes SOURCE_ enums', () => {
    expect(formatSource('SOURCE_STRAVA')).toBe('Strava');
  });

  it('special-cases file upload', () => {
    expect(formatSource('SOURCE_FILE_UPLOAD')).toBe('FIT Upload');
  });

  it('passes through non-enum strings', () => {
    expect(formatSource('manual')).toBe('manual');
  });
});

describe('formatDate', () => {
  it('returns empty string for falsy', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('formats an ISO date in en-GB', () => {
    expect(formatDate('2024-03-05T10:00:00Z')).toBe('5 Mar 2024');
  });
});

describe('formatDateFull', () => {
  it('returns empty string for falsy', () => {
    expect(formatDateFull('')).toBe('');
  });

  it('produces a long date string', () => {
    const result = formatDateFull('2024-03-05T10:00:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('March');
  });
});

describe('formatDateGroupHeader', () => {
  it('returns Unknown Date for falsy', () => {
    expect(formatDateGroupHeader(undefined)).toBe('Unknown Date');
  });

  it('applies correct ordinal suffixes', () => {
    expect(formatDateGroupHeader('2024-03-01T12:00:00')).toContain('1st');
    expect(formatDateGroupHeader('2024-03-02T12:00:00')).toContain('2nd');
    expect(formatDateGroupHeader('2024-03-03T12:00:00')).toContain('3rd');
    expect(formatDateGroupHeader('2024-03-04T12:00:00')).toContain('4th');
    expect(formatDateGroupHeader('2024-03-21T12:00:00')).toContain('21st');
    expect(formatDateGroupHeader('2024-03-22T12:00:00')).toContain('22nd');
    expect(formatDateGroupHeader('2024-03-23T12:00:00')).toContain('23rd');
    expect(formatDateGroupHeader('2024-03-31T12:00:00')).toContain('31st');
  });
});

describe('getDateKey', () => {
  it('returns "unknown" for falsy', () => {
    expect(getDateKey(undefined)).toBe('unknown');
  });

  it('zero-pads month and day', () => {
    expect(getDateKey('2024-03-05T12:00:00')).toBe('2024-03-05');
  });
});

describe('getEnricherInfo', () => {
  it('returns registered enricher info', () => {
    const info = getEnricherInfo('ENRICHER_PROVIDER_WEATHER');
    expect(info.name).toBe('Weather');
    expect(info.icon).toBeTruthy();
  });

  it('falls back to a humanized name for unknown keys', () => {
    const info = getEnricherInfo('ENRICHER_PROVIDER_SOMETHING_NEW');
    expect(info.name).toBe('Something New');
    expect(info.icon).toBe('✨');
    expect(info.description).toBe('Activity data booster');
  });
});
