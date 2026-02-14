import React, { useState, useEffect } from 'react';
import { ConfigFieldSchema, ConfigFieldType } from '../types/plugin';
import { Stack } from './library/layout/Stack';
import { Paragraph } from './library/ui/Paragraph';
import { Select } from './library/forms/Select';
import { Input } from './library/forms/Input';
import { Checkbox } from './library/forms/Checkbox';
import { FormField } from './library/forms/FormField';
import { KeyValueMapEditor } from './KeyValueMapEditor';
import { DynamicSelectField } from './DynamicSelectField';

interface Props {
  schema: ConfigFieldSchema[];
  initialValues?: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

/**
 * Dynamic form component that renders config fields based on the plugin manifest schema
 */
export const EnricherConfigForm: React.FC<Props> = ({ schema, initialValues = {}, onChange }) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    // Initialize with defaults
    const initial: Record<string, string> = {};
    schema.forEach(field => {
      initial[field.key] = initialValues[field.key] || field.defaultValue || '';
    });
    return initial;
  });

  // Sync late-arriving initialValues (e.g. async plugin defaults) into form state.
  // Only update fields that still hold their schema default or are empty,
  // so we don't overwrite values the user has already edited.
  useEffect(() => {
    if (!initialValues || Object.keys(initialValues).length === 0) return;
    setValues(prev => {
      let changed = false;
      const next = { ...prev };
      schema.forEach(field => {
        const incoming = initialValues[field.key];
        if (!incoming) return;
        const current = prev[field.key] || '';
        const schemaDefault = field.defaultValue || '';
        // Only fill in if the field is still at its default/empty value
        if (current === '' || current === schemaDefault) {
          next[field.key] = incoming;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [initialValues, schema]);

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  // Check if a field should be visible based on its dependsOn property
  const isFieldVisible = (field: ConfigFieldSchema): boolean => {
    if (!field.dependsOn) return true;
    const dependentValue = values[field.dependsOn.fieldKey] || '';
    return field.dependsOn.values.includes(dependentValue);
  };

  const renderField = (field: ConfigFieldSchema) => {
    const value = values[field.key] || '';

    switch (field.fieldType) {
      case ConfigFieldType.CONFIG_FIELD_TYPE_STRING:
        return (
          <Input
            type="text"
            id={field.key}
            value={value}
            onChange={e => handleChange(field.key, e.target.value)}
            placeholder={field.description}
          />
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_NUMBER:
        return (
          <Input
            type="number"
            id={field.key}
            value={value}
            onChange={e => handleChange(field.key, e.target.value)}
            min={field.validation?.minValue}
            max={field.validation?.maxValue}
          />
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_BOOLEAN:
        return (
          <Checkbox
            id={field.key}
            checked={value === 'true'}
            onChange={e => handleChange(field.key, e.target.checked ? 'true' : 'false')}
            label={value === 'true' ? 'Enabled' : 'Disabled'}
          />
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_SELECT:
        return (
          <Select
            id={field.key}
            value={value}
            onChange={e => handleChange(field.key, e.target.value)}
            options={(field.options || []).map(opt => ({
              value: opt.value,
              label: opt.label,
            }))}
            placeholder="Select..."
          />
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_MULTI_SELECT:
        return (
          <Stack gap="xs">
            {(field.options || []).map(opt => {
              const selected = value.split(',').includes(opt.value);
              return (
                <Checkbox
                  key={opt.value}
                  checked={selected}
                  onChange={e => {
                    const current = value ? value.split(',').filter(v => v) : [];
                    const updated = e.target.checked
                      ? [...current, opt.value]
                      : current.filter(v => v !== opt.value);
                    handleChange(field.key, updated.join(','));
                  }}
                  label={opt.label}
                />
              );
            })}
          </Stack>
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_KEY_VALUE_MAP:
        return (
          <KeyValueMapEditor
            value={value}
            onChange={v => handleChange(field.key, v)}
            keyPlaceholder="Key"
            valuePlaceholder="Value"
            keyOptions={(field.keyOptions?.length ?? 0) > 0 ? field.keyOptions : undefined}
            valueOptions={(field.valueOptions?.length ?? 0) > 0 ? field.valueOptions : undefined}
            valueDynamicSource={field.valueDynamicSource}
          />
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_DYNAMIC_SELECT:
        return (
          <DynamicSelectField
            field={field}
            value={value}
            onChange={v => handleChange(field.key, v)}
          />
        );

      default:
        return (
          <Input
            type="text"
            id={field.key}
            value={value}
            onChange={e => handleChange(field.key, e.target.value)}
          />
        );
    }
  };

  if (schema.length === 0) {
    return <Paragraph>No configuration required</Paragraph>;
  }

  return (
    <Stack gap="md">
      {schema.filter(isFieldVisible).map(field => (
        <FormField
          key={field.key}
          label={field.label}
          required={field.required}
          hint={field.description}
          htmlFor={field.key}
        >
          {renderField(field)}
        </FormField>
      ))}
    </Stack>
  );
};

export default EnricherConfigForm;

// Alias for use with source/destination config forms — same schema-driven component
export const PluginConfigForm = EnricherConfigForm;
