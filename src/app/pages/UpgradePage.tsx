import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { LoadingState } from '../components/ui/LoadingState';
import './UpgradePage.css';

const UpgradePage: React.FC = () => {
    const api = useApi();
    const navigate = useNavigate();
    const { user, loading, refresh } = useUser();
    const [searchParams] = useSearchParams();
    const [upgrading, setUpgrading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'cancelled'; message: string } | null>(null);

    useEffect(() => {
        const billingStatus = searchParams.get('billing');
        if (billingStatus === 'success') {
            setStatus({ type: 'success', message: 'Success! Your account has been upgraded to Pro.' });
            refresh(); // Refresh user profile to show New Tier
        } else if (billingStatus === 'cancelled') {
            setStatus({ type: 'cancelled', message: 'Checkout cancelled. No changes were made.' });
        } else if (billingStatus === 'error') {
            setStatus({ type: 'error', message: 'There was an error processing your payment. Please try again.' });
        }
    }, [searchParams, refresh]);

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const { url } = await api.post('/billing/checkout') as { url: string };
            window.location.href = url;
        } catch (error) {
            console.error('Failed to start checkout:', error);
            setStatus({ type: 'error', message: 'Failed to start checkout process. Please try again later.' });
        } finally {
            setUpgrading(false);
        }
    };

    if (loading && !user) {
        return (
            <PageLayout title="Upgrade to Pro">
                <LoadingState />
            </PageLayout>
        );
    }

    const isPro = user?.tier === 'pro';
    const trialDaysRemaining = user?.trialEndsAt
        ? Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <PageLayout
            title="Choose Your Plan"
            backTo="/settings/account"
            backLabel="Account"
        >
            <div className="pricing-container">
                {status && (
                    <div className={`billing-status ${status.type}`}>
                        {status.message}
                    </div>
                )}

                <div className="pricing-header">
                    <h2>Unlock the full power of FitGlue</h2>
                    <p className="tagline">Automate your fitness data with no limits.</p>
                </div>

                <div className="pricing-grid">
                    {/* Free Tier */}
                    <Card className={`pricing-card ${!isPro ? 'current' : ''}`}>
                        {!isPro && <div className="current-tier-tab">Your Current Plan</div>}
                        <div className="tier-name">Hobbyist</div>
                        <div className="tier-price">£0<span>/mo</span></div>
                        <ul className="feature-list">
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> 25 Syncs per month
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> 2 Active connections
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> Basic enrichers
                            </li>
                            <li className="feature-item disabled">
                                <span className="feature-icon">○</span> Priority processing
                            </li>
                            <li className="feature-item disabled">
                                <span className="feature-icon">○</span> Advanced Elastic Match
                            </li>
                        </ul>
                        <Button
                            variant="secondary"
                            disabled={!isPro}
                            onClick={() => navigate('/')}
                        >
                            {!isPro ? 'Currently Active' : 'Downgrade (via Stripe)'}
                        </Button>
                    </Card>

                    {/* Pro Tier */}
                    <Card className={`pricing-card pro ${isPro ? 'current' : ''}`}>
                        {isPro && <div className="current-tier-tab">Your Current Plan</div>}
                        <div className="tier-name">Athlete</div>
                        <div className="tier-price">£5<span>/mo</span></div>
                        <ul className="feature-list">
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> <strong>Unlimited</strong> Syncs
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> <strong>Unlimited</strong> Connections
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> Priority processing
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> All Advanced Enrichers
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> Custom Sync Scheduling
                            </li>
                        </ul>
                        {isPro ? (
                            <Button variant="secondary" onClick={() => window.open('https://billing.stripe.com/p/login/test_YOUR_PORTAL_ID', '_blank')}>
                                Manage Subscription
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                className="checkout-btn"
                                onClick={handleUpgrade}
                                disabled={upgrading}
                            >
                                {upgrading ? 'Connecting to Stripe...' : trialDaysRemaining > 0 ? `Start Pro - ${trialDaysRemaining}d remaining in trial` : 'Upgrade to Pro'}
                            </Button>
                        )}
                    </Card>
                </div>

                {user?.trialEndsAt && !isPro && trialDaysRemaining > 0 && (
                    <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-primary)' }}>
                        You are currently in your 30-day Pro trial. {trialDaysRemaining} days remaining.
                    </p>
                )}
            </div>
        </PageLayout>
    );
};

export default UpgradePage;
