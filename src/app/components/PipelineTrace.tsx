import React from 'react';
import { ExecutionRecord } from '../services/ActivitiesService';
import { TraceItem } from './TraceItem';
import { LoadingState, EmptyState, Heading, Paragraph, Code } from './library/ui';
import { Stack } from './library/layout';

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
    <Stack gap="md">
      <Heading level={3}>Pipeline Execution Trace</Heading>
      {pipelineExecutionId && (
        <Paragraph>Pipeline ID: <Code>{pipelineExecutionId}</Code></Paragraph>
      )}
      <Stack gap="sm">
          {trace.map((exec, index) => (
              <TraceItem key={exec.executionId || index} execution={exec} index={index} />
          ))}
      </Stack>
    </Stack>
  );
};
