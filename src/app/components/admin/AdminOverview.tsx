import React from 'react';
import { Grid, Stack } from '../library/layout';
import { Card, CardSkeleton, Heading, Text, Badge } from '../library/ui';
import { useAdminStats } from '../../hooks/admin';

/**
 * AdminOverview displays platform-wide statistics
 */
export const AdminOverview: React.FC = () => {
  const { stats, loading, error } = useAdminStats();

  if (error) {
    return (
      <Card>
        <Text variant="muted">{error}</Text>
      </Card>
    );
  }

  if (loading || !stats) {
    return (
      <Grid cols={4} gap="md">
        <CardSkeleton variant="default" />
        <CardSkeleton variant="default" />
        <CardSkeleton variant="default" />
        <CardSkeleton variant="default" />
      </Grid>
    );
  }

  return (
    <Stack gap="lg">
      <Grid cols={4} gap="md">
        <Card>
          <Text variant="muted">Total Users</Text>
          <Heading level={2}>{stats.totalUsers}</Heading>
        </Card>
        <Card>
          <Text variant="muted">Athlete Users</Text>
          <Heading level={2}>{stats.athleteUsers}</Heading>
        </Card>
        <Card>
          <Text variant="muted">Admins</Text>
          <Heading level={2}>{stats.adminUsers}</Heading>
        </Card>
        <Card>
          <Text variant="muted">Syncs (Month)</Text>
          <Heading level={2}>{stats.totalSyncsThisMonth}</Heading>
        </Card>
      </Grid>

      <Card>
        <Heading level={4}>Recent Executions</Heading>
        <Stack direction="horizontal" gap="xl">
          <Stack gap="xs" align="center">
            <Badge variant="success" size="md">{stats.recentExecutions.success} Success</Badge>
          </Stack>
          <Stack gap="xs" align="center">
            <Badge variant="error" size="md">{stats.recentExecutions.failed} Failed</Badge>
          </Stack>
          <Stack gap="xs" align="center">
            <Badge variant="info" size="md">{stats.recentExecutions.started} Started</Badge>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};
