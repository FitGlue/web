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
import { SharePipelineModal } from '../components/SharePipelineModal';
import { WizardOptionGrid, WizardExcludedSection } from '../components/wizard';
import { useApi } from '../hooks/useApi';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { CardSkeleton } from '../components/library/ui/CardSkeleton';
import '../components/library/ui/CardSkeleton.css';
import { PluginManifest } from '../types/plugin';
import { Input } from '../components/library/forms';
import { encodePipeline } from '../../shared/pipeline-sharing';

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
    const [editingEnrichers, setEditingEnrichers] = useState(false);
    const [infoEnricher, setInfoEnricher] = useState<PluginManifest | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);

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
            await api.patch(`/users/me/pipelines/${pipelineId}`, {
                name: pipelineName || undefined,
                source: selectedSource,
                enrichers: enricherConfigs,
                destinations: selectedDestinations.map(d => isNaN(Number(d)) ? d : Number(d))
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
                        {editingEnrichers ? (
                            <>
                                <WizardOptionGrid
                                    options={availableEnrichers}
                                    selectedIds={selectedEnrichers.map(e => e.manifest.id)}
                                    onSelect={(option) => toggleEnricher(option as unknown as PluginManifest)}
                                />
                                <WizardExcludedSection
                                    items={excludedEnrichers}
                                    getKey={e => e.id}
                                    getIcon={e => e.icon}
                                    getName={e => e.name}
                                    getHint={getExcludedHint}
                                />
                            </>
                        ) : (
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
                    </Card>

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
