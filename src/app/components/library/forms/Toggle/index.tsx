import React from 'react';
import './Toggle.css';

export interface ToggleProps {
    /** Label displayed next to the toggle */
    label: string;
    /** Optional description text below the label */
    description?: string;
    /** Whether the toggle is checked/on */
    checked: boolean;
    /** Change handler */
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Whether the toggle is disabled */
    disabled?: boolean;
}

/**
 * Toggle - A switch-style toggle component for boolean settings.
 * Displays a label and optional description with a sliding switch control.
 */
export const Toggle: React.FC<ToggleProps> = ({
    label,
    description,
    checked,
    onChange,
    disabled = false,
}) => {
    return (
        <div className="toggle">
            <div className="toggle__info">
                <span className="toggle__label">{label}</span>
                {description && (
                    <span className="toggle__description">{description}</span>
                )}
            </div>
            <label className="toggle__switch">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="toggle__track" />
            </label>
        </div>
    );
};
