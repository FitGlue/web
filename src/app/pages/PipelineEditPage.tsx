import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EnricherConfigForm } from '../components/EnricherConfigForm';
import { EnricherTimeline } from '../components/EnricherTimeline';
import { EnricherInfoModal } from '../components/EnricherInfoModal';
import { useApi } from '../hooks/useApi';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useIntegrations } from '../hooks/useIntegrations';
import { LoadingState } from '../components/ui/LoadingState';
import { PluginManifest } from '../types/plugin';

interface EnricherConfig {
    providerType: number;
    typedConfig?: Record<string, string>;
}

interface PipelineConfig {
    id: string;
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
    const { integrations: userIntegrations, fetchIfNeeded: fetchIntegrations } = useIntegrations();

    // Fetch user integrations on mount
    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    // Helper: Check if a plugin's required integrations are all connected
    const isPluginAvailable = (plugin: PluginManifest): boolean => {
        if (!plugin.requiredIntegrations?.length) return true;
        return plugin.requiredIntegrations.every(integrationId => {
            const key = integrationId as keyof typeof userIntegrations;
            return userIntegrations?.[key]?.connected ?? false;
        });
    };

    // Helper: Get missing integration names for a plugin
    const getMissingIntegrations = (plugin: PluginManifest): string[] => {
        if (!plugin.requiredIntegrations?.length) return [];
        return plugin.requiredIntegrations.filter(integrationId => {
            const key = integrationId as keyof typeof userIntegrations;
            return !(userIntegrations?.[key]?.connected ?? false);
        }).map(id => {
            const manifest = registryIntegrations.find(i => i.id === id);
            return manifest?.name ?? id;
        });
    };

    const [pipeline, setPipeline] = useState<PipelineConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Editable state
    const [selectedSource, setSelectedSource] = useState<string>('');
    const [selectedEnrichers, setSelectedEnrichers] = useState<SelectedEnricher[]>([]);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
    const [currentEnricherIndex, setCurrentEnricherIndex] = useState<number>(0);
    const [editingEnrichers, setEditingEnrichers] = useState(false);
    const [infoEnricher, setInfoEnricher] = useState<PluginManifest | null>(null);

    const fetchPipeline = useCallback(async () => {
        if (!pipelineId) return;

        setLoading(true);
        try {
            const response = await api.get(`/users/me/pipelines/${pipelineId}`);
            const pipelineData = response as PipelineConfig;
            setPipeline(pipelineData);

            // Populate editable state
            setSelectedSource(pipelineData.source);
            setSelectedDestinations(pipelineData.destinations.map(d => String(d)));

            // Map enricher configs to selected enrichers with manifests
            const enricherConfigs: SelectedEnricher[] = pipelineData.enrichers.map(e => {
                const manifest = enrichers.find(
                    m => Number(m.enricherProviderType) === Number(e.providerType)
                );
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

    useEffect(() => {
        if (!registryLoading && enrichers.length > 0) {
            fetchPipeline();
        }
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
                source: selectedSource,
                enrichers: enricherConfigs,
                destinations: selectedDestinations.map(d => isNaN(Number(d)) ? d : Number(d))
            });

            navigate('/settings/pipelines');
        } catch (err) {
            setError('Failed to save pipeline');
            console.error(err);
        } finally {
            setSaving(false);
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
            if (updated[index]) {
                updated[index] = { ...updated[index], config };
            }
            return updated;
        });
    }, []);

    const enrichersNeedConfig = selectedEnrichers.some(e => e.manifest.configSchema?.length > 0);
    const currentEnricher = selectedEnrichers[currentEnricherIndex];

    if (loading || registryLoading) {
        return (
            <PageLayout title="Edit Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <LoadingState />
            </PageLayout>
        );
    }

    if (!pipeline) {
        return (
            <PageLayout title="Edit Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <Card>
                    <p>Pipeline not found</p>
                </Card>
            </PageLayout>
        );
    }

    return (
    <>
        <PageLayout title="Edit Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
            {error && (
                <div className="auth-message error" onClick={() => setError(null)}>
                    {error}
                </div>
            )}

            <div className="pipeline-edit">
                {/* Source Section */}
                <Card className="edit-section">
                    <h3>📥 Source</h3>
                    <p className="section-description">Where activities come from</p>
                    <div className="option-grid">
                        {sources.filter(s => s.enabled && isPluginAvailable(s)).map(source => (
                            <Card
                                key={source.id}
                                className={`option-card ${selectedSource.toLowerCase().includes(source.id) ? 'selected' : ''}`}
                                onClick={() => setSelectedSource(source.id)}
                            >
                                <span className="option-icon">{source.icon}</span>
                                <h4>{source.name}</h4>
                                <p>{source.description}</p>
                                {selectedSource.toLowerCase().includes(source.id) && (
                                    <span className="selected-check">✓</span>
                                )}
                            </Card>
                        ))}
                    </div>
                    {sources.filter(s => s.enabled && !isPluginAvailable(s)).length > 0 && (
                        <div className="excluded-plugins-section">
                            <span className="excluded-label">Needs Connection</span>
                            <div className="excluded-plugins-grid">
                                {sources.filter(s => s.enabled && !isPluginAvailable(s)).map(source => (
                                    <div key={source.id} className="excluded-plugin-card">
                                        <span className="excluded-icon">{source.icon}</span>
                                        <span className="excluded-name">{source.name}</span>
                                        <span className="excluded-hint">
                                            Connect {getMissingIntegrations(source).join(', ')} to enable
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Enrichers Section */}
                <Card className="edit-section">
                    <div className="section-header-row">
                        <div>
                            <h3>✨ Enrichers</h3>
                            <p className="section-description">Data enhancements applied to activities</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() => setEditingEnrichers(!editingEnrichers)}
                        >
                            {editingEnrichers ? 'Done' : 'Edit Enrichers'}
                        </Button>
                    </div>

                    {editingEnrichers ? (
                        <>
                        <div className="option-grid">
                            {enrichers.filter(e => e.enabled && isPluginAvailable(e)).map(enricher => {
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
                                        {enricher.configSchema && enricher.configSchema.length > 0 && (
                                            <span className="has-config" title="Has configuration options">⚙️</span>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                        {enrichers.filter(e => e.enabled && !isPluginAvailable(e)).length > 0 && (
                            <div className="excluded-plugins-section">
                                <span className="excluded-label">Needs Connection</span>
                                <div className="excluded-plugins-grid">
                                    {enrichers.filter(e => e.enabled && !isPluginAvailable(e)).map(enricher => (
                                        <div key={enricher.id} className="excluded-plugin-card">
                                            <span className="excluded-icon">{enricher.icon}</span>
                                            <span className="excluded-name">{enricher.name}</span>
                                            <span className="excluded-hint">
                                                Connect {getMissingIntegrations(enricher).join(', ')} to enable
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                    ) : (
                        <>
                            {selectedEnrichers.length === 0 ? (
                                <p className="no-items">No enrichers selected. Click &ldquo;Edit Enrichers&rdquo; to add boosters.</p>
                            ) : (
                                <EnricherTimeline
                                    enrichers={selectedEnrichers}
                                    onReorder={setSelectedEnrichers}
                                    onRemove={(index) => setSelectedEnrichers(prev => prev.filter((_, i) => i !== index))}
                                    onInfoClick={(manifest) => setInfoEnricher(manifest)}
                                />
                            )}
                        </>
                    )}
                </Card>

                {/* Enricher Configuration */}
                {enrichersNeedConfig && !editingEnrichers && (
                    <Card className="edit-section">
                        <h3>⚙️ Configure Enrichers</h3>
                        <div className="enricher-config-tabs">
                            {selectedEnrichers.filter(e => e.manifest.configSchema?.length > 0).map((e) => (
                                <Button
                                    key={e.manifest.id}
                                    variant={currentEnricherIndex === selectedEnrichers.indexOf(e) ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => setCurrentEnricherIndex(selectedEnrichers.indexOf(e))}
                                >
                                    {e.manifest.icon} {e.manifest.name}
                                </Button>
                            ))}
                        </div>
                        {currentEnricher && currentEnricher.manifest.configSchema?.length > 0 && (
                            <EnricherConfigForm
                                key={currentEnricher.manifest.id}
                                schema={currentEnricher.manifest.configSchema}
                                initialValues={currentEnricher.config}
                                onChange={config => updateEnricherConfig(currentEnricherIndex, config)}
                            />
                        )}
                    </Card>
                )}

                {/* Destinations Section */}
                <Card className="edit-section">
                    <h3>📤 Destinations</h3>
                    <p className="section-description">Where to send processed activities</p>
                    <div className="option-grid">
                        {destinations.filter(d => d.enabled && isPluginAvailable(d)).map(dest => {
                            const isSelected = selectedDestinations.some(
                                sd => sd === dest.id || Number(sd) === dest.destinationType
                            );
                            return (
                                <Card
                                    key={dest.id}
                                    className={`option-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedDestinations(prev => {
                                            if (isSelected) {
                                                return prev.filter(d => d !== dest.id && Number(d) !== dest.destinationType);
                                            }
                                            return [...prev, dest.id];
                                        });
                                    }}
                                >
                                    <span className="option-icon">{dest.icon}</span>
                                    <h4>{dest.name}</h4>
                                    <p>{dest.description}</p>
                                    {isSelected && <span className="selected-check">✓</span>}
                                </Card>
                            );
                        })}
                    </div>
                    {destinations.filter(d => d.enabled && !isPluginAvailable(d)).length > 0 && (
                        <div className="excluded-plugins-section">
                            <span className="excluded-label">Needs Connection</span>
                            <div className="excluded-plugins-grid">
                                {destinations.filter(d => d.enabled && !isPluginAvailable(d)).map(dest => (
                                    <div key={dest.id} className="excluded-plugin-card">
                                        <span className="excluded-icon">{dest.icon}</span>
                                        <span className="excluded-name">{dest.name}</span>
                                        <span className="excluded-hint">
                                            Connect {getMissingIntegrations(dest).join(', ')} to enable
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Actions */}
                <div className="wizard-actions">
                    <Button variant="secondary" onClick={() => navigate('/settings/pipelines')}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving || !selectedSource || selectedDestinations.length === 0}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </PageLayout>

        {infoEnricher && (
            <EnricherInfoModal
                enricher={infoEnricher}
                onClose={() => setInfoEnricher(null)}
            />
        )}
    </>
    );
};

export default PipelineEditPage;
