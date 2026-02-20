import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Stack } from './library/layout/Stack';
import { Text } from './library/ui/Text';
import { Button } from './library/ui/Button';
import { Select } from './library/forms/Select';
import { Input } from './library/forms/Input';

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

export const KeyValueMapEditor: React.FC<KeyValueMapEditorProps> = ({
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
                    <Stack direction="horizontal" gap="xs" align="center" style={{ flex: 1, minWidth: 0 }}>
                        <Input
                            type="text"
                            value={entry.value}
                            onChange={e => handleEntryChange(i, 'value', e.target.value)}
                            placeholder="New counter name"
                            style={{ flex: 1, minWidth: 0 }}
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
                    <Stack gap="none" style={{ flex: 1, minWidth: 0 }}>
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
                    </Stack>
                    <Text>→</Text>
                    <Stack gap="none" style={{ flex: 1, minWidth: 0 }}>
                        {renderValueCell(entry, i)}
                    </Stack>
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
