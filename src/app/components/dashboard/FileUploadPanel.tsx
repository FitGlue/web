import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useApi } from '../../hooks/useApi';
import { usePipelines } from '../../hooks/usePipelines';
import './FileUploadPanel.css';

/**
 * FileUploadPanel - Dashboard component for uploading FIT files
 *
 * Only visible when user has at least one pipeline with SOURCE_FILE_UPLOAD.
 */
export const FileUploadPanel: React.FC = () => {
  const api = useApi();
  const { pipelines } = usePipelines();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if user has any FILE_UPLOAD pipelines
  const hasFileUploadPipeline = pipelines.some(p =>
    p.source === 'SOURCE_FILE_UPLOAD' || p.source === 'file_upload'
  );

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
      const activityPayload = {
        activity: {
          startTime: new Date().toISOString(),
          name: title || file.name.replace('.fit', ''),
          description: description || '',
          type: 0,
          sessions: [],
          tags: [],
          notes: '',
        },
        title: title || undefined,
        description: description || undefined,
      };

      const data = await api.post('/upload', activityPayload);

      setMessage({
        type: 'success',
        text: data.message || 'Activity queued for processing!'
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
    <Card className="dashboard-card upload-card">
      <div className="card-header-row">
        <h3>📤 Upload FIT File</h3>
      </div>

      <div className="upload-content">
        {/* File selection row */}
        <div className="upload-file-row">
          <input
            ref={fileInputRef}
            type="file"
            accept=".fit"
            onChange={handleFileSelect}
            disabled={uploading}
            id="fit-file-input"
            style={{ display: 'none' }}
          />
          <Button
            variant="secondary"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Choose File
          </Button>
          <span className="file-name-display">
            {file ? file.name : 'No file selected'}
          </span>
        </div>

        {/* Optional fields */}
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
          className="upload-text-input"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          className="upload-text-input upload-textarea"
          rows={2}
        />

        {/* Status message */}
        {message && (
          <div className={`upload-message ${message.type}`}>
            {message.type === 'success' ? '✓' : '✕'} {message.text}
          </div>
        )}
      </div>

      {/* Footer with upload button */}
      <div className="upload-footer">
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload & Process'}
        </Button>
      </div>
    </Card>
  );
};
