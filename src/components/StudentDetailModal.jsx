import React, { useState } from 'react';
import { X, Upload, AlertTriangle, Award, CheckCircle2, User, Phone, MapPin, Calendar, Heart, ShieldAlert, Plus, Trash2, Link } from 'lucide-react';
import { SoundFX } from '../utils/sound';
import { compressImage } from '../utils/imageCompressor';
import { AvatarStorageService } from '../services/avatarStorage';

export function StudentDetailModal({ isOpen, onClose, student, onSave, onDelete }) {
  if (!isOpen || !student) return null;

  const [formData, setFormData] = useState({
    ...student,
    avatar: student.avatar || AvatarStorageService.getAvatarSync(student.id),
    violations: student.violations || [],
    rewards: student.rewards || []
  });

  const [newViolation, setNewViolation] = useState({ title: '', severity: 'Nhẹ', note: '' });
  const [newReward, setNewReward] = useState({ title: '', bonus: '' });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'violations' | 'rewards'
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedDataUrl = await compressImage(file, 200, 200, 0.5);
      await AvatarStorageService.saveAvatar(formData.id, compressedDataUrl);
      setFormData(prev => ({ ...prev, avatar: compressedDataUrl }));
    }
  };

  const handleAddViolation = (e) => {
    e.preventDefault();
    if (!newViolation.title.trim()) return;

    const violation = {
      id: `v_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...newViolation
    };

    setFormData(prev => ({
      ...prev,
      violations: [...prev.violations, violation]
    }));
    setNewViolation({ title: '', severity: 'Nhẹ', note: '' });
    SoundFX.correct();
  };

  const handleDeleteViolation = (vId) => {
    setFormData(prev => ({
      ...prev,
      violations: prev.violations.filter(v => v.id !== vId)
    }));
  };

  const handleAddReward = (e) => {
    e.preventDefault();
    if (!newReward.title.trim()) return;

    const reward = {
      id: `r_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...newReward
    };

    setFormData(prev => ({
      ...prev,
      rewards: [...prev.rewards, reward]
    }));
    setNewReward({ title: '', bonus: '' });
    SoundFX.win();
  };

  const handleDeleteReward = (rId) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => r.id !== rId)
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.avatar) {
      await AvatarStorageService.saveAvatar(formData.id, formData.avatar);
    }
    onSave(formData);
    SoundFX.correct();
    onClose();
  };

  const isOverTwoViolations = formData.violations.length > 2;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-modal" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isOverTwoViolations 
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)' 
            : 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              {formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt={formData.name}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00a896' }}
                />
              ) : (
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00a896 0%, #0284c7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: '#fff'
                }}>
                  {formData.name.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>
                  {formData.name}
                </h3>
                <span className="badge" style={{ background: 'rgba(0,168,150,0.25)', color: '#5eead4', border: '1px solid #00a896', fontSize: '0.75rem' }}>
                  Mã HS: {formData.studentId}
                </span>

                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: '1px solid #10b981', fontWeight: 900, fontSize: '0.75rem' }}>
                  💯 Điểm Nề Nếp: {Math.max(0, (formData.basePoints || 100) + (formData.rewards || []).length * 10 - (formData.violations || []).length * 5)}đ
                </span>

                {isOverTwoViolations && (
                  <span className="badge" style={{ background: '#dc2626', color: '#fff', fontWeight: 900, fontSize: '0.75rem', animation: 'pulse 1.5s infinite' }}>
                    🚨 CẢNH BÁO VI PHẠM ({formData.violations.length} LẦN)
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {formData.gender} • Sinh ngày: {formData.dob} • Phụ huynh: {formData.fatherName || formData.motherName || 'Chưa cập nhật'} ({formData.phone})
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'profile' ? 'rgba(0, 168, 150, 0.2)' : 'transparent',
              color: activeTab === 'profile' ? '#5eead4' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'profile' ? '2px solid #00a896' : 'none'
            }}
          >
            👤 Thông Tin & Học Tập
          </button>

          <button 
            onClick={() => setActiveTab('violations')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'violations' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: activeTab === 'violations' ? '#fca5a5' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'violations' ? '2px solid #ef4444' : 'none'
            }}
          >
            ⚠️ Vi Phạm ({formData.violations.length})
          </button>

          <button 
            onClick={() => setActiveTab('rewards')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'rewards' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeTab === 'rewards' ? '#fde047' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              borderBottom: activeTab === 'rewards' ? '2px solid #f59e0b' : 'none'
            }}
          >
            🏆 Khen Thưởng ({formData.rewards.length})
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

          {/* TAB 1: Profile & Notes */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Avatar Upload Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ position: 'relative' }}>
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00a896' }} />
                  ) : (
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#fff', fontWeight: 900 }}>
                      {formData.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', color: '#fff', border: 'none', fontWeight: 800 }}>
                      <Upload size={16} /> 📁 Chọn Ảnh Tải Từ Máy Tính...
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                    </label>

                    <button 
                      type="button" 
                      onClick={() => setShowUrlInput(!showUrlInput)} 
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Link size={14} /> {showUrlInput ? 'Ẩn Ô Nhập Link' : '🔗 Dán Link Ảnh Online'}
                    </button>
                  </div>

                  {showUrlInput && (
                    <div style={{ marginTop: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Dán đường dẫn URL ảnh (ví dụ: https://... hoặc Google Drive link)..."
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        style={{ ...inputStyle, fontSize: '0.85rem' }}
                      />
                    </div>
                  )}

                  <span style={{ fontSize: '0.78rem', color: '#34d399', display: 'block', marginTop: '6px', fontWeight: 700 }}>
                    ⚡ Tải ảnh trực tiếp từ máy tính (Tự động nén siêu nhẹ ~20KB - Lưu ngay lập tức, KHÔNG CẦN đưa lên Google Drive).
                  </span>
                </div>
              </div>

              {/* Basic Info Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>Mã Học Sinh:</label>
                  <input type="text" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>Họ Và Tên Học Sinh:</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>Ngày Sinh (YYYY-MM-DD):</label>
                  <input type="text" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>Giới Tính:</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} style={inputStyle}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>Họ Tên Bố:</label>
                  <input type="text" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>Họ Tên Mẹ:</label>
                  <input type="text" value={formData.motherName} onChange={(e) => setFormData({ ...formData, motherName: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>Số Điện Thoại Phụ Huynh:</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>Địa Chỉ Thường Trú:</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* Teacher Custom Notes & Academic Progress */}
              <div style={{ background: 'rgba(0, 168, 150, 0.1)', border: '1px solid rgba(0, 168, 150, 0.3)', padding: '18px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#5eead4', marginBottom: '12px' }}>
                  📝 Đánh Giá Tình Hình Học Tập & Ghi Chú Riêng Của Giáo Viên
                </h4>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    Tình Hình Học Tập (Tiến bộ / Sa sút / Đạt...):
                  </label>
                  <select 
                    value={formData.academicProgress}
                    onChange={(e) => setFormData({ ...formData, academicProgress: e.target.value })}
                    style={{ ...inputStyle, background: '#071521' }}
                  >
                    <option value="Tiến bộ xuất sắc">🌟 Tiến bộ xuất sắc</option>
                    <option value="Khá - Giỏi">👍 Khá - Giỏi</option>
                    <option value="Đạt chuẩn">👌 Đạt chuẩn kiến thức</option>
                    <option value="Cần cố gắng thêm">⚠️ Cần cố gắng thêm</option>
                    <option value="Có dấu hiệu sa sút">🚨 Có dấu hiệu sa sút học tập</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    Ghi Chú Đặc Điểm Nhận Xét Của Giáo Viên Chủ Nhiệm:
                  </label>
                  <textarea 
                    rows={3}
                    value={formData.teacherNotes}
                    onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
                    placeholder="Ghi chú tính cách, khả năng tiếp thu, hoàn cảnh gia đình hay các điểm cần lưu ý..."
                    style={{ ...inputStyle, background: '#071521', resize: 'vertical' }}
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Violations */}
          {activeTab === 'violations' && (
            <div>
              {isOverTwoViolations && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1.5px solid #ef4444', padding: '14px', borderRadius: '12px', color: '#fca5a5', fontSize: '0.88rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={22} color="#ef4444" />
                  🚨 CẢNH BÁO: Học sinh này đã vi phạm <strong>{formData.violations.length} lần</strong> (Vượt quá 2 lần)! Cần lập biên bản & trao đổi với phụ huynh.
                </div>
              )}

              {/* Add Violation Form */}
              <form onSubmit={handleAddViolation} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '14px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>➕ Thêm Lượt Vi Phạm Mới</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '10px', alignItems: 'center' }}>
                  <input type="text" placeholder="Nội dung vi phạm (vd: Đi học muộn)" value={newViolation.title} onChange={(e) => setNewViolation({ ...newViolation, title: e.target.value })} style={inputStyle} />
                  <select value={newViolation.severity} onChange={(e) => setNewViolation({ ...newViolation, severity: e.target.value })} style={inputStyle}>
                    <option value="Nhẹ">Mức: Nhẹ</option>
                    <option value="Trung bình">Mức: Trung bình</option>
                    <option value="Nghiêm trọng">Mức: Nghiêm trọng</option>
                  </select>
                  <input type="text" placeholder="Ghi chú / Hình thức xử lý" value={newViolation.note} onChange={(e) => setNewViolation({ ...newViolation, note: e.target.value })} style={inputStyle} />
                  <button type="submit" className="btn btn-danger btn-sm" style={{ padding: '10px 16px', fontWeight: 700 }}>
                    <Plus size={16} /> Thêm
                  </button>
                </div>
              </form>

              {/* Violations List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formData.violations.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                    ✨ Học sinh chưa có lượt vi phạm nào.
                  </p>
                ) : (
                  formData.violations.map((v, i) => (
                    <div key={v.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 16px', borderRadius: '12px' }}>
                      <div>
                        <span style={{ color: '#fca5a5', fontWeight: 800, fontSize: '0.9rem', display: 'inline-block', marginRight: '10px' }}>
                          Lần {i + 1}: {v.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                          {v.severity || 'Nhẹ'}
                        </span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Ngày: {v.date} • Ghi chú: {v.note || 'Không có'}
                        </p>
                      </div>

                      <button onClick={() => handleDeleteViolation(v.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Rewards */}
          {activeTab === 'rewards' && (
            <div>
              {/* Add Reward Form */}
              <form onSubmit={handleAddReward} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '14px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>🏆 Thêm Thành Tích / Khen Thưởng Mới</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto', gap: '10px', alignItems: 'center' }}>
                  <input type="text" placeholder="Nội dung khen thưởng (vd: Giải Nhất Cờ Vua)" value={newReward.title} onChange={(e) => setNewReward({ ...newReward, title: e.target.value })} style={inputStyle} />
                  <input type="text" placeholder="Điểm cộng / Hình thức khen (vd: +20 điểm thi đua)" value={newReward.bonus} onChange={(e) => setNewReward({ ...newReward, bonus: e.target.value })} style={inputStyle} />
                  <button type="submit" className="btn btn-warning btn-sm" style={{ padding: '10px 16px', fontWeight: 800, color: '#0f172a' }}>
                    <Plus size={16} /> Thêm Khen Thưởng
                  </button>
                </div>
              </form>

              {/* Rewards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formData.rewards.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                    Chưa có khen thưởng nào được ghi nhận.
                  </p>
                ) : (
                  formData.rewards.map((r, i) => (
                    <div key={r.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px 16px', borderRadius: '12px' }}>
                      <div>
                        <span style={{ color: '#fde047', fontWeight: 800, fontSize: '0.9rem', display: 'inline-block', marginRight: '10px' }}>
                          🏆 {r.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: '#f59e0b', color: '#0f172a', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>
                          {r.bonus || 'Khen thưởng'}
                        </span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Ngày khen thưởng: {r.date}
                        </p>
                      </div>

                      <button onClick={() => handleDeleteReward(r.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Buttons */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)' }}>
          <button 
            type="button" 
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm(`Bạn có chắc muốn xóa học sinh ${formData.name} khỏi danh sách?`)) {
                onDelete(formData.id);
                onClose();
              }
            }}
          >
            <Trash2 size={16} /> Xóa Học Sinh Này
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy Bỏ
            </button>
            <button type="button" className="btn btn-success" onClick={handleFormSubmit} style={{ padding: '10px 24px', fontWeight: 800 }}>
              <CheckCircle2 size={18} /> Lưu Thay Đổi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#fff',
  fontSize: '0.88rem',
  outline: 'none',
  fontFamily: 'inherit'
};
