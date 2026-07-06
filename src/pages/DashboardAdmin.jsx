import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createSession, getActiveSession } from '../services/api';
import Button from '../components/Button';
import Toast from '../components/Toast';

function DashboardAdmin() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');

  useEffect(() => {
    fetchActive();
  }, []);

  async function fetchActive() {
    setLoading(true);
    try {
      const res = await getActiveSession();
      if (res.data.length > 0) setSession(res.data[0]);
    } catch {
      // tidak ada session aktif
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!namaKegiatan || !jamMulai || !jamSelesai) return;

    const now = new Date().toISOString().split('T')[0];
    setCreating(true);
    try {
      const res = await createSession({
        nama_kegiatan: namaKegiatan,
        valid_from: `${now}T${jamMulai}:00`,
        valid_until: `${now}T${jamSelesai}:00`,
      });
      setSession(res.data);
      setToast({ message: 'QR sesi berhasil dibuat!', type: 'success' });
      setNamaKegiatan('');
      setJamMulai('');
      setJamSelesai('');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Gagal membuat sesi', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatTime = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header style={styles.header}>
        <h1 style={styles.title}>Admin QR</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>{user?.nama}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Keluar</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Form buat sesi baru */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Buat Sesi Absen Baru</h2>
          <form onSubmit={handleCreate} style={styles.form}>
            <input
              style={styles.input}
              placeholder="Nama kegiatan (contoh: Briefing Pagi)"
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
              required
            />
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Jam Mulai</label>
                <input
                  style={styles.input}
                  type="time"
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Jam Selesai</label>
                <input
                  style={styles.input}
                  type="time"
                  value={jamSelesai}
                  onChange={(e) => setJamSelesai(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" loading={creating}>
              Buat Sesi Absen Hari Ini
            </Button>
          </form>
        </div>

        {/* Tampilkan QR aktif */}
        {loading && <p style={{ textAlign: 'center', color: 'var(--text)' }}>Memuat sesi aktif...</p>}

        {session ? (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>QR Sesi Aktif</h2>
            <div style={styles.qrWrapper}>
              <QRCodeSVG value={session.qr_token} size={280} />
            </div>
            <div style={styles.sessionInfo}>
              <p><strong>Kegiatan:</strong> {session.nama_kegiatan}</p>
              <p><strong>Berlaku:</strong> {formatTime(session.valid_from)} – {formatTime(session.valid_until)}</p>
            </div>
            <Button
              variant="success"
              onClick={() => {
                navigator.clipboard.writeText(session.qr_token);
                setToast({ message: 'Token QR disalin ke clipboard', type: 'success' });
              }}
              style={{ marginTop: '12px' }}
            >
              Salin Token QR
            </Button>
          </div>
        ) : (
          !loading && (
            <div style={{ ...styles.card, textAlign: 'center', color: 'var(--text)' }}>
              <p style={{ fontSize: '40px', marginBottom: '8px' }}>📋</p>
              <p>Belum ada sesi aktif hari ini.<br />Buat sesi baru untuk mulai absensi.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg)',
    paddingBottom: '24px',
  },
  header: {
    background: 'white',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--text-dark)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    fontSize: '14px',
    color: 'var(--text)',
  },
  logoutBtn: {
    padding: '6px 14px',
    background: 'var(--red)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  main: {
    padding: '16px',
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: 'var(--text-dark)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  field: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '13px',
    color: 'var(--text)',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  qrWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0',
  },
  sessionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '15px',
    color: 'var(--text-dark)',
  },
};

export default DashboardAdmin;
