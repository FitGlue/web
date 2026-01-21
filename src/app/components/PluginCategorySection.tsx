import React, { useState } from 'react';
import { Card } from './ui/Card';
import { PremiumBadge } from './ui/PremiumBadge';
import { PluginManifest } from '../types/plugin';
import { PluginCategory } from '../utils/pluginCategories';
import './PluginCategorySection.css';

interface PluginCategorySectionProps {
  category: PluginCategory;
  plugins: PluginManifest[];
  selectedIds: string[];
  onSelect: (plugin: PluginManifest) => void;
  onInfoClick?: (plugin: PluginManifest) => void;
  disabledPlugins?: Set<string>;
  getDisabledReason?: (plugin: PluginManifest) => string | undefined;
  defaultExpanded?: boolean;
}

export const PluginCategorySection: React.FC<PluginCategorySectionProps> = ({
  category,
  plugins,
  selectedIds,
  onSelect,
  onInfoClick,
  disabledPlugins = new Set(),
  getDisabledReason,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (plugins.length === 0) return null;

  return (
    <div className="plugin-category-section">
      <button
        className="category-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        type="button"
      >
        <span className="category-emoji">{category.emoji}</span>
        <span className="category-name">{category.name}</span>
        <span className="category-count">{plugins.length}</span>
        <span className={`category-chevron ${expanded ? 'expanded' : ''}`}>
          ▾
        </span>
      </button>

      {expanded && (
        <div className="category-plugins">
          {plugins.map((plugin) => {
            const isSelected = selectedIds.includes(plugin.id);
            const isDisabled = disabledPlugins.has(plugin.id);
            const disabledReason = getDisabledReason?.(plugin);

            return (
              <Card
                key={plugin.id}
                className={`option-card clickable
                  ${isSelected ? 'selected' : ''}
                  ${isDisabled ? 'disabled' : ''}
                  ${plugin.isPremium ? 'premium' : ''}`}
                onClick={() => !isDisabled && onSelect(plugin)}
              >
                <div className="plugin-card-header">
                  {/* Render SVG or emoji icon based on iconType */}
                  {plugin.iconType === 'svg' && plugin.iconPath ? (
                    <img
                      src={plugin.iconPath}
                      alt=""
                      className="option-icon-svg"
                    />
                  ) : (
                    <span className="option-icon">{plugin.icon}</span>
                  )}
                  {plugin.isPremium && <PremiumBadge />}
                </div>
                <h4>{plugin.name}</h4>
                <p>{plugin.description}</p>
                {isSelected && <span className="selected-check">✓</span>}
                {isDisabled && disabledReason && (
                  <span className="disabled-reason">{disabledReason}</span>
                )}
                {onInfoClick && (
                  <button
                    className="info-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInfoClick(plugin);
                    }}
                    aria-label={`More info about ${plugin.name}`}
                    type="button"
                  >
                    ⓘ
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
