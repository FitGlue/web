import React, { useState } from 'react';
import { Modal } from './library/ui/Modal';
import { Button } from './library/ui/Button';
import { logger } from '../../shared/logger';

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
            logger.error('Failed to copy:', err);
        }
    };

    const handleShare = (platform: string) => {
        const text = `Check out my "${pipelineName}" FitGlue pipeline!`;
        const urls: Record<string, string> = {
            x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
            email: `mailto:?subject=${encodeURIComponent(`My FitGlue pipeline: ${pipelineName}`)}&body=${encodeURIComponent(text)}`,
        };
        if (urls[platform]) window.open(urls[platform], '_blank');
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`✦ Share "${pipelineName}"`}
            footer={
                <>
                    <Button variant="ghost" size="sm" onClick={onClose}>CANCEL</Button>
                    <Button size="sm" onClick={handleCopy}>
                        {copied ? '✓ COPIED' : '⎘ COPY CODE'}
                    </Button>
                </>
            }
        >
            <p style={{ margin: '0 0 12px', fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', lineHeight: 1.55, color: 'var(--fg-paper)' }}>
                Send a read-only copy of this pipeline to someone. They can clone it into their account in one click. Boosters + destinations transfer · <strong>your data does not.</strong>
            </p>
            <div style={{ padding: '12px 14px', background: 'var(--fg-ink)', fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', color: 'var(--fg-paper)', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                    {encodedPipeline.slice(0, 50)}{encodedPipeline.length > 50 ? '…' : ''}
                </span>
                <button
                    onClick={handleCopy}
                    style={{ background: 'none', border: 'none', fontFamily: 'var(--fg-font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--fg-cyan)', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                    {copied ? '✓ COPIED' : '⎘ COPY'}
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                    { key: 'x', icon: '🐦', name: 'X' },
                    { key: 'linkedin', icon: '💼', name: 'LINKEDIN' },
                    { key: 'email', icon: '📧', name: 'EMAIL' },
                ].map(({ key, icon, name }) => (
                    <button
                        key={key}
                        onClick={() => handleShare(key)}
                        style={{ padding: '14px 12px', background: 'var(--fg-ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', cursor: 'pointer', border: 'none', color: 'var(--fg-paper)' }}
                    >
                        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</span>
                        <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{name}</span>
                    </button>
                ))}
            </div>
        </Modal>
    );
};

export default SharePipelineModal;
