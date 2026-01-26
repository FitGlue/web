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
    <Stack gap="md">
      <Button
        variant="text"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        type="button"
      >
        <Stack direction="horizontal" gap="sm" align="center">
          <Paragraph inline>{category.emoji}</Paragraph>
          <Paragraph inline bold>{category.name}</Paragraph>
          <Badge variant="default" size="sm">{plugins.length}</Badge>
          <Paragraph inline>{expanded ? '▾' : '▸'}</Paragraph>
        </Stack>
      </Button>

      {expanded && (
        <Stack gap="sm">
          {plugins.map((plugin) => {
            const isSelected = selectedIds.includes(plugin.id);
            const isDisabled = disabledPlugins.has(plugin.id);
            const disabledReason = getDisabledReason?.(plugin);

            return (
              <Card
                key={plugin.id}
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
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};
