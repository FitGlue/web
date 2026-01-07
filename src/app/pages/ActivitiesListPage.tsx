import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { ActivityCard } from '../components/ActivityCard';

type TabMode = 'synchronized' | 'unsynchronized';

const ActivitiesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabMode) || 'synchronized';
  const [tabMode, setTabMode] = useState<TabMode>(initialTab);
  const navigate = useNavigate();

  // Sync state with URL when tab changes
  const handleTabChange = (mode: TabMode) => {
    setTabMode(mode);
    setSearchParams({ tab: mode });
  };

  // Fetch based on current tab
  const { activities, unsynchronized, loading } = useActivities(
    tabMode === 'synchronized' ? 'list' : 'unsynchronized'
  );

  const handleActivityClick = (id: string) => {
    navigate(`/activities/${id}`);
  };

  const handleUnsyncClick = (pipelineExecutionId: string) => {
    navigate(`/activities/unsynchronized/${pipelineExecutionId}`);
  };

  return (
    <div className="container dashboard-container">
      <header className="app-header">
        <h1 className="title small">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </h1>
        <div className="nav-actions">
           <button onClick={() => navigate('/')} className="btn text">Back to Dashboard</button>
        </div>
      </header>
      <main className="dashboard">
        <h2>Activities</h2>

        {/* Tab Buttons */}
        <div className="tabs-container">
          <button
            className={`tab-button ${tabMode === 'synchronized' ? 'active' : ''}`}
            onClick={() => handleTabChange('synchronized')}
          >
            Synchronized
          </button>
          <button
            className={`tab-button ${tabMode === 'unsynchronized' ? 'active' : ''}`}
            onClick={() => handleTabChange('unsynchronized')}
          >
            Unsynchronized
          </button>
        </div>

        {/* Content based on tab */}
        {tabMode === 'synchronized' ? (
          <>
            {loading && activities.length === 0 ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Fetching your activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <p>No synchronized activities found.</p>
            ) : (
              <div className="inputs-list">
                {activities.map(activity => (
                  <ActivityCard
                    key={activity.activityId}
                    title={activity.title || 'Untitled'}
                    type={String(activity.type || 'Unknown')}
                    source={activity.source || 'Unknown'}
                    timestamp={activity.syncedAt || null}
                    onClick={() => handleActivityClick(activity.activityId!)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {loading && unsynchronized.length === 0 ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Fetching unsynchronized executions...</p>
              </div>
            ) : unsynchronized.length === 0 ? (
              <p>No unsynchronized executions found. All your activities have been synced!</p>
            ) : (
              <div className="inputs-list">
                {unsynchronized.map(entry => (
                  <ActivityCard
                    key={entry.pipelineExecutionId}
                    title={entry.title || 'Unknown Activity'}
                    type={entry.activityType || 'Unknown'}
                    source={entry.source || 'Unknown'}
                    timestamp={entry.timestamp || null}
                    status={entry.status}
                    errorMessage={entry.errorMessage}
                    isUnsynchronized={true}
                    onClick={() => handleUnsyncClick(entry.pipelineExecutionId!)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ActivitiesListPage;
