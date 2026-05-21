import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { PageLayout } from './PageLayout';

interface SettingsLayoutProps {
    title?: string | ReactNode;
    backTo?: string;
    backLabel?: string;
    headerActions?: ReactNode;
    children: ReactNode;
}

// Left-rail structure per unified nav spec:
// Account · Notifications · Privacy & data · Display · API & webhooks · Billing
const SETTINGS_NAV = [
    { to: '/settings/account',       label: 'Account'          },
    { to: '/settings/account',       label: 'Notifications',   disabled: true },
    { to: '/settings/enricher-data', label: 'Privacy & data'   },
    { to: '/settings/account',       label: 'Display',         disabled: true },
    { to: '/settings/account',       label: 'API & webhooks',  disabled: true },
    { to: '/settings/subscription',  label: 'Billing'          },
] as const;

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
    title,
    backTo,
    backLabel,
    headerActions,
    children,
}) => (
    <PageLayout title={title} backTo={backTo} backLabel={backLabel} headerActions={headerActions} fullWidth>
        <div className="settings">
            <aside className="settings__rail">
                {SETTINGS_NAV.map(item => (
                    'disabled' in item && item.disabled ? (
                        <span key={item.label} className="settings__rail-link settings__rail-link--disabled">
                            {item.label}
                        </span>
                    ) : (
                        <NavLink key={item.label} to={item.to} end>
                            {item.label}
                        </NavLink>
                    )
                ))}
            </aside>
            <div>
                {children}
            </div>
        </div>
    </PageLayout>
);
