import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Users, 
  Sparkles,
  Calendar,
  Clock
} from 'lucide-react';
import { StudentSilhouetteGame } from './StudentSilhouetteGame';

export function ParentMeetingSupport({ currentUser }) {
  const [meetingTitle, setMeetingTitle] = useState('Họp Phụ Huynh Học Sinh Đầu Năm Học 2025 - 2026');
  const [meetingDate, setMeetingDate] = useState('2026-09-20');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Hero Header Card */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          border: '2px solid #cbd5e1',
          padding: '24px 30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          color: '#0f172a'
        }}
      >
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
                  color: '#ffffff'
                }}
              >
                <HeartHandshake size={28} />
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#db2777', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  SMART EDUCATIONAL SUITE · HỆ THỐNG HỖ TRỢ GIÁO VIÊN
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0' }}>
                  Hỗ Trợ Họp Phụ Huynh
                </h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span 
                style={{
                  background: '#fce7f3', color: '#db2777',
                  border: '1px solid #fbcfe8', borderRadius: '12px',
                  padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Sparkles size={14} /> Niên khóa 2025 - 2026
              </span>
              
              <span 
                style={{
                  background: '#e0f2fe', color: '#0284c7',
                  border: '1px solid #bae6fd', borderRadius: '12px',
                  padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Users size={14} /> {currentUser?.name || 'Giáo Viên Chủ Nhiệm'}
              </span>
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: '0.92rem', margin: 0, maxWidth: '850px', lineHeight: '1.6' }}>
            Khu vực chuẩn bị và điều hành cuộc họp Phụ huynh học sinh. Tích hợp trò chơi khởi động <b>"Đoán Bóng Tìm Con"</b> hiển thị 100% học sinh trên 1 màn hình với nền trắng nổi bật giúp cuộc họp vui tươi, hào hứng.
          </p>

          {/* Quick Setup Bar */}
          <div 
            style={{
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              marginTop: '4px', paddingTop: '14px', borderTop: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
              <Calendar size={18} color="#db2777" />
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Tên cuộc họp:</span>
              <input 
                type="text" 
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                style={{
                  flex: 1, background: '#f8fafc', border: '1.5px solid #cbd5e1',
                  borderRadius: '10px', padding: '6px 12px', color: '#0f172a', fontWeight: 700, fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#db2777" />
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Ngày tổ chức:</span>
              <input 
                type="date" 
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                style={{
                  background: '#f8fafc', border: '1.5px solid #cbd5e1',
                  borderRadius: '10px', padding: '6px 12px', color: '#0f172a', fontWeight: 700, fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* RENDER THE STUDENT SILHOUETTE ICEBREAKER GAME (TRÒ CHƠI ĐOÁN BÓNG TÌM CON) */}
      <StudentSilhouetteGame currentUser={currentUser} />

    </div>
  );
}
