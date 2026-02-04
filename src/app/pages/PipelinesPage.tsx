import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout, Stack } from '../components/library/layout';
import { Card, Button, Heading, Paragraph, CardSkeleton, ConfirmDialog, IdBadge, Badge, GlowCard, FlowVisualization, BoosterGrid, Pill, useToast } from '../components/library/ui';

import { useApi } from '../hooks/useApi';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { usePluginLookup } from '../hooks/usePluginLookup';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useNerdMode } from '../state/NerdModeContext';
import { ImportPipelineModal } from '../components/ImportPipelineModal';
import '../components/library/ui/CardSkeleton.css';


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
    const { getSourceIcon, getSourceName, getEnricherIcon, getEnricherName, getDestinationIcon, getDestinationName } = usePluginLookup();
    const { isNerdMode } = useNerdMode();

    const boosterCount = pipeline.enrichers?.length ?? 0;

    // Header content for GlowCard - matches EnrichedActivityCard style
    const headerContent = (
        <Stack direction="horizontal" align="center" justify="between">
            <Stack direction="horizontal" gap="sm" align="center" wrap>
                <Heading level={4}>{pipeline.name || 'Unnamed Pipeline'}</Heading>
                {isNerdMode && <IdBadge id={pipeline.id} stripPrefix="pipe_" showChars={8} copyable />}
                {boosterCount > 0 && (
                    <Pill variant="gradient" size="small">{boosterCount} Booster{boosterCount !== 1 ? 's' : ''}</Pill>
                )}
            </Stack>
            {pipeline.disabled && <Badge variant="default">Disabled</Badge>}
        </Stack>
    );

    // Source node for FlowVisualization
    const sourceNode = (
        <Badge variant="source" size="sm">
            <Stack direction="horizontal" gap="xs" align="center">
                <Paragraph inline>{getSourceIcon(pipeline.source)}</Paragraph>
                <Paragraph inline size="sm">{getSourceName(pipeline.source)}</Paragraph>
            </Stack>
        </Badge>
    );

    // Enrichers/boosters in the center - horizontal wrapped badges like EnrichedActivityCard
    const centerNode = (
        <BoosterGrid emptyText="No boosters">
            {(pipeline.enrichers ?? []).map((e, i) => (
                <Badge key={i} variant="booster" size="sm">
                    <Stack direction="horizontal" gap="xs" align="center">
                        <Paragraph inline>{getEnricherIcon(e.providerType)}</Paragraph>
                        <Paragraph inline size="sm">{getEnricherName(e.providerType)}</Paragraph>
                    </Stack>
                </Badge>
            ))}
        </BoosterGrid>
    );

    // Destination node(s) for FlowVisualization
    const destinationNode = pipeline.destinations.length > 0 ? (
        <Stack direction="horizontal" gap="xs">
            {pipeline.destinations.map((dest, i) => (
                <Badge key={i} variant="destination" size="sm">
                    <Stack direction="horizontal" gap="xs" align="center">
                        <Paragraph inline>{getDestinationIcon(dest)}</Paragraph>
                        <Paragraph inline size="sm">{getDestinationName(dest)}</Paragraph>
                    </Stack>
                </Badge>
            ))}
        </Stack>
    ) : (
        <Badge variant="default" size="sm">
            <Stack direction="horizontal" gap="xs" align="center">
                <Paragraph inline>🚀</Paragraph>
                <Paragraph inline size="sm">No destinations</Paragraph>
            </Stack>
        </Badge>
    );

    return (
        <GlowCard
            variant="premium"
            header={headerContent}
            disabled={pipeline.disabled}
        >
            {/* Flow Visualization: Source → Boosters → Destination */}
            <FlowVisualization
                source={sourceNode}
                center={centerNode}
                destination={destinationNode}
            />

            {/* Actions footer */}
            <Stack direction="horizontal" align="center" justify="end" gap="sm">
                <Button
                    variant={pipeline.disabled ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => onToggleDisabled(!pipeline.disabled)}
                    disabled={toggling}
                >
                    {toggling ? 'Updating...' : (pipeline.disabled ? 'Enable' : 'Disable')}
                </Button>
                <Button variant="secondary" size="small" onClick={onEdit}>
                    Edit
                </Button>
                <Button variant="danger" size="small" onClick={onDelete} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Delete'}
                </Button>
            </Stack>
        </GlowCard>
    );
};


const PipelinesPage: React.FC = () => {
    const api = useApi();
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const { loading: registryLoading } = usePluginRegistry();
    const { pipelines, loading, refresh: refreshPipelines } = useRealtimePipelines();
    // Realtime integrations auto-subscribes - no manual fetch needed
    useRealtimeIntegrations();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toggling, setToggling] = useState<string | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importCode, setImportCode] = useState<string | undefined>(undefined);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Check for ?code= query param on mount
    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setImportCode(code);
            setShowImportModal(true);
            // Clear the query param from URL
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
            await api.delete(`/users/me/pipelines/${pipelineId}`);
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
            await api.patch(`/users/me/pipelines/${pipelineId}`, { disabled });
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

    if (loading || registryLoading) {
        return (
            <PageLayout title="Pipelines" backTo="/" backLabel="Dashboard">
                <Card>
                    <Stack gap="lg">
                        {/* Skeleton header */}
                        <Stack direction="horizontal" justify="between" align="center">
                            <Stack gap="xs">
                                <Heading level={3}>🔀 Your Pipelines</Heading>
                                <Paragraph muted size="sm">Configure how your activities flow from sources to destinations</Paragraph>
                            </Stack>
                            <Stack direction="horizontal" gap="sm">
                                <Button variant="secondary" size="small" disabled>
                                    📥 Import
                                </Button>
                                <Button variant="primary" size="small" disabled>
                                    + New Pipeline
                                </Button>
                            </Stack>
                        </Stack>

                        {/* Skeleton pipeline cards */}
                        <Stack gap="md">
                            <CardSkeleton variant="pipeline-full" />
                            <CardSkeleton variant="pipeline-full" />
                        </Stack>
                    </Stack>
                </Card>
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
            <Card>
                <Stack gap="lg">
                    {/* Header with title and actions */}
                    <Stack direction="horizontal" justify="between" align="center">
                        <Stack gap="xs">
                            <Heading level={3}>🔀 Your Pipelines</Heading>
                            <Paragraph muted size="sm">Configure how your activities flow from sources to destinations</Paragraph>
                        </Stack>
                        <Stack direction="horizontal" gap="sm">
                            <Button variant="secondary" size="small" onClick={() => {
                                setImportCode(undefined);
                                setShowImportModal(true);
                            }}>
                                📥 Import
                            </Button>
                            <Button variant="primary" size="small" onClick={() => navigate('/settings/pipelines/new')}>
                                + New Pipeline
                            </Button>
                        </Stack>
                    </Stack>

                    {/* Pipeline list */}
                    {pipelines.length === 0 ? (
                        <Stack align="center" gap="md">
                            <Paragraph size="lg">🔀</Paragraph>
                            <Heading level={4}>No Pipelines Configured</Heading>
                            <Paragraph centered muted>Create your first pipeline to start automating your fitness data.</Paragraph>
                            <Button variant="primary" onClick={() => navigate('/settings/pipelines/new')}>
                                Create Your First Pipeline
                            </Button>
                        </Stack>
                    ) : (
                        <Stack gap="md">
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
                        </Stack>
                    )}
                </Stack>
            </Card>

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
