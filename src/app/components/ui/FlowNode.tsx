import React from 'react';
import { PluginIcon } from './PluginIcon';
import './FlowNode.css';

interface FlowNodeProps {
  /** Icon for the node */
  icon?: string;
  /** Icon type if using image */
  iconType?: string;
  /** Path to icon image */
  iconPath?: string;
  /** Node label */
  label: string;
  /** Node type for styling */
  type: 'source' | 'destination' | 'enricher';
  /** Optional badge count */
  badgeCount?: number;
}

/**
 * FlowNode - Visual node in a pipeline flow visualization.
 * Represents sources, destinations, or enrichers.
 */
export const FlowNode: React.FC<FlowNodeProps> = ({
  icon,
  iconType,
  iconPath,
  label,
  type,
  badgeCount,
}) => {
  return (
    <div className={`flow-node flow-node--${type}`}>
      <div className="flow-node__icon">
        <PluginIcon icon={icon} iconType={iconType} iconPath={iconPath} size="small" />
      </div>
      <span className="flow-node__label">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="flow-node__badge">{badgeCount}</span>
      )}
    </div>
  );
};

export default FlowNode;
