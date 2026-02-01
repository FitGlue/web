import React, { useState, useEffect, useCallback } from 'react';
import { Stack } from '../library/layout';
import { Select } from '../library/forms';
import { Button, Paragraph, Heading } from '../library/ui';
import './HybridRaceTaggerInput.css';

interface LapInfo {
    index: number;
    duration: number;
    distance: number;
}

interface PresetOption {
    id: string;
    name: string;
}

interface UserSelection {
    preset_id: string;
    merged_laps: number[][];
    not_hybrid_race: boolean;
}

interface HybridRaceTaggerInputProps {
    lapsJson: string;
    presetsJson: string;
    value: string;
    onChange: (value: string) => void;
}

const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)}km`;
    }
    return `${Math.round(meters)}m`;
};

/**
 * HybridRaceTaggerInput - Preset-based UI for hybrid race tagging
 * User selects a race preset (Hyrox, ATHX) and optionally merges laps
 */
export const HybridRaceTaggerInput: React.FC<HybridRaceTaggerInputProps> = ({
    lapsJson,
    presetsJson,
    value,
    onChange,
}) => {
    const [laps, setLaps] = useState<LapInfo[]>([]);
    const [presets, setPresets] = useState<PresetOption[]>([]);
    const [selectedPresetId, setSelectedPresetId] = useState<string>('');
    const [showMergeUI, setShowMergeUI] = useState(false);
    const [selectedLaps, setSelectedLaps] = useState<Set<number>>(new Set());
    const [mergedLaps, setMergedLaps] = useState<number[][]>([]);

    // Parse initial value if provided (restore existing selection)
    useEffect(() => {
        if (value) {
            try {
                const parsed = JSON.parse(value) as UserSelection;
                if (parsed.preset_id) setSelectedPresetId(parsed.preset_id);
                if (parsed.merged_laps) setMergedLaps(parsed.merged_laps);
            } catch {
                // Ignore parse errors for new inputs
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Parse laps and presets from provider metadata
    useEffect(() => {
        try {
            const parsedLaps = JSON.parse(lapsJson || '[]');
            setLaps(parsedLaps.map((lap: { index: number; distance_meters: number; duration_seconds: number }) => ({
                index: lap.index,
                distance: lap.distance_meters,
                duration: lap.duration_seconds,
            })));
        } catch {
            console.error('Failed to parse laps JSON');
        }

        try {
            const parsedPresets = JSON.parse(presetsJson || '[]');
            setPresets(parsedPresets);
        } catch {
            console.error('Failed to parse presets JSON');
        }
    }, [lapsJson, presetsJson]);

    // Serialize selection to value on change
    const updateValue = useCallback((presetId: string, notHybrid: boolean) => {
        const selection: UserSelection = {
            preset_id: presetId,
            merged_laps: mergedLaps,
            not_hybrid_race: notHybrid,
        };
        onChange(JSON.stringify(selection));
    }, [mergedLaps, onChange]);

    useEffect(() => {
        if (selectedPresetId) {
            updateValue(selectedPresetId, false);
        }
    }, [selectedPresetId, mergedLaps, updateValue]);

    const handlePresetChange = (presetId: string) => {
        setSelectedPresetId(presetId);
    };

    const handleNotHybridRace = () => {
        updateValue('', true);
    };

    const toggleLapSelection = (lapIndex: number) => {
        setSelectedLaps(prev => {
            const next = new Set(prev);
            if (next.has(lapIndex)) {
                next.delete(lapIndex);
            } else {
                next.add(lapIndex);
            }
            return next;
        });
    };

    const mergeLaps = () => {
        if (selectedLaps.size < 2) return;

        const indices = Array.from(selectedLaps).sort((a, b) => a - b);

        // Check if laps are adjacent
        const isAdjacent = indices.every((idx, i) =>
            i === 0 || idx === indices[i - 1] + 1
        );

        if (!isAdjacent) {
            alert('Only adjacent laps can be merged');
            return;
        }

        setMergedLaps(prev => [...prev, indices]);
        setSelectedLaps(new Set());
    };

    const clearMerges = () => {
        setMergedLaps([]);
        setSelectedLaps(new Set());
    };

    const presetOptions = [
        { value: '', label: 'Select a race preset...' },
        ...presets.map(p => ({ value: p.id, label: p.name })),
    ];

    return (
        <div className="hybrid-race-tagger">
            <Stack gap="md">
                <Heading level={4}>Select Race Type</Heading>
                <Paragraph size="sm" muted>
                    Choose the race format that matches your activity, or mark as not a hybrid race.
                </Paragraph>

                <Select
                    value={selectedPresetId}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    options={presetOptions}
                />

                <div className="hybrid-race-tagger__actions">
                    <Button
                        variant="text"
                        onClick={handleNotHybridRace}
                    >
                        Not a Hybrid Race
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => setShowMergeUI(!showMergeUI)}
                    >
                        {showMergeUI ? 'Hide Lap Merge' : 'Merge Laps...'}
                    </Button>
                </div>

                {showMergeUI && (
                    <div className="hybrid-race-tagger__merge-section">
                        <Paragraph size="sm" muted>
                            Select adjacent laps to merge (useful if watch split laps incorrectly)
                        </Paragraph>

                        {selectedLaps.size >= 2 && (
                            <Button variant="secondary" onClick={mergeLaps}>
                                Merge {selectedLaps.size} selected laps
                            </Button>
                        )}

                        {mergedLaps.length > 0 && (
                            <div className="hybrid-race-tagger__merged-info">
                                <Paragraph size="sm">
                                    Merged groups: {mergedLaps.map(g => `[${g.map(i => i + 1).join(', ')}]`).join(' ')}
                                </Paragraph>
                                <Button variant="text" onClick={clearMerges}>Clear Merges</Button>
                            </div>
                        )}

                        <div className="hybrid-race-tagger__laps">
                            {laps.map((lap) => (
                                <button
                                    key={lap.index}
                                    type="button"
                                    className={`hybrid-race-tagger__lap-chip ${selectedLaps.has(lap.index) ? 'selected' : ''} ${mergedLaps.some(g => g.includes(lap.index)) ? 'merged' : ''}`}
                                    onClick={() => toggleLapSelection(lap.index)}
                                    disabled={mergedLaps.some(g => g.includes(lap.index))}
                                >
                                    <span className="hybrid-race-tagger__lap-number">Lap {lap.index + 1}</span>
                                    <span className="hybrid-race-tagger__lap-info">
                                        {formatDistance(lap.distance)} • {formatDuration(lap.duration)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {laps.length > 0 && (
                    <Paragraph size="sm" muted centered>
                        {laps.length} laps recorded
                    </Paragraph>
                )}
            </Stack>
        </div>
    );
};

export default HybridRaceTaggerInput;
