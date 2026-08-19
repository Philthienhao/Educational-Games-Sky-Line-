import React, { useState, useEffect } from 'react';
import { Gamepad2, Sparkles, Search, PlusCircle, BookmarkCheck, Shield, FileSpreadsheet, Users, HeartHandshake } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { GameCard } from './components/GameCard';
import { TeacherLibrary } from './components/TeacherLibrary';
import { AdminPanel } from './components/AdminPanel';
import { RoleSwitcher } from './components/RoleSwitcher';
import { QuestionEditorModal } from './components/QuestionEditorModal';
import { AdminCreateGameModal } from './components/AdminCreateGameModal';
import { ClassroomPlayModal } from './components/ClassroomPlayModal';
import { StorageService } from './services/storage';

export function App() {
  const [currentUser, setCurrentUser] = useState(StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'my-games' | 'admin'
  const [baseGames, setBaseGames] = useState([]);
  const [savedGames, setSavedGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Modals
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isAdminCreateGameOpen, setIsAdminCreateGameOpen] = useState(false);
  const [editingGameTemplate, setEditingGameTemplate] = useState(null); // For QuestionEditorModal
  const [playingGame, setPlayingGame] = useState(null); // For ClassroomPlayModal

  // Load Data
  const loadData = () => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    setBaseGames(StorageService.getBaseGames());
    setSavedGames(StorageService.getTeacherSavedGames(user?.id));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Switch User
  const handleSelectUser = (user) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    setSavedGames(StorageService.getTeacherSavedGames(user.id));
  };

  // Save customized game to teacher account
  const handleSaveToMyGames = (customGameData) => {
    const saved = StorageService.saveTeacherGame(customGameData);
    setSavedGames(StorageService.getTeacherSavedGames(currentUser?.id));
    setActiveTab('my-games');
  };

  // Save & Launch direct play
  const handleSaveAndPlay = (customGameData) => {
    const saved = StorageService.saveTeacherGame(customGameData);
    setSavedGames(StorageService.getTeacherSavedGames(currentUser?.id));
    setPlayingGame(saved);
  };

  // Admin add new game template
  const handleAdminAddGame = (newGameData) => {
    StorageService.addBaseGame(newGameData);
    setBaseGames(StorageService.getBaseGames());
  };

  // Delete saved game
  const handleDeleteSavedGame = (gameId) => {
    if (confirm('Bạn có chắc chắn muốn xóa game này khỏi Kho Game Của Tôi?')) {
      StorageService.deleteTeacherGame(gameId);
      setSavedGames(StorageService.getTeacherSavedGames(currentUser?.id));
    }
  };

  // Filter Catalog Games
  const categories = ['Tất cả', ...new Set(baseGames.map(g => g.category))];
  const filteredBaseGames = baseGames.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Tất cả' || g.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Motivational Quote Bar for Teachers */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(7, 30, 44, 0.95) 0%, rgba(13, 148, 136, 0.35) 50%, rgba(7, 30, 44, 0.95) 100%)',
        borderBottom: '1px solid rgba(0, 168, 150, 0.35)',
        padding: '10px 24px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontSize: '0.92rem',
        color: '#f0fdfa',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '1.2rem', color: '#fbbf24' }}>✨</span>
        <span style={{ fontStyle: 'italic', fontWeight: 500 }}>
          “Không phải tất cả chúng ta đều có thể làm những việc vĩ đại, nhưng ta có thể làm những việc nhỏ với tình yêu lớn.”
        </span>
        <strong style={{ color: '#5eead4', fontWeight: 800 }}>
          — Mẹ Teresa Calcutta
        </strong>
      </div>

      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onOpenAdminCreateGame={() => setIsAdminCreateGameOpen(true)}
        myGamesCount={savedGames.length}
      />

      {/* Main Tab Content */}
      <main style={{ flex: 1 }}>
        
        {/* Tab 1: Kho Game Giáo Dục (Catalog) */}
        {activeTab === 'catalog' && (
          <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Sky-Line Theme Hero Header Banner */}
            <div className="glass-panel" style={{ 
              padding: '36px 44px', 
              marginBottom: '32px', 
              position: 'relative', 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(7, 30, 44, 0.9) 0%, rgba(13, 148, 136, 0.25) 50%, rgba(2, 132, 199, 0.2) 100%)',
              border: '1.5px solid rgba(0, 168, 150, 0.4)',
              borderRadius: '28px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
            }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '32px', alignItems: 'center' }}>
                
                {/* Left Content */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ background: '#00a896', color: '#fff', fontWeight: 800, padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem' }}>
                      🏫 SKY-LINE • HỌC ĐỂ SỐNG HẠNH PHÚC
                    </span>
                    <span style={{ color: '#2dd4bf', fontSize: '0.85rem', fontWeight: 700 }}>
                      Strong within - Shape tomorrow
                    </span>
                  </div>

                  {/* Main Theme Headline */}
                  <h1 style={{ 
                    fontSize: '2.6rem', 
                    fontWeight: 900, 
                    lineHeight: 1.25, 
                    marginBottom: '14px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #ccfbf1 40%, #5eead4 70%, #fbbf24 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px'
                  }}>
                    VỮNG NỘI LỰC - VỮNG TƯƠNG LAI
                  </h1>

                  <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '22px' }}>
                    Hệ thống trò chơi học tập đổi mới sáng tạo dành cho giáo viên và học sinh. Tạo game đố vui kịch tính, tải file câu hỏi môn học từ Excel và trình chiếu lớp học sinh động!
                  </p>

                  {/* 5 Core Values Pills */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '26px' }}>
                    {[
                      { label: 'TRI THỨC', icon: '💡', bg: 'rgba(13, 148, 136, 0.25)', color: '#5eead4', border: '#0d9488' },
                      { label: 'NHÂN CÁCH', icon: '❤️', bg: 'rgba(244, 63, 94, 0.2)', color: '#fda4af', border: '#f43f5e' },
                      { label: 'SỨC KHỎE', icon: '🌱', bg: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '#10b981' },
                      { label: 'BẢN LĨNH', icon: '🛡️', bg: 'rgba(245, 158, 11, 0.2)', color: '#fde047', border: '#f59e0b' },
                      { label: 'KỸ NĂNG SỐ', icon: '💻', bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '#3b82f6' }
                    ].map((item) => (
                      <span key={item.label} style={{
                        background: item.bg,
                        border: `1px solid ${item.border}`,
                        color: item.color,
                        padding: '5px 12px',
                        borderRadius: '16px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {item.icon} {item.label}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => setActiveTab('my-games')}
                      style={{ padding: '12px 24px', fontSize: '1rem' }}
                    >
                      <BookmarkCheck size={20} />
                      Kho Game Của Tôi ({savedGames.length})
                    </button>

                    <button 
                      className="btn btn-secondary btn-lg"
                      onClick={() => setIsRoleSwitcherOpen(true)}
                      style={{ padding: '12px 24px', fontSize: '1rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                    >
                      <Users size={20} />
                      Đổi Tài Khoản ({currentUser?.name})
                    </button>
                  </div>
                </div>

                {/* Right Hero Full Original Photo Showcase (Image 1 completely uncropped & without overlay) */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '440px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '3px solid #00a896',
                    boxShadow: '0 15px 45px rgba(0, 168, 150, 0.45)',
                    background: '#071521'
                  }}>
                    <img 
                      src="/assets/mascot_skyline.png" 
                      alt="Bức ảnh đầy đủ nội dung gốc trường Sky-Line" 
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Filter & Search Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
              
              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ borderRadius: '20px' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm mẫu game giáo dục..."
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 44px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

            </div>

            {/* Games Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {filteredBaseGames.map(game => (
                <GameCard 
                  key={game.id}
                  game={game}
                  isSavedGame={false}
                  onPlay={(g) => setPlayingGame(g)}
                  onCustomize={(g) => setEditingGameTemplate(g)}
                />
              ))}
            </div>

          </div>
        )}

        {/* Tab 2: Kho Game Của Tôi */}
        {activeTab === 'my-games' && (
          <TeacherLibrary 
            savedGames={savedGames}
            currentUser={currentUser}
            onPlayGame={(g) => setPlayingGame(g)}
            onEditGame={(g) => setEditingGameTemplate({ ...g, isSaved: true })}
            onDeleteGame={handleDeleteSavedGame}
            onBrowseCatalog={() => setActiveTab('catalog')}
          />
        )}

        {/* Tab 3: Bảng Quản Trị Admin */}
        {activeTab === 'admin' && (
          <AdminPanel 
            onOpenCreateGame={() => setIsAdminCreateGameOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', borderTop: '1px solid rgba(0,168,150,0.15)', marginTop: '40px' }}>
        <p>© 2026 <strong>Giáo Viên Sky-Line</strong> — by <strong style={{ color: '#5eead4' }}>Thầy Hảo Địa Lí</strong></p>
      </footer>

      {/* Modals */}
      <RoleSwitcher 
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
      />

      <QuestionEditorModal 
        isOpen={!!editingGameTemplate}
        onClose={() => setEditingGameTemplate(null)}
        gameTemplate={editingGameTemplate}
        currentUser={currentUser}
        onSaveToMyGames={handleSaveToMyGames}
        onSaveAndPlay={handleSaveAndPlay}
      />

      <AdminCreateGameModal 
        isOpen={isAdminCreateGameOpen}
        onClose={() => setIsAdminCreateGameOpen(false)}
        onAddGame={handleAdminAddGame}
      />

      {playingGame && (
        <ClassroomPlayModal 
          game={playingGame}
          onClose={() => setPlayingGame(null)}
        />
      )}

    </div>
  );
}
