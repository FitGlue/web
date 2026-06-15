/**
 * Pure data-transformation helpers for the showcase roundup page.
 * Kept out of the React component so they can be unit-tested in isolation.
 */
import type { components } from '../../shared/api/schema-public';
import { ACTIVITY_TYPE_ICONS } from './activityMeta';
import { formatActivityType } from './format';

export type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];
export type RoundupActivityTypeBreakdown = components['schemas']['RoundupActivityTypeBreakdown'];
export type ShowcaseCalloutActivity = components['schemas']['ShowcaseCalloutActivity'];
export type RoundupDayEntry = components['schemas']['RoundupDayEntry'];
export type ShowcaseTopPR = components['schemas']['ShowcaseTopPR'];

// Distinct aurora palette, assigned by index so adjacent donut segments differ.
export const SPORT_PALETTE = [
  '#ff3da6', '#22d3ee', '#8b5cf6', '#a3ff3d', '#ffd60a',
  '#ff5d6c', '#4ea0ff', '#ff66bd', '#a98cff', '#cfcdc4',
];

export const HR_ZONES = [
  { z: 'Z1', name: 'Easy', color: '#22d3ee' },
  { z: 'Z2', name: 'Aerobic', color: '#4ea0ff' },
  { z: 'Z3', name: 'Tempo', color: '#8b5cf6' },
  { z: 'Z4', name: 'Threshold', color: '#ff3da6' },
  { z: 'Z5', name: 'Max', color: '#ff5d6c' },
];

export const SOURCE_PALETTE = ['#ff3da6', '#22d3ee', '#8b5cf6', '#a3ff3d', '#ffd60a', '#ff5d6c'];

/* ------------------------------------------------------------------ */
/* Format helpers                                                      */
/* ------------------------------------------------------------------ */

export function fmtKm(m: number): string {
  return (m / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function fmtHM(sec: number): { h: number; m: number } {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return { h, m };
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function periodWord(periodType?: string): string {
  switch (periodType) {
    case 'ROUNDUP_PERIOD_TYPE_WEEK': return 'Week';
    case 'ROUNDUP_PERIOD_TYPE_MONTH': return 'Month';
    case 'ROUNDUP_PERIOD_TYPE_YEAR': return 'Year';
    default: return 'Period';
  }
}

// Big gradient hero title — concise per period.
export function heroTitle(periodKey: string): string {
  if (periodKey.startsWith('week-')) {
    const [, week] = periodKey.split('-');
    return `WEEK ${parseInt(week, 10)}`;
  }
  if (periodKey.startsWith('month-')) {
    const [, month, year] = periodKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'long' }).toUpperCase();
  }
  if (periodKey.startsWith('year-')) {
    return periodKey.replace('year-', '');
  }
  return periodKey.toUpperCase();
}

// Short label used in crumb / comparison ("WEEK 24 · 2025", "JUNE 2025", "2025").
export function periodShortLabel(periodKey: string): string {
  if (periodKey.startsWith('week-')) {
    const [, week, year] = periodKey.split('-');
    return `WEEK ${parseInt(week, 10)} · ${year}`;
  }
  if (periodKey.startsWith('month-')) {
    const [, month, year] = periodKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase();
  }
  if (periodKey.startsWith('year-')) {
    return periodKey.replace('year-', '');
  }
  return periodKey.toUpperCase();
}

export function formatDateRange(start?: string, end?: string): string | null {
  if (!start && !end) return null;
  // Period boundaries are UTC — format in UTC so the displayed day is stable.
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).toUpperCase();
  if (start && end) {
    // periodEnd is exclusive — show the last day inside the range.
    const endDate = new Date(end);
    endDate.setUTCDate(endDate.getUTCDate() - 1);
    return `${fmt(start)} — ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase()}`;
  }
  if (start) return fmt(start);
  return null;
}

export function ownerInitials(name?: string): string {
  if (!name) return 'FG';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'FG';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ------------------------------------------------------------------ */
/* ISO-week math + previous-period key                                 */
/* ------------------------------------------------------------------ */

export function isoWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return { week, year: d.getUTCFullYear() };
}

export function computePrevPeriodKey(roundup: ShowcaseRoundup): string | null {
  if (!roundup.periodStart) return null;
  const start = new Date(roundup.periodStart);
  switch (roundup.periodType) {
    case 'ROUNDUP_PERIOD_TYPE_WEEK': {
      const prev = new Date(start);
      prev.setUTCDate(prev.getUTCDate() - 7);
      const { week, year } = isoWeek(prev);
      return `week-${pad2(week)}-${year}`;
    }
    case 'ROUNDUP_PERIOD_TYPE_MONTH': {
      const prev = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1));
      return `month-${pad2(prev.getUTCMonth() + 1)}-${prev.getUTCFullYear()}`;
    }
    case 'ROUNDUP_PERIOD_TYPE_YEAR':
      return `year-${start.getUTCFullYear() - 1}`;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* View models                                                         */
/* ------------------------------------------------------------------ */

export interface SportVM {
  type: string;
  label: string;
  glyph: string;
  color: string;
  count: number;
  distanceMeters: number;
}

export function buildSportVMs(breakdowns: RoundupActivityTypeBreakdown[]): SportVM[] {
  return [...breakdowns]
    .sort((a, b) => (b.activityCount ?? 0) - (a.activityCount ?? 0))
    .map((bd, i) => ({
      type: bd.activityType ?? `type-${i}`,
      label: formatActivityType(bd.activityType),
      glyph: ACTIVITY_TYPE_ICONS[bd.activityType ?? ''] ?? '🏅',
      color: SPORT_PALETTE[i % SPORT_PALETTE.length],
      count: bd.activityCount ?? 0,
      distanceMeters: bd.totalDistanceMeters ?? 0,
    }));
}

export interface CalDay {
  ts: number;
  dow: number; // 0=Sun … 6=Sat
  level: number;
}

export function buildCalendarDays(start: string, end: string, dayEntries: RoundupDayEntry[]): CalDay[] {
  const levelByDate = new Map<string, number>();
  dayEntries.forEach((e) => {
    if (e.date) levelByDate.set(e.date, e.effortLevel ?? 0);
  });
  const s = new Date(start);
  const e = new Date(end);
  const cur = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
  const endUTC = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()));
  const days: CalDay[] = [];
  // Hard cap to avoid pathological loops.
  let guard = 0;
  while (cur < endUTC && guard < 800) {
    const iso = `${cur.getUTCFullYear()}-${pad2(cur.getUTCMonth() + 1)}-${pad2(cur.getUTCDate())}`;
    days.push({ ts: cur.getTime(), dow: cur.getUTCDay(), level: levelByDate.get(iso) ?? 0 });
    cur.setUTCDate(cur.getUTCDate() + 1);
    guard++;
  }
  return days;
}

export function calloutVisual(c: ShowcaseCalloutActivity): { glyph: string; color: string } {
  const kind = (c.kind ?? '').toUpperCase();
  if (kind.includes('STREAK')) return { glyph: '🔥', color: '#22d3ee' };
  if (kind.includes('RECORD') || kind.includes('PR')) return { glyph: '🏆', color: '#8b5cf6' };
  const icon = c.activityType ? (ACTIVITY_TYPE_ICONS[c.activityType] ?? '⚡') : '⚡';
  return { glyph: icon, color: '#ff3da6' };
}

export interface PRVm {
  glyph: string;
  sport: string;
  date: string;
  label: string;
  value: string;
  unit: string;
  delta: string;
}

export function buildPRVM(pr: ShowcaseTopPR): PRVm {
  const unit = pr.unit ?? '';
  let glyph = '🏅';
  let sport = 'GENERAL';
  if (unit === 'kg') { glyph = '🏋️'; sport = 'STRENGTH'; }
  else if (unit === 'seconds') { glyph = '🏃'; sport = 'ENDURANCE'; }

  let valueStr = '';
  let unitStr = '';
  const value = pr.value ?? 0;
  if (unit === 'seconds') {
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = Math.floor(value % 60);
    valueStr = h > 0
      ? `${h}:${pad2(m)}:${pad2(s)}`
      : `${m}:${pad2(s)}`;
  } else if (unit === 'kg') {
    valueStr = String(Math.round(value));
    unitStr = 'kg';
  } else {
    valueStr = String(Math.round(value));
    unitStr = unit;
  }

  let delta = 'NEW';
  if (pr.previousValue != null && pr.value != null) {
    if (unit === 'kg') {
      const diff = Math.round(pr.value - pr.previousValue);
      delta = diff > 0 ? `+${diff} kg` : 'NEW';
    } else if (unit === 'seconds') {
      const diff = Math.round(pr.previousValue - pr.value);
      delta = diff > 0 ? `−${diff}s` : 'NEW';
    } else {
      const diff = Math.round(pr.value - pr.previousValue);
      delta = diff > 0 ? `+${diff}` : 'NEW';
    }
  }

  const date = pr.achievedAt
    ? new Date(pr.achievedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).toUpperCase()
    : '';

  return {
    glyph,
    sport,
    date,
    label: (pr.recordType ?? '').replace(/_/g, ' ').toUpperCase(),
    value: valueStr,
    unit: unitStr,
    delta,
  };
}

/* ------------------------------------------------------------------ */
/* Comparison deltas                                                   */
/* ------------------------------------------------------------------ */

export interface DeltaVM {
  label: string;
  value: string;
  dir: 'up' | 'down' | 'reg';
}

export function pctDelta(cur: number, prev: number): { value: string; dir: 'up' | 'down' | 'reg' } | null {
  if (prev <= 0) return null;
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return { value: '0%', dir: 'reg' };
  return { value: `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`, dir: pct > 0 ? 'up' : 'down' };
}

export function buildDeltas(cur: ShowcaseRoundup, prev: ShowcaseRoundup): DeltaVM[] {
  const out: DeltaVM[] = [];

  const sessions = pctDelta(cur.totalActivities ?? 0, prev.totalActivities ?? 0);
  if (sessions) out.push({ label: 'Sessions', ...sessions });

  const time = pctDelta(cur.totalDurationSeconds ?? 0, prev.totalDurationSeconds ?? 0);
  if (time) out.push({ label: 'Time', ...time });

  if ((cur.totalDistanceMeters ?? 0) > 500 && (prev.totalDistanceMeters ?? 0) > 500) {
    const dist = pctDelta(cur.totalDistanceMeters ?? 0, prev.totalDistanceMeters ?? 0);
    if (dist) out.push({ label: 'Distance', ...dist });
  }

  if ((cur.totalCaloriesKcal ?? 0) > 0 && (prev.totalCaloriesKcal ?? 0) > 0) {
    const cal = pctDelta(cur.totalCaloriesKcal ?? 0, prev.totalCaloriesKcal ?? 0);
    if (cal) out.push({ label: 'Calories', ...cal });
  }

  const curPRs = cur.prsAchieved?.length ?? 0;
  const prevPRs = prev.prsAchieved?.length ?? 0;
  if (curPRs !== prevPRs) {
    const diff = curPRs - prevPRs;
    out.push({
      label: 'Records',
      value: `${diff > 0 ? '+' : '−'}${Math.abs(diff)}`,
      dir: diff > 0 ? 'up' : 'down',
    });
  }

  return out;
}
