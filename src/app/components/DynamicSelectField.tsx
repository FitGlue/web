import React, { useState, useEffect } from 'react';
import { ConfigFieldSchema } from '../types/plugin';
import { useApi } from '../hooks/useApi';
import { Stack } from './library/layout/Stack';
import { Text } from './library/ui/Text';
import { Button } from './library/ui/Button';
import { Select } from './library/forms/Select';
import { Input } from './library/forms/Input';

/**
 * DynamicSelectField - A combo-box that fetches options from a dynamic API endpoint
 * and allows the user to either select an existing option or type a new value
 */
interface DynamicSelectFieldProps {
    field: ConfigFieldSchema;
    value: string;
    onChange: (value: string) => void;
}

export const DynamicSelectField: React.FC<DynamicSelectFieldProps> = ({ field, value, onChange }) => {
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
