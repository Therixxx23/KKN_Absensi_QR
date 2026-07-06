import { useState } from 'react';
import { login } from '../services/api';

function Login() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(nim, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = res.data.user.role === 'admin' ? '/admin' : '/scan';
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
        <p style={styles.subtitle}>Masuk untuk melanjutkan</p>
        {error && <p style={styles.error}>{error}</p>}
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
    color: 'var(--text-dark)',
  },
  subtitle: {
    fontSize: '14px',
    textAlign: 'center',
    color: 'var(--text)',
    marginBottom: '24px',
  },
  error: {
    color: 'var(--red)',
    fontSize: '14px',
    textAlign: 'center',
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
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'var(--blue)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '48px',
  },
};

export default Login;
