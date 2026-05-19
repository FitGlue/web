import React from 'react';
import { ExecutionRecord } from '../services/ActivitiesService';
import { TraceItem } from './TraceItem';
import { LoadingState, EmptyState } from './library/ui';
import './PipelineTrace.css';

interface PipelineTraceProps {
  trace: ExecutionRecord[];
  pipelineExecutionId?: string;
  isLoading?: boolean;
}

export const PipelineTrace: React.FC<PipelineTraceProps> = ({ trace, pipelineExecutionId, isLoading }) => {
  if (isLoading) {
    return <LoadingState message="Loading pipeline execution trace..." />;
  }

  if (!trace || trace.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No Trace Data"
        description="No execution trace steps found for this pipeline."
      />
    );
  }

  return (
    <div className="pipeline-trace">
      <div className="pipeline-trace__header">
        <span className="pipeline-trace__heading">Pipeline Execution Trace</span>
        {pipelineExecutionId && (
          <span className="pipeline-trace__id">{pipelineExecutionId}</span>
        )}
      </div>
      <div className="pipeline-trace__list">
        {trace.map((exec, index) => (
          <TraceItem key={exec.executionId || index} execution={exec} index={index} />
        ))}
      </div>
    </div>
  );
};
