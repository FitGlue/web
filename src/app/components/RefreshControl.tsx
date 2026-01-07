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
    <div className="refresh-pill" onClick={!loading ? onRefresh : undefined} title="Click to refresh">
        <div className={`refresh-icon ${loading ? 'spinning' : ''}`}>
             ↻
        </div>
        <div className="refresh-text">
            {loading ? 'Updating...' : (lastUpdated ? `Updated ${timeAgo}` : 'Update Now')}
        </div>
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

