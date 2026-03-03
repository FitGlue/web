/**
 * Named enum types extracted from the generated OpenAPI schema.
 *
 * These are derived from the schema so they auto-update when the schema regenerates.
 * Use these instead of raw `string` or `number` for enum-typed fields.
 */
import { components } from './schema-client';

/** Pipeline destination types (e.g., "DESTINATION_SHOWCASE", "DESTINATION_STRAVA") */
export type DestinationType = NonNullable<components["schemas"]["PipelineConfig"]["destinations"]>[number];

/** Enricher provider types (e.g., "ENRICHER_PROVIDER_WORKOUT_SUMMARY") */
export type EnricherProviderType = NonNullable<components["schemas"]["EnricherConfig"]["providerType"]>;

/** Config field types (e.g., "CONFIG_FIELD_TYPE_STRING", "CONFIG_FIELD_TYPE_SELECT") */
export type ConfigFieldType = NonNullable<components["schemas"]["ConfigFieldSchema"]["fieldType"]>;

/** Integration auth types (e.g., "INTEGRATION_AUTH_TYPE_OAUTH", "INTEGRATION_AUTH_TYPE_API_KEY") */
export type IntegrationAuthType = NonNullable<components["schemas"]["IntegrationManifest"]["authType"]>;

/** User tier levels (e.g., "USER_TIER_HOBBYIST", "USER_TIER_ATHLETE") */
export type UserTier = NonNullable<components["schemas"]["UserProfile"]["tier"]>;

/** Destination delivery status (e.g., "DESTINATION_STATUS_SUCCESS") */
export type DestinationStatus = NonNullable<components["schemas"]["DestinationOutcome"]["status"]>;
