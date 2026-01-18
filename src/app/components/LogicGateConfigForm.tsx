import React, { useState, useEffect, useCallback } from 'react';
import './LogicGateConfigForm.css';

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
          <select
            value={rule.values[0] || ''}
            onChange={e => updateRule(index, { values: [e.target.value] })}
            className="logic-gate-value-select"
          >
            <option value="">Select...</option>
            {fieldDef.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'days':
        return (
          <div className="logic-gate-days-picker">
            {DAYS.map(day => (
              <button
                key={day.value}
                type="button"
                className={`day-chip ${rule.values.includes(day.value) ? 'selected' : ''}`}
                onClick={() => {
                  const newValues = rule.values.includes(day.value)
                    ? rule.values.filter(v => v !== day.value)
                    : [...rule.values, day.value];
                  updateRule(index, { values: newValues });
                }}
              >
                {day.label}
              </button>
            ))}
          </div>
        );

      case 'time':
        return (
          <input
            type="time"
            value={rule.values[0] || ''}
            onChange={e => updateRule(index, { values: [e.target.value] })}
            className="logic-gate-time-input"
          />
        );

      case 'location':
        return (
          <div className="logic-gate-location-inputs">
            <input
              type="text"
              placeholder="Latitude"
              value={rule.values[0] || ''}
              onChange={e => updateRule(index, { values: [e.target.value, rule.values[1] || '', rule.values[2] || '500'] })}
              className="logic-gate-coord-input"
            />
            <input
              type="text"
              placeholder="Longitude"
              value={rule.values[1] || ''}
              onChange={e => updateRule(index, { values: [rule.values[0] || '', e.target.value, rule.values[2] || '500'] })}
              className="logic-gate-coord-input"
            />
            <input
              type="number"
              placeholder="Radius (m)"
              value={rule.values[2] || '500'}
              onChange={e => updateRule(index, { values: [rule.values[0] || '', rule.values[1] || '', e.target.value] })}
              className="logic-gate-radius-input"
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={rule.values[0] || ''}
            onChange={e => updateRule(index, { values: [e.target.value] })}
            placeholder="Enter value..."
            className="logic-gate-text-input"
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

  return (
    <div className="logic-gate-config">
      {/* Match Mode Section */}
      <div className="logic-gate-section">
        <h4 className="section-title">Match Mode</h4>
        <div className="match-mode-options">
          {[
            { value: 'all', label: 'All', icon: '∧', description: 'All rules must match' },
            { value: 'any', label: 'Any', icon: '∨', description: 'Any rule matches' },
            { value: 'none', label: 'None', icon: '¬', description: 'No rules match' },
          ].map(mode => (
            <label key={mode.value} className={`match-mode-option ${config.match_mode === mode.value ? 'selected' : ''}`}>
              <input
                type="radio"
                name="match_mode"
                value={mode.value}
                checked={config.match_mode === mode.value}
                onChange={e => setConfig(prev => ({ ...prev, match_mode: e.target.value }))}
              />
              <span className="mode-icon">{mode.icon}</span>
              <span className="mode-label">{mode.label}</span>
              <span className="mode-description">{mode.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rules Section */}
      <div className="logic-gate-section">
        <h4 className="section-title">Rules</h4>
        <div className="rules-list">
          {config.rules.map((rule, index) => (
            <div key={index} className={`rule-card ${rule.negate ? 'negated' : ''}`}>
              <div className="rule-header">
                <span className="rule-number">#{index + 1}</span>
                <label className="negate-toggle">
                  <input
                    type="checkbox"
                    checked={rule.negate}
                    onChange={e => updateRule(index, { negate: e.target.checked })}
                  />
                  <span>NOT</span>
                </label>
                <button
                  type="button"
                  className="remove-rule-btn"
                  onClick={() => removeRule(index)}
                  disabled={config.rules.length <= 1}
                  title="Remove rule"
                >
                  ×
                </button>
              </div>

              <div className="rule-body">
                <div className="rule-field-row">
                  <select
                    value={rule.field}
                    onChange={e => updateRule(index, { field: e.target.value })}
                    className="logic-gate-field-select"
                  >
                    {Object.entries(FIELD_DEFINITIONS).map(([key, def]) => (
                      <option key={key} value={key}>{def.icon} {def.label}</option>
                    ))}
                  </select>

                  <select
                    value={rule.op}
                    onChange={e => updateRule(index, { op: e.target.value })}
                    className="logic-gate-op-select"
                  >
                    {FIELD_DEFINITIONS[rule.field]?.operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>

                <div className="rule-value-row">
                  {renderValueInput(rule, index)}
                </div>
              </div>

              <div className="rule-preview">
                {getRuleDescription(rule)}
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="add-rule-btn" onClick={addRule}>
          + Add Rule
        </button>
      </div>

      {/* Actions Section */}
      <div className="logic-gate-section">
        <h4 className="section-title">Actions</h4>
        <div className="actions-grid">
          <div className="action-field">
            <label>On Match</label>
            <select
              value={config.on_match}
              onChange={e => setConfig(prev => ({ ...prev, on_match: e.target.value }))}
              className="action-select"
            >
              <option value="continue">✅ Continue pipeline</option>
              <option value="halt">🛑 Halt pipeline</option>
            </select>
          </div>
          <div className="action-field">
            <label>On No Match</label>
            <select
              value={config.on_no_match}
              onChange={e => setConfig(prev => ({ ...prev, on_no_match: e.target.value }))}
              className="action-select"
            >
              <option value="continue">✅ Continue pipeline</option>
              <option value="halt">🛑 Halt pipeline</option>
            </select>
          </div>
        </div>
        <p className="action-summary">
          If <strong>{config.match_mode}</strong> rules match → <strong>{config.on_match}</strong>; otherwise → <strong>{config.on_no_match}</strong>
        </p>
      </div>
    </div>
  );
};

export default LogicGateConfigForm;
