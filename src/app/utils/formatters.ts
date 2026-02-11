/**
 * Shared text formatting utilities for consistent string transformations
 * across the FitGlue web application.
 */

/**
 * Format snake_case field names to Title Case
 * Example: "heart_rate_zones" -> "Heart Rate Zones"
 */
export const formatFieldLabel = (field: string): string => {
  // Labels are now primarily driven by backend display config (display.field_labels).
  // This function serves as a fallback for fields without server-provided labels.
  return field
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

/**
 * Convert snake_case to Readable Text
 * Alias for formatFieldLabel for semantic clarity in trace contexts
 */
export const humanizeKey = formatFieldLabel;

/**
 * Humanize service names from kebab-case handler names
 * Example: "fitbit-handler" -> "Fitbit"
 * Example: "enricher" -> "Data Enrichment"
 */
export const humanizeServiceName = (service: string | undefined): string => {
  if (!service) return 'Unknown Service';
  if (service === 'enricher') return 'Data Enrichment';
  if (service === 'router') return 'Destination Router';

  return service
    .replace(/-handler$/, '')
    .replace(/-webhook$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Humanize enum values like "ENRICHER_PROVIDER_FITBIT_HEART_RATE" to "Fitbit Heart Rate"
 */
export const humanizeEnumValue = (value: string): string => {
  return value
    .replace(/^ENRICHER_PROVIDER_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format milliseconds to human-readable duration
 * Example: 150000 -> "2.5m"
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

/**
 * Format duration between two timestamps
 * Example: formatDurationFromRange("2024-01-01T00:00:00Z", "2024-01-01T00:01:30Z") -> "1.5m"
 */
export const formatDurationFromRange = (
  start: string | null | undefined,
  end: string | null | undefined
): string => {
  if (!start || !end) return '';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return formatDuration(ms);
};
