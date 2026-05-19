import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageLayout, Stack } from '../components/library/layout';
import { client } from '../../shared/api/client';
import { BoosterDataEntry } from '../components/enricher-data/types';
import CountersSection from '../components/enricher-data/CountersSection';
import PersonalRecordsSection from '../components/enricher-data/PersonalRecordsSection';
import GoalTrackersSection from '../components/enricher-data/GoalTrackersSection';
import StreakTrackersSection from '../components/enricher-data/StreakTrackersSection';
import DistanceMilestonesSection from '../components/enricher-data/DistanceMilestonesSection';
import './EnricherDataPage.css';

const EnricherDataPage: React.FC = () => {

    // Booster data (shared fetch for goal/streak/milestone sections)
    const [boosterData, setBoosterData] = useState<BoosterDataEntry[]>([]);
    const [boosterDataLoading, setBoosterDataLoading] = useState(true);

    const fetchBoosterData = useCallback(async () => {
        setBoosterDataLoading(true);
        try {
            const { data } = await client.GET('/users/me/booster-data');
            const entries: BoosterDataEntry[] = Object.entries((data as Record<string, Record<string, unknown>>) || {}).map(([id, data]) => ({
                id,
                data: data as Record<string, unknown>,
            }));
            setBoosterData(entries);
        } catch (err) {
            console.error('Failed to fetch booster data:', err);
        } finally {
            setBoosterDataLoading(false);
        }
    }, []);

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
                <div className="fg-band fg-band--ink">
                    <span className="fg-band__label">BOOSTER DATA</span>
                    <span className="fg-band__right">MANUAL EDIT</span>
                </div>

                <div className="enricher-page-intro">
                    <div className="enricher-page-intro__icon">ℹ️</div>
                    <div className="enricher-page-intro__text">
                        View and modify data stored by boosters — personal records, counters, goal
                        trackers, streaks, and distance milestones.{' '}
                        <strong>Be careful when editing</strong> — manual changes may cause
                        inconsistencies with your actual activity data.
                    </div>
                </div>

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
