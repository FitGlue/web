/**
 * Centralised tier benefit definitions.
 *
 * Single source of truth for all tier-related feature lists, comparison data,
 * and downgrade warnings displayed across the web UI.
 *
 * Numeric limits (e.g. SYNCS_PER_MONTH) are derived from HOBBYIST_TIER_LIMITS
 * in ./tier.ts to stay in sync with enforcement constants.
 */

import { HOBBYIST_TIER_LIMITS } from './tier';

// --- Plan features & derived athlete benefit cards ---

export interface TierBenefit {
    icon: string;
    title: string;
    desc: string;
}

export interface PlanFeature {
    name: string;
    hobbyist: string | null;
    athlete: string;
    hobbyistIncluded: boolean;
    /** When set, this feature appears as an Athlete benefit card. */
    benefit?: TierBenefit;
}

export const PLAN_FEATURES: PlanFeature[] = [
    { name: 'Monthly Syncs', hobbyist: String(HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH), athlete: 'Unlimited', hobbyistIncluded: true, benefit: { icon: '🔄', title: 'Unlimited Syncs', desc: 'No monthly limits' } },
    { name: 'Basic Boosters', hobbyist: '✓', athlete: '✓', hobbyistIncluded: true },
    { name: 'AI Boosters', hobbyist: null, athlete: '✓', hobbyistIncluded: false, benefit: { icon: '🚀', title: 'All Boosters', desc: 'AI summaries, image generation' } },
    { name: 'Image Boosters', hobbyist: null, athlete: '✓', hobbyistIncluded: false },
    { name: 'Showcase Retention', hobbyist: '30 days', athlete: 'Forever', hobbyistIncluded: true, benefit: { icon: '🌟', title: 'Showcase Forever', desc: 'Pages never expire' } },
    { name: 'Showcase Profile', hobbyist: null, athlete: '✓ Public Profile', hobbyistIncluded: false, benefit: { icon: '👤', title: 'Showcase Profile', desc: 'Public profile page' } },
];

/** Derived from PLAN_FEATURES – no separate list to keep in sync. */
export const ATHLETE_BENEFITS: TierBenefit[] = PLAN_FEATURES
    .filter((f): f is PlanFeature & { benefit: TierBenefit } => !!f.benefit)
    .map((f) => f.benefit);

// --- Downgrade warnings (SubscriptionPage trial countdown) ---

export interface DowngradeItem {
    from: string;
    to: string;
}

export const DOWNGRADE_ITEMS: DowngradeItem[] = [
    { from: 'Unlimited Syncs', to: `${HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH}/month` },
    { from: 'All Boosters', to: 'Basic only' },
    { from: 'Showcase Forever', to: '30 day retention' },
];
