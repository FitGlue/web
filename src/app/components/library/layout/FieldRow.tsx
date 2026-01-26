import React from 'react';
import './FieldRow.css';

export type FieldRowSize = 'sm' | 'md' | 'lg';

export interface FieldRowProps {
    /** Label text for the field */
    label: string;
    /** Value content - can be text or ReactNode */
    children: React.ReactNode;
    /** Optional action button/link */
    action?: React.ReactNode;
    /** Text size variant */
    size?: FieldRowSize;
    /** Layout direction */
    direction?: 'horizontal' | 'vertical';
}

/**
 * FieldRow provides standardized label-value layout for settings and info displays.
 * Replaces className patterns: field-label, field-value, field-value-row
 */
export const FieldRow: React.FC<FieldRowProps> = ({
    label,
    children,
    action,
    size = 'md',
    direction = 'vertical',
}) => {
    return (
        <div className={`field-row field-row--${size} field-row--${direction}`}>
            <span>{label}</span>
            <div>{children}</div>
            {action && <div>{action}</div>}
        </div>
    );
};
