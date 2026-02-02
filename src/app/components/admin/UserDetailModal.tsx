import React from 'react';
import { useAtom } from 'jotai';
import { Stack, Grid } from '../library/layout';
import { Modal, Button, Badge, Text, Heading, LoadingState, EmptyState, useToast, KeyValue, Paragraph } from '../library/ui';
import { Link } from '../library/navigation';
import { useAdminUsers } from '../../hooks/admin';
import { selectedUserIdAtom } from '../../state/adminState';
import { UserTier } from '../../../types/pb/user';

/**
 * UserDetailModal displays detailed information about a user
 */
export const UserDetailModal: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useAtom(selectedUserIdAtom);
  const toast = useToast();
  const { 
    selectedUser, 
    selectedUserLoading,
    updateUser,
    deleteUserData,
    clearSelectedUser,
  } = useAdminUsers();

  const handleClose = () => {
    setSelectedUserId(null);
    clearSelectedUser();
  };

  const handleUpdateUser = async (userId: string, updates: Record<string, unknown>, successMsg: string) => {
    try {
      await updateUser(userId, updates as never);
      toast.success('User Updated', successMsg);
    } catch (err) {
      toast.error('Update Failed', 'Failed to update user');
    }
  };

  const handleDeleteData = async (userId: string, dataType: 'integrations' | 'pipelines' | 'activities' | 'pending-inputs', subId?: string, name?: string) => {
    try {
      await deleteUserData(userId, dataType, subId);
      toast.success('Data Deleted', `Successfully deleted ${name || dataType}`);
    } catch (err) {
      toast.error('Delete Failed', `Failed to delete ${dataType}`);
    }
  };

  const isOpen = !!selectedUserId;

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="User Details"
      size="lg"
    >
      {selectedUserLoading ? (
        <LoadingState message="Loading user details..." />
      ) : !selectedUser ? (
        <EmptyState title="User not found" />
      ) : (
        <Stack gap="lg">
          {/* Overview Section */}
          <Stack gap="sm">
            <Heading level={4}>Overview</Heading>
            <Grid cols={2}>
              <KeyValue label="User ID" value={selectedUser.userId} format="code" />
              {selectedUser.email && <KeyValue label="Email" value={selectedUser.email} />}
              {selectedUser.displayName && <KeyValue label="Name" value={selectedUser.displayName} />}
              <KeyValue label="Created" value={selectedUser.createdAt} format="datetime" />
              <Stack direction="horizontal" gap="sm" align="center">
                <Paragraph><strong>Tier:</strong></Paragraph>
                <Badge variant={selectedUser.tier === UserTier.USER_TIER_ATHLETE ? 'premium' : 'default'}>
                  {selectedUser.tier === UserTier.USER_TIER_ATHLETE ? 'Athlete' : 'Hobbyist'}
                </Badge>
              </Stack>
              <Stack direction="horizontal" gap="sm" align="center">
                <Paragraph><strong>Access:</strong></Paragraph>
                <Badge variant={selectedUser.accessEnabled ? 'success' : 'warning'}>
                  {selectedUser.accessEnabled ? 'Enabled' : 'Waitlisted'}
                </Badge>
              </Stack>
              <KeyValue label="Admin" value={selectedUser.isAdmin ? 'Yes' : 'No'} />
              <KeyValue label="Trial Ends" value={selectedUser.trialEndsAt} format="date" />
              <Stack direction="horizontal" gap="sm" align="center">
                <Paragraph><strong>Syncs:</strong> {selectedUser.syncCountThisMonth}</Paragraph>
                <Button 
                  size="small" 
                  variant="text" 
                  onClick={() => handleUpdateUser(selectedUser.userId, { syncCountThisMonth: 0 }, 'Sync count reset to 0')}
                >
                  Reset
                </Button>
              </Stack>
              <KeyValue label="Prevented" value={selectedUser.preventedSyncCount} />
            </Grid>
            <Stack direction="horizontal" gap="sm">
              <Button 
                size="small"
                onClick={() => handleUpdateUser(selectedUser.userId, { 
                  tier: selectedUser.tier === UserTier.USER_TIER_ATHLETE 
                    ? UserTier.USER_TIER_HOBBYIST 
                    : UserTier.USER_TIER_ATHLETE 
                }, `Tier changed to ${selectedUser.tier === UserTier.USER_TIER_ATHLETE ? 'Hobbyist' : 'Athlete'}`)}
              >
                Toggle Tier
              </Button>
              <Button 
                size="small" 
                variant="secondary"
                onClick={() => handleUpdateUser(selectedUser.userId, { 
                  trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
                }, 'Trial extended by 30 days')}
              >
                Extend Trial 30d
              </Button>
            </Stack>
          </Stack>

          {/* Integrations Section */}
          <Stack gap="sm">
            <Heading level={4}>Integrations ({Object.keys(selectedUser.integrations).length})</Heading>
            {Object.keys(selectedUser.integrations).length > 0 ? (
              <Stack gap="sm">
                {Object.entries(selectedUser.integrations).map(([provider]) => (
                  <Stack key={provider} direction="horizontal" justify="between" align="center">
                    <Paragraph>{provider}</Paragraph>
                    <Button 
                      size="small" 
                      variant="text"
                      onClick={() => {
                        if (confirm(`Remove ${provider} integration?`)) {
                          handleDeleteData(selectedUser.userId, 'integrations', provider, `${provider} integration`);
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Text variant="muted">No integrations</Text>
            )}
          </Stack>

          {/* Pipelines Section */}
          <Stack gap="sm">
            <Heading level={4}>Pipelines ({selectedUser.pipelines?.length || 0})</Heading>
            {selectedUser.pipelines?.length > 0 ? (
              <Stack gap="sm">
                {selectedUser.pipelines.map((p) => (
                  <Stack key={p.id} direction="horizontal" justify="between" align="center">
                    <Stack gap="xs">
                      <Paragraph><strong>{p.name}</strong></Paragraph>
                      <Text variant="small">
                        {p.source} → [{p.destinations.join(', ')}]
                      </Text>
                    </Stack>
                    <Button 
                      size="small" 
                      variant="text"
                      onClick={() => {
                        if (confirm(`Remove pipeline "${p.name}"?`)) {
                          handleDeleteData(selectedUser.userId, 'pipelines', p.id, `pipeline "${p.name}"`);
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Text variant="muted">No pipelines</Text>
            )}
          </Stack>

          {/* Data Management Section */}
          <Stack gap="sm">
            <Heading level={4}>Data Management</Heading>
            <Stack gap="md">
              <Stack direction="horizontal" justify="between" align="center">
                <Paragraph>Synchronized Activities: {selectedUser.activityCount}</Paragraph>
                <Button 
                  size="small" 
                  variant="text"
                  disabled={selectedUser.activityCount === 0}
                  onClick={() => {
                    if (confirm('Delete ALL synchronized activities? This cannot be undone.')) {
                      handleDeleteData(selectedUser.userId, 'activities', undefined, 'all synchronized activities');
                    }
                  }}
                >
                  Delete All
                </Button>
              </Stack>
              <Stack direction="horizontal" justify="between" align="center">
                <Paragraph>Pending Inputs: {selectedUser.pendingInputCount}</Paragraph>
                <Button 
                  size="small" 
                  variant="text"
                  disabled={selectedUser.pendingInputCount === 0}
                  onClick={() => {
                    if (confirm('Delete ALL pending inputs? This cannot be undone.')) {
                      handleDeleteData(selectedUser.userId, 'pending-inputs', undefined, 'all pending inputs');
                    }
                  }}
                >
                  Delete All
                </Button>
              </Stack>
            </Stack>
          </Stack>

          {/* Billing Section */}
          {selectedUser.stripeCustomerId && (
            <Stack gap="sm">
              <Heading level={4}>Billing</Heading>
              <Paragraph>
                <strong>Stripe Customer: </strong>
                <Link 
                  to={`https://dashboard.stripe.com/customers/${selectedUser.stripeCustomerId}`}
                  variant="primary"
                  external
                >
                  {selectedUser.stripeCustomerId}
                </Link>
              </Paragraph>
            </Stack>
          )}
        </Stack>
      )}
    </Modal>
  );
};
