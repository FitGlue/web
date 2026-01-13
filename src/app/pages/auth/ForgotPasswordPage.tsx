import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../../styles/auth.css';

const ForgotPasswordPage: React.FC = () => {
  const { loading, error, success, sendPasswordReset, clearMessages } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendPasswordReset(email);
    if (!error) {
      setEmail('');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="title">
        <a href="/" className="logo-link">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </a>
      </h1>
      <h2>Reset Password</h2>

      <div className="auth-box">
        <p className="auth-description">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

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

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="switch-auth">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
