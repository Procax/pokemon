import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const withAuthorization = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

    useEffect(() => {
      if (!token) {
        navigate('/login', { replace: true });
      }
    }, [token, navigate]);

    if (!token) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1f2937, #111827)',
          color: '#fff',
          fontSize: '1.2rem',
          fontFamily: 'sans-serif'
        }}>
          Redirecting to Trainer Registration...
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuthorization;
