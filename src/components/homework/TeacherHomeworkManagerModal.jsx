import React, { useState, useEffect } from 'react';
import { X, Trophy, Link2, Copy, Check, Trash2, Plus, Calendar, Clock, Users, FileSpreadsheet, ArrowRight, Play } from 'lucide-react';
import { HomeworkService } from '../../services/homeworkService';
import { SoundFX } from '../../utils/sound';

export function TeacherHomeworkManagerModal({ currentUser, onSelectAssignmentToView, onOpenAssignModalForGame, onClose }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, [currentUser]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const list = await HomeworkService.getTeacherAssignments(currentUser?.id);
      setAssignments(list);
    } catch (e) {
      console.warn("Load assignments error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (assign) => {
    const url = HomeworkService.getShareUrl(assign);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(assign.id);
      try { SoundFX.click(); } catch(e) {}
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleDelete = async (assignId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài tập về nhà này?")) return;
    const ok = await HomeworkService.deleteAssignment(currentUser?.id, assignId);
    if (ok) {
      setAssignments(prev => prev.filter(a => a.id !== assignId));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: 'min(92vh, 720px)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
        border: '1.5px solid rgba(13, 148, 136, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              📋
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                Quản Lý Bài Tập Về Nhà Đã Giao
              </h2>
              <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: '2px' }}>
                Danh sách bài tập • Lấy link học sinh • Xem bảng điểm lớp
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Đang tải danh sách bài tập...
            </div>
          ) : assignments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignments.map(assign => (
                <div
                  key={assign.id}
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: assign.gradient || 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {assign.icon || '🎮'}
                    </div>

                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                        {assign.customTitle || assign.gameTitle}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span>Lớp: <strong style={{ color: '#0d9488' }}>{assign.targetClass || 'Chung'}</strong></span>
                        <span>Số câu: <strong>{(assign.questions || []).length} câu</strong></span>
                        <span>Ngày tạo: {new Date(assign.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleCopyLink(assign)}
                      style={{
                        background: copiedId === assign.id ? '#10b981' : '#ffffff',
                        color: copiedId === assign.id ? '#ffffff' : '#0d9488',
                        border: '1.5px solid #cbd5e1',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {copiedId === assign.id ? <Check size={15} /> : <Link2 size={15} />}
                      <span>{copiedId === assign.id ? 'Đã Copy!' : 'Copy Link'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onSelectAssignmentToView) onSelectAssignmentToView(assign);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trophy size={15} />
                      <span>Xem Bảng Điểm</span>
                    </button>

                    <button
                      onClick={() => handleDelete(assign.id)}
                      title="Xóa bài tập này"
                      style={{
                        background: 'transparent',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1.5px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🚀</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                Chưa có bài tập về nhà nào được tạo
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 16px auto' }}>
                Thầy/Cô hãy vào <strong>Kho Game</strong> hoặc <strong>Game Của Tôi</strong> và bấm nút <strong>"🚀 Giao BTVN"</strong> trên bất kỳ game nào để tạo link bài tập cho học sinh!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
