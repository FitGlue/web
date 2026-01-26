import React, { ReactNode } from 'react';
import './Card.css';

type CardVariant = 'default' | 'elevated' | 'interactive' | 'premium';

interface CardProps {
    /** Card variant styling */
    variant?: CardVariant;
    /** Highlighted with pink/purple border glow (for premium content) */
    highlighted?: boolean;
    /** Click handler - makes card interactive */
    onClick?: () => void;
    /** Card content */
    children: ReactNode;
    /** Optional footer content - renders with separator */
    footer?: ReactNode;
}

/**
 * Card is the base container for grouped content.
 */
export const Card: React.FC<CardProps> = ({
    variant = 'default',
    highlighted = false,
    onClick,
    children,
    footer,
}) => {
    const classes = [
        'card',
        variant === 'elevated' && 'card-elevated',
        variant === 'premium' && 'card-premium',
        onClick && 'clickable',
        highlighted && 'card-highlighted',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
            {footer && (
                <div>
                    {footer}
                </div>
            )}
        </div>
    );
};

