import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ScanAbsen from './pages/ScanAbsen';
import DashboardAdmin from './pages/DashboardAdmin';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/scan" element={user ? <ScanAbsen /> : <Navigate to="/login" />} />
      <Route path="/admin" element={user?.role === 'admin' ? <DashboardAdmin /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
