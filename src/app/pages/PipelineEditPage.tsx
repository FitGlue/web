import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '../../shared/logger';
import { PageLayout } from '../components/library/layout/PageLayout';
import { PageAction, OverflowMenu } from '../components/library/layout';
import { Button } from '../components/library/ui/Button';
import { useToast } from '../components/library/ui/Toast';
import { ConfirmDialog } from '../components/library/ui/ConfirmDialog';
import { EnricherInfoModal } from '../components/EnricherInfoModal';
import { EnricherTimeline } from '../components/EnricherTimeline';
import { PluginCategorySection } from '../components/PluginCategorySection';
import { PluginConfigForm } from '../components/EnricherConfigForm';
import { EnricherConfigForm } from '../components/EnricherConfigForm';
import { LogicGateConfigForm } from '../components/LogicGateConfigForm';
import { Checkbox } from '../components/library/forms/Checkbox';
import { SharePipelineModal } from '../components/SharePipelineModal';
import { WizardExcludedSection, WizardStepHead } from '../components/wizard';
import { DestinationEnricherExclusion, EnricherExclusionItem } from '../components/DestinationEnricherExclusion';
import { SourcePicker } from '../components/library/ui/SourcePicker';
import { WizardOptionGrid } from '../components/wizard';
import { CardSkeleton } from '../components/library/ui/CardSkeleton';
import { ENRICHER_CATEGORIES, groupPluginsByCategory, getRecommendedPlugins } from '../utils/pluginCategories';
import '../components/library/ui/CardSkeleton.css';
import { EnricherProviderType } from '../../types/pb/user';
import { client } from '../../shared/api/client';
import { usePluginDefaults } from '../hooks/usePluginDefaults';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useRealtimePipelines } from '../hooks/useRealtimePipelines';
import { PluginManifest } from '../types/plugin';
import { encodePipeline } from '../../shared/pipeline-sharing';
import { resolveEnum } from '../utils/resolveEnum';
import { DestinationType, EnricherProviderType as SchemaEnricherProviderType } from '../../shared/api/schema-enums';
import './PipelineEditPage.css';

type EditStep = 'name' | 'source' | 'boosters' | 'destinations' | 'configure' | 'danger';

const STEPS: EditStep[] = ['name', 'source', 'boosters', 'destinations', 'configure', 'danger'];

const STEP_LABELS: Record<EditStep, string> = {
    name: 'Name',
    source: 'Source',
    boosters: 'Boosters',
    destinations: 'Destinations',
    configure: 'Configure',
    danger: 'Danger zone',
};

const STEP_INDEX: Record<EditStep, number> = {
    name: 1,
    source: 2,
    boosters: 3,
    destinations: 4,
    configure: 5,
    danger: 6,
};

const I18N_KEY_RE = /^[A-Z][A-Z0-9_]+$/;

function getBoosterDisplayName(manifest: PluginManifest): string {
    if (I18N_KEY_RE.test(manifest.name)) {
        return manifest.id
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }
    return manifest.name;
}

function hasMissingRequiredConfig(manifest: PluginManifest, config: Record<string, string>): boolean {
    if (!manifest.configSchema?.length) return false;
    return manifest.configSchema.some(field => {
        if (!field.required) return false;
        const val = config[field.key];
        return !val || val.trim() === '';
    });
}

interface EnricherConfig {
    providerType: SchemaEnricherProviderType;
    typedConfig?: Record<string, string>;
    nonBlocking?: boolean;
}

interface PipelineConfig {
    id: string;
    name?: string;
    source: string;
    sources?: string[];
    enrichers: EnricherConfig[];
    destinations: DestinationType[];
    sourceConfig?: Record<string, string>;
    destinationConfigs?: Record<string, { config: Record<string, string>; excludedEnrichers?: string[] }>;
    disabled?: boolean;
}

interface SelectedEnricher {
    manifest: PluginManifest;
    config: Record<string, string>;
    nonBlocking?: boolean;
}

const PipelineEditPage: React.FC = () => {
    const { pipelineId } = useParams<{ pipelineId: string }>();
    const navigate = useNavigate();
    const { sources, enrichers, destinations, integrations: registryIntegrations, loading: registryLoading } = usePluginRegistry();
    const { integrations: userIntegrations } = useRealtimeIntegrations();
    const { refresh: invalidatePipelines } = useRealtimePipelines();
    const { getDefault: getPluginDefault } = usePluginDefaults();
    const toast = useToast();

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

    const hasFetchedRef = useRef(false);
    const [pipeline, setPipeline] = useState<PipelineConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [pipelineName, setPipelineName] = useState('');
    const [pipelineDisabled, setPipelineDisabled] = useState(false);
    const [selectedSources, setSelectedSources] = useState<string[]>([]);
    const [selectedEnrichers, setSelectedEnrichers] = useState<SelectedEnricher[]>([]);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
    const [sourceConfig, setSourceConfig] = useState<Record<string, string>>({});
    const [destinationConfigs, setDestinationConfigs] = useState<Record<string, Record<string, string>>>({});
    const [destinationExcludedEnrichers, setDestinationExcludedEnrichers] = useState<Record<string, string[]>>({});

    // Original loaded state for dirty tracking
    const [originalState, setOriginalState] = useState<string>('');

    // UI state
    const [activeStep, setActiveStep] = useState<EditStep>('name');
    const [infoEnricher, setInfoEnricher] = useState<PluginManifest | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showOverflow, setShowOverflow] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [configureAnchor, setConfigureAnchor] = useState<string | null>(null);
    const [enricherSearchQuery, setEnricherSearchQuery] = useState('');
    const [expandAllCategories, setExpandAllCategories] = useState(false);

    const currentStateStr = JSON.stringify({
        pipelineName,
        pipelineDisabled,
        selectedSources,
        enricherIds: selectedEnrichers.map(e => ({ id: e.manifest.id, pt: e.manifest.enricherProviderType, config: e.config, nonBlocking: e.nonBlocking ?? false })),
        selectedDestinations,
        sourceConfig,
        destinationConfigs,
        destinationExcludedEnrichers,
    });

    const isDirty = !!originalState && currentStateStr !== originalState;

    const fetchPipeline = useCallback(async () => {
        if (!pipelineId) return;
        setLoading(true);
        try {
            const { data } = await client.GET('/users/me/pipelines/{id}', { params: { path: { id: pipelineId } } });
            const pipelineData = data as PipelineConfig;
            setPipeline(pipelineData);
            setPipelineName(pipelineData.name || '');
            setPipelineDisabled(pipelineData.disabled ?? false);

            const rawSources = pipelineData.sources && pipelineData.sources.length > 0
                ? pipelineData.sources
                : pipelineData.source ? [pipelineData.source] : [];
            const initSources = rawSources.map(s => {
                const normalized = String(s).toLowerCase().replace('source_', '');
                const manifest = sources.find(m => m.id === normalized);
                return manifest?.id ?? normalized;
            });
            setSelectedSources(initSources);

            const initDests = pipelineData.destinations.map(d => {
                if (typeof d === 'number' || !isNaN(Number(d))) {
                    const manifest = destinations.find(m => m.destinationType === Number(d));
                    return manifest?.id ?? String(d);
                }
                const normalized = String(d).toLowerCase().replace('destination_', '');
                const manifest = destinations.find(m => m.id === normalized);
                return manifest?.id ?? normalized;
            });
            setSelectedDestinations(initDests);

            const enricherConfigs: SelectedEnricher[] = pipelineData.enrichers.map(e => {
                const manifest = enrichers.find(m =>
                    String(m.enricherProviderType) === String(e.providerType) ||
                    resolveEnum(m.enricherProviderType, EnricherProviderType) === resolveEnum(e.providerType, EnricherProviderType)
                );
                return {
                    manifest: manifest || { id: `unknown-${e.providerType}`, name: `Enricher ${e.providerType}`, enricherProviderType: resolveEnum(e.providerType, EnricherProviderType) } as unknown as PluginManifest,
                    config: e.typedConfig || {},
                    nonBlocking: e.nonBlocking ?? false,
                };
            }).filter(e => e.manifest);
            setSelectedEnrichers(enricherConfigs);

            setSourceConfig(pipelineData.sourceConfig || {});
            const initDestConfigs = Object.fromEntries(
                Object.entries(pipelineData.destinationConfigs || {}).map(([k, v]) => [k, v.config || {}])
            );
            const initDestExcluded = Object.fromEntries(
                Object.entries(pipelineData.destinationConfigs || {})
                    .filter(([, v]) => (v.excludedEnrichers?.length ?? 0) > 0)
                    .map(([k, v]) => [k, v.excludedEnrichers!])
            );
            setDestinationConfigs(initDestConfigs);
            setDestinationExcludedEnrichers(initDestExcluded);

            // Snapshot original state after load
            const snap = JSON.stringify({
                pipelineName: pipelineData.name || '',
                pipelineDisabled: pipelineData.disabled ?? false,
                selectedSources: initSources,
                enricherIds: enricherConfigs.map(e => ({ id: e.manifest.id, pt: e.manifest.enricherProviderType, config: e.config })),
                selectedDestinations: initDests,
                sourceConfig: pipelineData.sourceConfig || {},
                destinationConfigs: initDestConfigs,
                destinationExcludedEnrichers: initDestExcluded,
            });
            setOriginalState(snap);
        } catch (err) {
            setError('Failed to load pipeline');
            logger.warn('Failed to load pipeline:', err);
        } finally {
            setLoading(false);
        }
    }, [pipelineId, enrichers, destinations, sources]);

    useEffect(() => {
        if (!registryLoading && enrichers.length > 0 && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchPipeline();
        }
    }, [fetchPipeline, registryLoading, enrichers]);

    // beforeunload guard when dirty
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    // Cmd+S / Ctrl+S shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (!saving && !deleting) handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });

    const handleSave = async () => {
        if (!pipelineId) return;
        setSaving(true);
        setError(null);
        try {
            const enricherConfigs = selectedEnrichers.map(e => ({
                providerType: EnricherProviderType[e.manifest.enricherProviderType as number] || String(e.manifest.enricherProviderType),
                typedConfig: e.config,
                ...(e.nonBlocking ? { nonBlocking: true } : {}),
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
            await client.PUT('/users/me/pipelines/{id}', {
                params: { path: { id: pipelineId! } },
                body: {
                    name: pipelineName || undefined,
                    sources: selectedSources,
                    enrichers: enricherConfigs,
                    destinations: selectedDestinations.map(id => destinations.find(d => d.id === id)?.destinationType ?? 0),
                    sourceConfig: Object.keys(sourceConfig).length > 0 ? sourceConfig : undefined,
                    destinationConfigs: Object.keys(mergedDestConfigs).length > 0 ? mergedDestConfigs : undefined,
                } as never
            });
            invalidatePipelines();
            toast.success('Pipeline Saved', `"${pipelineName || 'Pipeline'}" has been updated`);
            setOriginalState(currentStateStr);
        } catch (err) {
            logger.error('Failed to save pipeline:', err);
            setError('Failed to save pipeline');
            toast.error('Save Failed', 'Failed to save pipeline. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!pipelineId) return;
        setDeleting(true);
        try {
            await client.DELETE('/users/me/pipelines/{id}', {
                params: { path: { id: pipelineId } },
            });
            invalidatePipelines();
            toast.success('Pipeline Deleted', `"${pipelineName || 'Pipeline'}" has been deleted`);
            navigate('/settings/pipelines');
        } catch (err) {
            logger.error('Failed to delete pipeline:', err);
            toast.error('Delete Failed', 'Failed to delete pipeline. Please try again.');
            setDeleting(false);
        }
    };

    const handleDiscard = () => {
        if (isDirty) {
            setShowDiscardConfirm(true);
        } else {
            doDiscard();
        }
    };

    const doDiscard = () => {
        hasFetchedRef.current = false;
        fetchPipeline();
        setShowDiscardConfirm(false);
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

    const updateEnricherNonBlocking = useCallback((index: number, nonBlocking: boolean) => {
        setSelectedEnrichers(prev => {
            const updated = [...prev];
            if (updated[index]) updated[index] = { ...updated[index], nonBlocking };
            return updated;
        });
    }, []);

    const navigateToConfigure = (anchor: string) => {
        setConfigureAnchor(anchor);
        setActiveStep('configure');
    };

    // Scroll to anchor when configure step opens
    useEffect(() => {
        if (activeStep === 'configure' && configureAnchor) {
            setTimeout(() => {
                const el = document.getElementById(`conf-${configureAnchor}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setConfigureAnchor(null);
            }, 50);
        }
    }, [activeStep, configureAnchor]);

    if (loading || registryLoading) {
        return (
            <PageLayout title="Edit Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
                    <CardSkeleton variant="pipeline-full" />
                    <CardSkeleton variant="pipeline-full" />
                </div>
            </PageLayout>
        );
    }

    if (!pipeline) {
        return (
            <PageLayout title="Edit Pipeline" backTo="/settings/pipelines" backLabel="Pipelines">
                <div style={{ padding: '2rem', fontFamily: 'var(--fg-font-body)', color: 'var(--fg-rose)' }}>
                    Pipeline not found
                </div>
            </PageLayout>
        );
    }

    const availableSources = sources.filter(s => s.enabled && isPluginAvailable(s));
    const excludedSources = sources.filter(s => s.enabled && !isPluginAvailable(s));
    const availableDestinations = destinations.filter(d => d.enabled && isPluginAvailable(d));
    const excludedDestinations = destinations.filter(d => d.enabled && !isPluginAvailable(d));

    const warnEnrichers = selectedEnrichers.filter(e =>
        isPluginAvailable(e.manifest) && hasMissingRequiredConfig(e.manifest, e.config)
    );
    const ghostEnrichers = selectedEnrichers.filter(e => !isPluginAvailable(e.manifest));

    const configurableEnrichers = selectedEnrichers.filter(e =>
        isPluginAvailable(e.manifest) && (e.manifest.configSchema?.length ?? 0) > 0
    );
    // Destinations with their own plugin config schema (used for unsaved count)
    const pluginConfigurableDestinations = selectedDestinations
        .map(id => destinations.find(d => d.id === id))
        .filter((d): d is PluginManifest => !!d && (d.configSchema?.length ?? 0) > 0);
    // All destinations shown in the configure step: when enrichers are active, every destination
    // gets a block so the user can control booster output per-destination.
    const configurableDestinations = selectedEnrichers.length > 0
        ? selectedDestinations.map(id => destinations.find(d => d.id === id)).filter((d): d is PluginManifest => !!d)
        : pluginConfigurableDestinations;
    // Pre-compute enricher items for the exclusion picker (resolved from enum)
    const enricherExclusionItems: EnricherExclusionItem[] = selectedEnrichers
        .filter(e => e.manifest.enricherProviderType != null && Number(e.manifest.enricherProviderType) !== 0)
        .map(e => ({
            key: EnricherProviderType[e.manifest.enricherProviderType as number] || String(e.manifest.enricherProviderType),
            name: getBoosterDisplayName(e.manifest),
            icon: e.manifest.icon,
        }))
        .filter(e => e.key && e.key !== 'undefined');

    const sourceLabel = selectedSources
        .map(id => {
            const m = sources.find(s => s.id === id);
            return m ? `${m.icon} ${m.name}` : id;
        })
        .join(' · ') || '—';

    const destLabel = selectedDestinations
        .map(id => {
            const m = destinations.find(d => d.id === id);
            return m ? m.name : id;
        })
        .join(' · ') || '—';

    const boostersSummary = `${selectedEnrichers.length} picked${ghostEnrichers.length ? ` · ${ghostEnrichers.length} disabled` : ''}`;
    const unsavedConfigCount = configurableEnrichers.filter(e =>
        hasMissingRequiredConfig(e.manifest, e.config)
    ).length + pluginConfigurableDestinations.filter(d =>
        !destinationConfigs[d.id] || Object.keys(destinationConfigs[d.id]).length === 0
    ).length;

    const configureBlocks = configurableEnrichers.length + configurableDestinations.length;

    const getStepStatus = (step: EditStep): 'active' | 'done' | 'warn' | '' => {
        if (step === activeStep) return 'active';
        if (step === 'danger') return '';
        if (step === 'boosters' && warnEnrichers.length > 0 && step !== activeStep) return 'warn';
        return 'done';
    };

    const renderRail = () => (
        <aside className="pipe-edit__rail">
            <div className="pipe-edit__rail-title">
                Edit <span className="gr">pipeline.</span>
            </div>
            {STEPS.map((step, i) => {
                const status = getStepStatus(step);
                const stepNum = i + 1;

                let value: React.ReactNode = null;
                if (step === 'name') value = pipeline.name ? `"${pipeline.name}"` : '—';
                else if (step === 'source') value = sourceLabel;
                else if (step === 'boosters') value = boostersSummary;
                else if (step === 'destinations') value = destLabel;
                else if (step === 'configure') value = `${configureBlocks} blocks${unsavedConfigCount ? ` · ${unsavedConfigCount} unsaved` : ''}`;

                const sub: React.ReactNode = step === 'danger' ? 'PAUSE · ARCHIVE · DELETE' : null;

                const classes = [
                    'wiz__step',
                    'wiz__step--edit-mode',
                    status === 'active' ? 'wiz__step--active' : '',
                    status === 'done' ? 'wiz__step--done' : '',
                    status === 'warn' ? 'wiz__step--warn' : '',
                ].filter(Boolean).join(' ');

                return (
                    <div key={step} className={classes} onClick={() => setActiveStep(step)}>
                        <div className="wiz__step-n">
                            {status === 'done' ? '✓' : stepNum}
                        </div>
                        <div>
                            <div className="wiz__step-title">{STEP_LABELS[step]}</div>
                            {value && (
                                <div className="wiz__step-value">
                                    {isDirty && step === activeStep && (
                                        <span className="wiz__step-dirty" />
                                    )}
                                    {value}
                                </div>
                            )}
                            {sub && <div className="wiz__step-sub">{sub}</div>}
                        </div>
                    </div>
                );
            })}
        </aside>
    );

    const renderFooter = () => (
        <div className="pipe-edit__foot">
            <div className="pipe-edit__foot-meta">
                {isDirty && <span className="pipe-edit__foot-dot" />}
                {isDirty
                    ? <><b>UNSAVED CHANGES</b>&nbsp;·&nbsp;</>
                    : null
                }
                <span>{pipeline.name || 'Untitled pipeline'}</span>
            </div>
            <div className="pipe-edit__foot-actions">
                <Button variant="ghost" size="sm" onClick={handleDiscard} disabled={saving || deleting}>
                    DISCARD
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || deleting || selectedSources.length === 0 || selectedDestinations.length === 0}
                >
                    {saving ? 'SAVING…' : '✓ SAVE CHANGES'}
                </Button>
            </div>
        </div>
    );

    // ====== STEP 1 · NAME ======
    const renderNameStep = () => (
        <>
            <WizardStepHead
                step={STEP_INDEX.name} total={STEPS.length} section="NAME"
                title={<>Name your <span className="gr">pipeline.</span></>}
                description="How this pipeline shows up on your dashboard, in run logs, and in every export. Rename anytime — historical runs keep their old name."
            />
            <div className="pipe-edit__body">
                <div className="pipe-edit__field">
                    <div>
                        <div className="pipe-edit__field-label-name">Display name</div>
                        <div className="pipe-edit__field-label-hint">Plain text, up to 64 chars.</div>
                    </div>
                    <div className="pipe-edit__field-control">
                        <input
                            className="pipe-edit__field-input pipe-edit__field-input--lg"
                            type="text"
                            value={pipelineName}
                            onChange={e => setPipelineName(e.target.value)}
                            maxLength={64}
                            placeholder="e.g., Morning Gym Sessions"
                        />
                        <div className="pipe-edit__field-hint-r">
                            <span>{pipelineName.length} / 64</span>
                            {pipelineName && <span style={{ color: 'var(--fg-green)' }}>● VALID</span>}
                        </div>
                    </div>
                </div>
                <div className="pipe-edit__field">
                    <div>
                        <div className="pipe-edit__field-label-name">Status</div>
                        <div className="pipe-edit__field-label-hint">Disabled pipelines accept no source events. Existing runs are kept.</div>
                    </div>
                    <div className="pipe-edit__field-control">
                        <div className="pipe-edit__toggle-row">
                            <div>
                                <div className="pipe-edit__toggle-name">Enabled</div>
                                <div className="pipe-edit__toggle-sub">
                                    Source events trigger runs immediately.{' '}
                                    {!pipelineDisabled
                                        ? <b style={{ color: 'var(--fg-green)' }}>● RUNNING</b>
                                        : <b style={{ color: 'var(--fg-rose)' }}>● PAUSED</b>
                                    }
                                </div>
                            </div>
                            <button
                                type="button"
                                className={`pipe-edit__tog${!pipelineDisabled ? ' pipe-edit__tog--on' : ''}`}
                                onClick={() => setPipelineDisabled(v => !v)}
                                aria-label={pipelineDisabled ? 'Enable pipeline' : 'Disable pipeline'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // ====== STEP 2 · SOURCE ======
    const renderSourceStep = () => {
        const sourceTiles = availableSources.map(s => ({
            id: s.id,
            name: s.name,
            icon: s.icon,
            connected: s.requiredIntegrations?.every(reqId => {
                const integration = (userIntegrations as Record<string, { connected?: boolean } | undefined> | null)?.[reqId];
                return integration?.connected ?? false;
            }) ?? true,
        }));

        const needsConnectionTiles = excludedSources.map(s => ({
            id: s.id,
            name: s.name,
            icon: s.icon,
            disabled: true,
            meta: 'CONNECT TO ENABLE',
        }));

        return (
            <>
                <WizardStepHead
                    step={STEP_INDEX.source} total={STEPS.length} section="SOURCE"
                    title={<>Where activities <span className="gr">come from.</span></>}
                    description="Pick one or more sources. Each one is a trigger — when a new activity arrives, this whole pipeline runs against it."
                />
                <div className="pipe-edit__body">
                    {sourceTiles.length > 0 && (
                        <>
                            <div className="wiz__sec-label" style={{ marginTop: 0 }}>
                                PICK A SOURCE · CHANGES WHAT TRIGGERS THE PIPELINE
                            </div>
                            <SourcePicker
                                sources={sourceTiles}
                                selectedIds={selectedSources}
                                multiSelect
                                onSelect={id => setSelectedSources(prev =>
                                    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
                                )}
                            />
                        </>
                    )}
                    {needsConnectionTiles.length > 0 && (
                        <>
                            <div className="wiz__sec-label">NEEDS CONNECTION</div>
                            <SourcePicker
                                sources={needsConnectionTiles}
                                selectedIds={[]}
                                onSelect={() => {}}
                            />
                        </>
                    )}

                    {/* Source config shown inline when single source with configSchema */}
                    {(() => {
                        const sourceManifest = selectedSources.length === 1
                            ? sources.find(s => s.id === selectedSources[0])
                            : undefined;
                        if (!sourceManifest?.configSchema?.length) return null;
                        return (
                            <div style={{ marginTop: '1.5rem' }}>
                                <div className="wiz__sec-label">SOURCE CONFIGURATION</div>
                                <div className="conf-block">
                                    <div className="conf-block__head">
                                        <div className="conf-block__icon">{sourceManifest.icon}</div>
                                        <div className="conf-block__name">{sourceManifest.name}</div>
                                        <div className="conf-block__type">SOURCE</div>
                                    </div>
                                    <div className="conf-block__body">
                                        <PluginConfigForm
                                            key={sourceManifest.id}
                                            schema={sourceManifest.configSchema}
                                            initialValues={Object.keys(sourceConfig).length > 0 ? sourceConfig : (getPluginDefault(sourceManifest.id) || {})}
                                            onChange={setSourceConfig}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </>
        );
    };

    // ====== STEP 3 · BOOSTERS ======
    const renderBoostersStep = () => {
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
            const missing = getMissingIntegrations(plugin);
            if (missing.length > 0) return `Connect ${missing.join(', ')}`;
            return undefined;
        };

        return (
            <>
                <WizardStepHead
                    step={STEP_INDEX.boosters} total={STEPS.length}
                    section={<>BOOSTERS · {selectedEnrichers.length} ACTIVE{ghostEnrichers.length ? ` · ${ghostEnrichers.length} DISABLED` : ''}</>}
                    title={<>The <span className="gr">recipe.</span></>}
                    description="Boosters run top-to-bottom on every activity. Drag the grip to reorder, click ⓘ for info, ✕ to remove. Click a booster below to add it."
                />
                <div className="pipe-edit__body">
                    {warnEnrichers.length > 0 && (
                        <div className="pipe-edit__warn-banner">
                            <b>⚠ {warnEnrichers.length} BOOSTER{warnEnrichers.length > 1 ? 'S' : ''} NEED{warnEnrichers.length === 1 ? 'S' : ''} CONFIG</b>{' '}
                            · <b>{warnEnrichers[0].manifest.name}</b> is missing required config — the pipeline will skip{warnEnrichers.length > 1 ? ' them' : ' it'} until configured.{' '}
                            <a onClick={() => navigateToConfigure(warnEnrichers[0].manifest.id)}>
                                Configure now →
                            </a>
                        </div>
                    )}

                    <EnricherTimeline
                        enrichers={selectedEnrichers}
                        onReorder={setSelectedEnrichers}
                        onRemove={(index) => setSelectedEnrichers(prev => prev.filter((_, i) => i !== index))}
                        onInfoClick={(manifest) => setInfoEnricher(manifest)}
                    />

                    {!enricherSearchQuery && recommended.length > 0 && (
                        <div className="pipe-edit__section">
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
                            className="pipe-edit__search"
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
                </div>
            </>
        );
    };

    // ====== STEP 4 · DESTINATIONS ======
    const renderDestinationsStep = () => {
        const unselectedAvailable = availableDestinations.filter(d => !selectedDestinations.includes(d.id));

        return (
            <>
                <WizardStepHead
                    step={STEP_INDEX.destinations} total={STEPS.length} section="DESTINATIONS"
                    title={<>Where to <span className="gr">send.</span></>}
                    description="Select at least one destination. Activities from every source trigger uploads to all selected destinations."
                />
                <div className="pipe-edit__body">
                    {selectedDestinations.length > 0 && (
                        <>
                            <div className="wiz__sec-label" style={{ marginTop: 0 }}>
                                SELECTED · {selectedDestinations.length} DESTINATION{selectedDestinations.length !== 1 ? 'S' : ''}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '720px', marginBottom: '1.125rem' }}>
                                {selectedDestinations.map(destId => {
                                    const d = destinations.find(dest => dest.id === destId);
                                    if (!d) return null;
                                    return (
                                        <div key={destId} className="dest-chip dest-chip--on">
                                            <div className="dest-chip__icon">{d.icon}</div>
                                            <div>
                                                <div className="dest-chip__name">{d.name}</div>
                                            </div>
                                            <button
                                                type="button"
                                                className="b-row__btn"
                                                title={`Configure ${d.name}`}
                                                onClick={() => (d.configSchema?.length ?? 0) > 0 && navigateToConfigure(d.id)}
                                            >
                                                ⚙
                                            </button>
                                            <button
                                                type="button"
                                                className="b-row__btn b-row__btn--rem"
                                                title={`Remove ${d.name}`}
                                                onClick={() => setSelectedDestinations(prev => prev.filter(id => id !== destId))}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {unselectedAvailable.length > 0 && (
                        <>
                            <div className="wiz__sec-label">ADD MORE DESTINATIONS</div>
                            <WizardOptionGrid
                                options={unselectedAvailable}
                                selectedIds={selectedDestinations}
                                onSelect={opt => setSelectedDestinations(prev => [...prev, opt.id])}
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

                </div>
            </>
        );
    };

    // ====== STEP 5 · CONFIGURE ======
    const renderConfigureStep = () => (
        <>
            <WizardStepHead
                step={STEP_INDEX.configure} total={STEPS.length} section="CONFIGURE"
                title={<>Configure <span className="gr">every block.</span></>}
                description="All configurable boosters and destinations in one place. Click ⚙ on any booster or destination row to jump here directly."
            />
            <div className="pipe-edit__body">
                {configurableEnrichers.length === 0 && configurableDestinations.length === 0 && (
                    <div style={{
                        padding: '2rem',
                        fontFamily: 'var(--fg-font-mono)',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                    }}>
                        No configurable blocks in this pipeline.
                    </div>
                )}

                {configurableEnrichers.length > 0 && (
                    <>
                        <div className="wiz__sec-label" style={{ marginTop: 0 }}>BOOSTERS</div>
                        {configurableEnrichers.map((e, i) => {
                            const absoluteIndex = selectedEnrichers.indexOf(e);
                            return (
                                <div key={`${e.manifest.id}-${i}`} id={`conf-${e.manifest.id}`} className="conf-block">
                                    <div className="conf-block__head">
                                        <div className="conf-block__icon">{e.manifest.icon}</div>
                                        <div className="conf-block__name">{getBoosterDisplayName(e.manifest)}</div>
                                        <div className="conf-block__type">BOOSTER</div>
                                    </div>
                                    <div className="conf-block__body">
                                        {e.manifest.id === 'logic-gate' ? (
                                            <LogicGateConfigForm
                                                key={`logic-${absoluteIndex}`}
                                                initialValues={e.config}
                                                onChange={config => updateEnricherConfig(absoluteIndex, config)}
                                            />
                                        ) : (
                                            <EnricherConfigForm
                                                key={`${e.manifest.id}-${absoluteIndex}`}
                                                schema={e.manifest.configSchema ?? []}
                                                initialValues={e.config}
                                                onChange={config => updateEnricherConfig(absoluteIndex, config)}
                                            />
                                        )}
                                        {e.manifest.supportsNonBlocking && (
                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(245,243,235,0.08)' }}>
                                                <Checkbox
                                                    id={`non-blocking-${absoluteIndex}`}
                                                    checked={e.nonBlocking ?? false}
                                                    onChange={ev => updateEnricherNonBlocking(absoluteIndex, ev.target.checked)}
                                                    label="Non-blocking"
                                                />
                                                <p style={{
                                                    margin: '0.25rem 0 0 1.625rem',
                                                    fontFamily: 'var(--fg-font-mono)',
                                                    fontSize: '0.6875rem',
                                                    color: 'var(--color-text-muted)',
                                                    letterSpacing: '0.04em',
                                                }}>
                                                    Pipeline continues to destinations without waiting. When you submit the input, destinations are updated rather than duplicated.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}

                {configurableDestinations.length > 0 && (
                    <>
                        <div className="wiz__sec-label">DESTINATIONS</div>
                        {configurableDestinations.map(d => {
                            const hasPluginConfig = (d.configSchema?.length ?? 0) > 0;
                            return (
                                <div key={d.id} id={`conf-${d.id}`} className="conf-block">
                                    <div className="conf-block__head">
                                        <div className="conf-block__icon">{d.icon}</div>
                                        <div className="conf-block__name">{d.name}</div>
                                        <div className="conf-block__type">DESTINATION</div>
                                    </div>
                                    <div className="conf-block__body">
                                        {hasPluginConfig && (
                                            <PluginConfigForm
                                                key={d.id}
                                                schema={d.configSchema!}
                                                initialValues={destinationConfigs[d.id] || getPluginDefault(d.id) || {}}
                                                onChange={values => setDestinationConfigs(prev => ({ ...prev, [d.id]: values }))}
                                            />
                                        )}
                                        {enricherExclusionItems.length > 0 && (
                                            <DestinationEnricherExclusion
                                                enrichers={enricherExclusionItems}
                                                excludedEnrichers={destinationExcludedEnrichers[d.id] || []}
                                                onChange={excluded => setDestinationExcludedEnrichers(prev => ({ ...prev, [d.id]: excluded }))}
                                                standalone={!hasPluginConfig}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </>
    );

    // ====== STEP 6 · DANGER ZONE ======
    const renderDangerStep = () => (
        <>
            <WizardStepHead
                step={STEP_INDEX.danger} total={STEPS.length} section="DANGER ZONE"
                title={<>Destructive <span className="gr">actions.</span></>}
                description="These actions affect the pipeline and its history. Pause and archive are reversible. Deletion is permanent."
            />
            <div className="pipe-edit__body">
                <div className="danger-card">
                    <div>
                        <div className="danger-card__name">Pause this pipeline</div>
                        <div className="danger-card__sub">
                            Stops accepting source events. Existing runs are preserved. Reversible — you can re-enable from the Name step.
                        </div>
                    </div>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                            setPipelineDisabled(true);
                            setActiveStep('name');
                            toast.success('Pipeline paused', 'Save your changes to apply.');
                        }}
                    >
                        ⏸ PAUSE
                    </Button>
                </div>

                <div className="danger-card">
                    <div>
                        <div className="danger-card__name">Archive pipeline</div>
                        <div className="danger-card__sub">
                            Hides the pipeline from your dashboard but keeps all run history. You can unarchive from the pipelines list.
                        </div>
                    </div>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => toast.success('Coming soon', 'Pipeline archiving is coming in a future release.')}
                    >
                        📦 ARCHIVE
                    </Button>
                </div>

                <div className="danger-card">
                    <div>
                        <div className="danger-card__name">Delete pipeline permanently</div>
                        <div className="danger-card__sub">
                            &ldquo;{pipeline.name || 'This pipeline'}&rdquo; will be deleted permanently. All run history will lose its pipeline reference. This cannot be undone.
                        </div>
                    </div>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting}
                    >
                        ⊗ DELETE
                    </Button>
                </div>
            </div>
        </>
    );

    const renderCurrentStep = () => {
        switch (activeStep) {
            case 'name': return renderNameStep();
            case 'source': return renderSourceStep();
            case 'boosters': return renderBoostersStep();
            case 'destinations': return renderDestinationsStep();
            case 'configure': return renderConfigureStep();
            case 'danger': return renderDangerStep();
        }
    };

    const pipelineHeaderActions = (
        <>
            <div style={{ position: 'relative' }}>
                <PageAction tone="more" onClick={() => setShowOverflow(v => !v)} />
                {showOverflow && (
                    <OverflowMenu
                        onClose={() => setShowOverflow(false)}
                        items={[
                            { key: 'share', icon: '📤', label: 'Share', onClick: () => setShowShareModal(true) },
                        ]}
                    />
                )}
            </div>
            <PageAction tone="secondary" onClick={() => navigate('/settings/pipelines')}>
                Cancel
            </PageAction>
        </>
    );

    return (
        <>
            <PageLayout
                title={pipeline.name || 'Edit Pipeline'}
                backTo="/settings/pipelines"
                backLabel="Pipelines"
                headerActions={pipelineHeaderActions}
            >
                {error && (
                    <div
                        style={{
                            padding: '0.875rem 1rem',
                            background: 'rgba(255,93,108,.1)',
                            boxShadow: 'inset 0 0 0 1.5px var(--fg-rose)',
                            fontFamily: 'var(--fg-font-body)',
                            fontSize: '0.875rem',
                            color: 'var(--fg-rose)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setError(null)}
                    >
                        {error}
                    </div>
                )}
                <div className="pipe-edit">
                    {renderRail()}
                    <div className="pipe-edit__pane">
                        {renderCurrentStep()}
                        {renderFooter()}
                    </div>
                </div>
            </PageLayout>

            {infoEnricher && (
                <EnricherInfoModal enricher={infoEnricher} onClose={() => setInfoEnricher(null)} />
            )}

            {showShareModal && pipeline && (
                <SharePipelineModal
                    encodedPipeline={encodePipeline({
                        id: pipeline.id,
                        name: pipelineName,
                        sources: selectedSources,
                        enrichers: selectedEnrichers.map(e => ({
                            providerType: e.manifest.enricherProviderType || 0,
                            typedConfig: e.config
                        })),
                        destinations: selectedDestinations.map(d => {
                            if (isNaN(Number(d))) return d;
                            const destManifest = destinations.find(dest => dest.id === d);
                            return destManifest?.id ?? d;
                        })
                    })}
                    pipelineName={pipelineName || 'Unnamed Pipeline'}
                    onClose={() => setShowShareModal(false)}
                />
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete pipeline permanently?"
                message={`"${pipeline.name || 'This pipeline'}" will be deleted permanently. All run history will lose its pipeline reference. This cannot be undone.`}
                confirmLabel="DELETE PIPELINE"
                isDestructive
                isLoading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            <ConfirmDialog
                isOpen={showDiscardConfirm}
                title="Discard unsaved changes?"
                message="All unsaved changes to this pipeline will be lost."
                confirmLabel="DISCARD"
                isDestructive
                onConfirm={doDiscard}
                onCancel={() => setShowDiscardConfirm(false)}
            />
        </>
    );
};

export default PipelineEditPage;
