import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner'; // We'll create this

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth(); // Destructure isAdmin
  const isAuthorized = allowedRoles.includes(user?.role); // Check if user's role is allowed

  if (loading) {
    return <LoadingSpinner />; // Show a loading spinner while auth state is being determined
  }

  if (!isAuthenticated()) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !isAuthorized) {
    // If authenticated but not authorized for this role, redirect to a generic dashboard or unauthorized page
    // For now, let's redirect to admin dashboard if not authorized, or root
    console.warn("Unauthorized access attempt for role:", user?.role, "on allowed roles:", allowedRoles);
    return <Navigate to="/admin/dashboard" replace />; // Or a specific /unauthorized page
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;