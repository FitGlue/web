import React, { ReactNode } from 'react';
import './TabbedCard.css';

interface TabbedCardTab {
  id: string;
  icon: string;
  label: string;
  count?: number;
  variant?: 'default' | 'warning';
}

interface TabbedCardProps {
  /** Array of tab definitions */
  tabs: TabbedCardTab[];
  /** Currently active tab ID */
  activeTab: string;
  /** Called when a tab is clicked */
  onTabChange: (tabId: string) => void;
  /** Footer text */
  footerText?: ReactNode;
  /** Card content */
  children: ReactNode;
}

/**
 * TabbedCard - A card with integrated tabs in the header.
 * Tabs are visually connected to the card content.
 */
export const TabbedCard: React.FC<TabbedCardProps> = ({
  tabs,
  activeTab,
  onTabChange,
  footerText,
  children,
}) => {
  return (
    <div className="tabbed-card">
      <div className="tabbed-card__tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`tabbed-card__tab ${activeTab === tab.id ? 'tabbed-card__tab--active' : ''} ${tab.variant === 'warning' ? 'tabbed-card__tab--warning' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tabbed-card__tab-icon">{tab.icon}</span>
            <span className="tabbed-card__tab-label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="tabbed-card__tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
      <div className="tabbed-card__content">
        {children}
      </div>
      {footerText && (
        <div className="tabbed-card__footer">
          {footerText}
        </div>
      )}
    </div>
  );
};

export default TabbedCard;
