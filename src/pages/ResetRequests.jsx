import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResetRequests, approveResetRequest } from '../services/api';
import Button from '../components/Button';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

function ResetRequests() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await getResetRequests();
      setRequests(res.data.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(request) {
    setApproving(request.id);
    try {
      const res = await approveResetRequest(request.id);
      const { new_password } = res.data.data;
      setShowModal({ ...request, new_password });
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Gagal approve', type: 'error' });
    } finally {
      setApproving(null);
    }
  }

  const copyPassword = () => {
    if (showModal?.new_password) {
      navigator.clipboard.writeText(showModal.new_password);
      setToast({ message: 'Password disalin ke clipboard', type: 'success' });
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header style={styles.header}>
        <h1 style={styles.title}>Reset Password</h1>
        <div style={styles.headerRight}>
          <button onClick={() => navigate('/admin')} style={styles.backBtn}>Dashboard</button>
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin/sessions')} style={styles.sessionsBtn}>Kelola Sesi</button>
          )}
          <span style={styles.userName}>{user?.nama}</span>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Permintaan Reset Password</h2>
          <p style={styles.subtitle}>Klik Approve untuk membuat password baru dan munculkan ke admin</p>

          {loading ? (
            <LoadingSpinner text="Memuat data..." />
          ) : requests.length === 0 ? (
            <EmptyState message="Belum ada permintaan reset password" icon="🔐" />
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nama</th>
                    <th style={styles.th}>NIM</th>
                    <th style={styles.th}>Diminta</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} style={styles.tr}>
                      <td style={styles.td}>{r.nama}</td>
                      <td style={styles.td}>{r.nim}</td>
                      <td style={styles.td}>{formatDate(r.created_at)}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleApprove(r)}
                          disabled={approving === r.id}
                          style={{
                            ...styles.approveBtn,
                            opacity: approving === r.id ? 0.6 : 1,
                          }}
                        >
                          {approving === r.id ? 'Memproses...' : 'Approve & Generate Password'}
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

      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Password Baru</h3>
            <p style={styles.modalText}>
              Password baru untuk <strong>{showModal.nama}</strong> (NIM: {showModal.nim}):
            </p>
            <div style={styles.passwordBox}>
              <code style={styles.passwordCode}>{showModal.new_password}</code>
            </div>
            <p style={styles.modalNote}>
              Password ini hanya muncul sekali. Sampaikan ke mahasiswa secara langsung.
            </p>
            <div style={styles.modalActions}>
              <Button onClick={copyPassword}>Salin Password</Button>
              <Button variant="secondary" onClick={() => setShowModal(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}
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
  backBtn: {
    padding: '6px 14px',
    background: '#E8F5E9',
    color: 'var(--green)',
    border: '1px solid var(--green)',
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
  subtitle: {
    fontSize: '13px',
    color: 'var(--text)',
    marginTop: '4px',
    marginBottom: '16px',
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
  approveBtn: {
    padding: '6px 12px',
    background: 'var(--green)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '16px',
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--green)',
    marginBottom: '12px',
  },
  modalText: {
    fontSize: '14px',
    color: 'var(--text)',
    marginBottom: '12px',
  },
  passwordBox: {
    background: '#F3F4F6',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  passwordCode: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: '2px',
    userSelect: 'all',
  },
  modalNote: {
    fontSize: '13px',
    color: '#E53935',
    marginBottom: '16px',
  },
  modalActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
};

export default ResetRequests;
