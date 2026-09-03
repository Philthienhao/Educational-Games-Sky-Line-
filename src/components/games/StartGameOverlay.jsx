import React from 'react';
import { Play } from 'lucide-react';
import { SoundFX } from '../../utils/sound';

export function StartGameOverlay({ title, icon = '🎮', description, onStart }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '750px',
      margin: '20px auto',
      padding: '44px 36px',
      borderRadius: '28px',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)',
      border: '2px solid rgba(99, 102, 241, 0.5)',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '22px'
    }}>
      <div style={{ fontSize: '4.8rem', lineHeight: 1 }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
        {title ? `SẴN SÀNG CHƠI: ${title.toUpperCase()}` : 'SẴN SÀNG BẮT ĐẦU VÁN CHƠI'}
      </h2>
      <p style={{ color: '#cbd5e1', fontSize: '1.05rem', maxWidth: '580px', lineHeight: 1.65, margin: 0, fontWeight: 600 }}>
        {description || 'Thầy cô thiết lập danh sách học sinh / đội chơi bên trên. Khi lớp học đã sẵn sàng, hãy bấm nút dưới đây để chính thức tính thời gian!'}
      </p>

      <button 
        onClick={() => {
          if (onStart) onStart();
          try { SoundFX.fanfare(); } catch(e) {}
        }}
        style={{
          fontSize: '1.3rem',
          fontWeight: 900,
          padding: '18px 48px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'transform 0.2s ease, boxShadow 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Play size={26} fill="#fff" /> 🚀 BẮT ĐẦU CHƠI
      </button>
    </div>
  );
}
