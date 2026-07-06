function Button({ children, variant = 'primary', loading, disabled, onClick, style, ...props }) {
  const colors = {
    primary: 'var(--blue)',
    success: 'var(--green)',
    danger: 'var(--red)',
  };

  return (
    <button
      style={{
        width: '100%',
        padding: '14px',
        background: colors[variant] || 'var(--blue)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.7 : 1,
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...style,
      }}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span style={spinnerStyle} />}
      {children}
    </button>
  );
}

const spinnerStyle = {
  width: '18px',
  height: '18px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: 'white',
  borderRadius: '50%',
  animation: 'spin 0.6s linear infinite',
};

export default Button;
