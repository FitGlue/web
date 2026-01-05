import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';

const ActivitiesListPage: React.FC = () => {
  const { activities, loading } = useActivities('list');
  const navigate = useNavigate();

  const handleActivityClick = (id: string) => {
      navigate(`/activities/${id}`);
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
        <h2>Synchronized Activities</h2>
        {loading && activities.length === 0 ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Fetching your activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <p>No activities found.</p>
        ) : (
          <div className="inputs-list">
            {activities.map(activity => (
              <div key={activity.activity_id} className="card clickable" onClick={() => handleActivityClick(activity.activity_id!)}>
                <h3>{activity.title}</h3>
                <p>Type: {activity.type} | Source: {activity.source}</p>
                <p>Synced At: {activity.synced_at ? new Date(activity.synced_at).toLocaleString() : 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ActivitiesListPage;
