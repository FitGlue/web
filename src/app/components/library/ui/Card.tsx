import React, { ReactNode } from 'react';

// Maps to fg-panel--* classes in app-components.css.
// 'default' and 'elevated' surface the two most common ink levels.
type CardSurface = 'default' | 'elevated' | 'interactive' | 'premium';

interface CardProps {
    /** Surface depth: default=ink-2, elevated=ink-3, premium=aurora-wash */
    variant?: CardSurface;
    highlighted?: boolean;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    children: ReactNode;
    footer?: ReactNode;
}

const SURFACE_CLASS: Record<CardSurface, string> = {
    default:     'fg-panel--ink-2',
    elevated:    'fg-panel--ink-3',
    interactive: 'fg-panel--ink-2',
    premium:     'fg-panel--aurora-wash',
};

export const Card: React.FC<CardProps> = ({
    variant = 'default',
    highlighted = false,
    onClick,
    className,
    style,
    children,
    footer,
}) => {
    const classes = [
        'fg-panel',
        SURFACE_CLASS[variant],
        (variant === 'interactive' || onClick) ? 'fg-panel--clickable' : '',
        highlighted ? 'fg-panel--highlighted' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            style={style}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
            {footer && <div className="fg-panel__footer">{footer}</div>}
        </div>
    );
};
