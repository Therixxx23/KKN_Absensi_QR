import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { verifyNim, resetPassword } from '../services/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCariAkun = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await verifyNim(nim);
      setNama(res.data.nama);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordBaru !== konfirmasi) {
      setError('Konfirmasi password tidak cocok');
      return;
    }
    if (passwordBaru.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(nim, passwordBaru);
      setMessage(res.data.message);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Lupa Password</h1>

        {step === 1 && (
          <>
            <p style={styles.subtitle}>Masukkan NIM untuk mencari akun</p>
            {error && <div style={styles.alert}>{error}</div>}
            <form onSubmit={handleCariAkun} style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="NIM"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                required
              />
              <button style={styles.button} type="submit" disabled={loading}>
                {loading ? 'Mencari...' : 'Cari Akun'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div style={styles.alertSuccess}>
              Akun ditemukan: <strong>{nama}</strong>
            </div>
            {error && <div style={styles.alert}>{error}</div>}
            {message && <div style={styles.alertSuccess}>{message}</div>}
            {!message && (
              <form onSubmit={handleResetPassword} style={styles.form}>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Password baru (min 8 karakter)"
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  required
                />
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Konfirmasi password baru"
                  value={konfirmasi}
                  onChange={(e) => setKonfirmasi(e.target.value)}
                  required
                />
                <button style={styles.button} type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                </button>
              </form>
            )}
            <p style={styles.footer}>
              <button
                onClick={() => { setStep(1); setNim(''); setError(''); }}
                style={styles.linkBtn}
              >
                Ganti NIM
              </button>
            </p>
          </>
        )}

        <p style={styles.footer}>
          <Link to="/login">Kembali ke Login</Link>
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
  alertSuccess: {
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
    boxSizing: 'border-box',
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
  },
  footer: {
    marginTop: '16px',
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--text)',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--green)',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
  },
};

export default ForgotPassword;
