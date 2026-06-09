import { useEffect, useRef, useState } from 'react';
import { client } from '../../../shared/api/client';
import { logger } from '../../../shared/logger';

interface UploadedPhoto {
    publicUrl: string;
    previewUrl: string;
}

interface Props {
    activityId: string;
    value: string;
    onChange: (value: string) => void;
}

const MAX_PHOTOS = 10;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_CLIENT_DIM = 1920;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

/**
 * Resize an image to at most MAX_CLIENT_DIM on the longest side and re-encode as JPEG.
 * HEIC files are returned unchanged — browsers can't decode them via Canvas.
 * Falls back to the original file on any error.
 */
async function resizeImage(file: File): Promise<{ blob: Blob; contentType: string }> {
    if (file.type === 'image/heic') {
        return { blob: file, contentType: file.type };
    }
    try {
        const bitmap = await createImageBitmap(file);
        const { width, height } = bitmap;

        let newW = width;
        let newH = height;
        if (width > MAX_CLIENT_DIM || height > MAX_CLIENT_DIM) {
            if (width > height) {
                newW = MAX_CLIENT_DIM;
                newH = Math.round(height * MAX_CLIENT_DIM / width);
            } else {
                newH = MAX_CLIENT_DIM;
                newW = Math.round(width * MAX_CLIENT_DIM / height);
            }
        }

        const canvas = document.createElement('canvas');
        canvas.width = newW;
        canvas.height = newH;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(bitmap, 0, 0, newW, newH);
        bitmap.close();

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.85);
        });
        return { blob, contentType: 'image/jpeg' };
    } catch (err) {
        logger.warn('Photo resize failed, uploading original', err);
        return { blob: file, contentType: file.type };
    }
}

export const PhotoUploadInput: React.FC<Props> = ({ activityId, value, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [error, setError] = useState('');

    // Initialise value to "[]" on mount so the required-field check passes.
    useEffect(() => {
        if (!value) {
            onChange('[]');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const syncToParent = (updated: UploadedPhoto[]) => {
        onChange(JSON.stringify(updated.map(p => p.publicUrl)));
    };

    const handleFilesSelected = async (files: FileList) => {
        setError('');
        const remaining = MAX_PHOTOS - photos.length;
        const toUpload = Array.from(files).slice(0, remaining);

        if (toUpload.length === 0) {
            setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
            return;
        }

        for (const file of toUpload) {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                setError(`Unsupported file type: ${file.type}. Use JPEG, PNG, WebP, or HEIC.`);
                return;
            }
            if (file.size > MAX_SIZE_BYTES) {
                setError(`${file.name} exceeds the 10MB limit.`);
                return;
            }
        }

        setUploading(true);

        const newPhotos: UploadedPhoto[] = [];
        for (let i = 0; i < toUpload.length; i++) {
            const file = toUpload[i];
            setUploadStatus(`Resizing ${i + 1} of ${toUpload.length}…`);
            const { blob: uploadBlob, contentType: uploadContentType } = await resizeImage(file);

            setUploadStatus(`Uploading ${i + 1} of ${toUpload.length}…`);
            try {
                const { data, error: apiErr } = await client.POST('/users/me/activity-photos/upload-url', {
                    body: {
                        activityId,
                        filename: file.name,
                        contentType: uploadContentType,
                    } as never,
                });
                if (apiErr || !data) throw new Error('Failed to get upload URL');

                const typed = data as unknown as {
                    uploadUrl: string;
                    publicUrl: string;
                    contentType: string;
                    maxSizeBytes: number;
                };

                const uploadRes = await fetch(typed.uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': typed.contentType,
                        'x-goog-content-length-range': `0,${typed.maxSizeBytes}`,
                    },
                    body: uploadBlob,
                });
                if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

                newPhotos.push({
                    publicUrl: typed.publicUrl,
                    previewUrl: URL.createObjectURL(file),
                });
            } catch (err) {
                setError(`Failed to upload ${file.name}. Please try again.`);
                logger.error('Photo upload error:', err);
                break;
            }
        }

        setUploading(false);
        setUploadStatus('');

        if (newPhotos.length > 0) {
            const updated = [...photos, ...newPhotos];
            setPhotos(updated);
            syncToParent(updated);
        }
    };

    const removePhoto = (index: number) => {
        const updated = photos.filter((_, i) => i !== index);
        URL.revokeObjectURL(photos[index].previewUrl);
        setPhotos(updated);
        syncToParent(updated);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Status / count line — mono label */}
            <p style={{
                margin: 0,
                fontFamily: 'var(--fg-font-mono)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
            }}>
                {photos.length === 0
                    ? 'Add up to 10 photos (optional)'
                    : `${photos.length} photo${photos.length === 1 ? '' : 's'} added — ${MAX_PHOTOS - photos.length} remaining`
                }
            </p>

            {/* Photo grid */}
            {photos.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '4px',
                }}>
                    {photos.map((photo, index) => (
                        <div key={photo.publicUrl} style={{ position: 'relative' }}>
                            <img
                                src={photo.previewUrl}
                                alt={`Photo ${index + 1}`}
                                style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    objectFit: 'cover',
                                    borderRadius: 0,
                                    display: 'block',
                                }}
                            />
                            {/* Remove button — BA ink overlay */}
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                style={{
                                    position: 'absolute',
                                    top: '3px',
                                    right: '3px',
                                    background: 'rgba(10,10,15,0.75)',
                                    color: 'var(--fg-paper)',
                                    border: 'none',
                                    borderRadius: 0,
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--fg-font-display)',
                                    fontSize: '12px',
                                    lineHeight: '20px',
                                    textAlign: 'center',
                                    padding: 0,
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload progress */}
            {uploading && (
                <p style={{
                    margin: 0,
                    fontFamily: 'var(--fg-font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--fg-cyan)',
                }}>
                    {uploadStatus}
                </p>
            )}

            {/* Error */}
            {error && (
                <p style={{
                    margin: 0,
                    fontFamily: 'var(--fg-font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--fg-rose)',
                }}>
                    {error}
                </p>
            )}

            {/* Drop zone / add button — dashed hairline, BA ink-3 bg */}
            {photos.length < MAX_PHOTOS && (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ACCEPTED_TYPES.join(',')}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            if (e.target.files) {
                                handleFilesSelected(e.target.files);
                                e.target.value = '';
                            }
                        }}
                    />
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            padding: '1.5rem',
                            border: 0,
                            borderRadius: 0,
                            /* dashed drop zone outline */
                            outline: '1.5px dashed rgba(245,243,235,0.2)',
                            outlineOffset: '-1px',
                            background: 'var(--fg-ink-3)',
                            color: uploading
                                ? 'var(--color-text-muted)'
                                : 'var(--fg-paper)',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--fg-font-mono)',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            width: '100%',
                            transition: 'outline-color 0.15s ease, color 0.15s ease',
                        }}
                    >
                        {uploading ? 'Uploading…' : 'Upload Photo'}
                    </button>
                </>
            )}
        </div>
    );
};
