import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PipelineRun } from '../../../types/pb/user';
import { DashboardBand } from '../library/ui/DashboardBand';
import { PipelineRunsList } from './PipelineRunsList';

export const RecentRunsSection: React.FC = () => {
    const navigate = useNavigate();

    const handleRunClick = (run: PipelineRun) => {
        if (run.activityId) navigate(`/activities/${run.activityId}`);
    };

    return (
        <>
            <DashboardBand
                label="✨ Recent Runs"
                right={
                    <span style={{ cursor: 'pointer' }} onClick={() => navigate('/activities')}>
                        LIVE · VIEW ALL →
                    </span>
                }
            />
            <PipelineRunsList
                variant="dashboard"
                defaultFilter="all"
                limit={6}
                onRunClick={handleRunClick}
            />
        </>
    );
};
