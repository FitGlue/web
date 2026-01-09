import React from 'react';
import { ExecutionRecord } from '../services/ActivitiesService';

interface PipelineTraceProps {
  trace: ExecutionRecord[];
  pipelineExecutionId?: string;
}

// ... (imports)
import { TraceItem } from './TraceItem';

// ... (remove helper functions formatDuration and truncateJson as they are moved to TraceItem)

export const PipelineTrace: React.FC<PipelineTraceProps> = ({ trace, pipelineExecutionId }) => {
  if (!trace || trace.length === 0) return null;

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
