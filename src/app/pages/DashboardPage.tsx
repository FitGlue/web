import { useNavigate } from 'react-router-dom';
import { useInputs } from '../hooks/useInputs';
import { useActivities } from '../hooks/useActivities';
import { AppHeader } from '../components/layout/AppHeader';
import { PageHeader } from '../components/layout/PageHeader';
import { RefreshControl } from '../components/RefreshControl';

const DashboardPage: React.FC = () => {
  const { inputs, loading } = useInputs();
  const { stats, loading: statsLoading, refresh } = useActivities('stats');
  const navigate = useNavigate();

  return (
    <div className="container dashboard-container">
      <AppHeader />
      <div className="content">
        <PageHeader
            title="Overview"
            actions={
                <>
                    <RefreshControl onRefresh={refresh} loading={statsLoading} lastUpdated={null} />
                    <button onClick={() => window.location.href = '/logout'} className="btn text" style={{marginLeft: '1rem'}}>Logout</button>
                </>
            }
        />

      <main className="dashboard-grid">
        <section className="dashboard-section">
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
                        {statsLoading ? '...' : stats.synchronizedCount}
                    </p>
                    <p className="stat-label">Activities this week</p>
                </div>
            </div>
        </section>

      </main>
      </div>
    </div>
  );
};

export default DashboardPage;
