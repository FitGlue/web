import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useAdminPipelineRuns } from '../../hooks/admin';
import { pipelineRunFiltersAtom, AdminPipelineRun } from '../../state/adminState';
import { AdminRunPane } from './AdminRunPane';
import { PipelineRunStatus } from '../../../types/pb/models/pipeline/execution';
import { ActivitySource } from '../../../types/pb/models/activity/source';
import { formatPipelineRunStatus, formatActivitySource } from '../../../types/pb/enum-formatters';
import './admin.css';

const STATUS_OPTIONS = Object.values(PipelineRunStatus)
  .filter((v): v is PipelineRunStatus => typeof v === 'number' && v !== PipelineRunStatus.PIPELINE_RUN_STATUS_UNSPECIFIED && v !== PipelineRunStatus.UNRECOGNIZED)
  .map((v) => ({ value: PipelineRunStatus[v], label: formatPipelineRunStatus(v) }));

const SOURCE_OPTIONS = Object.values(ActivitySource)
  .filter((v): v is ActivitySource => typeof v === 'number' && v > 0 && v !== ActivitySource.SOURCE_TEST && v !== ActivitySource.UNRECOGNIZED)
  .map((v) => ({ value: ActivitySource[v], label: formatActivitySource(v) }));

const rel = (s?: string | null): string => {
  if (!s) return '—';
  const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}d`;
};
const statusClass = (s?: string): string =>
  s?.endsWith('SYNCED') ? 'adm-ok' : s?.endsWith('FAILED') ? 'adm-bad' : s?.endsWith('RUNNING') || s?.endsWith('PENDING') || s?.endsWith('PARTIAL') ? 'adm-warn' : 'adm-dim';

/**
 * AdminRunsConsole — split-pane pipeline-run ops: a dense, filterable cross-user
 * run list on the left; the run timeline + remediation actions on the right.
 */
export const AdminRunsConsole: React.FC = () => {
  const [filters, setFilters] = useAtom(pipelineRunFiltersAtom);
  const { runs, stats, loading, error, hasMore, fetchRuns, loadMore } = useAdminPipelineRuns();
  const [selected, setSelected] = useState<AdminPipelineRun | null>(null);

  useEffect(() => {
    fetchRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="adm__split">
      <div className="adm__pane adm__pane--list">
        <div className="adm__filters">
          <select value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">all status</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={filters.source || ''} onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
            <option value="">all sources</option>
            {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input placeholder="user id" value={filters.userId || ''} onChange={(e) => setFilters({ ...filters, userId: e.target.value })} />
          <button className="adm__btn" onClick={() => fetchRuns()} disabled={loading}>apply</button>
          {stats && <span className="adm-dim" style={{ fontSize: '0.62rem' }}>{stats.total} · ✓{stats.byStatus?.['Synced'] ?? 0} · ✗{stats.byStatus?.['Failed'] ?? 0}</span>}
        </div>
        {error ? <div className="adm__empty adm-bad">{error}</div> : (
          <table className="adm__table">
            <thead><tr><th>age</th><th>user</th><th>source</th><th>activity</th><th>status</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className={selected?.id === r.id ? 'is-sel' : ''} onClick={() => setSelected(r)}>
                  <td className="adm-dim">{rel(r.createdAt)}</td>
                  <td>{(r.userId ?? '').slice(0, 8)}</td>
                  <td className="adm-dim">{formatActivitySource(r.source)}</td>
                  <td>{r.title || 'Untitled'}</td>
                  <td className={statusClass(r.status)}>{formatPipelineRunStatus(r.status)}</td>
                </tr>
              ))}
              {runs.length === 0 && !loading && <tr style={{ cursor: 'default' }}><td colSpan={5} className="adm__empty">no runs</td></tr>}
            </tbody>
          </table>
        )}
        {hasMore && <div style={{ padding: '0.4rem' }}><button className="adm__btn" onClick={loadMore} disabled={loading}>load more</button></div>}
      </div>
      <div className="adm__pane adm__pane--detail">
        {selected ? <AdminRunPane key={selected.id} run={selected} onActed={fetchRuns} /> : <div className="adm__placeholder">Select a run</div>}
      </div>
    </div>
  );
};
