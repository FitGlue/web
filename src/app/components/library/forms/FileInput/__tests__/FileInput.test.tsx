import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileInput } from '../index';

describe('FileInput', () => {
  it('renders placeholder when no file selected', () => {
    render(<FileInput onFileSelect={vi.fn()} placeholder="Pick a file" />);
    expect(screen.getByText('Pick a file')).toBeInTheDocument();
  });

  it('renders selected file name and formatted size', () => {
    render(
      <FileInput onFileSelect={vi.fn()} fileName="run.fit" fileSize={2048} />,
    );
    expect(screen.getByText('run.fit')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('applies disabled and error dropzone classes', () => {
    const { container } = render(
      <FileInput onFileSelect={vi.fn()} disabled error />,
    );
    const dropzone = container.querySelector('.form-file-input__dropzone');
    expect(dropzone).toHaveClass('form-file-input__dropzone--disabled');
    expect(dropzone).toHaveClass('form-file-input__dropzone--error');
  });

  it('calls onFileSelect when a file is chosen', async () => {
    const onFileSelect = vi.fn();
    const { container } = render(<FileInput onFileSelect={onFileSelect} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'sample.fit', { type: 'application/octet-stream' });
    await userEvent.upload(input, file);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
