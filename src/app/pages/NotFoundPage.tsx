import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { Button } from '../components/library/ui';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  // Redirect to dashboard with a flag to show the notification
  useEffect(() => {
    navigate('/?redirected=true', { replace: true });
  }, [navigate]);

  // Brief interim render while redirecting
  return (
    <PageLayout title="404">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--fg-font-display)', fontSize: 'clamp(6rem, 20vw, 12rem)', lineHeight: 0.9, letterSpacing: '-0.025em', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: '2rem' }}>
          404
        </div>
        <div style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '2rem' }}>
          Redirecting to dashboard…
        </div>
        <Button size="sm" onClick={() => navigate('/')}>
          BACK HOME →
        </Button>
      </div>
    </PageLayout>
  );
};

export default NotFoundPage;
