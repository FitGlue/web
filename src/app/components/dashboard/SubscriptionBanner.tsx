import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { getEffectiveTier, TIER_ATHLETE } from '../../utils/tier';
import { Stack } from '../library/layout';
import {
  Card,
  CardSkeleton,
  Badge,
  Button,
  Paragraph,
  SkeletonLoading
} from '../library/ui';

/**
 * SubscriptionBanner - Dashboard banner showing subscription tier and usage
 */
export const SubscriptionBanner: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  // Check if hobbyist is at or over the monthly sync limit
  const isAtLimit = user && getEffectiveTier(user) !== TIER_ATHLETE && (user.syncCountThisMonth || 0) >= 25;

  return (
    <SkeletonLoading
      loading={loading || !user}
      skeleton={<CardSkeleton variant="subscription" />}
    >
      {user && (
        <Card variant={getEffectiveTier(user) === TIER_ATHLETE ? 'premium' : isAtLimit ? 'elevated' : 'default'}>
          <Stack direction="horizontal" align="center" justify="between">
            <Stack direction="horizontal" gap="sm" align="center">
              <Badge variant={getEffectiveTier(user) === TIER_ATHLETE ? 'light' : isAtLimit ? 'warning' : 'default'}>
                {getEffectiveTier(user) === TIER_ATHLETE ? '✨ ATHLETE' : isAtLimit ? '⚠️ HOBBYIST' : 'HOBBYIST'}
              </Badge>
              {isAtLimit && (
                <Paragraph inline size="sm" muted>
                  Monthly limit reached
                </Paragraph>
              )}
            </Stack>
            <Stack direction="horizontal" align="center" gap="md">
              {getEffectiveTier(user) === TIER_ATHLETE ? (
                <>
                  {user.trialEndsAt && (() => {
                    const daysLeft = Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return daysLeft > 0 ? (
                      <Paragraph inline>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</Paragraph>
                    ) : null;
                  })()}
                  <Paragraph inline nowrap>Unlimited syncs</Paragraph>
                  <Button size="small" variant="secondary-light" onClick={() => navigate('/settings/subscription')}>Manage →</Button>
                </>
              ) : (
                <>
                  <Paragraph inline>{user.syncCountThisMonth || 0}/25 syncs</Paragraph>
                  <Button size="small" variant="primary" onClick={() => navigate('/settings/subscription')}>
                    {isAtLimit ? 'Upgrade Now →' : 'Upgrade →'}
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Card>
      )}
    </SkeletonLoading>
  );
};

export default SubscriptionBanner;
