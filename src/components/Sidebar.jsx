import React, { useState } from 'react';
import { 
  Gamepad2, 
  BookmarkCheck, 
  Users, 
  BookOpen, 
  Presentation,
  Shield, 
  UserCheck, 
  PlusCircle, 
  FileSpreadsheet, 
  Camera, 
  LogOut, 
  GraduationCap, 
  X
} from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excel';
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

  const handleAuthorPhotoUpload = async (e) => {
    if (currentUser?.role !== 'admin') return;
    const file = e.target.files[0];
    if (!file) return;
    const compressedDataUrl = await compressImage(file, 600, 600, 0.72);
    setAuthorPhoto(compressedDataUrl);
    localStorage.setItem('author_photo_thay_hao', compressedDataUrl);
    StorageService.updateUser('user_admin', { avatar: compressedDataUrl });
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 998
          }}
        />
      )}

      {/* Main Vertical Sidebar Container - Original Dark Glassmorphism */}
      <aside className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}>
        
        {/* Sidebar Header: Brand & Quote */}
        <div style={{
          padding: '22px 18px 16px 18px',
          borderBottom: '1px solid rgba(0, 168, 150, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div 
            onClick={() => { setActiveTab('catalog'); if (isMobileOpen) setIsMobileOpen(false); }} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(13, 148, 136, 0.45)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              flexShrink: 0
            }}>
              <GraduationCap size={26} color="#ffffff" />
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #00a896 0%, #2dd4bf 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.25,
                margin: 0
              }}>
                Hệ Thống Hỗ Trợ Dạy Và Học
              </h2>
            </div>

            {/* Mobile close button */}
            <button 
              className="sidebar-mobile-close"
              onClick={() => setIsMobileOpen(false)}
              style={{ display: 'none', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Inspirational Quote Box */}
          <div style={{
            background: 'rgba(13, 35, 51, 0.85)',
            border: '1px solid rgba(253, 224, 71, 0.3)',
            borderRadius: '12px',
            padding: '10px 12px'
          }}>
            <p style={{
              fontSize: '0.72rem',
              color: '#fde047',
              fontWeight: 700,
              fontStyle: 'italic',
              lineHeight: 1.4,
              margin: 0
            }}>
              ✨ "Không phải tất cả chúng ta đều làm được những điều vĩ đại, nhưng chúng ta có thể làm những điều nhỏ nhặt với tình yêu vĩ đại"
            </p>
            <span style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block', marginTop: '4px', textAlign: 'right', fontWeight: 600 }}>
              Mẹ Têrêsa Calcutta
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Category */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#0d9488', letterSpacing: '0.08em', marginBottom: '10px', paddingLeft: '8px' }}>
              DANH MỤC CHÍNH
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button 
                className={`sidebar-nav-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => { setActiveTab('catalog'); if (isMobileOpen) setIsMobileOpen(false); }}
              >
                <Gamepad2 size={18} />
                <span>Kho Game Giáo Dục</span>
              </button>

              <button 
                className={`sidebar-nav-btn ${activeTab === 'my-games' ? 'active' : ''}`}
                onClick={() => { setActiveTab('my-games'); if (isMobileOpen) setIsMobileOpen(false); }}
              >
                <BookmarkCheck size={18} />
                <span style={{ flex: 1 }}>Game Của Tôi</span>
                {myGamesCount > 0 && (
                  <span className="badge badge-custom" style={{ fontSize: '0.7rem' }}>
                    {myGamesCount}
                  </span>
                )}
              </button>

              <button 
                className={`sidebar-nav-btn ${activeTab === 'homeroom' ? 'active' : ''}`}
                onClick={() => { setActiveTab('homeroom'); if (isMobileOpen) setIsMobileOpen(false); }}
              >
                <Users size={18} />
                <span>Lớp Chủ Nhiệm</span>
              </button>

              <button 
                className={`sidebar-nav-btn ${activeTab === 'textbook-download' ? 'active' : ''}`}
                onClick={() => { setActiveTab('textbook-download'); if (isMobileOpen) setIsMobileOpen(false); }}
              >
                <BookOpen size={18} />
                <span>Tải File SGK</span>
              </button>

              <button 
                className={`sidebar-nav-btn ${activeTab === 'lecture-slides' ? 'active' : ''}`}
                onClick={() => { setActiveTab('lecture-slides'); if (isMobileOpen) setIsMobileOpen(false); }}
              >
                <Presentation size={18} />
                <span>Slide Bài Giảng</span>
              </button>
            </div>
          </div>

          {/* Admin Category */}
          {currentUser?.role === 'admin' && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.08em', marginBottom: '10px', paddingLeft: '8px' }}>
                QUẢN TRỊ VIÊN
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button 
                  className={`sidebar-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('admin'); if (isMobileOpen) setIsMobileOpen(false); }}
                >
                  <Shield size={18} />
                  <span>Quản Trị Admin</span>
                </button>

                <button 
                  className="sidebar-nav-btn"
                  onClick={() => { onOpenUserManagement(); if (isMobileOpen) setIsMobileOpen(false); }}
                  style={{ color: '#818cf8' }}
                >
                  <UserCheck size={18} />
                  <span>Quản Lý Giáo Viên</span>
                </button>

                <button 
                  className="sidebar-nav-btn accent"
                  onClick={() => { onOpenAdminCreateGame(); if (isMobileOpen) setIsMobileOpen(false); }}
                >
                  <PlusCircle size={18} />
                  <span>Tạo Game Mới</span>
                </button>
              </div>
            </div>
          )}

          {/* Utilities Category */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '10px', paddingLeft: '8px' }}>
              TIỆN ÍCH HỖ TRỢ
            </div>

            <button 
              className="sidebar-nav-btn utility"
              onClick={() => downloadExcelTemplate('Mau_Cau_Hoi_Chuan')}
              title="Tải về file Excel mẫu chuẩn cho tất cả các loại game"
            >
              <FileSpreadsheet size={18} color="#34d399" />
              <span style={{ color: '#6ee7b7' }}>Tải Mẫu Excel</span>
            </button>
          </div>

        </div>

        {/* Sidebar Footer: Author & User Cards */}
        <div style={{
          padding: '14px',
          borderTop: '1px solid rgba(0, 168, 150, 0.25)',
          background: 'rgba(7, 21, 33, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>

          {/* Author Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }}>
            <label 
              htmlFor={currentUser?.role === 'admin' ? "sidebar-author-file-input" : undefined} 
              style={{ cursor: currentUser?.role === 'admin' ? 'pointer' : 'default', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={currentUser?.role === 'admin' ? "Bấm vào để đổi ảnh Thầy Hảo" : "Tác giả Website: Thầy Hảo Địa Lí"}
            >
              <img 
                src={authorPhoto || thayHaoAvatar} 
                alt="Thầy Hảo Địa Lí" 
                onError={(e) => { e.target.src = thayHaoAvatar; }} 
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fbbf24', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.45)', flexShrink: 0 }} 
              />
              {currentUser?.role === 'admin' && (
                <input type="file" id="sidebar-author-file-input" accept="image/*" onChange={handleAuthorPhotoUpload} style={{ display: 'none' }} />
              )}
            </label>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span className="badge" style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 900, fontSize: '0.6rem', padding: '1px 6px', borderRadius: '4px' }}>
                🏆 TÁC GIẢ WEBSITE
              </span>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fde047', marginTop: '1px' }}>
                by Thầy Hảo Địa Lí
              </div>
            </div>
          </div>

          {/* User Info Card (No Role Switcher Trigger for Teachers) */}
          <div 
            onClick={currentUser?.role === 'admin' ? onOpenRoleSwitcher : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: currentUser?.role === 'admin' ? 'pointer' : 'default'
            }}
            title={currentUser?.role === 'admin' ? "Bấm để đổi tài khoản" : "Tài khoản cá nhân"}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: currentUser?.role === 'admin' ? 'var(--danger-glow)' : 'var(--secondary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#fff',
                fontSize: '0.85rem'
              }}>
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
                  {currentUser?.name}
                </div>
                <span className={currentUser?.role === 'admin' ? 'badge badge-admin' : 'badge badge-teacher'} style={{ fontSize: '0.62rem' }}>
                  {currentUser?.role === 'admin' ? 'ADMIN' : 'Giáo viên'}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onLogout(); }}
              title="Đăng xuất khỏi hệ thống"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
                flexShrink: 0
              }}
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
