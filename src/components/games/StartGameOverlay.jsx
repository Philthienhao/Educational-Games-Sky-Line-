import React from 'react';
import { Play, Upload } from 'lucide-react';
import { SoundFX } from '../../utils/sound';

export function StartGameOverlay({ title, icon = '🎮', subtitle, description, onStart, onUpload }) {
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
      gap: '22px',
      zIndex: 1000
    }}>
      <div style={{ fontSize: '4.8rem', lineHeight: 1 }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
        {title ? `SẴN SÀNG CHƠI: ${title.toUpperCase()}` : 'SẴN SÀNG BẮT ĐẦU VÁN CHƠI'}
      </h2>
      {(subtitle || description) && (
        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', maxWidth: '580px', lineHeight: 1.65, margin: 0, fontWeight: 600 }}>
          {subtitle || description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
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

        {onUpload && (
          <label style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            padding: '16px 32px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s ease'
          }}>
            <Upload size={22} /> 📂 Tải File Excel Câu Hỏi
            <input 
              type="file" 
              accept=".xlsx,.xls,.doc,.docx,.txt" 
              onChange={onUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        )}
      </div>
    </div>
  );
}
