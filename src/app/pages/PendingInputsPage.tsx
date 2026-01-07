import { useState } from 'react';
import { useInputs } from '../hooks/useInputs';
import { InputsService, PendingInput } from '../services/InputsService';
import { PageLayout } from '../components/layout/PageLayout';
import { EmptyState } from '../components/EmptyState';
import { DataList } from '../components/data/DataList';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Text } from '../components/ui/Text';

const PendingInputsPage: React.FC = () => {
  const { inputs, loading, refresh, lastUpdated } = useInputs();

  // Local state to track form values for each pending input
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());

  const handleInputChange = (activityId: string, field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [activityId]: {
        ...(prev[activityId] || {}),
        [field]: value
      }
    }));
  };

  const getFieldValue = (activityId: string, field: string) => {
    return formValues[activityId]?.[field] || '';
  };

  const handleSubmit = async (input: PendingInput) => {
    const activityId = input.activityId;
    const values = formValues[activityId] || {};

    const missingFields = input.requiredFields?.filter(f => !values[f] || values[f].trim() === '');
    if (missingFields && missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setSubmittingIds(prev => {
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
            setFormValues(prev => {
                const next = { ...prev };
                delete next[activityId];
                return next;
            });
        }
    } catch (error) {
        alert('Failed to submit details. Please try again.');
        console.error(error);
    } finally {
        setSubmittingIds(prev => {
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

    setSubmittingIds(prev => {
        const next = new Set(prev);
        next.add(activityId);
        return next;
    });

    try {
        const success = await InputsService.dismissInput(activityId);
        if (success) {
            refresh();
            setFormValues(prev => {
                const next = { ...prev };
                delete next[activityId];
                return next;
            });
        }
    } catch (error) {
        alert('Failed to dismiss input.');
    } finally {
        setSubmittingIds(prev => {
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
      return field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
            className="inputs-grid"
            keyExtractor={(input) => input.id}
            renderItem={(input) => (
                <Card
                    className="input-card"
                    footer={input.createdAt && (
                        <Text variant="small">Created: {new Date(input.createdAt).toLocaleString()}</Text>
                    )}
                >
                    <div className="card-header">
                        <div className="header-info">
                            <span className="header-label">Activity ID</span>
                            <code className="activity-id-pill">{input.activityId}</code>
                        </div>
                        <span className="status-badge waiting">Needs Info</span>
                    </div>

                    <div className="card-body">
                        {input.requiredFields?.map(field => (
                            <div key={field} className="form-group">
                                <label>{formatLabel(field)}</label>
                                {renderField(input.activityId, field)}
                            </div>
                        ))}
                    </div>

                    <div className="card-actions">
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => handleSubmit(input)}
                            disabled={submittingIds.has(input.activityId)}
                        >
                            {submittingIds.has(input.activityId) ? 'Completing...' : 'Complete Activity'}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleDismiss(input.activityId)}
                            disabled={submittingIds.has(input.activityId)}
                            style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                        >
                            Dismiss
                        </Button>
                    </div>
                </Card>
            )}
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
