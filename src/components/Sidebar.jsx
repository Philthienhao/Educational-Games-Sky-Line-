import React, { useState } from 'react';
import { 
  Gamepad2, 
  BookmarkCheck, 
  Users, 
  BookOpen, 
  Presentation,
  FlaskConical,
  Globe,
  Shield, 
  UserCheck, 
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
  User
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

  const navItems = [
    { id: 'catalog', label: 'Kho Game Giáo Dục', icon: Gamepad2 },
    { id: 'my-games', label: 'Game Của Tôi', icon: BookmarkCheck, count: myGamesCount },
    { id: 'call-student', label: 'Gọi Tên Học Sinh', icon: UserCheck },
    { id: 'timer', label: 'Đồng Hồ', icon: Clock },
    { id: 'homeroom', label: 'Lớp Chủ Nhiệm', icon: Users },
    { id: 'parent-meeting', label: 'Họp Phụ Huynh', icon: HeartHandshake, color: '#ec4899' },
    { id: 'textbook-download', label: 'Tải SGK', icon: BookOpen },
    { id: 'virtual-lab', label: 'Thí Nghiệm KHTN', icon: FlaskConical },
    { id: 'geo-experiments', label: '3D Địa Lí', icon: Globe, color: '#f59e0b' },
    { id: 'lecture-slides', label: 'Slide Bài Giảng', icon: Presentation }
  ];

  return (
    <>
      {/* 1. TOP HORIZONTAL FLOATING HEADER NAVBAR (MATCHING MOCKUP) */}
      <header className="app-top-header">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setActiveTab('catalog')} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            flexShrink: 0
          }}>
            <GraduationCap size={24} color="#ffffff" />
          </div>

          <div>
            <h2 style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.25,
              margin: 0,
              whiteSpace: 'nowrap'
            }}>
              Sky-Line AI
            </h2>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
              Hệ Thống Dạy & Học Thông Minh
            </span>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '4px 0' }} className="desktop-header-tabs">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 800 : 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  background: isActive 
                    ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' 
                    : 'transparent',
                  color: isActive ? '#ffffff' : '#334155',
                  boxShadow: isActive ? '0 4px 14px rgba(13, 148, 136, 0.3)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#ffffff' : (item.color || '#0d9488')} />
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(13, 148, 136, 0.15)',
                    color: isActive ? '#ffffff' : '#0d9488',
                    fontWeight: 800
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* AI Assistant Pill Badge */}
          <div 
            onClick={() => setActiveTab('catalog')}
            className="ai-badge"
            style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <Sparkles size={16} color="#fbbf24" />
            <span>✨ AI Assistant</span>
          </div>

          {/* User Profile Pill */}
          <div 
            onClick={onOpenRoleSwitcher}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(13, 148, 136, 0.1)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentUser?.name?.charAt(0) || '👤'}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
              {currentUser?.name || 'Tài Khoản'}
            </span>
          </div>

          {/* Mobile Drawer Menu Toggle */}
          <button 
            onClick={() => setIsMobileOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 12px',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}
          >
            <Menu size={18} />
            <span>MENU</span>
          </button>
        </div>

      </header>

      {/* 2. MOBILE BACKDROP & SLIDING DRAWER MENU */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9998
          }}
        />
      )}

      <aside className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '20px 18px 16px 18px',
          borderBottom: '1px solid rgba(13, 148, 136, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <GraduationCap size={22} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>Menu Quản Lý</span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#0d9488', letterSpacing: '0.08em', marginBottom: '10px', paddingLeft: '8px' }}>
              DANH MỤC TRANG
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
                    className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} className="sidebar-menu-icon" />
                    <span className="sidebar-menu-text">{item.label}</span>
                    {item.count > 0 && (
                      <span className="sidebar-badge">{item.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Management Section */}
          {isAdmin && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.08em', marginBottom: '10px', paddingLeft: '8px' }}>
                QUẢN TRỊ VIÊN
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button 
                  className={`sidebar-menu-item ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('admin'); setIsMobileOpen(false); }}
                >
                  <Shield size={18} className="sidebar-menu-icon" />
                  <span className="sidebar-menu-text">Quản Trị Admin</span>
                </button>

                <button 
                  className="sidebar-menu-item"
                  onClick={() => { onOpenUserManagement(); setIsMobileOpen(false); }}
                >
                  <UserCheck size={18} className="sidebar-menu-icon" />
                  <span className="sidebar-menu-text">Quản Lý Giáo Viên</span>
                </button>

                <button 
                  className="sidebar-nav-btn accent"
                  onClick={() => { onOpenAdminCreateGame(); setIsMobileOpen(false); }}
                >
                  <PlusCircle size={18} />
                  <span>Tạo Game Mới</span>
                </button>
              </div>
            </div>
          )}

          {/* Author Card */}
          <div className="sidebar-author-card">
            <label className="sidebar-author-avatar-label" title={isAdmin ? "Đổi ảnh đại diện tác giả" : ""}>
              {authorPhoto ? (
                <img src={authorPhoto} alt="Thầy Hảo" className="sidebar-author-img" />
              ) : (
                <div className="sidebar-author-placeholder">👨‍🏫</div>
              )}
              {isAdmin && (
                <div className="sidebar-author-cam-icon">
                  <Camera size={10} color="#fbbf24" />
                </div>
              )}
              {isAdmin && (
                <input type="file" accept="image/*" onChange={handleAuthorPhotoUpload} style={{ display: 'none' }} />
              )}
            </label>
            <div>
              <span className="sidebar-author-tag">TÁC GIẢ WEBSITE</span>
              <div className="sidebar-author-name">by Thầy Hảo Địa Lý</div>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <LogOut size={16} /> Đăng Xuất Hệ Thống
          </button>
        </div>

      </aside>
    </>
  );
}
