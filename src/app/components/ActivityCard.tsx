import React from 'react';
import { StatusPill } from './library/ui/StatusPill';
import { MetaBadge } from './MetaBadge';
import { Card } from './library/ui/Card';
import { Stack } from './library/layout/Stack';
import { Heading } from './library/ui/Heading';
import { Text } from './library/ui/Text';

interface ActivityCardProps {
  title: string;
  type: string;
  source: string;
  timestamp: string | null; // ISO string
  status?: string; // Optional, defaults to "Synced" if not provided/synced mode
  errorMessage?: string;
  onClick: () => void;
  isUnsynchronized?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  type,
  source,
  timestamp,
  status,
  errorMessage,
  onClick,
  isUnsynchronized
}) => {

  const dateStr = timestamp ? new Date(timestamp).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'N/A';

  return (
    <Card onClick={onClick} variant={isUnsynchronized ? 'default' : 'interactive'}>
      <Stack gap="sm">
        <Stack direction="horizontal" align="center" justify="between">
          <Heading level={3}>{title}</Heading>
          {status && <StatusPill status={status} />}
          {!status && !isUnsynchronized && <StatusPill status="SYNCED" />}
        </Stack>

        <Stack direction="horizontal" gap="sm">
          <MetaBadge label="Type" value={type} />
          <MetaBadge label="Source" value={source} />
        </Stack>

        {errorMessage && (
          <Text variant="muted">⚠️ {errorMessage}</Text>
        )}

        <Text variant="small">{isUnsynchronized ? 'Attempted' : 'Synced'}: {dateStr}</Text>
      </Stack>
    </Card>
  );
};
