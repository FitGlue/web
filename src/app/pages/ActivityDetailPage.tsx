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
                        {Object.entries(activity.destinations!).map(([k, v]) => {
                            const val = v as string;
                            let url = '';
                            if (k === 'strava') url = `https://www.strava.com/activities/${val}`;
                            // Fitbit activity URLs are complex and usually require auth, so we might skip or link to a generic dashboard
                            // if (k === 'fitbit') url = `...`;

                            return (
                                <li key={k} className="destination-item">
                                    <span className="destination-name">{k}</span>
                                    {url ? (
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="destination-link">
                                            {val} ↗
                                        </a>
                                    ) : (
                                        <span className="destination-value">{val}</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <Text variant="muted">No destinations recorded.</Text>
                )}
            </Card>
            <style>{`
                .destinations-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .destination-item {
                    display: flex;
                    align-items: center;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid var(--border-color);
                }
                .destination-item:last-child {
                    border-bottom: none;
                }
                .destination-name {
                    font-weight: 500;
                    width: 120px;
                    text-transform: capitalize;
                }
                .destination-link {
                    color: var(--primary-color);
                    text-decoration: none;
                }
                .destination-link:hover {
                    text-decoration: underline;
                }
                .destination-value {
                    color: var(--text-color);
                    font-family: monospace;
                }
            `}</style>
        </Section>

        <PipelineTrace
            trace={activity.pipelineExecution || []}
            pipelineExecutionId={activity.pipelineExecutionId}
            isLoading={loading}
        />
    </PageLayout>
  );
};

export default ActivityDetailPage;
