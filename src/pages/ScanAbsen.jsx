import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { submitAttendance, verifyToken } from '../services/api';
import { pendingScan } from '../utils/pendingScan';

const QR_BOX_SIZE = 250;

function extractToken(input) {
  try {
    const url = new URL(input);
    return url.searchParams.get('token') || input;
  } catch {
    return input;
  }
}

function ScanAbsen() {
  const navigate = useNavigate();
  let user = null;
  let token = null;
  try {
    const raw = localStorage.getItem('user');
    user = raw ? JSON.parse(raw) : null;
    token = localStorage.getItem('token');
  } catch (e) {
    console.error('[ScanAbsen] Failed to parse user from localStorage:', e);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  const scannerRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrTokenFromUrl = params.get('token');
    console.log('[ScanAbsen] Mount — qrTokenFromUrl:', qrTokenFromUrl, 'token exists:', !!token, 'user:', user);

    if (!token || !user) {
      console.log('[ScanAbsen] No valid session, redirecting to /session-expired');
      if (qrTokenFromUrl) {
        pendingScan.set(qrTokenFromUrl);
        console.log('[ScanAbsen] Saved pendingScan:', qrTokenFromUrl, '→ redirect /session-expired');
      }
      navigate('/session-expired', { replace: true });
      return;
    }

    if (user.role !== 'mahasiswa') {
      console.log('[ScanAbsen] Role is', user.role, '→ redirect /admin');
      navigate('/admin', { replace: true });
      return;
    }

    if (qrTokenFromUrl) {
      console.log('[ScanAbsen] Has QR token, calling verifyToken first...');
      verifyToken()
        .then((res) => {
          console.log('[ScanAbsen] verifyToken OK, calling processAttendance');
          processAttendance(qrTokenFromUrl, user.id);
        })
        .catch((err) => {
          console.error('[ScanAbsen] verifyToken FAILED:', err?.response?.status, err?.response?.data, err?.message);
          pendingScan.set(qrTokenFromUrl);
          console.log('[ScanAbsen] Saved pendingScan:', qrTokenFromUrl, '→ redirect /session-expired');
          navigate('/session-expired', { replace: true });
        });
    } else {
      console.log('[ScanAbsen] No QR token in URL, showing scanner');
      setStatus('scanning');
      setShowScanner(true);
    }
  }, []);

  const startScanner = useCallback(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: QR_BOX_SIZE, height: QR_BOX_SIZE },
      },
      async (decodedText) => {
        await scanner.stop();
        console.log('[ScanAbsen] QR scanned:', decodedText);
        setStatus('loading');
        try {
          const extracted = extractToken(decodedText);
          console.log('[ScanAbsen] Extracted token:', extracted);
          const res = await submitAttendance(extracted, user.id);
          console.log('[ScanAbsen] submitAttendance OK:', res.data);
          setResult(res.data.data);
          setStatus('success');
        } catch (err) {
          console.error('[ScanAbsen] Scanner submit FAILED:', err?.response?.status, err?.response?.data, err?.message);
          setErrorMsg(err.response?.data?.message || 'Gagal absen, coba lagi');
          setStatus('error');
        }
      },
      () => {}
    ).catch(() => {
      setErrorMsg('Tidak bisa mengakses kamera. Pastikan izin kamera diberikan.');
      setStatus('error');
    });
  }, [user.id]);

  useEffect(() => {
    if (showScanner) {
      startScanner();
    }
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
      }
    };
  }, [showScanner, startScanner]);

  async function processAttendance(qrToken, userId) {
    console.log('[ScanAbsen] processAttendance — qrToken:', qrToken, 'userId:', userId);
    setStatus('loading');
    try {
      const res = await submitAttendance(qrToken, userId);
      console.log('[ScanAbsen] submitAttendance OK:', res.data);
      setResult(res.data.data);
      setStatus('success');
    } catch (err) {
      console.error('[ScanAbsen] submitAttendance FAILED:', err?.response?.status, err?.response?.data, err?.message);
      setErrorMsg(err.response?.data?.message || 'Gagal absen, coba lagi');
      setStatus('error');
    }
  }

  const handleScanLagi = () => {
    setStatus('scanning');
    setResult(null);
    setErrorMsg('');
    setShowScanner(true);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Absen QR</h1>
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
      </header>

      <main style={styles.main}>
        {status === 'loading' && (
          <div style={styles.statusBox}>
            <div style={spinnerStyle} />
            <p style={styles.loadingText}>Memproses absen...</p>
          </div>
        )}

        {status === 'scanning' && (
          <>
            <p style={styles.instruction}>Arahkan kamera ke QR Code KKN</p>
            <div style={styles.jamInfo}>
              ⏰ Jam absen: siang 06:00-12:00 &bull; sore 17:00-21:00
            </div>
            <div id="qr-reader" style={styles.reader} />
            <p style={styles.hint}>Mengarahkan ke QR...</p>
          </>
        )}

        {status === 'success' && result && (
          <div style={{ ...styles.statusBox, background: '#DCFCE7', border: '2px solid var(--green)' }}>
            <div style={styles.icon}>✅</div>
            <h2 style={{ ...styles.statusTitle, color: '#166534' }}>
              Absen {result.sesi_waktu} berhasil!
            </h2>
            <p style={styles.successText}>
              Halo, {result.nama}!<br />
              Absen kamu tercatat pukul{' '}
              {new Date(result.waktu).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <button onClick={handleScanLagi} style={styles.scanAgainBtn}>
              Scan Lagi
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ ...styles.statusBox, background: '#FEE2E2', border: '2px solid var(--red)' }}>
            <div style={styles.icon}>❌</div>
            <p style={{ ...styles.statusTitle, color: '#991B1B', fontSize: '16px' }}>
              {errorMsg}
            </p>
            <button onClick={handleScanLagi} style={styles.retryBtn}>
              Coba Lagi
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #E5E7EB',
  borderTopColor: 'var(--green)',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'white',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #E5E7EB',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--green)',
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
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  instruction: {
    fontSize: '16px',
    color: 'var(--text)',
    marginBottom: '8px',
    textAlign: 'center',
  },
  jamInfo: {
    fontSize: '13px',
    color: 'var(--text)',
    backgroundColor: '#F3F4F6',
    padding: '6px 14px',
    borderRadius: '999px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  reader: {
    width: '100%',
    maxWidth: '360px',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  hint: {
    marginTop: '16px',
    fontSize: '14px',
    color: 'var(--text)',
  },
  statusBox: {
    width: '100%',
    maxWidth: '360px',
    borderRadius: '12px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '48px',
  },
  statusTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  loadingText: {
    color: 'var(--text)',
    fontSize: '16px',
  },
  successText: {
    fontSize: '18px',
    color: '#166534',
    fontWeight: '500',
    lineHeight: '1.6',
  },
  scanAgainBtn: {
    marginTop: '8px',
    padding: '12px 32px',
    background: 'var(--green)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '48px',
  },
  retryBtn: {
    marginTop: '8px',
    padding: '12px 32px',
    background: 'var(--red)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '48px',
  },
};

export default ScanAbsen;
