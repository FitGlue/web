import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { ActivityCard } from '../components/ActivityCard';
import { PageLayout } from '../components/layout/PageLayout';
import { EmptyState } from '../components/EmptyState';
import { DataList } from '../components/data/DataList';
import { Button } from '../components/ui/Button';

type TabMode = 'synchronized' | 'unsynchronized';

const ActivitiesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabMode) || 'synchronized';
  const [tabMode, setTabMode] = useState<TabMode>(initialTab);
  const navigate = useNavigate();

  const handleTabChange = (mode: TabMode) => {
    setTabMode(mode);
    setSearchParams({ tab: mode });
  };

  const { activities, unsynchronized, loading, refresh, lastUpdated } = useActivities(
    tabMode === 'synchronized' ? 'list' : 'unsynchronized'
  );

  const handleActivityClick = (id: string) => navigate(`/activities/${id}`);
  const handleUnsyncClick = (pipelineExecutionId: string) =>
    navigate(`/activities/unsynchronized/${pipelineExecutionId}`);

  return (
    <PageLayout
        title="Activities"
        backTo="/"
        backLabel="Dashboard"
        onRefresh={refresh}
        loading={loading}
        lastUpdated={lastUpdated}
    >
        {/* Tab Buttons */}
        <div className="tabs-container">
            <Button
                variant={tabMode === 'synchronized' ? 'primary' : 'secondary'}
                className={`tab-button ${tabMode === 'synchronized' ? 'active' : ''}`}
                onClick={() => handleTabChange('synchronized')}
            >
                Synchronized
            </Button>
            <Button
                variant={tabMode === 'unsynchronized' ? 'primary' : 'secondary'}
                className={`tab-button ${tabMode === 'unsynchronized' ? 'active' : ''}`}
                onClick={() => handleTabChange('unsynchronized')}
            >
                Unsynchronized
            </Button>
        </div>

        {/* Synchronized Tab */}
        {tabMode === 'synchronized' && (
            <DataList
                items={activities}
                loading={loading}
                loadingMessage="Fetching your activities..."
                keyExtractor={(a) => a.activityId!}
                renderItem={(activity) => (
                    <ActivityCard
                        title={activity.title || 'Untitled'}
                        type={String(activity.type || 'Unknown')}
                        source={activity.source || 'Unknown'}
                        timestamp={activity.syncedAt || null}
                        onClick={() => handleActivityClick(activity.activityId!)}
                    />
                )}
                emptyState={
                    <EmptyState
                        icon="🏃"
                        title="No Activities Yet"
                        message="Your synchronized activities will appear here once you connect your fitness apps."
                        actionLabel="Refresh"
                        onAction={refresh}
                    />
                }
            />
        )}

        {/* Unsynchronized Tab */}
        {tabMode === 'unsynchronized' && (
            <DataList
                items={unsynchronized}
                loading={loading}
                loadingMessage="Fetching unsynchronized executions..."
                keyExtractor={(e) => e.pipelineExecutionId!}
                renderItem={(entry) => (
                    <ActivityCard
                        title={entry.title || 'Unknown Activity'}
                        type={entry.activityType || 'Unknown'}
                        source={entry.source || 'Unknown'}
                        timestamp={entry.timestamp || null}
                        status={entry.status}
                        errorMessage={entry.errorMessage}
                        isUnsynchronized={true}
                        onClick={() => handleUnsyncClick(entry.pipelineExecutionId!)}
                    />
                )}
                emptyState={
                    <EmptyState
                        icon="✅"
                        title="All Synced!"
                        message="No unsynchronized executions found. All your activities have been synced!"
                        actionLabel="Refresh"
                        onAction={refresh}
                    />
                }
            />
        )}
    </PageLayout>
  );
};

export default ActivitiesListPage;
