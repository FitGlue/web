import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';
import type { Recipe } from '../../data/recipes';
import type { IntegrationsSummary } from '../../state/integrationsState';
import './RecipeCard.css';

interface RecipeCardProps {
    recipe: Recipe;
    integrations: IntegrationsSummary | null;
}

const MAX_BOOSTERS_SHOWN = 4;

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

    const sourcePlugin = sources.find(s => s.id === recipe.recommendedSource);
    const destPlugins = recipe.destinations.map(dId => destinations.find(d => d.id === dId));
    const resolvedEnrichers = recipe.enricherProviderTypes.map(ept =>
        enrichers.find(e => e.enricherProviderType === ept)
    );
    const shownEnrichers = resolvedEnrichers.slice(0, MAX_BOOSTERS_SHOWN);
    const extraCount = resolvedEnrichers.length - MAX_BOOSTERS_SHOWN;

    const handleUse = () => {
        if (allConnectionsReady) {
            navigate(`/settings/pipelines?code=${recipe.importCode}`);
        } else {
            navigate('/connections');
        }
    };

    const missingNames = missingConnections.map(c =>
        registryIntegrations.find(i => i.id === c)?.name ?? c
    );

    return (
        <article className={`rc${recipe.includesAthleteFeatures ? ' rc--featured' : ''}`}>
            <div className="rc__head">
                <div className="rc__head-grain" />
                {recipe.includesAthleteFeatures && (
                    <span className="rc__badge">✦ ATHLETE</span>
                )}
                <div className="rc__emoji">{recipe.icon}</div>
                <div className="rc__name">{recipe.title}</div>
                <div className="rc__sub">{recipe.tagline}</div>
            </div>

            <div className="rc__list">
                <div className="rc__sep">SOURCE</div>
                <div className="rc__row">
                    <span className="rc__row-icon">{sourcePlugin?.icon ?? '📱'}</span>
                    <span>
                        {sourcePlugin?.name ?? recipe.recommendedSource}
                        {recipe.sourceNote && <span className="dim"> · {recipe.sourceNote}</span>}
                    </span>
                </div>

                <div className="rc__sep">
                    GLUE WITH <b>{recipe.enricherProviderTypes.length} BOOSTERS</b>
                </div>
                {shownEnrichers.map((e, i) => (
                    <div key={recipe.enricherProviderTypes[i]} className="rc__row">
                        <span className="rc__row-icon">{e?.icon ?? '⚡'}</span>
                        <span><b>{e?.name ?? `Booster #${recipe.enricherProviderTypes[i]}`}</b></span>
                    </div>
                ))}
                {extraCount > 0 && (
                    <div className="rc__row rc__row--dim">
                        <span className="rc__row-icon">+</span>
                        <span>{extraCount} more boosters…</span>
                    </div>
                )}

                <div className="rc__sep">↓ FAN OUT TO</div>
                {destPlugins.map((dp, idx) => (
                    <div key={recipe.destinations[idx]} className="rc__row">
                        <span className="rc__row-icon">{dp?.icon ?? '🚀'}</span>
                        <span>{dp?.name ?? recipe.destinations[idx]}</span>
                    </div>
                ))}
            </div>

            <div className="rc__count">
                <span className="rc__count-l">BOOSTERS INCLUDED</span>
                <span className="rc__count-n">
                    <span className="gr">{recipe.enricherProviderTypes.length}</span>
                </span>
            </div>

            <button className={`rc__cta${!allConnectionsReady ? ' rc__cta--blocked' : ''}`} onClick={handleUse}>
                <span>
                    {allConnectionsReady
                        ? 'USE THIS RECIPE'
                        : `CONNECT ${missingNames.join(' & ')} FIRST`}
                </span>
                <span className="rc__cta-arrow">→</span>
            </button>

            {recipe.guideSlug && (
                <a
                    href={`/guides/${recipe.guideSlug}`}
                    className="rc__guide"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    📖 READ THE GUIDE →
                </a>
            )}
        </article>
    );
};
