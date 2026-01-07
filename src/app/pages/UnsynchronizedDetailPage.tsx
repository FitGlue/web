import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActivitiesService, ExecutionRecord } from '../services/ActivitiesService';
import { PipelineTrace } from '../components/PipelineTrace';
import { AppHeader } from '../components/layout/AppHeader';
import { PageHeader } from '../components/layout/PageHeader';

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
      <AppHeader />
      <div className="content">
        <PageHeader
            title="Unsynchronized Execution"
            backTo="/activities?tab=unsynchronized"
            backLabel="Unsynchronized Activities"
        />
      <main className="dashboard">
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
    </div>
  );
};

export default UnsynchronizedDetailPage;
