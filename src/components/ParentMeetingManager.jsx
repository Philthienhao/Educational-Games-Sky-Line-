import React, { useState } from 'react';
import { 
  Users, 
  Building, 
  Sparkles, 
  Printer, 
  FileText, 
  HelpCircle, 
  Award, 
  Calendar, 
  Heart, 
  CheckCircle2, 
  ChevronRight,
  Eye,
  Gift,
  Smile
} from 'lucide-react';
import { DeskNameCardGenerator } from './DeskNameCardGenerator';
import { StudentSilhouetteGame } from './StudentSilhouetteGame';

export function ParentMeetingManager({ currentUser, classData }) {
  const [activeSubTab, setActiveSubTab] = useState('desk_name_cards'); // 'desk_name_cards' | 'silhouette_game' | 'honors_showcase'
  const [showDeskNameCardModal, setShowDeskNameCardModal] = useState(false);

  const students = classData?.students || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Sub-Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px 36px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(139, 92, 246, 0.25) 50%, rgba(13, 148, 136, 0.2) 100%)',
          border: '1.5px solid rgba(139, 92, 246, 0.45)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: '#8b5cf6', color: '#ffffff', fontSize: '0.75rem', fontWeight: 900, padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase' }}>
              👨‍👩‍👧‍👦 CHUYÊN MỤC HỌP PHỤ HUYNH CHỦ NHIỆM
            </span>
            <span style={{ color: '#c4b5fd', fontSize: '0.85rem', fontWeight: 700 }}>
              {classData?.className || 'Lớp Chủ Nhiệm'} • Sĩ Số: {students.length} Học Sinh
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            Công Cụ Hỗ Trợ Họp Phụ Huynh Đột Phá & Sáng Tạo
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: '4px 0 0 0', maxWidth: '750px', lineHeight: 1.5 }}>
            Tự động khởi tạo Bảng tên để bàn A4 gấp 4 chuẩn nét, Trò chơi khởi động "Đoán Bóng Tìm Con" gắn kết phụ huynh & Bảng vinh danh thành tích học sinh.
          </p>
        </div>

        {/* Quick Action Trigger */}
        <button
          onClick={() => setShowDeskNameCardModal(true)}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: '#ffffff', border: 'none', borderRadius: '16px',
            padding: '14px 26px', fontWeight: 900, fontSize: '0.95rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 6px 24px rgba(139, 92, 246, 0.45)',
            transition: 'transform 0.2s'
          }}
        >
          <Building size={22} />
          🖨️ TẠO BẢNG TÊN ĐỂ BÀN A4 NGAY
        </button>
      </div>

      {/* 2. Parent Meeting Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSubTab('desk_name_cards')}
          style={{
            borderRadius: '16px', padding: '12px 22px', fontWeight: 900, fontSize: '0.92rem',
            background: activeSubTab === 'desk_name_cards' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : '#ffffff',
            color: activeSubTab === 'desk_name_cards' ? '#ffffff' : '#5b21b6',
            border: activeSubTab === 'desk_name_cards' ? 'none' : '1.5px solid #c4b5fd',
            boxShadow: activeSubTab === 'desk_name_cards' ? '0 6px 20px rgba(139, 92, 246, 0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          🖨️ 1. Tạo Bảng Tên Để Bàn (A4 Gấp 4)
        </button>

        <button
          onClick={() => setActiveSubTab('silhouette_game')}
          style={{
            borderRadius: '16px', padding: '12px 22px', fontWeight: 900, fontSize: '0.92rem',
            background: activeSubTab === 'silhouette_game' ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : '#ffffff',
            color: activeSubTab === 'silhouette_game' ? '#ffffff' : '#0f766e',
            border: activeSubTab === 'silhouette_game' ? 'none' : '1.5px solid #99f6e4',
            boxShadow: activeSubTab === 'silhouette_game' ? '0 6px 20px rgba(13, 148, 136, 0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          🕵️ 2. Trò Chơi Khởi Động: "Đoán Bóng Tìm Con"
        </button>

        <button
          onClick={() => setActiveSubTab('honors_showcase')}
          style={{
            borderRadius: '16px', padding: '12px 22px', fontWeight: 900, fontSize: '0.92rem',
            background: activeSubTab === 'honors_showcase' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#ffffff',
            color: activeSubTab === 'honors_showcase' ? '#000000' : '#92400e',
            border: activeSubTab === 'honors_showcase' ? 'none' : '1.5px solid #fde047',
            boxShadow: activeSubTab === 'honors_showcase' ? '0 6px 20px rgba(245, 158, 11, 0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          🏆 3. Bảng Tuyên Dương Phụ Huynh & Học Sinh
        </button>
      </div>

      {/* 3. SUB-TAB CONTENT DISPLAY */}

      {/* FEATURE 1: DESK NAME CARD GENERATOR FEATURE BANNER */}
      {activeSubTab === 'desk_name_cards' && (
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'center' }}>
            <div>
              <span className="badge" style={{ background: '#8b5cf6', color: '#fff', marginBottom: '10px' }}>
                MẪU CHUẨN ẢNH 1 & ẢNH 2
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginBottom: '12px' }}>
                Tự Động In Bảng Tên Để Bàn Chuẩn Khổ A4 Gấp 4
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Hệ thống tự động phân chia trang giấy A4 thành 4 phần bằng nhau.
                Mặt trước in <b>TÊN HỌC SINH (Lật 180°)</b> để khi gấp dạng lều tam giác dựng trên bàn, dòng tên hiển thị đứng xuôi chiều hướng ra toàn lớp.
                Mặt đối diện in thông điệp tri ân <b>"Cảm ơn Quý phụ huynh đã đến tham dự buổi họp"</b>.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowDeskNameCardModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    color: '#ffffff', border: 'none', borderRadius: '14px',
                    padding: '12px 24px', fontWeight: 900, fontSize: '0.92rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.45)'
                  }}
                >
                  <Building size={20} /> Mở Trình Thiết Kế Bảng Tên Để Bàn (A4)
                </button>
              </div>
            </div>

            {/* Feature Illustration Box */}
            <div style={{
              background: '#090d16', borderRadius: '20px',
              border: '2px dashed rgba(139, 92, 246, 0.5)', padding: '24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏷️ A4 📐</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#c4b5fd', margin: '0 0 6px 0' }}>
                Khổ A4 Gấp 4 Tạo Bảng Tên Lều 3D
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                • 25% Đáy Sau • 25% Tên Học Sinh (180°) • 25% Lời Cảm Ơn Phụ Huynh • 25% Đáy Trước
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 2: SILHOUETTE ICEBREAKER GAME FOR PARENT MEETINGS */}
      {activeSubTab === 'silhouette_game' && (
        <div style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <StudentSilhouetteGame students={students} />
        </div>
      )}

      {/* FEATURE 3: PARENT MEETING HONORS SHOWCASE */}
      {activeSubTab === 'honors_showcase' && (
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={24} /> Bảng Vinh Danh & Tổng Kết Lớp Chủ Nhiệm Phục Vụ Họp Phụ Huynh
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginBottom: '24px' }}>
            Tổng hợp danh sách tuyên dương top học sinh xuất sắc, rèn luyện nề nếp và thông tin cần trao đổi với cha mẹ học sinh.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {students.slice(0, 10).map((st, idx) => (
              <div key={st.id || idx} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontWeight: 900, color: '#ffffff', fontSize: '1rem' }}>{st.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#5eead4', marginTop: '4px' }}>💯 Điểm nề nếp: {st.score || 100} điểm</div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>Phụ huynh: {st.fatherName || st.motherName || 'Đã cập nhật'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal: Desk Name Card Generator */}
      {showDeskNameCardModal && (
        <DeskNameCardGenerator 
          classData={classData}
          currentUser={currentUser}
          onClose={() => setShowDeskNameCardModal(false)}
        />
      )}

    </div>
  );
}
