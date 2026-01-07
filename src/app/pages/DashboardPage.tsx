import { useNavigate } from 'react-router-dom';
import { useInputs } from '../hooks/useInputs';
import { useActivities } from '../hooks/useActivities';
import { PageLayout } from '../components/layout/PageLayout';
import { StatCard } from '../components/data/StatCard';
import { Button } from '../components/ui/Button';

const DashboardPage: React.FC = () => {
  const { inputs, loading: inputsLoading, refresh: inputsRefresh } = useInputs();
  const { stats, loading: statsLoading, refresh: statsRefresh } = useActivities('stats');
  const navigate = useNavigate();

  const refresh = () => {
    inputsRefresh();
    statsRefresh();
  };

  return (
    <PageLayout
        title="Overview"
        onRefresh={refresh}
        loading={statsLoading || inputsLoading}
        headerActions={
            <Button variant="text" onClick={() => window.location.href = '/logout'} style={{marginLeft: '1rem'}}>
                Logout
            </Button>
        }
    >
        <div className="stats-grid">
            <StatCard
                title="Pending Inputs"
                value={inputs.length}
                label="Items requiring attention"
                onClick={() => navigate('/inputs')}
                loading={inputsLoading}
            />
            <StatCard
                title="Synchronized"
                value={stats.synchronizedCount}
                label="Activities this week"
                onClick={() => navigate('/activities')}
                loading={statsLoading}
            />
        </div>
    </PageLayout>
  );
};

export default DashboardPage;
