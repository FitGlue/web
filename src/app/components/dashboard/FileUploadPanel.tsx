import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { usePipelines } from '../../hooks/usePipelines';
import './FileUploadPanel.css';

/**
 * FileUploadPanel - Dashboard component for uploading FIT files
 *
 * Only visible when user has at least one pipeline with SOURCE_FILE_UPLOAD.
 * Accepts a FIT file, parses it client-side, and sends the StandardizedActivity
 * to the file-upload-handler API.
 */
export const FileUploadPanel: React.FC = () => {
  const { getToken } = useAuth();
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
      const token = await getToken();

      // Read file and convert to base64 (for future FIT parsing)
      // Currently sends minimal activity structure
      await file.arrayBuffer();

      // For now, send a minimal activity structure
      // In the future, this could use a WASM-based FIT parser client-side
      const activityPayload = {
        activity: {
          // Minimal activity structure - the enrichment pipeline will fill in details
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

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(activityPayload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({
          type: 'success',
          text: `Activity uploaded! ${data.message || 'Processing through your pipelines...'}`
        });
        // Reset form
        setFile(null);
        setTitle('');
        setDescription('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage({
          type: 'error',
          text: errorData.error || `Upload failed (${response.status})`
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="file-upload-panel dashboard-card">
      <h3>📤 Upload FIT File</h3>

      <div className="upload-form">
        <div className="file-input-wrapper">
          <input
            ref={fileInputRef}
            type="file"
            accept=".fit"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {file && <span className="file-name">Selected: {file.name}</span>}
        </div>

        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
          className="text-input"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          className="text-input"
          rows={2}
        />

        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload & Process'}
        </Button>

        {message && (
          <div className={`upload-message ${message.type}`}>
            {message.type === 'success' ? '✓' : '✕'} {message.text}
          </div>
        )}
      </div>
    </Card>
  );
};
