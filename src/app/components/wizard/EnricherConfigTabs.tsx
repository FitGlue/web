import React from 'react';
import { Stack } from '../library/layout/Stack';
import { Paragraph } from '../library/ui/Paragraph';
import { PluginIcon } from '../library/ui/PluginIcon';
import './EnricherConfigTabs.css';

export interface EnricherTab {
    id: string;
    icon?: string;
    iconType?: string;
    iconPath?: string;
    name: string;
}

export interface EnricherConfigTabsProps {
    tabs: EnricherTab[];
    activeTabId: string;
    onTabClick: (tabId: string) => void;
}

/**
 * EnricherConfigTabs - Tab list for switching between enricher configurations.
 */
export const EnricherConfigTabs: React.FC<EnricherConfigTabsProps> = ({
    tabs,
    activeTabId,
    onTabClick,
}) => {
    return (
        <div className="enricher-config-tabs">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                    <button
                        key={tab.id}
                        className={`enricher-config-tabs__tab ${isActive ? 'enricher-config-tabs__tab--active' : ''}`}
                        onClick={() => onTabClick(tab.id)}
                    >
                        <Stack direction="horizontal" gap="xs" align="center">
                            <PluginIcon
                                icon={tab.icon ?? '⚙️'}
                                iconType={tab.iconType}
                                iconPath={tab.iconPath}
                                size="small"
                            />
                            <Paragraph inline size="sm">{tab.name}</Paragraph>
                        </Stack>
                    </button>
                );
            })}
        </div>
    );
};
