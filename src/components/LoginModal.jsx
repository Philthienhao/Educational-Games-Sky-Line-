import React, { useState, useEffect } from 'react';
import { Lock, User, KeyRound, Sparkles, ShieldCheck, ArrowRight, AlertCircle, BookOpen, Mail, CheckCircle2, X } from 'lucide-react';
import { StorageService } from '../services/storage';
import { SoundFX } from '../utils/sound';

export function LoginModal({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Sign-In Dialog State
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleSchool, setGoogleSchool] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Initialize Google Identity Services if available
  useEffect(() => {
    try {
      const clientId = localStorage.getItem('gvd_google_client_id') || '407408718192.apps.googleusercontent.com';
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const btnContainer = document.getElementById('google-native-signin-button');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_blue',
            size: 'large',
            shape: 'pill',
            width: 380,
            text: 'signin_with',
            locale: 'vi'
          });
        }
      }
    } catch (e) {
      console.warn("Google GSI initialization warning:", e);
    }
  }, [showGoogleDialog]);

  // Handle Google OAuth JWT Response from Google GSI
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    try {
      setGoogleLoading(true);
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const profile = JSON.parse(jsonPayload);

      const user = await StorageService.authenticateOrRegisterGoogleUser({
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        googleId: profile.sub
      });

      if (user) {
        StorageService.setCurrentUser({ ...user, isLoggedIn: true });
        SoundFX.correct();
        if (onLoginSuccess) onLoginSuccess(user);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setGoogleError('Lỗi xác thực Google. Vui lòng thử lại!');
    } finally {
      setGoogleLoading(false);
    }
  };

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
        SoundFX.correct();
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

  // Direct Google / Gmail Authentication
  const handleDirectGoogleLogin = async (e) => {
    e.preventDefault();
    setGoogleError('');

    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanName = googleName.trim();

    if (!cleanEmail) {
      setGoogleError('Vui lòng nhập địa chỉ Gmail!');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setGoogleError('Địa chỉ email không hợp lệ. Vui lòng nhập đúng định dạng Gmail (VD: giaovien@gmail.com)!');
      return;
    }

    setGoogleLoading(true);

    try {
      const user = await StorageService.authenticateOrRegisterGoogleUser({
        email: cleanEmail,
        name: cleanName || cleanEmail.split('@')[0],
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName || cleanEmail)}&background=0d9488&color=fff&bold=true`
      });

      if (user) {
        StorageService.setCurrentUser({ ...user, isLoggedIn: true });
        SoundFX.correct();
        setShowGoogleDialog(false);
        if (onLoginSuccess) onLoginSuccess(user);
      }
    } catch (err) {
      setGoogleError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!');
    } finally {
      setGoogleLoading(false);
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
        maxWidth: '470px',
        background: 'rgba(15, 23, 42, 0.9)',
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            margin: '0 auto 14px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <BookOpen size={34} color="#ffffff" />
          </div>

          <h2 style={{ 
            fontSize: '1.35rem', 
            fontWeight: 900, 
            margin: '0', 
            whiteSpace: 'nowrap',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            HỆ THỐNG HỖ TRỢ DẠY VÀ HỌC
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
            Kho Game Giáo Dục & Công Cụ Tương Tác Giảng Dạy
          </p>
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
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form (Traditional Credentials) */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              marginTop: '4px',
              padding: '13px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 8px 22px rgba(99, 102, 241, 0.35)',
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
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider: OR GOOGLE SIGN IN */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '22px 0 16px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.5px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
          <span style={{ padding: '0 12px', color: '#94a3b8' }}>HOẶC DÙNG THỬ BẰNG GOOGLE</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
        </div>

        {/* Google OAuth (Gmail) Sign-In Button */}
        <div>
          <button
            type="button"
            onClick={() => {
              SoundFX.click();
              setShowGoogleDialog(true);
            }}
            style={{
              width: '100%',
              padding: '13px 18px',
              borderRadius: '16px',
              background: '#ffffff',
              color: '#1f2937',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            {/* Official Google 4-Color SVG Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>ĐĂNG NHẬP / DÙNG THỬ BẰNG GMAIL</span>
          </button>

          <p style={{
            fontSize: '0.74rem',
            color: '#94a3b8',
            textAlign: 'center',
            margin: '8px 0 0 0',
            lineHeight: 1.4
          }}>
            🎁 <strong>Giáo viên mới:</strong> Đăng nhập tự động bằng Gmail để nhận ngay <strong>1 lần trải nghiệm dùng thử</strong> toàn bộ hệ thống!
          </p>

          {/* Hidden GSI container if native prompt available */}
          <div id="google-native-signin-button" style={{ display: 'none' }} />
        </div>

        {/* Footer info & Contact Zalo */}
        <div style={{ marginTop: '22px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 6px 0', lineHeight: 1.5, fontWeight: 600 }}>
            📌 <em>Giáo viên mua tài khoản trọn gói vui lòng liên hệ Admin <strong>Thầy Hảo Địa Lí</strong>.</em>
          </p>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
            <span>📱 Zalo Thầy Hảo Địa Lí:</span>
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

      {/* Modal: Google OAuth (Gmail) Sign-In Dialog */}
      {showGoogleDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10001,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            border: '2px solid rgba(66, 133, 244, 0.4)',
            borderRadius: '26px',
            padding: '30px 26px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 30px rgba(66, 133, 244, 0.25)',
            color: '#ffffff',
            position: 'relative'
          }}>
            {/* Close */}
            <button
              onClick={() => setShowGoogleDialog(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: '#ffffff',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 4px 0' }}>
                Đăng Nhập Bằng Google (Gmail)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Hệ thống tự động cấp quyền <strong>Dùng thử 1 lần</strong> cho tài khoản Gmail của thầy/cô
              </p>
            </div>

            {googleError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} color="#ef4444" />
                <span>{googleError}</span>
              </div>
            )}

            <form onSubmit={handleDirectGoogleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Địa Chỉ Gmail Của Thầy/Cô: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="VD: nguyenvana@gmail.com"
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 38px',
                      borderRadius: '14px',
                      background: 'rgba(30, 41, 59, 0.9)',
                      border: '1.5px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Họ Và Tên Giáo Viên:
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="VD: Thầy Nguyễn Văn An"
                    style={{
                      width: '100%',
                      padding: '11px 12px 11px 38px',
                      borderRadius: '14px',
                      background: 'rgba(30, 41, 59, 0.9)',
                      border: '1.5px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: 'rgba(13, 148, 136, 0.15)',
                border: '1px solid rgba(13, 148, 136, 0.3)',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.78rem',
                color: '#2dd4bf',
                fontWeight: 600,
                lineHeight: 1.4
              }}>
                ✨ Khi đăng nhập thành công, thầy/cô được <strong>thử nghiệm 1 lần duy nhất</strong> cho toàn bộ 30+ game, sau đó liên hệ Admin để mở khóa trọn đời!
              </div>

              <button
                type="submit"
                disabled={googleLoading}
                style={{
                  marginTop: '6px',
                  padding: '13px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.98rem',
                  border: 'none',
                  cursor: googleLoading ? 'wait' : 'pointer',
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {googleLoading ? 'Đang tạo & đăng nhập...' : 'XÁC NHẬN & BẮT ĐẦU DÙNG THỬ NGAY'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
