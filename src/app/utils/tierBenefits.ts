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

// --- Athlete benefit cards (SubscriptionPage athlete view) ---

export interface TierBenefit {
    icon: string;
    title: string;
    desc: string;
}

export const ATHLETE_BENEFITS: TierBenefit[] = [
    { icon: '🔄', title: 'Unlimited Syncs', desc: 'No monthly limits' },
    { icon: '🚀', title: 'All Boosters', desc: 'AI summaries, image generation' },
    { icon: '🌟', title: 'Showcase Forever', desc: 'Pages never expire' },
];

// --- Plan comparison table (SubscriptionPage hobbyist view) ---

export interface PlanFeature {
    name: string;
    hobbyist: string | null;
    athlete: string;
    hobbyistIncluded: boolean;
}

export const PLAN_FEATURES: PlanFeature[] = [
    { name: 'Monthly Syncs', hobbyist: String(HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH), athlete: 'Unlimited', hobbyistIncluded: true },
    { name: 'Basic Boosters', hobbyist: '✓', athlete: '✓', hobbyistIncluded: true },
    { name: 'AI Boosters', hobbyist: null, athlete: '✓', hobbyistIncluded: false },
    { name: 'Image Boosters', hobbyist: null, athlete: '✓', hobbyistIncluded: false },
    { name: 'Showcase Retention', hobbyist: '30 days', athlete: 'Forever', hobbyistIncluded: true },
    { name: 'Showcase Profile', hobbyist: null, athlete: '✓ Public Profile', hobbyistIncluded: false },
];

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
