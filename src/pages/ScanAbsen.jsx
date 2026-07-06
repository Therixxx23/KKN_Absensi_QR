import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { submitAttendance } from '../services/api';

const QR_BOX_SIZE = 250;

function ScanAbsen() {
  const user = JSON.parse(localStorage.getItem('user'));
  const scannerRef = useRef(null);
  const [status, setStatus] = useState('scanning');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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
        setStatus('loading');
        try {
          const res = await submitAttendance(decodedText, user.id);
          setResult(res.data.data);
          setStatus('success');
        } catch (err) {
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
    startScanner();
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
      }
    };
  }, [startScanner]);

  const handleScanLagi = () => {
    setStatus('scanning');
    setResult(null);
    setErrorMsg('');
    startScanner();
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
        {status === 'scanning' && (
          <>
            <p style={styles.instruction}>Arahkan kamera ke QR Code</p>
            <div id="qr-reader" style={styles.reader} />
            <p style={styles.hint}>Mengarahkan ke QR...</p>
          </>
        )}

        {status === 'loading' && (
          <div style={styles.statusBox}>
            <div style={spinnerStyle} />
            <p style={styles.loadingText}>Memproses absen...</p>
          </div>
        )}

        {status === 'success' && result && (
          <div style={{ ...styles.statusBox, background: '#DCFCE7', border: '2px solid var(--green)' }}>
            <div style={styles.icon}>✅</div>
            <h2 style={{ ...styles.statusTitle, color: '#166534' }}>
              Absen berhasil!
            </h2>
            <p style={styles.successText}>
              Halo, {result.nama}!<br />
              Absen kamu tercatat pukul{' '}
              {new Date(result.waktu).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {result.kegiatan && (
              <p style={styles.successSub}>Kegiatan: {result.kegiatan}</p>
            )}
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
  successSub: {
    fontSize: '14px',
    color: '#166534',
    opacity: 0.8,
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
