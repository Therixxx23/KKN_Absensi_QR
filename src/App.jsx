import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { verifyToken } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ScanAbsen from './pages/ScanAbsen';
import DashboardAdmin from './pages/DashboardAdmin';
import AdminSessions from './pages/AdminSessions';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let token, user;
    try {
      token = localStorage.getItem('token');
      const raw = localStorage.getItem('user');
      user = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[App] Failed to parse user from localStorage:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    console.log('[App] Mount — pathname:', window.location.pathname, 'token exists:', !!token, 'user:', user);

    if (!token || !user) {
      console.log('[App] No session, authReady=true');
      setAuthReady(true);
      return;
    }

    const publicPaths = ['/', '/login', '/register', '/forgot-password'];
    const isPublic = publicPaths.includes(window.location.pathname);

    console.log('[App] Calling verifyToken()...');
    verifyToken()
      .then((res) => {
        console.log('[App] verifyToken OK:', res.data);
        if (res.data.success && isPublic) {
          const target = user.role === 'admin' || user.role === 'dpl' ? '/admin' : '/scan';
          console.log('[App] Authenticated on public path → redirect', target);
          navigate(target, { replace: true });
        }
      })
      .catch((err) => {
        console.error('[App] verifyToken FAILED:', err?.response?.status, err?.response?.data, err?.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('[App] Cleared auth, redirecting to /login');
        navigate('/login', { replace: true });
      })
      .finally(() => {
        console.log('[App] authReady=true');
        setAuthReady(true);
      });
  }, []);

  if (!authReady) {
    return <LoadingSpinner text="Memeriksa sesi..." />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
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
