import React, { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { PageHeader } from './PageHeader';
import { RefreshControl } from '../../RefreshControl';
import { Footer } from './Footer';
import './PageLayout.css';

interface PageLayoutProps {
    /** Page title displayed in PageHeader */
    title: string | ReactNode;
    /** Optional back navigation path */
    backTo?: string;
    /** Optional back navigation label */
    backLabel?: string;
    /** Optional refresh handler - if provided, shows RefreshControl */
    onRefresh?: () => void;
    /** Loading state for refresh control */
    loading?: boolean;
    /** Last updated timestamp for refresh control */
    lastUpdated?: Date | null;
    /** Additional actions to show in header */
    headerActions?: ReactNode;
    /** Page content */
    children: ReactNode;
}

/**
 * PageLayout wraps entire page content with consistent structure.
 * Eliminates the need for container divs in page components.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    backTo,
    backLabel,
    onRefresh,
    loading = false,
    lastUpdated = null,
    headerActions,
    children,
}) => {
    return (
        <div className="app-page-layout">
            <div className="app-page-content">
                <AppHeader />
                <PageHeader
                    title={title}
                    backTo={backTo}
                    backLabel={backLabel}
                    actions={
                        <>
                            {onRefresh && (
                                <RefreshControl
                                    onRefresh={onRefresh}
                                    loading={loading}
                                    lastUpdated={lastUpdated}
                                />
                            )}
                            {headerActions}
                        </>
                    }
                />
                <main>
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};
