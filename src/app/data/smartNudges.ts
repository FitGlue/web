/**
 * Smart Nudge Registry
 *
 * Registry-driven nudge system with declarative conditions.
 * To add a new nudge, just add an entry here — no evaluator changes needed.
 */

// ── Condition types ──────────────────────────────────────────────

export type NudgeConditionType =
    | 'no_pipelines'
    | 'missing_enricher'
    | 'missing_destination'
    | 'no_connections'
    | 'unused_connection';

export interface NudgeCondition {
    type: NudgeConditionType;
    /** Only for 'missing_enricher': the enricher providerType to look for */
    enricherProviderType?: number;
    /** Only for 'missing_enricher': only check pipelines with this sourceId */
    sourceId?: string;
    /** Only for 'missing_destination': the destination id to look for */
    destinationId?: string;
    /** Only for 'unused_connection': the integration id that should have a pipeline */
    integrationId?: string;
}

// ── Nudge definition ─────────────────────────────────────────────

export type NudgePage = 'dashboard' | 'pipelines' | 'connections' | 'activity-detail';

export interface SmartNudgeDefinition {
    id: string;
    /** Which pages can show this nudge */
    pages: NudgePage[];
    /** Declarative condition that triggers the nudge */
    condition: NudgeCondition;
    /** Priority (higher = shown first when multiple match) */
    priority: number;
    /** Display content */
    icon: string;
    title: string;
    description: string;
    cta: string;
    /** Route to navigate to when CTA is clicked */
    route: string;
}

// ── Registry ─────────────────────────────────────────────────────

export const SMART_NUDGES: SmartNudgeDefinition[] = [
    // ── High priority: zero-state nudges ──
    {
        id: 'no-connections',
        pages: ['dashboard'],
        condition: { type: 'no_connections' },
        priority: 100,
        icon: '🔌',
        title: 'Connect Your First App',
        description: 'Link your fitness apps to start transforming your data automatically.',
        cta: 'Set Up Connections',
        route: '/connections',
    },
    {
        id: 'no-pipelines',
        pages: ['dashboard'],
        condition: { type: 'no_pipelines' },
        priority: 90,
        icon: '🚀',
        title: 'Grab a Recipe to Get Started',
        description: 'One-click pipeline setups for common goals — no configuration needed.',
        cta: 'Browse Recipes',
        route: '/recipes',
    },

    // ── Medium priority: missing enricher suggestions ──
    {
        id: 'hevy-missing-muscle-heatmap',
        pages: ['dashboard', 'pipelines'],
        condition: {
            type: 'missing_enricher',
            sourceId: 'hevy',
            enricherProviderType: 3, // Muscle Heatmap
        },
        priority: 60,
        icon: '💪',
        title: 'Show Which Muscles You Hit',
        description: 'Add Muscle Heatmap to your Hevy pipeline for emoji muscle activation maps in every post.',
        cta: 'Edit Pipeline',
        route: '/settings/pipelines',
    },
    {
        id: 'strava-missing-training-load',
        pages: ['dashboard', 'pipelines'],
        condition: {
            type: 'missing_enricher',
            sourceId: 'strava',
            enricherProviderType: 14, // Training Load
        },
        priority: 50,
        icon: '📊',
        title: 'Track Your Training Load',
        description: 'See fitness, fatigue, and form trends by adding Training Load to your Strava pipeline.',
        cta: 'Edit Pipeline',
        route: '/settings/pipelines',
    },

    // ── Missing destination suggestions ──
    {
        id: 'missing-showcase',
        pages: ['dashboard', 'pipelines'],
        condition: {
            type: 'missing_destination',
            destinationId: 'showcase',
        },
        priority: 40,
        icon: '🔗',
        title: 'Share Workouts Without Strava',
        description: 'Add Showcase to create public activity pages anyone can view — no account needed.',
        cta: 'Browse Recipes',
        route: '/recipes',
    },

    // ── Unused connection ──
    {
        id: 'unused-hevy',
        pages: ['connections', 'dashboard'],
        condition: {
            type: 'unused_connection',
            integrationId: 'hevy',
        },
        priority: 30,
        icon: '🏋️',
        title: 'Hevy is Connected — Now Use It',
        description: 'Create a pipeline to auto-post your strength training to Strava with exercise breakdowns.',
        cta: 'Browse Recipes',
        route: '/recipes',
    },
    {
        id: 'unused-fitbit',
        pages: ['connections', 'dashboard'],
        condition: {
            type: 'unused_connection',
            integrationId: 'fitbit',
        },
        priority: 30,
        icon: '💜',
        title: 'Fitbit is Connected — Merge Heart Rate Data',
        description: 'Add accurate calories, training zones, and intensity data to your Strava activities.',
        cta: 'Browse Recipes',
        route: '/recipes',
    },
];
