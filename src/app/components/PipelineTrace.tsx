import React from 'react';
import { ExecutionRecord } from '../services/ActivitiesService';

interface PipelineTraceProps {
  trace: ExecutionRecord[];
  pipelineExecutionId?: string;
  isLoading?: boolean;
}

// ... (imports)
import { TraceItem } from './TraceItem';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './EmptyState';

// ... (remove helper functions formatDuration and truncateJson as they are moved to TraceItem)

export const PipelineTrace: React.FC<PipelineTraceProps> = ({ trace, pipelineExecutionId, isLoading }) => {
  if (isLoading) {
      return <LoadingState message="Loading pipeline execution trace..." />;
  }

  if (!trace || trace.length === 0) {
      return (
          <EmptyState
              icon="🔍"
              title="No Trace Data"
              message="No execution trace steps found for this pipeline."
          />
      );
  }

  return (
    <>
      <h3>Pipeline Execution Trace</h3>
      {pipelineExecutionId && (
        <p className="pipeline-id">Pipeline ID: <code>{pipelineExecutionId}</code></p>
      )}
      <div className="card pipeline-trace-card">
          <div className="trace-timeline">
              {trace.map((exec, index) => (
                  <TraceItem key={exec.executionId || index} execution={exec} index={index} />
              ))}
          </div>
      </div>
    </>
  );
};
