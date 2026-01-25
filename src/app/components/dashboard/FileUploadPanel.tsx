import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { Button } from '../ui/Button';
import { Input, Textarea, FormField } from '../forms';
import { useApi } from '../../hooks/useApi';
import { usePipelines } from '../../hooks/usePipelines';
import './FileUploadPanel.css';

/**
 * FileUploadPanel - Dashboard component for uploading FIT files
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
      // Read file as ArrayBuffer and convert to base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
      const base64Data = btoa(binary);

      // Send to fit-parser handler
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
    <Card className="dashboard-card upload-card">
      <CardHeader icon="📤" title="Upload FIT File" />

      <div className="upload-grid">
        {/* Left: File Selection */}
        <div className="upload-subcard">
          <div className="subcard-label">Select File</div>
          <div
            className={`upload-dropzone ${file ? 'has-file' : ''}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".fit"
              onChange={handleFileSelect}
              disabled={uploading}
              className="upload-file-input"
            />
            {file ? (
              <>
                <span className="dropzone-icon">📁</span>
                <span className="dropzone-filename">{file.name}</span>
                <span className="dropzone-size">{(file.size / 1024).toFixed(1)} KB</span>
              </>
            ) : (
              <>
                <span className="dropzone-icon">📂</span>
                <span className="dropzone-text">Click to select .fit file</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Title & Description */}
        <div className="upload-subcard">
          <div className="subcard-label">Activity Details</div>
          <div className="upload-fields">
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
          </div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className={`upload-message ${message.type}`}>
          {message.type === 'success' ? '✓' : '✕'} {message.text}
        </div>
      )}

      {/* Full-width upload button */}
      <div className="upload-action">
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? '⏳ Uploading...' : '🚀 Upload & Process'}
        </Button>
      </div>
    </Card>
  );
};
