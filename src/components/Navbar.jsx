import React from 'react';
import { Gamepad2, BookmarkCheck, Shield, PlusCircle, Users, LogIn, FileSpreadsheet, Sparkles } from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excel';

export function Navbar({ activeTab, setActiveTab, currentUser, onOpenRoleSwitcher, onOpenAdminCreateGame, myGamesCount }) {
  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '12px 24px', sticky: 'top', top: '16px', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Logo & School Header */}
        <div 
          onClick={() => setActiveTab('catalog')} 
          style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
        >
          {/* Official School Logo */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '6px 14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0, 168, 150, 0.35)',
            border: '1.5px solid #00a896'
          }}>
            <img 
              src="/assets/skyline_logo.png" 
              alt="Logo Trường SKY-LINE" 
              style={{ height: '32px', objectFit: 'contain' }}
            />
          </div>

          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, background: 'linear-gradient(135deg, #00a896 0%, #2dd4bf 50%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
              Giáo Viên Sky-Line
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 800, letterSpacing: '0.3px', marginTop: '1px' }}>
              ✨ VỮNG NỘI LỰC - VỮNG TƯƠNG LAI <span style={{ color: '#5eead4', fontWeight: 700, marginLeft: '6px' }}>| by Thầy Hảo Địa Lí</span>
            </p>
          </div>
        </div>

        {/* Center Nav Items */}
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

        {/* Right User & Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            onClick={onOpenRoleSwitcher}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderRadius: '30px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Bấm để chuyển nhanh giữa các Tài khoản Giáo viên / Admin"
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentUser?.role === 'admin' ? 'var(--danger-glow)' : 'var(--secondary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#fff',
              fontSize: '0.85rem'
            }}>
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {currentUser?.name}
                <span className={currentUser?.role === 'admin' ? 'badge badge-admin' : 'badge badge-teacher'}>
                  {currentUser?.role === 'admin' ? 'ADMIN' : 'GIÁO VIÊN'}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {currentUser?.subject || 'Bấm để đổi tài khoản'}
              </div>
            </div>
            <Users size={16} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
          </div>
        </div>

      </div>
    </header>
  );
}
