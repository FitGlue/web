import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';

// Available options
const SOURCES = [
    { id: 'hevy', name: 'Hevy', icon: '🏋️', description: 'Strength training workouts' },
    { id: 'fitbit', name: 'Fitbit', icon: '⌚', description: 'Activity and workout data' }
];

const ENRICHERS = [
    { type: 1, name: 'Fitbit Heart Rate', icon: '❤️', description: 'Add heart rate data from Fitbit' },
    { type: 2, name: 'Workout Summary', icon: '📊', description: 'Generate exercise set/rep summary' },
    { type: 3, name: 'Muscle Heatmap', icon: '💪', description: 'Visualize muscle groups worked' },
    { type: 5, name: 'Metadata Passthrough', icon: '📝', description: 'Pass through source metadata' },
    { type: 7, name: 'Activity Type Mapper', icon: '🏃', description: 'Map activity types to Strava sports' },
    { type: 11, name: 'User Input', icon: '✍️', description: 'Request additional input from user' },
    { type: 12, name: 'Activity Filter', icon: '🚫', description: 'Filter out certain activity types' }
];

const DESTINATIONS = [
    { id: 'strava', name: 'Strava', icon: '🚴', description: 'Upload to your Strava profile' },
    { id: 'mock', name: 'Mock (Testing)', icon: '🧪', description: 'Test destination for development' }
];

interface EnricherConfig {
    providerType: number;
    inputs?: Record<string, string>;
}

type WizardStep = 'source' | 'enrichers' | 'destinations' | 'review';

const PipelineWizardPage: React.FC = () => {
    const navigate = useNavigate();
    const api = useApi();

    const [step, setStep] = useState<WizardStep>('source');
    const [selectedSource, setSelectedSource] = useState<string | null>(null);
    const [selectedEnrichers, setSelectedEnrichers] = useState<number[]>([]);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const steps: WizardStep[] = ['source', 'enrichers', 'destinations', 'review'];
    const currentStepIndex = steps.indexOf(step);

    const canProceed = () => {
        switch (step) {
            case 'source':
                return selectedSource !== null;
            case 'enrichers':
                return true; // Enrichers are optional
            case 'destinations':
                return selectedDestinations.length > 0;
            case 'review':
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setStep(steps[nextIndex]);
        }
    };

    const handleBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setStep(steps[prevIndex]);
        }
    };

    const handleCreate = async () => {
        if (!selectedSource || selectedDestinations.length === 0) return;

        setCreating(true);
        setError(null);

        try {
            const enrichers: EnricherConfig[] = selectedEnrichers.map(type => ({
                providerType: type,
                inputs: {}
            }));

            await api.post('/users/me/pipelines', {
                source: selectedSource,
                enrichers,
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

    const toggleEnricher = (type: number) => {
        setSelectedEnrichers(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const toggleDestination = (id: string) => {
        setSelectedDestinations(prev =>
            prev.includes(id)
                ? prev.filter(d => d !== id)
                : [...prev, id]
        );
    };

    const renderStepIndicator = () => (
        <div className="wizard-steps">
            {steps.map((s, i) => (
                <div
                    key={s}
                    className={`wizard-step ${i === currentStepIndex ? 'active' : ''} ${i < currentStepIndex ? 'completed' : ''}`}
                >
                    <span className="step-number">{i + 1}</span>
                    <span className="step-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </div>
            ))}
        </div>
    );

    const renderSourceStep = () => (
        <div className="wizard-content">
            <h3>Select a Source</h3>
            <p className="wizard-description">Choose where your activities will come from.</p>
            <div className="option-grid">
                {SOURCES.map(source => (
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
        </div>
    );

    const renderEnrichersStep = () => (
        <div className="wizard-content">
            <h3>Add Enrichers (Optional)</h3>
            <p className="wizard-description">Enrichers process and enhance your activities before sending them to destinations.</p>
            <div className="option-grid">
                {ENRICHERS.map(enricher => (
                    <Card
                        key={enricher.type}
                        className={`option-card clickable ${selectedEnrichers.includes(enricher.type) ? 'selected' : ''}`}
                        onClick={() => toggleEnricher(enricher.type)}
                    >
                        <span className="option-icon">{enricher.icon}</span>
                        <h4>{enricher.name}</h4>
                        <p>{enricher.description}</p>
                        {selectedEnrichers.includes(enricher.type) && (
                            <span className="selected-check">✓</span>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderDestinationsStep = () => (
        <div className="wizard-content">
            <h3>Select Destinations</h3>
            <p className="wizard-description">Choose where your activities will be sent. Select at least one.</p>
            <div className="option-grid">
                {DESTINATIONS.map(dest => (
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
        </div>
    );

    const renderReviewStep = () => {
        const source = SOURCES.find(s => s.id === selectedSource);
        const enrichers = ENRICHERS.filter(e => selectedEnrichers.includes(e.type));
        const destinations = DESTINATIONS.filter(d => selectedDestinations.includes(d.id));

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
                        {enrichers.length > 0 && (
                            <>
                                <div className="review-section">
                                    <span className="review-label">Enrichers</span>
                                    {enrichers.map(e => (
                                        <div key={e.type} className="review-item">
                                            <span>{e.icon}</span> {e.name}
                                        </div>
                                    ))}
                                </div>
                                <span className="review-arrow">→</span>
                            </>
                        )}
                        <div className="review-section">
                            <span className="review-label">Destinations</span>
                            {destinations.map(d => (
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
            case 'destinations':
                return renderDestinationsStep();
            case 'review':
                return renderReviewStep();
            default:
                return null;
        }
    };

    return (
        <PageLayout
            title="Create Pipeline"
            backLink="/settings/pipelines"
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
                            disabled={!canProceed()}
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
