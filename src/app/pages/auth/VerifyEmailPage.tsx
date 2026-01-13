import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../state/authState';
import { useAuth } from '../../hooks/useAuth';
import '../../../styles/auth.css';

const VerifyEmailPage: React.FC = () => {
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const { loading, error, success, resendVerificationEmail, logout, clearMessages } = useAuth();

  const handleResend = async () => {
    if (user) {
      await resendVerificationEmail(user);
    }
  };

  const handleContinue = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <p>Please log in to verify your email.</p>
          <Link to="/login" className="btn primary" style={{ marginTop: '1rem' }}>
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1 className="title">
        <a href="/" className="logo-link">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </a>
      </h1>
      <h2>Verify Your Email</h2>

      <div className="auth-box verification-content">
        {error && (
          <div className="auth-message error" onClick={clearMessages}>
            {error.message}
          </div>
        )}

        {success && (
          <div className="auth-message success" onClick={clearMessages}>
            {success}
          </div>
        )}

        <p className="auth-description">
          We sent a verification email to <strong>{user.email}</strong>
        </p>

        <p className="auth-description">
          Click the link in the email to verify your account. If you don't see it, check your spam folder.
        </p>

        <button
          className="btn secondary"
          onClick={handleResend}
          disabled={loading}
          style={{ marginTop: '1rem' }}
        >
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </button>

        <button
          className="btn primary"
          onClick={handleContinue}
          style={{ marginTop: '0.5rem' }}
        >
          Continue to App
        </button>

        <button
          className="btn text"
          onClick={handleLogout}
          style={{ marginTop: '0.5rem' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
