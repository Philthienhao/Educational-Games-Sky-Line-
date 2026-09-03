import React from 'react';
import { X, UserCheck, ShieldCheck, School, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storage';

export function RoleSwitcher({ isOpen, onClose, currentUser, onSelectUser }) {
  if (!isOpen || currentUser?.role !== 'admin') return null;

  const users = StorageService.getUsers().filter(u => u && u.username && u.username !== 'co_hoa' && u.username !== 'thay_nam');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-modal" style={{ width: '100%', maxWidth: '520px', padding: '28px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck color="#8b5cf6" size={24} />
              Đổi Tài Khoản Đăng Nhập
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Chọn tài khoản để trải nghiệm tính năng Giáo viên hoặc Admin
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* User Accounts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
          {users.map(u => {
            const isSelected = currentUser?.id === u.id;
            return (
              <div
                key={u.id}
                onClick={() => {
                  onSelectUser(u);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected 
                    ? '1.5px solid #8b5cf6' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: u.role === 'admin' ? 'var(--danger-glow)' : 'var(--secondary-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {u.name}
                      <span className={u.role === 'admin' ? 'badge badge-admin' : 'badge badge-teacher'}>
                        {u.role === 'admin' ? 'ADMIN' : 'GIÁO VIÊN'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span>Môn: {u.subject}</span>
                      <span>•</span>
                      <span>Username: <code>{u.username}</code></span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="badge badge-custom" style={{ padding: '6px 12px' }}>
                    Đang chọn
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Tip */}
        <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.8rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} />
          Mẹo: Admin có thể cấp tài khoản giáo viên mới trong "Bảng Quản Trị Admin".
        </div>

      </div>
    </div>
  );
}
