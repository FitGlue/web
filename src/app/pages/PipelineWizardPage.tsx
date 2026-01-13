import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { EnricherConfigForm } from '../components/EnricherConfigForm';
import { PluginManifest } from '../types/plugin';

interface SelectedEnricher {
    manifest: PluginManifest;
    config: Record<string, string>;
}

type WizardStep = 'source' | 'enrichers' | 'enricher-config' | 'destinations' | 'review';

const PipelineWizardPage: React.FC = () => {
    const navigate = useNavigate();
    const api = useApi();
    const { sources, enrichers, destinations, loading, error: registryError } = usePluginRegistry();

    const [step, setStep] = useState<WizardStep>('source');
    const [selectedSource, setSelectedSource] = useState<string | null>(null);
    const [selectedEnrichers, setSelectedEnrichers] = useState<SelectedEnricher[]>([]);
    const [currentEnricherIndex, setCurrentEnricherIndex] = useState<number>(0);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const steps: WizardStep[] = ['source', 'enrichers', 'enricher-config', 'destinations', 'review'];
    const currentStepIndex = steps.indexOf(step);

    // Check if any selected enricher has config fields
    const enrichersNeedConfig = selectedEnrichers.some(e => e.manifest.configSchema.length > 0);

    const canProceed = () => {
        switch (step) {
            case 'source':
                return selectedSource !== null;
            case 'enrichers':
                return true;
            case 'enricher-config':
                return true;
            case 'destinations':
                return selectedDestinations.length > 0;
            case 'review':
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (step === 'enrichers') {
            // Skip enricher config if no enrichers selected or none need config
            if (selectedEnrichers.length === 0 || !enrichersNeedConfig) {
                setStep('destinations');
            } else {
                setCurrentEnricherIndex(0);
                setStep('enricher-config');
            }
        } else if (step === 'enricher-config') {
            // Move to next enricher that needs config, or destinations
            const nextIndex = selectedEnrichers.findIndex(
                (e, i) => i > currentEnricherIndex && e.manifest.configSchema.length > 0
            );
            if (nextIndex !== -1) {
                setCurrentEnricherIndex(nextIndex);
            } else {
                setStep('destinations');
            }
        } else {
            const nextIndex = currentStepIndex + 1;
            if (nextIndex < steps.length) {
                setStep(steps[nextIndex]);
            }
        }
    };

    const handleBack = () => {
        if (step === 'enricher-config') {
            // Move to previous enricher that needs config, or back to enrichers step
            const prevIndex = [...selectedEnrichers]
                .slice(0, currentEnricherIndex)
                .reverse()
                .findIndex(e => e.manifest.configSchema.length > 0);
            if (prevIndex !== -1) {
                setCurrentEnricherIndex(currentEnricherIndex - 1 - prevIndex);
            } else {
                setStep('enrichers');
            }
        } else if (step === 'destinations' && enrichersNeedConfig) {
            // Go back to last enricher config
            const lastConfigIndex = [...selectedEnrichers]
                .reverse()
                .findIndex(e => e.manifest.configSchema.length > 0);
            if (lastConfigIndex !== -1) {
                setCurrentEnricherIndex(selectedEnrichers.length - 1 - lastConfigIndex);
                setStep('enricher-config');
            } else {
                setStep('enrichers');
            }
        } else {
            const prevIndex = currentStepIndex - 1;
            if (prevIndex >= 0) {
                setStep(steps[prevIndex]);
            }
        }
    };

    const handleCreate = async () => {
        if (!selectedSource || selectedDestinations.length === 0) return;

        setCreating(true);
        setError(null);

        try {
            const enricherConfigs = selectedEnrichers.map(e => ({
                providerType: e.manifest.enricherProviderType,
                typedConfig: e.config
            }));

            await api.post('/users/me/pipelines', {
                source: selectedSource,
                enrichers: enricherConfigs,
                destinations: selectedDestinations
            });

            navigate('/settings/pipelines');
        } catch (err) {
            console.error('Failed to create pipeline:', err);
            setError('Failed to create pipeline. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const toggleEnricher = (manifest: PluginManifest) => {
        setSelectedEnrichers(prev => {
            const exists = prev.find(e => e.manifest.id === manifest.id);
            if (exists) {
                return prev.filter(e => e.manifest.id !== manifest.id);
            }
            return [...prev, { manifest, config: {} }];
        });
    };

    const updateEnricherConfig = useCallback((index: number, config: Record<string, string>) => {
        setSelectedEnrichers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], config };
            return updated;
        });
    }, []);

    const toggleDestination = (id: string) => {
        setSelectedDestinations(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const renderStepIndicator = () => {
        const displaySteps = enrichersNeedConfig ? steps : steps.filter(s => s !== 'enricher-config');
        const displayIndex = displaySteps.indexOf(step);

        return (
            <div className="wizard-steps">
                {displaySteps.map((s, i) => (
                    <div
                        key={s}
                        className={`wizard-step ${i === displayIndex ? 'active' : ''} ${i < displayIndex ? 'completed' : ''}`}
                    >
                        <span className="step-number">{i + 1}</span>
                        <span className="step-label">
                            {s === 'enricher-config' ? 'Configure' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const renderSourceStep = () => (
        <div className="wizard-content">
            <h3>Select a Source</h3>
            <p className="wizard-description">Choose where your activities will come from.</p>
            {loading ? (
                <p className="loading-text">Loading sources...</p>
            ) : (
                <div className="option-grid">
                    {sources.map(source => (
                        <Card
                            key={source.id}
                            className={`option-card clickable ${selectedSource === source.id ? 'selected' : ''}`}
                            onClick={() => setSelectedSource(source.id)}
                        >
                            <span className="option-icon">{source.icon}</span>
                            <h4>{source.name}</h4>
                            <p>{source.description}</p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const renderEnrichersStep = () => (
        <div className="wizard-content">
            <h3>Add Enrichers (Optional)</h3>
            <p className="wizard-description">Enrichers process and enhance your activities before sending them to destinations.</p>
            {loading ? (
                <p className="loading-text">Loading enrichers...</p>
            ) : (
                <div className="option-grid">
                    {enrichers.map(enricher => {
                        const isSelected = selectedEnrichers.some(e => e.manifest.id === enricher.id);
                        return (
                            <Card
                                key={enricher.id}
                                className={`option-card clickable ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleEnricher(enricher)}
                            >
                                <span className="option-icon">{enricher.icon}</span>
                                <h4>{enricher.name}</h4>
                                <p>{enricher.description}</p>
                                {isSelected && <span className="selected-check">✓</span>}
                                {enricher.configSchema.length > 0 && (
                                    <span className="has-config" title="Has configuration options">⚙️</span>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderEnricherConfigStep = () => {
        if (selectedEnrichers.length === 0) return null;
        const current = selectedEnrichers[currentEnricherIndex];
        if (!current || current.manifest.configSchema.length === 0) return null;

        return (
            <div className="wizard-content">
                <h3>Configure: {current.manifest.icon} {current.manifest.name}</h3>
                <p className="wizard-description">{current.manifest.description}</p>
                <Card className="config-card">
                    <EnricherConfigForm
                        schema={current.manifest.configSchema}
                        initialValues={current.config}
                        onChange={config => updateEnricherConfig(currentEnricherIndex, config)}
                    />
                </Card>
                {selectedEnrichers.filter(e => e.manifest.configSchema.length > 0).length > 1 && (
                    <p className="config-progress">
                        Configuring {currentEnricherIndex + 1} of {selectedEnrichers.filter(e => e.manifest.configSchema.length > 0).length}
                    </p>
                )}
            </div>
        );
    };

    const renderDestinationsStep = () => (
        <div className="wizard-content">
            <h3>Select Destinations</h3>
            <p className="wizard-description">Choose where your activities will be sent. Select at least one.</p>
            {loading ? (
                <p className="loading-text">Loading destinations...</p>
            ) : (
                <div className="option-grid">
                    {destinations.map(dest => (
                        <Card
                            key={dest.id}
                            className={`option-card clickable ${selectedDestinations.includes(dest.id) ? 'selected' : ''}`}
                            onClick={() => toggleDestination(dest.id)}
                        >
                            <span className="option-icon">{dest.icon}</span>
                            <h4>{dest.name}</h4>
                            <p>{dest.description}</p>
                            {selectedDestinations.includes(dest.id) && (
                                <span className="selected-check">✓</span>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const renderReviewStep = () => {
        const source = sources.find(s => s.id === selectedSource);
        const dests = destinations.filter(d => selectedDestinations.includes(d.id));

        return (
            <div className="wizard-content">
                <h3>Review Your Pipeline</h3>
                <Card className="review-card">
                    <div className="review-flow">
                        <div className="review-section">
                            <span className="review-label">Source</span>
                            <div className="review-item">
                                <span>{source?.icon}</span> {source?.name}
                            </div>
                        </div>
                        <span className="review-arrow">→</span>
                        {selectedEnrichers.length > 0 && (
                            <>
                                <div className="review-section">
                                    <span className="review-label">Enrichers</span>
                                    {selectedEnrichers.map(e => (
                                        <div key={e.manifest.id} className="review-item">
                                            <span>{e.manifest.icon}</span> {e.manifest.name}
                                            {Object.keys(e.config).length > 0 && (
                                                <span className="review-configured" title="Configured">⚙️</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <span className="review-arrow">→</span>
                            </>
                        )}
                        <div className="review-section">
                            <span className="review-label">Destinations</span>
                            {dests.map(d => (
                                <div key={d.id} className="review-item">
                                    <span>{d.icon}</span> {d.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
                {error && <p className="error-message">{error}</p>}
            </div>
        );
    };

    const renderCurrentStep = () => {
        switch (step) {
            case 'source':
                return renderSourceStep();
            case 'enrichers':
                return renderEnrichersStep();
            case 'enricher-config':
                return renderEnricherConfigStep();
            case 'destinations':
                return renderDestinationsStep();
            case 'review':
                return renderReviewStep();
            default:
                return null;
        }
    };

    if (registryError) {
        return (
            <PageLayout title="Create Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <Card className="error-card">
                    <p>Failed to load plugin registry: {registryError}</p>
                    <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
                </Card>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Create Pipeline"
            backTo="/settings/pipelines"
            backLabel="Pipelines"
        >
            <div className="pipeline-wizard">
                {renderStepIndicator()}
                {renderCurrentStep()}
                <div className="wizard-actions">
                    {currentStepIndex > 0 && (
                        <Button variant="secondary" onClick={handleBack}>
                            Back
                        </Button>
                    )}
                    {step !== 'review' ? (
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            disabled={!canProceed() || loading}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            disabled={creating}
                        >
                            {creating ? 'Creating...' : 'Create Pipeline'}
                        </Button>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default PipelineWizardPage;
