import React from 'react';
import { Paragraph } from './Paragraph';
import './TransformationPreview.css';

interface TransformationPreviewProps {
    /** Text shown in the "before" panel */
    before: string;
    /** Text shown in the "after" panel */
    after: string;
    /** Optional label for the before panel (default: "Before") */
    beforeLabel?: string;
    /** Optional label for the after panel (default: "After — FitGlue Boosted") */
    afterLabel?: string;
}

/**
 * TransformationPreview renders a side-by-side (or stacked on mobile)
 * before/after comparison. Used to show what data looks like before and
 * after FitGlue enrichment.
 */
export const TransformationPreview: React.FC<TransformationPreviewProps> = ({
    before,
    after,
    beforeLabel = 'Before',
    afterLabel = 'After — FitGlue Boosted',
}) => {
    return (
        <div className="transformation-preview">
            <div className="transformation-preview__panel transformation-preview__panel--before">
                <span className="transformation-preview__label">{beforeLabel}</span>
                <Paragraph className="transformation-preview__text">{before}</Paragraph>
            </div>
            <div className="transformation-preview__arrow">
                <span>→</span>
            </div>
            <div className="transformation-preview__panel transformation-preview__panel--after">
                <span className="transformation-preview__label">✨ {afterLabel}</span>
                <Paragraph className="transformation-preview__text">{after}</Paragraph>
            </div>
        </div>
    );
};
