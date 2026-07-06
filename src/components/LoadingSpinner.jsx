function LoadingSpinner({ text = 'Memuat...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: '12px',
      }}
    >
      <div style={spinnerStyle} />
      <p style={{ color: 'var(--text)', fontSize: '14px' }}>{text}</p>
    </div>
  );
}

const spinnerStyle = {
  width: '32px',
  height: '32px',
  border: '3px solid #E5E7EB',
  borderTopColor: 'var(--blue)',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
};

export default LoadingSpinner;
