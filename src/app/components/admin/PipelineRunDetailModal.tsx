import React from 'react';
import { useAtom } from 'jotai';
import { Stack, Grid } from '../library/layout';
import { Modal, Badge, Code, Card, Text, Heading, KeyValue, Paragraph } from '../library/ui';
import './admin.css';
import { selectedPipelineRunIdAtom, selectedPipelineRunDetailAtom } from '../../state/adminState';

// Status badge variant mapping — keys match schema enum strings.
const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  'PIPELINE_RUN_STATUS_SYNCED': 'success',
  'PIPELINE_RUN_STATUS_RUNNING': 'info',
  'PIPELINE_RUN_STATUS_PENDING': 'warning',
  'PIPELINE_RUN_STATUS_PARTIAL': 'warning',
  'PIPELINE_RUN_STATUS_FAILED': 'error',
  'PIPELINE_RUN_STATUS_SKIPPED': 'default',
  'PIPELINE_RUN_STATUS_ARCHIVED': 'default',
  'PIPELINE_RUN_STATUS_TIER_BLOCKED': 'warning',
  'PIPELINE_RUN_STATUS_CANCELLED': 'default',
  'DESTINATION_STATUS_SUCCESS': 'success',
  'DESTINATION_STATUS_FAILED': 'error',
  'DESTINATION_STATUS_PENDING': 'warning',
  'DESTINATION_STATUS_SKIPPED': 'default',
};

// BA badge class mapping
const statusBadgeClass: Record<string, string> = {
  'success': 'admin-badge--ok',
  'error': 'admin-badge--failed',
  'warning': 'admin-badge--warn',
  'info': 'admin-badge--warn',
  'default': 'admin-badge--muted',
};

/**
 * PipelineRunDetailModal displays detailed information about a pipeline run
 */
export const PipelineRunDetailModal: React.FC = () => {
  const [selectedRunId, setSelectedRunId] = useAtom(selectedPipelineRunIdAtom);
  const [selectedRun, setSelectedRun] = useAtom(selectedPipelineRunDetailAtom);

  const handleClose = () => {
    setSelectedRunId(null);
    setSelectedRun(null);
  };

  const isOpen = !!selectedRunId && !!selectedRun;

  if (!isOpen || !selectedRun) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pipeline Run Details"
      size="lg"
    >
      <Stack gap="lg">
        {/* Overview */}
        <Stack gap="sm">
          <Heading level={4}>Overview</Heading>
          <Grid cols={2}>
            <KeyValue label="Run ID" value={selectedRun.id} format="code" />
            <KeyValue label="User ID" value={selectedRun.userId ?? ''} format="code" />
            <KeyValue label="Pipeline ID" value={selectedRun.pipelineId} format="code" />
            <KeyValue label="Activity ID" value={selectedRun.activityId} format="code" />
            <Stack direction="horizontal" gap="sm" align="center">
              <Paragraph><strong>Status:</strong></Paragraph>
              {(() => {
                const v = statusVariants[selectedRun.status ?? ''] || 'default';
                return (
                  <Badge variant={v} className={statusBadgeClass[v]}>
                    {selectedRun.status}
                  </Badge>
                );
              })()}
            </Stack>
            <KeyValue label="Created" value={selectedRun.createdAt} format="datetime" />
          </Grid>
        </Stack>

        {/* Activity Info */}
        <Stack gap="sm">
          <Heading level={4}>Activity</Heading>
          <Grid cols={2}>
            <KeyValue label="Title" value={selectedRun.title || 'Untitled'} />
            <KeyValue label="Source" value={selectedRun.source} />
            <KeyValue label="Type" value={selectedRun.type} />
            <KeyValue label="Start Time" value={selectedRun.startTime} format="datetime" />
          </Grid>
        </Stack>

        {/* Booster Executions */}
        <Stack gap="sm">
          <Heading level={4}>Booster Executions</Heading>
          {(selectedRun.boosters ?? []).length === 0 ? (
            <Text variant="muted">No boosters executed</Text>
          ) : (
            <Stack gap="sm">
              {(selectedRun.boosters ?? []).map((booster, index) => {
                const v = statusVariants[booster.status ?? ''] || 'default';
                return (
                  <Card key={index} variant="elevated">
                    <Stack direction="horizontal" justify="between" align="center">
                      <Stack gap="xs">
                        <Paragraph><strong>{booster.providerName}</strong></Paragraph>
                        <Text variant="small">{booster.durationMs}ms</Text>
                      </Stack>
                      <Badge variant={v} className={statusBadgeClass[v]}>
                        {booster.status}
                      </Badge>
                    </Stack>
                    {booster.error && (
                      <Code>{booster.error}</Code>
                    )}
                  </Card>
                );
              })}
            </Stack>
          )}
        </Stack>

        {/* Destination Outcomes */}
        <Stack gap="sm">
          <Heading level={4}>Destination Outcomes</Heading>
          {(selectedRun.destinations ?? []).length === 0 ? (
            <Text variant="muted">No destination outcomes</Text>
          ) : (
            <Stack gap="sm">
              {(selectedRun.destinations ?? []).map((dest, index) => {
                const v = statusVariants[dest.status ?? ''] || 'default';
                return (
                  <Card key={index} variant="elevated">
                    <Stack direction="horizontal" justify="between" align="center">
                      <Stack gap="xs">
                        <Paragraph><strong>{dest.destination}</strong></Paragraph>
                        {dest.externalId && (
                          <Text variant="small">External ID: {dest.externalId}</Text>
                        )}
                      </Stack>
                      <Badge variant={v} className={statusBadgeClass[v]}>
                        {dest.status === 'DESTINATION_STATUS_SUCCESS' ? 'Success'
                          : dest.status === 'DESTINATION_STATUS_FAILED' ? 'Failed'
                          : dest.status}
                      </Badge>
                    </Stack>
                    {dest.error && (
                      <Code>{dest.error}</Code>
                    )}
                  </Card>
                );
              })}
            </Stack>
          )}
        </Stack>

        {/* Status Message */}
        {selectedRun.statusMessage && (
          <Stack gap="sm">
            <Heading level={4}>Status Message</Heading>
            <Code>{selectedRun.statusMessage}</Code>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};
