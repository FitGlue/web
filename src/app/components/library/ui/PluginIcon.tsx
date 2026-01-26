import React from 'react';
import './PluginIcon.css';

interface PluginIconProps {
  icon?: string;
  iconType?: string;
  iconPath?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * PluginIcon component - renders either an emoji or an image icon
 * based on whether iconType and iconPath are provided.
 *
 * @param icon - Emoji fallback icon
 * @param iconType - Type of icon (svg, png, jpg)
 * @param iconPath - Path to the icon image
 * @param size - Size variant (small: 28px, medium: 40px, large: 3.5rem)
 */
export const PluginIcon: React.FC<PluginIconProps> = ({
  icon = '',
  iconType,
  iconPath,
  size = 'medium',
}) => {
  // If we have both iconType and iconPath, render an image
  if (iconType && iconPath) {
    return (
      <img
        src={iconPath}
        alt=""
        className={`plugin-icon plugin-icon-${iconType} plugin-icon-${size}`}
      />
    );
  }

  // Otherwise, render the emoji fallback
  return (
    <span className={`plugin-icon plugin-icon-emoji plugin-icon-${size}`}>
      {icon}
    </span>
  );
};
