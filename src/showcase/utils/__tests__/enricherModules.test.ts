/**
 * Safety net: every enricher provider type known to the proto enum must be
 * explicitly listed in ENRICHER_TO_MODULE — either mapped to a ModuleKey or
 * set to null (hidden / booster-timeline only). This test fails when a new
 * enricher is added to the proto but the showcase module mapping is forgotten.
 */
import { describe, it, expect } from 'vitest';
import { EnricherProviderType } from '../../../types/pb/models/plugin/provider';
import { ENRICHER_TO_MODULE } from '../enricherModules';

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
