import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../../shared/api/client';
import { useRealtimePipelines } from '../../hooks/useRealtimePipelines';
import { useUser } from '../../hooks/useUser';
import { useNerdMode } from '../../state/NerdModeContext';
import { getEffectiveTier, TIER_ATHLETE, HOBBYIST_TIER_LIMITS } from '../../utils/tier';
import { DashboardBand } from '../library/ui/DashboardBand';
import { Select, FormField } from '../library/forms';

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

export const UploadSection: React.FC = () => {
    const navigate = useNavigate();
    const { pipelines, loading: pipelinesLoading } = useRealtimePipelines();
    const { user } = useUser();
    const { isNerdMode } = useNerdMode();

    const inputRef = useRef<HTMLInputElement>(null);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedPipelineId, setSelectedPipelineId] = useState('');

    const hasFileUploadPipeline = pipelines.some((p: { source?: string }) =>
        p.source === 'SOURCE_FILE_UPLOAD' || p.source === 'file_upload'
    );

    const fileUploadPipelines = useMemo(() =>
        pipelines.filter((p: { source?: string; disabled?: boolean }) =>
            (p.source === 'SOURCE_FILE_UPLOAD' || p.source === 'file_upload') && !p.disabled
        ),
        [pipelines]
    );

    const pipelineOptions = useMemo(() =>
        fileUploadPipelines.map((p: { id: string; name?: string }) => ({
            value: p.id,
            label: p.name || p.id,
        })),
        [fileUploadPipelines]
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

    const uploadOne = async (item: QueueItem): Promise<void> => {
        const arrayBuffer = await item.file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        bytes.forEach(byte => { binary += String.fromCharCode(byte); });
        const base64Data = btoa(binary);

        const payload: Record<string, string | undefined> = { fitFileContent: base64Data };
        if (isNerdMode && selectedPipelineId) payload.pipelineId = selectedPipelineId;

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
    };

    if (pipelinesLoading || !hasFileUploadPipeline) return null;

    if (isAtLimit) {
        return (
            <>
                <DashboardBand label="📤 Upload FIT" right="LOCKED" />
                <div className="upload-locked">
                    <div className="upload-locked__msg">
                        🔒 Monthly sync limit reached ({HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH}/month)
                    </div>
                    <button
                        className="fg-button fg-button--sm"
                        onClick={() => navigate('/settings/subscription')}
                    >
                        UPGRADE →
                    </button>
                </div>
            </>
        );
    }

    const pendingCount = queue.filter(i => i.status === 'pending').length;
    const hasQueue = queue.length > 0;
    const allDone = hasQueue && pendingCount === 0 && !uploading;

    return (
        <>
            <DashboardBand label="📤 Upload FIT" right="DRAG OR CLICK" />

            <input
                ref={inputRef}
                type="file"
                accept=".fit"
                multiple
                className="form-file-input__hidden"
                onChange={e => handleFilesSelected(e.target.files)}
            />

            {!hasQueue && (
                <div
                    className="upload-dropzone"
                    onClick={handleDropzoneClick}
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                >
                    <div className="upload-dropzone__icon">📂</div>
                    <div className="upload-dropzone__title">DROP .FIT FILES HERE</div>
                    <div className="upload-dropzone__meta">SELECT ONE OR MANY · MAX 50/BATCH</div>
                </div>
            )}

            {hasQueue && (
                <div className="upload-queue">
                    {queue.map(item => (
                        <div key={item.id} className={`upload-queue__item upload-queue__item--${item.status}`}>
                            <span className="upload-queue__name" title={item.file.name}>{item.file.name}</span>
                            <span className="upload-queue__size">{formatSize(item.file.size)}</span>
                            <span className="upload-queue__status">
                                {item.status === 'success' && '✓'}
                                {item.status === 'error' && '✕'}
                                {item.status === 'uploading' && '⬆'}
                                {item.status === 'pending' && '⏳'}
                            </span>
                        </div>
                    ))}
                    {isNerdMode && (
                        <div style={{ padding: '0.5rem 1.25rem' }}>
                            <FormField label="Target Pipeline" htmlFor="upload-pipeline">
                                <Select
                                    id="upload-pipeline"
                                    options={pipelineOptions}
                                    placeholder="All pipelines (default)"
                                    value={selectedPipelineId}
                                    onChange={e => setSelectedPipelineId(e.target.value)}
                                    disabled={uploading}
                                />
                            </FormField>
                        </div>
                    )}
                    {!allDone && (
                        <div style={{ padding: '0.5rem 1.25rem' }}>
                            <button
                                className="fg-button fg-button--sm"
                                onClick={handleUpload}
                                disabled={pendingCount === 0 || uploading}
                            >
                                {uploading ? '⬆ UPLOADING…' : `🚀 UPLOAD ${pendingCount} FILE${pendingCount !== 1 ? 'S' : ''}`}
                            </button>
                            <button
                                className="fg-button fg-button--ghost fg-button--sm"
                                style={{ marginLeft: '0.5rem' }}
                                onClick={() => setQueue([])}
                                disabled={uploading}
                            >
                                CLEAR
                            </button>
                        </div>
                    )}
                    {allDone && (
                        <div style={{ padding: '0.5rem 1.25rem' }}>
                            <button className="fg-button fg-button--ghost fg-button--sm" onClick={() => setQueue([])}>
                                UPLOAD MORE →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
