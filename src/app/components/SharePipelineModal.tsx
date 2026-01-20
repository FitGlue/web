import React, { useState } from 'react';
import { Button } from './ui/Button';
import './SharePipelineModal.css';

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
        <div className="modal-overlay" onClick={onClose}>
            <div className="share-pipeline-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

                <div className="share-pipeline-header">
                    <span className="share-pipeline-icon">📤</span>
                    <h2>Share Pipeline</h2>
                </div>

                <p className="share-pipeline-description">
                    Share this code with others to let them import your <strong>{pipelineName}</strong> pipeline.
                </p>

                <div className="share-pipeline-code-container">
                    <textarea
                        className="share-pipeline-code"
                        value={encodedPipeline}
                        readOnly
                        rows={4}
                        onClick={(e) => e.currentTarget.select()}
                    />
                </div>

                <div className="share-pipeline-actions">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleCopy}>
                        {copied ? '✓ Copied!' : '📋 Copy Code'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SharePipelineModal;
