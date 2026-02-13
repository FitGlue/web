import React, { ReactNode, useState } from 'react';
import { Card } from './Card';
import { AccordionTrigger } from './Accordion';
import './ExpandableCard.css';

interface ExpandableCardProps {
    /** Content rendered in the always-visible header row */
    header: ReactNode;
    /** Content revealed when expanded */
    children: ReactNode;
    /** Optional className for the outer Card */
    className?: string;
    /** Whether to start expanded */
    defaultExpanded?: boolean;
}

/**
 * ExpandableCard combines Card + AccordionTrigger into a single
 * expandable/collapsible card pattern. The header row is always
 * visible; children are revealed on click.
 */
export const ExpandableCard: React.FC<ExpandableCardProps> = ({
    header,
    children,
    className,
    defaultExpanded = false,
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const classes = [
        'expandable-card',
        expanded && 'expandable-card--expanded',
        className,
    ].filter(Boolean).join(' ');

    return (
        <Card className={classes}>
            <AccordionTrigger
                isExpanded={expanded}
                onClick={() => setExpanded(!expanded)}
            >
                {header}
            </AccordionTrigger>
            {expanded && (
                <div className="expandable-card__body">
                    {children}
                </div>
            )}
        </Card>
    );
};
