import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipelineRuns } from '../../hooks/usePipelineRuns';
import { EnrichedActivityCard } from './EnrichedActivityCard';
import { CardSkeleton, Paragraph, DashboardSummaryCard, EmptyState, TabbedCard, Heading } from '../library/ui';
import { Stack } from '../library/layout';
import { PipelineRunStatus, PipelineRun } from '../../../types/pb/user';

export type FilterMode = 'all' | 'completed' | 'attention';

// Status groupings for filtering
const COMPLETED_STATUSES = [
    PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED,
    PipelineRunStatus.PIPELINE_RUN_STATUS_PARTIAL,
];

const ATTENTION_STATUSES = [
    PipelineRunStatus.PIPELINE_RUN_STATUS_RUNNING,
    PipelineRunStatus.PIPELINE_RUN_STATUS_PENDING,
    PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED,
    PipelineRunStatus.PIPELINE_RUN_STATUS_SKIPPED,
];

interface PipelineRunsListProps {
    /** Whether to show tab filtering UI */
    showTabs?: boolean;
    /** Default filter mode (used when tabs hidden, or as initial tab) */
    defaultFilter?: FilterMode;
    /** Maximum number of runs to fetch */
    limit?: number;
    /** Callback when tab changes (for URL sync) */
    onTabChange?: (tab: FilterMode) => void;
    /** Initial tab from URL */
    initialTab?: FilterMode;
    /** Callback when a run is clicked */
    onRunClick?: (run: PipelineRun) => void;
    /** Whether to require boosters for display (dashboard preview mode) */
    requireBoosters?: boolean;
    /** Container variant */
    variant?: 'dashboard' | 'tabbed' | 'none';
    /** Title for dashboard variant */
    title?: string;
    /** Link destination for dashboard "View All" */
    viewAllLink?: string;
}

/**
 * PipelineRunsList - Shared component for displaying pipeline runs
 *
 * Used by both the Dashboard (preview mode) and ActivitiesListPage (full mode).
 * Configurable filtering, tabs, and container styles.
 */
export const PipelineRunsList: React.FC<PipelineRunsListProps> = ({
    showTabs = false,
    defaultFilter = 'all',
    limit = 10,
    onTabChange,
    initialTab,
    onRunClick,
    requireBoosters = false,
    variant = 'none',
    title = 'Recent Runs',
    viewAllLink = '/activities',
}) => {
    const navigate = useNavigate();
    const [tabMode, setTabMode] = useState<FilterMode>(initialTab || defaultFilter);
    const { pipelineRuns, loading } = usePipelineRuns(true, limit);

    const handleTabChange = (mode: FilterMode) => {
        setTabMode(mode);
        onTabChange?.(mode);
    };

    const handleRunClick = (run: PipelineRun) => {
        if (onRunClick) {
            onRunClick(run);
        } else if (run.activityId) {
            navigate(`/activities/${run.activityId}`);
        }
    };

    // Deduplicate and filter runs
    const { filteredRuns, counts } = useMemo(() => {
        const seen = new Set<string>();
        let uniqueRuns = pipelineRuns.filter(run => {
            if (!run.id || seen.has(run.id)) return false;
            seen.add(run.id);
            return true;
        });

        // If requireBoosters is true, only show runs with boosters
        if (requireBoosters) {
            uniqueRuns = uniqueRuns.filter(run => run.boosters && run.boosters.length > 0);
        }

        // Calculate counts before filtering by tab
        const counts = {
            all: uniqueRuns.length,
            completed: uniqueRuns.filter(run => COMPLETED_STATUSES.includes(run.status)).length,
            attention: uniqueRuns.filter(run => ATTENTION_STATUSES.includes(run.status)).length,
        };

        // Apply tab filter
        const activeFilter = showTabs ? tabMode : defaultFilter;
        let filtered: PipelineRun[];
        switch (activeFilter) {
            case 'completed':
                filtered = uniqueRuns.filter(run => COMPLETED_STATUSES.includes(run.status));
                break;
            case 'attention':
                filtered = uniqueRuns.filter(run => ATTENTION_STATUSES.includes(run.status));
                break;
            case 'all':
            default:
                filtered = uniqueRuns;
        }

        return { filteredRuns: filtered, counts };
    }, [pipelineRuns, tabMode, showTabs, defaultFilter, requireBoosters]);

    // Get empty state content based on current filter
    const getEmptyState = () => {
        const activeFilter = showTabs ? tabMode : defaultFilter;
        switch (activeFilter) {
            case 'completed':
                return {
                    icon: '🏃',
                    title: 'No Completed Runs Yet',
                    description: 'Your successfully synced activities will appear here once pipelines complete.',
                };
            case 'attention':
                return {
                    icon: '✅',
                    title: 'All Good!',
                    description: 'No issues to report. Everything is running smoothly!',
                };
            case 'all':
            default:
                return {
                    icon: '🏃',
                    title: 'No Pipeline Runs Yet',
                    description: 'Your activity pipeline runs will appear here once you connect your fitness apps.',
                };
        }
    };

    // Loading skeleton
    const loadingSkeleton = (
        <Stack gap="md">
            <CardSkeleton variant="activity" />
            <CardSkeleton variant="activity" />
            {variant !== 'dashboard' && <CardSkeleton variant="activity" />}
        </Stack>
    );

    // Empty state content
    const emptyState = getEmptyState();
    const emptyContent = variant === 'dashboard' ? (
        <EmptyState
            variant="mini"
            icon={emptyState.icon}
            title={emptyState.title}
            description={emptyState.description}
            actionLabel="Create Pipeline"
            onAction={() => navigate('/settings/pipelines/new')}
        />
    ) : (
        <Stack gap="md" align="center">
            <Paragraph size="lg">{emptyState.icon}</Paragraph>
            <Heading level={3}>{emptyState.title}</Heading>
            <Paragraph muted centered>
                {emptyState.description}
            </Paragraph>
        </Stack>
    );

    // Runs list content
    const runsContent = (
        <Stack gap="md">
            {filteredRuns.map(run => (
                <EnrichedActivityCard
                    key={run.id}
                    pipelineRun={run}
                    onClick={() => handleRunClick(run)}
                />
            ))}
        </Stack>
    );

    // Determine what to render
    const content = loading && filteredRuns.length === 0
        ? loadingSkeleton
        : filteredRuns.length === 0
            ? emptyContent
            : runsContent;

    // Dashboard variant - simple summary card
    if (variant === 'dashboard') {
        return (
            <DashboardSummaryCard
                title={title}
                icon="✨"
                linkTo={viewAllLink}
                linkLabel="View All →"
                showLink={filteredRuns.length > 0}
                footerText={filteredRuns.length > 0 ? (
                    <><Paragraph inline><strong>{filteredRuns.length}</strong></Paragraph> recent runs</>
                ) : undefined}
            >
                {content}
            </DashboardSummaryCard>
        );
    }

    // Tabbed variant - with tab filtering
    if (variant === 'tabbed' && showTabs) {
        return (
            <TabbedCard
                tabs={[
                    { id: 'all', icon: '📋', label: 'All Runs', count: counts.all },
                    { id: 'completed', icon: '✅', label: 'Completed', count: counts.completed },
                    { id: 'attention', icon: '⚡', label: 'In Progress', count: counts.attention, variant: counts.attention > 0 ? 'warning' : undefined },
                ]}
                activeTab={tabMode}
                onTabChange={(tabId) => handleTabChange(tabId as FilterMode)}
                footerText={filteredRuns.length > 0 ? `${filteredRuns.length} runs` : undefined}
            >
                {content}
            </TabbedCard>
        );
    }

    // No variant - just return the content
    return content;
};

export default PipelineRunsList;
