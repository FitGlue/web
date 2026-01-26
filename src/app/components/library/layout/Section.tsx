import React, { ReactNode } from 'react';

interface SectionProps {
    /** Optional section title */
    title?: string;
    /** Section content */
    children: ReactNode;
}

/**
 * Section groups related content with an optional title.
 * Use for logical content separation within a page.
 */
export const Section: React.FC<SectionProps> = ({
    title,
    children,
}) => {
    return (
        <section>
            {title && <h3>{title}</h3>}
            {children}
        </section>
    );
};
