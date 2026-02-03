import React, { useState } from 'react';
import { Card } from './library/ui/Card';
import { PremiumBadge } from './library/ui/PremiumBadge';
import { Button } from './library/ui/Button';
import { Badge } from './library/ui/Badge';
import { Stack } from './library/layout/Stack';
import { Heading } from './library/ui/Heading';
import { Paragraph } from './library/ui/Paragraph';
import { PluginIcon } from './library/ui/PluginIcon';
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
  defaultExpanded = false, // Changed default to collapsed
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (plugins.length === 0) return null;

  const boosterLabel = plugins.length === 1 ? 'booster' : 'boosters';

  return (
    <div className="plugin-category-section">
      {/* Enhanced category header */}
      <button
        className="plugin-category-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        type="button"
      >
        <span className="plugin-category-header__emoji">{category.emoji}</span>
        <span className="plugin-category-header__name">{category.name}</span>
        <span className="plugin-category-header__count">{plugins.length} {boosterLabel}</span>
        <span className={`plugin-category-header__chevron ${expanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="plugin-category-list">
          <Stack gap="sm">
            {plugins.map((plugin) => {
              const isSelected = selectedIds.includes(plugin.id);
              const isDisabled = disabledPlugins.has(plugin.id);
              const disabledReason = getDisabledReason?.(plugin);

              return (
                <div
                  key={plugin.id}
                  className={`plugin-category-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                >
                  <Card
                    onClick={() => !isDisabled && onSelect(plugin)}
                    variant={isSelected ? 'elevated' : 'default'}
                  >
                    <Stack gap="sm">
                      <Stack direction="horizontal" gap="sm" align="center" justify="between">
                        <Stack direction="horizontal" gap="sm" align="center">
                          <PluginIcon
                            icon={plugin.icon}
                            iconType={plugin.iconType}
                            iconPath={plugin.iconPath}
                            size="medium"
                          />
                          {plugin.isPremium && <PremiumBadge />}
                        </Stack>
                        <Stack direction="horizontal" gap="sm" align="center">
                          {isSelected && <Badge variant="success" size="sm">✓</Badge>}
                          {onInfoClick && (
                            <Button
                              variant="text"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onInfoClick(plugin);
                              }}
                              aria-label={`More info about ${plugin.name}`}
                              type="button"
                            >
                              ⓘ
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                      <Heading level={4}>{plugin.name}</Heading>
                      <Paragraph size="sm">{plugin.description}</Paragraph>
                      {isDisabled && disabledReason && (
                        <Paragraph size="sm" muted>{disabledReason}</Paragraph>
                      )}
                    </Stack>
                  </Card>
                </div>
              );
            })}
          </Stack>
        </div>
      )}
    </div>
  );
};
