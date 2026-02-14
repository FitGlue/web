import React, { useState, useEffect } from 'react';
import { ConfigFieldSchema, ConfigFieldType } from '../types/plugin';
import { useApi } from '../hooks/useApi';
import { Stack } from './library/layout/Stack';
import { Text } from './library/ui/Text';
import { Paragraph } from './library/ui/Paragraph';
import { Button } from './library/ui/Button';
import { Select } from './library/forms/Select';
import { Input } from './library/forms/Input';
import { Checkbox } from './library/forms/Checkbox';
import { FormField } from './library/forms/FormField';

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

/**
 * Sub-component for editing key-value maps (Record<string, string>)
 * Supports optional dropdown for values via valueOptions prop
 */
interface KeyValueMapEditorProps {
  value: string;
  onChange: (value: string) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  keyOptions?: { value: string; label: string }[];
  valueOptions?: { value: string; label: string }[];
  /** Fetch value-side options from this dynamic API source (e.g. 'counters') */
  valueDynamicSource?: string;
}

const CREATE_NEW_SENTINEL = '__create_new__';

const KeyValueMapEditor: React.FC<KeyValueMapEditorProps> = ({
  value,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  keyOptions,
  valueOptions,
  valueDynamicSource,
}) => {
  const api = useApi();
  const [entries, setEntries] = useState<{ key: string; value: string }[]>(() => {
    try {
      const parsed = JSON.parse(value || '{}');
      return Object.entries(parsed).map(([k, v]) => ({ key: k, value: v as string }));
    } catch {
      return [{ key: '', value: '' }];
    }
  });

  // Per-row mode: 'select' or 'custom' (only used when dynamicOptions are available)
  const [rowModes, setRowModes] = useState<Record<number, 'select' | 'custom'>>({});

  // Dynamic options fetched from API
  const [dynamicOptions, setDynamicOptions] = useState<{ value: string; label: string }[] | null>(null);

  useEffect(() => {
    if (!valueDynamicSource) return;
    const fetchOptions = async () => {
      try {
        const response = await api.get(`/users/me/${valueDynamicSource}`) as { id: string; count?: number }[];
        const fetched = response.map((item: { id: string; count?: number }) => ({
          value: item.id,
          label: item.count !== undefined ? `${item.id} (current: ${item.count})` : item.id,
        }));
        setDynamicOptions(fetched);

        // Set initial row modes: if a row's value isn't in the fetched options, it's custom
        setRowModes(prev => {
          const next: Record<number, 'select' | 'custom'> = { ...prev };
          entries.forEach((entry, i) => {
            if (!(i in next)) {
              next[i] = entry.value && !fetched.some(o => o.value === entry.value) ? 'custom' : 'select';
            }
          });
          return next;
        });
      } catch {
        console.warn('Failed to fetch dynamic options for', valueDynamicSource);
        setDynamicOptions([]);
      }
    };
    fetchOptions();
  }, [api, valueDynamicSource]); // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveValueOptions = dynamicOptions ?? valueOptions ?? null;

  const updateEntries = (newEntries: { key: string; value: string }[]) => {
    setEntries(newEntries);
    const obj: Record<string, string> = {};
    newEntries.forEach(e => {
      if (e.key.trim()) {
        obj[e.key.trim()] = e.value;
      }
    });
    onChange(JSON.stringify(obj));
  };

  const handleEntryChange = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...entries];
    updated[index][field] = newValue;
    updateEntries(updated);
  };

  const handleValueSelectChange = (index: number, selectedValue: string) => {
    if (selectedValue === CREATE_NEW_SENTINEL) {
      // Switch this row to custom input, clear the value
      setRowModes(prev => ({ ...prev, [index]: 'custom' }));
      handleEntryChange(index, 'value', '');
    } else {
      handleEntryChange(index, 'value', selectedValue);
    }
  };

  const switchToSelect = (index: number) => {
    setRowModes(prev => ({ ...prev, [index]: 'select' }));
    handleEntryChange(index, 'value', '');
  };

  const addEntry = () => {
    const newIndex = entries.length;
    setRowModes(prev => ({ ...prev, [newIndex]: 'select' }));
    updateEntries([...entries, { key: '', value: '' }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      updateEntries(entries.filter((_, i) => i !== index));
      // Rebuild row modes to match new indices
      setRowModes(prev => {
        const next: Record<number, 'select' | 'custom'> = {};
        let newIdx = 0;
        for (let i = 0; i < entries.length; i++) {
          if (i !== index) {
            next[newIdx] = prev[i] || 'select';
            newIdx++;
          }
        }
        return next;
      });
    }
  };

  const renderValueCell = (entry: { key: string; value: string }, i: number) => {
    const mode = rowModes[i] || 'select';

    // If we have effective value options (static or dynamic), render select/custom toggle
    if (effectiveValueOptions) {
      if (mode === 'custom') {
        return (
          <Stack direction="horizontal" gap="xs" align="center" style={{ flex: 1 }}>
            <Input
              type="text"
              value={entry.value}
              onChange={e => handleEntryChange(i, 'value', e.target.value)}
              placeholder="New counter name"
            />
            {effectiveValueOptions.length > 0 && (
              <Button type="button" variant="secondary" size="small" onClick={() => switchToSelect(i)} title="Select existing">
                ↩
              </Button>
            )}
          </Stack>
        );
      }

      // Select mode
      const selectOptions = [
        { value: CREATE_NEW_SENTINEL, label: '➕ Create new...' },
        ...effectiveValueOptions.map(opt => ({ value: opt.value, label: opt.label })),
      ];

      return (
        <Select
          value={entry.value}
          onChange={e => handleValueSelectChange(i, e.target.value)}
          options={selectOptions}
          placeholder="Select counter..."
        />
      );
    }

    // No options — just free text
    return (
      <Input
        type="text"
        value={entry.value}
        onChange={e => handleEntryChange(i, 'value', e.target.value)}
        placeholder={valuePlaceholder}
      />
    );
  };

  return (
    <Stack gap="sm">
      {entries.map((entry, i) => (
        <Stack key={i} direction="horizontal" gap="sm" align="center">
          {keyOptions ? (
            <Select
              value={entry.key}
              onChange={e => handleEntryChange(i, 'key', e.target.value)}
              options={keyOptions.map(opt => ({
                value: opt.value,
                label: opt.label,
              }))}
              placeholder="Select..."
            />
          ) : (
            <Input
              type="text"
              value={entry.key}
              onChange={e => handleEntryChange(i, 'key', e.target.value)}
              placeholder={keyPlaceholder}
            />
          )}
          <Text>→</Text>
          {renderValueCell(entry, i)}
          <Button type="button" variant="danger" size="small" onClick={() => removeEntry(i)} title="Remove">
            ×
          </Button>
        </Stack>
      ))}
      <Button type="button" variant="secondary" onClick={addEntry}>
        + Add Rule
      </Button>
    </Stack>
  );
};

/**
 * DynamicSelectField - A combo-box that fetches options from a dynamic API endpoint
 * and allows the user to either select an existing option or type a new value
 */
interface DynamicSelectFieldProps {
  field: ConfigFieldSchema;
  value: string;
  onChange: (value: string) => void;
}

const DynamicSelectField: React.FC<DynamicSelectFieldProps> = ({ field, value, onChange }) => {
  const api = useApi();
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'select' | 'custom'>('select');

  useEffect(() => {
    const fetchOptions = async () => {
      if (!field.dynamicSource) {
        setLoading(false);
        return;
      }

      try {
        // Fetch options from /users/me/{dynamicSource}
        const response = await api.get(`/users/me/${field.dynamicSource}`) as { id: string; count?: number }[];
        const fetchedOptions = response.map((item: { id: string; count?: number }) => ({
          value: item.id,
          label: item.count !== undefined ? `${item.id} (current: ${item.count})` : item.id,
        }));
        setOptions(fetchedOptions);

        // If current value is not in options and not empty, switch to custom mode
        if (value && !fetchedOptions.some((opt: { value: string }) => opt.value === value)) {
          setMode('custom');
        }
      } catch {
        // If fetching fails, just allow custom input
        console.warn('Failed to fetch dynamic options for', field.dynamicSource);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [api, field.dynamicSource, value]);

  // Check if current value is in options
  useEffect(() => {
    if (!loading && value && !options.some(opt => opt.value === value)) {
      setMode('custom');
    }
  }, [loading, value, options]);

  if (loading) {
    return <Text variant="muted">Loading options...</Text>;
  }

  return (
    <Stack gap="sm">
      <Stack direction="horizontal" gap="xs">
        <Button
          type="button"
          variant={mode === 'select' ? 'primary' : 'secondary'}
          size="small"
          onClick={() => { setMode('select'); onChange(''); }}
        >
          Select Existing
        </Button>
        <Button
          type="button"
          variant={mode === 'custom' ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setMode('custom')}
        >
          Create New
        </Button>
      </Stack>

      {mode === 'select' ? (
        <Select
          id={field.key}
          value={value}
          onChange={e => onChange(e.target.value)}
          options={options}
          placeholder="Select..."
        />
      ) : (
        <Input
          type="text"
          id={field.key}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter new counter key"
        />
      )}
    </Stack>
  );
};

export default EnricherConfigForm;

// Alias for use with source/destination config forms — same schema-driven component
export const PluginConfigForm = EnricherConfigForm;
