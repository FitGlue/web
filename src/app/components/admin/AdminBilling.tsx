import React, { useEffect } from 'react';
import { useAdminUsers } from '../../hooks/admin';
import './admin.css';

const fmt = (s?: string): string => (s ? new Date(s).toLocaleDateString() : '—');

/**
 * AdminBilling — dense table of athlete / Stripe-backed users with quick links
 * into the Stripe dashboard.
 */
export const AdminBilling: React.FC = () => {
  const { users, loading, error, fetchUsers } = useAdminUsers();

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const billingUsers = users.filter((u) => u.tier === 'USER_TIER_ATHLETE' || u.stripeCustomerId);

  if (error) return <div className="adm__empty adm-bad">{error}</div>;

  return (
    <div className="adm">
      <div className="adm__sechead">athlete / stripe users ({billingUsers.length})</div>
      <table className="adm__table">
        <thead><tr><th>id</th><th>email</th><th>tier</th><th>stripe</th><th>trial ends</th><th>sync/mo</th></tr></thead>
        <tbody>
          {billingUsers.map((u) => (
            <tr key={u.userId} style={{ cursor: u.stripeCustomerId ? 'pointer' : 'default' }}
              onClick={() => u.stripeCustomerId && window.open(`https://dashboard.stripe.com/customers/${u.stripeCustomerId}`, '_blank')}>
              <td>{(u.userId ?? '').slice(0, 8)}</td>
              <td>{u.email || '—'}</td>
              <td className={u.tier === 'USER_TIER_ATHLETE' ? 'adm-vio' : ''}>{u.tier === 'USER_TIER_ATHLETE' ? 'ath' : 'hob'}</td>
              <td className={u.stripeCustomerId ? 'adm-ok' : 'adm-dim'}>{u.stripeCustomerId ? u.stripeCustomerId.slice(0, 14) : '—'}</td>
              <td className="adm-dim">{fmt(u.trialEndsAt)}</td>
              <td>{u.syncCountThisMonth ?? 0}</td>
            </tr>
          ))}
          {billingUsers.length === 0 && !loading && <tr style={{ cursor: 'default' }}><td colSpan={6} className="adm__empty">no billing users</td></tr>}
        </tbody>
      </table>
    </div>
  );
};
