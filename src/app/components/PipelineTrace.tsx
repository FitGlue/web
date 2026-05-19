import React from 'react';
import { ExecutionRecord } from '../services/ActivitiesService';
import { TraceItem } from './TraceItem';
import { LoadingState, EmptyState } from './library/ui';
import { Stack } from './library/layout/Stack';
import { SettingsSection } from './library/layout/SettingsSection';
import { Badge } from './library/ui/Badge';
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
    <SettingsSection title="Pipeline Execution Trace">
      <Stack gap="none">
        {pipelineExecutionId && (
          <Badge variant="default" className="pipeline-trace__id">{pipelineExecutionId}</Badge>
        )}
        <Stack gap="none" className="pipeline-trace__list">
          {trace.map((exec, index) => (
            <TraceItem key={exec.executionId || index} execution={exec} index={index} />
          ))}
        </Stack>
      </Stack>
    </SettingsSection>
  );
};
