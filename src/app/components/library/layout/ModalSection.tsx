import React from 'react';
import './ModalSection.css';

export interface ModalSectionProps {
    /** Optional section title shown in gradient band */
    title?: string;
    /** Section content */
    children: React.ReactNode;
    /** Spacing variant */
    spacing?: 'sm' | 'md' | 'lg';
}

/**
 * ModalSection — ink-2 surface with fg-band--sm header inside modals.
 * Brutal × Aurora: no rounded corners, gradient band label.
 */
export const ModalSection: React.FC<ModalSectionProps> = ({
    title,
    children,
    spacing = 'md',
}) => {
    return (
        <div className={`modal-section modal-section--spacing-${spacing}`}>
            {title && (
                <div className="modal-section__head">
                    <h4 className="modal-section__title">{title}</h4>
                </div>
            )}
            <div className="modal-section__content">
                {children}
            </div>
        </div>
    );
};
