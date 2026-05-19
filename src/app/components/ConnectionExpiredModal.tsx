import React from 'react';
import { Modal } from './library/ui/Modal';
import { Button } from './library/ui/Button';
import './ConnectionExpiredModal.css';

interface ConnectionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrationName: string;
  integrationIcon: string;
  queuedCount: number;
  onReconnect: () => void;
}

const ConnectionExpiredModal: React.FC<ConnectionExpiredModalProps> = ({
  isOpen,
  onClose,
  integrationName,
  integrationIcon,
  queuedCount,
  onReconnect,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      danger
      title={`⚠ ${integrationName} token expired`}
      footer={
        <>
          <div style={{ marginRight: 'auto' }}>
            <Button variant="ghost" onClick={onClose}>
              DISMISS
            </Button>
          </div>
          <Button variant="primary" onClick={onReconnect}>
            {`RECONNECT ${integrationName.toUpperCase()} →`}
          </Button>
        </>
      }
    >
      <div className="conn-expired-status">
        <div className="conn-expired-status__icon">{integrationIcon}</div>
        <div>
          <div className="conn-expired-status__title">
            {integrationName} · TOKEN EXPIRED
          </div>
          <div className="conn-expired-status__queue">
            {queuedCount} {queuedCount === 1 ? 'activity' : 'activities'} waiting to sync
          </div>
        </div>
      </div>
      <p className="conn-expired-body">
        Your {integrationName} connection has expired. Reconnect to resume syncing.
      </p>
    </Modal>
  );
};

export default ConnectionExpiredModal;
