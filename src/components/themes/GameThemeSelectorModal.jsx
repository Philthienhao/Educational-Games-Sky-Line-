import React, { useState } from 'react';
import { X, Check, Sparkles, Palette, Snowflake, Flame } from 'lucide-react';
import { SoundFX } from '../../utils/sound';

export const THEME_OPTIONS = [
  {
    id: 'default',
    name: 'Giao Diện Mặc Định',
    icon: '🎨',
    badge: 'Tiêu Chuẩn',
    badgeColor: '#0d9488',
    description: 'Giữ nguyên màu sắc và phong cách gốc hiện đại của từng trò chơi.',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)',
    borderActive: '#14b8a6',
    previewElements: ['🎮', '🏆', '⭐']
  },
  {
    id: 'noel',
    name: 'Chủ Đề Giáng Sinh & Noel',
    icon: '🎄',
    badge: 'Mùa Giáng Sinh',
    badgeColor: '#dc2626',
    description: 'Bông tuyết trắng rơi lơ lửng, cành thông, chuông vàng, mũ Noel và người tuyết vui tươi rộn rã.',
    previewGradient: 'linear-gradient(135deg, #7f1d1d 0%, #166534 50%, #991b1b 100%)',
    borderActive: '#ef4444',
    previewElements: ['❄️', '🎅', '🔔', '⛄', '🎄']
  },
  {
    id: 'tet',
    name: 'Chủ Đề Tết Cổ Truyền Việt Nam',
    icon: '🧧',
    badge: 'Tết Nguyên Đán',
    badgeColor: '#eab308',
    description: 'Cánh hoa mai vàng & đào hồng phơi phới, cặp đèn lồng đỏ may mắn, sắc đỏ son và vàng hoàng kim phú quý.',
    previewGradient: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 50%, #854d0e 100%)',
    borderActive: '#eab308',
    previewElements: ['🏮', '🌸', '🌼', '🧧', '🎋']
  }
];

export function GameThemeSelectorModal({
  currentTheme = 'default',
  onSelectTheme,
  onClose,
  gameTitle = ''
}) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [applyToAll, setApplyToAll] = useState(false);

  const handleApply = (themeId) => {
    setSelectedTheme(themeId);
    try { SoundFX.correct(); } catch (e) {}
    if (onSelectTheme) {
      onSelectTheme(themeId, applyToAll);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000002,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(13, 148, 136, 0.2)',
          width: '100%',
          maxWidth: '560px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(30, 41, 59, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)'
              }}
            >
              🎨
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                Chọn Giao Diện Lễ Hội Cho Game
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: 500 }}>
                {gameTitle ? `Áp dụng cho: ${gameTitle}` : 'Tùy biến không khí lớp học theo từng dịp'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: 3 Theme Cards */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {THEME_OPTIONS.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleApply(theme.id)}
                style={{
                  background: theme.previewGradient,
                  borderRadius: '18px',
                  border: isSelected ? `2.5px solid ${theme.borderActive}` : '1.5px solid rgba(255, 255, 255, 0.12)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isSelected ? `0 8px 24px ${theme.borderActive}40` : '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{theme.icon}</span>
                    <h4 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      {theme.name}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: theme.badgeColor,
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '10px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {theme.badge}
                    </span>

                    {isSelected && (
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0f172a',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}
                      >
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.88)', margin: '0 0 10px 0', lineHeight: 1.4, fontWeight: 500 }}>
                  {theme.description}
                </p>

                {/* Preview Elements Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700 }}>
                    Hiệu ứng minh họa:
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {theme.previewElements.map((el, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '0.9rem'
                        }}
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Scope Checkbox */}
          <div
            style={{
              marginTop: '6px',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setApplyToAll(!applyToAll)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0d9488', cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
              />
              <span style={{ fontSize: '0.88rem', color: '#f1f5f9', fontWeight: 700 }}>
                Áp dụng chủ đề này cho TẤT CẢ các trò chơi khác trên hệ thống
              </span>
            </div>
            <Sparkles size={16} color="#facc15" />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(30, 41, 59, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
            }}
          >
            Hoàn Tất
          </button>
        </div>
      </div>
    </div>
  );
}
