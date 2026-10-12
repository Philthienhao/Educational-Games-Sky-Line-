import React, { useState, useEffect } from 'react';
import { 
  Lock, User, Sparkles, ShieldCheck, ArrowRight, AlertCircle, 
  BookOpen, Mail, CheckCircle2, X, Compass, 
  GraduationCap, Award, PhoneCall, ExternalLink, MessageCircle, 
  Heart, Star, ChevronRight, Zap, Gift, Gamepad2, FileSpreadsheet,
  Users, Clock, Cloud, Camera, Layers, CheckSquare
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { SoundFX } from '../utils/sound';

export function LoginModal({ onLoginSuccess }) {
  // Navigation tab: 'gmail' (primary default) vs 'traditional' (school / admin account)
  const [activeTab, setActiveTab] = useState('gmail');

  // Traditional Account State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Google OAuth / Gmail Direct State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [showQuickGmailModal, setShowQuickGmailModal] = useState(false);

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
      title: "Người Thầy Truyền Cảm Hứng",
      subtitle: "Chắp cánh những ước mơ - Khơi dậy niềm đam mê học tập bất tận của thế hệ trẻ.",
      tag: "Sứ Mạng Người Thầy"
    },
    {
      title: "Tiết Kiệm 80% Thời Gian Soạn Bài",
      subtitle: "Tạo game tức thì từ file Excel/Word có sẵn, tối ưu hóa bài giảng với công nghệ AI.",
      tag: "Tự Động Hóa Giảng Dạy"
    }
  ];

  // Rotate Slogans every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [slogans.length]);

  // System Core Capabilities (Structured as Notes for Teachers)
  const systemFeaturesNotes = [
    {
      icon: <Gamepad2 size={20} color="#38bdf8" />,
      bg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.3)',
      badge: '30+ Game Tương Tác',
      badgeColor: '#38bdf8',
      title: 'Kho Game Giáo Dục Đa Dạng',
      desc: 'Nghiêng đầu Camera AI, Kéo co đối kháng 2 đội, Đua vịt/rùa, Rồng lửa, Chiếc hộp bí ẩn, Lật hình ghi nhớ... phù hợp khởi động và củng cố bài học.'
    },
    {
      icon: <FileSpreadsheet size={20} color="#10b981" />,
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
      badge: 'Excel / Word 30s',
      badgeColor: '#10b981',
      title: 'Tùy Biến Câu Hỏi Mọi Môn Học',
      desc: 'Tải file mẫu Excel chuẩn bị sẵn, dán câu hỏi trắc nghiệm của bất kỳ môn nào (Toán, Văn, Anh, KHTN, Sử, Địa, GDCD, Tiểu học) là tạo game ngay.'
    },
    {
      icon: <Users size={20} color="#fbbf24" />,
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      badge: 'Quản Lý Lớp Học',
      badgeColor: '#fbbf24',
      title: 'Gọi Tên & Chia Nhóm Công Bằng',
      desc: 'Vòng quay may mắn, Phi hành gia vũ trụ, Đua xe gọi tên ngẫu nhiên. Tự động chia tổ/nhóm học tập đối kháng chỉ bằng 1 cú nhấp chuột.'
    },
    {
      icon: <Clock size={20} color="#f43f5e" />,
      bg: 'rgba(244, 63, 94, 0.15)',
      border: 'rgba(244, 63, 94, 0.3)',
      badge: 'Tiện Ích Giảng Đường',
      badgeColor: '#f43f5e',
      title: 'Đồng Hồ Đếm Giờ Sinh Động',
      desc: 'Đếm ngược thảo luận nhóm với hiệu ứng kịch tính (Bom nổ, Pháo hoa, Tên lửa phóng) kèm âm thanh sống động khuấy động lớp học.'
    },
    {
      icon: <Cloud size={20} color="#a855f7" />,
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.3)',
      badge: 'Lưu Trữ Đám Mây',
      badgeColor: '#a855f7',
      title: 'Kho Game Cá Nhân & Trình Chiếu',
      desc: 'Tự động lưu trữ không giới hạn các bài game đã soạn. Trình chiếu trực tiếp trên máy chiếu lớp học, TV thông minh hoặc bảng tương tác.'
    },
    {
      icon: <Camera size={20} color="#06b6d4" />,
      bg: 'rgba(6, 182, 212, 0.15)',
      border: 'rgba(6, 182, 212, 0.3)',
      badge: 'Công Nghệ AI',
      badgeColor: '#06b6d4',
      title: 'AI Camera & Thể Dục Tương Tác',
      desc: 'Nhận diện chuyển động cơ thể không chạm qua Webcam học đường, mang lại trải nghiệm học tập thể chất trong nhà hào hứng cho học sinh.'
    }
  ];

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
  }, []);

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

  // Trigger Google Sign-In button click
  const handleTriggerGoogleFlow = () => {
    SoundFX.click();
    setGoogleError('');
    // Try to trigger native Google One-Tap or button if rendered
    const nativeBtn = document.querySelector('#google-native-signin-button div[role="button"]');
    if (nativeBtn) {
      nativeBtn.click();
      return;
    }
    // If native prompt is blocked or not configured with valid client ID, open friendly Gmail Quick Login
    setShowQuickGmailModal(true);
  };

  // Handle Direct Gmail Login / Trial Activation
  const handleDirectGmailSubmit = async (e) => {
    if (e) e.preventDefault();
    setGoogleError('');

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
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName || cleanEmail)}&background=0d9488&color=fff&bold=true`
      });

      if (user) {
        StorageService.setCurrentUser({ ...user, isLoggedIn: true });
        SoundFX.correct();
        setShowQuickGmailModal(false);
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

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(ellipse at 20% 20%, #0d2238 0%, #071521 45%, #030a10 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto',
      fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
      color: '#ffffff'
    }}>

      {/* Dynamic Glowing Ambient Aura Lights */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '-5%',
        width: '550px',
        height: '550px',
        background: 'radial-gradient(circle, rgba(13, 148, 136, 0.35) 0%, rgba(14, 165, 233, 0.1) 60%, transparent 80%)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div style={{
        position: 'fixed',
        bottom: '-10%',
        right: '-5%',
        width: '580px',
        height: '580px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(168, 85, 247, 0.12) 60%, transparent 80%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div style={{
        position: 'fixed',
        top: '40%',
        right: '35%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Main Container: Modern Split-Screen Arena */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '1260px',
        minHeight: '700px',
        background: 'rgba(11, 23, 38, 0.78)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1.5px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '36px',
        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.75), 0 0 60px rgba(13, 148, 136, 0.18)',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden'
      }}>

        {/* ========================================================
            LEFT COLUMN: UNIVERSAL EDUCATIONAL SYSTEM CAPABILITIES (NOTE FORMAT)
           ======================================================== */}
        <div style={{
          flex: '1 1 560px',
          padding: '38px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(155deg, rgba(15, 33, 55, 0.92) 0%, rgba(7, 21, 33, 0.96) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>

          {/* Top Brand Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.45)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                flexShrink: 0
              }}>
                <BookOpen size={28} color="#ffffff" />
              </div>
              <div>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: 'rgba(13, 148, 136, 0.2)',
                  border: '1px solid rgba(13, 148, 136, 0.4)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#2dd4bf',
                  letterSpacing: '0.5px'
                }}>
                  <Sparkles size={12} color="#fde047" /> HỆ SINH THÁI DẠY HỌC TƯƠNG TÁC ĐA MÔN
                </div>
                <h1 style={{
                  fontSize: '1.45rem',
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

            {/* Universal Smart Classroom Banner */}
            <div style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '18px',
              border: '1.5px solid rgba(56, 189, 248, 0.25)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), 0 0 25px rgba(13, 148, 136, 0.15)',
              background: '#040b12',
              maxHeight: '175px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/assets/universal_education_hero.jpg" 
                alt="Universal Interactive Digital Education Ecosystem" 
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '175px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                  filter: 'contrast(1.05) brightness(1.02)'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(7, 21, 33, 0.15) 0%, rgba(7, 21, 33, 0.85) 100%)',
                pointerEvents: 'none'
              }} />

              {/* Float Pill on Image */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '12px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  padding: '5px 12px',
                  borderRadius: '14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#e0f2fe'
                }}>
                  <Layers size={14} color="#38bdf8" /> Ứng Dụng Cho Mọi Môn Học: Toán, Văn, Anh, KHTN...
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: '#6ee7b7'
                }}>
                  <Star size={12} fill="#10b981" /> 30+ GAME ĐỈNH CAO
                </div>
              </div>
            </div>

            {/* Slogan Banner */}
            <div style={{
              background: 'rgba(15, 28, 46, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '12px 16px',
              marginBottom: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  color: '#38bdf8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '8px'
                }}>
                  {slogans[sloganIndex].tag}
                </span>
                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                  {slogans.map((_, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSloganIndex(idx)}
                      style={{
                        width: idx === sloganIndex ? '18px' : '6px',
                        height: '5px',
                        borderRadius: '3px',
                        background: idx === sloganIndex ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <h3 style={{
                fontSize: '0.98rem',
                fontWeight: 900,
                color: '#ffffff',
                margin: '2px 0 2px 0'
              }}>
                "{slogans[sloganIndex].title}"
              </h3>
              <p style={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                margin: 0,
                lineHeight: 1.4,
                fontWeight: 500
              }}>
                {slogans[sloganIndex].subtitle}
              </p>
            </div>

            {/* SECTION: FUNCTIONAL NOTES (DẠNG NOTE CÁC TÍNH NĂNG CHỦ YẾU) */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                fontSize: '0.78rem',
                fontWeight: 900,
                color: '#2dd4bf',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}>
                <CheckSquare size={16} color="#2dd4bf" />
                <span>CÁC CHỨC NĂNG CHỦ YẾU CỦA HỆ THỐNG:</span>
              </div>

              {/* Notes Grid (2 columns of structured notes) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '10px'
              }}>
                {systemFeaturesNotes.map((note, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${note.border}`,
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: note.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {note.icon}
                        </div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>
                          {note.title}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        color: note.badgeColor,
                        background: note.bg,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap'
                      }}>
                        {note.badge}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.73rem',
                      color: '#94a3b8',
                      margin: '2px 0 0 0',
                      lineHeight: 1.4,
                      fontWeight: 500
                    }}>
                      {note.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Left Footer: Creator Tag & Mission */}
          <div style={{
            marginTop: '20px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #0d9488',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}>
                <img 
                  src="/assets/thayhaodiali.jpg" 
                  alt="Thầy Hảo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = '/assets/thayhao_assistant_avatar.png'; }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                  Thầy Hảo
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Tác giả & Quản trị hệ thống
                </div>
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '4px 10px',
              borderRadius: '10px',
              fontWeight: 700
            }}>
              <Heart size={12} color="#f43f5e" fill="#f43f5e" /> Đồng hành cùng giáo viên toàn quốc
            </div>
          </div>

        </div>

        {/* ========================================================
            RIGHT COLUMN: LUXURY GLASSMORPHISM LOGIN CARD
           ======================================================== */}
        <div style={{
          flex: '1 1 460px',
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(8, 18, 30, 0.88)',
          position: 'relative'
        }}>

          <div>
            {/* Top Badge: System Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#34d399'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }} />
                CỔNG ĐĂNG NHẬP GIÁO VIÊN
              </div>

              <div style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                fontWeight: 600
              }}>
                Bảo mật 100%
              </div>
            </div>

            {/* Title & Welcome */}
            <div style={{ marginBottom: '22px' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 6px 0',
                letterSpacing: '-0.5px'
              }}>
                Chào Mừng Thầy/Cô! 👋
              </h2>
              <p style={{
                fontSize: '0.86rem',
                color: '#94a3b8',
                margin: 0,
                lineHeight: 1.5,
                fontWeight: 500
              }}>
                Đăng nhập ngay để tiếp cận kho 30+ game giáo dục đỉnh cao và bộ công cụ tương tác dành cho mọi bộ môn.
              </p>
            </div>

            {/* TAB SELECTOR: Gmail (Primary Recommended) vs Traditional Credentials */}
            <div style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '5px',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '24px',
              gap: '6px'
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
                  gap: '8px',
                  padding: '11px 12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: activeTab === 'gmail' 
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                    : 'transparent',
                  color: activeTab === 'gmail' ? '#ffffff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: activeTab === 'gmail' ? '0 6px 16px rgba(2, 132, 199, 0.35)' : 'none'
                }}
              >
                <Zap size={16} color={activeTab === 'gmail' ? '#fde047' : '#94a3b8'} />
                <span>Google Gmail</span>
                <span style={{
                  background: activeTab === 'gmail' ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  padding: '2px 6px',
                  borderRadius: '8px',
                  textTransform: 'uppercase'
                }}>
                  Ưu tiên
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
                  gap: '8px',
                  padding: '11px 12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: activeTab === 'traditional' 
                    ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' 
                    : 'transparent',
                  color: activeTab === 'traditional' ? '#ffffff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: activeTab === 'traditional' ? '0 6px 16px rgba(79, 70, 229, 0.35)' : 'none'
                }}
              >
                <Lock size={15} color={activeTab === 'traditional' ? '#ffffff' : '#94a3b8'} />
                <span>Tài Khoản Cấp Sẵn</span>
              </button>
            </div>

            {/* TAB CONTENT 1: GOOGLE GMAIL (PRIMARY CTA) */}
            {activeTab === 'gmail' && (
              <div>
                {/* Special Promotional Trial Badge */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.2) 0%, rgba(2, 132, 199, 0.2) 100%)',
                  border: '1.5px solid rgba(45, 212, 191, 0.45)',
                  borderRadius: '20px',
                  padding: '14px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(13, 148, 136, 0.15)'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                  }}>
                    <Gift size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#f8fafc', marginBottom: '2px' }}>
                      🎁 Trải Nghiệm Toàn Diện Miễn Phí!
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45, fontWeight: 500 }}>
                      Đăng nhập nhanh bằng Gmail — Nhận ngay <strong>1 lần trải nghiệm toàn bộ kho game 3D & công cụ độc quyền</strong> mà không cần đăng ký phức tạp!
                    </div>
                  </div>
                </div>

                {/* Primary Google Login Button (Big & Prominent CTA) */}
                <button
                  type="button"
                  onClick={handleTriggerGoogleFlow}
                  disabled={googleLoading}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#0f172a',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    fontWeight: 900,
                    fontSize: '1.02rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '14px',
                    cursor: googleLoading ? 'wait' : 'pointer',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), 0 0 25px rgba(56, 189, 248, 0.25)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.55), 0 0 35px rgba(56, 189, 248, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.45), 0 0 25px rgba(56, 189, 248, 0.25)';
                  }}
                >
                  {/* Official Google 4-Color SVG Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{googleLoading ? 'ĐANG KẾT NỐI GOOGLE...' : 'ĐĂNG NHẬP / DÙNG THỬ BẰNG GOOGLE (GMAIL)'}</span>
                </button>

                {/* Secondary Fast Gmail Direct Input Trigger */}
                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      SoundFX.click();
                      setShowQuickGmailModal(true);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'underline'
                    }}
                  >
                    <Mail size={15} /> Hoặc nhập trực tiếp địa chỉ Gmail để vào ngay
                  </button>
                </div>

                {/* Assurance notes */}
                <div style={{
                  marginTop: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#94a3b8' }}>
                    <CheckCircle2 size={15} color="#10b981" /> Tự động tạo hồ sơ giáo viên & lưu bài giảng trên đám mây
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#94a3b8' }}>
                    <CheckCircle2 size={15} color="#10b981" /> Không cần nhớ mật khẩu, bảo mật tiêu chuẩn Google
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#94a3b8' }}>
                    <CheckCircle2 size={15} color="#10b981" /> Đồng bộ tức thì trên Máy tính cá nhân, iPad và Laptop
                  </div>
                </div>

                {/* Hidden container for native Google button if initialized */}
                <div id="google-native-signin-button" style={{ display: 'none' }} />
              </div>
            )}

            {/* TAB CONTENT 2: TRADITIONAL ACCOUNT (USERNAME / PASSWORD) */}
            {activeTab === 'traditional' && (
              <div>
                {/* Traditional Error Alert */}
                {errorMsg && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleTraditionalLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      TÊN TÀI KHOẢN:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập tên tài khoản giáo viên"
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          borderRadius: '16px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1.5px solid rgba(255, 255, 255, 0.14)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
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
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1.5px solid rgba(255, 255, 255, 0.14)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.92rem',
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
                      marginTop: '6px',
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.98rem',
                      border: 'none',
                      cursor: loading ? 'wait' : 'pointer',
                      boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {loading ? 'ĐANG XÁC THỰC...' : (
                      <>
                        <span>ĐĂNG NHẬP HỆ THỐNG</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <p style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  textAlign: 'center',
                  marginTop: '12px',
                  lineHeight: 1.4
                }}>
                  * Dành cho Thầy/Cô đã được Admin cấp tài khoản nhà trường hoặc đăng ký bản quyền trọn gói.
                </p>
              </div>
            )}
          </div>

          {/* ========================================================
              FOOTER: CONTACT & QUICK ZALO ACTION
             ======================================================== */}
          <div style={{
            marginTop: '26px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '0.82rem',
              color: '#cbd5e1',
              margin: '0 0 10px 0',
              fontWeight: 600,
              lineHeight: 1.5
            }}>
              📌 <em>Hỗ trợ tài khoản trọn gói: Liên hệ <strong>Thầy Hảo</strong></em>
            </p>

            {/* Quick Contact Action Buttons: Zalo Pulse + Hotline */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {/* ZALO PULSE ACTION BUTTON */}
              <a
                href="https://zalo.me/0387806954"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.2s ease',
                  animation: 'zaloButtonPulse 2.4s infinite ease-in-out'
                }}
              >
                {/* Zalo Icon */}
                <span style={{
                  background: '#ffffff',
                  color: '#0284c7',
                  borderRadius: '6px',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  letterSpacing: '-0.3px'
                }}>
                  Zalo
                </span>
                <span>Chat Zalo: 0387806954</span>
              </a>

              {/* Facebook Quick Link */}
              <a
                href="https://www.facebook.com/phil.thienhao"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#cbd5e1',
                  padding: '9px 14px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <ExternalLink size={14} color="#38bdf8" />
                <span>Facebook Thầy Hảo</span>
              </a>
            </div>

            <div style={{
              fontSize: '0.7rem',
              color: '#64748b',
              marginTop: '12px'
            }}>
              Bản quyền © 2026 Hệ Thống Đồ Nghề Dạy Học • Thầy Hảo
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
          POPUP MODAL: DIRECT GMAIL QUICK LOGIN / TRIAL ACTIVATION
         ======================================================== */}
      {showQuickGmailModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10001,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            background: 'linear-gradient(150deg, #0e1e33 0%, #071322 100%)',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '30px',
            padding: '32px 28px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(2, 132, 199, 0.3)',
            color: '#ffffff',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowQuickGmailModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '20px',
                background: '#ffffff',
                margin: '0 auto 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 6px 0', color: '#ffffff' }}>
                Đăng Nhập Nhanh Bằng Gmail
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                Hệ thống tự động liên kết và cấp quyền <strong>Dùng thử 1 lần</strong> cho tài khoản Gmail của thầy/cô
              </p>
            </div>

            {googleError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{googleError}</span>
              </div>
            )}

            <form onSubmit={handleDirectGmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  ĐỊA CHỈ GMAIL CỦA THẦY/CÔ: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="VD: tranvanan@gmail.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '16px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1.5px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  HỌ VÀ TÊN GIÁO VIÊN:
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="VD: Cô Trần Thị Mai"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '16px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1.5px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: 'rgba(13, 148, 136, 0.15)',
                border: '1px solid rgba(13, 148, 136, 0.35)',
                padding: '12px 14px',
                borderRadius: '14px',
                fontSize: '0.78rem',
                color: '#2dd4bf',
                fontWeight: 600,
                lineHeight: 1.45
              }}>
                ✨ Khi đăng nhập thành công, thầy/cô được <strong>trải nghiệm 1 lần toàn bộ 30+ game</strong>. Sau đó có thể liên hệ Thầy Hảo để nâng cấp bản quyền trọn đời!
              </div>

              <button
                type="submit"
                disabled={googleLoading}
                style={{
                  marginTop: '8px',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: googleLoading ? 'wait' : 'pointer',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {googleLoading ? 'ĐANG TẠO & ĐĂNG NHẬP...' : 'XÁC NHẬN & BẮT ĐẦU TRẢI NGHIỆM NGAY 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global Inline Animation Keyframes */}
      <style>{`
        @keyframes zaloButtonPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 6px 20px rgba(2, 132, 199, 0.4);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 8px 28px rgba(2, 132, 199, 0.7);
          }
        }
      `}</style>

    </div>
  );
}
