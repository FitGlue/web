import React, { useState } from 'react';
import { Button, Modal, Heading, Paragraph } from '../library/ui';
import { Stack, ModalSection } from '../library/layout';
import { Link } from '../library/navigation';
import { PluginIcon } from '../library/ui/PluginIcon';
import { Input, FormField } from '../library/forms';
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

    const renderInstructions = (text: string) => {
        if (!text) return null;

        const parts = text.split(/\*\*([^*]+)\*\*/g);
        return parts.map((part, i) =>
            i % 2 === 1 ? <Paragraph key={i} inline bold>{part}</Paragraph> : part
        );
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={integration.setupTitle || `Connect ${integration.name}`}
        >
            <ModalSection>
                <Stack direction="horizontal" gap="md" align="center">
                    <PluginIcon
                        icon={integration.icon}
                        iconType={integration.iconType}
                        iconPath={integration.iconPath}
                        size="large"
                    />
                    <Heading level={2}>{integration.setupTitle || `Connect ${integration.name}`}</Heading>
                </Stack>
            </ModalSection>

            {integration.setupInstructions && (
                <ModalSection>
                    {integration.setupInstructions.split('\n').map((line, i) => (
                        <Paragraph key={i}>{renderInstructions(line)}</Paragraph>
                    ))}
                </ModalSection>
            )}

            {integration.apiKeyHelpUrl && (
                <Link
                    to={integration.apiKeyHelpUrl}
                    external
                    variant="primary"
                >
                    View detailed instructions →
                </Link>
            )}

            <form onSubmit={handleSubmit}>
                <ModalSection>
                    <Stack gap="md">
                        <FormField
                            label={integration.apiKeyLabel || 'API Key'}
                            htmlFor="apiKey"
                        >
                            <Input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder={`Enter your ${integration.apiKeyLabel || 'API key'}`}
                                autoFocus
                                disabled={submitting}
                            />
                        </FormField>

                        {error && (
                            <Paragraph size="sm">{error}</Paragraph>
                        )}

                        <Stack direction="horizontal" gap="sm" justify="end">
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
                        </Stack>
                    </Stack>
                </ModalSection>
            </form>
        </Modal>
    );
};
