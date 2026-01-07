import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';

type TabMode = 'synchronized' | 'unsynchronized';

const ActivitiesListPage: React.FC = () => {
  const [tabMode, setTabMode] = useState<TabMode>('synchronized');
  const navigate = useNavigate();

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
            onClick={() => setTabMode('synchronized')}
          >
            Synchronized
          </button>
          <button
            className={`tab-button ${tabMode === 'unsynchronized' ? 'active' : ''}`}
            onClick={() => setTabMode('unsynchronized')}
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
                  <div key={activity.activityId} className="card clickable" onClick={() => handleActivityClick(activity.activityId!)}>
                    <h3>{activity.title}</h3>
                    <p>Type: {activity.type} | Source: {activity.source}</p>
                    <p>Synced At: {activity.syncedAt ? new Date(activity.syncedAt).toLocaleString() : 'N/A'}</p>
                  </div>
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
                  <div
                    key={entry.pipelineExecutionId}
                    className="card clickable"
                    onClick={() => handleUnsyncClick(entry.pipelineExecutionId!)}
                  >
                    <h3>{entry.title || 'Unknown Activity'}</h3>
                    <div className="unsync-meta">
                      <span className={`status-badge status-${entry.status?.toLowerCase()}`}>
                        {entry.status}
                      </span>
                      <span>Type: {entry.activityType} | Source: {entry.source}</span>
                    </div>
                    {entry.errorMessage && (
                      <p className="error-preview">{entry.errorMessage}</p>
                    )}
                    <p className="timestamp">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </div>
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
