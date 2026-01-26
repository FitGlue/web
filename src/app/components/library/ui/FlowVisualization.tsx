import React, { ReactNode } from 'react';
import './FlowVisualization.css';

interface FlowVisualizationProps {
  /** Source node (left side) */
  source: ReactNode;
  /** Center content - typically boosters/enrichers */
  center: ReactNode;
  /** Destination node (right side) */
  destination: ReactNode;
}

/**
 * FlowVisualization - Shows a visual flow from source through processing to destination.
 * Layout: [Source] → [Center Content] → [Destination]
 * The center content gets the most space and wraps as needed.
 */
export const FlowVisualization: React.FC<FlowVisualizationProps> = ({
  source,
  center,
  destination,
}) => {
  return (
    <div className="flow-visualization">
      <div className="flow-visualization__source">
        {source}
      </div>
      <div className="flow-visualization__arrow">→</div>
      <div className="flow-visualization__center">
        {center}
      </div>
      <div className="flow-visualization__arrow">→</div>
      <div className="flow-visualization__destination">
        {destination}
      </div>
    </div>
  );
};

export default FlowVisualization;
