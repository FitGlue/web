import React, { useEffect } from 'react';
import { Stack } from '../library/layout';
import { Card, Text, Heading, EmptyState, Code } from '../library/ui';
import { Link } from '../library/navigation';
import { 
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty,
} from '../library/ui';
import { useAdminUsers } from '../../hooks/admin';
import { UserTier } from '../../../types/pb/user';

/**
 * AdminBilling displays billing-related user information
 */
export const AdminBilling: React.FC = () => {
  const { users, loading, error, fetchUsers } = useAdminUsers();

  // Fetch users on mount
  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Filter to athlete users or users with Stripe
  const billingUsers = users.filter(
    u => u.tier === UserTier.USER_TIER_ATHLETE || u.stripeCustomerId
  );

  if (error) {
    return (
      <Card>
        <EmptyState 
          title="Error loading billing data" 
          description={error}
        />
      </Card>
    );
  }

  return (
    <Stack gap="md">
      <Card>
        <Heading level={4}>Athlete Users with Stripe</Heading>
        
        <Stack gap="md">
          <Table loading={loading}>
            <TableHead>
              <TableRow hoverable={false}>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Stripe Customer</TableHeaderCell>
                <TableHeaderCell>Trial Ends</TableHeaderCell>
                <TableHeaderCell>Syncs</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billingUsers.length === 0 && !loading && (
                <TableEmpty colSpan={4}>
                  <EmptyState 
                    title="No billing users" 
                    description="No users with billing information found."
                  />
                </TableEmpty>
              )}
              {billingUsers.map((user) => (
                <TableRow 
                  key={user.userId}
                  onClick={user.stripeCustomerId 
                    ? () => window.open(`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`, '_blank')
                    : undefined
                  }
                >
                  <TableCell>
                    <Code>{user.userId.slice(0, 8)}...</Code>
                  </TableCell>
                  <TableCell>
                    {user.stripeCustomerId ? (
                      <Link 
                        to={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                        variant="primary"
                        external
                      >
                        {user.stripeCustomerId.slice(0, 12)}...
                      </Link>
                    ) : (
                      <Text variant="muted">-</Text>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.trialEndsAt ? (
                      <Text variant="body">{new Date(user.trialEndsAt).toLocaleDateString()}</Text>
                    ) : (
                      <Text variant="muted">-</Text>
                    )}
                  </TableCell>
                  <TableCell><Text variant="body">{user.syncCountThisMonth}</Text></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Card>
    </Stack>
  );
};
