import React from 'react';
import { useAdminAuditLog } from '../../hooks/admin';
import './admin.css';

const fmt = (s?: string): string => (s ? new Date(s).toLocaleString() : '—');

/**
 * AdminAuditLog — dense audit trail of every recorded admin mutation.
 */
export const AdminAuditLog: React.FC = () => {
  const { entries, loading, error, refresh } = useAdminAuditLog();

  if (error) {
    return <div className="adm__empty adm-bad">{error} <button className="adm__btn" onClick={refresh}>retry</button></div>;
  }

  return (
    <div className="adm">
      <div className="adm__sechead">
        <span>audit log ({entries.length})</span>
        <button className="adm__btn" onClick={refresh} disabled={loading}>↻</button>
      </div>
      <table className="adm__table">
        <thead><tr><th>when</th><th>action</th><th>actor</th><th>target</th><th>details</th><th>result</th></tr></thead>
        <tbody>
          {entries.map((e) => {
            const params = e.params ?? {};
            const detail = Object.keys(params).map((k) => `${k}=${params[k]}`).join(' ');
            return (
              <tr key={e.id} style={{ cursor: 'default' }}>
                <td className="adm-dim">{fmt(e.timestamp)}</td>
                <td>{e.action || '—'}</td>
                <td className="adm-dim">{e.actorEmail || e.actorUid || '—'}</td>
                <td>{e.targetUserId ? e.targetUserId.slice(0, 8) : '—'}</td>
                <td className="adm-dim">{detail || '—'}</td>
                <td className={e.result === 'error' ? 'adm-bad' : 'adm-ok'}>{e.result || 'ok'}</td>
              </tr>
            );
          })}
          {entries.length === 0 && !loading && <tr style={{ cursor: 'default' }}><td colSpan={6} className="adm__empty">no audit entries yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
};
