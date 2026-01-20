import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { usePluginRegistry } from '../hooks/usePluginRegistry';
import { useIntegrations } from '../hooks/useIntegrations';
import { useApi } from '../hooks/useApi';
import {
    decodePipeline,
    validatePipelineImport,
    getMissingConnectionInfo,
    PortablePipeline,
    ImportValidationResult
} from '../../shared/pipeline-sharing';
import './ImportPipelineModal.css';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export const ImportPipelineModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const navigate = useNavigate();
    const api = useApi();
    const { sources, enrichers, destinations, integrations } = usePluginRegistry();
    const { integrations: userIntegrations } = useIntegrations();

    const [code, setCode] = useState('');
    const [decoded, setDecoded] = useState<PortablePipeline | null>(null);
    const [validation, setValidation] = useState<ImportValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    const registry = { sources, enrichers, destinations, integrations };

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
        if (!validation?.valid || !validation.request) return;

        setImporting(true);
        try {
            await api.post('/users/me/pipelines', validation.request);
            onSuccess();
            onClose();
        } catch (err) {
            setError('Failed to import pipeline. Please try again.');
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="import-pipeline-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

                <div className="import-pipeline-header">
                    <span className="import-pipeline-icon">📥</span>
                    <h2>Import Pipeline</h2>
                </div>

                <p className="import-pipeline-description">
                    Paste a pipeline code to import someone else&apos;s configuration.
                </p>

                <div className="import-pipeline-input-group">
                    <textarea
                        className="import-pipeline-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Paste pipeline code here..."
                        rows={4}
                    />
                </div>

                {error && (
                    <div className="import-pipeline-error">
                        ⚠️ {error}
                    </div>
                )}

                {decoded && validation && !validation.valid && (
                    <div className="import-pipeline-missing">
                        <h4>Missing Connections</h4>
                        <p>Connect these services before importing:</p>
                        <ul>
                            {validation.missingConnections.map(connId => {
                                const info = getMissingConnectionInfo(connId, registry);
                                return (
                                    <li key={connId}>
                                        <span className="missing-icon">{info?.icon}</span>
                                        <span className="missing-name">{info?.name}</span>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => navigate(`/app/connections`)}
                                        >
                                            Connect
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {decoded && validation?.valid && (
                    <div className="import-pipeline-preview">
                        <h4>Pipeline Preview</h4>
                        <div className="preview-details">
                            <div className="preview-row">
                                <span className="preview-label">Name</span>
                                <span className="preview-value">{decoded.n} (Imported)</span>
                            </div>
                            <div className="preview-row">
                                <span className="preview-label">Source</span>
                                <span className="preview-value">{getSourceName(decoded.s)}</span>
                            </div>
                            <div className="preview-row">
                                <span className="preview-label">Enrichers</span>
                                <span className="preview-value">
                                    {decoded.e.length === 0
                                        ? 'None'
                                        : decoded.e.map(e => getEnricherName(e.p)).join(', ')}
                                </span>
                            </div>
                            <div className="preview-row">
                                <span className="preview-label">Destinations</span>
                                <span className="preview-value">
                                    {decoded.d.map(d => getDestinationName(d)).join(', ')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="import-pipeline-actions">
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
                </div>
            </div>
        </div>
    );
};

export default ImportPipelineModal;
