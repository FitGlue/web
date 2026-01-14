import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import './WelcomeBanner.css';

interface WelcomeBannerProps {
    onDismiss?: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onDismiss }) => {
    const navigate = useNavigate();

    return (
        <Card className="welcome-banner">
            <div className="welcome-content">
                <div className="welcome-icon">👋</div>
                <div className="welcome-text">
                    <h2>Welcome to <span className="fit">Fit</span><span className="glue">Glue</span>!</h2>
                    <p>Let&apos;s get you set up in 3 easy steps:</p>
                </div>
            </div>

            <div className="onboarding-steps">
                <div className="onboarding-step">
                    <div className="step-icon">1</div>
                    <div className="step-details">
                        <h4>Connect a Source</h4>
                        <p>Link your Hevy or Fitbit account to import workouts</p>
                    </div>
                    <Button
                        variant="primary"
                        size="small"
                        onClick={() => navigate('/settings/integrations')}
                    >
                        Connect →
                    </Button>
                </div>

                <div className="onboarding-step">
                    <div className="step-icon">2</div>
                    <div className="step-details">
                        <h4>Connect a Destination</h4>
                        <p>Link Strava to automatically sync your enhanced activities</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate('/settings/integrations')}
                    >
                        Setup →
                    </Button>
                </div>

                <div className="onboarding-step">
                    <div className="step-icon">3</div>
                    <div className="step-details">
                        <h4>Create a Pipeline</h4>
                        <p>Configure how your workouts get enriched and synced</p>
                    </div>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate('/settings/pipelines/new')}
                    >
                        Create →
                    </Button>
                </div>
            </div>

            {onDismiss && (
                <button className="dismiss-btn" onClick={onDismiss} aria-label="Dismiss">
                    ✕
                </button>
            )}
        </Card>
    );
};
