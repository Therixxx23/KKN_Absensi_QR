import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Uncaught render error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReload = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          background: '#F9FAFB',
          textAlign: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px 24px',
            maxWidth: '400px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: '#111827' }}>
              Terjadi Kesalahan
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#6B7280' }}>
              Aplikasi mengalami error yang tidak terduga. Detail:
            </p>
            <pre style={{
              background: '#F3F4F6',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              textAlign: 'left',
              overflow: 'auto',
              maxHeight: '120px',
              color: '#DC2626',
              marginBottom: '16px',
              wordBreak: 'break-word',
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 24px',
                background: '#16A34A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
