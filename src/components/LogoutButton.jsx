import { useNavigate } from 'react-router-dom';

function LogoutButton({ style }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '6px 14px',
        background: '#E53935',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        cursor: 'pointer',
        ...style,
      }}
    >
      Keluar
    </button>
  );
}

export default LogoutButton;
