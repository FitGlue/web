import React from 'react';

const NotFoundPage: React.FC = () => {
  const errorCodeStyle: React.CSSProperties = {
    fontSize: 'clamp(6rem, 15vw, 10rem)',
    fontWeight: 900,
    marginBottom: 0,
    lineHeight: 1,
    letterSpacing: '-0.05em',
    background: 'linear-gradient(135deg, #e91e63, #9c27b0)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    marginTop: '1rem',
    fontWeight: 700,
    color: '#fff',
  };

  const textStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '1rem',
    fontSize: '1.1rem',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-block',
    marginTop: '2rem',
    textDecoration: 'none',
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #00bcd4, #9c27b0)',
    color: 'white',
    borderRadius: '50px',
    fontWeight: 600,
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div className="auth-container">
      <h1 style={errorCodeStyle}>404</h1>
      <h2 style={titleStyle}>
        Page <span style={{ color: '#e91e63' }}>Not</span>{' '}
        <span style={{ color: '#00bcd4' }}>Found</span>
      </h2>
      <p style={textStyle}>Looks like you've ventured into the unknown.</p>
      <p style={textStyle}>
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>
      <a href="/" style={buttonStyle}>
        Return to Dashboard
      </a>
    </div>
  );
};

export default NotFoundPage;


