import React, { ReactNode } from 'react';
import './Accordion.css';

interface AccordionTriggerProps {
    /** Whether the accordion content is currently expanded */
    isExpanded: boolean;
    /** Click handler for toggling expansion */
    onClick: () => void;
    /** Content rendered alongside the chevron (heading, badge, etc.) */
    children: ReactNode;
}

/**
 * AccordionTrigger renders a clickable row with a disclosure chevron (▶)
 * that rotates when expanded. Wraps heading/badge content.
 */
export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ isExpanded, onClick, children }) => {
    const chevronClasses = [
        'accordion-trigger__chevron',
        isExpanded && 'accordion-trigger__chevron--expanded',
    ].filter(Boolean).join(' ');

    return (
        <div className="accordion-trigger" onClick={onClick}>
            <span className={chevronClasses}>▶</span>
            {children}
        </div>
    );
};
