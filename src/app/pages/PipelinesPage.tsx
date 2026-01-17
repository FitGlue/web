import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { usePipelines } from '../hooks/usePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { CardSkeleton } from '../components/ui/CardSkeleton';
import '../components/ui/CardSkeleton.css';

interface EnricherConfig {
    providerType: number;
    typedConfig?: Record<string, string>;
}

interface PipelineConfig {
    id: string;
    source: string;
    enrichers: EnricherConfig[];
    destinations: (string | number)[];
}

interface PipelineCardProps {
    pipeline: PipelineConfig;
    onEdit: () => void;
    onDelete: () => void;
    deleting: boolean;
    getEnricherName: (providerType: number) => string;
    getEnricherIcon: (providerType: number) => string;
    getSourceIcon: (source: string) => string;
    getSourceName: (source: string) => string;
    getDestinationIcon: (dest: string | number) => string;
    getDestinationName: (dest: string | number) => string;
}

const PipelineCard: React.FC<PipelineCardProps> = ({
    pipeline,
    onEdit,
    onDelete,
    deleting,
    getEnricherName,
    getEnricherIcon,
    getSourceIcon,
    getSourceName,
    getDestinationIcon,
    getDestinationName,
}) => {
    return (
        <div className="pipeline-card-premium">
            {/* Visual Flow Header */}
            <div className="pipeline-visual-flow">
                {/* Source Node */}
                <div className="flow-node flow-source">
                    <div className="flow-node-icon">{getSourceIcon(pipeline.source)}</div>
                    <span className="flow-node-label">{getSourceName(pipeline.source)}</span>
                </div>

                {/* Flow Arrow */}
                <div className="flow-connector">
                    <div className="flow-line"></div>
                    <span className="flow-arrow-icon">→</span>
                    <div className="flow-line"></div>
                </div>

                {/* Boosters Section */}
                {pipeline.enrichers.length > 0 && (
                    <>
                        <div className="flow-boosters">
                            <div className="boosters-container">
                                {pipeline.enrichers.map((e, i) => (
                                    <div
                                        key={i}
                                        className="booster-pill"
                                        title={getEnricherName(e.providerType)}
                                    >
                                        <span className="booster-order">{i + 1}</span>
                                        <span className="booster-icon">{getEnricherIcon(e.providerType)}</span>
                                        <span className="booster-name">{getEnricherName(e.providerType)}</span>
                                        {e.typedConfig && Object.keys(e.typedConfig).length > 0 && (
                                            <span className="booster-configured">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Flow Arrow */}
                        <div className="flow-connector">
                            <div className="flow-line"></div>
                            <span className="flow-arrow-icon">→</span>
                            <div className="flow-line"></div>
                        </div>
                    </>
                )}

                {/* Destination Node */}
                <div className="flow-node flow-destination">
                    {pipeline.destinations.map((dest, i) => (
                        <React.Fragment key={i}>
                            <div className="flow-node-icon">{getDestinationIcon(dest)}</div>
                            <span className="flow-node-label">{getDestinationName(dest)}</span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Card Footer */}
            <div className="pipeline-card-footer">
                <div className="pipeline-meta">
                    <code className="pipeline-id-badge">{pipeline.id.replace('pipe_', '').slice(0, 8)}...</code>
                    <span className="pipeline-booster-count">
                        {pipeline.enrichers.length} Booster{pipeline.enrichers.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="pipeline-card-actions">
                    <Button
                        variant="secondary"
                        onClick={onEdit}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onDelete}
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const PipelinesPage: React.FC = () => {
    const api = useApi();
    const navigate = useNavigate();
    const { sources, enrichers, destinations, loading: registryLoading } = usePluginRegistry();
    const { pipelines, loading, refresh: refreshPipelines, fetchIfNeeded } = usePipelines();
    const [deleting, setDeleting] = useState<string | null>(null);

    // Dynamic lookup functions using the plugin registry
    const getSourceIcon = (source: string): string => {
        const normalized = String(source).toLowerCase().replace('source_', '');
        const found = sources.find(s => s.id === normalized);
        return found?.icon || '📥';
    };

    const getSourceName = (source: string): string => {
        const normalized = String(source).toLowerCase().replace('source_', '');
        const found = sources.find(s => s.id === normalized);
        return found?.name || normalized.charAt(0).toUpperCase() + normalized.slice(1);
    };

    const getEnricherIcon = (providerType: number): string => {
        const found = enrichers.find(e => Number(e.enricherProviderType) === Number(providerType));
        return found?.icon || '✨';
    };

    const getEnricherName = (providerType: number): string => {
        const found = enrichers.find(e => Number(e.enricherProviderType) === Number(providerType));
        return found?.name || `Enricher ${providerType}`;
    };

    const getDestinationIcon = (dest: string | number): string => {
        const normalized = String(dest).toLowerCase();
        const found = destinations.find(d =>
            d.id === normalized ||
            d.destinationType === Number(dest)
        );
        return found?.icon || '📤';
    };

    const getDestinationName = (dest: string | number): string => {
        const normalized = String(dest).toLowerCase();
        const found = destinations.find(d =>
            d.id === normalized ||
            d.destinationType === Number(dest)
        );
        return found?.name || (typeof dest === 'string'
            ? dest.charAt(0).toUpperCase() + dest.slice(1).toLowerCase()
            : `Destination ${dest}`);
    };

    useEffect(() => {
        fetchIfNeeded();
    }, [fetchIfNeeded]);

    const handleDelete = async (pipelineId: string) => {
        if (!window.confirm('Are you sure you want to delete this pipeline?')) {
            return;
        }

        setDeleting(pipelineId);
        try {
            await api.delete(`/users/me/pipelines/${pipelineId}`);
            await refreshPipelines();
        } catch (error) {
            console.error('Failed to delete pipeline:', error);
        } finally {
            setDeleting(null);
        }
    };

    if (loading || registryLoading) {
        return (
            <PageLayout title="Pipelines" backTo="/" backLabel="Dashboard">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                    <div className="skeleton-line skeleton-line--button-wide" style={{ width: '140px' }} />
                </div>
                <div className="pipelines-grid">
                    <CardSkeleton variant="pipeline-full" />
                    <CardSkeleton variant="pipeline-full" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Pipelines"
            backTo="/"
            backLabel="Dashboard"
            onRefresh={refreshPipelines}
        >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <Button variant="primary" onClick={() => navigate('/settings/pipelines/new')}>
                    + New Pipeline
                </Button>
            </div>

            {pipelines.length === 0 ? (
                <Card className="empty-state-card">
                    <div className="empty-state">
                        <span className="empty-icon">🔀</span>
                        <h3>No Pipelines Configured</h3>
                        <p>Pipelines define how your activities flow from sources to destinations.</p>
                        <Button variant="primary" onClick={() => navigate('/settings/pipelines/new')}>
                            Create Your First Pipeline
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="pipelines-grid">
                    {pipelines.map(pipeline => (
                        <PipelineCard
                            key={pipeline.id}
                            pipeline={pipeline}
                            onEdit={() => navigate(`/settings/pipelines/${pipeline.id}/edit`)}
                            onDelete={() => handleDelete(pipeline.id)}
                            deleting={deleting === pipeline.id}
                            getEnricherName={getEnricherName}
                            getEnricherIcon={getEnricherIcon}
                            getSourceIcon={getSourceIcon}
                            getSourceName={getSourceName}
                            getDestinationIcon={getDestinationIcon}
                            getDestinationName={getDestinationName}
                        />
                    ))}
                </div>
            )}
        </PageLayout>
    );
};

export default PipelinesPage;
