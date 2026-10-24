import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, X, User, BookOpen, School, Save, Sparkles, Edit3 } from 'lucide-react';
import { StorageService } from '../services/storage';

export function ChangePasswordModal({ isOpen, onClose, currentUser, onUserUpdated, initialTab = 'profile' }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'profile'); // 'profile' | 'password'

  // Profile Form State
  const [teacherName, setTeacherName] = useState(currentUser?.name || '');
  const [teacherSubject, setTeacherSubject] = useState(currentUser?.subject || '');
  const [teacherSchool, setTeacherSchool] = useState(currentUser?.school || '');

  // Password Form State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync profile fields when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setTeacherName(currentUser.name || '');
      setTeacherSubject(currentUser.subject || '');
      setTeacherSchool(currentUser.school || '');
    }
    if (initialTab) {
      setActiveTab(initialTab);
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [currentUser, isOpen, initialTab]);

  if (!isOpen || !currentUser) return null;

  // Handle Teacher Profile Update (Họ và tên giáo viên, môn học, trường)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = teacherName.trim();
    const cleanSubject = teacherSubject.trim();
    const cleanSchool = teacherSchool.trim();

    if (!cleanName) {
      setErrorMsg('Vui lòng nhập Họ và tên giáo viên.');
      return;
    }

    try {
      setIsSubmitting(true);

      const updatePayload = {
        name: cleanName,
        subject: cleanSubject || currentUser.subject || 'Đa môn',
        school: cleanSchool || currentUser.school || 'Sky-Line'
      };

      // Update in StorageService (LocalStorage + IDB + Supabase Cloud DB)
      const updatedUserObj = StorageService.updateUser(currentUser.id, updatePayload);
      const latestUser = updatedUserObj || { ...currentUser, ...updatePayload };
      StorageService.setCurrentUser(latestUser);

      if (onUserUpdated) {
        onUserUpdated(latestUser);
      }

      setSuccessMsg('🎉 Đã cập nhật họ tên giáo viên thành công! Dữ liệu đã lưu vĩnh viễn trên hệ thống.');

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMsg('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanCurrent = currentPasswordInput.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanCurrent) {
      setErrorMsg('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (cleanCurrent !== String(currentUser.password || '').trim()) {
      setErrorMsg('Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại!');
      return;
    }

    if (!cleanNew) {
      setErrorMsg('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (cleanNew.length < 4) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }

    if (cleanNew === cleanCurrent) {
      setErrorMsg('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMsg('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Update password in StorageService (LocalStorage + IDB + Supabase Cloud DB)
      const updatedUserObj = StorageService.updateUser(currentUser.id, { password: cleanNew });

      // Update current active session
      const latestUser = updatedUserObj || { ...currentUser, password: cleanNew };
      StorageService.setCurrentUser(latestUser);

      if (onUserUpdated) {
        onUserUpdated(latestUser);
      }

      setSuccessMsg('🎉 Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật vĩnh viễn trên hệ thống.');
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Change password error:", err);
      setErrorMsg('Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.15)',
          maxWidth: '480px',
          width: '100%',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
            }}>
              {activeTab === 'profile' ? <User size={22} color="#ffffff" /> : <KeyRound size={22} color="#ffffff" />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                Hồ Sơ & Mật Khẩu Giáo Viên
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                Tài khoản: <strong style={{ color: '#38bdf8' }}>{currentUser.username}</strong> ({currentUser.name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          padding: '10px 24px 0 24px',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.4)'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px 12px 0 0',
              border: 'none',
              background: activeTab === 'profile' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderBottom: activeTab === 'profile' ? '2.5px solid #38bdf8' : '2.5px solid transparent',
              color: activeTab === 'profile' ? '#38bdf8' : '#94a3b8',
              fontWeight: 900,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <User size={16} />
            <span>👤 Sửa Họ Tên & Thông Tin</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('password'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px 12px 0 0',
              border: 'none',
              background: activeTab === 'password' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderBottom: activeTab === 'password' ? '2.5px solid #38bdf8' : '2.5px solid transparent',
              color: activeTab === 'password' ? '#38bdf8' : '#94a3b8',
              fontWeight: 900,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <KeyRound size={16} />
            <span>🔑 Đổi Mật Khẩu</span>
          </button>
        </div>

        {/* Feedback Messages */}
        <div style={{ padding: '16px 24px 0 24px' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#fca5a5',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#6ee7b7',
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* TAB 1: SỬA HỌ TÊN VÀ THÔNG TIN GIÁO VIÊN */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} style={{ padding: '18px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Tên tài khoản (read-only) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
                Tên đăng nhập (Username cố định)
              </label>
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '11px 14px',
                color: '#38bdf8',
                fontSize: '0.92rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>@{currentUser.username}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>
                  {currentUser.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}
                </span>
              </div>
            </div>

            {/* Họ và tên giáo viên (editable) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 900, color: '#f8fafc', marginBottom: '6px' }}>
                👤 Họ và tên giáo viên <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Nhập họ và tên giáo viên (Ví dụ: Thầy Hoàng Tuấn, Cô Nguyễn Thị Thu Thảo)..."
                required
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1.5px solid #0284c7',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 0 15px rgba(2, 132, 199, 0.2)'
                }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                Tên này sẽ hiển thị trên góc màn hình, phòng đấu live, đề bài và chứng nhận học sinh.
              </p>
            </div>

            {/* Môn giảng dạy */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                📚 Môn giảng dạy
              </label>
              <input
                type="text"
                value={teacherSubject}
                onChange={(e) => setTeacherSubject(e.target.value)}
                placeholder="Ví dụ: Địa Lí, Toán, Ngữ Văn, Tiếng Anh, KHTN..."
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '11px 14px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Trường học */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                🏫 Trường / Đơn vị công tác
              </label>
              <input
                type="text"
                value={teacherSchool}
                onChange={(e) => setTeacherSchool(e.target.value)}
                placeholder="Ví dụ: Hệ thống Giáo dục Sky-Line..."
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '11px 14px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1.6,
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(13, 148, 136, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                <Save size={18} />
                <span>{isSubmitting ? 'Đang lưu...' : '💾 Lưu Họ Tên Giáo Viên'}</span>
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: ĐỔI MẬT KHẨU */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} style={{ padding: '18px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Current Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                🔑 Mật khẩu hiện tại
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '12px 42px 12px 14px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                ✨ Mật khẩu mới
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (ít nhất 4 ký tự)..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '12px 42px 12px 14px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                🛡️ Xác nhận mật khẩu mới
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1.6,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Đang cập nhật...' : '💾 Lưu Mật Khẩu Mới'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
