import React from 'react';
import './IdBadge.css';

interface IdBadgeProps {
  /** The full ID to truncate and display */
  id: string;
  /** Prefix to strip before displaying (e.g., 'pipe_', 'act_') */
  stripPrefix?: string;
  /** Number of characters to show (default: 8) */
  showChars?: number;
  /** Show copy button */
  copyable?: boolean;
}

/**
 * IdBadge - Truncated ID display with optional copy-to-clipboard.
 * Used for pipeline IDs, activity IDs, etc.
 */
export const IdBadge: React.FC<IdBadgeProps> = ({
  id,
  stripPrefix,
  showChars = 8,
  copyable = false,
}) => {
  const displayId = stripPrefix
    ? id.replace(stripPrefix, '').slice(0, showChars)
    : id.slice(0, showChars);

  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(id);
    }
  };

  return (
    <code
      className={`id-badge ${copyable ? 'id-badge--copyable' : ''}`}
      onClick={copyable ? handleCopy : undefined}
      title={copyable ? `Click to copy: ${id}` : id}
    >
      {displayId}...
    </code>
  );
};

export default IdBadge;
