import React from 'react';
import { Stack } from '../library/layout/Stack';
import { Card } from '../library/ui/Card';
import { Heading } from '../library/ui/Heading';
import { Paragraph } from '../library/ui/Paragraph';
import { Badge } from '../library/ui/Badge';
import { PluginIcon } from '../library/ui/PluginIcon';
import './PipelineReviewFlow.css';

export interface ReviewSource {
    id: string;
    icon?: string;
    iconType?: string;
    iconPath?: string;
    name: string;
}

export interface ReviewEnricher {
    id: string;
    icon?: string;
    iconType?: string;
    iconPath?: string;
    name: string;
    configSummary?: string[];
}

export interface ReviewDestination {
    id: string;
    icon?: string;
    iconType?: string;
    iconPath?: string;
    name: string;
    /** Names of excluded enrichers for this destination (NerdMode only) */
    excludedEnricherNames?: string[];
}

export interface PipelineReviewFlowProps {
    source?: ReviewSource;
    enrichers: ReviewEnricher[];
    destinations: ReviewDestination[];
}

/**
 * PipelineReviewFlow - Visual pipeline flow diagram for the review step.
 * Shows Source → Boosters → Destinations in a vertical layout.
 */
export const PipelineReviewFlow: React.FC<PipelineReviewFlowProps> = ({
    source,
    enrichers,
    destinations,
}) => {
    return (
        <Stack className="pipeline-review-flow" gap="sm">
            {/* Source Card */}
            <Card>
                <Stack direction="horizontal" align="center" gap="sm">
                    <Badge className="pipeline-review-flow__step-badge">1</Badge>
                    <Stack gap="xs">
                        <Paragraph muted size="sm">Source</Paragraph>
                        <Stack direction="horizontal" align="center" gap="xs">
                            {source && (
                                <PluginIcon
                                    icon={source.icon}
                                    iconType={source.iconType}
                                    iconPath={source.iconPath}
                                    size="small"
                                />
                            )}
                            <Heading level={4}>{source?.name ?? 'Unknown'}</Heading>
                        </Stack>
                    </Stack>
                </Stack>
            </Card>

            {/* Arrow */}
            <Paragraph inline className="pipeline-review-flow__arrow">↓</Paragraph>

            {/* Boosters Card */}
            {enrichers.length > 0 ? (
                <Card>
                    <Stack direction="horizontal" align="start" gap="sm">
                        <Badge className="pipeline-review-flow__step-badge">2</Badge>
                        <Stack className="pipeline-review-flow__content" gap="sm">
                            <Paragraph muted size="sm">Boosters ({enrichers.length})</Paragraph>
                            {enrichers.map((e, index) => (
                                <Stack key={e.id} className="pipeline-review-flow__item" gap="xs">
                                    <Stack direction="horizontal" align="center" gap="xs">
                                        <Paragraph inline className="pipeline-review-flow__item-number">{index + 1}.</Paragraph>
                                        <PluginIcon
                                            icon={e.icon}
                                            iconType={e.iconType}
                                            iconPath={e.iconPath}
                                            size="small"
                                        />
                                        <Paragraph inline>{e.name}</Paragraph>
                                    </Stack>
                                    {e.configSummary && e.configSummary.length > 0 && (
                                        <Stack className="pipeline-review-flow__item-config" gap="xs">
                                            {e.configSummary.map((summary, i) => (
                                                <Paragraph key={i} size="sm" muted>{summary}</Paragraph>
                                            ))}
                                        </Stack>
                                    )}
                                </Stack>
                            ))}
                        </Stack>
                    </Stack>
                </Card>
            ) : (
                <Card>
                    <Stack direction="horizontal" align="center" gap="sm">
                        <Badge className="pipeline-review-flow__step-badge pipeline-review-flow__step-badge--muted">2</Badge>
                        <Paragraph muted>No boosters selected</Paragraph>
                    </Stack>
                </Card>
            )}

            {/* Arrow */}
            <Paragraph inline className="pipeline-review-flow__arrow">↓</Paragraph>

            {/* Destinations Card */}
            <Card>
                <Stack direction="horizontal" align="start" gap="sm">
                    <Badge className="pipeline-review-flow__step-badge">3</Badge>
                    <Stack className="pipeline-review-flow__content" gap="sm">
                        <Paragraph muted size="sm">Destinations ({destinations.length})</Paragraph>
                        {destinations.map(d => (
                            <Stack key={d.id} gap="xs">
                                <Stack direction="horizontal" align="center" gap="xs">
                                    <PluginIcon
                                        icon={d.icon}
                                        iconType={d.iconType}
                                        iconPath={d.iconPath}
                                        size="small"
                                    />
                                    <Paragraph inline>{d.name}</Paragraph>
                                </Stack>
                                {d.excludedEnricherNames && d.excludedEnricherNames.length > 0 && (
                                    <Paragraph size="sm" muted>
                                        🔇 Skipping: {d.excludedEnricherNames.join(', ')}
                                    </Paragraph>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </Card>
        </Stack>
    );
};
