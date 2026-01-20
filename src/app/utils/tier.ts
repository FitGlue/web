/**
 * Tier utilities for the web frontend.
 *
 * Mirrors the logic in server/src/typescript/shared/src/domain/tier.ts
 * but uses the UserProfile type from the OpenAPI schema (API responses)
 * instead of the protobuf UserRecord type.
 */

import { UserProfile } from '../state/userState';

export type EffectiveTier = 'free' | 'pro';

export const FREE_TIER_LIMITS = {
  SYNCS_PER_MONTH: 25,
  MAX_CONNECTIONS: 2,
} as const;

/**
 * Determine the effective tier for a user.
 * Priority: admin > active trial > stored tier
 */
export function getEffectiveTier(user: UserProfile): EffectiveTier {
  // Admin override always grants Pro
  if (user.isAdmin) {
    return 'pro';
  }

  // Active trial grants Pro
  if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
    return 'pro';
  }

  // Fall back to stored tier (default: free)
  return user.tier || 'free';
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
