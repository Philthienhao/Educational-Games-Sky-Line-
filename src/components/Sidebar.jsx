import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  BookmarkCheck, 
  Users, 
  BookOpen, 
  Presentation,
  Beaker,
  Globe,
  Shield, 
  UserCheck, 
  UserPlus,
  Atom,
  FlaskRound,
  PlusCircle, 
  FileSpreadsheet, 
  Camera, 
  LogOut, 
  GraduationCap, 
  Clock,
  HeartHandshake,
  Menu,
  X,
  Sparkles,
  User,
  Award,
  Activity
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { compressImage } from '../utils/imageCompressor';
import thayHaoAvatar from '../assets/thayhaodiali.jpg';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenRoleSwitcher, 
  onOpenAdminCreateGame, 
  onOpenUserManagement,
  onLogout,
  myGamesCount,
  isMobileOpen,
  setIsMobileOpen
}) {
  const [authorPhoto, setAuthorPhoto] = useState(() => {
    const saved = localStorage.getItem('author_photo_thay_hao');
    if (saved && typeof saved === 'string' && saved.length > 50) return saved;
    return thayHaoAvatar;
  });

  const [isOverlayActive, setIsOverlayActive] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.body.classList.contains('is-experiment-active') ||
           document.body.classList.contains('is-game-playing');
  });

  useEffect(() => {
    const checkActive = () => {
      const active = document.body.classList.contains('is-experiment-active') ||
                     document.body.classList.contains('is-game-playing');
      setIsOverlayActive(active);
    };

    checkActive();

    const observer = new MutationObserver(checkActive);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'philthienhao' || currentUser?.id === 'user_admin';

  if (isOverlayActive) {
    return null;
  }

  const handleAuthorPhotoUpload = async (e) => {
    if (!isAdmin) return;
    const file = e.target.files[0];
    if (!file) return;
    const compressedDataUrl = await compressImage(file, 600, 600, 0.72);
    setAuthorPhoto(compressedDataUrl);
    localStorage.setItem('author_photo_thay_hao', compressedDataUrl);
    StorageService.updateUser('user_admin', { avatar: compressedDataUrl });
  };

  const navItems = [
    { id: 'homeroom', label: 'Lớp chủ nhiệm', icon: Users, color: '#0284c7' },
    { id: 'indoor-pe-dance', label: 'Thử thách thể dục', icon: Activity, color: '#10b981' },
    { id: 'catalog', label: 'Kho Game giáo dục', icon: Gamepad2, color: '#0d9488' },
    { id: 'my-games', label: 'Game của tôi', icon: BookmarkCheck, count: myGamesCount, color: '#0284c7' },
    { id: 'call-student', label: 'Kho Game Gọi tên học sinh', icon: UserPlus, color: '#0284c7' },
    { id: 'parent-meeting', label: 'Hỗ trợ họp phụ huynh', icon: HeartHandshake, color: '#ec4899' },
    { id: 'lecture-slides', label: 'Slide bài giảng', icon: Presentation, color: '#6366f1' },
    { id: 'textbook-download', label: 'Sách giáo khoa', icon: BookOpen, color: '#059669' },
    { id: 'geo-experiments', label: 'Mô hình mô phỏng Địa Lí', icon: Globe, color: '#f59e0b' },
    { id: 'virtual-lab', label: 'Mô phỏng thí nghiệm KHTN', icon: FlaskRound, color: '#0d9488' },
    { id: 'timer', label: 'Đồng hồ bấm giờ', icon: Clock, color: '#8b5cf6' },
    { id: 'skl-web-links', label: 'Địa chỉ web SKL', icon: Globe, color: '#3b82f6' }
  ];

  return (
    <>
      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="mobile-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9998
          }}
        />
      )}

      {/* DESKTOP & MOBILE SIDEBAR CONTAINER */}
      <aside className={`app-sidebar-panel ${isMobileOpen ? 'mobile-open' : ''}`}>

        {/* 1. TOP HEADER BRAND & QUOTE CARD */}
        <div className="sidebar-brand-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(13, 148, 136, 0.35)',
              border: '2px solid rgba(255, 255, 255, 0.6)',
              flexShrink: 0
            }}>
              <GraduationCap size={26} color="#ffffff" />
            </div>

            <div>
              <h1 style={{
                fontSize: '1.08rem',
                fontWeight: 900,
                color: '#0d9488',
                lineHeight: 1.25,
                margin: 0
              }}>
                ĐỒ NGHỀ DẠY HỌC
              </h1>
            </div>
          </div>

          {/* QUOTE BOX (EXACTLY MATCHING USER SCREENSHOT) */}
          <div className="quote-container-box">
            <p style={{
              fontSize: '0.8rem',
              color: '#854d0e',
              fontWeight: 700,
              fontStyle: 'italic',
              lineHeight: 1.45,
              margin: 0
            }}>
              ✨ "Không phải tất cả chúng ta đều làm được những điều vĩ đại, nhưng chúng ta có thể làm những điều nhỏ nhặt với tình yêu vĩ đại"
            </p>
            <div style={{
              textAlign: 'right',
              fontSize: '0.74rem',
              color: '#a16207',
              fontWeight: 800,
              marginTop: '8px'
            }}>
              Mẹ Têrêsa Calcutta
            </div>
          </div>
        </div>

        {/* 2. MAIN MENU SECTION (DANH MỤC CHÍNH) - FULL VERTICAL LIST NO SCROLL */}
        <div className="sidebar-scrollable-body">
          
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 900,
            color: '#0d9488',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px',
            paddingLeft: '6px'
          }}>
            DANH MỤC CHÍNH
          </div>

          <nav className="sidebar-vertical-nav">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`sidebar-menu-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} strokeWidth={2.2} style={{ minWidth: '20px', minHeight: '20px', width: '20px', height: '20px', flexShrink: 0 }} className="menu-icon" color={isActive ? '#ffffff' : (item.color || '#0d9488')} />
                  <span className="menu-label">{item.label}</span>
                  {item.count > 0 && (
                    <span className="menu-count-badge">{item.count}</span>
                  )}
                  {item.badge && (
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      padding: '2px 7px',
                      borderRadius: '8px',
                      marginLeft: 'auto',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* ADMIN MANAGEMENT SECTION */}
          {isAdmin && (
            <div style={{ marginTop: '18px' }}>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                color: '#d97706',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '10px',
                paddingLeft: '6px'
              }}>
                QUẢN TRỊ VIÊN
              </div>

              <div className="sidebar-vertical-nav">
                <button 
                  className={`sidebar-menu-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('admin'); setIsMobileOpen(false); }}
                >
                  <Shield size={19} className="menu-icon" color={activeTab === 'admin' ? '#ffffff' : '#d97706'} />
                  <span className="menu-label">Quản Trị Admin</span>
                </button>

                <button 
                  className="sidebar-menu-btn"
                  onClick={() => { onOpenUserManagement(); setIsMobileOpen(false); }}
                >
                  <UserCheck size={19} className="menu-icon" color="#0284c7" />
                  <span className="menu-label">Quản Lý Giáo Viên</span>
                </button>

                <button 
                  className="sidebar-menu-btn accent-btn"
                  onClick={() => { onOpenAdminCreateGame(); setIsMobileOpen(false); }}
                >
                  <PlusCircle size={19} />
                  <span>Tạo Game Mới</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 3 & 4. FIXED BOTTOM FOOTER: AUTHOR PROFILE & USER ACCOUNT FOOTER */}
        <div className="sidebar-bottom-fixed-footer">
          
          {/* AUTHOR PROFILE CARD - FIXED AT BOTTOM ABOVE ACCOUNT FOOTER */}
          <div className="sidebar-author-box">
            <label className="author-avatar-wrapper" title={isAdmin ? "Đổi ảnh đại diện tác giả" : ""}>
              {authorPhoto ? (
                <img src={authorPhoto} alt="Thầy Hảo Địa Lý" className="author-img" />
              ) : (
                <div className="author-placeholder">👨‍🏫</div>
              )}
              {isAdmin && (
                <div className="author-cam-overlay">
                  <Camera size={10} color="#fbbf24" />
                </div>
              )}
              {isAdmin && (
                <input type="file" accept="image/*" onChange={handleAuthorPhotoUpload} style={{ display: 'none' }} />
              )}
            </label>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.65rem',
                fontWeight: 900,
                color: '#d97706',
                background: 'rgba(245, 158, 11, 0.15)',
                padding: '2px 8px',
                borderRadius: '10px',
                marginBottom: '2px'
              }}>
                <Award size={11} color="#d97706" /> TÁC GIẢ WEBSITE
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                by Thầy Hảo Địa Lý
              </div>
            </div>
          </div>

          {/* USER PROFILE & LOGOUT FOOTER - FIXED AT VERY BOTTOM */}
          <div className="sidebar-user-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <div 
                onClick={onOpenRoleSwitcher}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
                }}
              >
                {currentUser?.name?.charAt(0) || '👤'}
              </div>

              <div 
                onClick={onOpenRoleSwitcher}
                style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser?.name || 'Giáo Viên'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={isAdmin ? 'role-tag admin' : 'role-tag teacher'}>
                    {isAdmin ? 'ADMIN' : 'GIÁO VIÊN'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="sidebar-logout-icon-btn"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
