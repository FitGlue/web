/**
 * Plugin Registry Types
 * Re-exports types from generated OpenAPI schema
 */

import { components } from '../../shared/api/schema';

// Re-export types from generated schema
export type ConfigFieldOption = components['schemas']['ConfigFieldOption'];
export type ConfigFieldValidation = components['schemas']['ConfigFieldValidation'];
export type ConfigFieldDependency = components['schemas']['ConfigFieldDependency'];
// Extended ConfigFieldSchema to include dynamicSource (exists in protobuf but not OpenAPI spec)
export type ConfigFieldSchema = components['schemas']['ConfigFieldSchema'] & { dynamicSource?: string };
export type Transformation = components['schemas']['Transformation'];
// Extended PluginManifest to include UX organization fields (exists in protobuf but not OpenAPI spec)
export type PluginManifest = components['schemas']['PluginManifest'] & {
  requiredTier?: string;
  category?: string;
  sortOrder?: number;
  isPremium?: boolean;
  popularityScore?: number;
  iconType?: string;
  iconPath?: string;
};
export type IntegrationManifest = components['schemas']['IntegrationManifest'];
export type PluginRegistryResponse = components['schemas']['PluginRegistryResponse'];

// Enums are not generated from OpenAPI, so define them here
// These match the protobuf definitions in the server
export enum PluginType {
  PLUGIN_TYPE_UNSPECIFIED = 0,
  PLUGIN_TYPE_SOURCE = 1,
  PLUGIN_TYPE_ENRICHER = 2,
  PLUGIN_TYPE_DESTINATION = 3,
}

export enum ConfigFieldType {
  CONFIG_FIELD_TYPE_UNSPECIFIED = 0,
  CONFIG_FIELD_TYPE_STRING = 1,
  CONFIG_FIELD_TYPE_NUMBER = 2,
  CONFIG_FIELD_TYPE_BOOLEAN = 3,
  CONFIG_FIELD_TYPE_SELECT = 4,
  CONFIG_FIELD_TYPE_MULTI_SELECT = 5,
  CONFIG_FIELD_TYPE_KEY_VALUE_MAP = 6,
  CONFIG_FIELD_TYPE_DYNAMIC_SELECT = 7,
}

export enum IntegrationAuthType {
  UNSPECIFIED = 0,
  OAUTH = 1,
  API_KEY = 2,
  APP_SYNC = 3,
  PUBLIC_ID = 4,
}
