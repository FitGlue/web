import { PluginManifest } from '../types/plugin';

/**
 * Build a destination URL from registry templates.
 * Uses the externalUrlTemplate from the registry, replacing placeholders:
 * - {id} is replaced with the external ID
 * - {row_number} is replaced with the external ID (alias for numeric destinations like Google Sheets)
 * - Any {key} matching a configValues entry is replaced with that value
 *
 * @param destinations - Array of destination manifests from usePluginRegistry()
 * @param destinationId - The destination key (e.g., 'strava', 'hevy', 'showcase')
 * @param externalId - The external activity ID for that destination
 * @param configValues - Optional config values from pipeline destination config (e.g., { spreadsheet_id: '...' })
 * @returns The full URL to the external activity, or null if template not found
 */
export function buildDestinationUrl(
  destinations: PluginManifest[],
  destinationId: string,
  externalId: string,
  configValues?: Record<string, string>
): string | null {
  if (!destinationId || !externalId) return null;

  const dest = destinations.find(d => d.id === destinationId.toLowerCase());
  if (!dest?.externalUrlTemplate) return null;

  let url = dest.externalUrlTemplate;

  // Replace {id} and {row_number} with the external ID
  url = url.replace('{id}', externalId);
  url = url.replace('{row_number}', externalId);

  // Replace any config-based placeholders (e.g., {spreadsheet_id}, {repo}, {file_path})
  if (configValues) {
    for (const [key, value] of Object.entries(configValues)) {
      url = url.replace(`{${key}}`, value);
    }
  }

  return url;
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
