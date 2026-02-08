import React, { useRef } from 'react';
import { Stack } from '../../layout/Stack';
import { Paragraph } from '../../ui/Paragraph';
import './index.css';

export interface FileInputProps {
    /** File type filter, e.g. ".fit" */
    accept?: string;
    /** Callback when a file is selected */
    onFileSelect: (file: File) => void;
    /** Display name of the currently selected file */
    fileName?: string;
    /** Display size of the currently selected file (in bytes) */
    fileSize?: number;
    /** Disabled state */
    disabled?: boolean;
    /** Error state */
    error?: boolean;
    /** Prompt text when no file is selected */
    placeholder?: string;
    /** Additional class name */
    className?: string;
}

/**
 * FileInput - Standardised file upload dropzone with premium styling.
 * Features a clickable dropzone area with empty/selected states.
 */
export const FileInput: React.FC<FileInputProps> = ({
    accept,
    onFileSelect,
    fileName,
    fileSize,
    disabled = false,
    error = false,
    placeholder = 'Click to select file',
    className = '',
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const hasFile = !!fileName;

    const handleClick = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const dropzoneClasses = [
        'form-file-input__dropzone',
        hasFile && 'form-file-input__dropzone--has-file',
        disabled && 'form-file-input__dropzone--disabled',
        error && 'form-file-input__dropzone--error',
    ].filter(Boolean).join(' ');

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(1)} KB`;
    };

    return (
        <div className={`form-file-input ${className}`}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                disabled={disabled}
                className="form-file-input__hidden"
                onChange={handleChange}
            />
            <div
                className={dropzoneClasses}
                onClick={handleClick}
            >
                {hasFile ? (
                    <Stack gap="xs" align="center">
                        <Paragraph inline>📁</Paragraph>
                        <Paragraph inline bold>{fileName}</Paragraph>
                        {fileSize !== undefined && (
                            <Paragraph inline muted size="sm">{formatSize(fileSize)}</Paragraph>
                        )}
                    </Stack>
                ) : (
                    <Stack gap="xs" align="center">
                        <Paragraph inline>📂</Paragraph>
                        <Paragraph inline muted>{placeholder}</Paragraph>
                    </Stack>
                )}
            </div>
        </div>
    );
};

FileInput.displayName = 'FileInput';

export default FileInput;
