import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

const CURRENT_APP_BUILD_VERSION = 'v2.0.0_skl_web_links_feature';
try {
  const savedVer = localStorage.getItem('gvd_app_build_version');
  if (savedVer !== CURRENT_APP_BUILD_VERSION) {
    localStorage.setItem('gvd_app_build_version', CURRENT_APP_BUILD_VERSION);
    try {
      localStorage.removeItem('gvd_base_games');
      localStorage.removeItem('gvd_saved_games');
    } catch (e) {}
    if ('caches' in window) {
      caches.keys().then(names => names.forEach(n => caches.delete(n))).catch(() => {});
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(() => {});
    }
  }
} catch (e) {}

// Force unregister all stale Service Workers on mobile browsers to prevent stale chunk lockouts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
}

// Clear any old Vite asset caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  }).catch(() => {});
}

const performHardPurgeAndReload = async () => {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    // Purge local state keys that could cause crashes
    localStorage.removeItem('gvd_base_games');
    localStorage.removeItem('gvd_saved_games');
    localStorage.removeItem('gvd_active_tab');
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('gvd_parent_meeting_silhouette')) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {}
  } catch (e) {
    console.warn("Purge caches error:", e);
  }
  
  // Force browser HTTP cache bypass by setting a fresh query timestamp
  const targetUrl = window.location.origin + window.location.pathname + '?v=' + Date.now();
  window.location.href = targetUrl;
};

const performDeepResetAndReload = async () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if (window.indexedDB) {
      try { window.indexedDB.deleteDatabase('GVD_Educational_Games_DB'); } catch (e) {}
    }
  } catch (e) {}
  window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
};

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: true };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error ? this.state.error.toString() : 'Unknown Error';
      const errorStack = this.state.error ? this.state.error.stack : '';

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
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎓</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px', color: '#f59e0b' }}>
            ĐỒ NGHỀ DẠY HỌC
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#cbd5e1', maxWidth: '480px', marginBottom: '24px', lineHeight: 1.6 }}>
            Đã có phiên bản cập nhật mới trên hệ thống. Vui lòng bấm vào nút bên dưới để xóa cache và tải bản mới nhất!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '380px' }}>
            <button
              onClick={performHardPurgeAndReload}
              style={{
                background: 'linear-gradient(135deg, #00a896 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 28px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 168, 150, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🔄 Tải Lại Phiên Bản Mới Nhất
            </button>

            <button
              onClick={performDeepResetAndReload}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '14px',
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              ⚡ Xóa Sạch Dữ Liệu Cũ & Reset Trang Web
            </button>

            <button
              onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
              style={{
                background: 'transparent',
                color: '#64748b',
                border: 'none',
                fontSize: '0.75rem',
                cursor: 'pointer',
                marginTop: '4px',
                textDecoration: 'underline'
              }}
            >
              {this.state.showDetails ? 'Ẩn chi tiết báo lỗi' : 'Xem chi tiết báo lỗi'}
            </button>
          </div>

          {this.state.showDetails && (
            <div style={{
              marginTop: '16px',
              padding: '14px',
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              maxHeight: '220px',
              overflowY: 'auto',
              textAlign: 'left',
              fontSize: '0.75rem',
              color: '#fca5a5',
              fontFamily: 'monospace',
              maxWidth: '600px',
              width: '100%'
            }}>
              <b>Chi tiết lỗi kỹ thuật:</b> {errorMsg}
              {errorStack && (
                <pre style={{ marginTop: '6px', whiteSpace: 'pre-wrap', fontSize: '0.7rem', color: '#94a3b8' }}>
                  {errorStack}
                </pre>
              )}
            </div>
          )}
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

