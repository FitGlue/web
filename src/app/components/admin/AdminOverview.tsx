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

      <Heading level={4}>Recent Executions</Heading>
      <Grid cols={3} gap="md">
        <Card variant="elevated">
          <Stack gap="xs">
            <Text variant="muted">Success</Text>
            <Stack direction="horizontal" gap="sm" align="center">
              <Heading level={2}>{stats.recentExecutions.success}</Heading>
              <Badge variant="success" size="sm">✓</Badge>
            </Stack>
          </Stack>
        </Card>
        <Card variant="elevated">
          <Stack gap="xs">
            <Text variant="muted">Failed</Text>
            <Stack direction="horizontal" gap="sm" align="center">
              <Heading level={2}>{stats.recentExecutions.failed}</Heading>
              {stats.recentExecutions.failed > 0 && <Badge variant="error" size="sm">!</Badge>}
            </Stack>
          </Stack>
        </Card>
        <Card variant="elevated">
          <Stack gap="xs">
            <Text variant="muted">Started</Text>
            <Stack direction="horizontal" gap="sm" align="center">
              <Heading level={2}>{stats.recentExecutions.started}</Heading>
              {stats.recentExecutions.started > 0 && <Badge variant="info" size="sm">⏳</Badge>}
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Stack>
  );
};
