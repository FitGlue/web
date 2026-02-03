import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/library/layout/PageLayout';
import { Stack } from '../components/library/layout/Stack';
import { Card } from '../components/library/ui/Card';
import { Button } from '../components/library/ui/Button';
import { Heading } from '../components/library/ui/Heading';
import { Paragraph } from '../components/library/ui/Paragraph';
import { useToast } from '../components/library/ui/Toast';
import { useApi } from '../hooks/useApi';
import { FormField, Input as FormInput } from '../components/library/forms';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useUser } from '../hooks/useUser';
import { EnricherConfigForm } from '../components/EnricherConfigForm';
import { LogicGateConfigForm } from '../components/LogicGateConfigForm';
import { EnricherTimeline } from '../components/EnricherTimeline';
import { EnricherInfoModal } from '../components/EnricherInfoModal';
import { PluginCategorySection } from '../components/PluginCategorySection';
import { WizardOptionGrid, WizardExcludedSection, WizardStepIndicator, PipelineReviewFlow } from '../components/wizard';
import { PluginManifest, ConfigFieldType } from '../types/plugin';
import { getEffectiveTier, TIER_ATHLETE, TIER_HOBBYIST } from '../utils/tier';
import { ENRICHER_CATEGORIES, groupPluginsByCategory, getRecommendedPlugins } from '../utils/pluginCategories';

interface SelectedEnricher {
    manifest: PluginManifest;
    config: Record<string, string>;
}

type WizardStep = 'source' | 'enrichers' | 'enricher-config' | 'destinations' | 'review';

const PipelineWizardPage: React.FC = () => {
    const navigate = useNavigate();
    const api = useApi();
    const { refresh: refreshPipelines } = useRealtimePipelines();
    const { sources, enrichers, destinations, integrations: registryIntegrations, loading, error: registryError } = usePluginRegistry();
    const { integrations: userIntegrations } = useRealtimeIntegrations();
    const { user } = useUser();

    const userTier = user ? getEffectiveTier(user) : TIER_HOBBYIST;

    const isTierGated = (plugin: PluginManifest): boolean => {
        if (!plugin.requiredTier) return false;
        return plugin.requiredTier === 'athlete' && userTier !== TIER_ATHLETE;
    };

    const isIntegrationAvailable = (plugin: PluginManifest): boolean => {
        if (!plugin.requiredIntegrations?.length) return true;
        return plugin.requiredIntegrations.every(integrationId => {
            const integration = (userIntegrations as Record<string, { connected?: boolean } | undefined> | null)?.[integrationId];
            return integration?.connected ?? false;
        });
    };

    const isPluginAvailable = (plugin: PluginManifest): boolean => {
        return isIntegrationAvailable(plugin) && !isTierGated(plugin);
    };

    const getMissingIntegrations = (plugin: PluginManifest): string[] => {
        if (!plugin.requiredIntegrations?.length) return [];
        return plugin.requiredIntegrations.filter(integrationId => {
            const integration = (userIntegrations as Record<string, { connected?: boolean } | undefined> | null)?.[integrationId];
            return !(integration?.connected ?? false);
        }).map(id => {
            const manifest = registryIntegrations.find(i => i.id === id);
            return manifest?.name ?? id;
        });
    };

    const getExcludedHint = (plugin: PluginManifest): string => {
        if (isTierGated(plugin)) return 'Athlete plan required';
        return `Connect ${getMissingIntegrations(plugin).join(', ')} to enable`;
    };

    const [step, setStep] = useState<WizardStep>('source');
    const [selectedSource, setSelectedSource] = useState<string | null>(null);
    const [selectedEnrichers, setSelectedEnrichers] = useState<SelectedEnricher[]>([]);
    const [currentEnricherIndex, setCurrentEnricherIndex] = useState<number>(0);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
    const [pipelineName, setPipelineName] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoEnricher, setInfoEnricher] = useState<PluginManifest | null>(null);
    const [enricherSearchQuery, setEnricherSearchQuery] = useState('');
    const [expandAllCategories, setExpandAllCategories] = useState(false);

    const steps: WizardStep[] = ['source', 'enrichers', 'enricher-config', 'destinations', 'review'];
    const currentStepIndex = steps.indexOf(step);
    const enrichersNeedConfig = selectedEnrichers.some(e => (e.manifest.configSchema?.length ?? 0) > 0);

    const canProceed = () => {
        switch (step) {
            case 'source': return selectedSource !== null;
            case 'enrichers': return true;
            case 'enricher-config': return true;
            case 'destinations': return selectedDestinations.length > 0;
            case 'review': return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (step === 'enrichers') {
            const enrichersWithConfig = selectedEnrichers.filter(e => (e.manifest.configSchema?.length ?? 0) > 0);
            if (selectedEnrichers.length === 0 || enrichersWithConfig.length === 0) {
                setStep('destinations');
            } else {
                const firstConfigIndex = selectedEnrichers.findIndex(e => (e.manifest.configSchema?.length ?? 0) > 0);
                setCurrentEnricherIndex(firstConfigIndex);
                setStep('enricher-config');
            }
        } else if (step === 'enricher-config') {
            const nextIndex = selectedEnrichers.findIndex((e, i) => i > currentEnricherIndex && (e.manifest.configSchema?.length ?? 0) > 0);
            if (nextIndex !== -1) {
                setCurrentEnricherIndex(nextIndex);
            } else {
                setStep('destinations');
            }
        } else {
            const nextIndex = currentStepIndex + 1;
            if (nextIndex < steps.length) setStep(steps[nextIndex]);
        }
    };

    const handleBack = () => {
        if (step === 'enricher-config') {
            const prevIndex = [...selectedEnrichers].slice(0, currentEnricherIndex).reverse()
                .findIndex(e => (e.manifest.configSchema?.length ?? 0) > 0);
            if (prevIndex !== -1) {
                setCurrentEnricherIndex(currentEnricherIndex - 1 - prevIndex);
            } else {
                setStep('enrichers');
            }
        } else if (step === 'destinations' && enrichersNeedConfig) {
            const lastConfigIndex = [...selectedEnrichers].reverse()
                .findIndex(e => (e.manifest.configSchema?.length ?? 0) > 0);
            if (lastConfigIndex !== -1) {
                setCurrentEnricherIndex(selectedEnrichers.length - 1 - lastConfigIndex);
                setStep('enricher-config');
            } else {
                setStep('enrichers');
            }
        } else if (step === 'destinations' && !enrichersNeedConfig) {
            // Skip enricher-config when no config is needed
            setStep('enrichers');
        } else {
            const prevIndex = currentStepIndex - 1;
            if (prevIndex >= 0) setStep(steps[prevIndex]);
        }
    };

    const toast = useToast();

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
                name: pipelineName || undefined,
                source: selectedSource,
                enrichers: enricherConfigs,
                destinations: selectedDestinations
            });
            await refreshPipelines();
            toast.success('Pipeline Created', `"${pipelineName || 'New Pipeline'}" has been created`);
            navigate('/settings/pipelines');
        } catch (err) {
            console.error('Failed to create pipeline:', err);
            setError('Failed to create pipeline. Please try again.');
            toast.error('Creation Failed', 'Failed to create pipeline. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const toggleEnricher = (manifest: PluginManifest) => {
        setSelectedEnrichers(prev => {
            if (manifest.allowMultipleInstances) return [...prev, { manifest, config: {} }];
            const exists = prev.find(e => e.manifest.id === manifest.id);
            if (exists) return prev.filter(e => e.manifest.id !== manifest.id);
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
        setSelectedDestinations(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };

    const renderStepIndicator = () => {
        const displaySteps = enrichersNeedConfig ? steps : steps.filter(s => s !== 'enricher-config');
        const displayIndex = displaySteps.indexOf(step);
        const stepConfig = displaySteps.map(s => ({
            id: s,
            label: s === 'enricher-config' ? 'Configure' : s.charAt(0).toUpperCase() + s.slice(1),
        }));
        return <WizardStepIndicator steps={stepConfig} currentStepIndex={displayIndex} />;
    };

    const renderSourceStep = () => {
        const availableSources = sources.filter(isPluginAvailable);
        const excludedSources = sources.filter(s => !isPluginAvailable(s));

        return (
            <Stack>
                <Heading level={3}>Select a Source</Heading>
                <Paragraph>Pick <strong>one</strong> source for your activities.</Paragraph>
                {loading ? (
                    <Paragraph>Loading sources...</Paragraph>
                ) : (
                    <>
                        <WizardOptionGrid
                            options={availableSources}
                            selectedIds={selectedSource ? [selectedSource] : []}
                            onSelect={(source) => setSelectedSource(source.id)}
                            selectionMode="single"
                        />
                        <WizardExcludedSection
                            items={excludedSources}
                            getKey={s => s.id}
                            getIcon={s => s.icon}
                            getName={s => s.name}
                            getHint={getExcludedHint}
                        />
                    </>
                )}
            </Stack>
        );
    };

    const renderEnrichersStep = () => {
        const availableEnrichers = enrichers.filter(isPluginAvailable);
        const excludedEnrichers = enrichers.filter(e => !isPluginAvailable(e));
        const filteredEnrichers = enricherSearchQuery
            ? availableEnrichers.filter(e =>
                e.name.toLowerCase().includes(enricherSearchQuery.toLowerCase()) ||
                (e.description ?? '').toLowerCase().includes(enricherSearchQuery.toLowerCase()))
            : availableEnrichers;
        const groupedEnrichers = groupPluginsByCategory(filteredEnrichers, ENRICHER_CATEGORIES);
        const connectedIds = Object.entries(userIntegrations || {})
            .filter(([, v]) => (v as { connected?: boolean } | undefined)?.connected)
            .map(([k]) => k);
        const recommended = getRecommendedPlugins(availableEnrichers, connectedIds, 4);

        const getDisabledReason = (plugin: PluginManifest): string | undefined => {
            if (isTierGated(plugin)) return 'Athlete plan required';
            const missing = getMissingIntegrations(plugin);
            if (missing.length > 0) return `Connect ${missing.join(', ')}`;
            return undefined;
        };

        return (
            <Stack>
                <Heading level={3}>Add Boosters (Optional)</Heading>
                <Paragraph>Click to add boosters. Drag the <strong>grip handle</strong> to reorder.</Paragraph>
                <EnricherTimeline
                    enrichers={selectedEnrichers}
                    onReorder={setSelectedEnrichers}
                    onRemove={(index) => setSelectedEnrichers(prev => prev.filter((_, i) => i !== index))}
                    onInfoClick={(manifest) => setInfoEnricher(manifest)}
                />
                {loading ? (
                    <Paragraph>Loading enrichers...</Paragraph>
                ) : (
                    <>
                        {!enricherSearchQuery && recommended.length > 0 && (
                            <Stack>
                                <Heading level={4}>⭐ Recommended for You</Heading>
                                <WizardOptionGrid
                                    options={recommended}
                                    selectedIds={selectedEnrichers.map(e => e.manifest.id)}
                                    onSelect={(option) => toggleEnricher(option as unknown as PluginManifest)}
                                />
                            </Stack>
                        )}
                        <Stack direction="horizontal" align="center" justify="between">
                            <FormInput type="text" placeholder="Search boosters..." value={enricherSearchQuery}
                                onChange={(e) => setEnricherSearchQuery(e.target.value)} />
                            <Button variant="secondary" size="small" onClick={() => setExpandAllCategories(!expandAllCategories)}>
                                {expandAllCategories ? 'Collapse All' : 'Expand All'}
                            </Button>
                        </Stack>
                        {Array.from(groupedEnrichers.entries()).map(([category, plugins]) => (
                            <PluginCategorySection
                                key={category.id}
                                category={category}
                                plugins={plugins}
                                selectedIds={selectedEnrichers.map(e => e.manifest.id)}
                                onSelect={toggleEnricher}
                                onInfoClick={setInfoEnricher}
                                disabledPlugins={new Set(excludedEnrichers.map(e => e.id))}
                                getDisabledReason={getDisabledReason}
                                defaultExpanded={!!enricherSearchQuery || expandAllCategories}
                            />
                        ))}
                        {!enricherSearchQuery && (
                            <WizardExcludedSection
                                items={excludedEnrichers}
                                getKey={e => e.id}
                                getIcon={e => e.icon}
                                getName={e => e.name}
                                getHint={getExcludedHint}
                            />
                        )}
                    </>
                )}
            </Stack>
        );
    };

    const renderEnricherConfigStep = () => {
        if (selectedEnrichers.length === 0) return null;
        const current = selectedEnrichers[currentEnricherIndex];
        if (!current || (current.manifest.configSchema?.length ?? 0) === 0) return null;

        return (
            <Stack>
                <Heading level={3}>Configure: {current.manifest.icon} {current.manifest.name}</Heading>
                <Paragraph>{current.manifest.description}</Paragraph>
                <Card>
                    {current.manifest.id === 'logic-gate' ? (
                        <LogicGateConfigForm initialValues={current.config}
                            onChange={config => updateEnricherConfig(currentEnricherIndex, config)} />
                    ) : (
                        <EnricherConfigForm schema={current.manifest.configSchema ?? []} initialValues={current.config}
                            onChange={config => updateEnricherConfig(currentEnricherIndex, config)} />
                    )}
                </Card>
                {selectedEnrichers.filter(e => (e.manifest.configSchema?.length ?? 0) > 0).length > 1 && (
                    <Paragraph>
                        Configuring {currentEnricherIndex + 1} of {selectedEnrichers.filter(e => (e.manifest.configSchema?.length ?? 0) > 0).length}
                    </Paragraph>
                )}
            </Stack>
        );
    };

    const renderDestinationsStep = () => {
        const availableDestinations = destinations.filter(isPluginAvailable);
        const excludedDestinations = destinations.filter(d => !isPluginAvailable(d));

        return (
            <Stack>
                <Heading level={3}>Select Destinations</Heading>
                <Paragraph>Select <strong>at least one</strong> destination for your activities</Paragraph>
                {loading ? (
                    <Paragraph>Loading destinations...</Paragraph>
                ) : (
                    <>
                        <WizardOptionGrid
                            options={availableDestinations}
                            selectedIds={selectedDestinations}
                            onSelect={(dest) => toggleDestination(dest.id)}
                            selectionMode="multi"
                        />
                        <WizardExcludedSection
                            items={excludedDestinations}
                            getKey={d => d.id}
                            getIcon={d => d.icon}
                            getName={d => d.name}
                            getHint={getExcludedHint}
                        />
                    </>
                )}
            </Stack>
        );
    };

    const renderReviewStep = () => {
        const source = sources.find(s => s.id === selectedSource);
        const dests = destinations.filter(d => selectedDestinations.includes(d.id));

        const getFieldLabel = (enricher: SelectedEnricher, key: string): string => {
            const field = (enricher.manifest.configSchema ?? []).find(f => f.key === key);
            return field?.label || key;
        };

        const getOptionLabel = (enricher: SelectedEnricher, key: string, value: string): string => {
            const field = (enricher.manifest.configSchema ?? []).find(f => f.key === key);
            const option = field?.options?.find(o => o.value === value);
            return option?.label || value;
        };

        const isKeyValueMap = (enricher: SelectedEnricher, key: string): boolean => {
            const field = (enricher.manifest.configSchema ?? []).find(f => f.key === key);
            return field?.fieldType === ConfigFieldType.CONFIG_FIELD_TYPE_KEY_VALUE_MAP;
        };

        // Convert selected enrichers to ReviewEnricher format
        const reviewEnrichers = selectedEnrichers.map(e => ({
            id: e.manifest.id,
            icon: e.manifest.icon,
            iconType: e.manifest.iconType,
            iconPath: e.manifest.iconPath,
            name: e.manifest.name,
            configSummary: Object.entries(e.config).map(([key, value]) =>
                `${getFieldLabel(e, key)}: ${isKeyValueMap(e, key) ? '(custom mapping)' : getOptionLabel(e, key, value)}`
            ),
        }));

        // Convert destinations to ReviewDestination format
        const reviewDests = dests.map(d => ({
            id: d.id,
            icon: d.icon,
            iconType: d.iconType,
            iconPath: d.iconPath,
            name: d.name,
        }));

        return (
            <Stack>
                <Heading level={3}>Review Your Pipeline</Heading>
                <Card>
                    <FormField label="Pipeline Name (Optional)" htmlFor="pipelineName">
                        <FormInput id="pipelineName" type="text" placeholder="e.g., Morning Gym Sessions"
                            value={pipelineName} onChange={(e) => setPipelineName(e.target.value)}
                            maxLength={64} />
                    </FormField>
                </Card>

                <PipelineReviewFlow
                    source={source ? {
                        id: source.id,
                        icon: source.icon,
                        iconType: source.iconType,
                        iconPath: source.iconPath,
                        name: source.name,
                    } : undefined}
                    enrichers={reviewEnrichers}
                    destinations={reviewDests}
                />

                {error && <Paragraph>{error}</Paragraph>}
            </Stack>
        );
    };

    const renderCurrentStep = () => {
        switch (step) {
            case 'source': return renderSourceStep();
            case 'enrichers': return renderEnrichersStep();
            case 'enricher-config': return renderEnricherConfigStep();
            case 'destinations': return renderDestinationsStep();
            case 'review': return renderReviewStep();
            default: return null;
        }
    };

    if (registryError) {
        return (
            <PageLayout title="Create Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <Card>
                    <Paragraph>Failed to load plugin registry: {registryError}</Paragraph>
                    <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
                </Card>
            </PageLayout>
        );
    }

    return (
        <>
            <PageLayout title="Create Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <Stack>
                    {renderStepIndicator()}
                    {renderCurrentStep()}
                    <Stack direction="horizontal" justify="end">
                        {currentStepIndex > 0 && <Button variant="secondary" onClick={handleBack}>Back</Button>}
                        {step !== 'review' ? (
                            <Button variant="primary" onClick={handleNext} disabled={!canProceed() || loading}>Next</Button>
                        ) : (
                            <Button variant="primary" onClick={handleCreate} disabled={creating}>
                                {creating ? 'Creating...' : 'Create Pipeline'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </PageLayout>
            {infoEnricher && <EnricherInfoModal enricher={infoEnricher} onClose={() => setInfoEnricher(null)} />}
        </>
    );
};

export default PipelineWizardPage;
