import React, { ReactNode } from 'react';

// Maps to fg-stamp + fg-stamp--{color} classes in app-components.css.
export type BadgeVariant =
    | 'default' | 'success' | 'warning' | 'error' | 'info'
    | 'premium' | 'light' | 'booster' | 'booster-skipped' | 'booster-error'
    | 'source' | 'destination';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    icon?: ReactNode;
    className?: string;
    children: ReactNode;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
    default:          '',
    success:          'fg-stamp--green',
    warning:          'fg-stamp--gold',
    error:            'fg-stamp--rose',
    info:             'fg-stamp--violet',
    premium:          'fg-stamp--violet',
    light:            'fg-stamp--paper',
    booster:          '',
    'booster-skipped': 'fg-stamp--ink',
    'booster-error':   'fg-stamp--rose',
    source:           'fg-stamp--cyan',
    destination:      'fg-stamp--outline',
};

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    size,
    icon,
    className,
    children,
}) => {
    const classes = [
        'fg-stamp',
        VARIANT_CLASS[variant],
        size === 'sm' ? 'fg-stamp--sm' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
};
