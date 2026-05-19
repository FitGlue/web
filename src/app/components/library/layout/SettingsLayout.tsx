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
                <div className="settings__rail-section">PROFILE</div>
                <NavLink to="/settings/account">Account</NavLink>
                <NavLink to="/settings/showcase">Showcase</NavLink>

                <div className="settings__rail-section">BILLING</div>
                <NavLink to="/settings/subscription">Subscription</NavLink>

                <div className="settings__rail-section">DATA</div>
                <NavLink to="/settings/enricher-data">Booster Data</NavLink>
            </aside>
            <div>
                {children}
            </div>
        </div>
    </PageLayout>
);
