import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/scan'} replace />;
  }

  return children;
}

export default ProtectedRoute;
