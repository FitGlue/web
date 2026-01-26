import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, Button, Heading, Paragraph, CardSkeleton, ConfirmDialog, BoosterPill, IdBadge, Badge } from '../components/library/ui';
import { Checkbox } from '../components/library/forms';
import { useApi } from '../hooks/useApi';
import { usePipelines } from '../hooks/usePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { usePluginLookup } from '../hooks/usePluginLookup';
import { useIntegrations } from '../hooks/useIntegrations';
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


    return (
        <Card variant={pipeline.disabled ? 'default' : 'interactive'}>
            {pipeline.name && (
                <Stack direction="horizontal" align="center" justify="between">
                    <Heading level={4}>{pipeline.name}</Heading>
                    {pipeline.disabled && <Badge variant="default">Disabled</Badge>}
                </Stack>
            )}
            <Stack direction="horizontal" align="center" gap="md">
                <Stack align="center" gap="xs">
                    <Paragraph size="lg">{getSourceIcon(pipeline.source)}</Paragraph>
                    <Paragraph size="sm">{getSourceName(pipeline.source)}</Paragraph>
                </Stack>

                <Paragraph>→</Paragraph>

                {(pipeline.enrichers?.length ?? 0) > 0 && (
                    <>
                        <Stack direction="horizontal" gap="xs">
                            {(pipeline.enrichers ?? []).map((e, i) => (
                                <BoosterPill
                                    key={i}
                                    order={i + 1}
                                    icon={getEnricherIcon(e.providerType)}
                                    name={getEnricherName(e.providerType)}
                                    isConfigured={!!(e.typedConfig && Object.keys(e.typedConfig).length > 0)}
                                />
                            ))}
                        </Stack>
                        <Paragraph>→</Paragraph>
                    </>
                )}

                <Stack gap="xs">
                    {pipeline.destinations.map((dest, i) => (
                        <Stack key={i} direction="horizontal" align="center" gap="xs">
                            <Paragraph>{getDestinationIcon(dest)}</Paragraph>
                            <Paragraph size="sm">{getDestinationName(dest)}</Paragraph>
                        </Stack>
                    ))}
                </Stack>
            </Stack>

            <Stack direction="horizontal" align="center" justify="between">
                <Stack direction="horizontal" align="center" gap="sm">
                    <IdBadge id={pipeline.id} stripPrefix="pipe_" showChars={8} copyable />
                    <Paragraph size="sm" muted>
                        {(pipeline.enrichers?.length ?? 0)} Booster{(pipeline.enrichers?.length ?? 0) !== 1 ? 's' : ''}
                    </Paragraph>
                </Stack>
                <Stack direction="horizontal" align="center" gap="sm">
                    <Checkbox
                        checked={!pipeline.disabled}
                        onChange={(e) => onToggleDisabled(!e.target.checked)}
                        disabled={toggling}
                        label={toggling ? 'Updating...' : (pipeline.disabled ? 'Disabled' : 'Enabled')}
                    />
                    <Button variant="secondary" onClick={onEdit}>
                        Edit
                    </Button>
                    <Button variant="danger" onClick={onDelete} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </Stack>
            </Stack>
        </Card>
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
                <Grid cols={2} gap="md">
                    <CardSkeleton variant="pipeline-full" />
                    <CardSkeleton variant="pipeline-full" />
                </Grid>
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
            <Stack direction="horizontal" justify="end" gap="sm">
                <Button variant="secondary" onClick={() => setShowImportModal(true)}>
                    📥 Import
                </Button>
                <Button variant="primary" onClick={() => navigate('/settings/pipelines/new')}>
                    + New Pipeline
                </Button>
            </Stack>

            {pipelines.length === 0 ? (
                <Card>
                    <Stack align="center" gap="md">
                        <Paragraph size="lg">🔀</Paragraph>
                        <Heading level={3}>No Pipelines Configured</Heading>
                        <Paragraph centered muted>Pipelines define how your activities flow from sources to destinations.</Paragraph>
                        <Button variant="primary" onClick={() => navigate('/settings/pipelines/new')}>
                            Create Your First Pipeline
                        </Button>
                    </Stack>
                </Card>
            ) : (
                <Grid cols={2} gap="md">
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
                </Grid>
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
