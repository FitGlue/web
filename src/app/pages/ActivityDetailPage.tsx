import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { SynchronizedActivity } from '../services/ActivitiesService';
import { MetaBadge } from '../components/MetaBadge';
import { PipelineTrace } from '../components/PipelineTrace';
import { PageLayout } from '../components/layout/PageLayout';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { KeyValue } from '../components/ui/KeyValue';
import { Text } from '../components/ui/Text';
import { LoadingState } from '../components/ui/LoadingState';

// Helper to derive original trigger source from pipeline execution trace
const deriveOriginalSource = (activity: SynchronizedActivity): string => {
  if (activity.pipelineExecution && activity.pipelineExecution.length > 0) {
    const firstService = activity.pipelineExecution[0].service;
    if (firstService) {
      if (firstService.includes('fitbit')) return 'Fitbit';
      if (firstService.includes('hevy')) return 'Hevy';
      if (firstService.includes('mock')) return 'Mock Source';
      if (firstService.includes('test')) return 'Test';
      return firstService.replace(/-handler$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  }
  return activity.source || 'Unknown';
};

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activities, loading, refresh } = useActivities('single', id);
  const [activity, setActivity] = useState<SynchronizedActivity | null>(null);

  useEffect(() => {
    if (id && activities.length > 0) {
        setActivity(activities.find(a => a.activityId === id) || null);
    }
  }, [id, activities]);

  if (loading && !activity) {
      return (
          <PageLayout title="Loading..." backTo="/activities" backLabel="Activities">
              <LoadingState message="Loading activity details..." />
          </PageLayout>
      );
  }

  if (!activity) {
      return (
          <PageLayout title="Not Found" backTo="/activities" backLabel="Activities">
              <Text variant="muted">Activity not found</Text>
          </PageLayout>
      );
  }

  const originalSource = deriveOriginalSource(activity);
  const hasDestinations = activity.destinations && Object.keys(activity.destinations).length > 0;

  return (
    <PageLayout
        title={activity.title || 'Activity Details'}
        backTo="/activities"
        backLabel="Activities"
        onRefresh={refresh}
        loading={loading}
    >
        <Card>
            <div className="card-meta-row" style={{ marginTop: 0, marginBottom: '1rem' }}>
                <MetaBadge label="Type" value={String(activity.type) || 'Unknown'} />
                <MetaBadge label="Source" value={originalSource} />
            </div>
            <KeyValue label="Description" value={activity.description} multiline />
            <KeyValue label="Start Time" value={activity.startTime} format="datetime" />
            <KeyValue label="Synced At" value={activity.syncedAt} format="datetime" />
        </Card>

        <Section title="Destinations">
            <Card>
                {hasDestinations ? (
                    <ul className="destinations-list">
                        {Object.entries(activity.destinations!).map(([k, v]) => (
                            <li key={k}>{k}: {v as string}</li>
                        ))}
                    </ul>
                ) : (
                    <Text variant="muted">No destinations recorded.</Text>
                )}
            </Card>
        </Section>

        {activity.pipelineExecution && activity.pipelineExecution.length > 0 && (
            <PipelineTrace
                trace={activity.pipelineExecution}
                pipelineExecutionId={activity.pipelineExecutionId}
            />
        )}
    </PageLayout>
  );
};

export default ActivityDetailPage;
