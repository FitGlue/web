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

const SETTINGS_NAV = [
    { to: '/settings/account',       label: 'Account'      },
    { to: '/settings/showcase',      label: 'Showcase'     },
    { to: '/settings/enricher-data', label: 'Booster data' },
    { to: '/settings/subscription',  label: 'Billing'      },
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
                    <NavLink key={item.label} to={item.to} end={false}>
                        {item.label}
                    </NavLink>
                ))}
            </aside>
            <div>
                {children}
            </div>
        </div>
    </PageLayout>
);
