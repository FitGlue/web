import React, { ReactNode } from 'react';

type TextVariant = 'heading' | 'subheading' | 'body' | 'muted' | 'small';

interface TextProps {
    /** Typography variant */
    variant?: TextVariant;
    /** Text content */
    children: ReactNode;
}

/**
 * Text component for consistent typography.
 */
export const Text: React.FC<TextProps> = ({
    variant = 'body',
    children,
}) => {
    switch (variant) {
        case 'heading':
            return <h2>{children}</h2>;
        case 'subheading':
            return <h3>{children}</h3>;
        case 'muted':
            return <p style={{ color: 'var(--color-text-muted)' }}>{children}</p>;
        case 'small':
            return <span style={{ fontSize: '0.85rem' }}>{children}</span>;
        default:
            return <p>{children}</p>;
    }
};
