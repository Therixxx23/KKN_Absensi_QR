function Logo({ maxWidth = 200 }) {
  return (
    <div style={{ maxWidth, width: '100%', margin: '0 auto 24px auto' }}>
      <div
        style={{
          width: '100%',
          aspectRatio: '2 / 1',
          background: '#E0E0E0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#757575',
          fontWeight: 500,
        }}
      >
        Logo KKN
      </div>
    </div>
  );
}

export default Logo;
