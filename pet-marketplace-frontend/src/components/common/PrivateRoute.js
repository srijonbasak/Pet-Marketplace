import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Optionally, show a spinner or return null while loading
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    // Redirect to their own dashboard
    switch (user.role) {
      case 'seller':
        return <Navigate to="/seller/dashboard" />;
      case 'ngo':
        return <Navigate to="/ngo/dashboard" />;
      case 'employee':
        return <Navigate to="/employee/dashboard" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default PrivateRoute; 