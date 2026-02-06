/**
 * Tier utilities for the web frontend.
 *
 * Mirrors the logic in server/src/typescript/shared/src/domain/tier.ts
 * but uses the UserProfile type from the OpenAPI schema (API responses)
 * instead of the protobuf UserRecord type.
 */

import { UserProfile } from '../state/userState';

export const TIER_HOBBYIST = 'hobbyist' as const;
export const TIER_ATHLETE = 'athlete' as const;

export type EffectiveTier = typeof TIER_HOBBYIST | typeof TIER_ATHLETE;

export const HOBBYIST_TIER_LIMITS = {
  SYNCS_PER_MONTH: 25,
} as const;

/**
 * Determine the effective tier for a user.
 * Priority: admin > active trial > stored tier
 */
export function getEffectiveTier(user: UserProfile): EffectiveTier {
  // Admin override always grants Athlete
  if (user.isAdmin) {
    return TIER_ATHLETE;
  }

  // Active trial grants Athlete
  if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
    return TIER_ATHLETE;
  }

  // Fall back to stored tier (default: hobbyist)
  // The schema now correctly types tier as 'hobbyist' | 'athlete'.
  if (user.tier === TIER_ATHLETE) {
    return TIER_ATHLETE;
  }

  return TIER_HOBBYIST;
}

/**
 * Calculate trial days remaining
 */
export function getTrialDaysRemaining(user: UserProfile): number | null {
  if (!user.trialEndsAt) return null;

  const now = new Date();
  const trialEnd = new Date(user.trialEndsAt);

  if (trialEnd <= now) return 0;

  const diffMs = trialEnd.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
