import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  Gamepad2, 
  Users, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Eye, 
  Building, 
  Check, 
  Search, 
  Filter,
  Mail,
  Sparkles,
  RefreshCw,
  RotateCcw,
  CheckCircle,
  Clock,
  Lock,
  Unlock
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { HomeroomManager } from './HomeroomManager';
import { SoundFX } from '../utils/sound';

export function AdminPanel({ onOpenCreateGame, onOpenUserManagement, baseGames: propBaseGames, onDeleteGame }) {
  const [users, setUsers] = useState(() => StorageService.getUsers());
  const [baseGames, setBaseGames] = useState(() => (Array.isArray(propBaseGames) && propBaseGames.length > 0) ? propBaseGames : StorageService.getBaseGames());
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [adminTab, setAdminTab] = useState('google-accounts'); // 'google-accounts' | 'accounts' | 'homerooms' | 'games'
  const [selectedHomeroomTeacherId, setSelectedHomeroomTeacherId] = useState(null);

  // Google OAuth Users Filter & Search State
  const [googleFilter, setGoogleFilter] = useState('all'); // 'all' | 'pending' | 'used' | 'unlimited'
  const [googleSearchQuery, setGoogleSearchQuery] = useState('');
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  // Payment Status Management Filter & Search State
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-sync Google Accounts with 24/7 cloud DB on mount
  useEffect(() => {
    StorageService.syncGoogleUsersWithCloud().then(() => {
      setUsers(StorageService.getUsers());
    }).catch(() => {});
  }, []);

  const allHomeroomClasses = StorageService.getAllHomeroomClassesForAdmin() || [];
  const selectedHomeroomObj = (allHomeroomClasses.length > 0) 
    ? (allHomeroomClasses.find(c => c && c.teacher && c.teacher.id === selectedHomeroomTeacherId) || allHomeroomClasses[0]) 
    : null;


  // User Deletion Modal State
  const [userToDelete, setUserToDelete] = useState(null); // { id, name }

  // Password Reset Modal State
  const [userToResetPassword, setUserToResetPassword] = useState(null); // { id, name }
  const [newPasswordInput, setNewPasswordInput] = useState('123456');

  // New User Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [school, setSchool] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('unpaid'); // 'unpaid' | 'paid'

  const handleDeleteBaseGame = (game) => {
    if (confirm(`⚠️ [ĐỘC QUYỀN ADMIN]\n\nBạn có chắc chắn muốn XÓA VĨNH VIỄN trò chơi "${game.title}" khỏi hệ thống toàn trường?`)) {
      StorageService.deleteBaseGame(game.id);
      setBaseGames(StorageService.getBaseGames());
      SoundFX.click();
    }
  };

  // Toggle Google User Access Tier (Chấp nhận dùng vĩnh viễn vs Dùng thử)
  const handleToggleGoogleUnlimited = (user) => {
    if (!user) return;
    const isCurrentlyUnlimited = user.accessTier === 'unlimited' || user.status === 'unlimited' || user.isPaid === true;
    const nextTier = isCurrentlyUnlimited ? 'trial' : 'unlimited';
    StorageService.setGoogleUserAccessTier(user.id, nextTier);
    setUsers(StorageService.getUsers());
    if (nextTier === 'unlimited') {
      SoundFX.correct();
      alert(`🎉 Đã duyệt chấp nhận cho tài khoản "${user.name}" (${user.email || user.username}) được DÙNG VĨNH VIỄN không giới hạn!`);
    } else {
      SoundFX.click();
      alert(`ℹ️ Đã chuyển tài khoản "${user.name}" về chế độ Dùng thử.`);
    }
  };

  // Reset Google User Trial Experience (Cấp lại 1 lượt dùng thử)
  const handleResetGoogleTrial = (user) => {
    if (!user) return;
    StorageService.resetUserTrial(user.id);
    setUsers(StorageService.getUsers());
    SoundFX.correct();
    alert(`✨ Đã cấp lại 1 lượt dùng thử cho tài khoản: ${user.name} (${user.email || user.username})!`);
  };

  // Cloud Sync for Google OAuth Users
  const handleSyncCloudGoogleUsers = async () => {
    setIsSyncingGoogle(true);
    try {
      await StorageService.syncGoogleUsersWithCloud();
      setUsers(StorageService.getUsers());
      SoundFX.correct();
    } catch (e) {
      console.warn("Cloud sync error:", e);
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  // Toggle or Update Teacher Payment Status (Đã CK / Chưa CK)
  const handleTogglePayment = (user, targetStatus) => {
    if (!user || user.role === 'admin' || user.username === 'philthienhao') return;

    const currentPaid = user.paymentStatus === 'paid' || user.isPaid === true;
    let nextStatus = targetStatus;

    // If currently paid and clicks 'paid' again, toggle back to unpaid
    if (targetStatus === 'paid' && currentPaid) {
      nextStatus = 'unpaid';
    } else if (targetStatus === 'unpaid' && !currentPaid) {
      nextStatus = 'unpaid';
    }

    const nextIsPaid = nextStatus === 'paid';
    StorageService.updateUser(user.id, {
      paymentStatus: nextStatus,
      isPaid: nextIsPaid,
      paidAt: nextIsPaid ? (user.paidAt || new Date().toISOString()) : null
    });

    setUsers(StorageService.getUsers());
    if (nextIsPaid) {
      SoundFX.correct();
    } else {
      SoundFX.click();
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!username || !name) {
      alert('Vui lòng nhập tên đăng nhập và tên giáo viên.');
      return;
    }

    const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      alert('Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.');
      return;
    }

    const isPaid = newPaymentStatus === 'paid';
    const newUser = StorageService.createUser({
      username,
      password: password || '123456',
      name,
      subject: subject || 'Giáo viên',
      school: school || 'Trường THPT',
      paymentStatus: newPaymentStatus,
      isPaid: isPaid,
      paidAt: isPaid ? new Date().toISOString() : null
    });

    setUsers(StorageService.getUsers());
    SoundFX.correct();
    setShowAddUserModal(false);
    
    // Reset form
    setUsername('');
    setPassword('123456');
    setName('');
    setSubject('');
    setSchool('');
    setNewPaymentStatus('unpaid');
  };

  // Confirm and Execute User Deletion
  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    StorageService.deleteUser(userToDelete.id);
    setUsers(StorageService.getUsers());
    SoundFX.click();
    setUserToDelete(null);
  };

  // Confirm and Execute Password Reset
  const confirmResetPassword = (e) => {
    e.preventDefault();
    if (!userToResetPassword || !newPasswordInput) return;

    StorageService.updateUser(userToResetPassword.id, { password: newPasswordInput });
    setUsers(StorageService.getUsers());
    SoundFX.correct();
    setUserToResetPassword(null);
    setNewPasswordInput('123456');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Banner Intro */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="badge badge-admin" style={{ marginBottom: '8px' }}>
              ADMIN DASHBOARD
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              Bảng Quản Trị Hệ Thống Admin
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', maxWidth: '600px' }}>
              Cấp tài khoản đăng nhập cho giáo viên sử dụng, đổi mật khẩu, xóa tài khoản và tạo mới các mẫu game giáo dục cho toàn hệ thống.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddUserModal(true)}
            >
              <UserPlus size={18} />
              Cấp Tài Khoản Giáo Viên Mới
            </button>

            <button 
              className="btn btn-accent"
              onClick={onOpenCreateGame}
            >
              <PlusCircle size={18} />
              Tạo Game Mới Cho Kho
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${adminTab === 'google-accounts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAdminTab('google-accounts')}
          style={{ 
            borderRadius: '16px', 
            padding: '12px 22px', 
            fontWeight: 800,
            background: adminTab === 'google-accounts' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : undefined,
            boxShadow: adminTab === 'google-accounts' ? '0 4px 14px rgba(2, 132, 199, 0.35)' : undefined
          }}
        >
          <Mail size={18} /> Duyệt tài khoản Gmail
        </button>

        <button 
          className={`btn ${adminTab === 'accounts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAdminTab('accounts')}
          style={{ borderRadius: '16px', padding: '12px 22px', fontWeight: 800 }}
        >
          <Users size={18} /> Tài Khoản Giáo Viên Cấp Thủ Công ({users.filter(u => u.role !== 'admin' && u.username !== 'philthienhao' && !StorageService.isGoogleUser(u)).length})
        </button>

        <button 
          className={`btn ${adminTab === 'games' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setBaseGames(StorageService.getBaseGames());
            setAdminTab('games');
          }}
          style={{ borderRadius: '16px', padding: '12px 22px', fontWeight: 800, background: adminTab === 'games' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : undefined }}
        >
          🎮 Quản Lý & Xóa Game Hệ Thống ({baseGames.length} game)
        </button>
      </div>

      {/* TAB 0: Google OAuth Accounts Management & Approval */}
      {adminTab === 'google-accounts' && (() => {
        const googleUsers = StorageService.getGoogleUsers();
        
        const pendingCount = googleUsers.filter(u => {
          const isUnlimited = u.accessTier === 'unlimited' || u.status === 'unlimited' || u.isPaid === true;
          const isUsed = u.status === 'trial_expired' || u.status === 'da_dung_thu' || (Number(u.totalTrialsUsed) || 0) >= 1;
          return !isUnlimited && !isUsed;
        }).length;

        const usedCount = googleUsers.filter(u => {
          const isUnlimited = u.accessTier === 'unlimited' || u.status === 'unlimited' || u.isPaid === true;
          const isUsed = u.status === 'trial_expired' || u.status === 'da_dung_thu' || (Number(u.totalTrialsUsed) || 0) >= 1;
          return !isUnlimited && isUsed;
        }).length;

        const unlimitedCount = googleUsers.filter(u => {
          return u.accessTier === 'unlimited' || u.status === 'unlimited' || u.isPaid === true;
        }).length;

        const displayedGoogleUsers = googleUsers.filter(u => {
          const isUnlimited = u.accessTier === 'unlimited' || u.status === 'unlimited' || u.isPaid === true;
          const isUsed = u.status === 'trial_expired' || u.status === 'da_dung_thu' || (Number(u.totalTrialsUsed) || 0) >= 1;
          const isPending = !isUnlimited && !isUsed;

          if (googleFilter === 'pending' && !isPending) return false;
          if (googleFilter === 'used' && !isUsed) return false;
          if (googleFilter === 'unlimited' && !isUnlimited) return false;

          if (googleSearchQuery.trim()) {
            const q = googleSearchQuery.toLowerCase().trim();
            const matchName = (u.name || '').toLowerCase().includes(q);
            const matchEmail = (u.email || u.username || '').toLowerCase().includes(q);
            return matchName || matchEmail;
          }
          return true;
        });

        return (
          <div className="glass-panel" style={{ padding: '28px' }}>
            {/* Header & Quick Stats */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                  <Mail size={22} color="#0284c7" />
                  Duyệt tài khoản Gmail ({googleUsers.length} tài khoản)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Quản lý riêng tài khoản giáo viên dùng thử bằng Gmail và chấp nhận duyệt dùng vĩnh viễn nếu muốn.
                </p>
              </div>

              {/* Quick Stat Badges & Cloud Sync Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSyncCloudGoogleUsers}
                  disabled={isSyncingGoogle}
                  style={{
                    background: 'rgba(2, 132, 199, 0.15)',
                    border: '1.5px solid rgba(2, 132, 199, 0.4)',
                    color: '#0284c7',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isSyncingGoogle ? 'not-allowed' : 'pointer'
                  }}
                  title="Kéo danh sách tài khoản Gmail mới nhất từ Cloud Server"
                >
                  <RefreshCw size={14} className={isSyncingGoogle ? 'spin-animation' : ''} />
                  <span>{isSyncingGoogle ? 'Đang đồng bộ...' : 'Đồng bộ từ Cloud'}</span>
                </button>

                <div 
                  onClick={() => setGoogleFilter(googleFilter === 'pending' ? 'all' : 'pending')}
                  style={{
                    background: googleFilter === 'pending' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.12)',
                    border: '1.5px solid rgba(245, 158, 11, 0.45)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Lọc tài khoản Đang chờ duyệt"
                >
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800 }}>⏳ Đang chờ duyệt:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f59e0b' }}>{pendingCount}</span>
                </div>

                <div 
                  onClick={() => setGoogleFilter(googleFilter === 'used' ? 'all' : 'used')}
                  style={{
                    background: googleFilter === 'used' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.12)',
                    border: '1.5px solid rgba(239, 68, 68, 0.45)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Lọc tài khoản Đã dùng thử (hết 1 lượt)"
                >
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 800 }}>🚫 Đã dùng thử:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ef4444' }}>{usedCount}</span>
                </div>

                <div 
                  onClick={() => setGoogleFilter(googleFilter === 'unlimited' ? 'all' : 'unlimited')}
                  style={{
                    background: googleFilter === 'unlimited' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
                    border: '1.5px solid rgba(16, 185, 129, 0.45)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Lọc tài khoản Dùng vĩnh viễn"
                >
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>💎 Dùng vĩnh viễn:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981' }}>{unlimitedCount}</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setGoogleFilter('all')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: googleFilter === 'all' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff'
                  }}
                >
                  Tất Cả ({googleUsers.length})
                </button>

                <button
                  type="button"
                  onClick={() => setGoogleFilter('pending')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '10px',
                    border: googleFilter === 'pending' ? '1.5px solid #d97706' : '1px solid rgba(245, 158, 11, 0.25)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: googleFilter === 'pending' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'rgba(245, 158, 11, 0.1)',
                    color: googleFilter === 'pending' ? '#ffffff' : '#fbbf24'
                  }}
                >
                  ⏳ Đang chờ duyệt ({pendingCount})
                </button>

                <button
                  type="button"
                  onClick={() => setGoogleFilter('used')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '10px',
                    border: googleFilter === 'used' ? '1.5px solid #dc2626' : '1px solid rgba(239, 68, 68, 0.25)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: googleFilter === 'used' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(239, 68, 68, 0.1)',
                    color: googleFilter === 'used' ? '#ffffff' : '#f87171'
                  }}
                >
                  🚫 Đã dùng thử ({usedCount})
                </button>

                <button
                  type="button"
                  onClick={() => setGoogleFilter('unlimited')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '10px',
                    border: googleFilter === 'unlimited' ? '1.5px solid #059669' : '1px solid rgba(16, 185, 129, 0.25)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: googleFilter === 'unlimited' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'rgba(16, 185, 129, 0.1)',
                    color: googleFilter === 'unlimited' ? '#ffffff' : '#34d399'
                  }}
                >
                  💎 Dùng vĩnh viễn ({unlimitedCount})
                </button>
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '340px' }}>
                <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={googleSearchQuery}
                  onChange={(e) => setGoogleSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên hoặc email Gmail..."
                  style={{
                    width: '100%',
                    padding: '8px 30px 8px 36px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {googleSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setGoogleSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Google Accounts Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    borderBottom: '2px solid #0ea5e9', 
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff' }}>Giáo Viên</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff' }}>Địa Chỉ Gmail</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff' }}>Ngày Đăng Ký</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', textAlign: 'center' }}>Trạng Thái Hiện Tại</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff' }}>Chi Tiết Dùng Thử</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', textAlign: 'center', minWidth: '220px' }}>
                      Duyệt Dùng Vĩnh Viễn
                    </th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedGoogleUsers.map((u, idx) => {
                    const isUnlimited = u.accessTier === 'unlimited' || u.status === 'unlimited' || u.isPaid === true;
                    const isUsed = u.status === 'trial_expired' || u.status === 'da_dung_thu' || (Number(u.totalTrialsUsed) || 0) >= 1;
                    const isPending = !isUnlimited && !isUsed;

                    const createdDateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : 'Mới đăng ký';

                    return (
                      <tr 
                        key={u.id}
                        style={{ 
                          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                          background: isUnlimited ? 'rgba(16, 185, 129, 0.05)' : (idx % 2 === 0 ? 'rgba(248, 250, 252, 0.8)' : '#ffffff'),
                          transition: 'background 0.2s'
                        }}
                      >
                        {/* Name + Picture */}
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {u.picture ? (
                              <img 
                                src={u.picture} 
                                alt={u.name} 
                                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }} 
                              />
                            ) : (
                              <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: '0.85rem'
                              }}>
                                {u.name?.charAt(0) || 'G'}
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{u.name}</div>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', padding: '1px 6px', borderRadius: '6px' }}>
                                Tài khoản Gmail
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Gmail */}
                        <td style={{ padding: '14px 16px', color: '#0284c7', fontWeight: 800 }}>
                          <code>{u.email || u.username}</code>
                        </td>

                        {/* Created At */}
                        <td style={{ padding: '14px 16px', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>
                          <div>{createdDateStr}</div>
                          {u.lastLoginAt && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                              Đăng nhập: {new Date(u.lastLoginAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </td>

                        {/* Status (Đã dùng thử / Đang chờ duyệt / Dùng vĩnh viễn) */}
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          {isUnlimited ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.82rem',
                              fontWeight: 900,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
                            }}>
                              💎 Dùng vĩnh viễn
                            </span>
                          ) : isUsed ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.82rem',
                              fontWeight: 900,
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: '#ffffff',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)'
                            }}>
                              🚫 Đã dùng thử
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.82rem',
                              fontWeight: 900,
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: '#ffffff',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
                            }}>
                              ⏳ Đang chờ duyệt
                            </span>
                          )}
                        </td>

                        {/* Trial Details */}
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>
                          {isUnlimited ? (
                            <span style={{ color: '#059669', fontWeight: 800 }}>Đã mở khóa 100% tính năng</span>
                          ) : u.lastFeatureTried ? (
                            <div>
                              <div style={{ color: '#ef4444', fontWeight: 800 }}>Đã dùng: {u.lastFeatureTried.name || u.lastFeatureTried.id}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                Lúc: {new Date(u.lastFeatureTried.at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#d97706', fontWeight: 800 }}>Chưa dùng (Còn 1 lượt trải nghiệm)</span>
                          )}
                        </td>

                        {/* Nút Duyệt Dùng Vĩnh Viễn (Toggle & Action Button) */}
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            {/* Toggle Switch */}
                            <label 
                              style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
                              title={isUnlimited ? 'Bấm để hủy quyền dùng vĩnh viễn' : 'Bấm để CHẤP NHẬN DÙNG VĨNH VIỄN'}
                            >
                              <input 
                                type="checkbox" 
                                checked={isUnlimited} 
                                onChange={() => handleToggleGoogleUnlimited(u)}
                                style={{ display: 'none' }}
                              />
                              <div style={{
                                width: '46px',
                                height: '24px',
                                background: isUnlimited ? '#10b981' : '#cbd5e1',
                                borderRadius: '12px',
                                position: 'relative',
                                transition: 'background 0.2s ease',
                                boxShadow: isUnlimited ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
                              }}>
                                <div style={{
                                  width: '18px',
                                  height: '18px',
                                  background: '#ffffff',
                                  borderRadius: '50%',
                                  position: 'absolute',
                                  top: '3px',
                                  left: isUnlimited ? '25px' : '3px',
                                  transition: 'left 0.2s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                              </div>
                            </label>

                            {/* Direct Action Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleGoogleUnlimited(u)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 900,
                                fontSize: '0.82rem',
                                background: isUnlimited 
                                  ? 'rgba(16, 185, 129, 0.15)' 
                                  : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: isUnlimited ? '#059669' : '#ffffff',
                                border: isUnlimited ? '1.5px solid rgba(16, 185, 129, 0.4)' : 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: isUnlimited ? 'none' : '0 4px 12px rgba(2, 132, 199, 0.35)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {isUnlimited ? (
                                <>
                                  <CheckCircle2 size={16} /> Đã Duyệt Vĩnh Viễn
                                </>
                              ) : (
                                <>
                                  <Sparkles size={16} color="#fde047" /> Chấp nhận dùng vĩnh viễn
                                </>
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Thao Tác (Cấp lại lượt, Xóa) */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleResetGoogleTrial(u)}
                              title="Cấp lại 1 lượt dùng thử cho giáo viên này"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '6px 10px' }}
                            >
                              <RotateCcw size={13} />
                              Cấp lại trial
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => setUserToDelete(u)}
                              title="Xóa tài khoản này"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '6px 10px' }}
                            >
                              <Trash2 size={13} />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {displayedGoogleUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                        <Mail size={40} style={{ opacity: 0.4, marginBottom: '10px' }} />
                        <div style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>Chưa có tài khoản Gmail nào phù hợp với bộ lọc</div>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                          Khi giáo viên bấm đăng ký / đăng nhập tự động bằng Google, danh sách tài khoản sẽ xuất hiện tại đây.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* TAB 1: Account Management */}
      {adminTab === 'accounts' && (() => {
        const teacherUsers = users.filter(u => u.role !== 'admin' && u.username !== 'philthienhao' && !StorageService.isGoogleUser(u));
        const paidCount = teacherUsers.filter(u => u.paymentStatus === 'paid' || u.isPaid === true).length;
        const unpaidCount = teacherUsers.filter(u => u.paymentStatus !== 'paid' && !u.isPaid).length;

        const displayedUsers = users.filter(u => {
          if (StorageService.isGoogleUser(u)) return false; // Strict: Gmail trial accounts only managed in 'Duyệt tài khoản Gmail'

          const isTeacher = u.role !== 'admin' && u.username !== 'philthienhao';
          const isPaid = u.paymentStatus === 'paid' || u.isPaid === true;

          // Filter by payment status tab
          if (paymentFilter === 'paid') {
            if (!isTeacher || !isPaid) return false;
          } else if (paymentFilter === 'unpaid') {
            if (!isTeacher || isPaid) return false;
          }

          // Filter by search query
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const matchName = (u.name || '').toLowerCase().includes(q);
            const matchUser = (u.username || '').toLowerCase().includes(q);
            const matchSub = (u.subject || '').toLowerCase().includes(q);
            const matchSch = (u.school || '').toLowerCase().includes(q);
            return matchName || matchUser || matchSub || matchSch;
          }

          return true;
        });

        return (
          <div className="glass-panel" style={{ padding: '28px' }}>
            {/* Header & Quick Stats */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                  <Users size={22} color="#8b5cf6" />
                  Danh Sách Tài Khoản Giáo Viên Cấp Thủ Công ({teacherUsers.length} tài khoản)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Quản lý tài khoản giáo viên cấp thủ công, trạng thái chuyển khoản và cấp quyền sử dụng hệ thống.
                </p>
              </div>

              {/* Quick Stat Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Tổng GV:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-bright)' }}>{teacherUsers.length}</span>
                </div>

                <div 
                  onClick={() => setPaymentFilter(paymentFilter === 'unpaid' ? 'all' : 'unpaid')}
                  style={{
                    background: paymentFilter === 'unpaid' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.12)',
                    border: '1.5px solid rgba(245, 158, 11, 0.45)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Bấm để lọc danh sách Chưa CK"
                >
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800 }}>⏳ Chưa CK:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f59e0b' }}>{unpaidCount}</span>
                </div>

                <div 
                  onClick={() => setPaymentFilter(paymentFilter === 'paid' ? 'all' : 'paid')}
                  style={{
                    background: paymentFilter === 'paid' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
                    border: '1.5px solid rgba(16, 185, 129, 0.45)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Bấm để lọc danh sách Đã CK"
                >
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>✅ Đã CK:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981' }}>{paidCount}</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {/* Filter Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setPaymentFilter('all')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: paymentFilter === 'all' ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    boxShadow: paymentFilter === 'all' ? '0 2px 8px rgba(13, 148, 136, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Tất Cả ({teacherUsers.length + (users.find(u => u.role === 'admin') ? 1 : 0)})
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('unpaid')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '10px',
                    border: paymentFilter === 'unpaid' ? '1.5px solid #d97706' : '1px solid rgba(245, 158, 11, 0.25)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: paymentFilter === 'unpaid' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'rgba(245, 158, 11, 0.1)',
                    color: paymentFilter === 'unpaid' ? '#ffffff' : '#fbbf24',
                    boxShadow: paymentFilter === 'unpaid' ? '0 2px 8px rgba(217, 119, 6, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ⏳ Chưa CK ({unpaidCount})
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentFilter('paid')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '10px',
                    border: paymentFilter === 'paid' ? '1.5px solid #059669' : '1px solid rgba(16, 185, 129, 0.25)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: paymentFilter === 'paid' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'rgba(16, 185, 129, 0.1)',
                    color: paymentFilter === 'paid' ? '#ffffff' : '#34d399',
                    boxShadow: paymentFilter === 'paid' ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ✅ Đã CK ({paidCount})
                </button>
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '340px' }}>
                <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, tài khoản, môn..."
                  style={{
                    width: '100%',
                    padding: '8px 30px 8px 36px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', 
                    borderBottom: '2px solid #14b8a6', 
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px' }}>Họ và Tên Giáo Viên</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px' }}>Tên Đăng Nhập</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px' }}>Mật Khẩu</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px' }}>Môn Học</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px' }}>Trường / Đơn Vị</th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px' }}>Vai Trò</th>
                    <th style={{ padding: '14px 12px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px', textAlign: 'center', width: '90px' }} title="Đánh dấu tài khoản chưa chuyển khoản">
                      Chưa CK
                    </th>
                    <th style={{ padding: '14px 12px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px', textAlign: 'center', width: '90px' }} title="Đánh dấu tài khoản đã chuyển khoản">
                      Đã CK
                    </th>
                    <th style={{ padding: '14px 16px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.3px', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((u, idx) => {
                    const isAdmin = u.role === 'admin' || u.username === 'philthienhao';
                    const isPaid = !isAdmin && (u.paymentStatus === 'paid' || u.isPaid === true);
                    const isUnpaid = !isAdmin && !isPaid;

                    return (
                      <tr 
                        key={u.id}
                        style={{ 
                          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                          background: isAdmin ? 'rgba(239, 68, 68, 0.08)' : (idx % 2 === 0 ? 'rgba(248, 250, 252, 0.8)' : '#ffffff'),
                          transition: 'background 0.2s'
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{u.name}</span>
                            {isPaid && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px' }}>
                                ĐÃ CK
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#0284c7', fontWeight: 800 }}>
                          <code>{u.username}</code>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 700 }}>
                          <code>{u.password}</code>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 700 }}>
                          {u.subject}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 700 }}>
                          {u.school || 'THPT'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={isAdmin ? 'badge badge-admin' : 'badge badge-teacher'}>
                            {isAdmin ? 'ADMIN' : 'GIÁO VIÊN'}
                          </span>
                        </td>

                        {/* Ô Vuông: Chưa CK */}
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          {isAdmin ? (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>—</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTogglePayment(u, 'unpaid')}
                              title={isUnpaid ? 'Đang chọn: Chưa chuyển khoản' : 'Bấm vào ô vuông để đánh dấu Chưa CK'}
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                border: isUnpaid ? '2.5px solid #d97706' : '2px solid #cbd5e1',
                                background: isUnpaid ? '#fef3c7' : '#ffffff',
                                color: '#b45309',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: isUnpaid ? '0 2px 8px rgba(217, 119, 6, 0.3)' : 'none',
                                transition: 'all 0.15s ease',
                                outline: 'none',
                                margin: '0 auto'
                              }}
                            >
                              {isUnpaid ? <Check size={18} strokeWidth={3.5} /> : null}
                            </button>
                          )}
                        </td>

                        {/* Ô Vuông: Đã CK */}
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          {isAdmin ? (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>—</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTogglePayment(u, 'paid')}
                              title={isPaid ? 'Đang chọn: Đã chuyển khoản' : 'Bấm vào ô vuông để đánh dấu Đã CK'}
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                border: isPaid ? '2.5px solid #059669' : '2px solid #cbd5e1',
                                background: isPaid ? '#d1fae5' : '#ffffff',
                                color: '#047857',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: isPaid ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none',
                                transition: 'all 0.15s ease',
                                outline: 'none',
                                margin: '0 auto'
                              }}
                            >
                              {isPaid ? <Check size={18} strokeWidth={3.5} /> : null}
                            </button>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {!isAdmin && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setUserToResetPassword(u);
                                  setNewPasswordInput(u.password || '123456');
                                }}
                                title="Đổi mật khẩu"
                              >
                                <KeyRound size={14} />
                                Đổi MK
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => setUserToDelete(u)}
                                title="Xóa tài khoản này"
                              >
                                <Trash2 size={14} />
                                Xóa
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {displayedUsers.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                        Không tìm thấy tài khoản giáo viên nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* TAB 2: All Homeroom Classes Supervision for Admin */}
      {adminTab === 'homerooms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Select Teacher Class Selector Bar */}
          <div className="glass-panel" style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#5eead4', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building size={22} />
                Danh Sách Tất Cả Lớp Chủ Nhiệm Trong Trường ({allHomeroomClasses.length} lớp)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Chọn giáo viên để kiểm tra chi tiết danh sách học sinh, vi phạm, khen thưởng và tình hình học tập của lớp đó.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {allHomeroomClasses.map(item => {
                const isSelected = selectedHomeroomObj?.teacher.id === item.teacher.id;
                return (
                  <button
                    key={item.teacher.id}
                    onClick={() => setSelectedHomeroomTeacherId(item.teacher.id)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      borderRadius: '14px',
                      padding: '10px 18px',
                      fontWeight: 800,
                      background: isSelected ? 'linear-gradient(135deg, #00a896 0%, #0284c7 100%)' : undefined
                    }}
                  >
                    🏫 {item.classData.className} ({item.teacher.name})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render HomeroomManager in Read-Only Admin Mode for Selected Teacher Class */}
          {selectedHomeroomObj && (
            <HomeroomManager 
              currentUser={{ role: 'admin' }} 
              readOnlyAdminClass={selectedHomeroomObj}
            />
          )}

        </div>
      )}

      {/* TAB 3: Admin Game Management & Deletion */}
      {adminTab === 'games' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gamepad2 size={24} color="#ef4444" />
                Quản Lý & Xóa Game Hệ Thống (Độc Quyền Admin)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Admin có quyền xóa vĩnh viễn bất kỳ trò chơi nào khỏi hệ thống hiển thị toàn trường.
              </p>
            </div>

            <button 
              className="btn btn-accent"
              onClick={() => {
                if (typeof onOpenCreateGame === 'function') onOpenCreateGame();
              }}
              style={{ borderRadius: '12px' }}
            >
              <PlusCircle size={18} /> Tạo Mẫu Game Mới
            </button>
          </div>

          {baseGames.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Chưa có trò chơi nào trong hệ thống.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {baseGames.map(game => (
                <div 
                  key={game.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      fontSize: '2rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {game.icon || '🎮'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        {game.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {game.category || 'Game Giáo Dục'} • {(game.defaultQuestions || game.questions || []).length} câu hỏi
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.4 }}>
                    {game.description || 'Trò chơi tương tác bài giảng.'}
                  </p>

                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteBaseGame(game)}
                    style={{ width: '100%', borderRadius: '10px', fontWeight: 700, padding: '8px 12px' }}
                  >
                    <Trash2 size={16} />
                    Xóa Game Khỏi Hệ Thống
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Add New Teacher User */}
      {showAddUserModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Cấp Tài Khoản Giáo Viên Mới
              </h3>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>
                  Tên Đăng Nhập (Username):
                </label>
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="VD: co_mai, thay_hung"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>
                  Mật Khẩu Mặc Định:
                </label>
                <input 
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>
                  Họ và Tên Giáo Viên:
                </label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Cô Lê Thị Mai"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>
                  Môn Giảng Dạy:
                </label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="VD: Hóa Học, Tiếng Anh"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>
                  Trường / Trường Học:
                </label>
                <input 
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="VD: THPT Chu Văn An"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />
              </div>

              {/* Trạng Thái Chuyển Khoản (Bán tài khoản) */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '8px' }}>
                  Trạng Thái Thanh Toán (Bán Tài Khoản):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div 
                    onClick={() => setNewPaymentStatus('unpaid')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: newPaymentStatus === 'unpaid' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255,255,255,0.05)',
                      border: newPaymentStatus === 'unpaid' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      border: newPaymentStatus === 'unpaid' ? '2px solid #f59e0b' : '1.5px solid rgba(255,255,255,0.4)',
                      background: newPaymentStatus === 'unpaid' ? '#f59e0b' : 'transparent',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {newPaymentStatus === 'unpaid' && <Check size={16} strokeWidth={3.5} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: newPaymentStatus === 'unpaid' ? '#fbbf24' : '#ffffff' }}>⏳ Chưa CK</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Chưa thanh toán</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setNewPaymentStatus('paid')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: newPaymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255,255,255,0.05)',
                      border: newPaymentStatus === 'paid' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      border: newPaymentStatus === 'paid' ? '2px solid #10b981' : '1.5px solid rgba(255,255,255,0.4)',
                      background: newPaymentStatus === 'paid' ? '#10b981' : 'transparent',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {newPaymentStatus === 'paid' && <Check size={16} strokeWidth={3.5} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: newPaymentStatus === 'paid' ? '#34d399' : '#ffffff' }}>✅ Đã CK</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Đã nhận chuyển khoản</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Hủy Bỏ
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Cấp Tài Khoản
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Confirm Delete User Modal */}
      {userToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 2500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '440px', padding: '28px', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#fca5a5'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Xác Nhận Xóa Tài Khoản
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa tài khoản giáo viên <strong style={{ color: '#fff' }}>"{userToDelete.name}"</strong> (Username: <code>{userToDelete.username}</code>)?
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setUserToDelete(null)}
              >
                Hủy Bỏ
              </button>
              <button 
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={confirmDeleteUser}
              >
                <Trash2 size={16} />
                Xóa Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Reset Password Modal */}
      {userToResetPassword && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 2500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#8b5cf6" />
                Đổi Mật Khẩu Giáo Viên
              </h3>
              <button onClick={() => setUserToResetPassword(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={confirmResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Đổi mật khẩu cho giáo viên: <strong style={{ color: '#fff' }}>{userToResetPassword.name}</strong>
              </p>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                  Mật Khẩu Mới:
                </label>
                <input 
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setUserToResetPassword(null)}
                >
                  Hủy Bỏ
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Lưu Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
