import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../../styles/auth.css';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      // Redirect to marketing homepage after logout
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    };
    performLogout();
  }, [logout]);

  return (
    <div className="auth-container">
      <h1 className="title">
        <a href="/" className="logo-link">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </a>
      </h1>

      <div className="auth-box" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>👋 Goodbye!</h2>
        <p className="auth-description">
          You have been logged out successfully.
        </p>
        <p className="redirect-message">
          Redirecting to login page...
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
