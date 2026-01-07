import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { SynchronizedActivity } from '../services/ActivitiesService';
import { MetaBadge } from '../components/MetaBadge';
import { PipelineTrace } from '../components/PipelineTrace';
import { AppHeader } from '../components/layout/AppHeader';
import { PageHeader } from '../components/layout/PageHeader';
import { RefreshControl } from '../components/RefreshControl';

// Helper to derive original trigger source from pipeline execution trace
const deriveOriginalSource = (activity: SynchronizedActivity): string => {
  if (activity.pipelineExecution && activity.pipelineExecution.length > 0) {
    const firstService = activity.pipelineExecution[0].service;
    if (firstService) {
      // Map service names to friendly source names
      if (firstService.includes('fitbit')) return 'Fitbit';
      if (firstService.includes('hevy')) return 'Hevy';
      if (firstService.includes('mock')) return 'Mock Source';
      if (firstService.includes('test')) return 'Test';
      // Fallback: extract from service name
      return firstService.replace(/-handler$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  }
  // Fallback to stored source if no pipeline data
  return activity.source || 'Unknown';
};

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activities, loading, refresh } = useActivities('single', id);
  const navigate = useNavigate();
  const [activity, setActivity] = useState<SynchronizedActivity | null>(null);

  useEffect(() => {
    if (id && activities.length > 0) {
        setActivity(activities.find(a => a.activityId === id) || null);
    }
  }, [id, activities]);


  if (loading && !activity) {
      return <div className="container">Loading...</div>;
  }

  if (!activity) {
      return <div className="container">Activity not found</div>;
  }

  const originalSource = deriveOriginalSource(activity);

  return (
    <div className="container dashboard-container">
      <AppHeader />
      <div className="content">
        <PageHeader
            title={activity.title}
            backTo="/activities"
            backLabel="Activities"
            actions={
                <RefreshControl onRefresh={refresh} loading={loading} lastUpdated={null} />
            }
        />
      <main className="dashboard">
        <div className="card">
            <div className="card-meta-row" style={{ marginTop: 0, marginBottom: '1rem' }}>
               <MetaBadge label="Type" value={String(activity.type) || 'Unknown'} />
               <MetaBadge label="Source" value={originalSource} />
            </div>

            <p><strong>Description:</strong></p>
            <p className="activity-description">{activity.description}</p>
             <p><strong>Start Time:</strong> {activity.startTime ? new Date(activity.startTime).toLocaleString() : 'N/A'}</p>
             <p><strong>Synced At:</strong> {activity.syncedAt ? new Date(activity.syncedAt).toLocaleString() : 'N/A'}</p>
        </div>

        <h3>Destinations</h3>
        <div className="card">
             {activity.destinations && Object.keys(activity.destinations).length > 0 ? (
                 <ul className="destinations-list">
                     {Object.entries(activity.destinations).map(([k, v]) => (
                         <li key={k}>{k}: {v as string}</li>
                     ))}
                 </ul>
             ) : (
                 <p>No destinations recorded.</p>
             )}
        </div>

        {activity.pipelineExecution && activity.pipelineExecution.length > 0 && (
          <PipelineTrace
            trace={activity.pipelineExecution}
            pipelineExecutionId={activity.pipelineExecutionId}
          />
        )}
      </main>
      </div>
    </div>
  );
};

export default ActivityDetailPage;
