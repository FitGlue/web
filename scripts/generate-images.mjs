/**
 * generate-images.mjs
 *
 * Generates missing static PNG assets for FitGlue web:
 *   - public/images/og-image.png       (1200x630, social sharing)
 *   - public/images/apple-touch-icon.png (180x180, iOS home screen)
 *
 * Uses Python (Pillow) for PNG generation — run with: node scripts/generate-images.mjs
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const imagesDir = resolve(webRoot, 'public', 'images');

// Ensure output directory exists
if (!existsSync(imagesDir)) {
  mkdirSync(imagesDir, { recursive: true });
  console.log(`Created directory: ${imagesDir}`);
}

// Aurora gradient colours (match favicon.svg)
// #ff3da6 → #8b5cf6 → #22d3ee (pink → purple → cyan)

const pythonScript = /* python */ `
import struct
import zlib
import sys
from PIL import Image, ImageDraw, ImageFont

def aurora_gradient(width, height):
    """Create a horizontal aurora gradient: pink → purple → cyan."""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)

    # Colour stops: (r, g, b) at positions 0.0, 0.5, 1.0
    stops = [
        (0.0,  (0xff, 0x3d, 0xa6)),  # #ff3da6 pink
        (0.5,  (0x8b, 0x5c, 0xf6)),  # #8b5cf6 purple
        (1.0,  (0x22, 0xd3, 0xee)),  # #22d3ee cyan
    ]

    def lerp_colour(t):
        # Find surrounding stops
        for i in range(len(stops) - 1):
            t0, c0 = stops[i]
            t1, c1 = stops[i + 1]
            if t0 <= t <= t1:
                f = (t - t0) / (t1 - t0)
                r = int(c0[0] + f * (c1[0] - c0[0]))
                g = int(c0[1] + f * (c1[1] - c0[1]))
                b = int(c0[2] + f * (c1[2] - c0[2]))
                return (r, g, b)
        return stops[-1][1]

    for x in range(width):
        t = x / (width - 1)
        colour = lerp_colour(t)
        draw.line([(x, 0), (x, height - 1)], fill=colour)

    return img


# ── apple-touch-icon (180×180) ────────────────────────────────────────────────
print("Generating apple-touch-icon.png (180×180)…")

icon = aurora_gradient(180, 180)
draw = ImageDraw.Draw(icon)

# "FG" text, centred — use a bold font if available, fall back to default
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 72)
except Exception:
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
    except Exception:
        font = ImageFont.load_default()

text = "FG"
bbox = draw.textbbox((0, 0), text, font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
x = (180 - tw) / 2 - bbox[0]
y = (180 - th) / 2 - bbox[1]

# Dark text colour matching the SVG (#070710)
draw.text((x, y), text, fill=(7, 7, 16), font=font)

icon.save("${imagesDir}/apple-touch-icon.png", "PNG")
print("  ✓ apple-touch-icon.png")


# ── og-image (1200×630) ───────────────────────────────────────────────────────
print("Generating og-image.png (1200×630)…")

og = aurora_gradient(1200, 630)
draw = ImageDraw.Draw(og)

# Left section: "FG" mark (large)
try:
    font_large = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 200)
    font_word  = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 90)
    font_tag   = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", 42)
except Exception:
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 200)
        font_word  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 90)
        font_tag   = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 42)
    except Exception:
        font_large = ImageFont.load_default()
        font_word  = ImageFont.load_default()
        font_tag   = ImageFont.load_default()

dark = (7, 7, 16)         # #070710
light = (255, 255, 255)   # white for tagline contrast

# Semi-transparent overlay on the right half for text legibility
overlay = Image.new('RGBA', (1200, 630), (0, 0, 0, 0))
ov_draw = ImageDraw.Draw(overlay)
ov_draw.rectangle([(400, 0), (1200, 630)], fill=(7, 7, 16, 90))
og = og.convert('RGBA')
og = Image.alpha_composite(og, overlay)
og = og.convert('RGB')
draw = ImageDraw.Draw(og)

# "FG" mark on the left, vertically centred
fg_text = "FG"
fg_bbox = draw.textbbox((0, 0), fg_text, font=font_large)
fg_w = fg_bbox[2] - fg_bbox[0]
fg_h = fg_bbox[3] - fg_bbox[1]
fg_x = (400 - fg_w) / 2 - fg_bbox[0]
fg_y = (630 - fg_h) / 2 - fg_bbox[1]
draw.text((fg_x, fg_y), fg_text, fill=dark, font=font_large)

# "FITGLUE" wordmark on the right
word_text = "FITGLUE"
word_bbox = draw.textbbox((0, 0), word_text, font=font_word)
word_w = word_bbox[2] - word_bbox[0]
word_h = word_bbox[3] - word_bbox[1]
right_cx = 400 + (800 / 2)
word_x = right_cx - word_w / 2 - word_bbox[0]
word_y = 630 / 2 - word_h - 10 - word_bbox[1]
draw.text((word_x, word_y), word_text, fill=light, font=font_word)

# Tagline beneath wordmark
tag_text = "Your fitness data, connected."
tag_bbox = draw.textbbox((0, 0), tag_text, font=font_tag)
tag_w = tag_bbox[2] - tag_bbox[0]
tag_x = right_cx - tag_w / 2 - tag_bbox[0]
tag_y = word_y + word_h + word_bbox[1] + 20
draw.text((tag_x, tag_y), tag_text, fill=(220, 220, 240), font=font_tag)

og.save("${imagesDir}/og-image.png", "PNG")
print("  ✓ og-image.png")
print("Done.")
`;

try {
  execSync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}'`, {
    stdio: 'inherit',
    cwd: webRoot,
  });
} catch (err) {
  console.error('Image generation failed:', err.message);
  process.exit(1);
}

// Verify outputs
const outputs = [
  resolve(imagesDir, 'apple-touch-icon.png'),
  resolve(imagesDir, 'og-image.png'),
];

let allOk = true;
for (const f of outputs) {
  if (existsSync(f)) {
    console.log(`Verified: ${f}`);
  } else {
    console.error(`MISSING: ${f}`);
    allOk = false;
  }
}

if (!allOk) {
  process.exit(1);
}
