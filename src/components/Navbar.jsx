import React, { useState } from 'react';
import { Gamepad2, BookmarkCheck, Shield, PlusCircle, Users, LogIn, LogOut, FileSpreadsheet, Sparkles, Camera, BookOpen, Presentation, GraduationCap, UserCheck } from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excel';
import { StorageService } from '../services/storage';
import { compressImage } from '../utils/imageCompressor';
import thayHaoAvatar from '../assets/thayhaodiali.jpg';

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onOpenRoleSwitcher, 
  onOpenAdminCreateGame, 
  onOpenUserManagement,
  onLogout,
  myGamesCount 
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
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '12px 24px', position: 'sticky', top: '16px', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Icon & Educational Motto Header */}
        <div 
          onClick={() => setActiveTab('catalog')} 
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          {/* Symbolic Educational Graduation Badge */}
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(13, 148, 136, 0.45)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            flexShrink: 0
          }}>
            <GraduationCap size={28} color="#ffffff" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Inspirational Quote Above System Title */}
            <p style={{
              fontSize: '0.76rem',
              color: '#fde047',
              fontWeight: 700,
              fontStyle: 'italic',
              letterSpacing: '0.1px',
              marginBottom: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
            }}>
              ✨ "Không phải tất cả chúng ta đều làm được những điều vĩ đại, nhưng chúng ta có thể làm những điều nhỏ nhặt với tình yêu vĩ đại" (Mẹ Têrêsa Calcutta)
            </p>

            <h1 style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #00a896 0%, #2dd4bf 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
              margin: 0,
              whiteSpace: 'nowrap'
            }}>
              Hệ Thống Hỗ Trợ Dạy Và Học
            </h1>
          </div>
        </div>

        {/* Right Header Controls Flex Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Center Nav Buttons */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('catalog')}
            >
              <Gamepad2 size={18} />
              Kho Game Giáo Dục
            </button>

            <button 
              className={`btn ${activeTab === 'my-games' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('my-games')}
              style={{ position: 'relative' }}
            >
              <BookmarkCheck size={18} />
              Game Của Tôi
              {myGamesCount > 0 && (
                <span className="badge badge-custom" style={{ marginLeft: '4px', fontSize: '0.7rem' }}>
                  {myGamesCount}
                </span>
              )}
            </button>

            <button 
              className={`btn ${activeTab === 'homeroom' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('homeroom')}
              style={{ background: activeTab === 'homeroom' ? 'linear-gradient(135deg, #00a896 0%, #0284c7 100%)' : undefined, fontWeight: 800 }}
            >
              <Users size={18} />
              Lớp Chủ Nhiệm
            </button>

            <button 
              className={`btn ${activeTab === 'textbook-download' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('textbook-download')}
              style={{ background: activeTab === 'textbook-download' ? 'linear-gradient(135deg, #0d9488 0%, #059669 100%)' : undefined, fontWeight: 800 }}
            >
              <BookOpen size={18} />
              Tải File SGK
            </button>

            <button 
              className={`btn ${activeTab === 'lecture-slides' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('lecture-slides')}
              style={{ background: activeTab === 'lecture-slides' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : undefined, fontWeight: 800 }}
            >
              <Presentation size={18} />
              Slide Bài Giảng
            </button>

            {currentUser?.role === 'admin' && (
              <>
                <button 
                  className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('admin')}
                >
                  <Shield size={18} />
                  Quản Trị Admin
                </button>

                <button 
                  className="btn btn-secondary"
                  onClick={onOpenUserManagement}
                  title="Cấp và quản lý tài khoản giáo viên"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#ffffff', border: 'none', fontWeight: 800 }}
                >
                  <UserCheck size={18} />
                  Quản Lý Giáo Viên
                </button>

                <button 
                  className="btn btn-accent"
                  onClick={onOpenAdminCreateGame}
                >
                  <PlusCircle size={18} />
                  Tạo Game Mới
                </button>
              </>
            )}

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => downloadExcelTemplate('Mau_Cau_Hoi_Chuan')}
              title="Tải về file Excel mẫu chuẩn cho tất cả các loại game"
              style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            >
              <FileSpreadsheet size={16} />
              Tải Mẫu Excel
            </button>
          </nav>

          {/* AUTHOR SHOWCASE BADGE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 14px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1.5px solid #f59e0b',
            boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
            position: 'relative'
          }}>
            {/* Author Avatar Frame with Upload Handler */}
            <label 
              htmlFor="author-photo-file-input" 
              style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Bấm vào để tải/thay đổi ảnh chân dung của Thầy Hảo Địa Lí"
            >
              {authorPhoto ? (
                <img 
                  src={authorPhoto} 
                  alt="Tác Giả Thầy Hảo Địa Lí" 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #fbbf24',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)'
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: '#fff',
                  fontSize: '1.1rem',
                  border: '2px solid #fef08a',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
                }}>
                  👨‍🏫
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                background: '#0f172a',
                borderRadius: '50%',
                padding: '2px',
                border: '1px solid #fbbf24',
                display: 'flex'
              }}>
                <Camera size={10} color="#fbbf24" />
              </div>
              <input 
                type="file" 
                id="author-photo-file-input" 
                accept="image/*" 
                onChange={handleAuthorPhotoUpload} 
                style={{ display: 'none' }} 
              />
            </label>

            {/* Author Relocated Text Badge */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span className="badge" style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 900, fontSize: '0.62rem', padding: '1px 6px', borderRadius: '6px' }}>
                🏆 TÁC GIẢ WEBSITE
              </span>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#fde047', marginTop: '1px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                by Thầy Hảo Địa Lí
              </div>
            </div>
          </div>

          {/* Logged in User Badge & Logout Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              onClick={onOpenRoleSwitcher}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '30px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Bấm để xem thông tin tài khoản"
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: currentUser?.role === 'admin' ? 'var(--danger-glow)' : 'var(--secondary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#fff',
                fontSize: '0.8rem'
              }}>
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {currentUser?.name}
                  <span className={currentUser?.role === 'admin' ? 'badge badge-admin' : 'badge badge-teacher'}>
                    {currentUser?.role === 'admin' ? 'ADMIN' : 'GV'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              title="Đăng xuất tài khoản"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LogOut size={15} />
              Đăng Xuất
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
