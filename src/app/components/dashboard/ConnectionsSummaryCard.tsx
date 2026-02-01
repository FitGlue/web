import React from 'react';
import { useRealtimeIntegrations } from '../../hooks/useRealtimeIntegrations';
import { usePluginRegistry } from '../../hooks/usePluginRegistry';
import { Stack } from '../library/layout';
import {
  DashboardSummaryCard,
  CardSkeleton,
  ConnectionStatusItem,
  SkeletonLoading
} from '../library/ui';
import { IntegrationsSummary } from '../../state/integrationsState';

/**
 * ConnectionsSummaryCard - Dashboard summary card showing integration connection status
 */
export const ConnectionsSummaryCard: React.FC = () => {
  const { integrations: registryIntegrations } = usePluginRegistry();
  const { integrations, loading } = useRealtimeIntegrations();

  const connectedCount = registryIntegrations.filter(
    ri => integrations?.[ri.id as keyof IntegrationsSummary]?.connected
  ).length;

  return (
    <DashboardSummaryCard
      title="Connections"
      icon="🔗"
      linkTo="/settings/integrations"
      linkLabel="Manage →"
      footerText={<><strong>{connectedCount}</strong> of {registryIntegrations.length} connected</>}
    >
      <SkeletonLoading
        loading={loading}
        skeleton={<CardSkeleton variant="connections" itemCount={4} />}
      >
        <Stack gap="xs">
          {registryIntegrations.map(integration => {
            const status = integrations?.[integration.id as keyof IntegrationsSummary];
            return (
              <ConnectionStatusItem
                key={integration.id}
                name={integration.name}
                connected={status?.connected ?? false}
                icon={integration.icon}
                iconType={integration.iconType}
                iconPath={integration.iconPath}
              />
            );
          })}
        </Stack>
      </SkeletonLoading>
    </DashboardSummaryCard>
  );
};

export default ConnectionsSummaryCard;
