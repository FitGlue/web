import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../library/ui/Card';
import { CardHeader } from '../library/ui/CardHeader';
import { CardSkeleton } from '../library/ui/CardSkeleton';
import '../library/ui/CardSkeleton.css';
import { Button } from '../library/ui/Button';
import { Paragraph } from '../library/ui/Paragraph';
import { Heading } from '../library/ui/Heading';
import { Input, Textarea, FormField } from '../library/forms';
import { Stack } from '../library/layout/Stack';
import { Grid } from '../library/layout/Grid';
import { client } from '../../../shared/api/client';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { useUser } from '../../hooks/useUser';
import { getEffectiveTier, TIER_ATHLETE, HOBBYIST_TIER_LIMITS } from '../../utils/tier';
import './FileUploadPanel.css';

type QueueStatus = 'pending' | 'uploading' | 'success' | 'error';

interface QueueItem {
  id: string;
  file: File;
  status: QueueStatus;
  errorMessage?: string;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const STATUS_ICON: Record<QueueStatus, string> = {
  pending: '⏳',
  uploading: '⬆',
  success: '✓',
  error: '✕',
};

const STATUS_LABEL: Record<QueueStatus, string> = {
  pending: 'Queued',
  uploading: 'Uploading…',
  success: 'Uploaded',
  error: 'Failed',
};

export const FileUploadPanel: React.FC = () => {
  const navigate = useNavigate();
  const { pipelines, loading: pipelinesLoading } = useRealtimePipelines();
  const { user } = useUser();

  const inputRef = useRef<HTMLInputElement>(null);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const isBulkMode = queue.length > 1;
  const pendingCount = queue.filter(i => i.status === 'pending').length;
  const successCount = queue.filter(i => i.status === 'success').length;
  const errorCount = queue.filter(i => i.status === 'error').length;
  const allDone = queue.length > 0 && pendingCount === 0 && !uploading;

  const hasFileUploadPipeline = pipelines.some((p: { source?: string }) =>
    p.source === 'SOURCE_FILE_UPLOAD' || p.source === 'file_upload'
  );

  const isAtLimit = user && getEffectiveTier(user) !== TIER_ATHLETE &&
    (user.syncCountThisMonth || 0) >= HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH;

  const handleFilesSelected = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fitFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.fit'));
    if (fitFiles.length === 0) return;
    const newItems: QueueItem[] = fitFiles.map(f => ({
      id: `${f.name}-${f.size}-${f.lastModified}`,
      file: f,
      status: 'pending',
    }));
    setQueue(prev => {
      const existingIds = new Set(prev.map(i => i.id));
      return [...prev, ...newItems.filter(i => !existingIds.has(i.id))];
    });
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const handleDropzoneClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFilesSelected(e.dataTransfer.files);
  }, [handleFilesSelected]);

  const removeItem = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
    setTitle('');
    setDescription('');
  };

  const uploadOne = async (item: QueueItem): Promise<void> => {
    const arrayBuffer = await item.file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    const base64Data = btoa(binary);

    const payload: Record<string, string | undefined> = {
      fitFileContent: base64Data,
      title: (!isBulkMode && title) ? title : undefined,
      description: (!isBulkMode && description) ? description : undefined,
    };

    await client.POST('/users/me/parse-fit', { body: payload as never });
  };

  const handleUpload = async () => {
    if (queue.length === 0 || uploading) return;
    setUploading(true);

    for (const item of queue) {
      if (item.status !== 'pending') continue;

      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));

      try {
        await uploadOne(item);
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'success' } : i));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setQueue(prev => prev.map(i =>
          i.id === item.id ? { ...i, status: 'error', errorMessage: message } : i
        ));
      }
    }

    setUploading(false);
    if (!isBulkMode) {
      setTitle('');
      setDescription('');
    }
  };

  const retryFailed = () => {
    setQueue(prev => prev.map(i =>
      i.status === 'error' ? { ...i, status: 'pending', errorMessage: undefined } : i
    ));
  };

  if (pipelinesLoading) return <CardSkeleton variant="file-upload" />;
  if (!hasFileUploadPipeline) return null;

  if (isAtLimit) {
    return (
      <Card>
        <Stack gap="md">
          <CardHeader icon="📤" title="Upload FIT File" />
          <Stack gap="sm" align="center">
            <Paragraph muted>
              🔒 You&apos;ve reached your monthly sync limit ({HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH}/month).
            </Paragraph>
            <Button variant="primary" onClick={() => navigate('/settings/subscription')}>
              Upgrade for Unlimited Uploads →
            </Button>
          </Stack>
        </Stack>
      </Card>
    );
  }

  const uploadingIndex = queue.filter(i => i.status === 'success').length + 1;
  const uploadButtonLabel = uploading
    ? `⬆ Uploading ${uploadingIndex} / ${queue.length}…`
    : isBulkMode
      ? `🚀 Upload ${pendingCount} file${pendingCount !== 1 ? 's' : ''}`
      : '🚀 Upload & Process';

  return (
    <Card>
      <Stack gap="md">
        <CardHeader icon="📤" title="Upload FIT File" />

        {/* Hidden multi-file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".fit"
          multiple
          className="form-file-input__hidden"
          onChange={e => handleFilesSelected(e.target.files)}
        />

        {/* Empty state dropzone */}
        {queue.length === 0 && (
          <div
            className="upload-dropzone upload-dropzone--empty"
            onClick={handleDropzoneClick}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <Stack gap="xs" align="center">
              <Paragraph inline>📂</Paragraph>
              <Paragraph inline bold>Click to select .fit files</Paragraph>
              <Paragraph inline muted size="sm">Select one or many — or drag &amp; drop</Paragraph>
            </Stack>
          </div>
        )}

        {/* Single file mode */}
        {queue.length === 1 && (
          <Grid cols={2} gap="md">
            <Stack gap="sm">
              <Heading level={5}>Selected File</Heading>
              <div
                className="upload-dropzone upload-dropzone--has-file"
                onClick={handleDropzoneClick}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
              >
                <Stack gap="xs" align="center">
                  <Paragraph inline>📁</Paragraph>
                  <Paragraph inline bold>{queue[0].file.name}</Paragraph>
                  <Paragraph inline muted size="sm">{formatSize(queue[0].file.size)}</Paragraph>
                  {queue[0].status === 'success' && (
                    <Paragraph inline size="sm" className="upload-status--success">✓ Uploaded</Paragraph>
                  )}
                  {queue[0].status === 'error' && (
                    <Paragraph inline size="sm" className="upload-status--error">✕ {queue[0].errorMessage}</Paragraph>
                  )}
                </Stack>
              </div>
              <Button variant="ghost" size="sm" onClick={clearQueue} disabled={uploading}>
                Change file
              </Button>
            </Stack>

            <Stack gap="sm">
              <Heading level={5}>Activity Details</Heading>
              <Stack gap="sm">
                <FormField label="Title" htmlFor="upload-title">
                  <Input
                    id="upload-title"
                    type="text"
                    placeholder="Auto-generated if left blank"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={uploading}
                  />
                </FormField>
                <FormField label="Description" htmlFor="upload-desc">
                  <Textarea
                    id="upload-desc"
                    placeholder="Add notes about this activity…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={uploading}
                    rows={2}
                  />
                </FormField>
              </Stack>
            </Stack>
          </Grid>
        )}

        {/* Bulk mode queue */}
        {isBulkMode && (
          <Stack gap="sm">
            <div className="upload-queue-header">
              <Paragraph bold inline>{queue.length} files selected</Paragraph>
              <div className="upload-queue-header-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDropzoneClick}
                  disabled={uploading}
                >
                  + Add more
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={clearQueue}
                  disabled={uploading}
                >
                  Clear all
                </Button>
              </div>
            </div>

            <div className="upload-queue-list">
              {queue.map(item => (
                <div key={item.id} className={`upload-queue-item upload-queue-item--${item.status}`}>
                  <span className="upload-queue-item__icon">{STATUS_ICON[item.status]}</span>
                  <span className="upload-queue-item__name" title={item.file.name}>{item.file.name}</span>
                  <span className="upload-queue-item__size">{formatSize(item.file.size)}</span>
                  <span className="upload-queue-item__status">{STATUS_LABEL[item.status]}</span>
                  {item.status === 'pending' && !uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="upload-queue-item__remove"
                      onClick={() => removeItem(item.id)}
                      title="Remove"
                    >
                      ×
                    </Button>
                  )}
                  {item.status === 'error' && item.errorMessage && (
                    <span className="upload-queue-item__error" title={item.errorMessage}>ⓘ</span>
                  )}
                </div>
              ))}
            </div>

            {allDone && (
              <Paragraph muted size="sm">
                {successCount > 0 && `✓ ${successCount} uploaded`}
                {successCount > 0 && errorCount > 0 && ' · '}
                {errorCount > 0 && `✕ ${errorCount} failed`}
                {errorCount > 0 && (
                  <> · <Button variant="ghost" size="sm" onClick={retryFailed}>Retry failed</Button></>
                )}
              </Paragraph>
            )}
          </Stack>
        )}

        {/* Upload button */}
        {queue.length > 0 && !allDone && (
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={pendingCount === 0 || uploading}
            fullWidth
          >
            {uploadButtonLabel}
          </Button>
        )}

        {/* Post-bulk actions */}
        {allDone && isBulkMode && (
          <Button variant="secondary" onClick={clearQueue} fullWidth>
            Upload more files
          </Button>
        )}
      </Stack>
    </Card>
  );
};
