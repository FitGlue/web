import React from 'react';
import './Link.css';

export interface LinkProps {
    /** Link destination URL */
    href: string;
    /** Link content */
    children: React.ReactNode;
    /** Whether to open in a new tab */
    external?: boolean;
    /** Additional CSS class names */
    className?: string;
}

/**
 * Link - A styled anchor component for navigation.
 * Supports external links with proper security attributes.
 */
export const Link: React.FC<LinkProps> = ({
    href,
    children,
    external = false,
    className = '',
}) => {
    return (
        <a
            href={href}
            className={`link ${className}`.trim()}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
            {children}
        </a>
    );
};
