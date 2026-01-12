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
    destinations: (string | number)[];
}

// Map enricher provider types to names
const ENRICHER_NAMES: Record<number, string> = {
    0: 'Unknown',
    1: 'Static Metadata',
    2: 'AI Description',
    3: 'User Input',
    4: 'Strava Route',
    7: 'Activity Type Rules',
    9: 'Location Matcher',
    10: 'Counter',
    11: 'Field Selector',
    12: 'Filter',
    99: 'Test/Mock'
};

// Map destination IDs to names
const DESTINATION_NAMES: Record<number, string> = {
    1: 'Strava',
    99: 'Mock'
};

const getSourceIcon = (source: string): string => {
    // Backend returns SOURCE_HEVY, SOURCE_FITBIT, etc.
    const normalized = String(source).toLowerCase().replace('source_', '');
    switch (normalized) {
        case 'hevy': return '🏋️';
        case 'fitbit': return '⌚';
        case 'test': return '🧪';
        default: return '📥';
    }
};

const getSourceName = (source: string): string => {
    const normalized = String(source).toLowerCase().replace('source_', '');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getDestinationIcon = (dest: string | number): string => {
    const normalized = String(dest).toLowerCase();
    switch (normalized) {
        case 'strava':
        case '1': return '🚴';
        case 'mock':
        case '99': return '🧪';
        default: return '📤';
    }
};

const getDestinationName = (dest: string | number): string => {
    if (typeof dest === 'number') {
        return DESTINATION_NAMES[dest] || `Destination ${dest}`;
    }
    return dest.charAt(0).toUpperCase() + dest.slice(1).toLowerCase();
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
                        {getSourceName(pipeline.source)}
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
                        />
                    ))}
                </div>
            )}
        </PageLayout>
    );
};

export default PipelinesPage;
