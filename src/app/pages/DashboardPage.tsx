import { useNavigate } from 'react-router-dom';
import { useInputs } from '../hooks/useInputs';
import { useActivities } from '../hooks/useActivities';

const DashboardPage: React.FC = () => {
  const { inputs, loading } = useInputs();
  const { stats, loading: statsLoading } = useActivities('stats');
  const navigate = useNavigate();

  return (
    <div className="container dashboard-container">
      <header className="app-header">
        <h1 className="title small">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </h1>
        <div className="nav-actions">
           <button onClick={() => window.location.href = '/logout'} className="btn text">Logout</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="dashboard-section">
            <h2 className="section-title">Overview</h2>
            <div className="stats-grid">
                <div className="card stat-card" onClick={() => navigate('/inputs')}>
                    <h3>Pending Inputs</h3>
                    <p className="stat-value">
                        {loading && inputs.length === 0 ? '...' : inputs.length}
                    </p>
                    <p className="stat-label">Items requiring attention</p>
                </div>
                <div className="card stat-card" onClick={() => navigate('/activities')}>
                    <h3>Synchronized</h3>
                    <p className="stat-value">
                        {statsLoading ? '...' : stats.synchronized_count}
                    </p>
                    <p className="stat-label">Activities this week</p>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
};

export default DashboardPage;
