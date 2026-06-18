/**
 * Safety net: every enricher provider type known to the proto enum must be
 * explicitly listed in ENRICHER_TO_MODULE — either mapped to a ModuleKey or
 * set to null (hidden / booster-timeline only). This test fails when a new
 * enricher is added to the proto but the showcase module mapping is forgotten.
 */
import { describe, it, expect } from 'vitest';
import { EnricherProviderType } from '../../../types/pb/models/plugin/provider';
import {
    ENRICHER_TO_MODULE,
    buildModuleOrder,
    MODULE_PLACEMENT,
    type ModuleKey,
} from '../enricherModules';
import type { ShowcaseCategory } from '../activityCategory';

// Enum values to skip: UNSPECIFIED (sentinel), UNRECOGNIZED (proto catch-all),
// and MOCK (test-only provider never shipped).
const SKIP = new Set([
    EnricherProviderType.ENRICHER_PROVIDER_UNSPECIFIED,
    EnricherProviderType.ENRICHER_PROVIDER_MOCK,
    EnricherProviderType.UNRECOGNIZED,
]);

// Build the set of all ENRICHER_PROVIDER_* string keys from the enum.
const allEnricherKeys = Object.keys(EnricherProviderType).filter(
    (k): k is string =>
        k.startsWith('ENRICHER_PROVIDER_') &&
        !SKIP.has(EnricherProviderType[k as keyof typeof EnricherProviderType])
);

describe('ENRICHER_TO_MODULE coverage', () => {
    it('every enricher provider key is listed in ENRICHER_TO_MODULE (mapped or explicitly null)', () => {
        const missing: string[] = [];

        for (const key of allEnricherKeys) {
            if (!(key in ENRICHER_TO_MODULE)) {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            throw new Error(
                `These enricher providers are missing from ENRICHER_TO_MODULE in enricherModules.ts:\n` +
                missing.map(k => `  - ${k}`).join('\n') +
                `\n\nAdd each one mapped to a ModuleKey, or set it to null if it has no showcase panel.`
            );
        }

        expect(missing).toHaveLength(0);
    });

    it('no unknown enricher keys are listed in ENRICHER_TO_MODULE', () => {
        const validKeys = new Set(allEnricherKeys);
        const unknown = Object.keys(ENRICHER_TO_MODULE).filter(
            k => !validKeys.has(k)
        );
        expect(unknown).toHaveLength(0);
    });
});

const activity = (overrides: Record<string, unknown> = {}) => overrides as never;

const gpsActivity = () =>
    activity({
        activityData: {
            sessions: [{ laps: [{ records: [{ positionLat: 51.5, positionLong: -0.1 }] }] }],
        },
    });

describe('buildModuleOrder', () => {
    it('returns an empty list when nothing is applicable', () => {
        expect(buildModuleOrder(activity(), 'untraditional', new Set())).toEqual([]);
    });

    it('places parkrun first, but only for runs', () => {
        const applied = new Set(['ENRICHER_PROVIDER_PARKRUN']);
        expect(
            buildModuleOrder(activity({ activityType: 'ACTIVITY_TYPE_RUN' }), 'cardio-distance', applied),
        ).toContain('parkrun');
        expect(
            buildModuleOrder(activity({ activityType: 'ACTIVITY_TYPE_RIDE' }), 'cardio-distance', applied),
        ).not.toContain('parkrun');
    });

    it('includes description, tags and photos from activity content', () => {
        const a = activity({ description: 'a great run', tags: ['pb'], photoUrls: ['x.jpg'] });
        const order = buildModuleOrder(a, 'untraditional', new Set());
        expect(order).toContain('description');
        expect(order).toContain('tags');
        expect(order).toContain('photos');
    });

    it('shows the map only for cardio-distance activities with GPS', () => {
        expect(buildModuleOrder(gpsActivity(), 'cardio-distance', new Set())).toContain('map');
        expect(buildModuleOrder(gpsActivity(), 'cardio-time', new Set())).not.toContain('map');
        expect(buildModuleOrder(activity(), 'cardio-distance', new Set())).not.toContain('map');
    });

    it('ignores GPS records at the (0,0) null island', () => {
        const a = activity({
            activityData: { sessions: [{ laps: [{ records: [{ positionLat: 0, positionLong: 0 }] }] }] },
        });
        expect(buildModuleOrder(a, 'cardio-distance', new Set())).not.toContain('map');
    });

    it('orders cardio-distance core metrics in declaration order', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_PACE_SUMMARY',
            'ENRICHER_PROVIDER_HEART_RATE_SUMMARY',
        ]);
        const order = buildModuleOrder(activity(), 'cardio-distance', applied);
        expect(order.indexOf('heart-rate')).toBeLessThan(order.indexOf('pace'));
    });

    it('emits the full cardio-distance metric set when all enrichers are applied', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_HEART_RATE_SUMMARY', 'ENRICHER_PROVIDER_HEART_RATE_ZONES',
            'ENRICHER_PROVIDER_PACE_SUMMARY', 'ENRICHER_PROVIDER_SPEED_SUMMARY',
            'ENRICHER_PROVIDER_CADENCE_SUMMARY', 'ENRICHER_PROVIDER_ELEVATION_SUMMARY',
            'ENRICHER_PROVIDER_POWER_SUMMARY', 'ENRICHER_PROVIDER_EFFORT_SCORE',
            'ENRICHER_PROVIDER_CALORIES_BURNED', 'ENRICHER_PROVIDER_TRAINING_LOAD',
            'ENRICHER_PROVIDER_RUNNING_DYNAMICS', 'ENRICHER_PROVIDER_INTERVALS',
            'ENRICHER_PROVIDER_BEST_EFFORTS',
        ]);
        const order = buildModuleOrder(activity(), 'cardio-distance', applied);
        expect(order).toEqual(
            expect.arrayContaining([
                'heart-rate', 'zones', 'pace', 'speed', 'cadence', 'elevation',
                'power', 'effort', 'calories', 'training-load', 'running-dynamics',
                'intervals', 'best-efforts',
            ]),
        );
    });

    it('emits cardio-time metrics', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_HEART_RATE_SUMMARY', 'ENRICHER_PROVIDER_HEART_RATE_ZONES',
            'ENRICHER_PROVIDER_CADENCE_SUMMARY', 'ENRICHER_PROVIDER_EFFORT_SCORE',
            'ENRICHER_PROVIDER_CALORIES_BURNED', 'ENRICHER_PROVIDER_TRAINING_LOAD',
        ]);
        const order = buildModuleOrder(activity(), 'cardio-time', applied);
        expect(order).toEqual(
            expect.arrayContaining(['heart-rate', 'zones', 'cadence', 'effort', 'calories', 'training-load']),
        );
    });

    it('always includes the set-list for strength, plus its metrics', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_HEART_RATE_SUMMARY', 'ENRICHER_PROVIDER_HEART_RATE_ZONES',
            'ENRICHER_PROVIDER_EFFORT_SCORE', 'ENRICHER_PROVIDER_CALORIES_BURNED',
            'ENRICHER_PROVIDER_TRAINING_LOAD',
        ]);
        const order = buildModuleOrder(activity(), 'strength', applied);
        expect(order).toContain('set-list');
        expect(order).toEqual(
            expect.arrayContaining(['heart-rate', 'zones', 'effort', 'calories', 'training-load']),
        );
    });

    it('emits sport metrics', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_HEART_RATE_SUMMARY', 'ENRICHER_PROVIDER_HEART_RATE_ZONES',
            'ENRICHER_PROVIDER_EFFORT_SCORE', 'ENRICHER_PROVIDER_CALORIES_BURNED',
        ]);
        const order = buildModuleOrder(activity(), 'sport', applied);
        expect(order).toEqual(expect.arrayContaining(['heart-rate', 'zones', 'effort', 'calories']));
    });

    it('emits untraditional metrics', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_HEART_RATE_SUMMARY', 'ENRICHER_PROVIDER_CALORIES_BURNED',
        ]);
        const order = buildModuleOrder(activity(), 'untraditional', applied);
        expect(order).toEqual(expect.arrayContaining(['heart-rate', 'calories']));
    });

    it('upgrades muscle-heatmap from either heatmap enricher (deduped)', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_MUSCLE_HEATMAP',
            'ENRICHER_PROVIDER_MUSCLE_HEATMAP_IMAGE',
        ]);
        const order = buildModuleOrder(activity(), 'strength', applied);
        expect(order.filter((m) => m === 'muscle-heatmap')).toHaveLength(1);
    });

    it('includes context modules and only shows weather for cardio-distance', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_RECOVERY_ADVISOR', 'ENRICHER_PROVIDER_STREAK_TRACKER',
            'ENRICHER_PROVIDER_GOAL_TRACKER', 'ENRICHER_PROVIDER_WEATHER',
            'ENRICHER_PROVIDER_TEMPERATURE_SUMMARY', 'ENRICHER_PROVIDER_HDROP',
            'ENRICHER_PROVIDER_SPOTIFY_TRACKS',
        ]);
        const cardio = buildModuleOrder(activity(), 'cardio-distance', applied);
        expect(cardio).toEqual(
            expect.arrayContaining(['recovery', 'streak', 'goals', 'weather', 'temperature', 'hdrop', 'spotify']),
        );
        expect(buildModuleOrder(activity(), 'sport', applied)).not.toContain('weather');
    });

    it('includes hybrid race + AI + achievement modules', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_HYBRID_RACE_TAGGER', 'ENRICHER_PROVIDER_AI_COMPANION',
            'ENRICHER_PROVIDER_DISTANCE_MILESTONES', 'ENRICHER_PROVIDER_PERSONAL_RECORDS',
        ]);
        const order = buildModuleOrder(activity(), 'cardio-distance', applied);
        expect(order).toEqual(
            expect.arrayContaining(['hybrid-race-segments', 'ai-story', 'milestone-callout', 'pr-callout']),
        );
    });

    it('appends footer enrichers last', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_AUTO_INCREMENT',
            'ENRICHER_PROVIDER_SOURCE_LINK',
            'ENRICHER_PROVIDER_HEART_RATE_SUMMARY',
        ]);
        const order = buildModuleOrder(activity(), 'cardio-distance', applied);
        expect(order[order.length - 1]).toBe('source-link-footer');
        expect(order).toContain('auto-increment-footer');
    });

    it('never emits duplicates even with overlapping inputs', () => {
        const applied = new Set([
            'ENRICHER_PROVIDER_HEART_RATE_SUMMARY',
            'ENRICHER_PROVIDER_CALORIES_BURNED',
        ]);
        const order = buildModuleOrder(activity({ description: 'x' }), 'cardio-time', applied);
        expect(new Set(order).size).toBe(order.length);
    });
});

describe('MODULE_PLACEMENT', () => {
    it('declares a valid placement for every module key', () => {
        const placements = new Set(['page', 'pre-grid', 'grid', 'footer']);
        for (const placement of Object.values(MODULE_PLACEMENT)) {
            expect(placements.has(placement)).toBe(true);
        }
    });

    it('covers every module key produced across all categories', () => {
        const categories: ShowcaseCategory[] = [
            'cardio-distance', 'cardio-time', 'strength', 'sport', 'untraditional',
        ];
        const allEnrichers = new Set(
            Object.keys(ENRICHER_TO_MODULE).filter((k) => ENRICHER_TO_MODULE[k] !== null),
        );
        const produced = new Set<ModuleKey>();
        for (const cat of categories) {
            const order = buildModuleOrder(
                activity({ activityType: 'ACTIVITY_TYPE_RUN', description: 'x', tags: ['t'], photoUrls: ['p'] }),
                cat,
                allEnrichers,
            );
            order.forEach((m) => produced.add(m));
        }
        for (const m of produced) {
            expect(MODULE_PLACEMENT[m]).toBeDefined();
        }
    });
});
