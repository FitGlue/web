import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../../styles/auth.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 9c0-4.97-4.03-9-9-9S0 4.03 0 9c0 4.49 3.29 8.21 7.59 8.88v-6.28H5.31V9h2.28V7.02c0-2.25 1.34-3.49 3.39-3.49.98 0 2.01.18 2.01.18v2.21h-1.13c-1.11 0-1.46.69-1.46 1.4V9h2.49l-.4 2.6h-2.09v6.28C14.71 17.21 18 13.49 18 9z" fill="currentColor" />
  </svg>
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, loginWithEmail, loginWithGoogle, loginWithFacebook, clearMessages } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginWithEmail(email, password);
    if (success) {
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      navigate('/');
    }
  };

  const handleFacebookLogin = async () => {
    const success = await loginWithFacebook();
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="title">
        <a href="/" className="logo-link">
          <span className="fit">Fit</span><span className="glue">Glue</span>
        </a>
      </h1>
      <h2>Login</h2>

      <div className="auth-box">
        {error && (
          <div className="auth-message error" onClick={clearMessages}>
            {error.message}
          </div>
        )}

        <form onSubmit={handleEmailLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">OR</div>

        <button
          className="btn secondary google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <button
          className="btn secondary facebook-btn"
          onClick={handleFacebookLogin}
          disabled={loading}
        >
          <FacebookIcon />
          Sign in with Facebook
        </button>

        <p className="switch-auth">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
