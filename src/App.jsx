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

    verifyToken()
      .then((res) => {
        if (res.data.success) {
          const target = user.role === 'admin' ? '/admin' : '/scan';
          navigate(target, { replace: true });
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
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
      <Route
        path="/scan"
        element={
          <ProtectedRoute role="mahasiswa">
            <ScanAbsen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <DashboardAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sessions"
        element={
          <ProtectedRoute role="admin">
            <AdminSessions />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
