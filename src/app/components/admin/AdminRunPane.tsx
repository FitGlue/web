import React, { useState, useCallback } from 'react';
import { useToast } from '../library/ui';
import { logger } from '../../../shared/logger';
import { useAdminRunOps } from '../../hooks/admin';
import { AdminPipelineRun } from '../../state/adminState';
import {
  formatPipelineRunStatus, formatActivitySource, formatDestination, parseDestination,
} from '../../../types/pb/enum-formatters';
import { DestinationType } from '../../../types/pb/models/plugin/provider';
import './admin.css';

const statusClass = (s?: string): string => {
  if (!s) return 'adm-dim';
  if (s.endsWith('SYNCED') || s.endsWith('SUCCESS') || s.endsWith('_OK') || s.endsWith('PASS')) return 'adm-ok';
  if (s.endsWith('FAILED')) return 'adm-bad';
  if (s.endsWith('RUNNING') || s.endsWith('QUEUED')) return 'adm-warn';
  if (s.endsWith('PENDING') || s.endsWith('PARTIAL') || s.endsWith('RETRIED')) return 'adm-warn';
  return 'adm-dim';
};
const short = (s?: string, p?: RegExp): string => (s ?? '').replace(p ?? /^.*_/, '').toLowerCase() || '—';
const destPluginId = (d?: string | number): string =>
  (DestinationType[parseDestination(d)] ?? '').replace(/^DESTINATION_/, '').toLowerCase();
const isCancellable = (s?: string): boolean => s === 'PIPELINE_RUN_STATUS_RUNNING' || s === 'PIPELINE_RUN_STATUS_PENDING';

/**
 * AdminRunPane — dense run-ops record: execution timeline (per-step errors),
 * destination outcomes and remediation actions, shown inline in the runs console.
 */
export const AdminRunPane: React.FC<{ run: AdminPipelineRun; onActed: () => void }> = ({ run, onActed }) => {
  const toast = useToast();
  const { repost, cancelRun, resolvePendingInput } = useAdminRunOps();
  const [busy, setBusy] = useState(false);

  const userId = run.userId ?? '';
  const activityId = run.activityId ?? '';
  const runId = run.id ?? '';
  const steps = (run.steps ?? []).slice().sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0));
  const dests = run.destinations ?? [];
  const failed = dests.filter((d) => d.status === 'DESTINATION_STATUS_FAILED');
  const pendingIds = [...(run.pendingInputId ? [run.pendingInputId] : []), ...(run.nonBlockingPendingInputIds ?? [])];
  const canAct = !!userId && !!activityId;

  const act = useCallback(async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); toast.success('Done', label); onActed(); }
    catch (err) { logger.error(`Run op failed: ${label}`, err); toast.error('Action failed', label); }
    finally { setBusy(false); }
  }, [toast, onActed]);

  return (
    <div className="adm">
      <dl className="adm__kv">
        <dt>run</dt><dd>{runId}</dd>
        <dt>user</dt><dd>{userId || '—'}</dd>
        <dt>activity</dt><dd>{activityId || '—'}</dd>
        <dt>source</dt><dd>{formatActivitySource(run.source)}</dd>
        <dt>status</dt><dd className={statusClass(run.status)}>{formatPipelineRunStatus(run.status)}</dd>
        <dt>title</dt><dd>{run.title || 'Untitled'}</dd>
        {run.statusMessage && (<><dt>message</dt><dd className="adm-bad">{run.statusMessage}</dd></>)}
      </dl>

      <div className="adm__sec">
        <div className="adm__sechead">execution timeline</div>
        {steps.length === 0 ? <div className="adm__empty">no step records (legacy run)</div> : (
          <table className="adm__table">
            <thead><tr><th>#</th><th>step</th><th>service</th><th>ms</th><th>status</th></tr></thead>
            <tbody>
              {steps.map((s) => (
                <tr key={s.id || s.ordinal} style={{ cursor: 'default' }}>
                  <td>{s.ordinal}</td>
                  <td>{s.displayName || short(s.kind, /^EXECUTION_STEP_KIND_/)}</td>
                  <td className="adm-dim">{s.service || '—'}</td>
                  <td className="adm-dim">{s.durationMs ?? '—'}</td>
                  <td className={statusClass(s.status)}>
                    {s.statusLabel || short(s.status, /^EXECUTION_STEP_STATUS_/)}
                    {s.error ? <span className="adm-bad"> · {s.error}</span> : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {dests.length > 0 && (
        <div className="adm__sec">
          <div className="adm__sechead">destinations</div>
          <table className="adm__table">
            <thead><tr><th>dest</th><th>status</th><th>external</th><th>error</th></tr></thead>
            <tbody>
              {dests.map((d, i) => (
                <tr key={i} style={{ cursor: 'default' }}>
                  <td>{formatDestination(d.destination)}</td>
                  <td className={statusClass(d.status)}>{short(d.status, /^DESTINATION_STATUS_/)}</td>
                  <td className="adm-dim">{d.externalId || '—'}</td>
                  <td className="adm-bad">{d.error || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm__sec">
        <div className="adm__sechead">operations</div>
        {!canAct && <div className="adm__empty">missing user/activity id — run-ops unavailable</div>}
        <div className="adm__actions">
          <button className="adm__btn adm__btn--primary" disabled={busy || !canAct} onClick={() => act('Re-ran pipeline', () => repost(userId, activityId, 'full-pipeline'))}>Re-run full</button>
          {failed.map((d, i) => (
            <button key={i} className="adm__btn" disabled={busy || !canAct} onClick={() => act(`Retried ${formatDestination(d.destination)}`, () => repost(userId, activityId, 'retry-destination', destPluginId(d.destination)))}>Retry {formatDestination(d.destination)}</button>
          ))}
          {isCancellable(run.status) && runId && (
            <button className="adm__btn adm__btn--danger" disabled={busy} onClick={() => act('Cancelled run', () => cancelRun(userId, runId))}>Cancel run</button>
          )}
          {pendingIds.map((pid) => (
            <button key={pid} className="adm__btn" disabled={busy || !userId} onClick={() => act('Resolved input', () => resolvePendingInput(userId, pid))}>Resolve {pid.slice(0, 6)}</button>
          ))}
        </div>
      </div>
    </div>
  );
};
