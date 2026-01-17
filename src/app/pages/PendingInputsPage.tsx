import { useState } from 'react';
import { useInputs } from '../hooks/useInputs';
import { InputsService, PendingInput } from '../services/InputsService';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { PageLayout } from '../components/layout/PageLayout';
import { EmptyState } from '../components/EmptyState';
import { DataList } from '../components/data/DataList';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Text } from '../components/ui/Text';

// Parse activity ID (e.g., "FITBIT:217758352929208470") into friendly display
const parseActivityId = (
    activityId: string,
    integrations: Array<{ id: string; name: string; icon?: string }>
): { source: string; icon: string; timestamp: string; originalId: string } => {
    const [sourcePart, idPart] = activityId.split(':');
    const source = sourcePart?.toLowerCase() || 'unknown';

    // Get source icon from registry
    const sourceInfo = integrations.find((ri) => ri.id === source);
    const icon = sourceInfo?.icon || '📥';
    const sourceName = sourceInfo?.name || source.charAt(0).toUpperCase() + source.slice(1);

    // Try to parse the ID as a timestamp (if numeric)
    let timestamp = 'Activity';
    if (idPart && /^\d+$/.test(idPart)) {
        const date = new Date(parseInt(idPart));
        if (!isNaN(date.getTime()) && date.getFullYear() > 2020) {
            timestamp = date.toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
        }
    }

    return { source: sourceName, icon, timestamp, originalId: idPart || activityId };
};

const PendingInputsPage: React.FC = () => {
    const { inputs, loading, refresh, lastUpdated } = useInputs();
    const { integrations: registryIntegrations } = usePluginRegistry();

    // Local state to track form values for each pending input
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

        const missingFields = input.requiredFields?.filter((f) => !values[f] || values[f].trim() === '');
        if (missingFields && missingFields.length > 0) {
            alert(`Please fill in: ${missingFields.join(', ')}`);
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
                refresh();
                setFormValues((prev) => {
                    const next = { ...prev };
                    delete next[activityId];
                    return next;
                });
            }
        } catch (error) {
            alert('Failed to submit details. Please try again.');
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
                refresh();
                setFormValues((prev) => {
                    const next = { ...prev };
                    delete next[activityId];
                    return next;
                });
            }
        } catch {
            alert('Failed to dismiss input.');
        } finally {
            setSubmittingIds((prev) => {
                const next = new Set(prev);
                next.delete(activityId);
                return next;
            });
        }
    };

    // Helper to render appropriate input type based on field name
    const renderField = (activityId: string, field: string) => {
        const value = getFieldValue(activityId, field);

        if (field === 'activity_type') {
            return (
                <select
                    className="input-select"
                    value={value}
                    onChange={(e) => handleInputChange(activityId, field, e.target.value)}
                >
                    <option value="">Select Type...</option>
                    <option value="RUN">Run</option>
                    <option value="RIDE">Ride</option>
                    <option value="WEIGHT_TRAINING">Weight Training</option>
                    <option value="WORKOUT">Workout</option>
                </select>
            );
        }

        if (field === 'description') {
            return (
                <textarea
                    className="input-textarea"
                    placeholder="Enter description..."
                    value={value}
                    onChange={(e) => handleInputChange(activityId, field, e.target.value)}
                    rows={3}
                />
            );
        }

        return (
            <input
                type="text"
                className="input-text"
                placeholder={`Enter ${field}...`}
                value={value}
                onChange={(e) => handleInputChange(activityId, field, e.target.value)}
            />
        );
    };

    const formatLabel = (field: string) => {
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
            lastUpdated={lastUpdated}
        >
            <Text variant="muted">These activities need a bit more info before they can be synced.</Text>

            <DataList
                items={inputs}
                loading={loading}
                loadingMessage="Checking for pending items..."
                className="pending-inputs-grid"
                keyExtractor={(input) => input.id}
                renderItem={(input) => {
                    const parsed = parseActivityId(input.activityId, registryIntegrations);
                    const isAutoPopulated = input.autoPopulated === true;
                    const autoDeadline = input.autoDeadline ? new Date(input.autoDeadline) : null;
                    const enricherName = input.enricherProviderId || 'Unknown Enricher';

                    // Calculate time remaining (if auto-populated)
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
                        <Card className={`pending-input-card ${isAutoPopulated ? 'pending-input-card--auto' : ''}`}>
                            {/* Enhanced Header */}
                            <div className="pending-input-card__header">
                                <div className="pending-input-card__source">
                                    <span className="pending-input-card__source-icon">{parsed.icon}</span>
                                    <div className="pending-input-card__source-info">
                                        <span className="pending-input-card__source-name">{parsed.source}</span>
                                        <span className="pending-input-card__timestamp">{parsed.timestamp}</span>
                                    </div>
                                </div>
                                {isAutoPopulated ? (
                                    <span className="pending-input-card__status-badge pending-input-card__status-badge--auto">
                                        <span className="pending-input-card__status-dot pending-input-card__status-dot--auto"></span>
                                        Awaiting {enricherName.charAt(0).toUpperCase() + enricherName.slice(1)} Results
                                    </span>
                                ) : (
                                    <span className="pending-input-card__status-badge">
                                        <span className="pending-input-card__status-dot"></span>
                                        Needs Info
                                    </span>
                                )}
                            </div>

                            {/* Auto-populated info banner */}
                            {isAutoPopulated && (
                                <div className="pending-input-card__auto-banner">
                                    <span className="pending-input-card__auto-icon">⏳</span>
                                    <div className="pending-input-card__auto-info">
                                        <p className="pending-input-card__auto-title">Waiting for official results</p>
                                        <p className="pending-input-card__auto-description">
                                            Your activity was synced successfully. We&apos;re waiting for official {enricherName} results to be published.
                                        </p>
                                        {autoDeadline && (
                                            <p className="pending-input-card__auto-countdown">
                                                {getTimeRemaining()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Form Section - Only show for non-auto-populated OR if deadline has passed */}
                            {!isAutoPopulated && (
                                <div className="pending-input-card__form">
                                    <h4 className="pending-input-card__form-title">
                                        ✨ Complete the magic
                                    </h4>
                                    {input.requiredFields?.map((field) => (
                                        <div key={field} className="pending-input-card__field">
                                            <label className="pending-input-card__label">{formatLabel(field)}</label>
                                            {renderField(input.activityId, field)}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Manual Entry Fallback for Auto-populated */}
                            {isAutoPopulated && autoDeadline && new Date() > autoDeadline && (
                                <div className="pending-input-card__form pending-input-card__form--fallback">
                                    <h4 className="pending-input-card__form-title">
                                        📝 Enter results manually
                                    </h4>
                                    <p className="pending-input-card__form-description">
                                        Automatic results weren&apos;t found. You can enter your results manually below.
                                    </p>
                                    {input.requiredFields?.map((field) => (
                                        <div key={field} className="pending-input-card__field">
                                            <label className="pending-input-card__label">{formatLabel(field)}</label>
                                            {renderField(input.activityId, field)}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions - Adjust based on auto-populated status */}
                            <div className="pending-input-card__actions">
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
                                        <button
                                            className="pending-input-card__dismiss"
                                            onClick={() => handleDismiss(input.activityId)}
                                            disabled={submittingIds.has(input.activityId)}
                                        >
                                            Dismiss
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="pending-input-card__dismiss"
                                        onClick={() => handleDismiss(input.activityId)}
                                        disabled={submittingIds.has(input.activityId)}
                                    >
                                        Don&apos;t wait - dismiss this
                                    </button>
                                )}
                            </div>

                            {/* Footer */}
                            {input.createdAt && (
                                <div className="pending-input-card__footer">
                                    Created: {new Date(input.createdAt).toLocaleString()}
                                </div>
                            )}
                        </Card>
                    );
                }}

                emptyState={
                    <EmptyState
                        icon="🎉"
                        title="All Caught Up!"
                        message="There are no activities waiting for your input right now."
                        actionLabel="Check Again"
                        onAction={refresh}
                    />
                }
            />
        </PageLayout>
    );
};

export default PendingInputsPage;
