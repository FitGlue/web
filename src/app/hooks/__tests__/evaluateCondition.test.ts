import { describe, it, expect } from 'vitest';
import { evaluateCondition } from '../useSmartNudges';
import type { NudgeCondition } from '../../data/smartNudges';
import type { IntegrationsSummary } from '../../state/integrationsState';

// Minimal pipeline shape expected by evaluateCondition
interface Pipeline {
  id: string;
  source: string;
  enrichers?: { providerType: number }[];
  destinations: (string | number)[];
}

function makeIntegrations(overrides: IntegrationsSummary = {}): IntegrationsSummary {
  return overrides;
}

const connected = { connected: true };
const disconnected = { connected: false };

// ── no_connections ───────────────────────────────────────────────

describe('evaluateCondition: no_connections', () => {
  const condition: NudgeCondition = { type: 'no_connections' };

  it('returns true when integrations is null', () => {
    expect(evaluateCondition(condition, [], null)).toBe(true);
  });

  it('returns true when no integrations are connected', () => {
    expect(evaluateCondition(condition, [], makeIntegrations({ strava: disconnected }))).toBe(true);
  });

  it('returns false when at least one integration is connected', () => {
    expect(evaluateCondition(condition, [], makeIntegrations({ strava: connected }))).toBe(false);
  });
});

// ── no_pipelines ─────────────────────────────────────────────────

describe('evaluateCondition: no_pipelines', () => {
  const condition: NudgeCondition = { type: 'no_pipelines' };

  it('returns false when integrations is null (no connection = different nudge)', () => {
    expect(evaluateCondition(condition, [], null)).toBe(false);
  });

  it('returns false when there are no connections (different nudge handles that)', () => {
    expect(evaluateCondition(condition, [], makeIntegrations({ strava: disconnected }))).toBe(false);
  });

  it('returns true when user has a connection but no pipelines', () => {
    expect(evaluateCondition(condition, [], makeIntegrations({ strava: connected }))).toBe(true);
  });

  it('returns false when user has pipelines', () => {
    const pipelines: Pipeline[] = [{ id: 'p1', source: 'strava', destinations: [] }];
    expect(evaluateCondition(condition, pipelines, makeIntegrations({ strava: connected }))).toBe(false);
  });
});

// ── missing_enricher ─────────────────────────────────────────────

describe('evaluateCondition: missing_enricher', () => {
  const condition: NudgeCondition = { type: 'missing_enricher', enricherProviderType: 5 };

  it('returns false when there are no pipelines', () => {
    expect(evaluateCondition(condition, [], makeIntegrations())).toBe(false);
  });

  it('returns true when no pipeline has the specified enricher', () => {
    const pipelines: Pipeline[] = [{ id: 'p1', source: 'strava', enrichers: [{ providerType: 1 }], destinations: [] }];
    expect(evaluateCondition(condition, pipelines, makeIntegrations())).toBe(true);
  });

  it('returns false when at least one pipeline has the enricher', () => {
    const pipelines: Pipeline[] = [{ id: 'p1', source: 'strava', enrichers: [{ providerType: 5 }], destinations: [] }];
    expect(evaluateCondition(condition, pipelines, makeIntegrations())).toBe(false);
  });

  it('filters by sourceId when specified', () => {
    const conditionWithSource: NudgeCondition = { type: 'missing_enricher', enricherProviderType: 5, sourceId: 'strava' };
    const pipelines: Pipeline[] = [
      { id: 'p1', source: 'garmin', enrichers: [{ providerType: 5 }], destinations: [] },
      { id: 'p2', source: 'strava', enrichers: [{ providerType: 1 }], destinations: [] },
    ];
    // p1 has the enricher but is garmin, p2 is strava but missing the enricher → true
    expect(evaluateCondition(conditionWithSource, pipelines, makeIntegrations())).toBe(true);
  });

  it('returns false when sourceId is specified but no pipelines match that source', () => {
    const conditionWithSource: NudgeCondition = { type: 'missing_enricher', enricherProviderType: 5, sourceId: 'hevy' };
    const pipelines: Pipeline[] = [{ id: 'p1', source: 'strava', enrichers: [], destinations: [] }];
    expect(evaluateCondition(conditionWithSource, pipelines, makeIntegrations())).toBe(false);
  });
});

// ── missing_destination ──────────────────────────────────────────

describe('evaluateCondition: missing_destination', () => {
  const condition: NudgeCondition = { type: 'missing_destination', destinationId: 'strava' };

  it('returns false when there are no pipelines', () => {
    expect(evaluateCondition(condition, [], makeIntegrations())).toBe(false);
  });

  it('returns true when no pipeline targets the destination', () => {
    const pipelines: Pipeline[] = [{ id: 'p1', source: 'garmin', destinations: ['hevy'] }];
    expect(evaluateCondition(condition, pipelines, makeIntegrations())).toBe(true);
  });
});

// ── unused_connection ────────────────────────────────────────────

describe('evaluateCondition: unused_connection', () => {
  const condition: NudgeCondition = { type: 'unused_connection', integrationId: 'garmin' };

  it('returns false when integration is not connected', () => {
    expect(evaluateCondition(condition, [], makeIntegrations({ garmin: disconnected }))).toBe(false);
  });

  it('returns false when integrations is null', () => {
    expect(evaluateCondition(condition, [], null)).toBe(false);
  });

  it('returns true when connected but not used in any pipeline', () => {
    const pipelines: Pipeline[] = [{ id: 'p1', source: 'strava', destinations: [] }];
    expect(evaluateCondition(condition, pipelines, makeIntegrations({ garmin: connected }))).toBe(true);
  });

  it('returns false when connected and used as source', () => {
    const pipelines: Pipeline[] = [{ id: 'p1', source: 'garmin', destinations: [] }];
    expect(evaluateCondition(condition, pipelines, makeIntegrations({ garmin: connected }))).toBe(false);
  });

  it('returns false when no integrationId specified', () => {
    const noIdCondition: NudgeCondition = { type: 'unused_connection' };
    expect(evaluateCondition(noIdCondition, [], makeIntegrations({ garmin: connected }))).toBe(false);
  });
});

// ── default/unknown type ─────────────────────────────────────────

describe('evaluateCondition: unknown type', () => {
  it('returns false for unrecognised condition types', () => {
    const unknown = { type: 'unknown_type' } as unknown as NudgeCondition;
    expect(evaluateCondition(unknown, [], null)).toBe(false);
  });
});
