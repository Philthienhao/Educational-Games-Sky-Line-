import React from 'react';
import { Play, Upload, FileSpreadsheet, Eye, Trash2, Edit3, Sparkles, Download } from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excel';
import { SoundFX } from '../utils/sound';
import { exportGameToOfflineHtml } from '../utils/offlineExporter';

export function GameCard({ 
  game, 
  isSavedGame = false, 
  currentUser, 
  onPlay, 
  onPlayDirect,
  onCustomize, 
  onEditTemplate,
  onDelete, 
  onDeleteBaseGame,
  onUpdateLessonTitle 
}) {
  const isAdmin = currentUser?.role === 'admin';
  const handlePlay = onPlay || onPlayDirect;
  const handleCustomize = onCustomize || onEditTemplate;
  const handleDelete = onDelete || onDeleteBaseGame;

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
            {typeof game.playsCount === 'number' ? game.playsCount : 0} Lượt chơi
          </span>
        )}
      </div>

      {/* Body Content */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
            {game.description || 'Trò chơi tương tác giúp học sinh tiếp thu bài giảng hào hứng.'}
          </p>

          {/* Editable Lesson / Topic Title Field in Saved Games */}
          {isSavedGame && (
            <div style={{ marginBottom: '14px', background: 'rgba(13, 148, 136, 0.12)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#5eead4', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                📖 Tên Bài Học / Chủ Đề:
              </label>
              <input 
                type="text"
                value={game.lessonTitle || ''}
                onChange={(e) => onUpdateLessonTitle && onUpdateLessonTitle(game.id, e.target.value)}
                placeholder="Điền tên bài học (VD: Châu Âu - Địa lí 7)..."
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(94, 234, 212, 0.4)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
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
              try { SoundFX.click(); } catch(e) {}
              if (handlePlay) handlePlay(game);
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
                try { SoundFX.click(); } catch(e) {}
                if (handleCustomize) handleCustomize(game);
              }}
            >
              {isSavedGame ? <Edit3 size={16} /> : <Upload size={16} />}
              {isSavedGame ? 'Sửa Câu Hỏi' : '⚡ Soạn / Tải File (Excel, Word, PDF)'}
            </button>

            {/* Download Offline Game Package (.html) - ONLY FOR TEACHER'S SAVED GAMES IN "GAME CỦA TÔI" */}
            {isSavedGame && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  try { SoundFX.click(); } catch(e) {}
                  exportGameToOfflineHtml(game);
                }}
                title="📥 Tải file game về máy để chơi 100% Offline (Không cần mạng Internet)"
                style={{ padding: '0 12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: 800 }}
              >
                <Download size={16} /> Offline
              </button>
            )}

            {/* Excel Download Template Button (For catalog games) */}
            {!isSavedGame && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  try { SoundFX.click(); } catch(e) {}
                  downloadExcelTemplate(game.title);
                }}
                title="Tải tệp mẫu Excel về máy"
                style={{ padding: '0 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <FileSpreadsheet size={16} />
              </button>
            )}

            {/* Delete button */}
            {handleDelete && (
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => {
                  try { SoundFX.click(); } catch(e) {}
                  handleDelete(game);
                }}
                title="Xóa trò chơi khỏi hệ thống"
                style={{ padding: '0 12px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid #ef4444' }}
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
