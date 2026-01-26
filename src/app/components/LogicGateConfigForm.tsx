import React, { useState, useEffect, useCallback } from 'react';
import { Stack } from './library/layout/Stack';
import { Heading } from './library/ui/Heading';
import { Text } from './library/ui/Text';
import { Paragraph } from './library/ui/Paragraph';
import { Button } from './library/ui/Button';
import { Select } from './library/forms/Select';
import { Input } from './library/forms/Input';
import { Checkbox } from './library/forms/Checkbox';
import { FormField } from './library/forms/FormField';
import { Card } from './library/ui/Card';

interface Rule {
  field: string;
  op: string;
  values: string[];
  negate: boolean;
}

interface LogicGateConfig {
  rules: Rule[];
  match_mode: string;
  on_match: string;
  on_no_match: string;
}

interface Props {
  initialValues?: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

// Field definitions with their supported operators and value types
const FIELD_DEFINITIONS: Record<string, { label: string; icon: string; operators: { value: string; label: string }[]; valueType: 'text' | 'select' | 'time' | 'days' | 'location'; options?: { value: string; label: string }[] }> = {
  activity_type: {
    label: 'Activity Type',
    icon: '🏃',
    operators: [{ value: 'eq', label: 'equals' }],
    valueType: 'select',
    options: [
      { value: 'Run', label: 'Run' },
      { value: 'Ride', label: 'Ride' },
      { value: 'WeightTraining', label: 'Weight Training' },
      { value: 'Walk', label: 'Walk' },
      { value: 'Hike', label: 'Hike' },
      { value: 'Swim', label: 'Swim' },
      { value: 'Yoga', label: 'Yoga' },
      { value: 'Workout', label: 'Workout' },
      { value: 'VirtualRide', label: 'Virtual Ride' },
      { value: 'VirtualRun', label: 'Virtual Run' },
    ],
  },
  days: {
    label: 'Day of Week',
    icon: '📅',
    operators: [{ value: 'in', label: 'is one of' }],
    valueType: 'days',
  },
  time_start: {
    label: 'Start Time',
    icon: '⏰',
    operators: [
      { value: 'gt', label: 'after' },
      { value: 'lt', label: 'before' },
      { value: 'eq', label: 'at' },
    ],
    valueType: 'time',
  },
  time_end: {
    label: 'End Time',
    icon: '⏱️',
    operators: [
      { value: 'gt', label: 'after' },
      { value: 'lt', label: 'before' },
      { value: 'eq', label: 'at' },
    ],
    valueType: 'time',
  },
  title_contains: {
    label: 'Title Contains',
    icon: '📝',
    operators: [{ value: 'contains', label: 'contains' }],
    valueType: 'text',
  },
  description_contains: {
    label: 'Description Contains',
    icon: '📋',
    operators: [{ value: 'contains', label: 'contains' }],
    valueType: 'text',
  },
  location: {
    label: 'Location',
    icon: '📍',
    operators: [{ value: 'near', label: 'within radius of' }],
    valueType: 'location',
  },
};

const DAYS = [
  { value: 'Mon', label: 'Mon' },
  { value: 'Tue', label: 'Tue' },
  { value: 'Wed', label: 'Wed' },
  { value: 'Thu', label: 'Thu' },
  { value: 'Fri', label: 'Fri' },
  { value: 'Sat', label: 'Sat' },
  { value: 'Sun', label: 'Sun' },
];

export const LogicGateConfigForm: React.FC<Props> = ({ initialValues = {}, onChange }) => {
  const [config, setConfig] = useState<LogicGateConfig>(() => {
    try {
      const rulesJson = initialValues.rules || '[]';
      const rules = JSON.parse(rulesJson);
      return {
        rules: rules.length > 0 ? rules : [{ field: 'activity_type', op: 'eq', values: [], negate: false }],
        match_mode: initialValues.match_mode || 'all',
        on_match: initialValues.on_match || 'continue',
        on_no_match: initialValues.on_no_match || 'continue',
      };
    } catch {
      return {
        rules: [{ field: 'activity_type', op: 'eq', values: [], negate: false }],
        match_mode: 'all',
        on_match: 'continue',
        on_no_match: 'continue',
      };
    }
  });

  const emitChange = useCallback((newConfig: LogicGateConfig) => {
    onChange({
      rules: JSON.stringify(newConfig.rules),
      match_mode: newConfig.match_mode,
      on_match: newConfig.on_match,
      on_no_match: newConfig.on_no_match,
    });
  }, [onChange]);

  useEffect(() => {
    emitChange(config);
  }, [config, emitChange]);

  const updateRule = (index: number, updates: Partial<Rule>) => {
    setConfig(prev => {
      const newRules = [...prev.rules];
      newRules[index] = { ...newRules[index], ...updates };
      // Reset operator and values when field changes
      if (updates.field && updates.field !== prev.rules[index].field) {
        const fieldDef = FIELD_DEFINITIONS[updates.field];
        newRules[index].op = fieldDef?.operators[0]?.value || 'eq';
        newRules[index].values = [];
      }
      return { ...prev, rules: newRules };
    });
  };

  const addRule = () => {
    setConfig(prev => ({
      ...prev,
      rules: [...prev.rules, { field: 'activity_type', op: 'eq', values: [], negate: false }],
    }));
  };

  const removeRule = (index: number) => {
    if (config.rules.length > 1) {
      setConfig(prev => ({
        ...prev,
        rules: prev.rules.filter((_, i) => i !== index),
      }));
    }
  };

  const renderValueInput = (rule: Rule, index: number) => {
    const fieldDef = FIELD_DEFINITIONS[rule.field];
    if (!fieldDef) return null;

    switch (fieldDef.valueType) {
      case 'select':
        return (
          <Select
            value={rule.values[0] || ''}
            onChange={e => updateRule(index, { values: [e.target.value] })}
            options={fieldDef.options || []}
            placeholder="Select..."
          />
        );

      case 'days':
        return (
          <Stack direction="horizontal" gap="xs" wrap>
            {DAYS.map(day => (
              <Button
                key={day.value}
                type="button"
                variant={rule.values.includes(day.value) ? 'primary' : 'secondary'}
                size="small"
                onClick={() => {
                  const newValues = rule.values.includes(day.value)
                    ? rule.values.filter(v => v !== day.value)
                    : [...rule.values, day.value];
                  updateRule(index, { values: newValues });
                }}
              >
                {day.label}
              </Button>
            ))}
          </Stack>
        );

      case 'time':
        return (
          <Input
            type="time"
            value={rule.values[0] || ''}
            onChange={e => updateRule(index, { values: [e.target.value] })}
          />
        );

      case 'location':
        return (
          <Stack direction="horizontal" gap="sm">
            <Input
              type="text"
              placeholder="Latitude"
              value={rule.values[0] || ''}
              onChange={e => updateRule(index, { values: [e.target.value, rule.values[1] || '', rule.values[2] || '500'] })}
              fullWidth={false}
            />
            <Input
              type="text"
              placeholder="Longitude"
              value={rule.values[1] || ''}
              onChange={e => updateRule(index, { values: [rule.values[0] || '', e.target.value, rule.values[2] || '500'] })}
              fullWidth={false}
            />
            <Input
              type="number"
              placeholder="Radius (m)"
              value={rule.values[2] || '500'}
              onChange={e => updateRule(index, { values: [rule.values[0] || '', rule.values[1] || '', e.target.value] })}
              fullWidth={false}
            />
          </Stack>
        );

      default:
        return (
          <Input
            type="text"
            value={rule.values[0] || ''}
            onChange={e => updateRule(index, { values: [e.target.value] })}
            placeholder="Enter value..."
          />
        );
    }
  };

  const getRuleDescription = (rule: Rule): string => {
    const fieldDef = FIELD_DEFINITIONS[rule.field];
    if (!fieldDef) return '';
    const opLabel = fieldDef.operators.find(o => o.value === rule.op)?.label || rule.op;
    const valueStr = rule.values.length > 0 ? rule.values.join(', ') : '?';
    const prefix = rule.negate ? 'NOT ' : '';
    return `${prefix}${fieldDef.label} ${opLabel} ${valueStr}`;
  };

  const matchModeOptions = [
    { value: 'all', label: 'All', icon: '∧', description: 'All rules must match' },
    { value: 'any', label: 'Any', icon: '∨', description: 'Any rule matches' },
    { value: 'none', label: 'None', icon: '¬', description: 'No rules match' },
  ];

  const actionOptions = [
    { value: 'continue', label: '✅ Continue pipeline' },
    { value: 'halt', label: '🛑 Halt pipeline' },
  ];

  return (
    <Stack gap="lg">
      {/* Match Mode Section */}
      <Stack gap="sm">
        <Heading level={4}>Match Mode</Heading>
        <Stack direction="horizontal" gap="sm" wrap>
          {matchModeOptions.map(mode => (
            <Card
              key={mode.value}
              onClick={() => setConfig(prev => ({ ...prev, match_mode: mode.value }))}
              variant={config.match_mode === mode.value ? 'elevated' : 'default'}
            >
              <Stack direction="horizontal" gap="sm" align="center">
                <Text>{mode.icon}</Text>
                <Stack gap="none">
                  <Text>{mode.label}</Text>
                  <Text variant="small">{mode.description}</Text>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>

      {/* Rules Section */}
      <Stack gap="sm">
        <Heading level={4}>Rules</Heading>
        <Stack gap="md">
          {config.rules.map((rule, index) => (
            <Card key={index} variant={rule.negate ? 'elevated' : 'default'}>
              <Stack gap="sm">
                <Stack direction="horizontal" gap="sm" align="center" justify="between">
                  <Text>#{index + 1}</Text>
                  <Stack direction="horizontal" gap="sm" align="center">
                    <Checkbox
                      checked={rule.negate}
                      onChange={e => updateRule(index, { negate: e.target.checked })}
                      label="NOT"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="small"
                      onClick={() => removeRule(index)}
                      disabled={config.rules.length <= 1}
                      title="Remove rule"
                    >
                      ×
                    </Button>
                  </Stack>
                </Stack>

                <Stack gap="sm">
                  <Stack direction="horizontal" gap="sm">
                    <Select
                      value={rule.field}
                      onChange={e => updateRule(index, { field: e.target.value })}
                      options={Object.entries(FIELD_DEFINITIONS).map(([key, def]) => ({
                        value: key,
                        label: `${def.icon} ${def.label}`,
                      }))}
                    />
                    <Select
                      value={rule.op}
                      onChange={e => updateRule(index, { op: e.target.value })}
                      options={FIELD_DEFINITIONS[rule.field]?.operators.map(op => ({
                        value: op.value,
                        label: op.label,
                      })) || []}
                    />
                  </Stack>
                  {renderValueInput(rule, index)}
                </Stack>

                <Text variant="muted">{getRuleDescription(rule)}</Text>
              </Stack>
            </Card>
          ))}
        </Stack>
        <Button type="button" variant="secondary" onClick={addRule}>
          + Add Rule
        </Button>
      </Stack>

      {/* Actions Section */}
      <Stack gap="sm">
        <Heading level={4}>Actions</Heading>
        <Stack direction="horizontal" gap="md">
          <FormField label="On Match">
            <Select
              value={config.on_match}
              onChange={e => setConfig(prev => ({ ...prev, on_match: e.target.value }))}
              options={actionOptions}
            />
          </FormField>
          <FormField label="On No Match">
            <Select
              value={config.on_no_match}
              onChange={e => setConfig(prev => ({ ...prev, on_no_match: e.target.value }))}
              options={actionOptions}
            />
          </FormField>
        </Stack>
        <Paragraph>
          If <strong>{config.match_mode}</strong> rules match → <strong>{config.on_match}</strong>; otherwise → <strong>{config.on_no_match}</strong>
        </Paragraph>
      </Stack>
    </Stack>
  );
};

export default LogicGateConfigForm;
