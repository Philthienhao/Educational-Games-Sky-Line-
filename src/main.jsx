import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

// Force unregister all stale Service Workers on mobile browsers to prevent stale chunk lockouts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
}

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#071521',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎓</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '12px', color: '#f59e0b' }}>
            Hệ Thống Hỗ Trợ Dạy Và Học
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '400px', marginBottom: '24px' }}>
            Đã có phiên bản cập nhật mới trên hệ thống. Vui lòng bấm vào nút bên dưới để tải lại phiên bản mới nhất!
          </p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            style={{
              background: 'linear-gradient(135deg, #00a896 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 28px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 168, 150, 0.4)'
            }}
          >
            🔄 Tải Lại Phiên Bản Mới Nhất
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
