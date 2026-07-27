import { Navigate } from 'react-router-dom';

function getHome(role) {
  if (role === 'admin' || role === 'dpl') return '/admin';
  return '/scan';
}

function ProtectedRoute({ children, allowedRoles }) {
  let user = null;
  let token = null;
  try {
    token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('[ProtectedRoute] Failed to parse user from localStorage:', e);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHome(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
