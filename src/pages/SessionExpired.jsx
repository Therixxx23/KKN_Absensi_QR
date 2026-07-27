import { useNavigate } from 'react-router-dom';

function SessionExpired() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h1 style={styles.title}>Sesi Anda Berakhir</h1>
        <p style={styles.desc}>
          Sesi login kamu sudah habis. Silakan login kembali untuk melanjutkan.
        </p>
        <button
          style={styles.button}
          onClick={() => navigate('/login', { replace: true })}
        >
          Login Kembali
        </button>
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
    padding: '40px 32px',
    width: '100%',
    maxWidth: '360px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  iconWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--green-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--text-dark)',
    marginBottom: '8px',
  },
  desc: {
    fontSize: '14px',
    color: 'var(--text)',
    lineHeight: '1.6',
    marginBottom: '24px',
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
};

export default SessionExpired;
