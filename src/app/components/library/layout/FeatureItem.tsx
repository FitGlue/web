import React from 'react';
import './FeatureItem.css';

export interface FeatureItemProps {
    /** Icon (emoji or component) */
    icon: React.ReactNode;
    /** Feature title */
    title: string;
    /** Optional description */
    description?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * FeatureItem provides standardized feature/benefit display layout.
 * Replaces className patterns: feature-item, feature-icon
 */
export const FeatureItem: React.FC<FeatureItemProps> = ({
    icon,
    title,
    description,
    size = 'md',
}) => {
    return (
        <div className={`feature-item feature-item--${size}`}>
            <span>{icon}</span>
            <div>
                <span>{title}</span>
                {description && <span>{description}</span>}
            </div>
        </div>
    );
};
