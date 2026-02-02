import { useState } from 'react';
import { useRealtimeInputs, PendingInput } from '../hooks/useRealtimeInputs';
import { InputsService } from '../services/InputsService';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { usePluginLookup } from '../hooks/usePluginLookup';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { PageLayout, Stack } from '../components/library/layout';
import { DataList } from '../components/data/DataList';
import { Button, Pill, Paragraph, Heading, EmptyState, GlowCard, DashboardSummaryCard, useToast } from '../components/library/ui';
import { Select, Textarea, Input, FormField } from '../components/library/forms';
import { PipelineConfig } from '../state/pipelinesState';
import { HybridRaceTaggerInput } from '../components/forms/HybridRaceTaggerInput';

interface ParsedInputInfo {
    sourceName: string;
    sourceIcon: string;
    pipelineName: string;
    timestamp: string;
}

const getInputDisplayInfo = (
    input: PendingInput,
    pipelines: PipelineConfig[],
    getSourceInfo: (sourceId: string) => { name: string; icon: string }
): ParsedInputInfo => {
    const pipeline = input.pipelineId
        ? pipelines.find(p => p.id === input.pipelineId)
        : undefined;

    let sourceId = pipeline?.source?.toLowerCase() || '';
    if (!sourceId) {
        const [sourcePart] = (input.activityId || '').split(':');
        sourceId = sourcePart?.toLowerCase().replace('source_', '') || 'unknown';
    }
    sourceId = sourceId.replace('source_', '');

    const sourceInfo = getSourceInfo(sourceId);
    const sourceName = sourceInfo.name;
    const sourceIcon = sourceInfo.icon;
    const pipelineName = pipeline?.name || pipeline?.id || '';

    let timestamp = '';
    if (input.createdAt) {
        const date = new Date(input.createdAt);
        if (!isNaN(date.getTime())) {
            timestamp = date.toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
        }
    }

    return { sourceName, sourceIcon, pipelineName, timestamp };
};


const PendingInputsPage: React.FC = () => {
    const { inputs, loading, refresh } = useRealtimeInputs();
    const { enrichers } = usePluginRegistry();
    const { pipelines } = useRealtimePipelines();
    const { getSourceInfo } = usePluginLookup();
    const toast = useToast();

    const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
    const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());

    const handleInputChange = (activityId: string, field: string, value: string) => {
        setFormValues((prev) => ({
            ...prev,
            [activityId]: {
                ...(prev[activityId] || {}),
                [field]: value,
            },
        }));
    };

    const getFieldValue = (activityId: string, field: string) => {
        return formValues[activityId]?.[field] || '';
    };

    const handleSubmit = async (input: PendingInput) => {
        const activityId = input.activityId;
        const values = formValues[activityId] || {};

        const missingFields = input.requiredFields?.filter((f: string) => !values[f] || values[f].trim() === '');
        if (missingFields && missingFields.length > 0) {
            toast.warning('Missing Fields', `Please fill in: ${missingFields.join(', ')}`);
            return;
        }

        setSubmittingIds((prev) => {
            const next = new Set(prev);
            next.add(activityId);
            return next;
        });

        try {
            const success = await InputsService.resolveInput({
                activityId: input.activityId,
                inputData: values,
            });

            if (success) {
                toast.success('Input Resolved', 'Activity details submitted successfully');
                refresh();
                setFormValues((prev) => {
                    const next = { ...prev };
                    delete next[activityId];
                    return next;
                });
            }
        } catch (error) {
            toast.error('Submission Failed', 'Failed to submit details. Please try again.');
            console.error(error);
        } finally {
            setSubmittingIds((prev) => {
                const next = new Set(prev);
                next.delete(activityId);
                return next;
            });
        }
    };

    const handleDismiss = async (activityId: string) => {
        if (!confirm('Are you sure you want to dismiss this input request? The activity might remain unsynchronized.')) {
            return;
        }

        setSubmittingIds((prev) => {
            const next = new Set(prev);
            next.add(activityId);
            return next;
        });

        try {
            const success = await InputsService.dismissInput(activityId);
            if (success) {
                toast.success('Input Dismissed', 'The pending input has been dismissed');
                refresh();
                setFormValues((prev) => {
                    const next = { ...prev };
                    delete next[activityId];
                    return next;
                });
            }
        } catch {
            toast.error('Dismiss Failed', 'Failed to dismiss input. Please try again.');
        } finally {
            setSubmittingIds((prev) => {
                const next = new Set(prev);
                next.delete(activityId);
                return next;
            });
        }
    };

    const renderField = (activityId: string, field: string) => {
        const value = getFieldValue(activityId, field);

        if (field === 'activity_type') {
            return (
                <Select
                    value={value}
                    onChange={(e) => handleInputChange(activityId, field, e.target.value)}
                    options={[
                        { value: '', label: 'Select Type...' },
                        { value: 'RUN', label: 'Run' },
                        { value: 'RIDE', label: 'Ride' },
                        { value: 'WEIGHT_TRAINING', label: 'Weight Training' },
                        { value: 'WORKOUT', label: 'Workout' },
                    ]}
                />
            );
        }

        if (field === 'description') {
            return (
                <Textarea
                    placeholder="Enter description..."
                    value={value}
                    onChange={(e) => handleInputChange(activityId, field, e.target.value)}
                    rows={3}
                />
            );
        }

        // Hybrid race preset selection field
        if (field === 'race_selection') {
            // Get the current input to access providerMetadata
            const currentInput = inputs.find(i => i.activityId === activityId);
            const lapsJson = currentInput?.providerMetadata?.laps || '[]';
            const presetsJson = currentInput?.providerMetadata?.presets || '[]';

            return (
                <HybridRaceTaggerInput
                    lapsJson={lapsJson}
                    presetsJson={presetsJson}
                    value={value}
                    onChange={(newValue) => handleInputChange(activityId, field, newValue)}
                />
            );
        }

        // File upload field for FIT files
        if (field === 'fit_file_base64') {
            const hasFile = value && value.length > 0;
            return (
                <Stack gap="sm">
                    <input
                        type="file"
                        accept=".fit"
                        style={{
                            display: 'block',
                            padding: 'var(--spacing-sm)',
                            border: '1px dashed var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-surface-secondary)',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const base64 = (reader.result as string).split(',')[1];
                                    handleInputChange(activityId, field, base64 || '');
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    {hasFile && (
                        <Paragraph size="sm" muted>
                            ✓ FIT file loaded ({Math.round(value.length / 1024)}KB)
                        </Paragraph>
                    )}
                </Stack>
            );
        }

        return (
            <Input
                type="text"
                placeholder={`Enter ${field}...`}
                value={value}
                onChange={(e) => handleInputChange(activityId, field, e.target.value)}
            />
        );
    };

    const formatLabel = (field: string) => {
        // Special case for FIT file upload
        if (field === 'fit_file_base64') {
            return 'Heart Rate FIT File';
        }
        // Special case for hybrid race preset selection
        if (field === 'race_selection') {
            return 'Select Race Type';
        }
        return field
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    return (
        <PageLayout
            title="Action Required"
            backTo="/"
            backLabel="Dashboard"
            onRefresh={refresh}
            loading={loading}
        >
            <DashboardSummaryCard
                title="Pending Items"
                icon="⏳"
                showLink={false}
                footerText={inputs.length > 0 ? `${inputs.length} pending` : undefined}
            >
                <DataList
                    items={inputs}
                    loading={loading}
                    loadingMessage="Checking for pending items..."

                    keyExtractor={(input) => input.id}
                    renderItem={(input) => {
                        const displayInfo = getInputDisplayInfo(input, pipelines, getSourceInfo);
                        const isAutoPopulated = input.autoPopulated === true;
                        const autoDeadline = input.autoDeadline ? new Date(input.autoDeadline) : null;
                        const enricherId = input.enricherProviderId || '';
                        const enricherInfo = enrichers.find(e => e.id === enricherId.toLowerCase());
                        const enricherName = enricherInfo?.name || (enricherId ? enricherId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unknown Enricher');

                        const getTimeRemaining = () => {
                            if (!autoDeadline) return null;
                            const now = new Date();
                            const diff = autoDeadline.getTime() - now.getTime();
                            if (diff <= 0) return 'Overdue';
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h remaining`;
                            if (hours > 0) return `${hours}h ${minutes}m remaining`;
                            return `${minutes}m remaining`;
                        };

                        return (
                            <GlowCard
                                variant={isAutoPopulated ? 'awaiting' : 'needs-input'}
                                header={
                                    <Stack direction="horizontal" align="center" justify="between">
                                        <Stack direction="horizontal" align="center" gap="sm">
                                            <Paragraph inline>{displayInfo.sourceIcon}</Paragraph>
                                            <Stack gap="xs">
                                                <Paragraph inline>{displayInfo.sourceName}</Paragraph>
                                                {displayInfo.pipelineName && (
                                                    <Paragraph inline muted size="sm">via {displayInfo.pipelineName}</Paragraph>
                                                )}
                                            </Stack>
                                        </Stack>
                                        {isAutoPopulated ? (
                                            <Pill variant="info">
                                                Awaiting {enricherName.charAt(0).toUpperCase() + enricherName.slice(1)} Results
                                            </Pill>
                                        ) : (
                                            <Pill variant="warning">
                                                Needs Info
                                            </Pill>
                                        )}
                                    </Stack>
                                }
                            >

                                {isAutoPopulated && (
                                    <Stack direction="horizontal" gap="sm">
                                        <Paragraph inline>⏳</Paragraph>
                                        <Stack gap="xs">
                                            <Paragraph bold>Waiting for official results</Paragraph>
                                            <Paragraph muted size="sm">
                                                Your activity was synced successfully. We&apos;re waiting for official {enricherName} results to be published.
                                            </Paragraph>
                                            {autoDeadline && (
                                                <Paragraph size="sm">
                                                    {getTimeRemaining()}
                                                </Paragraph>
                                            )}
                                        </Stack>
                                    </Stack>
                                )}

                                {!isAutoPopulated && (
                                    <Stack gap="md">
                                        <Heading level={4}>
                                            ✨ Complete the magic
                                        </Heading>
                                        {input.requiredFields?.map((field) => (
                                            <FormField key={field} label={formatLabel(field)} htmlFor={`field-${field}`}>
                                                {renderField(input.activityId, field)}
                                            </FormField>
                                        ))}
                                    </Stack>
                                )}

                                {isAutoPopulated && autoDeadline && new Date() > autoDeadline && (
                                    <Stack gap="md">
                                        <Heading level={4}>
                                            📝 Enter results manually
                                        </Heading>
                                        <Paragraph muted size="sm">
                                            Automatic results weren&apos;t found. You can enter your results manually below.
                                        </Paragraph>
                                        {input.requiredFields?.map((field) => (
                                            <FormField key={field} label={formatLabel(field)} htmlFor={`field-${field}`}>
                                                {renderField(input.activityId, field)}
                                            </FormField>
                                        ))}
                                    </Stack>
                                )}

                                <Stack gap="sm">
                                    {!isAutoPopulated || (autoDeadline && new Date() > autoDeadline) ? (
                                        <>
                                            <Button
                                                variant="primary"
                                                fullWidth
                                                onClick={() => handleSubmit(input)}
                                                disabled={submittingIds.has(input.activityId)}
                                            >
                                                {submittingIds.has(input.activityId) ? '✨ Syncing...' : '✨ Complete & Sync'}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleDismiss(input.activityId)}
                                                disabled={submittingIds.has(input.activityId)}
                                            >
                                                Dismiss
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleDismiss(input.activityId)}
                                            disabled={submittingIds.has(input.activityId)}
                                        >
                                            Don&apos;t wait - dismiss this
                                        </Button>
                                    )}
                                </Stack>

                                {input.createdAt && (
                                    <Paragraph muted size="sm" centered>
                                        Created: {new Date(input.createdAt).toLocaleString()}
                                    </Paragraph>
                                )}
                            </GlowCard>
                        );
                    }}

                    emptyState={
                        <EmptyState
                            icon="🎉"
                            title="All Caught Up!"
                            description="There are no activities waiting for your input right now."
                            actionLabel="Check Again"
                            onAction={refresh}
                        />
                    }
                />
            </DashboardSummaryCard>
        </PageLayout>
    );
};

export default PendingInputsPage;
