import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { Stack, Grid } from '../components/library/layout';
import {
  Card,
  Heading,
  Text,
  Code,
  Badge,
  Button,
  KeyValue,
  EmptyState,
  LoadingState,
  ConfirmDialog,
  useToast,
} from '../components/library/ui';
import { Link } from '../components/library/navigation';
import { useAdminUserDetail } from '../hooks/admin';
import { AdminIntegration } from '../state/adminState';
import { logger } from '../../shared/logger';
import './AdminUserDetailPage.css';

type ConfirmState = {
  title: string;
  message: string;
  danger?: boolean;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
} | null;

const formatDate = (s?: string): string => (s ? new Date(s).toLocaleString() : '—');
const titleCase = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const tokenHealthVariant = (health?: string): 'success' | 'error' | 'default' =>
  health === 'valid' ? 'success' : health === 'expired' ? 'error' : 'default';

/**
 * AdminUserDetailPage — the 360° support view of a single user. Lets an admin
 * inspect and fix anything about an account: access/tier/role, integrations,
 * pipelines, billing, pending inputs, and a danger zone for data deletion.
 */
const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const {
    detail,
    loading,
    error,
    reload,
    updateUser,
    sendPasswordReset,
    sendVerificationEmail,
    setIntegrationEnabled,
    deleteIntegration,
    deleteUserData,
  } = useAdminUserDetail(id);

  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [busy, setBusy] = useState(false);

  // run wraps an admin action with busy state + success/error toasts.
  const run = useCallback(async (label: string, fn: () => Promise<void> | void) => {
    setBusy(true);
    try {
      await fn();
      toast.success('Done', label);
    } catch (err) {
      logger.error(`Admin action failed: ${label}`, err);
      toast.error('Action failed', label);
    } finally {
      setBusy(false);
    }
  }, [toast]);

  const askConfirm = (state: ConfirmState) => setConfirm(state);

  if (loading && !detail) {
    return (
      <PageLayout title="User" backTo="/admin" backLabel="Admin">
        <LoadingState message="Loading user…" />
      </PageLayout>
    );
  }

  if (error || !detail || !detail.profile) {
    return (
      <PageLayout title="User" backTo="/admin" backLabel="Admin">
        <Card>
          <EmptyState
            title="Could not load user"
            description={error ?? 'No profile found for this user.'}
            actionLabel="Retry"
            onAction={reload}
          />
        </Card>
      </PageLayout>
    );
  }

  const p = detail.profile;
  const isAthlete = p.tier === 'USER_TIER_ATHLETE';
  const integrations = detail.integrations ?? [];
  const pipelines = detail.pipelines ?? [];
  const pendingInputs = detail.pendingInputs ?? [];

  return (
    <PageLayout title={p.displayName || p.email || 'User'} backTo="/admin" backLabel="Admin" fullWidth>
      <Stack gap="lg">
        {/* ---- Identity header ---- */}
        <Card>
          <Stack gap="md">
            <Stack direction="horizontal" gap="sm" align="center" wrap>
              <Code>{p.userId}</Code>
              {p.isAdmin && <Badge variant="premium" size="sm">Admin</Badge>}
              <Badge variant={p.accessEnabled ? 'success' : 'warning'} size="sm">
                {p.accessEnabled ? 'Active' : 'Waitlist'}
              </Badge>
              <Badge variant={isAthlete ? 'premium' : 'default'} size="sm">
                {isAthlete ? 'Athlete' : 'Hobbyist'}
              </Badge>
              {detail.billing?.isTrial && <Badge variant="info" size="sm">Trial</Badge>}
            </Stack>
            <Grid cols={3} gap="md">
              <KeyValue label="Email" value={p.email || '—'} />
              <KeyValue label="Display name" value={p.displayName || '—'} />
              <KeyValue label="Joined" value={formatDate(p.createdAt)} />
              <KeyValue label="Syncs this month" value={String(p.syncCountThisMonth ?? 0)} />
              <KeyValue label="Activities" value={String(detail.activityCount ?? 0)} />
              <KeyValue label="Pipeline runs" value={String(detail.pipelineRunCount ?? 0)} />
              <KeyValue label="Current streak" value={`${p.currentStreakDays ?? 0} days`} />
              <KeyValue label="Longest streak" value={`${p.longestStreakDays ?? 0} days`} />
              <KeyValue label="Trial ends" value={formatDate(p.trialEndsAt)} />
            </Grid>
          </Stack>
        </Card>

        {/* ---- Access & Role ---- */}
        <Card>
          <Stack gap="md">
            <Heading level={4}>Access &amp; Role</Heading>
            <Stack direction="horizontal" gap="sm" wrap>
              <Button
                variant={p.accessEnabled ? 'secondary' : 'primary'}
                size="small"
                disabled={busy}
                onClick={() => run(
                  p.accessEnabled ? 'Access revoked' : 'Access enabled',
                  () => updateUser({ accessEnabled: !p.accessEnabled }),
                )}
              >
                {p.accessEnabled ? 'Revoke access' : 'Enable access'}
              </Button>

              <Button
                variant="secondary"
                size="small"
                disabled={busy}
                onClick={() => askConfirm({
                  title: isAthlete ? 'Downgrade to Hobbyist?' : 'Upgrade to Athlete?',
                  message: `Change ${p.email || p.userId}'s tier to ${isAthlete ? 'Hobbyist' : 'Athlete'}.`,
                  confirmLabel: 'Change tier',
                  onConfirm: () => run('Tier updated', () => updateUser({
                    tier: isAthlete ? 'USER_TIER_HOBBYIST' : 'USER_TIER_ATHLETE',
                  })),
                })}
              >
                {isAthlete ? 'Set Hobbyist' : 'Set Athlete'}
              </Button>

              <Button
                variant="secondary"
                size="small"
                disabled={busy}
                onClick={() => askConfirm({
                  title: p.isAdmin ? 'Revoke admin?' : 'Grant admin?',
                  message: p.isAdmin
                    ? `Remove platform admin rights from ${p.email || p.userId}.`
                    : `Grant full platform admin rights to ${p.email || p.userId}.`,
                  danger: !p.isAdmin,
                  confirmLabel: p.isAdmin ? 'Revoke admin' : 'Grant admin',
                  onConfirm: () => run('Admin role updated', () => updateUser({ isAdmin: !p.isAdmin })),
                })}
              >
                {p.isAdmin ? 'Revoke admin' : 'Grant admin'}
              </Button>

              <Button
                variant="ghost"
                size="small"
                disabled={busy}
                onClick={() => run('Password reset email sent', sendPasswordReset)}
              >
                Send password reset
              </Button>
              <Button
                variant="ghost"
                size="small"
                disabled={busy}
                onClick={() => run('Verification email sent', sendVerificationEmail)}
              >
                Send verification email
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* ---- Integrations ---- */}
        <Card>
          <Stack gap="md">
            <Heading level={4}>Integrations ({integrations.length})</Heading>
            {integrations.length === 0 ? (
              <Text variant="muted">No connected integrations.</Text>
            ) : (
              <Stack gap="sm">
                {integrations.map((integ: AdminIntegration) => (
                  <div key={integ.provider} className="admin-user-row">
                    <Stack direction="horizontal" gap="sm" align="center" wrap>
                      <Text variant="body"><strong>{titleCase(integ.provider ?? '')}</strong></Text>
                      <Badge variant={integ.enabled ? 'success' : 'default'} size="sm">
                        {integ.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Badge variant={tokenHealthVariant(integ.tokenHealth)} size="sm">
                        token: {integ.tokenHealth ?? 'n/a'}
                      </Badge>
                      <Text variant="small">last used {formatDate(integ.lastUsedAt)}</Text>
                    </Stack>
                    <Stack direction="horizontal" gap="xs">
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={busy}
                        onClick={() => run(
                          integ.enabled ? 'Integration disabled' : 'Integration enabled',
                          () => setIntegrationEnabled(integ.provider ?? '', !integ.enabled),
                        )}
                      >
                        {integ.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        disabled={busy}
                        onClick={() => askConfirm({
                          title: `Disconnect ${titleCase(integ.provider ?? '')}?`,
                          message: 'This removes the stored tokens for this provider. The user will need to reconnect.',
                          danger: true,
                          confirmLabel: 'Disconnect',
                          onConfirm: () => run('Integration disconnected', () => deleteIntegration(integ.provider ?? '')),
                        })}
                      >
                        Disconnect
                      </Button>
                    </Stack>
                  </div>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>

        {/* ---- Pipelines ---- */}
        <Card>
          <Stack gap="md">
            <Heading level={4}>Pipelines ({pipelines.length})</Heading>
            {pipelines.length === 0 ? (
              <Text variant="muted">No pipelines configured.</Text>
            ) : (
              <Stack gap="sm">
                {pipelines.map((pl) => (
                  <div key={pl.id} className="admin-user-row">
                    <Stack gap="xs">
                      <Stack direction="horizontal" gap="sm" align="center">
                        <Text variant="body"><strong>{pl.name || 'Untitled pipeline'}</strong></Text>
                        <Badge variant={pl.enabled ? 'success' : 'default'} size="sm">
                          {pl.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </Stack>
                      <Text variant="small">
                        {pl.source || '—'} → {(pl.destinations ?? []).join(', ') || '—'}
                      </Text>
                    </Stack>
                    <Code>{pl.id}</Code>
                  </div>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>

        {/* ---- Pending inputs ---- */}
        {pendingInputs.length > 0 && (
          <Card>
            <Stack gap="md">
              <Heading level={4}>Pending inputs ({pendingInputs.length})</Heading>
              <Stack gap="sm">
                {pendingInputs.map((pi) => (
                  <div key={pi.id} className="admin-user-row">
                    <Stack gap="xs">
                      <Text variant="body">{pi.enricherProviderId || 'enricher'}</Text>
                      <Text variant="small">activity {pi.activityId} · {pi.status}</Text>
                    </Stack>
                    <Text variant="small">{formatDate(pi.createdAt)}</Text>
                  </div>
                ))}
              </Stack>
            </Stack>
          </Card>
        )}

        {/* ---- Runs link ---- */}
        <Card>
          <Stack direction="horizontal" justify="between" align="center">
            <Stack gap="xs">
              <Heading level={4}>Pipeline runs</Heading>
              <Text variant="muted">{detail.pipelineRunCount ?? 0} runs recorded</Text>
            </Stack>
            <Link to={`/admin?tab=pipeline-runs&userId=${p.userId}`} variant="primary">
              View runs →
            </Link>
          </Stack>
        </Card>

        {/* ---- Danger zone ---- */}
        <div className="admin-user-danger">
          <div className="admin-user-danger__label">Danger Zone · Logged &amp; Audited</div>
          <Stack direction="horizontal" gap="sm" wrap>
            {(['integrations', 'pipelines', 'activities', 'pending-inputs'] as const).map((dt) => (
              <Button
                key={dt}
                variant="ghost"
                size="small"
                disabled={busy}
                onClick={() => askConfirm({
                  title: `Delete all ${dt.replace('-', ' ')}?`,
                  message: `Permanently delete this user's ${dt.replace('-', ' ')}. This cannot be undone.`,
                  danger: true,
                  confirmLabel: 'Delete',
                  onConfirm: () => run(`Deleted ${dt}`, () => deleteUserData(dt)),
                })}
              >
                Delete {dt.replace('-', ' ')}
              </Button>
            ))}
          </Stack>
        </div>
      </Stack>

      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel}
        isDestructive={confirm?.danger}
        onConfirm={async () => {
          const c = confirm;
          setConfirm(null);
          if (c) await c.onConfirm();
        }}
        onCancel={() => setConfirm(null)}
      />
    </PageLayout>
  );
};

export default AdminUserDetailPage;
