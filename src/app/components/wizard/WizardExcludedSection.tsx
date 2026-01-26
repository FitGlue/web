import React from 'react';
import { Stack } from '../library/layout/Stack';
import { Card } from '../library/ui/Card';
import { Paragraph } from '../library/ui/Paragraph';
import './WizardExcludedSection.css';

export interface WizardExcludedSectionProps<T> {
    items: T[];
    label?: string;
    getKey: (item: T) => string;
    getIcon: (item: T) => string | undefined;
    getName: (item: T) => string;
    getHint: (item: T) => string;
}

export function WizardExcludedSection<T>({
    items,
    label = 'Needs Connection',
    getKey,
    getIcon,
    getName,
    getHint,
}: WizardExcludedSectionProps<T>): React.ReactElement | null {
    if (items.length === 0) return null;

    return (
        <Stack gap="sm">
            <Paragraph inline muted size="sm">{label}</Paragraph>
            <Stack direction="horizontal" wrap gap="sm">
                {items.map(item => (
                    <Card key={getKey(item)} variant="default">
                        <Stack direction="horizontal" gap="sm" align="center">
                            <Paragraph inline>{getIcon(item) || ''}</Paragraph>
                            <Paragraph inline>{getName(item)}</Paragraph>
                            <Paragraph inline muted size="sm">{getHint(item)}</Paragraph>
                        </Stack>
                    </Card>
                ))}
            </Stack>
        </Stack>
    );
}
