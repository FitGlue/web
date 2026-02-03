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

export default NotFoundPage;

