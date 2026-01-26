import React, { useState, useRef } from 'react';
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
import { useApi } from '../../hooks/useApi';
import { usePipelines } from '../../hooks/usePipelines';
import './FileUploadPanel.css';

/**
 * FileUploadPanel - Dashboard component for uploading FIT files
 */
export const FileUploadPanel: React.FC = () => {
  const api = useApi();
  const { pipelines, loading: pipelinesLoading, loaded: pipelinesLoaded } = usePipelines();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const hasFileUploadPipeline = pipelines.some(p =>
    p.source === 'SOURCE_FILE_UPLOAD' || p.source === 'file_upload'
  );

  // Show skeleton while loading pipelines
  if (pipelinesLoading && !pipelinesLoaded) {
    return <CardSkeleton variant="file-upload" />;
  }

  // Hide if no file upload pipeline configured
  if (!hasFileUploadPipeline) {
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.name.toLowerCase().endsWith('.fit')) {
        setFile(selected);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'Please select a .fit file' });
        setFile(null);
      }
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

      const payload = {
        fitFileBase64: base64Data,
        title: title || file.name.replace('.fit', ''),
        description: description || undefined,
      };

      const data = await api.post('/parse-fit', payload);

      setMessage({
        type: 'success',
        text: data.message || 'Activity uploaded and queued for processing!'
      });

      setFile(null);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  return (
    <Card>
      <Stack gap="md">
        <CardHeader icon="📤" title="Upload FIT File" />

        <Grid cols={2} gap="md">
          {/* Left: File Selection */}
          <Stack gap="sm">
            <Heading level={5}>Select File</Heading>
            {/* Using div for clickable dropzone - Card onClick doesn't fit this pattern */}
            <div
              className={`upload-dropzone ${file ? 'has-file' : ''}`}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {/* Hidden file input - semantic HTML form element */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".fit"
                onChange={handleFileSelect}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              {file ? (
                <Stack gap="xs" align="center">
                  <Paragraph inline>📁</Paragraph>
                  <Paragraph inline bold>{file.name}</Paragraph>
                  <Paragraph inline muted size="sm">{(file.size / 1024).toFixed(1)} KB</Paragraph>
                </Stack>
              ) : (
                <Stack gap="xs" align="center">
                  <Paragraph inline>📂</Paragraph>
                  <Paragraph inline muted>Click to select .fit file</Paragraph>
                </Stack>
              )}
            </div>
          </Stack>

          {/* Right: Title & Description */}
          <Stack gap="sm">
            <Heading level={5}>Activity Details</Heading>
            <Stack gap="sm">
              <FormField label="Title" htmlFor="upload-title">
                <Input
                  id="upload-title"
                  type="text"
                  placeholder="e.g., Morning Run"
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
      </Stack>
    </Card>
  );
};
