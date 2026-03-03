/**
 * Plugin Registry Types
 *
 * Proto3 makes all fields optional by default, but the registry guarantees
 * that manifests always have `id`, `name`, `icon`, etc. populated. We
 * mark those fields required here so downstream code doesn't need hundreds
 * of non-null assertions.
 */

import { components } from '../../shared/api/schema-client';

// --- Raw generated types (all fields optional per proto3) ---
type RawPluginManifest = components['schemas']['PluginManifest'];
type RawConfigFieldSchema = components['schemas']['ConfigFieldSchema'];
type RawConfigFieldOption = components['schemas']['ConfigFieldOption'];
type RawIntegrationManifest = components['schemas']['IntegrationManifest'];

// --- Re-export with required fields ---

/** Config field option — `value` and `label` are always populated. */
export type ConfigFieldOption = Required<Pick<RawConfigFieldOption, 'value' | 'label'>> & Omit<RawConfigFieldOption, 'value' | 'label'>;

export type ConfigFieldValidation = components['schemas']['ConfigFieldValidation'];
export type ConfigFieldDependency = components['schemas']['ConfigFieldDependency'];

/** Config field schema — `key` and `label` are always populated, `options` uses required-field ConfigFieldOption. */
export type ConfigFieldSchema = Required<Pick<RawConfigFieldSchema, 'key' | 'label'>>
  & Omit<RawConfigFieldSchema, 'key' | 'label' | 'options' | 'dependsOn'>
  & {
    options?: ConfigFieldOption[];
    dependsOn?: { fieldKey: string; values?: string[] };
  };

export type Transformation = components['schemas']['Transformation'];

/** Plugin manifest with core identity fields marked required and configSchema using ConfigFieldSchema. */
export type PluginManifest = Required<Pick<RawPluginManifest,
  'id' | 'name' | 'icon' | 'description' | 'enabled'
>> & Omit<RawPluginManifest, 'id' | 'name' | 'icon' | 'description' | 'enabled' | 'configSchema'> & {
  configSchema?: ConfigFieldSchema[];
};

// Action that can be triggered for an integration (not in OpenAPI spec yet)
export interface IntegrationAction {
  id: string;
  label: string;
  description: string;
  icon: string;
}

/** Integration manifest with core identity fields marked required. */
export type IntegrationManifest = Required<Pick<RawIntegrationManifest,
  'id' | 'name' | 'icon' | 'description'
>> & Omit<RawIntegrationManifest, 'id' | 'name' | 'icon' | 'description'> & {
  actions?: IntegrationAction[];
};

/** Registry response — override all arrays to use required-field manifest types. */
export type PluginRegistryResponse = Omit<
  components['schemas']['PluginRegistryResponse'],
  'sources' | 'enrichers' | 'destinations' | 'integrations'
> & {
  sources: PluginManifest[];
  enrichers: PluginManifest[];
  destinations: PluginManifest[];
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

