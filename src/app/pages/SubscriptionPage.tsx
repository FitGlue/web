import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Paragraph, CardSkeleton } from '../components/library/ui';
import { FeatureItem, Stack, Grid } from '../components/library/layout';
import { client } from '../../shared/api/client';
import { useUser } from '../hooks/useUser';
import { getEffectiveTier, TIER_ATHLETE } from '../utils/tier';
import { ATHLETE_BENEFITS, PLAN_FEATURES, DOWNGRADE_ITEMS } from '../utils/tierBenefits';
import '../components/library/ui/CardSkeleton.css';
import './SubscriptionPage.css';

const SubscriptionPage: React.FC = () => {
    const { user, loading, refresh } = useUser();
    const [searchParams] = useSearchParams();
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'cancelled'; message: string } | null>(null);

    useEffect(() => {
        const billingStatus = searchParams.get('billing');
        if (billingStatus === 'success') {
            setStatus({ type: 'success', message: 'Success! Your account has been upgraded to Athlete.' });
            refresh();
        } else if (billingStatus === 'cancelled') {
            setStatus({ type: 'cancelled', message: 'Checkout cancelled. No changes were made.' });
        } else if (billingStatus === 'error') {
            setStatus({ type: 'error', message: 'There was an error processing your payment. Please try again.' });
        }
    }, [searchParams, refresh]);

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            const { data } = await client.POST('/billing/checkout', {
                body: {
                    successUrl: `${window.location.origin}/settings/subscription?billing=success`,
                    cancelUrl: `${window.location.origin}/settings/subscription?billing=cancelled`,
                },
            });
            window.location.href = (data as Record<string, string>).sessionUrl;
        } catch (error) {
            console.error('Failed to start checkout:', error);
            setStatus({ type: 'error', message: 'Failed to start checkout process. Please try again later.' });
            setProcessing(false);
        }
    };

    const handleOpenPortal = async () => {
        setProcessing(true);
        try {
            const { data } = await client.POST('/billing/portal' as never);
            const { url } = data as unknown as { url: string };
            window.location.href = url;
        } catch (error) {
            console.error('Failed to open billing portal:', error);
            setStatus({ type: 'error', message: 'Failed to open billing portal. Please try again later.' });
            setProcessing(false);
        }
    };

    if (loading && !user) {
        return (
            <div>
                <div className="page-head">
                    <div>
                        <div className="page-head__eyebrow">SETTINGS / SUBSCRIPTION</div>
                        <h1>Subscription</h1>
                    </div>
                </div>
                <div style={{ padding: '2rem' }}>
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                </div>
            </div>
        );
    }

    const isAthlete = user ? getEffectiveTier(user) === TIER_ATHLETE : false;
    const trialDaysRemaining = user?.trialEndsAt
        ? Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const isOnTrial = isAthlete && trialDaysRemaining > 0;
    const trialExpired = user?.trialEndsAt && trialDaysRemaining <= 0 && !(user as { stripeCustomerId?: string })?.stripeCustomerId && !user?.isAdmin;
    const countdownProgress = Math.max(0, Math.min(100, (trialDaysRemaining / 30) * 100));

    // ATHLETE VIEW
    if (isAthlete) {
        return (
            <div>
                <div className="page-head">
                    <div>
                        <div className="page-head__eyebrow">SETTINGS / SUBSCRIPTION</div>
                        <h1>Your Subscription</h1>
                    </div>
                    <div className="page-head__actions">
                        <a href="/app/settings/account" className="fg-button fg-button--ghost fg-button--sm">← ACCOUNT</a>
                    </div>
                </div>

                {/* Plan banner */}
                <div className="stx-plan">
                    <span className="stx-plan__icon">✦</span>
                    <div>
                        <div className="stx-plan__title">ATHLETE · UNLIMITED SYNCS</div>
                        {user?.isAdmin ? (
                            <div className="stx-plan__meta">ADMIN ACCESS · ALL FEATURES</div>
                        ) : (
                            <div className="stx-plan__meta">£5/MONTH · ACTIVE</div>
                        )}
                    </div>
                </div>

                <div style={{ padding: '0 2rem 2rem' }}>
                    {status && (
                        <div style={{ padding: '1rem 1.25rem', marginTop: '1.5rem', background: status.type === 'success' ? 'rgba(163,255,61,0.08)' : status.type === 'error' ? 'rgba(255,93,108,0.08)' : 'var(--fg-ink-2)', border: `1.5px solid ${status.type === 'success' ? 'var(--fg-green)' : status.type === 'error' ? 'var(--fg-rose)' : 'var(--fg-hairline-color)'}` }}>
                            <span style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem' }}>{status.message}</span>
                        </div>
                    )}

                    {/* Athlete benefits */}
                    <div className="fg-band fg-band--ink" style={{ marginTop: '1.5rem' }}>
                        <span className="fg-band__label">YOUR ATHLETE BENEFITS</span>
                    </div>

                    <Grid cols={2} gap="md">
                        {ATHLETE_BENEFITS.map((feature) => (
                            <Card key={feature.title} className="subscription-feature-card">
                                <FeatureItem
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.desc}
                                />
                            </Card>
                        ))}
                    </Grid>

                    {/* Trial countdown */}
                    {isOnTrial && (
                        <div style={{ marginTop: '1.5rem', padding: '2rem', background: 'var(--fg-ink-2)', border: 'var(--fg-rule-thin)' }}>
                            <Stack className="subscription-countdown" align="center" gap="md">
                                <Stack
                                    className="subscription-countdown__ring"
                                    style={{ '--countdown-progress': `${countdownProgress}%` } as React.CSSProperties}
                                    align="center"
                                    justify="center"
                                >
                                    <Stack className="subscription-countdown__ring-bg" />
                                    <Paragraph inline className="subscription-countdown__days">{trialDaysRemaining}</Paragraph>
                                </Stack>
                                <Paragraph className="subscription-countdown__label">
                                    day{trialDaysRemaining !== 1 ? 's' : ''} remaining in your trial
                                </Paragraph>
                                {trialDaysRemaining <= 7 && (
                                    <Paragraph className="subscription-countdown__urgency">⚠️ Less than a week left!</Paragraph>
                                )}
                            </Stack>

                            <div className="subscription-lose-section" style={{ marginTop: '1.5rem' }}>
                                <Paragraph className="subscription-lose-section__title">
                                    ⚠️ What you&apos;ll lose when your trial ends
                                </Paragraph>
                                {DOWNGRADE_ITEMS.map((item) => (
                                    <Stack key={item.from} className="subscription-lose-item" direction="horizontal" gap="sm" align="center">
                                        <Paragraph inline className="subscription-lose-item__icon">✕</Paragraph>
                                        <Paragraph inline className="subscription-lose-item__from">{item.from}</Paragraph>
                                        <Paragraph inline className="subscription-lose-item__arrow">→</Paragraph>
                                        <Paragraph inline className="subscription-lose-item__to">{item.to}</Paragraph>
                                    </Stack>
                                ))}
                            </div>

                            <div className="subscription-cta-wrapper">
                                <button
                                    className="fg-button subscription-cta"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                >
                                    {processing ? 'PROCESSING…' : 'SUBSCRIBE NOW — KEEP YOUR ATHLETE FEATURES'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Trial expired */}
                    {trialExpired && (
                        <div className="subscription-lose-section" style={{ marginTop: '1.5rem' }}>
                            <Paragraph className="subscription-lose-section__title">⚠️ Your Trial Has Ended</Paragraph>
                            <Paragraph>Subscribe now to restore your unlimited features and keep your Athlete benefits.</Paragraph>
                            <div className="subscription-cta-wrapper">
                                <button
                                    className="fg-button subscription-cta"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                >
                                    {processing ? 'PROCESSING…' : 'SUBSCRIBE TO ATHLETE — £5/MONTH'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Billing Portal */}
                    {(user as { stripeCustomerId?: string })?.stripeCustomerId && (
                        <div style={{ marginTop: '1.5rem', padding: '1.5rem 2rem', background: 'var(--fg-ink-2)', border: 'var(--fg-rule-thin)' }}>
                            <h3 style={{ fontFamily: 'var(--fg-font-display)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '-0.005em', marginBottom: '0.5rem' }}>
                                BILLING MANAGEMENT
                            </h3>
                            <p style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                Manage your payment method, view invoices, or update your subscription through the Stripe portal.
                            </p>
                            <button className="fg-button fg-button--ink fg-button--sm" onClick={handleOpenPortal} disabled={processing}>
                                {processing ? 'OPENING…' : 'MANAGE BILLING →'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // HOBBYIST VIEW
    return (
        <div>
            <div className="page-head">
                <div>
                    <div className="page-head__eyebrow">SETTINGS / SUBSCRIPTION</div>
                    <h1>Choose Your Plan</h1>
                </div>
                <div className="page-head__actions">
                    <a href="/app/settings/account" className="fg-button fg-button--ghost fg-button--sm">← ACCOUNT</a>
                </div>
            </div>

            {/* Upgrade banner */}
            <div className="stx-plan">
                <span className="stx-plan__icon">✦</span>
                <div>
                    <div className="stx-plan__title">UNLOCK ATHLETE</div>
                    <div className="stx-plan__meta">UNLIMITED SYNCS · £5/MONTH · CANCEL ANYTIME</div>
                </div>
            </div>

            <div style={{ padding: '1.5rem 2rem 2rem' }}>
                {status && (
                    <div style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', background: status.type === 'success' ? 'rgba(163,255,61,0.08)' : status.type === 'error' ? 'rgba(255,93,108,0.08)' : 'var(--fg-ink-2)', border: `1.5px solid ${status.type === 'success' ? 'var(--fg-green)' : status.type === 'error' ? 'var(--fg-rose)' : 'var(--fg-hairline-color)'}` }}>
                        <span style={{ fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem' }}>{status.message}</span>
                    </div>
                )}

                {/* Plan comparison */}
                <div className="subscription-plans-grid">
                    {/* Hobbyist */}
                    <div className="subscription-plan-card subscription-plan-card--current" style={{ padding: '1.5rem', background: 'var(--fg-ink-2)', border: 'var(--fg-rule-thin)' }}>
                        <div className="subscription-plan-card__header">
                            <span className="fg-stamp fg-stamp--ink">CURRENT PLAN</span>
                            <div className="subscription-plan-card__name" style={{ fontFamily: 'var(--fg-font-display)', fontSize: '1.5rem', textTransform: 'uppercase', marginTop: '0.75rem' }}>HOBBYIST</div>
                            <div className="subscription-plan-card__price" style={{ fontFamily: 'var(--fg-font-display)' }}>
                                £0<span className="subscription-plan-card__period">/month</span>
                            </div>
                        </div>
                        <div className="subscription-plan-features">
                            {PLAN_FEATURES.map((feature) => (
                                <div key={feature.name} className="subscription-plan-feature">
                                    <span className={`subscription-plan-feature__icon--${feature.hobbyistIncluded ? 'included' : 'excluded'}`}>
                                        {feature.hobbyistIncluded ? '✓' : '○'}
                                    </span>
                                    <span className={feature.hobbyistIncluded ? '' : 'subscription-plan-feature__text--excluded'}>
                                        {feature.name}{feature.hobbyist && feature.hobbyistIncluded ? `: ${feature.hobbyist}` : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="fg-button fg-button--ghost fg-button--sm" disabled style={{ width: '100%', marginTop: '1rem' }}>
                            CURRENTLY ACTIVE
                        </button>
                    </div>

                    {/* Athlete */}
                    <div className="subscription-plan-card subscription-plan-card--recommended" style={{ padding: '1.5rem', background: 'var(--fg-ink-2)', border: 'var(--fg-rule-thin)', position: 'relative' }}>
                        <div className="subscription-plan-card__header">
                            <span className="fg-stamp">✦ ATHLETE</span>
                            <div className="subscription-plan-card__name" style={{ fontFamily: 'var(--fg-font-display)', fontSize: '1.5rem', textTransform: 'uppercase', marginTop: '0.75rem' }}>ATHLETE</div>
                            <div className="subscription-plan-card__price subscription-plan-card--recommended" style={{ fontFamily: 'var(--fg-font-display)' }}>
                                £5<span className="subscription-plan-card__period">/month</span>
                            </div>
                        </div>
                        <div className="subscription-plan-features">
                            {PLAN_FEATURES.map((feature) => (
                                <div key={feature.name} className="subscription-plan-feature">
                                    <span className="subscription-plan-feature__icon--included">✓</span>
                                    <span>{feature.name}{feature.athlete !== '✓' ? `: ${feature.athlete}` : ''}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            className="fg-button subscription-cta"
                            onClick={handleCheckout}
                            disabled={processing}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {processing ? 'CONNECTING TO STRIPE…' : 'UPGRADE TO ATHLETE'}
                        </button>
                    </div>
                </div>

                {/* Value prop */}
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--fg-ink-2)', border: 'var(--fg-rule-thin)', textAlign: 'center' }}>
                    <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        CANCEL ANYTIME · SECURE PAYMENT VIA STRIPE · 30-DAY TRIAL ON SIGNUP
                    </span>
                </div>

                {/* Athlete features list */}
                <div className="fg-band fg-band--ink" style={{ marginTop: '1.5rem' }}>
                    <span className="fg-band__label">WHAT YOU GET WITH ATHLETE</span>
                </div>
                <Grid cols={2} gap="md">
                    {ATHLETE_BENEFITS.map((feature) => (
                        <Card key={feature.title} className="subscription-feature-card">
                            <FeatureItem
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.desc}
                            />
                        </Card>
                    ))}
                </Grid>
            </div>
        </div>
    );
};

export default SubscriptionPage;
