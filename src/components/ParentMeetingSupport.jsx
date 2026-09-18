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
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
          borderRadius: '20px',
          border: '1.5px solid rgba(236, 72, 153, 0.4)',
          padding: '28px 32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(236, 72, 153, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Background Glow Spheres */}
        <div 
          style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} 
        />
        <div 
          style={{
            position: 'absolute', bottom: '-80px', left: '20%',
            width: '280px', height: '280px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} 
        />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
                  color: '#ffffff'
                }}
              >
                <HeartHandshake size={28} />
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#f472b6', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  SKY-LINE EDUCATIONAL SUITE · HỆ THỐNG HỖ TRỢ GIÁO VIÊN
                </div>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', margin: '2px 0 0 0', textShadow: '0 0 20px rgba(236, 72, 153, 0.4)' }}>
                  Hỗ Trợ Họp Phụ Huynh
                </h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span 
                style={{
                  background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6',
                  border: '1px solid rgba(236, 72, 153, 0.4)', borderRadius: '12px',
                  padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Sparkles size={14} /> Niên khóa 2025 - 2026
              </span>
              
              <span 
                style={{
                  background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '12px',
                  padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Users size={14} /> {currentUser?.name || 'Giáo Viên Chủ Nhiệm'}
              </span>
            </div>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0, maxWidth: '850px', lineHeight: '1.6' }}>
            Khu vực chuẩn bị và điều hành cuộc họp Phụ huynh học sinh. Tích hợp trò chơi khởi động <b>"Đoán Bóng Tìm Con"</b> giúp cuộc họp khởi đầu vui tươi, hào hứng và thắt chặt tình cảm gia đình - nhà trường.
          </p>

          {/* Quick Setup Bar */}
          <div 
            style={{
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
              <Calendar size={18} color="#f472b6" />
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>Tên cuộc họp:</span>
              <input 
                type="text" 
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                style={{
                  flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: '10px', padding: '6px 12px', color: '#ffffff', fontWeight: 700, fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#f472b6" />
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>Ngày tổ chức:</span>
              <input 
                type="date" 
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: '10px', padding: '6px 12px', color: '#ffffff', fontWeight: 700, fontSize: '0.88rem'
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
