import React from 'react';
import { Button } from './Button';
import { MultiRingSpinner } from './MultiRingSpinner';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Dialog title */
  title: string;
  /** Description/message text */
  message: string;
  /** Confirm button text (default: "Confirm") */
  confirmLabel?: string;
  /** Cancel button text (default: "Cancel") */
  cancelLabel?: string;
  /** Confirm action is destructive (uses danger styling) */
  isDestructive?: boolean;
  /** Called when user confirms */
  onConfirm: () => void;
  /** Called when user cancels or clicks backdrop */
  onCancel: () => void;
  /** Show loading state on confirm button */
  isLoading?: boolean;
}

/**
 * ConfirmDialog - A branded modal dialog to replace window.confirm()
 * with proper styling and accessibility.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div onClick={onCancel}>
      <div onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <MultiRingSpinner size="sm" /> : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
