import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout, Stack } from '../components/library/layout';
import { Button, CardSkeleton, Heading, Paragraph } from '../components/library/ui';
import '../components/library/ui/CardSkeleton.css';
import { usePluginRegistry } from '../hooks/usePluginRegistry';

const ConnectionErrorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { integrations, loading: registryLoading } = usePluginRegistry();

    const reason = searchParams.get('reason') || 'unknown';
    const integration = integrations.find(i => i.id === id);
    const displayName = integration?.name || id || 'Service';

    const getErrorMessage = (reason: string): string => {
        switch (reason) {
            case 'denied':
                return `It looks like you denied the authorization request. We can't connect your ${displayName} account without your permission.`;
            case 'server_error':
                return 'We encountered a server error while processing your request. Please try again in a few moments.';
            case 'invalid_state':
            case 'missing_params':
                return 'The connection request was invalid or expired. Please start the connection process again.';
            default:
                return `Something went wrong while connecting your ${displayName} account. Please try again.`;
        }
    };

    if (registryLoading) {
        return (
            <PageLayout title="Connection Failed" backTo="/connections" backLabel="Connections">
                <Stack gap="lg" align="center">
                    <CardSkeleton variant="integration" />
                </Stack>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Connection Failed" backTo="/connections" backLabel="Connections">
            <Stack gap="lg" align="center">
                <Paragraph size="lg">
                    ⚠️
                </Paragraph>

                <Heading level={1} centered>Connection Failed</Heading>

                <Paragraph centered>
                    {getErrorMessage(reason)}
                </Paragraph>

                <Paragraph muted centered>
                    Please try again or contact support if the issue persists.
                </Paragraph>

                <Stack direction="horizontal" gap="md">
                    <Button
                        variant="primary"
                        onClick={() => navigate(`/connections/${id}/setup`)}
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/connections')}
                    >
                        Back to Connections
                    </Button>
                </Stack>
            </Stack>
        </PageLayout>
    );
};

export default ConnectionErrorPage;
