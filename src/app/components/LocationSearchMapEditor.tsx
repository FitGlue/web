import React, { useState, useEffect, useRef } from 'react';
import { Stack } from './library/layout/Stack';
import { Text } from './library/ui/Text';
import { Button } from './library/ui/Button';
import { Input } from './library/forms/Input';

/**
 * LocationSearchMapEditor — edits a map of { "<title substring>": "<lat>|<lng>|<label>" }
 * used by the location-pinner enricher. The key is a title keyword to match; the value is a
 * real place chosen via a debounced Nominatim place search.
 *
 * Serialises to the same JSON-object string shape as KeyValueMapEditor, so it plugs into the
 * existing enricher config plumbing unchanged.
 */
interface LocationSearchMapEditorProps {
    value: string;
    onChange: (value: string) => void;
}

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
}

interface RowEntry {
    key: string;
    /** Stored value: "<lat>|<lng>|<label>" (empty until a place is selected). */
    value: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const SEARCH_DEBOUNCE_MS = 600; // Nominatim usage policy: keep request rate low.

/** Extracts a human-readable label from a stored "lat|lng|label" value. */
export function labelFromValue(value: string): string {
    const parts = value.split('|');
    if (parts.length >= 3) return parts.slice(2).join('|');
    if (parts.length === 2) return `${parts[0]}, ${parts[1]}`;
    return '';
}

export const LocationSearchMapEditor: React.FC<LocationSearchMapEditorProps> = ({ value, onChange }) => {
    const [entries, setEntries] = useState<RowEntry[]>(() => {
        try {
            const parsed = JSON.parse(value || '{}');
            const rows = Object.entries(parsed).map(([k, v]) => ({ key: k, value: v as string }));
            return rows.length > 0 ? rows : [{ key: '', value: '' }];
        } catch {
            return [{ key: '', value: '' }];
        }
    });

    const updateEntries = (newEntries: RowEntry[]) => {
        setEntries(newEntries);
        const obj: Record<string, string> = {};
        newEntries.forEach(e => {
            if (e.key.trim() && e.value.trim()) {
                obj[e.key.trim()] = e.value;
            }
        });
        onChange(JSON.stringify(obj));
    };

    const handleKeyChange = (index: number, newKey: string) => {
        const updated = [...entries];
        updated[index] = { ...updated[index], key: newKey };
        updateEntries(updated);
    };

    const handlePlaceSelect = (index: number, result: NominatimResult) => {
        const updated = [...entries];
        updated[index] = {
            ...updated[index],
            value: `${result.lat}|${result.lon}|${result.display_name}`,
        };
        updateEntries(updated);
    };

    const handleClearPlace = (index: number) => {
        const updated = [...entries];
        updated[index] = { ...updated[index], value: '' };
        updateEntries(updated);
    };

    const addEntry = () => updateEntries([...entries, { key: '', value: '' }]);

    const removeEntry = (index: number) => {
        if (entries.length > 1) {
            updateEntries(entries.filter((_, i) => i !== index));
        } else {
            updateEntries([{ key: '', value: '' }]);
        }
    };

    return (
        <Stack gap="sm">
            {entries.map((entry, i) => (
                <Stack key={i} direction="horizontal" gap="sm" align="center">
                    <Stack gap="none" style={{ flex: 1, minWidth: 0 }}>
                        <Input
                            type="text"
                            value={entry.key}
                            onChange={e => handleKeyChange(i, e.target.value)}
                            placeholder="Title keyword (e.g. Pilates Class)"
                        />
                    </Stack>
                    <Text>→</Text>
                    <Stack gap="none" style={{ flex: 1, minWidth: 0 }}>
                        <PlaceSearchCell
                            value={entry.value}
                            onSelect={result => handlePlaceSelect(i, result)}
                            onClear={() => handleClearPlace(i)}
                        />
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

interface PlaceSearchCellProps {
    value: string;
    onSelect: (result: NominatimResult) => void;
    onClear: () => void;
}

/** A single value cell: shows the selected place, or a debounced place-search box. */
const PlaceSearchCell: React.FC<PlaceSearchCellProps> = ({ value, onSelect, onClear }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const trimmed = query.trim();
        if (trimmed.length < 3) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const url = `${NOMINATIM_URL}?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(trimmed)}`;
                const resp = await fetch(url, { headers: { Accept: 'application/json' } });
                const data = (await resp.json()) as NominatimResult[];
                setResults(Array.isArray(data) ? data : []);
            } catch {
                console.warn('Location search failed for', trimmed);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    // A place is already selected — show it with a "change" affordance.
    if (value) {
        return (
            <Stack direction="horizontal" gap="xs" align="center" style={{ flex: 1, minWidth: 0 }}>
                <Text>📍 {labelFromValue(value)}</Text>
                <Button type="button" variant="secondary" size="small" onClick={onClear} title="Change place">
                    ✎
                </Button>
            </Stack>
        );
    }

    return (
        <Stack gap="xs">
            <Input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for a place…"
            />
            {loading && <Text variant="muted">Searching…</Text>}
            {!loading && results.length > 0 && (
                <Stack gap="none">
                    {results.map((r, idx) => (
                        <Button
                            key={`${r.lat},${r.lon},${idx}`}
                            type="button"
                            variant="secondary"
                            size="small"
                            onClick={() => {
                                onSelect(r);
                                setQuery('');
                                setResults([]);
                            }}
                        >
                            {r.display_name}
                        </Button>
                    ))}
                </Stack>
            )}
        </Stack>
    );
};

export default LocationSearchMapEditor;
