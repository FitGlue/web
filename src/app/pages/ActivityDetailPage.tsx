import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { SynchronizedActivity } from '../services/ActivitiesService';

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

// Helper to format duration between two timestamps
const formatDuration = (start?: string | null, end?: string | null): string => {
  if (!start || !end) return '';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

// Helper to truncate large arrays/objects for display
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const truncateJson = (obj: any, depth = 0): any => {
  if (depth > 5) return '[Max Depth]';
  if (!obj) return obj;

  if (Array.isArray(obj)) {
    if (obj.length > 5) {
      const truncated = obj.slice(0, 5).map((item) => truncateJson(item, depth + 1));
      truncated.push(`... ${obj.length - 5} more items ...`);
      return truncated;
    }
    return obj.map((item) => truncateJson(item, depth + 1));
  }

  if (typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Aggressive truncation for known large arrays in FIT data
      if (['sessions', 'laps', 'records', 'points', 'heart_rate_stream', 'power_stream', 'position_lat_stream', 'position_long_stream'].includes(key) && Array.isArray(value)) {
         if (value.length > 3) {
            const truncated = value.slice(0, 3).map((item) => truncateJson(item, depth + 1));
            truncated.push(`... ${value.length - 3} more items ...`);
            newObj[key] = truncated;
         } else {
             newObj[key] = truncateJson(value, depth + 1);
         }
      } else {
        newObj[key] = truncateJson(value, depth + 1);
      }
    }
    return newObj;
  }

  return obj;
};

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activities, loading } = useActivities('single', id);
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
      <header className="app-header">
        <h1 className="title small">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </h1>
        <div className="nav-actions">
           <button onClick={() => navigate('/activities')} className="btn text">Back to Activities</button>
        </div>
      </header>
      <main className="dashboard">
        <h2>{activity.title}</h2>
        <div className="card">
            <p><strong>Description:</strong></p>
            <p className="activity-description">{activity.description}</p>
            <p><strong>Type:</strong> {activity.type}</p>
            <p><strong>Source:</strong> {originalSource}</p>
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
          <>
            <h3>Pipeline Execution Trace</h3>
            {activity.pipelineExecutionId && (
              <p className="pipeline-id">Pipeline ID: <code>{activity.pipelineExecutionId}</code></p>
            )}
            <div className="card pipeline-trace-card">
                <div className="trace-timeline">
                    {activity.pipelineExecution.map((exec, index) => (
                        <div key={exec.executionId} className={`trace-item status-${exec.status?.toLowerCase()}`}>
                            <div className="trace-step-number">{index + 1}</div>
                            <div className="trace-content">
                              <div className="trace-header">
                                  <span className="trace-service">{exec.service}</span>
                                  <span className={`trace-status badge-${exec.status?.toLowerCase()}`}>{exec.status}</span>
                              </div>
                              <div className="trace-meta">
                                <span className="trace-time">{exec.timestamp ? new Date(exec.timestamp).toLocaleTimeString() : ''}</span>
                                {exec.startTime && exec.endTime && (
                                  <span className="trace-duration">Duration: {formatDuration(exec.startTime, exec.endTime)}</span>
                                )}
                                {exec.triggerType && (
                                  <span className="trace-trigger">Trigger: {exec.triggerType}</span>
                                )}
                              </div>
                              {exec.inputsJson && (
                                <details className="trace-outputs">
                                  <summary>Inputs</summary>
                                  <pre className="trace-json">{(() => {
                                    try {
                                      const parsed = JSON.parse(exec.inputsJson);
                                      const truncated = truncateJson(parsed);
                                      return JSON.stringify(truncated, null, 2);
                                    } catch {
                                      return exec.inputsJson;
                                    }
                                  })()}</pre>
                                </details>
                              )}
                              {exec.errorMessage && <div className="trace-error">{exec.errorMessage}</div>}
                              {exec.outputsJson && (
                                <details className="trace-outputs">
                                  <summary>Outputs</summary>
                                  <pre className="trace-json">{(() => {
                                    try {
                                      const parsed = JSON.parse(exec.outputsJson);
                                      const truncated = truncateJson(parsed);
                                      return JSON.stringify(truncated, null, 2);
                                    } catch {
                                      return exec.outputsJson;
                                    }
                                  })()}</pre>
                                </details>
                              )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ActivityDetailPage;
