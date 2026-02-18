import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/library/layout/PageLayout';
import { Stack } from '../components/library/layout/Stack';
import { Card } from '../components/library/ui/Card';
import { Button } from '../components/library/ui/Button';
import { Heading } from '../components/library/ui/Heading';
import { Paragraph } from '../components/library/ui/Paragraph';
import { useToast } from '../components/library/ui/Toast';
import { EnricherTimeline } from '../components/EnricherTimeline';
import { EnricherInfoModal } from '../components/EnricherInfoModal';
import { PluginConfigForm } from '../components/EnricherConfigForm';
import { SharePipelineModal } from '../components/SharePipelineModal';
import { WizardOptionGrid, WizardExcludedSection } from '../components/wizard';
import { PluginCategorySection } from '../components/PluginCategorySection';
import { BoosterExclusionPills } from '../components/BoosterExclusionPills';
import { Input as FormInput } from '../components/library/forms';
import { useNerdMode } from '../state/NerdModeContext';
import { EnricherProviderType } from '../../types/pb/user';
import { useApi } from '../hooks/useApi';
import { usePluginDefaults } from '../hooks/usePluginDefaults';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { CardSkeleton } from '../components/library/ui/CardSkeleton';
import '../components/library/ui/CardSkeleton.css';
import { PluginManifest } from '../types/plugin';
import { Input } from '../components/library/forms';
import { encodePipeline } from '../../shared/pipeline-sharing';
import { ENRICHER_CATEGORIES, groupPluginsByCategory } from '../utils/pluginCategories';

interface EnricherConfig {
    providerType: number;
    typedConfig?: Record<string, string>;
}

interface PipelineConfig {
    id: string;
    name?: string;
    source: string;
    enrichers: EnricherConfig[];
    destinations: (string | number)[];
    sourceConfig?: Record<string, string>;
    destinationConfigs?: Record<string, { config: Record<string, string>; excludedEnrichers?: string[] }>;
}

interface SelectedEnricher {
    manifest: PluginManifest;
    config: Record<string, string>;
}

const PipelineEditPage: React.FC = () => {
    const { pipelineId } = useParams<{ pipelineId: string }>();
    const navigate = useNavigate();
    const api = useApi();
    const { sources, enrichers, destinations, integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { integrations: userIntegrations } = useRealtimeIntegrations();
    const { refresh: invalidatePipelines } = useRealtimePipelines();
    const { getDefault: getPluginDefault } = usePluginDefaults();
    const { isNerdMode } = useNerdMode();

    const isPluginAvailable = (plugin: PluginManifest): boolean => {
        if (!plugin.requiredIntegrations?.length) return true;
        return plugin.requiredIntegrations.every(integrationId => {
            const integration = (userIntegrations as Record<string, { connected?: boolean } | undefined> | null)?.[integrationId];
            return integration?.connected ?? false;
        });
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
        return `Connect ${getMissingIntegrations(plugin).join(', ')} to enable`;
    };

    const [pipeline, setPipeline] = useState<PipelineConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pipelineName, setPipelineName] = useState('');
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [selectedEnrichers, setSelectedEnrichers] = useState<SelectedEnricher[]>([]);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
    const [sourceConfig, setSourceConfig] = useState<Record<string, string>>({});
    const [destinationConfigs, setDestinationConfigs] = useState<Record<string, Record<string, string>>>({});
    const [excludedEnrichersByDest, setExcludedEnrichersByDest] = useState<Record<string, string[]>>({});
    const [editingEnrichers, setEditingEnrichers] = useState(false);
    const [infoEnricher, setInfoEnricher] = useState<PluginManifest | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [enricherSearchQuery, setEnricherSearchQuery] = useState('');
    const [expandAllCategories, setExpandAllCategories] = useState(false);

    const fetchPipeline = useCallback(async () => {
        if (!pipelineId) return;
        setLoading(true);
        try {
            const response = await api.get(`/users/me/pipelines/${pipelineId}`);
            const pipelineData = response as PipelineConfig;
            setPipeline(pipelineData);
            setPipelineName(pipelineData.name || '');
            setSelectedSource(pipelineData.source);
            setSelectedDestinations(pipelineData.destinations.map(d => String(d)));
            const enricherConfigs: SelectedEnricher[] = pipelineData.enrichers.map(e => {
                const manifest = enrichers.find(m => Number(m.enricherProviderType) === Number(e.providerType));
                return {
                    manifest: manifest || { id: `unknown-${e.providerType}`, name: `Enricher ${e.providerType}` } as PluginManifest,
                    config: e.typedConfig || {}
                };
            }).filter(e => e.manifest);
            setSelectedEnrichers(enricherConfigs);
            setSourceConfig(pipelineData.sourceConfig || {});
            setDestinationConfigs(
                Object.fromEntries(
                    Object.entries(pipelineData.destinationConfigs || {}).map(([k, v]) => [k, v.config || {}])
                )
            );
            setExcludedEnrichersByDest(
                Object.fromEntries(
                    Object.entries(pipelineData.destinationConfigs || {})
                        .filter(([, v]) => v.excludedEnrichers && v.excludedEnrichers.length > 0)
                        .map(([k, v]) => [k, v.excludedEnrichers!])
                )
            );
        } catch (err) {
            setError('Failed to load pipeline');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [pipelineId, api, enrichers]);

    const toast = useToast();

    useEffect(() => {
        if (!registryLoading && enrichers.length > 0) fetchPipeline();
    }, [fetchPipeline, registryLoading, enrichers]);

    const handleSave = async () => {
        if (!pipelineId) return;
        setSaving(true);
        setError(null);
        try {
            const enricherConfigs = selectedEnrichers.map(e => ({
                providerType: e.manifest.enricherProviderType,
                typedConfig: e.config
            }));
            // Merge config + excludedEnrichers into destination configs
            const mergedDestConfigs: Record<string, { config: Record<string, string>; excludedEnrichers?: string[] }> = {};
            const allDestKeys = new Set([...Object.keys(destinationConfigs), ...Object.keys(excludedEnrichersByDest)]);
            for (const k of allDestKeys) {
                mergedDestConfigs[k] = {
                    config: destinationConfigs[k] || {},
                    ...(excludedEnrichersByDest[k]?.length ? { excludedEnrichers: excludedEnrichersByDest[k] } : {}),
                };
            }
            await api.patch(`/users/me/pipelines/${pipelineId}`, {
                name: pipelineName || undefined,
                source: selectedSource,
                enrichers: enricherConfigs,
                destinations: selectedDestinations.map(d => isNaN(Number(d)) ? d : Number(d)),
                sourceConfig: Object.keys(sourceConfig).length > 0 ? sourceConfig : undefined,
                destinationConfigs: Object.keys(mergedDestConfigs).length > 0 ? mergedDestConfigs : undefined,
            });
            invalidatePipelines();
            toast.success('Pipeline Saved', `"${pipelineName || 'Pipeline'}" has been updated`);
            navigate('/settings/pipelines');
        } catch (err) {
            setError('Failed to save pipeline');
            toast.error('Save Failed', 'Failed to save pipeline. Please try again.');
            console.error(err);
        } finally {
            setSaving(false);
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
            if (updated[index]) updated[index] = { ...updated[index], config };
            return updated;
        });
    }, []);

    const toggleDestination = (dest: PluginManifest) => {
        setSelectedDestinations(prev => {
            const isSelected = prev.some(sd => sd === dest.id || Number(sd) === dest.destinationType);
            if (isSelected) return prev.filter(d => d !== dest.id && Number(d) !== dest.destinationType);
            return [...prev, dest.id];
        });
    };

    if (loading || registryLoading) {
        return (
            <PageLayout title="Edit Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <Stack gap="lg">
                    <CardSkeleton variant="pipeline-full" />
                    <CardSkeleton variant="pipeline-full" />
                </Stack>
            </PageLayout>
        );
    }

    if (!pipeline) {
        return (
            <PageLayout title="Edit Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <Card><Paragraph>Pipeline not found</Paragraph></Card>
            </PageLayout>
        );
    }

    const availableSources = sources.filter(s => s.enabled && isPluginAvailable(s));
    const excludedSources = sources.filter(s => s.enabled && !isPluginAvailable(s));
    const availableEnrichers = enrichers.filter(e => e.enabled && isPluginAvailable(e));
    const excludedEnrichers = enrichers.filter(e => e.enabled && !isPluginAvailable(e));
    const filteredEnrichers = enricherSearchQuery
        ? availableEnrichers.filter(e =>
            e.name.toLowerCase().includes(enricherSearchQuery.toLowerCase()) ||
            (e.description ?? '').toLowerCase().includes(enricherSearchQuery.toLowerCase()))
        : availableEnrichers;
    const groupedEnrichers = groupPluginsByCategory(filteredEnrichers, ENRICHER_CATEGORIES);
    const availableDestinations = destinations.filter(d => d.enabled && isPluginAvailable(d));
    const excludedDestinations = destinations.filter(d => d.enabled && !isPluginAvailable(d));

    return (
        <>
            <PageLayout title="Edit Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                {error && (
                    <Card onClick={() => setError(null)}>{error}</Card>
                )}
                <Stack>
                    {/* Pipeline Name Section */}
                    <Card>
                        <Heading level={3}>🏷️ Pipeline Name</Heading>
                        <Paragraph>Give your pipeline a friendly name (optional)</Paragraph>
                        <Stack>
                            <Input type="text" placeholder="e.g., Morning Gym Sessions" value={pipelineName}
                                onChange={(e) => setPipelineName(e.target.value)} maxLength={64} />
                        </Stack>
                    </Card>

                    {/* Source Section */}
                    <Card>
                        <Heading level={3}>📥 Source</Heading>
                        <Paragraph>Pick <strong>only one</strong> source for your activities</Paragraph>
                        <WizardOptionGrid
                            options={availableSources}
                            selectedIds={availableSources.filter(s => selectedSource.toLowerCase().includes(s.id)).map(s => s.id)}
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
                    </Card>

                    {/* Source Config Section — shown inline if selected source has configSchema */}
                    {(() => {
                        const sourceManifest = sources.find(s => selectedSource.toLowerCase().includes(s.id));
                        if (!sourceManifest?.configSchema?.length) return null;
                        return (
                            <Card>
                                <Heading level={3}>⚙️ Source Configuration</Heading>
                                <Paragraph>Configure {sourceManifest.name}</Paragraph>
                                <PluginConfigForm
                                    key={sourceManifest.id}
                                    schema={sourceManifest.configSchema}
                                    initialValues={Object.keys(sourceConfig).length > 0 ? sourceConfig : (getPluginDefault(sourceManifest.id) || {})}
                                    onChange={setSourceConfig}
                                />
                            </Card>
                        );
                    })()}

                    {/* Enrichers Section */}
                    <Card>
                        <Stack direction="horizontal" align="center" justify="between">
                            <Stack gap="xs">
                                <Heading level={3}>✨ Enrichers</Heading>
                                <Paragraph>Data enhancements applied to activities</Paragraph>
                            </Stack>
                            <Button variant="secondary" size="small" onClick={() => setEditingEnrichers(!editingEnrichers)}>
                                {editingEnrichers ? 'Done' : 'Edit Enrichers'}
                            </Button>
                        </Stack>
                        {!editingEnrichers && (
                            <>
                                {selectedEnrichers.length === 0 ? (
                                    <Paragraph>No enrichers selected. Click &quot;Edit Enrichers&quot; to add boosters.</Paragraph>
                                ) : (
                                    <EnricherTimeline
                                        enrichers={selectedEnrichers}
                                        onReorder={setSelectedEnrichers}
                                        onRemove={(index) => setSelectedEnrichers(prev => prev.filter((_, i) => i !== index))}
                                        onInfoClick={(manifest) => setInfoEnricher(manifest)}
                                        onConfigChange={updateEnricherConfig}
                                    />
                                )}
                            </>
                        )}
                    </Card>
                    {editingEnrichers && (
                        <>
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
                                    getDisabledReason={(plugin) => getExcludedHint(plugin)}
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

                    {/* Destinations Section */}
                    <Card>
                        <Heading level={3}>📤 Destinations</Heading>
                        <Paragraph>Select <strong>at least one</strong> destination</Paragraph>
                        <WizardOptionGrid
                            options={availableDestinations}
                            selectedIds={selectedDestinations}
                            onSelect={(option) => toggleDestination(option as unknown as PluginManifest)}
                            selectionMode="multi"
                            getOptionProps={(dest) => ({
                                selected: selectedDestinations.some(sd => sd === dest.id || Number(sd) === (dest as unknown as PluginManifest).destinationType)
                            })}
                        />
                        <WizardExcludedSection
                            items={excludedDestinations}
                            getKey={d => d.id}
                            getIcon={d => d.icon}
                            getName={d => d.name}
                            getHint={getExcludedHint}
                        />
                        {/* NerdMode: Per-destination enricher exclusions */}
                        {isNerdMode && selectedEnrichers.length > 0 && selectedDestinations.map(destId => {
                            const destManifest = destinations.find(d => d.id === destId || d.destinationType === Number(destId));
                            if (!destManifest) return null;
                            const enricherInfos = selectedEnrichers.map(e => ({
                                id: e.manifest.id,
                                name: e.manifest.name,
                                providerType: EnricherProviderType[e.manifest.enricherProviderType as number] || String(e.manifest.enricherProviderType),
                                icon: e.manifest.icon,
                                iconType: e.manifest.iconType,
                                iconPath: e.manifest.iconPath,
                            }));
                            return (
                                <BoosterExclusionPills
                                    key={`excl-${destManifest.id}`}
                                    destinationId={destManifest.id}
                                    destinationName={destManifest.name}
                                    enrichers={enricherInfos}
                                    excludedProviderTypes={excludedEnrichersByDest[destManifest.id] || []}
                                    onChange={(destId, excluded) => setExcludedEnrichersByDest(prev => ({
                                        ...prev,
                                        [destId]: excluded,
                                    }))}
                                />
                            );
                        })}
                    </Card>

                    {/* Destination Config Sections — shown inline for each selected destination with configSchema */}
                    {selectedDestinations.map(destId => {
                        const destManifest = destinations.find(d => d.id === destId || d.destinationType === Number(destId));
                        if (!destManifest?.configSchema?.length) return null;
                        return (
                            <Card key={`config-${destManifest.id}`}>
                                <Heading level={3}>⚙️ {destManifest.name} Configuration</Heading>
                                <PluginConfigForm
                                    schema={destManifest.configSchema}
                                    initialValues={destinationConfigs[destManifest.id] || getPluginDefault(destManifest.id) || {}}
                                    onChange={(values) => setDestinationConfigs(prev => ({ ...prev, [destManifest.id]: values }))}
                                />
                            </Card>
                        );
                    })}

                    {/* Actions */}
                    <Stack direction="horizontal" justify="between">
                        <Button variant="secondary" onClick={() => setShowShareModal(true)}>📤 Share</Button>
                        <Stack direction="horizontal" gap="sm">
                            <Button variant="secondary" onClick={() => navigate('/settings/pipelines')}>Cancel</Button>
                            <Button variant="primary" onClick={handleSave}
                                disabled={saving || !selectedSource || selectedDestinations.length === 0}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </PageLayout>

            {infoEnricher && <EnricherInfoModal enricher={infoEnricher} onClose={() => setInfoEnricher(null)} />}

            {showShareModal && pipeline && (
                <SharePipelineModal
                    encodedPipeline={encodePipeline({
                        id: pipeline.id,
                        name: pipelineName,
                        source: selectedSource,
                        enrichers: selectedEnrichers.map(e => ({
                            providerType: e.manifest.enricherProviderType || 0,
                            typedConfig: e.config
                        })),
                        // Convert numeric destinationType values to string IDs for sharing
                        destinations: selectedDestinations.map(d => {
                            // If it's already a string ID (not a number), return as-is
                            if (isNaN(Number(d))) return d;
                            // Find the destination manifest by destinationType and return its ID
                            const destManifest = destinations.find(dest => dest.destinationType === Number(d));
                            return destManifest?.id ?? d;
                        })
                    })}
                    pipelineName={pipelineName || 'Unnamed Pipeline'}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </>
    );
};

export default PipelineEditPage;
