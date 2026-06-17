/**
 * Client-side "Roundup Reel" — an animated 9:16 video built entirely in the
 * browser (canvas 2D + MediaRecorder), no server cost. buildReelData distils a
 * roundup into a set of scenes that mirror the gorgeous roundup *page* visuals
 * (sport donut, HR rings, consistency heatmap, photo montage, PR wall);
 * planScenes orders only the scenes the data can support; drawReelFrame renders
 * one frame at time t; recordReel captures a single pass to a downloadable WebM.
 */
import type { components } from '../../shared/api/schema-public';
import {
  buildSportVMs,
  buildCalendarDays,
  heroTitle,
  periodWord,
  formatDateRange,
  formatClock,
  formatMuscle,
  ownerInitials,
  buildPRGroupVMs,
  HR_ZONES,
  type CalDay,
} from './roundup';
import { DEFAULT_LEVEL_COLORS } from '../components/RoundupCharts';

type ShowcaseRoundup = components['schemas']['ShowcaseRoundup'];

export const REEL_W = 1080;
export const REEL_H = 1920;
export const REEL_DURATION = 12; // seconds — legacy default; real length comes from reelDuration()

const DISPLAY = "'Archivo Black','Arial Black',system-ui,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,monospace";
const PAPER = '#f5f3eb';
const INK = '#070710';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface ReelStat { num: number; suffix: string; label: string; }
interface ReelSport { label: string; color: string; count: number; pct: number; }

export type SceneId = 'cover' | 'stats' | 'donut' | 'photos' | 'heatmap' | 'hr' | 'efforts' | 'muscles' | 'places' | 'weather' | 'prcards' | 'highlight' | 'outro';
export interface Scene { id: SceneId; dur: number; }

interface ReelEffort { label: string; time: string; }
interface ReelMuscle { label: string; count: number; }
interface ReelPlace { name: string; country: string; count: number; }
interface ReelWeather { rainCount: number; coldest: number | null; hottest: number | null; sessions: number; }
interface ReelPRMetric { type: string; value: string; unit: string; }
interface ReelPRGroup { label: string; color: string; metrics: ReelPRMetric[]; }

export interface ReelData {
  eyebrow: string;
  title: string;
  dateRange: string;
  kicker: string;
  stats: ReelStat[];
  sports: ReelSport[];
  donutTotal: number;
  calDays: CalDay[];
  periodType: string;
  hrMinutes: number[];
  efforts: ReelEffort[];
  muscles: ReelMuscle[];
  places: ReelPlace[];
  weather: ReelWeather | null;
  prCount: number;
  prGroups: ReelPRGroup[];
  photos: string[];
  highlight: { big: string; label: string; sub: string } | null;
  name: string;
  handle: string;
  avatarUrl: string;
}

export function buildReelData(roundup: ShowcaseRoundup, periodKey: string): ReelData {
  const totalWeightKg = roundup.activityTypeBreakdowns?.reduce((s, bd) => s + (bd.totalWeightKg ?? 0), 0) ?? 0;
  const hasDistance = (roundup.totalDistanceMeters ?? 0) > 500;
  const hasStrength = (roundup.activityTypeBreakdowns?.some((bd) => (bd.totalSets ?? 0) > 0)) ?? false;

  const stats: ReelStat[] = [
    { num: roundup.totalActivities ?? 0, suffix: '', label: 'Sessions' },
    { num: Math.round((roundup.totalDurationSeconds ?? 0) / 3600), suffix: 'h', label: 'Total Time' },
  ];
  if (hasDistance) {
    stats.push({ num: Math.round((roundup.totalDistanceMeters ?? 0) / 1000), suffix: 'km', label: 'Distance' });
  } else if (hasStrength && totalWeightKg > 0) {
    stats.push({ num: Math.round(totalWeightKg / 1000), suffix: 't', label: 'Moved' });
  }
  if ((roundup.totalElevationGainMeters ?? 0) > 50) {
    stats.push({ num: Math.round(roundup.totalElevationGainMeters ?? 0), suffix: 'm', label: 'Climbed' });
  }
  if ((roundup.totalCaloriesKcal ?? 0) > 0) {
    stats.push({ num: roundup.totalCaloriesKcal ?? 0, suffix: '', label: 'Calories' });
  }

  const vms = buildSportVMs(roundup.activityTypeBreakdowns ?? []);
  const sportTotal = vms.reduce((a, s) => a + s.count, 0) || 1;
  const sports: ReelSport[] = vms.slice(0, 5).map((s) => ({
    label: s.label, color: s.color, count: s.count, pct: s.count / sportTotal,
  }));

  // Personal records get their own colourful card scene; cherry-pick the
  // richest cards (most metrics) first when there are many to show.
  const prCount = roundup.prsAchieved?.length ?? 0;
  const prGroups: ReelPRGroup[] = [...buildPRGroupVMs(roundup.prsAchieved ?? [])]
    .sort((a, b) => b.metrics.length - a.metrics.length)
    .slice(0, 6)
    .map((g) => ({
      label: g.label.toUpperCase(),
      color: g.color,
      metrics: g.metrics.slice(0, 3).map((m) => ({ type: m.type || 'PR', value: m.value, unit: m.unit })),
    }));

  // The generic highlight now covers the non-PR climax (vertical / longest).
  let highlight: ReelData['highlight'] = null;
  const elevation = roundup.totalElevationGainMeters ?? 0;
  const longest = roundup.longestActivityDurationSeconds ?? 0;
  if (elevation > 50) {
    highlight = { big: `+${Math.round(elevation).toLocaleString()}m`, label: 'Total Vertical', sub: 'Climbed this period' };
  } else if (longest > 60) {
    const h = Math.floor(longest / 3600);
    const m = Math.floor((longest % 3600) / 60);
    highlight = { big: h > 0 ? `${h}h ${m}m` : `${m}m`, label: 'Longest Session', sub: 'The big one' };
  }

  const calDays = (roundup.periodStart && roundup.periodEnd)
    ? buildCalendarDays(roundup.periodStart, roundup.periodEnd, roundup.dayEntries ?? [])
    : [];

  // Photos first (more evocative), then route thumbnails as a fallback / top-up.
  const photos = [
    ...(roundup.photos ?? []).map((p) => p.url).filter((u): u is string => !!u),
    ...(roundup.routes ?? []).map((r) => r.thumbnailUrl).filter((u): u is string => !!u),
  ].slice(0, 6);

  return {
    eyebrow: `${periodWord(roundup.periodType).toUpperCase()} IN SPORT`,
    title: heroTitle(periodKey),
    dateRange: formatDateRange(roundup.periodStart, roundup.periodEnd) ?? '',
    kicker: `YOUR ${periodWord(roundup.periodType).toUpperCase()} IN SPORT`,
    stats: stats.slice(0, 4),
    sports,
    donutTotal: vms.reduce((a, s) => a + s.count, 0),
    calDays,
    periodType: roundup.periodType ?? '',
    hrMinutes: roundup.hrZoneMinutes ?? [],
    efforts: (roundup.bestEfforts ?? [])
      .filter((be) => (be.timeSeconds ?? 0) > 0)
      .slice(0, 4)
      .map((be) => ({ label: (be.display ?? be.distanceKey ?? '').toUpperCase(), time: formatClock(be.timeSeconds ?? 0) })),
    muscles: (roundup.muscles ?? [])
      .filter((m) => (m.count ?? 0) > 0)
      .slice(0, 5)
      .map((m) => ({ label: formatMuscle(m.name ?? '').toUpperCase(), count: m.count ?? 0 })),
    places: (roundup.places ?? [])
      .slice(0, 5)
      .map((p) => ({ name: (p.name ?? '').toUpperCase(), country: (p.country ?? '').toUpperCase(), count: p.activityCount ?? 0 })),
    weather: roundup.weather && (roundup.weather.sessionCount ?? 0) > 0
      ? {
          rainCount: roundup.weather.rainCount ?? 0,
          coldest: roundup.weather.coldestTempC ?? null,
          hottest: roundup.weather.hottestTempC ?? null,
          sessions: roundup.weather.sessionCount ?? 0,
        }
      : null,
    prCount,
    prGroups,
    photos,
    highlight,
    name: roundup.ownerDisplayName ?? '',
    handle: roundup.ownerProfileSlug ?? '',
    avatarUrl: roundup.ownerProfilePictureUrl ?? '',
  };
}

/**
 * Orders the scenes the data can support. cover/stats/outro are always present;
 * the rest appear only when their source data exists (and photos only when the
 * caller confirms at least one image is usable — tainted images break recording).
 */
/** Cover and outro are structural and always present; everything else is toggleable. */
export const SCENE_LABELS: Record<SceneId, string> = {
  cover: 'Intro',
  stats: 'Stats',
  donut: 'Sports',
  photos: 'Photos',
  heatmap: 'Consistency',
  hr: 'HR Zones',
  efforts: 'Best Efforts',
  muscles: 'Muscles',
  places: 'Places',
  weather: 'Weather',
  prcards: 'Records',
  highlight: 'Highlight',
  outro: 'Outro',
};

export const LOCKED_SCENES: ReadonlySet<SceneId> = new Set<SceneId>(['cover', 'outro']);

export function planScenes(d: ReelData, hasUsablePhotos: boolean, disabled?: ReadonlySet<SceneId>): Scene[] {
  const scenes: Scene[] = [{ id: 'cover', dur: 2.6 }];
  if (d.stats.length) scenes.push({ id: 'stats', dur: 2.6 });
  if (d.sports.length) scenes.push({ id: 'donut', dur: 2.8 });
  if (hasUsablePhotos) scenes.push({ id: 'photos', dur: 3 });
  if (d.calDays.length > 1) scenes.push({ id: 'heatmap', dur: 2.6 });
  if (hrTrackedMinutes(d.hrMinutes) >= 30) scenes.push({ id: 'hr', dur: 2.6 });
  if (d.efforts.length) scenes.push({ id: 'efforts', dur: 2.6 });
  if (d.muscles.length) scenes.push({ id: 'muscles', dur: 2.4 });
  if (d.places.length) scenes.push({ id: 'places', dur: 2.4 });
  if (d.weather) scenes.push({ id: 'weather', dur: 2.4 });
  if (d.prGroups.length) scenes.push({ id: 'prcards', dur: 3.2 });
  if (d.highlight) scenes.push({ id: 'highlight', dur: 2.4 });
  scenes.push({ id: 'outro', dur: 2.4 });
  // Drop user-disabled scenes (cover/outro can never be disabled).
  return disabled ? scenes.filter((s) => LOCKED_SCENES.has(s.id) || !disabled.has(s.id)) : scenes;
}

export function reelDuration(scenes: Scene[]): number {
  return scenes.reduce((a, s) => a + s.dur, 0);
}

function hrTrackedMinutes(minutes: number[]): number {
  return [1, 2, 3, 4, 5].reduce((s, i) => s + (minutes[i] ?? 0), 0);
}

/* ------------------------------------------------------------------ */
/* Drawing primitives                                                  */
/* ------------------------------------------------------------------ */

let grainTile: HTMLCanvasElement | null = null;
function grain(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = tile.height = 160;
  const g = tile.getContext('2d');
  if (!g) return null;
  const img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grainTile = tile;
  return tile;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function text(
  ctx: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, color: string,
  align: CanvasTextAlign = 'center', spacing = 0,
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = spacing ? 'left' : align;
  ctx.textBaseline = 'alphabetic';
  if (!spacing) { ctx.fillText(s, x, y); return; }
  const widths = [...s].map((ch) => ctx.measureText(ch).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  for (let i = 0; i < s.length; i++) { ctx.fillText(s[i], cx, y); cx += widths[i]; }
}

/** Truncates a string with an ellipsis so it fits within maxW at the given font. */
function fitText(ctx: CanvasRenderingContext2D, s: string, font: string, maxW: number): string {
  ctx.font = font;
  if (ctx.measureText(s).width <= maxW) return s;
  let t = s;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

function drawBackground(ctx: CanvasRenderingContext2D, t: number, accent: string) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, REEL_W, REEL_H);

  const orbs = [
    { c: 'rgba(255,61,166,0.55)', x: 0.2, y: 0.18, r: 0.62 },
    { c: 'rgba(34,211,238,0.42)', x: 0.85, y: 0.42, r: 0.55 },
    { c: 'rgba(139,92,246,0.5)', x: 0.35, y: 0.86, r: 0.6 },
  ];
  for (let i = 0; i < orbs.length; i++) {
    const o = orbs[i];
    const dx = Math.sin(t * 0.5 + i * 2) * 90;
    const dy = Math.cos(t * 0.4 + i * 1.5) * 90;
    const cx = o.x * REEL_W + dx;
    const cy = o.y * REEL_H + dy;
    const rad = o.r * REEL_W;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, o.c);
    g.addColorStop(1, 'rgba(7,7,16,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, REEL_W, REEL_H);
  }

  // Subtle accent wash from the top, tinting each scene with the chosen accent.
  const wash = ctx.createLinearGradient(0, 0, 0, REEL_H * 0.5);
  wash.addColorStop(0, withAlpha(accent, 0.16));
  wash.addColorStop(1, 'rgba(7,7,16,0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, REEL_W, REEL_H);

  // vignette
  const v = ctx.createRadialGradient(REEL_W / 2, REEL_H / 2, REEL_H * 0.3, REEL_W / 2, REEL_H / 2, REEL_H * 0.78);
  v.addColorStop(0, 'rgba(7,7,16,0)');
  v.addColorStop(1, 'rgba(7,7,16,0.72)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, REEL_W, REEL_H);

  // film grain
  const tile = grain();
  if (tile) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    const pat = ctx.createPattern(tile, 'repeat');
    if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, REEL_W, REEL_H); }
    ctx.restore();
  }
}

/** Accepts #rrggbb or a CSS rgb()/rgba() and returns an rgba() at the given alpha. */
function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const h = color.slice(1);
    const n = h.length === 3
      ? h.split('').map((c) => parseInt(c + c, 16))
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    return `rgba(${n[0]},${n[1]},${n[2]},${alpha})`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b] = m[1].split(',').map((s) => parseFloat(s));
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

/** Segmented "story" progress along the very top. */
function drawProgress(ctx: CanvasRenderingContext2D, scenes: Scene[], idx: number, sceneLt: number, accent: string) {
  const pad = 36;
  const gap = 10;
  const y = 30;
  const h = 7;
  const total = REEL_W - pad * 2;
  const segW = (total - gap * (scenes.length - 1)) / scenes.length;
  for (let i = 0; i < scenes.length; i++) {
    const x = pad + i * (segW + gap);
    ctx.fillStyle = 'rgba(245,243,235,0.18)';
    roundRect(ctx, x, y, segW, h, h / 2); ctx.fill();
    const fill = i < idx ? 1 : i === idx ? clamp(sceneLt, 0, 1) : 0;
    if (fill > 0) {
      ctx.fillStyle = accent;
      roundRect(ctx, x, y, segW * fill, h, h / 2); ctx.fill();
    }
  }
}

/* ------------------------------------------------------------------ */
/* Chart-style scene primitives (mirror the page visuals)              */
/* ------------------------------------------------------------------ */

function drawDonut(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sw: number,
  sports: ReelSport[], total: number, lp: number, accent: string,
) {
  // track
  ctx.lineWidth = sw;
  ctx.strokeStyle = 'rgba(245,243,235,0.08)';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

  const sweep = easeOut(lp);
  let start = -Math.PI / 2;
  ctx.lineCap = 'butt';
  for (const s of sports) {
    const ang = s.pct * Math.PI * 2 * sweep;
    if (ang <= 0) continue;
    ctx.strokeStyle = s.color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + ang);
    ctx.stroke();
    start += s.pct * Math.PI * 2 * sweep;
  }
  text(ctx, String(total), cx, cy + 18, `${Math.round(r * 0.7)}px ${DISPLAY}`, PAPER, 'center');
  text(ctx, 'SESSIONS', cx, cy + 64, `26px ${MONO}`, withAlpha(accent, 0.85), 'center', 6);
}

function drawHRRings(ctx: CanvasRenderingContext2D, cx: number, cy: number, minutes: number[], lp: number) {
  const zoneMin = [1, 2, 3, 4, 5].map((i) => minutes[i] ?? 0);
  const totalMin = zoneMin.reduce((a, b) => a + b, 0) || 1;
  const max = Math.max(...zoneMin) || 1;
  const radii = [300, 248, 196, 148, 110];
  const sw = 30;
  const sweep = easeOut(lp);
  ctx.lineCap = 'round';
  radii.forEach((r, idx) => {
    ctx.lineWidth = sw;
    ctx.strokeStyle = 'rgba(245,243,235,0.08)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    const frac = (zoneMin[idx] / max) * sweep;
    if (frac > 0) {
      ctx.strokeStyle = HR_ZONES[idx].color;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
      ctx.stroke();
    }
  });
  ctx.lineCap = 'butt';
  text(ctx, `${Math.round(totalMin / 60)}h`, cx, cy + 14, `64px ${DISPLAY}`, PAPER, 'center');
  text(ctx, 'HR TRACKED', cx, cy + 56, `20px ${MONO}`, 'rgba(245,243,235,0.5)', 'center', 5);
}

function drawHeatmap(ctx: CanvasRenderingContext2D, days: CalDay[], periodType: string, x: number, y: number, w: number, lp: number) {
  const colors = DEFAULT_LEVEL_COLORS;
  const reveal = clamp(lp * 1.4, 0, 1);
  if (periodType === 'ROUNDUP_PERIOD_TYPE_WEEK') {
    // 7 vertical effort bars
    const gap = 24;
    const colW = (w - gap * 6) / 7;
    const maxH = 360;
    days.slice(0, 7).forEach((d, i) => {
      const cellReveal = clamp(reveal * 7 - i, 0, 1);
      const bx = x + i * (colW + gap);
      const fillH = d.level > 0 ? Math.max(0.16, d.level / 4) * maxH * easeOut(cellReveal) : 0;
      ctx.fillStyle = 'rgba(245,243,235,0.06)';
      roundRect(ctx, bx, y, colW, maxH, 10); ctx.fill();
      if (fillH > 0) {
        ctx.fillStyle = colors[d.level];
        roundRect(ctx, bx, y + maxH - fillH, colW, fillH, 10); ctx.fill();
      }
    });
    return;
  }
  // Month grid (Mon-first rows) and year heatmap both render as a cell matrix.
  const isYear = periodType === 'ROUNDUP_PERIOD_TYPE_YEAR';
  if (isYear) {
    // week columns, 7 rows (Sun..Sat)
    const cols: (CalDay | null)[][] = [];
    let cur: (CalDay | null)[] = [];
    for (let i = 0; i < days[0].dow; i++) cur.push(null);
    days.forEach((d) => { cur.push(d); if (d.dow === 6) { cols.push(cur); cur = []; } });
    if (cur.length) { while (cur.length < 7) cur.push(null); cols.push(cur); }
    const gap = 4;
    const cell = (w - gap * (cols.length - 1)) / cols.length;
    cols.forEach((wk, ci) => {
      wk.forEach((d, ri) => {
        if (!d) return;
        const cellReveal = clamp(reveal * cols.length - ci, 0, 1);
        if (cellReveal <= 0) return;
        ctx.globalAlpha = cellReveal;
        ctx.fillStyle = d.level > 0 ? colors[d.level] : colors[0];
        roundRect(ctx, x + ci * (cell + gap), y + ri * (cell + gap), cell, cell, 2); ctx.fill();
        ctx.globalAlpha = 1;
      });
    });
    return;
  }
  // Month grid: 7 columns Monday-first
  const rows: (CalDay | null)[][] = [];
  let row: (CalDay | null)[] = new Array(7).fill(null);
  let placed = false;
  days.forEach((d) => {
    const col = (d.dow + 6) % 7;
    row[col] = d; placed = true;
    if (col === 6) { rows.push(row); row = new Array(7).fill(null); placed = false; }
  });
  if (placed) rows.push(row);
  const gap = 14;
  const cell = (w - gap * 6) / 7;
  rows.forEach((wk, ri) => {
    wk.forEach((d, ci) => {
      if (!d) return;
      const order = ri * 7 + ci;
      const cellReveal = clamp(reveal * 42 - order, 0, 1);
      if (cellReveal <= 0) return;
      ctx.globalAlpha = cellReveal;
      ctx.fillStyle = d.level > 0 ? colors[d.level] : 'rgba(245,243,235,0.05)';
      const cx2 = x + ci * (cell + gap);
      const cy2 = y + ri * (cell + gap);
      roundRect(ctx, cx2, cy2, cell, cell, 6); ctx.fill();
      if (d.level >= 3) {
        const dnum = new Date(d.ts).getUTCDate();
        text(ctx, String(dnum), cx2 + cell - 10, cy2 + 26, `20px ${DISPLAY}`, INK, 'right');
      }
      ctx.globalAlpha = 1;
    });
  });
}

function drawPhotoMontage(ctx: CanvasRenderingContext2D, images: HTMLImageElement[], lt: number, accent: string) {
  if (!images.length) return;
  // Cross-dissolve through images with a slow Ken-Burns zoom/pan.
  const per = 1 / images.length;
  const idx = Math.min(images.length - 1, Math.floor(lt / per));
  const localT = (lt - idx * per) / per; // 0..1 within this image
  const frameX = 90, frameW = REEL_W - 180;
  const frameY = REEL_H * 0.16, frameH = REEL_H * 0.62;

  const drawImg = (img: HTMLImageElement, alpha: number, phase: number) => {
    if (alpha <= 0) return;
    ctx.save();
    roundRect(ctx, frameX, frameY, frameW, frameH, 28);
    ctx.clip();
    const zoom = 1.08 + phase * 0.12;
    const iw = img.width, ih = img.height;
    const scale = Math.max(frameW / iw, frameH / ih) * zoom;
    const dw = iw * scale, dh = ih * scale;
    const panX = (frameW - dw) * (0.5 + Math.sin(phase * Math.PI) * 0.12);
    const panY = (frameH - dh) * 0.5;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, frameX + panX, frameY + panY, dw, dh);
    ctx.restore();
  };

  drawImg(images[idx], 1, localT);
  // Dissolve into the next image near the end of each slot.
  if (idx < images.length - 1 && localT > 0.78) {
    drawImg(images[idx + 1], (localT - 0.78) / 0.22, 0);
  }

  // Frame stroke + caption band
  ctx.save();
  ctx.globalAlpha = 1;
  const grad = ctx.createLinearGradient(0, frameY + frameH * 0.55, 0, frameY + frameH);
  grad.addColorStop(0, 'rgba(7,7,16,0)');
  grad.addColorStop(1, 'rgba(7,7,16,0.85)');
  roundRect(ctx, frameX, frameY, frameW, frameH, 28); ctx.save(); ctx.clip();
  ctx.fillStyle = grad; ctx.fillRect(frameX, frameY, frameW, frameH); ctx.restore();
  ctx.lineWidth = 3;
  ctx.strokeStyle = withAlpha(accent, 0.6);
  roundRect(ctx, frameX, frameY, frameW, frameH, 28); ctx.stroke();
  ctx.restore();

  text(ctx, 'CAUGHT IN MOTION', REEL_W / 2, frameY + frameH + 96, `34px ${MONO}`, withAlpha(accent, 0.9), 'center', 7);
  // dot indicator
  const dotY = frameY + frameH + 150;
  const dots = images.length;
  const dotGap = 28;
  const startX = REEL_W / 2 - ((dots - 1) * dotGap) / 2;
  for (let i = 0; i < dots; i++) {
    ctx.fillStyle = i === idx ? accent : 'rgba(245,243,235,0.3)';
    ctx.beginPath(); ctx.arc(startX + i * dotGap, dotY, i === idx ? 7 : 5, 0, Math.PI * 2); ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* Scene renderers                                                     */
/* ------------------------------------------------------------------ */

interface DrawCtx { images: HTMLImageElement[]; hasPhotos: boolean; disabled?: ReadonlySet<SceneId>; }

function renderScene(ctx: CanvasRenderingContext2D, id: SceneId, d: ReelData, lt: number, accent: string, dc: DrawCtx) {
  const cx = REEL_W / 2;
  switch (id) {
    case 'cover': {
      const rise = (1 - easeOut(clamp(lt * 2, 0, 1))) * 70;
      // avatar crest
      const av = dc.images.find((im) => im.dataset?.kind === 'avatar');
      const crestY = REEL_H * 0.3 - rise;
      if (av) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, crestY, 56, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        const sc = Math.max(112 / av.width, 112 / av.height);
        ctx.drawImage(av, cx - (av.width * sc) / 2, crestY - (av.height * sc) / 2, av.width * sc, av.height * sc);
        ctx.restore();
        ctx.lineWidth = 4; ctx.strokeStyle = accent;
        ctx.beginPath(); ctx.arc(cx, crestY, 56, 0, Math.PI * 2); ctx.stroke();
      } else if (d.name) {
        ctx.lineWidth = 4; ctx.strokeStyle = accent;
        ctx.beginPath(); ctx.arc(cx, crestY, 56, 0, Math.PI * 2); ctx.stroke();
        text(ctx, ownerInitials(d.name), cx, crestY + 16, `44px ${DISPLAY}`, PAPER, 'center');
      }
      text(ctx, d.kicker, cx, REEL_H * 0.46 - rise, `38px ${MONO}`, withAlpha(accent, 0.95), 'center', 8);
      const titleSize = d.title.length > 6 ? 200 : 300;
      text(ctx, d.title, cx, REEL_H * 0.58 - rise, `${titleSize}px ${DISPLAY}`, PAPER, 'center');
      if (d.dateRange) text(ctx, d.dateRange, cx, REEL_H * 0.64 - rise, `30px ${MONO}`, 'rgba(245,243,235,0.55)', 'center', 4);
      break;
    }
    case 'stats': {
      const cols = 2;
      const cellW = REEL_W * 0.4;
      const cellH = 280;
      const startX = cx - (cols * cellW) / 2;
      const startY = REEL_H * 0.32;
      text(ctx, 'BY THE NUMBERS', cx, REEL_H * 0.24, `34px ${MONO}`, withAlpha(accent, 0.85), 'center', 7);
      d.stats.forEach((s, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const lp = clamp((lt * 2.8) - i * 0.34, 0, 1);
        if (lp <= 0) return;
        ctx.globalAlpha = lp;
        const x = startX + col * cellW + cellW / 2;
        const y = startY + row * (cellH + 36);
        const val = Math.round(s.num * easeOut(lp)).toLocaleString() + s.suffix;
        text(ctx, val, x, y + 90, `116px ${DISPLAY}`, accent, 'center');
        text(ctx, s.label.toUpperCase(), x, y + 148, `32px ${MONO}`, 'rgba(245,243,235,0.6)', 'center', 5);
        // hairline divider under each cell
        ctx.globalAlpha = lp * 0.4;
        ctx.fillStyle = 'rgba(245,243,235,0.25)';
        ctx.fillRect(x - cellW * 0.34, y + 178, cellW * 0.68, 2);
        ctx.globalAlpha = 1;
      });
      break;
    }
    case 'donut': {
      text(ctx, 'WHERE THE WORK WENT', cx, REEL_H * 0.18, `34px ${MONO}`, withAlpha(accent, 0.85), 'center', 6);
      drawDonut(ctx, cx, REEL_H * 0.36, 200, 56, d.sports, d.donutTotal, lt, accent);
      // legend
      const lx = REEL_W * 0.16;
      const lw = REEL_W * 0.68;
      let ly = REEL_H * 0.56;
      d.sports.forEach((s, i) => {
        const lp = clamp(lt * 2.4 - i * 0.18, 0, 1);
        if (lp <= 0) return;
        ctx.globalAlpha = lp;
        ctx.fillStyle = s.color;
        roundRect(ctx, lx, ly - 26, 30, 30, 6); ctx.fill();
        text(ctx, s.label.toUpperCase(), lx + 50, ly, `40px ${DISPLAY}`, PAPER, 'left');
        text(ctx, `${s.count}`, lx + lw, ly, `40px ${DISPLAY}`, accent, 'right');
        text(ctx, `${Math.round(s.pct * 100)}%`, lx + lw - 110, ly, `28px ${MONO}`, 'rgba(245,243,235,0.5)', 'right');
        ctx.globalAlpha = 1;
        ly += 84;
      });
      break;
    }
    case 'photos':
      drawPhotoMontage(ctx, dc.images.filter((im) => im.dataset?.kind === 'photo'), lt, accent);
      break;
    case 'heatmap': {
      const titleByType = d.periodType === 'ROUNDUP_PERIOD_TYPE_WEEK' ? 'THE WEEK, DAY BY DAY'
        : d.periodType === 'ROUNDUP_PERIOD_TYPE_YEAR' ? 'EVERY DAY, ACCOUNTED FOR'
          : 'THE MONTH, DAY BY DAY';
      text(ctx, 'CONSISTENCY', cx, REEL_H * 0.22, `34px ${MONO}`, withAlpha(accent, 0.85), 'center', 7);
      text(ctx, titleByType, cx, REEL_H * 0.28, `48px ${DISPLAY}`, PAPER, 'center', 1);
      const active = d.calDays.filter((x) => x.level > 0).length;
      drawHeatmap(ctx, d.calDays, d.periodType, REEL_W * 0.12, REEL_H * 0.36, REEL_W * 0.76, lt);
      const lp = clamp(lt * 2 - 0.6, 0, 1);
      if (lp > 0) {
        ctx.globalAlpha = lp;
        text(ctx, `${active}`, cx, REEL_H * 0.82, `96px ${DISPLAY}`, accent, 'center');
        text(ctx, 'ACTIVE DAYS', cx, REEL_H * 0.86, `30px ${MONO}`, 'rgba(245,243,235,0.6)', 'center', 6);
        ctx.globalAlpha = 1;
      }
      break;
    }
    case 'hr': {
      text(ctx, 'TIME UNDER TENSION', cx, REEL_H * 0.18, `34px ${MONO}`, withAlpha(accent, 0.85), 'center', 6);
      drawHRRings(ctx, cx, REEL_H * 0.4, d.hrMinutes, lt);
      const zoneMin = [1, 2, 3, 4, 5].map((i) => d.hrMinutes[i] ?? 0);
      const totalMin = zoneMin.reduce((a, b) => a + b, 0) || 1;
      let ly = REEL_H * 0.66;
      HR_ZONES.forEach((z, i) => {
        const lp = clamp(lt * 2.4 - i * 0.16, 0, 1);
        if (lp <= 0) return;
        ctx.globalAlpha = lp;
        ctx.fillStyle = z.color;
        roundRect(ctx, REEL_W * 0.16, ly - 24, 28, 28, 6); ctx.fill();
        text(ctx, `${z.z} ${z.name.toUpperCase()}`, REEL_W * 0.16 + 48, ly, `34px ${DISPLAY}`, PAPER, 'left');
        text(ctx, `${Math.round((zoneMin[i] / totalMin) * 100)}%`, REEL_W * 0.84, ly, `34px ${DISPLAY}`, accent, 'right');
        ctx.globalAlpha = 1;
        ly += 64;
      });
      break;
    }
    case 'efforts': {
      text(ctx, 'BENCHMARKS', cx, REEL_H * 0.2, `34px ${MONO}`, withAlpha(accent, 0.85), 'center', 7);
      text(ctx, 'FASTEST KNOWN TIMES', cx, REEL_H * 0.26, `46px ${DISPLAY}`, PAPER, 'center', 1);
      const cardX = REEL_W * 0.14;
      const cardW = REEL_W * 0.72;
      let ey = REEL_H * 0.36;
      d.efforts.forEach((e, i) => {
        const lp = clamp(lt * 2.6 - i * 0.28, 0, 1);
        if (lp <= 0) return;
        ctx.globalAlpha = lp;
        ctx.fillStyle = 'rgba(245,243,235,0.05)';
        roundRect(ctx, cardX, ey, cardW, 150, 18); ctx.fill();
        ctx.strokeStyle = withAlpha(accent, 0.25); ctx.lineWidth = 2;
        roundRect(ctx, cardX, ey, cardW, 150, 18); ctx.stroke();
        text(ctx, e.label, cardX + 40, ey + 56, `30px ${MONO}`, withAlpha(accent, 0.95), 'left', 4);
        text(ctx, e.time, cardX + 40, ey + 120, `72px ${DISPLAY}`, PAPER, 'left');
        text(ctx, 'FASTEST', cardX + cardW - 40, ey + 120, `26px ${MONO}`, 'rgba(245,243,235,0.4)', 'right', 4);
        ctx.globalAlpha = 1;
        ey += 170;
      });
      break;
    }
    case 'muscles': {
      text(ctx, 'ANATOMY', cx, REEL_H * 0.2, `34px ${MONO}`, withAlpha(accent, 0.85), 'center', 7);
      text(ctx, 'MUSCLES UNDER LOAD', cx, REEL_H * 0.26, `46px ${DISPLAY}`, PAPER, 'center', 1);
      const mx = REEL_W * 0.14, mw = REEL_W * 0.72;
      const peak = Math.max(...d.muscles.map((m) => m.count), 1);
      let my = REEL_H * 0.38;
      d.muscles.forEach((m, i) => {
        const lp = clamp(lt * 2.6 - i * 0.22, 0, 1);
        if (lp <= 0) return;
        ctx.globalAlpha = lp;
        text(ctx, m.label, mx, my - 16, `34px ${DISPLAY}`, PAPER, 'left');
        text(ctx, String(m.count), mx + mw, my - 16, `34px ${DISPLAY}`, accent, 'right');
        ctx.fillStyle = 'rgba(245,243,235,0.08)';
        roundRect(ctx, mx, my, mw, 22, 11); ctx.fill();
        ctx.fillStyle = accent;
        roundRect(ctx, mx, my, mw * (m.count / peak) * easeOut(lp), 22, 11); ctx.fill();
        ctx.globalAlpha = 1;
        my += 96;
      });
      break;
    }
    case 'places': {
      text(ctx, 'GEOGRAPHY', cx, REEL_H * 0.2, `34px ${MONO}`, withAlpha(accent, 0.85), 'center', 7);
      text(ctx, 'WHERE IT HAPPENED', cx, REEL_H * 0.26, `46px ${DISPLAY}`, PAPER, 'center', 1);
      const px = REEL_W * 0.14, pw = REEL_W * 0.72;
      let py = REEL_H * 0.38;
      d.places.forEach((p, i) => {
        const lp = clamp(lt * 2.6 - i * 0.22, 0, 1);
        if (lp <= 0) return;
        ctx.globalAlpha = lp;
        text(ctx, p.name, px, py, `42px ${DISPLAY}`, PAPER, 'left');
        if (p.country) text(ctx, p.country, px, py + 36, `24px ${MONO}`, 'rgba(245,243,235,0.5)', 'left', 3);
        text(ctx, `×${p.count}`, px + pw, py, `42px ${DISPLAY}`, accent, 'right');
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(245,243,235,0.12)';
        ctx.fillRect(px, py + 58, pw, 2);
        py += 112;
      });
      break;
    }
    case 'weather': {
      if (!d.weather) break;
      text(ctx, 'CONDITIONS', cx, REEL_H * 0.22, `34px ${MONO}`, withAlpha(accent, 0.85), 'center', 7);
      text(ctx, 'WHATEVER THE WEATHER', cx, REEL_H * 0.28, `46px ${DISPLAY}`, PAPER, 'center', 1);
      const cells: { n: string; l: string }[] = [];
      if (d.weather.rainCount > 0) cells.push({ n: String(d.weather.rainCount), l: 'IN THE WET' });
      if (d.weather.coldest != null) cells.push({ n: `${Math.round(d.weather.coldest)}°`, l: 'COLDEST START' });
      if (d.weather.hottest != null) cells.push({ n: `${Math.round(d.weather.hottest)}°`, l: 'HOTTEST START' });
      cells.push({ n: String(d.weather.sessions), l: 'SESSIONS TRACKED' });
      const cols = 2;
      const cellW = REEL_W * 0.36;
      const startX = cx - (cols * cellW) / 2;
      const startY = REEL_H * 0.4;
      cells.slice(0, 4).forEach((c, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const lp = clamp(lt * 2.6 - i * 0.2, 0, 1);
        if (lp <= 0) return;
        ctx.globalAlpha = lp;
        const x = startX + col * cellW + cellW / 2;
        const y = startY + row * 280;
        text(ctx, c.n, x, y + 90, `110px ${DISPLAY}`, accent, 'center');
        text(ctx, c.l, x, y + 144, `26px ${MONO}`, 'rgba(245,243,235,0.6)', 'center', 4);
        ctx.globalAlpha = 1;
      });
      break;
    }
    case 'prcards': {
      text(ctx, 'THE RECORDS WALL', cx, REEL_H * 0.13, `34px ${MONO}`, withAlpha(accent, 0.85), 'center', 7);
      text(ctx, `${d.prCount} ${d.prCount === 1 ? 'RECORD' : 'RECORDS'} BROKEN`, cx, REEL_H * 0.19, `64px ${DISPLAY}`, PAPER, 'center', 1);
      const marginX = REEL_W * 0.09;
      const gapX = 24, gapY = 24;
      const cardW = (REEL_W - marginX * 2 - gapX) / 2;
      const cardH = 330;
      const startY = REEL_H * 0.26;
      const pad = 28;
      d.prGroups.forEach((g, i) => {
        const lp = clamp(lt * 2.4 - i * 0.16, 0, 1);
        if (lp <= 0) return;
        ctx.globalAlpha = lp;
        const col = i % 2, row = Math.floor(i / 2);
        const x = marginX + col * (cardW + gapX);
        const y = startY + row * (cardH + gapY);
        // tinted body + colour top bar (clipped to rounded corners)
        ctx.save();
        roundRect(ctx, x, y, cardW, cardH, 18); ctx.clip();
        ctx.fillStyle = withAlpha(g.color, 0.16); ctx.fillRect(x, y, cardW, cardH);
        ctx.fillStyle = g.color; ctx.fillRect(x, y, cardW, 8);
        ctx.restore();
        ctx.lineWidth = 2; ctx.strokeStyle = withAlpha(g.color, 0.5);
        roundRect(ctx, x, y, cardW, cardH, 18); ctx.stroke();
        // exercise label (truncated to fit)
        text(ctx, fitText(ctx, g.label, `30px ${DISPLAY}`, cardW - pad * 2), x + pad, y + 64, `30px ${DISPLAY}`, PAPER, 'left');
        // metric rows
        let my = y + 124;
        g.metrics.forEach((m) => {
          text(ctx, m.type, x + pad, my, `22px ${MONO}`, g.color, 'left', 2);
          text(ctx, m.unit ? `${m.value} ${m.unit}` : m.value, x + cardW - pad, my, `38px ${DISPLAY}`, PAPER, 'right');
          my += 64;
        });
        ctx.globalAlpha = 1;
      });
      break;
    }
    case 'highlight': {
      if (!d.highlight) break;
      const pop = 0.85 + easeOut(clamp(lt * 2.4, 0, 1)) * 0.15;
      text(ctx, d.highlight.sub.toUpperCase(), cx, REEL_H * 0.4, `36px ${MONO}`, 'rgba(245,243,235,0.6)', 'center', 6);
      ctx.save();
      ctx.translate(cx, REEL_H * 0.52);
      ctx.scale(pop, pop);
      text(ctx, d.highlight.big, 0, 60, `260px ${DISPLAY}`, accent, 'center');
      ctx.restore();
      text(ctx, d.highlight.label.toUpperCase(), cx, REEL_H * 0.62, `52px ${DISPLAY}`, PAPER, 'center', 2);
      break;
    }
    case 'outro': {
      if (d.name) text(ctx, `BY ${d.name.toUpperCase()}`, cx, REEL_H * 0.42, `40px ${MONO}`, 'rgba(245,243,235,0.7)', 'center', 6);
      const grad = ctx.createLinearGradient(cx - 320, 0, cx + 320, 0);
      grad.addColorStop(0, '#ff3da6');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#22d3ee');
      text(ctx, 'FITGLUE', cx, REEL_H * 0.53, `150px ${DISPLAY}`, grad as unknown as string, 'center');
      const cta = d.handle ? `FITGLUE.TECH/@${d.handle.toUpperCase()}` : 'FITGLUE.TECH';
      text(ctx, cta, cx, REEL_H * 0.6, `32px ${MONO}`, 'rgba(245,243,235,0.55)', 'center', 6);
      break;
    }
  }
  ctx.globalAlpha = 1;
}

/* ------------------------------------------------------------------ */
/* Director                                                            */
/* ------------------------------------------------------------------ */

const TRANS = 0.4; // in/out animation length per scene

export function drawReelFrame(
  ctx: CanvasRenderingContext2D, d: ReelData, t: number, accent: string, dc?: DrawCtx,
) {
  const ctxd: DrawCtx = dc ?? { images: [], hasPhotos: false };
  const scenes = planScenes(d, ctxd.hasPhotos, ctxd.disabled);
  const total = reelDuration(scenes);
  const tt = clamp(t, 0, total);

  // Locate the active scene.
  let acc = 0;
  let idx = 0;
  let local = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (tt < acc + scenes[i].dur || i === scenes.length - 1) {
      idx = i;
      local = tt - acc;
      break;
    }
    acc += scenes[i].dur;
  }
  const scene = scenes[idx];
  const lt = clamp(local / scene.dur, 0, 1);

  drawBackground(ctx, t, accent);

  // Per-scene in/out transform — only one scene draws at a time (no overlap).
  const inA = clamp(local / TRANS, 0, 1);
  const outA = clamp((scene.dur - local) / TRANS, 0, 1);
  const alpha = Math.min(easeInOut(inA), easeInOut(outA));
  const slide = (1 - easeOut(inA)) * 40 - (1 - easeOut(outA)) * 40;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(0, slide);
  renderScene(ctx, scene.id, d, lt, accent, ctxd);
  ctx.restore();
  ctx.globalAlpha = 1;

  drawProgress(ctx, scenes, idx, lt, accent);
}

/** Records one pass of the reel to a WebM blob. */
export function recordReel(
  canvas: HTMLCanvasElement,
  drawAt: (t: number) => void,
  duration: number,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const ready = (typeof document !== 'undefined' && document.fonts) ? document.fonts.ready : Promise.resolve();
    ready.then(() => {
      try {
        if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
          reject(new Error('Recording not supported in this browser'));
          return;
        }
        const stream = canvas.captureStream(30);
        const mimes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
        const mime = mimes.find((m) => MediaRecorder.isTypeSupported?.(m)) ?? 'video/webm';
        const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
        const chunks: BlobPart[] = [];
        rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
        rec.onerror = () => reject(new Error('Recording failed'));
        const start = performance.now();
        rec.start();
        const tick = (now: number) => {
          const t = (now - start) / 1000;
          drawAt(Math.min(t, duration));
          onProgress?.(clamp(t / duration, 0, 1));
          if (t < duration) requestAnimationFrame(tick);
          else setTimeout(() => rec.state !== 'inactive' && rec.stop(), 120);
        };
        requestAnimationFrame(tick);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Recording failed'));
      }
    });
  });
}
