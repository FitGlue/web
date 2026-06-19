import React, { useState, useEffect, useCallback } from 'react';
import { Stack } from '../library/layout';
import { Modal, Button, Text, Heading, Badge, Code, LoadingState, useToast } from '../library/ui';
import { logger } from '../../../shared/logger';
import { AdminPipelineConfig } from '../../hooks/admin';
import { formatDestination, formatEnricherProviderType } from '../../../types/pb/enum-formatters';

interface AdminPipelineInspectorProps {
  pipelineId: string;
  onClose: () => void;
  getPipeline: (pipelineId: string) => Promise<AdminPipelineConfig | null>;
  updatePipeline: (pipelineId: string, pipeline: AdminPipelineConfig) => Promise<void>;
  deletePipeline: (pipelineId: string) => Promise<void>;
}

/**
 * AdminPipelineInspector lets an admin inspect a user's full pipeline config and
 * edit it directly: a formatted summary plus a raw-JSON editor (the power tool
 * for fixing misconfigured enrichers/destinations), save, and delete.
 */
export const AdminPipelineInspector: React.FC<AdminPipelineInspectorProps> = ({
  pipelineId,
  onClose,
  getPipeline,
  updatePipeline,
  deletePipeline,
}) => {
  const toast = useToast();
  const [config, setConfig] = useState<AdminPipelineConfig | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cfg = await getPipeline(pipelineId);
        if (active) {
          setConfig(cfg);
          setDraft(JSON.stringify(cfg ?? {}, null, 2));
        }
      } catch (err) {
        logger.error('Failed to load pipeline config', err);
        if (active) toast.error('Load failed', 'Could not load pipeline config');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineId]);

  const handleSave = useCallback(async () => {
    let parsed: AdminPipelineConfig;
    try {
      parsed = JSON.parse(draft);
    } catch {
      toast.error('Invalid JSON', 'Fix the JSON before saving');
      return;
    }
    setBusy(true);
    try {
      await updatePipeline(pipelineId, parsed);
      toast.success('Saved', 'Pipeline config updated');
      onClose();
    } catch (err) {
      logger.error('Failed to update pipeline', err);
      toast.error('Save failed', 'Could not update pipeline');
    } finally {
      setBusy(false);
    }
  }, [draft, pipelineId, updatePipeline, toast, onClose]);

  const handleDelete = useCallback(async () => {
    setBusy(true);
    try {
      await deletePipeline(pipelineId);
      toast.success('Deleted', 'Pipeline removed');
      onClose();
    } catch (err) {
      logger.error('Failed to delete pipeline', err);
      toast.error('Delete failed', 'Could not delete pipeline');
    } finally {
      setBusy(false);
    }
  }, [pipelineId, deletePipeline, toast, onClose]);

  const enrichers = config?.enrichers ?? [];
  const destinations = config?.destinations ?? [];
  const sources = config?.sources?.length ? config.sources : (config?.source ? [config.source] : []);

  return (
    <Modal isOpen onClose={onClose} title="Pipeline Config" size="lg">
      {loading ? (
        <LoadingState message="Loading pipeline…" />
      ) : !config ? (
        <Text variant="muted">Pipeline not found.</Text>
      ) : (
        <Stack gap="lg">
          <Stack gap="sm">
            <Stack direction="horizontal" gap="sm" align="center">
              <Heading level={4}>{config.name || 'Untitled pipeline'}</Heading>
              <Badge variant={config.disabled ? 'default' : 'success'} size="sm">
                {config.disabled ? 'Disabled' : 'Enabled'}
              </Badge>
            </Stack>
            <Text variant="small">Sources: {sources.join(', ') || '—'}</Text>
            <Text variant="small">
              Enrichers: {enrichers.length ? enrichers.map((e) => formatEnricherProviderType(e.providerType)).join(' → ') : '—'}
            </Text>
            <Text variant="small">
              Destinations: {destinations.length ? destinations.map((d) => formatDestination(d)).join(', ') : '—'}
            </Text>
          </Stack>

          <Stack gap="sm">
            <Heading level={5}>Raw config (editable)</Heading>
            <textarea
              className="admin-json-editor"
              value={draft}
              spellCheck={false}
              onChange={(e) => setDraft(e.target.value)}
              rows={18}
            />
            <Code>Edits are written back as the full pipeline config. Take care.</Code>
          </Stack>

          <Stack direction="horizontal" gap="sm" justify="between">
            <Stack direction="horizontal" gap="sm">
              <Button variant="primary" size="small" disabled={busy} onClick={handleSave}>Save changes</Button>
              <Button variant="secondary" size="small" disabled={busy} onClick={() => {
                setDraft(JSON.stringify(config, null, 2));
              }}>Reset</Button>
            </Stack>
            {confirmingDelete ? (
              <Stack direction="horizontal" gap="sm" align="center">
                <Text variant="small">Delete this pipeline?</Text>
                <Button variant="danger" size="small" disabled={busy} onClick={handleDelete}>Confirm delete</Button>
                <Button variant="ghost" size="small" disabled={busy} onClick={() => setConfirmingDelete(false)}>No</Button>
              </Stack>
            ) : (
              <Button variant="ghost" size="small" disabled={busy} onClick={() => setConfirmingDelete(true)}>Delete pipeline</Button>
            )}
          </Stack>
        </Stack>
      )}
    </Modal>
  );
};
