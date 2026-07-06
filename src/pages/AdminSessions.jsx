import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { getAllSessions, createSession, deleteSession } from '../services/api';
import Button from '../components/Button';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminSessions() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [newSession, setNewSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    setLoading(true);
    try {
      const res = await getAllSessions();
      setSessions(res.data.data || []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!tanggalMulai || !tanggalSelesai) return;
    if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
      setToast({ message: 'Tanggal selesai harus setelah tanggal mulai', type: 'error' });
      return;
    }
    setCreating(true);
    try {
      const res = await createSession(tanggalMulai, tanggalSelesai);
      setNewSession(res.data.data);
      setToast({ message: res.data.message, type: 'success' });
      setTanggalMulai('');
      setTanggalSelesai('');
      fetchSessions();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Gagal membuat sesi', type: 'error' });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(session) {
    const msg = session.total_absen > 0
      ? `Sesi ini memiliki ${session.total_absen} data absen. Yakin ingin menghapus? Data absen tetap tersimpan.`
      : 'Yakin ingin menghapus sesi ini?';
    if (!window.confirm(msg)) return;
    try {
      const res = await deleteSession(session.id);
      setToast({ message: res.data.message, type: 'success' });
      if (newSession?.id === session.id) setNewSession(null);
      fetchSessions();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Gagal menghapus sesi', type: 'error' });
    }
  }

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const activeSession = sessions.find((s) => s.status === 'aktif');
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header style={styles.header}>
        <h1 style={styles.title}>Kelola Sesi QR</h1>
        <div style={styles.headerRight}>
          <button onClick={() => navigate('/admin')} style={styles.backBtn}>Dashboard</button>
          <span style={styles.userName}>{user?.nama}</span>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            style={styles.logoutBtn}
          >
            Keluar
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* === Form Buat Sesi Baru === */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Generate QR Baru</h2>
          <p style={styles.cardSub}>Isi rentang tanggal absensi KKN</p>
          <form onSubmit={handleGenerate} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formField}>
                <label style={styles.label}>Tanggal Mulai</label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Tanggal Selesai</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>
            <Button type="submit" loading={creating}>
              Generate QR Baru
            </Button>
          </form>
        </div>

        {/* === QR yang Baru Dibuat === */}
        {newSession && (
          <div style={{ ...styles.card, border: '2px solid var(--green)' }}>
            <h2 style={styles.cardTitle}>QR Telah Dibuat</h2>
            <p style={styles.periodInfo}>
              Berlaku: {formatDate(newSession.tanggal_mulai)} – {formatDate(newSession.tanggal_selesai)}
            </p>
            <div style={styles.qrWrapper}>
              <QRCodeSVG value={`${window.location.origin}/scan?token=${newSession.qr_token}`} size={260} />
            </div>
            <p style={styles.qrNote}>Print/tempel QR ini di lokasi KKN.</p>
            <Button
              variant="success"
              onClick={() => {
                navigator.clipboard.writeText(newSession.qr_token);
                setToast({ message: 'Token QR disalin ke clipboard', type: 'success' });
              }}
              style={{ marginTop: '8px' }}
            >
              Salin Token QR
            </Button>
          </div>
        )}

        {/* === Riwayat Semua Sesi === */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Riwayat Sesi QR</h2>
          {loading ? (
            <LoadingSpinner text="Memuat sesi..." />
          ) : sessions.length === 0 ? (
            <EmptyState message="Belum ada sesi QR" icon="📋" />
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tanggal Mulai</th>
                    <th style={styles.th}>Tanggal Selesai</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Total Absen</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} style={styles.tr}>
                      <td style={styles.td}>{formatDate(s.tanggal_mulai)}</td>
                      <td style={styles.td}>{formatDate(s.tanggal_selesai)}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: s.status === 'aktif' ? '#DCFCE7' : '#F3F4F6',
                          color: s.status === 'aktif' ? '#166534' : '#6B7280',
                        }}>
                          {s.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {s.total_absen > 0 ? (
                          <span style={styles.countAbsen}>{s.total_absen}</span>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>0</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleDelete(s)}
                          style={styles.deleteBtn}
                          title="Hapus sesi"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg)',
    paddingBottom: '32px',
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
    color: 'var(--green)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userName: {
    fontSize: '14px',
    color: 'var(--text)',
  },
  backBtn: {
    padding: '6px 14px',
    background: '#F3F4F6',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
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
    maxWidth: '800px',
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
    margin: 0,
    color: 'var(--green)',
  },
  cardSub: {
    fontSize: '14px',
    color: 'var(--text)',
    marginTop: '4px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  formField: {
    flex: 1,
    minWidth: '200px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
  },
  periodInfo: {
    fontSize: '13px',
    color: 'var(--text)',
    marginTop: '4px',
  },
  qrWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0',
  },
  qrNote: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '10px 8px',
    borderBottom: '2px solid #E5E7EB',
    color: 'var(--text)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #F3F4F6',
  },
  td: {
    padding: '10px 8px',
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
  },
  countAbsen: {
    fontWeight: '600',
    color: '#374151',
  },
  deleteBtn: {
    padding: '4px 12px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default AdminSessions;
