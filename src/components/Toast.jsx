import { useEffect } from 'react';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--blue)';

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: bgColor,
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '90%',
        textAlign: 'center',
      }}
    >
      {message}
    </div>
  );
}

export default Toast;
