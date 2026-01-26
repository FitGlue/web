import React from 'react';
import './ModalSection.css';

export interface ModalSectionProps {
    /** Optional section title */
    title?: string;
    /** Section content */
    children: React.ReactNode;
    /** Spacing variant */
    spacing?: 'sm' | 'md' | 'lg';
}

/**
 * ModalSection provides standardized section layout within modals.
 * Replaces className pattern: modal-section
 */
export const ModalSection: React.FC<ModalSectionProps> = ({
    title,
    children,
    spacing = 'md',
}) => {
    return (
        <div className={`modal-section modal-section--spacing-${spacing}`}>
            {title && <h4>{title}</h4>}
            <div>{children}</div>
        </div>
    );
};
