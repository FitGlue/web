import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './library/ui/Modal';
import { Button } from './library/ui/Button';
import { Stack } from './library/layout/Stack';
import { Heading } from './library/ui/Heading';
import { Paragraph } from './library/ui/Paragraph';
import { List, ListItem } from './library/ui/List';
import { useToast } from './library/ui/Toast';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { useApi } from '../hooks/useApi';
import {
    decodePipeline,
    validatePipelineImport,
    getMissingConnectionInfo,
    PortablePipeline,
    ImportValidationResult
} from '../../shared/pipeline-sharing';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    initialCode?: string;
}

export const ImportPipelineModal: React.FC<Props> = ({ onClose, onSuccess, initialCode }) => {
    const navigate = useNavigate();
    const api = useApi();
    const toast = useToast();
    const { sources, enrichers, destinations, integrations } = usePluginRegistry();
    const { integrations: userIntegrations } = useRealtimeIntegrations();

    const [code, setCode] = useState(initialCode || '');
    const [decoded, setDecoded] = useState<PortablePipeline | null>(null);
    const [validation, setValidation] = useState<ImportValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    const registry = { sources, enrichers, destinations, integrations };

    // Auto-validate if initialCode is provided
    useEffect(() => {
        if (initialCode && sources.length > 0) {
            try {
                const portable = decodePipeline(initialCode);
                setDecoded(portable);
                const result = validatePipelineImport(portable, userIntegrations, registry);
                setValidation(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Invalid pipeline code');
            }
        }
    }, [initialCode, sources.length, userIntegrations]);

    const handleValidate = () => {
        setError(null);
        setDecoded(null);
        setValidation(null);

        try {
            const portable = decodePipeline(code);
            setDecoded(portable);

            const result = validatePipelineImport(portable, userIntegrations, registry);
            setValidation(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid pipeline code');
        }
    };

    const handleImport = async () => {
        if (!validation?.valid || !validation.request || !decoded) return;

        setImporting(true);
        try {
            await api.post('/users/me/pipelines', validation.request);
            toast.success('Pipeline Imported', `"${decoded.n}" has been imported successfully`);
            onSuccess();
            onClose();
        } catch {
            setError('Failed to import pipeline. Please try again.');
            toast.error('Import Failed', 'Failed to import pipeline. Please try again.');
        } finally {
            setImporting(false);
        }
    };

    const getSourceName = (sourceId: string) => {
        const source = sources.find(s => s.id === sourceId);
        return source?.name || sourceId;
    };

    const getEnricherName = (providerType: number) => {
        const enricher = enrichers.find(e => e.enricherProviderType === providerType);
        return enricher?.name || `Enricher ${providerType}`;
    };

    const getDestinationName = (destId: string) => {
        const dest = destinations.find(d => d.id === destId);
        return dest?.name || destId;
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Import Pipeline">
            <Stack gap="md">
                <Stack direction="horizontal" gap="sm" align="center">
                    <Paragraph inline>📥</Paragraph>
                    <Heading level={2}>Import Pipeline</Heading>
                </Stack>

                <Paragraph>
                    Paste a pipeline code to import someone else&apos;s configuration.
                </Paragraph>

                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste pipeline code here..."
                    rows={4}
                />

                {error && (
                    <Paragraph>⚠️ {error}</Paragraph>
                )}

                {decoded && validation && !validation.valid && (
                    <Stack gap="sm">
                        <Heading level={4}>Missing Connections</Heading>
                        <Paragraph>Connect these services before importing:</Paragraph>
                        <List>
                            {validation.missingConnections.map(connId => {
                                const info = getMissingConnectionInfo(connId, registry);
                                return (
                                    <ListItem key={connId}>
                                        <Stack direction="horizontal" gap="sm" align="center">
                                            <Paragraph inline>{info?.icon}</Paragraph>
                                            <Paragraph inline>{info?.name}</Paragraph>
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => navigate(`/connections`)}
                                            >
                                                Connect
                                            </Button>
                                        </Stack>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Stack>
                )}

                {decoded && validation?.valid && (
                    <Stack gap="sm">
                        <Heading level={4}>Pipeline Preview</Heading>
                        <Stack gap="xs">
                            <Stack direction="horizontal" gap="sm">
                                <Paragraph inline bold>Name</Paragraph>
                                <Paragraph inline>{decoded.n} (Imported)</Paragraph>
                            </Stack>
                            <Stack direction="horizontal" gap="sm">
                                <Paragraph inline bold>Source</Paragraph>
                                <Paragraph inline>{getSourceName(decoded.s)}</Paragraph>
                            </Stack>
                            <Stack direction="horizontal" gap="sm">
                                <Paragraph inline bold>Enrichers</Paragraph>
                                <Paragraph inline>
                                    {decoded.e.length === 0
                                        ? 'None'
                                        : decoded.e.map(e => getEnricherName(e.p)).join(', ')}
                                </Paragraph>
                            </Stack>
                            <Stack direction="horizontal" gap="sm">
                                <Paragraph inline bold>Destinations</Paragraph>
                                <Paragraph inline>
                                    {decoded.d.map(d => getDestinationName(d)).join(', ')}
                                </Paragraph>
                            </Stack>
                        </Stack>
                    </Stack>
                )}

                <Stack direction="horizontal" gap="sm" justify="end">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    {!validation?.valid ? (
                        <Button
                            variant="primary"
                            onClick={handleValidate}
                            disabled={!code.trim()}
                        >
                            Validate
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleImport}
                            disabled={importing}
                        >
                            {importing ? 'Importing...' : '✓ Import Pipeline'}
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Modal>
    );
};

export default ImportPipelineModal;
