import { describe, it, expect } from 'vitest';
import {
  stripBullet,
  splitLines,
  normalizeToLines,
  extractEmojiPrefix,
  getIntensityClass,
  getIntensityColor,
} from '../section';

describe('stripBullet', () => {
  it('removes a leading bullet and trims', () => {
    expect(stripBullet('  • Hello ')).toBe('Hello');
  });

  it('leaves non-bulleted lines (trimmed)', () => {
    expect(stripBullet('  plain ')).toBe('plain');
  });
});

describe('splitLines', () => {
  it('splits on newlines and drops blank lines', () => {
    expect(splitLines('a\n\n b \n')).toEqual(['a', ' b ']);
  });
});

describe('normalizeToLines', () => {
  it('splits multi-line content directly', () => {
    expect(normalizeToLines('one\ntwo')).toEqual(['one', 'two']);
  });

  it('converts inline " • " bullets to lines', () => {
    expect(normalizeToLines('a • b • c')).toEqual(['a', '• b', '• c']);
  });
});

describe('extractEmojiPrefix', () => {
  it('returns empty values for empty input', () => {
    expect(extractEmojiPrefix('')).toEqual({ emoji: '', rest: '' });
  });

  it('returns no emoji when the first char is ASCII', () => {
    expect(extractEmojiPrefix('Hello')).toEqual({ emoji: '', rest: 'Hello' });
  });

  it('extracts a leading emoji and trims the rest', () => {
    const result = extractEmojiPrefix('🔥 on fire');
    expect(result.emoji).toBe('🔥');
    expect(result.rest).toBe('on fire');
  });
});

describe('getIntensityClass', () => {
  it('maps known labels (case-insensitive)', () => {
    expect(getIntensityClass('Recovery')).toBe('recovery');
    expect(getIntensityClass('detraining')).toBe('recovery');
    expect(getIntensityClass('easy')).toBe('easy');
    expect(getIntensityClass('optimal')).toBe('easy');
    expect(getIntensityClass('moderate')).toBe('moderate');
    expect(getIntensityClass('building')).toBe('moderate');
    expect(getIntensityClass('hard')).toBe('hard');
    expect(getIntensityClass('threshold')).toBe('hard');
    expect(getIntensityClass('overreaching')).toBe('hard');
  });

  it('falls back to extreme', () => {
    expect(getIntensityClass('anything else')).toBe('extreme');
  });
});

describe('getIntensityColor', () => {
  it('maps known labels to colours', () => {
    expect(getIntensityColor('easy')).toBe('#4ADE80');
    expect(getIntensityColor('moderate')).toBe('#FBBF24');
    expect(getIntensityColor('hard')).toBe('#FB923C');
    expect(getIntensityColor('threshold')).toBe('#EF4444');
    expect(getIntensityColor('very hard zone')).toBe('#EF4444');
    expect(getIntensityColor('max')).toBe('#DC2626');
    expect(getIntensityColor('extreme')).toBe('#DC2626');
  });

  it('falls back to amber', () => {
    expect(getIntensityColor('unknown')).toBe('#FBBF24');
  });
});
