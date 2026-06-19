import React, { useEffect, useState, useMemo } from 'react';
import { useAdminUsers } from '../../hooks/admin';
import { AdminUserPane } from './AdminUserPane';
import './admin.css';

/**
 * AdminUsersConsole — split-pane user ops: a dense, filterable directory on the
 * left; the full 360° record + actions on the right.
 */
export const AdminUsersConsole: React.FC = () => {
  const { users, loading, error, fetchUsers } = useAdminUsers();
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('');

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    const needle = q.toLowerCase();
    return users.filter((u) => {
      if (tier && u.tier !== tier) return false;
      if (!needle) return true;
      return (u.userId ?? '').toLowerCase().includes(needle) || (u.email ?? '').toLowerCase().includes(needle) || (u.displayName ?? '').toLowerCase().includes(needle);
    });
  }, [users, q, tier]);

  return (
    <div className="adm__split">
      <div className="adm__pane adm__pane--list">
        <div className="adm__filters">
          <input placeholder="search id / email / name" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="">all tiers</option>
            <option value="USER_TIER_ATHLETE">athlete</option>
            <option value="USER_TIER_HOBBYIST">hobbyist</option>
          </select>
          <button className="adm__btn" onClick={() => fetchUsers(1)} disabled={loading}>↻</button>
          <span className="adm-dim" style={{ fontSize: '0.62rem' }}>{rows.length}/{users.length}</span>
        </div>
        {error ? <div className="adm__empty adm-bad">{error}</div> : (
          <table className="adm__table">
            <thead>
              <tr><th>id</th><th>email</th><th>tier</th><th>acc</th><th>adm</th><th>sync</th><th>int</th><th>pipe</th></tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.userId} className={selected === u.userId ? 'is-sel' : ''} onClick={() => setSelected(u.userId ?? null)}>
                  <td>{(u.userId ?? '').slice(0, 8)}</td>
                  <td>{u.email || '—'}</td>
                  <td className={u.tier === 'USER_TIER_ATHLETE' ? 'adm-vio' : ''}>{u.tier === 'USER_TIER_ATHLETE' ? 'ath' : 'hob'}</td>
                  <td className={u.accessEnabled ? 'adm-ok' : 'adm-warn'}>{u.accessEnabled ? '✓' : '⏳'}</td>
                  <td>{u.isAdmin ? <span className="adm-vio">●</span> : ''}</td>
                  <td>{u.syncCountThisMonth ?? 0}</td>
                  <td className="adm-dim">{u.integrationCount ?? 0}</td>
                  <td className="adm-dim">{u.pipelineCount ?? 0}</td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr style={{ cursor: 'default' }}><td colSpan={8} className="adm__empty">no users</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="adm__pane adm__pane--detail">
        {selected ? <AdminUserPane key={selected} userId={selected} /> : <div className="adm__placeholder">Select a user</div>}
      </div>
    </div>
  );
};
