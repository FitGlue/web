import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../library/ui/Card';
import { CardHeader } from '../library/ui/CardHeader';
import { CardSkeleton } from '../library/ui/CardSkeleton';
import '../library/ui/CardSkeleton.css';
import { Button } from '../library/ui/Button';
import { Paragraph } from '../library/ui/Paragraph';
import { Heading } from '../library/ui/Heading';
import { Input, Textarea, FormField, FileInput, Select } from '../library/forms';
import { Stack } from '../library/layout/Stack';
import { Grid } from '../library/layout/Grid';
import { useApi } from '../../hooks/useApi';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { useUser } from '../../hooks/useUser';
import { getEffectiveTier, TIER_ATHLETE } from '../../utils/tier';
import './FileUploadPanel.css';

/**
 * FileUploadPanel - Dashboard component for uploading FIT files
 */
export const FileUploadPanel: React.FC = () => {
  const api = useApi();
  const navigate = useNavigate();
  const { pipelines, loading: pipelinesLoading } = useRealtimePipelines();
  const { user } = useUser();


  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Nerd Mode state
  const [nerdMode, setNerdMode] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');

  const hasFileUploadPipeline = pipelines.some((p: { source?: string }) =>
    p.source === 'SOURCE_FILE_UPLOAD' || p.source === 'file_upload'
  );

  // Filter to only file-upload pipelines for the selector
  const fileUploadPipelines = useMemo(() =>
    pipelines.filter((p: { source?: string; disabled?: boolean }) =>
      (p.source === 'SOURCE_FILE_UPLOAD' || p.source === 'file_upload') && !p.disabled
    ),
    [pipelines]
  );

  // Build options for the pipeline selector
  const pipelineOptions = useMemo(() =>
    fileUploadPipelines.map((p: { id: string; name?: string }) => ({
      value: p.id,
      label: p.name || p.id,
    })),
    [fileUploadPipelines]
  );

  // Check if hobbyist is at the monthly sync limit
  const isAtLimit = user && getEffectiveTier(user) !== TIER_ATHLETE && (user.syncCountThisMonth || 0) >= 25;

  // Show skeleton while loading pipelines
  if (pipelinesLoading) {
    return <CardSkeleton variant="file-upload" />;
  }

  // Hide if no file upload pipeline configured
  if (!hasFileUploadPipeline) {
    return null;
  }

  const handleFileSelect = (selected: File) => {
    if (selected.name.toLowerCase().endsWith('.fit')) {
      setFile(selected);
      setMessage(null);
    } else {
      setMessage({ type: 'error', text: 'Please select a .fit file' });
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
      const base64Data = btoa(binary);

      const payload: Record<string, string | undefined> = {
        fitFileBase64: base64Data,
        title: title || undefined,
        description: description || undefined,
      };

      // Nerd Mode: target a specific pipeline
      if (nerdMode && selectedPipelineId) {
        payload.pipelineId = selectedPipelineId;
      }

      const data = await api.post('/parse-fit', payload);

      setMessage({
        type: 'success',
        text: data.message || 'Activity uploaded and queued for processing!'
      });

      setFile(null);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNerdModeToggle = () => {
    const next = !nerdMode;
    setNerdMode(next);
    if (!next) {
      setSelectedPipelineId('');
    }
  };

  // Show upgrade prompt if at tier limit
  if (isAtLimit) {
    return (
      <Card>
        <Stack gap="md">
          <CardHeader icon="📤" title="Upload FIT File" />
          <Stack gap="sm" align="center">
            <Paragraph muted>
              🔒 You&apos;ve reached your monthly sync limit (25/month).
            </Paragraph>
            <Button variant="primary" onClick={() => navigate('/settings/subscription')}>
              Upgrade for Unlimited Uploads →
            </Button>
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <Stack gap="md">
        <CardHeader icon="📤" title="Upload FIT File" />

        <Grid cols={2} gap="md">
          {/* Left: File Selection */}
          <Stack gap="sm">
            <Heading level={5}>Select File</Heading>
            <FileInput
              accept=".fit"
              placeholder="Click to select .fit file"
              fileName={file?.name}
              fileSize={file?.size}
              disabled={uploading}
              onFileSelect={handleFileSelect}
            />
          </Stack>

          {/* Right: Title & Description */}
          <Stack gap="sm">
            <Heading level={5}>Activity Details</Heading>
            <Stack gap="sm">
              <FormField label="Title" htmlFor="upload-title">
                <Input
                  id="upload-title"
                  type="text"
                  placeholder="Auto-generated if left blank"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                />
              </FormField>
              <FormField label="Description" htmlFor="upload-desc">
                <Textarea
                  id="upload-desc"
                  placeholder="Add notes about this activity..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading}
                  rows={2}
                />
              </FormField>
            </Stack>
          </Stack>
        </Grid>

        {/* Nerd Mode: Pipeline Selector */}
        {nerdMode && (
          <div className="nerd-mode-panel">
            <FormField label="Target Pipeline" htmlFor="nerd-pipeline">
              <Select
                id="nerd-pipeline"
                options={pipelineOptions}
                placeholder="All pipelines (default)"
                value={selectedPipelineId}
                onChange={(e) => setSelectedPipelineId(e.target.value)}
                disabled={uploading}
              />
            </FormField>
            {selectedPipelineId && (
              <Paragraph muted>
                ⚡ Activity will be sent only to this pipeline
              </Paragraph>
            )}
          </div>
        )}

        {/* Status message */}
        {message && (
          <Card variant={message.type === 'success' ? 'elevated' : 'default'}>
            <Paragraph>
              {message.type === 'success' ? '✓' : '✕'} {message.text}
            </Paragraph>
          </Card>
        )}

        {/* Upload button */}
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
          fullWidth
        >
          {uploading ? '⏳ Uploading...' : '🚀 Upload & Process'}
        </Button>

        {/* Nerd Mode Toggle */}
        <button
          type="button"
          className="nerd-mode-toggle"
          onClick={handleNerdModeToggle}
          disabled={uploading}
        >
          {nerdMode ? '🤓 Hide Nerd Mode' : '🤓 Nerd Mode'}
        </button>
      </Stack>
    </Card>
  );
};
