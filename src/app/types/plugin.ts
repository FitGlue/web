/**
 * Plugin Registry Types
 * Mirrors the Protobuf-generated types from the server
 */

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
}

export interface ConfigFieldOption {
  value: string;
  label: string;
}

export interface ConfigFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
}

export interface ConfigFieldSchema {
  key: string;
  label: string;
  description: string;
  fieldType: ConfigFieldType;
  required: boolean;
  defaultValue: string;
  options: ConfigFieldOption[];
  validation?: ConfigFieldValidation;
}

export interface PluginManifest {
  id: string;
  type: PluginType;
  name: string;
  description: string;
  icon: string;
  configSchema: ConfigFieldSchema[];
  requiredIntegrations: string[];
  enabled: boolean;
  enricherProviderType?: number;
  destinationType?: number;
}

export enum IntegrationAuthType {
  UNSPECIFIED = 0,
  OAUTH = 1,
  API_KEY = 2,
}

export interface IntegrationManifest {
  id: string;
  name: string;
  description: string;
  icon: string;
  authType: IntegrationAuthType;
  enabled: boolean;
  docsUrl?: string;
  // Setup configuration
  setupTitle?: string;
  setupInstructions?: string;
  apiKeyLabel?: string;
  apiKeyHelpUrl?: string;
}

export interface PluginRegistryResponse {
  sources: PluginManifest[];
  enrichers: PluginManifest[];
  destinations: PluginManifest[];
  integrations: IntegrationManifest[];
}
