import React from 'react';
import { Play, Upload, FileSpreadsheet, Trash2, Edit3, Download, ArrowRight, Lock, Share2 } from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excel';
import { SoundFX } from '../utils/sound';
import { exportGameToOfflineHtml } from '../utils/offlineExporter';
import { getGameThumbnail } from '../utils/gameThumbnails';
import { StorageService } from '../services/storage';

function GameCardComponent({ 
  game, 
  isSavedGame = false, 
  currentUser, 
  onPlay, 
  onPlayDirect,
  onCustomize, 
  onEditTemplate,
  onDelete, 
  onDeleteBaseGame,
  onUpdateLessonTitle,
  onAssignHomework
}) {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'philthienhao' || currentUser?.id === 'user_admin';
  const handlePlay = onPlay || onPlayDirect;
  const handleCustomize = onCustomize || onEditTemplate;
  const handleDelete = onDelete || onDeleteBaseGame;
  const thumbnailUrl = getGameThumbnail(game);

  const featureId = String(game?.engineType || game?.gameType || game?.id || 'game').toLowerCase().trim();
  const isTrialUsed = Boolean(
    currentUser &&
    StorageService.isGoogleUser(currentUser) &&
    currentUser.accessTier !== 'unlimited' &&
    !currentUser.isPaid &&
    (currentUser.usedFeatures?.[featureId] || 0) >= 1
  );

  const isStudentPicker = Boolean(
    game?.isStudentPicker || 
    game?.category === 'Gọi tên và chia nhóm' || 
    game?.category === 'Kho game gọi tên học sinh' || 
    ['duck-race', 'turtle-race', 'marble-race', 'claw-machine', 'student-group-divider', 'astronaut-explorer', 'magic-hat', 'magic-grimoire'].includes(game?.engineType) || 
    ['duck-race-quiz', 'turtle-race-quiz', 'marble-race-quiz', 'claw-machine-quiz', 'student-group-divider-quiz', 'astronaut-quiz', 'magic-hat-quiz', 'magic-grimoire-quiz'].includes(game?.baseGameId) ||
    ['duck-race-quiz', 'turtle-race-quiz', 'marble-race-quiz', 'claw-machine-quiz', 'student-group-divider-quiz', 'astronaut-quiz', 'magic-hat-quiz', 'magic-grimoire-quiz'].includes(game?.id) ||
    /đua vịt|đua rùa|đua bi|gắp thú|phi hành gia|chiếc mũ|hộp quà bí mật|cổ thư|chia nhóm/i.test(game?.title || '')
  );
  const studentList = game?.students || game?.studentList || [];
  const studentCount = Array.isArray(studentList) ? studentList.length : 0;

  return (
    <div 
      className="card-3d-glow"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '22px',
        overflow: 'hidden',
        position: 'relative',
        background: '#ffffff'
      }}
    >
      {/* 3D HD Header Thumbnail Showcase Box */}
      <div 
        style={{
          background: game.gradient || 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          margin: '12px 12px 0 12px',
          height: '160px',
          borderRadius: '18px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px -4px rgba(13, 148, 136, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Full-bleed HD Image Thumbnail */}
        {thumbnailUrl && (
          <img 
            src={thumbnailUrl} 
            alt={game.title || 'Game Thumbnail'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0
            }}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              // Fallback if image load fails
              e.target.style.display = 'none';
            }}
          />
        )}

        {/* Gradient Overlay Vignette for High Readability */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.05) 50%, rgba(15, 23, 42, 0.55) 100%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Category Badge Floating Top Left */}
        <span style={{ 
          position: 'absolute',
          top: '12px',
          left: '12px',
          fontSize: '0.68rem', 
          fontWeight: 800, 
          textTransform: 'uppercase', 
          color: '#ffffff',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '5px 12px',
          borderRadius: '14px',
          letterSpacing: '0.06em',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          zIndex: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
        }}>
          {game.category || 'Game Giáo Dục'}
        </span>

        {/* Saved / Play Count / Trial Lock Badge Floating Top Right */}
        {isTrialUsed ? (
          <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.72rem', color: '#ffffff', fontWeight: 900, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '5px 12px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.4)', zIndex: 2, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} /> Đã dùng thử
          </span>
        ) : isSavedGame ? (
          <span className="badge" style={{ position: 'absolute', top: '12px', right: '12px', background: '#0d9488', color: '#ffffff', fontWeight: 900, border: '1px solid rgba(255,255,255,0.4)', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
            ĐÃ LƯU
          </span>
        ) : (
          <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.72rem', color: '#ffffff', fontWeight: 800, background: 'rgba(15, 23, 42, 0.85)', padding: '5px 12px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.25)', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
            {typeof game.playsCount === 'number' ? game.playsCount : 0} Lượt chơi
          </span>
        )}

        {/* Floating Engine Icon Badge Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '12px',
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.20)',
          border: '1.5px solid rgba(255,255,255,0.9)',
          zIndex: 2
        }}>
          {game.icon || '🎮'}
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '16px 20px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: '6px' }}>
            {game.title}
          </h3>

          <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '14px', lineHeight: 1.5, fontWeight: 500 }}>
            {game.description || 'Trò chơi tương tác giúp học sinh tiếp thu bài giảng hào hứng.'}
          </p>

          {/* Editable Lesson / Topic Title Field in Saved Games */}
          {isSavedGame && (
            <div style={{ marginBottom: '14px', background: 'rgba(13, 148, 136, 0.08)', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid rgba(13, 148, 136, 0.3)' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
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
                  background: '#ffffff',
                  border: '1.5px solid #0d9488',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '16px', fontWeight: 600 }}>
            {isStudentPicker ? (
              <span>Số học sinh: <strong style={{ color: '#0d9488', fontWeight: 800 }}>{studentCount > 0 ? `${studentCount} em` : 'Danh sách mẫu'}</strong></span>
            ) : (
              <span>Số câu hỏi: <strong style={{ color: '#0d9488', fontWeight: 800 }}>{(game.questions || game.defaultQuestions || []).length} câu</strong></span>
            )}
            {isSavedGame && game.updatedAt && (
              <span>Cập nhật: <strong style={{ color: '#0f172a' }}>{game.updatedAt}</strong></span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Main Play Pill Button */}
          <button 
            className="btn btn-primary btn-lg"
            style={{ 
              width: '100%', 
              borderRadius: '16px', 
              fontWeight: 800, 
              fontSize: '0.95rem',
              padding: '12px 20px',
              background: isTrialUsed ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' : 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              boxShadow: isTrialUsed ? '0 4px 14px rgba(100, 116, 139, 0.3)' : '0 6px 18px rgba(13, 148, 136, 0.35)',
              border: isTrialUsed ? '1.5px solid rgba(255, 255, 255, 0.25)' : 'none'
            }}
            onClick={() => {
              try { SoundFX.click(); } catch(e) {}
              if (handlePlay) handlePlay(game);
            }}
          >
            {isTrialUsed ? <Lock size={18} color="#ffffff" /> : <Play size={18} fill="#fff" />}
            <span>{isTrialUsed ? 'Đã Dùng Thử (Cần Nâng Cấp)' : (isSavedGame ? 'Bắt Đầu Trình Chiếu' : 'Chơi Ngay')}</span>
            <ArrowRight size={16} />
          </button>

          {/* Assign Homework Button (Link & Bảng Điểm Tự Chơi Ở Nhà) */}
          {!isStudentPicker && onAssignHomework && (
            <button
              className="btn btn-secondary"
              style={{
                width: '100%',
                borderRadius: '14px',
                fontSize: '0.86rem',
                fontWeight: 800,
                padding: '9px 14px',
                background: 'rgba(13, 148, 136, 0.08)',
                color: '#0d9488',
                border: '1.5px solid rgba(13, 148, 136, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                try { SoundFX.click(); } catch(e) {}
                onAssignHomework(game);
              }}
              title="Giao bài tập về nhà qua game cho học sinh (Có link, mã QR & bảng điểm)"
            >
              <Share2 size={16} color="#0d9488" />
              <span>Giao Bài Về Nhà (Link & Bảng Điểm)</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            
            {/* Upload & Customize Button */}
            <button 
              className="btn btn-secondary"
              style={{ flex: 1, borderRadius: '12px', fontSize: '0.82rem', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700 }}
              onClick={() => {
                try { SoundFX.click(); } catch(e) {}
                if (handleCustomize) handleCustomize(game);
              }}
            >
              {isSavedGame ? <Edit3 size={16} color="#0d9488" /> : <Upload size={16} color="#0d9488" />}
              <span>{isSavedGame ? (isStudentPicker ? 'Sửa Danh Sách' : 'Sửa Câu Hỏi') : (isStudentPicker ? '⚡ Tải Danh Sách Học Sinh' : '⚡ Soạn / Tải File (Excel, Word)')}</span>
            </button>

            {/* Download Offline Game Package (.html) */}
            {isSavedGame && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  try { SoundFX.click(); } catch(e) {}
                  exportGameToOfflineHtml(game);
                }}
                title="📥 Tải file game về máy để chơi 100% Offline"
                style={{ padding: '0 12px', background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: '1.5px solid rgba(245, 158, 11, 0.3)', fontWeight: 800 }}
              >
                <Download size={16} /> Offline
              </button>
            )}

            {/* Excel Download Template Button */}
            {!isSavedGame && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  try { SoundFX.click(); } catch(e) {}
                  downloadExcelTemplate(game.title, game.engineType);
                }}
                title={isStudentPicker ? "Tải tệp mẫu danh sách học sinh (.xlsx) về máy" : "Tải tệp mẫu Excel câu hỏi về máy"}
                style={{ padding: '0 12px', background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', border: '1.5px solid rgba(13, 148, 136, 0.3)' }}
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
                style={{ padding: '0 12px', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: '1.5px solid rgba(239, 68, 68, 0.3)' }}
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

export const GameCard = React.memo(GameCardComponent);

