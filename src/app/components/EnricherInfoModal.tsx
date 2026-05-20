import React from 'react';
import { PluginManifest } from '../types/plugin';
import { Button, Paragraph, Badge, Card, Code } from './library/ui';
import { Modal } from './library/ui/Modal';
import { PluginIcon } from './library/ui/PluginIcon';
import { Stack } from './library/layout';
import { ModalSection } from './library/layout/ModalSection';

interface Props {
    enricher: PluginManifest;
    onClose: () => void;
}

export const EnricherInfoModal: React.FC<Props> = ({ enricher, onClose }) => {
    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <Stack direction="horizontal" gap="md" align="center">
                    <PluginIcon
                        icon={enricher.icon}
                        iconType={enricher.iconType}
                        iconPath={enricher.iconPath}
                        size="large"
                    />
                    <Paragraph inline bold>{enricher.name}</Paragraph>
                </Stack>
            }
            size="lg"
            footer={
                <Stack direction="horizontal" justify="end">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </Stack>
            }
        >
            <Stack gap="lg">
                <Paragraph>{enricher.description}</Paragraph>

                {enricher.marketingDescription && (
                    <Card variant="elevated">
                        <Paragraph>{enricher.marketingDescription}</Paragraph>
                    </Card>
                )}

                {enricher.configSchema && enricher.configSchema.length > 0 && (
                    <ModalSection title="Configuration Options">
                        <Stack gap="xs">
                            {enricher.configSchema.map(field => (
                                <Card key={field.key}>
                                    <Stack direction="horizontal" gap="sm" align="center" wrap>
                                        <Paragraph inline bold>{field.label}</Paragraph>
                                        {field.required && <Badge variant="warning" size="sm">Required</Badge>}
                                        {field.description && (
                                            <Paragraph inline muted size="sm">{field.description}</Paragraph>
                                        )}
                                    </Stack>
                                </Card>
                            ))}
                        </Stack>
                    </ModalSection>
                )}

                {enricher.transformations && enricher.transformations.length > 0 && (
                    <ModalSection title="Example Transformation">
                        <Card>
                            <Stack direction="horizontal" gap="md" align="center" wrap>
                                <Stack gap="xs" align="center">
                                    <Paragraph inline muted size="sm">Before</Paragraph>
                                    <Code>{enricher.transformations[0].before}</Code>
                                </Stack>
                                <Paragraph inline>→</Paragraph>
                                <Stack gap="xs" align="center">
                                    <Paragraph inline muted size="sm">After</Paragraph>
                                    <Code>{enricher.transformations[0].after}</Code>
                                </Stack>
                            </Stack>
                        </Card>
                    </ModalSection>
                )}

                {enricher.useCases && enricher.useCases.length > 0 && (
                    <ModalSection title="Perfect For">
                        <Stack gap="xs">
                            {enricher.useCases.slice(0, 3).map((useCase, i) => (
                                <Paragraph key={i}>🎯 {useCase}</Paragraph>
                            ))}
                        </Stack>
                    </ModalSection>
                )}
            </Stack>
        </Modal>
    );
};

export default EnricherInfoModal;
