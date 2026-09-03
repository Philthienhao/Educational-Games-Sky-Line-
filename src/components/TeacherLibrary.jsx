import React, { useState, useMemo } from 'react';
import { BookmarkCheck, Search, PlusCircle, Gamepad2, Sparkles, RefreshCw, Download, Upload } from 'lucide-react';
import { GameCard } from './GameCard';
import { StorageService } from '../services/storage';

export function TeacherLibrary({ savedGames: propSavedGames, currentUser, onPlayGame, onEditGame, onDeleteGame, onBrowseCatalog, onUpdateLessonTitle, onRefreshGames }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Fallback to direct StorageService read to ensure My Games is NEVER empty if data exists in localStorage
  const savedGames = useMemo(() => {
    if (Array.isArray(propSavedGames) && propSavedGames.length > 0) {
      return propSavedGames;
    }
    return StorageService.getTeacherSavedGames(currentUser?.id);
  }, [propSavedGames, currentUser]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const synced = await StorageService.syncWithIndexedDB(currentUser?.id);
      if (onRefreshGames) onRefreshGames(synced);
    } catch (e) {
      console.warn("Sync error:", e);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const handleExportBackup = () => {
    try {
      StorageService.exportFullBackup();
    } catch (err) {
      alert("❌ Lỗi xuất file sao lưu: " + err.message);
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const result = StorageService.importFullBackup(evt.target.result);
        if (result.success) {
          alert("🎉 " + result.message);
          const synced = await StorageService.syncWithIndexedDB(currentUser?.id);
          if (onRefreshGames) onRefreshGames(synced);
        } else {
          alert("❌ " + result.message);
        }
      } catch (err) {
        alert("❌ Lỗi đọc tệp sao lưu: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredGames = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().normalize('NFC').trim();
    if (!term) return savedGames;

    return (savedGames || []).filter(g => {
      if (!g) return false;
      const t = (g.title || '').toLowerCase().normalize('NFC');
      const l = (g.lessonTitle || '').toLowerCase().normalize('NFC');
      const s = (g.subject || '').toLowerCase().normalize('NFC');
      const d = (g.description || '').toLowerCase().normalize('NFC');
      return t.includes(term) || l.includes(term) || s.includes(term) || d.includes(term);
    });
  }, [savedGames, searchTerm]);

  return (
    <div style={{ width: '100%' }}>

      {/* Banner Intro */}
      <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="badge badge-teacher" style={{ marginBottom: '8px' }}>
              KHO GAME CÁ NHÂN
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              Kho Game Của Giáo Viên: <span style={{ color: '#8b5cf6' }}>{currentUser?.name}</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', maxWidth: '600px' }}>
              Tất cả các game bạn đã tạo và nhập câu hỏi môn học của riêng bạn được lưu trữ vĩnh viễn tại đây. Bạn có thể tự do đặt tên bài học/chủ đề để tìm kiếm dễ dàng và trình chiếu bất cứ lúc nào!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary"
              onClick={handleExportBackup}
              style={{ background: '#0284c7', color: '#fff', border: 'none', fontWeight: 800 }}
              title="Tải tệp sao lưu (.json) về máy tính để bảo vệ hoặc chuyển sang tên miền mới"
            >
              <Download size={18} />
              📥 Xuất File Sao Lưu (.json)
            </button>

            <label 
              className="btn btn-secondary"
              style={{ background: '#10b981', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Nhập tệp sao lưu (.json) từ máy tính để khôi phục game khi sang tên miền mới"
            >
              <Upload size={18} />
              📤 Nhập File Sao Lưu (.json)
              <input 
                type="file" 
                accept=".json"
                onChange={handleImportBackup}
                style={{ display: 'none' }}
              />
            </label>

            <button 
              className="btn btn-secondary"
              onClick={handleManualSync}
              disabled={isSyncing}
              title="Khôi phục và đồng bộ dữ liệu game từ bộ nhớ hệ thống"
            >
              <RefreshCw size={18} className={isSyncing ? 'spin' : ''} />
              {isSyncing ? 'Đang đồng bộ...' : '🔄 Đồng Bộ Game'}
            </button>

            <button 
              className="btn btn-primary"
              onClick={onBrowseCatalog}
            >
              <PlusCircle size={20} />
              Tạo Game Mới Từ Kho Mẫu
            </button>
          </div>
        </div>
      </div>

      {/* Quick Domain Data Transfer Note */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1.5px solid rgba(13, 148, 136, 0.35)',
        borderRadius: '16px',
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.6rem' }}>📦</span>
          <div>
            <div style={{ fontWeight: 900, color: '#2dd4bf', fontSize: '0.95rem' }}>
              CHUYỂN TOÀN BỘ GAME SANG TÊN MIỀN MỚI (EDUVTH.VERCEL.APP):
            </div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px', lineHeight: 1.5 }}>
              • <strong>Bước 1:</strong> Mở tên miền cũ và bấm nút xanh dương <strong>"📥 Xuất File Sao Lưu (.json)"</strong> ở góc phải trên. <br />
              • <strong>Bước 2:</strong> Mở tên miền mới <strong>eduvth.vercel.app</strong> và bấm nút xanh lá <strong>"📤 Nhập File Sao Lưu (.json)"</strong> để nạp toàn bộ game sang!
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '440px' }}>
          <Search size={18} color="#0d9488" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
          <input 
            type="text"
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên game, bài học (VD: Châu Âu - Địa 7) hoặc môn học..."
            style={{
              paddingLeft: '46px',
              height: '46px',
              fontSize: '0.9rem',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: '800'
            }}
          />
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Hiển thị: <strong style={{ color: '#fff' }}>{filteredGames.length} game cá nhân</strong>
        </div>
      </div>

      {/* Saved Games Grid - Arranged Horizontally Left to Right */}
      {filteredGames.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
          {filteredGames.map(game => (
            <GameCard 
              key={game.id}
              game={game}
              isSavedGame={true}
              onPlay={onPlayGame}
              onCustomize={onEditGame}
              onDelete={onDeleteGame}
              onUpdateLessonTitle={onUpdateLessonTitle}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📚</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            Chưa Có Game Nào Được Lưu Trong Tài Khoản
          </h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', marginBottom: '24px', maxWidth: '480px', margin: '6px auto 24px' }}>
            Hãy chọn một game từ Kho Game Giáo Dục chung, nhập câu hỏi môn học của bạn và bấm "Lưu Vào Kho Game Của Tôi".
          </p>
          <button 
            className="btn btn-primary"
            onClick={onBrowseCatalog}
          >
            <Gamepad2 size={18} />
            Khám Phá Kho Game Mẫu Ngay
          </button>
        </div>
      )}

    </div>
  );
}
