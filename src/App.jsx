import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { verifyToken } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import ScanAbsen from './pages/ScanAbsen';
import DashboardAdmin from './pages/DashboardAdmin';
import AdminSessions from './pages/AdminSessions';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      setAuthReady(true);
      return;
    }

    const publicPaths = ['/', '/login', '/register'];

    verifyToken()
      .then((res) => {
        if (res.data.success) {
          if (publicPaths.includes(window.location.pathname)) {
            const target = user.role === 'admin' || user.role === 'dpl' ? '/admin' : '/scan';
            navigate(target, { replace: true });
          }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (publicPaths.includes(window.location.pathname)) {
            navigate('/login', { replace: true });
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (publicPaths.includes(window.location.pathname)) {
          navigate('/login', { replace: true });
        }
      })
      .finally(() => setAuthReady(true));
  }, []);

  if (!authReady) {
    return <LoadingSpinner text="Memeriksa sesi..." />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/scan" element={<ScanAbsen />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'dpl']}>
            <DashboardAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sessions"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSessions />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
