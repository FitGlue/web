/**
 * Pipeline Export/Import Utilities
 *
 * Client-side utilities for encoding, decoding, and validating shareable pipeline configurations.
 * Uses base64 encoding for compact, shareable strings.
 */

import type { components } from './api/schema';

type PipelineConfig = components['schemas']['PipelineConfig'];
type EnricherConfig = components['schemas']['EnricherConfig'];
type PluginRegistryResponse = components['schemas']['PluginRegistryResponse'];
type PluginManifest = components['schemas']['PluginManifest'];
type IntegrationsSummary = components['schemas']['IntegrationsSummary'];

/**
 * Portable pipeline format with shortened keys for compact encoding.
 * Version field ensures forward compatibility.
 */
export interface PortablePipeline {
  /** Format version */
  v: 1;
  /** Pipeline name */
  n: string;
  /** Source ID (e.g., "hevy", "fitbit") */
  s: string;
  /** Enrichers array */
  e: Array<{ p: number; c?: Record<string, string> }>;
  /** Destination IDs */
  d: string[];
}

export interface ImportValidationResult {
  valid: boolean;
  missingConnections: string[];
  /** Ready-to-save request if valid */
  request?: Omit<PipelineConfig, 'id'>;
}

/**
 * Encode a string to base64, handling Unicode characters.
 * Uses UTF-8 encoding via encodeURIComponent to support emojis and special chars.
 */
function utf8ToBase64(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  ));
}

/**
 * Decode a base64 string to UTF-8, handling Unicode characters.
 */
function base64ToUtf8(str: string): string {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Encode a pipeline to a shareable base64 string.
 * Strips internal IDs and uses shortened keys for compact output.
 */
export function encodePipeline(pipeline: PipelineConfig): string {
  const portable: PortablePipeline = {
    v: 1,
    n: pipeline.name || 'Unnamed Pipeline',
    s: pipeline.source,
    e: (pipeline.enrichers || []).map((e) => ({
      p: e.providerType,
      c: e.inputs && Object.keys(e.inputs).length > 0 ? e.inputs : undefined,
    })),
    d: pipeline.destinations,
  };
  return utf8ToBase64(JSON.stringify(portable));
}

/**
 * Decode a base64-encoded pipeline string.
 * @throws Error if the string is invalid or unsupported version.
 */
export function decodePipeline(encoded: string): PortablePipeline {
  try {
    const json = base64ToUtf8(encoded.trim());
    const parsed = JSON.parse(json);

    if (parsed.v !== 1) {
      throw new Error(`Unsupported pipeline version: ${parsed.v}`);
    }

    if (!parsed.s || !Array.isArray(parsed.d) || parsed.d.length === 0) {
      throw new Error('Invalid pipeline format: missing source or destinations');
    }

    return parsed as PortablePipeline;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Invalid pipeline code: failed to parse');
    }
    throw err;
  }
}

/**
 * Get list of connected integration IDs from user's integration summary.
 */
function getConnectedIntegrationIds(integrations: IntegrationsSummary | null): string[] {
  if (!integrations) return [];

  return Object.entries(integrations)
    .filter(([, status]) => status?.connected)
    .map(([id]) => id);
}

/**
 * Validate a portable pipeline against the user's connections.
 * Returns missing connections if validation fails, or a ready-to-save request if valid.
 */
export function validatePipelineImport(
  portable: PortablePipeline,
  userIntegrations: IntegrationsSummary | null,
  registry: PluginRegistryResponse
): ImportValidationResult {
  const connectedIds = getConnectedIntegrationIds(userIntegrations);
  const missingConnections: string[] = [];

  /**
   * Helper to collect missing integrations from a plugin's requiredIntegrations.
   */
  const checkPlugin = (plugin: PluginManifest | undefined) => {
    if (!plugin?.requiredIntegrations) return;
    for (const req of plugin.requiredIntegrations) {
      if (!connectedIds.includes(req) && !missingConnections.includes(req)) {
        missingConnections.push(req);
      }
    }
  };

  // Check source
  const sourcePlugin = registry.sources.find((s) => s.id === portable.s);
  checkPlugin(sourcePlugin);

  // Check enrichers
  for (const enricher of portable.e) {
    const enricherPlugin = registry.enrichers.find(
      (en) => en.enricherProviderType === enricher.p
    );
    checkPlugin(enricherPlugin);
  }

  // Check destinations
  for (const destId of portable.d) {
    const destPlugin = registry.destinations.find((d) => d.id === destId);
    checkPlugin(destPlugin);
  }

  if (missingConnections.length > 0) {
    return { valid: false, missingConnections };
  }

  // Build the create request with "(Imported)" suffix
  const enrichers: EnricherConfig[] = portable.e.map((e) => ({
    providerType: e.p,
    inputs: e.c || {},
  }));

  return {
    valid: true,
    missingConnections: [],
    request: {
      name: `${portable.n} (Imported)`,
      source: portable.s,
      enrichers,
      destinations: portable.d,
    },
  };
}

/**
 * Get display info for a missing connection from the registry.
 */
export function getMissingConnectionInfo(
  connectionId: string,
  registry: PluginRegistryResponse
): { name: string; icon: string } | null {
  const integration = registry.integrations.find((i) => i.id === connectionId);
  if (integration) {
    return { name: integration.name, icon: integration.icon || '🔗' };
  }
  // Fallback: capitalize the ID
  return {
    name: connectionId.charAt(0).toUpperCase() + connectionId.slice(1),
    icon: '🔗',
  };
}
