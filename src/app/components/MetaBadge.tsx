import React from 'react';
import { Badge } from './library/ui/Badge';
import { Stack } from './library/layout/Stack';
import { Paragraph } from './library/ui/Paragraph';

interface MetaBadgeProps {
  label: string;
  value: string;
}

export const MetaBadge: React.FC<MetaBadgeProps> = ({ label, value }) => {
  return (
    <Badge variant="default" size="sm">
      <Stack direction="horizontal" gap="xs">
        <Paragraph inline size="sm" bold>{label}:</Paragraph>
        <Paragraph inline size="sm">{value}</Paragraph>
      </Stack>
    </Badge>
  );
};
