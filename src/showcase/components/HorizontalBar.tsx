import React from 'react';

interface Props {
  label: string;
  percentage: number;
  fillColor?: string;
  fillClass?: string;
  rightContent?: React.ReactNode;
  animationDelay?: string;
}

export const HorizontalBar: React.FC<Props> = ({ label, percentage, fillColor, fillClass, rightContent, animationDelay }) => (
  <div className="h-bar-row" style={animationDelay ? { animationDelay } : undefined}>
    <span className="h-bar-label">{label}</span>
    <div className="h-bar-track">
      <div
        className={`h-bar-fill${fillClass ? ` ${fillClass}` : ''}`}
        style={{ width: `${percentage}%`, ...(fillColor ? { background: fillColor } : {}) }}
      />
    </div>
    {rightContent && <div className="h-bar-right">{rightContent}</div>}
  </div>
);
