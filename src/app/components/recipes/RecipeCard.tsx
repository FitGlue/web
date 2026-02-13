import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ExpandableCard,
    TransformationPreview,
    Heading,
    Paragraph,
    Button,
    Badge,
    BoosterGrid,
    FlowVisualization,
    ConnectionStatusItem,
} from '../library/ui';
import { Stack } from '../library/layout';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';
import type { Recipe } from '../../data/recipes';
import type { IntegrationsSummary } from '../../state/integrationsState';
import './RecipeCard.css';

interface RecipeCardProps {
    recipe: Recipe;
    integrations: IntegrationsSummary | null;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, integrations }) => {
    const navigate = useNavigate();
    const { sources, enrichers, destinations, integrations: registryIntegrations } = usePluginRegistry();

    const isConnectionReady = (connectionId: string): boolean => {
        if (!integrations) return false;
        const status = integrations[connectionId as keyof IntegrationsSummary];
        return !!status?.connected;
    };

    const allConnectionsReady = recipe.requiredConnections.length === 0 ||
        recipe.requiredConnections.every(isConnectionReady);

    const missingConnections = recipe.requiredConnections.filter(c => !isConnectionReady(c));

    // Resolve from registry
    const sourcePlugin = sources.find(s => s.id === recipe.recommendedSource);
    const destPlugins = recipe.destinations.map(dId => destinations.find(d => d.id === dId));

    const handleImport = () => {
        navigate(`/settings/pipelines?code=${recipe.importCode}`);
    };

    const header = (
        <Stack direction="horizontal" gap="md" align="center" className="recipe-card__header-content">
            <Paragraph className="recipe-card__icon">{recipe.icon}</Paragraph>
            <Stack gap="xs" className="recipe-card__titles">
                <Heading level={3} className="recipe-card__title">{recipe.title}</Heading>
                <Paragraph className="recipe-card__tagline">{recipe.tagline}</Paragraph>
            </Stack>
        </Stack>
    );

    // Source badge — same as EnrichedActivityCard
    const sourceNode = (
        <Badge variant="source" size="sm">
            <Stack direction="horizontal" gap="xs" align="center">
                <Paragraph inline>{sourcePlugin?.icon ?? '📱'}</Paragraph>
                <Paragraph inline size="sm">{sourcePlugin?.name ?? recipe.recommendedSource}</Paragraph>
            </Stack>
        </Badge>
    );

    // Booster badges — same pattern as EnricherBadge
    const boostersNode = (
        <BoosterGrid emptyText="No boosters">
            {recipe.enricherProviderTypes.map(ept => {
                const enricher = enrichers.find(e => e.enricherProviderType === ept);
                return (
                    <Badge key={ept} variant="booster">
                        <Stack direction="horizontal" gap="xs" align="center">
                            <Paragraph inline>{enricher?.icon ?? '⚡'}</Paragraph>
                            <Paragraph inline size="sm">{enricher?.name ?? `Booster #${ept}`}</Paragraph>
                        </Stack>
                    </Badge>
                );
            })}
        </BoosterGrid>
    );

    // Destination badges — same as EnrichedActivityCard
    const destinationNode = (
        <Stack direction="horizontal" gap="xs">
            {destPlugins.map((dp, idx) => (
                <Badge key={recipe.destinations[idx]} variant="destination" size="sm">
                    <Stack direction="horizontal" gap="xs" align="center">
                        <Paragraph inline>{dp?.icon ?? '🚀'}</Paragraph>
                        <Paragraph inline size="sm">{dp?.name ?? recipe.destinations[idx]}</Paragraph>
                    </Stack>
                </Badge>
            ))}
        </Stack>
    );

    return (
        <ExpandableCard header={header} className="recipe-card">
            <Stack gap="md">
                {/* Before/After */}
                <TransformationPreview
                    before={recipe.transformation.before}
                    after={recipe.transformation.after}
                />

                {/* Pipeline flow: Source → Boosters → Destinations */}
                <FlowVisualization
                    source={sourceNode}
                    center={boostersNode}
                    destination={destinationNode}
                />

                {/* Footer: connections + CTA */}
                <Stack gap="sm" align="center" className="recipe-card__footer">
                    {recipe.includesAthleteFeatures && (
                        <Badge className="recipe-card__athlete-badge">Includes Athlete features</Badge>
                    )}

                    {recipe.requiredConnections.length > 0 && (
                        <Stack direction="horizontal" gap="sm" wrap align="center">
                            {recipe.requiredConnections.map(cId => {
                                const integration = registryIntegrations.find(i => i.id === cId);
                                return (
                                    <ConnectionStatusItem
                                        key={cId}
                                        name={integration?.name ?? cId}
                                        connected={isConnectionReady(cId)}
                                        icon={integration?.icon}
                                        iconType={integration?.iconType}
                                        iconPath={integration?.iconPath}
                                    />
                                );
                            })}
                        </Stack>
                    )}

                    {allConnectionsReady ? (
                        <Button variant="primary" onClick={handleImport}>
                            Add to My Pipelines →
                        </Button>
                    ) : (
                        <Button variant="secondary" onClick={() => navigate('/connections')}>
                            Connect {missingConnections.map(c =>
                                registryIntegrations.find(i => i.id === c)?.name ?? c
                            ).join(' & ')} first
                        </Button>
                    )}

                    <Paragraph size="sm" muted centered>
                        {allConnectionsReady
                            ? 'You can customise boosters and targets after importing.'
                            : 'Set up the required connections, then come back to import.'}
                    </Paragraph>

                    {recipe.guideSlug && (
                        <a
                            href={`/guides/${recipe.guideSlug}`}
                            className="recipe-card__guide-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            📖 Read the full guide →
                        </a>
                    )}
                </Stack>
            </Stack>
        </ExpandableCard>
    );
};
