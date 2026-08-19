import React, { useState } from 'react';
import { BookmarkCheck, Search, PlusCircle, Gamepad2, Sparkles } from 'lucide-react';
import { GameCard } from './GameCard';

export function TeacherLibrary({ savedGames, currentUser, onPlayGame, onEditGame, onDeleteGame, onBrowseCatalog }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGames = savedGames.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.subject && g.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Banner Intro */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="badge badge-teacher" style={{ marginBottom: '8px' }}>
              KHO GAME CÁ NHÂN
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              Kho Game Của Giáo Viên: <span style={{ color: '#8b5cf6' }}>{currentUser?.name}</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', maxWidth: '600px' }}>
              Tất cả các game bạn đã tạo và nhập câu hỏi môn học của riêng bạn được lưu trữ vĩnh viễn tại đây. Bạn có thể mở trình chiếu bài dạy bất kỳ lúc nào mà không cần tải lại câu hỏi!
            </p>
          </div>

          <button 
            className="btn btn-primary btn-lg"
            onClick={onBrowseCatalog}
          >
            <PlusCircle size={20} />
            Tạo Game Mới Từ Kho Mẫu
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm game cá nhân theo tên hoặc môn học..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 46px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#fff',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Hiển thị: <strong style={{ color: '#fff' }}>{filteredGames.length} game cá nhân</strong>
        </div>
      </div>

      {/* Saved Games Grid */}
      {filteredGames.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredGames.map(game => (
            <GameCard 
              key={game.id}
              game={game}
              isSavedGame={true}
              onPlay={onPlayGame}
              onCustomize={onEditGame}
              onDelete={onDeleteGame}
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
