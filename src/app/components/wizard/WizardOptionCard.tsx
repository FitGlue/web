import React from 'react';
import { Heading } from '../library/ui/Heading';
import { Paragraph } from '../library/ui/Paragraph';
import { Stack } from '../library/layout/Stack';
import { Card } from '../library/ui/Card';
import { Badge } from '../library/ui/Badge';
import { PremiumBadge } from '../library/ui/PremiumBadge';
import './WizardOptionCard.css';

export interface WizardOptionCardProps {
    icon: string;
    title: string;
    description?: string;
    selected?: boolean;
    disabled?: boolean;
    isPremium?: boolean;
    hasConfig?: boolean;
    onClick?: () => void;
}

export const WizardOptionCard: React.FC<WizardOptionCardProps> = ({
    icon,
    title,
    description,
    selected = false,
    disabled = false,
    isPremium = false,
    hasConfig = false,
    onClick,
}) => {
    return (
        <Card
            variant={selected ? 'elevated' : 'default'}
            onClick={disabled ? undefined : onClick}
        >
            <Stack gap="sm">
                <Stack direction="horizontal" align="center" justify="between">
                    <Stack direction="horizontal" align="center" gap="sm">
                        <Paragraph inline>{icon}</Paragraph>
                        {isPremium && <PremiumBadge />}
                    </Stack>
                    <Stack direction="horizontal" gap="xs">
                        {selected && <Badge variant="success" size="sm">✓</Badge>}
                        {hasConfig && <Paragraph inline muted>⚙️</Paragraph>}
                    </Stack>
                </Stack>
                <Heading level={4}>{title}</Heading>
                {description && <Paragraph size="sm" muted>{description}</Paragraph>}
            </Stack>
        </Card>
    );
};
