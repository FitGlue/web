import React from 'react';
import { useAtom } from 'jotai';
import { Stack, Grid } from '../library/layout';
import { Modal, Badge, Code, KeyValue, Paragraph } from '../library/ui';
import { useAdminExecutions } from '../../hooks/admin';
import { selectedExecutionIdAtom } from '../../state/adminState';

// Status badge variant mapping
const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  'Success': 'success',
  'SUCCESS': 'success',
  'Started': 'info',
  'STARTED': 'info',
  'Failed': 'error',
  'FAILED': 'error',
  'Pending': 'warning',
  'PENDING': 'warning',
};

/**
 * ExecutionDetailModal displays detailed information about an execution
 */
export const ExecutionDetailModal: React.FC = () => {
  const [selectedExecutionId, setSelectedExecutionId] = useAtom(selectedExecutionIdAtom);
  const { selectedExecution, selectExecution } = useAdminExecutions();

  const handleClose = () => {
    setSelectedExecutionId(null);
    selectExecution(null);
  };

  const isOpen = !!selectedExecutionId && !!selectedExecution;

  if (!isOpen || !selectedExecution) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Execution Details"
      size="lg"
    >
      <Stack gap="lg">
        <Grid cols={2}>
          <KeyValue label="Execution ID" value={selectedExecution.id} format="code" />
          <KeyValue label="Service" value={selectedExecution.service} />
          <Stack direction="horizontal" gap="sm" align="center">
            <Paragraph><strong>Status:</strong></Paragraph>
            <Badge variant={statusVariants[selectedExecution.status] || 'default'}>
              {selectedExecution.status}
            </Badge>
          </Stack>
          <KeyValue 
            label="Timestamp" 
            value={selectedExecution.timestamp} 
            format="datetime" 
          />
          {selectedExecution.userId && (
            <KeyValue label="User ID" value={selectedExecution.userId} format="code" />
          )}
          {selectedExecution.pipelineExecutionId && (
            <KeyValue label="Pipeline Execution" value={selectedExecution.pipelineExecutionId} format="code" />
          )}
          {selectedExecution.triggerType && (
            <KeyValue label="Trigger" value={selectedExecution.triggerType} />
          )}
        </Grid>

        {selectedExecution.errorMessage && (
          <Stack gap="sm">
            <Badge variant="error">Error</Badge>
            <Code>{selectedExecution.errorMessage}</Code>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};
