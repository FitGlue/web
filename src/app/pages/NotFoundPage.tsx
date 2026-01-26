import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack } from '../components/library/layout';
import { Paragraph, IconButton } from '../components/library/ui';

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
  return (
    <Stack
      direction="horizontal"
      align="center"
      justify="between"
      gap="md"

    >
      <Stack direction="horizontal" align="center" gap="md">
        <Paragraph size="lg">🫠</Paragraph>
        <Paragraph>{message}</Paragraph>
      </Stack>
      <IconButton
        icon="×"
        size="md"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      />
    </Stack>
  );
};

export default NotFoundPage;
