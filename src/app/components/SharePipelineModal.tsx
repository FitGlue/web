import React, { useState } from 'react';
import { Modal } from './library/ui/Modal';
import { Button } from './library/ui/Button';
import { Stack } from './library/layout/Stack';
import { Heading } from './library/ui/Heading';
import { Paragraph } from './library/ui/Paragraph';

interface Props {
    encodedPipeline: string;
    pipelineName: string;
    onClose: () => void;
}

export const SharePipelineModal: React.FC<Props> = ({ encodedPipeline, pipelineName, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(encodedPipeline);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Share Pipeline">
            <Stack gap="md">
                <Stack direction="horizontal" gap="sm" align="center">
                    <Paragraph inline>📤</Paragraph>
                    <Heading level={2}>Share Pipeline</Heading>
                </Stack>

                <Paragraph>
                    Share this code with others to let them import your <strong>{pipelineName}</strong> pipeline.
                </Paragraph>

                <textarea
                    value={encodedPipeline}
                    readOnly
                    rows={4}
                    onClick={(e) => e.currentTarget.select()}
                />

                <Stack direction="horizontal" gap="sm" justify="end">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleCopy}>
                        {copied ? '✓ Copied!' : '📋 Copy Code'}
                    </Button>
                </Stack>
            </Stack>
        </Modal>
    );
};

export default SharePipelineModal;
