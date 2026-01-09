import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';

interface SettingsLinkCardProps {
    title: string;
    description: string;
    icon: string;
    to: string;
}

const SettingsLinkCard: React.FC<SettingsLinkCardProps> = ({ title, description, icon, to }) => (
    <Link to={to} className="settings-link-card">
        <Card className="settings-card clickable">
            <div className="settings-card-content">
                <span className="settings-card-icon">{icon}</span>
                <div className="settings-card-text">
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                <span className="settings-card-arrow">→</span>
            </div>
        </Card>
    </Link>
);

const SettingsPage: React.FC = () => {
    return (
        <PageLayout title="Settings">
            <div className="settings-grid">
                <SettingsLinkCard
                    title="Integrations"
                    description="Connect and manage your fitness services"
                    icon="🔗"
                    to="/settings/integrations"
                />
                <SettingsLinkCard
                    title="Pipelines"
                    description="Configure how your activities are processed"
                    icon="🔀"
                    to="/settings/pipelines"
                />
                <SettingsLinkCard
                    title="Account"
                    description="Manage your account and data"
                    icon="👤"
                    to="/settings/account"
                />
            </div>
        </PageLayout>
    );
};

export default SettingsPage;
