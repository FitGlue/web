import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActivitiesService, ExecutionRecord } from '../services/ActivitiesService';
import { PipelineTrace } from '../components/PipelineTrace';

// Helper to format duration between two timestamps
// Removed: logic moved to PipelineTrace

// Helper to truncate large arrays/objects for display
// Removed: logic moved to PipelineTrace

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
           <button onClick={() => navigate('/activities')} className="btn text">← Back to Activities</button>
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

        <PipelineTrace trace={trace} />
      </main>
    </div>
  );
};

export default UnsynchronizedDetailPage;
