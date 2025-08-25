import React from 'react';
import { useNavigate } from 'react-router-dom';

const withAuthorization = (WrappedComponent) => {
    const AuthenticatedComponent = (props) => {
    const navigate = useNavigate(); // Call useNavigate directly here

    // const isAuthenticated = localStorage.getItem('authToken'); // Check for auth token

    const isAuthenticated = true

    // If not authenticated, redirect
    if (!isAuthenticated) {
      navigate('/login'); 
      return <p>Redirecting to login...</p>;
    }

    return <WrappedComponent {...props} />;
  };
  return AuthenticatedComponent;
};

export default withAuthorization;
