import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { pipelineRunsAtom } from '../state/activitiesState';
import { useRealtimePipelineRuns } from '../hooks/useRealtimePipelineRuns';
import { PageLayout } from '../components/library/layout/PageLayout';
import { Card } from '../components/library/ui/Card';
import { KeyValue } from '../components/library/ui/KeyValue';
import { Text } from '../components/library/ui/Text';
import { ExecutionStepTrace } from '../components/ExecutionStepTrace';
import '../components/ExecutionStepTrace.css';

const UnsynchronizedDetailPage: React.FC = () => {
    const { pipelineExecutionId } = useParams<{ pipelineExecutionId: string }>();

    const { loading } = useRealtimePipelineRuns(true, 50);
    const [pipelineRuns] = useAtom(pipelineRunsAtom);

    const run = useMemo(
        () => pipelineRuns.find(r => r.id === pipelineExecutionId),
        [pipelineRuns, pipelineExecutionId]
    );

    if (!loading && !run) {
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
            <div className="fg-band" style={{ marginBottom: '1.5rem' }}>
                <span className="fg-band__label">PIPELINE TRACE</span>
                <span className="fg-band__right">UNSYNCHRONIZED</span>
            </div>

            <Card>
                <KeyValue label="Execution ID" value={pipelineExecutionId} format="code" />
                {run?.title && <KeyValue label="Activity" value={run.title} />}
                {run?.source && (
                    <KeyValue
                        label="Source"
                        value={run.source.replace(/^SOURCE_/, '').replace(/_/g, ' ').toLowerCase()}
                    />
                )}
                <Text variant="muted">
                    This pipeline execution did not result in a synchronized activity.
                    Review the trace below to understand why.
                </Text>
            </Card>

            <ExecutionStepTrace steps={run?.steps ?? []} isLoading={loading && !run} />
        </PageLayout>
    );
};

export default UnsynchronizedDetailPage;
