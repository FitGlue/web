import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { LoadingState } from '../components/ui/LoadingState';

interface EnricherConfig {
    providerType: number;
    inputs?: Record<string, string>;
}

interface PipelineConfig {
    id: string;
    source: string;
    enrichers: EnricherConfig[];
    destinations: string[];
}

// Map enricher provider types to names
const ENRICHER_NAMES: Record<number, string> = {
    0: 'Unknown',
    1: 'Static Metadata',
    2: 'AI Description',
    3: 'User Input',
    4: 'Strava Route'
};

const getSourceIcon = (source: string): string => {
    switch (source.toLowerCase()) {
        case 'hevy': return '🏋️';
        case 'fitbit': return '⌚';
        default: return '📥';
    }
};

const getDestinationIcon = (dest: string): string => {
    switch (dest.toLowerCase()) {
        case 'strava': return '🚴';
        case 'mock': return '🧪';
        default: return '📤';
    }
};

interface PipelineCardProps {
    pipeline: PipelineConfig;
    onDelete: () => void;
    deleting: boolean;
}

const PipelineCard: React.FC<PipelineCardProps> = ({ pipeline, onDelete, deleting }) => {
    return (
        <Card className="pipeline-card">
            <div className="pipeline-header">
                <div className="pipeline-flow">
                    <span className="pipeline-source">
                        <span className="pipeline-icon">{getSourceIcon(pipeline.source)}</span>
                        {pipeline.source}
                    </span>
                    <span className="pipeline-arrow">→</span>
                    {pipeline.enrichers.length > 0 && (
                        <>
                            <span className="pipeline-enrichers">
                                {pipeline.enrichers.map((e, i) => (
                                    <span key={i} className="enricher-badge" title={ENRICHER_NAMES[e.providerType]}>
                                        ✨
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
                                {dest}
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
                                    {ENRICHER_NAMES[e.providerType] || `Type ${e.providerType}`}
                                    {e.inputs && Object.keys(e.inputs).length > 0 && (
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
    const [pipelines, setPipelines] = useState<PipelineConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

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

    if (loading) {
        return (
            <PageLayout title="Pipelines" backLink="/settings" backLabel="Settings">
                <LoadingState />
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Pipelines"
            backLink="/settings"
            backLabel="Settings"
            onRefresh={fetchPipelines}
            headerActions={
                <Button variant="primary" onClick={() => navigate('/settings/pipelines/new')}>
                    + New Pipeline
                </Button>
            }
        >
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
                        />
                    ))}
                </div>
            )}
        </PageLayout>
    );
};

export default PipelinesPage;
