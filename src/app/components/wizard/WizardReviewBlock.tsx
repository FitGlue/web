import React from 'react';
import { Stack } from '../library/layout/Stack';
import { Card } from '../library/ui/Card';
import { Paragraph } from '../library/ui/Paragraph';
import './WizardReviewBlock.css';

export interface WizardReviewBlockProps {
    label: string;
    children: React.ReactNode;
}

export const WizardReviewBlock: React.FC<WizardReviewBlockProps> = ({
    label,
    children,
}) => {
    return (
        <Card>
            <Stack gap="sm">
                <Paragraph inline muted size="sm">{label}</Paragraph>
                <Stack gap="xs">
                    {children}
                </Stack>
            </Stack>
        </Card>
    );
};
