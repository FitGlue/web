import React, { useEffect, useState } from 'react';

interface RefreshControlProps {
  onRefresh: () => void;
  lastUpdated: Date | null;
  loading: boolean;
}

export const RefreshControl: React.FC<RefreshControlProps> = ({ onRefresh, lastUpdated, loading }) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Update relative time every minute
  useEffect(() => {
    const updateTime = () => {
      if (!lastUpdated) {
        setTimeAgo('');
        return;
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

      if (diffInSeconds < 60) {
        setTimeAgo('just now');
        return;
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        setTimeAgo(`${diffInMinutes}m ago`);
        return;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        setTimeAgo(`${diffInHours}h ago`);
        return;
      }

      setTimeAgo(lastUpdated.toLocaleDateString());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="refresh-control" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      {lastUpdated && (
        <span style={{ fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap' }}>
          Updated {timeAgo}
        </span>
      )}
      <button
        onClick={onRefresh}
        className="btn text"
        disabled={loading}
        title="Refresh"
        style={{ padding: '0.2rem', minWidth: 'auto' }}
      >
        <span className={loading ? 'spinning' : ''} style={{ display: 'inline-block' }}>
            ↻
        </span>
      </button>
      <style>{`
        .spinning {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
