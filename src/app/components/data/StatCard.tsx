import React from 'react';
import { Card, Heading, Paragraph } from '../library/ui';
import { Stack } from '../library/layout';

interface StatCardProps {
    title: string;
    value: string | number;
    label: string;
    onClick?: () => void;
    loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    label,
    onClick,
    loading = false,
}) => {
    return (
        <Card variant="default" onClick={onClick}>
            <Stack gap="xs" align="center">
                <Heading level={3}>{title}</Heading>
                <Paragraph size="lg" bold>{loading ? '...' : value}</Paragraph>
                <Paragraph size="sm" muted>{label}</Paragraph>
            </Stack>
        </Card>
    );
};
