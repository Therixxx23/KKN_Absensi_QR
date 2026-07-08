import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../services/api';
import { pendingScan } from '../utils/pendingScan';

function Login() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('pending') || pendingScan.get()) {
      setInfo('Login dulu untuk melanjutkan absen');
    }

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
      const pending = pendingScan.get();
      if (pending) {
        pendingScan.clear();
        navigate(`/scan?token=${pending}`, { replace: true });
      } else {
        const target = user.role === 'admin' || user.role === 'dpl' ? '/admin' : '/scan';
        navigate(target, { replace: true });
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(nim, password);
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const pending = pendingScan.get();
      if (pending) {
        pendingScan.clear();
        navigate(`/scan?token=${pending}`, { replace: true });
      } else {
        const target = user.role === 'admin' || user.role === 'dpl' ? '/admin' : '/scan';
        navigate(target, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'NIM atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Absensi QR KKN</h1>
        <p style={styles.subtitle}>Masuk sebagai peserta KKN</p>
        {info && <div style={styles.alertInfo}>{info}</div>}
        {error && <div style={styles.alert}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="NIM"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p style={styles.footer}>
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'var(--bg)',
  },
  card: {
    background: 'var(--white)',
    borderRadius: '12px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '360px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '4px',
    color: 'var(--green)',
  },
  subtitle: {
    fontSize: '14px',
    textAlign: 'center',
    color: 'var(--text)',
    marginBottom: '24px',
  },
  alertInfo: {
    background: '#E8F5E9',
    color: 'var(--green)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  alert: {
    background: 'var(--red-bg)',
    color: 'var(--red)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'var(--green)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '48px',
    opacity: 1,
  },
  footer: {
    marginTop: '16px',
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--text)',
  },
};

export default Login;
