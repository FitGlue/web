import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../shared/logger';
import { PageLayout } from '../components/library/layout/PageLayout';
import { PageAction } from '../components/library/layout';
import { Card } from '../components/library/ui/Card';
import { Button } from '../components/library/ui/Button';
import { Paragraph } from '../components/library/ui/Paragraph';
import { useToast } from '../components/library/ui/Toast';
import { client } from '../../shared/api/client';
import { usePluginDefaults } from '../hooks/usePluginDefaults';
import { FormField, Input as FormInput } from '../components/library/forms';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useUser } from '../hooks/useUser';
import { EnricherConfigForm, PluginConfigForm } from '../components/EnricherConfigForm';
import { LogicGateConfigForm } from '../components/LogicGateConfigForm';
import { EnricherTimeline } from '../components/EnricherTimeline';
import { EnricherInfoModal } from '../components/EnricherInfoModal';
import { PluginCategorySection } from '../components/PluginCategorySection';
import { WizardOptionGrid, WizardExcludedSection, PipelineReviewFlow, WizardStepHead } from '../components/wizard';
import { DestinationEnricherExclusion, EnricherExclusionItem } from '../components/DestinationEnricherExclusion';
import { SourcePicker } from '../components/library/ui/SourcePicker';
import '../components/library/ui/DestinationPicker.css';
import { useShowcasePreferences } from '../hooks/useShowcasePreferences';
import { EnricherProviderType } from '../../types/pb/user';
import { PluginManifest, ConfigFieldType } from '../types/plugin';
import { resolveEnum } from '../utils/resolveEnum';
import { getEffectiveTier, TIER_ATHLETE, TIER_HOBBYIST } from '../utils/tier';
import { ENRICHER_CATEGORIES, groupPluginsByCategory, getRecommendedPlugins } from '../utils/pluginCategories';
import './PipelineWizardPage.css';

interface SelectedEnricher {
    manifest: PluginManifest;
    config: Record<string, string>;
}

type WizardStep = 'source' | 'source-config' | 'enrichers' | 'enricher-config' | 'destinations' | 'destination-config' | 'review';

const PipelineWizardPage: React.FC = () => {
    const navigate = useNavigate();
    const { refresh: refreshPipelines } = useRealtimePipelines();
    const { sources: allSources, enrichers, destinations, integrations: registryIntegrations, loading, error: registryError } = usePluginRegistry();
    // Filter out sources that are temporarily unavailable (either directly or via their required integration)
    const sources = allSources.filter(s => {
        if (!s.enabled) return false;
        if (s.isTemporarilyUnavailable) return false;
        if (s.requiredIntegrations?.length) {
            return !s.requiredIntegrations.some(reqId => {
                const integration = registryIntegrations.find(i => i.id === reqId);
                return integration?.isTemporarilyUnavailable;
            });
        }
        return true;
    });
    const { integrations: userIntegrations } = useRealtimeIntegrations();
    const { user } = useUser();
    const { getDefault: getPluginDefault } = usePluginDefaults();

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
    const [selectedSources, setSelectedSources] = useState<string[]>([]);
    const [sourceConfig, setSourceConfig] = useState<Record<string, string>>({});
    const [selectedEnrichers, setSelectedEnrichers] = useState<SelectedEnricher[]>([]);
    const [currentEnricherIndex, setCurrentEnricherIndex] = useState<number>(0);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
    const [destinationConfigs, setDestinationConfigs] = useState<Record<string, Record<string, string>>>({});
    const [destinationExcludedEnrichers, setDestinationExcludedEnrichers] = useState<Record<string, string[]>>({});
    const [currentDestConfigIndex, setCurrentDestConfigIndex] = useState<number>(0);
    const [pipelineName, setPipelineName] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoEnricher, setInfoEnricher] = useState<PluginManifest | null>(null);
    const [enricherSearchQuery, setEnricherSearchQuery] = useState('');
    const [expandAllCategories, setExpandAllCategories] = useState(false);

    // Pre-select showcase destination if user has default preference enabled
    const { preferences: showcasePrefs } = useShowcasePreferences();
    useEffect(() => {
        if (showcasePrefs.defaultDestination && !selectedDestinations.includes('showcase')) {
            setSelectedDestinations(prev => prev.includes('showcase') ? prev : [...prev, 'showcase']);
        }
    }, [showcasePrefs.defaultDestination]); // eslint-disable-line react-hooks/exhaustive-deps

    const steps: WizardStep[] = ['source', 'source-config', 'enrichers', 'enricher-config', 'destinations', 'destination-config', 'review'];
    const currentStepIndex = steps.indexOf(step);
    const enrichersNeedConfig = selectedEnrichers.some(e => (e.manifest.configSchema?.length ?? 0) > 0);
    // Source config only applies when exactly one source is selected and it has configSchema.
    const selectedSourceManifest = selectedSources.length === 1 ? sources.find(s => s.id === selectedSources[0]) : undefined;
    const sourceNeedsConfig = (selectedSourceManifest?.configSchema?.length ?? 0) > 0;
    const destinationsWithConfig = selectedDestinations
        .map(id => destinations.find(d => d.id === id))
        .filter((d): d is PluginManifest => !!d && ((d.configSchema?.length ?? 0) > 0 || selectedEnrichers.length > 0));
    const destinationsNeedConfig = destinationsWithConfig.length > 0;

    const canProceed = () => {
        switch (step) {
            case 'source': return selectedSources.length > 0;
            case 'source-config': return true;
            case 'enrichers': return true;
            case 'enricher-config': return true;
            case 'destinations': return selectedDestinations.length > 0;
            case 'destination-config': return true;
            case 'review': return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (step === 'source') {
            // After source selection: if source needs config, show config step; else skip to enrichers
            if (sourceNeedsConfig) {
                setStep('source-config');
            } else {
                setStep('enrichers');
            }
        } else if (step === 'source-config') {
            setStep('enrichers');
        } else if (step === 'enrichers') {
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
        } else if (step === 'destinations') {
            // After destinations: if any destination needs config, show config step; else skip to review
            if (destinationsNeedConfig) {
                setCurrentDestConfigIndex(0);
                setStep('destination-config');
            } else {
                setStep('review');
            }
        } else if (step === 'destination-config') {
            // Move through destination configs one at a time
            if (currentDestConfigIndex < destinationsWithConfig.length - 1) {
                setCurrentDestConfigIndex(currentDestConfigIndex + 1);
            } else {
                setStep('review');
            }
        } else {
            const nextIndex = currentStepIndex + 1;
            if (nextIndex < steps.length) setStep(steps[nextIndex]);
        }
    };

    const handleBack = () => {
        if (step === 'source-config') {
            setStep('source');
        } else if (step === 'enrichers') {
            // Back from enrichers: if source needs config, go to source-config; else go to source
            if (sourceNeedsConfig) {
                setStep('source-config');
            } else {
                setStep('source');
            }
        } else if (step === 'enricher-config') {
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
            setStep('enrichers');
        } else if (step === 'destination-config') {
            if (currentDestConfigIndex > 0) {
                setCurrentDestConfigIndex(currentDestConfigIndex - 1);
            } else {
                setStep('destinations');
            }
        } else if (step === 'review') {
            // Back from review: if destinations need config, go to last dest config; else go to destinations
            if (destinationsNeedConfig) {
                setCurrentDestConfigIndex(destinationsWithConfig.length - 1);
                setStep('destination-config');
            } else {
                setStep('destinations');
            }
        } else {
            const prevIndex = currentStepIndex - 1;
            if (prevIndex >= 0) setStep(steps[prevIndex]);
        }
    };

    const toast = useToast();

    const handleCreate = async () => {
        if (selectedSources.length === 0 || selectedDestinations.length === 0) return;
        setCreating(true);
        setError(null);
        try {
            const enricherConfigs = selectedEnrichers.map(e => ({
                providerType: EnricherProviderType[e.manifest.enricherProviderType as number] || String(e.manifest.enricherProviderType),
                typedConfig: e.config
            }));
            const mergedDestConfigs: Record<string, { config: Record<string, string>; excludedEnrichers?: string[] }> = {};
            const destConfigKeys = new Set([
                ...Object.keys(destinationConfigs),
                ...Object.keys(destinationExcludedEnrichers).filter(k => (destinationExcludedEnrichers[k]?.length ?? 0) > 0),
            ]);
            for (const k of destConfigKeys) {
                const excluded = destinationExcludedEnrichers[k] ?? [];
                mergedDestConfigs[k] = {
                    config: destinationConfigs[k] || {},
                    ...(excluded.length > 0 ? { excludedEnrichers: excluded } : {}),
                };
            }
            await client.POST('/users/me/pipelines', {
                body: {
                    name: pipelineName || undefined,
                    sources: selectedSources,
                    enrichers: enricherConfigs,
                    destinations: selectedDestinations.map(id => destinations.find(d => d.id === id)?.destinationType ?? 0),
                    sourceConfig: Object.keys(sourceConfig).length > 0 ? sourceConfig : undefined,
                    destinationConfigs: Object.keys(mergedDestConfigs).length > 0 ? mergedDestConfigs : undefined,
                } as never,
            });
            await refreshPipelines();
            toast.success('Pipeline Created', `"${pipelineName || 'New Pipeline'}" has been created`);
            navigate('/settings/pipelines');
        } catch (err) {
            logger.error('Failed to create pipeline:', err);
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

    const stepLabels: Record<string, string> = {
        'source': 'Source',
        'source-config': 'Source Config',
        'enrichers': 'Boosters',
        'enricher-config': 'Configure',
        'destinations': 'Destinations',
        'destination-config': 'Dest Config',
        'review': 'Review',
    };

    const stepSubLabels: Record<string, string> = {
        'source': 'Pick where data comes from',
        'source-config': 'Configure source',
        'enrichers': 'Pick what to enrich',
        'enricher-config': 'Configure boosters',
        'destinations': 'Where to send',
        'destination-config': 'Configure destinations',
        'review': 'Validate with a sample',
    };

    const getDisplaySteps = () => steps.filter(s => {
        if (s === 'source-config' && !sourceNeedsConfig) return false;
        if (s === 'enricher-config' && !enrichersNeedConfig) return false;
        if (s === 'destination-config' && !destinationsNeedConfig) return false;
        return true;
    });

    const getStepRailValue = (s: WizardStep): string | null => {
        switch (s) {
            case 'source':
                if (selectedSources.length === 0) return null;
                return selectedSources
                    .map(id => sources.find(src => src.id === id)?.name ?? id)
                    .join(' · ');
            case 'source-config': return 'Configured';
            case 'enrichers':
                return selectedEnrichers.length > 0
                    ? `${selectedEnrichers.length} booster${selectedEnrichers.length !== 1 ? 's' : ''}`
                    : 'None';
            case 'enricher-config': return 'Configured';
            case 'destinations':
                if (selectedDestinations.length === 0) return null;
                return selectedDestinations
                    .map(id => destinations.find(d => d.id === id)?.name ?? id)
                    .join(' · ');
            case 'destination-config': return 'Configured';
            default: return null;
        }
    };

    const renderWizardRail = () => {
        const displaySteps = getDisplaySteps();
        const currentDisplayIndex = displaySteps.indexOf(step);

        return (
            <aside className="pipe-wiz__rail">
                <div className="pipe-wiz__rail-title">
                    New <span className="gr">pipeline.</span>
                </div>
                {displaySteps.map((s, i) => {
                    const isDone = i < currentDisplayIndex;
                    const isCurrent = s === step;
                    const value = isDone ? getStepRailValue(s) : null;

                    const classes = [
                        'wiz__step',
                        'wiz__step--edit-mode',
                        isDone ? 'wiz__step--done' : '',
                        isCurrent ? 'wiz__step--active' : '',
                    ].filter(Boolean).join(' ');

                    return (
                        <div
                            key={s}
                            className={classes}
                            onClick={() => isDone && setStep(s)}
                        >
                            <div className="wiz__step-n">
                                {isDone ? '✓' : i + 1}
                            </div>
                            <div>
                                <div className="wiz__step-title">{stepLabels[s]}</div>
                                {value
                                    ? <div className="wiz__step-value">{value}</div>
                                    : <div className="wiz__step-sub">{stepSubLabels[s]}</div>
                                }
                            </div>
                        </div>
                    );
                })}
            </aside>
        );
    };

    const renderSourceStep = () => {
        const availableSources = sources.filter(isPluginAvailable);
        const excludedSources = sources.filter(s => !isPluginAvailable(s));

        const sourceTiles = availableSources.map(s => ({
            id: s.id,
            name: s.name,
            icon: s.icon,
            connected: s.requiredIntegrations?.every(reqId => {
                const integration = (userIntegrations as Record<string, { connected?: boolean } | undefined> | null)?.[reqId];
                return integration?.connected ?? false;
            }) ?? true,
        }));

        const displaySteps = getDisplaySteps();
        const stepNum = displaySteps.indexOf('source') + 1;

        return (
            <>
                <WizardStepHead
                    step={stepNum} total={displaySteps.length} section="SOURCE"
                    title={<>Select your <span className="gr">sources.</span></>}
                    description="Pick one or more sources. Each one is a trigger — when a new activity arrives, this whole pipeline runs against it."
                />
                <div className="pipe-wiz__content">
                    {loading ? (
                        <Paragraph>Loading sources...</Paragraph>
                    ) : (
                        <>
                            <div className="wiz__sec-label">PICK A SOURCE · CHANGES WHAT TRIGGERS THE PIPELINE</div>
                            <SourcePicker
                                sources={sourceTiles}
                                multiSelect
                                selectedIds={selectedSources}
                                onSelect={(id) => setSelectedSources(prev =>
                                    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
                                )}
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
                </div>
            </>
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

        const displaySteps = getDisplaySteps();
        const stepNum = displaySteps.indexOf('enrichers') + 1;

        return (
            <>
                <WizardStepHead
                    step={stepNum} total={displaySteps.length} section="BOOSTERS (OPTIONAL)"
                    title={<>Pick your <span className="gr">boosters.</span></>}
                    description={<>Click to add boosters. Drag the <strong>grip handle</strong> to reorder.</>}
                />
                <div className="pipe-wiz__content">
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
                                <div className="pipe-wiz__section">
                                    <div className="fg-band fg-band--sm fg-band--ink">
                                        <span className="fg-band__label">⭐ RECOMMENDED FOR YOU</span>
                                        <span className="fg-band__right">{recommended.length} BOOSTERS</span>
                                    </div>
                                    <WizardOptionGrid
                                        options={recommended}
                                        selectedIds={selectedEnrichers.map(e => e.manifest.id)}
                                        onSelect={(option) => toggleEnricher(option as unknown as PluginManifest)}
                                    />
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <input
                                    className="pipe-wiz__search"
                                    type="text"
                                    placeholder="Search boosters..."
                                    value={enricherSearchQuery}
                                    onChange={(e) => setEnricherSearchQuery(e.target.value)}
                                />
                                <Button
                                    variant="ink"
                                    size="sm"
                                    onClick={() => setExpandAllCategories(!expandAllCategories)}
                                >
                                    {expandAllCategories ? 'COLLAPSE ALL' : 'EXPAND ALL'}
                                </Button>
                            </div>
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
                </div>
            </>
        );
    };

    const renderEnricherConfigStep = () => {
        if (selectedEnrichers.length === 0) return null;
        const current = selectedEnrichers[currentEnricherIndex];
        if (!current || (current.manifest.configSchema?.length ?? 0) === 0) return null;
        const configurableCount = selectedEnrichers.filter(e => (e.manifest.configSchema?.length ?? 0) > 0).length;

        const displaySteps = getDisplaySteps();
        const stepNum = displaySteps.indexOf('enricher-config') + 1;
        const configSection = configurableCount > 1
            ? `CONFIGURE BOOSTER · ${currentEnricherIndex + 1} OF ${configurableCount}`
            : 'CONFIGURE BOOSTER';

        return (
            <>
                <WizardStepHead
                    step={stepNum} total={displaySteps.length} section={configSection}
                    title={<>Configure <span className="gr">{current.manifest.name.toLowerCase()}.</span></>}
                    description={current.manifest.description ?? ''}
                />
                <div className="pipe-wiz__content">
                    <Card>
                        {current.manifest.id === 'logic-gate' ? (
                            <LogicGateConfigForm key={`logic-gate-${currentEnricherIndex}`} initialValues={current.config}
                                onChange={config => updateEnricherConfig(currentEnricherIndex, config)} />
                        ) : (
                            <EnricherConfigForm key={`${current.manifest.id}-${currentEnricherIndex}`} schema={current.manifest.configSchema ?? []} initialValues={current.config}
                                onChange={config => updateEnricherConfig(currentEnricherIndex, config)} />
                        )}
                    </Card>
                </div>
            </>
        );
    };

    const renderDestinationsStep = () => {
        const availableDestinations = destinations.filter(isPluginAvailable);
        const excludedDestinations = destinations.filter(d => !isPluginAvailable(d));
        const unselectedAvailable = availableDestinations.filter(d => !selectedDestinations.includes(d.id));

        const displaySteps = getDisplaySteps();
        const stepNum = displaySteps.indexOf('destinations') + 1;

        return (
            <>
                <WizardStepHead
                    step={stepNum} total={displaySteps.length} section="DESTINATIONS"
                    title={<>Where to <span className="gr">send.</span></>}
                    description="Select at least one destination. Activities from every source trigger uploads to all selected destinations."
                />
                <div className="pipe-wiz__content">
                    {loading ? (
                        <Paragraph>Loading destinations...</Paragraph>
                    ) : (
                        <>
                            {selectedDestinations.length > 0 && (
                                <>
                                    <div className="wiz__sec-label">
                                        SELECTED · {selectedDestinations.length} DESTINATION{selectedDestinations.length !== 1 ? 'S' : ''}
                                    </div>
                                    <div style={{ maxWidth: '720px', marginBottom: '1.125rem' }}>
                                        {selectedDestinations
                                            .map(id => destinations.find(d => d.id === id))
                                            .filter((d): d is NonNullable<typeof d> => !!d)
                                            .map(d => (
                                                <div key={d.id} className="dest-chip">
                                                    <div className="dest-chip__icon">{d.icon}</div>
                                                    <div className="dest-chip__main">
                                                        <span className="dest-chip__name">{d.name}</span>
                                                    </div>
                                                    <div className="dest-chip__actions">
                                                        <button
                                                            className="dest-chip__remove"
                                                            onClick={() => toggleDestination(d.id)}
                                                            type="button"
                                                            aria-label={`Remove ${d.name}`}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </>
                            )}
                            {unselectedAvailable.length > 0 && (
                                <>
                                    <div className="wiz__sec-label">ADD MORE DESTINATIONS</div>
                                    <WizardOptionGrid
                                        options={unselectedAvailable}
                                        selectedIds={selectedDestinations}
                                        onSelect={(dest) => toggleDestination(dest.id)}
                                        selectionMode="multi"
                                    />
                                </>
                            )}
                            <WizardExcludedSection
                                items={excludedDestinations}
                                getKey={d => d.id}
                                getIcon={d => d.icon}
                                getName={d => d.name}
                                getHint={getExcludedHint}
                            />
                        </>
                    )}
                </div>
            </>
        );
    };

    const renderReviewStep = () => {
        const reviewSources = sources
            .filter(s => selectedSources.includes(s.id))
            .map(s => ({ id: s.id, icon: s.icon, iconType: s.iconType, iconPath: s.iconPath, name: s.name }));
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
            return resolveEnum(field?.fieldType, ConfigFieldType) === ConfigFieldType.CONFIG_FIELD_TYPE_KEY_VALUE_MAP;
        };

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

        const reviewDests = dests.map(d => ({
            id: d.id,
            icon: d.icon,
            iconType: d.iconType,
            iconPath: d.iconPath,
            name: d.name,
        }));

        const displaySteps = getDisplaySteps();
        const stepNum = displaySteps.indexOf('review') + 1;

        return (
            <>
                <WizardStepHead
                    step={stepNum} total={displaySteps.length} section="REVIEW & CONFIRM"
                    title={<>Review your <span className="gr">pipeline.</span></>}
                    description="Name your pipeline and confirm the configuration before creating."
                />
                <div className="pipe-wiz__content">
                    <Card>
                        <FormField label="Pipeline Name (Optional)" htmlFor="pipelineName">
                            <FormInput id="pipelineName" type="text" placeholder="e.g., Morning Gym Sessions"
                                value={pipelineName} onChange={(e) => setPipelineName(e.target.value)}
                                maxLength={64} />
                        </FormField>
                    </Card>

                    <PipelineReviewFlow
                        sources={reviewSources}
                        enrichers={reviewEnrichers}
                        destinations={reviewDests}
                    />

                    {error && <div className="pipe-wiz__error">{error}</div>}
                </div>
            </>
        );
    };

    const renderSourceConfigStep = () => {
        if (!selectedSourceManifest?.configSchema?.length) return null;
        const displaySteps = getDisplaySteps();
        const stepNum = displaySteps.indexOf('source-config') + 1;

        return (
            <>
                <WizardStepHead
                    step={stepNum} total={displaySteps.length} section="SOURCE CONFIGURATION"
                    title={<>Configure your <span className="gr">source.</span></>}
                    description={`Set up the configuration for ${selectedSourceManifest.name}.`}
                />
                <div className="pipe-wiz__content">
                    <Card>
                        <PluginConfigForm
                            key={selectedSourceManifest.id}
                            schema={selectedSourceManifest.configSchema}
                            initialValues={Object.keys(sourceConfig).length > 0 ? sourceConfig : (getPluginDefault(selectedSourceManifest.id) || {})}
                            onChange={setSourceConfig}
                        />
                    </Card>
                </div>
            </>
        );
    };

    const renderDestinationConfigStep = () => {
        const destManifest = destinationsWithConfig[currentDestConfigIndex];
        if (!destManifest) return null;
        const displaySteps = getDisplaySteps();
        const stepNum = displaySteps.indexOf('destination-config') + 1;
        const destSection = destinationsWithConfig.length > 1
            ? `DESTINATION CONFIG · ${currentDestConfigIndex + 1} OF ${destinationsWithConfig.length}`
            : 'DESTINATION CONFIGURATION';

        const hasPluginConfig = (destManifest.configSchema?.length ?? 0) > 0;
        const enricherItems: EnricherExclusionItem[] = selectedEnrichers
            .filter(e => e.manifest.enricherProviderType != null && Number(e.manifest.enricherProviderType) !== 0)
            .map(e => ({
                key: EnricherProviderType[e.manifest.enricherProviderType as number] || String(e.manifest.enricherProviderType),
                name: e.manifest.name,
                icon: e.manifest.icon,
            }))
            .filter(e => e.key && e.key !== 'undefined');

        const description = hasPluginConfig && enricherItems.length > 0
            ? 'Configure this destination and control which booster outputs reach it.'
            : hasPluginConfig
            ? 'Set up your destination configuration.'
            : 'Choose which booster outputs to include in the description for this destination.';

        return (
            <>
                <WizardStepHead
                    step={stepNum} total={displaySteps.length} section={destSection}
                    title={<>Configure <span className="gr">{destManifest.name.toLowerCase()}.</span></>}
                    description={description}
                />
                <div className="pipe-wiz__content">
                    <Card>
                        {hasPluginConfig && (
                            <PluginConfigForm
                                key={destManifest.id}
                                schema={destManifest.configSchema!}
                                initialValues={destinationConfigs[destManifest.id] || getPluginDefault(destManifest.id) || {}}
                                onChange={(values) => setDestinationConfigs(prev => ({ ...prev, [destManifest.id]: values }))}
                            />
                        )}
                        {enricherItems.length > 0 && (
                            <DestinationEnricherExclusion
                                enrichers={enricherItems}
                                excludedEnrichers={destinationExcludedEnrichers[destManifest.id] || []}
                                onChange={(excluded) => setDestinationExcludedEnrichers(prev => ({ ...prev, [destManifest.id]: excluded }))}
                                standalone={!hasPluginConfig}
                            />
                        )}
                    </Card>
                </div>
            </>
        );
    };

    const renderCurrentStep = () => {
        switch (step) {
            case 'source': return renderSourceStep();
            case 'source-config': return renderSourceConfigStep();
            case 'enrichers': return renderEnrichersStep();
            case 'enricher-config': return renderEnricherConfigStep();
            case 'destinations': return renderDestinationsStep();
            case 'destination-config': return renderDestinationConfigStep();
            case 'review': return renderReviewStep();
            default: return null;
        }
    };

    if (registryError) {
        return (
            <PageLayout title="Create Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <div className="fg-band fg-band--ink">
                    <span className="fg-band__label">ERROR LOADING REGISTRY</span>
                </div>
                <div style={{ padding: '1.5rem 2rem' }}>
                    <p style={{ fontFamily: 'var(--fg-font-body)', color: 'var(--fg-rose)', marginBottom: '1rem' }}>
                        Failed to load plugin registry: {registryError}
                    </p>
                    <Button size="sm" onClick={() => window.location.reload()}>RETRY</Button>
                </div>
            </PageLayout>
        );
    }

    return (
        <>
            <PageLayout
                title="Create Pipeline"
                backTo="/settings/pipelines"
                backLabel="Pipelines"
                headerActions={
                    <PageAction tone="secondary" onClick={() => navigate('/settings/pipelines')}>
                        Cancel
                    </PageAction>
                }
            >
                {/* Wizard layout: rail + body */}
                <div className="pipe-wiz">
                    {renderWizardRail()}

                    <div className="pipe-wiz__body">
                        {renderCurrentStep()}

                        {/* Footer actions */}
                        <div className="pipe-wiz__actions">
                            {currentStepIndex > 0 ? (
                                <button className="wiz__back" onClick={handleBack}>
                                    ← BACK
                                </button>
                            ) : (
                                <span />
                            )}

                            <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.14em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                {getDisplaySteps().indexOf(step) + 1} OF {getDisplaySteps().length}
                            </span>

                            {step !== 'review' ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed() || loading}
                                >
                                    NEXT →
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleCreate}
                                    disabled={creating}
                                >
                                    {creating ? 'CREATING…' : 'CREATE PIPELINE →'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </PageLayout>
            {infoEnricher && <EnricherInfoModal enricher={infoEnricher} onClose={() => setInfoEnricher(null)} />}
        </>
    );
};

export default PipelineWizardPage;
