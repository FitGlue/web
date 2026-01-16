import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import './WelcomeBanner.css';

interface WelcomeBannerProps {
    onDismiss?: () => void;
}

interface StepConfig {
    number: number;
    title: string;
    description: string;
    buttonText: string;
    icon: string;
    route: string;
}

const STEPS: StepConfig[] = [
    {
        number: 1,
        title: 'Add some Connections',
        description: 'Link your workout apps — sources in, targets out',
        buttonText: 'Connect',
        icon: '🔗',
        route: '/settings/integrations',
    },
    {
        number: 2,
        title: 'Create a Pipeline',
        description: 'Pick your Boosters and configure the flow',
        buttonText: 'Create',
        icon: '⚡',
        route: '/settings/pipelines/new',
    },
    {
        number: 3,
        title: 'See the magic happen',
        description: 'Your activities get boosted and synced automatically',
        buttonText: 'View',
        icon: '✨',
        route: '/app',
    },
];

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onDismiss }) => {
    const navigate = useNavigate();

    return (
        <Card className="welcome-banner">
            <div className="welcome-header">
                <div className="welcome-header-content">
                    <div className="welcome-icon">👋</div>
                    <div className="welcome-text">
                        <h2>
                            Welcome to{' '}
                            <span className="brand">
                                <span className="fit">Fit</span>
                                <span className="glue">Glue</span>
                            </span>
                            !
                        </h2>
                        <p>Let&apos;s get you set up in 3 easy steps</p>
                    </div>
                </div>
                {onDismiss && (
                    <button
                        className="dismiss-btn"
                        onClick={onDismiss}
                        aria-label="Dismiss"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <path d="M12 4L4 12M4 4l8 8" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="onboarding-steps">
                {STEPS.map((step, index) => (
                    <button
                        key={step.number}
                        className="step-card"
                        onClick={() => navigate(step.route)}
                        style={{ '--step-index': index } as React.CSSProperties}
                    >
                        <div className="step-number">{step.number}</div>
                        <div className="step-content">
                            <div className="step-icon">{step.icon}</div>
                            <div className="step-info">
                                <h4>{step.title}</h4>
                                <p>{step.description}</p>
                            </div>
                        </div>
                        <div className="step-action">
                            <span className="step-cta">
                                {step.buttonText}
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M6 12l4-4-4-4" />
                                </svg>
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </Card>
    );
};
