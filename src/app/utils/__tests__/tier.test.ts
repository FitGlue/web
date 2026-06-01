import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getEffectiveTier, getTrialDaysRemaining, TIER_HOBBYIST, TIER_ATHLETE } from '../tier';
import type { UserProfile } from '../../state/userState';

function makeUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    displayName: 'Test User',
    tier: 'USER_TIER_HOBBYIST',
    isAdmin: false,
    ...overrides,
  } as UserProfile;
}

describe('getEffectiveTier', () => {
  it('returns athlete for admin users regardless of tier', () => {
    expect(getEffectiveTier(makeUser({ isAdmin: true, tier: 'USER_TIER_HOBBYIST' }))).toBe(TIER_ATHLETE);
  });

  it('returns athlete during an active trial', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(getEffectiveTier(makeUser({ trialEndsAt: future }))).toBe(TIER_ATHLETE);
  });

  it('returns hobbyist after trial expiry', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    expect(getEffectiveTier(makeUser({ trialEndsAt: past }))).toBe(TIER_HOBBYIST);
  });

  it('returns athlete for USER_TIER_ATHLETE tier string', () => {
    expect(getEffectiveTier(makeUser({ tier: 'USER_TIER_ATHLETE' }))).toBe(TIER_ATHLETE);
  });

  it('returns athlete when tier is the literal string "athlete"', () => {
    expect(getEffectiveTier(makeUser({ tier: 'athlete' as UserProfile['tier'] }))).toBe(TIER_ATHLETE);
  });

  it('defaults to hobbyist for unrecognised tier', () => {
    expect(getEffectiveTier(makeUser({ tier: 'USER_TIER_HOBBYIST' }))).toBe(TIER_HOBBYIST);
  });

  it('admin overrides an active trial (both grant athlete anyway)', () => {
    const future = new Date(Date.now() + 1000).toISOString();
    expect(getEffectiveTier(makeUser({ isAdmin: true, trialEndsAt: future }))).toBe(TIER_ATHLETE);
  });
});

describe('getTrialDaysRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when trialEndsAt is not set', () => {
    expect(getTrialDaysRemaining(makeUser())).toBeNull();
  });

  it('returns 0 when trial has already expired', () => {
    expect(getTrialDaysRemaining(makeUser({ trialEndsAt: '2024-05-31T00:00:00Z' }))).toBe(0);
  });

  it('returns 0 when trial ends exactly now', () => {
    expect(getTrialDaysRemaining(makeUser({ trialEndsAt: '2024-06-01T00:00:00Z' }))).toBe(0);
  });

  it('returns remaining days rounded up', () => {
    expect(getTrialDaysRemaining(makeUser({ trialEndsAt: '2024-06-08T00:00:00Z' }))).toBe(7);
  });

  it('rounds partial days up', () => {
    expect(getTrialDaysRemaining(makeUser({ trialEndsAt: '2024-06-02T12:00:00Z' }))).toBe(2);
  });
});
