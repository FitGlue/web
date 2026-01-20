import { PluginManifest } from '../types/plugin';

/**
 * Build a destination URL from registry templates.
 * Uses the externalUrlTemplate from the registry, replacing {id} with the external ID.
 *
 * @param destinations - Array of destination manifests from usePluginRegistry()
 * @param destinationId - The destination key (e.g., 'strava', 'hevy', 'showcase')
 * @param externalId - The external activity ID for that destination
 * @returns The full URL to the external activity, or null if template not found
 */
export function buildDestinationUrl(
  destinations: PluginManifest[],
  destinationId: string,
  externalId: string
): string | null {
  if (!destinationId || !externalId) return null;

  const dest = destinations.find(d => d.id === destinationId.toLowerCase());
  if (!dest?.externalUrlTemplate) return null;

  return dest.externalUrlTemplate.replace('{id}', externalId);
}

/**
 * Get a map of destination IDs to their external URLs for an activity.
 *
 * @param destinations - Array of destination manifests from usePluginRegistry()
 * @param activityDestinations - Map of destination ID -> external ID from the activity
 * @returns Map of destination ID -> full external URL
 */
export function getDestinationUrls(
  destinations: PluginManifest[],
  activityDestinations: Record<string, string> | undefined
): Record<string, string> {
  if (!activityDestinations) return {};

  const urls: Record<string, string> = {};
  for (const [destId, externalId] of Object.entries(activityDestinations)) {
    const url = buildDestinationUrl(destinations, destId, externalId);
    if (url) {
      urls[destId] = url;
    }
  }
  return urls;
}
