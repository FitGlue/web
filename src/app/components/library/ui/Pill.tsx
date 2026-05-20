import React from 'react';

// Maps to fg-stamp classes in app-components.css.
export interface PillProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'pink' | 'gradient' | 'outlined' | 'muted';
    size?: 'small' | 'default' | 'large';
    icon?: string;
    onClick?: () => void;
    active?: boolean;
}

const VARIANT_CLASS: Record<NonNullable<PillProps['variant']>, string> = {
    default:  '',
    success:  'fg-stamp--green',
    warning:  'fg-stamp--gold',
    error:    'fg-stamp--rose',
    info:     'fg-stamp--violet',
    primary:  'fg-stamp--cyan',
    pink:     'fg-stamp--rose',
    gradient: '',
    outlined: 'fg-stamp--outline',
    muted:    'fg-stamp--ink',
};

export const Pill: React.FC<PillProps> = ({
    children,
    variant = 'default',
    size: _size, // eslint-disable-line @typescript-eslint/no-unused-vars
    icon,
    onClick,
    active = false,
}) => {
    const classes = [
        'fg-stamp',
        VARIANT_CLASS[variant],
        active ? 'fg-stamp--cyan' : '',
    ].filter(Boolean).join(' ');

    return (
        <span
            className={classes}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
};

export default Pill;
