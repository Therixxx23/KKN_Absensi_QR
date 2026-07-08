import { Navigate } from 'react-router-dom';

function getHome(role) {
  if (role === 'admin' || role === 'dpl') return '/admin';
  return '/scan';
}

function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHome(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
