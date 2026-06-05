import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('authToken');

  // If there is no token, kick the user back to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If the token exists, render the child routes safely
  return <Outlet />;
}