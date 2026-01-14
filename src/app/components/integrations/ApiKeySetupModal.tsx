import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { IntegrationManifest } from '../../types/plugin';
import { useApi } from '../../hooks/useApi';
import './ApiKeySetupModal.css';

interface ApiKeySetupModalProps {
    integration: IntegrationManifest;
    onClose: () => void;
    onSuccess: () => void;
}

export const ApiKeySetupModal: React.FC<ApiKeySetupModalProps> = ({
    integration,
    onClose,
    onSuccess,
}) => {
    const api = useApi();
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!apiKey.trim()) {
            setError('Please enter your API key');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            await api.put(`/users/me/integrations/${integration.id}`, { apiKey: apiKey.trim() });
            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to connect. Please check your API key.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // Simple markdown-like rendering for bold text
    const renderInstructions = (text: string) => {
        if (!text) return null;

        // Split by ** for bold sections
        const parts = text.split(/\*\*([^*]+)\*\*/g);
        return parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content api-key-setup-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="integration-icon">{integration.icon}</span>
                    <h2>{integration.setupTitle || `Connect ${integration.name}`}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {integration.setupInstructions && (
                        <div className="setup-instructions">
                            {integration.setupInstructions.split('\n').map((line, i) => (
                                <p key={i}>{renderInstructions(line)}</p>
                            ))}
                        </div>
                    )}

                    {integration.apiKeyHelpUrl && (
                        <a
                            href={integration.apiKeyHelpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="help-link"
                        >
                            View detailed instructions →
                        </a>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="apiKey">
                                {integration.apiKeyLabel || 'API Key'}
                            </label>
                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder={`Enter your ${integration.apiKeyLabel || 'API key'}`}
                                autoFocus
                                disabled={submitting}
                            />
                        </div>

                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        <div className="modal-actions">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting || !apiKey.trim()}
                            >
                                {submitting ? 'Connecting...' : 'Connect'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
