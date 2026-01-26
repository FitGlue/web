import React from 'react';
import './SettingsSection.css';

export interface SettingsSectionProps {
    /** Section title */
    title?: string;
    /** Optional description text */
    description?: string;
    /** Section content */
    children: React.ReactNode;
    /** Variant for different contexts */
    variant?: 'default' | 'danger';
}

/**
 * SettingsSection provides standardized settings/edit section layout.
 * Replaces className patterns: edit-section, account-field, danger-zone
 */
export const SettingsSection: React.FC<SettingsSectionProps> = ({
    title,
    description,
    children,
    variant = 'default',
}) => {
    return (
        <div className={`settings-section settings-section--${variant}`}>
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
            <div>{children}</div>
        </div>
    );
};
