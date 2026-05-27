import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PipelineRun } from '../../../types/pb/user';
import { PipelineRunsList } from './PipelineRunsList';

export const RecentRunsSection: React.FC = () => {
    const navigate = useNavigate();

    const handleRunClick = (run: PipelineRun) => {
        if (run.activityId) navigate(`/activities/${run.activityId}`);
    };

    return (
        <PipelineRunsList
            variant="dashboard"
            defaultFilter="all"
            limit={6}
            onRunClick={handleRunClick}
        />
    );
};
