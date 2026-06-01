import { describe, it, expect } from 'vitest';
import { resolveEnum } from '../resolveEnum';

enum Color {
  Red = 0,
  Green = 1,
  Blue = 2,
}

describe('resolveEnum', () => {
  it('returns 0 for undefined', () => {
    expect(resolveEnum(undefined, Color)).toBe(0);
  });

  it('passes through numeric values unchanged', () => {
    expect(resolveEnum(1, Color)).toBe(1);
    expect(resolveEnum(0, Color)).toBe(0);
    expect(resolveEnum(2, Color)).toBe(2);
  });

  it('resolves string name to numeric value', () => {
    expect(resolveEnum('Green', Color)).toBe(1);
    expect(resolveEnum('Blue', Color)).toBe(2);
    expect(resolveEnum('Red', Color)).toBe(0);
  });

  it('parses numeric string as a number when not a reverse-map key', () => {
    // Numeric strings that are NOT in the enum's reverse map fall through to parseInt
    expect(resolveEnum('99', Color)).toBe(99);
  });

  it('returns 0 for unrecognised string', () => {
    expect(resolveEnum('Purple', Color)).toBe(0);
  });
});
