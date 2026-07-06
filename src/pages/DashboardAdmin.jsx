import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createSession, getActiveSession, getAttendances } from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

function DashboardAdmin() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [session, setSession] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loadingSesi, setLoadingSesi] = useState(false);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchActive();
    fetchRekap();
  }, []);

  async function fetchActive() {
    setLoadingSesi(true);
    try {
      const res = await getActiveSession();
      if (res.data.data && res.data.data.length > 0) setSession(res.data.data[0]);
    } catch {
      // tidak ada session aktif
    } finally {
      setLoadingSesi(false);
    }
  }

  async function fetchRekap(tanggal) {
    setLoadingRekap(true);
    try {
      const t = tanggal || filterTanggal;
      const res = await getAttendances({ tanggal: t });
      setAttendances(res.data.data || []);
    } catch {
      setAttendances([]);
    } finally {
      setLoadingRekap(false);
    }
  }

  const handleFilterTanggal = (e) => {
    const t = e.target.value;
    setFilterTanggal(t);
    fetchRekap(t);
  };

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
      setSession(res.data.data);
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

  const exportCSV = () => {
    if (attendances.length === 0) return;
    const header = 'Nama,NIM,Jam Scan,Status,Kegiatan\n';
    const rows = attendances.map((a) =>
      `"${a.nama}","${a.nim}","${new Date(a.waktu_scan).toLocaleString('id-ID')}","${a.status}","${a.kegiatan}"`
    ).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rekap-absensi-${filterTanggal}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setToast({ message: 'File CSV berhasil diunduh', type: 'success' });
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

  const totalHadir = attendances.filter((a) => a.status === 'hadir').length;

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
        {/* === SECTION: Buat Sesi === */}
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

        {/* === SECTION: QR Aktif === */}
        {loadingSesi ? (
          <LoadingSpinner text="Memuat sesi..." />
        ) : session ? (
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
        ) : null}

        {/* === SECTION: Rekap Kehadiran === */}
        <div style={styles.card}>
          <div style={styles.rekapHeader}>
            <h2 style={styles.cardTitle}>Rekap Kehadiran</h2>
            <button
              onClick={exportCSV}
              disabled={attendances.length === 0}
              style={{
                ...styles.csvBtn,
                opacity: attendances.length === 0 ? 0.5 : 1,
                cursor: attendances.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Unduh CSV
            </button>
          </div>

          <div style={styles.filterRow}>
            <label style={styles.label}>Filter tanggal: </label>
            <input
              type="date"
              value={filterTanggal}
              onChange={handleFilterTanggal}
              style={styles.dateInput}
            />
            {!loadingRekap && attendances.length > 0 && (
              <span style={styles.countBadge}>
                Hadir: {totalHadir}/{attendances.length}
              </span>
            )}
          </div>

          {loadingRekap ? (
            <LoadingSpinner text="Memuat data..." />
          ) : attendances.length === 0 ? (
            <EmptyState message="Belum ada yang absen hari ini" icon="📋" />
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>NIM</th>
                    <th style={styles.th}>Jam Scan</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Kegiatan</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((a) => (
                    <tr key={a.id} style={styles.tr}>
                      <td style={styles.td}>{a.nama}</td>
                      <td style={styles.td}>{a.nim}</td>
                      <td style={styles.td}>
                        {new Date(a.waktu_scan).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={a.status} />
                      </td>
                      <td style={styles.td}>{a.kegiatan}</td>
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
    maxWidth: '640px',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
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
  rekapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  csvBtn: {
    padding: '8px 16px',
    background: 'var(--green)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  dateInput: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
  },
  countBadge: {
    fontSize: '13px',
    color: 'var(--text)',
    background: '#F3F4F6',
    padding: '4px 10px',
    borderRadius: '999px',
  },
  tableWrapper: {
    overflowX: 'auto',
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
};

export default DashboardAdmin;
