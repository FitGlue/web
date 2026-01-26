import React from 'react';
import './LiveToggle.css';

interface LiveToggleProps {
  /** Whether live updates are enabled */
  isEnabled: boolean;
  /** Whether currently listening/connected */
  isListening: boolean;
  /** Toggle handler */
  onToggle: () => void;
  /** Optional label (default: "Live") */
  label?: string;
}

/**
 * LiveToggle - Toggle button for real-time update modes.
 * Shows connection status with animated indicator.
 */
export const LiveToggle: React.FC<LiveToggleProps> = ({
  isEnabled,
  isListening,
  onToggle,
  label = 'Live',
}) => {
  return (
    <button
      className={`live-toggle ${isListening ? 'live-toggle--active' : ''}`}
      onClick={onToggle}
      title={isEnabled ? 'Disable live updates' : 'Enable live updates'}
    >
      <span className="live-toggle__dot" />
      {label}
    </button>
  );
};

export default LiveToggle;
