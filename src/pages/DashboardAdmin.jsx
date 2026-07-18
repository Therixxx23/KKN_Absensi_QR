import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getActiveSession, getAttendances } from '../services/api';
import { downloadQRasPDF } from '../utils/qrPdf';
import { getWIBDateString } from '../utils/wibDate';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

function DashboardAdmin() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loadingSesi, setLoadingSesi] = useState(false);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterTanggal, setFilterTanggal] = useState(getWIBDateString());
  const filterRef = useRef(filterTanggal);
  filterRef.current = filterTanggal;

  useEffect(() => {
    fetchActive();
    fetchRekap();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = getWIBDateString();
      if (newDate !== filterRef.current) {
        setFilterTanggal(newDate);
        fetchRekap(newDate);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchActive() {
    setLoadingSesi(true);
    try {
      const res = await getActiveSession();
      setSession(res.data.data);
    } catch {
      // no session
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

  const exportCSV = () => {
    if (attendances.length === 0) return;
    const header = 'Nama,NIM,Tanggal,Sesi Waktu,Jam Scan\n';
    const rows = attendances.map((a) =>
      `"${a.nama}","${a.nim}","${a.tanggal}","${a.sesi_waktu}","${new Date(a.waktu).toLocaleTimeString('id-ID')}"`
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

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const rows = {};
  attendances.forEach((a) => {
    const key = `${a.user_id}-${a.tanggal}`;
    if (!rows[key]) {
      rows[key] = { nama: a.nama, nim: a.nim, tanggal: a.tanggal, siang: null, sore: null };
    }
    if (a.sesi_waktu === 'siang') rows[key].siang = a.waktu;
    else if (a.sesi_waktu === 'sore') rows[key].sore = a.waktu;
  });
  const rekapRows = Object.values(rows);

  const totalHadir = attendances.length;

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header style={styles.header}>
        <h1 style={styles.title}>Admin QR</h1>
        <div style={styles.headerRight}>
          {user?.role === 'admin' && (
            <>
              <button onClick={() => navigate('/admin/reset-requests')} style={styles.resetBtn}>Reset PW</button>
              <button onClick={() => navigate('/admin/sessions')} style={styles.sessionsBtn}>Kelola Sesi</button>
            </>
          )}
          <span style={styles.userName}>{user?.nama}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Keluar</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* === SECTION: QR KKN Statis === */}
        {loadingSesi ? (
          <LoadingSpinner text="Memuat sesi..." />
        ) : session ? (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>QR KKN</h2>
            <p style={styles.periodInfo}>
              Berlaku: {formatDate(session.tanggal_mulai)} – {formatDate(session.tanggal_selesai)}
            </p>
            <div style={styles.qrWrapper}>
              <QRCodeSVG value={`${window.location.origin}/scan?token=${session.qr_token}`} size={280} />
            </div>
            <p style={styles.qrNote}>QR ini berlaku untuk seluruh periode KKN. Print/tempel di lokasi.</p>
            <div style={styles.btnGroup}>
              <Button
                variant="success"
                onClick={() => {
                  navigator.clipboard.writeText(session.qr_token);
                  setToast({ message: 'Token QR disalin ke clipboard', type: 'success' });
                }}
                style={{ flex: 1 }}
              >
                Salin Token QR
              </Button>
              <Button
                variant="primary"
                onClick={() => downloadQRasPDF(session.qr_token, session.tanggal_mulai, session.tanggal_selesai)}
                style={{ flex: 1 }}
              >
                Download QR (PDF)
              </Button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Belum Ada Sesi Aktif</h2>
            <p style={{ color: 'var(--text)', marginBottom: '16px' }}>
              Buat sesi QR baru dengan rentang tanggal yang diinginkan.
            </p>
            {user?.role === 'admin' && (
              <Button onClick={() => navigate('/admin/sessions')}>
                Kelola Sesi QR
              </Button>
            )}
          </div>
        )}

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
              <span style={styles.countBadge}>Total absen: {totalHadir}</span>
            )}
          </div>

          {loadingRekap ? (
            <LoadingSpinner text="Memuat data..." />
          ) : rekapRows.length === 0 ? (
            <EmptyState message="Belum ada yang absen hari ini" icon="📋" />
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>NIM</th>
                    <th style={styles.th}>Tanggal</th>
                    <th style={styles.th}>Siang</th>
                    <th style={styles.th}>Sore</th>
                  </tr>
                </thead>
                <tbody>
                  {rekapRows.map((r, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>{r.nama}</td>
                      <td style={styles.td}>{r.nim}</td>
                      <td style={styles.td}>
                        {new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={styles.td}>
                        {r.siang ? (
                          <StatusBadge status="hadir" />
                        ) : (
                          <span style={{ color: 'var(--text)', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {r.sore ? (
                          <StatusBadge status="hadir" />
                        ) : (
                          <span style={{ color: 'var(--text)', fontSize: '13px' }}>—</span>
                        )}
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
    gap: '12px',
  },
  userName: {
    fontSize: '14px',
    color: 'var(--text)',
  },
  resetBtn: {
    padding: '6px 14px',
    background: '#FFF3E0',
    color: '#E65100',
    border: '1px solid #FFB74D',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  sessionsBtn: {
    padding: '6px 14px',
    background: '#E8F5E9',
    color: 'var(--green)',
    border: '1px solid var(--green)',
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
  btnGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
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
  label: {
    fontSize: '13px',
    color: 'var(--text)',
    fontWeight: '500',
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
