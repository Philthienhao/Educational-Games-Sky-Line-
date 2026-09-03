import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Key, Trash2, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { StorageService } from '../services/storage';

export function UserManagementModal({ isOpen, onClose, currentUser }) {
  const [usersList, setUsersList] = useState([]);
  
  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('Địa Lí');
  const [newRole, setNewRole] = useState('teacher');
  
  // Feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadUsers = () => {
    const list = StorageService.getUsers();
    setUsersList(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateUser = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const cleanUname = newUsername.trim();
    const cleanPass = newPassword.trim();
    const cleanName = newName.trim();

    if (!cleanUname || !cleanPass || !cleanName) {
      setErrorMsg('Vui lòng điền đầy đủ Tên tài khoản, Mật khẩu và Họ tên giáo viên!');
      return;
    }

    // Check duplicate username in current active users
    const currentActiveUsers = StorageService.getUsers();
    const existing = currentActiveUsers.find(u => u.username && u.username.trim().toLowerCase() === cleanUname.toLowerCase());
    if (existing) {
      setErrorMsg(`Tên tài khoản "${cleanUname}" đã tồn tại trên hệ thống! Vui lòng chọn tên tài khoản khác.`);
      return;
    }

    const created = StorageService.createUser({
      username: cleanUname,
      password: cleanPass,
      name: cleanName,
      subject: newSubject.trim() || 'Giáo Dục',
      role: newRole || 'teacher',
      school: 'Hệ thống Giáo Dục Sky-Line'
    });

    setSuccessMsg(`✅ Đã tạo và cấp tài khoản thành công cho: ${created.name} (Tên đăng nhập: "${created.username}" | Mật khẩu: "${created.password}")`);
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    loadUsers();
  };

  const handleCopySeedCode = () => {
    const list = StorageService.getUsers();
    const formatted = JSON.stringify(list, null, 2);
    const codeSnippet = `const INITIAL_USERS = ${formatted};`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codeSnippet).then(() => {
        setSuccessMsg('📋 Đã sao chép mã cấu hình INITIAL_USERS vào bộ nhớ tạm! Bạn có thể dán trực tiếp vào file storage.js để tích hợp vĩnh viễn.');
      }).catch(() => {
        prompt('Sao chép mã INITIAL_USERS bên dưới:', codeSnippet);
      });
    } else {
      prompt('Sao chép mã INITIAL_USERS bên dưới:', codeSnippet);
    }
  };

  const handleExportAccountsJSON = () => {
    const list = StorageService.getUsers();
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Tai_Khoan_Giao_Vien_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMsg('📥 Đã tải xuống danh sách file tài khoản JSON thành công!');
  };

  const handleResetPassword = (userObj) => {
    const newPass = prompt(`Nhập mật khẩu mới cho tài khoản "${userObj.username}" (${userObj.name}):`, '123456');
    if (newPass && newPass.trim()) {
      StorageService.updateUser(userObj.id, { password: newPass.trim() });
      setSuccessMsg(`Đã đổi mật khẩu cho ${userObj.name} thành "${newPass.trim()}"`);
      loadUsers();
    }
  };

  const handleDeleteUser = (userObj) => {
    if (userObj.role === 'admin' || userObj.username === 'philthienhao') {
      alert('Không thể xóa tài khoản Admin chính hệ thống!');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userObj.name}" (${userObj.username}) không?`)) {
      StorageService.deleteUser(userObj.id);
      setSuccessMsg(`Đã xóa tài khoản ${userObj.name}`);
      loadUsers();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9000,
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '28px',
        padding: '32px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: 'Montserrat, system-ui, sans-serif'
      }}>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={26} color="#6366f1" /> Cấp & Quản Lý Tài Khoản Giáo Viên
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Quản trị viên <strong>Thầy Hảo Địa Lí</strong> có thể tạo tài khoản mới, đổi mật khẩu và bảo vệ dữ liệu toàn hệ thống.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 900,
              color: '#64748b'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Backup & Restore System Data Section */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #22c55e',
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 900, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🛡️ Sao Lưu & Bảo Vệ Dữ Liệu Tuyệt Đối
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>
              Tải bản sao lưu (.json) về máy tính để bảo vệ tất cả game cá nhân, lớp chủ nhiệm và tài khoản.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCopySeedCode}
              title="Sao chép mã Javascript INITIAL_USERS để dán vào file storage.js"
              style={{
                background: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 14px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
              }}
            >
              📋 Sao Chép Mã INITIAL_USERS
            </button>
            <button
              onClick={() => StorageService.exportFullBackup()}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 14px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)'
              }}
            >
              💾 Tải Bản Sao Lưu (.json)
            </button>
            <label
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 14px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
                display: 'inline-block'
              }}
            >
              📥 Khôi Phục Dữ Liệu
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const res = StorageService.importFullBackup(evt.target.result);
                      if (res.success) {
                        alert('Khôi phục dữ liệu thành công! Trang web sẽ tự động tải lại.');
                        window.location.reload();
                      } else {
                        alert('Lỗi: ' + res.message);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#22c55e" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#ef4444" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form: Cấp Tài Khoản Giáo Viên Mới */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1.5px solid #e2e8f0',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} color="#4f46e5" /> Cấp Tài Khoản Giáo Viên Mới
          </h4>

          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Họ và Tên Giáo Viên:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ví dụ: Cô Nguyễn Thị Mai"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #0284c7', fontWeight: 800, fontSize: '0.9rem', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Môn Học / Khối Dạy:
              </label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Ví dụ: Hóa Học, Toán, Tiếng Anh"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontWeight: 800, fontSize: '0.9rem', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Tên Tài Khoản Đăng Nhập:
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Ví dụ: co_mai_hoa"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontWeight: 800, fontSize: '0.9rem', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Mật Khẩu Ban Đầu:
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ví dụ: 123456"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontWeight: 800, fontSize: '0.9rem', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: '6px' }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <UserPlus size={18} /> CẤP TÀI KHOẢN NGAY
              </button>
            </div>
          </form>
        </div>

        {/* List of Teachers */}
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#0d9488" /> Danh Sách Tài Khoản Trong Hệ Thống ({usersList.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {usersList.map((u) => {
              const isAdmin = u.role === 'admin' || u.username === 'philthienhao';
              return (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: isAdmin ? '#eef2ff' : '#ffffff',
                    border: isAdmin ? '1.5px solid #818cf8' : '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isAdmin ? '#4f46e5' : '#0ea5e9',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.1rem'
                    }}>
                      {isAdmin ? '👑' : '👩‍🏫'}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{u.name}</span>
                        {isAdmin && <span style={{ background: '#4338ca', color: '#fff', fontSize: '0.7rem', padding: '1px 7px', borderRadius: '10px' }}>ADMIN CHÍNH</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        Tài khoản: <strong>{u.username}</strong> | Mật khẩu: <code>{u.password}</code> | Môn: {u.subject}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleResetPassword(u)}
                      title="Đổi mật khẩu"
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '6px 10px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Key size={14} /> Đổi Pass
                    </button>

                    {!isAdmin && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        title="Xóa tài khoản"
                        style={{ background: '#fee2e2', border: 'none', borderRadius: '10px', padding: '6px 10px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
