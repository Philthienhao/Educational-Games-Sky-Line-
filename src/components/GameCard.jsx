import React from 'react';
import { Play, Upload, FileSpreadsheet, Eye, Trash2, Edit3, Sparkles } from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excel';
import { SoundFX } from '../utils/sound';

export function GameCard({ game, isSavedGame = false, onPlay, onCustomize, onDelete }) {
  return (
    <div 
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Header Banner Gradient */}
      <div 
        style={{
          background: game.gradient || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          padding: '24px 20px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            fontSize: '2.4rem',
            background: 'rgba(255, 255, 255, 0.25)',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(8px)'
          }}>
            {game.icon || '🎮'}
          </div>
          <div>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              color: 'rgba(255, 255, 255, 0.85)',
              letterSpacing: '0.05em' 
            }}>
              {game.category || 'Game Giáo Dục'}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginTop: '2px' }}>
              {game.title}
            </h3>
          </div>
        </div>

        {isSavedGame ? (
          <span className="badge badge-custom" style={{ background: '#ffffff', color: '#059669', fontWeight: 800 }}>
            ĐÃ LƯU
          </span>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, background: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '12px' }}>
            {game.playsCount || 100}+ Lượt chơi
          </span>
        )}
      </div>

      {/* Body Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            {game.description || 'Trò chơi tương tác giúp học sinh tiếp thu bài giảng hào hứng.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            <span>Số câu hỏi: <strong style={{ color: 'var(--text-bright)' }}>{(game.questions || game.defaultQuestions || []).length} câu</strong></span>
            {isSavedGame && game.updatedAt && (
              <span>Cập nhật: <strong style={{ color: 'var(--text-bright)' }}>{game.updatedAt}</strong></span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Main Play Button */}
          <button 
            className="btn btn-primary btn-lg"
            style={{ width: '100%', borderRadius: '14px', fontWeight: 700 }}
            onClick={() => {
              SoundFX.click();
              onPlay(game);
            }}
          >
            <Play size={20} fill="#fff" />
            {isSavedGame ? 'Bắt Đầu Trình Chiếu' : 'Chơi Thử Ngay'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            
            {/* Upload & Customize Button */}
            <button 
              className="btn btn-secondary"
              style={{ flex: 1, borderRadius: '12px', fontSize: '0.85rem' }}
              onClick={() => {
                SoundFX.click();
                onCustomize(game);
              }}
            >
              {isSavedGame ? <Edit3 size={16} /> : <Upload size={16} />}
              {isSavedGame ? 'Sửa Câu Hỏi' : 'Soạn / Nhập Excel'}
            </button>

            {/* Excel Download Template Button (For catalog games) */}
            {!isSavedGame && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  SoundFX.click();
                  downloadExcelTemplate(game.title);
                }}
                title="Tải tệp mẫu Excel về máy"
                style={{ padding: '0 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <FileSpreadsheet size={16} />
              </button>
            )}

            {/* Delete button for saved games */}
            {isSavedGame && onDelete && (
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => {
                  SoundFX.click();
                  onDelete(game.id);
                }}
                title="Xóa game khỏi kho cá nhân"
                style={{ padding: '0 12px' }}
              >
                <Trash2 size={16} />
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
