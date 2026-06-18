import { describe, it, expect } from 'vitest';
import { stringToColor } from '../colorUtils';

describe('stringToColor', () => {
  it('is deterministic for the same input', () => {
    expect(stringToColor('FitGlue')).toEqual(stringToColor('FitGlue'));
  });

  it('produces different hues for different inputs', () => {
    const a = stringToColor('alpha');
    const b = stringToColor('beta');
    expect(a.style.backgroundColor).not.toBe(b.style.backgroundColor);
  });

  it('returns valid HSL strings with the fixed saturation/lightness', () => {
    const { style } = stringToColor('test');
    expect(style.backgroundColor).toMatch(/^hsl\(\d+, 70%, 90%\)$/);
    expect(style.color).toMatch(/^hsl\(\d+, 70%, 30%\)$/);
    expect(style.borderColor).toMatch(/^hsl\(\d+, 70%, 80%\)$/);
  });

  it('keeps the hue within 0-359', () => {
    const { style } = stringToColor('a-very-long-string-to-exercise-the-hash');
    const hue = Number(style.backgroundColor.match(/hsl\((\d+)/)![1]);
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });

  it('handles the empty string', () => {
    const { style, className } = stringToColor('');
    expect(style.backgroundColor).toBe('hsl(0, 70%, 90%)');
    expect(className).toBe('border');
  });
});
