import React from 'react';
import { Stack } from '../library/layout/Stack';
import { Card } from '../library/ui/Card';
import { Heading } from '../library/ui/Heading';
import { Paragraph } from '../library/ui/Paragraph';
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
        <div className="pipeline-review-flow">
            {/* Source Card */}
            <Card>
                <Stack direction="horizontal" align="center" gap="sm">
                    <div className="pipeline-review-flow__step-badge">1</div>
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
            <div className="pipeline-review-flow__arrow">↓</div>

            {/* Boosters Card */}
            {enrichers.length > 0 ? (
                <Card>
                    <Stack direction="horizontal" align="start" gap="sm">
                        <div className="pipeline-review-flow__step-badge">2</div>
                        <div className="pipeline-review-flow__content">
                            <Stack gap="sm">
                                <Paragraph muted size="sm">Boosters ({enrichers.length})</Paragraph>
                                {enrichers.map((e, index) => (
                                    <div key={e.id} className="pipeline-review-flow__item">
                                        <Stack direction="horizontal" align="center" gap="xs">
                                            <span className="pipeline-review-flow__item-number">{index + 1}.</span>
                                            <PluginIcon
                                                icon={e.icon}
                                                iconType={e.iconType}
                                                iconPath={e.iconPath}
                                                size="small"
                                            />
                                            <Paragraph inline>{e.name}</Paragraph>
                                        </Stack>
                                        {e.configSummary && e.configSummary.length > 0 && (
                                            <div className="pipeline-review-flow__item-config">
                                                {e.configSummary.map((summary, i) => (
                                                    <Paragraph key={i} size="sm" muted>{summary}</Paragraph>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </Stack>
                        </div>
                    </Stack>
                </Card>
            ) : (
                <Card>
                    <Stack direction="horizontal" align="center" gap="sm">
                        <div className="pipeline-review-flow__step-badge pipeline-review-flow__step-badge--muted">2</div>
                        <Paragraph muted>No boosters selected</Paragraph>
                    </Stack>
                </Card>
            )}

            {/* Arrow */}
            <div className="pipeline-review-flow__arrow">↓</div>

            {/* Destinations Card */}
            <Card>
                <Stack direction="horizontal" align="start" gap="sm">
                    <div className="pipeline-review-flow__step-badge">3</div>
                    <div className="pipeline-review-flow__content">
                        <Stack gap="sm">
                            <Paragraph muted size="sm">Destinations ({destinations.length})</Paragraph>
                            {destinations.map(d => (
                                <Stack key={d.id} direction="horizontal" align="center" gap="xs">
                                    <PluginIcon
                                        icon={d.icon}
                                        iconType={d.iconType}
                                        iconPath={d.iconPath}
                                        size="small"
                                    />
                                    <Paragraph inline>{d.name}</Paragraph>
                                </Stack>
                            ))}
                        </Stack>
                    </div>
                </Stack>
            </Card>
        </div>
    );
};
