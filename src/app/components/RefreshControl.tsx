import React, { useEffect, useState } from 'react';
import { Button } from './library/ui/Button';
import { Paragraph } from './library/ui/Paragraph';
import './RefreshControl.css';

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
    <Button
      className={`refresh-control ${loading ? 'refresh-control--loading' : ''}`}
      onClick={!loading ? onRefresh : undefined}
      disabled={loading}
      title="Click to refresh"
      variant="text"
      size="small"
    >
      <svg
        className="refresh-control__icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M21 21v-5h-5" />
      </svg>
      <Paragraph inline className="refresh-control__text">
        {loading ? 'Updating...' : (lastUpdated ? `Updated ${timeAgo}` : 'Update Now')}
      </Paragraph>
    </Button>
  );
};
