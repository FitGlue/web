import React from 'react';
import { Stack } from '../library/layout';
import { Card, Badge, EmptyState, Code, Text, Button } from '../library/ui';
import './admin.css';
import { DataTable, DataTableColumn } from '../library/ui';
import { useAdminAuditLog } from '../../hooks/admin';
import { AdminAuditEntry } from '../../state/adminState';

const formatTime = (s?: string): string => (s ? new Date(s).toLocaleString() : '—');

/**
 * AdminAuditLog lists every recorded admin mutation (who did what, to whom, when,
 * and whether it succeeded) — the audit trail the console promises.
 */
export const AdminAuditLog: React.FC = () => {
  const { entries, loading, error, refresh } = useAdminAuditLog();

  const columns: DataTableColumn<AdminAuditEntry>[] = [
    {
      key: 'timestamp',
      header: 'When',
      render: (e) => <Text variant="small">{formatTime(e.timestamp)}</Text>,
      width: '180px',
    },
    {
      key: 'action',
      header: 'Action',
      render: (e) => <Text variant="body">{e.action || '—'}</Text>,
      width: '180px',
    },
    {
      key: 'actorEmail',
      header: 'Actor',
      render: (e) => <Text variant="small">{e.actorEmail || e.actorUid || '—'}</Text>,
    },
    {
      key: 'targetUserId',
      header: 'Target',
      render: (e) => (e.targetUserId ? <Code>{e.targetUserId.slice(0, 8)}...</Code> : <Text variant="muted">—</Text>),
      width: '120px',
    },
    {
      key: 'params',
      header: 'Details',
      render: (e) => {
        const params = e.params ?? {};
        const keys = Object.keys(params);
        return keys.length === 0
          ? <Text variant="muted">—</Text>
          : <Text variant="small">{keys.map((k) => `${k}=${params[k]}`).join(', ')}</Text>;
      },
    },
    {
      key: 'result',
      header: 'Result',
      render: (e) => (
        <Badge variant={e.result === 'error' ? 'error' : 'success'} size="sm">
          {e.result || 'ok'}
        </Badge>
      ),
      width: '90px',
    },
  ];

  if (error) {
    return (
      <Card>
        <EmptyState title="Error loading audit log" description={error} actionLabel="Retry" onAction={refresh} />
      </Card>
    );
  }

  return (
    <Stack gap="md">
      <Stack direction="horizontal" justify="between" align="center">
        <Text variant="muted">{entries.length} recent entries</Text>
        <Button variant="secondary" size="small" onClick={refresh} disabled={loading}>Refresh</Button>
      </Stack>
      <DataTable
        data={entries}
        columns={columns}
        rowKey="id"
        loading={loading}
        emptyState={<EmptyState title="No audit entries" description="No admin actions have been recorded yet." />}
      />
    </Stack>
  );
};
