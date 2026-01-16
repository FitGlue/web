import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  // Redirect to dashboard immediately with a flag to show the notification
  useEffect(() => {
    navigate('/?redirected=true', { replace: true });
  }, [navigate]);

  // If we're on this page, show a loading state while redirecting
  // The banner will be shown on the dashboard after redirect
  return null;
};

// Separate component for the redirect notification that can be used in DashboardPage
export const RedirectNotification: React.FC<{
  message?: string;
  onDismiss: () => void;
}> = ({
  message = "Oops! The page you visited doesn't exist — we've brought you back home.",
  onDismiss
}) => {
  const bannerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(131, 56, 236, 0.15), rgba(255, 0, 110, 0.15))',
    border: '1px solid rgba(131, 56, 236, 0.3)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    animation: 'slideInFromTop 0.3s ease-out',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    flexShrink: 0,
  };

  const textStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.95rem',
    flex: 1,
  };

  const dismissStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    padding: '0.25rem',
    fontSize: '1.25rem',
    lineHeight: 1,
    transition: 'color 0.2s ease',
  };

  return (
    <>
      <style>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div style={bannerStyle} role="alert">
        <span style={iconStyle}>🫠</span>
        <span style={textStyle}>{message}</span>
        <button
          style={dismissStyle}
          onClick={onDismiss}
          aria-label="Dismiss notification"
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}
        >
          ×
        </button>
      </div>
    </>
  );
};

export default NotFoundPage;
