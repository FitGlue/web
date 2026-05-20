import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { CardSkeleton, Button, Badge, EmptyState, ConfirmDialog, IdBadge, useToast } from '../components/library/ui';

import { client } from '../../shared/api/client';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { SmartNudge } from '../components/SmartNudge';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { usePluginLookup } from '../hooks/usePluginLookup';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useNerdMode } from '../state/NerdModeContext';
import { ImportPipelineModal } from '../components/ImportPipelineModal';
import '../components/library/ui/CardSkeleton.css';
import './PipelinesPage.css';


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
    onDuplicate: () => void;
    onToggleDisabled: (disabled: boolean) => void;
    deleting: boolean;
    toggling: boolean;
    duplicating: boolean;
}

const PipelineCard: React.FC<PipelineCardProps> = ({
    pipeline,
    onEdit,
    onDelete,
    onDuplicate,
    onToggleDisabled,
    deleting,
    toggling,
    duplicating,
}) => {
    const { getSourceIcon, getSourceName, getEnricherIcon, getEnricherName, getDestinationIcon, getDestinationName } = usePluginLookup();
    const { isNerdMode } = useNerdMode();

    const boosterCount = pipeline.enrichers?.length ?? 0;

    return (
        <div className={`pipe-card${pipeline.disabled ? ' pipe-card--disabled' : ''}`}>
            {/* Header */}
            <div className="pipe-card__head">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                    <span className="pipe-card__name">{pipeline.name || 'UNNAMED PIPELINE'}</span>
                    {isNerdMode && <IdBadge id={pipeline.id} stripPrefix="pipe_" showChars={8} copyable />}
                    {boosterCount > 0 && (
                        <Badge>{boosterCount} BOOSTER{boosterCount !== 1 ? 'S' : ''}</Badge>
                    )}
                </div>
                <div className="pipe-card__head-right">
                    {pipeline.disabled && <Badge variant="light">DISABLED</Badge>}
                </div>
            </div>

            {/* Flow: source → boosters → destinations */}
            <div className="pipe-card__flow">
                {/* Source */}
                <div>
                    <div className="pipe-card__flow-label">SOURCE</div>
                    <div className="pipe-card__chips">
                        <span className="fg-booster-chip fg-booster-chip--done">
                            <span className="fg-booster-chip__emoji">{getSourceIcon(pipeline.source)}</span>
                            {getSourceName(pipeline.source)}
                        </span>
                    </div>
                </div>

                <span className="pipe-card__flow-arrow">→</span>

                {/* Boosters */}
                <div>
                    <div className="pipe-card__flow-label">BOOSTERS</div>
                    <div className="pipe-card__chips">
                        {(pipeline.enrichers ?? []).length === 0 ? (
                            <span className="fg-booster-chip" style={{ color: 'var(--color-text-muted)' }}>NONE</span>
                        ) : (
                            (pipeline.enrichers ?? []).map((e, i) => (
                                <span key={i} className="fg-booster-chip">
                                    <span className="fg-booster-chip__emoji">{getEnricherIcon(e.providerType)}</span>
                                    {getEnricherName(e.providerType)}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <span className="pipe-card__flow-arrow">→</span>

                {/* Destinations */}
                <div>
                    <div className="pipe-card__flow-label">DESTINATIONS</div>
                    <div className="pipe-card__chips">
                        {pipeline.destinations.length === 0 ? (
                            <span className="fg-booster-chip" style={{ color: 'var(--color-text-muted)' }}>NONE</span>
                        ) : (
                            pipeline.destinations.map((dest, i) => (
                                <span key={i} className="fg-booster-chip">
                                    <span className="fg-booster-chip__emoji">{getDestinationIcon(dest)}</span>
                                    {getDestinationName(dest)}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Footer actions */}
            <div className="pipe-card__foot">
                <Button
                    variant={pipeline.disabled ? 'primary' : 'ink'}
                    size="sm"
                    onClick={() => onToggleDisabled(!pipeline.disabled)}
                    disabled={toggling}
                >
                    {toggling ? 'UPDATING…' : (pipeline.disabled ? 'ENABLE' : 'DISABLE')}
                </Button>
                <Button variant="ink" size="sm" onClick={onEdit}>
                    EDIT
                </Button>
                <Button
                    variant="ink"
                    size="sm"
                    onClick={onDuplicate}
                    disabled={duplicating}
                >
                    {duplicating ? 'DUPLICATING…' : 'DUPLICATE'}
                </Button>
                <Button
                    variant="danger"
                    size="sm"
                    onClick={onDelete}
                    disabled={deleting}
                >
                    {deleting ? 'DELETING…' : 'DELETE'}
                </Button>
            </div>
        </div>
    );
};


type PipelineFilter = 'all' | 'active' | 'disabled' | 'archived';

const PIPELINE_FILTER_LABELS: Record<PipelineFilter, string> = {
    all: 'ALL',
    active: 'ACTIVE',
    disabled: 'DISABLED',
    archived: 'ARCHIVED',
};

const PipelinesPage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { loading: registryLoading } = usePluginRegistry();
    const { pipelines, loading, refresh: refreshPipelines } = useRealtimePipelines();
    useRealtimeIntegrations();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toggling, setToggling] = useState<string | null>(null);
    const [duplicating, setDuplicating] = useState<string | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importCode, setImportCode] = useState<string | undefined>(undefined);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const activeFilter = (searchParams.get('filter') as PipelineFilter) || 'all';

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setImportCode(code);
            setShowImportModal(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        const pipelineId = deleteConfirm;
        const pipeline = pipelines.find(p => p.id === pipelineId);
        setDeleteConfirm(null);
        setDeleting(pipelineId);
        try {
            await client.DELETE('/users/me/pipelines/{id}', { params: { path: { id: pipelineId } } });
            await refreshPipelines();
            toast.success('Pipeline Deleted', `"${pipeline?.name || 'Pipeline'}" has been deleted`);
        } catch (error) {
            console.error('Failed to delete pipeline:', error);
            toast.error('Delete Failed', 'Failed to delete pipeline. Please try again.');
        } finally {
            setDeleting(null);
        }
    };

    const handleToggleDisabled = async (pipelineId: string, disabled: boolean) => {
        setToggling(pipelineId);
        const pipeline = pipelines.find(p => p.id === pipelineId);
        try {
            await client.PUT('/users/me/pipelines/{id}', { params: { path: { id: pipelineId } }, body: { disabled } as never });
            await refreshPipelines();
            toast.success(
                disabled ? 'Pipeline Disabled' : 'Pipeline Enabled',
                `"${pipeline?.name || 'Pipeline'}" has been ${disabled ? 'disabled' : 'enabled'}`
            );
        } catch (error) {
            console.error('Failed to toggle pipeline:', error);
            toast.error('Update Failed', 'Failed to update pipeline. Please try again.');
        } finally {
            setToggling(null);
        }
    };

    const handleDuplicate = async (pipeline: PipelineConfig) => {
        setDuplicating(pipeline.id);
        try {
            const copyName = `${pipeline.name || 'Unnamed Pipeline'} (Copy)`;
            await client.POST('/users/me/pipelines', {
                body: {
                    name: copyName,
                    source: pipeline.source,
                    enrichers: pipeline.enrichers ?? [],
                    destinations: pipeline.destinations,
                } as never,
            });
            await refreshPipelines();
            toast.success('Pipeline Duplicated', `"${copyName}" has been created`);
        } catch (error) {
            console.error('Failed to duplicate pipeline:', error);
            toast.error('Duplicate Failed', 'Failed to duplicate pipeline. Please try again.');
        } finally {
            setDuplicating(null);
        }
    };

    const setFilter = (f: PipelineFilter) => {
        setSearchParams(f === 'all' ? {} : { filter: f });
    };

    const filteredPipelines = pipelines.filter(p => {
        switch (activeFilter) {
            case 'active': return !p.disabled;
            case 'disabled': return !!p.disabled;
            case 'archived': return false; // archived not yet in proto; show empty
            default: return true;
        }
    });

    const counts: Record<PipelineFilter, number> = {
        all: pipelines.length,
        active: pipelines.filter(p => !p.disabled).length,
        disabled: pipelines.filter(p => !!p.disabled).length,
        archived: 0,
    };

    if (loading || registryLoading) {
        return (
            <PageLayout title="Pipelines" backTo="/" backLabel="Dashboard">
                <div className="fg-band">
                    <span className="fg-band__label">YOUR PIPELINES</span>
                    <span className="fg-band__right">LOADING…</span>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
            <SmartNudge page="pipelines" />

            {/* Header band */}
            <div className="fg-band">
                <span className="fg-band__label">YOUR PIPELINES</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        variant="ink"
                        size="sm"
                        onClick={() => { setImportCode(undefined); setShowImportModal(true); }}
                    >
                        📥 IMPORT
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => navigate('/settings/pipelines/new')}
                    >
                        + NEW PIPELINE
                    </Button>
                </div>
            </div>

            {/* Filter strip — only show when there are pipelines */}
            {pipelines.length > 0 && (
                <div className="pipelines-filter">
                    {(Object.keys(PIPELINE_FILTER_LABELS) as PipelineFilter[]).map(f => (
                        <button
                            key={f}
                            className={`pipelines-filter__chip${activeFilter === f ? ' pipelines-filter__chip--active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {PIPELINE_FILTER_LABELS[f]}
                            <span className="pipelines-filter__chip-count">{counts[f]}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Pipeline list or empty state */}
            {pipelines.length === 0 ? (
                <EmptyState
                    icon="🔀"
                    title="NO PIPELINES CONFIGURED"
                    description="Create your first pipeline to start automating your fitness data."
                    actionLabel="CREATE YOUR FIRST PIPELINE →"
                    onAction={() => navigate('/settings/pipelines/new')}
                />
            ) : filteredPipelines.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title={`NO ${PIPELINE_FILTER_LABELS[activeFilter]} PIPELINES`}
                    description={`No pipelines match the "${PIPELINE_FILTER_LABELS[activeFilter]}" filter.`}
                />
            ) : (
                <div>
                    {filteredPipelines.map(pipeline => (
                        <PipelineCard
                            key={pipeline.id}
                            pipeline={pipeline}
                            onEdit={() => navigate(`/settings/pipelines/${pipeline.id}/edit`)}
                            onDelete={() => setDeleteConfirm(pipeline.id)}
                            onDuplicate={() => handleDuplicate(pipeline)}
                            onToggleDisabled={(disabled) => handleToggleDisabled(pipeline.id, disabled)}
                            deleting={deleting === pipeline.id}
                            toggling={toggling === pipeline.id}
                            duplicating={duplicating === pipeline.id}
                        />
                    ))}
                </div>
            )}

            {showImportModal && (
                <ImportPipelineModal
                    onClose={() => {
                        setShowImportModal(false);
                        setImportCode(undefined);
                    }}
                    onSuccess={() => refreshPipelines()}
                    initialCode={importCode}
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
