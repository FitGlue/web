import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { usePipelines } from '../hooks/usePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { usePluginLookup } from '../hooks/usePluginLookup';
import { useIntegrations } from '../hooks/useIntegrations';
import { CardSkeleton } from '../components/ui/CardSkeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { BoosterPill } from '../components/ui/BoosterPill';
import { IdBadge } from '../components/ui/IdBadge';
import { ImportPipelineModal } from '../components/ImportPipelineModal';
import '../components/ui/CardSkeleton.css';

interface EnricherConfig {
    providerType: number;
    typedConfig?: Record<string, string>;
}

interface PipelineConfig {
    id: string;
    name?: string;
    source: string;
    enrichers?: EnricherConfig[];
    destinations: (string | number)[];
    disabled?: boolean;
}

interface PipelineCardProps {
    pipeline: PipelineConfig;
    onEdit: () => void;
    onDelete: () => void;
    onToggleDisabled: (disabled: boolean) => void;
    deleting: boolean;
    toggling: boolean;
}

const PipelineCard: React.FC<PipelineCardProps> = ({
    pipeline,
    onEdit,
    onDelete,
    onToggleDisabled,
    deleting,
    toggling,
}) => {
    // Use plugin lookup hook for consistent icon/name resolution
    const { getSourceIcon, getSourceName, getEnricherIcon, getEnricherName, getDestinationIcon, getDestinationName } = usePluginLookup();


    return (
        <div className={`pipeline-card-premium ${pipeline.disabled ? 'pipeline-disabled' : ''}`}>
            {/* Pipeline Name Header */}
            {pipeline.name && (
                <div className="pipeline-card-name">
                    <h4>{pipeline.name}</h4>
                    {pipeline.disabled && <span className="pipeline-disabled-badge">Disabled</span>}
                </div>
            )}
            {/* Visual Flow Header */}
            <div className="pipeline-visual-flow">
                {/* Source Node */}
                <div className="flow-node flow-source">
                    <div className="flow-node-icon">{getSourceIcon(pipeline.source)}</div>
                    <span className="flow-node-label">{getSourceName(pipeline.source)}</span>
                </div>

                {/* Flow Arrow */}
                <div className="flow-connector">
                    <span className="flow-arrow-icon">→</span>
                </div>

                {/* Boosters Section */}
                {(pipeline.enrichers?.length ?? 0) > 0 && (
                    <>
                        <div className="flow-boosters">
                            <div className="boosters-container">
                            {(pipeline.enrichers ?? []).map((e, i) => (
                                    <BoosterPill
                                        key={i}
                                        order={i + 1}
                                        icon={getEnricherIcon(e.providerType)}
                                        name={getEnricherName(e.providerType)}
                                        isConfigured={!!(e.typedConfig && Object.keys(e.typedConfig).length > 0)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Flow Arrow */}
                        <div className="flow-connector">
                            <span className="flow-arrow-icon">→</span>
                        </div>
                    </>
                )}

                {/* Destination Node */}
                <div className="flow-node flow-destination">
                    <div className="flow-destinations-container">
                        {pipeline.destinations.map((dest, i) => (
                            <div key={i} className="flow-destination-item">
                                <div className="flow-node-icon">{getDestinationIcon(dest)}</div>
                                <span className="flow-node-label">{getDestinationName(dest)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Card Footer */}
            <div className="pipeline-card-footer">
                <div className="pipeline-meta">
                    <IdBadge id={pipeline.id} stripPrefix="pipe_" showChars={8} copyable />
                    <span className="pipeline-booster-count">
                        {(pipeline.enrichers?.length ?? 0)} Booster{(pipeline.enrichers?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="pipeline-card-actions">
                    <label className="pipeline-toggle-container">
                        <input
                            type="checkbox"
                            checked={!pipeline.disabled}
                            onChange={(e) => onToggleDisabled(!e.target.checked)}
                            disabled={toggling}
                            className="pipeline-toggle-checkbox"
                        />
                        <span className="pipeline-toggle-label">
                            {toggling ? 'Updating...' : (pipeline.disabled ? 'Disabled' : 'Enabled')}
                        </span>
                    </label>
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
    const { loading: registryLoading } = usePluginRegistry();
    const { pipelines, loading, refresh: refreshPipelines, fetchIfNeeded } = usePipelines();
    const { fetchIfNeeded: fetchIntegrations } = useIntegrations();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toggling, setToggling] = useState<string | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchIfNeeded();
        fetchIntegrations();
    }, [fetchIfNeeded, fetchIntegrations]);

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        const pipelineId = deleteConfirm;
        setDeleteConfirm(null);
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

    const handleToggleDisabled = async (pipelineId: string, disabled: boolean) => {
        setToggling(pipelineId);
        try {
            await api.patch(`/users/me/pipelines/${pipelineId}`, { disabled });
            await refreshPipelines();
        } catch (error) {
            console.error('Failed to toggle pipeline:', error);
        } finally {
            setToggling(null);
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Button variant="secondary" onClick={() => setShowImportModal(true)}>
                    📥 Import
                </Button>
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
                            onDelete={() => setDeleteConfirm(pipeline.id)}
                            onToggleDisabled={(disabled) => handleToggleDisabled(pipeline.id, disabled)}
                            deleting={deleting === pipeline.id}
                            toggling={toggling === pipeline.id}
                        />
                    ))}
                </div>
            )}

            {showImportModal && (
                <ImportPipelineModal
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => refreshPipelines()}
                />
            )}

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                title="Delete Pipeline"
                message="Are you sure you want to delete this pipeline? This action cannot be undone."
                confirmLabel="Delete"
                isDestructive={true}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm(null)}
                isLoading={!!deleting}
            />
        </PageLayout>
    );
};

export default PipelinesPage;
