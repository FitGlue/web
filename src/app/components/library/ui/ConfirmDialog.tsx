import React from 'react';
import { Button } from './Button';
import { MultiRingSpinner } from './MultiRingSpinner';
import { Modal } from './Modal';

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
 * with proper styling and accessibility. Now uses the Modal shell pattern:
 * paper outline (or rose for danger), head/body/CTA.
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      danger={isDestructive}
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <MultiRingSpinner size="sm" /> : confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0, fontFamily: 'var(--fg-font-body)', fontSize: '0.9375rem', color: 'var(--fg-paper-dim)', lineHeight: 1.55 }}>
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmDialog;
