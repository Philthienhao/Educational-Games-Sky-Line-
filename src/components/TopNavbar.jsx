import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  BookmarkCheck, 
  Users, 
  BookOpen, 
  Presentation,
  FlaskRound,
  Globe, 
  Shield, 
  UserCheck, 
  UserPlus,
  PlusCircle, 
  FileSpreadsheet, 
  Camera, 
  LogOut, 
  GraduationCap, 
  Clock,
  HeartHandshake,
  Activity,
  Trophy,
  User,
  Edit3,
  Award,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { compressImage } from '../utils/imageCompressor';
import { downloadExcelTemplate } from '../utils/excel';
import thayHaoAvatar from '../assets/thayhaodiali.jpg';

export function TopNavbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenRoleSwitcher, 
  onOpenAdminCreateGame, 
  onOpenUserManagement,
  onOpenChangePassword,
  onLogout,
  myGamesCount
}) {
  const [authorPhoto, setAuthorPhoto] = useState(() => {
    const saved = localStorage.getItem('author_photo_thay_hao');
    if (saved && typeof saved === 'string' && saved.length > 50) return saved;
    return thayHaoAvatar;
  });

  const [isOverlayActive, setIsOverlayActive] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.body.classList.contains('is-experiment-active') ||
           document.body.classList.contains('is-game-playing') ||
           document.body.classList.contains('is-fullscreen') ||
           document.body.classList.contains('is-modal-open');
  });

  const navScrollRef = useRef(null);

  useEffect(() => {
    const checkActive = () => {
      const active = document.body.classList.contains('is-experiment-active') ||
                     document.body.classList.contains('is-game-playing') ||
                     document.body.classList.contains('is-fullscreen') ||
                     document.body.classList.contains('is-modal-open');
      setIsOverlayActive(prev => (prev !== active ? active : prev));
    };

    checkActive();

    const observer = new MutationObserver(checkActive);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (isOverlayActive) {
    return null;
  }

  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'philthienhao' || currentUser?.id === 'user_admin';

  const handleAuthorPhotoUpload = async (e) => {
    if (!isAdmin) return;
    const file = e.target.files[0];
    if (!file) return;
    const compressedDataUrl = await compressImage(file, 600, 600, 0.72);
    setAuthorPhoto(compressedDataUrl);
    localStorage.setItem('author_photo_thay_hao', compressedDataUrl);
    StorageService.updateUser('user_admin', { avatar: compressedDataUrl });
  };

  const handleWheel = (e) => {
    if (navScrollRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        navScrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const scrollNav = (distance) => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({ left: distance, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'homeroom', label: 'Lớp chủ nhiệm', icon: Users, color: '#0284c7' },
    { id: 'catalog', label: 'Kho Game giáo dục', icon: Gamepad2, color: '#0d9488' },
    { id: 'my-games', label: 'Game của tôi', icon: BookmarkCheck, count: myGamesCount, color: '#0284c7' },
    { id: 'homework-manager', label: 'Bài tập về nhà (BTVN)', icon: Trophy, color: '#f59e0b' },
    { id: 'call-student', label: 'Gọi tên và chia nhóm', icon: UserPlus, color: '#0284c7' },
    { id: 'parent-meeting', label: 'Hỗ trợ họp phụ huynh', icon: HeartHandshake, color: '#ec4899' },
    { id: 'lecture-slides', label: 'Slide bài giảng', icon: Presentation, color: '#6366f1' },
    { id: 'textbook-download', label: 'Sách giáo khoa', icon: BookOpen, color: '#059669' },
    { id: 'geo-experiments', label: 'Mô phỏng Địa Lí', icon: Globe, color: '#f59e0b' },
    { id: 'virtual-lab', label: 'Thí nghiệm KHTN', icon: FlaskRound, color: '#0d9488' },
    { id: 'timer', label: 'Đồng hồ bấm giờ', icon: Clock, color: '#8b5cf6' },
    { id: 'skl-web-links', label: 'Địa chỉ web', icon: Globe, color: '#3b82f6' },
    { id: 'indoor-pe-dance', label: 'Thử thách thể dục', icon: Activity, color: '#10b981' }
  ];

  return (
    <header className="app-top-navbar">
      {/* ========================================================
          TIER 1: TOP BRAND, QUOTE & USER CONTROLS BAR
          ======================================================== */}
      <div className="topbar-brand-row">
        
        {/* LEFT: BRAND LOGO & AUTHOR TAG */}
        <div className="topbar-brand-group">
          {/* Brand Logo Clickable */}
          <div 
            onClick={() => setActiveTab('catalog')} 
            className="topbar-logo-box"
            title="Về Trang Chủ / Kho Game Giáo Dục"
          >
            <div className="topbar-logo-icon">
              <GraduationCap size={24} color="#ffffff" />
            </div>
            <div className="topbar-brand-text">
              <span className="topbar-app-title">ĐỒ NGHỀ DẠY HỌC</span>
              <span className="topbar-app-subtitle">Nền tảng trò chơi & học liệu giáo dục</span>
            </div>
          </div>

          {/* Author Badge */}
          <div className="topbar-author-pill">
            <label className="topbar-author-avatar-label" title={isAdmin ? "Đổi ảnh chân dung tác giả" : "Tác giả Thầy Hảo Địa Lí"}>
              {authorPhoto ? (
                <img src={authorPhoto} alt="Thầy Hảo" className="topbar-author-img" />
              ) : (
                <div className="topbar-author-placeholder">👨‍🏫</div>
              )}
              {isAdmin && (
                <div className="topbar-author-cam">
                  <Camera size={9} color="#fbbf24" />
                </div>
              )}
              {isAdmin && (
                <input type="file" accept="image/*" onChange={handleAuthorPhotoUpload} style={{ display: 'none' }} />
              )}
            </label>
            <div className="topbar-author-meta">
              <div className="topbar-author-tag">
                <Award size={10} color="#d97706" /> TÁC GIẢ WEBSITE
              </div>
              <div className="topbar-author-name">
                made by Thầy Hảo Địa Lí
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: INSPIRATIONAL QUOTE BOX (MATCHING SCREENSHOT) */}
        <div className="topbar-quote-box">
          <span className="quote-sparkle">✨</span>
          <span className="quote-content">
            "Không phải tất cả chúng ta đều làm được những điều vĩ đại, nhưng chúng ta có thể làm những điều nhỏ nhặt với tình yêu vĩ đại"
          </span>
          <span className="quote-author-name">— Mẹ Têrêsa Calcutta</span>
        </div>

        {/* RIGHT: ADMIN TOOLS & USER PROFILE */}
        <div className="topbar-user-actions">
          
          {/* Admin Tools (Visible for Admin only) */}
          {isAdmin && (
            <div className="topbar-admin-group">
              <button 
                onClick={onOpenAdminCreateGame}
                className="topbar-btn topbar-btn-create"
                title="Tạo trò chơi tương tác giáo dục mới"
              >
                <PlusCircle size={15} />
                <span>Tạo Game</span>
              </button>

              <button 
                onClick={onOpenUserManagement}
                className="topbar-btn topbar-btn-users"
                title="Cấp quyền và quản lý tài khoản giáo viên"
              >
                <UserCheck size={15} />
                <span>Quản Lý GV</span>
              </button>

              <button 
                onClick={() => setActiveTab('admin')}
                className={`topbar-btn ${activeTab === 'admin' ? 'active' : ''}`}
                title="Bảng điều khiển quản trị hệ thống"
              >
                <Shield size={15} />
                <span>Quản Trị</span>
              </button>
            </div>
          )}

          {/* Quick Utility Tools */}
          <div className="topbar-utility-group">
            <button
              onClick={() => downloadExcelTemplate('Mau_Cau_Hoi_Chuan')}
              className="topbar-icon-tool"
              title="Tải về file Excel mẫu câu hỏi chuẩn cho tất cả các game"
            >
              <FileSpreadsheet size={15} color="#059669" />
              <span>Mẫu Excel</span>
            </button>

            <button
              onClick={() => StorageService.exportFullBackup()}
              className="topbar-icon-tool"
              title="Tải bản sao lưu dự phòng toàn bộ dữ liệu cá nhân (Game, Lớp học, Slide) về máy"
            >
              <Download size={15} color="#0284c7" />
              <span>Sao Lưu</span>
            </button>
          </div>

          {/* User Account Info & Buttons */}
          <div className="topbar-user-profile-card">
            <div 
              onClick={isAdmin ? onOpenRoleSwitcher : onOpenChangePassword}
              className="topbar-user-info"
              title={isAdmin ? "Bấm để đổi tài khoản đăng nhập (Admin)" : "Bấm để tự sửa họ tên giáo viên & mật khẩu"}
            >
              <div className="topbar-user-avatar">
                {currentUser?.name?.charAt(0) || '👤'}
              </div>
              <div className="topbar-user-text">
                <div className="topbar-user-name-row">
                  <span className="topbar-user-name">{currentUser?.name || 'Giáo Viên'}</span>
                  <Edit3 size={11} color="#0284c7" />
                </div>
                <div className="topbar-user-role-row">
                  <span className={isAdmin ? 'topbar-role admin' : 'topbar-role teacher'}>
                    {isAdmin ? 'ADMIN' : 'GIÁO VIÊN'}
                  </span>
                  <span className="topbar-username">@{currentUser?.username}</span>
                </div>
              </div>
            </div>

            {/* Quick Sửa Họ Tên & Đăng Xuất Buttons */}
            <div className="topbar-user-btn-row">
              <button 
                onClick={onOpenChangePassword}
                className="topbar-user-action-btn btn-edit-profile"
                title="Sửa họ tên giáo viên và đổi mật khẩu tài khoản"
              >
                <User size={13} />
                <span>Họ Tên & Pass</span>
              </button>

              <button 
                onClick={onLogout}
                className="topbar-user-action-btn btn-logout"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut size={13} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
          TIER 2: HORIZONTAL FUNCTIONAL MENU BAR (THANH MENU HÀNG NGANG)
          ======================================================== */}
      <div className="topbar-nav-row">
        
        {/* Optional Left Scroll Arrow for smaller screens */}
        <button 
          onClick={() => scrollNav(-200)}
          className="topbar-scroll-arrow left"
          title="Cuộn sang trái"
          aria-label="Cuộn trái"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Horizontal Scrollable Tabs Container */}
        <div 
          ref={navScrollRef}
          onWheel={handleWheel}
          className="topbar-nav-scroll-container"
        >
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`topbar-menu-tab ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon 
                  size={17} 
                  strokeWidth={2.2} 
                  color={isActive ? '#ffffff' : (item.color || '#0d9488')} 
                  className="topbar-tab-icon"
                />
                <span className="topbar-tab-label">{item.label}</span>
                {item.count > 0 && (
                  <span className={`topbar-tab-count ${isActive ? 'active' : ''}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Optional Right Scroll Arrow for smaller screens */}
        <button 
          onClick={() => scrollNav(200)}
          className="topbar-scroll-arrow right"
          title="Cuộn sang phải"
          aria-label="Cuộn phải"
        >
          <ChevronRight size={16} />
        </button>

      </div>
    </header>
  );
}
