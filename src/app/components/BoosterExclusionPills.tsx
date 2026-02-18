import React from 'react';
import { Stack } from './library/layout/Stack';
import { Paragraph } from './library/ui/Paragraph';
import { PluginIcon } from './library/ui/PluginIcon';
import './BoosterExclusionPills.css';

interface EnricherInfo {
    id: string;
    name: string;
    providerType: string;
    icon?: string;
    iconType?: string;
    iconPath?: string;
}

interface BoosterExclusionPillsProps {
    /** The destination ID this exclusion applies to */
    destinationId: string;
    /** The destination name for display */
    destinationName: string;
    /** All enrichers selected in the pipeline */
    enrichers: EnricherInfo[];
    /** Currently excluded enricher provider types for this destination */
    excludedProviderTypes: string[];
    /** Callback when exclusions change */
    onChange: (destinationId: string, excludedProviderTypes: string[]) => void;
}

/**
 * BoosterExclusionPills — NerdMode-only inline component for per-destination enricher exclusions.
 * Renders as a compact row of toggleable pills below each destination.
 * Excluded enrichers are visually struck-through/dimmed.
 */
export const BoosterExclusionPills: React.FC<BoosterExclusionPillsProps> = ({
    destinationId,
    destinationName,
    enrichers,
    excludedProviderTypes,
    onChange,
}) => {
    if (enrichers.length === 0) return null;

    const toggleExclusion = (providerType: string) => {
        const isExcluded = excludedProviderTypes.includes(providerType);
        const updated = isExcluded
            ? excludedProviderTypes.filter(e => e !== providerType)
            : [...excludedProviderTypes, providerType];
        onChange(destinationId, updated);
    };

    const excludedCount = excludedProviderTypes.length;

    return (
        <Stack gap="xs" className="booster-exclusion">
            <Paragraph size="sm" muted>
                🔇 Skip boosters for {destinationName}
                {excludedCount > 0 && <Paragraph inline size="sm" className="booster-exclusion__count"> ({excludedCount} excluded)</Paragraph>}
            </Paragraph>
            <Stack direction="horizontal" gap="xs" className="booster-exclusion__pills">
                {enrichers.map(enricher => {
                    const isExcluded = excludedProviderTypes.includes(enricher.providerType);
                    return (
                        <button
                            key={enricher.id}
                            type="button"
                            className={`booster-exclusion__pill ${isExcluded ? 'booster-exclusion__pill--excluded' : ''}`}
                            onClick={() => toggleExclusion(enricher.providerType)}
                            title={isExcluded ? `Include ${enricher.name} for ${destinationName}` : `Exclude ${enricher.name} from ${destinationName}`}
                        >
                            <PluginIcon
                                icon={enricher.icon}
                                iconType={enricher.iconType}
                                iconPath={enricher.iconPath}
                                size="small"
                            />
                            <Paragraph inline size="sm" className={isExcluded ? 'booster-exclusion__name--excluded' : ''}>
                                {enricher.name}
                            </Paragraph>
                            <Paragraph inline size="sm" className="booster-exclusion__indicator">
                                {isExcluded ? '✕' : '✓'}
                            </Paragraph>
                        </button>
                    );
                })}
            </Stack>
        </Stack>
    );
};
