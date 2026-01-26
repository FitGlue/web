import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, Heading, Paragraph } from '../components/library/ui';

interface SettingsLinkCardProps {
    title: string;
    description: string;
    icon: string;
    to: string;
}

const SettingsLinkCard: React.FC<SettingsLinkCardProps> = ({ title, description, icon, to }) => (
    <Link to={to}>
        <Card>
            <Stack direction="horizontal" align="center" gap="md">
                <Paragraph size="lg">{icon}</Paragraph>
                <Stack gap="xs">
                    <Heading level={3} size="md">{title}</Heading>
                    <Paragraph muted size="sm">{description}</Paragraph>
                </Stack>
                <Paragraph>→</Paragraph>
            </Stack>
        </Card>
    </Link>
);

const SettingsPage: React.FC = () => {
    return (
        <PageLayout title="Settings">
            <Grid cols={1} gap="md">
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
            </Grid>
        </PageLayout>
    );
};

export default SettingsPage;
