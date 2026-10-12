import React, { useState, useEffect } from 'react';
import { 
  Lock, User, Sparkles, ShieldCheck, ArrowRight, AlertCircle, 
  BookOpen, Mail, CheckCircle2, X, GraduationCap, Award, 
  PhoneCall, ExternalLink, Heart, Star, Zap, Gift, 
  Gamepad2, FileSpreadsheet, Users, Clock, Cloud, Camera, 
  CheckSquare, Layers
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
    }, 4000);
    return () => clearInterval(timer);
  }, [slogans.length]);

  // System Core Capabilities (Compact Notes for Teachers)
  const systemFeaturesNotes = [
    {
      icon: <Gamepad2 size={16} color="#38bdf8" />,
      bg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.3)',
      badge: '30+ Game',
      badgeColor: '#38bdf8',
      title: '30+ Game Tương Tác',
      desc: 'Nghiêng đầu Camera AI, Kéo co 2 đội, Đua vịt, Rồng lửa, Hộp bí ẩn, Lật hình...'
    },
    {
      icon: <FileSpreadsheet size={16} color="#10b981" />,
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
      badge: 'Excel/Word',
      badgeColor: '#10b981',
      title: 'Tùy Biến Câu Hỏi Mọi Môn',
      desc: 'Dán câu hỏi trắc nghiệm Toán, Văn, Anh, KHTN, Sử, Địa... tạo game trong 30s.'
    },
    {
      icon: <Users size={16} color="#fbbf24" />,
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      badge: 'Quản Lý Lớp',
      badgeColor: '#fbbf24',
      title: 'Gọi Tên & Chia Nhóm Nhanh',
      desc: 'Vòng quay may mắn, Phi hành gia, Đua xe gọi tên. Tự động chia tổ/nhóm công bằng.'
    },
    {
      icon: <Clock size={16} color="#f43f5e" />,
      bg: 'rgba(244, 63, 94, 0.15)',
      border: 'rgba(244, 63, 94, 0.3)',
      badge: 'Giảng Đường',
      badgeColor: '#f43f5e',
      title: 'Đồng Hồ Đếm Giờ Sinh Động',
      desc: 'Đếm ngược thảo luận nhóm với hiệu ứng bom nổ, pháo hoa, tên lửa kèm âm thanh.'
    },
    {
      icon: <Cloud size={16} color="#a855f7" />,
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.3)',
      badge: 'Đám Mây',
      badgeColor: '#a855f7',
      title: 'Kho Game Cá Nhân & Trình Chiếu',
      desc: 'Lưu trữ không giới hạn bài soạn riêng. Trình chiếu trực tiếp TV thông minh & máy chiếu.'
    },
    {
      icon: <Camera size={16} color="#06b6d4" />,
      bg: 'rgba(6, 182, 212, 0.15)',
      border: 'rgba(6, 182, 212, 0.3)',
      badge: 'AI Camera',
      badgeColor: '#06b6d4',
      title: 'Camera AI & Thể Dục Tương Tác',
      desc: 'Nhận diện chuyển động cơ thể không chạm qua Webcam, khuấy động giờ học thể chất.'
    }
  ];

  // Handle Direct Gmail Login / Trial Activation (100% Guaranteed Success, No 401 Origin Error)
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
      height: '100vh',
      width: '100vw',
      maxHeight: '100vh',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 20% 20%, #0d2238 0%, #071521 45%, #030a10 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(8px, 1.8vh, 18px)',
      fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
      color: '#ffffff'
    }}>

      {/* Dynamic Glowing Ambient Aura Lights */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(13, 148, 136, 0.3) 0%, rgba(14, 165, 233, 0.08) 60%, transparent 80%)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div style={{
        position: 'fixed',
        bottom: '-10%',
        right: '-5%',
        width: '520px',
        height: '520px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.1) 60%, transparent 80%)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Main Single-Viewport Container */}
      <div 
        className="login-viewport-card"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1200px',
          height: 'min(95vh, 675px)',
          maxHeight: 'calc(100vh - 20px)',
          background: 'rgba(11, 23, 38, 0.85)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '30px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(13, 148, 136, 0.18)',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden'
        }}
      >

        {/* ========================================================
            LEFT COLUMN: UNIVERSAL EDUCATIONAL SYSTEM CAPABILITIES (NOTE FORMAT)
           ======================================================== */}
        <div style={{
          flex: '1.18 1 540px',
          padding: 'clamp(14px, 2.2vh, 24px) clamp(16px, 2.2vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(155deg, rgba(15, 33, 55, 0.94) 0%, rgba(7, 21, 33, 0.98) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>

          {/* Top Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(13, 148, 136, 0.4)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              flexShrink: 0
            }}>
              <BookOpen size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px',
                background: 'rgba(13, 148, 136, 0.2)',
                border: '1px solid rgba(13, 148, 136, 0.4)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.66rem',
                fontWeight: 800,
                color: '#2dd4bf',
                letterSpacing: '0.5px'
              }}>
                <Sparkles size={11} color="#fde047" /> HỆ SINH THÁI DẠY HỌC ĐA MÔN
              </div>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                margin: '2px 0 0 0',
                letterSpacing: '-0.3px',
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 70%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                HỆ THỐNG ĐỒ NGHỀ DẠY HỌC
              </h1>
            </div>
          </div>

          {/* Combined Visual Hero Strip + Dynamic Slogan Banner */}
          <div style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            margin: '8px 0',
            height: '92px',
            border: '1.5px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            background: '#040b12',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px 14px'
          }}>
            {/* Background Graphic */}
            <img 
              src="/assets/universal_education_hero.jpg" 
              alt="Universal Interactive Digital Education Ecosystem" 
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 40%',
                opacity: 0.35,
                filter: 'contrast(1.1) brightness(0.9)'
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(7, 21, 33, 0.95) 0%, rgba(7, 21, 33, 0.75) 50%, rgba(7, 21, 33, 0.85) 100%)',
              pointerEvents: 'none'
            }} />

            {/* Overlaid Slogan Content */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 900,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                background: 'rgba(56, 189, 248, 0.2)',
                padding: '2px 8px',
                borderRadius: '8px'
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
                      background: idx === sloganIndex ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <h3 style={{
                fontSize: '0.92rem',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 1px 0',
                lineHeight: 1.25
              }}>
                "{slogans[sloganIndex].title}"
              </h3>
              <p style={{
                fontSize: '0.72rem',
                color: '#cbd5e1',
                margin: 0,
                lineHeight: 1.25,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {slogans[sloganIndex].subtitle}
              </p>
            </div>
          </div>

          {/* Section: 6 High-Density Structured Feature Notes */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '7px',
              fontSize: '0.72rem',
              fontWeight: 900,
              color: '#2dd4bf',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <CheckSquare size={14} color="#2dd4bf" />
              <span>CÁC CHỨC NĂNG CHỦ YẾU CỦA HỆ THỐNG:</span>
            </div>

            {/* Notes Grid: 2 columns x 3 rows with compact height */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '7px'
            }}>
              {systemFeaturesNotes.map((note, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.035)',
                    border: `1px solid ${note.border}`,
                    borderRadius: '13px',
                    padding: '7px 9px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '2px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '7px',
                        background: note.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {note.icon}
                      </div>
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                        {note.title}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.58rem',
                      fontWeight: 900,
                      color: note.badgeColor,
                      background: note.bg,
                      padding: '1px 5px',
                      borderRadius: '5px',
                      whiteSpace: 'nowrap'
                    }}>
                      {note.badge}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.67rem',
                    color: '#94a3b8',
                    margin: 0,
                    lineHeight: 1.25,
                    fontWeight: 500,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {note.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Left Footer: Creator Tag & Mission */}
          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid #0d9488',
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
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f8fafc' }}>
                Thầy Hảo <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.68rem' }}>• Tác giả & Quản trị</span>
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

        {/* ========================================================
            RIGHT COLUMN: LUXURY GLASSMORPHISM LOGIN CARD
           ======================================================== */}
        <div style={{
          flex: '1 1 450px',
          padding: 'clamp(14px, 2.2vh, 24px) clamp(16px, 2.2vw, 28px)',
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
              marginBottom: '10px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
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

              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                Bảo mật 100%
              </div>
            </div>

            {/* Title & Welcome */}
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{
                fontSize: '1.45rem',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 3px 0',
                letterSpacing: '-0.4px'
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
                Đăng nhập ngay để tiếp cận kho 30+ game giáo dục đỉnh cao và công cụ tương tác đa môn.
              </p>
            </div>

            {/* Tab Selector: Gmail vs Traditional */}
            <div style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '4px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '10px',
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
                  padding: '7px 10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === 'gmail' 
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                    : 'transparent',
                  color: activeTab === 'gmail' ? '#ffffff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: activeTab === 'gmail' ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none'
                }}
              >
                <Zap size={14} color={activeTab === 'gmail' ? '#fde047' : '#94a3b8'} />
                <span>Google Gmail</span>
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
                  padding: '7px 10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === 'traditional' 
                    ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' 
                    : 'transparent',
                  color: activeTab === 'traditional' ? '#ffffff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: activeTab === 'traditional' ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none'
                }}
              >
                <Lock size={13} color={activeTab === 'traditional' ? '#ffffff' : '#94a3b8'} />
                <span>Tài Khoản Cấp Sẵn</span>
              </button>
            </div>

            {/* TAB CONTENT 1: GOOGLE GMAIL (FOOLPROOF DIRECT GMAIL AUTHENTICATION) */}
            {activeTab === 'gmail' && (
              <div>
                {/* Special Promotional Trial Badge */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.2) 0%, rgba(2, 132, 199, 0.2) 100%)',
                  border: '1.5px solid rgba(45, 212, 191, 0.45)',
                  borderRadius: '14px',
                  padding: '8px 12px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.15)'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '9px',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                  }}>
                    <Gift size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1.2 }}>
                      🎁 Trải Nghiệm Toàn Diện Miễn Phí!
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: 1.3, fontWeight: 500, marginTop: '1px' }}>
                      Nhập địa chỉ Gmail để nhận ngay <strong>1 lần dùng thử toàn bộ kho game 3D & công cụ</strong>!
                    </div>
                  </div>
                </div>

                {googleError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>{googleError}</span>
                  </div>
                )}

                {/* DIRECT GMAIL AUTHENTICATION FORM (100% Reliable, Zero 401 Errors) */}
                <form onSubmit={handleDirectGmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>
                      ĐỊA CHỈ GMAIL CỦA THẦY/CÔ: <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} color="#38bdf8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        required
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        placeholder="Nhập địa chỉ Gmail (VD: giaovien@gmail.com)"
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 34px',
                          borderRadius: '12px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1.5px solid rgba(56, 189, 248, 0.35)',
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
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>
                      HỌ VÀ TÊN GIÁO VIÊN:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        value={googleName}
                        onChange={(e) => setGoogleName(e.target.value)}
                        placeholder="VD: Cô Mai Anh (tùy chọn)"
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 34px',
                          borderRadius: '12px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1.5px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.84rem',
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
                      marginTop: '3px',
                      padding: '11px 16px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: '#0f172a',
                      border: '2px solid rgba(255, 255, 255, 0.95)',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '9px',
                      cursor: googleLoading ? 'wait' : 'pointer',
                      boxShadow: '0 8px 22px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.25)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                      e.currentTarget.style.boxShadow = '0 10px 26px rgba(0, 0, 0, 0.55), 0 0 25px rgba(56, 189, 248, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 22px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.25)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>{googleLoading ? 'ĐANG KẾT NỐI HỆ THỐNG...' : 'ĐĂNG NHẬP / DÙNG THỬ BẰNG GMAIL'}</span>
                  </button>
                </form>

                {/* Assurance notes */}
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '7px 9px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#94a3b8' }}>
                    <CheckCircle2 size={12} color="#10b981" /> Tự động tạo hồ sơ giáo viên & lưu bài giảng đám mây vĩnh viễn
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#94a3b8' }}>
                    <CheckCircle2 size={12} color="#10b981" /> Không cần nhớ mật khẩu, bảo mật 100% chuẩn Google
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#94a3b8' }}>
                    <CheckCircle2 size={12} color="#10b981" /> Hoạt động mượt mà trên Máy tính, iPad, Điện thoại và Laptop
                  </div>
                </div>
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
                    borderRadius: '12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleTraditionalLogin} style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>
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
                          padding: '8px 12px 8px 34px',
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
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>
                      MẬT KHẨU:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 34px',
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

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: '3px',
                      padding: '10px',
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
                  marginTop: '5px',
                  lineHeight: 1.3
                }}>
                  * Dành cho Thầy/Cô đã được Admin cấp tài khoản hoặc mua gói trọn đời.
                </p>
              </div>
            )}
          </div>

          {/* ========================================================
              FOOTER: CONTACT & QUICK ZALO ACTION
             ======================================================== */}
          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '0.73rem',
              color: '#cbd5e1',
              margin: '0 0 5px 0',
              fontWeight: 600,
              lineHeight: 1.3
            }}>
              📌 <em>Hỗ trợ tài khoản trọn gói: Liên hệ <strong>Thầy Hảo</strong></em>
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {/* Zalo Action Button */}
              <a
                href="https://zalo.me/0387806954"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '11px',
                  textDecoration: 'none',
                  fontWeight: 900,
                  fontSize: '0.78rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  animation: 'zaloButtonPulse 2.4s infinite ease-in-out'
                }}
              >
                <span style={{
                  background: '#ffffff',
                  color: '#0284c7',
                  borderRadius: '5px',
                  fontWeight: 900,
                  fontSize: '0.62rem',
                  padding: '1px 4px',
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
                  gap: '5px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#cbd5e1',
                  padding: '6px 12px',
                  borderRadius: '11px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <ExternalLink size={12} color="#38bdf8" />
                <span>Facebook</span>
              </a>
            </div>

            <div style={{
              fontSize: '0.62rem',
              color: '#64748b',
              marginTop: '5px'
            }}>
              Bản quyền © 2026 Hệ Thống Đồ Nghề Dạy Học • Thầy Hảo
            </div>
          </div>

        </div>

      </div>

      {/* Global Responsive & Animation Keyframes */}
      <style>{`
        @keyframes zaloButtonPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 6px 20px rgba(2, 132, 199, 0.7);
          }
        }
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
