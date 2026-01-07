import React, { ReactNode } from 'react';

type TextVariant = 'heading' | 'subheading' | 'body' | 'muted' | 'small';

interface TextProps {
    /** Typography variant */
    variant?: TextVariant;
    /** Text content */
    children: ReactNode;
    /** Optional className */
    className?: string;
}

/**
 * Text component for consistent typography.
 */
export const Text: React.FC<TextProps> = ({
    variant = 'body',
    children,
    className = ''
}) => {
    switch (variant) {
        case 'heading':
            return <h2 className={`text-heading ${className}`.trim()}>{children}</h2>;
        case 'subheading':
            return <h3 className={`text-subheading ${className}`.trim()}>{children}</h3>;
        case 'muted':
            return <p className={`text-muted ${className}`.trim()} style={{ color: 'var(--color-text-muted)' }}>{children}</p>;
        case 'small':
            return <span className={`text-small ${className}`.trim()} style={{ fontSize: '0.85rem' }}>{children}</span>;
        default:
            return <p className={`text-body ${className}`.trim()}>{children}</p>;
    }
};
