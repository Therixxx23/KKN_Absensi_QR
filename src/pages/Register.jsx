import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

function Register() {
  const [form, setForm] = useState({ nama: '', nim: '', email: '', password: '', kelompok: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!/^\d+$/.test(form.nim)) errs.nim = 'NIM harus berupa angka';
    if (form.password.length < 8) errs.password = 'Password minimal 8 karakter';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await register(form);
      setSuccess(res.data.message || 'Registrasi berhasil, silakan login');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Daftar Peserta KKN</h1>
        <p style={styles.subtitle}>Buat akun untuk mulai absensi</p>

        {error && <div style={styles.alertError}>{error}</div>}
        {success && <div style={styles.alertSuccess}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Nama Lengkap</label>
            <input
              style={styles.input}
              name="nama"
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>NIM</label>
            <input
              style={{ ...styles.input, borderColor: fieldErrors.nim ? 'var(--red)' : 'var(--border)' }}
              name="nim"
              placeholder="Nomor Induk Mahasiswa"
              value={form.nim}
              onChange={handleChange}
              required
            />
            {fieldErrors.nim && <p style={styles.fieldError}>{fieldErrors.nim}</p>}
          </div>

          <div>
            <label style={styles.label}>Email <span style={{ color: 'var(--text)', fontSize: '13px' }}>(opsional)</span></label>
            <input
              style={styles.input}
              name="email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input
              style={{ ...styles.input, borderColor: fieldErrors.password ? 'var(--red)' : 'var(--border)' }}
              name="password"
              type="password"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={handleChange}
              required
            />
            {fieldErrors.password && <p style={styles.fieldError}>{fieldErrors.password}</p>}
          </div>

          <div>
            <label style={styles.label}>Kelompok KKN</label>
            <select
              style={styles.input}
              name="kelompok"
              value={form.kelompok}
              onChange={handleChange}
              required
            >
              <option value="">Pilih kelompok</option>
              <option value="Kelompok 1">Kelompok 1</option>
              <option value="Kelompok 2">Kelompok 2</option>
              <option value="Kelompok 3">Kelompok 3</option>
              <option value="Kelompok 4">Kelompok 4</option>
              <option value="Kelompok 5">Kelompok 5</option>
            </select>
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>

        <p style={styles.footer}>
          Sudah punya akun? <Link to="/login">Login di sini</Link>
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
    maxWidth: '400px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '4px',
    color: 'var(--green)',
  },
  subtitle: {
    fontSize: '14px',
    textAlign: 'center',
    color: 'var(--text)',
    marginBottom: '20px',
  },
  alertError: {
    background: 'var(--red-bg)',
    color: 'var(--red)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  alertSuccess: {
    background: 'var(--green-bg)',
    color: 'var(--green)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-dark)',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
  },
  fieldError: {
    color: 'var(--red)',
    fontSize: '12px',
    marginTop: '4px',
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
};

export default Register;
