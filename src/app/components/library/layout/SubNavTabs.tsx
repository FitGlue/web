import React from 'react';
import './SubNavTabs.css';

export interface SubNavTab {
    key: string;
    label: string;
    /** Optional count badge rendered alongside the label. */
    count?: number;
}

export interface SubNavTabsProps {
    tabs: SubNavTab[];
    active: string;
    onSelect: (key: string) => void;
    /** Accessible label for the nav region. */
    'aria-label'?: string;
}

export const SubNavTabs: React.FC<SubNavTabsProps> = ({
    tabs,
    active,
    onSelect,
    'aria-label': ariaLabel = 'Section navigation',
}) => (
    <nav className="subnav-tabs" aria-label={ariaLabel} role="tablist">
        {tabs.map(tab => (
            <button
                key={tab.key}
                role="tab"
                aria-selected={tab.key === active}
                className={`subnav-tabs__tab${tab.key === active ? ' subnav-tabs__tab--active' : ''}`}
                onClick={() => onSelect(tab.key)}
            >
                <span className="subnav-tabs__label">{tab.label}</span>
                {typeof tab.count === 'number' && (
                    <span className="subnav-tabs__count" aria-label={`${tab.count} items`}>
                        {tab.count}
                    </span>
                )}
            </button>
        ))}
    </nav>
);
