import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActivitiesService, ExecutionRecord } from '../services/ActivitiesService';
import { StatusBadge } from '../components/StatusBadge';

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

const UnsynchronizedDetailPage: React.FC = () => {
  const { pipelineExecutionId } = useParams<{ pipelineExecutionId: string }>();
  const navigate = useNavigate();
  const [trace, setTrace] = useState<ExecutionRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pipelineExecutionId) {
      ActivitiesService.getUnsynchronizedTrace(pipelineExecutionId)
        .then(data => {
          setTrace(data?.pipelineExecution || null);
        })
        .finally(() => setLoading(false));
    }
  }, [pipelineExecutionId]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!trace || trace.length === 0) {
    return <div className="container">Pipeline execution not found</div>;
  }

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
        <h2>Unsynchronized Execution</h2>
        <div className="card">
          <p><strong>Pipeline ID:</strong> <code>{pipelineExecutionId}</code></p>
          <p className="unsync-note">
            This pipeline execution did not result in a synchronized activity.
            Review the trace below to understand why.
          </p>
        </div>

        <h3>Pipeline Execution Trace</h3>
        <div className="card pipeline-trace-card">
          <div className="trace-timeline">
            {trace.map((exec, index) => (
              <div key={exec.executionId || index} className={`trace-item status-${exec.status?.toLowerCase()}`}>
                <div className="trace-step-number">{index + 1}</div>
                <div className="trace-content">
                  <div className="trace-header">
                    <span className="trace-service">{exec.service}</span>
                    <StatusBadge status={exec.status || 'UNKNOWN'} />
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
      </main>
    </div>
  );
};

export default UnsynchronizedDetailPage;
