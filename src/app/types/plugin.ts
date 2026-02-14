/**
 * Plugin Registry Types
 * Re-exports types from generated OpenAPI schema
 */

import { components } from '../../shared/api/schema';

// Re-export types from generated schema
export type ConfigFieldOption = components['schemas']['ConfigFieldOption'];
export type ConfigFieldValidation = components['schemas']['ConfigFieldValidation'];
export type ConfigFieldDependency = components['schemas']['ConfigFieldDependency'];
export type ConfigFieldSchema = components['schemas']['ConfigFieldSchema'];
export type Transformation = components['schemas']['Transformation'];
// PluginManifest now has all fields in OpenAPI spec
export type PluginManifest = components['schemas']['PluginManifest'];

// Action that can be triggered for an integration (not in OpenAPI spec yet)
export interface IntegrationAction {
  id: string;
  label: string;
  description: string;
  icon: string;
}

// Extended IntegrationManifest to include actions (exists in server but not yet in OpenAPI spec)
export type IntegrationManifest = components['schemas']['IntegrationManifest'] & {
  actions?: IntegrationAction[];
};

export type PluginRegistryResponse = Omit<components['schemas']['PluginRegistryResponse'], 'integrations'> & {
  integrations: IntegrationManifest[];
};

// Enums are not generated from OpenAPI, so define them here
// These match the protobuf definitions in the server
import {
  PluginType,
  ConfigFieldType,
  IntegrationAuthType,
} from '../../types/pb/plugin';

export { PluginType, ConfigFieldType, IntegrationAuthType };

