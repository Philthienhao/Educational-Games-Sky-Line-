import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, User, Sparkles, ShieldCheck, ArrowRight, AlertCircle, 
  BookOpen, Mail, CheckCircle2, X, Eye, EyeOff,
  PhoneCall, ExternalLink, Heart, Star, Zap, Gift, 
  Gamepad2, FileSpreadsheet, Users, Clock, Cloud, Camera, 
  Layers, Check
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { SoundFX } from '../utils/sound';

export function LoginModal({ onLoginSuccess }) {
  // Navigation tab: 'gmail' (primary default) vs 'traditional' (school / admin account)
  const [activeTab, setActiveTab] = useState('gmail');

  // Traditional Account State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Google OAuth / Gmail State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [gsiReady, setGsiReady] = useState(false);
  const [googleNotice, setGoogleNotice] = useState('');

  const nativeGoogleBtnRef = useRef(null);

  // Slogan Carousel Index (Universal for all subjects)
  const [sloganIndex, setSloganIndex] = useState(0);
  const slogans = [
    {
      title: "Hệ Sinh Thái Dạy Học Toàn Diện",
      subtitle: "Bộ công cụ giáo dục đỉnh cao dành riêng cho giáo viên sáng tạo của TẤT CẢ các bộ môn.",
      tag: "Dành Cho Mọi Môn Học"
    },
    {
      title: "Lớp Học Hạnh Phúc & Hào Hứng",
      subtitle: "Hơn 30+ tựa game tương tác đa giác quan, biến mỗi tiết học thành ngày hội của học trò.",
      tag: "Trải Nghiệm Đột Phá"
    },
    {
      title: "Tiết Kiệm 80% Thời Gian Soạn Bài",
      subtitle: "Tự động chuyển câu hỏi từ file Excel/Word thành game 3D trực quan chỉ trong 30 giây.",
      tag: "Tự Động Hóa Giảng Dạy"
    },
    {
      title: "Người Thầy Truyền Cảm Hứng",
      subtitle: "Chắp cánh những ước mơ - Khơi dậy niềm đam mê học tập bất tận của thế hệ trẻ.",
      tag: "Sứ Mạng Người Thầy"
    }
  ];

  // Rotate Slogans every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slogans.length]);

  // Decode JWT helper for Google Identity Services token
  const parseGoogleJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.warn("Could not decode Google token:", e);
      return null;
    }
  };

  // Google GSI Credential Callback (One-Click Automatic Login)
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    const payload = parseGoogleJwt(response.credential);
    if (!payload || !payload.email) {
      setGoogleError('Không thể nhận diện tài khoản Google. Vui lòng thử lại!');
      return;
    }

    setGoogleLoading(true);
    setGoogleError('');
    try {
      const cleanEmail = String(payload.email).trim().toLowerCase();
      const cleanName = (payload.name || payload.given_name || cleanEmail.split('@')[0] || 'Giáo Viên').trim();
      const picture = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0284c7&color=fff&bold=true`;

      const user = await StorageService.authenticateOrRegisterGoogleUser({
        email: cleanEmail,
        name: cleanName,
        picture: picture
      });

      if (user) {
        StorageService.setCurrentUser({ ...user, isLoggedIn: true });
        SoundFX.correct();
        if (onLoginSuccess) onLoginSuccess(user);
      }
    } catch (err) {
      setGoogleError('Có lỗi xảy ra khi xác thực Google. Vui lòng thử lại hoặc điền nhanh Gmail bên dưới!');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Initialize Google Identity Services if available on client
  useEffect(() => {
    let isCancelled = false;

    const setupGSI = () => {
      try {
        if (window.google?.accounts?.id) {
          const clientId = localStorage.getItem('gvd_google_client_id') || '407408718192-oemcce3p2h8g1u4s8h48f93j2a3r89h3.apps.googleusercontent.com';
          
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin'
          });

          if (!isCancelled) setGsiReady(true);

          // Render official Google button into hidden/fallback container
          const target = document.getElementById('gsi-official-container');
          if (target && window.google.accounts.id.renderButton) {
            window.google.accounts.id.renderButton(target, {
              theme: 'outline',
              size: 'large',
              shape: 'pill',
              width: '100%',
              text: 'continue_with',
              locale: 'vi'
            });
          }
        }
      } catch (err) {
        console.warn("GSI initialization info:", err);
      }
    };

    if (window.google?.accounts?.id) {
      setupGSI();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          setupGSI();
        }
      }, 500);
      return () => {
        isCancelled = true;
        clearInterval(interval);
      };
    }

    return () => { isCancelled = true; };
  }, []);

  // Trigger Google One-Tap or Prompt
  const handleTriggerGoogleOAuth = () => {
    SoundFX.click();
    setGoogleError('');
    setGoogleNotice('');

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setGoogleNotice('💡 Đang mở trình đăng nhập nhanh: Thầy/Cô chỉ cần nhập địa chỉ Gmail bên dưới để vào hệ thống ngay tức khắc!');
          }
        });
      } catch (e) {
        setGoogleNotice('💡 Thầy/Cô chỉ cần nhập nhanh địa chỉ Gmail bên dưới để tự động tạo hồ sơ & vào dùng thử ngay!');
      }
    } else {
      setGoogleNotice('💡 Thầy/Cô hãy nhập nhanh địa chỉ Gmail bên dưới để đăng nhập ngay mà không cần mật khẩu!');
    }
  };

  // Direct Gmail Submit Handler (Guaranteed 100% Success for Any Network & Device)
  const handleDirectGmailSubmit = async (e) => {
    if (e) e.preventDefault();
    setGoogleError('');
    setGoogleNotice('');

    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanName = googleName.trim();

    if (!cleanEmail) {
      setGoogleError('Vui lòng nhập địa chỉ Gmail của Thầy/Cô!');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setGoogleError('Email không hợp lệ. Vui lòng nhập đúng định dạng Gmail (VD: giaovien@gmail.com)!');
      return;
    }

    setGoogleLoading(true);

    try {
      const user = await StorageService.authenticateOrRegisterGoogleUser({
        email: cleanEmail,
        name: cleanName || cleanEmail.split('@')[0],
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName || cleanEmail)}&background=0284c7&color=fff&bold=true`
      });

      if (user) {
        StorageService.setCurrentUser({ ...user, isLoggedIn: true });
        SoundFX.correct();
        if (onLoginSuccess) onLoginSuccess(user);
      }
    } catch (err) {
      setGoogleError('Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại!');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Traditional Account Login (Username / Password)
  const handleTraditionalLogin = async (e) => {
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
        setErrorMsg('Tên tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
        setLoading(false);
      }
    } catch (e) {
      setErrorMsg('Có lỗi xảy ra khi xác thực tài khoản. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  // 3 Core Highlight Features (Clear, Concise, Beautiful, High-Impact)
  const coreFeatures = [
    {
      icon: <Gamepad2 size={20} color="#38bdf8" />,
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.3)',
      badge: '30+ Game',
      badgeColor: '#38bdf8',
      title: '30+ Trò Chơi Giáo Dục Đỉnh Cao',
      desc: 'Tương tác chuyển động qua Camera AI không chạm, thi đấu đồng đội kịch tính, tạo không khí học tập hào hứng.'
    },
    {
      icon: <FileSpreadsheet size={20} color="#10b981" />,
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      badge: 'Soạn Siêu Tốc',
      badgeColor: '#34d399',
      title: 'Soạn Bài Tự Động Từ Excel & Word',
      desc: 'Chuyển câu hỏi trắc nghiệm của mọi môn học (Toán, Văn, Anh, KHTN, Sử, Địa...) thành game 3D sinh động trong 30s.'
    },
    {
      icon: <Cloud size={20} color="#a855f7" />,
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.3)',
      badge: 'Trợ Giảng Số',
      badgeColor: '#c084fc',
      title: 'Kho Bài Giảng & Công Cụ Trợ Giảng',
      desc: 'Trình chiếu trực tiếp TV/Máy chiếu sắc nét, vòng quay gọi tên công bằng, chia nhóm và đồng hồ đếm giờ kịch tính.'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      height: '100vh',
      width: '100vw',
      maxHeight: '100vh',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 25% 25%, #0b1f33 0%, #06121c 55%, #02070c 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(8px, 1.8vh, 18px)',
      fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
      color: '#ffffff'
    }}>

      {/* Dynamic Glowing Ambient Aura Lights (Soft Radial Gradient without GPU-blocking filter) */}
      <div style={{
        position: 'fixed',
        top: '-15%',
        left: '-10%',
        width: '560px',
        height: '560px',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.22) 0%, rgba(13, 148, 136, 0.08) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div style={{
        position: 'fixed',
        bottom: '-15%',
        right: '-10%',
        width: '580px',
        height: '580px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.06) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Main Single-Viewport Modal Card */}
      <div 
        className="login-viewport-card"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1160px',
          height: 'min(94vh, 660px)',
          maxHeight: 'calc(100vh - 20px)',
          background: 'rgba(10, 20, 32, 0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '28px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(2, 132, 199, 0.15)',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden'
        }}
      >

        {/* ========================================================
            LEFT COLUMN: INSPIRING EDUCATIONAL SUITE SHOWCASE (CLEAN & AIRY)
           ======================================================== */}
        <div style={{
          flex: '1.15 1 520px',
          padding: 'clamp(16px, 2.5vh, 26px) clamp(18px, 2.4vw, 30px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(155deg, rgba(13, 27, 45, 0.95) 0%, rgba(7, 18, 30, 0.98) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>

          {/* Top Brand Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                flexShrink: 0
              }}>
                <BookOpen size={24} color="#ffffff" />
              </div>
              <div>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: 'rgba(2, 132, 199, 0.18)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  letterSpacing: '0.5px'
                }}>
                  <Sparkles size={11} color="#fde047" /> NỀN TẢNG DẠY HỌC ĐA MÔN TOÀN DIỆN
                </div>
                <h1 style={{
                  fontSize: '1.28rem',
                  fontWeight: 900,
                  margin: '3px 0 0 0',
                  letterSpacing: '-0.3px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 70%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  HỆ THỐNG ĐỒ NGHỀ DẠY HỌC
                </h1>
              </div>
            </div>

            {/* Rotating Inspirational Slogan Banner */}
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              margin: '12px 0 0 0',
              padding: '10px 14px',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              background: 'rgba(3, 12, 22, 0.75)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  color: '#38bdf8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  background: 'rgba(56, 189, 248, 0.16)',
                  padding: '2px 7px',
                  borderRadius: '6px'
                }}>
                  {slogans[sloganIndex].tag}
                </span>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {slogans.map((_, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSloganIndex(idx)}
                      style={{
                        width: idx === sloganIndex ? '16px' : '5px',
                        height: '4px',
                        borderRadius: '2px',
                        background: idx === sloganIndex ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <h3 style={{
                fontSize: '0.92rem',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 2px 0',
                lineHeight: 1.25
              }}>
                "{slogans[sloganIndex].title}"
              </h3>
              <p style={{
                fontSize: '0.72rem',
                color: '#cbd5e1',
                margin: 0,
                lineHeight: 1.3,
                fontWeight: 500
              }}>
                {slogans[sloganIndex].subtitle}
              </p>
            </div>
          </div>

          {/* Center: 3 Focused High-Impact Value Pillars (Airy, Elegant) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0' }}>
            {coreFeatures.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.035)',
                  border: `1px solid ${item.border}`,
                  borderRadius: '16px',
                  padding: '11px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.065)';
                  e.currentTarget.style.transform = 'translateY(-1.5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  {item.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#f8fafc' }}>
                      {item.title}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: item.badgeColor,
                      background: item.bg,
                      padding: '2px 7px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.badge}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    margin: 0,
                    lineHeight: 1.35,
                    fontWeight: 500
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Trust Strip & Author Signature */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '6px 10px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <Check size={12} color="#10b981" /> Mọi môn học
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <Check size={12} color="#10b981" /> Không cần cài đặt
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <Check size={12} color="#10b981" /> Chiếu TV & Máy chiếu
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1.5px solid #0284c7',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  flexShrink: 0
                }}>
                  <img 
                    src="/assets/thayhaodiali.jpg" 
                    alt="Thầy Hảo" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/assets/thayhao_assistant_avatar.png'; }}
                  />
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#f8fafc' }}>
                  Thầy Hảo <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.68rem' }}>• Tác giả & Quản trị hệ thống</span>
                </div>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.68rem',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '3px 8px',
                borderRadius: '8px',
                fontWeight: 700
              }}>
                <Heart size={10} color="#f43f5e" fill="#f43f5e" /> Đồng hành cùng GV toàn quốc
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================
            RIGHT COLUMN: LUXURY FOCUSED AUTH PORTAL
           ======================================================== */}
        <div style={{
          flex: '1 1 450px',
          padding: 'clamp(16px, 2.5vh, 26px) clamp(18px, 2.4vw, 30px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(7, 16, 26, 0.92)',
          position: 'relative'
        }}>

          <div>
            {/* Top Security & Status Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '3px 10px',
                borderRadius: '10px',
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#34d399'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981'
                }} />
                CỔNG ĐĂNG NHẬP GIÁO VIÊN
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.68rem',
                color: '#94a3b8',
                fontWeight: 600
              }}>
                <ShieldCheck size={13} color="#10b981" /> Bảo mật an toàn
              </div>
            </div>

            {/* Header: Clean Greeting */}
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{
                fontSize: '1.45rem',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 4px 0',
                letterSpacing: '-0.3px'
              }}>
                Chào Mừng Thầy/Cô! 👋
              </h2>
              <p style={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                margin: 0,
                lineHeight: 1.35,
                fontWeight: 500
              }}>
                Đăng nhập để vào không gian sáng tạo trò chơi & quản lý lớp học.
              </p>
            </div>

            {/* Modern Minimalist Segmented Tabs */}
            <div style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.85)',
              padding: '4px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '14px',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => {
                  SoundFX.click();
                  setActiveTab('gmail');
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '11px',
                  border: 'none',
                  background: activeTab === 'gmail' 
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                    : 'transparent',
                  color: activeTab === 'gmail' ? '#ffffff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: activeTab === 'gmail' ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none'
                }}
              >
                <Zap size={14} color={activeTab === 'gmail' ? '#fde047' : '#94a3b8'} />
                <span>Google / Gmail</span>
                <span style={{
                  background: activeTab === 'gmail' ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  padding: '1px 5px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  Khuyên dùng
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  SoundFX.click();
                  setActiveTab('traditional');
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '11px',
                  border: 'none',
                  background: activeTab === 'traditional' 
                    ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' 
                    : 'transparent',
                  color: activeTab === 'traditional' ? '#ffffff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: activeTab === 'traditional' ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none'
                }}
              >
                <Lock size={13} color={activeTab === 'traditional' ? '#ffffff' : '#94a3b8'} />
                <span>Tài Khoản Cấp Sẵn</span>
              </button>
            </div>

            {/* TAB CONTENT 1: GOOGLE / GMAIL */}
            {activeTab === 'gmail' && (
              <div>
                {/* Error Banner */}
                {googleError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '7px 10px',
                    borderRadius: '11px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>{googleError}</span>
                  </div>
                )}

                {/* Direct Fast Gmail Entry Form */}
                <form onSubmit={handleDirectGmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginTop: '4px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                      ĐỊA CHỈ GMAIL CỦA THẦY/CÔ: <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#38bdf8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        required
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        placeholder="Nhập địa chỉ Gmail (VD: giaovien@gmail.com)"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 38px',
                          borderRadius: '13px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1.5px solid rgba(56, 189, 248, 0.4)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                      HỌ VÀ TÊN GIÁO VIÊN:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        value={googleName}
                        onChange={(e) => setGoogleName(e.target.value)}
                        placeholder="VD: Cô Mai Anh (tùy chọn)"
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 38px',
                          borderRadius: '13px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1.5px solid rgba(255, 255, 255, 0.14)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={googleLoading}
                    style={{
                      marginTop: '6px',
                      padding: '12px 18px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      cursor: googleLoading ? 'wait' : 'pointer',
                      boxShadow: '0 6px 22px rgba(2, 132, 199, 0.45)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 8px 26px rgba(2, 132, 199, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 22px rgba(2, 132, 199, 0.45)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>{googleLoading ? 'ĐANG KẾT NỐI HỆ THỐNG...' : 'ĐĂNG NHẬP / DÙNG THỬ BẰNG GMAIL 🚀'}</span>
                  </button>
                </form>

                {/* Hidden Official GSI Mount Node for Native Google Rendering */}
                <div id="gsi-official-container" style={{ display: 'none' }} />
              </div>
            )}

            {/* TAB CONTENT 2: TRADITIONAL ACCOUNT (USERNAME / PASSWORD) */}
            {activeTab === 'traditional' && (
              <div>
                {errorMsg && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '7px 10px',
                    borderRadius: '11px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleTraditionalLogin} style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>
                      TÊN TÀI KHOẢN:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập tên tài khoản giáo viên"
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 34px',
                          borderRadius: '12px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1.5px solid rgba(255, 255, 255, 0.14)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '3px' }}>
                      MẬT KHẨU:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        style={{
                          width: '100%',
                          padding: '9px 38px 9px 34px',
                          borderRadius: '12px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1.5px solid rgba(255, 255, 255, 0.14)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '11px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: '4px',
                      padding: '11px 16px',
                      borderRadius: '13px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.88rem',
                      border: 'none',
                      cursor: loading ? 'wait' : 'pointer',
                      boxShadow: '0 6px 18px rgba(79, 70, 229, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? 'ĐANG XÁC THỰC...' : (
                      <>
                        <span>ĐĂNG NHẬP HỆ THỐNG</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                <p style={{
                  fontSize: '0.67rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                  marginTop: '8px',
                  lineHeight: 1.3
                }}>
                  * Dành cho Thầy/Cô đã được cấp tài khoản hoặc nâng cấp gói trọn đời.
                </p>
              </div>
            )}
          </div>

          {/* ========================================================
              FOOTER: COMPACT SUPPORT & SOCIAL LINKS
             ======================================================== */}
          <div style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '6px'
            }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                Cần hỗ trợ?
              </span>

              {/* Zalo Button */}
              <a
                href="https://zalo.me/0387806954"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  boxShadow: '0 3px 10px rgba(2, 132, 199, 0.35)'
                }}
              >
                <span style={{
                  background: '#ffffff',
                  color: '#0284c7',
                  borderRadius: '4px',
                  fontWeight: 900,
                  fontSize: '0.58rem',
                  padding: '1px 3px'
                }}>
                  Zalo
                </span>
                <span>0387806954</span>
              </a>

              {/* Facebook Link */}
              <a
                href="https://www.facebook.com/phil.thienhao"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#cbd5e1',
                  padding: '5px 10px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <ExternalLink size={11} color="#38bdf8" />
                <span>Facebook</span>
              </a>
            </div>

            <div style={{
              fontSize: '0.62rem',
              color: '#64748b'
            }}>
              Bản quyền © 2026 Hệ Thống Đồ Nghề Dạy Học • Thầy Hảo
            </div>
          </div>

        </div>

      </div>

      {/* Global Responsive Layout Rules */}
      <style>{`
        @media (max-width: 960px) {
          .login-viewport-card {
            flex-direction: column !important;
            height: auto !important;
            max-height: 96vh !important;
            overflow-y: auto !important;
          }
        }
        @media (max-height: 580px) {
          .login-viewport-card {
            height: auto !important;
            max-height: 98vh !important;
            overflow-y: auto !important;
          }
        }
      `}</style>

    </div>
  );
}
