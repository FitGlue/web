import { describe, it, expect } from 'vitest';
import {
  PLAN_FEATURES,
  ATHLETE_BENEFITS,
  DOWNGRADE_ITEMS,
} from '../tierBenefits';
import { HOBBYIST_TIER_LIMITS } from '../tier';

describe('PLAN_FEATURES', () => {
  it('lists features with hobbyist/athlete columns', () => {
    expect(PLAN_FEATURES.length).toBeGreaterThan(0);
    for (const f of PLAN_FEATURES) {
      expect(typeof f.name).toBe('string');
      expect(typeof f.athlete).toBe('string');
      expect(typeof f.hobbyistIncluded).toBe('boolean');
    }
  });

  it('derives the monthly sync limit from tier constants', () => {
    const syncs = PLAN_FEATURES.find((f) => f.name === 'Monthly Syncs');
    expect(syncs?.hobbyist).toBe(String(HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH));
  });

  it('marks AI boosters as athlete-only', () => {
    const ai = PLAN_FEATURES.find((f) => f.name === 'AI Boosters');
    expect(ai?.hobbyistIncluded).toBe(false);
    expect(ai?.hobbyist).toBeNull();
  });
});

describe('ATHLETE_BENEFITS', () => {
  it('contains exactly the features that declare a benefit card', () => {
    const withBenefit = PLAN_FEATURES.filter((f) => f.benefit);
    expect(ATHLETE_BENEFITS).toHaveLength(withBenefit.length);
    expect(ATHLETE_BENEFITS.every((b) => b.icon && b.title && b.desc)).toBe(true);
  });
});

describe('DOWNGRADE_ITEMS', () => {
  it('describes what is lost when downgrading', () => {
    expect(DOWNGRADE_ITEMS.length).toBeGreaterThan(0);
    const syncs = DOWNGRADE_ITEMS.find((d) => d.from === 'Unlimited Syncs');
    expect(syncs?.to).toBe(`${HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH}/month`);
  });
});
