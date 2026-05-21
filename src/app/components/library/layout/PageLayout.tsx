import React, { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { PageHeader } from './PageHeader';
import { RefreshControl } from '../../RefreshControl';
import { Footer } from './Footer';
import './PageLayout.css';

interface PageLayoutProps {
    /** Page title displayed in PageHeader. Omit if the page content provides its own heading. */
    title?: string | ReactNode;
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
    /** Optional inline stats rendered right-side in the page header */
    headerStats?: ReactNode;
    /** Optional subtitle shown below the title in the page header */
    headerSubtitle?: string;
    /** Use full width layout (no max-width constraint) */
    fullWidth?: boolean;
    /** Page content */
    children: ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    backTo,
    backLabel,
    onRefresh,
    loading = false,
    lastUpdated = null,
    headerActions,
    headerStats,
    headerSubtitle,
    fullWidth = false,
    children,
}) => {
    const contentClasses = [
        'app-page-content',
        fullWidth && 'app-page-content--full-width',
    ].filter(Boolean).join(' ');

    const showPageHeader = !!(title || backTo || headerActions || headerStats || onRefresh || headerSubtitle);

    // Build actions — wraps RefreshControl + any additional actions
    const resolvedActions = (onRefresh || headerActions) ? (
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
    ) : undefined;

    return (
        <div className="app-page-layout">
            <AppHeader />
            <div className={contentClasses}>
                {showPageHeader && (
                    <PageHeader
                        title={title}
                        backTo={backTo}
                        backLabel={backLabel}
                        subtitle={headerSubtitle}
                        stats={headerStats}
                        actions={resolvedActions}
                    />
                )}
                <main>
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};
