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
 * Accepts a FIT file and sends it to the file-upload-handler API.
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

  // Don't render if no file upload pipelines
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
      // Send minimal activity structure
      // In the future, this could use a WASM-based FIT parser client-side
      const activityPayload = {
        activity: {
          startTime: new Date().toISOString(),
          name: title || file.name.replace('.fit', ''),
          description: description || '',
          type: 0, // ACTIVITY_TYPE_UNSPECIFIED - will be enriched
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
        text: data.message || 'Activity uploaded! Processing through your pipelines...'
      });

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload-panel">
      <Card className="dashboard-card">
        <div className="file-upload-panel__header">
          <div className="file-upload-panel__header-left">
            <h3 className="file-upload-panel__title">
              <span className="file-upload-panel__title-icon">📤</span>
              Upload FIT File
            </h3>
            <p className="file-upload-panel__subtitle">
              Import activities from your devices
            </p>
          </div>
        </div>

        <div className="file-upload-panel__content">
          {/* Drop zone / file input */}
          <div
            className={`file-upload-panel__dropzone ${file ? 'file-upload-panel__dropzone--has-file' : ''}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".fit"
              onChange={handleFileSelect}
              disabled={uploading}
              className="file-upload-panel__input"
            />
            {file ? (
              <div className="file-upload-panel__file-info">
                <span className="file-upload-panel__file-icon">📁</span>
                <span className="file-upload-panel__file-name">{file.name}</span>
                <span className="file-upload-panel__file-size">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ) : (
              <div className="file-upload-panel__dropzone-prompt">
                <span className="file-upload-panel__dropzone-icon">📂</span>
                <span>Click to select a .fit file</span>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="file-upload-panel__fields">
            <input
              type="text"
              placeholder="Activity title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              className="file-upload-panel__text-input"
            />

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              className="file-upload-panel__text-input file-upload-panel__textarea"
              rows={2}
            />
          </div>

          {/* Upload button */}
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="file-upload-panel__button"
          >
            {uploading ? (
              <>
                <span className="file-upload-panel__spinner">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <span>🚀</span>
                Upload & Process
              </>
            )}
          </Button>

          {/* Status message */}
          {message && (
            <div className={`file-upload-panel__message file-upload-panel__message--${message.type}`}>
              {message.type === 'success' ? '✓' : '✕'} {message.text}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
