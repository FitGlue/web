import React from 'react';
import './SettingsSection.css';

export interface SettingsSectionProps {
    /** Section title shown in the band header */
    title?: string;
    /** Optional description text below the band */
    description?: string;
    /** Section content */
    children: React.ReactNode;
    /** Variant for different contexts */
    variant?: 'default' | 'danger';
}

/**
 * SettingsSection — ink-2 surface with fg-band--sm section header.
 * Brutal × Aurora: no rounded corners, gradient band label, flat rows.
 */
export const SettingsSection: React.FC<SettingsSectionProps> = ({
    title,
    description,
    children,
    variant = 'default',
}) => {
    return (
        <div className={`settings-section settings-section--${variant}`}>
            {title && (
                <div className="settings-section__head">
                    <h3 className="settings-section__title">{title}</h3>
                </div>
            )}
            {description && (
                <p className="settings-section__description">{description}</p>
            )}
            <div className="settings-section__content">
                {children}
            </div>
        </div>
    );
};
