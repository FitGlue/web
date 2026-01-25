import React from 'react';
import './FlowArrow.css';

interface FlowArrowProps {
  /** Direction of the arrow */
  direction?: 'right' | 'down';
  /** Size variant */
  size?: 'small' | 'default';
  /** Optional label text */
  label?: string;
}

/**
 * FlowArrow - Connector arrow for flow visualizations.
 * Used between nodes in pipeline displays.
 */
export const FlowArrow: React.FC<FlowArrowProps> = ({
  direction = 'right',
  size = 'default',
  label,
}) => {
  return (
    <div className={`flow-arrow flow-arrow--${direction} flow-arrow--${size}`}>
      <span className="flow-arrow__icon">
        {direction === 'right' ? '→' : '↓'}
      </span>
      {label && <span className="flow-arrow__label">{label}</span>}
    </div>
  );
};

export default FlowArrow;
