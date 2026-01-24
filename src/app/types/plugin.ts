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
// PluginManifest now has all fields in OpenAPI spec
export type PluginManifest = components['schemas']['PluginManifest'];
export type IntegrationManifest = components['schemas']['IntegrationManifest'];
export type PluginRegistryResponse = components['schemas']['PluginRegistryResponse'];

// Enums are not generated from OpenAPI, so define them here
// These match the protobuf definitions in the server
import {
  PluginType,
  ConfigFieldType,
  IntegrationAuthType,
} from '../../types/pb/plugin';

export { PluginType, ConfigFieldType, IntegrationAuthType };

