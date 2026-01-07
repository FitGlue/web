import React, { ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'interactive';

interface CardProps {
    /** Card variant styling */
    variant?: CardVariant;
    /** Click handler - makes card interactive */
    onClick?: () => void;
    /** Card content */
    children: ReactNode;
    /** Optional footer content - renders with separator */
    footer?: ReactNode;
    /** Optional additional className */
    className?: string;
}

/**
 * Card is the base container for grouped content.
 */
export const Card: React.FC<CardProps> = ({
    variant = 'default',
    onClick,
    children,
    footer,
    className = ''
}) => {
    const interactiveClass = onClick ? 'clickable' : '';
    const variantClass = variant === 'elevated' ? 'card-elevated' : '';

    return (
        <div
            className={`card ${variantClass} ${interactiveClass} ${className}`.trim()}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
            {footer && (
                <div className="card-footer">
                    {footer}
                </div>
            )}
        </div>
    );
};

