import { useState } from 'react';
import { useRealtimeInputs, PendingInput } from '../hooks/useRealtimeInputs';
import { InputsService } from '../services/InputsService';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { usePluginLookup } from '../hooks/usePluginLookup';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { Button, CountdownRing, useToast } from '../components/library/ui';
import { Select, Textarea, Input, FormField, FileInput } from '../components/library/forms';
import { PageLayout } from '../components/library/layout';
import { PipelineConfig } from '../state/pipelinesState';
import { HybridRaceTaggerInput } from '../components/forms/HybridRaceTaggerInput';
import { PhotoUploadInput } from '../components/forms/PhotoUploadInput';
import { WorkoutEntryInput } from '../components/forms/WorkoutEntryInput';
import './PendingInputsPage.css';


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

    // Prefer the stored source field; fall back to pipeline config, then activityId prefix parsing.
    let sourceId = pipeline?.source?.toLowerCase() || '';
    if (!sourceId && input.sourceActivitySource) {
        sourceId = input.sourceActivitySource.toLowerCase().replace(/^source_/, '');
    }
    if (!sourceId) {
        const [sourcePart] = (input.activityId || '').split(':');
        sourceId = sourcePart?.toLowerCase().replace('source_', '') || 'unknown';
    }
    sourceId = sourceId.replace('source_', '');

    const sourceInfo = getSourceInfo(sourceId);
    const pipelineName = pipeline?.name || pipeline?.id || '';

    let timestamp = '';
    if (input.createdAt) {
        timestamp = input.createdAt.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    }

    return { sourceName: sourceInfo.name, sourceIcon: sourceInfo.icon, pipelineName, timestamp };
};

const ACTIVITY_TYPE_ICONS: Record<string, string> = {
    RUN: '🏃',
    RIDE: '🚴',
    SWIM: '🏊',
    WALK: '🚶',
    HIKE: '🥾',
    WEIGHT_TRAINING: '🏋️',
    WORKOUT: '💪',
    ROWING: '🚣',
    TENNIS: '🎾',
    GOLF: '⛳',
    YOGA: '🧘',
    SKIING: '⛷️',
    SNOWBOARDING: '🏂',
};

const formatSourceStartTime = (value: Date | undefined): string => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const isUrgent = (deadline?: Date | null): boolean => {
    if (!deadline) return false;
    return deadline.getTime() - Date.now() < 3600 * 1000;
};

const formatAutoDeadline = (deadline?: Date | null): string | null => {
    if (!deadline) return null;
    return deadline.toLocaleString(undefined, {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
    });
};


const PendingInputsPage: React.FC = () => {
    const { inputs, loading, refresh } = useRealtimeInputs();
    const { enrichers } = usePluginRegistry();
    const { pipelines } = useRealtimePipelines();
    const { getSourceInfo } = usePluginLookup();
    const toast = useToast();

    const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
    const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());
    const [fileNames, setFileNames] = useState<Record<string, { name: string; size: number }>>({});

    const handleInputChange = (activityId: string, field: string, value: string) => {
        setFormValues((prev) => ({
            ...prev,
            [activityId]: { ...(prev[activityId] || {}), [field]: value },
        }));
    };

    const getFieldValue = (activityId: string, field: string) =>
        formValues[activityId]?.[field] || '';

    const handleSubmit = async (input: PendingInput) => {
        const activityId = input.activityId;
        const values = formValues[activityId] || {};
        const missingFields = input.requiredFields?.filter((f: string) => !values[f] || values[f].trim() === '');
        if (missingFields && missingFields.length > 0) {
            toast.warning('Missing Fields', `Please fill in: ${missingFields.map(f => formatLabel(f, input)).join(', ')}`);
            return;
        }
        setSubmittingIds(prev => { const next = new Set(prev); next.add(activityId); return next; });
        try {
            const success = await InputsService.resolveInput({ activityId, inputData: values });
            if (success) {
                toast.success('Input Resolved', 'Activity details submitted successfully');
                refresh();
                setFormValues(prev => { const next = { ...prev }; delete next[activityId]; return next; });
            }
        } catch (error) {
            toast.error('Submission Failed', 'Failed to submit details. Please try again.');
            console.error(error);
        } finally {
            setSubmittingIds(prev => { const next = new Set(prev); next.delete(activityId); return next; });
        }
    };

    const handleNoExercises = async (activityId: string) => {
        setSubmittingIds(prev => { const next = new Set(prev); next.add(activityId); return next; });
        try {
            const success = await InputsService.resolveInput({ activityId, inputData: { workout_data: '[]' } });
            if (success) {
                toast.success('Got it', 'Activity synced without exercise data');
                refresh();
                setFormValues(prev => { const next = { ...prev }; delete next[activityId]; return next; });
            }
        } catch {
            toast.error('Failed', 'Failed to submit. Please try again.');
        } finally {
            setSubmittingIds(prev => { const next = new Set(prev); next.delete(activityId); return next; });
        }
    };

    const handleDismiss = async (activityId: string) => {
        if (!confirm('Are you sure you want to dismiss this input request? The activity might remain unsynchronized.')) {
            return;
        }
        setSubmittingIds(prev => { const next = new Set(prev); next.add(activityId); return next; });
        try {
            const success = await InputsService.dismissInput(activityId);
            if (success) {
                toast.success('Input Dismissed', 'The pending input has been dismissed');
                refresh();
                setFormValues(prev => { const next = { ...prev }; delete next[activityId]; return next; });
            }
        } catch {
            toast.error('Dismiss Failed', 'Failed to dismiss input. Please try again.');
        } finally {
            setSubmittingIds(prev => { const next = new Set(prev); next.delete(activityId); return next; });
        }
    };

    const renderField = (activityId: string, field: string) => {
        const value = getFieldValue(activityId, field);
        const currentInput = inputs.find(i => i.activityId === activityId);
        const fieldType = currentInput?.displayConfig?.fieldTypes?.[field] || '';

        if (fieldType.startsWith('custom:hybrid_race_tagger') || (!fieldType && field === 'race_selection')) {
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

        if (fieldType === 'photo_upload') {
            return (
                <PhotoUploadInput
                    activityId={activityId}
                    value={value}
                    onChange={(newValue) => handleInputChange(activityId, field, newValue)}
                />
            );
        }

        if (fieldType === 'workout_entry') {
            return (
                <WorkoutEntryInput
                    value={value}
                    onChange={(newValue) => handleInputChange(activityId, field, newValue)}
                />
            );
        }

        if (fieldType.startsWith('file') || (!fieldType && field === 'fit_file_base64')) {
            const acceptMatch = fieldType.match(/accept=([^,]+)/);
            const accept = acceptMatch?.[1] || '.fit';
            const fileInfo = fileNames[activityId];
            return (
                <FileInput
                    accept={accept}
                    placeholder={`Click to select ${accept} file`}
                    fileName={fileInfo?.name}
                    fileSize={fileInfo?.size}
                    onFileSelect={(file) => {
                        setFileNames(prev => ({ ...prev, [activityId]: { name: file.name, size: file.size } }));
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64 = (reader.result as string).split(',')[1];
                            handleInputChange(activityId, field, base64 || '');
                        };
                        reader.readAsDataURL(file);
                    }}
                />
            );
        }

        if (fieldType.startsWith('select') || (!fieldType && field === 'activity_type')) {
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

        if (fieldType.startsWith('textarea') || (!fieldType && field === 'description')) {
            const rowsMatch = fieldType.match(/rows=(\d+)/);
            const rows = rowsMatch ? parseInt(rowsMatch[1], 10) : 3;
            return (
                <Textarea
                    placeholder={`Enter ${formatLabel(field, currentInput)}...`}
                    value={value}
                    onChange={(e) => handleInputChange(activityId, field, e.target.value)}
                    rows={rows}
                />
            );
        }

        const placeholderMatch = fieldType.match(/placeholder=([^,]+)/);
        const placeholder = placeholderMatch ? placeholderMatch[1] : `Enter ${formatLabel(field, currentInput)}...`;
        return (
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleInputChange(activityId, field, e.target.value)}
            />
        );
    };

    const formatLabel = (field: string, input?: PendingInput) => {
        const serverLabel = input?.displayConfig?.fieldLabels?.[field];
        if (serverLabel) return serverLabel;
        return field.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const urgentCount = inputs.filter(i => isUrgent(i.autoDeadline)).length;

    const headerStats = inputs.length > 0 ? (
        <>
            <div className="page-header-stat">
                <span className="page-header-stat__value page-header-stat__value--gradient">
                    {inputs.length}
                </span>
                <span className="page-header-stat__label">Pending</span>
            </div>
            {urgentCount > 0 && (
                <div className="page-header-stat">
                    <span className="page-header-stat__value" style={{ color: 'var(--fg-rose)' }}>
                        {urgentCount}
                    </span>
                    <span className="page-header-stat__label">Urgent</span>
                </div>
            )}
        </>
    ) : undefined;

    return (
        <PageLayout
            title="Action Required"
            headerStats={headerStats}
            headerSubtitle="These activities are waiting on you. Fill in the missing info, or let the deadline tick down and we'll auto-populate where we can."
            headerActions={
                <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
                    {loading ? '…' : '⟲ REFRESH'}
                </Button>
            }
        >
            <div className="fg-band">
                <span className="fg-band__label">PENDING INPUTS</span>
                <span className="fg-band__right">
                    {inputs.length > 0 ? `${inputs.length} AWAITING INPUT` : 'ALL CLEAR'}
                </span>
            </div>

            {!loading && inputs.length === 0 && (
                <div className="pi-empty">
                    <div className="pi-empty__icon">🎉</div>
                    <div className="pi-empty__title">ALL CAUGHT UP</div>
                    <p className="pi-empty__sub">No activities waiting for your input right now.</p>
                    <Button variant="ghost" size="sm" onClick={refresh}>CHECK AGAIN</Button>
                </div>
            )}

            {inputs.length > 0 && (
                <div className="pi-grid">
                    {inputs.map((input) => {
                        const displayInfo = getInputDisplayInfo(input, pipelines, getSourceInfo);
                        const isAutoPopulated = input.autoPopulated === true;
                        const autoDeadline = input.autoDeadline ?? null;
                        const urgent = isUrgent(autoDeadline);
                        const enricherId = input.enricherProviderId || '';
                        const enricherInfo = enrichers.find(e => e.id === enricherId.toLowerCase());
                        const enricherName = enricherInfo?.name || (enricherId
                            ? enricherId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                            : 'Unknown Enricher');
                        const isSubmitting = submittingIds.has(input.activityId);
                        const deadlineLabel = formatAutoDeadline(autoDeadline);
                        const deadlinePassed = autoDeadline ? new Date() > autoDeadline : false;
                        const activityTypeRaw = input.sourceActivityType?.replace(/^ACTIVITY_TYPE_/, '') || '';
                        const activityIcon = ACTIVITY_TYPE_ICONS[activityTypeRaw] || '🏅';
                        const stampLabel = urgent ? '⚠ URGENT' : (activityTypeRaw || 'INPUT');

                        // Humanise "WEIGHT_TRAINING" → "Weight Training" for use in fallback titles.
                        const activityTypeHuman = activityTypeRaw
                            .toLowerCase()
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (c) => c.toUpperCase());

                        // When sourceDisplayName is empty, build "Source ActivityType" (e.g. "Hevy Weight Training").
                        const titleBase = input.sourceDisplayName
                            || [displayInfo.sourceName, activityTypeHuman].filter(Boolean).join(' ')
                            || 'Activity';

                        // Always append a short timestamp so multiple same-type inputs are distinguishable.
                        const titleTime = input.sourceStartTime
                            ? input.sourceStartTime.toLocaleString(undefined, {
                                day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
                              })
                            : '';
                        const titleText = titleTime ? `${titleBase} · ${titleTime}` : titleBase;

                        const metaSource = displayInfo.sourceName;
                        const metaTime = input.sourceStartTime ? formatSourceStartTime(input.sourceStartTime) : '';
                        const metaPipeline = displayInfo.pipelineName;

                        const showForm = !isAutoPopulated || deadlinePassed;

                        return (
                            <article key={input.id || input.activityId} className={`pi${urgent ? ' pi--urgent' : ''}`}>
                                <div className="pi__head">
                                    <CountdownRing
                                        deadline={autoDeadline}
                                        createdAt={input.createdAt}
                                        size={80}
                                    />
                                    <div>
                                        <div className="pi__title">
                                            {activityIcon} {titleText}
                                        </div>
                                        {(metaSource || metaTime || metaPipeline) && (
                                            <div className="pi__meta">
                                                {metaSource}
                                                {metaTime && ` · ${metaTime}`}
                                                {metaPipeline && <> · VIA <b>{metaPipeline}</b></>}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`pi__stamp${urgent ? ' pi__stamp--urgent' : ''}`}>
                                        {stampLabel}
                                    </span>
                                </div>

                                <div className="pi__why">
                                    <span className="pi__why-icon">
                                        {isAutoPopulated ? '⏸' : '✨'}
                                    </span>
                                    <div>
                                        {isAutoPopulated && !deadlinePassed ? (
                                            <>
                                                <b>{enricherName}</b> booster is waiting on official results.
                                                We auto-poll — usually posted within a few hours.
                                                {autoDeadline && <> Auto-populates by <b>{deadlineLabel}</b>.</>}
                                            </>
                                        ) : isAutoPopulated && deadlinePassed ? (
                                            <>
                                                Automatic results weren&apos;t found for <b>{enricherName}</b>.
                                                Enter your results manually below.
                                            </>
                                        ) : (
                                            <>
                                                <b>Complete the missing info</b> so the pipeline can finish syncing this activity.
                                            </>
                                        )}
                                    </div>
                                </div>

                                {showForm && (
                                    <div className="pi__form">
                                        {input.requiredFields?.map((field) => (
                                            <FormField key={field} label={formatLabel(field, input)} htmlFor={`field-${field}-${input.activityId}`}>
                                                {renderField(input.activityId, field)}
                                            </FormField>
                                        ))}
                                    </div>
                                )}

                                <div className="pi__cta">
                                    {deadlineLabel && !deadlinePassed && (
                                        <span className="pi__cta-meta">
                                            Auto-populates {deadlineLabel} →
                                        </span>
                                    )}
                                    {showForm && input.requiredFields?.some(f =>
                                        (input.displayConfig?.fieldTypes?.[f] ?? '') === 'workout_entry'
                                    ) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleNoExercises(input.activityId)}
                                            disabled={isSubmitting}
                                        >
                                            ⊘ NO EXERCISES
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDismiss(input.activityId)}
                                        disabled={isSubmitting}
                                    >
                                        {isAutoPopulated && !deadlinePassed ? "DON'T WAIT →" : '⊘ SKIP'}
                                    </Button>
                                    {showForm && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleSubmit(input)}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? '…' : 'SUBMIT →'}
                                        </Button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </PageLayout>
    );
};

export default PendingInputsPage;
