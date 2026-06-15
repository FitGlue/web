#!/usr/bin/env node
// Run: node scripts/generate-icons.mjs
// Generates every FitGlue brand icon asset from brand primitives.

import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const WEB = join(__dir, '..');
const MOBILE = join(__dir, '..', '..', 'mobile');

GlobalFonts.registerFromPath(
  resolve(WEB, 'node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff'),
  'Archivo Black',
);

const C = {
  ink:    '#070710',
  ink2:   '#0d0c18',
  paper:  '#f5f3eb',
  pink:   '#ff3da6',
  violet: '#8b5cf6',
  cyan:   '#22d3ee',
};

function aurora(ctx, x, y, w) {
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0,   C.pink);
  g.addColorStop(0.5, C.violet);
  g.addColorStop(1,   C.cyan);
  return g;
}

function drawMark(ctx, x, y, size, { fill = 'aurora' } = {}) {
  ctx.fillStyle = fill === 'aurora' ? aurora(ctx, x, y, size) : C.ink;
  ctx.fillRect(x, y, size, size);

  const fontSize = Math.round(size * 0.5);
  ctx.fillStyle   = fill === 'aurora' ? C.ink : C.paper;
  ctx.font        = `${fontSize}px 'Archivo Black'`;
  ctx.letterSpacing = `${-0.04 * fontSize}px`;
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.fillText('FG', x + size / 2, y + size / 2);
}

// Square canvas with a centred mark.
// opts.transparent — omit background fill (for adaptive icon / splash)
// opts.fill        — 'aurora' | 'ink'
// opts.markRatio   — mark size as fraction of canvas size (default 0.75)
function markSquare(size, opts = {}) {
  const { bg = C.ink2, transparent = false, fill = 'aurora', markRatio = 0.75 } = opts;
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');
  if (!transparent) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  }
  const ms  = Math.round(size * markRatio);
  const off = (size - ms) / 2;
  drawMark(ctx, off, off, ms, { fill });
  return canvas;
}

function save(filePath, canvas, label) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, canvas.toBuffer('image/png'));
  const rel = filePath.startsWith(MOBILE)
    ? 'mobile/' + filePath.slice(MOBILE.length + 1)
    : 'web/'    + filePath.slice(WEB.length   + 1);
  console.log(`  ✓ ${rel}  (${canvas.width}×${canvas.height})`);
}

// ICO container wrapping one or more PNG buffers.
function encodeIco(pngBuffers, sizes) {
  const n      = pngBuffers.length;
  const dirOff = 6 + 16 * n;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(n, 4);

  const dirs = [];
  let imgOff = dirOff;
  for (let i = 0; i < n; i++) {
    const e = Buffer.alloc(16);
    const s = sizes[i];
    e.writeUInt8(s >= 256 ? 0 : s, 0);
    e.writeUInt8(s >= 256 ? 0 : s, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1,  4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(pngBuffers[i].length, 8);
    e.writeUInt32LE(imgOff, 12);
    dirs.push(e);
    imgOff += pngBuffers[i].length;
  }
  return Buffer.concat([header, ...dirs, ...pngBuffers]);
}

function saveIco(filePath, sizes) {
  const pngs = sizes.map(s => markSquare(s, { markRatio: 0.75 }).toBuffer('image/png'));
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, encodeIco(pngs, sizes));
  const rel = 'web/' + filePath.slice(WEB.length + 1);
  console.log(`  ✓ ${rel}  (${sizes.join(', ')}px multi-size ICO)`);
}

// ── Generate ────────────────────────────────────────────────────────────────

console.log('\nGenerating FitGlue icons...\n');

// favicon.svg — pure SVG, no canvas required
writeFileSync(join(WEB, 'public/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${C.pink}"/>
      <stop offset="50%"  stop-color="${C.violet}"/>
      <stop offset="100%" stop-color="${C.cyan}"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" fill="url(#g)"/>
  <text x="24" y="30" font-family="'Archivo Black','Arial Black',sans-serif"
        font-size="22" font-weight="900" fill="${C.ink}"
        text-anchor="middle" letter-spacing="-1">FG</text>
</svg>`);
console.log('  ✓ web/public/favicon.svg');

// favicon.ico (16 + 32 + 48 px, multi-size)
saveIco(join(WEB, 'public/favicon.ico'),       [16, 32, 48]);
saveIco(join(WEB, 'assets/root/favicon.ico'),  [16, 32, 48]);

// Web: apple-touch-icon  180×180
save(join(WEB, 'public/images/apple-touch-icon.png'),
  markSquare(180, { markRatio: 0.73 }));

// Web: OG / social share image  1200×630
{
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  ctx.fillStyle = C.ink2;
  ctx.fillRect(0, 0, W, H);

  // 4 px aurora accent stripe across top
  ctx.fillStyle = aurora(ctx, 0, 0, W);
  ctx.fillRect(0, 0, W, 4);

  const markSz   = 180;
  const wFont    = 140;
  const gap      = 36;

  ctx.font          = `${wFont}px 'Archivo Black'`;
  ctx.letterSpacing = `${-0.035 * wFont}px`;
  const ww = ctx.measureText('FITGLUE').width;

  const totalW = markSz + gap + ww;
  const x0     = (W - totalW) / 2;
  const midY   = H / 2;

  drawMark(ctx, x0, midY - markSz / 2, markSz);

  ctx.fillStyle     = C.paper;
  ctx.font          = `${wFont}px 'Archivo Black'`;
  ctx.letterSpacing = `${-0.035 * wFont}px`;
  ctx.textAlign     = 'left';
  ctx.textBaseline  = 'middle';
  ctx.fillText('FITGLUE', x0 + markSz + gap, midY);

  save(join(WEB, 'public/images/og-image.png'), canvas);
}

// Web: PWA icons
save(join(WEB, 'public/app/icons/icon-192.png'),
  markSquare(192, { markRatio: 0.77 }));

save(join(WEB, 'public/app/icons/icon-512.png'),
  markSquare(512, { markRatio: 0.77 }));

// PWA notification badge — monochrome-friendly, just the mark
save(join(WEB, 'public/app/icons/badge-72.png'),
  markSquare(72, { markRatio: 0.78 }));

// Mobile: main app icon  1024×1024 (with background — Apple/Google requirement)
save(join(MOBILE, 'assets/icon.png'),
  markSquare(1024, { markRatio: 0.78 }));

// Mobile: Android adaptive icon foreground  1024×1024, transparent bg
// Background colour (#0d0d0d) is declared separately in app.json.
// Mark lives within the inner 66 % safe zone → markRatio ≤ 0.59
save(join(MOBILE, 'assets/adaptive-icon.png'),
  markSquare(1024, { transparent: true, markRatio: 0.55 }));

// Mobile: splash icon — mark on transparent bg; Expo fills rest with #0d0d0d
save(join(MOBILE, 'assets/splash-icon.png'),
  markSquare(512, { transparent: true, markRatio: 0.70 }));

// Mobile: Expo web favicon
save(join(MOBILE, 'assets/favicon.png'),
  markSquare(48, { markRatio: 0.75 }));

// Mobile: Android notification icon — white mark on transparent bg.
// Android replaces all opaque pixels with the accent colour declared in app.json.
{
  const size   = 96;
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');

  // White filled square
  const ms  = Math.round(size * 0.78);
  const off = (size - ms) / 2;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(off, off, ms, ms);

  // Cut out "FG" letters so the accent colour shows through underneath
  ctx.globalCompositeOperation = 'destination-out';
  const fontSize = Math.round(ms * 0.5);
  ctx.fillStyle    = '#000000';
  ctx.font         = `${fontSize}px 'Archivo Black'`;
  ctx.letterSpacing = `${-0.04 * fontSize}px`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FG', size / 2, size / 2);

  save(join(MOBILE, 'assets/notification-icon.png'), canvas);
}

console.log('\nDone.\n');
