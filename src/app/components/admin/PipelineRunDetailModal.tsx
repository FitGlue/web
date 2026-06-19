import React, { useState, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Stack, Grid } from '../library/layout';
import { Modal, Badge, Code, Card, Text, Heading, KeyValue, Button, useToast } from '../library/ui';
import './admin.css';
import {
  selectedPipelineRunIdAtom,
  selectedPipelineRunDetailAtom,
  adminRunsRefreshAtom,
} from '../../state/adminState';
import { useAdminRunOps } from '../../hooks/admin';
import { logger } from '../../../shared/logger';
import {
  formatPipelineRunStatus,
  formatActivitySource,
  formatDestination,
  parseDestination,
} from '../../../types/pb/enum-formatters';
import { DestinationType } from '../../../types/pb/models/plugin/provider';

// Variant for run/destination/step status enum-name strings.
const statusVariant = (s?: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (s) {
    case 'PIPELINE_RUN_STATUS_SYNCED':
    case 'PIPELINE_RUN_STATUS_SYNCED_WITH_PENDING':
    case 'DESTINATION_STATUS_SUCCESS':
    case 'EXECUTION_STEP_STATUS_OK':
    case 'EXECUTION_STEP_STATUS_PASS':
      return 'success';
    case 'PIPELINE_RUN_STATUS_FAILED':
    case 'DESTINATION_STATUS_FAILED':
    case 'EXECUTION_STEP_STATUS_FAILED':
      return 'error';
    case 'PIPELINE_RUN_STATUS_RUNNING':
    case 'EXECUTION_STEP_STATUS_RUNNING':
    case 'EXECUTION_STEP_STATUS_QUEUED':
      return 'info';
    case 'PIPELINE_RUN_STATUS_PENDING':
    case 'PIPELINE_RUN_STATUS_PARTIAL':
    case 'EXECUTION_STEP_STATUS_RETRIED':
      return 'warning';
    default:
      return 'default';
  }
};

const STEP_KIND_LABELS: Record<string, string> = {
  EXECUTION_STEP_KIND_SOURCE: 'Source',
  EXECUTION_STEP_KIND_PARSE: 'Parse',
  EXECUTION_STEP_KIND_GATE: 'Gate',
  EXECUTION_STEP_KIND_ENRICHER_BATCH: 'Enrichers',
  EXECUTION_STEP_KIND_ROUTER: 'Router',
  EXECUTION_STEP_KIND_DESTINATION: 'Destination',
};

const stepStatusLabel = (s?: string): string =>
  (s ?? '').replace(/^EXECUTION_STEP_STATUS_/, '').toLowerCase() || 'unknown';

// destPluginId converts a DestinationOutcome.destination (enum name or number)
// into the lowercase plugin id the repost endpoint expects (e.g. "strava").
const destPluginId = (d?: string | number): string => {
  const num = parseDestination(d);
  const name = DestinationType[num] ?? '';
  return name.replace(/^DESTINATION_/, '').toLowerCase();
};

const isCancellable = (status?: string): boolean =>
  status === 'PIPELINE_RUN_STATUS_RUNNING' || status === 'PIPELINE_RUN_STATUS_PENDING';

/**
 * PipelineRunDetailModal — the run-operations view. Shows the unified execution
 * timeline (with per-step errors) and lets an admin remediate a run on the
 * user's behalf: re-run, retry a destination, cancel, or resolve a pending input.
 */
export const PipelineRunDetailModal: React.FC = () => {
  const [selectedRunId, setSelectedRunId] = useAtom(selectedPipelineRunIdAtom);
  const [run, setRun] = useAtom(selectedPipelineRunDetailAtom);
  const bumpRefresh = useSetAtom(adminRunsRefreshAtom);
  const toast = useToast();
  const { repost, cancelRun, resolvePendingInput } = useAdminRunOps();
  const [busy, setBusy] = useState(false);

  const handleClose = () => {
    setSelectedRunId(null);
    setRun(null);
  };

  const act = useCallback(async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      toast.success('Done', label);
      bumpRefresh((n) => n + 1);
      handleClose();
    } catch (err) {
      logger.error(`Run op failed: ${label}`, err);
      toast.error('Action failed', label);
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, bumpRefresh]);

  const isOpen = !!selectedRunId && !!run;
  if (!isOpen || !run) return null;

  const userId = run.userId ?? '';
  const activityId = run.activityId ?? '';
  const runId = run.id ?? '';
  const steps = (run.steps ?? []).slice().sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0));
  const destinations = run.destinations ?? [];
  const failedDestinations = destinations.filter((d) => d.status === 'DESTINATION_STATUS_FAILED');
  const pendingInputIds = [
    ...(run.pendingInputId ? [run.pendingInputId] : []),
    ...(run.nonBlockingPendingInputIds ?? []),
  ];
  const canAct = !!userId && !!activityId;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Pipeline Run Operations" size="lg">
      <Stack gap="lg">
        {/* Overview */}
        <Stack gap="sm">
          <Heading level={4}>Overview</Heading>
          <Grid cols={2}>
            <KeyValue label="Run ID" value={runId} format="code" />
            <KeyValue label="User ID" value={userId} format="code" />
            <KeyValue label="Activity ID" value={activityId} format="code" />
            <KeyValue label="Source" value={formatActivitySource(run.source)} />
            <Stack direction="horizontal" gap="sm" align="center">
              <Text variant="body"><strong>Status:</strong></Text>
              <Badge variant={statusVariant(run.status)}>{formatPipelineRunStatus(run.status)}</Badge>
            </Stack>
            <KeyValue label="Title" value={run.title || 'Untitled'} />
          </Grid>
          {run.statusMessage && <Code>{run.statusMessage}</Code>}
        </Stack>

        {/* Execution timeline */}
        <Stack gap="sm">
          <Heading level={4}>Execution timeline</Heading>
          {steps.length === 0 ? (
            <Text variant="muted">No step records (legacy run).</Text>
          ) : (
            <Stack gap="xs">
              {steps.map((step) => (
                <Card key={step.id || step.ordinal} variant="elevated">
                  <Stack direction="horizontal" justify="between" align="center">
                    <Stack gap="xs">
                      <Stack direction="horizontal" gap="sm" align="center">
                        <Text variant="body">
                          <strong>{step.ordinal}. {step.displayName || STEP_KIND_LABELS[step.kind ?? ''] || 'Step'}</strong>
                        </Text>
                        <Badge variant="default" size="sm">{STEP_KIND_LABELS[step.kind ?? ''] ?? 'step'}</Badge>
                      </Stack>
                      {step.service && <Text variant="small">{step.service}</Text>}
                    </Stack>
                    <Stack direction="horizontal" gap="sm" align="center">
                      {step.durationMs && <Text variant="small">{step.durationMs}ms</Text>}
                      <Badge variant={statusVariant(step.status)} size="sm">
                        {step.statusLabel || stepStatusLabel(step.status)}
                      </Badge>
                    </Stack>
                  </Stack>
                  {step.error && <Code>{step.error}</Code>}
                </Card>
              ))}
            </Stack>
          )}
        </Stack>

        {/* Destination outcomes */}
        {destinations.length > 0 && (
          <Stack gap="sm">
            <Heading level={4}>Destinations</Heading>
            <Stack gap="xs">
              {destinations.map((d, i) => (
                <Card key={i} variant="elevated">
                  <Stack direction="horizontal" justify="between" align="center">
                    <Stack gap="xs">
                      <Text variant="body"><strong>{formatDestination(d.destination)}</strong></Text>
                      {d.externalId && <Text variant="small">external: {d.externalId}</Text>}
                    </Stack>
                    <Badge variant={statusVariant(d.status)} size="sm">
                      {(d.status ?? '').replace(/^DESTINATION_STATUS_/, '') || 'unknown'}
                    </Badge>
                  </Stack>
                  {d.error && <Code>{d.error}</Code>}
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Operations */}
        <Stack gap="sm">
          <Heading level={4}>Operations</Heading>
          {!canAct && <Text variant="muted">This run is missing a user or activity id; ops unavailable.</Text>}
          <Stack direction="horizontal" gap="sm" wrap>
            <Button
              variant="primary"
              size="small"
              disabled={busy || !canAct}
              onClick={() => act('Re-ran full pipeline', () => repost(userId, activityId, 'full-pipeline'))}
            >
              Re-run full pipeline
            </Button>

            {failedDestinations.map((d, i) => (
              <Button
                key={i}
                variant="secondary"
                size="small"
                disabled={busy || !canAct}
                onClick={() => act(
                  `Retried ${formatDestination(d.destination)}`,
                  () => repost(userId, activityId, 'retry-destination', destPluginId(d.destination)),
                )}
              >
                Retry {formatDestination(d.destination)}
              </Button>
            ))}

            {isCancellable(run.status) && runId && (
              <Button
                variant="ghost"
                size="small"
                disabled={busy}
                onClick={() => act('Cancelled run', () => cancelRun(userId, runId))}
              >
                Cancel run
              </Button>
            )}

            {pendingInputIds.map((pid) => (
              <Button
                key={pid}
                variant="ghost"
                size="small"
                disabled={busy || !userId}
                onClick={() => act('Resolved pending input', () => resolvePendingInput(userId, pid))}
              >
                Resolve input {pid.slice(0, 6)}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  );
};
