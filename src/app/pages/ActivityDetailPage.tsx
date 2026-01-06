import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { SynchronizedActivity } from '../services/ActivitiesService';

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activities, loading } = useActivities('single', id);
  const navigate = useNavigate();
  const [activity, setActivity] = useState<SynchronizedActivity | null>(null);

  useEffect(() => {
    if (id && activities.length > 0) {
        setActivity(activities.find(a => a.activityId === id) || null);
    }
  }, [id, activities]);


  if (loading && !activity) {
      return <div className="container">Loading...</div>;
  }

  if (!activity) {
      return <div className="container">Activity not found</div>;
  }

  return (
    <div className="container dashboard-container">
      <header className="app-header">
        <h1 className="title small">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </h1>
        <div className="nav-actions">
           <button onClick={() => navigate('/activities')} className="btn text">Back to Activities</button>
        </div>
      </header>
      <main className="dashboard">
        <h2>{activity.title}</h2>
        <div className="card">
            <p><strong>Description:</strong></p>
            <p className="activity-description">{activity.description}</p>
            <p><strong>Type:</strong> {activity.type}</p>
            <p><strong>Source:</strong> {activity.source}</p>
             <p><strong>Start Time:</strong> {activity.startTime ? new Date(activity.startTime).toLocaleString() : 'N/A'}</p>
             <p><strong>Synced At:</strong> {activity.syncedAt ? new Date(activity.syncedAt).toLocaleString() : 'N/A'}</p>
        </div>

        <h3>Destinations</h3>
        <div className="card">
             {activity.destinations && Object.keys(activity.destinations).length > 0 ? (
                 <ul className="destinations-list">
                     {Object.entries(activity.destinations).map(([k, v]) => (
                         <li key={k}>{k}: {v as string}</li>
                     ))}
                 </ul>
             ) : (
                 <p>No destinations recorded.</p>
             )}
        </div>
      </main>
    </div>
  );
};

export default ActivityDetailPage;
