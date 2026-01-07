import React, { ReactNode } from 'react';

interface SectionProps {
    /** Optional section title */
    title?: string;
    /** Section content */
    children: ReactNode;
    /** Optional additional className */
    className?: string;
}

/**
 * Section groups related content with an optional title.
 * Use for logical content separation within a page.
 */
export const Section: React.FC<SectionProps> = ({
    title,
    children,
    className = ''
}) => {
    return (
        <section className={`content-section ${className}`.trim()}>
            {title && <h3 className="section-title">{title}</h3>}
            {children}
        </section>
    );
};
