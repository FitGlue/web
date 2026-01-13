import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { LoadingState } from '../components/ui/LoadingState';

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
        <Card className="pipeline-card">
            <div className="pipeline-header">
                <div className="pipeline-flow">
                    <span className="pipeline-source">
                        <span className="pipeline-icon">{getSourceIcon(pipeline.source)}</span>
                        {getSourceName(pipeline.source)}
                    </span>
                    <span className="pipeline-arrow">→</span>
                    {pipeline.enrichers.length > 0 && (
                        <>
                            <span className="pipeline-enrichers">
                                {pipeline.enrichers.map((e, i) => (
                                    <span key={i} className="enricher-badge" title={getEnricherName(e.providerType)}>
                                        {getEnricherIcon(e.providerType)}
                                    </span>
                                ))}
                            </span>
                            <span className="pipeline-arrow">→</span>
                        </>
                    )}
                    <span className="pipeline-destinations">
                        {pipeline.destinations.map((dest, i) => (
                            <span key={i} className="pipeline-destination">
                                <span className="pipeline-icon">{getDestinationIcon(dest)}</span>
                                {getDestinationName(dest)}
                            </span>
                        ))}
                    </span>
                </div>
            </div>
            <div className="pipeline-details">
                <div className="pipeline-id">
                    <span className="label">Pipeline ID:</span>
                    <code>{pipeline.id}</code>
                </div>
                {pipeline.enrichers.length > 0 && (
                    <div className="pipeline-enricher-list">
                        <span className="label">Enrichers:</span>
                        <ul>
                            {pipeline.enrichers.map((e, i) => (
                                <li key={i}>
                                    {getEnricherIcon(e.providerType)} {getEnricherName(e.providerType)}
                                    {e.typedConfig && Object.keys(e.typedConfig).length > 0 && (
                                        <span className="enricher-inputs"> (configured)</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className="pipeline-actions">
                <Button
                    variant="danger"
                    onClick={onDelete}
                    disabled={deleting}
                >
                    {deleting ? 'Deleting...' : 'Delete Pipeline'}
                </Button>
            </div>
        </Card>
    );
};

const PipelinesPage: React.FC = () => {
    const api = useApi();
    const navigate = useNavigate();
    const { sources, enrichers, destinations, loading: registryLoading } = usePluginRegistry();
    const [pipelines, setPipelines] = useState<PipelineConfig[]>([]);
    const [loading, setLoading] = useState(true);
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
        const found = enrichers.find(e => e.enricherProviderType === providerType);
        return found?.icon || '✨';
    };

    const getEnricherName = (providerType: number): string => {
        const found = enrichers.find(e => e.enricherProviderType === providerType);
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

    const fetchPipelines = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/me/pipelines');
            setPipelines((response as { pipelines: PipelineConfig[] }).pipelines || []);
        } catch (error) {
            console.error('Failed to fetch pipelines:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPipelines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = async (pipelineId: string) => {
        if (!window.confirm('Are you sure you want to delete this pipeline?')) {
            return;
        }

        setDeleting(pipelineId);
        try {
            await api.delete(`/users/me/pipelines/${pipelineId}`);
            await fetchPipelines();
        } catch (error) {
            console.error('Failed to delete pipeline:', error);
        } finally {
            setDeleting(null);
        }
    };

    if (loading || registryLoading) {
        return (
            <PageLayout title="Pipelines" backTo="/settings" backLabel="Settings">
                <LoadingState />
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Pipelines"
            backTo="/settings"
            backLabel="Settings"
            onRefresh={fetchPipelines}
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
