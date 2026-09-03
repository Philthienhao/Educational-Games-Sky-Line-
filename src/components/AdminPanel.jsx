import React, { useState } from 'react';
import { ShieldCheck, UserPlus, KeyRound, Trash2, Edit3, PlusCircle, Gamepad2, Users, AlertTriangle, X, CheckCircle2, Eye, Building } from 'lucide-react';
import { StorageService } from '../services/storage';
import { HomeroomManager } from './HomeroomManager';
import { SoundFX } from '../utils/sound';

export function AdminPanel({ onOpenCreateGame }) {
  const [users, setUsers] = useState(StorageService.getUsers());
  const [baseGames, setBaseGames] = useState(StorageService.getBaseGames());
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [adminTab, setAdminTab] = useState('accounts'); // 'accounts' | 'homerooms' | 'games'
  const [selectedHomeroomTeacherId, setSelectedHomeroomTeacherId] = useState(null);

  const allHomeroomClasses = StorageService.getAllHomeroomClassesForAdmin();
  const selectedHomeroomObj = allHomeroomClasses.find(c => c.teacher.id === selectedHomeroomTeacherId) || allHomeroomClasses[0];

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

  const handleDeleteBaseGame = (game) => {
    if (confirm(`⚠️ [ĐỘC QUYỀN ADMIN]\n\nBạn có chắc chắn muốn XÓA VĨNH VIỄN trò chơi "${game.title}" khỏi hệ thống toàn trường?`)) {
      StorageService.deleteBaseGame(game.id);
      setBaseGames(StorageService.getBaseGames());
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

    const newUser = StorageService.createUser({
      username,
      password: password || '123456',
      name,
      subject: subject || 'Giáo viên',
      school: school || 'Trường THPT'
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
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          className={`btn ${adminTab === 'accounts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAdminTab('accounts')}
          style={{ borderRadius: '16px', padding: '12px 22px', fontWeight: 800 }}
        >
          <Users size={18} /> Danh Sách Tài Khoản Giáo Viên
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

      {/* TAB 1: Account Management */}
      {adminTab === 'accounts' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={22} color="#8b5cf6" />
              Danh Sách Tài Khoản Giáo Viên ({users.filter(u => u.role !== 'admin').length} tài khoản)
            </h3>
          </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Họ và Tên Giáo Viên</th>
                <th style={{ padding: '12px 16px' }}>Tên Đăng Nhập</th>
                <th style={{ padding: '12px 16px' }}>Mật Khẩu</th>
                <th style={{ padding: '12px 16px' }}>Môn Học</th>
                <th style={{ padding: '12px 16px' }}>Trường / Đơn Vị</th>
                <th style={{ padding: '12px 16px' }}>Vai Trò</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr 
                  key={u.id}
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#fff' }}>
                    {u.name}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#93c5fd' }}>
                    <code>{u.username}</code>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    <code>{u.password}</code>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {u.subject}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {u.school || 'THPT'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={u.role === 'admin' ? 'badge badge-admin' : 'badge badge-teacher'}>
                      {u.role === 'admin' ? 'ADMIN' : 'GIÁO VIÊN'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {u.role !== 'admin' && (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

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
              onClick={onOpenCreateGame}
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
