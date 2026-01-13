import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../../styles/auth.css';

const LogoutPage: React.FC = () => {
  const { logout } = useAuth();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const performLogout = async () => {
      await logout();
    };
    performLogout();
  }, [logout]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      window.location.href = '/';
    }
  }, [countdown]);

  return (
    <div className="auth-container">
      <h1 className="title">
        <a href="/" className="logo-link">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </a>
      </h1>

      <div className="logout-card">
        <div className="logout-icon">👋</div>
        <h2>See You Soon!</h2>
        <p className="logout-message">
          You&apos;ve been logged out successfully.
        </p>
        <div className="logout-countdown">
          Redirecting in <span className="countdown-number">{countdown}</span>
        </div>
        <a href="/" className="btn primary logout-btn">
          Go to Homepage
        </a>
      </div>
    </div>
  );
};

export default LogoutPage;

