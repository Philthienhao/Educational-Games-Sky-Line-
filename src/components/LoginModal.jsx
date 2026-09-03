import React, { useState } from 'react';
import { Lock, User, KeyRound, Sparkles, ShieldCheck, ArrowRight, AlertCircle, BookOpen } from 'lucide-react';
import { StorageService } from '../services/storage';

export function LoginModal({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!');
      return;
    }

    setLoading(true);

    try {
      const user = await StorageService.authenticateUserAsync(username, password);

      if (user) {
        StorageService.setCurrentUser({ ...user, isLoggedIn: true });
        if (onLoginSuccess) onLoginSuccess(user);
      } else {
        setErrorMsg('Tên tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại!');
        setLoading(false);
      }
    } catch (e) {
      setErrorMsg('Có lỗi xảy ra khi xác thực. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Montserrat, system-ui, sans-serif'
    }}>

      {/* Decorative Glowing Backdrop Orbs */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: '320px',
        height: '320px',
        background: 'rgba(99, 102, 241, 0.25)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '20%',
        width: '350px',
        height: '350px',
        background: 'rgba(14, 165, 233, 0.2)',
        filter: 'blur(110px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '32px',
        padding: '36px 32px',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.2)',
        color: '#ffffff',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 16px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <BookOpen size={36} color="#ffffff" />
          </div>

          <h2 style={{ 
            fontSize: '1.38rem', 
            fontWeight: 900, 
            margin: '0', 
            whiteSpace: 'nowrap',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            HỆ THỐNG HỖ TRỢ DẠY VÀ HỌC
          </h2>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '14px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              TÊN TÀI KHOẢN:
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên tài khoản"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '16px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              MẬT KHẨU:
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '16px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '14px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.05rem',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Đang xác thực...' : (
              <>
                <span>ĐĂNG NHẬP HỆ THỐNG</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Footer info & Contact Zalo */}
        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0 0 6px 0', lineHeight: 1.5, fontWeight: 600 }}>
            📌 <em>Lưu ý: Giáo viên chưa có tài khoản vui lòng liên hệ Admin <strong>Thầy Hảo Địa Lí</strong> để được cấp quyền truy cập.</em>
          </p>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
            <span>📱 Zalo liên hệ Thầy Hảo Địa Lí:</span>
            <a 
              href="https://zalo.me/0387806954" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#fde047', textDecoration: 'underline', fontWeight: 900, fontSize: '0.95rem' }}
            >
              0387806954
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
