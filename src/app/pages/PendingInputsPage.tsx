import { useState } from 'react';
import { useInputs } from '../hooks/useInputs';
import { InputsService, PendingInput } from '../services/InputsService';
import { RefreshControl } from '../components/RefreshControl';
import { AppHeader } from '../components/layout/AppHeader';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';

const PendingInputsPage: React.FC = () => {
  const { inputs, loading, refresh, lastUpdated } = useInputs();

  // Local state to track form values for each pending input
  // Keyed by activityId -> fieldName -> value
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

    // Validate all required fields are present
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
            // Optimistic removal or wait for refresh
            refresh();
            // Clear form state for this ID
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
            refresh(); // Refresh list to remove item
            // Clear form state
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

     // Future-proofing for select inputs
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
                 {/* Add more as needed */}
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

     // Default text input
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

  // Helper for nice labels
  const formatLabel = (field: string) => {
      return field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="container dashboard-container">
      <AppHeader />
      <div className="content">
        <PageHeader
            title="Action Required"
            backTo="/"
            backLabel="Dashboard"
            actions={
            <RefreshControl onRefresh={refresh} loading={loading} lastUpdated={lastUpdated} />
            }
        />
      <main className="dashboard">
        <p className="page-subtitle">These activities need a bit more info before they can be synced.</p>

        {loading && inputs.length === 0 ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Checking for pending items...</p>
          </div>
        ) : inputs.length === 0 ? (
            <EmptyState
                icon="🎉"
                title="All Caught Up!"
                message="There are no activities waiting for your input right now."
                actionLabel="Check Again"
                onAction={refresh}
            />
        ) : (
          <div className="inputs-grid">
            {inputs.map(input => (
              <div key={input.id} className="card input-card">
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
                    <button
                        onClick={() => handleSubmit(input)}
                        className="btn primary full-width"
                        disabled={submittingIds.has(input.activityId)}
                    >
                        {submittingIds.has(input.activityId) ? 'Completing...' : 'Complete Activity'}
                    </button>
                    <button
                        onClick={() => handleDismiss(input.activityId)}
                        type="button"
                        className="btn text"
                        style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#d32f2f' }}
                        disabled={submittingIds.has(input.activityId)}
                    >
                        Dismiss
                    </button>
                </div>

                {input.createdAt && (
                  <div className="card-footer" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="timestamp-label" style={{ fontSize: '0.85rem', color: '#666' }}>
                      Created: {new Date(input.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default PendingInputsPage;
