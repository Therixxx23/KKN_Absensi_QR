function EmptyState({ message = 'Belum ada data', icon = '📋' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        color: 'var(--text)',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
      <p style={{ fontSize: '16px', textAlign: 'center' }}>{message}</p>
    </div>
  );
}

export default EmptyState;
