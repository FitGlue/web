import React from 'react';
import { UnsynchronizedEntry } from '../../services/ActivitiesService';
import { Card, Pill, Heading, Paragraph } from '../library/ui';
import { Stack } from '../library/layout';
import { formatActivityType, formatActivitySource } from '../../../types/pb/enum-formatters';

interface UnsyncedActivityCardProps {
    entry: UnsynchronizedEntry;
    onClick?: () => void;
}

const formatSourceName = (source?: string): string => {
    return formatActivitySource(source);
};

export const UnsyncedActivityCard: React.FC<UnsyncedActivityCardProps> = ({
    entry,
    onClick,
}) => {
    const activityTitle = entry.title || 'Unknown Activity';
    const activityType = formatActivityType(entry.activityType);
    const sourceName = formatSourceName(entry.source);

    const attemptDate = entry.timestamp
        ? new Date(entry.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    const statusLabel = entry.status?.replace(/_/g, ' ').toLowerCase() || 'pending';

    return (
        <Card onClick={onClick}>
            <Stack gap="sm">
                <Stack direction="horizontal" justify="between" align="start">
                    <Stack direction="horizontal" gap="sm" align="center">
                        <Pill variant="gradient">{activityType}</Pill>
                        <Heading level={4}>{activityTitle}</Heading>
                    </Stack>
                    <Pill variant={entry.status === 'FAILED' ? 'error' : 'warning'}>
                        {statusLabel}
                    </Pill>
                </Stack>

                <Stack direction="horizontal" gap="sm" align="center">
                    <Paragraph inline>📥</Paragraph>
                    <Paragraph size="sm">From {sourceName}</Paragraph>
                    {attemptDate && (
                        <Paragraph size="sm" muted>Attempted: {attemptDate}</Paragraph>
                    )}
                </Stack>

                {entry.errorMessage && (
                    <Stack direction="horizontal" gap="sm" align="start">
                        <Paragraph inline>⚠️</Paragraph>
                        <Paragraph size="sm">{entry.errorMessage}</Paragraph>
                    </Stack>
                )}

                <Paragraph size="sm" muted>
                    Click to view details →
                </Paragraph>
            </Stack>
        </Card>
    );
};
