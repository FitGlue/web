import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { getEffectiveTier, TIER_ATHLETE, HOBBYIST_TIER_LIMITS } from '../../utils/tier';
import { CardSkeleton, SkeletonLoading, Badge, Button } from '../library/ui';
import '../library/ui/CardSkeleton.css';

/**
 * SubscriptionBanner — Brutal × Aurora reskin
 * Athlete: aurora gradient band. Hobbyist: ink-2 with usage + upgrade CTA.
 */
export const SubscriptionBanner: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading } = useUser();

    const isAtLimit = user && getEffectiveTier(user) !== TIER_ATHLETE &&
        (user.syncCountThisMonth || 0) >= HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH;

    const isAthlete = user && getEffectiveTier(user) === TIER_ATHLETE;

    // Trial days remaining
    const trialDaysLeft = user?.trialEndsAt
        ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <SkeletonLoading
            loading={loading || !user}
            skeleton={<CardSkeleton variant="subscription" />}
        >
            {user && (
                <div
                    className={isAthlete ? 'fg-band' : 'fg-band fg-band--ink'}
                    style={{ gap: '1rem' }}
                >
                    {/* Left: tier badge + label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1 }}>
                        <Badge variant={isAthlete ? 'default' : isAtLimit ? 'error' : 'default'}>
                            {isAthlete ? '✦ ATHLETE' : isAtLimit ? '⚠ HOBBYIST' : 'HOBBYIST'}
                        </Badge>
                        {isAtLimit && !isAthlete && (
                            <span className="fg-band__right" style={{ opacity: 1 }}>Monthly limit reached</span>
                        )}
                        {isAthlete && trialDaysLeft && trialDaysLeft > 0 && (
                            <span className="fg-band__right" style={{ opacity: 1 }}>
                                {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in trial
                            </span>
                        )}
                    </div>

                    {/* Right: usage or actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
                        {isAthlete ? (
                            <>
                                <span className="fg-band__right" style={{ opacity: 1 }}>Unlimited syncs</span>
                                <Button
                                    size="sm"
                                    variant="ink"
                                    onClick={() => navigate('/settings/subscription')}
                                >
                                    Manage →
                                </Button>
                            </>
                        ) : (
                            <>
                                <span className="fg-band__right" style={{ opacity: 1 }}>
                                    {user.syncCountThisMonth || 0}/{HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH} syncs
                                </span>
                                <Button
                                    size="sm"
                                    onClick={() => navigate('/settings/subscription')}
                                >
                                    {isAtLimit ? 'Upgrade Now →' : 'Upgrade →'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </SkeletonLoading>
    );
};

export default SubscriptionBanner;
