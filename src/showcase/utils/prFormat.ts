// Shared PR record-type parsing used by PersonalRecordsCallout and PersonalRecordsModule

const STRENGTH_SUFFIXES = ['_1rm', '_set_volume', '_volume', '_reps'] as const;

// Cardio records sorted longest-distance-first — used to pick the "most prestigious" spotlight PR
const CARDIO_DISTANCE_PRIORITY = [
  'fastest_ultra_marathon', 'longest_run', 'fastest_marathon',
  'fastest_40k', 'fastest_30_mile', 'fastest_half_marathon',
  'fastest_20_mile', 'fastest_30k', 'fastest_20k', 'fastest_15_mile',
  'fastest_10_mile', 'fastest_10k', 'fastest_5_mile', 'fastest_5k',
  'fastest_2_mile', 'fastest_2k', 'fastest_1_mile', 'fastest_1k',
  'fastest_500m', 'fastest_400m', 'fastest_200m', 'fastest_100m',
  'longest_ride', 'fastest_ride_100k', 'fastest_ride_50k',
  'fastest_ride_30_mile', 'fastest_ride_25_mile', 'fastest_ride_40k',
  'fastest_ride_20_mile', 'fastest_ride_20k', 'fastest_ride_10_mile',
  'fastest_ride_30k', 'fastest_ride_10k', 'fastest_ride_5_mile', 'fastest_ride_5k',
  'highest_elevation_gain',
];

export interface ParsedRecordType {
  /** Human-readable exercise/record name, e.g. "Bench Press" or "Fastest 5K" */
  label: string;
  /** Short type badge for strength records: "1RM", "SET VOLUME", etc. Empty for cardio. */
  prType: string;
  /** True if this is a strength record (exercise + suffix) */
  isStrength: boolean;
}

function toTitleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function parseRecordType(recordType: string): ParsedRecordType {
  for (const suffix of STRENGTH_SUFFIXES) {
    if (recordType.endsWith(suffix)) {
      const exercise = recordType.slice(0, -suffix.length);
      return {
        label: toTitleCase(exercise),
        prType: suffix.slice(1).toUpperCase().replace(/_/g, ' '),
        isStrength: true,
      };
    }
  }
  // Cardio / hybrid / other: the record type IS the label
  return {
    label: recordType.replace(/_/g, ' '),
    prType: '',
    isStrength: false,
  };
}

/** Pick the most spotlight-worthy PR from the list. */
export function topPR<T extends { recordType: string }>(records: T[]): T {
  return [...records].sort((a, b) => {
    const aType = a.recordType;
    const bType = b.recordType;

    // Strength suffix priority (1RM most prestigious)
    const ai = STRENGTH_SUFFIXES.findIndex(s => aType.endsWith(s));
    const bi = STRENGTH_SUFFIXES.findIndex(s => bType.endsWith(s));

    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    }

    // Cardio: longest distance = most prestigious
    const ci = CARDIO_DISTANCE_PRIORITY.indexOf(aType);
    const di = CARDIO_DISTANCE_PRIORITY.indexOf(bType);
    return (ci === -1 ? 99 : ci) - (di === -1 ? 99 : di);
  })[0];
}

export function prValueString(newValue: number, unit: string): { val: string; unit: string } {
  if (unit === 'seconds') {
    if (newValue >= 3600) {
      const h = Math.floor(newValue / 3600);
      const m = Math.floor((newValue % 3600) / 60);
      const s = Math.floor(newValue % 60);
      return { val: `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, unit: '' };
    }
    const m = Math.floor(newValue / 60);
    const s = Math.floor(newValue % 60);
    return { val: `${m}:${String(s).padStart(2, '0')}`, unit: '' };
  }
  if (unit === 'kg') return { val: `${Math.round(newValue)}`, unit: 'kg' };
  if (unit === 'meters') {
    return newValue >= 1000
      ? { val: `${(newValue / 1000).toFixed(1)}`, unit: 'km' }
      : { val: `${Math.round(newValue)}`, unit: 'm' };
  }
  return { val: `${Math.round(newValue)}`, unit };
}

export function prDeltaString(newValue: number, previousValue: number | null | undefined, unit: string): string | null {
  if (previousValue == null || previousValue <= 0) return null;
  if (unit === 'seconds') {
    // Lower is better for time
    const delta = previousValue - newValue;
    if (delta <= 0) return null;
    const m = Math.floor(delta / 60);
    const s = Math.floor(delta % 60);
    return m > 0 ? `−${m}:${String(s).padStart(2, '0')}` : `−${s}s`;
  }
  const delta = newValue - previousValue;
  if (delta <= 0) return null;
  return `+${Math.round(delta)} ${unit}`;
}
