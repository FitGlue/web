import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActivitiesService, ExecutionRecord } from '../services/ActivitiesService';
import { PipelineTrace } from '../components/PipelineTrace';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { KeyValue } from '../components/ui/KeyValue';
import { Text } from '../components/ui/Text';
import { LoadingState } from '../components/ui/LoadingState';

const UnsynchronizedDetailPage: React.FC = () => {
  const { pipelineExecutionId } = useParams<{ pipelineExecutionId: string }>();
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
    return (
        <PageLayout title="Loading..." backTo="/activities?tab=unsynchronized" backLabel="Unsynchronized Activities">
            <LoadingState message="Loading execution trace..." />
        </PageLayout>
    );
  }

  if (!trace || trace.length === 0) {
    return (
        <PageLayout title="Not Found" backTo="/activities?tab=unsynchronized" backLabel="Unsynchronized Activities">
            <Text variant="muted">Pipeline execution not found</Text>
        </PageLayout>
    );
  }

  return (
    <PageLayout
        title="Unsynchronized Execution"
        backTo="/activities?tab=unsynchronized"
        backLabel="Unsynchronized Activities"
    >
        <Card>
            <KeyValue label="Pipeline ID" value={pipelineExecutionId} format="code" />
            <Text variant="muted">
                This pipeline execution did not result in a synchronized activity.
                Review the trace below to understand why.
            </Text>
        </Card>

        <PipelineTrace trace={trace} />
    </PageLayout>
  );
};

export default UnsynchronizedDetailPage;
