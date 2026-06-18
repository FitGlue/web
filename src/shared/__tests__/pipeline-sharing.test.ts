import { describe, it, expect } from 'vitest';
import {
  encodePipeline,
  decodePipeline,
  validatePipelineImport,
  getMissingConnectionInfo,
  type PortablePipeline,
} from '../pipeline-sharing';

// Loose casts — the production types pull in generated plugin/integration shapes
// that we only partially populate for these unit tests.
const registry = (overrides: Record<string, unknown>) => overrides as never;
const integrations = (overrides: Record<string, unknown>) => overrides as never;

describe('encodePipeline / decodePipeline', () => {
  it('round-trips a pipeline through base64', () => {
    const encoded = encodePipeline({
      name: 'My Pipeline',
      sources: ['hevy'],
      enrichers: [{ providerType: 5, typedConfig: { foo: 'bar' } }],
      destinations: ['strava', 7],
    });
    const decoded = decodePipeline(encoded);
    expect(decoded).toEqual({
      v: 1,
      n: 'My Pipeline',
      s: ['hevy'],
      e: [{ p: 5, c: { foo: 'bar' } }],
      d: ['strava', '7'],
    });
  });

  it('defaults an empty name and drops empty typedConfig', () => {
    const encoded = encodePipeline({
      name: '',
      sources: ['fitbit'],
      enrichers: [{ providerType: 1, typedConfig: {} }],
      destinations: ['strava'],
    });
    const decoded = decodePipeline(encoded);
    expect(decoded.n).toBe('Unnamed Pipeline');
    expect(decoded.e[0].c).toBeUndefined();
  });

  it('preserves unicode/emoji in names', () => {
    const encoded = encodePipeline({
      name: 'Run 🏃 résumé',
      sources: ['hevy'],
      enrichers: [],
      destinations: ['strava'],
    });
    expect(decodePipeline(encoded).n).toBe('Run 🏃 résumé');
  });

  it('tolerates surrounding whitespace in codes', () => {
    const encoded = encodePipeline({ name: 'X', sources: ['a'], enrichers: [], destinations: ['b'] });
    expect(decodePipeline(`  ${encoded}\n`).n).toBe('X');
  });

  it('rejects unsupported versions', () => {
    const encoded = btoa(JSON.stringify({ v: 2, n: 'x', s: ['a'], e: [], d: ['b'] }));
    expect(() => decodePipeline(encoded)).toThrow(/Unsupported pipeline version/);
  });

  it('rejects pipelines with no destinations', () => {
    const encoded = btoa(JSON.stringify({ v: 1, n: 'x', s: ['a'], e: [], d: [] }));
    expect(() => decodePipeline(encoded)).toThrow(/missing source or destinations/);
  });

  it('throws a friendly error on un-parseable input', () => {
    expect(() => decodePipeline('!!!not base64 json!!!')).toThrow(/failed to parse/);
  });
});

describe('validatePipelineImport', () => {
  const reg = registry({
    sources: [{ id: 'hevy', requiredIntegrations: ['hevy'] }],
    enrichers: [{ enricherProviderType: 5, requiredIntegrations: ['fitbit'] }],
    destinations: [{ id: 'strava', destinationType: 3, requiredIntegrations: ['strava'] }],
  });

  const portable: PortablePipeline = {
    v: 1,
    n: 'Shared',
    s: ['hevy'],
    e: [{ p: 5, c: { x: '1' } }],
    d: ['strava'],
  };

  it('reports missing connections (deduped) when not connected', () => {
    const result = validatePipelineImport(portable, integrations({}), reg);
    expect(result.valid).toBe(false);
    expect(result.missingConnections.sort()).toEqual(['fitbit', 'hevy', 'strava']);
  });

  it('builds a ready-to-save request when all connections are present', () => {
    const connected = integrations({
      hevy: { connected: true },
      fitbit: { connected: true },
      strava: { connected: true },
    });
    const result = validatePipelineImport(portable, connected, reg);
    expect(result.valid).toBe(true);
    expect(result.missingConnections).toEqual([]);
    expect(result.request).toEqual({
      name: 'Shared (Imported)',
      sources: ['hevy'],
      enrichers: [{ providerType: 5, typedConfig: { x: '1' } }],
      destinations: [3], // resolved from destinationType
    });
  });

  it('treats a null integrations summary as nothing connected', () => {
    const result = validatePipelineImport(portable, null, reg);
    expect(result.valid).toBe(false);
    expect(result.missingConnections.length).toBeGreaterThan(0);
  });

  it('defaults empty typedConfig in the built request', () => {
    const connected = integrations({ hevy: { connected: true } });
    const simple: PortablePipeline = { v: 1, n: 'S', s: ['hevy'], e: [{ p: 9 }], d: ['strava'] };
    const regNoReq = registry({
      sources: [{ id: 'hevy' }],
      enrichers: [],
      destinations: [{ id: 'strava', destinationType: 3 }],
    });
    const result = validatePipelineImport(simple, connected, regNoReq);
    expect(result.valid).toBe(true);
    const enrichers = result.request?.enrichers as { providerType: number; typedConfig: Record<string, string> }[];
    expect(enrichers[0].typedConfig).toEqual({});
  });
});

describe('getMissingConnectionInfo', () => {
  it('returns registry integration name/icon when known', () => {
    const reg = registry({ integrations: [{ id: 'strava', name: 'Strava', icon: '🟧' }] });
    expect(getMissingConnectionInfo('strava', reg)).toEqual({ name: 'Strava', icon: '🟧' });
  });

  it('falls back to a default icon when icon is missing', () => {
    const reg = registry({ integrations: [{ id: 'hevy', name: 'Hevy' }] });
    expect(getMissingConnectionInfo('hevy', reg)).toEqual({ name: 'Hevy', icon: '🔗' });
  });

  it('capitalises the id as a fallback for unknown connections', () => {
    const reg = registry({ integrations: [] });
    expect(getMissingConnectionInfo('garmin', reg)).toEqual({ name: 'Garmin', icon: '🔗' });
  });
});
