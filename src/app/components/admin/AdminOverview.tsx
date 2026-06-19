import React from 'react';
import { useSetAtom } from 'jotai';
import { Grid, Stack } from '../library/layout';
import { Card, CardSkeleton, Text, Badge, Code, Heading } from '../library/ui';
import { useAdminStats, useAdminRecentFailures } from '../../hooks/admin';
import { selectedPipelineRunIdAtom, selectedPipelineRunDetailAtom, AdminPipelineRun } from '../../state/adminState';
import { formatActivitySource } from '../../../types/pb/enum-formatters';
import './admin.css';

/**
 * AdminOverview displays platform-wide statistics
 */
export const AdminOverview: React.FC = () => {
  const { stats, loading, error } = useAdminStats();
  const { runs: failures } = useAdminRecentFailures();
  const setRunId = useSetAtom(selectedPipelineRunIdAtom);
  const setRunDetail = useSetAtom(selectedPipelineRunDetailAtom);

  const openRun = (run: AdminPipelineRun) => {
    setRunId(run.id ?? null);
    setRunDetail(run);
  };

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
      {/* Stats grid — BA admin-stat-card panels */}
      <Grid cols={4} gap="md">
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Total Users</div>
          <div className="admin-stat-card__value">{stats.totalUsers}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Athlete Users</div>
          <div className="admin-stat-card__value">{stats.athleteUsers}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Admins</div>
          <div className="admin-stat-card__value">{stats.adminUsers}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Syncs (Month)</div>
          <div className="admin-stat-card__value">{stats.totalSyncsThisMonth}</div>
        </div>
      </Grid>

      {/* Recent executions */}
      <div className="admin-section-head">
        <span className="admin-section-head__label">Recent Executions</span>
      </div>
      <Grid cols={3} gap="md">
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Success</div>
          <Stack direction="horizontal" gap="sm" align="center">
            <div className="admin-stat-card__value">{stats.recentExecutions?.success ?? 0}</div>
            <Badge variant="success" size="sm" className="admin-badge--ok">✓</Badge>
          </Stack>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Failed</div>
          <Stack direction="horizontal" gap="sm" align="center">
            <div className="admin-stat-card__value">{stats.recentExecutions?.failed ?? 0}</div>
            {(stats.recentExecutions?.failed ?? 0) > 0 && (
              <Badge variant="error" size="sm" className="admin-badge--failed">!</Badge>
            )}
          </Stack>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">Started</div>
          <Stack direction="horizontal" gap="sm" align="center">
            <div className="admin-stat-card__value">{stats.recentExecutions?.started ?? 0}</div>
            {(stats.recentExecutions?.started ?? 0) > 0 && (
              <Badge variant="info" size="sm" className="admin-badge--warn">⏳</Badge>
            )}
          </Stack>
        </div>
      </Grid>

      {/* Recent failures triage feed */}
      <div className="admin-section-head">
        <span className="admin-section-head__label">Recent Failures</span>
      </div>
      {failures.length === 0 ? (
        <Text variant="muted">No recent failures 🎉</Text>
      ) : (
        <Stack gap="xs">
          {failures.map((run) => (
            <div
              key={run.id}
              className="admin-failure-row"
              role="button"
              tabIndex={0}
              onClick={() => openRun(run)}
              onKeyDown={(e) => { if (e.key === 'Enter') openRun(run); }}
            >
              <Stack gap="xs">
                <Heading level={5}>{run.title || 'Untitled activity'}</Heading>
                <Text variant="small">
                  {formatActivitySource(run.source)} · user <Code>{(run.userId ?? '').slice(0, 8)}…</Code>
                </Text>
              </Stack>
              <Badge variant="error" size="sm">Failed</Badge>
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
