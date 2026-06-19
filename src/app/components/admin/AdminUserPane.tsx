import React, { useState, useCallback } from 'react';
import { useToast, ConfirmDialog, LoadingState } from '../library/ui';
import { logger } from '../../../shared/logger';
import { useAdminUserDetail } from '../../hooks/admin';
import { AdminPipelineInspector } from './AdminPipelineInspector';
import './admin.css';

type ConfirmState = {
  title: string; message: string; danger?: boolean; confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
} | null;

const fmt = (s?: string): string => (s ? new Date(s).toLocaleString() : '—');
const cap = (s?: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const healthClass = (h?: string): string => (h === 'valid' ? 'adm-ok' : h === 'expired' ? 'adm-bad' : 'adm-dim');

/**
 * AdminUserPane — the dense 360° user record used as the right pane of the users
 * console (and the standalone /admin/users/:id page). All actions inline.
 */
export const AdminUserPane: React.FC<{ userId: string }> = ({ userId }) => {
  const toast = useToast();
  const {
    detail, loading, error, reload,
    updateUser, sendPasswordReset, sendVerificationEmail,
    setIntegrationEnabled, deleteIntegration, deleteUserData,
    startTrial, cancelSubscription, openBillingPortal,
    getPipeline, updatePipeline, deletePipeline,
  } = useAdminUserDetail(userId);

  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [busy, setBusy] = useState(false);
  const [inspectPipelineId, setInspectPipelineId] = useState<string | null>(null);

  const run = useCallback(async (label: string, fn: () => Promise<void> | void) => {
    setBusy(true);
    try { await fn(); toast.success('Done', label); }
    catch (err) { logger.error(`Admin action failed: ${label}`, err); toast.error('Action failed', label); }
    finally { setBusy(false); }
  }, [toast]);

  if (loading && !detail) return <LoadingState message="Loading user…" />;
  if (error || !detail?.profile) {
    return <div className="adm__placeholder">{error ?? 'No profile found.'} <button className="adm__btn" onClick={reload}>Retry</button></div>;
  }

  const p = detail.profile;
  const isAthlete = p.tier === 'USER_TIER_ATHLETE';
  const integrations = detail.integrations ?? [];
  const pipelines = detail.pipelines ?? [];
  const pending = detail.pendingInputs ?? [];
  const sub = detail.billing?.subscription;

  return (
    <div className="adm">
      {/* Identity + counts */}
      <dl className="adm__kv">
        <dt>id</dt><dd>{p.userId}</dd>
        <dt>email</dt><dd>{p.email || '—'}</dd>
        <dt>name</dt><dd>{p.displayName || '—'}</dd>
        <dt>tier</dt><dd className={isAthlete ? 'adm-vio' : ''}>{isAthlete ? 'Athlete' : 'Hobbyist'}{detail.billing?.isTrial ? ' (trial)' : ''}</dd>
        <dt>access</dt><dd className={p.accessEnabled ? 'adm-ok' : 'adm-warn'}>{p.accessEnabled ? 'active' : 'waitlist'}</dd>
        <dt>admin</dt><dd>{p.isAdmin ? <span className="adm-vio">yes</span> : 'no'}</dd>
        <dt>joined</dt><dd>{fmt(p.createdAt)}</dd>
        <dt>syncs/mo</dt><dd>{p.syncCountThisMonth ?? 0}{(p.preventedSyncCount ?? 0) > 0 ? ` (+${p.preventedSyncCount} blocked)` : ''}</dd>
        <dt>activities</dt><dd>{detail.activityCount ?? 0}</dd>
        <dt>runs</dt><dd>{detail.pipelineRunCount ?? 0}</dd>
        <dt>streak</dt><dd>{p.currentStreakDays ?? 0}d (max {p.longestStreakDays ?? 0}d)</dd>
      </dl>

      {/* Access & role actions */}
      <div className="adm__sec">
        <div className="adm__sechead">access &amp; role</div>
        <div className="adm__actions">
          <button className="adm__btn" disabled={busy} onClick={() => run(p.accessEnabled ? 'Access revoked' : 'Access enabled', () => updateUser({ accessEnabled: !p.accessEnabled }))}>
            {p.accessEnabled ? 'Revoke access' : 'Enable access'}
          </button>
          <button className="adm__btn" disabled={busy} onClick={() => setConfirm({
            title: isAthlete ? 'Downgrade to Hobbyist?' : 'Upgrade to Athlete?',
            message: `Change ${p.email || p.userId} tier.`, confirmLabel: 'Change tier',
            onConfirm: () => run('Tier updated', () => updateUser({ tier: isAthlete ? 'USER_TIER_HOBBYIST' : 'USER_TIER_ATHLETE' })),
          })}>{isAthlete ? 'Set Hobbyist' : 'Set Athlete'}</button>
          <button className="adm__btn" disabled={busy} onClick={() => setConfirm({
            title: p.isAdmin ? 'Revoke admin?' : 'Grant admin?', message: `${p.email || p.userId}`,
            danger: !p.isAdmin, confirmLabel: p.isAdmin ? 'Revoke admin' : 'Grant admin',
            onConfirm: () => run('Admin role updated', () => updateUser({ isAdmin: !p.isAdmin })),
          })}>{p.isAdmin ? 'Revoke admin' : 'Grant admin'}</button>
          <button className="adm__btn" disabled={busy} onClick={() => run('Password reset sent', sendPasswordReset)}>Password reset</button>
          <button className="adm__btn" disabled={busy} onClick={() => run('Verification sent', sendVerificationEmail)}>Verify email</button>
        </div>
      </div>

      {/* Integrations */}
      <div className="adm__sec">
        <div className="adm__sechead"><span>integrations</span><span>{integrations.length}</span></div>
        {integrations.length === 0 ? <div className="adm__empty">none connected</div> : (
          <table className="adm__table">
            <thead><tr><th>provider</th><th>state</th><th>token</th><th>last used</th><th></th></tr></thead>
            <tbody>
              {integrations.map((i) => (
                <tr key={i.provider} style={{ cursor: 'default' }}>
                  <td>{cap(i.provider)}</td>
                  <td className={i.enabled ? 'adm-ok' : 'adm-dim'}>{i.enabled ? 'on' : 'off'}</td>
                  <td className={healthClass(i.tokenHealth)}>{i.tokenHealth ?? 'n/a'}</td>
                  <td className="adm-dim">{fmt(i.lastUsedAt)}</td>
                  <td>
                    <button className="adm__btn" disabled={busy} onClick={() => run(i.enabled ? 'Disabled' : 'Enabled', () => setIntegrationEnabled(i.provider ?? '', !i.enabled))}>{i.enabled ? 'off' : 'on'}</button>{' '}
                    <button className="adm__btn adm__btn--danger" disabled={busy} onClick={() => setConfirm({
                      title: `Disconnect ${cap(i.provider)}?`, message: 'Removes stored tokens.', danger: true, confirmLabel: 'Disconnect',
                      onConfirm: () => run('Disconnected', () => deleteIntegration(i.provider ?? '')),
                    })}>del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pipelines */}
      <div className="adm__sec">
        <div className="adm__sechead"><span>pipelines</span><span>{pipelines.length}</span></div>
        {pipelines.length === 0 ? <div className="adm__empty">none configured</div> : (
          <table className="adm__table">
            <thead><tr><th>name</th><th>state</th><th>source → dest</th><th></th></tr></thead>
            <tbody>
              {pipelines.map((pl) => (
                <tr key={pl.id} onClick={() => pl.id && setInspectPipelineId(pl.id)}>
                  <td>{pl.name || 'Untitled'}</td>
                  <td className={pl.enabled ? 'adm-ok' : 'adm-dim'}>{pl.enabled ? 'on' : 'off'}</td>
                  <td className="adm-dim">{pl.source || '—'} → {(pl.destinations ?? []).join(', ') || '—'}</td>
                  <td className="adm-ok">inspect →</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pending inputs */}
      {pending.length > 0 && (
        <div className="adm__sec">
          <div className="adm__sechead"><span>pending inputs</span><span>{pending.length}</span></div>
          {pending.map((pi) => (
            <div key={pi.id} className="adm__rowline">
              <span>{pi.enricherProviderId || 'enricher'} · {pi.activityId} · {pi.status}</span>
              <span className="adm-dim">{fmt(pi.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Billing */}
      <div className="adm__sec">
        <div className="adm__sechead">billing</div>
        <dl className="adm__kv">
          <dt>status</dt><dd>{sub?.status || 'none'}</dd>
          <dt>eff. tier</dt><dd>{(detail.billing?.effectiveTier ?? 'USER_TIER_HOBBYIST').replace('USER_TIER_', '')}</dd>
          <dt>stripe</dt><dd>{sub?.stripeCustomerId || '—'}</dd>
          <dt>period end</dt><dd>{fmt(sub?.currentPeriodEnd)}</dd>
          <dt>cancel@end</dt><dd>{sub?.cancelAtPeriodEnd ? 'yes' : 'no'}</dd>
        </dl>
        <div className="adm__actions">
          {sub?.stripeCustomerId && <button className="adm__btn" disabled={busy} onClick={() => run('Opened portal', openBillingPortal)}>Stripe portal</button>}
          <button className="adm__btn" disabled={busy} onClick={() => setConfirm({ title: 'Start trial?', message: `${p.email || p.userId}`, confirmLabel: 'Start trial', onConfirm: () => run('Trial started', startTrial) })}>Start trial</button>
          <button className="adm__btn adm__btn--danger" disabled={busy} onClick={() => setConfirm({ title: 'Cancel subscription?', message: `${p.email || p.userId}`, danger: true, confirmLabel: 'Cancel sub', onConfirm: () => run('Subscription cancelled', cancelSubscription) })}>Cancel sub</button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="adm__sec">
        <div className="adm__sechead adm-bad">danger · logged &amp; audited</div>
        <div className="adm__actions">
          {(['integrations', 'pipelines', 'activities', 'pending-inputs'] as const).map((dt) => (
            <button key={dt} className="adm__btn adm__btn--danger" disabled={busy} onClick={() => setConfirm({
              title: `Delete all ${dt.replace('-', ' ')}?`, message: 'Cannot be undone.', danger: true, confirmLabel: 'Delete',
              onConfirm: () => run(`Deleted ${dt}`, () => deleteUserData(dt)),
            })}>del {dt.replace('-', ' ')}</button>
          ))}
        </div>
      </div>

      {inspectPipelineId && (
        <AdminPipelineInspector
          pipelineId={inspectPipelineId}
          onClose={() => setInspectPipelineId(null)}
          getPipeline={getPipeline}
          updatePipeline={updatePipeline}
          deletePipeline={deletePipeline}
        />
      )}
      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel}
        isDestructive={confirm?.danger}
        onConfirm={async () => { const c = confirm; setConfirm(null); if (c) await c.onConfirm(); }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};
