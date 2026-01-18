import React, { useState, useEffect } from 'react';
import { ConfigFieldSchema, ConfigFieldType } from '../types/plugin';
import { useApi } from '../hooks/useApi';
import './EnricherConfigForm.css';

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
          <input
            type="text"
            id={field.key}
            value={value}
            onChange={e => handleChange(field.key, e.target.value)}
            placeholder={field.description}
            className="config-input"
          />
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_NUMBER:
        return (
          <input
            type="number"
            id={field.key}
            value={value}
            onChange={e => handleChange(field.key, e.target.value)}
            min={field.validation?.minValue}
            max={field.validation?.maxValue}
            className="config-input"
          />
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_BOOLEAN:
        return (
          <label className="config-toggle">
            <input
              type="checkbox"
              id={field.key}
              checked={value === 'true'}
              onChange={e => handleChange(field.key, e.target.checked ? 'true' : 'false')}
            />
            <span className="toggle-label">{value === 'true' ? 'Enabled' : 'Disabled'}</span>
          </label>
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_SELECT:
        return (
          <select
            id={field.key}
            value={value}
            onChange={e => handleChange(field.key, e.target.value)}
            className="config-select"
          >
            <option value="">Select...</option>
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_MULTI_SELECT:
        return (
          <div className="config-multi-select">
            {field.options.map(opt => {
              const selected = value.split(',').includes(opt.value);
              return (
                <label key={opt.value} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={e => {
                      const current = value ? value.split(',').filter(v => v) : [];
                      const updated = e.target.checked
                        ? [...current, opt.value]
                        : current.filter(v => v !== opt.value);
                      handleChange(field.key, updated.join(','));
                    }}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        );

      case ConfigFieldType.CONFIG_FIELD_TYPE_KEY_VALUE_MAP:
        return (
          <KeyValueMapEditor
            value={value}
            onChange={v => handleChange(field.key, v)}
            keyPlaceholder="Key"
            valuePlaceholder="Value"
            keyOptions={field.keyOptions?.length > 0 ? field.keyOptions : undefined}
            valueOptions={field.valueOptions?.length > 0 ? field.valueOptions : undefined}
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
          <input
            type="text"
            id={field.key}
            value={value}
            onChange={e => handleChange(field.key, e.target.value)}
            className="config-input"
          />
        );
    }
  };

  if (schema.length === 0) {
    return <p className="no-config">No configuration required</p>;
  }

  return (
    <div className="enricher-config-form">
      {schema.filter(isFieldVisible).map(field => (
        <div key={field.key} className="config-field">
          <label htmlFor={field.key} className="config-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          {renderField(field)}
          {field.description && <p className="config-description">{field.description}</p>}
        </div>
      ))}
    </div>
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
}

const KeyValueMapEditor: React.FC<KeyValueMapEditorProps> = ({
  value,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  keyOptions,
  valueOptions,
}) => {
  const [entries, setEntries] = useState<{ key: string; value: string }[]>(() => {
    try {
      const parsed = JSON.parse(value || '{}');
      return Object.entries(parsed).map(([k, v]) => ({ key: k, value: v as string }));
    } catch {
      return [{ key: '', value: '' }];
    }
  });

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

  const addEntry = () => {
    updateEntries([...entries, { key: '', value: '' }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      updateEntries(entries.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="key-value-editor">
      {entries.map((entry, i) => (
        <div key={i} className="key-value-row">
          {keyOptions ? (
            <select
              value={entry.key}
              onChange={e => handleEntryChange(i, 'key', e.target.value)}
              className="kv-key kv-select"
            >
              <option value="">Select...</option>
              {keyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={entry.key}
              onChange={e => handleEntryChange(i, 'key', e.target.value)}
              placeholder={keyPlaceholder}
              className="kv-key"
            />
          )}
          <span className="kv-arrow">→</span>
          {valueOptions ? (
            <select
              value={entry.value}
              onChange={e => handleEntryChange(i, 'value', e.target.value)}
              className="kv-value kv-select"
            >
              <option value="">Select...</option>
              {valueOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={entry.value}
              onChange={e => handleEntryChange(i, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className="kv-value"
            />
          )}
          <button type="button" onClick={() => removeEntry(i)} className="kv-remove" title="Remove">
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={addEntry} className="kv-add">
        + Add Rule
      </button>
    </div>
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
        const response = await api.get<{ id: string; count?: number }[]>(`/users/me/${field.dynamicSource}`);
        const fetchedOptions = response.map(item => ({
          value: item.id,
          label: item.count !== undefined ? `${item.id} (current: ${item.count})` : item.id,
        }));
        setOptions(fetchedOptions);

        // If current value is not in options and not empty, switch to custom mode
        if (value && !fetchedOptions.some(opt => opt.value === value)) {
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
    return <div className="config-input">Loading options...</div>;
  }

  return (
    <div className="dynamic-select-field">
      <div className="dynamic-select-header">
        <button
          type="button"
          className={`dynamic-select-tab ${mode === 'select' ? 'active' : ''}`}
          onClick={() => { setMode('select'); onChange(''); }}
        >
          Select Existing
        </button>
        <button
          type="button"
          className={`dynamic-select-tab ${mode === 'custom' ? 'active' : ''}`}
          onClick={() => setMode('custom')}
        >
          Create New
        </button>
      </div>

      {mode === 'select' ? (
        <select
          id={field.key}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="config-select"
        >
          <option value="">Select...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          id={field.key}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter new counter key"
          className="config-input"
        />
      )}
    </div>
  );
};

export default EnricherConfigForm;
