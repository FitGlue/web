import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageLayout, Stack } from '../components/library/layout';
import { Card, Paragraph } from '../components/library/ui';
import { useApi } from '../hooks/useApi';
import { BoosterDataEntry } from '../components/enricher-data/types';
import CountersSection from '../components/enricher-data/CountersSection';
import PersonalRecordsSection from '../components/enricher-data/PersonalRecordsSection';
import GoalTrackersSection from '../components/enricher-data/GoalTrackersSection';
import StreakTrackersSection from '../components/enricher-data/StreakTrackersSection';
import DistanceMilestonesSection from '../components/enricher-data/DistanceMilestonesSection';

const EnricherDataPage: React.FC = () => {
    const api = useApi();

    // Booster data (shared fetch for goal/streak/milestone sections)
    const [boosterData, setBoosterData] = useState<BoosterDataEntry[]>([]);
    const [boosterDataLoading, setBoosterDataLoading] = useState(true);

    const fetchBoosterData = useCallback(async () => {
        setBoosterDataLoading(true);
        try {
            const response = await api.get('/users/me/booster-data') as { data: Record<string, Record<string, unknown>> };
            const entries: BoosterDataEntry[] = Object.entries(response.data || {}).map(([id, data]) => ({
                id,
                data: data as Record<string, unknown>,
            }));
            setBoosterData(entries);
        } catch (err) {
            console.error('Failed to fetch booster data:', err);
        } finally {
            setBoosterDataLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchBoosterData();
    }, [fetchBoosterData]);

    // Categorize booster data by prefix
    const goalTrackers = useMemo(() => boosterData.filter(b => b.id.startsWith('goal_tracker_')), [boosterData]);
    const streakTrackers = useMemo(() => boosterData.filter(b => b.id.startsWith('streak_tracker_')), [boosterData]);
    const distanceMilestones = useMemo(() => boosterData.filter(b => b.id.startsWith('distance_milestones_')), [boosterData]);

    return (
        <PageLayout
            title="Booster Data"
            backTo="/"
            backLabel="Dashboard"
        >
            <Stack gap="lg">
                {/* Info Banner */}
                <Card>
                    <Stack direction="horizontal" gap="sm" align="center">
                        <Paragraph inline>ℹ️</Paragraph>
                        <Paragraph size="sm">
                            This page allows you to view and modify data stored by boosters.
                            <strong> Be careful when editing</strong> — manual changes may cause inconsistencies
                            with your actual activity data.
                        </Paragraph>
                    </Stack>
                </Card>

                <CountersSection />
                <PersonalRecordsSection />
                <GoalTrackersSection entries={goalTrackers} loading={boosterDataLoading} onRefresh={fetchBoosterData} />
                <StreakTrackersSection entries={streakTrackers} loading={boosterDataLoading} onRefresh={fetchBoosterData} />
                <DistanceMilestonesSection entries={distanceMilestones} loading={boosterDataLoading} onRefresh={fetchBoosterData} />
            </Stack>
        </PageLayout>
    );
};

export default EnricherDataPage;
